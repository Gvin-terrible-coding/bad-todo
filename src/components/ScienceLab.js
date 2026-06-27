import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { db, doc, appId, runTransaction, serverTimestamp } from '../utils/firestore';
import { labEquipmentDefinitions } from '../constants/constants';

const ScienceLab = ({ stats, userId, updateStatsInFirestore, showMessageBox, actionLock, processAchievement }) => {
  const { lab_state } = stats;
  const [localSciencePoints, setLocalSciencePoints] = useState(lab_state?.sciencePoints || 0);
  const sciencePerSecond = useRef(0);
  const hasRunOfflineCalc = useRef(false);
  const PRESTIGE_THRESHOLD = 1e12; // 1 Trillion
  const localSciencePointsRef = useRef(localSciencePoints);
  const labStateRef = useRef(lab_state);

  useEffect(() => {
    localSciencePointsRef.current = localSciencePoints;
    labStateRef.current = lab_state;
  }, [localSciencePoints, lab_state]);

  const formatNumber = (num) => {
    if (num < 1000) return num.toFixed(1);
    if (num < 1e6) return `${(num / 1e3).toFixed(2)}K`;
    if (num < 1e9) return `${(num / 1e6).toFixed(2)}M`;
    if (num < 1e12) return `${(num / 1e9).toFixed(2)}B`;
    return `${(num / 1e12).toFixed(2)}T`;
  };

  const { totalSPS, totalClickPower, prestigeBonus } = useMemo(() => {
    if (!lab_state) return { totalSPS: 0, totalClickPower: 0, prestigeBonus: 1 };
    let sps = 0;
    let clickPower = 0;
    const prestigeLevel = lab_state.prestigeLevel || 0;
    const prestigeBonusMultiplier = 1 + prestigeLevel * 0.10;
    if (!lab_state.labEquipment) {
      return { totalSPS: 0, totalClickPower: 0, prestigeBonus: 1 };
    }
    for (const key in lab_state.labEquipment) {
      const definition = labEquipmentDefinitions[key];
      const count = lab_state.labEquipment[key] || 0;
      if (count > 0) {
        let itemSPS = definition.baseSPS;
        let itemClickPower = definition.clickPower;
        if (lab_state.labXpUpgrades && lab_state.labXpUpgrades[key]) {
          itemSPS *= definition.xpUpgrade.multiplier;
          itemClickPower *= definition.xpUpgrade.multiplier;
        }
        sps += itemSPS * count;
        clickPower += itemClickPower * count;
      }
    }
    const finalSPS = sps * prestigeBonusMultiplier;
    const finalClickPower = clickPower * prestigeBonusMultiplier;
    sciencePerSecond.current = finalSPS;
    return { totalSPS: finalSPS, totalClickPower: finalClickPower, prestigeBonus: prestigeBonusMultiplier };
  }, [lab_state]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setLocalSciencePoints(prev => prev + sciencePerSecond.current);
    }, 1000);
    return () => clearInterval(gameLoop);
  }, []);

  const handleSaveProgress = useCallback(() => actionLock(async () => {
    const currentPoints = localSciencePointsRef.current;
    await updateStatsInFirestore({
      'lab_state.sciencePoints': currentPoints,
      'lab_state.lastLogin': serverTimestamp()
    });
    showMessageBox('Lab progress saved!', 'info');
  }), [actionLock, updateStatsInFirestore, showMessageBox]);

  const handleCalculateOfflineEarnings = useCallback(() => {
    if (hasRunOfflineCalc.current) {
      showMessageBox("Offline earnings already calculated for this session.", "info");
      return;
    }
    const lastLoginTime = labStateRef.current?.lastLogin?.toDate();
    if (!lastLoginTime) {
      showMessageBox("No previous session found to calculate earnings from.", "info");
      hasRunOfflineCalc.current = true;
      return;
    }
    const currentTime = new Date();
    const timeDifferenceSeconds = Math.round((currentTime - lastLoginTime) / 1000);

    if (timeDifferenceSeconds > 60) {
      const pointsEarned = timeDifferenceSeconds * sciencePerSecond.current;
      if (pointsEarned > 0) {
        const newTotalPoints = localSciencePointsRef.current + pointsEarned;
        setLocalSciencePoints(newTotalPoints);
        updateStatsInFirestore({
          'lab_state.sciencePoints': newTotalPoints,
          'lab_state.lastLogin': serverTimestamp()
        }).then(() => {
          processAchievement('sciencePoints', newTotalPoints);
        });
        showMessageBox(`You generated ${formatNumber(pointsEarned)} Science Points while you were away!`, 'info', 5000);
      } else {
        showMessageBox("No significant offline earnings to collect.", "info");
      }
    } else {
      showMessageBox("You haven't been away long enough to generate significant offline earnings.", "info");
    }
    hasRunOfflineCalc.current = true;
  }, [updateStatsInFirestore, showMessageBox, processAchievement]);

  if (!lab_state) {
    return <div className="text-center p-10 text-xl text-slate-400">Loading Science Lab...</div>;
  }

  const handleManualClick = () => {
    setLocalSciencePoints(prev => prev + totalClickPower);
  };

  const handleBuyEquipment = (key) => {
    const definition = labEquipmentDefinitions[key];
    const currentCount = lab_state.labEquipment?.[key] || 0;
    const cost = definition.baseCost * Math.pow(1.15, currentCount);

    if (localSciencePoints >= cost) {
      const newSciencePoints = localSciencePoints - cost;
      setLocalSciencePoints(newSciencePoints);
      const newEquipmentStats = { ...(lab_state.labEquipment || {}), [key]: currentCount + 1 };
      updateStatsInFirestore({ lab_state: { ...lab_state, sciencePoints: newSciencePoints, labEquipment: newEquipmentStats } });
    }
  };

  const handleBuyXpUpgrade = (key) => {
    const definition = labEquipmentDefinitions[key];
    if (stats.totalXP >= definition.xpUpgrade.cost && !(lab_state.labXpUpgrades && lab_state.labXpUpgrades[key])) {
      const newXpUpgrades = { ...(lab_state.labXpUpgrades || {}), [key]: true };
      updateStatsInFirestore({
        totalXP: stats.totalXP - definition.xpUpgrade.cost,
        lab_state: { ...lab_state, labXpUpgrades: newXpUpgrades }
      });
      showMessageBox(`${definition.name} production doubled!`, 'info');
    }
  };

  const handlePrestige = () => actionLock(async () => {
    if (localSciencePoints < PRESTIGE_THRESHOLD) { showMessageBox("Not enough Science Points.", "error"); return; }
    if (!db || !userId) return;

    const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, userId);

    try {
      await runTransaction(db, async (transaction) => {
        const statsDoc = await transaction.get(statsDocRef);
        if (!statsDoc.exists()) throw new Error("User data missing.");

        const serverStats = statsDoc.data();
        const newPrestigeLevel = (serverStats.lab_state.prestigeLevel || 0) + 1;
        const newLabState = {
          sciencePoints: 0,
          labEquipment: { beaker: 0, microscope: 0, bunsen_burner: 0, computer: 0, particle_accelerator: 0, quantum_computer: 0, manual_clicker: 1 },
          labXpUpgrades: {},
          prestigeLevel: newPrestigeLevel,
          lastLogin: serverTimestamp(),
        };
        
        transaction.update(statsDocRef, {
          lab_state: newLabState,
          lastActionTimestamp: serverTimestamp(),
          cooldowns: { ...(serverStats.cooldowns || {}), prestigeLab: serverTimestamp() }
        });
      });
      
      setLocalSciencePoints(0);
      showMessageBox(`Prestige successful! Level ${(lab_state.prestigeLevel || 0) + 1}.`, "info", 6000);
    } catch (error) {
      const errorMsg = error.message.includes('permission-denied') ? "You're acting too quickly!" : "Server error during prestige.";
      showMessageBox(errorMsg, "error");
    }
  });

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white">Science Lab</h2>
        <p className="text-slate-400">Generate Science Points to unlock powerful upgrades and exclusive cosmetics.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-slate-800/50 p-6 rounded-2xl shadow-xl text-center">
             <h3 className="text-slate-400 text-lg">Science Points</h3>
             <p className="text-5xl font-bold text-cyan-400 my-2">{formatNumber(localSciencePoints)}</p>
             <p className="text-green-400 font-semibold">{formatNumber(totalSPS)} per second</p>
             {(lab_state.prestigeLevel || 0) > 0 && (
                <p className="text-purple-400 font-semibold text-sm mt-1">Prestige Bonus: +{((prestigeBonus - 1) * 100).toFixed(0)}%</p>
             )}
          </div>

          <div className="bg-slate-800/50 p-4 rounded-2xl shadow-xl flex flex-col gap-3">
            <button onClick={handleSaveProgress} className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
              Save Progress
            </button>
            <button onClick={handleCalculateOfflineEarnings} disabled={hasRunOfflineCalc.current} className="w-full bg-slate-600 text-white font-bold py-3 rounded-lg hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors">
              {hasRunOfflineCalc.current ? 'Offline Earnings Calculated' : 'Calculate Offline Earnings'}
            </button>
          </div>
          
          <div 
             onClick={handleManualClick}
             className="bg-slate-800/50 p-6 rounded-2xl shadow-xl text-center flex-grow flex flex-col justify-center items-center cursor-pointer hover:bg-slate-800/80 transition-colors"
          >
             <div className="text-8xl animate-pulse">🧪</div>
             <p className="mt-4 text-xl font-bold text-white">Click to Generate</p>
             <p className="text-cyan-300">+{formatNumber(totalClickPower)} points per click</p>
          </div>
          {localSciencePoints >= PRESTIGE_THRESHOLD && (
            <div className="bg-purple-900/50 border-2 border-purple-600 p-6 rounded-2xl shadow-xl text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Prestige Available!</h3>
              <p className="text-purple-300 mb-4">Reset your Science Lab progress to gain a permanent 10% boost to all future generation.</p>
              <button onClick={handlePrestige} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors">
                Prestige Now
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-slate-800/50 p-6 rounded-2xl shadow-xl">
               <h3 className="text-xl font-semibold text-white mb-4">Lab Equipment</h3>
               <div className="space-y-3">
                 {lab_state.labEquipment && Object.entries(labEquipmentDefinitions).map(([key, item]) => {
                    const currentCount = lab_state.labEquipment[key] || 0;
                    const cost = item.baseCost * Math.pow(1.15, currentCount);
                    return (
                        <div key={key} className="bg-slate-800/70 p-3 rounded-lg flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <h4 className="font-bold text-white">{item.name} <span className="text-sm text-slate-400">(Owned: {currentCount})</span></h4>
                                <p className="text-xs text-cyan-400">
                                    {item.baseSPS > 0 && `+${formatNumber(item.baseSPS * ((lab_state.labXpUpgrades && lab_state.labXpUpgrades[key]) ? 2 : 1) * prestigeBonus)} SPS each`}
                                    {item.clickPower > 0 && `+${formatNumber(item.clickPower * ((lab_state.labXpUpgrades && lab_state.labXpUpgrades[key]) ? 2 : 1) * prestigeBonus)} Click Power each`}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {!(lab_state.labXpUpgrades && lab_state.labXpUpgrades[key]) && (
                                   <button onClick={() => handleBuyXpUpgrade(key)} disabled={stats.totalXP < item.xpUpgrade.cost} className="text-xs bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed">
                                       2x with {item.xpUpgrade.cost} XP
                                   </button>
                                )}
                                <button onClick={() => handleBuyEquipment(key)} disabled={localSciencePoints < cost} className="text-sm bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed w-32">
                                    Buy: {formatNumber(cost)}
                                </button>
                            </div>
                        </div>
                    );
                 })}
               </div>
            </div>
            {/* The Science Point Shop remains unchanged */}
        </div>
      </div>
    </div>
  );
};

export default ScienceLab;
