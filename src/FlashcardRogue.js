// ============================================================================
// FLASHCARD ROGUE - MAIN COMPONENT & GAME ENGINE
// Complete Pokémon-style roguelike with Phaser.js integration
// ============================================================================

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import Phaser from 'phaser';
import {
  POKEMON_SPECIES,
  MOVES,
  TYPE_EFFECTIVENESS,
  GAME_CONFIG,
  GYM_LEADERS,
  ITEMS,
  generateRandomPokemon,
  calculateDamage,
  getTypeEffectiveness,
  initializePokemon,
  getRandomMove,
  calculateXpGain,
  checkLevelUp,
  applyLevelUp,
  getXpToNextLevel,
  applyStatusMoveEffect,
  selectRandomItems,
} from './game-data';

// ============================================================================
// BATTLE SCENE - Main Phaser Scene for Battle Logic
// ============================================================================
class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BattleScene' });
    this.stateMachine = 'waiting';
    this.turnCount = 0;
    this.battleLog = [];
    this.playerSprite = null;
    this.enemySprite = null;
    this.playerHPBar = null;
    this.enemyHPBar = null;
    this.playerHPBarBg = null;
    this.enemyHPBarBg = null;
  }
  createSprite(isBack, textureKey) {
    let placeholder, x, y;

    if (isBack) {
      placeholder = this.playerSprite;
      x = GAME_CONFIG.PLAYER_POKEMON_X;
      y = GAME_CONFIG.PLAYER_POKEMON_Y;
    } else {
      placeholder = this.enemySprite;
      x = GAME_CONFIG.ENEMY_POKEMON_X;
      y = GAME_CONFIG.ENEMY_POKEMON_Y;
    }
    
    // Make sure the placeholder still exists and hasn't already been replaced
    if (placeholder && placeholder.isPlaceholder) {
      // Create the new, correctly textured sprite
      const newSprite = this.add.sprite(x, y, textureKey);
      newSprite.setScale(GAME_CONFIG.POKEMON_SCALE);
      
      // Destroy the old placeholder rectangle
      placeholder.destroy();

      // Update the scene's reference to point to the new sprite
      if (isBack) {
        this.playerSprite = newSprite;
      } else {
        this.enemySprite = newSprite;
      }
    }
  }
  shutdown() {
    console.log("BattleScene shutting down and cleaning up.");

    // Destroy all sprites to prevent them from persisting
    if (this.playerSprite) this.playerSprite.destroy();
    if (this.enemySprite) this.enemySprite.destroy();

    // Destroy HUD elements
    if (this.playerHPBar) this.playerHPBar.destroy();
    if (this.playerHPBarBg) this.playerHPBarBg.destroy();
    if (this.playerHPText) this.playerHPText.destroy();
    if (this.enemyHPBar) this.enemyHPBar.destroy();
    if (this.enemyHPBarBg) this.enemyHPBarBg.destroy();
    if (this.enemyHPText) this.enemyHPText.destroy();
    if (this.messageText) this.messageText.destroy();

    // Destroy all move buttons and clear the array
    this.playerMoveButtons.forEach(({ button, moveText, powerText }) => {
      button.destroy();
      moveText.destroy();
      powerText.destroy();
    });
    this.playerMoveButtons = [];

    // Reset internal state
    this.loadedSprites.clear();
    this.stateMachine = 'waiting';
  }
  init(data) {
    this.playerPokemon = data.playerPokemon;
    this.enemyPokemon = data.enemyPokemon;
    this.onQuizRequested = data.onQuizRequested;
    this.onBattleEnd = data.onBattleEnd;
    this.messageText = null;
    this.playerMoveButtons = [];
    this.damagePopups = [];
    this.loadedSprites = new Set(); // Track which sprites have been loaded
  }

  /**
   * Sanitize Pokémon species name to Pokémon Showdown convention
   * Converts to lowercase and removes non-alphanumeric characters
   * Examples: "Mr. Mime" → "mrmime", "Type: Null" → "typenull"
   */
  sanitizeSpeciesName(species) {
    return species
      .toLowerCase() // Convert to lowercase
      .replace(/[^a-z0-9]/g, ''); // Remove all non-alphanumeric characters
  }

  /**
   * Lazy-load a sprite only when needed
   * Follows Pokémon Showdown naming: {sanitized_species}-{suffix}.gif
   * Suffixes: 'b' = back (player perspective), default = front (enemy perspective)
   * Examples: "pikachu-b.gif" (back), "charizard.gif" (front)
   * All sprites stored in src/assets/Sprites/pokemon/
   */
loadSpriteIfNeeded(species, isBack = false) {
    const sanitized = this.sanitizeSpeciesName(species);
    const spriteKey = isBack ? `${sanitized}-b` : sanitized;
    const textureKey = `pokemon_${spriteKey}`;

    // If texture is already fully loaded and valid, create the sprite immediately.
    if (this.textures.exists(textureKey) && this.textures.get(textureKey).width > 1) {
      this.createSprite(isBack, textureKey);
      return;
    }

    // If we are already in the process of loading this texture, don't do it again.
    if (this.loadedSprites.has(textureKey)) {
      return;
    }
    this.loadedSprites.add(textureKey); // Mark as "loading"

    const filename = isBack ? `${sanitized}-b.gif` : `${sanitized}.gif`;
    const publicUrl = `${process.env.PUBLIC_URL}/assets/Sprites/pokemon/${filename}`;

    // Use Phaser's loader to safely load the image.
    this.load.image(textureKey, publicUrl);
    
    // Listen for the 'filecomplete' event for THIS specific texture.
    this.load.once(`filecomplete-image-${textureKey}`, () => {
      // This code will only run AFTER Phaser confirms the image is loaded and processed.
      this.createSprite(isBack, textureKey);
    });
    
    // Start the loader if it isn't already running.
    this.load.start();
  }

  create() {
    // Set background
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Draw battle arena
    this.drawBattleArena();

    // Render Pokémon (placeholder rectangles with text)
    this.renderPokemon();

    // Render HUD (health bars, names, levels)
    this.renderHUD();

    // Create action menu
    this.createActionMenu();

    // Add message box
    this.messageText = this.add.text(480, 50, 'Battle Start!', {
      fontSize: '18px',
      fill: '#ffffff',
      wordWrap: { width: 850 },
      align: 'center',
    });

    console.log('BattleScene initialized:', {
      player: this.playerPokemon.name,
      enemy: this.enemyPokemon.name,
    });
  }

  drawBattleArena() {
    // Add a subtle gradient background effect
    const gradient = this.add.graphics();
    gradient.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x2a3a4e, 0x2a3a4e, 1);
    gradient.fillRect(0, 0, GAME_CONFIG.CANVAS_WIDTH, GAME_CONFIG.CANVAS_HEIGHT);

    // Add some sparkles to the background
    for (let i = 0; i < 20; i++) {
      const sparkle = this.add.text(
        Math.random() * GAME_CONFIG.CANVAS_WIDTH,
        Math.random() * GAME_CONFIG.CANVAS_HEIGHT,
        '✨',
        { fontSize: '12px', alpha: 0.3 }
      );
      this.tweens.add({
        targets: sparkle,
        alpha: { from: 0.1, to: 0.8 },
        duration: 2000 + Math.random() * 3000,
        ease: 'Sine.easeInOut',
        yoyo: true,
        repeat: -1
      });
    }

    // Player side background with glow effect
    const playerSideBg = this.add.rectangle(250, 300, 400, 400, 0x2a3a4e);
    playerSideBg.setStrokeStyle(3, 0x4a6fa5);
    playerSideBg.setAlpha(0.8);

    // Add player side decoration
    const playerCorner = this.add.text(80, 120, '⭐', { fontSize: '48px', alpha: 0.6 });
    this.tweens.add({
      targets: playerCorner,
      scale: { from: 0.8, to: 1.2 },
      alpha: { from: 0.3, to: 0.8 },
      duration: 2000,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // Enemy side background with glow effect
    const enemySideBg = this.add.rectangle(710, 200, 400, 300, 0x2a3a4e);
    enemySideBg.setStrokeStyle(3, 0xff6b6b);
    enemySideBg.setAlpha(0.8);

    // Add enemy side decoration
    const enemyCorner = this.add.text(950, 50, '🔥', { fontSize: '48px', alpha: 0.6 });
    this.tweens.add({
      targets: enemyCorner,
      scale: { from: 0.8, to: 1.2 },
      alpha: { from: 0.3, to: 0.8 },
      duration: 1500,
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1
    });

    // Add center divider line
    const divider = this.add.line(
      480, 0, 480, GAME_CONFIG.CANVAS_HEIGHT,
      0xffffff, 2
    );
    divider.setAlpha(0.3);
  }

renderPokemon() {
    // Player Pokémon: Create a placeholder rectangle first
    this.playerSprite = this.add.rectangle(
      GAME_CONFIG.PLAYER_POKEMON_X, GAME_CONFIG.PLAYER_POKEMON_Y, 120, 100, 0x3a5a7e
    );
    this.playerSprite.setStrokeStyle(2, 0x8ab0d8);
    this.playerSprite.isPlaceholder = true; // Mark it as a placeholder

    // Enemy Pokémon: Create a placeholder rectangle first
    this.enemySprite = this.add.rectangle(
      GAME_CONFIG.ENEMY_POKEMON_X, GAME_CONFIG.ENEMY_POKEMON_Y, 120, 100, 0x7e3a3a
    );
    this.enemySprite.setStrokeStyle(2, 0xd88ab0);
    this.enemySprite.isPlaceholder = true; // Mark it as a placeholder

    // Now, trigger the loading process. The actual sprite will be created later.
    this.loadSpriteIfNeeded(this.playerPokemon.species, true);
    this.loadSpriteIfNeeded(this.enemyPokemon.species, false);

    // The name text can stay as it is
    this.add.text(GAME_CONFIG.PLAYER_POKEMON_X, GAME_CONFIG.PLAYER_POKEMON_Y + 80, this.playerPokemon.name, { fontSize: '16px', fill: '#ffffff', align: 'center' });
    this.add.text(GAME_CONFIG.ENEMY_POKEMON_X, GAME_CONFIG.ENEMY_POKEMON_Y + 80, this.enemyPokemon.name, { fontSize: '16px', fill: '#ffffff', align: 'center' });
  }

renderHUD() {
    // Player Pokémon HUD
    this.add.text(50, 450, `${this.playerPokemon.name} Lv.${this.playerPokemon.level}`, { fontSize: '14px', fill: '#ffffff' });
    this.playerHPBarBg = this.add.rectangle(50, 470, 200, 20, 0x333333).setOrigin(0, 0.5);
    this.playerHPBarBg.setStrokeStyle(2, 0xffffff);

    const playerHPPercent = this.playerPokemon.currentHp / this.playerPokemon.maxHp;
    const playerHPColor = playerHPPercent > 0.5 ? 0x00cc00 : playerHPPercent > 0.25 ? 0xffaa00 : 0xcc0000;
    this.playerHPBar = this.add.rectangle(50, 470, 200 * playerHPPercent, 20, playerHPColor).setOrigin(0, 0.5); // <-- FIX: Set origin to left-center

    this.playerHPText = this.add.text(150, 470, `${this.playerPokemon.currentHp}/${this.playerPokemon.maxHp}`, { fontSize: '12px', fill: '#ffffff' }).setOrigin(0.5, 0.5);

    // Enemy Pokémon HUD
    this.add.text(710, 50, `${this.enemyPokemon.name} Lv.${this.enemyPokemon.level}`, { fontSize: '14px', fill: '#ffffff' });
    this.enemyHPBarBg = this.add.rectangle(710, 70, 200, 20, 0x333333).setOrigin(0, 0.5);
    this.enemyHPBarBg.setStrokeStyle(2, 0xffffff);

    const enemyHPPercent = this.enemyPokemon.currentHp / this.enemyPokemon.maxHp;
    const enemyHPColor = enemyHPPercent > 0.5 ? 0x00cc00 : enemyHPPercent > 0.25 ? 0xffaa00 : 0xcc0000;
    this.enemyHPBar = this.add.rectangle(710, 70, 200 * enemyHPPercent, 20, enemyHPColor).setOrigin(0, 0.5); // <-- FIX: Set origin to left-center
    
    this.enemyHPText = this.add.text(810, 70, `${this.enemyPokemon.currentHp}/${this.enemyPokemon.maxHp}`, { fontSize: '12px', fill: '#ffffff' }).setOrigin(0.5, 0.5);
  }

createActionMenu() {
    const moveY = 520; // Adjusted Y position for better layout
    const moveSpacing = 230; // Adjusted spacing
    const startX = 115;

    for (let i = 0; i < 4; i++) {
      const moveId = this.playerPokemon.moves[i];
      const move = MOVES[moveId];

      if (!move) continue;

      const buttonX = startX + i * moveSpacing;
      
      // Create button with gradient effect
      const button = this.add.rectangle(buttonX, moveY, 210, 70, 0x4a5f7f);
      button.setStrokeStyle(3, 0x8ab0d8);
      button.setInteractive();
      
      // Add move type indicator
      const typeColor = this.getTypeColor(move.type);
      const typeIndicator = this.add.rectangle(buttonX - 90, moveY, 20, 70, typeColor);
      typeIndicator.setAlpha(0.7);

      // Add move name with better styling
      const moveText = this.add.text(buttonX, moveY - 15, move.name, {
        fontSize: '14px',
        fill: '#ffffff',
        align: 'center',
        wordWrap: { width: 190 },
        fontWeight: 'bold'
      }).setOrigin(0.5, 0.5);

      // Add power with icon
      const powerText = this.add.text(buttonX, moveY + 10, `💥 ${move.power || 'N/A'}`, {
        fontSize: '12px',
        fill: '#ffff66',
        align: 'center',
        fontWeight: 'bold'
      }).setOrigin(0.5, 0.5);

      // Add category icon
      const categoryIcon = move.category === 'physical' ? '👊' : move.category === 'special' ? '🔮' : '🛡️';
      const categoryText = this.add.text(buttonX + 85, moveY + 10, categoryIcon, {
        fontSize: '16px',
        fill: '#ffffff'
      }).setOrigin(0.5, 0.5);

      // Hover effects
      button.on('pointerover', () => {
        button.setFillStyle(0x5a7f9f);
        button.setScale(1.05);
      });
      button.on('pointerout', () => {
        button.setFillStyle(0x4a5f7f);
        button.setScale(1.0);
      });
      button.on('pointerdown', () => this.handlePlayerMove(move));

      this.playerMoveButtons.push({ button, moveText, powerText, categoryText, typeIndicator, move });
    }
  }

  getTypeColor(type) {
    const typeColors = {
      fire: 0xff4757,
      water: 0x2ed573,
      grass: 0x2ed573,
      electric: 0xffd321,
      ice: 0x5352ed,
      dragon: 0x9980ff,
      dark: 0x5352ed,
      fairy: 0xff6b6b,
      fighting: 0xff6b6b,
      poison: 0x9980ff,
      ground: 0xffd321,
      flying: 0x5352ed,
      psychic: 0x9980ff,
      bug: 0x2ed573,
      rock: 0xffd321,
      ghost: 0x5352ed,
      steel: 0xffd321,
      normal: 0x95a5a6
    };
    return typeColors[type] || 0x95a5a6;
  }

  async handlePlayerMove(move) {
    if (this.stateMachine !== 'waiting') return;

    this.stateMachine = 'quiz';
    this.disableActionMenu();

    // Request quiz from parent component
    const isCorrect = await this.onQuizRequested();

    if (isCorrect) {
      this.executePlayerMove(move, true);
    } else {
      this.stateMachine = 'waiting';
      this.updateMessageBox(`${this.playerPokemon.name} answered incorrectly! Move failed!`);
      this.enableActionMenu();
      return;
    }

    // Wait a moment before enemy turn
    this.time.delayedCall(1500, () => {
      this.executeEnemyTurn();
    });
  }

  /**
   * Animate attacker moving towards defender
   */
  animateAttack(attacker, isPlayerAttack = true) {
    const offsetX = isPlayerAttack ? 50 : -50;

    return new Promise((resolve) => {
      this.tweens.add({
        targets: attacker,
        x: `+=${offsetX}`,
        yoyo: true,
        duration: 200,
        ease: 'Power1',
        onComplete: () => resolve(),
      });
    });
  }

  /**
   * Animate damage flash (white tint and fade)
   */
  animateDamageFlash(target) {
    target.setTint(0xffffff);

    this.tweens.add({
      targets: target,
      alpha: 0.7,
      duration: 100,
      ease: 'Linear',
      onComplete: () => {
        target.clearTint();
        target.setAlpha(1);
      },
    });
  }

  /**
   * Create floating damage number popup
   */
  createDamagePopup(damage, x, y, isEffective = 1) {
    const color = isEffective > 1 ? '#ffff00' : isEffective < 1 ? '#888888' : '#ffffff';
    const fontSize = isEffective > 1 ? '28px' : '24px';

    const damageText = this.add.text(x, y, damage.toString(), {
      fontSize,
      fill: color,
      fontStyle: 'bold',
      stroke: '#000000',
      strokeThickness: 2,
    });

    this.tweens.add({
      targets: damageText,
      y: y - 60,
      alpha: 0,
      duration: 1000,
      ease: 'Quad.easeOut',
      onComplete: () => {
        damageText.destroy();
      },
    });
  }

  /**
   * Animate health bar smoothly
   */
animateHealthBar(pokemon, targetHp, isPlayer = true) {
    const hpBar = isPlayer ? this.playerHPBar : this.enemyHPBar;
    const hpText = isPlayer ? this.playerHPText : this.enemyHPText;
    const maxHp = pokemon.maxHp;
    const targetWidth = Math.max(0, (targetHp / maxHp) * 200);

    this.tweens.add({
      targets: hpBar,
      width: targetWidth,
      duration: 300,
      ease: 'Linear',
      onUpdate: (tween) => {
        const currentPercent = hpBar.width / 200;
        const newColor = currentPercent > 0.5 ? 0x00cc00 : currentPercent > 0.25 ? 0xffaa00 : 0xcc0000;
        hpBar.setFillStyle(newColor);
      },
    });

    if (hpText) {
      hpText.setText(`${targetHp}/${maxHp}`);
    }
  }

  async executePlayerMove(move, isCorrect) {
    // Handle status moves differently from damage moves
    if (move.category === 'status' && move.effect === 'stat_change') {
      // Status move - apply stat change
      await this.animateAttack(this.playerSprite, true);
      
      const statusResult = applyStatusMoveEffect(this.enemyPokemon, move);
      let message = `${this.playerPokemon.name} used ${move.name}!\n${statusResult.message}`;
      
      this.updateMessageBox(message);
      this.time.delayedCall(1500, () => this.stateMachine = 'enemy-turn');
      return;
    }
    // --- ADD THIS ENTIRE BLOCK ---
    else if (move.category === 'status' && move.effect === 'heal') {
      const healAmount = Math.floor(this.playerPokemon.maxHp * move.healAmount);
      // Ensure we don't heal past the max HP
      const newHp = Math.min(this.playerPokemon.maxHp, this.playerPokemon.currentHp + healAmount);
      const actualHealed = newHp - this.playerPokemon.currentHp;
      
      this.playerPokemon.currentHp = newHp;
      
      this.updateMessageBox(`${this.playerPokemon.name} recovered ${actualHealed} HP!`);
      this.animateHealthBar(this.playerPokemon, this.playerPokemon.currentHp, true);
      
      // It's still the player's turn, so after healing, we must proceed to the enemy's turn.
      this.time.delayedCall(1500, () => this.executeEnemyTurn());
      return; // Stop the function here so it doesn't try to calculate damage.
    }
    // --- END OF ADDED BLOCK ---
    // Damage move
    const effectiveness = getTypeEffectiveness(move.type, this.enemyPokemon.type);
    const damage = calculateDamage(this.playerPokemon, this.enemyPokemon, move, effectiveness, isCorrect);

    // Animate attack
    await this.animateAttack(this.playerSprite, true);

    // Apply damage
    this.enemyPokemon.currentHp = Math.max(0, this.enemyPokemon.currentHp - damage);

    // Visual feedback
    this.animateDamageFlash(this.enemySprite);
    this.createDamagePopup(
      damage,
      GAME_CONFIG.ENEMY_POKEMON_X,
      GAME_CONFIG.ENEMY_POKEMON_Y - 80,
      effectiveness
    );

    let message = `${this.playerPokemon.name} used ${move.name}!`;
    if (isCorrect) {
      if (effectiveness > 1) {
        message += ` It's super effective! (+20% bonus)`;
      } else if (effectiveness < 1) {
        message += ` It's not very effective...`;
      } else {
        message += ` (${damage} damage)`;
      }
    }

    this.updateMessageBox(message);
    this.animateHealthBar(this.enemyPokemon, this.enemyPokemon.currentHp, false);

    if (this.enemyPokemon.currentHp <= 0) {
      this.stateMachine = 'battleEnd';
      this.time.delayedCall(1500, () => {
        this.endBattle(true);
      });
    } else {
      this.stateMachine = 'waiting';
      this.enableActionMenu();
    }
  }

  async executeEnemyTurn() {
    const enemyMove = getRandomMove(this.enemyPokemon);
    
    // Handle status moves differently from damage moves
    if (enemyMove.category === 'status' && enemyMove.effect === 'stat_change') {
      // Status move - apply stat change
      await this.animateAttack(this.enemySprite, false);
      
      const statusResult = applyStatusMoveEffect(this.playerPokemon, enemyMove);
      let message = `${this.enemyPokemon.name} used ${enemyMove.name}!\n${statusResult.message}`;
      
      this.updateMessageBox(message);
      this.time.delayedCall(1500, () => {
        this.stateMachine = 'waiting';
        this.enableActionMenu();
      });
      return;
    }

    // Damage move
    const effectiveness = getTypeEffectiveness(enemyMove.type, this.playerPokemon.type);
    const damage = calculateDamage(this.enemyPokemon, this.playerPokemon, enemyMove, effectiveness, false);

    // Animate attack
    await this.animateAttack(this.enemySprite, false);

    // Apply damage
    this.playerPokemon.currentHp = Math.max(0, this.playerPokemon.currentHp - damage);

    // Visual feedback
    this.animateDamageFlash(this.playerSprite);
    this.createDamagePopup(
      damage,
      GAME_CONFIG.PLAYER_POKEMON_X,
      GAME_CONFIG.PLAYER_POKEMON_Y - 80,
      effectiveness
    );

    let message = `${this.enemyPokemon.name} used ${enemyMove.name}!`;
    if (effectiveness > 1) {
      message += ` It's super effective!`;
    } else if (effectiveness < 1) {
      message += ` It's not very effective...`;
    } else {
      message += ` (${damage} damage)`;
    }

    this.updateMessageBox(message);
    this.animateHealthBar(this.playerPokemon, this.playerPokemon.currentHp, true);

    if (this.playerPokemon.currentHp <= 0) {
      this.stateMachine = 'battleEnd';
      this.time.delayedCall(1500, () => {
        this.endBattle(false);
      });
    } else {
      this.stateMachine = 'waiting';
      this.enableActionMenu();
    }
  }

  updateHPBars() {
    const playerHPPercent = this.playerPokemon.currentHp / this.playerPokemon.maxHp;
    const enemyHPPercent = this.enemyPokemon.currentHp / this.enemyPokemon.maxHp;

    this.playerHPBar.width = 200 * playerHPPercent;
    this.playerHPBar.x = 50 + 200 * playerHPPercent;
    this.playerHPBar.setFillStyle(
      playerHPPercent > 0.5 ? 0x00cc00 : playerHPPercent > 0.25 ? 0xffaa00 : 0xcc0000
    );

    this.enemyHPBar.width = 200 * enemyHPPercent;
    this.enemyHPBar.setFillStyle(
      enemyHPPercent > 0.5 ? 0x00cc00 : enemyHPPercent > 0.25 ? 0xffaa00 : 0xcc0000
    );
  }

  updateMessageBox(text) {
    if (this.messageText) {
      this.messageText.setText(text);
    }
  }

  disableActionMenu() {
    this.playerMoveButtons.forEach(({ button }) => {
      button.disableInteractive();
      button.setFillStyle(0x2a3a4e);
    });
  }

  enableActionMenu() {
    this.playerMoveButtons.forEach(({ button }) => {
      button.setInteractive();
      button.setFillStyle(0x4a5f7f);
    });
  }

  endBattle(playerWon) {
    this.stateMachine = 'ended';
    const message = playerWon ? 'Victory!' : 'Defeat! Pokémon fainted!';
    this.updateMessageBox(message);
    this.onBattleEnd(playerWon);
  }

  update() {
    // Game loop logic can be added here
  }
}

// ============================================================================
// REACT COMPONENT - FlashcardRogue Bridge
// ============================================================================
const FlashcardRogue = ({ studyZoneState = {}, showMessageBox, stats }) => {
  const gameRef = useRef(null);
  const [gameState, setGameState] = useState({
    isRunning: false,
    currentWave: 0,
    score: 0,
    playerTeam: [],
    defeatedEnemies: [],
    isShowingQuiz: false,
    currentMove: null,
    isShowingReward: false,
    rewardCandidates: [],
    rewardItems: [],
    rewardMode: 'pokemon', // 'pokemon' or 'item'
  });

  const [quizData, setQuizData] = useState(null);
  const [isEvolving, setIsEvolving] = useState(null); // Evolution state: { pokemon: evolvingPokemon }
  const gameActions = useRef({});
  const parsedFlashcards = useMemo(() => {
    // This checks if cardData exists. If not, it uses an empty object.
    const cardData = studyZoneState.cardData || {};
    // Object.values(cardData) gets an array of all your decks (which are arrays of cards).
    // .flat() combines all those deck arrays into a single, flat array of cards for the game.
    return Object.values(cardData).flat();
  }, [studyZoneState.cardData]); // The dependency is now on the correct data source.
  /**
   * End the game
   */
  const endGame = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      isRunning: false,
    }));

    showMessageBox(
      `Game Over! Final Score: ${gameState.score}, Waves Survived: ${gameState.currentWave}`,
      'info'
    );
  }, [gameState.score, gameState.currentWave, showMessageBox]);
  /**
   * Request a quiz question from flashcards
   */
  const requestQuiz = useCallback(
    (pokemon) => {
      return new Promise((resolve) => {
        if (parsedFlashcards.length === 0) {
          showMessageBox('No flashcards available!', 'error');
          resolve(true); // Default to correct if no flashcards
          return;
        }

        const randomCard = parsedFlashcards[Math.floor(Math.random() * parsedFlashcards.length)];
        
        // Generate multiple choice options from other flashcards
        const allAnswers = [randomCard.back];
        
        // Add 3 wrong answers from other flashcards
        const otherCards = parsedFlashcards.filter(card => card.back !== randomCard.back);
        const wrongAnswers = [];
        
        // Get up to 3 wrong answers
        for (let i = 0; i < 3 && otherCards.length > 0; i++) {
          const randomIndex = Math.floor(Math.random() * otherCards.length);
          const wrongAnswer = otherCards.splice(randomIndex, 1)[0].back;
          if (!wrongAnswers.includes(wrongAnswer)) {
            wrongAnswers.push(wrongAnswer);
          }
        }
        
        // Combine correct and wrong answers
        allAnswers.push(...wrongAnswers);
        
        // Shuffle the answers
        const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);
        
        setQuizData({
          card: randomCard,
          resolve,
          pokemon,
          answerOptions: shuffledAnswers,
        });

        setGameState((prev) => ({
          ...prev,
          isShowingQuiz: true,
        }));
      });
    },
    [parsedFlashcards, showMessageBox]
  );
  const handleBattleEnd = useCallback(
    (playerWon, enemyPokemon) => {
      if (playerWon) {
        // Award XP to player's Pokémon
        setGameState((prev) => {
          const updatedTeam = [...prev.playerTeam];
          const xpGain = calculateXpGain(enemyPokemon);
          updatedTeam[0].exp += xpGain;

          // Check for level up
          const levelUpData = checkLevelUp(updatedTeam[0]);
          if (levelUpData.leveled) {
            applyLevelUp(updatedTeam[0], levelUpData.newLevel);
            
            // Check for evolution
            const pokemonSpecies = POKEMON_SPECIES[updatedTeam[0].species];
            if (pokemonSpecies && pokemonSpecies.evolvesAt && pokemonSpecies.evolvesTo && 
                updatedTeam[0].level >= pokemonSpecies.evolvesAt) {
              
              // Trigger evolution sequence
              setIsEvolving({ pokemon: updatedTeam[0] });
              
              setTimeout(() => {
                // Perform evolution
                const evolvedSpecies = POKEMON_SPECIES[pokemonSpecies.evolvesTo];
                if (evolvedSpecies) {
                  // Update Pokémon data
                  updatedTeam[0].species = evolvedSpecies.id;
                  updatedTeam[0].name = evolvedSpecies.name;
                  
                  // Recalculate stats based on evolved form
                  const newMaxHp = 50 + (evolvedSpecies.baseStats.hp * updatedTeam[0].level * 0.5);
                  const newAttack = evolvedSpecies.baseStats.atk + (updatedTeam[0].level * 2);
                  
                  updatedTeam[0].maxHp = newMaxHp;
                  updatedTeam[0].currentHp = newMaxHp; // Heal to full
                  updatedTeam[0].stats.atk = newAttack;
                  
                  // Add new learnable moves if available
                  if (evolvedSpecies.learnable) {
                    // Add any new moves the Pokémon can learn
                    evolvedSpecies.learnable.forEach(moveId => {
                      if (!updatedTeam[0].moves.includes(moveId)) {
                        // Find empty move slot or replace weaker move
                        const emptySlot = updatedTeam[0].moves.indexOf(null);
                        if (emptySlot !== -1) {
                          updatedTeam[0].moves[emptySlot] = moveId;
                        } else {
                          // Replace the weakest move (simplified logic)
                          updatedTeam[0].moves[3] = moveId;
                        }
                      }
                    });
                  }
                  
                  showMessageBox(
                    `What?! ${updatedTeam[0].name} is evolving!`,
                    'success'
                  );
                  
                  setTimeout(() => {
                    showMessageBox(
                      `${updatedTeam[0].name} evolved! Stats have increased significantly!`,
                      'success'
                    );
                  }, 2000);
                }
                
                setIsEvolving(null);
              }, 3000); // Evolution animation time
              
              return {
                ...prev,
                currentWave: prev.currentWave + 1,
                score: prev.score + (enemyPokemon.level * 10),
                defeatedEnemies: [...prev.defeatedEnemies, enemyPokemon.name],
                playerTeam: updatedTeam,
              };
            } else {
              showMessageBox(
                `${updatedTeam[0].name} leveled up to Lv. ${levelUpData.newLevel}! Stats increased!`,
                'success'
              );
            }
          }

          const newWave = prev.currentWave + 1;
          const isBossWave = newWave > 0 && newWave % GAME_CONFIG.WAVES_PER_GYM_LEADER === 0;

          // After boss wave, show reward screen (choose between Pokémon and Items)
          if (isBossWave) {
            const rewardCandidates = [
              generateRandomPokemon(newWave, newWave + 3),
              generateRandomPokemon(newWave, newWave + 3),
              generateRandomPokemon(newWave, newWave + 3),
            ];

            const rewardItems = selectRandomItems(3);

            return {
              ...prev,
              currentWave: newWave,
              score: prev.score + (enemyPokemon.level * 10),
              defeatedEnemies: [...prev.defeatedEnemies, enemyPokemon.name],
              playerTeam: updatedTeam,
              isShowingReward: true,
              rewardCandidates,
              rewardItems,
            };
          }

          showMessageBox(`Victory! XP gained: ${xpGain}. Wave ${newWave} coming up...`, 'success');

          return {
            ...prev,
            currentWave: newWave,
            score: prev.score + (enemyPokemon.level * 10),
            defeatedEnemies: [...prev.defeatedEnemies, enemyPokemon.name],
            playerTeam: updatedTeam,
          };
        });

        // Wait before next battle (or reward screen)
        setTimeout(() => {
          setGameState((current) => {
            if (!current.isShowingReward && current.playerTeam.length > 0 && !isEvolving) {
              // Only start battle if game is still running, player has Pokémon, and no evolution
              setTimeout(() => {
                if (gameActions.current && gameActions.current.startBattle) {
                  gameActions.current.startBattle();
                }
              }, 500); // Small delay to ensure state is updated
            }
            return current;
          });
        }, 2000);
      } else {
        // Player Pokémon fainted
        setGameState((prev) => {
          const newTeam = prev.playerTeam.slice(1);
          if (newTeam.length === 0) {
            showMessageBox('All Pokémon fainted! Game Over!', 'error');
            setTimeout(() => {
              gameActions.current.endGame();
            }, 2000);
            return prev;
          }

          showMessageBox('Pokémon fainted! Sending next Pokémon...', 'warning');
          setTimeout(() => {
            if (gameActions.current && gameActions.current.startBattle) {
              gameActions.current.startBattle();
            }
          }, 2000);

          return {
            ...prev,
            playerTeam: newTeam,
          };
        });
      }
    },
    [showMessageBox, isEvolving]
  );
     const startBattle = useCallback(() => {
    if (gameState.playerTeam.length === 0) {
       gameActions.current.endGame();
      return;
    }

    const playerPokemon = gameState.playerTeam[0];
    const waveLevel = 5 + gameState.currentWave;

    let enemyPokemon;
    if (gameState.currentWave > 0 && gameState.currentWave % GAME_CONFIG.WAVES_PER_GYM_LEADER === 0) {
      // Boss wave
      const gymLeaderIndex = Math.floor((gameState.currentWave / GAME_CONFIG.WAVES_PER_GYM_LEADER) - 1);
      const leader = GYM_LEADERS[gymLeaderIndex % GYM_LEADERS.length];
      const pokemonId = leader.pokemon[0];
      enemyPokemon = initializePokemon(pokemonId, leader.level);
    } else {
      // Regular wave
      enemyPokemon = generateRandomPokemon(waveLevel - 5, waveLevel);
    }


    // --- ADD THIS GUARD CLAUSE ---
    // Final check to prevent starting a battle with invalid data.
    if (!playerPokemon || !enemyPokemon) {
      console.error("CRITICAL ERROR: Attempted to start battle with invalid Pokémon data.", {
        player: playerPokemon,
        enemy: enemyPokemon,
      });
      showMessageBox("A critical error occurred. Restarting game.", "error");
      endGame(); // Safely end the game instead of crashing.
      return;
    }
    // --- END OF ADDED CODE ---

    // Launch battle scene
    if (gameRef.current) {
      const sceneConfig = {
        playerPokemon,
        enemyPokemon,
        onQuizRequested: () => gameActions.current.requestQuiz(playerPokemon),
        onBattleEnd: (won) => gameActions.current.handleBattleEnd(won, enemyPokemon),
      };

      gameRef.current.scene.start('BattleScene', sceneConfig);
    }
  }, [gameState.currentWave, gameState.playerTeam]); // Updated dependencies
 /**
   * Handle battle result
   */

    /**
   * Initialize the game - setup player team and start first wave
   */
const initializeGame = useCallback(() => {
    if (Object.keys(POKEMON_SPECIES).length === 0) {
      showMessageBox("CRITICAL ERROR: POKEMON_SPECIES data is empty. Check game-data.js.", "error");
      return;
    }

    const playerTeam = [];
    const starterIds = Object.keys(POKEMON_SPECIES).slice(0, 3);

    for (let i = 0; i < GAME_CONFIG.STARTING_TEAM_SIZE; i++) {
      const species = starterIds[i % starterIds.length];
      playerTeam.push(initializePokemon(species, 5 + i));
    }

    // --- NEW LOGIC STARTS HERE ---
    // Now, immediately prepare and start the FIRST battle.
    const playerPokemon = playerTeam[0];
    const enemyPokemon = generateRandomPokemon(1, 5); // Generate the first enemy

    if (!playerPokemon || !enemyPokemon) {
      showMessageBox("Failed to initialize first battle. Please check data.", "error");
      return;
    }

    // Set the state AND start the scene in one go.
    setGameState((prev) => ({
      ...prev,
      isRunning: true,
      playerTeam,
      currentWave: 1,
      score: 0,
    }));

    if (gameRef.current) {
        const sceneConfig = {
            playerPokemon,
            enemyPokemon,
            onQuizRequested: () => gameActions.current.requestQuiz(playerPokemon),
            onBattleEnd: (won) => gameActions.current.handleBattleEnd(won, enemyPokemon),
        };
        gameRef.current.scene.start('BattleScene', sceneConfig);
    }
    // --- NEW LOGIC ENDS HERE ---

    showMessageBox('Game Started! First battle incoming!', 'info');
  }, [showMessageBox]);

  /**
   * Start a new battle wave
   */



  /**
   * Handle quiz answer
   */
  const handleQuizAnswer = useCallback(
    (isCorrect) => {
      if (quizData) {
        setGameState((prev) => ({
          ...prev,
          isShowingQuiz: false,
        }));

        quizData.resolve(isCorrect);
        setQuizData(null);
      }
    },
    [quizData]
  );



  /**
   * Handle reward selection
   */
  const selectReward = useCallback(
    (reward, rewardType = 'pokemon') => {
      if (rewardType === 'pokemon') {
        // Pokémon reward
        setGameState((prev) => {
          const updatedTeam = [...prev.playerTeam, reward];
          return {
            ...prev,
            playerTeam: updatedTeam,
            isShowingReward: false,
            rewardCandidates: [],
            rewardItems: [],
            rewardMode: 'pokemon',
          };
        });

        showMessageBox(`${reward.name} joined your team!`, 'success');
      } else if (rewardType === 'item') {
        // Item reward
        const item = ITEMS[reward];
        setGameState((prev) => {
          // Give item to first Pokémon in team
          const updatedTeam = [...prev.playerTeam];
          updatedTeam[0].heldItem = reward;
          return {
            ...prev,
            playerTeam: updatedTeam,
            isShowingReward: false,
            rewardCandidates: [],
            rewardItems: [],
            rewardMode: 'pokemon',
          };
        });

        showMessageBox(`${item.name} given to ${gameState.playerTeam[0].name}!\n${item.description}`, 'success');
      }

      // Start next wave
      setTimeout(() => {
        gameActions.current.startBattle();
      }, 1500);
    },
    [showMessageBox, startBattle, gameState.playerTeam]
  );
  useEffect(() => {
    gameActions.current = {
      endGame,
      startBattle,
      requestQuiz,
      handleBattleEnd,
      selectReward,
      initializeGame,
    };
  }, [endGame, startBattle, requestQuiz, handleBattleEnd, selectReward, initializeGame, isEvolving]);



/**
   * Initialize Phaser game on component mount
   */
  useEffect(() => {
    // Ensure we don't create a new game if one already exists.
    if (gameRef.current) {
      return;
    }

    const phaserConfig = {
      type: Phaser.AUTO,
      width: GAME_CONFIG.CANVAS_WIDTH,
      height: GAME_CONFIG.CANVAS_HEIGHT,
      scene: [], // <-- 1. START WITH AN EMPTY SCENE ARRAY
      parent: 'phaser-game-container',
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false },
      },
      backgroundColor: '#1a1a2e',
    };

    // Create the new game instance.
    const game = new Phaser.Game(phaserConfig);
    game.scene.add('BattleScene', BattleScene, false);
    
    gameRef.current = game;

    // The cleanup function.
    return () => {
      // Check if a game instance exists before trying to destroy it.
      if (gameRef.current) {
        // Destroy the game and all its systems.
        gameRef.current.destroy(true);
        // Immediately set the ref to null to prevent any lingering access.
        gameRef.current = null;
        console.log("Phaser game instance destroyed.");
      }
    };
  }, []); // The empty dependency array is correct.
  

  return (
    <div className="w-full h-full bg-gray-900">
      {!gameState.isRunning ? (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 text-center">
          <h1 className="text-5xl font-bold text-white mb-6">🎮 Flashcard Rogue</h1>
          <p className="text-xl text-gray-300 mb-8">
            Battle Pokémon through flashcard questions. Answer correctly to land powerful moves!
          </p>

          {parsedFlashcards.length === 0 ? (
            <p className="text-lg text-red-400 mb-6">
              ⚠️ No flashcards loaded. Add flashcards to StudyZone first!
            </p>
          ) : (
            <p className="text-lg text-green-400 mb-6">
              ✓ {parsedFlashcards.length} flashcards ready for battle!
            </p>
          )}

          <button
            onClick={initializeGame}
            disabled={parsedFlashcards.length === 0}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 text-white font-bold rounded-lg text-lg transition"
          >
            {parsedFlashcards.length === 0 ? 'Load Flashcards First' : 'Start Adventure!'}
          </button>

          <div className="mt-12 p-6 bg-gray-800 rounded-lg text-left max-w-2xl">
            <h2 className="text-2xl font-bold text-white mb-4">📖 How to Play:</h2>
            <ul className="text-gray-300 space-y-2">
              <li>✓ Defeat enemy Pokémon to progress through waves</li>
              <li>✓ Correctly answer flashcard questions to execute moves</li>
              <li>✓ Correct answers deal bonus damage (20% boost)</li>
              <li>✓ Wrong answers cause moves to fail</li>
              <li>✓ Every 5 waves, face a Gym Leader boss</li>
              <li>✓ Permadeath: Fainted Pokémon are gone for this run</li>
              <li>✓ Survive as many waves as possible!</li>
            </ul>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center">
          {/* Game Stats */}
          <div className="mb-6" style={{ width: '960px' }}>
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-4 border border-gray-700 shadow-lg">
              <div className="flex justify-between items-center text-white">
                <div className="flex space-x-8">
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Wave</div>
                    <div className="text-2xl font-bold text-indigo-400">{gameState.currentWave}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Score</div>
                    <div className="text-2xl font-bold text-green-400">{gameState.score}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-400">Team</div>
                    <div className="text-2xl font-bold text-blue-400">
                      {gameState.playerTeam.length}/{GAME_CONFIG.STARTING_TEAM_SIZE}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Enemies Defeated</div>
                  <div className="text-lg font-semibold">{gameState.defeatedEnemies.length}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Phaser Game Container */}
          <div
            id="phaser-game-container"
            className="border-4 border-indigo-500 rounded-lg overflow-hidden"
            style={{
              width: '960px',
              height: '540px',
              background: '#1a1a2e',
              boxShadow: '0 0 20px rgba(79, 70, 229, 0.3)',
            }}
          />

          {/* Evolution Modal */}
          {isEvolving && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-60">
              <div className="bg-gray-900 p-8 rounded-lg max-w-md w-full text-center border-4 border-yellow-500">
                <div className="animate-pulse">
                  <div className="text-6xl mb-4">✨</div>
                  <h2 className="text-2xl font-bold text-yellow-400 mb-4">EVOLUTION!</h2>
                  <p className="text-white text-lg mb-4">
                    {isEvolving.pokemon.name} is evolving...
                  </p>
                  <div className="flex justify-center space-x-2 mb-6">
                    <div className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
                    <div className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-4 h-4 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                </div>
                <div className="text-gray-400 text-sm">
                  This will only take a moment...
                </div>
              </div>
            </div>
          )}

          {/* Quiz Modal - Overlay on game */}
          {gameState.isShowingQuiz && quizData && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-8 rounded-lg max-w-lg w-full">
                <h2 className="text-2xl font-bold text-white mb-6">Answer the Question!</h2>
                <p className="text-xl text-white mb-8 p-4 bg-gray-700 rounded">
                  {quizData.card.front}
                </p>

                <p className="text-gray-400 mb-4">Choose the correct answer:</p>

                {/* Multiple choice options */}
                <div className="space-y-3">
                  {quizData.answerOptions.map((answer, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuizAnswer(answer === quizData.card.back)}
                      className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition transform hover:scale-105"
                    >
                      {answer}
                    </button>
                  ))}
                </div>

                <p className="text-sm text-gray-400 mt-6 text-center">
                  Answer correctly to use the move with 20% bonus damage!
                </p>
              </div>
            </div>
          )}

          {/* Reward Screen - Show after boss battles */}
          {gameState.isShowingReward && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-8 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-3xl font-bold text-white mb-2 text-center">🏆 Victory!</h2>
                <p className="text-lg text-gray-300 mb-6 text-center">
                  You defeated the Gym Leader! Choose your reward:
                </p>

                {/* Tab buttons */}
                <div className="flex gap-4 mb-6 justify-center">
                  <button
                    onClick={() => setGameState((prev) => ({ ...prev, rewardMode: 'pokemon' }))}
                    className={`px-6 py-2 font-bold rounded-lg transition ${
                      gameState.rewardMode === 'pokemon'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    🎮 Pokémon (Add to Team)
                  </button>
                  <button
                    onClick={() => setGameState((prev) => ({ ...prev, rewardMode: 'item' }))}
                    className={`px-6 py-2 font-bold rounded-lg transition ${
                      gameState.rewardMode === 'item'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    🎁 Item (Held Item)
                  </button>
                </div>

                {/* Pokémon Rewards */}
                {gameState.rewardMode === 'pokemon' && (
                  <div>
                    <p className="text-gray-400 text-sm mb-4 text-center">
                      Add a new Pokémon to your team! Max: {GAME_CONFIG.MAX_TEAM_SIZE} ({gameState.playerTeam.length} current)
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      {gameState.rewardCandidates.map((pokemon, index) => (
                        <button
                          key={index}
                          onClick={() => selectReward(pokemon, 'pokemon')}
                          disabled={gameState.playerTeam.length >= GAME_CONFIG.MAX_TEAM_SIZE}
                          className="p-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:opacity-50 text-white font-bold rounded-lg transition transform hover:scale-105"
                        >
                          <div className="text-4xl mb-2">
                            {pokemon.type.includes('fire') ? '🔥' : 
                             pokemon.type.includes('water') ? '💧' : 
                             pokemon.type.includes('grass') ? '🌿' : 
                             pokemon.type.includes('electric') ? '⚡' : '⚔️'}
                          </div>
                          <div className="text-sm font-bold">{pokemon.name}</div>
                          <div className="text-xs text-gray-300 mt-1">
                            Lv. {pokemon.level}
                          </div>
                          <div className="text-xs text-gray-300">
                            HP: {pokemon.maxHp} | ATK: {pokemon.stats.atk}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Item Rewards */}
                {gameState.rewardMode === 'item' && (
                  <div>
                    <p className="text-gray-400 text-sm mb-4 text-center">
                      Give a held item to {gameState.playerTeam[0]?.name || 'your Pokémon'}!
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      {gameState.rewardItems.map((itemId) => {
                        const item = ITEMS[itemId];
                        return (
                          <button
                            key={itemId}
                            onClick={() => selectReward(itemId, 'item')}
                            className="p-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition transform hover:scale-105"
                          >
                            <div className="text-4xl mb-2">{item.emoji}</div>
                            <div className="text-sm font-bold">{item.name}</div>
                            <div className="text-xs text-gray-300 mt-2">
                              {item.description}
                            </div>
                            <div className="text-xs text-purple-300 mt-2">
                              ({item.rarity})
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-6 text-center">
                  Tip: Items can give powerful passive bonuses! Pokémon expand your team.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlashcardRogue;