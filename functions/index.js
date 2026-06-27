// REPLACE ENTIRE functions/index.js FILE
const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.calculateOfflineScience = functions.firestore
    .document(
        "artifacts/default-app-id/public/data/stats/{userId}/heartbeat/doc",
    )
    .onUpdate(async (change, context) => {
      const {userId} = context.params;
      const afterData = change.after.data();

      const gameStateRef = db
          .collection("artifacts/default-app-id/public/data/stats")
          .doc(userId).collection("gameState").doc("doc");

      return db.runTransaction(async (transaction) => {
        const gameStateDoc = await transaction.get(gameStateRef);
        if (!gameStateDoc.exists) {
          functions.logger.log(
              `User ${userId} has no game state, skipping calculation.`,
          );
          return;
        }

        const labState = gameStateDoc.data().lab_state;
        if (!labState || !labState.lastLogin) {
          functions.logger.log(
              `User ${userId} has no lab state or lastLogin, initializing.`,
          );
          transaction.update(gameStateRef, {
            "lab_state.lastLogin": afterData.lastSeen,
          });
          return;
        }

        const prestigeBonus = 1 + (labState.prestigeLevel || 0) * 0.10;
        let totalSPS = 0;

        const definitions = {
          beaker: {baseSPS: 0.1, xpUpgrade: {multiplier: 2}},
          microscope: {baseSPS: 1, xpUpgrade: {multiplier: 2}},
          bunsen_burner: {baseSPS: 8, xpUpgrade: {multiplier: 2}},
          computer: {baseSPS: 47, xpUpgrade: {multiplier: 2}},
          particle_accelerator: {baseSPS: 260, xpUpgrade: {multiplier: 2}},
          quantum_computer: {baseSPS: 1400, xpUpgrade: {multiplier: 2}},
        };

        for (const key in labState.labEquipment) {
          if (Object.prototype.hasOwnProperty
              .call(labState.labEquipment, key)) {
            const def = definitions[key];
            if (def) {
              const count = labState.labEquipment[key] || 0;
              let itemSPS = def.baseSPS;
              if (labState.labXpUpgrades &&
                  labState.labXpUpgrades[key]) {
                itemSPS *= def.xpUpgrade.multiplier;
              }
              totalSPS += itemSPS * count;
            }
          }
        }

        const finalSPS = totalSPS * prestigeBonus;
        const lastLoginTime = labState.lastLogin.toDate();
        const currentTime = afterData.lastSeen.toDate();
        const timeDiffSeconds = Math
            .round((currentTime - lastLoginTime) / 1000);

        const maxOfflineSeconds = 7 * 24 * 60 * 60; // 7 days
        const effectiveSeconds = Math.min(timeDiffSeconds, maxOfflineSeconds);

        if (effectiveSeconds > 60) {
          const pointsEarned = effectiveSeconds * finalSPS;
          const newTotalPoints = (labState.sciencePoints || 0) + pointsEarned;

          transaction.update(gameStateRef, {
            "lab_state.sciencePoints": newTotalPoints,
            "lab_state.lastLogin": afterData.lastSeen,
          });

          functions.logger.log(
              `Granted ${pointsEarned} offline points to user ${userId}.`,
          );
        } else {
          transaction.update(gameStateRef, {
            "lab_state.lastLogin": afterData.lastSeen,
          });
        }
      });
    });
