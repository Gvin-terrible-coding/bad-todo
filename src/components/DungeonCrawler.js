import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { db, collection, query, where, doc, updateDoc, getDoc, runTransaction, arrayUnion } from '../utils/firestore';
import { petDefinitions, tilesetDefinitions, allRollableItems, cosmeticItems, EGG_REQUIREMENT } from '../constants/constants';
import { getSanctumTileStyle, tilesetData, tileRegistry } from './Sanctum';

import { increment } from 'firebase/firestore';
import { wingmanDefinitions, wingmanUpgrades } from '../constants/constants';

const SlotMachineAnimationModal = ({ isOpen, onClose, onAnimationComplete }) => {
  const [reelItems, setReelItems] = useState([]);
  const [animationState, setAnimationState] = useState('idle'); // idle, spinning, finished
  const [finalPrize, setFinalPrize] = useState(null);
  const reelRef = useRef(null);

  const ITEM_WIDTH = 100;
  const ITEM_MARGIN = 4;
  const TOTAL_ITEM_WIDTH = ITEM_WIDTH + ITEM_MARGIN * 2;
  const REEL_LENGTH = 100;
  const PRIZE_INDEX = 90;

  useEffect(() => {
    if (isOpen) {
      const spinCost = 50;
      const roll = Math.random();
      let prize;
      if (roll < 0.65) {
        const lossPercentage = 0.3 + Math.random() * 0.5;
        const amount = -Math.floor(spinCost * lossPercentage);
        prize = { id: 'xp_loss_reward', name: `${amount} XP`, type: 'xp_loss', display: `${amount} XP`, rarity: 'common', amount };
      } else if (roll < 0.90) {
        const amount = Math.floor(Math.random() * 100) + 51;
        prize = { id: 'xp_gain_reward', name: `+${amount} XP`, type: 'xp_gain', display: `+${amount} XP`, rarity: amount > 100 ? 'epic' : 'rare', amount };
      } else {
        prize = { ...allRollableItems[Math.floor(Math.random() * allRollableItems.length)] };
      }
      setFinalPrize(prize);

      const reel = Array.from({ length: REEL_LENGTH }, () => slotMachineFillerItems[Math.floor(Math.random() * slotMachineFillerItems.length)]);
      reel[PRIZE_INDEX] = prize;
      setReelItems(reel);

      setTimeout(() => setAnimationState('spinning'), 50);

    } else {
      setAnimationState('idle');
      setReelItems([]);
      setFinalPrize(null);
      if (reelRef.current) {
        reelRef.current.style.transition = 'none';
        reelRef.current.style.transform = 'translateX(0px)';
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (animationState !== 'spinning' || !reelRef.current) return;

    const reelElement = reelRef.current;
    const containerWidth = reelElement.parentElement.offsetWidth;
    const centerOffset = (containerWidth / 2) - (TOTAL_ITEM_WIDTH / 2);
    const finalPosition = -(PRIZE_INDEX * TOTAL_ITEM_WIDTH) + centerOffset;

    // Set the transition and transform in one go.
    reelElement.style.transition = `transform 7s cubic-bezier(0.1, 0.7, 0.3, 1)`;
    reelElement.style.transform = `translateX(${finalPosition}px)`;

    const finishTimer = setTimeout(() => {
      setAnimationState('finished');
    }, 7000);

    return () => {
      clearTimeout(finishTimer);
    };
  }, [animationState]);

  if (!isOpen) return null;

  const showResult = animationState === 'finished';
  const isCosmeticWin = finalPrize && finalPrize.type !== 'xp_gain' && finalPrize.type !== 'xp_loss';

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-4xl overflow-hidden relative">
        <h3 className="text-3xl font-bold text-white text-center mb-6">
          {showResult ? "Result!" : "Spinning..."}
        </h3>

        {showResult && isCosmeticWin && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="absolute rounded-full opacity-0 animate-confetti" style={{ width: `${Math.random()*8+4}px`, height: `${Math.random()*8+4}px`, left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animationDelay: `${Math.random()*2}s`, backgroundColor: `hsl(${Math.random()*360}, 80%, 60%)` }}></div>
            ))}
          </div>
        )}

        <div className="relative w-full h-32 flex items-center justify-center">
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-[12px] border-t-red-500 z-20"></div>
            <div className="w-full h-full overflow-hidden">
              <div ref={reelRef} className="flex h-full items-center" style={{ willChange: 'transform' }}>
                {reelItems.map((item, index) => {
                  const rarityColors = { common: 'border-gray-500', rare: 'border-blue-500', epic: 'border-purple-500', legendary: 'border-orange-500', mythic: 'border-red-600' };
                  const borderColor = item.rarity ? rarityColors[item.rarity] : 'border-transparent';
                  const isXpItem = item.type === 'xp_gain' || item.type === 'xp_loss';
                  
                  return (
                    <div key={`${item.id}-${index}`} className={`flex-shrink-0 w-[100px] h-24 flex flex-col items-center justify-center m-1 rounded-lg shadow-md border-b-4 ${borderColor} ${
                        item.type === 'xp_gain' ? 'bg-green-800 text-white text-xl font-bold' :
                        item.type === 'xp_loss' ? 'bg-red-800 text-white text-xl font-bold' :
                        item.type === 'avatar' ? 'bg-slate-700 text-white text-5xl' : 
                        item.type === 'banner' ? item.style : 
                        'bg-gray-700 text-gray-300'
                      }`}>
                      {isXpItem ? <span className="flex items-center justify-center h-full">{item.display}</span> : 
                       item.type === 'avatar' ? <span>{item.display}</span> :
                       <span className="text-sm text-center px-1">{item.name}</span>
                      }
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-[12px] border-b-red-500 z-20"></div>
        </div>

        {showResult && finalPrize && (
          <div className="mt-8 text-center animate-fade-in">
            <h4 className="text-2xl font-bold text-white mb-2">
              {isCosmeticWin ? "Congratulations! You received:" : "Result:"}
            </h4>
            <div className={`inline-flex items-center justify-center p-4 rounded-lg shadow-lg min-w-[200px] text-4xl ${finalPrize.type === 'xp_gain' ? 'bg-green-500 text-white' : finalPrize.type === 'xp_loss' ? 'bg-red-500 text-white' : finalPrize.type === 'avatar' ? 'bg-blue-600 text-white text-6xl' : finalPrize.type === 'banner' ? `${finalPrize.style}` : 'bg-gray-500 text-white'}`}>
              {finalPrize.type === 'avatar' ? finalPrize.display : finalPrize.name}
            </div>
            <button
              onClick={() => onAnimationComplete(finalPrize)}
              className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-lg text-lg"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const TaskCompletionAnimation = ({ show, onAnimationEnd, equippedAnimationEffect }) => {
  if (!show) return null;

  const animationClass = equippedAnimationEffect === 'sparkle' ? 'animate-sparkle' :
                         equippedAnimationEffect === 'confetti' ? 'animate-confetti-pop' :
                         equippedAnimationEffect === 'fireworks' ? 'animate-fireworks' :
                         equippedAnimationEffect === 'glow' ? 'animate-gentle-glow' :
                         equippedAnimationEffect === 'bounce' ? 'animate-bouncy-bounce' :
                         equippedAnimationEffect === 'flash' ? 'animate-flash' :
                         equippedAnimationEffect === 'slide' ? 'animate-slide-in' :
                         equippedAnimationEffect === 'zoom' ? 'animate-zoom-out' :
                         equippedAnimationEffect === 'swirl' ? 'animate-swirl' :
                         equippedAnimationEffect === 'fade' ? 'animate-fade-out' :
                         'animate-checkmark-pop'; // Default

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
      onAnimationEnd={onAnimationEnd}
    >
      <div className="relative">
        {/* Default Checkmark animation */}
        {animationClass === 'animate-checkmark-pop' && (
          <svg
            className="animate-checkmark-pop text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 52"
          >
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        )}

        {/* Sparkle animation */}
        {equippedAnimationEffect === 'sparkle' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={`sparkle-${i}`} className="absolute text-yellow-400 text-4xl opacity-0 animate-sparkle-effect"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`
                }}>✨</span>
            ))}
          </div>
        )}

        {/* Confetti Pop animation */}
        {equippedAnimationEffect === 'confetti' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={`confetti-${i}`}
                className="absolute bg-white rounded-full opacity-0 animate-confetti-effect"
                style={{
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 1.5}s`,
                  backgroundColor: `hsl(${Math.random() * 360}, 70%, 70%)`,
                }}
              ></div>
            ))}
          </div>
        )}

        {/* Fireworks animation */}
        {equippedAnimationEffect === 'fireworks' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`firework-${i}`} className="absolute animate-fireworks-effect"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.7}s`
                }}>
                {Array.from({ length: 12 }).map((__, j) => (
                  <div key={`particle-${j}`} className="absolute w-2 h-2 rounded-full bg-red-500 animate-firework-particle"
                    style={{
                      transform: `rotate(${j * 30}deg) translateX(20px)`,
                      animationDelay: `${i * 0.7 + j * 0.05}s`,
                      backgroundColor: `hsl(${j * 30}, 70%, 70%)`
                    }}></div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Gentle Glow Effect */}
        {equippedAnimationEffect === 'glow' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-yellow-300 opacity-0 animate-gentle-glow-effect"></div>
          </div>
        )}

        {/* Bouncy Bounce animation */}
        {equippedAnimationEffect === 'bounce' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl animate-bouncy-bounce-effect">✔️</span>
          </div>
        )}

        {/* Quick Flash animation */}
        {equippedAnimationEffect === 'flash' && (
          <div className="absolute inset-0 bg-white opacity-0 animate-flash-effect"></div>
        )}

        {/* Slide In animation */}
        {equippedAnimationEffect === 'slide' && (
          <div className="absolute top-1/2 left-0 -translate-y-1/2 text-6xl opacity-0 animate-slide-in-effect">✔️</div>
        )}

        {/* Zoom Out animation */}
        {equippedAnimationEffect === 'zoom' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl opacity-0 animate-zoom-out-effect">✔️</span>
          </div>
        )}

        {/* Swirling Effect animation */}
        {equippedAnimationEffect === 'swirl' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-4 border-blue-500 border-t-transparent rounded-full animate-swirl-effect"></div>
          </div>
        )}

        {/* Fade Out animation */}
        {equippedAnimationEffect === 'fade' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl animate-fade-out-effect">✔️</span>
          </div>
        )}
      </div>
    </div>
  );
};

const Projectile = ({ from, to, type }) => {
  const TILE_SIZE = 40;
  const [position, setPosition] = useState({
    top: from.y * TILE_SIZE + TILE_SIZE / 2,
    left: from.x * TILE_SIZE + TILE_SIZE / 2,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setPosition({
        top: to.y * TILE_SIZE + TILE_SIZE / 2,
        left: to.x * TILE_SIZE + TILE_SIZE / 2,
      });
    }, 10);

    return () => clearTimeout(timer);
  }, [from, to]);

  const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);

  const getProjectileVisual = () => {
    switch (type) {
      case 'arrow':
        return <div className="w-4 h-1 bg-yellow-300" style={{ transform: `rotate(${angle}deg)` }} />;
      case 'cannonball':
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
      case 'iceShard':
        return <div className="w-3 h-4 bg-blue-300 transform -skew-x-12" />;
      case 'bolt':
        return <div className="w-5 h-2 bg-yellow-500" style={{ transform: `rotate(${angle}deg)` }} />;
      case 'fireball':
        return <div className="w-4 h-4 bg-orange-500 rounded-full shadow-[0_0_8px_theme('colors.orange.500')]" />;
      case 'lightning':
        return <div className="w-2 h-6 bg-yellow-300 rounded-full" />;
      case 'poisonCloud':
        return <div className="w-4 h-4 bg-lime-500/50 rounded-full animate-pulse" />;
      case 'bullet':
        return <div className="w-2 h-1 bg-gray-300" style={{ transform: `rotate(${angle}deg)` }} />;
      case 'crystalShard':
          return <div className="w-3 h-5 bg-purple-400 transform skew-x-12" />;
      default:
        return <div className="w-2 h-2 bg-white rounded-full" />;
    }
  };

  return (
    <div
      className="projectile"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {getProjectileVisual()}
    </div>
  );
};

const GachaAnimationModal = ({ isOpen, onAnimationComplete, result }) => {
  const [phase, setPhase] = useState('shaking'); // shaking, revealing, revealed

  useEffect(() => {
    if (isOpen) {
      setPhase('shaking');
      const revealTimer = setTimeout(() => setPhase('revealing'), 2000); // 2s shake
      const revealedTimer = setTimeout(() => setPhase('revealed'), 3000); // 1s reveal transition
      return () => {
        clearTimeout(revealTimer);
        clearTimeout(revealedTimer);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const renderResult = () => {
    if (!result) return <p>An error occurred.</p>;
    switch (result.type) {
      case 'wingman':
        return <p className="text-2xl font-bold text-green-400">New Recruit: {result.wingman.name}!</p>;
      case 'gold':
        return <p className="text-2xl font-bold text-yellow-400">You found {result.amount} Gold!</p>;
      case 'nothing':
        return <p className="text-2xl font-bold text-slate-500">The box was empty...</p>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-lg text-center">
        <h3 className="text-3xl font-bold mb-6">Opening Lootbox...</h3>
        <div className="w-48 h-48 mx-auto mb-6 text-8xl flex items-center justify-center">
          <span className={`transition-transform duration-1000 ${phase === 'shaking' ? 'animate-shake' : ''} ${phase === 'revealing' || phase === 'revealed' ? 'scale-150 opacity-0' : 'scale-100'}`}>📦</span>
        </div>
        
        {phase === 'revealed' && (
          <div className="animate-fade-in">
            {renderResult()}
            <button onClick={() => onAnimationComplete(result)} className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg">Continue</button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.5s infinite; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </div>
  );
};

const commanderDefinitions = {
  default: { // For players who haven't started the dungeon
    abilities: [
      { id: 'inspire', name: 'Inspire', icon: '🗣️', cooldown: 60, description: 'Temporarily doubles the attack speed of towers in an aura.', effect: { type: 'aura_buff', radius: 3, duration: 10, attackSpeedMultiplier: 2 } },
      { id: 'barricade', name: 'Barricade', icon: '🧱', cooldown: 90, description: 'Summons a temporary barricade on the path with 100 HP.', effect: { type: 'summon', unit: 'barricade', hp: 100 } },
    ]
  },
  warrior: {
    abilities: [
      { id: 'inspire', name: 'Inspire', icon: '🗣️', cooldown: 60, description: 'Temporarily doubles the attack speed of towers in an aura.', effect: { type: 'aura_buff', radius: 3, duration: 10, attackSpeedMultiplier: 2 } },
      { id: 'barricade', name: 'Barricade', icon: '🧱', cooldown: 90, description: 'Summons a temporary barricade on the path with 100 HP.', effect: { type: 'summon', unit: 'barricade', hp: 100 } },
    ]
  },
  mage: {
    abilities: [
      { id: 'meteor', name: 'Meteor Strike', icon: '☄️', cooldown: 75, description: 'Calls down a meteor, dealing 50 damage in an area.', effect: { type: 'aoe_damage', radius: 2.5, damage: 50 } },
      { id: 'stasis', name: 'Stasis Field', icon: '❄️', cooldown: 100, description: 'Freezes all enemies in a target area for 5 seconds.', effect: { type: 'aoe_status', radius: 3, status: 'frozen', duration: 5 } },
    ]
  },
  archer: {
     abilities: [
      { id: 'mark', name: 'Mark for Death', icon: '🎯', cooldown: 45, description: 'Marks a single enemy. All attacks against it are critical hits for 10 seconds.', effect: { type: 'single_target_debuff', debuff: 'marked', duration: 10 } },
      { id: 'hail', name: 'Hail of Arrows', icon: '🏹', cooldown: 80, description: 'Showers an area with arrows, dealing 20 damage and slowing enemies.', effect: { type: 'aoe_damage', radius: 3, damage: 20, status: 'slowed', duration: 5 } },
    ]
  },
  tank: {
    abilities: [
      { id: 'taunt_banner', name: 'Taunting Banner', icon: '🚩', cooldown: 70, description: 'Places a banner that taunts enemies, drawing their fire.', effect: { type: 'summon', unit: 'banner', hp: 150 } },
      { id: 'reinforce', name: 'Reinforce', icon: '🛡️', cooldown: 120, description: 'Grants all towers in an aura a shield that absorbs 50 damage.', effect: { type: 'aura_buff', radius: 4, shield: 50 } },
    ]
  }
};

const Particle = ({ onComplete }) => {  useEffect(() => {
    const timer = setTimeout(onComplete, 500); // Animation duration
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => {
        const size = Math.random() * 8 + 4;
        const angle = (i / 5) * 2 * Math.PI;
        return (
          <div
            key={i}
            className="particle"
            style={{
              width: size, height: size,
              top: `calc(50% - ${size/2}px + ${Math.sin(angle) * 30}px)`,
              left: `calc(50% - ${size/2}px + ${Math.cos(angle) * 30}px)`,
              animationDelay: `${Math.random() * 0.1}s`
            }}
          />
        );
      })}
    </>
  );
}; 

const WingmanBarracks = ({ stats, wingmanDefs, updateStatsInFirestore, showMessageBox, sessionGold, sessionXp, isRunActive, pendingEquippedWingman, onEquipWingman }) => {
  const [selectedView, setSelectedView] = useState('recruit'); // 'recruit' or a wingman instanceId
  const [barracksView, setBarracksView] = useState('roster'); // 'roster' or 'graveyard'
  const [isGachaAnimating, setIsGachaAnimating] = useState(false);
  const [gachaResult, setGachaResult] = useState(null);
  
  const roster = stats.dungeon_wingmen?.roster || [];
  const graveyard = stats.dungeon_wingmen?.graveyard || [];
  const selectedUnit = roster.find(w => w.instanceId === selectedView) || graveyard.find(w => w.instanceId === selectedView);

  const handleRecruitXP = (wingmanId) => {
    const def = wingmanDefs[wingmanId];
    if (sessionXp < def.cost) { showMessageBox("Not enough XP!", "error"); return; }
    
    const newWingmanInstance = { ...def, instanceId: `${wingmanId}_${Date.now()}` };

    updateStatsInFirestore({
      totalXP: increment(-def.cost),
      'dungeon_wingmen.roster': [...(stats.dungeon_wingmen.roster || []), newWingmanInstance],
    });
    showMessageBox(`Recruited ${def.name}!`, 'info');
  };

  const handleRecruitGold = () => {
    if (sessionGold < 500) { showMessageBox("Not enough Gold!", "error"); return; }
    
    updateStatsInFirestore({ dungeon_gold: increment(-500) });
    
    const roll = Math.random();
    let result;

    if (roll < 0.1) { // 10% chance of nothing
        result = { type: 'nothing' };
    } else if (roll < 0.4) { // 30% chance of gold
        const amount = Math.floor(Math.random() * 501) + 250; // 250 to 750 gold
        result = { type: 'gold', amount };
    } else { // 60% chance of a wingman
        const gachaPool = Object.values(wingmanDefs).filter(w => w.currency === 'gold');
        
        if (gachaPool.length === 0) { // Should not happen, but good practice
            result = { type: 'gold', amount: 500 };
        } else {
            const recruit = gachaPool[Math.floor(Math.random() * gachaPool.length)];
            const newInstance = { ...recruit, instanceId: `${recruit.id}_${Date.now()}` };
            result = { type: 'wingman', wingman: newInstance };
        }
    }
    
    setGachaResult(result);
    setIsGachaAnimating(true);
  };

  const handleGachaAnimationEnd = (result) => {
      setIsGachaAnimating(false);
      setGachaResult(null);
  
      let updates = {};
      let message = "";
  
      if (result.type === 'gold') {
          updates.dungeon_gold = increment(result.amount);
          message = `You found ${result.amount} Gold in the lootbox!`;
      } else if (result.type === 'wingman') {
          updates['dungeon_wingmen.roster'] = [...(stats.dungeon_wingmen.roster || []), result.wingman];
          message = `From the shadows emerges... ${result.wingman.name}!`;
      } else { // 'nothing'
          message = "The lootbox was empty...";
      }
  
      if (Object.keys(updates).length > 0) {
          updateStatsInFirestore(updates);
      }
      showMessageBox(message, 'info');
  };

  const handlePurchaseUpgrade = (wingman, upgrade) => {
    if (sessionXp < upgrade.cost) { showMessageBox("Not enough XP!", "error"); return; }

    const upgrades = stats.dungeon_wingmen?.upgrades || {};
    const purchasedUpgrades = upgrades[wingman.id] || [];

    // Prevent re-buying a choice-based upgrade
    if (upgrade.type === 'choice') {
      const tierUpgrades = wingmanUpgrades[wingman.id]?.ability || [];
      if (tierUpgrades.some(u => purchasedUpgrades.includes(u.id))) {
        showMessageBox("You have already chosen a specialization for this ability.", "error");
        return;
      }
    }
    
    updateStatsInFirestore({
      totalXP: increment(-upgrade.cost),
      [`dungeon_wingmen.upgrades.${wingman.id}`]: [...purchasedUpgrades, upgrade.id]
    });

    showMessageBox(`Purchased upgrade: ${upgrade.name}!`, 'info');
  };

  const SpriteIcon = ({ style, size = 60 }) => {
    // Determine the scale factor needed to fit the largest dimension of the sprite into the 'size' box.
    const largestDim = Math.max(style.width, style.height);
    const scale = size / largestDim;

    return (
      // Outer container: A fixed-size box that centers its child.
      <div style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden', // Prevents scaled sprite from overflowing
      }}>
        {/* Inner container: Holds the sprite at its original dimensions and is then scaled down. */}
        <div style={{
          width: style.width,          // Original sprite width
          height: style.height,        // Original sprite height
          backgroundImage: `url(${wingmenSpriteSheet})`,
          backgroundPosition: style.backgroundPosition, // Original, unscaled position
          transform: `scale(${scale})`, // Scale the entire element down
          transformOrigin: 'center',   // Ensure scaling happens from the center
          imageRendering: 'pixelated',
          flexShrink: 0, // Prevent flexbox from shrinking this element
        }} />
      </div>
    );
  };
  
  const UpgradedStats = ({ wingman }) => {
    const baseStats = wingmanDefs[wingman.id];
    const mergedWingman = { ...baseStats, ...wingman };

    const { totalStats, bonuses } = useMemo(() => {
        const purchased = stats.dungeon_wingmen?.upgrades?.[mergedWingman.id] || [];
        const available = wingmanUpgrades[mergedWingman.id];
        
        const calculatedBonuses = { hp: 0, atk: 0, armor: 0, thorns: 0 };
        const finalStats = { ...mergedWingman };

        if (available?.stats) {
          purchased.forEach(upgradeId => {
            const upgrade = available.stats.find(u => u.id === upgradeId);
            if (upgrade?.effect) {
              for (const stat in upgrade.effect) {
                // Add to bonus tracker
                if (calculatedBonuses.hasOwnProperty(stat)) {
                  calculatedBonuses[stat] += upgrade.effect[stat];
                }
                // Apply to final stat total
                finalStats[stat] = (finalStats[stat] || 0) + upgrade.effect[stat];
              }
            }
          });
        }
        return { totalStats: finalStats, bonuses: calculatedBonuses };
    }, [mergedWingman.id, stats.dungeon_wingmen?.upgrades]);

    const primaryAbility = mergedWingman.abilities?.[0];

    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <p>HP: <span className="font-bold text-red-400">{mergedWingman.hp} {bonuses.hp > 0 && <span className="text-green-400">(+{bonuses.hp})</span>}</span></p>
        <p>Attack: <span className="font-bold text-yellow-400">{mergedWingman.atk} {bonuses.atk > 0 && <span className="text-green-400">(+{bonuses.atk})</span>}</span></p>
        <p>Armor: <span className="font-bold text-slate-400">{mergedWingman.armor || 0} {bonuses.armor > 0 && <span className="text-green-400">(+{bonuses.armor})</span>}</span></p>
        <p>AP / Turn: <span className="font-bold text-cyan-400">{mergedWingman.ap}</span></p>
        {totalStats.thorns > 0 && <p>Thorns: <span className="font-bold text-orange-400">{totalStats.thorns}</span></p>}
        <p>Move Range: <span className="font-bold text-slate-400">{totalStats.moveRange}</span></p>
        <p>Attack Cost: <span className="font-bold text-slate-400">{totalStats.attackCost} AP</span></p>
        {primaryAbility && <p className="col-span-2">Ability: <span className="font-bold text-slate-400">{primaryAbility.name} ({primaryAbility.cost} AP)</span></p>}
      </div>
    );
  };


  return (
    <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
      <GachaAnimationModal isOpen={isGachaAnimating} onAnimationComplete={handleGachaAnimationEnd} result={gachaResult} />
      <h3 className="text-3xl font-bold text-white mb-4">Barracks</h3>
      <div className="flex flex-col md:flex-row gap-4 min-h-[60vh]">
        {/* Left Panel: Roster / Graveyard */}
        <div className="w-full md:w-1/3 lg:w-1/4 bg-slate-900/50 p-3 rounded-lg flex flex-col">
          <div className="flex border-b border-slate-700 mb-2">
            <button onClick={() => setBarracksView('roster')} className={`flex-1 py-2 text-sm font-semibold ${barracksView === 'roster' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400'}`}>Roster ({roster.length})</button>
            <button onClick={() => setBarracksView('graveyard')} className={`flex-1 py-2 text-sm font-semibold ${barracksView === 'graveyard' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400'}`}>Graveyard ({graveyard.length})</button>
          </div>
          <div className="space-y-2 overflow-y-auto flex-grow">
            {barracksView === 'roster' && roster.map(w => (
              <button key={w.instanceId} onClick={() => setSelectedView(w.instanceId)} className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${selectedView === w.instanceId ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'}`}>
                <div className="w-10 h-10 bg-slate-900 rounded-md flex items-center justify-center flex-shrink-0"><SpriteIcon style={w.spriteStyle} size={36} /></div>
                <div>
                  <p className="font-semibold text-left text-sm">{w.name}</p>
                  <p className="text-xs text-slate-400 text-left">{w.role}</p>
                </div>
              </button>
            ))}
            {barracksView === 'graveyard' && graveyard.map(w => (
              <button key={w.instanceId} onClick={() => setSelectedView(w.instanceId)} className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${selectedView === w.instanceId ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'}`}>
                <div className="w-10 h-10 bg-slate-900 rounded-md flex items-center justify-center flex-shrink-0"><SpriteIcon style={w.spriteStyle} size={36} /></div>
                <div>
                  <p className="font-semibold text-left text-sm">{w.name}</p>
                  <p className="text-xs text-slate-500 text-left">Fallen in battle</p>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => { setSelectedView('recruit'); setBarracksView('roster'); }} className={`w-full flex items-center justify-center gap-3 p-2 mt-2 rounded-md transition-colors ${selectedView === 'recruit' ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'}`}>
            <span className="text-2xl">+</span><span className="font-semibold">Recruit New Wingmen</span>
          </button>
        </div>

        {/* Right Panel: Details/Recruit */}
        <div className="w-full md:w-2/3 lg:w-3/4 bg-slate-900/50 p-4 rounded-lg">
          {selectedUnit ? (
            <div>
              <div className="flex flex-col sm:flex-row gap-4 items-center mb-4 pb-4 border-b border-slate-700">
                <div className="w-24 h-24 bg-slate-800 rounded-lg flex items-center justify-center"><SpriteIcon style={selectedUnit.spriteStyle} size={80} /></div>
                <div className="flex-grow">
                    <h3 className="text-2xl font-bold">{selectedUnit.name}</h3>
                    <p className="text-indigo-400 font-semibold">{selectedUnit.role}</p>
                    {selectedUnit.dateOfDeath ? (
                      <p className="text-sm text-red-400 mt-2">Defeated on: {new Date(selectedUnit.dateOfDeath).toLocaleDateString()}</p>
                    ) : (
                      <div className="mt-2"><UpgradedStats wingman={selectedUnit} /></div>
                    )}
                </div>
                {!selectedUnit.dateOfDeath && (
                  <div className="flex-shrink-0">
                    {pendingEquippedWingman === selectedUnit.instanceId ?
                      <button onClick={() => onEquipWingman(null)} disabled={isRunActive} className="w-full sm:w-auto bg-slate-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50">Equipped</button> :
                      <button onClick={() => onEquipWingman(selectedUnit.instanceId)} disabled={isRunActive} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50">Equip</button>
                    }
                  </div>
                )}
              </div>
              
              {!selectedUnit.dateOfDeath && (
                <>
                  <h4 className="text-xl font-semibold text-white mb-2">Training</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                          <h5 className="text-lg font-semibold text-indigo-300 mb-2">Stat Training</h5>
                          <div className="space-y-2">
                              {(wingmanUpgrades[selectedUnit.id]?.stats || []).map(upgrade => {
                                  const purchasedCount = (stats.dungeon_wingmen?.upgrades?.[selectedUnit.id] || []).filter(id => id === upgrade.id).length;
                                  const isOwned = purchasedCount > 0 && upgrade.type !== 'repeatable';
                                  return (
                                      <div key={upgrade.id} className="bg-slate-800 p-3 rounded-md flex justify-between items-center">
                                          <div>
                                              <p className="font-semibold">{upgrade.name}</p>
                                              <p className="text-xs text-slate-400">{upgrade.description}</p>
                                          </div>
                                          <button onClick={() => handlePurchaseUpgrade(selectedUnit, upgrade)} disabled={isOwned} className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white text-sm font-semibold px-3 py-1 rounded-md">
                                            {isOwned ? 'Owned' : `${upgrade.cost} XP`}
                                          </button>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                      <div>
                          <h5 className="text-lg font-semibold text-indigo-300 mb-2">Ability Specialization</h5>
                          <div className="space-y-2">
                            {(wingmanUpgrades[selectedUnit.id]?.ability || []).map(upgrade => {
                                  const purchasedUpgrades = stats.dungeon_wingmen?.upgrades?.[selectedUnit.id] || [];
                                  const isOwned = purchasedUpgrades.includes(upgrade.id);
                                  const hasChosenTier = (wingmanUpgrades[selectedUnit.id]?.ability || []).some(u => purchasedUpgrades.includes(u.id));
                                  return (
                                      <div key={upgrade.id} className="bg-slate-800 p-3 rounded-md">
                                          <p className="font-semibold">{upgrade.name}</p>
                                          <p className="text-xs text-slate-400 mb-2">{upgrade.description}</p>
                                          <button onClick={() => handlePurchaseUpgrade(selectedUnit, upgrade)} disabled={isOwned || hasChosenTier} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white text-sm font-semibold px-3 py-1 rounded-md">
                                            {isOwned ? 'Chosen' : hasChosenTier ? 'Path Chosen' : `Specialize (${upgrade.cost} XP)`}
                                          </button>
                                      </div>
                                  );
                            })}
                          </div>
                      </div>
                  </div>
                </>
              )}
            </div>
          ) : ( /* Recruit View */
            <div>
              <h4 className="text-xl font-semibold text-white mb-2">Recruit with XP</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {Object.values(wingmanDefs).filter(w => w.currency === 'xp').map(wingman => {
                  const isOwned = roster.some(r => r.id === wingman.id);
                  return (
                    <div key={wingman.id} className="p-4 bg-slate-800/80 rounded-lg flex flex-col items-center text-center border border-slate-700">
                      <div className="h-16 flex items-center justify-center"><SpriteIcon style={wingman.spriteStyle} size={60} /></div>
                      <p className="font-bold mt-2 flex-grow">{wingman.name}</p>
                      <button disabled={isOwned} onClick={() => handleRecruitXP(wingman.id)} className="mt-3 w-full bg-blue-600 text-white text-sm py-1 rounded hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed">
                        {isOwned ? 'Recruited' : `${wingman.cost} XP`}
                      </button>
                    </div>
                  );
                })}
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Recruit with Gold</h4>
              <button onClick={handleRecruitGold} className="w-full p-4 bg-yellow-600 text-black font-bold rounded-lg hover:bg-yellow-700">
                Spend 500 Gold for a Rare or Epic Recruit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DungeonCrawler = ({ stats, updateStatsInFirestore, showMessageBox, getFullPetDetails, onResetDungeon, getFullCosmeticDetails, processAchievement, syncDungeonXp, isMobile, addIngredientToInventory }) => {
  const statsPropRef = useRef(stats);
  useEffect(() => {
    statsPropRef.current = stats;
  }, [stats]);
  const [localDungeonState, setLocalDungeonState] = useState(stats.dungeon_state);
  const [animationState, setAnimationState] = useState({ hits: {}, particles: [], enemyPaths: {} });
  const [activeTurn, setActiveTurn] = useState('player');
  const [playerActionPoints, setPlayerActionPoints] = useState(2);
  const [wingmanActionPoints, setWingmanActionPoints] = useState(0);
  const [wingmanAbilityTarget, setWingmanAbilityTarget] = useState(null);
  const [dangerZone, setDangerZone] = useState({ tiles: [], forEnemy: null });
  const [barracksOpen, setBarracksOpen] = useState(false);
  const [pendingEquippedWingman, setPendingEquippedWingman] = useState(stats.dungeon_wingmen?.equipped);
  const [wingmanTurnState, setWingmanTurnState] = useState({ distanceMoved: 0, frenziedAttackAvailable: false });
  const [turnIndicator, setTurnIndicator] = useState(null);

  useEffect(() => {
    if (activeTurn === 'player' && localDungeonState.phase === 'playing') {
      setTurnIndicator('Player Turn');
    } else if (activeTurn === 'enemy' && localDungeonState.phase === 'playing') {
      setTurnIndicator('Enemy Turn');
    }
    
    const timer = setTimeout(() => {
      setTurnIndicator(null);
    }, 1500); // The animation `animate-fade-out-fast` lasts 1.5s
  
    return () => clearTimeout(timer);
  }, [activeTurn, localDungeonState.phase]);

  // These states track resources for the current session to batch updates.
  const [sessionXp, setSessionXp] = useState(stats.totalXP);
  const [sessionGold, setSessionGold] = useState(stats.dungeon_gold || 0);
  
  const dungeonStateRef = useRef(localDungeonState);
  const debouncedSaveRef = useRef(null);

  useEffect(() => {
    dungeonStateRef.current = localDungeonState;
  }, [localDungeonState]);

  // Syncs the pending choice with the saved choice from Firestore when stats change.
  useEffect(() => {
    setPendingEquippedWingman(stats.dungeon_wingmen?.equipped);
  }, [stats.dungeon_wingmen?.equipped]);

  // NEW & IMPROVED: Wingman spawning with stat AND ability upgrades.
  useEffect(() => {
    const state = localDungeonState;
    const equippedWingmanInstanceId = pendingEquippedWingman; // This now holds the instanceId

    if (state.phase !== 'playing' || state.floor !== 1 || state.turnCount > 1) return;

    const currentWingmanInstanceId = state.wingman?.instanceId;

    // Handle unequipping
    if (!equippedWingmanInstanceId && currentWingmanInstanceId) {
      const oldPos = `${state.wingman.y},${state.wingman.x}`;
      setLocalDungeonState(prev => {
        const newBoard = { ...prev.board };
        if (newBoard[oldPos]?.type === 'wingman') newBoard[oldPos] = { type: 'empty' };
        return { ...prev, wingman: null, board: newBoard };
      });
      return;
    }

    // Handle equipping a new/different wingman
    if (equippedWingmanInstanceId && equippedWingmanInstanceId !== currentWingmanInstanceId) {
      const wingmanRosterEntry = (stats.dungeon_wingmen?.roster || []).find(w => w.instanceId === equippedWingmanInstanceId);
      if (!wingmanRosterEntry) {
          console.error("Equipped wingman not found in roster:", equippedWingmanInstanceId);
          return;
      }
      
      const upgradedWingman = JSON.parse(JSON.stringify(wingmanRosterEntry)); // Deep copy from the roster entry
      const baseDef = wingmanDefinitions[upgradedWingman.id];
      const purchasedUpgrades = stats.dungeon_wingmen?.upgrades?.[upgradedWingman.id] || [];
      
      // Reset all potentially upgradeable stats to their base definition values
      Object.assign(upgradedWingman, {
        hp: baseDef.hp,
        atk: baseDef.atk,
        armor: baseDef.armor || 0,
        thorns: baseDef.thorns || 0,
      });
      
      // Re-apply all purchased stat upgrades generically
      purchasedUpgrades.forEach(upgradeId => {
        const upgradeDef = wingmanUpgrades[upgradedWingman.id]?.stats.find(u => u.id === upgradeId);
        if (upgradeDef?.effect) {
          for (const stat in upgradeDef.effect) {
            upgradedWingman[stat] = (upgradedWingman[stat] || 0) + upgradeDef.effect[stat];
          }
        }
      });
      upgradedWingman.maxHp = upgradedWingman.hp;

      // Apply ability specializations
      const abilityUpgradeDefs = wingmanUpgrades[upgradedWingman.id]?.ability || [];
      const purchasedAbilityUpgrade = abilityUpgradeDefs.find(u => purchasedUpgrades.includes(u.id));
      if (purchasedAbilityUpgrade) {
          upgradedWingman.abilities = upgradedWingman.abilities.map(ability => ({
              ...ability,
              specialization: purchasedAbilityUpgrade.id // Add specialization ID to the ability object
          }));
      }

      setLocalDungeonState(prev => {
        let newBoard = { ...prev.board };
        if (prev.wingman) {
          const oldPos = `${prev.wingman.y},${prev.wingman.x}`;
          if (newBoard[oldPos]?.type === 'wingman') newBoard[oldPos] = { type: 'empty' };
        }
        
        const possibleSpots = [{x: 1, y: 0}, {x: 0, y: 1}, {x: 2, y: 1}, {x: 1, y: 2}];
        const startPos = possibleSpots.find(p => newBoard[`${p.y},${p.x}`]?.type === 'empty');

        if (startPos) {
          const newWingman = { ...upgradedWingman, x: startPos.x, y: startPos.y, entityType: 'wingman' };
          newBoard[`${startPos.y},${startPos.x}`] = { type: 'wingman' };
          setWingmanActionPoints(newWingman.ap);
          return { ...prev, wingman: newWingman, board: newBoard };
        }
        return { ...prev, wingman: null };
      });
    }
  }, [localDungeonState.phase, localDungeonState.floor, localDungeonState.turnCount, localDungeonState.wingman, pendingEquippedWingman, stats.dungeon_wingmen?.roster, stats.dungeon_wingmen?.upgrades]);

  const [attackTarget, setAttackTarget] = useState(null); // Can be true, or an object like { type: 'secondary' }
  const [abilityTarget, setAbilityTarget] = useState(null);
  const [shopView, setShopView] = useState('buy'); // 'buy' or 'armory'
  const [selectedArmoryItem, setSelectedArmoryItem] = useState(null);
  
  const addLog = useCallback((message, style = 'text-slate-300') => {
    // Add a unique ID to each log entry
    const newLogEntry = { id: Date.now() + Math.random(), message, style };
    setLocalDungeonState(prevState => ({ ...prevState, log: [newLogEntry, ...(prevState.log || []).slice(0, 4)] }));
  }, []);

  useEffect(() => {
    if (syncDungeonXp) {
      syncDungeonXp(sessionXp);
    }
  }, [sessionXp, syncDungeonXp]);
  
  // REFACTORED: saveGame now updates the single stats document.
  const saveGame = useCallback(async (stateToSave) => {

    if (!stateToSave) return;
    try {
      await updateStatsInFirestore({
        dungeon_state: stateToSave,
        dungeon_gold: sessionGold,
        totalXP: sessionXp,
        'cooldowns.saveDungeon': serverTimestamp()
      });
      // Don't show a message on auto-save
    } catch (error) {
      if (error.message.includes('permission-denied')) {
        showMessageBox("You're saving too frequently!", "error");
      } else {
        console.error("Dungeon save failed:", error);
        showMessageBox("Failed to save progress.", "error");
      }
    }
  }, [sessionGold, sessionXp, updateStatsInFirestore, showMessageBox]);

  // FIX: This useEffect was the source of the state reset bug and has been removed.
  // The component now correctly manages its own state after initialization.
  
  useEffect(() => {
    // This effect now debounces the save operation.
    // Any change to localDungeonState will reset the timer.
    if (localDungeonState && localDungeonState.phase === 'playing' && !localDungeonState.gameOver) {
      if (debouncedSaveRef.current) {
        clearTimeout(debouncedSaveRef.current);
      }
      debouncedSaveRef.current = setTimeout(() => {
        saveGame(dungeonStateRef.current); // Use ref to save the absolute latest state
        showMessageBox("Dungeon progress auto-saved!", "info", 1500);
      }, 30000); // Save 30 seconds after the last action
    }
    
    return () => {
      if (debouncedSaveRef.current) {
        clearTimeout(debouncedSaveRef.current);
      }
    };
  }, [localDungeonState, saveGame]);

  const dungeonDefinitions = {
    classes: {
      warrior: { name: 'Warrior', icon: '⚔️', combatStyle: 'Martial', description: 'A balanced fighter with strong melee attacks.', startingHp: 100, moveCost: 5, attackCost: 50, attackRange: 1.5, ability: { id: 'whirlwind', name: 'Whirlwind', cost: 120 } },
      mage: { name: 'Mage', icon: '🧙', combatStyle: 'Arcane', description: 'A fragile caster with powerful area-of-effect spells.', startingHp: 60, moveCost: 5, attackCost: 100, attackRange: 4, ability: { id: 'fireball', name: 'Fireball', cost: 200 } },
      archer: { name: 'Archer', icon: '🏹', combatStyle: 'Finesse', description: 'A nimble marksman who attacks from a great distance.', startingHp: 60, moveCost: 5, attackCost: 60, attackRange: 5, ability: { id: 'double_tap', name: 'Double Tap', cost: 150 } },
      tank: { name: 'Tank', icon: '🛡️', combatStyle: 'Martial', description: 'A sturdy protector who can endure heavy damage.', startingHp: 200, moveCost: 8, attackCost: 40, attackRange: 1.5, ability: { id: 'hunker_down', name: 'Hunker Down', cost: 80 } },
    },
primaryWeapons: {
      warrior: {
        swords: [
          { id: 'weapon_sword', name: 'Iron Sword', cost: 500, attack: 10, accuracy: 1.0, attackRange: 1.5, description: "Balanced and reliable." },
          { id: 'weapon_broadsword', name: 'Steel Broadsword', cost: 1200, attack: 22, accuracy: 1.0, attackRange: 1.5, description: "A solid, dependable upgrade." },
          { id: 'weapon_vampiric_falchion', name: 'Vampiric Falchion', cost: 2800, attack: 35, accuracy: 1.0, lifesteal: 0.15, attackRange: 1.5, description: "Restores 15% of damage dealt as health." },
          { id: 'weapon_flame', name: 'Flame Tongue', cost: 2000, attack: 45, accuracy: 1.0, attackRange: 1.5, description: "Deals bonus fire damage." },
          { id: 'weapon_void', name: 'Void Blade', cost: 5000, attack: 70, accuracy: 1.0, attackRange: 1.5, statusEffect: { type: 'weakened', chance: 0.3, duration: 2 }, description: "Has a 30% chance to weaken enemies, reducing their damage." },
          { id: 'weapon_sunforged', name: 'Sunforged Blade', cost: 7500, attack: 100, accuracy: 1.0, attackRange: 1.5,  tdWinsRequired: 5, description: "A legendary, perfectly balanced blade." },
        ],
        axes: [
          { id: 'weapon_axe_iron', name: 'Iron Axe', cost: 550, attack: 16, accuracy: 0.90, cleave: 0.25, attackRange: 1.5, description: "High damage, but less accurate. Hits adjacent enemies for 25% damage." },
          { id: 'weapon_axe_steel', name: 'Steel War Axe', cost: 1000, attack: 25, accuracy: 0.85, cleave: 0.30, attackRange: 1.5, description: "A heavier axe with a better cleave effect." },
          { id: 'weapon_axe_berserker', name: 'Berserker Axe', cost: 1200, attack: 35, accuracy: 0.80, cleave: 0.35, attackRange: 1.5, description: "More powerful, but wilder. Hits adjacent enemies for 35% damage." },
          { id: 'weapon_axe_executioner', name: 'Executioner\'s Axe', cost: 4500, attack: 65, accuracy: 0.75, cleave: 0.40, attackRange: 1.5, description: "Incredibly powerful with a wide swing, but very inaccurate." },
        ],
        spears: [
          { id: 'weapon_spear_iron', name: 'Iron Spear', cost: 600, attack: 9, attackRange: 2.5, accuracy: 1.0, description: "Increased reach allows attacking from a distance." },
          { id: 'weapon_spear_lance', name: 'Lance', cost: 1100, attack: 18, attackRange: 2.5, accuracy: 1.0, description: "A long polearm for controlling the battlefield." },
          { id: 'weapon_spear_pike', name: 'Steel Pike', cost: 1600, attack: 24, attackRange: 2.5, accuracy: 1.0, description: "A powerful polearm with exceptional reach." },
          { id: 'weapon_spear_trident', name: 'Trident', cost: 3200, attack: 40, attackRange: 2.5, accuracy: 0.95, description: "A three-pronged spear that can strike multiple foes in a line." },
        ]
      },
      mage: {
        wands: [
          { id: 'wand_apprentice', name: 'Apprentice Wand', cost: 500, attack: 15, aoeRange: 1.5, accuracy: 1.0, attackRange: 4, description: "Quick, reliable single-target damage." },
          { id: 'wand_fireball', name: 'Fireball Wand', cost: 1200, attack: 28, aoeRange: 1.5, accuracy: 1.0, attackRange: 4, description: "Casts a small exploding fireball." },
          { id: 'wand_frost', name: 'Frost Wand', cost: 1800, attack: 20, aoeRange: 1.5, accuracy: 1.0, attackRange: 4, statusEffect: { type: 'crippled', chance: 1.0, duration: 1, reduction: 1 }, description: "Chills the target on hit, slowing them for a turn." },
          { id: 'wand_lightning', name: 'Lightning Wand', cost: 2500, attack: 50, aoeRange: 2, accuracy: 1.0, attackRange: 4, description: "A more powerful elemental wand." },
          { id: 'wand_void', name: 'Void Core Wand', cost: 5000, attack: 75, aoeRange: 2, accuracy: 1.0, attackRange: 4, description: "Channels unstable but powerful energy." },
          { id: 'wand_archmage', name: 'Archmage\'s Wand', cost: 7500, attack: 110, aoeRange: 2.5, accuracy: 1.0, attackRange: 4, tdWinsRequired: 5, description: "A wand of immense power." },
        ],
        staves: [
          { id: 'staff_charged', name: 'Charged Staff', cost: 1500, attack: 40, aoeRange: 2.0, accuracy: 1.0, attackRange: 4, isChargeable: true, maxCharges: 1, description: "Can be charged for one turn to unleash a x2 damage blast." },
          { id: 'staff_power', name: 'Staff of Power', cost: 2500, attack: 52, aoeRange: 2.0, accuracy: 1.0, attackRange: 4, isChargeable: true, maxCharges: 1, description: "A staff that holds a greater latent charge." },
          { id: 'staff_chain_lightning', name: 'Chain Lightning Staff', cost: 3800, attack: 45, aoeRange: 0, chain: { count: 3, range: 3.5, falloff: 0.7 }, accuracy: 1.0, attackRange: 4, description: "Hits the target, then arcs to 3 nearby enemies for 70% damage." },
          { id: 'staff_grand', name: 'Grand Staff', cost: 4000, attack: 65, aoeRange: 2.5, accuracy: 1.0, attackRange: 4, isChargeable: true, maxCharges: 2, description: "Can be charged up multiple times for immense power." },
        ],
        tomes: [
          { id: 'tome_stunning', name: 'Tome of Stunning', cost: 1800, attack: 5, accuracy: 1.0, attackRange: 4, statusEffect: { type: 'stunned', chance: 0.75, duration: 1 }, description: "Low damage, but has a 75% chance to stun the target for a turn." },
          { id: 'tome_frost', name: 'Tome of Frost', cost: 1800, attack: 5, accuracy: 1.0, attackRange: 4, statusEffect: { type: 'crippled', chance: 1.0, duration: 2, reduction: 1 }, description: "Low damage, but slows the target's movement for 2 turns." },
          { id: 'tome_cursing', name: 'Tome of Cursing', cost: 2200, attack: 10, accuracy: 1.0, attackRange: 4, statusEffect: { type: 'cursed', chance: 0.8, duration: 3, multiplier: 1.2 }, description: "80% chance to curse the target, making them take 20% more damage for 3 turns." },
        ]
      },
      archer: {
        bows: [
          { id: 'bow_short', name: 'Shortbow', cost: 500, attack: 12, accuracy: 1.0, attackRange: 5, description: "A reliable, standard-issue bow." },
          { id: 'bow_long', name: 'Longbow', cost: 1100, attack: 28, accuracy: 1.0, attackRange: 5, description: "Offers greater power and range." },
          { id: 'bow_multishot', name: 'Multishot Bow', cost: 2000, attack: 18, accuracy: 1.0, attackRange: 5, multishot: 3, description: "Fires a spread of 3 arrows at once." },
          { id: 'bow_eagle', name: 'Eagle Eye Bow', cost: 2200, attack: 55, accuracy: 1.0, attackRange: 5, description: "A masterfully crafted bow that rarely misses." },
          { id: 'bow_void', name: 'Voidstring Bow', cost: 5000, attack: 80, accuracy: 1.0, attackRange: 5, description: "Fires arrows imbued with weakening energy." },
          { id: 'bow_sunstrider', name: 'Sunstrider\'s Mark', cost: 7500, attack: 120, accuracy: 1.0, attackRange: 5, tdWinsRequired: 5, description: "A legendary bow of unmatched power." },
        ],
        crossbows: [
          { id: 'crossbow_iron', name: 'Iron Crossbow', cost: 1300, attack: 35, accuracy: 1.0, attackRange: 5, armorPiercing: 5, description: "Slower to fire, but its bolts ignore 5 enemy armor." },
          { id: 'crossbow_hunter', name: 'Hunter\'s Crossbow', cost: 1800, attack: 45, accuracy: 1.0, attackRange: 5, armorPiercing: 7, description: "A well-made crossbow with superior armor penetration." },
          { id: 'crossbow_repeater', name: 'Repeating Crossbow', cost: 2800, attack: 25, accuracy: 1.0, attackRange: 5, armorPiercing: 3, multishot: 2, description: "Fires two bolts in quick succession." },
          { id: 'crossbow_heavy', name: 'Heavy Crossbow', cost: 2500, attack: 60, accuracy: 1.0, attackRange: 5, armorPiercing: 10, description: "A powerful, heavy weapon that is highly effective against armored foes." },
        ]
      },
      tank: {
        sword_and_shield: [
          { id: 'shield_iron', name: 'Iron Sword & Shield', cost: 500, attack: 8, hp: 50, accuracy: 1.0, attackRange: 1.5, description: "A standard, defensive starting weapon." },
          { id: 'shield_steel', name: 'Steel Tower Shield', cost: 1000, attack: 15, hp: 120, accuracy: 1.0, attackRange: 1.5, description: "Provides excellent protection." },
          { id: 'shield_spiked', name: 'Spiked Shield', cost: 1800, attack: 20, hp: 180, accuracy: 1.0, attackRange: 1.5, thorns: 5, description: "Deals 5 damage to melee attackers." },
          { id: 'shield_aegis', name: 'Aegis Wall', cost: 2000, attack: 25, hp: 250, accuracy: 1.0, attackRange: 1.5, description: "An almost impenetrable defensive shield." },
          { id: 'shield_void', name: 'Void Bulwark', cost: 5000, attack: 40, hp: 400, accuracy: 1.0, attackRange: 1.5, description: "A shield that absorbs dark energy." },
          { id: 'shield_unbreakable', name: 'The Unbreakable', cost: 7500, attack: 60, hp: 600, accuracy: 1.0, attackRange: 1.5, tdWinsRequired: 5, description: "A legendary shield said to be indestructible." },
        ],
        hammers: [
          { id: 'hammer_warhammer', name: 'Warhammer', cost: 1200, attack: 20, accuracy: 0.9, attackRange: 1.5, statusEffect: { type: 'stunned', chance: 0.4, duration: 1 }, description: "A heavy two-handed hammer with a 40% chance to stun enemies." },
          { id: 'hammer_maul', name: 'Stunning Maul', cost: 2400, attack: 30, accuracy: 0.9, attackRange: 1.5, statusEffect: { type: 'stunned', chance: 0.6, duration: 1 }, description: "Slower, but has a 60% chance to stun enemies." },
          { id: 'hammer_sunderer', name: 'Sunderer Maul', cost: 3500, attack: 45, accuracy: 0.85, attackRange: 1.5, statusEffect: { type: 'armor_break', chance: 0.5, duration: 3, amount: 5 }, description: "50% chance to reduce enemy armor by 5 for 3 turns." },
        ]
      }
    },
    offhandWeapons: [
      { id: 'offhand_dagger', name: 'Dagger', cost: 200, attack: 8, attackRange: 1.5, accuracy: 1.0, forClass: ['mage', 'archer'] },
      { id: 'offhand_shortbow', name: 'Shortbow', cost: 350, attack: 10, attackRange: 4, accuracy: 1.0, forClass: ['warrior', 'tank'] },
      { id: 'offhand_wand', name: 'Wand', cost: 450, attack: 6, attackRange: 3, accuracy: 1.0, aoeRange: 1.5, forClass: ['warrior', 'tank'] },
      // New additions
      { id: 'offhand_buckler', name: 'Buckler', cost: 300, hp: 25, forClass: ['mage', 'archer'], description: "+25 Max HP." },
      { id: 'offhand_tome', name: 'Tome of Focus', cost: 400, attack: 5, forClass: ['mage'], description: "Passively adds +5 Attack." },
      { id: 'offhand_throwing_axe', name: 'Throwing Axe', cost: 350, attack: 12, attackRange: 3, accuracy: 0.9, forClass: ['warrior', 'tank'] },
    ],
    armors: [ // Universal
      { id: 'armor_leather', name: 'Leather Armor', cost: 500, hp: 50 },
      { id: 'armor_plate', name: 'Steel Plate', cost: 1000, hp: 120 },
      { id: 'armor_regen', name: 'Trollblood Mail', cost: 2000, hp: 200 },
      { id: 'armor_aegis', name: 'Aegis of the Immortal', cost: 5000, hp: 350 },
      { id: 'armor_dragonscale', name: 'Dragonscale Mail', cost: 7500, hp: 500, tdWinsRequired: 5 },
    ],
    attacks: [
      // Warrior
      { id: 'warrior_power_strike', name: 'Power Strike', cost: 70, class: 'warrior', maxUses: 2, effect: { damageMultiplier: 2.5 }, range: 1.5 },
      { id: 'warrior_whirlwind', name: 'Whirlwind', cost: 120, class: 'warrior', maxUses: 2, effect: { damageMultiplier: 0.8, aoe: 1.5 }, range: 1.5 },
      // Mage
      { id: 'mage_lesser_heal', name: 'Lesser Heal', cost: 20, class: 'mage', maxUses: 2, effect: { heal: 25 }, isSelfTarget: true },
      { id: 'mage_fireball', name: 'Fireball', cost: 100, class: 'mage', maxUses: 2, effect: { damageMultiplier: 1.5, aoe: 1.5 }, range: 4 },
      // Archer
      { id: 'archer_piercing_shot', name: 'Piercing Shot', cost: 60, class: 'archer', maxUses: 2, effect: { damageMultiplier: 1.2, armorPiercing: 0.5 }, range: 5 },
      { id: 'archer_crippling_shot', name: 'Crippling Shot', cost: 40, class: 'archer', maxUses: 2, effect: { damageMultiplier: 0.5, status: { type: 'crippled', duration: 1 } }, range: 5 },
      // Tank
      { id: 'tank_shield_bash', name: 'Shield Bash', cost: 30, class: 'tank', maxUses: 2, effect: { damageMultiplier: 0.7, status: { type: 'stunned', duration: 1, chance: 0.8 } }, range: 1.5 },
      { id: 'tank_lay_on_hands', name: 'Lay on Hands', cost: 40, class: 'tank', maxUses: 2, effect: { heal: 40 }, isSelfTarget: true },
    ],
    temp_potions: [
      { id: 'potion_strength', name: 'Potion of Strength', cost: 75, effect: { attack: 15 }, duration: 3, type: 'temp_potion' },
      { id: 'potion_fortitude', name: 'Potion of Fortitude', cost: 75, effect: { hp: 50 }, duration: 3, type: 'temp_potion' },
      { id: 'potion_wealth', name: 'Potion of Wealth', cost: 100, effect: { goldBonus: 0.1 }, duration: 3, type: 'temp_potion' },
    ],
        enemies: [
      { id: 'goblin', name: 'Goblin', combatStyle: 'Martial', hp: 20, atk: 5, minFloor: 1, loot: { id: 'goblin_ear', chance: 0.1 }, moveRange: 1, attackRange: 1.5, ai: 'standard' },
      { id: 'skeleton', name: 'Skeleton', combatStyle: 'Martial', hp: 35, atk: 8, minFloor: 1, loot: { id: 'skeleton_bone', chance: 0.15 }, rareLoot: { id: 'ingredientSkull', chance: 0.05 }, moveRange: 1, attackRange: 1.5, ai: 'standard' },
      { id: 'bat', name: 'Giant Bat', combatStyle: 'Finesse', hp: 15, atk: 6, minFloor: 2, dodgeChance: 0.33, loot: { id: 'ingredientBeak', chance: 0.2 }, moveRange: 2, attackRange: 1.5, ai: 'standard' },
      { id: 'slime', name: 'Slime', combatStyle: 'Martial', hp: 40, atk: 7, minFloor: 3, onDefeat: { type: 'split', into: 'ooze', count: 2 }, moveRange: 1, attackRange: 1.5, ai: 'standard', moveFrequency: 2, moveChance: 0.5 },
      { id: 'ooze', name: 'Ooze', combatStyle: 'Martial', hp: 20, atk: 5, minFloor: 3, moveRange: 1, attackRange: 1.5, ai: 'standard' },
      { id: 'skeleton_archer', name: 'Skeleton Archer', combatStyle: 'Finesse', hp: 25, atk: 10, minFloor: 4, isRanged: true, moveRange: 1, attackRange: 5, ai: 'ranged' },
      { id: 'cultist', name: 'Cultist', combatStyle: 'Arcane', hp: 30, atk: 12, minFloor: 5, isRanged: true, moveRange: 1, attackRange: 4, ai: 'ranged' },
      { id: 'shadow', name: 'Shadow', combatStyle: 'Finesse', hp: 50, atk: 12, minFloor: 6, abilities: [{ type: 'invisible', chance: 0.25, duration: 1 }], loot: { id: 'shadow_essence', chance: 0.25 }, moveRange: 1, attackRange: 1.5, ai: 'cowardly' },
      { id: 'golem', name: 'Stone Golem', combatStyle: 'Martial', hp: 80, atk: 15, minFloor: 8, armor: 5, loot: { id: 'golem_heart', chance: 0.5 }, moveRange: 1, attackRange: 1.5, ai: 'standard', moveFrequency: 2, moveChance: 0.33 },
      { id: 'keyholder_orc', name: 'Orc Keywarden', combatStyle: 'Martial', hp: 50, atk: 12, minFloor: 1, loot: { id: 'ingredientCrown', chance: 1.0 }, moveRange: 1, attackRange: 1.5, ai: 'standard' }
    ],

    bestiary: [
      { 
        id: 'goblin', name: 'Goblin Scavenger',
        icon: (
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <div className="w-10 h-10 text-lime-400 drop-shadow-lg" dangerouslySetInnerHTML={{ __html: `<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' x='0px' y='0px' viewBox='0 0 296.169 488.008' style='enable-background:new 0 0 296.169 488.008;' xml:space='preserve'><g fill="currentColor"><path d='M251.239,469.32l-15.584-6.922c-9.972-4.428-16.415-14.34-16.415-25.25v-26.795l-4.806,6.929   c-0.624,0.899-1.589,1.504-2.67,1.673c-1.086,0.169-2.185-0.112-3.053-0.779l-13.507-10.367l-11.098,13.85   c-0.71,0.887-1.763,1.429-2.896,1.493c-0.075,0.004-0.15,0.006-0.225,0.006c-1.055,0-2.07-0.417-2.822-1.165l-7.589-7.555   c1.909,14.146,4.522,36.294,3.186,42.971c-1.199,6.003-4.935,10.723-7.857,13.624c-1.914,1.901-2.969,4.37-2.969,6.952v0.399   c0,5.307,4.316,9.623,9.623,9.623h74.717c5.384,0,9.765-4.381,9.765-9.765C257.04,474.388,254.763,470.885,251.239,469.32z'/><path d='M167.754,400.341l12.896,12.839l10.762-13.43c1.358-1.7,3.829-2,5.557-0.672l13.284,10.196l9.7-13.986   c1.229-1.774,3.645-2.25,5.454-1.083l12.877,8.302l-15.488-61.351c-8.171-2.333-39.195-10.461-74.712-10.461   s-66.541,8.128-74.712,10.461l-15.488,61.351l12.877-8.302c1.809-1.167,4.224-0.691,5.454,1.083l9.7,13.986l13.284-10.196   c1.727-1.325,4.195-1.028,5.557,0.672l10.762,13.43l12.896-12.839c1.535-1.526,4.007-1.555,5.575-0.067l14.094,13.371   l14.094-13.371C163.749,398.786,166.22,398.814,167.754,400.341z'/><path d='M184.558,185.718c4.238-3.44,6.349-7.709,6.471-13.098c-2.208,0.679-4.517,1.039-6.88,1.039h-6.15   C178.914,178.902,181.067,182.899,184.558,185.718z'/><path d='M105.141,172.62c0.122,5.389,2.233,9.658,6.471,13.098c3.491-2.819,5.643-6.816,6.558-12.059h-6.15   C109.658,173.659,107.349,173.299,105.141,172.62z'/><path d='M172.128,239.8c21.341-8.008,38.856-24.864,46.748-38.017c2.561-4.269,4.979-9.923,7.186-16.808   c0.521-1.625,2.014-2.74,3.72-2.778c0.176-0.005,19.033-0.736,32.733-17.494c6.763-8.273,11.313-24.152,16.131-40.963   c4.774-16.659,9.689-33.807,17.523-47.553c-9.123,0.363-24.585,1.612-33.313,5.854c-10.613,5.158-17.107,15.558-18.826,18.58   c0.225,4.692,0.307,9.315,0.275,13.822c7.071-9.418,16.194-17.063,27.27-22.812c1.959-1.018,4.375-0.255,5.393,1.707   c1.019,1.961,0.254,4.375-1.707,5.393c-13.503,7.011-23.785,17.119-30.6,30.077c2.855,3.123,7.362,9.247,7.706,17.066   c0.506,11.487-8.201,18.826-8.571,19.133c-0.746,0.617-1.649,0.918-2.548,0.918c-1.15,0-2.293-0.494-3.084-1.45   c-1.408-1.702-1.17-4.224,0.532-5.632c0.044-0.037,6.006-5.174,5.679-12.617c-0.338-7.687-7.096-13.495-7.164-13.553   c-0.986-0.835-1.478-2.072-1.405-3.307l-0.014-0.001c2.049-33.403-0.863-78.914-26.371-106.034C194.859,7.85,174.224,0,148.085,0   s-46.774,7.85-61.336,23.332c-25.508,27.12-28.42,72.631-26.371,106.034l-0.011,0.001c0.076,1.241-0.419,2.483-1.42,3.317   c-0.057,0.048-6.814,5.856-7.152,13.543c-0.327,7.434,5.618,12.567,5.679,12.617c1.702,1.408,1.94,3.93,0.532,5.632   c-0.791,0.956-1.934,1.45-3.084,1.45c-0.898,0-1.802-0.301-2.548-0.918c-0.37-0.307-9.077-7.646-8.571-19.133   c0.344-7.819,4.851-13.943,7.706-17.066c-6.814-12.958-17.097-23.066-30.6-30.077c-1.961-1.018-2.726-3.432-1.707-5.393   c1.018-1.962,3.433-2.726,5.393-1.707c11.076,5.749,20.199,13.394,27.27,22.812c-0.032-4.507,0.049-9.13,0.275-13.823   c-1.714-3.013-8.209-13.419-18.826-18.579C24.575,77.794,9.119,76.547,0,76.186c7.835,13.747,12.749,30.894,17.524,47.555   c4.817,16.811,9.368,32.689,16.131,40.963c13.7,16.758,32.558,17.489,32.746,17.494c1.696,0.049,3.189,1.162,3.708,2.778   c2.206,6.885,4.624,12.539,7.185,16.808c7.894,13.154,25.41,30.011,46.752,38.018c2.068,0.776,3.116,3.082,2.34,5.15   c-0.603,1.605-2.127,2.596-3.746,2.596c-0.467,0-0.941-0.082-1.404-0.256c-9.799-3.676-18.859-9.09-26.707-15.197   c-16.247,13.932-32.635,39.116-45.308,69.772c-11.578,28.011-17.818,55.527-15.528,68.472c2.016,11.389,12.201,19.56,18.145,23.448   l29.308-116.096c0.54-2.142,2.71-3.442,4.857-2.898c2.142,0.54,3.439,2.715,2.898,4.857l-13.273,52.58   c12.399-3.27,40.336-9.533,72.458-9.533s60.059,6.263,72.458,9.533l-13.273-52.58c-0.541-2.143,0.757-4.317,2.898-4.857   c2.147-0.541,4.318,0.758,4.857,2.898l29.308,116.096c5.943-3.886,16.129-12.058,18.146-23.448   c2.29-12.944-3.95-40.461-15.528-68.472c-12.673-30.655-29.061-55.84-45.308-69.772c-7.847,6.106-16.905,11.519-26.703,15.196   c-0.463,0.174-0.938,0.256-1.404,0.256c-1.619,0-3.144-0.99-3.746-2.596C169.012,242.882,170.06,240.576,172.128,239.8z    M154.666,118.55c1.283-1.798,3.781-2.216,5.58-0.93l2.487,1.776c1.803,1.288,4.139,1.442,6.097,0.405l31.628-16.777   c1.95-1.038,4.373-0.292,5.407,1.659c1.035,1.951,0.293,4.372-1.659,5.407l-31.628,16.777c-2.047,1.086-4.269,1.623-6.48,1.623   c-2.815,0-5.613-0.87-8.015-2.585l-2.486-1.776C153.799,122.847,153.382,120.348,154.666,118.55z M192.632,141.16   c0,4.1-3.323,7.423-7.423,7.423c-4.1,0-7.423-3.323-7.423-7.423s3.323-7.423,7.423-7.423   C189.308,133.737,192.632,137.061,192.632,141.16z M90.305,104.684c1.034-1.951,3.456-2.697,5.407-1.659l31.628,16.777   c1.96,1.037,4.294,0.883,6.097-0.405l2.487-1.776c1.798-1.283,4.296-0.868,5.58,0.93s0.867,4.297-0.931,5.58l-2.487,1.776   c-2.4,1.715-5.199,2.585-8.014,2.585c-2.212,0-4.434-0.536-6.48-1.623l-31.628-16.777C90.012,109.056,89.27,106.635,90.305,104.684   z M118.402,141.16c0,4.1-3.323,7.423-7.423,7.423s-7.423-3.323-7.423-7.423s3.323-7.423,7.423-7.423   S118.402,137.061,118.402,141.16z M126.284,173.659c-1.268,9.254-5.515,16.104-12.667,20.389c-0.634,0.379-1.345,0.568-2.056,0.568   c-0.761,0-1.52-0.217-2.183-0.647c-9.064-5.901-13.184-14.666-12.033-25.453l-5.24-3.841c-1.782-1.307-2.168-3.81-0.862-5.591   c1.308-1.783,3.813-2.168,5.591-0.862l6.084,4.459c2.659,1.948,5.807,2.979,9.103,2.979h72.129c3.296,0,6.443-1.03,9.103-2.979   l6.084-4.459c1.78-1.303,4.284-0.92,5.591,0.862c1.306,1.781,0.92,4.284-0.862,5.591l-5.24,3.841   c1.151,10.787-2.969,19.552-12.033,25.453c-0.663,0.431-1.423,0.647-2.183,0.647c-0.711,0-1.422-0.189-2.056-0.568   c-7.152-4.285-11.399-11.135-12.667-20.389H126.284z'/><path d='M122.407,457.408c-1.335-6.676,1.278-28.823,3.187-42.97l-7.589,7.555c-0.805,0.8-1.907,1.211-3.047,1.159   c-1.134-0.064-2.187-0.606-2.896-1.493l-11.098-13.85l-13.507,10.367c-0.868,0.666-1.969,0.947-3.053,0.779   c-1.081-0.169-2.046-0.773-2.67-1.673l-4.806-6.929v26.795c0,10.91-6.443,20.822-16.414,25.25l-15.585,6.921   c-3.523,1.565-5.801,5.068-5.801,8.924c0,5.384,4.381,9.765,9.765,9.765h74.717c5.307,0,9.623-4.316,9.623-9.623v-0.399   c0-2.582-1.055-5.051-2.969-6.951C127.343,468.132,123.607,463.412,122.407,457.408z'/></g></svg>` }} />
          </div>
        ),
        description: 'Vicious and cowardly creatures that swarm the upper floors. They often travel in packs, overwhelming unsuspecting adventurers with sheer numbers.',
        abilities: 'A standard melee attacker. Weak alone, but can be dangerous in groups.'
      },
      { 
        id: 'skeleton', name: 'Skeleton',
        icon: (
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <div className="w-10 h-10 text-slate-300 drop-shadow-lg" dangerouslySetInnerHTML={{ __html: `<svg xmlns='http://www.w3.org/2000/svg' version='1.1' viewBox='-5.0 -10.0 110.0 135.0' fill="currentColor"> <path d='m55.238 20.16c1.2539-0.79297 2.207-1.9844 2.7109-3.3828 0.47656-1.3789 0.44531-2.8867-0.089844-4.2461-0.58203-1.4375-1.6172-2.6445-2.9492-3.4414-3.0234-1.8164-6.7969-1.8164-9.8203 0-1.332 0.79297-2.3672 2.0039-2.9492 3.4414-0.51172 1.332-0.50781 2.8086 0.003906 4.1406 0.57812 1.4648 1.6172 2.7031 2.957 3.5352 0.39063 0.25 0.625 0.67969 0.625 1.1445v2.918c0 0.011719 0.003907 0.019531 0.011719 0.027344 0.0625 0.046875 0.13672 0.070313 0.21484 0.066406h8.4219c0.050781 0.007813 0.10547-0.007812 0.14453-0.039062h0.007813c0.007812-0.011719 0.011718-0.03125 0.007812-0.050781v-2.9219c0-0.49609 0.26953-0.94922 0.70312-1.1914zm5.2812-2.5h-0.003906c-0.61719 1.7617-1.75 3.293-3.25 4.4023v2.2109-0.003907c0.003906 0.76562-0.30859 1.4961-0.86328 2.0234-0.54688 0.51562-1.2734 0.80469-2.0234 0.80078h-2.9492v1.2539l14.023-0.003906c0.58203 0 1.1016 0.37109 1.2891 0.92578l4.418 13 4.1289 4.5742c1.5664-0.42969 3.2188-0.42578 4.7852 0.011719 1.8789 0.53125 3.5352 1.6562 4.7266 3.207 0.43359 0.59375 0.31641 1.4297-0.26562 1.8789-0.58594 0.44922-1.4219 0.35547-1.8867-0.21875-0.83594-1.0859-1.9961-1.875-3.3164-2.25-0.85938-0.24219-1.7578-0.29297-2.6406-0.15625l1.0273 2.5664c0.16016 0.33594 0.17578 0.72656 0.039062 1.0781-0.13672 0.34766-0.41016 0.625-0.75781 0.76562-0.35156 0.14063-0.74219 0.13281-1.082-0.027343-0.33984-0.15625-0.60156-0.44922-0.71875-0.80469l-1.5-3.75-4.7461-5.2617c-0.13281-0.14844-0.23438-0.32422-0.29297-0.51172l-4.1797-12.301h-13.051v3.1094h11.234c0.75391 0 1.3672 0.60937 1.3672 1.3633 0 0.75391-0.61328 1.3633-1.3672 1.3633h-11.234v2.9766h8.3164c0.37109-0.011718 0.72656 0.12891 0.98828 0.38672 0.26562 0.25391 0.41406 0.60938 0.41406 0.97656 0 0.36719-0.14844 0.71875-0.41406 0.97656-0.26172 0.25781-0.61719 0.39453-0.98828 0.38672h-8.3164v2.9766h5.5352c0.36719-0.011719 0.72266 0.12891 0.98828 0.38672 0.26172 0.25391 0.41016 0.60938 0.41016 0.97656 0 0.36719-0.14844 0.71875-0.41016 0.97656-0.26562 0.25781-0.62109 0.39453-0.98828 0.38672h-5.5352v3.7578l4.3203-1.8711c1.7695-0.80078 3.8555-0.24219 4.9922 1.3359 1.1328 1.5742 0.99609 3.7344-0.32422 5.1562-0.80469 1.0078-1.4297 2.1484-1.8477 3.3711-0.43359 1.3008-0.64844 2.6641-0.64062 4.0352 0 0.042969 0 0.085938-0.007813 0.12891-0.011719 0.71484-0.22656 1.4141-0.625 2.0117-0.34766 0.51562-0.81641 0.94141-1.3633 1.2383l-0.12891 0.066407 2.8828 12.258c0.050781 0.21875 0.046875 0.44922-0.011719 0.66797l-2.4297 11.801h2.4414c0.36719-0.011719 0.72266 0.12891 0.98828 0.38672 0.26172 0.25391 0.41406 0.60938 0.41406 0.97656 0 0.36719-0.15234 0.71875-0.41406 0.97656-0.26562 0.25781-0.62109 0.39844-0.98828 0.38672h-4.1133c-0.089844 0-0.17969-0.007813-0.26953-0.027344-0.73438-0.15234-1.207-0.86719-1.0625-1.6016l2.7227-13.23-2.8984-12.336c-0.38281-0.10938-0.74219-0.27734-1.0742-0.49609l-0.085938-0.0625-0.51953-0.35547 0.003906 0.003906c-0.78906-0.48047-1.7812-0.46875-2.5586 0.023437l-0.69922 0.42578c-0.28906 0.1875-0.59766 0.33594-0.92578 0.4375l-2.9062 12.355 2.7227 13.23c0.14844 0.73438-0.32422 1.4531-1.0586 1.6016-0.089844 0.019531-0.17969 0.027344-0.27344 0.027344h-4.1133c-0.36719 0.011718-0.72266-0.12891-0.98828-0.38672-0.26562-0.25391-0.41406-0.60938-0.41406-0.97656 0-0.36719 0.14844-0.71875 0.41406-0.97656 0.26562-0.25781 0.62109-0.39453 0.98828-0.38672h2.4414l-2.4297-11.801c-0.058594-0.21875-0.0625-0.44922-0.011719-0.66797l2.8711-12.203c-0.078125-0.035156-0.15625-0.074219-0.23438-0.11719h0.003906c-0.55469-0.30078-1.0273-0.73047-1.3789-1.25-0.41797-0.63281-0.64062-1.375-0.62891-2.1328h-0.011719c0.003906-1.3398-0.22656-2.6719-0.67578-3.9336l-0.019532-0.0625v0.003906c-0.45312-1.2383-1.1016-2.3906-1.9258-3.4141-1.3242-1.4258-1.457-3.582-0.32422-5.1602 1.1367-1.5742 3.2227-2.1328 4.9922-1.332l4.4531 1.9336v-3.8164h-5.3984c-0.36719 0.011719-0.72656-0.12891-0.98828-0.38672-0.26562-0.25391-0.41406-0.60938-0.41406-0.97656 0-0.36719 0.14844-0.71875 0.41406-0.97656 0.26172-0.25781 0.62109-0.39844 0.98828-0.38672h5.3984v-2.9766h-8.1836c-0.36719 0.011719-0.72266-0.12891-0.98828-0.38672-0.26172-0.25391-0.41016-0.60938-0.41016-0.97656 0-0.36719 0.14844-0.71875 0.41016-0.97656 0.26562-0.25781 0.62109-0.39844 0.98828-0.38672h8.1836v-2.9766h-11.098c-0.75391 0-1.3672-0.60938-1.3672-1.3633 0-0.75391 0.61328-1.3633 1.3672-1.3633h11.098v-3.1094h-12.914l-4.1914 12.336c-0.058594 0.17578-0.15234 0.33594-0.27734 0.47656l-4.7695 5.2812-1.6289 3.7617c-0.13672 0.33984-0.40234 0.60547-0.74219 0.74609-0.33984 0.13672-0.71875 0.13672-1.0547-0.007813-0.33594-0.14844-0.59766-0.42187-0.73047-0.76172-0.12891-0.33984-0.11719-0.72266 0.035156-1.0547l1.1016-2.5352c-0.92578-0.13281-1.8672-0.074219-2.7656 0.17188-1.3516 0.35547-2.5469 1.1406-3.4141 2.2383-0.46875 0.55078-1.2891 0.63672-1.8633 0.19141-0.57422-0.44141-0.69922-1.2578-0.28516-1.8516 1.2266-1.5703 2.9297-2.6953 4.8516-3.2109 1.6133-0.4375 3.3125-0.44141 4.9297-0.007812l4.1289-4.5742 4.3906-12.918c0.16016-0.59375 0.69922-1.0078 1.3164-1.0078h13.883v-1.25h-2.7461c-0.75391-0.003906-1.4844-0.28516-2.0469-0.79297-0.57422-0.51953-0.90625-1.2578-0.90625-2.0312v-2.207c-1.5352-1.125-2.7148-2.668-3.3984-4.4453-0.74609-1.9492-0.74609-4.1055 0.003907-6.0547 0.79297-1.9961 2.2109-3.6758 4.0469-4.7852 3.9023-2.3711 8.7969-2.3711 12.699 0 1.8359 1.1094 3.2578 2.7891 4.0469 4.7852 0.76562 1.9531 0.80859 4.1133 0.125 6.0977zm-6.4492 47.559h-0.003906 0.13672c0.15234-0.015625 0.29688-0.058594 0.42969-0.13281 0.16016-0.085938 0.29688-0.21094 0.39844-0.36328 0.10547-0.16016 0.16797-0.33984 0.17969-0.53125v-0.10156 0.003906c-0.007813-1.6719 0.26172-3.3281 0.79297-4.9102 0.51953-1.5352 1.3047-2.9609 2.3203-4.2227 0.027343-0.039063 0.058593-0.074219 0.089843-0.10547 0.44922-0.47266 0.50391-1.1953 0.12891-1.7227-0.375-0.53125-1.0742-0.72266-1.668-0.45703l-4.875 2.1172c-0.59375 0.25781-1.2266 0.39844-1.8711 0.41406h-0.11719c-0.65625 0-1.3086-0.13281-1.9141-0.38281l-0.085937-0.03125-4.8711-2.1172h0.003906c-0.59375-0.26953-1.2969-0.082031-1.6719 0.44922-0.375 0.53516-0.32031 1.2578 0.12891 1.7266l0.074219 0.085938c1.0312 1.2695 1.8398 2.7031 2.4023 4.2383l0.027344 0.066407h-0.003907c0.55469 1.5586 0.83984 3.1953 0.83594 4.8477v0.015625c-0.003906 0.21484 0.058594 0.42188 0.17578 0.60156 0.20703 0.30469 0.54297 0.49609 0.91016 0.51953h0.125c0.18359-0.015624 0.35937-0.074218 0.50781-0.17187l0.070312-0.046876 0.64453-0.38672c1.6758-1.0859 3.8359-1.0938 5.5195-0.019532l0.078125 0.050782 0.48828 0.33594 0.0625 0.039063c0.16406 0.11328 0.35938 0.17969 0.55859 0.1875zm-6.25-51.438c0 0.20312-0.078124 0.39453-0.22266 0.53906-0.30078 0.27734-0.76562 0.26563-1.0547-0.023437-0.28906-0.28906-0.29688-0.75781-0.019531-1.0547 0.21875-0.21875 0.54687-0.28516 0.83203-0.16797 0.28516 0.11719 0.46875 0.39844 0.46875 0.70312zm1.707-2.4648c0.17969 0.17969 0.33594 0.37891 0.47266 0.58984 0.13672-0.21094 0.29297-0.41016 0.47266-0.58984 1.3242-1.3242 3.4609-1.3633 4.832-0.082031l0.09375 0.085937v-0.003906c0.65234 0.65234 1.0195 1.5391 1.0195 2.4648 0 0.92188-0.36719 1.8086-1.0195 2.4609-0.65234 0.65234-1.5391 1.0234-2.4609 1.0234s-1.8086-0.37109-2.4609-1.0234h-0.007812 0.003906c-0.17969-0.17969-0.33594-0.375-0.47266-0.58594-0.13672 0.21484-0.29688 0.41016-0.47656 0.58984-0.64844 0.67188-1.543 1.0508-2.4766 1.0586-0.93359 0.007812-1.8281-0.35938-2.4883-1.0195s-1.0273-1.5586-1.0195-2.4922c0.007813-0.93359 0.39063-1.8242 1.0625-2.4766 0.65234-0.65234 1.5352-1.0195 2.4609-1.0195 0.92188 0 1.8086 0.36719 2.4609 1.0195zm-1.9727 9.7695 1.3008-2.3359-0.003907 0.003906c0.22266-0.44531 0.66406-0.73047 1.1602-0.75 0.49219-0.023437 0.96094 0.22656 1.2188 0.64844l1.4062 2.3008c0.29688 0.41406 0.33594 0.96094 0.10156 1.4141-0.23047 0.45703-0.69922 0.74219-1.2109 0.74219h-2.7891c-0.48047 0-0.92578-0.25391-1.168-0.67188-0.24609-0.41406-0.25391-0.92578-0.019531-1.3477zm6.1445-7.3047c0.007812 0.20703-0.066407 0.40625-0.21094 0.55469-0.14453 0.14844-0.33984 0.23437-0.54688 0.23437-0.20703 0-0.40234-0.085937-0.54688-0.23437-0.14062-0.14844-0.21875-0.34766-0.21094-0.55469 0-0.19922 0.078125-0.39453 0.22266-0.53516 0.28125-0.27734 0.73047-0.29297 1.0352-0.039063l0.039063 0.039063c0.14062 0.14453 0.21875 0.33594 0.21875 0.53516z' fill-rule='evenodd'/></svg>` }} />
          </div>
        ),
        description: 'The reanimated bones of fallen warriors, cursed to guard the dungeon for eternity. They feel no pain and know no fear, marching endlessly.',
        abilities: 'Slightly tougher than a Goblin. Their bony forms make them resilient, but they are slow to react.'
      },
      {
        id: 'bat', name: 'Giant Bat',
        icon: (
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <div className="w-10 h-10 text-slate-500 drop-shadow-lg" dangerouslySetInnerHTML={{ __html: `<svg xmlns='http://www.w3.org/2000/svg' version='1.1' viewBox='-5.0 -10.0 110.0 135.0' fill="currentColor"> <path d='m37.23 47.188 3.1719-1.1875c-0.26172 0.89844-0.625 1.4727-1.0781 1.6562-0.47656 0.19922-1.1953 0.035156-2.0938-0.46875zm-25.234 5.9375c0.43359 12.23 5.918 18.414 15.617 24.461-0.4375-1.9297-0.14062-3.9844 0.90625-5.832 1.1953-2.1094 3.168-3.5469 5.5-4.125-10.414-4.6992-17.672-9.4727-22.023-14.504zm25.621 4.3555c-0.625-0.5-1.2344-1.0312-1.8164-1.6172-1.4688-1.4648-2.7148-3.1406-3.6719-4.9141-8.8516 3.4492-13.875 0.35938-21.977-4.6797-4.6328 4.9258-5.2617 11.918-4.9531 17.008 0.6875 11.328 6.668 24.504 14.062 31.59-0.67969-4.1406-0.12891-7.6992 1.6406-10.414 1.4219-2.1875 3.6172-3.793 6.3164-4.6641-4.5703-2.7773-9.125-6.0273-12.363-10.613-3.5508-5.0352-5.168-11.301-4.9453-19.152 0.015625-0.45313 0.31641-0.84375 0.75391-0.96875 0.4375-0.12891 0.90234 0.046874 1.1562 0.42187 3.7969 5.7188 11.52 11.117 23.582 16.5-0.34766-1.4609-0.36328-3.0117-0.015625-4.4844 0.37891-1.6172 1.1641-3.0117 2.2305-4.0117zm25.652-52.281c-5.0898-0.30859-12.082 0.32422-17.008 4.9531 5.0391 8.1055 8.1289 13.129 4.6797 21.98 1.7773 0.95703 3.4492 2.2031 4.918 3.668 0.57812 0.58203 1.1133 1.1875 1.6172 1.8164 1.0039-1.0625 2.3945-1.8477 4-2.2266 1.6055-0.37891 3.3086-0.32422 4.8828 0.12109-5.4297-12.258-10.883-20.094-16.652-23.93-0.375-0.25-0.54688-0.71875-0.42578-1.1562 0.12891-0.43359 0.51953-0.73828 0.96875-0.75 7.8594-0.22266 14.121 1.3906 19.156 4.9453 4.5273 3.1953 7.7578 7.6758 10.516 12.191 0.89844-2.5117 2.4453-4.5547 4.5234-5.9062 2.7148-1.7656 6.2734-2.3164 10.414-1.6367-7.082-7.3984-20.262-13.375-31.59-14.07zm-9.9023 6.5547c4.9961 4.3203 9.7305 11.496 14.391 21.777 0.65234-2.1172 2.0312-3.8945 3.9922-5.0078 1.9922-1.1328 4.2344-1.3867 6.3008-0.78906-6.1172-9.9219-12.305-15.539-24.684-15.98zm6.207 35.828c0.39844 3.625-0.62109 6.8672-2.875 9.1211-4.7227 4.7227-13.438 3.6875-19.43-2.3047-1.8203-1.8203-3.2578-3.9844-4.1602-6.2578-0.058594-0.14844-0.14844-0.28516-0.27344-0.39062-2.3555-2.1016-4.7148-5.25-7.0156-9.3672 2.1211 0.17188 3.8945 0.58594 5.2891 1.2422 0.26953 0.125 0.58203 0.12891 0.85938 0.007812 0.27344-0.12109 0.48438-0.35156 0.57422-0.64062 0.49609-1.5547 1.3086-2.9062 2.4219-4.0273 1.1172-1.1133 2.4688-1.9297 4.0312-2.4219 0.28516-0.089844 0.51562-0.30078 0.63672-0.57422 0.12109-0.27734 0.11719-0.58984-0.011718-0.85938-0.64844-1.3945-1.0625-3.168-1.2344-5.2891 4.1133 2.3008 7.2578 4.6602 9.3633 7.0156 0.10547 0.12109 0.24219 0.21484 0.39453 0.27344 2.2734 0.90234 4.4336 2.3438 6.2539 4.1602 2.9258 2.9375 4.7656 6.5938 5.1758 10.312zm-16.773-3.082c0.042969-0.35938-0.10547-0.71484-0.39453-0.9375-0.28516-0.22266-0.66406-0.28125-1.0039-0.15234l-6.7734 2.5273c-0.35156 0.13281-0.60547 0.44141-0.66406 0.8125s0.085937 0.74219 0.38281 0.97656c1.7617 1.3984 3.2578 2.0898 4.5391 2.0898 0.4375 0 0.85156-0.078125 1.2383-0.23828 1.4844-0.61328 2.3555-2.2734 2.6758-5.0781zm0.75781-2.0898c0.20312 0.25391 0.50391 0.39844 0.82031 0.39844 0.039063 0 0.078125 0 0.12109-0.003906 2.8008-0.32031 4.4648-1.1953 5.0781-2.6758 0.63281-1.5273 0.027344-3.4141-1.8516-5.7773-0.23047-0.29297-0.60547-0.4375-0.97656-0.37891s-0.67969 0.3125-0.8125 0.66406l-2.5273 6.7734c-0.13281 0.33594-0.074218 0.71484 0.14844 1zm11.906 1.5742c-0.53516-0.21094-1.1367 0.054687-1.3516 0.58594-1.6133 4.0977-5.4492 7.9336-9.5391 9.543-0.53516 0.21094-0.79688 0.81641-0.58984 1.3477 0.16406 0.41406 0.55859 0.66016 0.96875 0.66016 0.12891 0 0.25391-0.023438 0.38281-0.074219 1.0078-0.39453 2-0.91406 2.957-1.5312l1.1992 1.1992c0.20703 0.20703 0.46875 0.30469 0.73828 0.30469 0.26562 0 0.53125-0.097656 0.73438-0.30469 0.41016-0.40234 0.41016-1.0625 0-1.4688l-0.96484-0.96484c1.2031-0.96484 2.3164-2.0781 3.2891-3.2812l0.96094 0.96484c0.20312 0.20312 0.46875 0.30469 0.73438 0.30469 0.26953 0 0.53125-0.10156 0.73828-0.30469 0.40234-0.41016 0.40234-1.0625 0-1.4727l-1.2031-1.1992c0.61719-0.95703 1.1328-1.9492 1.5312-2.9609 0.20703-0.53125-0.054687-1.1367-0.58594-1.3477zm-7.8086-4.6523c0.19922-0.47656 0.03125-1.1992-0.46875-2.0977l-1.1836 3.1758c0.89844-0.26562 1.4648-0.63281 1.6523-1.0781z'/></svg>` }} />
          </div>
        ),
        description: 'Erratic creatures of the dark. Their rapid, unpredictable movements make them difficult to hit, but they are fragile if a blow connects.',
        abilities: 'Low health, but has a 33% chance to completely dodge an incoming attack.'
      },
      {
        id: 'slime', name: 'Corrosive Slime',
        icon: (
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <div className="w-10 h-10 text-green-400 drop-shadow-lg" dangerouslySetInnerHTML={{ __html: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 75' x='0px' y='0px' fill="currentColor"><path d='M51.525,49.463C49.089,48.476,45,46.064,45,41V28a10.986,10.986,0,0,0-4-8.479V13.315a7,7,0,1,0-6,0v3.736c-.33-.03-.662-.051-1-.051H26c-.338,0-.67.021-1,.051V13.315a7,7,0,1,0-6,0v6.206A10.986,10.986,0,0,0,15,28V41c0,5.063-4.088,7.476-6.527,8.464a4.045,4.045,0,0,0-.07,7.424C11.091,58.05,17.472,60,30,60s18.909-1.95,21.6-3.113a4.046,4.046,0,0,0-.075-7.424ZM38,2a4.977,4.977,0,0,1,3.974,2H34.026A4.977,4.977,0,0,1,38,2Zm1,5a1,1,0,1,1-1-1A1,1,0,0,1,39,7ZM33,7a5,5,0,0,1,.1-1h2.083A2.966,2.966,0,0,0,35,7a3,3,0,0,0,6,0,2.966,2.966,0,0,0-.184-1H42.9A5,5,0,1,1,33,7Zm4,6.92a6.29,6.29,0,0,0,2,0v4.294a10.9,10.9,0,0,0-2-.787ZM22,2a4.977,4.977,0,0,1,3.974,2H18.026A4.977,4.977,0,0,1,22,2Zm1,5a1,1,0,1,1-1-1A1,1,0,0,1,23,7ZM17,7a5,5,0,0,1,.1-1h2.083A2.966,2.966,0,0,0,19,7a3,3,0,0,0,6,0,2.966,2.966,0,0,0-.184-1H26.9A5,5,0,1,1,17,7Zm4,6.92a6.29,6.29,0,0,0,2,0v3.507a10.9,10.9,0,0,0-2,.787ZM50.8,55.052C48.257,56.153,42.168,58,30,58S11.743,56.153,9.2,55.053a2.046,2.046,0,0,1,.026-3.737A13.721,13.721,0,0,0,15,47.105V52a1,1,0,0,0,2,0V28a9.01,9.01,0,0,1,9-9h8a9.01,9.01,0,0,1,9,9V52a1,1,0,0,0,2,0v-4.9a13.707,13.707,0,0,0,5.773,4.21,2.047,2.047,0,0,1,.031,3.737Z'/><path d='M27,44a3,3,0,1,0-3,3A3,3,0,0,0,27,44Zm-3,1a1,1,0,1,1,1-1A1,1,0,0,1,24,45Z'/><path d='M30,47a4,4,0,1,0,4,4A4,4,0,0,0,30,47Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,30,53Z'/><path d='M37,42a3,3,0,1,0,3,3A3,3,0,0,0,37,42Zm0,4a1,1,0,1,1,1-1A1,1,0,0,1,37,46Z'/><path d='M21.553,28.9A7.278,7.278,0,0,0,23,29.361V32a7,7,0,0,0,14,0V29.361a7.278,7.278,0,0,0,1.447-.466,1,1,0,0,0,.448-1.328,1.009,1.009,0,0,0-1.331-.467c-.019.008-1.987.9-7.564.9-5.517,0-7.5-.872-7.563-.9a1,1,0,0,0-.884,1.794ZM35,32a5,5,0,0,1-10,0V29.715c.582.076,1.24.144,2,.193V32a2,2,0,0,0,2,2h2a2,2,0,0,0,2-2V29.908c.76-.049,1.418-.117,2-.193Zm-4-2.01V32H29V29.99c.322.006.653.01,1,.01S30.678,30,31,29.99Z'/></svg>` }} />
          </div>
        ),
        description: 'A gelatinous blob that patrols the damp corridors. It seems simple, but its form is unstable and can break apart under stress.',
        abilities: 'When defeated, it splits into two smaller "Ooze" enemies in adjacent tiles.'
      },
      {
        id: 'skeleton_archer', name: 'Skeleton Archer',
        icon: (
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <div className="w-10 h-10 text-slate-400 drop-shadow-lg" dangerouslySetInnerHTML={{ __html: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill="currentColor"><g><path d='M57.8,35.1c3.9,0,7.1-3.2,7.1-7.1s-3.2-7.1-7.1-7.1s-7.1,3.2-7.1,7.1S53.9,35.1,57.8,35.1z M57.8,23.9 c2.3,0,4.1,1.8,4.1,4.1s-1.8,4.1-4.1,4.1s-4.1-1.8-4.1-4.1S55.5,23.9,57.8,23.9z'/><path d='M45.1,58.6c0.1,0,0.1,0,0.2,0c0.8,0,1.4-0.6,1.5-1.3c0.4-3.7,2.1-13.9,4.7-17.4c0.3-0.4,0.4-0.9,0.2-1.3 c-0.1-0.5-0.5-0.8-1-1l-22.3-7.6c0.4-1,0.9-2,1.4-2.9c6.2-10.7,18-13.6,18.1-13.6c0.8-0.2,1.3-1,1.1-1.8c-0.2-0.8-1-1.3-1.8-1.1 c-0.5,0.1-13.2,3.2-20,15c-5,8.7-5.5,19.7-1.5,32.8c0.2,0.6,0.8,1.1,1.4,1.1c0.1,0,0.3,0,0.4-0.1c0.8-0.2,1.2-1.1,1-1.9 c-2.9-9.4-3.3-17.7-1.3-24.6l20.6,7c-2.9,5.7-4.2,16.7-4.3,17.2C43.7,57.8,44.3,58.5,45.1,58.6z'/><path d='M63.1,41c-0.1-0.1-0.2-0.1-0.3-0.1c-0.1,0-0.2,0-0.3-0.1h0c0,0,0,0,0,0c-0.7-0.2-1.4,0.2-1.7,0.9 c-0.1,0.3-0.1,0.5,0,0.8c-0.3,1.4-2.9,7.9-3.4,9.2c-2.2,5.1-5.3,8.8-9.6,11.5c-1,0.6-2,1.2-3.1,1.8c-3.4,2-6.8,4-9.7,7.1 c-4.3,4.7-6,11.2-6.6,15.9c-0.1,0.8,0.5,1.6,1.3,1.7c0.1,0,0.1,0,0.2,0c0.7,0,1.4-0.5,1.5-1.3c0.6-4.2,2.1-10.1,5.9-14.3 c2.5-2.7,5.7-4.6,9-6.5c1-0.6,2.1-1.2,3.1-1.9c4.8-3,8.2-7.1,10.7-12.8c1.7-4,2.7-6.6,3.2-8.3c3.3,2,10.3,7.3,10.6,16.4 c0,0.8,0.7,1.5,1.5,1.4c0.8,0,1.5-0.7,1.4-1.5C76.4,48.1,65.1,41.9,63.1,41z'/><path d='M59.6,89.6c0.3,0,0.7-0.1,1-0.3c0.6-0.5,0.7-1.5,0.2-2.1c-7.5-9.1-9-17.6-9-17.7c-0.1-0.8-0.9-1.4-1.7-1.2 c-0.8,0.1-1.4,0.9-1.2,1.7c0.1,0.4,1.6,9.4,9.6,19.2C58.7,89.4,59.1,89.6,59.6,89.6z'/></g></svg>` }} />
          </div>
        ),
        description: 'A more cunning form of undead, this skeleton retains its martial skill with the bow, firing bone-tipped arrows from a distance.',
        abilities: 'A ranged attacker. It will retaliate against your attacks even from several tiles away.'
      },
      {
        id: 'shadow', name: 'Lurking Shadow',
        icon: (
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <div className="w-10 h-10 text-violet-400 drop-shadow-lg" dangerouslySetInnerHTML={{ __html: `<svg xmlns='http://www.w3.org/2000/svg' version='1.1' viewBox='-5.0 -10.0 110.0 135.0' fill="currentColor"> <path d='m45.883 0.10938c-0.43359 0.039063-2.043 0.16797-3.5742 0.28906-2.8359 0.22656-4.3086 0.55469-9.2109 2.043-4.3789 1.332-6.5977 2.3906-12.281 5.8594-2.0859 1.2734-5.9336 4.6797-8.5391 7.5586-1.6484 1.8242-3.7891 4.957-5.8398 8.5391-2.1953 3.8438-4.2539 9.3008-5.7383 15.242-0.69141 2.7617-0.70703 2.918-0.69922 8.0352 0.011719 6.0273 0.085938 6.6211 1.5977 12.637 1.2539 4.9961 2.6367 8.4727 5.0312 12.688 2.1797 3.8398 6.2891 9.0781 9.1992 11.734 1.457 1.3281 6.2812 4.8164 8.9375 6.4609 6.8125 4.2109 13.883 6.918 21.582 8.2578 3.3438 0.58203 8.707 0.72266 12.07 0.3125 5.0703-0.61328 12.66-3.2773 19.535-6.8477l3.5469-2.418 3.4492-3.1914c5.168-5.2695 8.7227-10.152 11.594-15.914 3.7344-7.4922 4.5547-19.875 1.918-28.938-1.793-6.1562-4.7109-10.922-9.5234-15.555-2.5156-2.418-5.1953-5.1836-9.3008-7.3047-1.3789-0.71094-2.2109-0.98047-3.6367-1.5977-1.8984-0.82031-2.918-0.90625-4.875-2.0664-2.2773-1.3516-2.6562-1.7109-2.6562-2.5156 0-0.80859 0.6875-1.5117 2.6211-2.668 5.5508-3.3242 7.8867-4.7578 8.2578-5.0664 0.32422-0.27344 0.39453-0.51562 0.28125-1-0.33203-1.4023-1.4531-1.3125-4.6758 0.375-4.5117 2.3633-12.566 6.2227-16.055 7.6992-1.8711 0.78906-3.5156 1.5234-3.6484 1.625-0.13672 0.10547-2.3594 1.0352-4.9414 2.0703-6.4805 2.5938-9.1367 4.1914-13.539 8.1367-5.0742 4.5547-7.4805 7.9297-9.1797 12.895-1.0742 3.1328-1.3867 5.2305-1.1211 7.4766 0.37109 3.1367 0.89062 5.1445 1.5664 6.0547 0.33984 0.46094 0.79297 1.3984 1.0078 2.0898 0.43359 1.3867 1.0664 2.1914 2.1289 2.6992 0.43359 0.20703 0.75391 0.55078 0.83984 0.90625 0.28516 1.1914 0.37891 1.332 1.0898 1.6445 0.56641 0.25 0.78906 0.52734 0.99219 1.2383 0.35156 1.2109 1.4648 1.9141 3.3281 2.0938l1.3477 0.12891 0.91797-1.0156c2.0195-2.2266 4.293-6.3359 4.7539-8.5898 0.097656-0.49219 0.33984-0.78125 0.84766-1.0195 0.38672-0.18359 1.2227-0.71875 1.8555-1.1914 0.99219-0.74609 1.1953-1.0312 1.5117-2.1133 0.19922-0.69141 0.41016-1.7227 0.46875-2.2969 0.09375-0.95703 0.21094-1.1328 1.4219-2.1562 1.4609-1.2344 4.0547-2.4805 5.5508-2.6719 0.53125-0.066407 1.3984-0.015625 1.9258 0.11719 1.0195 0.25391-0.64453 1.6523-0.14453 3.2031 0.41016 1.2695 1.168 1.9492 2.5391 2.2734l3.1953-0.71875 0.18359 1.125c0.21875 1.3516 0.085937 2.7812-0.29688 3.2109-0.15625 0.17188-0.57812 0.3125-0.94531 0.3125-0.53906 0-0.71875 0.13281-0.98828 0.72656l-0.77734 2.0469-0.45312 1.457c0 0.87109 0.097656 1.0156 1.6602 2.4727 0.91406 0.84766 2.3789 2.1641 3.2578 2.918 1.3242 1.1445 1.6562 1.5664 1.9609 2.5078 1.1328 3.4844 0.98828 9.2773-0.30078 12.062-1.5391 3.3398-4.9883 6.6953-8.6094 8.3789-2.8594 1.332-5.7383 2.0898-8.4688 2.2227-4.3281 0.21484-7.7695-0.43359-14.617-2.7539-6.9922-2.3672-14.957-8.832-19.02-15.434-4.7383-7.707-6.6797-13.961-6.6797-21.539 0-4.2148 0.25391-6.457 1.2422-11.035 0.84375-3.9023 1.4961-5.4883 4.4336-10.754 1.2539-2.2422 2.1641-3.5 4.4609-6.1562 1.5859-1.8398 3.7422-4.0547 4.7891-4.9258 4.8594-4.043 11.695-7.2852 18.387-8.7148 3.8008-0.80859 7.2773-1.2969 9.2617-1.293 2.0234 0 2.6875-0.29688 2.7852-1.2422 0.12109-1.1719-0.21094-1.2617-4.4648-1.2227-2.0586 0.015625-4.0977 0.0625-4.5312 0.10156z' fill-rule='evenodd'/></svg>` }} />
          </div>
        ),
        description: 'A being of pure darkness that flickers and fades in the torchlight. It is hard to keep track of and can vanish from sight entirely.',
        abilities: 'Has a chance each turn to become invisible, making it untargetable for one turn.'
      },
       {
        id: 'golem', name: 'Stone Golem',
        icon: (
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <div className="w-10 h-10 text-stone-500 drop-shadow-lg" dangerouslySetInnerHTML={{ __html: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' fill="currentColor"><path d='M316.18 22.05c-28.8.16-57.27 6.13-85.46 17.92-2.34 12.94-6.77 28.27-16.64 41.56-10.4 13.07-26.07 23.34-50.12 23.3-22.8 26.9-33.58 56.57-32.8 87.37-10.23 9.27-21.48 18.86-33.32 26.92-13.04 9.1-27.1 16.65-42.52 20.65-7.57 14.78-13.3 30.26-16.97 46.21 14.6 2.65 28.5 9.86 38.72 22.05 6.18 7.4 10.32 15.53 12.94 24.03 14.84 1.52 28.74 7.07 40.26 18.1 6.1 5.84 10.88 12.43 14.33 19.56 12.12-1.12 23.28 2.37 33.06 7.7 4.06 2.2 7.82 4.75 11.34 7.56 12.1-5.58 26.28-8.6 43.3-6.62 24.52-25.6 54.84-45.2 88.3-58.82 5.52-26.03 6.95-51.65 4.97-76.22-13.38-6.4-26.7-16.23-39.06-30.26-20.67-23.53-35.57-54.06-46.97-86.33-1.47-2.1-2.8-4.2-4.04-6.27 17.1-2.06 34.08-5.86 50.82-11.5-2.7-4.93-5.3-10.16-7.77-15.7 26.8 2.48 54.08-1.15 81.36-9.9 3.38-4.6 6.7-9.38 9.88-14.36-8.6-14.87-11.64-31.55-10.36-49.63-7.26-.22-14.56-.42-21.84-.36zm106.06 39.16c-6.66 1.1-13.18 3.1-19.26 6.05-17.2 8.45-29.14 24.22-35.73 42.06-1.68 4.6-2.93 9.28-3.73 13.96 10.23 16.84 23.38 31.73 38.66 44.28 3.16 2.65 6.43 5.14 9.78 7.48 16.57-2.8 32.92-10.03 46.14-22.4 9.46-8.87 16.64-19.42 21.5-30.83-7.72-12.96-18.55-23.92-31.5-31.7-7.87-4.73-16.4-8.04-25.28-9.86-1.71-.35-3.44-.66-5.16-.88-1.05-.13-2.1-.25-3.16-.32-.1-.02-.2-.02-.3-.02-.98-.06-1.96-.08-2.94-.08zm64.3 121.74c-14.64 6.57-28.38 13.45-41.62 20.6-10.98 5.96-21.5 12.05-31.56 18.3 5.3 9.13 8.6 18.9 9.6 28.67 13.18 1.22 27.5 4.76 41.64 11.58 4.8-10.1 11.66-19.1 19.94-26.5-1.35-16.44.26-33.18 2-52.65zm-94.02 55.07c-2.38 10.5-6.62 20.57-12.78 29.3-5.94 8.42-13.47 15.3-22.07 20.43.9 24.07-.1 48.8-5.4 74.72 12.27 3.76 24.28 8.45 35.92 14.1 6.06-6.9 13.8-12.23 22.3-15.84-1.52-17.35-.77-36.27 5.9-53.77 6.63-17.36 18.4-33.42 37.22-44.5-4.58-9.5-8.26-19.06-10.22-28.67-16.63 3.02-33.4 3.4-50.87 4.23zm-100.57 76.6c-9.55 7.43-19.12 15.46-28.22 24.12 7.27-.1 13.37 1.4 18.6 3.73 3.5-4.1 6.58-8.56 9.1-13.36 3.68-6.85 5.78-9.94.52-14.5zM44.1 390.67c-4.62 12.43-7.65 25.52-8.73 39.05 8.93 2.14 17.66 5.85 25.42 11.35 11.5-7.5 24.53-10.7 37.1-10.5-2.6-9.05-7.14-17.66-13.97-23.72-7.8-6.84-17.4-10.42-26.8-11.38-4.65-.47-9.17-.3-13.05.2zm97.78 34.36c-3.7 6.05-6.4 12.8-7.6 20-1.53 9.05-.26 17.88 3.12 25.67 8.6-1.5 17.47-1.4 26.32.93 7.22 1.88 13.73 5.23 19.26 9.62 6.6-6.82 14.72-11.5 23.26-13.97-1.94-2.92-4.1-5.63-6.6-8-8.26-7.9-19.4-11.78-30.14-10.57-.3.04-.6.08-.9.1-6.94-7.66-16.25-12.73-26.72-13.78zm94.07 34.77c-6.17 5.46-11.35 11.96-14.7 19.35-2.44 5.28-3.75 10.82-4.13 16.3 9.97 2.77 20.37 7.64 29.22 15.55 4.84-1.82 9.62-3.05 14.38-3.57-1.73-10.5-.72-21.1 2.73-31.3-11.9-1.8-20.97-7.04-27.5-16.33z'/></svg>` }} />
          </div>
        ),
        description: 'An animated construct of rock and ancient magic. It is incredibly durable and its heavy fists can shatter bone with ease.',
        abilities: 'Very high health and damage. Its rocky hide acts as armor, reducing all incoming damage.'
      },
      { 
        id: 'keyholder_orc', name: 'Orc Keywarden',
        icon: (
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <div className="w-10 h-10 text-emerald-500 drop-shadow-lg" dangerouslySetInnerHTML={{ __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor"><g><path d="M55.4,63.3c-0.1,0.2-0.3,0.4-0.4,0.6c0.2,0.7,0.6,1.9,1.5,3c1,1.1,2.1,1.7,2.6,1.9c0,0.5,0.1,1.5-0.4,2.6 c-0.7,1.7-1.9,2.6-2.4,2.8c0.7,1.2,1.7,3.2,2.2,5.7c0.7,4.1-0.2,7.4-0.8,8.9h19.3v-1.7c-1.8-0.4-4-1-6.4-2.1 c-1.5-0.7-2.8-1.4-3.9-2.1c1.5-1.6,3.7-4.6,5.1-8.7c0.8-2.4,1-4.5,
1.1-6.2c-2.5-6.5-4.9-10-6.9-12c-0.3-0.3-0.7-0.7-1.2-1.4 c-1.8,1.1-3.6,2.4-5.2,3.9C58.1,59.9,56.6,61.5,55.4,63.3z"/><path d="M61.5,41.5c-0.4-1-0.6-2.1-0.7-3.2c-0.1-1.1,0.1-2.2,0.3-3.3c0.2-1.1,0.6-2.1,0.9-3.1c0.3-1,0.6-2,0.9-3.1 c0.3-1,0.6-2.1,0.9-3.1l1.6-6.2c-1.4,0-2.5,0.2-3.5,0.3c-0.3,1.8-0.8,3.5-1.3,5.2c-0.5,1.7-1.1,3.4-1.8,5.1 c-0.7,1.7-1.5,3.3-2.4,4.8c-0.9,1.6-1.8,3.1-2.8,4.6c-1,1.5-2.2,2.9-3.5,4.2c-1.3,1.3-2.6,2.5-4.1,3.5c-2.9,2.1-6.2,3.7-9.6,4.9 c-0.4,1-1,1.8-1.4,2.4c-0.5,0.6-0.9,1.1-1.2,1.4c-1.9,2-4.4,5.5-6.9,12c0.1,1.7,0.3,3.8,1.1,6.2c1.3,4.2,3.6,7.1,5.1,8.7 c-1.1,0.7-2.4,1.4-3.9,2.1c-2.4,1.1-4.5,1.7-6.4,2.1v1.7h19.3c-0.6-1.6-1.5-4.9-0.8-8.9c0.5-2.5,1.4-4.4,2.2-5.7 c-0.5-0.3-1.7-1.2-2.4-2.8c-0.4-1.1-0.4-2-0.4-2.6c0.6-0.3,1.7-0.8,2.6-1.9c0.9-1,1.3-2.2,1.5-3c-0.1-0.2-0.3-0.4-0.4-0.6 c-1.2-1.8-2.7-3.4-4.3-4.8c-1.6-1.5-3.4-2.7-5.2-3.9c0.5,0.3,1,0.5,1.4,0.8c0.5,0.3,0.9,0.6,1.4,0.9c0.9,0.6,1.8,1.2,2.6,1.9 c1.7,1.4,3.2,3,4.5,4.7c0.1,0.2,0.3,0.4,0.4,0.5c0.5,0.7,1,1.5,1.4,2.2c0.5,1,1,1.9,1.4,3c0.7,1.6,1.2,3.2,1.7,4.9 c0.5-1.7,1-3.3,1.7-4.9c0.4-1,0.9-2,1.4-3c0.4-0.8,0.9-1.5,1.4-2.2c0.1-0.2,0.3-0.4,0.4-0.5c1.3-1.8,2.8-3.3,4.5-4.7 c0.8-0.7,1.7-1.3,2.6-1.9c0.5-0.3,0.9-0.6,1.4-0.9c0.5-0.3,0.9-0.5,1.4-0.8c-0.7-0.9-1.4-2-1.9-3.6c-0.2-0.7-0.7-2.5-0.5-4.7 c0.1-0.7,0.2-1.3,0.4-1.9c-0.3-0.4-0.6-0.9-0.8-1.4C61.9,42.5,61.7,42,61.5,41.5z"/><path d="M97.6,69c-3.7-5.5-5-10.2-5.5-13.5c-0.5-3.3-0.4-6.2-2.5-9.1c-1.8-2.6-4.5-3.8-6.4-4.5c-0.2-1.4-0.7-3.5-1.9-5.6 c-0.8-1.5-1.7-2.7-2.5-3.6c0.1-0.9,0.7-5.7-2.5-9.3c-2.2-2.4-5.1-3-7.2-3.4c-1.3-0.3-2.5-0.4-3.6-0.4c-0.3,2.1-0.6,4.2-1.1,6.3 c-0.4,2.1-1,4.2-1.6,6.2c-0.3,1-0.7,2-0.9,3.1c-0.1,0.5-0.2,1-0.3,1.5c-0.1,0.5-0.1,1-0.1,1.6c0,2.1,0.7,4.2,1.6,6.1 c1.2-3.7,4.3-5.9,5-6.3c0.8,1.5,1.9,3.2,3.2,5c1.3,1.8,2.7,3.2,3.9,4.4c1.1,2.8,2.9,6.3,5.7,10c1.5,1.9,3,3.6,4.5,4.9 c-0.6,0.4-2.9,2.3-3.6,5.6c-0.8,4,1.4,7.1,1.7,7.6c0.1-1,0.5-2.8,1.7-4.7c0.9-1.4,1.9-2.3,2.7-2.9c0.5,1.2,1.1,2.5,1.7,3.8 c0.8,1.7,1.7,3.2,2.6,4.5c-0.4,0.2-0.9,0.6-1.4,1.2c-0.9,1-1.1,2.1-1.2,2.7c0.7,0.1,1.7,0.4,2.9,1.2c1,0.6,1.6,1.4,2,1.9 c0.9-0.9,2.2-2.5,3.1-4.8C99,74,98,70.3,97.6,69z"/><path d="M45.8,46.9c2.8-2.1,5.3-4.7,7.3-7.6c1-1.4,1.9-3,2.8-4.5c0.9-1.5,1.7-3.1,2.4-4.7c1.5-3.2,2.7-6.6,3.6-10.1 c-0.3,0.1-0.6,0.1-0.8,0.2c-0.2-0.4-0.6-1-1.3-1.6c-0.5-0.5-1.1-0.8-1.5-1c0.4-0.4,0.9-0.9,1.3-1.5c0.9-1.3,1.3-2.6,1.4-3.4 c-0.6,0-2.4-0.1-3.9,1.1c-0.6,0.5-1.1,1-1.3,1.4c-0.3-0.6-1-1.7-2.3-2.7c-1.4-1-2.9-1.2-3.5-1.3c-0.6,0.1-2.1,0.3-3.5,1.3 c-1.3,0.9-2,2.1-2.3,2.7c-0.3-0.4-0.7-1-1.3-1.4c-1.6-1.2-3.4-1.2-3.9-1.1c0.2,0.8,0.5,2.1,1.4,3.4c0.4,0.6,0.9,1.1,1.3,1.5 c-0.4,0.2-0.9,0.5-1.5,1c-0.6,0.6-1,1.2-1.3,1.6c-1.6-0.4-4.5-0.8-7.9-0.2c-2.2,0.4-5.1,1-7.3,3.4c-3.2,3.5-2.6,8.4-2.5,9.3 c-0.8,0.9-1.7,2.1-2.5,3.6c-1.1,2.2-1.6,4.2-1.9,5.6c-2,0.7-4.6,2-6.4,4.5c-2.1,2.9-2,5.8-2.5,9.1c-0.5,3.3-1.9,8-5.5,13.5 C2,70.3,1,74,2.5,78.3c0.9,2.3,2.2,3.9,3.1,4.8c0.4-0.5,1-1.2,2-1.9c1.1-0.7,2.2-1,2.9-1.2c-0.1-0.5-0.3-1.6-1.2-2.7 c-0.5-0.6-1-0.9-1.4-1.2c0.9-1.3,1.7-2.8,2.6-4.5c0.7-1.3,1.2-2.6,1.7-3.8c0.7,0.6,1.8,1.5,2.7,2.9c1.2,1.9,1.6,3.6,1.7,4.7 c0.4-0.5,2.6-3.5,1.7-7.6c-0.7-3.3-3-5.1-3.6-5.6c1.4-1.3,3-3,4.5-4.9c2.8-3.6,4.6-7.1,5.7-10c1.2-1.2,2.5-2.6,3.9-4.4 c1.4-1.8,2.4-3.5,3.2-5c0.8,0.5,4.8,3.3,5.4,8.2c0.3,2.2-0.2,4.1-0.5,4.7c-0.1,0.4-0.3,0.8-0.4,1.1c1.6-0.7,3.2-1.5,4.8-2.4 C42.9,48.9,44.4,47.9,45.8,46.9z M54.2,16.3c0.4,0,0.8,0.3,0.8,0.8c0,0.4-0.3,0.8-0.8,0.8s-0.8-0.3-0.8-0.8 C53.4,16.7,53.7,16.3,54.2,16.3z M45.8,16.3c0.4,0,0.8,0.3,0.8,0.8c0,0.4-0.3,0.8-0.8,0.8c-0.4,0-0.8-0.3-0.8-0.8 C45.1,16.7,45.4,16.3,45.8,16.3z M44.6,23c0.1-0.2,0.2-0.3,0.3-0.5c0.2-0.3,0.4-0.7,0.6-1c0.2-0.4,0.3-0.7,0.5-1.1 c0.1-0.4,0.2-0.7,0.3-1.1l0.1-0.7l0.3,0.6c0.3,0.6,0.5,1.2,0.4,1.9c0,0.3-0.1,0.6-0.2,0.9c-0.1,0.2-0.2,0.5-0.3,0.7 c0.1,0,0.3-0.1,0.4-0.1c1-0.2,2-0.3,3-0.3c1,0,2,0.1,3,0.3c0.1,0,0.3,0.1,0.4,0.1c-0.1-0.2-0.2-0.4-0.3-0.6 c-0.1-0.3-0.2-0.6-0.2-0.9c-0.1-0.6,0.1-1.3,0.4-1.9l0.3-0.6l0.1,0.7c0.1,0.4,0.2,0.8,0.3,1.1c0.1,0.4,0.3,0.7,0.5,1.1 c0.2,0.4,0.4,0.7,0.6,1c0.1,0.2,0.2,0.3,0.3,0.5c0.1,0.2,0.2,0.3,0.4,0.5c-1-0.2-1.9-0.4-2.9-0.6c-1-0.1-1.9-0.2-2.9-0.1 c-1,0-1.9,0.1-2.9,0.2c-1,0.1-1.9,0.3-2.9,0.5C44.4,23.3,44.5,23.1,44.6,23z"/></g></svg>` }} />
          </div>
        ),
        description: 'A hulking Orc chosen for its brute strength. It is entrusted with the key that unlocks the passage to the deeper levels of the dungeon.',
        abilities: 'A powerful mini-boss. Defeating it drops the key for the floor.'
      },
       {
        id: 'cultist', name: 'Cultist Acolyte',
        icon: (
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <div className="w-10 h-10 text-purple-400 drop-shadow-lg" dangerouslySetInnerHTML={{ __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h-2zm0 6h2v2h-2z"/></svg>` }} />
          </div>
        ),
        description: 'A robed figure chanting forbidden words. They channel raw magical energy, bypassing physical defenses with ease.',
        abilities: 'A standard ranged attacker that deals Arcane damage, effective against heavily armored foes.'
      },
    ]
  };

  // NEW: This function now updates the LOCAL state instantly, not Firebase.
  const setDungeonState = (updater) => {
    setLocalDungeonState(updater);
  };
  
  // This is now the single source of truth for calculated stats.
  const fullPlayerStats = useMemo(() => {
    if (!localDungeonState || !localDungeonState.playerClass) return { maxHp: 100, attack: 10 };

    const classDef = dungeonDefinitions.classes[localDungeonState.playerClass];
    const allPrimaryWeapons = Object.values(dungeonDefinitions.primaryWeapons)
      .flatMap(classWeapons => Object.values(classWeapons).flat());
    const weapon = allPrimaryWeapons.find(w => w.id === localDungeonState.equippedWeapon);
    const armor = dungeonDefinitions.armors.find(a => a.id === localDungeonState.equippedArmor);
    const pet = stats.currentPet ? getFullPetDetails(stats.currentPet.id) : null;
    
    let potionAttackBonus = 0;
    let potionHpBonus = 0;
    
    // Hunker down is a temporary effect, so we add its bonus here.
    const hunkerDownEffect = localDungeonState.player.activeEffects?.find(e => e.id === 'tank_hunker_down');
    const hunkerHpBonus = hunkerDownEffect ? 100 : 0;

    if (localDungeonState.player.activeEffects) {
        localDungeonState.player.activeEffects.forEach(effect => {
            if (effect.id === 'potion_strength') potionAttackBonus += 15;
            if (effect.id === 'potion_fortitude') potionHpBonus += 50;
        });
    }

    const baseAttack = 10;
    const maxHp = (classDef.startingHp || 100) + (armor?.hp || 0) + (weapon?.hp || 0) + (localDungeonState.boughtStats?.hp || 0) + potionHpBonus + hunkerHpBonus;
    const attack = baseAttack + (weapon?.attack || 0) + (pet?.xpBuff * 50 || 0) + (localDungeonState.boughtStats?.attack || 0) + potionAttackBonus;

    return { maxHp, attack };
  }, [localDungeonState, stats.currentPet, getFullPetDetails, dungeonDefinitions]);
  
  // --- NEW: Pathfinding, AI, and Turn Logic ---

  // Checks line of sight between two points, accounting for walls and pillars.
  const lineOfSightClear = (startPos, endPos, board) => {
    let x0 = startPos.x;
    let y0 = startPos.y;
    const x1 = endPos.x;
    const y1 = endPos.y;
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;

    while (true) {
      if (x0 === x1 && y0 === y1) break;
      // Check the tile at (x0, y0), but ignore the very start and very end tiles
      if (!(x0 === startPos.x && y0 === startPos.y) && !(x0 === endPos.x && y0 === endPos.y)) {
        const tile = board[`${y0},${x0}`];
        if (tile && (tile.type === 'wall' || tile.type === 'pillar')) {
          return false;
        }
      }
      const e2 = 2 * err;
      if (e2 >= dy) {
        if (x0 === x1) break;
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        if (y0 === y1) break;
        err += dx;
        y0 += sy;
      }
    }
    return true; // No obstacles found
  };


  // Finds all tiles a unit can move to within its range.
  const getReachableTiles = (start, range, board, allEntities) => {
    const reachable = new Map(); // Stores {pos, dist}
    const queue = [{ pos: start, dist: 0 }];
    const visited = new Set([`${start.x},${start.y}`]);
    reachable.set(`${start.x},${start.y}`, { pos: start, dist: 0 });

    const entityPositions = new Set(allEntities.map(e => `${e.x},${e.y}`));

    while (queue.length > 0) {
      const { pos, dist } = queue.shift();
      if (dist >= range) continue;

        const neighbors = [
          {x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0}, // Cardinal
          {x: 1, y: 1}, {x: 1, y: -1}, {x: -1, y: 1}, {x: -1, y: -1}  // Diagonal
        ];
        for (const n of neighbors) {
            const nextPos = { x: pos.x + n.x, y: pos.y + n.y };
            const key = `${nextPos.x},${nextPos.y}`;

            if (nextPos.x < 0 || nextPos.x >= 10 || nextPos.y < 0 || nextPos.y >= 10 || visited.has(key)) continue;
            
            if (n.x !== 0 && n.y !== 0) {
                const corner1Key = `${pos.x + n.x},${pos.y}`;
                const corner2Key = `${pos.x},${pos.y + n.y}`;
                if (board[corner1Key]?.type === 'wall' || board[corner1Key]?.type === 'pillar' || board[corner2Key]?.type === 'wall' || board[corner2Key]?.type === 'pillar') {
                    continue;
                }
            }

           const tile = board[key];
        if (tile && tile.type !== 'wall' && tile.type !== 'pillar' && tile.type !== 'hatch' && !(tile.type === 'chest' && !tile.opened) && !entityPositions.has(key)) {
          visited.add(key);
          reachable.set(key, { pos: nextPos, dist: dist + 1 });
          queue.push({ pos: nextPos, dist: dist + 1 });
        }
      }
    }
    return Array.from(reachable.values()).map(r => r.pos);
  };

  // Finds the shortest path from start to end using Breadth-First Search.
  const findPathBFS = (start, end, board, allEntities) => {
    const queue = [[start]];
    const visited = new Set([`${start.x},${start.y}`]);
    const entityPositions = new Set(allEntities.map(e => `${e.x},${e.y}`));
    entityPositions.delete(`${start.x},${start.y}`); 
    entityPositions.delete(`${end.x},${end.y}`);   
    
    while(queue.length > 0) {
        const path = queue.shift();
        const pos = path[path.length - 1];
        
        if(pos.x === end.x && pos.y === end.y) return path;
        
        const neighbors = [
          {x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0},
          {x: 1, y: 1}, {x: 1, y: -1}, {x: -1, y: 1}, {x: -1, y: -1}
        ];
        for (const n of neighbors) {
            const nextPos = { x: pos.x + n.x, y: pos.y + n.y };
            const key = `${nextPos.x},${nextPos.y}`;

            if (nextPos.x < 0 || nextPos.x >= 10 || nextPos.y < 0 || nextPos.y >= 10 || visited.has(key)) continue;
            
            if (n.x !== 0 && n.y !== 0) {
                const corner1Key = `${pos.x + n.x},${pos.y}`;
                const corner2Key = `${pos.x},${pos.y + n.y}`;
                 if (board[corner1Key]?.type === 'wall' || board[corner1Key]?.type === 'pillar' || board[corner2Key]?.type === 'wall' || board[corner2Key]?.type === 'pillar') {
                    continue;
                }
            }

           const tile = board[key];
            if (tile && tile.type !== 'wall' && tile.type !== 'pillar' && tile.type !== 'hatch' && !(tile.type === 'chest' && !tile.opened) && !entityPositions.has(key)) {
                const newPath = [...path, nextPos];
                queue.push(newPath);
                visited.add(key);
            }
        }
    }
    return null; // No path found
  };


  // REFACTORED: This now triggers the enemy turn sequence.
  const processEnemyTurns = useCallback(() => {
    addLog("Enemy turn...", 'text-gray-400 italic');
    setLocalDungeonState(prev => ({ ...prev, lastMoveTrails: [] })); // Clear trails at turn start
  }, [addLog]);

  // NEW: React-friendly useEffect for handling sequential enemy turns
  useEffect(() => {
    if (activeTurn !== 'enemy' || dungeonStateRef.current.gameOver) return;
  
    const enemiesToProcess = [...dungeonStateRef.current.enemies];
    let currentEnemyIndex = 0;
  
    const processNextEnemy = () => {
      const currentState = dungeonStateRef.current;
      if (currentEnemyIndex >= enemiesToProcess.length || currentState.player.hp <= 0) {
        // --- End of Enemy Turn / Start of Player Turn ---
        const endTurnLogic = () => {
            const latestState = dungeonStateRef.current;
            let wingmanDiedThisTurn = false;

            if (latestState.wingman && latestState.wingman.hp <= 0) {
                wingmanDiedThisTurn = true;
                addLog(`${latestState.wingman.name} has been defeated! He has been moved to the Graveyard.`, 'text-red-500 font-bold');
                
                const defeatedWingman = { ...latestState.wingman, dateOfDeath: new Date().toISOString() };
                const wingmanInstanceId = defeatedWingman.instanceId;
                const wingmanBaseId = defeatedWingman.id;

                const latestRoster = statsPropRef.current.dungeon_wingmen?.roster || [];
                const latestGraveyard = statsPropRef.current.dungeon_wingmen?.graveyard || [];
                const latestUpgrades = { ...(statsPropRef.current.dungeon_wingmen?.upgrades || {}) };

                const newRoster = latestRoster.filter(w => w.instanceId !== wingmanInstanceId);
                const newGraveyard = [...latestGraveyard, defeatedWingman];
                delete latestUpgrades[wingmanBaseId];

                const boardUpdate = { ...latestState.board };
                boardUpdate[`${defeatedWingman.y},${defeatedWingman.x}`] = { type: 'empty' };

                const stateUpdateForFirestore = {
                  ...latestState,
                  board: boardUpdate,
                  wingman: null,
                };
                
                updateStatsInFirestore({
                    'dungeon_wingmen.roster': newRoster,
                    'dungeon_wingmen.graveyard': newGraveyard,
                    'dungeon_wingmen.upgrades': latestUpgrades,
                    'dungeon_state': stateUpdateForFirestore
                });

                setLocalDungeonState(stateUpdateForFirestore);
            }

setLocalDungeonState(prev => {
                let newState = { ...prev };
                if (wingmanDiedThisTurn) {
                  newState.wingman = null; 
                }
                newState.turnCount = (prev.turnCount || 1) + 1;

                   // --- Player & Wingman End-of-Turn Tile Effects ---
                const checkAndHeal = (entity, entityKey) => {
                    if (!entity) return;
                    const tile = newState.board[`${entity.y},${entity.x}`];
                    
                    // Altar Logic
                    if (tile && tile.type === 'altar') {
                        addLog(`${entity.name || 'You'} activated a mysterious altar!`, 'text-purple-300 font-bold');
                        if (!newState[entityKey].activeEffects) newState[entityKey].activeEffects = [];
                        newState[entityKey].activeEffects.push({ id: 'altar_lifesteal', type: 'lifesteal', amount: 0.25, durationTurns: 3 });
                        newState.board[`${entity.y},${entity.x}`] = { type: 'altar_used' };
                    }

                    // Miasma Damage
                    if (newState.floorModifier?.id === 'miasma') {
                        const maxHp = entityKey === 'player' ? fullPlayerStats.maxHp : entity.maxHp;
                        const miasmaDamage = Math.max(1, Math.round(maxHp * 0.05));
                        newState[entityKey].hp -= miasmaDamage;
                        addLog(`${entity.name || 'You'} take ${miasmaDamage} damage from Miasma.`, 'text-purple-400');
                    }
                    
                    if (tile && tile.type === 'healing_spring') {
                        const maxHp = entityKey === 'player' ? fullPlayerStats.maxHp : entity.maxHp;
                        const healAmount = Math.round(maxHp * 0.15);
                        const healedHp = Math.min(maxHp, entity.hp + healAmount);
                        if (healedHp > entity.hp) {
                           addLog(`${entity.name || 'You'} healed for ${healedHp - entity.hp} HP on the spring.`, 'text-green-300');
                           newState[entityKey].hp = healedHp;
                        }
                    }
                };
                checkAndHeal(newState.player, 'player');
                checkAndHeal(newState.wingman, 'wingman');


                if (newState.wingman) {
                  // ... [rest of the effect processing logic remains the same] ...
                   let newWingman = { ...newState.wingman };
                    let wingmanEffects = [...(newWingman.activeEffects || [])];
                    let effectsToRemove = [];
                    
                    wingmanEffects.forEach((effect, index) => {
                      effect.durationTurns = (effect.durationTurns || 99) - 1;
                      if (effect.specialization === 'crusader_ability_b' && effect.id === 'divine_shield') {
                        const healAmount = Math.round(newWingman.maxHp * 0.2 / effect.duration);
                        newWingman.hp = Math.min(newWingman.maxHp, newWingman.hp + healAmount);
                        addLog(`${newWingman.name}'s Sanctuary heals them for ${healAmount} HP.`, 'text-green-300');
                      }
                      if (effect.durationTurns <= 0) {
                        if (effect.specialization === 'crusader_ability_a' && effect.id === 'divine_shield') {
                           addLog(`${newWingman.name}'s Divine Shield explodes!`, 'text-yellow-300');
                           const explosionDamage = effect.tempHp || 30;
                           newState.enemies.forEach(enemy => {
                             if (Math.hypot(enemy.x - newWingman.x, enemy.y - newWingman.y) < 1.6) enemy.hp -= explosionDamage;
                           });
                        }
                        if (effect.tempHp) newWingman.maxHp -= effect.tempHp;
                        effectsToRemove.push(index);
                      }
                    });
                    
                    newWingman.activeEffects = wingmanEffects.filter((_, index) => !effectsToRemove.includes(index));
                    newState.wingman = newWingman;
                }
                return newState;
            });
            
            setActiveTurn('player');
            setPlayerActionPoints(2);
            setWingmanTurnState({ distanceMoved: 0, frenziedAttackAvailable: false });
            if (dungeonStateRef.current.wingman) setWingmanActionPoints(dungeonStateRef.current.wingman.ap);
            setDangerZone({ tiles: [], forEnemy: null });
      
            if (dungeonStateRef.current.player.hp > 0) addLog("Your turn.", 'text-gray-400 italic');
            else handleGameOver();
        };

        // Use a short timeout to ensure the last state update from an attack has been processed.
        setTimeout(endTurnLogic, 50);
        return;
      }

      const enemy = { ...enemiesToProcess[currentEnemyIndex] };
      const performAttack = (attacker, currentTarget) => {
          const targetId = currentTarget.entityType === 'player' ? 'player' : 'wingman';
          const targetName = targetId === 'player' ? 'you' : (currentTarget.name || 'your wingman');
          
          setLocalDungeonState(prev => {
              if (!prev[targetId]) return prev;
              let newState = JSON.parse(JSON.stringify(prev));
              let defender = newState[targetId];
              let attackerInState = newState.enemies.find(e => e.id === attacker.id);
              
              const riposteEffect = defender.activeEffects?.find(e => e.id === 'riposte');
              if (riposteEffect) {
                  const chance = riposteEffect.specialization === 'duelist_ability_a' ? 1.0 : 0.5;
                  if (Math.random() < chance) {
                      const counterDamage = Math.round(defender.atk * 0.5);
                      if (attackerInState) attackerInState.hp -= counterDamage;
                      newState.log.unshift({ id: Date.now() + Math.random(), message: `${defender.name} ripostes for ${counterDamage} damage!`, style: 'text-sky-400' });
                  }
                  if (riposteEffect.specialization === 'duelist_ability_b') {
                      newState.log.unshift({ id: Date.now() + Math.random(), message: `${defender.name} parries the attack!`, style: 'text-sky-400' });
                      setAnimationState(prevAnims => ({...prevAnims, hits: {...prevAnims.hits, [targetId]: Date.now()}}));
                      return newState;
                  }
              }

              const defenderArmor = defender.armor || 0;
              let finalDamage = Math.max(1, attacker.atk - defenderArmor);

                            // NEW: Rubble tile damage reduction
              const defenderTile = prev.board[`${defender.y},${defender.x}`];
              if (defenderTile && defenderTile.type === 'rubble') {
                finalDamage = Math.round(finalDamage * 0.8); // 20% damage reduction
                newState.log.unshift({ id: Date.now() + Math.random(), message: `${defender.name || 'You'} took cover in the rubble!`, style: 'text-stone-400' });
              }

              // NEW: Volatile Magic modifier
              if (prev.floorModifier?.id === 'volatile_magic') {
                finalDamage = Math.round(finalDamage * 1.25);
              }
              
              const retaliationEffect = defender.activeEffects?.find(e => e.id === 'fortify' && e.specialization === 'heavy_ability_b');
              if (retaliationEffect) {
                  const reflectDamage = Math.round(finalDamage * 0.25);
                  if(attackerInState) attackerInState.hp -= reflectDamage;
                  newState.log.unshift({ id: Date.now() + Math.random(), message: `${defender.name} reflects ${reflectDamage} damage!`, style: 'text-orange-400' });
              }
              
              // Check for player thorns from equipped shield
              const primaryWeapon = Object.values(dungeonDefinitions.primaryWeapons).flat().flatMap(cat => Object.values(cat).flat()).find(w => w.id === prev.equippedWeapon);
              const thornsDamageFromItems = (defender.thorns || 0) + (targetId === 'player' && primaryWeapon?.thorns ? primaryWeapon.thorns : 0);

              if (thornsDamageFromItems > 0 && attackerInState) {
                  attackerInState.hp -= thornsDamageFromItems;
                  newState.log.unshift({ id: Date.now() + Math.random(), message: `${targetName}'s thorns reflect ${thornsDamageFromItems} damage!`, style: 'text-orange-300' });
              }
              
              defender.hp -= finalDamage;
              
              newState.log.unshift({ id: Date.now() + Math.random(), message: `${attacker.name} attacks ${targetName} for ${finalDamage} damage!`, style: 'text-red-400' });
              setAnimationState(prevAnims => ({...prevAnims, hits: {...prevAnims.hits, [targetId]: Date.now()}}));
              
              return newState;
          });
      };
      
      // --- End of Previous Turn Tile Effects ---
      const enemyTile = currentState.board[`${enemy.y},${enemy.x}`];
      if (enemyTile && enemyTile.type === 'healing_spring') {
          const healAmount = Math.round(enemy.maxHp * 0.15);
          enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount);
          addLog(`${enemy.name} heals for ${healAmount}HP on the spring.`, 'text-green-300');
      }

      // --- Status Effects ---
            // --- Miasma Damage ---
      if (currentState.floorModifier?.id === 'miasma') {
          const miasmaDamage = Math.max(1, Math.round(enemy.maxHp * 0.05));
          enemy.hp -= miasmaDamage;
          addLog(`${enemy.name} takes ${miasmaDamage} damage from Miasma.`, 'text-purple-400');
          if (enemy.hp <= 0) {
            setLocalDungeonState(prev => ({ ...prev, enemies: prev.enemies.filter(e => e.id !== enemy.id), board: {...prev.board, [`${enemy.y},${enemy.x}`]: {type: 'empty'}} }));
            currentEnemyIndex++; setTimeout(processNextEnemy, 50); return;
          }
      }

      if (enemy.statusEffects) {
        let damageOverTime = 0;
        enemy.statusEffects.forEach(effect => {
            if (effect.type === 'poison' || effect.type === 'burning') damageOverTime += effect.damage;
        });
        if (damageOverTime > 0) {
            enemy.hp -= damageOverTime;
            addLog(`${enemy.name} takes ${damageOverTime} damage from status effects.`, 'text-purple-400');
            if (enemy.hp <= 0) {
              setLocalDungeonState(prev => ({ ...prev, enemies: prev.enemies.filter(e => e.id !== enemy.id) }));
              currentEnemyIndex++; setTimeout(processNextEnemy, 50); return;
            }
        }
        enemy.statusEffects = enemy.statusEffects.map(effect => ({ ...effect, duration: effect.duration - 1 })).filter(e => e.duration > 0);
      }
      
      if ((enemy.moveFrequency && currentState.turnCount % enemy.moveFrequency !== 0) || (enemy.moveChance && Math.random() > enemy.moveChance)) {
          currentEnemyIndex++; setTimeout(processNextEnemy, 50); return;
      }

      // Stun check
      const stunnedEffect = enemy.statusEffects?.find(e => e.type === 'stunned');
      if (stunnedEffect) {
        addLog(`${enemy.name} is stunned and cannot act!`, 'text-yellow-400');
        currentEnemyIndex++;
        setTimeout(processNextEnemy, 50);
        return;
      }
      
      // Cobweb check
      if (enemyTile && enemyTile.type === 'cobweb') {
          addLog(`${enemy.name} is stuck in a cobweb and cannot move!`, 'text-slate-400');
          // Enemy can still attack if target is in range, but cannot move.
          // We remove the cobweb after it's triggered once.
          setLocalDungeonState(prev => {
              const newBoard = { ...prev.board };
              newBoard[`${enemy.y},${enemy.x}`] = { type: 'empty' };
              return { ...prev, board: newBoard };
          });
          // Directly try to attack if possible, otherwise end turn.
          const target = currentState.player; // Simplified target for now
          if (Math.hypot(enemy.x - target.x, enemy.y - target.y) <= enemy.attackRange) {
              performAttack(enemy, target);
          }
          currentEnemyIndex++;
          setTimeout(processNextEnemy, 200);
          return;
      }
  
      // --- AI Logic ---
      let target = currentState.player;
      let allEntities = [...currentState.enemies, currentState.player];
      if (currentState.wingman) {
        allEntities.push(currentState.wingman);
        const tauntEffect = enemy.statusEffects?.find(e => e.type === 'taunted');
        if (tauntEffect) { target = currentState.wingman; } 
        else {
          const distToPlayer = Math.hypot(enemy.x - currentState.player.x, enemy.y - currentState.player.y);
          const distToWingman = Math.hypot(enemy.x - currentState.wingman.x, enemy.y - currentState.wingman.y);
          if (distToWingman < distToPlayer) target = currentState.wingman;
        }
      }
      
      let enemyMoveRange = enemy.moveRange;
      const crippledEffect = enemy.statusEffects?.find(e => e.type === 'crippled');
      if (crippledEffect) enemyMoveRange = Math.max(0, enemyMoveRange - crippledEffect.reduction);
      
      const path = findPathBFS({ x: enemy.x, y: enemy.y }, { x: target.x, y: target.y }, currentState.board, allEntities);
      const inRangeNow = Math.hypot(enemy.x - target.x, enemy.y - target.y) <= enemy.attackRange;

      if (inRangeNow) {
        performAttack(enemy, target);
        currentEnemyIndex++;
        setTimeout(processNextEnemy, 200);
      } else if (path && path.length > 1) {
        const stepsToAdjacent = path.length - 2;
        if (stepsToAdjacent <= enemyMoveRange) { // Can move and attack
          const movePath = path.slice(1, path.length - 1);
          const endPos = movePath.length > 0 ? movePath[movePath.length - 1] : { x: enemy.x, y: enemy.y };
          
          setLocalDungeonState(prev => {
            const newBoard = { ...prev.board };
            newBoard[`${enemy.y},${enemy.x}`] = { type: 'empty' };
            newBoard[`${endPos.y},${endPos.x}`] = { type: 'enemy', enemyId: enemy.id };
            return { ...prev, board: newBoard, enemies: prev.enemies.map(e => e.id === enemy.id ? { ...e, x: endPos.x, y: endPos.y } : e) };
          });

          setTimeout(() => {
            performAttack(enemy, target);
            currentEnemyIndex++;
            setTimeout(processNextEnemy, 50);
          }, 250);

        } else { // Can only move
          const movePath = path.slice(1, enemyMoveRange + 1);
          const endPos = movePath[movePath.length - 1];

          setLocalDungeonState(prev => {
            const newBoard = { ...prev.board };
            newBoard[`${enemy.y},${enemy.x}`] = { type: 'empty' };
            newBoard[`${endPos.y},${endPos.x}`] = { type: 'enemy', enemyId: enemy.id };
            return { ...prev, board: newBoard, enemies: prev.enemies.map(e => e.id === enemy.id ? { ...e, x: endPos.x, y: endPos.y } : e) };
          });

          setTimeout(() => {
            currentEnemyIndex++;
            setTimeout(processNextEnemy, 50);
          }, 250);
        }
      } else { // Cannot move and not in range, so wait
        currentEnemyIndex++;
        setTimeout(processNextEnemy, 200);
      }
    };
  
    processNextEnemy();
  }, [activeTurn]);

  // --- NEW: Danger Zone Logic ---
    const handleEnemyClick = (e, enemy) => {
    e.stopPropagation(); // Prevent tile click from firing

    if (attackTarget) { // this handles both player and wingman attack targeting
        const attackType = typeof attackTarget === 'object' ? attackTarget.type : 'wingman_basic';
        handleAttack(activeTurn, enemy, attackType);
        setAttackTarget(null);
        setAbilityTarget(null);
        return;
    }
    
    if (activeTurn === 'player' && abilityTarget) {
      handleAttack('player', enemy, abilityTarget);
      return;
    }
    
    // NEW: Wingman ability targeting
    if (activeTurn === 'wingman' && wingmanAbilityTarget) {
      handleUseWingmanAbility(enemy);
      return;
    }

    // --- Danger Zone Logic (if not in targeting mode during player turn) ---
    if (dangerZone.forEnemy === enemy.id) {
      setDangerZone({ tiles: [], forEnemy: null });
      return;
    }

    // --- Danger Zone Logic (if not in targeting mode during player turn) ---
    if (dangerZone.forEnemy === enemy.id) {
      setDangerZone({ tiles: [], forEnemy: null });
      return;
    }
    
    // ACCURACY FIX: The danger zone shows what an enemy can do on its upcoming turn.
    // We check the game's current turn count to see if slow enemies (like Golems) will be able to act.
    const enemyWillMove = !enemy.moveFrequency || (localDungeonState.turnCount % enemy.moveFrequency === 0);
    const moveRange = enemyWillMove ? enemy.moveRange : 0;

    const allEntities = [...localDungeonState.enemies, localDungeonState.player];
    const moveTiles = getReachableTiles({ x: enemy.x, y: enemy.y }, moveRange, localDungeonState.board, allEntities);
    const attackTiles = new Set();
    
    const combinedTiles = [...moveTiles, { x: enemy.x, y: enemy.y }];

    combinedTiles.forEach(movePos => {
      for(let y = -enemy.attackRange; y <= enemy.attackRange; y++) {
        for(let x = -enemy.attackRange; x <= enemy.attackRange; x++) {
          if (Math.hypot(x, y) <= enemy.attackRange) {
            const atkX = movePos.x + x;
            const atkY = movePos.y + y;
            if(atkX >= 0 && atkX < 10 && atkY >= 0 && atkY < 10) {
              attackTiles.add(`${atkX},${atkY}`);
            }
          }
        }
      }
    });

    setDangerZone({ tiles: Array.from(attackTiles).map(s => ({x: parseInt(s.split(',')[0]), y: parseInt(s.split(',')[1])})), forEnemy: enemy.id });
  };


  const classDef = localDungeonState ? dungeonDefinitions.classes[localDungeonState.playerClass] : null;

    const CombatStyleIcon = ({ style, size = 'w-4 h-4' }) => {
    const iconMap = {
      Martial: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M16.816 2.331a2.5 2.5 0 00-3.536 0L2.33 13.282a2.5 2.5 0 000 3.536l.884.884a2.5 2.5 0 003.535 0L17.7 6.753a2.5 2.5 0 000-3.535l-.884-.884zM8.25 12.336l-3.536 3.536a.5.5 0 01-.707 0l-.884-.884a.5.5 0 010-.707l3.536-3.536 2.092 2.091z"/></svg>,
      Finesse: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v1.268a2 2 0 001.092 1.836l5.284 2.642a1 1 0 01.44 1.262l-1.328 2.656a1 1 0 01-1.262.44l-5.284-2.642A2 2 0 0010 11.732V16a1 1 0 11-2 0v-4.268a2 2 0 00-1.092-1.836l-5.284-2.642a1 1 0 01-.44-1.262L2.51 3.336a1 1 0 011.262-.44l5.284 2.642A2 2 0 0010 7.268V4a1 1 0 011-1z"/></svg>,
      Arcane: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h.5a1.5 1.5 0 010 3H14a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0V8a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H6a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0V4a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1v-.5a1.5 1.5 0 013 0V3a1 1 0 001 1h.5a1.5 1.5 0 013 0V3.5zM1.5 11h.5a1 1 0 001-1v-.5a1.5 1.5 0 013 0V10a1 1 0 001 1h.5a1.5 1.5 0 010 3H8a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0V14a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3zM12 11.5a1.5 1.5 0 00-3 0V12a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3H8a1 1 0 011-1v-.5a1.5 1.5 0 003 0V13a1 1 0 011-1h.5a1.5 1.5 0 000-3H14a1 1 0 01-1 1v.5z"/></svg>
    };
    const colorMap = {
      Martial: 'text-red-400', Finesse: 'text-green-400', Arcane: 'text-blue-400'
    };
    return <div className={`${size} ${colorMap[style]}`}>{iconMap[style]}</div>
  };

  const handleGameOver = () => {
    const finalState = { ...localDungeonState, gameOver: true, log: [{ message: "You have been defeated! Your adventure ends here.", style: 'text-red-500 font-bold' }, ...(localDungeonState.log || []).slice(0, 4)] };
    setLocalDungeonState(finalState);
    saveGame(finalState);
  };
  
    const generateFloor = (floorNum) => {
    const size = 10;
    let newBoard = {};
    let newEnemies = [];
    
    const floorModifiers = [
      { id: 'horde', name: 'Horde', description: 'Enemy numbers are increased.' },
      { id: 'volatile_magic', name: 'Volatile Magic', description: 'All units deal 25% more damage.' },
      { id: 'miasma', name: 'Miasma', description: 'All units lose 5% of their max HP at the start of their turn.' },
    ];
    // Apply a modifier 33% of the time, but never on the first floor.
    const modifier = floorNum > 1 && Math.random() < 0.33 ? floorModifiers[Math.floor(Math.random() * floorModifiers.length)] : null;

    
    // Initialize board
    for (let y = 0; y < size; y++) { for (let x = 0; x < size; x++) { newBoard[`${y},${x}`] = { type: 'empty' }; } }

    // Place walls
    for (let i = 0; i < 15 + Math.floor(Math.random() * 5); i++) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        if((x !== 1 || y !== 1)) newBoard[`${y},${x}`] = { type: 'wall' };
    }

    // Place special tiles
    const placeTile = (type, count) => {
      for (let i = 0; i < count; i++) {
        let x, y;
        do {
          x = Math.floor(Math.random() * size);
          y = Math.floor(Math.random() * size);
        } while (newBoard[`${y},${x}`].type !== 'empty' || (x === 1 && y === 1));
        newBoard[`${y},${x}`] = { type };
      }
    };
    placeTile('forest', 3 + Math.floor(Math.random() * 3));
    placeTile('pillar', 1 + Math.floor(Math.random() * 2));
    placeTile('fort', 1 + Math.floor(Math.random() * 2));
    placeTile('rough', 5 + Math.floor(Math.random() * 4));
    placeTile('altar', 1); // Place one altar per floor


    // Determine available enemies for this floor
    const availableEnemies = dungeonDefinitions.enemies.filter(e => floorNum >= e.minFloor && e.id !== 'ooze' && e.id !== 'keyholder_orc');
    let enemyCount = floorNum === 1 ? 4 : 6 + Math.floor(floorNum / 2);
    if (modifier?.id === 'horde') {
        enemyCount = Math.round(enemyCount * 1.5);
    }
    
    // Spawn enemies
    for (let i = 0; i < enemyCount; i++) {
        let x, y;
        do { x = Math.floor(Math.random() * size); y = Math.floor(Math.random() * size); } while (newBoard[`${y},${x}`].type !== 'empty');
        
        const type = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
        const floorMultiplier = 1 + (Math.floor(floorNum / 3) * 0.5);
        const enemyId = `enemy_${i}_${Date.now()}`;

        const isElite = Math.random() < 0.1; // 10% chance to be elite
        
        let newEnemy = { 
            ...type,
            id: enemyId,
            baseId: type.id,
            x, y, 
            hp: Math.round(type.hp * floorMultiplier * (isElite ? 1.5 : 1)), 
            maxHp: Math.round(type.hp * floorMultiplier * (isElite ? 1.5 : 1)), 
            atk: Math.round(type.atk * floorMultiplier * (isElite ? 1.2 : 1)),
            isElite,
        };
        if (isElite) {
            newEnemy.name = `Dire ${type.name}`;
        }
        
        newEnemies.push(newEnemy);
        newBoard[`${y},${x}`] = { type: 'enemy', enemyId: enemyId };
    }
  

    // Spawn keyholder
    let kx, ky;
    do { kx = Math.floor(Math.random() * size); ky = Math.floor(Math.random() * size); } while (newBoard[`${ky},${kx}`].type !== 'empty');
    const keyholderDef = dungeonDefinitions.enemies.find(e => e.id === 'keyholder_orc');
    const keyholderFloorMultiplier = 1 + (Math.floor(floorNum / 3) * 0.5);
    const keyholderInstance = {
      ...keyholderDef,
      id: 'keyholder_instance',
      baseId: keyholderDef.id,
      hp: Math.round(keyholderDef.hp * keyholderFloorMultiplier),
      maxHp: Math.round(keyholderDef.hp * keyholderFloorMultiplier),
      atk: Math.round(keyholderDef.atk * keyholderFloorMultiplier),
      x: kx, y: ky
    };
    newEnemies.push(keyholderInstance);
    newBoard[`${ky},${kx}`] = { type: 'enemy', enemyId: keyholderInstance.id };

    // Place hatch and chests
    let hx, hy;
    do { hx = Math.floor(Math.random() * size); hy = Math.floor(Math.random() * size); } while (newBoard[`${hy},${hx}`].type !== 'empty' || (hx === 1 && hy === 1));
    newBoard[`${hy},${hx}`] = { type: 'hatch' };
    for (let i = 0; i < 2; i++) {
        let cx, cy;
        do { cx = Math.floor(Math.random() * size); cy = Math.floor(Math.random() * size); } while (newBoard[`${cy},${cx}`].type !== 'empty');
        newBoard[`${cy},${cx}`] = { type: 'chest', opened: false };
    }
    
        newBoard['1,1'] = {type: 'player'};
    return { newBoard, newEnemies, modifier };
  };

    const handleSelectClass = (className) => {
    const classDef = dungeonDefinitions.classes[className];
    const { newBoard, newEnemies, modifier } = generateFloor(1);

    // Initialize ability uses for the selected class
    const initialAbilityUses = {};
    dungeonDefinitions.attacks
      .filter(a => a.class === className)
      .forEach(a => {
        initialAbilityUses[a.id] = a.maxUses;
      });

    const initialPlayerState = {
      id: 'player',
      entityType: 'player',
      name: classDef.name,
      x: 1, y: 1, hp: classDef.startingHp, hasKey: false, activeEffects: [],
      moveCost: classDef.moveCost, attackCost: classDef.attackCost, attackRange: classDef.attackRange,
      abilityUses: initialAbilityUses,
      lastWeaponSwitchFloor: 0,
    };
    
    const startingWeaponId = Object.values(dungeonDefinitions.primaryWeapons[className])[0][0].id;

        const newGameState = {
      ...generateInitialDungeonState(),
      phase: 'playing',
      floorModifier: modifier,
      ownedWeapons: [startingWeaponId],
      equippedWeapon: startingWeaponId,
      turnCount: 1,
      playerClass: className,
      board: newBoard,
      enemies: newEnemies,
      log: [`You have entered the dungeon as a ${classDef.name}!`],
      player: initialPlayerState,
    };

    setLocalDungeonState(newGameState);
        updateStatsInFirestore({
      dungeon_state: newGameState,
      'dungeon_wingmen.equipped': pendingEquippedWingman || null // Ensure null instead of undefined
    });
  };

    const goToNextFloor = () => {
    const nextFloor = localDungeonState.floor + 1;
    const { newBoard, newEnemies, modifier } = generateFloor(nextFloor);
    let updatedEffects = (localDungeonState.player.activeEffects || []).map(effect => ({ ...effect, remainingFloors: effect.remainingFloors - 1 })).filter(effect => effect.remainingFloors > 0);
    let newAbilityUses = { ...localDungeonState.player.abilityUses };
    let newLogMessages = [{ message: `You descended to floor ${nextFloor}.`, style: 'text-slate-300' }];

    if (nextFloor % 5 === 0) {
      newLogMessages.unshift({ message: `You feel re-energized. Ability uses have been restored!`, style: 'text-cyan-400 font-bold' });
      dungeonDefinitions.attacks.filter(a => a.class === localDungeonState.playerClass).forEach(a => { newAbilityUses[a.id] = a.maxUses; });
    }

        const nextState = {
        ...localDungeonState,
        floor: nextFloor,
        floorModifier: modifier,
        board: newBoard,
        enemies: newEnemies,
        player: { ...localDungeonState.player, x: 1, y: 1, hasKey: false, activeEffects: updatedEffects, abilityUses: newAbilityUses },
        log: newLogMessages,
        turnCount: 1, // FIX: Reset turn count on new floor
    };
    setLocalDungeonState(nextState);
    updateStatsInFirestore({
        dungeon_floor: Math.max(stats.dungeon_floor || 1, nextFloor),
        dungeon_state: nextState
    }).then(() => {
        // Pass the achievement check function down from App
        processAchievement('dungeonFloors', nextFloor);
    });
  };

  const handleTileClick = (x, y, actorType = 'player') => {
    if (activeTurn !== actorType || localDungeonState.gameOver || !localDungeonState.playerClass) return;
    
    const actor = actorType === 'player' ? localDungeonState.player : localDungeonState.wingman;
    if (!actor) return;

    if (attackTarget && typeof attackTarget === 'object' && attackTarget.type === 'secondary') {
      const targetTile = localDungeonState.board[`${y},${x}`];
      if (targetTile.type === 'enemy') {
        const enemy = localDungeonState.enemies.find(e => e.id === targetTile.enemyId);
        if (enemy) handleAttack('player', enemy, 'secondary');
      } else { addLog("No enemy at that location. Attack cancelled.", 'text-yellow-400'); }
      setAttackTarget(null);
      return;
    }
    
    const currentAP = actorType === 'player' ? playerActionPoints : wingmanActionPoints;
    const moveCostAP = actorType === 'player' ? 1 : (actor.moveCost || 1);
    if (currentAP < moveCostAP) { addLog("Not enough action points to move.", "text-yellow-400"); return; }

    const targetTile = localDungeonState.board[`${y},${x}`];
    if (abilityTarget && actorType === 'player') {
      if (targetTile.type === 'enemy') {
        const enemy = localDungeonState.enemies.find(e => e.id === targetTile.enemyId);
        if (enemy) handleAttack('player', enemy, abilityTarget);
      } else { addLog("No enemy at that location. Ability cancelled.", 'text-yellow-400'); }
      setAbilityTarget(null);
      return;
    }
    if (attackTarget && actorType === 'player') {
      if (targetTile.type === 'enemy') {
        const enemy = localDungeonState.enemies.find(e => e.id === targetTile.enemyId);
        if (enemy) handleAttack(actorType, enemy, attackTarget.type);
      } else { addLog("No enemy at that location. Attack cancelled.", 'text-yellow-400'); }
      setAttackTarget(null);
      return;
    }

    const bonusMoveEffect = actor.activeEffects?.find(e => e.type === 'bonus_move');
    const moveRange = actorType === 'player' ? 1.5 : (actor.moveRange || 1.5) + (bonusMoveEffect ? bonusMoveEffect.amount : 0);

    // Generic movement logic
    if (Math.hypot(x - actor.x, y - actor.y) > moveRange) { addLog("You can only move to adjacent tiles."); return; }
    if (targetTile.type === 'wall') { addLog("You can't move through a wall."); return; }
    if (targetTile.type === 'enemy') { addLog("You cannot move onto an enemy's tile."); return; }
    
    if (actorType === 'player') {
      if (targetTile.type === 'hatch' && !localDungeonState.player.hasKey) { addLog("The hatch is locked. You need a key."); return; }
      const moveCostXP = localDungeonState.player.moveCost || 5;
      if (sessionXp < moveCostXP) { addLog(`Not enough XP to move (costs ${moveCostXP}).`, 'text-red-400'); return; }
      setSessionXp(prevXp => prevXp - moveCostXP);
    } else { // Wingman-specific checks
      // Wingmen can't pick up items or use hatches
      if (['hatch', 'key', 'chest'].includes(targetTile.type)) { addLog("Your wingman cannot interact with that.", "text-yellow-400"); return; }
    }
    
    const distance = Math.round(Math.hypot(x - actor.x, y - actor.y));
    if (actorType === 'wingman') setWingmanTurnState(prev => ({ ...prev, distanceMoved: prev.distanceMoved + distance }));

    let newGold = sessionGold || 0;
    const actorStartPos = { x: actor.x, y: actor.y };
    const newBoard = { ...localDungeonState.board };
    let newActorState = { ...actor }; // Create a mutable copy of the actor
    let apDrained = false;

    if (targetTile.type === 'trap' && !targetTile.triggered) {
      const trapDamage = 15;
      newActorState.hp -= trapDamage;
      addLog(`${newActorState.name || 'You'} triggered a trap for ${trapDamage} damage!`, 'text-orange-400');
      newBoard[`${y},${x}`] = { ...targetTile, triggered: true }; // Trap becomes inert
    }
    
    if (targetTile.type === 'cobweb') {
        addLog(`${newActorState.name || 'You'} are slowed by a thick cobweb!`, 'text-slate-400');
        apDrained = true;
        // The cobweb is a one-time obstacle, so it's removed after being triggered.
        // We'll place the actor on an empty tile where the cobweb was.
        newBoard[`${y},${x}`] = { type: 'empty' };
    }


    newBoard[`${actorStartPos.y},${actorStartPos.x}`] = { type: 'empty' };
    newBoard[`${y},${x}`] = { type: actorType }; // 'player' or 'wingman'
    
    let newState = { ...localDungeonState, board: newBoard };
    if (actorType === 'player') {
        newState.player = { ...newActorState, x, y };
        newState.lastMoveTrails = [actorStartPos];
    } else {
        newState.wingman = { ...newActorState, x, y };
        newState.lastMoveTrails = [...(newState.lastMoveTrails || []), actorStartPos];
    }

    if (actorType === 'player') {
      if (targetTile.type === 'key') {
        newState.player.hasKey = true;
        newState.log.unshift({ id: Date.now(), message: `You picked up the key!`, style: 'text-yellow-400 font-bold' });
      }
      if (targetTile.type === 'chest' && !targetTile.opened) {
        let goldFound = Math.floor(Math.random() * (20 + localDungeonState.floor * 5)) + 10;
        newGold += goldFound;
        newState.log.unshift({ id: Date.now(), message: `You opened a chest and found ${goldFound} gold!`, style: 'text-yellow-400 font-bold' });
        newBoard[`${y},${x}`].opened = true;
      }
      if (targetTile.type === 'hatch') {
        if (localDungeonState.player.hasKey) { goToNextFloor(); return; }
        else { newState.log.unshift({ id: Date.now(), message: "The hatch is locked. You need a key.", style: 'text-yellow-400' }); }
      }
    }
    
    setLocalDungeonState(newState);
    setSessionGold(newGold);
    
    // --- Action Point Deduction and Turn Progression ---
    const newAP = currentAP - moveCostAP;
    if (actorType === 'player') {
      setPlayerActionPoints(newAP);
      if (newAP <= 0) {
        if (localDungeonState.wingman) setActiveTurn('wingman');
        else { setActiveTurn('enemy'); setTimeout(processEnemyTurns, 100); }
      }
    } else {
      setWingmanActionPoints(newAP);
      if (newAP <= 0) {
        setActiveTurn('enemy');
        setTimeout(processEnemyTurns, 100);
      }
    }
  };

// In App.js, inside the DungeonCrawler component

const handleAttack = (actorType, targetEnemy, attackId = 'primary') => {
    const actor = actorType === 'player' ? localDungeonState.player : localDungeonState.wingman;
    if (!actor) return;
    const actorStyle = actor.combatStyle || dungeonDefinitions.classes[actor.name.toLowerCase()]?.combatStyle;

    let weaponDef = null;
    let isAbility = false;
    
    if (actorType === 'player') {
        const playerClass = localDungeonState.playerClass;
        if (attackId === 'primary') {
            if (playerClass && dungeonDefinitions.primaryWeapons[playerClass]) {
                const classWeapons = dungeonDefinitions.primaryWeapons[playerClass];
                const allWeaponTypesForClass = Object.values(classWeapons).flat();
                weaponDef = allWeaponTypesForClass.find(w => w.id === localDungeonState.equippedWeapon);
            }
        } else if (attackId === 'secondary') {
            weaponDef = dungeonDefinitions.offhandWeapons.find(w => w.id === localDungeonState.equippedOffhandWeapon);
        } else {
            weaponDef = dungeonDefinitions.attacks.find(a => a.id === attackId);
            isAbility = true;
        }
    } else {
        weaponDef = { attackRange: actor.attackRange, attack: actor.atk };
    }

    if (!weaponDef) { addLog("Error: Could not find weapon or ability definition.", "text-red-500"); return; }

    const currentAP = actorType === 'player' ? playerActionPoints : wingmanActionPoints;
    const attackCostAP = actorType === 'player' ? 1 : (actor.attackCost || 1);
    if (currentAP < attackCostAP) { addLog("Not enough action points to attack.", "text-yellow-400"); return; }

    const distance = Math.hypot(targetEnemy.x - actor.x, targetEnemy.y - actor.y);
    const attackRange = weaponDef.attackRange || weaponDef.range;

    if (distance > attackRange) { addLog("Target is out of range.", 'text-yellow-400'); setAttackTarget(null); setAbilityTarget(null); return; }

    if (isAbility) {
        if (sessionXp < weaponDef.cost) { addLog(`Not enough XP for ${weaponDef.name}.`, 'text-red-400'); setAttackTarget(null); setAbilityTarget(null); return; }
        if ((actor.abilityUses[attackId] || 0) <= 0) { addLog(`No uses left for ${weaponDef.name}.`, 'text-yellow-400'); return; }
        setSessionXp(prevXp => prevXp - weaponDef.cost);
    }
    
    if (weaponDef.accuracy && Math.random() > weaponDef.accuracy) {
        addLog(`${actor.name || 'Your'} attack missed!`, "text-yellow-400");
    } else {
        let isGameOver = false;
        setLocalDungeonState(prevState => {
            let newState = JSON.parse(JSON.stringify(prevState));
            let { enemies, board, player, log } = newState;
            
            
            if (isAbility) player.abilityUses[attackId]--;

            let baseAttackPower = actorType === 'player' ? (weaponDef.attack || fullPlayerStats.attack) : (newState.wingman.atk || 0);
            let damageMultiplier = isAbility ? (weaponDef.effect?.damageMultiplier || 1) : 1;
            
            const chargeEffect = player.activeEffects?.find(e => e.type === 'charge');
            if (chargeEffect) {
                damageMultiplier *= (chargeEffect.level + 1);
                player.activeEffects = player.activeEffects.filter(e => e.type !== 'charge');
                log.unshift({ id: Date.now() + Math.random(), message: `Unleashed a charged attack!`, style: 'text-cyan-400 font-bold' });
            }

            const mainTarget = enemies.find(e => e.id === targetEnemy.id);
            if (!mainTarget) return prevState;

            let enemiesHitThisAction = new Set();

            const processHit = (target, dmgMultiplier = 1.0, isChain = false) => {
                if (!target || enemiesHitThisAction.has(target.id)) return;
                enemiesHitThisAction.add(target.id);

                // --- NEW: Combat Triangle Logic ---
                const targetStyle = target.combatStyle;
                let advantageModifier = 1.0;
                if (actorStyle === 'Martial' && targetStyle === 'Finesse') advantageModifier = 1.3;
                else if (actorStyle === 'Martial' && targetStyle === 'Arcane') advantageModifier = 0.7;
                else if (actorStyle === 'Finesse' && targetStyle === 'Arcane') advantageModifier = 1.3;
                else if (actorStyle === 'Finesse' && targetStyle === 'Martial') advantageModifier = 0.7;
                else if (actorStyle === 'Arcane' && targetStyle === 'Martial') advantageModifier = 1.3;
                else if (actorStyle === 'Arcane' && targetStyle === 'Finesse') advantageModifier = 0.7;
                
                let finalDamage = Math.round(baseAttackPower * damageMultiplier * dmgMultiplier * advantageModifier);

                // NEW: Volatile Magic modifier
                if (newState.floorModifier?.id === 'volatile_magic') {
                    finalDamage = Math.round(finalDamage * 1.25);
                }
                
                // --- NEW: Defensive Tile Logic ---
                const targetTile = board[`${target.y},${target.x}`];
                if (targetTile && targetTile.type === 'rubble') {
                    finalDamage = Math.round(finalDamage * 0.8); // 20% damage reduction
                    log.unshift({ id: Date.now() + Math.random(), message: `${target.name} takes cover in the rubble!`, style: 'text-stone-400' });
                }

                let targetArmor = target.armor || 0;
                const armorBreakEffect = target.statusEffects?.find(e => e.type === 'armor_break');
                if (armorBreakEffect) targetArmor = Math.max(0, targetArmor - armorBreakEffect.amount);

                const armorPiercing = (actorType === 'player' && weaponDef.armorPiercing) ? weaponDef.armorPiercing : 0;
                finalDamage = Math.max(1, finalDamage - Math.max(0, targetArmor - armorPiercing));
                
                target.hp -= finalDamage;
                log.unshift({ id: Date.now() + Math.random(), message: `${isChain ? "Chain hits" : (actor.name || 'You') + " hit"} ${target.name} for ${finalDamage} damage.`, style: 'text-slate-300' });
                setAnimationState(prev => ({ ...prev, hits: { ...prev.hits, [target.id]: Date.now() } }));

                if (actorType === 'player' && weaponDef.lifesteal) {
                    const healedAmount = Math.round(finalDamage * weaponDef.lifesteal);
                    player.hp = Math.min(fullPlayerStats.maxHp, player.hp + healedAmount);
                }

                if (actorType === 'player' && !isChain && weaponDef.statusEffect && Math.random() < weaponDef.statusEffect.chance) {
                    if (!target.statusEffects) target.statusEffects = [];
                    target.statusEffects = target.statusEffects.filter(e => e.type !== weaponDef.statusEffect.type);
                    target.statusEffects.push({ ...weaponDef.statusEffect });
                    log.unshift({ id: Date.now() + Math.random(), message: `${target.name} is now ${weaponDef.statusEffect.type}!`, style: 'text-yellow-400' });
                }
                return finalDamage;
            };
            
            processHit(mainTarget);

            if (actorType === 'player') {
                if (weaponDef.cleave) enemies.forEach(e => { if (Math.hypot(e.x - mainTarget.x, e.y - mainTarget.y) < 1.6) processHit(e, weaponDef.cleave, true); });
                if (weaponDef.aoeRange) enemies.forEach(e => { if (Math.hypot(e.x - mainTarget.x, e.y - mainTarget.y) <= weaponDef.aoeRange) processHit(e); });

                if (weaponDef.multishot) {
                    const otherTargets = enemies.filter(e => e.id !== mainTarget.id && Math.hypot(e.x - player.x, e.y - player.y) <= attackRange);
                    for(let i=0; i < weaponDef.multishot - 1 && i < otherTargets.length; i++) {
                        processHit(otherTargets[i]);
                    }
                }
                if (weaponDef.chain) {
                    let lastTarget = mainTarget;
                    let lastDamage = baseAttackPower * damageMultiplier;
                    for (let i = 0; i < weaponDef.chain.count; i++) {
                        const nextTarget = enemies.filter(e => !enemiesHitThisAction.has(e.id) && Math.hypot(e.x - lastTarget.x, e.y - lastTarget.y) <= weaponDef.chain.range).sort((a,b) => Math.hypot(a.x - lastTarget.x, a.y - lastTarget.y) - Math.hypot(b.x - lastTarget.x, b.y - lastTarget.y))[0];
                        if (nextTarget) {
                            lastDamage *= weaponDef.chain.falloff;
                            processHit(nextTarget, (lastDamage / baseAttackPower), true);
                            lastTarget = nextTarget;
                        } else break;
                    }
                }
            }

            let newEnemiesToAdd = [];
            newState.enemies = enemies.filter(enemy => {
              if (enemy.hp <= 0) {
                log.unshift({ id: Date.now() + Math.random(), message: `You defeated the ${enemy.name}!`, style: 'text-green-400' });
                board[`${enemy.y},${enemy.x}`] = { type: enemy.baseId === 'keyholder_orc' ? 'key' : 'empty' };
                if (enemy.loot && Math.random() < enemy.loot.chance) addIngredientToInventory(enemy.loot.id);
                if (enemy.rareLoot && Math.random() < enemy.rareLoot.chance) addIngredientToInventory(enemy.rareLoot.id);
                
                // --- RE-INTEGRATED SPLIT LOGIC ---
                if (enemy.onDefeat?.type === 'split') {
                  const oozeDef = dungeonDefinitions.enemies.find(e => e.id === enemy.onDefeat.into);
                  if (oozeDef) {
                    for (let i = 0; i < enemy.onDefeat.count; i++) {
                      const adjacent = [{x:0,y:1}, {x:0,y:-1}, {x:1,y:0}, {x:-1,y:0}].map(d => ({x: enemy.x+d.x, y: enemy.y+d.y}));
                      const emptyTile = adjacent.find(t => board[`${t.y},${t.x}`]?.type === 'empty');
                      if(emptyTile) {
                        const newOoze = { ...oozeDef, id: `ooze_${Date.now()}_${i}`, baseId: oozeDef.id, x: emptyTile.x, y: emptyTile.y, maxHp: oozeDef.hp };
                        newEnemiesToAdd.push(newOoze);
                        board[`${emptyTile.y},${emptyTile.x}`] = { type: 'enemy', enemyId: newOoze.id };
                      }
                    }
                    log.unshift({ id: Date.now() + Math.random(), message: `The ${enemy.name} splits into smaller oozes!`, style: 'text-lime-400' });
                  }
                }
                return false;
              }
              return true;
            }).concat(newEnemiesToAdd);

            if (player.hp <= 0) isGameOver = true;
            return newState;
        });
        if (isGameOver) { handleGameOver(); return; }
    }

    setAttackTarget(null); setAbilityTarget(null);
    const newAP = currentAP - attackCostAP;
    if (actorType === 'player') {
      setPlayerActionPoints(newAP);
      if (newAP <= 0) {
        if (localDungeonState.wingman) setActiveTurn('wingman');
        else { setActiveTurn('enemy'); setTimeout(processEnemyTurns, 100); }
      }
    } else {
      setWingmanActionPoints(newAP);
      if (newAP <= 0) { setActiveTurn('enemy'); setTimeout(processEnemyTurns, 100); }
    }
};



  const handleBuyItem = (item, type, currency) => {
    const cost = item.cost;
    if (currency === 'xp' && sessionXp < cost) { showMessageBox("Not enough XP!", 'error'); return; }
    if (currency === 'gold' && sessionGold < cost) { showMessageBox("Not enough Gold!", 'error'); return; }

    setLocalDungeonState(prev => {
        const newState = { ...prev };
        if (type === 'primaryWeapon') newState.ownedWeapons = [...(newState.ownedWeapons || []), item.id];
        else if (type === 'offhandWeapon') newState.ownedOffhandWeapons = [...(newState.ownedOffhandWeapons || []), item.id];
        else if (type === 'armor') newState.ownedArmor = [...(newState.ownedArmor || []), item.id];
        else if (type === 'potion') newState.potions = (newState.potions || 0) + 1;
        else if (type === 'temp_potion') {
             const existingEffects = newState.player.activeEffects || [];
             const effectIndex = existingEffects.findIndex(e => e.id === item.id);
             if (effectIndex > -1) existingEffects[effectIndex].remainingFloors = item.duration;
             else existingEffects.push({ id: item.id, remainingFloors: item.duration });
             newState.player.activeEffects = existingEffects;
        }
        return newState;
    });

    if (currency === 'xp') setSessionXp(prev => prev - cost);
    if (currency === 'gold') setSessionGold(prev => prev - cost);
    
    showMessageBox(`Purchased ${item.name}! Go to the Armory to equip it.`, 'info');
  };
  
  const handleBuyStat = (stat) => {
    if (sessionXp < 300) { showMessageBox("Not enough XP!", 'error'); return; }

    setLocalDungeonState(prev => ({ ...prev, boughtStats: { ...prev.boughtStats, [stat]: (prev.boughtStats[stat] || 0) + 10 } }));
    setSessionXp(prev => prev - 300);

    showMessageBox(`Bought +10 ${stat}! (Changes will be saved at the next checkpoint)`, 'info');
  };

  const handleBuyPotion = () => {
    // Check against the immediate session XP, not the potentially stale profile prop
    if (sessionXp < 100) { 
      showMessageBox("Not enough XP.", "error"); 
      return; 
    }
    // Update local state, don't write to Firestore directly
    setLocalDungeonState(prev => ({ ...prev, potions: (prev.potions || 0) + 1 }));
      setSessionXp(prev => prev - 100);
      showMessageBox("Bought a potion! (Changes will be saved at the next checkpoint)", 'info');
  };
  
  const handleEquipItem = (item, type) => {
    if (!item) return;

    if (type === 'primaryWeapon') {
        if (localDungeonState.floor <= localDungeonState.player.lastWeaponSwitchFloor) {
            showMessageBox("You can only switch your primary weapon once per floor.", "error");
            return;
        }
        setLocalDungeonState(prev => ({ ...prev, equippedWeapon: item.id, player: { ...prev.player, lastWeaponSwitchFloor: prev.floor } }));
    } else if (type === 'offhandWeapon') {
        setLocalDungeonState(prev => ({ ...prev, equippedOffhandWeapon: item.id }));
    } else if (type === 'armor') {
        setLocalDungeonState(prev => ({ ...prev, equippedArmor: item.id }));
    }
    setSelectedArmoryItem(null); // Close the details panel after equipping
  };

  const handleWingmanAbilityClick = (ability) => {
    setAttackTarget(null); // Cancel any attack targeting
    setWingmanAbilityTarget(ability);
    addLog(`Select a target for ${ability.name}.`, 'text-cyan-400');
  };

  const findEnemy = (enemyId) => {
    // This function is now defined within the component scope.
    // It uses a ref to the latest state to avoid stale closures in callbacks.
    const state = dungeonStateRef.current;
    return state.enemies.find(e => e.id === enemyId);
  };

  const handleCharge = useCallback(() => {
    if (playerActionPoints < 1) {
      addLog("Not enough AP to charge.", "text-yellow-400");
      return;
    }

    setLocalDungeonState(prev => {
      const newState = JSON.parse(JSON.stringify(prev)); // Deep copy
      let effects = newState.player.activeEffects || [];
      const chargeEffect = effects.find(e => e.type === 'charge');
      
      if (chargeEffect) {
        chargeEffect.level += 1;
      } else {
        effects.push({ type: 'charge', level: 1 });
      }
      
      newState.player.activeEffects = effects;
      return newState;
    });

    setPlayerActionPoints(prev => prev - 1);
    addLog("You focus your energy...", "text-cyan-300");
  }, [playerActionPoints, addLog]);

  const handleUseWingmanAbility = (target, isFrenzied = false) => {
    const wingman = localDungeonState.wingman;
    const abilityId = isFrenzied ? 'savage_rush' : wingmanAbilityTarget.id;
    const ability = wingman.abilities.find(a => a.id === abilityId);

    if (!wingman || !ability) return;

    if (!isFrenzied && wingmanActionPoints < ability.cost) {
        addLog(`Not enough AP for ${ability.name}.`, "text-yellow-400");
        setWingmanAbilityTarget(null);
        return;
    }

    const distance = Math.hypot(target.x - wingman.x, target.y - wingman.y);
    if (!isFrenzied && distance > ability.range) {
        addLog(`Target is out of range for ${ability.name}.`, "text-yellow-400");
        setWingmanAbilityTarget(null);
        return;
    }
    
    let success = false;
    setLocalDungeonState(prevState => {
        let newState = JSON.parse(JSON.stringify(prevState));
        let enemyTarget = target.entityType === 'enemy' ? newState.enemies.find(e => e.id === target.id) : null;
        let friendlyTarget = (target.id === 'player' || target.id === wingman.id) ? (target.id === 'player' ? newState.player : newState.wingman) : null;
        
        
        const applyDamage = (enemy, damage, armorPiercing = 0) => {
            let finalDamage = damage - Math.max(0, (enemy.armor || 0) - armorPiercing);
            finalDamage = Math.max(1, Math.round(finalDamage));
            enemy.hp -= finalDamage;
            newState.log.unshift({ id: Date.now() + Math.random(), message: `${wingman.name} hits ${enemy.name} for ${finalDamage} damage!`, style: 'text-orange-400' });
            setAnimationState(prev => ({ ...prev, hits: { ...prev.hits, [enemy.id]: Date.now() } }));
            return finalDamage;
        };

        switch(ability.id) {
            case 'taunt': {
                if (enemyTarget) {
                    if (!enemyTarget.statusEffects) enemyTarget.statusEffects = [];
                    enemyTarget.statusEffects = enemyTarget.statusEffects.filter(e => e.type !== 'taunted');
                    enemyTarget.statusEffects.push({ type: 'taunted', duration: ability.duration });
                    newState.log.unshift({ id: Date.now() + Math.random(), message: `${wingman.name} taunts ${enemyTarget.name}!`, style: 'text-cyan-400' });
                    if (ability.specialization === 'knight_ability_a') {
                        enemyTarget.statusEffects.push({ type: 'attack_debuff', multiplier: 0.8, duration: ability.duration });
                    } else if (ability.specialization === 'knight_ability_b') {
                        if(!newState.wingman.activeEffects) newState.wingman.activeEffects = [];
                        newState.wingman.activeEffects.push({ type: 'counter_attack', power: 0.5, duration: ability.duration });
                    }
                    success = true;
                }
                break;
            }
            case 'heal': {
                 if (target.id === 'player' || target.id === wingman.id) {
                    const isPlayer = target.id === 'player';
                    const healedActor = isPlayer ? newState.player : newState.wingman;
                    const maxHp = isPlayer ? fullPlayerStats.maxHp : wingman.maxHp;
                    const newHp = Math.min(maxHp, healedActor.hp + ability.power);
                    if (newHp > healedActor.hp) newState.log.unshift({ id: Date.now() + Math.random(), message: `${wingman.name} heals for ${newHp - healedActor.hp} HP.`, style: 'text-green-400' });
                    healedActor.hp = newHp;
                    if (ability.specialization === 'cleric_ability_a') { // Purifying Light
                        healedActor.statusEffects = (healedActor.statusEffects || []).filter(e => e.isPositive);
                    } else if (ability.specialization === 'cleric_ability_b') { // Divine Favor
                        if(!healedActor.activeEffects) healedActor.activeEffects = [];
                        healedActor.activeEffects.push({ type: 'damage_buff', multiplier: 1.15, durationTurns: 1 });
                    }
                    success = true;
                }
                break;
            }
            case 'firebolt': {
              if(enemyTarget) {
                applyDamage(enemyTarget, ability.power);
                if (ability.specialization === 'mage_ability_a') {
                  if (!enemyTarget.statusEffects) enemyTarget.statusEffects = [];
                  enemyTarget.statusEffects.push({ type: 'burning', damage: Math.round(ability.power * 0.2), duration: 2 });
                } else if (ability.specialization === 'mage_ability_b') {
                  if (!enemyTarget.statusEffects) enemyTarget.statusEffects = [];
                  enemyTarget.statusEffects.push({ type: 'chilled', reduction: 1, duration: 1 });
                }
                success = true;
              }
              break;
            }
            case 'fortify': {
                if (target.id === wingman.id) {
                    if (!newState.wingman.activeEffects) newState.wingman.activeEffects = [];
                    newState.wingman.activeEffects = newState.wingman.activeEffects.filter(e => e.id !== 'fortify');
                    
                    let tempHpGain = ability.effect.tempHp;
                    let effectToAdd = { id: 'fortify', duration: ability.duration, tempHp: tempHpGain };

                    // Apply specialization logic
                    if (ability.specialization === 'heavy_ability_a') { // Reinforced Plating
                        tempHpGain += 20;
                        effectToAdd.tempHp = tempHpGain;
                    } else if (ability.specialization === 'heavy_ability_b') { // Retaliation
                        effectToAdd.specialization = 'heavy_ability_b'; // Add specialization to the effect for later checks
                    }
                    
                    newState.wingman.activeEffects.push(effectToAdd);
                    newState.wingman.hp += tempHpGain;
                    newState.wingman.maxHp += tempHpGain; 
                    
                    newState.log.unshift({ id: Date.now() + Math.random(), message: `${wingman.name} fortifies for ${tempHpGain} HP!`, style: 'text-cyan-400' });
                    success = true;
                }
                break;
            }
            case 'divine_shield': {
                if (target.id === wingman.id) {
                    if (!newState.wingman.activeEffects) newState.wingman.activeEffects = [];
                    const tempHpGain = ability.effect.tempHp;
                    
                    if (tempHpGain > 0) {
                        newState.wingman.hp += tempHpGain;
                        newState.wingman.maxHp += tempHpGain;
                    }
                    const effect = { 
                        id: ability.id, 
                        duration: ability.duration, 
                        specialization: ability.specialization,
                        tempHp: tempHpGain, // Store shield value for damage calculation
                    };
                    newState.wingman.activeEffects.push(effect);
                    newState.log.unshift({ id: Date.now() + Math.random(), message: `${wingman.name} gains a divine shield for ${tempHpGain} HP!`, style: 'text-yellow-300' });
                    success = true;
                }
                break;
            }
            case 'riposte': {
                if (!newState.wingman.activeEffects) newState.wingman.activeEffects = [];
                let tempHpGain = 0;
                if (ability.id === 'fortify') tempHpGain = ability.effect.tempHp + (ability.specialization === 'heavy_ability_a' ? 20 : 0);
                if (ability.id === 'divine_shield') tempHpGain = ability.effect.tempHp;
                if (tempHpGain > 0) {
                    newState.wingman.hp += tempHpGain;
                    newState.wingman.maxHp += tempHpGain;
                }
                // Add new effect with specialization details
                const effect = { id: ability.id, duration: ability.duration, specialization: ability.specialization };
                newState.wingman.activeEffects.push(effect);
                newState.log.unshift({ id: Date.now() + Math.random(), message: `${wingman.name} uses ${ability.name}!`, style: 'text-cyan-400' });
                success = true;
                break;
            }
            case 'sunder': {
                if(enemyTarget) {
                    const damageDealt = applyDamage(enemyTarget, ability.power, ability.armorPiercing);
                    if (ability.specialization === 'undead_ability_a') enemyTarget.armor = Math.max(0, (enemyTarget.armor || 0) - 2);
                    else if (ability.specialization === 'undead_ability_b') newState.wingman.hp = Math.min(newState.wingman.maxHp, newState.wingman.hp + Math.round(damageDealt * 0.3));
                    success = true;
                }
                break;
            }
            case 'shadow_strike': {
                if (enemyTarget) {
                    applyDamage(enemyTarget, ability.power, ability.armorPiercing);
                    if (ability.specialization === 'rogue_ability_a') {
                        if (!enemyTarget.statusEffects) enemyTarget.statusEffects = [];
                        enemyTarget.statusEffects.push({ type: 'poison', damage: 5, duration: 3 });
                    } else if (ability.specialization === 'rogue_ability_b') {
                         if (!newState.wingman.activeEffects) newState.wingman.activeEffects = [];
                         newState.wingman.activeEffects.push({ type: 'bonus_move', amount: 1, durationTurns: 1});
                    }
                    success = true;
                }
                break;
                
            }
            case 'piercing_lance': {
                if(enemyTarget) {
                    let damage = ability.power;
                    if (ability.specialization === 'cavalier_ability_b') { // Momentum
                        const bonus = Math.min(0.5, (wingmanTurnState.distanceMoved || 0) * 0.1); // 10% bonus per tile, max 50%
                        damage *= (1 + bonus);
                    }
                    applyDamage(enemyTarget, damage);

                    if (ability.specialization === 'cavalier_ability_a') { // Trample
                        const dx = enemyTarget.x - wingman.x;
                        const dy = enemyTarget.y - wingman.y;
                        const behindX = enemyTarget.x + dx;
                        const behindY = enemyTarget.y + dy;
                        const behindTarget = newState.enemies.find(e => e.x === behindX && e.y === behindY);
                        if(behindTarget) {
                            applyDamage(behindTarget, damage * 0.5);
                            newState.log.unshift({ id: Date.now(), message: `The attack pierces through to ${behindTarget.name}!`, style: 'text-orange-300' });
                        }
                    }
                    success = true;
                }
                break;
            }
             case 'savage_rush': {
                if (enemyTarget) {
                    applyDamage(enemyTarget, ability.power);
                    // Knockback logic...
                    if (ability.specialization === 'warg_ability_a') {
                        if (!enemyTarget.statusEffects) enemyTarget.statusEffects = [];
                        enemyTarget.statusEffects.push({ type: 'crippled', reduction: 2, duration: 1 });
                    } else if (ability.specialization === 'warg_ability_b') {
                        if (!newState.wingman.activeEffects) newState.wingman.activeEffects = [];
                        newState.wingman.activeEffects.push({ type: 'frenzied', durationTurns: 1 });
                    }
                    success = true;
                }
                break;
             }
            default:
                if (enemyTarget) {
                    applyDamage(enemyTarget, ability.power || wingman.atk);
                    success = true;
                }
                break;
        }
        return newState;
    });

    if (success) {
        if (isFrenzied) {
            setWingmanTurnState(prev => ({ ...prev, frenziedAttackAvailable: false }));
        } else {
            const newAP = wingmanActionPoints - ability.cost;
            setWingmanActionPoints(newAP);
            if (newAP <= 0) {
              setActiveTurn('enemy');
              setTimeout(processEnemyTurns, 100);
            }
        }
    }
    setWingmanAbilityTarget(null);
  };
  
  const handleFriendlyClick = (e, target) => {
    e.stopPropagation();
    if (activeTurn === 'wingman' && wingmanAbilityTarget?.id === 'heal') {
        handleUseWingmanAbility(target);
    }
  };

  const usePotion = () => {
      if(!localDungeonState || (localDungeonState.potions || 0) <= 0) { 
        addLog("You have no potions.", 'text-yellow-400'); 
        return; 
      }
      
      setLocalDungeonState(prevState => {
        // Use the memoized fullPlayerStats to get the current maxHp
        const currentMaxHp = fullPlayerStats.maxHp; 
        return {
          ...prevState,
          potions: prevState.potions - 1,
          player: {
              ...prevState.player,
              hp: Math.min(currentMaxHp, prevState.player.hp + 50)
          },
          log: [{ message: "You used a potion and restored 50 HP.", style: 'text-green-400' }, ...(prevState.log || []).slice(0, 4)]
        }
      });
  };

  if (!localDungeonState) {
    return <div className="text-center p-10 text-xl text-slate-400">Loading Dungeon...</div>;
  }

  if (localDungeonState.phase === 'class_selection') {
    return (
      <div className="text-center" style={{backgroundImage: `url('https://www.transparenttextures.com/patterns/dark-brick-wall.png')`}}>
            <h2 className="text-3xl font-bold text-white mb-4">Choose Your Class</h2>
            <p className="text-slate-400 mb-8">Your choice will last for this entire dungeon run.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {Object.entries(dungeonDefinitions.classes).map(([key, c]) => (
                    <div key={key} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex flex-col items-center hover:bg-slate-800/80 transition-colors">
                        <span className="text-6xl mb-4">{c.icon}</span>
                        <h3 className="text-2xl font-bold text-white mb-2">{c.name}</h3>
                        <p className="text-slate-400 text-sm mb-4 flex-grow">{c.description}</p>
                        <button onClick={() => handleSelectClass(key)} className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition-colors">Select</button>
                    </div>
                ))}
            </div>
        </div>
    );
  }
  const renderBoard = () => {
    const size = 10;
    const boardGrid = [];

        const SVGIcons = {
      player: (id) => <div className={`w-8 h-8 text-blue-400 drop-shadow-lg transition-transform ${animationState.hits[id] > Date.now() - 200 ? 'entity-hit' : ''}`}><svg viewBox="0 0 20 20" className="w-full h-full"><path fill="currentColor" d="M10 2a2.5 2.5 0 110 5a2.5 2.5 0 010-5zM5.121 12.121a5.002 5.002 0 018.758 0L15 13.25V18H5v-4.75l.121-.129z"/></svg></div>,
      key: () => <div className="w-8 h-8 text-yellow-400 drop-shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-5.0 -10.0 110.0 135.0" className="w-full h-full"><path fill="currentColor" d="m83.75 17.812 0.3125-0.3125c0.625-0.625 1.25-1.875 1.25-2.8125s-0.625-2.1875-1.25-2.8125c-1.5625-1.5625-4.0625-1.5625-5.625 0l-12.812 12.5c-1.25-0.625-2.8125-0.625-3.75 0.625-0.9375 0.9375-1.25 2.5-0.625 3.75l-29.375 29.375c-1.25-0.625-2.8125-0.625-3.75 0.625-0.625 0.625-0.9375 1.25-0.9375 2.1875-5.3125-2.1875-11.875-1.25-16.25 3.125-5.9375 5.9375-5.9375 15.312 0 20.938 2.8125 2.8125 6.875 4.375 10.625 4.375s7.5-1.5625 10.625-4.375c4.375-4.375 5.625-10.938 3.125-16.25 0.625 0 1.5625-0.3125 2.1875-0.9375s0.9375-1.25 0.9375-2.1875c0-0.625 0-0.9375-0.3125-1.5625l29.375-29.375c0.3125 0.3125 0.9375 0.3125 1.5625 0.3125 0.9375 0 1.5625-0.3125 2.1875-0.9375s0.9375-1.25 0.9375-2.1875c0-0.625 0-0.9375-0.3125-1.5625l0.3125-0.3125 7.1875 7.1875c0.3125 0.3125 0.625 0.3125 0.625 0.3125 0.3125 0 0.625 0 0.625-0.3125l2.1875-2.1875c0.3125-0.3125 0.3125-0.625 0.3125-0.625s0-0.625-0.3125-0.625l-2.8125-2.8125 3.75-3.75 0.9375 0.9375-0.9375 0.9375c-0.3125 0.3125-0.3125 0.625-0.3125 0.625s0 0.625 0.3125 0.625l3.4375 3.4375c0.3125 0.3125 1.25 0.3125 1.5625 0l4.375-4.375c0.625-0.625 0.625-1.25 0.3125-1.5625zm-57.5 61.875c-2.8125 2.8125-7.5 2.8125-10 0-2.8125-2.8125-2.8125-7.5 0-10 2.8125-2.8125 7.5-2.8125 10 0 2.8125 2.5 2.8125 7.1875 0 10zm9.0625-13.438c-0.3125 0.3125-0.9375 0.3125-1.25 0l-4.6875-4.6875c-0.3125-0.3125-0.3125-0.9375 0-1.5625 0.3125-0.3125 0.9375-0.3125 1.25 0l4.6875 4.6875c0.625 0.625 0.625 1.25 0 1.5625zm33.75-33.75c-0.3125 0.3125-0.9375 0.3125-1.25 0l-4.6875-4.6875c-0.3125-0.3125-0.3125-0.9375 0-1.5625 0.3125-0.3125 0.9375-0.3125 1.25 0l4.6875 4.6875c0.625 0.3125 0.625 0.9375 0 1.5625z"/></svg></div>,
      chest_closed:  () => <div className="w-10 h-10 text-amber-500 drop-shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-5.0 -10.0 110.0 135.0" className="w-full h-full"><path fill="currentColor" d="m48.609 45.832v4.168c0 0.76562 0.62109 1.3906 1.3906 1.3906s1.3906-0.62109 1.3906-1.3906v-4.168c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906h-2.7773c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76562 0.62109 1.3906 1.3906 1.3906z"/><path fill="currentColor" d="m70.832 76.391h4.168c3.832 0 6.9453-3.1094 6.9453-6.9453v-27.777c0-9.957-8.0977-18.055-18.055-18.055h-27.777c-9.957 0-18.055 8.0977-18.055 18.055v27.777c0 3.832 3.1094 6.9453 6.9453 6.9453h45.832zm-26.387-27.781v-6.9453c0-0.76562 0.625-1.3906 1.3906-1.3906h8.332c0.76562 0 1.3906 0.625 1.3906 1.3906v11.109c0 0.76562-0.625 1.3906-1.3906 1.3906h-8.332c-0.76563 0-1.3906-0.625-1.3906-1.3906v-4.168zm34.723-6.9414v27.777c0 2.293-1.875 4.168-4.168 4.168 0.875-1.168 1.3906-2.6094 1.3906-4.168v-20.832c0-0.76562-0.625-1.3906-1.3906-1.3906h-16.668v-2.7773h16.668c0.76562 0 1.3906-0.625 1.3906-1.3906v-1.3906c0-5.7773-2.7344-10.93-6.9727-14.234 5.6953 2.207 9.75 7.7656 9.75 14.234zm-54.168 31.941c-2.293 0-4.168-1.875-4.168-4.168v-27.777c0-6.4727 4.0547-12.027 9.75-14.234-4.2344 3.3047-6.9727 8.457-6.9727 14.234v1.3906c0 0.76562 0.625 1.3906 1.3906 1.3906h16.668v2.7773h-16.668c-0.76562 0-1.3906 0.625-1.3906 1.3906v20.832c0 1.5547 0.51562 3 1.3906 4.168z"/><path fill="currentColor" d="m93.785 72.43c-1.3633-0.84375-3.8203-2.7695-4.9688-6.2031-1.6328-4.8945 0.75781-9.1406 1.2539-9.9414 0.40234-0.65234 0.20313-1.5078-0.44922-1.9102s-1.5078-0.20312-1.9141 0.44922c-0.85547 1.3867-3.4961 6.3672-1.5234 12.281 0.91797 2.75 2.5039 4.7148 3.9688 6.0469-2.0469 0.89844-4.5234 2.4688-6.543 5.1875-2.3633 3.1758-3.0586 6.5195-3.1758 9.0195-3.0234-1.8008-6.6562-2.2695-10.023-1.1797-2.9023 0.93359-4.8242 2.7695-6.043 4.4492l-1.9102-7.6289c-0.1875-0.74219-0.94141-1.1992-1.6836-1.0117-0.74609 0.1875-1.1992 0.94141-1.0117 1.6836l2.7773 11.109c0.14844 0.59766 0.67578 1.0234 1.2891 1.0508h0.058594c0.59375 0 1.1211-0.375 1.3125-0.94141 0.16016-0.47266 1.7031-4.668 6.0547-6.0703 3.375-1.0859 7.0938-0.14844 9.707 2.4414 0.42187 0.42188 1.0664 0.52344 1.6016 0.25391 0.53125-0.26953 0.83594-0.84766 0.75-1.4375-0.24219-1.6914-0.48047-6.0547 2.5156-10.086 2.4805-3.3398 5.8008-4.5898 7.5625-5.0391 0.53906-0.13672 0.94531-0.58594 1.0312-1.1367 0.085937-0.55078-0.16797-1.0977-0.64453-1.3906z"/><path fill="currentColor" d="m5.5547 37.5h6.9453c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906h-3.7539c1.4844-1.8906 3.0273-4.5703 3.7266-8.0625 0.79688-3.9844 0.16797-7.4219-0.625-9.8164 2.3242 0.042968 5.1797-0.30469 8.1797-1.6992 3.5391-1.6406 5.8828-4.0781 7.375-6.1992 1.3594 2.8945 3.8086 5.1719 6.8594 6.25 3.1758 1.125 6.0781 0.61328 8.1094-0.12109l-0.66016 2.6406c-0.1875 0.74219 0.26562 1.5 1.0117 1.6836 0.73828 0.18359 1.4961-0.26562 1.6836-1.0117l1.3906-5.5547c0.14062-0.5625-0.082031-1.1523-0.5625-1.4805-0.47656-0.32812-1.1094-0.32422-1.5859 0.007813-0.41016 0.28516-4.1055 2.7539-8.4609 1.2148-3.1445-1.1133-5.457-3.8945-6.0391-7.2617-0.10156-0.59766-0.58203-1.0586-1.1797-1.1406-0.61719-0.082031-1.1836 0.23438-1.4414 0.78516-0.92969 1.9688-3.1602 5.5781-7.6602 7.6641-3.5039 1.6211-6.793 1.5859-8.9375 1.2734-0.50391-0.074219-1.0156 0.13672-1.3203 0.55078-0.30469 0.41406-0.35547 0.96094-0.13672 1.4219 0.875 1.832 2.207 5.6016 1.2812 10.238-0.92969 4.6367-3.6055 7.6055-5.1211 8.9609-0.42969 0.38281-0.57812 0.99219-0.37109 1.5312 0.20312 0.53906 0.72266 0.89453 1.2969 0.89453z"/><path fill="currentColor" d="m69.445 11.109c0.76953 0 1.3906-0.62109 1.3906-1.3906v-1.3906c0-0.76562-0.62109-1.3906-1.3906-1.3906-0.76953 0-1.3906 0.62109-1.3906 1.3906v1.3906c0 0.76562 0.62109 1.3906 1.3906 1.3906z"/><path fill="currentColor" d="m65.277 13.891h1.3906c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906h-1.3906c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76562 0.62109 1.3906 1.3906 1.3906z"/><path fill="currentColor" d="m69.445 13.891c-0.76953 0-1.3906 0.62109-1.3906 1.3906v1.3906c0 0.76562 0.62109 1.3906 1.3906 1.3906 0.76953 0 1.3906-0.62109 1.3906-1.3906v-1.3906c0-0.76562-0.62109-1.3906-1.3906-1.3906z"/><path fill="currentColor" d="m72.223 13.891h1.3906c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906h-1.3906c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76562 0.62109 1.3906 1.3906 1.3906z"/><path fill="currentColor" d="m86.109 8.332c0.76953 0 1.3906-0.62109 1.3906-1.3906v-1.3906c0-0.76562-0.62109-1.3906-1.3906-1.3906s-1.3906 0.62109-1.3906 1.3906v1.3906c0 0.76562 0.62109 1.3906 1.3906 1.3906z"/><path fill="currentColor" d="m81.945 11.109h1.3906c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906h-1.3906c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76562 0.62109 1.3906 1.3906 1.3906z"/><path fill="currentColor" d="m86.109 11.109c-0.76953 0-1.3906 0.62109-1.3906 1.3906v1.3906c0 0.76562 0.62109 1.3906 1.3906 1.3906s1.3906-0.62109 1.3906-1.3906v-1.3906c0-0.76562-0.62109-1.3906-1.3906-1.3906z"/><path fill="currentColor" d="m88.891 11.109h1.3906c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906h-1.3906c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76562 0.62109 1.3906 1.3906 1.3906z"/><path fill="currentColor" d="m8.332 76.391v1.3906c0 0.76562 0.62109 1.3906 1.3906 1.3906 0.76953 0 1.3906-0.62109 1.3906-1.3906v-1.3906c0-0.76562-0.62109-1.3906-1.3906-1.3906-0.76953 0-1.3906 0.62109-1.3906 1.3906z"/><path fill="currentColor" d="m6.9453 79.168h-1.3906c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76562 0.62109 1.3906 1.3906 1.3906h1.3906c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906z"/><path fill="currentColor" d="m9.7227 81.945c-0.76953 0-1.3906 0.62109-1.3906 1.3906v1.3906c0 0.76563 0.62109 1.3906 1.3906 1.3906 0.76953 0 1.3906-0.62109 1.3906-1.3906v-1.3906c0-0.76563-0.62109-1.3906-1.3906-1.3906z"/><path fill="currentColor" d="m13.891 79.168h-1.3906c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76562 0.62109 1.3906 1.3906 1.3906h1.3906c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906z"/><path fill="currentColor" d="m25 88.891c0.76953 0 1.3906-0.62109 1.3906-1.3906v-1.3906c0-0.76562-0.62109-1.3906-1.3906-1.3906s-1.3906 0.62109-1.3906 1.3906v1.3906c0 0.76562 0.62109 1.3906 1.3906 1.3906z"/><path fill="currentColor" d="m22.223 88.891h-1.3906c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76562 0.62109 1.3906 1.3906 1.3906h1.3906c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906z"/><path fill="currentColor" d="m25 91.668c-0.76953 0-1.3906 0.62109-1.3906 1.3906v1.3906c0 0.76562 0.62109 1.3906 1.3906 1.3906s1.3906-0.62109 1.3906-1.3906v-1.3906c0-0.76562-0.62109-1.3906-1.3906-1.3906z"/><path fill="currentColor" d="m29.168 88.891h-1.3906c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76562 0.62109 1.3906 1.3906 1.3906h1.3906c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906z"/></svg></div>,
      chest_opened: () => <div className="w-10 h-10 text-amber-600 opacity-70 drop-shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-5.0 -10.0 110.0 135.0" className="w-full h-full"><path fill="currentColor" d="m92.949 53.078h-85.871c-0.57812-0.011719-1.0508 0.46094-1.0508 1.0391v5.0781c0 0.57813 0.46875 1.0508 1.0508 1.0508l33.73 0.003906c1.1289 0 2.0508 0.92188 2.0508 2.0391v4.2695c0 0.28125 0.10938 0.53906 0.30859 0.73828l3.8984 3.8984c0.19922 0.19922 0.46094 0.30859 0.73828 0.30859h4.4297c0.28125 0 0.53906-0.10938 0.73828-0.30859l3.8984-3.8984c0.19922-0.19922 0.30859-0.46094 0.30859-0.73828v-4.2695c0-1.1211 0.92187-2.0391 2.0508-2.0391h33.73c0.57812 0 1.0508-0.46875 1.0508-1.0508v-5.0703c0-0.57812-0.46875-1.0508-1.0508-1.0508z"/><path fill="currentColor" d="m87.871 81.301c0 0.53125-0.21875 1.0703-0.60938 1.4414l-4.5117 4.5117c-0.37891 0.39062-0.91016 0.60938-1.4414 0.60938l-62.59-0.003906c-0.53125 0-1.0703-0.21875-1.4414-0.60938l-4.5117-4.5117c-0.39062-0.37891-0.60938-0.91016-0.60938-1.4414v-1.9031l-6.125 0.003906v29.68c0 1.1289 0.91016 2.0391 2.0391 2.0391h83.891c1.1289 0 2.0391-0.91016 2.0391-2.0391v-29.68h-6.1289z"/><path fill="currentColor" d="m14.211 62.281v19.031l4.5117 4.5117h62.59l4.5117-4.5117v-19.031h-26.602v5.1211c0 0.26953-0.10156 0.53125-0.30078 0.71875l-5.1211 5.1211c-0.19141 0.19922-0.44922 0.30078-0.71875 0.30078h-6.1289c-0.26953 0-0.53125-0.10156-0.71875-0.30078l-5.1211-5.1211c-0.19922-0.19141-0.30078-0.44922-0.30078-0.71875v-5.1211z"/><path fill="currentColor" d="m7.4883 11.121h85.062c-1.0117-2.0898-2.75-3.6719-4.8398-4.4883-1.0312-0.41016-2.1406-0.62891-3.3086-0.62891l-68.762-0.003906c-1.7617 0-3.4102 0.5-4.8203 1.3906-1.4102 0.89062-2.5586 2.1719-3.3281 3.7305z"/><path fill="currentColor" d="m62.5 26.27-4.3906 5.5195h6.8008z"/><path fill="currentColor" d="m35.121 31.789h6.8008l-4.3906-5.5195z"/><path fill="currentColor" d="m43.352 33.84h-7l11.02 9.5703z"/><path fill="currentColor" d="m43.988 31.109 4.043-5.668h-8.543z"/><path fill="currentColor" d="m46.02 31.789h7.9922l-3.9922-5.6094z"/><path fill="currentColor" d="m7.5508 19.301 8.3711 20.461h24.148l-6.9609-6.0391c-0.16016-0.12891-0.25-0.28125-0.32812-0.44922-0.019531-0.050782-0.039062-0.089844-0.058594-0.14844-0.03125-0.10156-0.058594-0.19922-0.058594-0.30859 0-0.011718 0.011719-0.019531 0.011719-0.03125-0.019531-0.21875-0.011719-0.44922 0.078125-0.67188l3.4609-7.8906c0.17188-0.39062 0.5-0.66016 0.89844-0.76953h0.03125c0.12109-0.03125 0.21875-0.050781 0.32812-0.050781h25.09c0.12109 0 0.23047 0.019531 0.32812 0.050781h0.03125c0.39844 0.12109 0.73047 0.39062 0.89844 0.76953l3.4609 7.8906c0.089844 0.21875 0.10156 0.44922 0.078125 0.67188 0 0.011719 0.011719 0.019532 0.011719 0.03125 0 0.12109-0.03125 0.21094-0.058594 0.30859-0.019531 0.050781-0.039062 0.089844-0.058594 0.14844-0.078125 0.17187-0.17969 0.32031-0.32812 0.44922l-6.9609 6.0391h24.148l8.3711-20.461z"/><path fill="currentColor" d="m9.8281 49.012-1.6406 2.0195h83.652l-2.9414-3.6016-4.5898-5.6094h-26.699l-6.6914 5.8008c-0.16016 0.14062-0.35156 0.21875-0.53125 0.26953-0.10156 0.03125-0.21094 0.050781-0.32031 0.050781-0.019531 0-0.03125 0.011719-0.050781 0.011719s-0.03125-0.011719-0.050781-0.011719c-0.12109 0-0.21875-0.019531-0.32031-0.050781-0.19141-0.050781-0.37891-0.14062-0.53125-0.26953l-6.6914-5.8008h-26.703z"/><path fill="currentColor" d="m50.02 44.41 4.4297-10.57h-8.8711z"/><path fill="currentColor" d="m56.039 31.109 4.5-5.668h-8.5391z"/><path fill="currentColor" d="m56.68 33.84-4.0195 9.5703 11.02-9.5703z"/><path fill="currentColor" d="m92.949 13.16h-85.898c-0.57812 0-1.0508 0.48047-1.0508 1.0586l0.019531 2c0 0.57031 0.46875 1.0391 1.0508 1.0391l85.879 0.003907c0.57812 0 1.0508-0.46875 1.0508-1.0508v-2c0-0.57813-0.46875-1.0508-1.0508-1.0508z"/></svg></div>,
      // Enemies
      goblin: (id) => <div className={`w-5 h-5 text-lime-400 drop-shadow-lg transition-transform ${animationState.hits[id] > Date.now() - 200 ? 'entity-hit' : ''}`}><svg xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' version='1.1' x='0px' y='0px' viewBox='0 0 296.169 488.008' style={{enableBackground:'new 0 0 296.169 488.008'}} xmlSpace='preserve'><g fill="currentColor"><path d='M251.239,469.32l-15.584-6.922c-9.972-4.428-16.415-14.34-16.415-25.25v-26.795l-4.806,6.929   c-0.624,0.899-1.589,1.504-2.67,1.673c-1.086,0.169-2.185-0.112-3.053-0.779l-13.507-10.367l-11.098,13.85   c-0.71,0.887-1.763,1.429-2.896,1.493c-0.075,0.004-0.15,0.006-0.225,0.006c-1.055,0-2.07-0.417-2.822-1.165l-7.589-7.555   c1.909,14.146,4.522,36.294,3.186,42.971c-1.199,6.003-4.935,10.723-7.857,13.624c-1.914,1.901-2.969,4.37-2.969,6.952v0.399   c0,5.307,4.316,9.623,9.623,9.623h74.717c5.384,0,9.765-4.381,9.765-9.765C257.04,474.388,254.763,470.885,251.239,469.32z'/><path d='M167.754,400.341l12.896,12.839l10.762-13.43c1.358-1.7,3.829-2,5.557-0.672l13.284,10.196l9.7-13.986   c1.229-1.774,3.645-2.25,5.454-1.083l12.877,8.302l-15.488-61.351c-8.171-2.333-39.195-10.461-74.712-10.461   s-66.541,8.128-74.712,10.461l-15.488,61.351l12.877-8.302c1.809-1.167,4.224-0.691,5.454,1.083l9.7,13.986l13.284-10.196   c1.727-1.325,4.195-1.028,5.557,0.672l10.762,13.43l12.896-12.839c1.535-1.526,4.007-1.555,5.575-0.067l14.094,13.371   l14.094-13.371C163.749,398.786,166.22,398.814,167.754,400.341z'/><path d='M184.558,185.718c4.238-3.44,6.349-7.709,6.471-13.098c-2.208,0.679-4.517,1.039-6.88,1.039h-6.15   C178.914,178.902,181.067,182.899,184.558,185.718z'/><path d='M105.141,172.62c0.122,5.389,2.233,9.658,6.471,13.098c3.491-2.819,5.643-6.816,6.558-12.059h-6.15   C109.658,173.659,107.349,173.299,105.141,172.62z'/><path d='M172.128,239.8c21.341-8.008,38.856-24.864,46.748-38.017c2.561-4.269,4.979-9.923,7.186-16.808   c0.521-1.625,2.014-2.74,3.72-2.778c0.176-0.005,19.033-0.736,32.733-17.494c6.763-8.273,11.313-24.152,16.131-40.963   c4.774-16.659,9.689-33.807,17.523-47.553c-9.123,0.363-24.585,1.612-33.313,5.854c-10.613,5.158-17.107,15.558-18.826,18.58   c0.225,4.692,0.307,9.315,0.275,13.822c7.071-9.418,16.194-17.063,27.27-22.812c1.959-1.018,4.375-0.255,5.393,1.707   c1.019,1.961,0.254,4.375-1.707,5.393c-13.503,7.011-23.785,17.119-30.6,30.077c2.855,3.123,7.362,9.247,7.706,17.066   c0.506,11.487-8.201,18.826-8.571,19.133c-0.746,0.617-1.649,0.918-2.548,0.918c-1.15,0-2.293-0.494-3.084-1.45   c-1.408-1.702-1.17-4.224,0.532-5.632c0.044-0.037,6.006-5.174,5.679-12.617c-0.338-7.687-7.096-13.495-7.164-13.553   c-0.986-0.835-1.478-2.072-1.405-3.307l-0.014-0.001c2.049-33.403-0.863-78.914-26.371-106.034C194.859,7.85,174.224,0,148.085,0   s-46.774,7.85-61.336,23.332c-25.508,27.12-28.42,72.631-26.371,106.034l-0.011,0.001c0.076,1.241-0.419,2.483-1.42,3.317   c-0.057,0.048-6.814,5.856-7.152,13.543c-0.327,7.434,5.618,12.567,5.679,12.617c1.702,1.408,1.94,3.93,0.532,5.632   c-0.791,0.956-1.934,1.45-3.084,1.45c-0.898,0-1.802-0.301-2.548-0.918c-0.37-0.307-9.077-7.646-8.571-19.133   c0.344-7.819,4.851-13.943,7.706-17.066c-6.814-12.958-17.097-23.066-30.6-30.077c-1.961-1.018-2.726-3.432-1.707-5.393   c1.018-1.962,3.433-2.726,5.393-1.707c11.076,5.749,20.199,13.394,27.27,22.812c-0.032-4.507,0.049-9.13,0.275-13.823   c-1.714-3.013-8.209-13.419-18.826-18.579C24.575,77.794,9.119,76.547,0,76.186c7.835,13.747,12.749,30.894,17.524,47.555   c4.817,16.811,9.368,32.689,16.131,40.963c13.7,16.758,32.558,17.489,32.746,17.494c1.696,0.049,3.189,1.162,3.708,2.778   c2.206,6.885,4.624,12.539,7.185,16.808c7.894,13.154,25.41,30.011,46.752,38.018c2.068,0.776,3.116,3.082,2.34,5.15   c-0.603,1.605-2.127,2.596-3.746,2.596c-0.467,0-0.941-0.082-1.404-0.256c-9.799-3.676-18.859-9.09-26.707-15.197   c-16.247,13.932-32.635,39.116-45.308,69.772c-11.578,28.011-17.818,55.527-15.528,68.472c2.016,11.389,12.201,19.56,18.145,23.448   l29.308-116.096c0.54-2.142,2.71-3.442,4.857-2.898c2.142,0.54,3.439,2.715,2.898,4.857l-13.273,52.58   c12.399-3.27,40.336-9.533,72.458-9.533s60.059,6.263,72.458,9.533l-13.273-52.58c-0.541-2.143,0.757-4.317,2.898-4.857   c2.147-0.541,4.318,0.758,4.857,2.898l29.308,116.096c5.943-3.886,16.129-12.058,18.146-23.448   c2.29-12.944-3.95-40.461-15.528-68.472c-12.673-30.655-29.061-55.84-45.308-69.772c-7.847,6.106-16.905,11.519-26.703,15.196   c-0.463,0.174-0.938,0.256-1.404,0.256c-1.619,0-3.144-0.99-3.746-2.596C169.012,242.882,170.06,240.576,172.128,239.8z    M154.666,118.55c1.283-1.798,3.781-2.216,5.58-0.93l2.487,1.776c1.803,1.288,4.139,1.442,6.097,0.405l31.628-16.777   c1.95-1.038,4.373-0.292,5.407,1.659c1.035,1.951,0.293,4.372-1.659,5.407l-31.628,16.777c-2.047,1.086-4.269,1.623-6.48,1.623   c-2.815,0-5.613-0.87-8.015-2.585l-2.486-1.776C153.799,122.847,153.382,120.348,154.666,118.55z M192.632,141.16   c0,4.1-3.323,7.423-7.423,7.423c-4.1,0-7.423-3.323-7.423-7.423s3.323-7.423,7.423-7.423   C189.308,133.737,192.632,137.061,192.632,141.16z M90.305,104.684c1.034-1.951,3.456-2.697,5.407-1.659l31.628,16.777   c1.96,1.037,4.294,0.883,6.097-0.405l2.487-1.776c1.798-1.283,4.296-0.868,5.58,0.93s0.867,4.297-0.931,5.58l-2.487,1.776   c-2.4,1.715-5.199,2.585-8.014,2.585c-2.212,0-4.434-0.536-6.48-1.623l-31.628-16.777C90.012,109.056,89.27,106.635,90.305,104.684   z M118.402,141.16c0,4.1-3.323,7.423-7.423,7.423s-7.423-3.323-7.423-7.423s3.323-7.423,7.423-7.423   S118.402,137.061,118.402,141.16z M126.284,173.659c-1.268,9.254-5.515,16.104-12.667,20.389c-0.634,0.379-1.345,0.568-2.056,0.568   c-0.761,0-1.52-0.217-2.183-0.647c-9.064-5.901-13.184-14.666-12.033-25.453l-5.24-3.841c-1.782-1.307-2.168-3.81-0.862-5.591   c1.308-1.783,3.813-2.168,5.591-0.862l6.084,4.459c2.659,1.948,5.807,2.979,9.103,2.979h72.129c3.296,0,6.443-1.03,9.103-2.979   l6.084-4.459c1.78-1.303,4.284-0.92,5.591,0.862c1.306,1.781,0.92,4.284-0.862,5.591l-5.24,3.841   c1.151,10.787-2.969,19.552-12.033,25.453c-0.663,0.431-1.423,0.647-2.183,0.647c-0.711,0-1.422-0.189-2.056-0.568   c-7.152-4.285-11.399-11.135-12.667-20.389H126.284z'/><path d='M122.407,457.408c-1.335-6.676,1.278-28.823,3.187-42.97l-7.589,7.555c-0.805,0.8-1.907,1.211-3.047,1.159   c-1.134-0.064-2.187-0.606-2.896-1.493l-11.098-13.85l-13.507,10.367c-0.868,0.666-1.969,0.947-3.053,0.779   c-1.081-0.169-2.046-0.773-2.67-1.673l-4.806-6.929v26.795c0,10.91-6.443,20.822-16.414,25.25l-15.585,6.921   c-3.523,1.565-5.801,5.068-5.801,8.924c0,5.384,4.381,9.765,9.765,9.765h74.717c5.307,0,9.623-4.316,9.623-9.623v-0.399   c0-2.582-1.055-5.051-2.969-6.951C127.343,468.132,123.607,463.412,122.407,457.408z'/></g></svg></div>,
      skeleton: (id) => <div className={`w-10 h-10 text-slate-300 drop-shadow-lg transition-transform ${animationState.hits[id] > Date.now() - 200 ? 'entity-hit' : ''}`}><svg xmlns='http://www.w3.org/2000/svg' version='1.1' viewBox='-5.0 -10.0 110.0 135.0' fill="currentColor"> <path d='m55.238 20.16c1.2539-0.79297 2.207-1.9844 2.7109-3.3828 0.47656-1.3789 0.44531-2.8867-0.089844-4.2461-0.58203-1.4375-1.6172-2.6445-2.9492-3.4414-3.0234-1.8164-6.7969-1.8164-9.8203 0-1.332 0.79297-2.3672 2.0039-2.9492 3.4414-0.51172 1.332-0.50781 2.8086 0.003906 4.1406 0.57812 1.4648 1.6172 2.7031 2.957 3.5352 0.39063 0.25 0.625 0.67969 0.625 1.1445v2.918c0 0.011719 0.003907 0.019531 0.011719 0.027344 0.0625 0.046875 0.13672 0.070313 0.21484 0.066406h8.4219c0.050781 0.007813 0.10547-0.007812 0.14453-0.039062h0.007813c0.007812-0.011719 0.011718-0.03125 0.007812-0.050781v-2.9219c0-0.49609 0.26953-0.94922 0.70312-1.1914zm5.2812-2.5h-0.003906c-0.61719 1.7617-1.75 3.293-3.25 4.4023v2.2109-0.003907c0.003906 0.76562-0.30859 1.4961-0.86328 2.0234-0.54688 0.51562-1.2734 0.80469-2.0234 0.80078h-2.9492v1.2539l14.023-0.003906c0.58203 0 1.1016 0.37109 1.2891 0.92578l4.418 13 4.1289 4.5742c1.5664-0.42969 3.2188-0.42578 4.7852 0.011719 1.8789 0.53125 3.5352 1.6562 4.7266 3.207 0.43359 0.59375 0.31641 1.4297-0.26562 1.8789-0.58594 0.44922-1.4219 0.35547-1.8867-0.21875-0.83594-1.0859-1.9961-1.875-3.3164-2.25-0.85938-0.24219-1.7578-0.29297-2.6406-0.15625l1.0273 2.5664c0.16016 0.33594 0.17578 0.72656 0.039062 1.0781-0.13672 0.34766-0.41016 0.625-0.75781 0.76562-0.35156 0.14063-0.74219 0.13281-1.082-0.027343-0.33984-0.15625-0.60156-0.44922-0.71875-0.80469l-1.5-3.75-4.7461-5.2617c-0.13281-0.14844-0.23438-0.32422-0.29297-0.51172l-4.1797-12.301h-13.051v3.1094h11.234c0.75391 0 1.3672 0.60937 1.3672 1.3633 0 0.75391-0.61328 1.3633-1.3672 1.3633h-11.234v2.9766h8.3164c0.37109-0.011718 0.72656 0.12891 0.98828 0.38672 0.26562 0.25391 0.41406 0.60938 0.41406 0.97656 0 0.36719-0.14844 0.71875-0.41406 0.97656-0.26172 0.25781-0.61719 0.39453-0.98828 0.38672h-8.3164v2.9766h5.5352c0.36719-0.011719 0.72266 0.12891 0.98828 0.38672 0.26172 0.25391 0.41016 0.60938 0.41016 0.97656 0 0.36719-0.14844 0.71875-0.41016 0.97656-0.26562 0.25781-0.62109 0.39453-0.98828 0.38672h-5.5352v3.7578l4.3203-1.8711c1.7695-0.80078 3.8555-0.24219 4.9922 1.3359 1.1328 1.5742 0.99609 3.7344-0.32422 5.1562-0.80469 1.0078-1.4297 2.1484-1.8477 3.3711-0.43359 1.3008-0.64844 2.6641-0.64062 4.0352 0 0.042969 0 0.085938-0.007813 0.12891-0.011719 0.71484-0.22656 1.4141-0.625 2.0117-0.34766 0.51562-0.81641 0.94141-1.3633 1.2383l-0.12891 0.066407 2.8828 12.258c0.050781 0.21875 0.046875 0.44922-0.011719 0.66797l-2.4297 11.801h2.4414c0.36719-0.011719 0.72266 0.12891 0.98828 0.38672 0.26172 0.25391 0.41406 0.60938 0.41406 0.97656 0 0.36719-0.15234 0.71875-0.41406 0.97656-0.26562 0.25781-0.62109 0.39844-0.98828 0.38672h-4.1133c-0.089844 0-0.17969-0.007813-0.26953-0.027344-0.73438-0.15234-1.207-0.86719-1.0625-1.6016l2.7227-13.23-2.8984-12.336c-0.38281-0.10938-0.74219-0.27734-1.0742-0.49609l-0.085938-0.0625-0.51953-0.35547 0.003906 0.003906c-0.78906-0.48047-1.7812-0.46875-2.5586 0.023437l-0.69922 0.42578c-0.28906 0.1875-0.59766 0.33594-0.92578 0.4375l-2.9062 12.355 2.7227 13.23c0.14844 0.73438-0.32422 1.4531-1.0586 1.6016-0.089844 0.019531-0.17969 0.027344-0.27344 0.027344h-4.1133c-0.36719 0.011718-0.72266-0.12891-0.98828-0.38672-0.26562-0.25391-0.41406-0.60938-0.41406-0.97656 0-0.36719 0.14844-0.71875 0.41406-0.97656 0.26562-0.25781 0.62109-0.39453 0.98828-0.38672h2.4414l-2.4297-11.801c-0.058594-0.21875-0.0625-0.44922-0.011719-0.66797l2.8711-12.203c-0.078125-0.035156-0.15625-0.074219-0.23438-0.11719h0.003906c-0.55469-0.30078-1.0273-0.73047-1.3789-1.25-0.41797-0.63281-0.64062-1.375-0.62891-2.1328h-0.011719c0.003906-1.3398-0.22656-2.6719-0.67578-3.9336l-0.019532-0.0625v0.003906c-0.45312-1.2383-1.1016-2.3906-1.9258-3.4141-1.3242-1.4258-1.457-3.582-0.32422-5.1602 1.1367-1.5742 3.2227-2.1328 4.9922-1.332l4.4531 1.9336v-3.8164h-5.3984c-0.36719 0.011719-0.72656-0.12891-0.98828-0.38672-0.26562-0.25391-0.41406-0.60938-0.41406-0.97656 0-0.36719 0.14844-0.71875 0.41406-0.97656 0.26172-0.25781 0.62109-0.39844 0.98828-0.38672h5.3984v-2.9766h-8.1836c-0.36719 0.011719-0.72266-0.12891-0.98828-0.38672-0.26172-0.25391-0.41016-0.60938-0.41016-0.97656 0-0.36719 0.14844-0.71875 0.41016-0.97656 0.26562-0.25781 0.62109-0.39844 0.98828-0.38672h8.1836v-2.9766h-11.098c-0.75391 0-1.3672-0.60938-1.3672-1.3633 0-0.75391 0.61328-1.3633 1.3672-1.3633h11.098v-3.1094h-12.914l-4.1914 12.336c-0.058594 0.17578-0.15234 0.33594-0.27734 0.47656l-4.7695 5.2812-1.6289 3.7617c-0.13672 0.33984-0.40234 0.60547-0.74219 0.74609-0.33984 0.13672-0.71875 0.13672-1.0547-0.007813-0.33594-0.14844-0.59766-0.42187-0.73047-0.76172-0.12891-0.33984-0.11719-0.72266 0.035156-1.0547l1.1016-2.5352c-0.92578-0.13281-1.8672-0.074219-2.7656 0.17188-1.3516 0.35547-2.5469 1.1406-3.4141 2.2383-0.46875 0.55078-1.2891 0.63672-1.8633 0.19141-0.57422-0.44141-0.69922-1.2578-0.28516-1.8516 1.2266-1.5703 2.9297-2.6953 4.8516-3.2109 1.6133-0.4375 3.3125-0.44141 4.9297-0.007812l4.1289-4.5742 4.3906-12.918c0.16016-0.59375 0.69922-1.0078 1.3164-1.0078h13.883v-1.25h-2.7461c-0.75391-0.003906-1.4844-0.28516-2.0469-0.79297-0.57422-0.51953-0.90625-1.2578-0.90625-2.0312v-2.207c-1.5352-1.125-2.7148-2.668-3.3984-4.4453-0.74609-1.9492-0.74609-4.1055 0.003907-6.0547 0.79297-1.9961 2.2109-3.6758 4.0469-4.7852 3.9023-2.3711 8.7969-2.3711 12.699 0 1.8359 1.1094 3.2578 2.7891 4.0469 4.7852 0.76562 1.9531 0.80859 4.1133 0.125 6.0977zm-6.4492 47.559h-0.003906 0.13672c0.15234-0.015625 0.29688-0.058594 0.42969-0.13281 0.16016-0.085938 0.29688-0.21094 0.39844-0.36328 0.10547-0.16016 0.16797-0.33984 0.17969-0.53125v-0.10156 0.003906c-0.007813-1.6719 0.26172-3.3281 0.79297-4.9102 0.51953-1.5352 1.3047-2.9609 2.3203-4.2227 0.027343-0.039063 0.058593-0.074219 0.089843-0.10547 0.44922-0.47266 0.50391-1.1953 0.12891-1.7227-0.375-0.53125-1.0742-0.72266-1.668-0.45703l-4.875 2.1172c-0.59375 0.25781-1.2266 0.39844-1.8711 0.41406h-0.11719c-0.65625 0-1.3086-0.13281-1.9141-0.38281l-0.085937-0.03125-4.8711-2.1172h0.003906c-0.59375-0.26953-1.2969-0.082031-1.6719 0.44922-0.375 0.53516-0.32031 1.2578 0.12891 1.7266l0.074219 0.085938c1.0312 1.2695 1.8398 2.7031 2.4023 4.2383l0.027344 0.066407h-0.003907c0.55469 1.5586 0.83984 3.1953 0.83594 4.8477v0.015625c-0.003906 0.21484 0.058594 0.42188 0.17578 0.60156 0.20703 0.30469 0.54297 0.49609 0.91016 0.51953h0.125c0.18359-0.015624 0.35937-0.074218 0.50781-0.17187l0.070312-0.046876 0.64453-0.38672c1.6758-1.0859 3.8359-1.0938 5.5195-0.019532l0.078125 0.050782 0.48828 0.33594 0.0625 0.039063c0.16406 0.11328 0.35938 0.17969 0.55859 0.1875zm-6.25-51.438c0 0.20312-0.078124 0.39453-0.22266 0.53906-0.30078 0.27734-0.76562 0.26563-1.0547-0.023437-0.28906-0.28906-0.29688-0.75781-0.019531-1.0547 0.21875-0.21875 0.54687-0.28516 0.83203-0.16797 0.28516 0.11719 0.46875 0.39844 0.46875 0.70312zm1.707-2.4648c0.17969 0.17969 0.33594 0.37891 0.47266 0.58984 0.13672-0.21094 0.29297-0.41016 0.47266-0.58984 1.3242-1.3242 3.4609-1.3633 4.832-0.082031l0.09375 0.085937v-0.003906c0.65234 0.65234 1.0195 1.5391 1.0195 2.4648 0 0.92188-0.36719 1.8086-1.0195 2.4609-0.65234 0.65234-1.5391 1.0234-2.4609 1.0234s-1.8086-0.37109-2.4609-1.0234h-0.007812 0.003906c-0.17969-0.17969-0.33594-0.375-0.47266-0.58594-0.13672 0.21484-0.29688 0.41016-0.47656 0.58984-0.64844 0.67188-1.543 1.0508-2.4766 1.0586-0.93359 0.007812-1.8281-0.35938-2.4883-1.0195s-1.0273-1.5586-1.0195-2.4922c0.007813-0.93359 0.39063-1.8242 1.0625-2.4766 0.65234-0.65234 1.5352-1.0195 2.4609-1.0195 0.92188 0 1.8086 0.36719 2.4609 1.0195zm-1.9727 9.7695 1.3008-2.3359-0.003907 0.003906c0.22266-0.44531 0.66406-0.73047 1.1602-0.75 0.49219-0.023437 0.96094 0.22656 1.2188 0.64844l1.4062 2.3008c0.29688 0.41406 0.33594 0.96094 0.10156 1.4141-0.23047 0.45703-0.69922 0.74219-1.2109 0.74219h-2.7891c-0.48047 0-0.92578-0.25391-1.168-0.67188-0.24609-0.41406-0.25391-0.92578-0.019531-1.3477zm6.1445-7.3047c0.007812 0.20703-0.066407 0.40625-0.21094 0.55469-0.14453 0.14844-0.33984 0.23437-0.54688 0.23437-0.20703 0-0.40234-0.085937-0.54688-0.23437-0.14062-0.14844-0.21875-0.34766-0.21094-0.55469 0-0.19922 0.078125-0.39453 0.22266-0.53516 0.28125-0.27734 0.73047-0.29297 1.0352-0.039063l0.039063 0.039063c0.14062 0.14453 0.21875 0.33594 0.21875 0.53516z' fill-rule='evenodd'/></svg></div>,
      bat: (id) => <div className={`w-10 h-10 text-slate-500 drop-shadow-lg transition-transform ${animationState.hits[id] > Date.now() - 200 ? 'entity-hit' : ''}`}><svg xmlns='http://www.w3.org/2000/svg' version='1.1' viewBox='-5.0 -10.0 110.0 135.0' fill="currentColor"> <path d='m37.23 47.188 3.1719-1.1875c-0.26172 0.89844-0.625 1.4727-1.0781 1.6562-0.47656 0.19922-1.1953 0.035156-2.0938-0.46875zm-25.234 5.9375c0.43359 12.23 5.918 18.414 15.617 24.461-0.4375-1.9297-0.14062-3.9844 0.90625-5.832 1.1953-2.1094 3.168-3.5469 5.5-4.125-10.414-4.6992-17.672-9.4727-22.023-14.504zm25.621 4.3555c-0.625-0.5-1.2344-1.0312-1.8164-1.6172-1.4688-1.4648-2.7148-3.1406-3.6719-4.9141-8.8516 3.4492-13.875 0.35938-21.977-4.6797-4.6328 4.9258-5.2617 11.918-4.9531 17.008 0.6875 11.328 6.668 24.504 14.062 31.59-0.67969-4.1406-0.12891-7.6992 1.6406-10.414 1.4219-2.1875 3.6172-3.793 6.3164-4.6641-4.5703-2.7773-9.125-6.0273-12.363-10.613-3.5508-5.0352-5.168-11.301-4.9453-19.152 0.015625-0.45313 0.31641-0.84375 0.75391-0.96875 0.4375-0.12891 0.90234 0.046874 1.1562 0.42187 3.7969 5.7188 11.52 11.117 23.582 16.5-0.34766-1.4609-0.36328-3.0117-0.015625-4.4844 0.37891-1.6172 1.1641-3.0117 2.2305-4.0117zm25.652-52.281c-5.0898-0.30859-12.082 0.32422-17.008 4.9531 5.0391 8.1055 8.1289 13.129 4.6797 21.98 1.7773 0.95703 3.4492 2.2031 4.918 3.668 0.57812 0.58203 1.1133 1.1875 1.6172 1.8164 1.0039-1.0625 2.3945-1.8477 4-2.2266 1.6055-0.37891 3.3086-0.32422 4.8828 0.12109-5.4297-12.258-10.883-20.094-16.652-23.93-0.375-0.25-0.54688-0.71875-0.42578-1.1562 0.12891-0.43359 0.51953-0.73828 0.96875-0.75 7.8594-0.22266 14.121 1.3906 19.156 4.9453 4.5273 3.1953 7.7578 7.6758 10.516 12.191 0.89844-2.5117 2.4453-4.5547 4.5234-5.9062 2.7148-1.7656 6.2734-2.3164 10.414-1.6367-7.082-7.3984-20.262-13.375-31.59-14.07zm-9.9023 6.5547c4.9961 4.3203 9.7305 11.496 14.391 21.777 0.65234-2.1172 2.0312-3.8945 3.9922-5.0078 1.9922-1.1328 4.2344-1.3867 6.3008-0.78906-6.1172-9.9219-12.305-15.539-24.684-15.98zm6.207 35.828c0.39844 3.625-0.62109 6.8672-2.875 9.1211-4.7227 4.7227-13.438 3.6875-19.43-2.3047-1.8203-1.8203-3.2578-3.9844-4.1602-6.2578-0.058594-0.14844-0.14844-0.28516-0.27344-0.39062-2.3555-2.1016-4.7148-5.25-7.0156-9.3672 2.1211 0.17188 3.8945 0.58594 5.2891 1.2422 0.26953 0.125 0.58203 0.12891 0.85938 0.007812 0.27344-0.12109 0.48438-0.35156 0.57422-0.64062 0.49609-1.5547 1.3086-2.9062 2.4219-4.0273 1.1172-1.1133 2.4688-1.9297 4.0312-2.4219 0.28516-0.089844 0.51562-0.30078 0.63672-0.57422 0.12109-0.27734 0.11719-0.58984-0.011718-0.85938-0.64844-1.3945-1.0625-3.168-1.2344-5.2891 4.1133 2.3008 7.2578 4.6602 9.3633 7.0156 0.10547 0.12109 0.24219 0.21484 0.39453 0.27344 2.2734 0.90234 4.4336 2.3438 6.2539 4.1602 2.9258 2.9375 4.7656 6.5938 5.1758 10.312zm-16.773-3.082c0.042969-0.35938-0.10547-0.71484-0.39453-0.9375-0.28516-0.22266-0.66406-0.28125-1.0039-0.15234l-6.7734 2.5273c-0.35156 0.13281-0.60547 0.44141-0.66406 0.8125s0.085937 0.74219 0.38281 0.97656c1.7617 1.3984 3.2578 2.0898 4.5391 2.0898 0.4375 0 0.85156-0.078125 1.2383-0.23828 1.4844-0.61328 2.3555-2.2734 2.6758-5.0781zm0.75781-2.0898c0.20312 0.25391 0.50391 0.39844 0.82031 0.39844 0.039063 0 0.078125 0 0.12109-0.003906 2.8008-0.32031 4.4648-1.1953 5.0781-2.6758 0.63281-1.5273 0.027344-3.4141-1.8516-5.7773-0.23047-0.29297-0.60547-0.4375-0.97656-0.37891s-0.67969 0.3125-0.8125 0.66406l-2.5273 6.7734c-0.13281 0.33594-0.074218 0.71484 0.14844 1zm11.906 1.5742c-0.53516-0.21094-1.1367 0.054687-1.3516 0.58594-1.6133 4.0977-5.4492 7.9336-9.5391 9.543-0.53516 0.21094-0.79688 0.81641-0.58984 1.3477 0.16406 0.41406 0.55859 0.66016 0.96875 0.66016 0.12891 0 0.25391-0.023438 0.38281-0.074219 1.0078-0.39453 2-0.91406 2.957-1.5312l1.1992 1.1992c0.20703 0.20703 0.46875 0.30469 0.73828 0.30469 0.26562 0 0.53125-0.097656 0.73438-0.30469 0.41016-0.40234 0.41016-1.0625 0-1.4688l-0.96484-0.96484c1.2031-0.96484 2.3164-2.0781 3.2891-3.2812l0.96094 0.96484c0.20312 0.20312 0.46875 0.30469 0.73828 0.30469 0.26953 0 0.53125-0.10156 0.73828-0.30469 0.40234-0.41016 0.40234-1.0625 0-1.4727l-1.2031-1.1992c0.61719-0.95703 1.1328-1.9492 1.5312-2.9609 0.20703-0.53125-0.054687-1.1367-0.58594-1.3477zm-7.8086-4.6523c0.19922-0.47656 0.03125-1.1992-0.46875-2.0977l-1.1836 3.1758c0.89844-0.26562 1.4648-0.63281 1.6523-1.0781z'/></svg></div>,
      slime: (id) => <div className={`w-10 h-10 text-green-400 drop-shadow-lg transition-transform ${animationState.hits[id] > Date.now() - 200 ? 'entity-hit' : ''}`}><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 75' x='0px' y='0px' fill="currentColor"><path d='M51.525,49.463C49.089,48.476,45,46.064,45,41V28a10.986,10.986,0,0,0-4-8.479V13.315a7,7,0,1,0-6,0v3.736c-.33-.03-.662-.051-1-.051H26c-.338,0-.67.021-1,.051V13.315a7,7,0,1,0-6,0v6.206A10.986,10.986,0,0,0,15,28V41c0,5.063-4.088,7.476-6.527,8.464a4.045,4.045,0,0,0-.07,7.424C11.091,58.05,17.472,60,30,60s18.909-1.95,21.6-3.113a4.046,4.046,0,0,0-.075-7.424ZM38,2a4.977,4.977,0,0,1,3.974,2H34.026A4.977,4.977,0,0,1,38,2Zm1,5a1,1,0,1,1-1-1A1,1,0,0,1,39,7ZM33,7a5,5,0,0,1,.1-1h2.083A2.966,2.966,0,0,0,35,7a3,3,0,0,0,6,0,2.966,2.966,0,0,0-.184-1H42.9A5,5,0,1,1,33,7Zm4,6.92a6.29,6.29,0,0,0,2,0v4.294a10.9,10.9,0,0,0-2-.787ZM22,2a4.977,4.977,0,0,1,3.974,2H18.026A4.977,4.977,0,0,1,22,2Zm1,5a1,1,0,1,1-1-1A1,1,0,0,1,23,7ZM17,7a5,5,0,0,1,.1-1h2.083A2.966,2.966,0,0,0,19,7a3,3,0,0,0,6,0,2.966,2.966,0,0,0-.184-1H26.9A5,5,0,1,1,17,7Zm4,6.92a6.29,6.29,0,0,0,2,0v3.507a10.9,10.9,0,0,0-2,.787ZM50.8,55.052C48.257,56.153,42.168,58,30,58S11.743,56.153,9.2,55.053a2.046,2.046,0,0,1,.026-3.737A13.721,13.721,0,0,0,15,47.105V52a1,1,0,0,0,2,0V28a9.01,9.01,0,0,1,9-9h8a9.01,9.01,0,0,1,9,9V52a1,1,0,0,0,2,0v-4.9a13.707,13.707,0,0,0,5.773,4.21,2.047,2.047,0,0,1,.031,3.737Z'/><path d='M27,44a3,3,0,1,0-3,3A3,3,0,0,0,27,44Zm-3,1a1,1,0,1,1,1-1A1,1,0,0,1,24,45Z'/><path d='M30,47a4,4,0,1,0,4,4A4,4,0,0,0,30,47Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,30,53Z'/><path d='M37,42a3,3,0,1,0,3,3A3,3,0,0,0,37,42Zm0,4a1,1,0,1,1,1-1A1,1,0,0,1,37,46Z'/><path d='M21.553,28.9A7.278,7.278,0,0,0,23,29.361V32a7,7,0,0,0,14,0V29.361a7.278,7.278,0,0,0,1.447-.466,1,1,0,0,0,.448-1.328,1.009,1.009,0,0,0-1.331-.467c-.019.008-1.987.9-7.564.9-5.517,0-7.5-.872-7.563-.9a1,1,0,0,0-.884,1.794ZM35,32a5,5,0,0,1-10,0V29.715c.582.076,1.24.144,2,.193V32a2,2,0,0,0,2,2h2a2,2,0,0,0,2-2V29.908c.76-.049,1.418-.117,2-.193Zm-4-2.01V32H29V29.99c.322.006.653.01,1,.01S30.678,30,31,29.99Z'/></svg></div>,
      ooze: (id) => <div className={`w-6 h-6 text-lime-600 drop-shadow-lg transition-transform ${animationState.hits[id] > Date.now() - 200 ? 'entity-hit' : ''}`}><svg viewBox="0 0 20 20" className="w-full h-full"><path fill="currentColor" d="M10 2a8 8 0 00-8 8c0 4.42 3.58 8 8 8s8-3.58 8-8a8 8 0 00-8-8z"/></svg></div>,
      skeleton_archer: (id) => <div className={`w-10 h-10 text-slate-400 drop-shadow-lg transition-transform ${animationState.hits[id] > Date.now() - 200 ? 'entity-hit' : ''}`}><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill="currentColor"><g><path d='M57.8,35.1c3.9,0,7.1-3.2,7.1-7.1s-3.2-7.1-7.1-7.1s-7.1,3.2-7.1,7.1S53.9,35.1,57.8,35.1z M57.8,23.9 c2.3,0,4.1,1.8,4.1,4.1s-1.8,4.1-4.1,4.1s-4.1-1.8-4.1-4.1S55.5,23.9,57.8,23.9z'/><path d='M45.1,58.6c0.1,0,0.1,0,0.2,0c0.8,0,1.4-0.6,1.5-1.3c0.4-3.7,2.1-13.9,4.7-17.4c0.3-0.4,0.4-0.9,0.2-1.3 c-0.1-0.5-0.5-0.8-1-1l-22.3-7.6c0.4-1,0.9-2,1.4-2.9c6.2-10.7,18-13.6,18.1-13.6c0.8-0.2,1.3-1,1.1-1.8c-0.2-0.8-1-1.3-1.8-1.1 c-0.5,0.1-13.2,3.2-20,15c-5,8.7-5.5,19.7-1.5,32.8c0.2,0.6,0.8,1.1,1.4,1.1c0.1,0,0.3,0,0.4-0.1c0.8-0.2,1.2-1.1,1-1.9 c-2.9-9.4-3.3-17.7-1.3-24.6l20.6,7c-2.9,5.7-4.2,16.7-4.3,17.2C43.7,57.8,44.3,58.5,45.1,58.6z'/><path d='M63.1,41c-0.1-0.1-0.2-0.1-0.3-0.1c-0.1,0-0.2,0-0.3-0.1h0c0,0,0,0,0,0c-0.7-0.2-1.4,0.2-1.7,0.9 c-0.1,0.3-0.1,0.5,0,0.8c-0.3,1.4-2.9,7.9-3.4,9.2c-2.2,5.1-5.3,8.8-9.6,11.5c-1,0.6-2,1.2-3.1,1.8c-3.4,2-6.8,4-9.7,7.1 c-4.3,4.7-6,11.2-6.6,15.9c-0.1,0.8,0.5,1.6,1.3,1.7c0.1,0,0.1,0,0.2,0c0.7,0,1.4-0.5,1.5-1.3c0.6-4.2,2.1-10.1,5.9-14.3 c2.5-2.7,5.7-4.6,9-6.5c1-0.6,2.1-1.2,3.1-1.9c4.8-3,8.2-7.1,10.7-12.8c1.7-4,2.7-6.6,3.2-8.3c3.3,2,10.3,7.3,10.6,16.4 c0,0.8,0.7,1.5,1.5,1.4c0.8,0,1.5-0.7,1.4-1.5C76.4,48.1,65.1,41.9,63.1,41z'/><path d='M59.6,89.6c0.3,0,0.7-0.1,1-0.3c0.6-0.5,0.7-1.5,0.2-2.1c-7.5-9.1-9-17.6-9-17.7c-0.1-0.8-0.9-1.4-1.7-1.2 c-0.8,0.1-1.4,0.9-1.2,1.7c0.1,0.4,1.6,9.4,9.6,19.2C58.7,89.4,59.1,89.6,59.6,89.6z'/></g></svg></div>,
      shadow: (id) => <div className={`w-10 h-10 text-violet-400 drop-shadow-lg transition-transform ${animationState.hits[id] > Date.now() - 200 ? 'entity-hit' : ''}`}><svg xmlns='http://www.w3.org/2000/svg' version='1.1' viewBox='-5.0 -10.0 110.0 135.0' fill="currentColor"> <path d='m45.883 0.10938c-0.43359 0.039063-2.043 0.16797-3.5742 0.28906-2.8359 0.22656-4.3086 0.55469-9.2109 2.043-4.3789 1.332-6.5977 2.3906-12.281 5.8594-2.0859 1.2734-5.9336 4.6797-8.5391 7.5586-1.6484 1.8242-3.7891 4.957-5.8398 8.5391-2.1953 3.8438-4.2539 9.3008-5.7383 15.242-0.69141 2.7617-0.70703 2.918-0.69922 8.0352 0.011719 6.0273 0.085938 6.6211 1.5977 12.637 1.2539 4.9961 2.6367 8.4727 5.0312 12.688 2.1797 3.8398 6.2891 9.0781 9.1992 11.734 1.457 1.3281 6.2812 4.8164 8.9375 6.4609 6.8125 4.2109 13.883 6.918 21.582 8.2578 3.3438 0.58203 8.707 0.72266 12.07 0.3125 5.0703-0.61328 12.66-3.2773 19.535-6.8477l3.5469-2.418 3.4492-3.1914c5.168-5.2695 8.7227-10.152 11.594-15.914 3.7344-7.4922 4.5547-19.875 1.918-28.938-1.793-6.1562-4.7109-10.922-9.5234-15.555-2.5156-2.418-5.1953-5.1836-9.3008-7.3047-1.3789-0.71094-2.2109-0.98047-3.6367-1.5977-1.8984-0.82031-2.918-0.90625-4.875-2.0664-2.2773-1.3516-2.6562-1.7109-2.6562-2.5156 0-0.80859 0.6875-1.5117 2.6211-2.668 5.5508-3.3242 7.8867-4.7578 8.2578-5.0664 0.32422-0.27344 0.39453-0.51562 0.28125-1-0.33203-1.4023-1.4531-1.3125-4.6758 0.375-4.5117 2.3633-12.566 6.2227-16.055 7.6992-1.8711 0.78906-3.5156 1.5234-3.6484 1.625-0.13672 0.10547-2.3594 1.0352-4.9414 2.0703-6.4805 2.5938-9.1367 4.1914-13.539 8.1367-5.0742 4.5547-7.4805 7.9297-9.1797 12.895-1.0742 3.1328-1.3867 5.2305-1.1211 7.4766 0.37109 3.1367 0.89062 5.1445 1.5664 6.0547 0.33984 0.46094 0.79297 1.3984 1.0078 2.0898 0.43359 1.3867 1.0664 2.1914 2.1289 2.6992 0.43359 0.20703 0.75391 0.55078 0.83984 0.90625 0.28516 1.1914 0.37891 1.332 1.0898 1.6445 0.56641 0.25 0.78906 0.52734 0.99219 1.2383 0.35156 1.2109 1.4648 1.9141 3.3281 2.0938l1.3477 0.12891 0.91797-1.0156c2.0195-2.2266 4.293-6.3359 4.7539-8.5898 0.097656-0.49219 0.33984-0.78125 0.84766-1.0195 0.38672-0.18359 1.2227-0.71875 1.8555-1.1914 0.99219-0.74609 1.1953-1.0312 1.5117-2.1133 0.19922-0.69141 0.41016-1.7227 0.46875-2.2969 0.09375-0.95703 0.21094-1.1328 1.4219-2.1562 1.4609-1.2344 4.0547-2.4805 5.5508-2.6719 0.53125-0.066407 1.3984-0.015625 1.9258 0.11719 1.0195 0.25391-0.64453 1.6523-0.14453 3.2031 0.41016 1.2695 1.168 1.9492 2.5391 2.2734l3.1953-0.71875 0.18359 1.125c0.21875 1.3516 0.085937 2.7812-0.29688 3.2109-0.15625 0.17188-0.57812 0.3125-0.94531 0.3125-0.53906 0-0.71875 0.13281-0.98828 0.72656l-0.77734 2.0469-0.45312 1.457c0 0.87109 0.097656 1.0156 1.6602 2.4727 0.91406 0.84766 2.3789 2.1641 3.2578 2.918 1.3242 1.1445 1.6562 1.5664 1.9609 2.5078 1.1328 3.4844 0.98828 9.2773-0.30078 12.062-1.5391 3.3398-4.9883 6.6953-8.6094 8.3789-2.8594 1.332-5.7383 2.0898-8.4688 2.2227-4.3281 0.21484-7.7695-0.43359-14.617-2.7539-6.9922-2.3672-14.957-8.832-19.02-15.434-4.7383-7.707-6.6797-13.961-6.6797-21.539 0-4.2148 0.25391-6.457 1.2422-11.035 0.84375-3.9023 1.4961-5.4883 4.4336-10.754 1.2539-2.2422 2.1641-3.5 4.4609-6.1562 1.5859-1.8398 3.7422-4.0547 4.7891-4.9258 4.8594-4.043 11.695-7.2852 18.387-8.7148 3.8008-0.80859 7.2773-1.2969 9.2617-1.293 2.0234 0 2.6875-0.29688 2.7852-1.2422 0.12109-1.1719-0.21094-1.2617-4.4648-1.2227-2.0586 0.015625-4.0977 0.0625-4.5312 0.10156z' fill-rule='evenodd'/></svg></div>,
      golem: (id) => <div className={`w-10 h-10 text-stone-500 drop-shadow-lg transition-transform ${animationState.hits[id] > Date.now() - 200 ? 'entity-hit' : ''}`}><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' fill="currentColor"><path d='M316.18 22.05c-28.8.16-57.27 6.13-85.46 17.92-2.34 12.94-6.77 28.27-16.64 41.56-10.4 13.07-26.07 23.34-50.12 23.3-22.8 26.9-33.58 56.57-32.8 87.37-10.23 9.27-21.48 18.86-33.32 26.92-13.04 9.1-27.1 16.65-42.52 20.65-7.57 14.78-13.3 30.26-16.97 46.21 14.6 2.65 28.5 9.86 38.72 22.05 6.18 7.4 10.32 15.53 12.94 24.03 14.84 1.52 28.74 7.07 40.26 18.1 6.1 5.84 10.88 12.43 14.33 19.56 12.12-1.12 23.28 2.37 33.06 7.7 4.06 2.2 7.82 4.75 11.34 7.56 12.1-5.58 26.28-8.6 43.3-6.62 24.52-25.6 54.84-45.2 88.3-58.82 5.52-26.03 6.95-51.65 4.97-76.22-13.38-6.4-26.7-16.23-39.06-30.26-20.67-23.53-35.57-54.06-46.97-86.33-1.47-2.1-2.8-4.2-4.04-6.27 17.1-2.06 34.08-5.86 50.82-11.5-2.7-4.93-5.3-10.16-7.77-15.7 26.8 2.48 54.08-1.15 81.36-9.9 3.38-4.6 6.7-9.38 9.88-14.36-8.6-14.87-11.64-31.55-10.36-49.63-7.26-.22-14.56-.42-21.84-.36zm106.06 39.16c-6.66 1.1-13.18 3.1-19.26 6.05-17.2 8.45-29.14 24.22-35.73 42.06-1.68 4.6-2.93 9.28-3.73 13.96 10.23 16.84 23.38 31.73 38.66 44.28 3.16 2.65 6.43 5.14 9.78 7.48 16.57-2.8 32.92-10.03 46.14-22.4 9.46-8.87 16.64-19.42 21.5-30.83-7.72-12.96-18.55-23.92-31.5-31.7-7.87-4.73-16.4-8.04-25.28-9.86-1.71-.35-3.44-.66-5.16-.88-1.05-.13-2.1-.25-3.16-.32-.1-.02-.2-.02-.3-.02-.98-.06-1.96-.08-2.94-.08zm64.3 121.74c-14.64 6.57-28.38 13.45-41.62 20.6-10.98 5.96-21.5 12.05-31.56 18.3 5.3 9.13 8.6 18.9 9.6 28.67 13.18 1.22 27.5 4.76 41.64 11.58 4.8-10.1 11.66-19.1 19.94-26.5-1.35-16.44.26-33.18 2-52.65zm-94.02 55.07c-2.38 10.5-6.62 20.57-12.78 29.3-5.94 8.42-13.47 15.3-22.07 20.43.9 24.07-.1 48.8-5.4 74.72 12.27 3.76 24.28 8.45 35.92 14.1 6.06-6.9 13.8-12.23 22.3-15.84-1.52-17.35-.77-36.27 5.9-53.77 6.63-17.36 18.4-33.42 37.22-44.5-4.58-9.5-8.26-19.06-10.22-28.67-16.63 3.02-33.4 3.4-50.87 4.23zm-100.57 76.6c-9.55 7.43-19.12 15.46-28.22 24.12 7.27-.1 13.37 1.4 18.6 3.73 3.5-4.1 6.58-8.56 9.1-13.36 3.68-6.85 5.78-9.94.52-14.5zM44.1 390.67c-4.62 12.43-7.65 25.52-8.73 39.05 8.93 2.14 17.66 5.85 25.42 11.35 11.5-7.5 24.53-10.7 37.1-10.5-2.6-9.05-7.14-17.66-13.97-23.72-7.8-6.84-17.4-10.42-26.8-11.38-4.65-.47-9.17-.3-13.05.2zm97.78 34.36c-3.7 6.05-6.4 12.8-7.6 20-1.53 9.05-.26 17.88 3.12 25.67 8.6-1.5 17.47-1.4 26.32.93 7.22 1.88 13.73 5.23 19.26 9.62 6.6-6.82 14.72-11.5 23.26-13.97-1.94-2.92-4.1-5.63-6.6-8-8.26-7.9-19.4-11.78-30.14-10.57-.3.04-.6.08-.9.1-6.94-7.66-16.25-12.73-26.72-13.78zm94.07 34.77c-6.17 5.46-11.35 11.96-14.7 19.35-2.44 5.28-3.75 10.82-4.13 16.3 9.97 2.77 20.37 7.64 29.22 15.55 4.84-1.82 9.62-3.05 14.38-3.57-1.73-10.5-.72-21.1 2.73-31.3-11.9-1.8-20.97-7.04-27.5-16.33z'/></svg></div>,
      keyholder_orc: (id) => <div className={`w-8 h-8 text-emerald-500 drop-shadow-lg transition-transform ${animationState.hits[id] > Date.now() - 200 ? 'entity-hit' : ''}`}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor"><g><path d="M55.4,63.3c-0.1,0.2-0.3,0.4-0.4,0.6c0.2,0.7,0.6,1.9,1.5,3c1,1.1,2.1,1.7,2.6,1.9c0,0.5,0.1,1.5-0.4,2.6 c-0.7,1.7-1.9,2.6-2.4,2.8c0.7,1.2,1.7,3.2,2.2,5.7c0.7,4.1-0.2,7.4-0.8,8.9h19.3v-1.7c-1.8-0.4-4-1-6.4-2.1 c-1.5-0.7-2.8-1.4-3.9-2.1c1.5-1.6,3.7-4.6,5.1-8.7c0.8-2.4,1-4.5,1.1-6.2c-2.5-6.5-4.9-10-6.9-12c-0.3-0.3-0.7-0.7-1.2-1.4 c-1.8,1.1-3.6,2.4-5.2,3.9C58.1,59.9,56.6,61.5,55.4,63.3z"/><path d="M61.5,41.5c-0.4-1-0.6-2.1-0.7-3.2c-0.1-1.1,0.1-2.2,0.3-3.3c0.2-1.1,0.6-2.1,0.9-3.1c0.3-1,0.6-2,0.9-3.1 c0.3-1,0.6-2.1,0.9-3.1l1.6-6.2c-1.4,0-2.5,0.2-3.5,0.3c-0.3,1.8-0.8,3.5-1.3,5.2c-0.5,1.7-1.1,3.4-1.8,5.1 c-0.7,1.7-1.5,3.3-2.4,4.8c-0.9,1.6-1.8,3.1-2.8,4.6c-1,1.5-2.2,2.9-3.5,4.2c-1.3,1.3-2.6,2.5-4.1,3.5c-2.9,2.1-6.2,3.7-9.6,4.9 c-0.4,1-1,1.8-1.4,2.4c-0.5,0.6-0.9,1.1-1.2,1.4c-1.9,2-4.4,5.5-6.9,12c0.1,1.7,0.3,3.8,1.1,6.2c1.3,4.2,3.6,7.1,5.1,8.7 c-1.1,0.7-2.4,1.4-3.9,2.1c-2.4,1.1-4.5,1.7-6.4,2.1v1.7h19.3c-0.6-1.6-1.5-4.9-0.8-8.9c0.5-2.5,1.4-4.4,2.2-5.7 c-0.5-0.3-1.7-1.2-2.4-2.8c-0.4-1.1-0.4-2-0.4-2.6c0.6-0.3,1.7-0.8,2.6-1.9c0.9-1,1.3-2.2,1.5-3c-0.1-0.2-0.3-0.4-0.4-0.6 c-1.2-1.8-2.7-3.4-4.3-4.8c-1.6-1.5-3.4-2.7-5.2-3.9c0.5,0.3,1,0.5,1.4,0.8c0.5,0.3,0.9,0.6,1.4,0.9c0.9,0.6,1.8,1.2,2.6,1.9 c1.7,1.4,3.2,3,4.5,4.7c0.1,0.2,0.3,0.4,0.4,0.5c0.5,0.7,1,1.5,1.4,2.2c0.5,1,1,1.9,1.4,3c0.7,1.6,1.2,3.2,1.7,4.9 c0.5-1.7,1-3.3,1.7-4.9c0.4-1,0.9-2,1.4-3c0.4-0.8,0.9-1.5,1.4-2.2c0.1-0.2,0.3-0.4,0.4-0.5c1.3-1.8,2.8-3.3,4.5-4.7 c0.8-0.7,1.7-1.3,2.6-1.9c0.5-0.3,0.9-0.6,1.4-0.9c0.5-0.3,0.9-0.5,1.4-0.8c-0.7-0.9-1.4-2-1.9-3.6c-0.2-0.7-0.7-2.5-0.5-4.7 c0.1-0.7,0.2-1.3,0.4-1.9c-0.3-0.4-0.6-0.9-0.8-1.4C61.9,42.5,61.7,42,61.5,41.5z"/><path d="M97.6,69c-3.7-5.5-5-10.2-5.5-13.5c-0.5-3.3-0.4-6.2-2.5-9.1c-1.8-2.6-4.5-3.8-6.4-4.5c-0.2-1.4-0.7-3.5-1.9-5.6 c-0.8-1.5-1.7-2.7-2.5-3.6c0.1-0.9,0.7-5.7-2.5-9.3c-2.2-2.4-5.1-3-7.2-3.4c-1.3-0.3-2.5-0.4-3.6-0.4c-0.3,2.1-0.6,4.2-1.1,6.3 c-0.4,2.1-1,4.2-1.6,6.2c-0.3,1-0.7,2-0.9,3.1c-0.1,0.5-0.2,1-0.3,1.5c-0.1,0.5-0.1,1-0.1,1.6c0,2.1,0.7,4.2,1.6,6.1 c1.2-3.7,4.3-5.9,5-6.3c0.8,1.5,1.9,3.2,3.2,5c1.3,1.8,2.7,3.2,3.9,4.4c1.1,2.8,2.9,6.3,5.7,10c1.5,1.9,3,3.6,4.5,4.9 c-0.6,0.4-2.9,2.3-3.6,5.6c-0.8,4,1.4,7.1,1.7,7.6c0.1-1,0.5-2.8,1.7-4.7c0.9-1.4,1.9-2.3,2.7-2.9c0.5,1.2,1.1,2.5,1.7,3.8 c0.8,1.7,1.7,3.2,2.6,4.5c-0.4,0.2-0.9,0.6-1.4,1.2c-0.9,1-1.1,2.1-1.2,2.7c0.7,0.1,1.7,0.4,2.9,1.2c1,0.6,1.6,1.4,2,1.9 c0.9-0.9,2.2-2.5,3.1-4.8C99,74,98,70.3,97.6,69z"/><path d="M45.8,46.9c2.8-2.1,5.3-4.7,7.3-7.6c1-1.4,1.9-3,2.8-4.5c0.9-1.5,1.7-3.1,2.4-4.7c1.5-3.2,2.7-6.6,3.6-10.1 c-0.3,0.1-0.6,0.1-0.8,0.2c-0.2-0.4-0.6-1-1.3-1.6c-0.5-0.5-1.1-0.8-1.5-1c0.4-0.4,0.9-0.9,1.3-1.5c0.9-1.3,1.3-2.6,1.4-3.4 c-0.6,0-2.4-0.1-3.9,1.1c-0.6,0.5-1.1,1-1.3,1.4c-0.3-0.6-1-1.7-2.3-2.7c-1.4-1-2.9-1.2-3.5-1.3c-0.6,0.1-2.1,0.3-3.5,1.3 c-1.3,0.9-2,2.1-2.3,2.7c-0.3-0.4-0.7-1-1.3-1.4c-1.6-1.2-3.4-1.2-3.9-1.1c0.2,0.8,0.5,2.1,1.4,3.4c0.4,0.6,0.9,1.1,1.3,1.5 c-0.4,0.2-0.9,0.5-1.5,1c-0.6,0.6-1,1.2-1.3,1.6c-1.6-0.4-4.5-0.8-7.9-0.2c-2.2,0.4-5.1,1-7.3,3.4c-3.2,3.5-2.6,8.4-2.5,9.3 c-0.8,0.9-1.7,2.1-2.5,3.6c-1.1,2.2-1.6,4.2-1.9,5.6c-2,0.7-4.6,2-6.4,4.5c-2.1,2.9-2,5.8-2.5,9.1c-0.5,3.3-1.9,8-5.5,13.5 C2,70.3,1,74,2.5,78.3c0.9,2.3,2.2,3.9,3.1,4.8c0.4-0.5,1-1.2,2-1.9c1.1-0.7,2.2-1,2.9-1.2c-0.1-0.5-0.3-1.6-1.2-2.7 c-0.5-0.6-1-0.9-1.4-1.2c0.9-1.3,1.7-2.8,2.6-4.5c0.7-1.3,1.2-2.6,1.7-3.8c0.7,0.6,1.8,1.5,2.7,2.9c1.2,1.9,1.6,3.6,1.7,4.7 c0.4-0.5,2.6-3.5,1.7-7.6c-0.7-3.3-3-5.1-3.6-5.6c1.4-1.3,3-3,4.5-4.9c2.8-3.6,4.6-7.1,5.7-10c1.2-1.2,2.5-2.6,3.9-4.4 c1.4-1.8,2.4-3.5,3.2-5c0.8,0.5,4.8,3.3,5.4,8.2c0.3,2.2-0.2,4.1-0.5,4.7c-0.1,0.4-0.3,0.8-0.4,1.1c1.6-0.7,3.2-1.5,4.8-2.4 C42.9,48.9,44.4,47.9,45.8,46.9z M54.2,16.3c0.4,0,0.8,0.3,0.8,0.8c0,0.4-0.3,0.8-0.8,0.8s-0.8-0.3-0.8-0.8 C53.4,16.7,53.7,16.3,54.2,16.3z M45.8,16.3c0.4,0,0.8,0.3,0.8,0.8c0,0.4-0.3,0.8-0.8,0.8c-0.4,0-0.8-0.3-0.8-0.8 C45.1,16.7,45.4,16.3,45.8,16.3z M44.6,23c0.1-0.2,0.2-0.3,0.3-0.5c0.2-0.3,0.4-0.7,0.6-1c0.2-0.4,0.3-0.7,0.5-1.1 c0.1-0.4,0.2-0.7,0.3-1.1l0.1-0.7l0.3,0.6c0.3,0.6,0.5,1.2,0.4,1.9c0,0.3-0.1,0.6-0.2,0.9c-0.1,0.2-0.2,0.5-0.3,0.7 c0.1,0,0.3-0.1,0.4-0.1c1-0.2,2-0.3,3-0.3c1,0,2,0.1,3,0.3c0.1,0,0.3,0.1,0.4,0.1c-0.1-0.2-0.2-0.4-0.3-0.6 c-0.1-0.3-0.2-0.6-0.2-0.9c-0.1-0.6,0.1-1.3,0.4-1.9l0.3-0.6l0.1,0.7c0.1,0.4,0.2,0.8,0.3,1.1c0.1,0.4,0.3,0.7,0.5,1.1 c0.2,0.4,0.4,0.7,0.6,1c0.1,0.2,0.2,0.3,0.3,0.5c0.1,0.2,0.2,0.3,0.4,0.5c-1-0.2-1.9-0.4-2.9-0.6c-1-0.1-1.9-0.2-2.9-0.1 c-1,0-1.9,0.1-2.9,0.2c-1,0.1-1.9,0.3-2.9,0.5C44.4,23.3,44.5,23.1,44.6,23z"/></g></svg></div>,
      rubble: () => <div className="w-8 h-8 text-stone-500"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M1 1 L1 5 L5 5 L5 1 Z M7 1 L7 5 L11 5 L11 1 Z M13 1 L13 5 L17 5 L17 1 Z M1 7 L1 11 L5 11 L5 7 Z M7 7 L7 11 L11 11 L11 7 Z M13 7 L13 11 L17 11 L17 7 Z M1 13 L1 17 L5 17 L5 13 Z M7 13 L7 17 L11 17 L11 13 Z M13 13 L13 17 L17 17 L17 13 Z" opacity="0.4" transform="rotate(15 10 10)"/><path d="M2 2 L2 6 L6 6 L6 2 Z M8 2 L8 6 L12 6 L12 2 Z M14 2 L14 6 L18 6 L18 2 Z M2 8 L2 12 L6 12 L6 8 Z M8 8 L8 12 L12 12 L12 8 Z M14 8 L14 12 L18 12 L18 8 Z M2 14 L2 18 L6 18 L6 14 Z M8 14 L8 18 L12 18 L12 14 Z M14 14 L14 18 L18 18 L18 14 Z" /></svg></div>,
      cobweb: () => <div className="w-10 h-10 text-slate-300 opacity-60"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2 L12 22 M2 12 L22 12 M4.9 4.9 L19.1 19.1 M4.9 19.1 L19.1 4.9"/><path d="M12 2 C 15 5, 17 8, 17 12 S 15 19, 12 22"/><path d="M12 2 C 9 5, 7 8, 7 12 S 9 19, 12 22"/><path d="M2 12 C 5 9, 8 7, 12 7 S 19 9, 22 12"/><path d="M2 12 C 5 15, 8 17, 12 17 S 19 15, 22 12"/></svg></div>,
      healing_spring: () => <div className="w-10 h-10 text-cyan-400 animate-pulse"><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg></div>,
      trap_triggered: () => <div className="w-8 h-8 text-red-500"><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg></div>,
      altar: () => <div className="w-10 h-10 text-purple-400 drop-shadow-lg animate-pulse"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM5 10a5 5 0 1110 0 5 5 0 01-10 0z"/><path d="M10 4a6 6 0 100 12 6 6 0 000-12zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" opacity="0.4"/></svg></div>,
      altar_used: () => <div className="w-10 h-10 text-slate-600"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM5 10a5 5 0 1110 0 5 5 0 01-10 0z"/><path d="M10 4a6 6 0 100 12 6 6 0 000-12zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" opacity="0.4"/></svg></div>
    };
    
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        const key = `${y},${x}`;
        const tile = localDungeonState.board[key] || { type: 'empty' };
        let tileContent = null;
        let tileStyle = {};
        let tileClass = 'relative ';
        const isTrailTile = localDungeonState.lastMoveTrails?.some(t => t.x === x && t.y === y);

        if (isTrailTile) {
            tileStyle = { backgroundColor: '#334155' };
            tileClass += 'bg-slate-700/50';
        } else {
            tileStyle = {};
            tileClass += 'bg-slate-800/20';
        }

                switch(tile.type) {
            case 'wall': 
              tileClass = 'bg-black/80 shadow-inner'; 
              tileStyle = { backgroundImage: `url('https://www.transparenttextures.com/patterns/brick-wall-dark.png')`};
              break;
            case 'rubble':
              tileClass = 'bg-stone-700/50';
              tileContent = SVGIcons.rubble();
              break;
            case 'cobweb':
              tileContent = SVGIcons.cobweb();
              break;
            case 'healing_spring':
              tileContent = SVGIcons.healing_spring();
              break;
            case 'trap':
              if (tile.triggered) {
                tileClass += 'bg-red-900/30';
                tileContent = SVGIcons.trap_triggered();
              }
              // Untriggered traps are invisible to the player.
              break;
            case 'rubble':
              tileClass = 'bg-stone-700/50';
              tileStyle = { backgroundImage: `url('https://www.transparenttextures.com/patterns/asfalt-light.png')` };
              break;
            case 'cobweb':
              tileClass = 'bg-slate-800/20';
              tileContent = <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cross-scratches.png')` }} />;
              break;
            case 'healing_spring':
              tileClass = 'bg-cyan-800/50 animate-pulse';
              break;
            case 'trap':
              tileClass = `bg-slate-800/20 ${tile.triggered ? 'bg-red-900/50' : ''}`;
              if (tile.triggered) tileContent = <div className="text-red-500 text-2xl">!!</div>;
              break;
            case 'hatch':
                const hasKey = localDungeonState.player.hasKey;
                tileContent = <div className={`w-8 h-8 rounded-md transition-all duration-300 ${hasKey ? 'bg-yellow-600 shadow-[0_0_15px_rgba(250,204,21,0.7)]' : 'bg-purple-800'} border-2 border-black/20`} />;
                break;
            case 'key': tileContent = SVGIcons.key(); break;
            case 'chest': tileContent = tile.opened ? SVGIcons.chest_opened() : SVGIcons.chest_closed(); break;
            // Player and Enemy cases are removed; they will be rendered in a separate layer.
            default: break;
        }
        
        const particlesOnTile = animationState.particles.filter(p => p.x === x && p.y === y);
        const isDangerTile = dangerZone.tiles.some(t => t.x === x && t.y === y);
        const enemyPositions = new Set(localDungeonState.enemies.map(e => `${e.y},${e.x}`));
        
        const ArrowIcon = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-white opacity-60"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

        let pathArrowData = null;
        if (!enemyPositions.has(key)) {
            Object.values(localDungeonState.enemyMovePaths || {}).forEach(path => {
                const index = path.findIndex(p => p && p.x === x && p.y === y);
                if (index > 0) {
                    const prev = path[index-1];
                    const curr = path[index];
                    const dx = curr.x - prev.x;
                    const dy = curr.y - prev.y;
                    
                    // Use Math.atan2 to get the precise angle in radians, then convert to degrees.
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    
                    pathArrowData = { rotation: angle };
                }
            });
        }

        row.push(
          <div key={key} onClick={() => handleTileClick(x, y, activeTurn)} style={tileStyle} className={`border border-slate-700/50 flex items-center justify-center transition-colors duration-200 ${tileClass} ${activeTurn !== 'enemy' ? 'cursor-pointer hover:bg-slate-600/50' : 'cursor-wait'} ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`}>
            {tileContent}
            {isDangerTile && tile.type !== 'wall' && (
              <div className="absolute inset-0 pointer-events-none bg-red-500/20 animate-pulse"></div>
            )}
            {particlesOnTile.map(p => <Particle key={p.id} onComplete={() => {}} />)}
            {pathArrowData && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in" style={{ transform: `rotate(${pathArrowData.rotation}deg)`}}>
                <ArrowIcon />
              </div>
            )}
          </div>
        );
      }
      boardGrid.push(<div key={y} className="flex">{row}</div>);
    }
    
   const TILE_SIZE = isMobile ? 32 : 48;

    const WingmanSprite = ({ style }) => {
      const containerSize = 32;
      const largestDim = Math.max(style.width, style.height);
      const scale = containerSize / largestDim;
      
      return (
        <div className="relative w-full h-full overflow-hidden">
          <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: style.width, 
              height: style.height,
              backgroundImage: `url(${wingmenSpriteSheet})`,
              backgroundPosition: style.backgroundPosition,
              transform: `translate(-50%, -50%) scale(${scale})`,
              imageRendering: 'pixelated',
          }}/>
        </div>
      );
    };

    const entities = [
        ...localDungeonState.enemies.map(e => ({...e, entityType: 'enemy'})),
        {...localDungeonState.player, id: 'player', entityType: 'player', combatStyle: classDef?.combatStyle}
    ];
    if (localDungeonState.wingman) {
      entities.push({...localDungeonState.wingman, entityType: 'wingman'});
    }

    const entityElements = entities.map(entity => {
      const top = entity.y * TILE_SIZE + (TILE_SIZE / 2 - 16);
      const left = entity.x * TILE_SIZE + (TILE_SIZE / 2 - 16);
      const enemyDef = entity.entityType === 'enemy' 
        ? dungeonDefinitions.enemies.find(e => e.id === entity.baseId) 
        : null;
      const combatStyle = enemyDef ? enemyDef.combatStyle : entity.combatStyle;
      let Icon;
      if (entity.entityType === 'player') {
        Icon = SVGIcons.player(entity.id);
      } else if (entity.entityType === 'wingman') {
        Icon = <WingmanSprite style={entity.spriteStyle} />;
      } else { // enemy

        Icon = SVGIcons[entity.baseId] ? SVGIcons[entity.baseId](entity.id) : <div className="w-8 h-8 rounded-full bg-red-600" />;
      }

                  return (

        <div 
          key={entity.id} 
          onClick={
            entity.entityType === 'enemy' 
              ? (e) => handleEnemyClick(e, entity) 
              : (e) => handleFriendlyClick(e, entity)
          }
          className={`absolute z-10 ${entity.isElite ? 'elite-enemy-glow' : ''}`} 
          style={{ 
            width: 32, height: 32,
            top: top,
            left: left,

            // The browser will now automatically animate any changes to top and left.
            transition: 'top 0.25s linear, left 0.25s linear',
            cursor: 
              (entity.entityType === 'enemy' && activeTurn !== 'enemy' && (attackTarget || abilityTarget || (wingmanAbilityTarget && wingmanAbilityTarget.id !== 'heal'))) ||
              (entity.entityType !== 'enemy' && activeTurn === 'wingman' && wingmanAbilityTarget?.id === 'heal')
               ? 'pointer' : 'default'
          }}
        >
          {Icon}
          <div className="absolute -top-1 -right-1 z-20 bg-slate-900/80 rounded-full p-0.5">
            <CombatStyleIcon style={entity.combatStyle} />
          </div>
          {entity.entityType === 'enemy' && (
            <div className="absolute -bottom-2 w-full h-1.5 bg-red-900/80 rounded-full overflow-hidden border border-black/50">
              <div 
                className="h-full bg-red-500 transition-all duration-200" 
                style={{ width: `${Math.max(0, (entity.hp / entity.maxHp) * 100)}%` }}
              />
            </div>
          )}
        </div>
      );
    });

    return (
      <div className="relative">
        {boardGrid}
        {entityElements}
      </div>
    );
  };

    return (
    <div>
      {localDungeonState.floorModifier && (
        <div className="mb-4 p-4 bg-purple-900/50 border border-purple-700 rounded-lg text-center">
          <h3 className="text-xl font-bold text-purple-300">{localDungeonState.floorModifier.name}</h3>
          <p className="text-sm text-slate-400">{localDungeonState.floorModifier.description}</p>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <div><h2 className="text-3xl font-bold text-white">Dungeon Crawler</h2><p className="text-slate-400">Floor: {localDungeonState.floor} | Highest Floor: {stats.dungeon_floor || 1}</p></div>
        <div className="flex space-x-2">
            <button onClick={() => saveGame(localDungeonState)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Save</button>
            <button onClick={() => { setBarracksOpen(false); setLocalDungeonState(prev => ({...prev, shopOpen: !prev.shopOpen, bestiaryOpen: false})); setShopView('buy'); setSelectedArmoryItem(null); }} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Shop / Armory</button>
            <button onClick={() => { setLocalDungeonState(prev => ({...prev, shopOpen: false, bestiaryOpen: false})); setBarracksOpen(b => !b); }} className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">Barracks</button>
            <button onClick={() => { setBarracksOpen(false); setLocalDungeonState(prev => ({...prev, bestiaryOpen: !prev.bestiaryOpen, shopOpen: false}))}} className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700">Bestiary</button>
            <button onClick={onResetDungeon} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Reset</button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-grow flex justify-center lg:justify-start">
          <div className="p-2 bg-slate-900/50 border border-slate-700 rounded-lg inline-block relative">
            {turnIndicator && (
                <div key={turnIndicator} className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="text-5xl font-bold text-white bg-black/50 px-8 py-4 rounded-lg animate-fade-out-fast" style={{textShadow: '0 0 10px black'}}>
                        {turnIndicator}
                    </div>
                </div>
            )}
            {renderBoard()}
          </div>
        </div>
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-slate-800/50 p-4 rounded-xl mb-4">
            <h3 className="font-bold text-white">Player Stats</h3>
            <p>HP: <span className="text-red-400 font-bold">{localDungeonState.player.hp} / {fullPlayerStats.maxHp}</span></p>
            <div className="w-full bg-slate-700 rounded-full h-2.5 mt-1"><div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${(localDungeonState.player.hp / fullPlayerStats.maxHp) * 100}%` }}></div></div>
            <p>Attack: <span className="text-yellow-400 font-bold">{fullPlayerStats.attack}</span> | Gold: <span className="text-yellow-400 font-bold">{sessionGold || 0}</span></p>
            {activeTurn === 'player' && <p>Action Points: <span className="font-bold text-cyan-400">{playerActionPoints} / 2</span></p>}
             {localDungeonState.wingman && (
              <div className="mt-2 border-t border-slate-700 pt-2">
                <h4 className="text-sm font-bold text-slate-300">Wingman: {localDungeonState.wingman.name}</h4>
                 <p>HP: <span className="text-red-400 font-bold">{localDungeonState.wingman.hp} / {localDungeonState.wingman.maxHp}</span> | Attack: <span className="text-yellow-400 font-bold">{localDungeonState.wingman.atk}</span></p>
                 {activeTurn === 'wingman' && <p>Action Points: <span className="font-bold text-cyan-400">{wingmanActionPoints} / {localDungeonState.wingman.ap}</span></p>}
              </div>
            )}
            <p>Pet: <span className="font-semibold">{stats.currentPet?.name || 'None'}</span> {localDungeonState.player.hasKey && <span className="text-yellow-300 font-bold ml-4">🔑 Key</span>}</p>
            {localDungeonState.player.activeEffects && localDungeonState.player.activeEffects.length > 0 && (
              <div className="mt-2 border-t border-slate-700 pt-2">
                <h4 className="text-sm font-bold text-slate-300">Active Effects:</h4>
                <div className="flex flex-wrap gap-2 text-xs mt-1">
                  {localDungeonState.player.activeEffects.map(effect => {
                    const def = dungeonDefinitions.temp_potions.find(p => p.id === effect.id);
                    return (
                      <span key={effect.id} className="bg-purple-600/50 text-purple-300 px-2 py-1 rounded-full">
                        {def?.name} ({effect.remainingFloors} floors left)
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl mb-4">
            <h3 className="font-bold text-white mb-2">Actions</h3>
            <div className="grid grid-cols-2 gap-2">
                {activeTurn === 'player' && (
                  <>
                    <button onClick={() => setAttackTarget({ type: 'primary' })} className="bg-red-600 text-white p-2 rounded hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-wait" disabled={!!attackTarget || !!abilityTarget || playerActionPoints < 1}>
                        {attackTarget ? "Select Target..." : `Primary Attack (1 AP)`}
                    </button>
                    <button onClick={() => setAttackTarget({ type: 'secondary' })} className="bg-red-800 text-white p-2 rounded hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-wait" disabled={!localDungeonState.equippedOffhandWeapon || !!attackTarget || !!abilityTarget || playerActionPoints < 1}>
                        Secondary Attack (1 AP)
                    </button>
                    <button onClick={usePotion} className="bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-slate-600" disabled={(localDungeonState.potions || 0) <= 0}>
                        Use Potion ({localDungeonState.potions || 0})
                    </button>
                    {dungeonDefinitions.attacks.filter(a => a.class === localDungeonState.playerClass).map(attack => {
                        const usesLeft = localDungeonState.player.abilityUses?.[attack.id] || 0;
                        const canAfford = sessionXp >= attack.cost;
                        const isDisabled = usesLeft <= 0 || !canAfford || !!attackTarget || !!abilityTarget || playerActionPoints < 1;
                        
                        const handleAbilityClick = () => {
                          if (isDisabled) return;
                          setAttackTarget(null);
                          if (attack.isSelfTarget) {
                            handleAttack('player', localDungeonState.player, attack.id);
                          } else {
                            setAbilityTarget(attack.id);
                            addLog(`Select a target for ${attack.name}.`, 'text-cyan-400');
                          }
                        };

                        return (
                            <button key={attack.id} onClick={handleAbilityClick} className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 disabled:bg-slate-600/50 disabled:cursor-not-allowed" disabled={isDisabled}>
                                {abilityTarget === attack.id ? 'Select Target...' : `${attack.name} (${usesLeft}/${attack.maxUses})`}
                            </button>
                        );
                    })}
                    
                    {/* NEW: Charge Button */}
                    {(() => {
                        const weapon = Object.values(dungeonDefinitions.primaryWeapons.mage).flat().find(w => w.id === localDungeonState.equippedWeapon);
                        if (activeTurn === 'player' && weapon?.isChargeable) {
                          const chargeEffect = localDungeonState.player.activeEffects?.find(e => e.type === 'charge');
                          const chargeLevel = chargeEffect?.level || 0;
                          const isDisabled = chargeLevel >= weapon.maxCharges || playerActionPoints < 1;
                          return (
                            <button onClick={handleCharge} disabled={isDisabled} className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 disabled:bg-slate-600">
                              Charge Staff ({chargeLevel}/{weapon.maxCharges})
                            </button>
                          )
                        }
                        return null;
                    })()}
                  </>
                )}
                {activeTurn === 'wingman' && localDungeonState.wingman && (
                  <>
                    <button 
                      onClick={() => { setWingmanAbilityTarget(null); setAttackTarget(true); }}
                      className="bg-red-600 text-white p-2 rounded hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-wait" 
                      disabled={!!attackTarget || !!wingmanAbilityTarget || wingmanActionPoints < localDungeonState.wingman.attackCost}
                    >
                      {attackTarget ? 'Select Target...' : `Attack (${localDungeonState.wingman.attackCost} AP)`}
                    </button>
                    {localDungeonState.wingman.abilities?.map(ability => (
                       <button
                           key={ability.id}
                           onClick={() => handleWingmanAbilityClick(ability)}
                           disabled={wingmanActionPoints < ability.cost || !!wingmanAbilityTarget || !!attackTarget}
                           className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-wait"
                       >
                           {wingmanAbilityTarget?.id === ability.id ? 'Select Target...' : `${ability.name} (${ability.cost} AP)`}
                       </button>
                    ))}
                    {wingmanTurnState.frenziedAttackAvailable && (
                        <button
                            onClick={() => { setWingmanAbilityTarget(null); setAttackTarget({ isFrenzied: true }); }}
                            className="col-span-2 bg-orange-600 text-white p-2 rounded hover:bg-orange-700 animate-pulse"
                        >
                          Frenzied Assault (Free Action)
                        </button>
                    )}
                  </>
                )}
                 <button onClick={() => {
                   setAttackTarget(null); // Clear any targeting state
                   setAbilityTarget(null);
                   if (activeTurn === 'player') {
                     if (localDungeonState.wingman) setActiveTurn('wingman');
                     else { setActiveTurn('enemy'); setTimeout(processEnemyTurns, 100); }
                   } else if (activeTurn === 'wingman') {
                     setActiveTurn('enemy');
                     setTimeout(processEnemyTurns, 100);
                   }
                 }} className="col-span-2 bg-slate-600 text-white p-2 rounded hover:bg-slate-700 disabled:bg-slate-800 disabled:cursor-wait" disabled={activeTurn === 'enemy'}>
                    End Turn
                </button>
            </div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl">
              <h3 className="font-bold text-white mb-2">Game Log</h3>
              <div className="space-y-1 text-sm">
                  {(localDungeonState.log || []).map((entry) => <p key={entry.id} className={entry.style}>{entry.message}</p>)}
              </div>
          </div>
        </div>
      </div>
      {localDungeonState.gameOver && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-slate-800 p-8 rounded-lg text-center border border-red-500">
                  <h2 className="text-3xl font-bold text-red-400 mb-4">Game Over!</h2>
                  <p className="text-slate-300 mb-6">You were defeated on floor {localDungeonState.floor}.</p>
                  <button onClick={onResetDungeon} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">Play Again</button>
              </div>
          </div>
      )}
            {barracksOpen && (
              <WingmanBarracks 
                stats={stats}
                wingmanDefs={wingmanDefinitions}
                updateStatsInFirestore={updateStatsInFirestore}
                showMessageBox={showMessageBox}
                sessionGold={sessionGold}
                sessionXp={sessionXp}
                isRunActive={localDungeonState.phase === 'playing' && (localDungeonState.floor > 1 || localDungeonState.turnCount > 1)}
                pendingEquippedWingman={pendingEquippedWingman}
                onEquipWingman={setPendingEquippedWingman}
              />
            )}
            {localDungeonState.shopOpen && (
              <div className="mt-6">
                <div className="flex border-b border-slate-700 mb-4">
                  <button onClick={() => setShopView('buy')} className={`px-4 py-2 text-lg font-semibold ${shopView === 'buy' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}>Buy</button>
                  <button onClick={() => { setShopView('armory'); setSelectedArmoryItem(null); }} className={`px-4 py-2 text-lg font-semibold ${shopView === 'armory' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}>Armory</button>
                </div>

                {shopView === 'buy' && (
                  <div className="flex flex-col gap-6">
                    {/* Primary Weapons Section */}
                    <div className="bg-slate-800/80 p-4 rounded-lg">
                        <h3 className="text-xl font-bold text-white mb-3">Primary Weapons</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(dungeonDefinitions.primaryWeapons[localDungeonState.playerClass] || {}).map(([type, weapons]) => (
                                <div key={type} className="bg-slate-900/50 p-3 rounded-md">
                                    <h4 className="font-semibold text-indigo-300 capitalize mb-2">{type}</h4>
                                    <div className="space-y-2">
                                        {weapons.map(w => {
                                            const isOwned = (localDungeonState.ownedWeapons || []).includes(w.id);
                                            const meetsWinReq = !w.tdWinsRequired || (stats.td_wins || 0) >= w.tdWinsRequired;
                                            const canAfford = sessionXp >= w.cost;
                                            const isDisabled = isOwned || !canAfford || !meetsWinReq;

                                            return <button key={w.id} onClick={() => handleBuyItem(w, 'primaryWeapon', 'xp')} disabled={isDisabled} className={`w-full p-2 rounded text-center text-sm ${isOwned ? 'bg-green-800/60' : isDisabled ? 'bg-slate-700 text-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                                                {isOwned ? 'Owned' : !meetsWinReq ? `Req. ${w.tdWinsRequired} TD Wins` : `${w.name} (${w.cost} XP)`}
                                            </button>;
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Other Items Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-800/80 p-4 rounded-lg space-y-2">
                            <h4 className="font-bold text-white">Secondary Weapons</h4>
                            {dungeonDefinitions.offhandWeapons.filter(w => w.forClass.includes(localDungeonState.playerClass)).map(w => {
                                const isOwned = (localDungeonState.ownedOffhandWeapons || []).includes(w.id);
                                return <button key={w.id} onClick={() => handleBuyItem(w, 'offhandWeapon', 'xp')} disabled={isOwned || sessionXp < w.cost} className={`w-full p-2 rounded text-center text-sm ${isOwned ? 'bg-green-800/60' : sessionXp >= w.cost ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-700 text-slate-400'}`}>{isOwned ? 'Owned' : `${w.name} (${w.cost} XP)`}</button>;
                            })}
                        </div>
                        <div className="bg-slate-800/80 p-4 rounded-lg space-y-2">
                            <h4 className="font-bold text-white">Armor</h4>
                            {dungeonDefinitions.armors.map(a => {
                                const isOwned = (localDungeonState.ownedArmor || []).includes(a.id);
                                const meetsWinReq = !a.tdWinsRequired || (stats.td_wins || 0) >= a.tdWinsRequired;
                                const canAfford = sessionXp >= a.cost;
                                const isDisabled = isOwned || !canAfford || !meetsWinReq;

                                return <button key={a.id} onClick={() => handleBuyItem(a, 'armor', 'xp')} disabled={isDisabled} className={`w-full p-2 rounded text-center text-sm ${isOwned ? 'bg-green-800/60' : isDisabled ? 'bg-slate-700 text-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                                    {isOwned ? 'Owned' : !meetsWinReq ? `Req. ${a.tdWinsRequired} TD Wins` : `${a.name} (${a.cost} XP)`}
                                </button>;
                            })}
                        </div>
                         <div className="bg-slate-800/80 p-4 rounded-lg space-y-2">
                            <h4 className="font-bold text-white">Consumables (Gold)</h4>
                            <button onClick={() => handleBuyItem({name: 'Potion', cost: 50}, 'potion', 'gold')} disabled={(sessionGold || 0) < 50} className="w-full bg-yellow-600 text-black font-semibold p-2 rounded hover:bg-yellow-700 disabled:bg-slate-600">Buy Health Potion (50g)</button>
                            {dungeonDefinitions.temp_potions.map(p => (<button key={p.id} onClick={() => handleBuyItem(p, 'temp_potion', 'gold')} disabled={(sessionGold || 0) < p.cost} className="w-full bg-yellow-600 text-black font-semibold p-2 rounded hover:bg-yellow-700 disabled:bg-slate-600">Buy {p.name} ({p.cost}g)</button>))}
                        </div>
                    </div>
                  </div>
                )}

                {shopView === 'armory' && (() => {
                  const equippedPrimary = Object.values(dungeonDefinitions.primaryWeapons).flatMap(c => Object.values(c).flat()).find(w => w.id === localDungeonState.equippedWeapon);
                  const equippedSecondary = dungeonDefinitions.offhandWeapons.find(w => w.id === localDungeonState.equippedOffhandWeapon);
                  const equippedArmorItem = dungeonDefinitions.armors.find(a => a.id === localDungeonState.equippedArmor);
                  
                  return (
                    <div className="flex flex-col md:flex-row gap-4 min-h-[400px]">
                      {/* Left Side: Item Lists */}
                      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="bg-slate-800/80 p-4 rounded-lg">
                          <h4 className="font-bold text-white mb-2">Primary Weapons</h4>
                          <div className="space-y-1 max-h-96 overflow-y-auto">{(localDungeonState.ownedWeapons || []).map(id => { const item = Object.values(dungeonDefinitions.primaryWeapons).flatMap(c => Object.values(c).flat()).find(w => w.id === id); return item ? <button key={id} onClick={() => setSelectedArmoryItem({ ...item, type: 'primaryWeapon' })} className={`w-full text-left p-2 rounded text-sm ${selectedArmoryItem?.id === id ? 'bg-indigo-500' : 'bg-slate-700 hover:bg-slate-600'}`}>{item.name}</button> : null; })}</div>
                        </div>
                        <div className="bg-slate-800/80 p-4 rounded-lg">
                          <h4 className="font-bold text-white mb-2">Secondary Weapons</h4>
                          <div className="space-y-1 max-h-96 overflow-y-auto">{(localDungeonState.ownedOffhandWeapons || []).map(id => { const item = dungeonDefinitions.offhandWeapons.find(w => w.id === id); return item ? <button key={id} onClick={() => setSelectedArmoryItem({ ...item, type: 'offhandWeapon' })} className={`w-full text-left p-2 rounded text-sm ${selectedArmoryItem?.id === id ? 'bg-indigo-500' : 'bg-slate-700 hover:bg-slate-600'}`}>{item.name}</button> : null; })}</div>
                        </div>
                        <div className="bg-slate-800/80 p-4 rounded-lg">
                          <h4 className="font-bold text-white mb-2">Armor</h4>
                          <div className="space-y-1 max-h-96 overflow-y-auto">{(localDungeonState.ownedArmor || []).map(id => { const item = dungeonDefinitions.armors.find(a => a.id === id); return item ? <button key={id} onClick={() => setSelectedArmoryItem({ ...item, type: 'armor' })} className={`w-full text-left p-2 rounded text-sm ${selectedArmoryItem?.id === id ? 'bg-indigo-500' : 'bg-slate-700 hover:bg-slate-600'}`}>{item.name}</button> : null; })}</div>
                        </div>
                      </div>
                      
                      {/* Right Side: Details & Actions */}
                      <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 flex flex-col gap-4">
                        <div className="bg-slate-800/80 p-4 rounded-lg">
                            <h4 className="font-bold text-white mb-2">Equipped</h4>
                            <div className="space-y-2 text-sm">
                              <p><strong>Primary:</strong> <span className="text-slate-300">{equippedPrimary?.name || 'None'}</span></p>
                              <p><strong>Secondary:</strong> <span className="text-slate-300">{equippedSecondary?.name || 'None'}</span></p>
                              <p><strong>Armor:</strong> <span className="text-slate-300">{equippedArmorItem?.name || 'None'}</span></p>
                            </div>
                        </div>
                        <div className="bg-slate-800/80 p-4 rounded-lg flex-grow">
                          <h4 className="font-bold text-white mb-2">Item Details</h4>
                          {selectedArmoryItem ? (
                            <div>
                              <p className="text-lg font-semibold">{selectedArmoryItem.name}</p>
                              <div className="text-sm text-slate-300 mt-2 space-y-1">
                                {selectedArmoryItem.attack && <p>Attack: <span className="font-bold text-yellow-300">{selectedArmoryItem.attack}</span></p>}
                                {selectedArmoryItem.hp && <p>Bonus HP: <span className="font-bold text-red-300">{selectedArmoryItem.hp}</span></p>}
                                {selectedArmoryItem.description && <p className="text-xs italic text-slate-400 mt-1">{selectedArmoryItem.description}</p>}
                                {selectedArmoryItem.attackRange && <p>Range: <span className="font-bold">{selectedArmoryItem.attackRange}</span></p>}
                                {selectedArmoryItem.accuracy && <p>Accuracy: <span className="font-bold">{selectedArmoryItem.accuracy * 100}%</span></p>}
                                {selectedArmoryItem.aoeRange && <p>AoE Range: <span className="font-bold">{selectedArmoryItem.aoeRange}</span></p>}
                              </div>
                              <button onClick={() => handleEquipItem(selectedArmoryItem, selectedArmoryItem.type)} className="mt-4 w-full bg-green-600 p-2 rounded hover:bg-green-700">Equip</button>
                            </div>
                          ) : <p className="text-slate-400">Select an item to see its stats.</p>}
                        </div>
                        <div className="bg-slate-800/80 p-4 rounded-lg">
                            <h4 className="font-bold text-white mb-2">Permanent Upgrades</h4>
                            <p className="text-xs text-slate-400 mb-3">Bonus HP: +{localDungeonState.boughtStats?.hp || 0} | Bonus Atk: +{localDungeonState.boughtStats?.attack || 0}</p>
                            <div className="space-y-2">
                              <button onClick={() => handleBuyStat('hp')} disabled={sessionXp < 300} className="w-full bg-blue-600 text-white p-2 rounded text-sm hover:bg-blue-700 disabled:bg-slate-600">Buy +10 HP (300 XP)</button>
                              <button onClick={() => handleBuyStat('attack')} disabled={sessionXp < 300} className="w-full bg-blue-600 text-white p-2 rounded text-sm hover:bg-blue-700 disabled:bg-slate-600">Buy +10 Attack (300 XP)</button>
                            </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
            {localDungeonState.bestiaryOpen && (
    <div className="mt-6">
        <h3 className="text-2xl font-bold text-white mb-4">Bestiary</h3>
        <div className="bg-slate-900/50 p-4 rounded-lg mb-6 border border-slate-700">
            <h4 className="text-lg font-semibold text-center text-white mb-3">Combat Triangle</h4>
            <div className="flex justify-around items-center text-center">
                <div className="flex flex-col items-center">
                    <CombatStyleIcon style="Martial" size="w-8 h-8" />
                    <span className="font-bold text-red-400">Martial</span>
                </div>
                <span className="text-2xl text-slate-400 font-bold">&gt;</span>
                <div className="flex flex-col items-center">
                    <CombatStyleIcon style="Finesse" size="w-8 h-8" />
                    <span className="font-bold text-green-400">Finesse</span>
                </div>
                <span className="text-2xl text-slate-400 font-bold">&gt;</span>
                <div className="flex flex-col items-center">
                    <CombatStyleIcon style="Arcane" size="w-8 h-8" />
                    <span className="font-bold text-blue-400">Arcane</span>
                </div>
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">Martial is strong against Finesse, Finesse against Arcane, and Arcane against Martial. (30% Damage Bonus)</p>
        </div>
        <div className="space-y-4">
            {dungeonDefinitions.bestiary.map(entry => {
                const enemyDef = dungeonDefinitions.enemies.find(e => e.id === entry.id);
                return (
                    <div key={entry.id} className="bg-slate-800/80 p-4 rounded-lg flex items-start gap-4">
                        {entry.icon}
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-xl text-white">{entry.name}</h4>
                                {enemyDef && (
                                    <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full">
                                        <CombatStyleIcon style={enemyDef.combatStyle} size="w-5 h-5" />
                                        <span className="text-sm font-semibold capitalize text-slate-300">{enemyDef.combatStyle}</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-slate-300 text-sm mt-1">{entry.description}</p>
                            <p className="text-sm mt-2"><strong className="text-yellow-400">Combat Info:</strong> <span className="text-slate-400">{entry.abilities}</span></p>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
)}
    </div>
  );
};


export { DungeonCrawler, SlotMachineAnimationModal, TaskCompletionAnimation, Projectile, GachaAnimationModal, Particle, WingmanBarracks, commanderDefinitions };
