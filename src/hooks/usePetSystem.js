import { useCallback } from 'react';
import {
  db,
  appId,
  doc,
  updateDoc,
  serverTimestamp,
  runTransaction,
} from '../utils/firestore';
import { petDefinitions, EGG_REQUIREMENT, PET_RARITIES } from '../constants/constants';
import { showMessageBox } from '../utils/helpers';

/**
 * Pet lifecycle: egg collection, hatching, and evolution.
 */
export function usePetSystem({ user, stats, actionLock, calculateLevelInfo, processAchievementRef }) {
  const generateNewPet = useCallback(() => {
    let petRarity = '';
    const roll = Math.random();
    if (roll < PET_RARITIES.mythic) petRarity = 'mythic';
    else if (roll < PET_RARITIES.mythic + PET_RARITIES.legendary) petRarity = 'legendary';
    else if (roll < PET_RARITIES.mythic + PET_RARITIES.legendary + PET_RARITIES.epic) petRarity = 'epic';
    else if (roll < PET_RARITIES.mythic + PET_RARITIES.legendary + PET_RARITIES.epic + PET_RARITIES.rare) petRarity = 'rare';
    else petRarity = 'common';

    const availablePetsOfRarity = petDefinitions[petRarity];
    return availablePetsOfRarity[Math.floor(Math.random() * availablePetsOfRarity.length)];
  }, []);

  const collectFirstEgg = useCallback(
    async () =>
      actionLock(async () => {
        if (!db || !user) return;
        const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);
        try {
          await updateDoc(statsDocRef, {
            petStatus: 'egg',
            assignmentsToHatch: EGG_REQUIREMENT,
            'cooldowns.collectEgg': serverTimestamp(),
          });
          showMessageBox(
            `You found your first egg! Complete ${EGG_REQUIREMENT} assignments to hatch it.`,
            'info',
            3000
          );
        } catch (error) {
          const errorMsg = error.message.includes('permission-denied')
            ? "You're acting too quickly!"
            : 'Server error.';
          showMessageBox(errorMsg, 'error');
        }
      }),
    [user, actionLock]
  );

  const collectNewEgg = useCallback(
    async () =>
      actionLock(async () => {
        if (!db || !user) return;
        if (stats.petStatus !== 'hatched' && stats.petStatus !== 'none') return;
        const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);
        try {
          await runTransaction(db, async (transaction) => {
            const statsDoc = await transaction.get(statsDocRef);
            if (!statsDoc.exists()) throw new Error('User data missing.');
            transaction.update(statsDocRef, {
              petStatus: 'egg',
              assignmentsToHatch: EGG_REQUIREMENT,
              'cooldowns.collectEgg': serverTimestamp(),
            });
          });
          showMessageBox(
            `You found a new egg! Complete ${EGG_REQUIREMENT} assignments to hatch it.`,
            'info',
            3000
          );
        } catch (error) {
          const errorMsg = error.message.includes('permission-denied')
            ? "You're acting too quickly!"
            : 'Server error.';
          showMessageBox(errorMsg, 'error');
        }
      }),
    [user, stats.petStatus, actionLock]
  );

  const handleEvolvePet = useCallback(
    async (petToEvolve) => {
      if (!db || !user) return;

      actionLock(async () => {
        let basePetOfCurrent = null;
        for (const rarityGroup of Object.values(petDefinitions)) {
          basePetOfCurrent = rarityGroup.find(
            (p) =>
              p.id === petToEvolve.id ||
              (p.evolutions && p.evolutions.some((e) => e.id === petToEvolve.id))
          );
          if (basePetOfCurrent) break;
        }

        let nextEvolution = null;
        if (basePetOfCurrent?.evolutions) {
          const currentIndexInEvoChain =
            petToEvolve.id === basePetOfCurrent.id
              ? -1
              : basePetOfCurrent.evolutions.findIndex((e) => e.id === petToEvolve.id);
          if (currentIndexInEvoChain + 1 < basePetOfCurrent.evolutions.length) {
            nextEvolution = basePetOfCurrent.evolutions[currentIndexInEvoChain + 1];
          }
        }

        if (!nextEvolution) {
          showMessageBox('This pet has reached its final evolution!', 'info');
          return;
        }

        const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);

        try {
          await runTransaction(db, async (transaction) => {
            const statsDoc = await transaction.get(statsDocRef);
            if (!statsDoc.exists()) throw new Error('User data missing!');

            const serverStats = statsDoc.data();

            if (serverStats.currentLevel < nextEvolution.levelRequired) {
              throw new Error(`Level ${nextEvolution.levelRequired} required.`);
            }
            if (serverStats.totalXP < nextEvolution.xpCost) {
              throw new Error(`You need ${nextEvolution.xpCost} XP to evolve.`);
            }

            const newTotalXP = serverStats.totalXP - nextEvolution.xpCost;
            const { level: newLevel } = calculateLevelInfo(newTotalXP);

            const updatedOwnedPets = (serverStats.ownedPets || []).map((p) =>
              p.id === petToEvolve.id ? nextEvolution : p
            );
            const newCurrentPet =
              serverStats.currentPet?.id === petToEvolve.id ? nextEvolution : serverStats.currentPet;

            transaction.update(statsDocRef, {
              totalXP: newTotalXP,
              currentLevel: newLevel,
              currentPet: newCurrentPet,
              ownedPets: updatedOwnedPets,
              'cooldowns.evolvePet': serverTimestamp(),
            });
          });

          showMessageBox(
            `Your ${petToEvolve.name} evolved into a ${nextEvolution.name}!`,
            'info',
            5000
          );
          await processAchievementRef.current?.('petsEvolved');
        } catch (error) {
          console.error('Evolution transaction failed: ', error);
          const errorMsg = error.message.includes('permission-denied')
            ? "You're acting too quickly! Please wait a moment."
            : error.message;
          showMessageBox(errorMsg, 'error');
        }
      });
    },
    [user, calculateLevelInfo, actionLock, processAchievementRef]
  );

  const hatchEgg = useCallback(
    async () =>
      actionLock(async () => {
        if (!db || !user) return;
        if (stats.petStatus !== 'egg' || stats.assignmentsToHatch > 0) return;
        const newPet = generateNewPet();
        const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);
        try {
          await runTransaction(db, async (transaction) => {
            const statsDoc = await transaction.get(statsDocRef);
            if (!statsDoc.exists()) throw new Error('User data missing.');

            const serverStats = statsDoc.data();
            const updatedOwnedPets = [...(serverStats.ownedPets || []), newPet];

            transaction.update(statsDocRef, {
              petStatus: 'hatched',
              currentPet: newPet,
              ownedPets: updatedOwnedPets,
              assignmentsToHatch: EGG_REQUIREMENT,
              'cooldowns.hatchPet': serverTimestamp(),
            });
          });
          showMessageBox(
            `Your egg hatched! You got a ${newPet.rarity.toUpperCase()} ${newPet.name}!`,
            'info',
            5000
          );
        } catch (error) {
          const errorMsg = error.message.includes('permission-denied')
            ? "You're acting too quickly!"
            : 'Server error.';
          showMessageBox(errorMsg, 'error');
        }
      }),
    [user, stats, generateNewPet, actionLock]
  );

  return {
    collectFirstEgg,
    collectNewEgg,
    handleEvolvePet,
    hatchEgg,
  };
}
