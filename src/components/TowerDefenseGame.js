import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { db, updateDoc, doc, serverTimestamp } from '../utils/firestore';
import { commanderDefinitions, Projectile } from './DungeonCrawler';
import { increment } from 'firebase/firestore';
import { survivorEnemyDefinitions, survivorTowerDefinitions, fortressBossDefinitions, survivorBuffDefinitions, cosmeticItems } from '../constants/constants';

const generateSurvivorPath = () => {
  const GAME_WIDTH = 960;
  const GAME_HEIGHT = 540;
  const path = [];
  const segmentsPerWaypoint = 25; // Controls the smoothness of corners

  // Define a series of waypoints for the path to follow
  const waypoints = [
    { x: -20, y: Math.random() * 200 + 100 }, // Start off-screen left
    { x: GAME_WIDTH * 0.2 + Math.random() * 80, y: Math.random() * (GAME_HEIGHT - 250) + 100 },
    { x: GAME_WIDTH * 0.5 + (Math.random() - 0.5) * 100, y: Math.random() * (GAME_HEIGHT - 250) + 100 },
    { x: GAME_WIDTH * 0.8 + Math.random() * 80, y: Math.random() * (GAME_HEIGHT - 250) + 100 },
    { x: GAME_WIDTH - 50, y: GAME_HEIGHT - 150 } // End near the castle area
  ];

  for (let i = 0; i < waypoints.length - 1; i++) {
    const start = waypoints[i];
    const end = waypoints[i+1];
    for (let j = 0; j <= segmentsPerWaypoint; j++) {
      const t = j / segmentsPerWaypoint;
      // Simple linear interpolation creates a predictable and solid path
      const x = start.x + (end.x - start.x) * t;
      const y = start.y + (end.y - start.y) * t;
      path.push({ x, y });
    }
  }
  
  return path;
};

const generateBuildSlots = (path, count = 5, offset = 80) => {
  const slots = [];
  const pathLength = path.length;
  // Ensure we have a valid path and count to prevent errors
  if (pathLength < 2 || count === 0) return [];
  
  // Calculate evenly spaced indices along the path. We divide by (count + 1) 
  // to create segments and place slots in the middle of them, avoiding the very start and end.
  const interval = Math.floor(pathLength / (count + 1));
  
  for (let i = 1; i <= count; i++) {
    const pathIndex = i * interval;
    if (pathIndex >= pathLength) continue;

    const anchorPoint = path[pathIndex];
    
    // Alternate placing slots above and below the path for visual variety.
    const yOffset = (i % 2 === 0) ? offset : -offset;
    
    const newSlot = {
      x: anchorPoint.x,
      y: anchorPoint.y + yOffset,
      towerId: null
    };
    
    // Simple boundary check to keep slots on screen
    if (newSlot.y > 40 && newSlot.y < 460 && newSlot.x > 40 && newSlot.x < 920) {
        slots.push(newSlot);
    }
  }
  return slots;
};

const TowerDefenseGame = ({ stats, updateStatsInFirestore, showMessageBox, onResetGame, getFullCosmeticDetails, generatePath, processAchievement, addIngredientToInventory }) => {
  const [gameSpeed, setGameSpeed] = useState(1);
  // This local state is for transient, in-wave data like enemies, projectiles, and the towers active for the wave
  const [localWaveState, setLocalWaveState] = useState({
    projectiles: [],
    waveInProgress: false,
    enemies: [],
    towers: [], // This holds the snapshot of towers for the current wave
    soldiers: [],
    summonedUnits: [], // For barricades, banners, etc.
    visualEffects: [], // For explosions, auras, etc.
  });
  // This local state is for managing the UI and pre-wave setup
  const [localUIState, setLocalUIState] = useState({
    selectedTile: null,
    selectedTower: null,
    shopOpen: false,
    isMovingCommander: false,
    targetingAbility: null,
  });

  // Get persistent state from props
  const {
    td_wave = 0,
    td_castleHealth = 5,
    td_towers = [],
    td_path = [],
    td_gameOver = false,
    td_gameWon = false,
    td_wins = 0,
    td_unlockedTowers = [],
    td_towerUpgrades = {},
  } = stats || {}; // FIX: Destructure from stats OR an empty object if stats is null/undefined.

  // NEW: This state holds the tower setup between waves, locally,
  // initialized directly from props to ensure saved data is loaded.
  const [localTowers, setLocalTowers] = useState(stats?.td_towers || []);

  // Memoize stringified versions of props to prevent unnecessary re-syncs
  // that would wipe out local state changes (like placing a tower) before they are saved.
  const stringifiedTowers = useMemo(() => JSON.stringify(stats?.td_towers), [stats?.td_towers]);
  const stringifiedTowerUpgrades = useMemo(() => JSON.stringify(stats?.td_towerUpgrades), [stats?.td_towerUpgrades]);
  const commanderRef = useRef(stats?.td_commander);

  useEffect(() => {
    commanderRef.current = stats?.td_commander;
  }, [stats?.td_commander]);

  const commanderAbilities = useMemo(() => {
    const playerClass = stats?.dungeon_state?.playerClass;
    return commanderDefinitions[playerClass] || commanderDefinitions.default;
  }, [stats?.dungeon_state?.playerClass]);


  // Sync local towers ONLY when the actual saved data from Firestore changes.
  useEffect(() => {
    setLocalTowers(stats?.td_towers || []);
  }, [stringifiedTowers]);

  // NEW: This state holds tower upgrades locally, initialized from props.
  const [localTowerUpgrades, setLocalTowerUpgrades] = useState(stats?.td_towerUpgrades || {});

  // Sync local upgrades ONLY when the actual saved data from Firestore changes.
  useEffect(() => {
    setLocalTowerUpgrades(stats?.td_towerUpgrades || {});
  }, [stringifiedTowerUpgrades]);

  // FIX: This hook automatically resets the game if the path is missing,
  // preventing crashes for users with corrupted game states.
  useEffect(() => {
    if ((!td_path || td_path.length === 0) && td_wave > 0 && !td_gameOver && !td_gameWon) {
        showMessageBox("Tower Defense state error detected. Resetting game.", "error", 4000);
        onResetGame();
    }
  }, [td_path, td_wave, td_gameOver, td_gameWon, onResetGame, showMessageBox]);

  const addVisualEffect = useCallback((effect) => {
    setLocalWaveState(prev => ({
      ...prev,
      visualEffects: [...prev.visualEffects, { ...effect, id: Date.now() + Math.random() }]
    }));
  }, []);

  // Local state for tracking health BETWEEN saves, initialized from props
  const [sessionHealth, setSessionHealth] = useState(stats?.td_castleHealth);

  // Refs for accessing the latest values inside the game loop's interval
  const pathRef = useRef(td_path);
  const waveRef = useRef(td_wave);
  const winsRef = useRef(td_wins);
  const sessionHealthRef = useRef(sessionHealth);

  // Sync session health with the ref so the loop can access it
  useEffect(() => {
    sessionHealthRef.current = sessionHealth;
  }, [sessionHealth]);

  // When a game is reset (wave goes to 0), sync our session health
  useEffect(() => {
    if (td_wave === 0) {
      setSessionHealth(td_castleHealth);
    }
  }, [td_wave, td_castleHealth]);

  const handlePurchaseShopItem = (item) => {
    if (stats.totalXP < item.cost || td_wins < item.winsRequired) return;
    
    updateStatsInFirestore({ 
      totalXP: stats.totalXP - item.cost,
      td_unlockedTowers: [...td_unlockedTowers, item.unlocks]
    });
    showMessageBox(`Unlocked ${item.name}!`, "info");
  };

  const handleUpgradeTower = (towerId, upgrade) => {
    if (stats.totalXP < upgrade.cost) {
      showMessageBox("Not enough XP for this upgrade!", "error");
      return;
    }

    // Update local towers state instantly
    setLocalTowers(prevTowers => prevTowers.map(t => {
      if (t.id !== towerId) return t;
      return { ...t, ...upgrade.effect };
    }));

    // Update local upgrades state instantly
    setLocalTowerUpgrades(prevUpgrades => ({
      ...prevUpgrades,
      [towerId]: [...(prevUpgrades[towerId] || []), upgrade.id]
    }));

    // The only immediate write is the transactional XP cost
    updateStatsInFirestore({ totalXP: stats.totalXP - upgrade.cost });
    showMessageBox(`Upgraded tower with ${upgrade.name}!`, "info");
  };

  // FIX: Rebalanced attack speeds for better gameplay and corrected the Dragon's speed.
  const towerTypes = {
    free: [
      { id: 'archer', name: 'Archer', cost: 100, damage: 3, range: 5, attackSpeed: 1, projectileType: 'arrow', canHitFlying: true },
      { id: 'cannon', name: 'Cannon', cost: 200, damage: 5, range: 4, attackSpeed: 0.5, projectileType: 'cannonball', canHitFlying: false },
      { id: 'icemage', name: 'Ice Mage', cost: 500, damage: 2, range: 5, attackSpeed: 1, slow: 0.5, projectileType: 'iceShard', canHitFlying: true },
      { id: 'barracks', name: 'Barracks', cost: 800, damage: 0, range: 0, attackSpeed: 0, spawnRate: 5, projectileType: null },
      { id: 'ballista', name: 'Ballista', cost: 1000, damage: 10, range: 6, attackSpeed: 0.3, projectileType: 'bolt' },
    ],
    unlockable: [
      { id: 'fire', name: 'Fire Tower', cost: 800, damage: 7, range: 6, attackSpeed: 1.2, dot: 1, projectileType: 'fireball' },
      { id: 'tesla', name: 'Tesla', cost: 900, damage: 7, range: 6, attackSpeed: 1.5, chain: 3, projectileType: 'lightning' },
      { id: 'poison', name: 'Poison Tower', cost: 1000, damage: 2, range: 5, attackSpeed: 1.2, poison: 10, projectileType: 'poisonCloud' },
      { id: 'sniper', name: 'Sniper', cost: 1500, damage: 20, range: 8, attackSpeed: 0.2, projectileType: 'bullet' },
      { id: 'dragon', name: 'Dragon', cost: 2000, damage: 0.5, range: 6, attackSpeed: 50, aoe: 2, projectileType: 'fireball' },
    ],
    dungeon_unlockable: [
        { id: 'dungeoncannon', name: 'Dungeon Cannon', cost: 1500, damage: 25, range: 5, attackSpeed: 0.4, floorRequired: 10, aoe: 1.0, projectileType: 'cannonball' },
        { id: 'crystalspire', name: 'Crystal Spire', cost: 2200, damage: 40, range: 7, attackSpeed: 0.2, floorRequired: 20, projectileType: 'crystalShard' },
    ],
  };

const towerUpgrades = {
  archer: [
    { id: 'archer_damage_1', name: 'Sharper Arrows', cost: 150, effect: { damage: 4 }, level: 1 },
    { id: 'archer_speed_1', name: 'Quick Draw', cost: 200, effect: { attackSpeed: 1.2 }, level: 1 },
    // Specializations - require at least one level 1 upgrade
    { id: 'archer_spec_sharpshooter', name: 'Spec: Sharpshooter', cost: 400, effect: { damage: 15 }, level: 2, description: "Massive damage bonus. Excels at eliminating high-value targets." },
    { id: 'archer_spec_marksman', name: 'Spec: Marksman', cost: 400, effect: { ricochet: { targets: 2, damageFalloff: 0.5, range: 3 } }, level: 2, description: "Arrows bounce to 2 nearby enemies for 50% damage." },
  ],
  cannon: [
    { id: 'cannon_damage_1', name: 'Bigger Cannonballs', cost: 250, effect: { damage: 8 }, level: 1 },
    { id: 'cannon_aoe_1', name: 'Explosive Shells', cost: 300, effect: { aoe: 1.5 }, level: 1 },
    // Specializations
    { id: 'cannon_spec_siege', name: 'Spec: Siege Engine', cost: 500, effect: { damage: 25, attackSpeed: 0.25 }, level: 2, description: "Huge damage, larger AoE, but very slow fire rate." },
    { id: 'cannon_spec_mortar', name: 'Spec: Mortar', cost: 500, effect: { canIgnoreObstacles: true, status: { type: 'stun', duration: 1000, chance: 0.5 } }, level: 2, description: "Can fire over obstacles. Shots have a 50% chance to stun enemies for 1s." },
  ],
  icemage: [
    { id: 'icemage_slow', name: 'Deeper Freeze', cost: 400, effect: { slow: 0.65 } },
    { id: 'icemage_damage', name: 'Ice Shards', cost: 250, effect: { damage: 6 } },
    { id: 'icemage_aoe', name: 'Frost Nova', cost: 500, effect: { aoe: 0.5 } },
  ],
  barracks: [
    { id: 'barracks_spawnRate', name: 'Reinforcements', cost: 350, effect: { spawnRate: -2 } },
    { id: 'barracks_soldierDamage', name: 'Forged Blades', cost: 300, effect: { soldierDamage: 2 } },
    { id: 'barracks_soldierHealth', name: 'Iron Mail', cost: 300, effect: { soldierHealth: 10 } },
  ],
  ballista: [
    { id: 'ballista_damage', name: 'Heavy Bolts', cost: 400, effect: { damage: 22 } },
    { id: 'ballista_range', name: 'Eagle-Eye Scope', cost: 350, effect: { range: 8 } },
    { id: 'ballista_pierce', name: 'Penetrating Shots', cost: 600, effect: { pierce: 2 } },
  ],
  fire: [
    { id: 'fire_dot', name: 'Wildfire', cost: 450, effect: { dot: 3 } },
    { id: 'fire_damage', name: 'Combustion', cost: 350, effect: { damage: 12 } },
    { id: 'fire_aoe', name: 'Fireball', cost: 550, effect: { aoe: 1.5 } },
  ],
  tesla: [
    { id: 'tesla_chain', name: 'Superconductor', cost: 600, effect: { chain: 5 } },
    { id: 'tesla_speed', name: 'Overcharge', cost: 500, effect: { attackSpeed: 3 } },
    { id: 'tesla_damage', name: 'High Voltage', cost: 450, effect: { damage: 11 } },
  ],
  poison: [
    { id: 'poison_damage', name: 'Virulent Toxin', cost: 500, effect: { poison: 25 } },
    { id: 'poison_slow', name: 'Debilitating Poison', cost: 400, effect: { slow: 0.3 } },
    { id: 'poison_aoe', name: 'Noxious Fumes', cost: 600, effect: { aoe: 1 } },
  ],
  sniper: [
    { id: 'sniper_damage', name: '.50 Caliber', cost: 800, effect: { damage: 45 } },
    { id: 'sniper_range', name: 'Advanced Scope', cost: 600, effect: { range: 12 } },
    { id: 'sniper_cripple', name: 'Crippling Shot', cost: 900, effect: { crippleChance: 0.2, crippleDuration: 1 } },
  ],
  dragon: [
        { id: 'dragon_damage', name: 'Blue Flame', cost: 1200, effect: { damage: 1.0 } },
    { id: 'dragon_aoe', name: 'Inferno Breath', cost: 1500, effect: { aoe: 3 } },
    { id: 'dragon_fear', name: 'Terrifying Roar', cost: 2000, effect: { fearChance: 0.1 } },
  ],
  dungeoncannon: [
    { id: 'dungeoncannon_gold', name: 'Gilded Shot', cost: 600, effect: { goldBonus: 0.15 } },
    { id: 'dungeoncannon_stun', name: 'Cave-In', cost: 750, effect: { stunChance: 0.2, stunDuration: 1.5 } },
    { id: 'dungeoncannon_damage', name: 'Dungeon Keeper\'s Wrath', cost: 850, effect: { damage: 35 } },
  ],
  crystalspire: [
    { id: 'crystalspire_chain', name: 'Prismatic Shard', cost: 700, effect: { chain: 3, chainDamageFalloff: 0.3 } },
    { id: 'crystalspire_aura', name: 'Energize', cost: 800, effect: { auraAttackSpeed: 1.2, auraRange: 5 } },
    { id: 'crystalspire_range', name: 'Crystalline Lens', cost: 650, effect: { range: 10 } },
  ],
};

  const shopItems = [
    { id: 'unlock_fire', name: 'Unlock Fire Tower', cost: 500, winsRequired: 5, unlocks: 'fire' },
    { id: 'unlock_tesla', name: 'Unlock Tesla', cost: 800, winsRequired: 8, unlocks: 'tesla' },
    { id: 'unlock_poison', name: 'Unlock Poison Tower', cost: 650, winsRequired: 6, unlocks: 'poison' },
    { id: 'unlock_sniper', name: 'Unlock Sniper', cost: 1000, winsRequired: 10, unlocks: 'sniper' },
    { id: 'unlock_dragon', name: 'Unlock Dragon', cost: 2000, winsRequired: 15, unlocks: 'dragon' },
  ];

  const enemyTypes = {
    normal: [
      { id: 'goblin', name: 'Goblin', health: 10, speed: 0.1, priority: 1 },
      { id: 'shieldbearer', name: 'Shieldbearer', health: 20, speed: 0.08, armor: 2, priority: 5 },
      { id: 'runner', name: 'Runner', health: 5, speed: 0.5, priority: 2 },
      { id: 'healer', name: 'Acolyte', health: 25, speed: 0.09, armor: 1, isHealer: true, healAmount: 5, healRadius: 3, healCooldown: 3000, lastHeal: 0, priority: 10 },
      { id: 'disruptor', name: 'Disruptor', health: 30, speed: 0.1, armor: 3, isDisruptor: true, disruptRadius: 3, disruptAmount: 0.5, priority: 8 },
      { id: 'summoner', name: 'Summoner', health: 40, speed: 0.07, armor: 2, isSummoner: true, summonCooldown: 5000, lastSummon: 0, priority: 9 },
      { id: 'flyer', name: 'Flyer', health: 12, speed: 0.4, flying: true, priority: 3 },
    ],
    special: [
        { id: 'minion', name: 'Minion', health: 3, speed: 0.6, priority: 1, isSummoned: true },
    ],
    juggernaut: [
      { id: 'ogre', name: 'Ogre', health: 100, speed: 0.08, loot: { id: 'ingredientEyeballs', chance: 0.3 }, priority: 6 },
      { id: 'siege_engine', name: 'Siege Engine', health: 150, speed: 0.01 },
      { id: 'necromancer', name: 'Necromancer', health: 80, speed: 0.2, spawn: 2, loot: { id: 'ingredientDemonicBook', chance: 0.4 } },
      { id: 'dragon', name: 'Dragon', health: 200, speed: 0.08, flying: true, loot: { id: 'dragon_scale', chance: 0.5 } },
    ],
  };

  const petEffects = {
    dragon: { castleHealth: 1 },
    owl: { attackSpeed: 0.1 },
    squirrel: { sellRefund: 0.15 },
  };

  const boardSize = 10;
  const board = Array(boardSize).fill().map(() => Array(boardSize).fill(null));

  const handleTileClick = (x, y) => {
    if (localWaveState.waveInProgress || td_gameOver || td_gameWon) return;
    if (localUIState.isMovingCommander) {
      handleMoveCommander(x, y);
      return;
    }
    if (localUIState.targetingAbility) {
      handleUseCommanderAbility(x, y);
      return;
    }
    if (td_path.some(tile => tile.x === x && tile.y === y)) return;
    const existingTower = localTowers.find(t => t.x === x && t.y === y);
    setLocalUIState(prev => ({ ...prev, selectedTile: { x, y }, selectedTower: existingTower || null, isMovingCommander: false, targetingAbility: null }));
  };

  const handleMoveCommander = (x, y) => {
    const commander = commanderRef.current;
    if (Date.now() - (commander.lastMove || 0) < 2000) {
      showMessageBox("Commander repositioning is on cooldown.", "error");
      return;
    }
    updateStatsInFirestore({ 'td_commander.x': x, 'td_commander.y': y, 'td_commander.lastMove': serverTimestamp() });
    setLocalUIState(prev => ({ ...prev, isMovingCommander: false }));
  };

  const handleUseCommanderAbility = (x, y) => {
    const ability = localUIState.targetingAbility;
    if (!ability) return;

    const commander = commanderRef.current;
    const cooldowns = commander.abilityCooldowns || {};

    if ((cooldowns[ability.id] || 0) > Date.now()) {
      showMessageBox("Ability is still on cooldown.", "error");
      return;
    }
    
    // Apply effect locally first for responsiveness
    addVisualEffect({ type: 'ability_impact', x, y, radius: ability.effect.radius, color: 'rgba(255, 204, 0, 0.7)', duration: 500 });

    setLocalWaveState(prev => {
      let newEnemies = [...prev.enemies];
      if (ability.effect.type === 'aoe_damage') {
        newEnemies.forEach(enemy => {
          if (Math.hypot(enemy.x - x, enemy.y - y) <= ability.effect.radius) {
            enemy.health -= ability.effect.damage;
          }
        });
      }
      return { ...prev, enemies: newEnemies.filter(e => e.health > 0) };
    });
    
    // Update firestore state
    updateStatsInFirestore({
      [`td_commander.abilityCooldowns.${ability.id}`]: Date.now() + ability.cooldown * 1000,
    });
    
    setLocalUIState(prev => ({ ...prev, targetingAbility: null }));
  };

  const handleTowerSelect = (tower) => {
    if (!localUIState.selectedTile || stats.totalXP < tower.cost) return;
    const newTower = { ...tower, id: `${tower.id}_${Date.now()}`, x: localUIState.selectedTile.x, y: localUIState.selectedTile.y, lastAttack: 0, targetPriority: 'first' };
    
    // XP update is immediate and correct.
    updateStatsInFirestore({ totalXP: stats.totalXP - tower.cost });
    
    // This updates the local tower array, NOT Firestore.
    setLocalTowers(prev => [...prev, newTower]);
    setLocalUIState(prev => ({ ...prev, selectedTile: null, selectedTower: null }));
  };

  const sellTower = () => {
    if (!localUIState.selectedTile) return;
    const towerIndex = localTowers.findIndex(t => t.x === localUIState.selectedTile.x && t.y === localUIState.selectedTile.y);
    if (towerIndex === -1) return;
    const tower = localTowers[towerIndex];
    const refund = Math.floor(tower.cost * (petEffects.squirrel?.sellRefund || 0.15));
    
    // XP update is immediate and correct.
    updateStatsInFirestore({ totalXP: stats.totalXP + refund });
    
    // This updates the local tower array, NOT Firestore.
    setLocalTowers(prev => prev.filter((_, i) => i !== towerIndex));
    setLocalUIState(prev => ({ ...prev, selectedTile: null, selectedTower: null }));
  };

const startWave = () => {
    if (localWaveState.waveInProgress || td_gameOver || td_gameWon) return;
    const waveNumber = td_wave + 1;
    const newEnemies = generateWave(waveNumber);
    
    // Save is now debounced and handled by placing/upgrading towers.
    // This just updates the wave number.
    updateStatsInFirestore({ 
        td_wave: waveNumber,
        'cooldowns.startWave': serverTimestamp()
    });
    
    // This now fully resets the transient state for the new wave.
    setLocalWaveState(prev => ({ 
      ...prev, 
      waveInProgress: true, 
      enemies: newEnemies,
      towers: [...localTowers],
      soldiers: [], 
      projectiles: [],
    }));
    
    setLocalUIState(prev => ({ ...prev, selectedTile: null, selectedTower: null }));
  };


  const generateWave = (waveNumber) => {
    const enemies = [];
    const isJuggernautWave = waveNumber % 10 === 0;

    let availableEnemyTypes = [...enemyTypes.normal];
    // Introduce healers starting from wave 4
    if (waveNumber < 4) {
      availableEnemyTypes = availableEnemyTypes.filter(e => !e.isHealer);
    }

    if (isJuggernautWave) {
      const type = enemyTypes.juggernaut[Math.min(Math.floor(waveNumber / 10) - 1, enemyTypes.juggernaut.length - 1)];
      enemies.push({ ...type, id: `${type.id}_${Date.now()}`, maxHealth: type.health * (1 + waveNumber / 20), health: type.health * (1 + waveNumber / 20), x: 0, y: 0, progress: 0 });
    } else {
      const enemyCount = 5 + waveNumber * 2;
      for (let i = 0; i < enemyCount; i++) {
        // Occasionally spawn a healer with a high-HP unit
        if (waveNumber >= 4 && i > 0 && i % 5 === 0 && Math.random() < 0.5) {
            const healerType = enemyTypes.normal.find(e => e.isHealer);
            const shieldBearerType = enemyTypes.normal.find(e => e.id === 'shieldbearer');
            if (healerType && shieldBearerType) {
                 enemies.push({ ...shieldBearerType, id: `${shieldBearerType.id}_${i}_${Date.now()}`, maxHealth: shieldBearerType.health * (1 + waveNumber / 50), health: shieldBearerType.health * (1 + waveNumber / 50), x: 0, y: 0, progress: -i * 0.2 });
                 enemies.push({ ...healerType, id: `${healerType.id}_${i}_${Date.now()}`, maxHealth: healerType.health * (1 + waveNumber / 50), health: healerType.health * (1 + waveNumber / 50), x: 0, y: 0, progress: -i * 0.2 - 0.1 });
                 i++; // a_spec_marksman
                 continue;
            }
        }
        const type = availableEnemyTypes[Math.floor(Math.random() * availableEnemyTypes.length)];
        enemies.push({ ...type, id: `${type.id}_${i}_${Date.now()}`, maxHealth: type.health * (1 + waveNumber / 50), health: type.health * (1 + waveNumber / 50), x: 0, y: 0, progress: -i * 0.2 });
      }
    }
    return enemies;
  };

  // Game Loop for Tower Defense
  useEffect(() => {
    // This effect keeps the refs updated with the latest values from props
    // without causing the game loop interval to reset.
    pathRef.current = td_path;
    waveRef.current = td_wave;
    winsRef.current = td_wins;
  }, [td_path, td_wave, td_wins]);

  useEffect(() => {
    if (!localWaveState.waveInProgress) return;

    // CORE FIX: This accumulator is now scoped to the entire wave's effect instance.
    // It will persist across all interval ticks for the duration of the wave.
    const waveDamageAccumulator = { current: 0 };

    const interval = setInterval(() => {
      setLocalWaveState(prev => {
        if (!prev.waveInProgress) return prev;

        let newEnemies = [...prev.enemies];
        let newSoldiers = [...prev.soldiers];
        let newTowers = [...prev.towers];
        let newProjectiles = prev.projectiles.filter(p => Date.now() < p.expires);
        
        // This variable now only tracks damage for the CURRENT 100ms tick.
        let damageThisTick = 0;

        // --- 1. Enemy Special Abilities (e.g., Healing, Summoning) ---
        newEnemies.forEach(enemy => {
          // Healer Logic
          if (enemy.isHealer && Date.now() - enemy.lastHeal > enemy.healCooldown) {
            let targetToHeal = null;
            let lowestHealthRatio = 1;
            
            newEnemies.forEach(potentialTarget => {
              if (!potentialTarget.isHealer && potentialTarget.health < potentialTarget.maxHealth) {
                if (Math.hypot(enemy.x - potentialTarget.x, enemy.y - potentialTarget.y) <= enemy.healRadius) {
                  const healthRatio = potentialTarget.health / potentialTarget.maxHealth;
                  if (healthRatio < lowestHealthRatio) {
                    lowestHealthRatio = healthRatio;
                    targetToHeal = potentialTarget;
                  }
                }
              }
            });

            if (targetToHeal) {
              targetToHeal.health = Math.min(targetToHeal.maxHealth, targetToHeal.health + enemy.healAmount);
              enemy.lastHeal = Date.now();
              addVisualEffect({ type: 'heal_effect', x: targetToHeal.x, y: targetToHeal.y, color: 'rgba(74, 222, 128, 0.7)', radius: 0.5, duration: 800 });
            }
          }
          // Summoner Logic
          if (enemy.isSummoner && Date.now() - enemy.lastSummon > enemy.summonCooldown) {
              const minionType = enemyTypes.special.find(e => e.id === 'minion');
              for (let i = 0; i < 3; i++) {
                  newEnemies.push({ ...minionType, id: `minion_${enemy.id}_${i}_${Date.now()}`, maxHealth: minionType.health, health: minionType.health, x: enemy.x, y: enemy.y, progress: enemy.progress - (i * 0.05) });
              }
              enemy.lastSummon = Date.now();
              addVisualEffect({ type: 'summon_effect', x: enemy.x, y: enemy.y, color: 'rgba(192, 132, 252, 0.7)', radius: 1, duration: 1000 });
          }
        });

        // --- 2. Update Tower States (e.g., Barracks Spawning, Auras) ---
        newTowers = newTowers.map(tower => {
          // Barracks
          if (tower.id.startsWith('barracks') && Date.now() - (tower.lastSpawn || 0) > (tower.spawnRate * 1000)) {
            newSoldiers.push({
              id: `soldier_${Date.now()}`, x: tower.x, y: tower.y,
              health: tower.soldierHealth || 20, damage: tower.soldierDamage || 1,
              targetId: null, despawnTime: Date.now() + 20000,
            });
            return { ...tower, lastSpawn: Date.now() };
          }
          return tower;
        });

        // --- 2. Update Soldiers (Movement & Attacking) ---
        newSoldiers = newSoldiers.map(soldier => {
          if (!soldier.targetId || !newEnemies.find(e => e.id === soldier.targetId)) {
            let closestEnemy = null; let minDist = Infinity;
            newEnemies.forEach(enemy => {
              if (!enemy.flying) {
                const dist = Math.hypot(soldier.x - enemy.x, soldier.y - enemy.y);
                if (dist < minDist) { minDist = dist; closestEnemy = enemy; }
              }
            });
            soldier.targetId = closestEnemy ? closestEnemy.id : null;
          }
          const target = newEnemies.find(e => e.id === soldier.targetId);
          if (target) {
            const dist = Math.hypot(soldier.x - target.x, soldier.y - target.y);
            if (dist > 0.5) {
              soldier.x += ((target.x - soldier.x) / dist) * 0.05 * gameSpeed;
              soldier.y += ((target.y - soldier.y) / dist) * 0.05 * gameSpeed;
            } else {
              target.health -= soldier.damage * 0.1 * gameSpeed;
            }
          }
          return soldier;
        }).filter(s => s.health > 0 && s.despawnTime > Date.now());

        // --- 3. Update Enemies (Movement, Status Effects) ---
        newEnemies = newEnemies.map(enemy => {
          let currentSpeed = enemy.speed;
          if (enemy.slowedUntil && Date.now() < enemy.slowedUntil) {
            currentSpeed *= (1 - enemy.slowAmount);
          }
          if (enemy.stunnedUntil && Date.now() < enemy.stunnedUntil) {
              currentSpeed = 0; // Stunned enemies don't move
          }
          const newProgress = enemy.progress + currentSpeed * 0.1 * gameSpeed;
          if (newProgress >= 1) { damageThisTick++; return null; }
          const path = pathRef.current;
          const pathIndex = Math.min(Math.floor(newProgress * (path.length - 1)), path.length - 1);
          const pathTile = path[Math.max(0, pathIndex)];
          return { ...enemy, progress: newProgress, x: pathTile.x, y: pathTile.y };
        }).filter(Boolean);

        // --- 4. Tower Targeting & Firing ---
        newTowers = newTowers.map(tower => {
          let effectiveAttackSpeed = tower.attackSpeed;
          // Disruptor Aura check
          newEnemies.forEach(enemy => {
              if (enemy.isDisruptor && Math.hypot(tower.x - enemy.x, tower.y - enemy.y) <= enemy.disruptRadius) {
                  effectiveAttackSpeed *= enemy.disruptAmount;
              }
          });

          if (tower.id.startsWith('barracks') || Date.now() - tower.lastAttack < 1000 / effectiveAttackSpeed) return tower;
          
          let possibleTargets = newEnemies.filter(e => 
              (tower.canHitFlying || !e.flying) && 
              e.progress >= 0 &&
              (tower.canIgnoreObstacles || Math.hypot(e.x - tower.x, e.y - tower.y) <= tower.range)
          );

          let target = null;
          if (possibleTargets.length > 0) {
              switch (tower.targetPriority) {
                  case 'first': target = possibleTargets.sort((a,b) => b.progress - a.progress)[0]; break;
                  case 'last': target = possibleTargets.sort((a,b) => a.progress - b.progress)[0]; break;
                  case 'strongest': target = possibleTargets.sort((a,b) => (b.health + b.armor) - (a.health + a.armor))[0]; break;
                  case 'weakest': target = possibleTargets.sort((a,b) => (a.health + a.armor) - (b.health + b.armor))[0]; break;
                  case 'highest_priority': target = possibleTargets.sort((a,b) => b.priority - a.priority)[0]; break;
                  default: target = possibleTargets[0];
              }
          }
          
          if (target) {
            const projectileTo = tower.canIgnoreObstacles ? { x: target.x, y: target.y } : { x: target.x, y: target.y };
            newProjectiles.push({ id: `p_${Date.now()}_${Math.random()}`, from: { x: tower.x, y: tower.y }, to: projectileTo, type: tower.projectileType, expires: Date.now() + 300, towerData: tower });
            return { ...tower, lastAttack: Date.now() };
          }
          return tower;
        });

        // --- 5. Projectile Collision & Effects ---
        newProjectiles.forEach(proj => {
          if (Date.now() > proj.expires - 100) {
             // Handle mortar stun effect at impact location
            if (proj.towerData.status?.type === 'stun' && Math.random() < proj.towerData.status.chance) {
                newEnemies.forEach(enemy => {
                    if (Math.hypot(enemy.x - proj.to.x, enemy.y - proj.to.y) < 1) {
                        enemy.stunnedUntil = Date.now() + proj.towerData.status.duration;
                    }
                });
            }
            newEnemies.forEach(enemy => {
              if (Math.hypot(enemy.x - proj.to.x, enemy.y - proj.to.y) < 1) {
                // Apply tower shield damage first
                let tower = newTowers.find(t => t.id === proj.towerData.id);
                if (tower && tower.shield && tower.shield > 0) {
                    tower.shield -= 1; // Each hit depletes shield
                }
                let damage = proj.towerData.damage;
                if (proj.towerData.ricochet && proj.isRicochet) {
                    damage *= proj.towerData.ricochet.damageFalloff;
                }
                damage -= (enemy.armor || 0);
                enemy.health -= Math.max(1, damage);
                
                if (proj.towerData.slow) { enemy.slowedUntil = Date.now() + 1000; enemy.slowAmount = proj.towerData.slow; }
                
                // NEW: Ricochet logic
                if (proj.towerData.ricochet && !proj.isRicochet) {
                  const otherEnemies = newEnemies.filter(e => 
                    e.id !== enemy.id && 
                    Math.hypot(e.x - enemy.x, e.y - enemy.y) <= proj.towerData.ricochet.range
                  ).slice(0, proj.towerData.ricochet.targets);

                  otherEnemies.forEach(target => {
                    addVisualEffect({ type: 'ricochet_spark', fromX: enemy.x, fromY: enemy.y, toX: target.x, toY: target.y, color: 'rgba(255, 255, 0, 0.8)', duration: 300 });
                    const ricochetDamage = (proj.towerData.damage * proj.towerData.ricochet.damageFalloff) - (target.armor || 0);
                    target.health -= Math.max(1, ricochetDamage);
                  });
                }
                
                if (proj.towerData.aoe) {
                  newEnemies.forEach(otherEnemy => {

                    if (otherEnemy.id !== enemy.id && Math.hypot(otherEnemy.x - enemy.x, otherEnemy.y - enemy.y) <= proj.towerData.aoe) {
                      otherEnemy.health -= Math.max(1, (proj.towerData.damage / 2) - (otherEnemy.armor || 0));
                    }
                  });
                }
              }
            });
          }
        });

        // --- 6. Cleanup & State Updates ---
        const defeatedEnemies = prev.enemies.filter(e => !newEnemies.some(ne => ne.id === e.id));
        if (defeatedEnemies.length > 0) {
            defeatedEnemies.forEach(enemy => {
                if (enemy.loot && Math.random() < enemy.loot.chance) {
                    addIngredientToInventory(enemy.loot.id);
                }
            });
        }
        const remainingEnemies = newEnemies.filter(e => e.health > 0);
        
        // CORE FIX: Add this tick's damage to the wave's total accumulator
        if (damageThisTick > 0) {
          waveDamageAccumulator.current += damageThisTick;
        }
        
        // CORE FIX: Use the accumulator for the final health calculation
        const newSessionHealth = sessionHealthRef.current - waveDamageAccumulator.current;
        const isGameOver = newSessionHealth <= 0;
        const isGameWon = waveRef.current >= 50 && remainingEnemies.length === 0 && !isGameOver;
        const isWaveOver = !isGameOver && !isGameWon && prev.enemies.length > 0 && remainingEnemies.length === 0;

if (isGameOver || isGameWon || isWaveOver) {
          setSessionHealth(newSessionHealth);
          let update = {};
          // CORE FIX: Use the accumulator to determine if an update is needed
          if (waveDamageAccumulator.current > 0) update.td_castleHealth = newSessionHealth;
          if (isGameOver) {
            update.td_gameOver = true;
            // Also reset commander cooldowns on loss
            update['td_commander.abilityCooldowns'] = {};
          }
          if (isGameWon) { 
            update.td_gameWon = true; 
            update.td_wins = winsRef.current + 1; 
            // Also reset commander cooldowns on win
            update['td_commander.abilityCooldowns'] = {};
          }
          
          // NEW: Loot Drop on Boss Wave & Victory
          if (isWaveOver && waveRef.current > 0 && waveRef.current % 10 === 0) {
             const key = 'alchemy_state.inventory.pristine_crystal';
             update[key] = increment(1);
             showMessageBox('You earned a Pristine Crystal for surviving the boss wave!', 'info');
          }
          if (isGameWon) {
             const key = 'alchemy_state.inventory.dragon_scale';
             update[key] = increment(1);
             showMessageBox('You earned a Dragon Scale for your victory!', 'info');
          }

          if (Object.keys(update).length > 0) {
            updateStatsInFirestore(update).then(() => {
              if (update.td_gameWon) processAchievement('towerDefenseWins');
            });
          }
          return { ...prev, waveInProgress: false, enemies: [], projectiles: [], soldiers: [] };
        }
        
        return { ...prev, enemies: remainingEnemies, soldiers: newSoldiers, projectiles: newProjectiles, towers: newTowers };
      });
    }, 100 / gameSpeed);

    return () => clearInterval(interval);
  }, [localWaveState.waveInProgress, gameSpeed, updateStatsInFirestore, showMessageBox, processAchievement]);


  const petEffectsApplied = stats.currentPet ? (petEffects[stats.currentPet.id.split('_')[0]] || {}) : {};
  
  const getTowerEmoji = (id) => {
    const towerBaseId = id.split('_')[0];
    const skinId = stats.equippedItems?.tdSkins?.[towerBaseId];
    if (skinId) {
        const skin = getFullCosmeticDetails(skinId, 'td_skins');
        if (skin) return skin.display;
    }
    // Fallback to default
    return { archer: '🏹', cannon: '💣', icemage: '❄️', barracks: '🛡️', ballista: '🎯', fire: '🔥', tesla: '⚡', poison: '☠️', sniper: '🎯', dragon: '🐉', dungeoncannon: '🌋', crystalspire: '💎' }[towerBaseId] || '❓';
  };
  const enemyDisplayMap = (enemyId) => {
    const enemyBaseId = enemyId.split('_')[0];
    const skinId = stats.equippedItems?.tdSkins?.[enemyBaseId];
    if (skinId) {
        const skin = getFullCosmeticDetails(skinId, 'td_skins');
        if (skin) return skin.display;
    }
    // Fallback
    return { goblin: '👹', shieldbearer: '🛡️', runner: '🏃', healer: '💉', flyer: '🦇', ogre: '👹', siege_engine: '🏗️', necromancer: '🧙', dragon: '🐉' }[enemyBaseId] || '❓';
  };

    const renderBoard = () => {
    // FIX: Determine the single source of truth for towers based on game phase.
    const currentTowers = localWaveState.waveInProgress ? localWaveState.towers : localTowers;

    return board.map((row, y) => (
      <div key={y} className="flex">
        {row.map((_, x) => {
          // Use the unified 'currentTowers' list for all rendering logic.
          const tower = currentTowers.find(t => t.x === x && t.y === y);
          const isAttacking = tower && Date.now() - tower.lastAttack < 300;
          const isCommanderMoveTarget = localUIState.isMovingCommander && !td_path.some(p => p.x === x && p.y === y) && !tower;
          const isAbilityTarget = localUIState.targetingAbility && (!localUIState.targetingAbility.effect.target || localUIState.targetingAbility.effect.target !== 'unit');


          return (
            <div
              key={x}
              onClick={() => handleTileClick(x, y)}
              className={`w-10 h-10 border border-slate-600 flex items-center justify-center relative ${td_path.some(p => p.x === x && p.y === y) ? 'bg-slate-700' : 'bg-slate-800'} ${localUIState.selectedTile?.x === x && localUIState.selectedTile?.y === y ? 'ring-2 ring-indigo-500' : ''} ${isCommanderMoveTarget ? 'bg-green-500/30 cursor-pointer' : ''} ${isAbilityTarget ? 'bg-yellow-500/30 cursor-pointer' : ''}`}
            >
              {tower && <div className={`text-lg transition-transform duration-200 ${isAttacking ? 'tower-attack' : ''}`}>{getTowerEmoji(tower.id)}</div>}
            </div>
          );
        })}
      </div>
    ));
  };
  
  const renderSoldiers = () => (
    (localWaveState.soldiers || []).map(soldier => {
      const TILE_SIZE = 40;
      const top = soldier.y * TILE_SIZE + TILE_SIZE / 2;
      const left = soldier.x * TILE_SIZE + TILE_SIZE / 2;
      // Calculate remaining lifetime for fade-out effect. 20000ms is the lifespan.
      const lifetimeRemainingRatio = Math.max(0, (soldier.despawnTime - Date.now()) / 20000);

      return (
        <div 
          key={soldier.id} 
          className="absolute z-10 transition-opacity duration-500" 
          style={{ 
            top, left, transform: 'translate(-50%, -50%)', 
            // Start fading out in the last 25% of life
            opacity: lifetimeRemainingRatio < 0.25 ? 0.5 : 1 
          }}
        >
          <div className="text-lg">⚔️</div>
          <div className="absolute -bottom-2 left-0 right-0 h-1 w-6 mx-auto bg-slate-600"><div className="h-full bg-green-500" style={{ width: `${(soldier.health / 20) * 100}%`}} /></div>
        </div>
      );
    })
  );

  const renderEnemies = () => (
    (localWaveState.enemies || []).map(enemy => {
        if(enemy.progress < 0) return null;
        const TILE_SIZE = 40;
        const top = enemy.y * TILE_SIZE + TILE_SIZE / 2;
        const left = enemy.x * TILE_SIZE + TILE_SIZE / 2;
        
        const enemyBaseName = enemy.id.split('_')[0];
        const baseHealthDef = enemyTypes.normal.find(e => e.id === enemyBaseName) || enemyTypes.juggernaut.find(e => e.id === enemyBaseName);
        
        const baseHealth = baseHealthDef ? baseHealthDef.health : 10;

        return (
          <div key={enemy.id} className={`absolute z-10 ${enemy.justHit ? 'enemy-hit-animation' : ''}`} style={{ top: `${top}px`, left: `${left}px`, transform: 'translate(-50%, -50%)' }}>
              <div className="text-lg">{enemyDisplayMap(enemy.id)}</div>
              <div className="absolute -bottom-2 left-0 right-0 h-1 w-6 mx-auto bg-slate-600"><div className="h-full bg-red-500" style={{ width: `${(enemy.health / baseHealth) * 100}%`}} /></div>
          </div>
        );
    })
  );

  const renderTowerSelection = () => {
    if (!localUIState.selectedTile) return null;
    const towerAtTile = localTowers.find(t => t.x === localUIState.selectedTile.x && t.y === localUIState.selectedTile.y);
    if (towerAtTile) {
      return (
        <div className="text-white">
          <h3 className="text-xl font-bold mb-2">{towerAtTile.name}</h3>
          {towerAtTile.shield && towerAtTile.shield > 0 && <p>Shield: <span className="text-cyan-300">{towerAtTile.shield.toFixed(0)}</span></p>}
          <p>Damage: {towerAtTile.damage}</p>
          <p>Range: {towerAtTile.range}</p>
          <p>Attack Speed: {towerAtTile.attackSpeed}/s</p>
           <div className="mt-4">
            <label htmlFor="targetPriority" className="block text-sm font-bold text-slate-400 mb-1">Target Priority</label>
            <select
              id="targetPriority"
              value={towerAtTile.targetPriority || 'first'}
              onChange={(e) => setLocalTowers(prev => prev.map(t => t.id === towerAtTile.id ? {...t, targetPriority: e.target.value} : t))}
              className="w-full p-2 bg-slate-800 rounded-md border border-slate-600 focus:ring-2 focus:ring-green-500 font-mono"
            >
              <option value="first">First</option>
              <option value="last">Last</option>
              <option value="strongest">Strongest</option>
              <option value="weakest">Weakest</option>
              <option value="highest_priority">Highest Priority</option>
            </select>
          </div>
          <div className="mt-4">
            <h4 className="font-bold mb-2">Upgrades</h4>
            {(() => {
              const towerIdBase = towerAtTile.id.split('_')[0];
              const upgradesForTower = towerUpgrades[towerIdBase] || [];
              const purchasedUpgrades = localTowerUpgrades[towerAtTile.id] || [];
              
              const hasLevel1Upgrade = purchasedUpgrades.some(id => upgradesForTower.find(u => u.id === id)?.level === 1);
              const hasSpecialization = purchasedUpgrades.some(id => upgradesForTower.find(u => u.id === id)?.level === 2);

              return (
                <div className="space-y-3">
                  {/* Level 1 Upgrades */}
                  {upgradesForTower.filter(u => u.level === 1).map(upgrade => {
                    const isPurchased = purchasedUpgrades.includes(upgrade.id);
                    return (
                      <div key={upgrade.id} className="p-2 bg-slate-700/50 rounded">
                        <p className="font-medium">{upgrade.name}</p>
                        <button onClick={() => handleUpgradeTower(towerAtTile.id, upgrade)} disabled={isPurchased || stats.totalXP < upgrade.cost} className={`mt-1 px-2 py-1 text-sm rounded w-full ${isPurchased ? 'bg-green-800' : stats.totalXP >= upgrade.cost ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-600 text-slate-400'}`}>
                          {isPurchased ? 'Purchased' : `Buy (${upgrade.cost} XP)`}
                        </button>
                      </div>
                    );
                  })}
                  {/* Specializations */}
                  {hasLevel1Upgrade && (
                    <div className="pt-2 border-t border-slate-600">
                      <h5 className="font-semibold text-indigo-300 mb-2">Specialization</h5>
                      {upgradesForTower.filter(u => u.level === 2).map(upgrade => {
                        const isPurchased = purchasedUpgrades.includes(upgrade.id);
                        return(
                          <div key={upgrade.id} className="p-2 bg-slate-700/50 rounded mb-2">
                            <p className="font-medium">{upgrade.name}</p>
                            <p className="text-xs text-slate-400 mb-1">{upgrade.description}</p>
                            <button onClick={() => handleUpgradeTower(towerAtTile.id, upgrade)} disabled={isPurchased || hasSpecialization || stats.totalXP < upgrade.cost} className={`mt-1 px-2 py-1 text-sm rounded w-full ${isPurchased ? 'bg-green-800' : hasSpecialization ? 'bg-slate-600' : stats.totalXP >= upgrade.cost ? 'bg-purple-600 hover:bg-purple-700' : 'bg-slate-600 text-slate-400'}`}>
                              {isPurchased ? 'Chosen' : hasSpecialization ? 'Path Chosen' : `Specialize (${upgrade.cost} XP)`}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
          <button onClick={sellTower} className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 w-full">
            Sell for {Math.floor(towerAtTile.cost * (petEffectsApplied.sellRefund || 0.15))} XP
          </button>
        </div>
      );
    }
    const availableTowers = [
        ...towerTypes.free,
        ...td_unlockedTowers.map(id => towerTypes.unlockable.find(t => t.id === id)).filter(Boolean),
        ...towerTypes.dungeon_unlockable.filter(t => (stats.dungeon_floor || 0) >= t.floorRequired)
    ];
    return (
      <div className="text-white">
        <h3 className="text-xl font-bold mb-2">Select Tower</h3>
        <div className="grid grid-cols-2 gap-2">
          {availableTowers.map(tower => (
            <button key={tower.id} onClick={() => handleTowerSelect(tower)} disabled={stats.totalXP < tower.cost} className={`p-2 rounded-md flex flex-col items-center ${stats.totalXP < tower.cost ? 'bg-slate-700 text-slate-500' : 'bg-slate-700 hover:bg-slate-600'}`}>
              <span className="text-2xl">{getTowerEmoji(tower.id)}</span>
              <span>{tower.name}</span>
              <span className="text-sm text-yellow-400">{tower.cost} XP</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
       <div className="flex justify-between items-center mb-6">
        <div><h2 className="text-3xl font-bold text-white">Tower Defense</h2><p className="text-slate-400">Use your XP to build towers and defend your castle!</p></div>
        <div className="flex space-x-4">
          <button onClick={() => setLocalUIState(prev => ({ ...prev, shopOpen: !prev.shopOpen }))} className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition-colors">{localUIState.shopOpen ? 'Close Shop' : 'Open Shop'}</button>
          {(td_gameOver || td_gameWon) && <button onClick={onResetGame} className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700">{td_gameWon ? 'Play Again' : 'Try Again'}</button>}
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-grow">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-800/50 p-3 rounded-lg text-center"><span className="text-slate-400">Wave:</span> <span className="font-bold text-white">{td_wave}/50</span></div>
            <div className="bg-slate-800/50 p-3 rounded-lg text-center"><span className="text-slate-400">Health:</span> <span className="font-bold text-red-400">{sessionHealth}/5</span></div>            <div className="bg-slate-800/50 p-3 rounded-lg text-center"><span className="text-slate-400">XP:</span> <span className="font-bold text-yellow-400">{stats.totalXP}</span></div>
            <div className="bg-slate-800/50 p-3 rounded-lg text-center"><span className="text-slate-400">Wins:</span> <span className="font-bold text-green-400">{td_wins}</span></div>
          </div>
          <div className="p-2 bg-slate-900/50 border border-slate-700 rounded-lg inline-block relative">
            {renderBoard()}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {/* Commander is rendered here */}
              {stats.td_commander && (
                  <div className="absolute text-3xl z-20" style={{ top: stats.td_commander.y * 40 + 4, left: stats.td_commander.x * 40 + 4, transition: 'top 0.3s, left 0.3s' }}>
                      💂
                  </div>
              )}
              {localWaveState.visualEffects.map(effect => {
                if (effect.type === 'ricochet_spark') {
                  return <svg key={effect.id} className="absolute inset-0 pointer-events-none" style={{ animation: `fade-out-fast ${effect.duration}ms ease-out forwards` }}><line x1={effect.fromX * 40 + 20} y1={effect.fromY * 40 + 20} x2={effect.toX * 40 + 20} y2={effect.toY * 40 + 20} stroke={effect.color} strokeWidth="2" /></svg>;
                }
                return <div key={effect.id} className="absolute rounded-full" style={{ top: effect.y * 40 + 20, left: effect.x * 40 + 20, width: effect.radius * 80, height: effect.radius * 80, background: effect.color, transform: 'translate(-50%, -50%)', animation: `particle-burst ${effect.duration}ms ease-out forwards` }} />
              })}
              {renderEnemies()}
              {renderSoldiers()}
              {localWaveState.projectiles.map(p => <Projectile key={p.id} from={p.from} to={p.to} type={p.type} />)}
            </div>
          </div>
          {/* Commander UI */}
          <div className="mt-4 bg-slate-800/50 p-4 rounded-lg flex items-center gap-4">
              <button onClick={() => setLocalUIState(prev => ({...prev, isMovingCommander: !prev.isMovingCommander, targetingAbility: null}))} className={`p-3 rounded-lg font-semibold ${localUIState.isMovingCommander ? 'bg-green-600' : 'bg-slate-700 hover:bg-slate-600'}`}>Move Commander</button>
              <div className="flex-grow flex justify-around items-center gap-2">
                {commanderAbilities.abilities.map(ability => {
                  const cooldown = stats.td_commander?.abilityCooldowns?.[ability.id] || 0;
                  const isReady = Date.now() > cooldown;
                  const secondsLeft = isReady ? 0 : Math.ceil((cooldown - Date.now())/1000);
                  return (
                    <button 
                      key={ability.id}
                      onClick={() => { if(isReady) setLocalUIState(prev => ({...prev, isMovingCommander: false, targetingAbility: ability}))}}
                      disabled={!isReady}
                      className={`relative w-20 h-20 rounded-lg flex flex-col items-center justify-center p-2 text-center transition-colors ${localUIState.targetingAbility?.id === ability.id ? 'bg-yellow-600' : isReady ? 'bg-indigo-600 hover:bg-indigo-500' : 'bg-slate-600 text-slate-400'}`}
                      title={ability.description}
                    >
                      <span className="text-3xl">{ability.icon}</span>
                      <span className="text-xs font-bold leading-tight">{ability.name}</span>
                      {!isReady && <div className="absolute inset-0 bg-black/70 flex items-center justify-center text-2xl font-bold">{secondsLeft}</div>}
                    </button>
                  );
                })}
              </div>
          </div>
          <div className="mt-4 flex gap-4">
            <button onClick={startWave} disabled={localWaveState.waveInProgress || td_gameOver || td_gameWon} className={`flex-grow px-4 py-3 rounded-lg text-lg font-bold transition-colors ${localWaveState.waveInProgress || td_gameOver || td_gameWon ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>{localWaveState.waveInProgress ? 'Wave In Progress' : td_wave === 0 ? 'Start Wave 1' : `Start Wave ${td_wave + 1}`}</button>
            <button onClick={() => setGameSpeed(speed => (speed === 1 ? 2 : 1))} className="w-24 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600">
              SPEED x{gameSpeed}
            </button>
          </div>
        </div>
        <div className="w-full lg:w-80 flex-shrink-0"><div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl sticky top-6"><h3 className="text-xl font-bold text-white mb-4 text-center">{localUIState.selectedTile && !localTowers.some(t => t.x === localUIState.selectedTile.x && t.y === localUIState.selectedTile.y) ? "Build Tower" : localUIState.selectedTile ? "Tower Control" : "Select a Tile"}</h3>{renderTowerSelection()}</div></div>
      </div>
      {td_gameOver && <div className="mt-4 p-4 bg-red-500/30 text-red-300 border border-red-500 rounded-lg"><p className="font-bold text-lg">Game Over!</p><p>Your castle was destroyed on wave {td_wave}.</p></div>}
      {td_gameWon && <div className="mt-4 p-4 bg-green-500/30 text-green-300 border border-green-500 rounded-lg"><p className="font-bold text-lg">Victory!</p><p>You successfully defended your castle against all 50 waves!</p></div>}
      {localUIState.shopOpen && (<div className="mt-6"><h3 className="text-2xl font-bold text-white mb-4">Shop</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{shopItems.map(item => (<div key={item.id} className="p-4 bg-slate-800/80 rounded-lg shadow-lg border border-slate-700"><h4 className="font-bold text-white">{item.name}</h4><p className="text-slate-400 text-sm">Cost: {item.cost} XP | Wins Required: {item.winsRequired}</p><button onClick={() => handlePurchaseShopItem(item)} disabled={td_unlockedTowers.includes(item.unlocks) || stats.totalXP < item.cost || td_wins < item.winsRequired} className={`mt-2 w-full px-3 py-1.5 rounded text-sm font-semibold transition-colors ${td_unlockedTowers.includes(item.unlocks) ? 'bg-green-500/20 text-green-400' : (stats.totalXP < item.cost || td_wins < item.winsRequired) ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>{td_unlockedTowers.includes(item.unlocks) ? 'Purchased' : 'Buy'}</button></div>))}</div></div>)}
    </div>
  );
};


export default TowerDefenseGame;
