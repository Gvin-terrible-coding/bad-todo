// ============================================================================
// FLASHCARD ROGUE - BATTLE STATE MACHINE DOCUMENTATION
// ============================================================================

/**
 * The BattleScene uses a simple state machine to control the flow of a battle.
 * This ensures turns happen in the correct order and prevents race conditions.
 */

// ============================================================================
// STATE DIAGRAM
// ============================================================================

/**
 *                    ┌─────────────────┐
 *                    │ BATTLE_START    │
 *                    └────────┬────────┘
 *                             │
 *                             ↓
 *                    ┌─────────────────┐
 *              ┌────→│   WAITING       │◄───────┐
 *              │     │ (Player's turn) │        │
 *              │     └────────┬────────┘        │
 *              │              │                  │
 *              │              │ (Click a move)  │
 *              │              ↓                  │
 *              │     ┌─────────────────┐        │
 *              │     │   QUIZ          │        │
 *              │     │(Await flashcard)│        │
 *              │     └────────┬────────┘        │
 *              │              │                  │
 *              │       ┌──────┴──────┐          │
 *              │       │             │          │
 *              │ (Wrong)      (Correct)        │
 *              │       │             │          │
 *              │       ↓             ↓          │
 *              │   [FAIL]      [EXECUTE]       │
 *              │                    │          │
 *              └────────────────┐   │          │
 *                               ↓   ↓          │
 *                        ┌──────────────────┐  │
 *                        │ PLAYER_ACTION    │  │
 *                        │ (Calculate dmg)  │  │
 *                        └──────────────────┘  │
 *                               │              │
 *                               ↓              │
 *                        ┌──────────────────┐  │
 *         ┌─────────────→│ CHECK_FAINT      │  │
 *         │              │(Enemy fainted?)  │  │
 *         │              └──────────────────┘  │
 *         │                     │              │
 *         │              ┌──────┴──────┐       │
 *         │              │             │       │
 *    (Continue)   (Enemy fainted)    │       │
 *         │              │             │       │
 *         │              ↓             ↓       │
 *         │          [VICTORY!]   ┌─────────┐ │
 *         │          onBattleEnd  │ OPPONENT│ │
 *         │                       │ _ACTION │ │
 *         │                       └────┬────┘ │
 *         │                            ↓      │
 *         │                      [OPPONENT   │
 *         │                       ATTACKS]   │
 *         │                            │      │
 *         └────────────────────────────┴──────┘
 *
 *                      or PLAYER_FAINTED
 *                      onBattleEnd(false)
 *                           ↓
 *                      [GAME OVER / NEXT POKEMON]
 */

// ============================================================================
// STATE MACHINE IMPLEMENTATION
// ============================================================================

/**
 * INITIALIZATION (in BattleScene.init):
 * ======================================
 * this.stateMachine = 'waiting'  ← Initial state
 * 
 * States used:
 * - 'waiting'    : Player can click move buttons
 * - 'quiz'       : Waiting for flashcard answer
 * - 'executing'  : Player's move is being executed
 * - 'opp_turn'   : Enemy is attacking
 * - 'battleEnd'  : Battle finished (victory or defeat)
 * - 'ended'      : Final state after battle callback
 */

// ============================================================================
// STATE TRANSITIONS
// ============================================================================

/**
 * STATE: 'waiting'
 * ================
 * DESCRIPTION:
 *   Player can interact with the UI
 *   Move buttons are enabled and clickable
 *   Waiting for player to select a move
 * 
 * TRANSITIONS:
 *   → 'quiz'   (when player clicks a move)
 * 
 * CODE LOCATION:
 *   Initial state in create()
 *   Reset in executePlayerMove() if correct and hit enemy
 *   Reset in handlePlayerMove() if incorrect answer
 * 
 * VISUAL FEEDBACK:
 *   Buttons are bright and interactive
 *   Message: "What will [Pokémon] do?"
 */

/**
 * STATE: 'quiz'
 * =============
 * DESCRIPTION:
 *   Player action triggered a quiz
 *   Waiting for React component to show quiz modal
 *   Waiting for player to answer flashcard question
 * 
 * TRANSITIONS:
 *   → 'waiting'      (if answer is wrong)
 *   → 'executing'    (if answer is correct)
 *   → 'battleEnd'    (if answer correct and move KOs enemy)
 * 
 * CODE LOCATION:
 *   Set in handlePlayerMove()
 *   Waits on await this.onQuizRequested()
 *   Result determines next state
 * 
 * WHAT HAPPENS:
 *   1. Set state to 'quiz'
 *   2. Call onQuizRequested() (promise)
 *   3. React shows modal with flashcard
 *   4. Wait for player to click answer
 *   5. handleQuizAnswer(true/false) resolves promise
 */

/**
 * STATE: 'executing' (implied, not explicitly set)
 * =================================================
 * DESCRIPTION:
 *   Player's move is executing
 *   Damage being calculated and applied
 *   Messages being displayed
 * 
 * TRANSITIONS:
 *   → 'waiting'      (if enemy still alive)
 *   → 'battleEnd'    (if enemy fainted)
 * 
 * CODE LOCATION:
 *   Happens inside executePlayerMove()
 *   Not a formal state, but represents the action phase
 * 
 * WHAT HAPPENS:
 *   1. Calculate damage: base * effectiveness * (correct ? 1.2 : 1)
 *   2. Reduce enemy HP
 *   3. Display message: "Pikachu used Thunderbolt! (85 damage)"
 *   4. Update health bar
 *   5. Check if enemy HP ≤ 0
 *      → If yes: endBattle(true)
 *      → If no: Wait 1.5s then executeEnemyTurn()
 */

/**
 * STATE: 'opp_turn' (implied)
 * ===========================
 * DESCRIPTION:
 *   Enemy is executing their attack
 *   Similar to player's execution phase
 * 
 * TRANSITIONS:
 *   → 'waiting'      (if player still alive)
 *   → 'battleEnd'    (if player fainted)
 * 
 * CODE LOCATION:
 *   Happens inside executeEnemyTurn()
 *   Called after a 1.5s delay following player's move
 * 
 * WHAT HAPPENS:
 *   1. Pick random move from enemy's moveset
 *   2. Calculate damage: base * effectiveness (no quiz, no bonus)
 *   3. Reduce player HP
 *   4. Display message: "Squirtle used Water Gun! (42 damage)"
 *   5. Update health bar
 *   6. Check if player HP ≤ 0
 *      → If yes: endBattle(false)
 *      → If no: Set state to 'waiting' (player's next turn)
 */

/**
 * STATE: 'battleEnd'
 * ==================
 * DESCRIPTION:
 *   Battle is concluded (victory or defeat)
 *   Performing final actions
 *   About to call callback to React component
 * 
 * TRANSITIONS:
 *   → 'ended'  (after 1.5s delay)
 * 
 * CODE LOCATION:
 *   Set in endBattle(playerWon)
 *   1.5s delay before final state
 * 
 * WHAT HAPPENS:
 *   1. Set state to 'battleEnd'
 *   2. Display final message: "Victory!" or "Defeat!"
 *   3. After 1.5s: call onBattleEnd(playerWon)
 *   4. React component receives result
 *   5. Advances to next wave or sends next Pokémon
 */

/**
 * STATE: 'ended'
 * ==============
 * DESCRIPTION:
 *   Battle officially finished
 *   Scene can be cleaned up or restarted
 *   No more player input accepted
 * 
 * TRANSITIONS:
 *   None (terminal state for this battle)
 * 
 * CODE LOCATION:
 *   Set in endBattle() after 1.5s delay
 * 
 * WHAT HAPPENS:
 *   Scene is ready to be replaced by next battle
 *   (React component will start new BattleScene with next wave)
 */

// ============================================================================
// TIMELINE OF A TYPICAL TURN
// ============================================================================

/**
 * TURN SEQUENCE EXAMPLE:
 * ======================
 * 
 * T=0.0s:  State = 'waiting'
 *          Player sees move buttons
 *          Message: "What will Pikachu do?"
 * 
 * T=0.5s:  Player clicks "Thunderbolt"
 *          State = 'quiz'
 *          Buttons are disabled (grayed out)
 *          onQuizRequested() called
 * 
 * T=0.6s:  React component renders quiz modal
 *          Question: "What is 2+2?"
 *          Two buttons: "4" (green) and "5" (red)
 * 
 * T=2.0s:  Player clicks "4" (correct)
 *          handleQuizAnswer(true) called
 *          Modal closes
 *          Promise resolves in BattleScene
 * 
 * T=2.1s:  executePlayerMove(move, true) called
 *          Damage calculated: (base * 2 * 1.2) ≈ 344
 *          Enemy HP: 200 → 200-344 = faints (≤0)
 *          Message: "Pikachu used Thunderbolt! It's super effective! (344 dmg)"
 * 
 * T=2.2s:  updateHPBars() updates enemy health bar to 0
 *          Enemy health bar turns red
 * 
 * T=2.3s:  Enemy HP ≤ 0 check passes
 *          State = 'battleEnd'
 *          Message: "Victory!"
 *          onBattleEnd(true) scheduled for T=3.8s
 * 
 * T=3.8s:  onBattleEnd(true) called
 *          React component receives result
 *          Score += 200 (enemy level * 10)
 *          Wave += 1
 *          After 2s: startBattle() for Wave 2
 * 
 * T=5.8s:  New BattleScene created
 *          New enemy generated at higher level
 *          State = 'waiting'
 *          New turn cycle begins
 */

/**
 * TURN SEQUENCE EXAMPLE (WRONG ANSWER):
 * ======================================
 * 
 * T=0.0s:  State = 'waiting'
 * 
 * T=0.5s:  Player clicks "Thunderbolt"
 *          State = 'quiz'
 * 
 * T=0.6s:  React modal appears
 *          Question: "What is 2+2?"
 * 
 * T=2.0s:  Player clicks "5" (wrong!)
 *          handleQuizAnswer(false) called
 * 
 * T=2.1s:  isCorrect = false
 *          executePlayerMove() NOT called
 *          State = 'waiting' (back to start)
 *          Message: "Pikachu answered incorrectly! Move failed!"
 *          Buttons re-enabled
 *          Turn passes to opponent
 * 
 * T=3.6s:  executeEnemyTurn() called
 *          Enemy attacks (no quiz needed)
 *          Message: "Squirtle used Water Gun! (42 damage)"
 * 
 * T=3.7s:  Player HP: 100 → 58
 *          Health bar updates
 * 
 * T=3.8s:  Check if player fainted
 *          No (HP = 58 > 0)
 *          State = 'waiting'
 *          Message: "What will Pikachu do?"
 *          Back to start of next turn
 */

// ============================================================================
// PREVENTING RACE CONDITIONS
// ============================================================================

/**
 * WHY STATE MACHINE?
 * ==================
 * Without states, multiple things could happen simultaneously:
 * - Player could click multiple buttons
 * - Quiz could appear and battle continue
 * - Both attacks could happen at once
 * 
 * States prevent this by ensuring only valid actions can occur:
 * - In 'waiting' state: Only move clicks work
 * - In 'quiz' state: Buttons disabled, can't select new move
 * - In 'executing' state: No player input (automatic)
 * - In 'opp_turn' state: No player input (automatic)
 * - In 'battleEnd' state: Scene being torn down
 */

/**
 * KEY SAFETY CHECKS:
 * ==================
 * 
 * In handlePlayerMove(move):
 *   if (this.stateMachine !== 'waiting') return;
 *   ↑ Prevents clicking buttons when not in 'waiting' state
 * 
 * In executePlayerMove():
 *   // Only executes damage if state is correct
 *   // Messages and health updates guaranteed to happen sequentially
 * 
 * In executeEnemyTurn():
 *   this.time.delayedCall(1500, () => {
 *     this.executeEnemyTurn();
 *   });
 *   ↑ Waits 1.5s before opponent attacks
 *     Allows player to see their damage before opponent counter
 * 
 * In endBattle():
 *   this.time.delayedCall(1500, () => {
 *     this.onBattleEnd(playerWon);
 *   });
 *   ↑ Waits before calling callback
 *     Scene is still active while final message displays
 */

// ============================================================================
// DEBUGGING THE STATE MACHINE
// ============================================================================

/**
 * ADD CONSOLE LOGGING:
 * ====================
 * At the start of each state transition, add:
 * 
 * handlePlayerMove(move) {
 *   console.log(`[STATE] waiting → quiz (move: ${move.name})`);
 *   this.stateMachine = 'quiz';
 *   // ...
 * }
 * 
 * executePlayerMove(move, isCorrect) {
 *   console.log(`[STATE] quiz → executing (correct: ${isCorrect})`);
 *   // ... damage calculation ...
 *   console.log(`[STATE] executing → ${this.enemyPokemon.currentHp <= 0 ? 'battleEnd' : 'waiting'}`);
 * }
 * 
 * EXPECTED OUTPUT FOR CORRECT ANSWER:
 * [STATE] waiting → quiz (move: Thunderbolt)
 * [STATE] quiz → executing (correct: true)
 * [STATE] executing → waiting (enemy hp: 150)
 * [STATE] waiting → opp_turn (delay)
 * [STATE] opp_turn → waiting (player hp: 85)
 * [STATE] waiting → quiz (move: Thunderbolt)
 * ...
 */

/**
 * CHECK STATE AT CRITICAL MOMENTS:
 * ================================
 * Add guards to prevent impossible transitions:
 * 
 * executePlayerMove(move, isCorrect) {
 *   if (this.stateMachine !== 'quiz') {
 *     console.error('Invalid state for executePlayerMove:', this.stateMachine);
 *     return; // Prevent impossible action
 *   }
 *   // Safe to proceed
 * }
 */

export {};
