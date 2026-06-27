import { useCallback } from 'react';
import {
  db,
  appId,
  doc,
  updateDoc,
  serverTimestamp,
  runTransaction,
} from '../utils/firestore';
import { showMessageBox, generatePath, generateInitialDungeonState } from '../utils/helpers';

/**
 * Minigame reset and slot machine logic.
 */
export function useMinigames({
  user,
  stats,
  statsRef,
  setStats,
  actionLock,
  calculateLevelInfo,
  setIsSlotAnimationOpen,
  setDungeonResetKey,
}) {
  const resetDungeonGame = useCallback(
    () =>
      actionLock(async () => {
        if (!db || !user) return;

        const initialDungeonState = generateInitialDungeonState();

        setStats((prevStats) => ({
          ...prevStats,
          dungeon_state: initialDungeonState,
          dungeon_floor: 0,
          dungeon_gold: 0,
        }));

        const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);
        try {
          await updateDoc(statsDocRef, {
            dungeon_state: initialDungeonState,
            dungeon_floor: 0,
            dungeon_gold: 0,
            'cooldowns.resetDungeon': serverTimestamp(),
            lastActionTimestamp: serverTimestamp(),
          });
          setDungeonResetKey((prev) => prev + 1);
          showMessageBox('Dungeon has been reset! Choose your class.', 'info');
        } catch (error) {
          const errorMsg = error.message.includes('permission-denied')
            ? "You're resetting too quickly!"
            : 'Dungeon reset failed.';
          showMessageBox(errorMsg, 'error');
        }
      }),
    [user, setStats, actionLock, setDungeonResetKey]
  );

  const resetTowerDefenseGame = useCallback(
    () =>
      actionLock(async () => {
        if (!db || !user) return;
        const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);

        try {
          const petEffects = { dragon: { castleHealth: 1 } };
          const petId = stats.currentPet?.id.split('_')[0];
          const petEffectsApplied = petEffects[petId] || {};

          await runTransaction(db, async (transaction) => {
            const statsDoc = await transaction.get(statsDocRef);
            if (!statsDoc.exists()) throw new Error('Game state not found.');

            transaction.update(statsDocRef, {
              td_wave: 0,
              td_castleHealth: 5 + (petEffectsApplied.castleHealth || 0),
              td_towers: [],
              td_path: generatePath(),
              td_gameOver: false,
              td_gameWon: false,
              td_towerUpgrades: {},
              'cooldowns.resetTowerDefense': serverTimestamp(),
              lastActionTimestamp: serverTimestamp(),
            });
          });
          showMessageBox('New game started!', 'info');
        } catch (error) {
          const errorMsg = error.message.includes('permission-denied')
            ? "You're resetting too quickly!"
            : 'Game reset failed.';
          showMessageBox(errorMsg, 'error');
        }
      }),
    [user, stats.currentPet, actionLock]
  );

  const spinProductivitySlotMachine = useCallback(() => {
    if (statsRef.current.totalXP < 50) {
      showMessageBox('You need 50 XP to spin.', 'error');
      return;
    }
    setIsSlotAnimationOpen(true);
  }, [statsRef, setIsSlotAnimationOpen]);

  const handleSlotAnimationComplete = useCallback(
    async (reward) => {
      setIsSlotAnimationOpen(false);
      if (!db || !user || !reward) return;

      const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);

      try {
        const messageToShow = await runTransaction(db, async (transaction) => {
          const statsDoc = await transaction.get(statsDocRef);
          if (!statsDoc.exists()) throw new Error('User data is missing.');

          const serverStats = statsDoc.data();

          if (serverStats.totalXP < 50) throw new Error('INSUFFICIENT_XP');

          let xpChange = 0;
          let shardChange = 0;
          let message = '';
          const newOwnedItems = [...(serverStats.ownedItems || [])];
          let isNewItem = false;

          if (reward.type === 'xp_gain') {
            xpChange = reward.amount;
          } else if (reward.type === 'xp_loss') {
            xpChange = reward.amount;
          } else if (reward.id) {
            if (!newOwnedItems.includes(reward.id)) {
              newOwnedItems.push(reward.id);
              isNewItem = true;
            } else {
              const rarityShardMap = { common: 2, rare: 5, epic: 15, legendary: 30, mythic: 75 };
              shardChange = rarityShardMap[reward.rarity] || 2;
            }
          }

          const finalTotalXP = serverStats.totalXP - 50 + xpChange;
          const newShards = (serverStats.cosmeticShards || 0) + shardChange;
          const { level: newLevel } = calculateLevelInfo(finalTotalXP);

          if (isNewItem) message = `You won: ${reward.name}!`;
          else if (xpChange > 0) message = `You won ${xpChange} XP!`;
          else if (shardChange > 0) message = `Duplicate ${reward.name}! You get ${shardChange} shards.`;
          else if (xpChange < 0) message = `You lost ${Math.abs(xpChange)} XP.`;
          else message = 'Spin resulted in no change.';

          transaction.update(statsDocRef, {
            totalXP: finalTotalXP,
            currentLevel: newLevel,
            ownedItems: newOwnedItems,
            cosmeticShards: newShards,
            'cooldowns.spinSlotMachine': serverTimestamp(),
          });

          return message;
        });
        if (messageToShow) showMessageBox(messageToShow, 'info');
      } catch (e) {
        if (e.message === 'INSUFFICIENT_XP') showMessageBox('Not enough XP.', 'error');
        else {
          showMessageBox(
            e.message.includes('permission-denied')
              ? "You're spinning too fast! Please wait a moment."
              : 'Server error. XP not spent.',
            'error'
          );
        }
      }
    },
    [user, calculateLevelInfo, setIsSlotAnimationOpen]
  );

  return {
    resetDungeonGame,
    resetTowerDefenseGame,
    spinProductivitySlotMachine,
    handleSlotAnimationComplete,
  };
}
