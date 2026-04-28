// ============================================================================
// FLASHCARD ROGUE - QUICK START GUIDE FOR DEVELOPERS
// ============================================================================

// DIRECTORY STRUCTURE
// ===================
// src/
// ├── FlashcardRogue.js        ← Main component (this is the "standalone" file)
// ├── game-data.js             ← Game database (Pokémon, moves, types)
// ├── App.js                   ← Where FlashcardRogue is imported & rendered
// └── assets/images/FlashcardRogue/  ← For future sprite assets

// ============================================================================
// HOW TO RUN THE GAME
// ============================================================================

/**
 * 1. Ensure Phaser is installed:
 *    npm install phaser
 * 
 * 2. Add flashcards to StudyZone (format):
 *    Question→Answer
 *    or
 *    Question>>Answer
 *    (separate lines)
 * 
 * 3. Click "Flashcard Rogue" tab in sidebar
 * 
 * 4. Click "Start Adventure!" button
 * 
 * 5. Select moves and answer flashcard questions correctly to deal bonus damage!
 */

// ============================================================================
// KEY FILES & FUNCTIONS
// ============================================================================

/**
 * game-data.js
 * =============
 * TYPE_EFFECTIVENESS      - Type matchup matrix (2x, 0.5x, 1x multipliers)
 * MOVES                   - 20+ move database
 * POKEMON_SPECIES         - 30+ Pokémon with stats and moves
 * GYM_LEADERS             - 8 boss encounters
 * GAME_CONFIG             - Game constants
 * 
 * Functions:
 * - calculateDamage()           - Main damage formula with type/bonus multipliers
 * - getTypeEffectiveness()      - Get damage multiplier for type matchup
 * - generateRandomPokemon()     - Create random enemy Pokémon
 * - calculateStats()            - Convert base stats to actual stats at level
 * - calculateHP()               - HP calculation (special formula)
 * - initializePokemon()         - Create fully-formed Pokémon object
 * - getRandomMove()             - Get random move from Pokémon's moveset
 */

/**
 * FlashcardRogue.js
 * ==================
 * BattleScene (Phaser Scene)
 * - init()                      - Receive initial data
 * - create()                    - Setup scene (arena, HUD, buttons)
 * - handlePlayerMove()          - Execute player turn with quiz
 * - executePlayerMove()         - Apply damage and messages
 * - executeEnemyTurn()          - Computer's turn
 * - endBattle()                 - Handle victory/defeat
 * 
 * FlashcardRogue (React Component)
 * - initializeGame()            - Setup player team and start
 * - startBattle()               - Launch a new wave
 * - requestQuiz()               - Show flashcard question modal
 * - handleQuizAnswer()          - Process quiz response
 * - handleBattleEnd()           - Handle wave result
 * - endGame()                   - Game over screen
 */

// ============================================================================
// COMPONENT PROPS (How to use FlashcardRogue)
// ============================================================================

/**
 * import FlashcardRogue from './FlashcardRogue';
 * 
 * <FlashcardRogue
 *   studyZoneState={{
 *     flashcardsText: "Q1→A1\nQ2→A2\n..."  // Raw flashcard text
 *   }}
 *   showMessageBox={(message, type) => {
 *     // type: 'info', 'success', 'warning', 'error'
 *     // Show toast notification
 *   }}
 *   stats={{
 *     squadInvites: [],
 *     // ...other user stats
 *   }}
 * />
 */

// ============================================================================
// STATE FLOW
// ============================================================================

/**
 * STARTUP:
 * User clicks "Start Adventure!"
 *   ↓
 * initializeGame()
 *   ↓
 * gameState.isRunning = true
 * gameState.currentWave = 1
 * gameState.playerTeam = [3 starter Pokémon]
 *   ↓
 * useEffect triggers startBattle()
 * 
 * BATTLE:
 * Player sees colored boxes (player Pokémon on left, enemy on right)
 * Health bars, move buttons below
 * Player clicks a move
 *   ↓
 * handlePlayerMove(move)
 *   ↓
 * requestQuiz() → setQuizData() → React modal renders
 *   ↓
 * handleQuizAnswer(true/false) → promise resolves
 *   ↓
 * executePlayerMove(move, isCorrect)
 *   ↓
 * executeEnemyTurn()
 *   ↓
 * Check if either Pokémon fainted
 * 
 * VICTORY:
 * endBattle(true)
 *   ↓
 * handleBattleEnd(true, enemy)
 *   ↓
 * score += enemy.level * 10
 * currentWave += 1
 * After 2s: startBattle() (next wave)
 * 
 * DEFEAT:
 * endBattle(false)
 *   ↓
 * handleBattleEnd(false, enemy)
 *   ↓
 * playerTeam = playerTeam.slice(1) (remove fainted)
 * If team empty: endGame()
 * Else: After 2s: startBattle() (with next Pokémon)
 */

// ============================================================================
// DAMAGE CALCULATION EXAMPLE
// ============================================================================

/**
 * // Pikachu (Lv 10, Atk 90) vs Squirtle (Def 65)
 * // Move: Thunderbolt (Pow 90, Special type)
 * 
 * Step 1: Get move data
 * move = MOVES['thunderbolt']  // { name: 'Thunderbolt', type: 'electric', power: 90, ... }
 * 
 * Step 2: Get type effectiveness
 * effectiveness = getTypeEffectiveness('electric', ['water'])
 *   → Electric is strong vs Water → 2x multiplier
 * 
 * Step 3: Calculate damage
 * base = (((2*10/5+2)*90*90)/65)/50)+2 ≈ 156
 * with_effectiveness = 156 * 2 = 312
 * with_correct_bonus = 312 * 1.2 = 374.4
 * with_variance = 374.4 * 0.92 ≈ 344 damage
 * 
 * Result: Squirtle takes 344 damage!
 * Message: "Pikachu used Thunderbolt! It's super effective! (344 damage)"
 */

// ============================================================================
// HOW TO EXTEND / MODIFY
// ============================================================================

/**
 * ADD A NEW POKÉMON:
 * ==================
 * 1. Add to POKEMON_SPECIES in game-data.js:
 *    
 *    charizard: {
 *      id: 'charizard',
 *      name: 'Charizard',
 *      type: ['fire', 'flying'],
 *      baseStats: { hp: 78, atk: 84, def: 78, spa: 109, spd: 85, spe: 100 },
 *      learnable: ['ember', 'dragonpulse', 'hyperbeam', 'stoneedge'],
 *      baseExp: 240,
 *    }
 * 
 * 2. Next time random enemy is generated, Charizard will be available
 * 
 * 3. To use as starter:
 *    const starterIds = ['charmander']; // In initializeGame()
 */

/**
 * ADD A NEW MOVE:
 * ===============
 * 1. Add to MOVES in game-data.js:
 *    
 *    earthquake: {
 *      id: 'earthquake',
 *      name: 'Earthquake',
 *      type: 'ground',
 *      power: 100,
 *      accuracy: 100,
 *      pp: 10,
 *      priority: 0,
 *      category: 'physical'
 *    }
 * 
 * 2. Add to a Pokémon's learnable array
 */

/**
 * ADD A NEW GYM LEADER:
 * ====================
 * 1. Add to GYM_LEADERS in game-data.js:
 *    
 *    {
 *      name: 'Red',
 *      type: 'Legendary Master',
 *      pokemon: ['charizard'],
 *      level: 50,
 *    }
 * 
 * 2. Will appear at waves 5, 10, 15, etc.
 */

/**
 * ADD SPRITE GRAPHICS:
 * ====================
 * 1. Create /src/assets/images/FlashcardRogue/ directory
 * 2. Add Pokémon sprite PNG files
 * 3. In FlashcardRogue.js BattleScene.preload():
 *    
 *    preload() {
 *      this.load.image('bulbasaur', bulbasaurSprite);
 *      this.load.image('charmander', charmanderSprite);
 *      // ... etc
 *    }
 * 
 * 4. In renderPokemon():
 *    
 *    this.add.sprite(
 *      GAME_CONFIG.PLAYER_POKEMON_X,
 *      GAME_CONFIG.PLAYER_POKEMON_Y,
 *      this.playerPokemon.species  // e.g., 'pikachu'
 *    );
 * 
 * 5. For animations:
 *    const sprite = this.add.sprite(...);
 *    sprite.play('pikachu_attack');
 */

/**
 * CHANGE GAME DIFFICULTY:
 * =======================
 * In GAME_CONFIG (game-data.js):
 * 
 * - CORRECT_ANSWER_BONUS_DAMAGE: 1.2 (currently 20% boost)
 *   → Increase to 1.5 for easier (50% bonus)
 *   → Decrease to 1.1 for harder (10% bonus)
 * 
 * - WAVES_PER_GYM_LEADER: 5 (currently boss every 5 waves)
 *   → Change to 10 for less frequent bosses
 *   → Change to 3 for more frequent bosses
 * 
 * - STARTING_TEAM_SIZE: 3 (starting Pokémon)
 *   → Increase to 6 for easier (more team members)
 *   → Decrease to 1 for harder (permadeath sooner)
 */

// ============================================================================
// DEBUGGING TIPS
// ============================================================================

/**
 * Check battle state:
 * Add to BattleScene.update():
 *   console.log('State:', this.stateMachine);
 *   console.log('Player HP:', this.playerPokemon.currentHp);
 *   console.log('Enemy HP:', this.enemyPokemon.currentHp);
 * 
 * Check damage calculation:
 * Add in executePlayerMove():
 *   console.log('Base damage:', damage);
 *   console.log('Effectiveness:', effectiveness);
 *   console.log('Final damage:', finalDamage);
 * 
 * Check flashcards loaded:
 * Add in FlashcardRogue component:
 *   console.log('Parsed flashcards:', parsedFlashcards);
 * 
 * Check state transitions:
 * Add in handleBattleEnd():
 *   console.log('Battle result:', playerWon);
 *   console.log('Current wave:', gameState.currentWave);
 *   console.log('Team size:', gameState.playerTeam.length);
 */

// ============================================================================
// COMMON ISSUES & SOLUTIONS
// ============================================================================

/**
 * ISSUE: Quiz modal never appears
 * CAUSE: onQuizRequested callback not properly passed to BattleScene
 * FIX:   Check that requestQuiz() returns a Promise
 * 
 * ISSUE: Health bars don't update
 * CAUSE: updateHPBars() not called after damage
 * FIX:   Ensure it's called in executePlayerMove() and executeEnemyTurn()
 * 
 * ISSUE: Moves don't appear as buttons
 * CAUSE: Pokemon.moves array is empty or undefined
 * FIX:   Ensure initializePokemon() sets moves from species.learnable
 * 
 * ISSUE: Game gets stuck after battle
 * CAUSE: endBattle() not calling onBattleEnd callback
 * FIX:   Verify onBattleEnd is passed and handleBattleEnd processes correctly
 * 
 * ISSUE: No flashcards showing up
 * CAUSE: studyZoneState.flashcardsText is empty
 * FIX:   Add flashcards to StudyZone first, format: "Q→A\nQ→A"
 */

export {};
