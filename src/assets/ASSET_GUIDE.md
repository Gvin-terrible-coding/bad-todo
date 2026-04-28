# Flashcard Rogue - Asset Management Guide

## 📁 Directory Structure

```
src/assets/
├── sprites/
│   ├── pokemon/
│   │   ├── front/          (Pokémon sprites facing forward)
│   │   ├── back/           (Pokémon sprites facing backward)
│   │   └── idle/           (Idle animation frames)
│   └── effects/
│       ├── attacks/        (Attack animation sprites)
│       ├── explosions/     (Impact/explosion effects)
│       └── particles/      (Particle effects)
├── audio/
│   ├── music/
│   │   ├── battle.mp3
│   │   ├── victory.mp3
│   │   └── defeat.mp3
│   └── sfx/
│       ├── attack.mp3
│       ├── damage.mp3
│       ├── levelup.mp3
│       └── select.mp3
└── ui/
    ├── buttons/
    ├── icons/
    └── backgrounds/
```

## 🎮 Pokémon Sprites

### Naming Convention

**Front Sprites:**
- File: `pokemon/front/{pokemonId}.png`
- Size: 192x192px recommended
- Example: `pokemon/front/pikachu.png`

**Back Sprites:**
- File: `pokemon/back/{pokemonId}.png`
- Size: 192x192px recommended
- Example: `pokemon/back/pikachu.png`

**Idle Animations:**
- Files: `pokemon/idle/{pokemonId}_frame1.png`, `{pokemonId}_frame2.png`, etc.
- Size: 192x192px recommended
- Use for looping idle animation during battle

### How to Reference in Code

```javascript
// In game-data.js or FlashcardRogue.js
const spriteKey = 'pikachu-front';
const spritePath = `src/assets/sprites/pokemon/front/pikachu.png`;

// When loading sprites in Phaser:
this.load.image(spriteKey, spritePath);

// When displaying:
const sprite = this.add.sprite(x, y, spriteKey);
```

### Current Implementation

The game currently uses **placeholder rectangles** with text labels. To switch to actual sprites:

1. Place your PNG files in `src/assets/sprites/pokemon/front/`
2. Update the sprite loading in `FlashcardRogue.js` → `BattleScene.create()`
3. Replace `renderPokemon()` method to load sprites instead of rectangles

**Example Update:**
```javascript
// OLD: Rectangle placeholder
const playerPokemonBox = this.add.rectangle(200, 300, 120, 100, 0x3a5a7e);

// NEW: Load sprite
this.load.image('player-pokemon', `src/assets/sprites/pokemon/front/${playerPokemon.species}.png`);
const playerSprite = this.add.sprite(200, 300, 'player-pokemon');
playerSprite.setScale(2);
```

## 🎨 Effect Sprites

### Attack Effects

- File: `sprites/effects/attacks/{type}.png`
- Example: `sprites/effects/attacks/tackle.png`
- Size: 256x256px recommended
- Show when attacks land for visual impact

### Explosion/Impact Effects

- File: `sprites/effects/explosions/impact.png`
- Multiple frame sprite sheet for animation
- Use when Pokémon takes damage

## 🔊 Audio Files

### Background Music

Place battle music in `audio/music/`:
- `battle.mp3` - Main battle theme
- `victory.mp3` - Victory jingle
- `defeat.mp3` - Defeat theme
- `boss-theme.mp3` - Special boss music

**Loading in Phaser:**
```javascript
this.sound.play('battle-theme', { loop: true, volume: 0.7 });
```

### Sound Effects

Place sound effects in `audio/sfx/`:
- `attack.mp3` - Generic attack sound
- `damage.mp3` - Damage taken sound
- `levelup.mp3` - Level up jingle
- `select.mp3` - Button click sound
- `heal.mp3` - Healing sound
- `type-effectiveness.mp3` - Super effective/not very effective sound

**Loading in Phaser:**
```javascript
this.sound.play('damage', { volume: 0.5 });
```

## 🖼️ UI Assets

### Button Icons & Backgrounds

- Location: `ui/buttons/` and `ui/icons/`
- Size: Varies based on use case
- Use for:
  - Move buttons with type icons
  - Health bar backgrounds
  - Menu backgrounds
  - Status effect icons

## 📝 How to Add Your Own Assets

### Step 1: Prepare Your Files

1. **Pokémon Sprites:**
   - Export front-facing sprite as PNG (192x192px or larger)
   - Export back-facing sprite as PNG (192x192px or larger)
   - Remove background (transparent PNG)

2. **Audio Files:**
   - Export as MP3 (recommended) or OGG
   - Mono or stereo
   - Sample rate: 44.1kHz or 48kHz

### Step 2: Place in Correct Folder

- Pokémon front sprite: `src/assets/sprites/pokemon/front/pikachu.png`
- Audio: `src/assets/audio/sfx/attack.mp3`

### Step 3: Update Code

In `FlashcardRogue.js`, update `renderPokemon()` method:

```javascript
renderPokemon() {
  // Load player Pokémon sprite
  const playerSpritePath = `src/assets/sprites/pokemon/front/${this.playerPokemon.species}.png`;
  this.load.image('player-poke', playerSpritePath);
  this.playerSprite = this.add.sprite(
    GAME_CONFIG.PLAYER_POKEMON_X,
    GAME_CONFIG.PLAYER_POKEMON_Y,
    'player-poke'
  ).setScale(2);

  // Load enemy Pokémon sprite
  const enemySpritePath = `src/assets/sprites/pokemon/front/${this.enemyPokemon.species}.png`;
  this.load.image('enemy-poke', enemySpritePath);
  this.enemySprite = this.add.sprite(
    GAME_CONFIG.ENEMY_POKEMON_X,
    GAME_CONFIG.ENEMY_POKEMON_Y,
    'enemy-poke'
  ).setScale(2);
}
```

### Step 4: Add Audio Loading (in `create()`)

```javascript
create() {
  // ... existing code ...
  
  // Load audio
  try {
    this.sound.add('battle-theme');
    this.sound.add('damage');
    this.sound.add('attack');
  } catch (e) {
    console.warn('Audio not found:', e);
  }
  
  // Play battle theme
  this.sound.play('battle-theme', { loop: true, volume: 0.5 });
}
```

## 🔗 Asset References in Code

### Current Placeholder System

All game logic uses:
- `pokemon.species` → ID string like "pikachu", "dragonite"
- `move.id` → Move ID string like "thunderbolt", "earthquake"
- `move.type` → Type string like "electric", "fire"

When you add sprites, reference them using these IDs:

```javascript
// Example: Load sprite based on pokemon.species
const spriteFile = `src/assets/sprites/pokemon/front/${pokemon.species}.png`;
this.load.image(pokemon.species + '-front', spriteFile);
const sprite = this.add.sprite(x, y, pokemon.species + '-front');
```

## 📦 Recommended Asset Sources

If you don't have sprites, here are some free options:

1. **Pokémon Sprites:**
   - Pokémon Showdown (showdown.pokemon.com) - Official-style sprites
   - itch.io - Community-made pixel art
   - OpenGameArt.org - Free game assets

2. **Audio:**
   - Freesound.org - Sound effects
   - YouTube Audio Library - Royalty-free music
   - OpenGameArt.org - Game music

## 🚀 Quick Start: No Assets Needed

If you want to test without assets, the current placeholder system (colored rectangles with text) works perfectly fine. The game is fully playable with just text labels.

To enable sprites later:
1. Just drop PNG files in the correct folder
2. Update the `renderPokemon()` method
3. Restart the app

No other changes needed!

## 🎯 Priority Order

If you're adding assets gradually:

1. **Must have:** Pokémon front sprites (for player team)
2. **Important:** Enemy Pokémon front sprites
3. **Nice to have:** Battle theme music
4. **Polish:** Attack sound effects
5. **Extra:** Idle animations and particle effects

---

**Questions?** Check the main README_FLASHCARD_ROGUE.md for more details about the game architecture.
