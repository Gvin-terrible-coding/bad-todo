// ============================================================================
// FLASHCARD ROGUE - GAME DATA
// Complete database for Pokémon, moves, type effectiveness, and game constants
// ============================================================================

// ============================================================================
// 1. TYPE EFFECTIVENESS CHART
// Multiplier system: 2x = super effective, 0.5x = not very effective, 1x = normal
// ============================================================================
export const TYPE_EFFECTIVENESS = {
  normal: { strong: [], weak: ['rock', 'ghost'], resists: [] },
  fire: { strong: ['grass', 'ice', 'bug', 'steel'], weak: ['water', 'ground', 'rock'], resists: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'] },
  water: { strong: ['fire', 'ground', 'rock'], weak: ['electric', 'grass'], resists: ['fire', 'water', 'ice', 'steel'] },
  electric: { strong: ['water', 'flying'], weak: ['ground'], resists: ['electric', 'flying', 'steel'] },
  grass: { strong: ['water', 'ground', 'rock'], weak: ['fire', 'ice', 'poison', 'flying', 'bug'], resists: ['ground', 'water', 'grass', 'electric'] },
  ice: { strong: ['grass', 'flying', 'ground', 'dragon'], weak: ['fire', 'fighting', 'rock', 'steel'], resists: ['ice'] },
  fighting: { strong: ['normal', 'ice', 'rock', 'dark', 'steel'], weak: ['flying', 'psychic', 'fairy'], resists: ['rock', 'bug', 'dark'] },
  poison: { strong: ['grass', 'fairy'], weak: ['ground', 'psychic'], resists: ['fighting', 'poison', 'bug', 'grass'] },
  ground: { strong: ['fire', 'electric', 'poison', 'rock', 'steel'], weak: ['water', 'grass', 'ice'], resists: ['poison', 'rock'] },
  flying: { strong: ['fighting', 'bug', 'grass'], weak: ['electric', 'ice', 'rock'], resists: ['fighting', 'bug', 'grass'] },
  psychic: { strong: ['fighting', 'poison'], weak: ['bug', 'ghost', 'dark'], resists: ['fighting', 'psychic'] },
  bug: { strong: ['grass', 'psychic', 'dark'], weak: ['fire', 'flying', 'rock'], resists: ['fighting', 'ground', 'grass'] },
  rock: { strong: ['fire', 'ice', 'flying', 'bug'], weak: ['water', 'grass', 'fighting', 'ground', 'steel'], resists: ['normal', 'flying', 'poison', 'fire'] },
  ghost: { strong: ['psychic', 'ghost'], weak: ['ghost', 'dark'], resists: ['poison', 'bug'] },
  dragon: { strong: ['dragon'], weak: ['ice', 'dragon', 'fairy'], resists: ['fire', 'water', 'grass', 'electric'] },
  dark: { strong: ['psychic', 'ghost'], weak: ['fighting', 'bug', 'fairy'], resists: ['ghost', 'dark'] },
  steel: { strong: ['ice', 'rock', 'fairy'], weak: ['fire', 'water', 'ground'], resists: ['normal', 'flying', 'rock', 'bug', 'steel', 'grass', 'psychic', 'ice', 'dragon', 'fairy'] },
  fairy: { strong: ['fighting', 'bug', 'dark'], weak: ['poison', 'steel'], resists: ['fighting', 'bug', 'dark'] },
};

// ============================================================================
// 2. MOVES DATABASE
// ============================================================================
export const MOVES = {
  // Normal Type
  tackle: { id: 'tackle', name: 'Tackle', type: 'normal', power: 40, accuracy: 100, pp: 35, priority: 0, category: 'physical' },
  scratch: { id: 'scratch', name: 'Scratch', type: 'normal', power: 40, accuracy: 100, pp: 35, priority: 0, category: 'physical' },
  ember: { id: 'ember', name: 'Ember', type: 'fire', power: 40, accuracy: 100, pp: 25, priority: 0, category: 'special' },
  watergun: { id: 'watergun', name: 'Water Gun', type: 'water', power: 40, accuracy: 100, pp: 25, priority: 0, category: 'special' },
  thunderbolt: { id: 'thunderbolt', name: 'Thunderbolt', type: 'electric', power: 90, accuracy: 100, pp: 15, priority: 0, category: 'special' },
  razorleaf: { id: 'razorleaf', name: 'Razor Leaf', type: 'grass', power: 55, accuracy: 95, pp: 25, priority: 0, category: 'physical' },
  icywind: { id: 'icywind', name: 'Icy Wind', type: 'ice', power: 55, accuracy: 95, pp: 15, priority: 0, category: 'special' },
  dragonpulse: { id: 'dragonpulse', name: 'Dragon Pulse', type: 'dragon', power: 85, accuracy: 100, pp: 10, priority: 0, category: 'special' },
  psychic: { id: 'psychic', name: 'Psychic', type: 'psychic', power: 90, accuracy: 100, pp: 10, priority: 0, category: 'special' },
  shadowball: { id: 'shadowball', name: 'Shadow Ball', type: 'ghost', power: 80, accuracy: 100, pp: 15, priority: 0, category: 'special' },
  earthquake: { id: 'earthquake', name: 'Earthquake', type: 'ground', power: 100, accuracy: 100, pp: 10, priority: 0, category: 'physical' },
  closecombat: { id: 'closecombat', name: 'Close Combat', type: 'fighting', power: 120, accuracy: 100, pp: 5, priority: 0, category: 'physical' },
  stoneedge: { id: 'stoneedge', name: 'Stone Edge', type: 'rock', power: 100, accuracy: 80, pp: 5, priority: 0, category: 'physical' },
  flashcannon: { id: 'flashcannon', name: 'Flash Cannon', type: 'steel', power: 80, accuracy: 100, pp: 10, priority: 0, category: 'special' },
  playrough: { id: 'playrough', name: 'Play Rough', type: 'fairy', power: 90, accuracy: 90, pp: 10, priority: 0, category: 'physical' },
  bugbuzz: { id: 'bugbuzz', name: 'Bug Buzz', type: 'bug', power: 90, accuracy: 100, pp: 10, priority: 0, category: 'special' },
  darkpulse: { id: 'darkpulse', name: 'Dark Pulse', type: 'dark', power: 80, accuracy: 100, pp: 15, priority: 0, category: 'special' },
  hyperbeam: { id: 'hyperbeam', name: 'Hyper Beam', type: 'normal', power: 150, accuracy: 90, pp: 5, priority: 0, category: 'special' },
  recover: { id: 'recover', name: 'Recover', type: 'normal', power: 0, accuracy: 0, pp: 10, priority: 0, category: 'status', effect: 'heal', healAmount: 0.5 },
  protect: { id: 'protect', name: 'Protect', type: 'normal', power: 0, accuracy: 0, pp: 10, priority: 4, category: 'status', effect: 'protect' },
  
  // Status Moves - Modify opponent stats
  growl: { id: 'growl', name: 'Growl', type: 'normal', power: 0, accuracy: 100, pp: 40, priority: 0, category: 'status', effect: 'stat_change', statTarget: 'atk', multiplier: 0.75 },
  screech: { id: 'screech', name: 'Screech', type: 'normal', power: 0, accuracy: 85, pp: 40, priority: 0, category: 'status', effect: 'stat_change', statTarget: 'def', multiplier: 0.5 },
  amnesia: { id: 'amnesia', name: 'Amnesia', type: 'psychic', power: 0, accuracy: 0, pp: 20, priority: 0, category: 'status', effect: 'stat_change', statTarget: 'spd', multiplier: 0.5 },
  tailwind: { id: 'tailwind', name: 'Tailwind', type: 'flying', power: 0, accuracy: 0, pp: 30, priority: 0, category: 'status', effect: 'stat_change', statTarget: 'spe', multiplier: 1.5, isBuff: true },
  swordsdance: { id: 'swordsdance', name: 'Sword\'s Dance', type: 'normal', power: 0, accuracy: 0, pp: 30, priority: 0, category: 'status', effect: 'stat_change', statTarget: 'atk', multiplier: 1.5, isBuff: true },
  dragondance: { id: 'dragondance', name: 'Dragon Dance', type: 'dragon', power: 0, accuracy: 0, pp: 20, priority: 0, category: 'status', effect: 'stat_change', statTarget: 'atk', multiplier: 1.25, isBuff: true, isDouble: true },
};

// ============================================================================
// 2b. HELD ITEMS & ARTIFACTS DATABASE
// Pokémon can hold one item to gain passive bonuses
// ============================================================================
export const ITEMS = {
  // Type-Boosting Items (20% boost to moves of that type)
  charcoal: {
    id: 'charcoal',
    name: 'Charcoal',
    description: 'Boosts the power of Fire-type moves by 20%.',
    type: 'item',
    category: 'type_boost',
    boostedType: 'fire',
    powerMultiplier: 1.2,
    rarity: 'common',
    emoji: '🔥',
  },
  mysticwater: {
    id: 'mysticwater',
    name: 'Mystic Water',
    description: 'Boosts the power of Water-type moves by 20%.',
    type: 'item',
    category: 'type_boost',
    boostedType: 'water',
    powerMultiplier: 1.2,
    rarity: 'common',
    emoji: '💧',
  },
  magnet: {
    id: 'magnet',
    name: 'Magnet',
    description: 'Boosts the power of Electric-type moves by 20%.',
    type: 'item',
    category: 'type_boost',
    boostedType: 'electric',
    powerMultiplier: 1.2,
    rarity: 'common',
    emoji: '⚡',
  },
  
  // Recovery Items (Heal over time)
  leftovers: {
    id: 'leftovers',
    name: 'Leftovers',
    description: 'Holder heals 6.25% of max HP at the end of every turn.',
    type: 'item',
    category: 'recovery',
    healPercentage: 0.0625,
    rarity: 'rare',
    emoji: '🍽️',
  },
  assaultvest: {
    id: 'assaultvest',
    name: 'Assault Vest',
    description: 'Increases Sp. Def by 25% but prevents the use of status moves.',
    type: 'item',
    category: 'defensive',
    statBoost: { spd: 1.25 },
    rarity: 'uncommon',
    emoji: '🛡️',
  },
  choicescarf: {
    id: 'choicescarf',
    name: 'Choice Scarf',
    description: 'Increases Speed by 30% but locks the user into one move.',
    type: 'item',
    category: 'speed_boost',
    statBoost: { spe: 1.3 },
    rarity: 'uncommon',
    emoji: '🧣',
  },
  
  // Offensive Items
  lifeorb: {
    id: 'lifeorb',
    name: 'Life Orb',
    description: 'All moves deal 30% more damage, but holder loses 10% max HP per turn.',
    type: 'item',
    category: 'offensive',
    movesPowerMultiplier: 1.3,
    recoilPercentage: -0.1,
    rarity: 'rare',
    emoji: '💀',
  },
  choicespecs: {
    id: 'choicespecs',
    name: 'Choice Specs',
    description: 'Increases Sp. Atk by 50%.',
    type: 'item',
    category: 'special_attack',
    statBoost: { spa: 1.5 },
    rarity: 'uncommon',
    emoji: '👓',
  },
  
  // Stat Boosting Items
  floatstone: {
    id: 'floatstone',
    name: 'Float Stone',
    description: 'Reduces damage taken from Ground-type moves by 50%.',
    type: 'item',
    category: 'defensive',
    resistType: 'ground',
    resistMultiplier: 0.5,
    rarity: 'uncommon',
    emoji: '🪨',
  },
  
  // Utility Items
  focusband: {
    id: 'focusband',
    name: 'Focus Band',
    description: 'Has a 20% chance to survive a hit that would KO the holder with 1 HP.',
    type: 'item',
    category: 'survival',
    survivalChance: 0.2,
    rarity: 'rare',
    emoji: '💪',
  },
  airballoon: {
    id: 'airballoon',
    name: 'Air Balloon',
    description: 'Holder is immune to Ground-type moves.',
    type: 'item',
    category: 'immunity',
    immuneType: 'ground',
    rarity: 'uncommon',
    emoji: '🎈',
  },
};

// ============================================================================
// 3. POKÉMON SPECIES DATABASE
// ============================================================================
export const POKEMON_SPECIES = {
  // Gen 1 - Kanto Starters & Common
  bulbasaur: {
    id: 'bulbasaur',
    name: 'Bulbasaur',
    type: ['grass', 'poison'],
    baseStats: { hp: 45, atk: 49, def: 49, spa: 65, spd: 65, spe: 45 },
    learnable: ['tackle', 'watergun', 'razorleaf', 'recover'],
    baseExp: 64,
    evolvesAt: 16,
    evolvesTo: 'ivysaur',
  },
  ivysaur: {
    id: 'ivysaur',
    name: 'Ivysaur',
    type: ['grass', 'poison'],
    baseStats: { hp: 60, atk: 62, def: 63, spa: 80, spd: 80, spe: 60 },
    learnable: ['tackle', 'watergun', 'razorleaf', 'recover', 'dragonpulse'],
    baseExp: 141,
    evolvesAt: 32,
    evolvesTo: 'venusaur',
  },
  venusaur: {
    id: 'venusaur',
    name: 'Venusaur',
    type: ['grass', 'poison'],
    baseStats: { hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80 },
    learnable: ['tackle', 'watergun', 'razorleaf', 'recover', 'dragonpulse', 'earthquake'],
    baseExp: 263,
  },
  charmander: {
    id: 'charmander',
    name: 'Charmander',
    type: ['fire'],
    baseStats: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 },
    learnable: ['tackle', 'ember', 'watergun', 'shadowball'],
    baseExp: 62,
    evolvesAt: 16,
    evolvesTo: 'charmeleon',
  },
  charmeleon: {
    id: 'charmeleon',
    name: 'Charmeleon',
    type: ['fire'],
    baseStats: { hp: 58, atk: 64, def: 58, spa: 80, spd: 65, spe: 80 },
    learnable: ['tackle', 'ember', 'watergun', 'shadowball', 'dragonpulse'],
    baseExp: 142,
    evolvesAt: 36,
    evolvesTo: 'charizard',
  },
  charizard: {
    id: 'charizard',
    name: 'Charizard',
    type: ['fire', 'flying'],
    baseStats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
    learnable: ['tackle', 'ember', 'watergun', 'shadowball', 'dragonpulse', 'earthquake', 'stoneedge'],
    baseExp: 267,
  },
  squirtle: {
    id: 'squirtle',
    name: 'Squirtle',
    type: ['water'],
    baseStats: { hp: 44, atk: 48, def: 65, spa: 50, spd: 64, spe: 43 },
    learnable: ['tackle', 'watergun', 'icywind', 'protect'],
    baseExp: 63,
    evolvesAt: 16,
    evolvesTo: 'wartortle',
  },
  wartortle: {
    id: 'wartortle',
    name: 'Wartortle',
    type: ['water'],
    baseStats: { hp: 59, atk: 63, def: 80, spa: 65, spd: 80, spe: 58 },
    learnable: ['tackle', 'watergun', 'icywind', 'protect', 'earthquake'],
    baseExp: 143,
    evolvesAt: 36,
    evolvesTo: 'blastoise',
  },
  blastoise: {
    id: 'blastoise',
    name: 'Blastoise',
    type: ['water'],
    baseStats: { hp: 79, atk: 83, def: 100, spa: 85, spd: 105, spe: 78 },
    learnable: ['tackle', 'watergun', 'icywind', 'protect', 'earthquake', 'stoneedge'],
    baseExp: 265,
  },
  pikachu: {
    id: 'pikachu',
    name: 'Pikachu',
    type: ['electric'],
    baseStats: { hp: 35, atk: 55, def: 40, spa: 50, spd: 50, spe: 90 },
    learnable: ['thunderbolt', 'tackle', 'shadowball', 'protect'],
    baseExp: 112,
  },
  dragonite: {
    id: 'dragonite',
    name: 'Dragonite',
    type: ['dragon', 'flying'],
    baseStats: { hp: 91, atk: 134, def: 95, spa: 100, spd: 100, spe: 80 },
    learnable: ['dragonpulse', 'earthquake', 'hyperbeam', 'stoneedge'],
    baseExp: 270,
  },
  articuno: {
    id: 'articuno',
    name: 'Articuno',
    type: ['ice', 'flying'],
    baseStats: { hp: 90, atk: 85, def: 100, spa: 95, spd: 125, spe: 85 },
    learnable: ['icywind', 'stoneedge', 'protect', 'recover'],
    baseExp: 290,
  },
  zapdos: {
    id: 'zapdos',
    name: 'Zapdos',
    type: ['electric', 'flying'],
    baseStats: { hp: 90, atk: 90, def: 85, spa: 125, spd: 90, spe: 100 },
    learnable: ['thunderbolt', 'stoneedge', 'flashcannon', 'protect'],
    baseExp: 290,
  },
  moltres: {
    id: 'moltres',
    name: 'Moltres',
    type: ['fire', 'flying'],
    baseStats: { hp: 90, atk: 100, def: 90, spa: 125, spd: 85, spe: 90 },
    learnable: ['ember', 'stoneedge', 'hyperbeam', 'recover'],
    baseExp: 290,
  },
  mewtwo: {
    id: 'mewtwo',
    name: 'Mewtwo',
    type: ['psychic'],
    baseStats: { hp: 106, atk: 110, def: 90, spa: 154, spd: 90, spe: 130 },
    learnable: ['psychic', 'hyperbeam', 'recover', 'shadowball'],
    baseExp: 340,
  },
  mew: {
    id: 'mew',
    name: 'Mew',
    type: ['psychic'],
    baseStats: { hp: 100, atk: 100, def: 100, spa: 100, spd: 100, spe: 100 },
    learnable: ['psychic', 'hyperbeam', 'recover', 'protect'],
    baseExp: 300,
  },

  // Gen 2 - Johto Starters
  chikorita: {
    id: 'chikorita',
    name: 'Chikorita',
    type: ['grass'],
    baseStats: { hp: 45, atk: 49, def: 65, spa: 49, spd: 65, spe: 45 },
    learnable: ['tackle', 'razorleaf', 'watergun', 'recover'],
    baseExp: 64,
  },
  cyndaquil: {
    id: 'cyndaquil',
    name: 'Cyndaquil',
    type: ['fire'],
    baseStats: { hp: 39, atk: 52, def: 43, spa: 60, spd: 50, spe: 65 },
    learnable: ['tackle', 'ember', 'shadowball', 'protect'],
    baseExp: 62,
  },
  totodile: {
    id: 'totodile',
    name: 'Totodile',
    type: ['water'],
    baseStats: { hp: 50, atk: 65, def: 64, spa: 54, spd: 54, spe: 43 },
    learnable: ['watergun', 'icywind', 'tackle', 'protect'],
    baseExp: 65,
  },

  // Gen 3 - Hoenn Starters
  treecko: {
    id: 'treecko',
    name: 'Treecko',
    type: ['grass'],
    baseStats: { hp: 40, atk: 45, def: 35, spa: 65, spd: 55, spe: 70 },
    learnable: ['tackle', 'razorleaf', 'dragonpulse', 'protect'],
    baseExp: 61,
  },
  torchic: {
    id: 'torchic',
    name: 'Torchic',
    type: ['fire'],
    baseStats: { hp: 45, atk: 60, def: 40, spa: 70, spd: 55, spe: 60 },
    learnable: ['tackle', 'ember', 'closecombat', 'protect'],
    baseExp: 62,
  },
  mudkip: {
    id: 'mudkip',
    name: 'Mudkip',
    type: ['water', 'ground'],
    baseStats: { hp: 50, atk: 70, def: 50, spa: 50, spd: 50, spe: 40 },
    learnable: ['watergun', 'earthquake', 'icywind', 'recover'],
    baseExp: 63,
  },

  // Gen 4 - Sinnoh Starters
  piplup: {
    id: 'piplup',
    name: 'Piplup',
    type: ['water'],
    baseStats: { hp: 53, atk: 51, def: 53, spa: 61, spd: 56, spe: 40 },
    learnable: ['watergun', 'icywind', 'flashcannon', 'protect'],
    baseExp: 64,
  },
  chimchar: {
    id: 'chimchar',
    name: 'Chimchar',
    type: ['fire'],
    baseStats: { hp: 44, atk: 58, def: 44, spa: 58, spd: 44, spe: 66 },
    learnable: ['tackle', 'ember', 'closecombat', 'shadowball'],
    baseExp: 62,
  },
  turtwig: {
    id: 'turtwig',
    name: 'Turtwig',
    type: ['grass'],
    baseStats: { hp: 55, atk: 68, def: 64, spa: 45, spd: 55, spe: 31 },
    learnable: ['tackle', 'razorleaf', 'stoneedge', 'recover'],
    baseExp: 63,
  },

  // Gen 5 - Unova Starters
  oshawott: {
    id: 'oshawott',
    name: 'Oshawott',
    type: ['water'],
    baseStats: { hp: 55, atk: 55, def: 45, spa: 63, spd: 60, spe: 45 },
    learnable: ['watergun', 'icywind', 'flashcannon', 'recover'],
    baseExp: 64,
  },
  tepig: {
    id: 'tepig',
    name: 'Tepig',
    type: ['fire'],
    baseStats: { hp: 65, atk: 63, def: 45, spa: 45, spd: 45, spe: 45 },
    learnable: ['tackle', 'ember', 'closecombat', 'flashcannon'],
    baseExp: 61,
  },
  snivy: {
    id: 'snivy',
    name: 'Snivy',
    type: ['grass'],
    baseStats: { hp: 45, atk: 45, def: 55, spa: 63, spd: 60, spe: 63 },
    learnable: ['tackle', 'razorleaf', 'dragonpulse', 'protect'],
    baseExp: 62,
  },

  // Additional common Pokémon for variety
  charizard: {
    id: 'charizard',
    name: 'Charizard',
    type: ['fire', 'flying'],
    baseStats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
    learnable: ['ember', 'dragonpulse', 'hyperbeam', 'stoneedge'],
    baseExp: 240,
  },
  blastoise: {
    id: 'blastoise',
    name: 'Blastoise',
    type: ['water'],
    baseStats: { hp: 79, atk: 83, def: 100, spa: 83, spd: 100, spe: 78 },
    learnable: ['watergun', 'icywind', 'flashcannon', 'recover'],
    baseExp: 239,
  },
  venusaur: {
    id: 'venusaur',
    name: 'Venusaur',
    type: ['grass', 'poison'],
    baseStats: { hp: 80, atk: 82, def: 83, spa: 100, spd: 100, spe: 80 },
    learnable: ['razorleaf', 'watergun', 'dragonpulse', 'recover'],
    baseExp: 236,
  },
  machamp: {
    id: 'machamp',
    name: 'Machamp',
    type: ['fighting'],
    baseStats: { hp: 90, atk: 130, def: 80, spa: 65, spd: 85, spe: 55 },
    learnable: ['closecombat', 'stoneedge', 'earthquake', 'protect'],
    baseExp: 255,
  },
  gengar: {
    id: 'gengar',
    name: 'Gengar',
    type: ['ghost', 'poison'],
    baseStats: { hp: 65, atk: 65, def: 60, spa: 130, spd: 75, spe: 110 },
    learnable: ['shadowball', 'psychic', 'darkpulse', 'recover'],
    baseExp: 250,
  },
  alakazam: {
    id: 'alakazam',
    name: 'Alakazam',
    type: ['psychic'],
    baseStats: { hp: 55, atk: 50, def: 65, spa: 135, spd: 95, spe: 120 },
    learnable: ['psychic', 'shadowball', 'hyperbeam', 'protect'],
    baseExp: 250,
  },
  rhydon: {
    id: 'rhydon',
    name: 'Rhydon',
    type: ['ground', 'rock'],
    baseStats: { hp: 105, atk: 130, def: 120, spa: 45, spd: 45, spe: 40 },
    learnable: ['earthquake', 'stoneedge', 'closecombat', 'recover'],
    baseExp: 255,
  },
  lapras: {
    id: 'lapras',
    name: 'Lapras',
    type: ['water', 'ice'],
    baseStats: { hp: 130, atk: 85, def: 80, spa: 85, spd: 95, spe: 60 },
    learnable: ['watergun', 'icywind', 'psychic', 'recover'],
    baseExp: 250,
  },
  gyarados: {
    id: 'gyarados',
    name: 'Gyarados',
    type: ['water', 'flying'],
    baseStats: { hp: 95, atk: 125, def: 79, spa: 60, spd: 100, spe: 81 },
    learnable: ['watergun', 'closecombat', 'earthquake', 'stoneedge'],
    baseExp: 227,
  },
  arcanine: {
    id: 'arcanine',
    name: 'Arcanine',
    type: ['fire'],
    baseStats: { hp: 90, atk: 110, def: 80, spa: 100, spd: 80, spe: 95 },
    learnable: ['ember', 'closecombat', 'stoneedge', 'recover'],
    baseExp: 213,
  },
  tauros: {
    id: 'tauros',
    name: 'Tauros',
    type: ['normal'],
    baseStats: { hp: 75, atk: 100, def: 95, spa: 40, spd: 70, spe: 110 },
    learnable: ['tackle', 'closecombat', 'stoneedge', 'earthquake'],
    baseExp: 211,
  },
  wailord: {
    id: 'wailord',
    name: 'Wailord',
    type: ['water'],
    baseStats: { hp: 170, atk: 60, def: 72, spa: 90, spd: 70, spe: 60 },
    learnable: ['watergun', 'earthquake', 'icywind', 'recover'],
    baseExp: 244,
  },
};

// ============================================================================
// 4. GYM LEADER & BOSS POKÉMON
// These are used for wave-based encounters (every 5-10 waves)
// ============================================================================
export const GYM_LEADERS = [
  {
    name: 'Brock',
    type: 'Rock Specialist',
    pokemon: ['rhydon', 'stoneedge', 'earthquake'],
    level: 15,
  },
  {
    name: 'Misty',
    type: 'Water Specialist',
    pokemon: ['lapras', 'blastoise', 'watergun'],
    level: 15,
  },
  {
    name: 'Lt. Surge',
    type: 'Electric Specialist',
    pokemon: ['zapdos', 'thunderbolt', 'flashcannon'],
    level: 20,
  },
  {
    name: 'Erika',
    type: 'Grass Specialist',
    pokemon: ['venusaur', 'razorleaf', 'watergun'],
    level: 20,
  },
  {
    name: 'Koga',
    type: 'Poison Specialist',
    pokemon: ['gengar', 'shadowball', 'darkpulse'],
    level: 25,
  },
  {
    name: 'Sabrina',
    type: 'Psychic Specialist',
    pokemon: ['alakazam', 'psychic', 'shadowball'],
    level: 25,
  },
  {
    name: 'Blaine',
    type: 'Fire Specialist',
    pokemon: ['charizard', 'ember', 'hyperbeam'],
    level: 30,
  },
  {
    name: 'Giovanni',
    type: 'Ground Specialist',
    pokemon: ['rhydon', 'earthquake', 'stoneedge'],
    level: 35,
  },
];

// ============================================================================
// 5. GAME CONSTANTS & CONFIGURATION
// ============================================================================
export const GAME_CONFIG = {
  CANVAS_WIDTH: 960,
  CANVAS_HEIGHT: 540,
  POKEMON_SCALE: 2.5,
  PLAYER_POKEMON_X: 200,
  PLAYER_POKEMON_Y: 300,
  ENEMY_POKEMON_X: 700,
  ENEMY_POKEMON_Y: 200,
  BASE_XP_REWARD: 100,
  XP_PER_LEVEL: 100,
  WAVES_PER_GYM_LEADER: 5,
  CORRECT_ANSWER_BONUS_DAMAGE: 1.2, // 20% damage boost for correct answer
  INCORRECT_ANSWER_PENALTY: 0.5, // Move fails entirely
  STARTING_TEAM_SIZE: 3,
  MAX_TEAM_SIZE: 6,
};

// ============================================================================
// 6. UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate damage based on Pokémon Damage Formula
 * Simplified version: (((2 * level / 5 + 2) * power * attack / defense) / 50) + 2) * modifier
 */
export function calculateDamage(attacker, defender, move, typeEffectiveness = 1, isCorrectAnswer = false) {
  const level = attacker.level;
  
  // Apply stat multipliers for physical/special moves
  let attackStat = move.category === 'physical' ? attacker.stats.atk : attacker.stats.spa;
  let defenseStat = move.category === 'physical' ? defender.stats.def : defender.stats.spd;
  
  // Apply stat multipliers if they exist (from status moves like Growl, Sword's Dance)
  if (attacker.statMultipliers) {
    const atkMultiplier = move.category === 'physical' ? attacker.statMultipliers.atk : attacker.statMultipliers.spa;
    attackStat *= atkMultiplier;
  }
  if (defender.statMultipliers) {
    const defMultiplier = move.category === 'physical' ? defender.statMultipliers.def : defender.statMultipliers.spd;
    defenseStat *= defMultiplier;
  }
  
  const power = move.power || 0;

  if (power === 0) return 0; // Status moves deal no damage

  // Base damage formula (simplified Pokémon formula)
  let damage = ((((2 * level) / 5 + 2) * power * attackStat) / defenseStat) / 50 + 2;

  // Apply type effectiveness multiplier
  damage *= typeEffectiveness;

  // Apply held item bonus (type-boosting items, Life Orb, etc.)
  const itemBonus = getItemDamageMultiplier(attacker, move);
  damage *= itemBonus;

  // Apply correct answer bonus
  if (isCorrectAnswer) {
    damage *= GAME_CONFIG.CORRECT_ANSWER_BONUS_DAMAGE;
  }

  // Add some variance (85-100%)
  const variance = 0.85 + Math.random() * 0.15;
  damage *= variance;

  return Math.max(1, Math.floor(damage));
}

/**
 * Get type effectiveness multiplier
 */
export function getTypeEffectiveness(attackType, defendingTypes) {
  let multiplier = 1;

  defendingTypes.forEach((defType) => {
    const typeData = TYPE_EFFECTIVENESS[attackType];
    if (typeData) {
      if (typeData.strong.includes(defType)) {
        multiplier *= 2;
      } else if (typeData.weak.includes(defType)) {
        multiplier *= 0.5;
      }
    }
  });

  return multiplier;
}

/**
 * Generate random Pokémon for enemy waves
 */
export function generateRandomPokemon(minLevel = 1, maxLevel = 50) {
  const speciesIds = Object.keys(POKEMON_SPECIES);
  const randomId = speciesIds[Math.floor(Math.random() * speciesIds.length)];
  const species = POKEMON_SPECIES[randomId];

  const level = Math.floor(minLevel + Math.random() * (maxLevel - minLevel));
  const maxHp = calculateHP(species.baseStats.hp, level);
  const stats = calculateStats(species.baseStats, level);

  return {
    id: `${randomId}-${Date.now()}`,
    species: randomId,
    name: species.name,
    level,
    type: species.type,
    moves: species.learnable.slice(0, 4),
    baseStats: species.baseStats,
    stats: stats,
    maxHp: maxHp,
    currentHp: maxHp,
    exp: 0,
  };
}

/**
 * Calculate individual stats at a given level
 */
export function calculateStats(baseStats, level) {
  return {
    hp: calculateHP(baseStats.hp, level),
    atk: Math.floor((2 * baseStats.atk + 100) * level / 100 + 5),
    def: Math.floor((2 * baseStats.def + 100) * level / 100 + 5),
    spa: Math.floor((2 * baseStats.spa + 100) * level / 100 + 5),
    spd: Math.floor((2 * baseStats.spd + 100) * level / 100 + 5),
    spe: Math.floor((2 * baseStats.spe + 100) * level / 100 + 5),
  };
}

/**
 * Calculate HP stat (special formula)
 */
export function calculateHP(baseHP, level) {
  return Math.floor((2 * baseHP + 100) * level / 100 + level + 10);
}

/**
 * Initialize a Pokémon with full stats
 */
export function initializePokemon(speciesId, level) {
  const species = POKEMON_SPECIES[speciesId];
  if (!species) return null;

  const stats = calculateStats(species.baseStats, level);
  const maxHp = stats.hp;

  return {
    id: `${speciesId}-${Date.now()}`,
    species: speciesId,
    name: species.name,
    level,
    type: species.type,
    moves: species.learnable.slice(0, 4),
    baseStats: species.baseStats,
    stats,
    currentHp: maxHp,
    maxHp,
    exp: 0,
    heldItem: null,
    statMultipliers: {
      atk: 1.0,
      def: 1.0,
      spa: 1.0,
      spd: 1.0,
      spe: 1.0,
    },
  };
}

/**
 * Get a random move from a Pokémon
 */
export function getRandomMove(pokemon) {
  const moveId = pokemon.moves[Math.floor(Math.random() * pokemon.moves.length)];
  return MOVES[moveId];
}

/**
 * Calculate XP earned from defeated enemy
 * Formula: (enemyLevel * 20) base XP
 */
export function calculateXpGain(enemyPokemon) {
  return enemyPokemon.level * 20;
}

/**
 * Calculate XP required for next level
 * Formula: 100 * (level - 1)
 * Example: Level 2 needs 100 XP, Level 3 needs 200 XP
 */
export function getXpToNextLevel(currentLevel) {
  return Math.max(100, 100 * currentLevel);
}

/**
 * Check if Pokémon has leveled up and handle stat recalculation
 * Returns object with: { leveled: boolean, newLevel: number, newStats: object }
 */
export function checkLevelUp(pokemon) {
  const xpNeeded = getXpToNextLevel(pokemon.level);

  if (pokemon.exp >= xpNeeded) {
    // Level up!
    const newLevel = pokemon.level + 1;
    const newStats = calculateStats(pokemon.baseStats, newLevel);
    const newMaxHp = newStats.hp;

    return {
      leveled: true,
      oldLevel: pokemon.level,
      newLevel,
      newStats,
      newMaxHp,
      expRequired: getXpToNextLevel(newLevel),
    };
  }

  return { leveled: false };
}

/**
 * Apply status move effects to target Pokémon
 * Handles stat changes (Growl, Sword's Dance, etc.)
 * Returns: { applied: boolean, statChanged: boolean, stat: string, newValue: number, message: string }
 */
export function applyStatusMoveEffect(targetPokemon, move) {
  if (!move || move.category !== 'status' || move.effect !== 'stat_change') {
    return { applied: false };
  }

  if (!targetPokemon.statMultipliers) {
    targetPokemon.statMultipliers = {
      atk: 1.0,
      def: 1.0,
      spa: 1.0,
      spd: 1.0,
      spe: 1.0,
    };
  }

  const stat = move.statTarget;
  const oldValue = targetPokemon.statMultipliers[stat];
  const newValue = Math.max(0.25, Math.min(4.0, oldValue * move.multiplier));
  targetPokemon.statMultipliers[stat] = newValue;

  const isBuff = move.isBuff || move.multiplier > 1;
  const statNames = {
    atk: 'Attack',
    def: 'Defense',
    spa: 'Sp. Atk',
    spd: 'Sp. Def',
    spe: 'Speed',
  };

  let message;
  if (isBuff) {
    message = `${targetPokemon.name}'s ${statNames[stat]} rose!`;
  } else {
    message = `${targetPokemon.name}'s ${statNames[stat]} fell!`;
  }

  return {
    applied: true,
    statChanged: true,
    stat,
    oldValue,
    newValue,
    message,
  };
}

/**
 * Apply level up to a Pokémon
 * Updates level, stats, and recalculates HP
 */
export function applyLevelUp(pokemon, newLevel) {
  pokemon.level = newLevel;
  pokemon.stats = calculateStats(pokemon.baseStats, newLevel);
  pokemon.maxHp = pokemon.stats.hp;
  // Restore full HP on level up
  pokemon.currentHp = pokemon.maxHp;
  pokemon.exp = 0;
}

/**
 * Apply held item bonuses to damage calculation
 * Some items boost move power based on type or other factors
 */
export function getItemDamageMultiplier(pokemon, move) {
  if (!pokemon.heldItem) return 1.0;

  const item = ITEMS[pokemon.heldItem];
  if (!item) return 1.0;

  // Type-boosting items
  if (item.category === 'type_boost' && move.type === item.boostedType) {
    return item.powerMultiplier;
  }

  // Life Orb - boosts all moves
  if (item.category === 'offensive' && item.movesPowerMultiplier) {
    return item.movesPowerMultiplier;
  }

  return 1.0;
}

/**
 * Get stat boosts from held items
 * Some items increase specific stats
 */
export function getItemStatBoosts(pokemon) {
  if (!pokemon.heldItem) return {};

  const item = ITEMS[pokemon.heldItem];
  if (!item || !item.statBoost) return {};

  return item.statBoost;
}

/**
 * Check if held item provides recovery
 * Returns HP to restore at end of turn
 */
export function getItemRecovery(pokemon) {
  if (!pokemon.heldItem) return 0;

  const item = ITEMS[pokemon.heldItem];
  if (!item || item.category !== 'recovery') return 0;

  return Math.ceil(pokemon.maxHp * item.healPercentage);
}

/**
 * Randomly choose items from available pool
 */
export function selectRandomItems(count = 3) {
  const itemIds = Object.keys(ITEMS);
  const selected = [];
  const rarityWeights = {
    common: 10,
    uncommon: 5,
    rare: 2,
  };

  for (let i = 0; i < count; i++) {
    let randomId;
    let attempts = 0;
    do {
      randomId = itemIds[Math.floor(Math.random() * itemIds.length)];
      const item = ITEMS[randomId];
      // Simple rarity weighting
      const weight = rarityWeights[item.rarity] || 1;
      if (Math.random() < weight / 10) break;
      attempts++;
    } while (attempts < 5);

    selected.push(randomId);
  }

  return selected;
}
