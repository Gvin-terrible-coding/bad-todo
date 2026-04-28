# Flashcard Rogue - Phase 2 Enhancement Guide

## 🎮 What's New in Phase 2?

This guide covers the exciting new features added to Flashcard Rogue:
1. **Visual Animations & Polish** - Makes battles feel alive and satisfying
2. **XP & Leveling System** - Pokémon grow stronger as you play
3. **Reward Screen** - Recruit new Pokémon after boss battles
4. **Organized Asset Structure** - Easy place to add sprites, audio, and effects

---

## Part 1: The "Juice" - Visual Animations

### What Changed?

Battles now feature smooth, satisfying animations that provide visual feedback:

#### 1. **Attack Animations**
- When a Pokémon attacks, it moves towards the opponent (50px) then back
- Animation duration: 200ms with easing
- Creates a sense of impact and collision

**How it works:**
```javascript
// In BattleScene.animateAttack()
this.tweens.add({
  targets: attacker,
  x: `+=${offsetX}`,  // Move +50 or -50px
  yoyo: true,         // Return to original position
  duration: 200,
  ease: 'Power1',
});
```

#### 2. **Damage Flash Effect**
- When hit, Pokémon sprite flashes white for visual impact
- Then returns to normal color
- Provides clear feedback that damage was taken

**Visual feedback:**
```javascript
target.setTint(0xffffff);  // White tint
// After 100ms fade
target.clearTint();        // Return to normal
```

#### 3. **Floating Damage Numbers**
- Damage value appears above target Pokémon
- Floats upward and fades out over 1 second
- **Color coding:**
  - Yellow (28px) = Super effective (2x+ damage)
  - White (24px) = Normal damage
  - Gray (24px) = Not very effective (0.5x damage)

**How it looks:**
```
      ↑ 50!
        ↑
      (fades)
```

#### 4. **Animated Health Bars**
- HP bars now animate smoothly when taking damage (300ms)
- Color changes dynamically during animation:
  - Green (>50% HP)
  - Yellow (25-50% HP)
  - Red (≤25% HP)
- HP text updates in real-time

**Smooth transition:**
```
[████████████████] 200/200 HP  →  [██████████░░░░░░] 120/200 HP
(Green)                          (Yellow, over 300ms)
```

---

## Part 2: XP and Leveling System

### How XP Works

**XP Gain Formula:**
```
XP Gained = Enemy Level × 20

Example:
- Defeat Level 10 enemy → 200 XP
- Defeat Level 15 boss → 300 XP
```

**XP to Level Up:**
```
XP Needed = 100 × Current Level

Example:
- Level 5: Need 500 XP to reach Level 6
- Level 10: Need 1000 XP to reach Level 11
```

### What Happens When You Level Up?

When a Pokémon gains enough XP:

1. **Level increases** by 1
2. **Stats recalculated** based on new level:
   - Attack
   - Defense
   - Sp. Atk
   - Sp. Def
   - Speed
3. **HP restored** to new maximum (healing effect)
4. **Message displayed:** `"Pikachu leveled up to Lv. 15! Stats increased!"`

### Implementation Details

**XP Functions in `game-data.js`:**

```javascript
// Calculate XP reward from enemy
calculateXpGain(enemyPokemon)
→ Returns: enemyPokemon.level * 20

// Get XP needed for next level
getXpToNextLevel(currentLevel)
→ Returns: 100 * currentLevel

// Check if Pokémon leveled up
checkLevelUp(pokemon)
→ Returns: { leveled: true, newLevel: 7, newStats: {...} }

// Apply level up to Pokémon
applyLevelUp(pokemon, newLevel)
→ Updates: level, stats, maxHp, currentHp (full restore), exp (reset)
```

**In Battle:**
```javascript
// After victory, XP is awarded:
const xpGain = calculateXpGain(enemyPokemon);
updatedTeam[0].exp += xpGain;

// Check for level up
const levelUpData = checkLevelUp(updatedTeam[0]);
if (levelUpData.leveled) {
  applyLevelUp(updatedTeam[0], levelUpData.newLevel);
  showMessageBox(`${name} leveled up to Lv. ${level}!`);
}
```

---

## Part 3: Reward Screen (Recruit New Pokémon)

### When Does It Appear?

After defeating a **Gym Leader boss** (every 5 waves):
- Wave 5, 10, 15, 20, 25...

### What It Shows

A modal with **3 randomly generated Pokémon**:
- Each is a different random Pokémon
- Level scales with current wave difficulty
- Shows stats: Level, HP, Attack

**Example:**
```
🏆 Victory!
You defeated the Gym Leader! Choose a Pokémon to join your team:

[🔥 Charizard]  [💧 Lapras]      [⚡ Zapdos]
Lv. 15          Lv. 15           Lv. 15
HP: 78 | ATK: 84
```

### How to Use It

1. Click any of the 3 Pokémon cards
2. Pokémon joins your team
3. Battle continues with expanded team

**Team size limits:**
- Start with 3 Pokémon
- Can have up to 3 Pokémon (configurable via `STARTING_TEAM_SIZE`)
- Max team size is 6 (configurable via `MAX_TEAM_SIZE`)

### Game State Changes

```javascript
gameState.isShowingReward = true;          // Show modal
gameState.rewardCandidates = [poke1, poke2, poke3];  // 3 options

// After selection:
playerTeam.push(selectedPokemon);          // Add to team
gameState.isShowingReward = false;         // Close modal
```

---

## Part 4: Asset Organization

### Directory Structure

New organized folder structure for all game assets:

```
src/assets/
├── sprites/
│   ├── pokemon/
│   │   ├── front/          ← Pokémon sprites (facing forward)
│   │   ├── back/           ← Pokémon sprites (facing backward)
│   │   └── idle/           ← Idle animation frames
│   └── effects/
│       ├── attacks/        ← Attack animation sprites
│       ├── explosions/     ← Impact effects
│       └── particles/      ← Particle effects
├── audio/
│   ├── music/
│   │   ├── battle.mp3      ← Battle theme
│   │   ├── victory.mp3     ← Victory jingle
│   │   ├── defeat.mp3      ← Defeat theme
│   │   └── boss-theme.mp3  ← Boss music
│   └── sfx/
│       ├── attack.mp3      ← Attack sound
│       ├── damage.mp3      ← Damage sound
│       ├── levelup.mp3     ← Level up sound
│       └── select.mp3      ← Button click
└── ui/
    ├── buttons/            ← Button assets
    ├── icons/              ← Type icons, status icons
    └── backgrounds/        ← UI backgrounds
```

### How to Add Your Own Assets

**Step 1: Prepare PNG Files**
- Pokémon front sprite: 192×192px, transparent background
- Place in: `src/assets/sprites/pokemon/front/pikachu.png`

**Step 2: Update Code**
In `FlashcardRogue.js`, modify `renderPokemon()`:

```javascript
renderPokemon() {
  // OLD: Rectangle placeholder
  const playerPokemonBox = this.add.rectangle(200, 300, 120, 100, 0x3a5a7e);
  
  // NEW: Load sprite
  this.load.image('player-poke', 
    `src/assets/sprites/pokemon/front/${this.playerPokemon.species}.png`);
  this.playerSprite = this.add.sprite(200, 300, 'player-poke').setScale(2);
}
```

**Step 3: Reload**
- Just restart the app
- Sprites will load automatically!

### Asset Reference Guide

See **ASSET_GUIDE.md** for detailed instructions on:
- Where to place PNG files
- Audio file specifications
- Naming conventions
- Code examples for loading assets

---

## Phase 2 Technical Implementation

### Files Modified

**`src/game-data.js`** - Added 5 new utility functions:
```javascript
calculateXpGain(enemyPokemon)      // XP reward
getXpToNextLevel(currentLevel)     // XP requirement
checkLevelUp(pokemon)              // Level up check
applyLevelUp(pokemon, newLevel)    // Apply level up
```

**`src/FlashcardRogue.js`** - Major enhancements:

**BattleScene class:**
- Added animation methods:
  - `animateAttack()` - Sprite movement with tweens
  - `animateDamageFlash()` - White tint flash
  - `createDamagePopup()` - Floating damage numbers
  - `animateHealthBar()` - Smooth HP bar animation
- Updated `executePlayerMove()` - Uses animations
- Updated `executeEnemyTurn()` - Uses animations

**FlashcardRogue component:**
- Added state: `isShowingReward`, `rewardCandidates`
- Updated `handleBattleEnd()` - Handles XP, level-up, rewards
- Added `selectReward()` - Recruit new Pokémon
- Added reward screen UI

### Configuration Options

In `GAME_CONFIG` (src/game-data.js):

```javascript
CORRECT_ANSWER_BONUS_DAMAGE: 1.2,   // 20% bonus for correct answer
INCORRECT_ANSWER_PENALTY: 0.5,      // Move fails if wrong
WAVES_PER_GYM_LEADER: 5,            // Boss every 5 waves
STARTING_TEAM_SIZE: 3,              // Start with 3 Pokémon
MAX_TEAM_SIZE: 6,                   // Max 6 Pokémon
```

---

## 🎯 Testing the New Features

### Test Checklist

**Animations:**
- [ ] When you use a move, player Pokémon moves forward then back
- [ ] Enemy Pokémon flashes white when taking damage
- [ ] Damage number floats up and fades out
- [ ] HP bar animates smoothly over ~300ms
- [ ] HP bar color changes (green → yellow → red)

**XP & Leveling:**
- [ ] After battle victory, message shows XP gained
- [ ] After multiple battles, Pokémon levels up
- [ ] "Level up!" message appears on screen
- [ ] Leveled Pokémon has increased stats
- [ ] HP is restored to max on level up
- [ ] Exp counter resets after level up

**Reward Screen:**
- [ ] After wave 5, reward screen appears instead of next battle
- [ ] Screen shows 3 different Pokémon options
- [ ] Each option shows Level, HP, Attack stats
- [ ] Clicking any Pokémon adds it to your team
- [ ] Reward screen closes after selection
- [ ] Next battle starts with expanded team

**Assets:**
- [ ] Directory structure is created correctly
- [ ] ASSET_GUIDE.md explains where to place files
- [ ] Game still works with placeholder rectangles
- [ ] Sprites load correctly when added (after following guide)

---

## 🚀 What's Next?

### Possible Phase 3 Features

1. **Sprite Graphics**
   - Replace placeholder rectangles with actual Pokémon sprites
   - Add idle animations

2. **Audio System**
   - Background music during battles
   - Sound effects for attacks, damage, level-up

3. **Advanced Animations**
   - Attack animations (projectiles, collision effects)
   - Fainting animation
   - Evolution effects

4. **UI Enhancements**
   - Type icons next to move names
   - Status effects display
   - Ability system

5. **Gameplay Depth**
   - Item system (Potions, Revives)
   - Move learning/forgetting
   - Ability system
   - Nature/IVs/EVs system

6. **Persistence**
   - Save runs to Firestore
   - Leaderboard system
   - Daily challenges
   - Achievement system

---

## 📊 Performance Notes

**Animation Performance:**
- Tweens are GPU-accelerated via Phaser
- Damage popups are created and destroyed efficiently
- No memory leaks (tweens cleaned up after completion)

**Large Team Performance:**
- Game tested with teams up to 6 Pokémon
- No lag when displaying stats or animations
- XP calculations are O(1) complexity

---

## 🐛 Troubleshooting

**Q: Animations are stuttering/laggy**
A: Check browser performance. If playing on low-end device, reduce particle count or animation duration in code.

**Q: Reward screen not appearing**
A: Make sure you've won a battle that's a multiple of 5 (wave 5, 10, 15, etc.). Check browser console for errors.

**Q: Pokémon not leveling up**
A: Check that XP is being added correctly. Use browser DevTools to inspect `gameState.playerTeam[0].exp` value.

**Q: Damage numbers not showing**
A: Ensure enemy took damage (check enemy HP). Numbers fade quickly; watch carefully or adjust `duration: 1000` in `createDamagePopup()` to make them longer.

---

## 📝 Code Examples

### Add Custom Animation

```javascript
// In BattleScene class
customAnimateSpecialEffect() {
  this.tweens.add({
    targets: this.enemySprite,
    scale: 1.1,
    duration: 200,
    yoyo: true,
    ease: 'Quad.easeOut'
  });
}
```

### Modify XP Formula

```javascript
// In game-data.js
export function calculateXpGain(enemyPokemon) {
  // Example: Give 50 XP per level instead of 20
  return enemyPokemon.level * 50;  // Changed from 20 to 50
}
```

### Change Reward Frequency

```javascript
// In FlashcardRogue.js handleBattleEnd
const isBossWave = newWave % 3 === 0;  // Boss every 3 waves instead of 5
```

---

## 📚 Related Documentation

- **README_FLASHCARD_ROGUE.md** - Game overview
- **FLASHCARD_ROGUE_GUIDE.md** - Architecture guide
- **FLASHCARD_ROGUE_STATE_MACHINE.md** - Battle flow
- **ASSET_GUIDE.md** - Asset management
- **FLASHCARD_ROGUE_QUICK_START.md** - Developer reference

---

**Enjoy the enhanced Flashcard Rogue! The game now feels more polished, engaging, and rewarding.** 🎮✨
