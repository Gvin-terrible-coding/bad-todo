import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { increment } from 'firebase/firestore';
import { showMessageBox } from '../utils/helpers';

const GameRenderer = React.memo(({ playerState, levelRef, cameraXRef, TILE_SIZE, PLAYER_WIDTH, PLAYER_HEIGHT }) => {
  cameraXRef.current = Math.max(0, playerState.current.x - GAME_WIDTH / 3);
  
  return (
    <>
      {/* Level Geometry */}
      {levelRef.current.platforms.map((p, i) => {
        let content;
        switch(p.type) {
          case 'crumble': content = <div className="w-full h-full bg-yellow-800 border-t-4 border-yellow-600 opacity-80" />; break;
          case 'jumpPad': content = <div className="w-full h-full bg-emerald-500 border-t-4 border-emerald-300" />; break;
          case 'spike': content = <div className="w-full h-full text-slate-500"><svg viewBox="0 0 40 40"><path d="M0 40 L20 0 L40 40 Z" fill="currentColor"/></svg></div>; break;
          default: content = <div className="w-full h-full bg-green-800 border-t-4 border-green-500" />;
        }
        return <div key={`p_${i}`} className="absolute" style={{ width: p.width, height: p.height, transform: `translate(${p.x - cameraXRef.current}px, ${p.y}px)` }}>{content}</div>
      })}
      
      {/* Enemies & Projectiles */}
      {levelRef.current.enemies.map((e) => {
        let enemySprite;
        switch(e.type) {
          case 'spiky': enemySprite = <svg viewBox="0 0 40 40"><circle cx="20" cy="25" r="15" fill="#f97316"/><path d="M5 25 L20 10 L35 25 Z" fill="#fdba74"/></svg>; break;
          case 'turret': enemySprite = <svg viewBox="0 0 40 40"><rect x="5" y="15" width="30" height="20" rx="5" fill="#475569"/><circle cx="20" cy="15" r="10" fill="#ef4444"/></svg>; break;
          default: enemySprite = <svg viewBox="0 0 40 40"><rect x="5" y="5" width="30" height="30" rx="5" fill="#7e22ce"/><rect x="12" y="15" width="5" height="10" fill="white"/><rect x="23" y="15" width="5" height="10" fill="white"/></svg>;
        }
        return <div key={e.id} className="absolute" style={{ width: TILE_SIZE, height: TILE_SIZE, transform: `translate(${e.x - cameraXRef.current}px, ${e.y}px)`}}>{enemySprite}</div>
      })}
      {levelRef.current.projectiles.map(p => <div key={p.id} className="absolute bg-red-500 rounded-full" style={{ width: 10, height: 10, transform: `translate(${p.x - cameraXRef.current}px, ${p.y}px)` }} />)}

      {/* Collectibles */}
      {levelRef.current.coins.map((c) => <div key={c.id} className="absolute animate-pulse" style={{ width: TILE_SIZE/2, height: TILE_SIZE/2, transform: `translate(${c.x - cameraXRef.current}px, ${c.y}px)`}}><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#facc15"/><circle cx="10" cy="10" r="7" fill="#fde047"/><text x="50%" y="50%" dy=".3em" textAnchor="middle" fill="#ca8a04" fontSize="12" fontWeight="bold">$</text></svg></div>)}
      
      {/* Goal */}
      {levelRef.current.flagpole && <div className="absolute bg-gray-500" style={{ width: levelRef.current.flagpole.width, height: levelRef.current.flagpole.height, transform: `translate(${levelRef.current.flagpole.x - cameraXRef.current}px, ${levelRef.current.flagpole.y}px)` }}/>}
      
      {/* Player */}
      <div className={`absolute transition-opacity duration-200 ${playerState.current.invincible > 0 && Math.floor(playerState.current.invincible / 5) % 2 === 0 ? 'opacity-50' : 'opacity-100'}`} style={{ width: PLAYER_WIDTH, height: PLAYER_HEIGHT, transform: `translate(${playerState.current.x - cameraXRef.current}px, ${playerState.current.y}px) scaleY(${playerState.current.scaleY})`, transition: 'transform 0.1s' }}>
         <svg viewBox="0 0 28 38" className="w-full h-full">
           <rect x="4" y="0" width="20" height="20" rx="10" fill="#fde047"/>
           <rect x="0" y="18" width="28" height="20" rx="5" fill="#be123c"/>
           <circle cx="10" cy="10" r="3" fill="white"/><circle cx="19" cy="10" r="3" fill="white"/>
           <circle cx="10" cy="10" r="1" fill="black"/><circle cx="19" cy="10" r="1" fill="black"/>
         </svg>
      </div>
    </>
  );
});

const PlatformerGame = ({ stats, studyZoneState, updateStudyZoneState, updateStatsInFirestore, showMessageBox, processAchievement, isMobile }) => {


  // --- State Management ---
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isXpMode, setIsXpMode] = useState(false);
  const [uiGameState, setUiGameState] = useState('menu');
  const [tick, setTick] = useState(0);
  
  // --- Refs for Game Loop ---
  const gameStateRef = useRef('menu');
  const lastTimeRef = useRef(0);
  const levelRef = useRef({ platforms: [], enemies: [], coins: [], flagpole: null, projectiles: [] });
  const keysRef = useRef({});
  const cameraXRef = useRef(0);
  const playerState = useRef({
    x: 100, y: GAME_HEIGHT - TILE_SIZE - PLAYER_HEIGHT,
    vx: 0, vy: 0, onGround: false, canDoubleJump: true,
    coyoteTime: 0, jumpBuffer: 0, scaleY: 1, invincible: 0,
  });

  const setGameState = (newState) => {
    gameStateRef.current = newState;
    setUiGameState(newState);
  };

  const parsedFlashcards = useMemo(() => {
    // NEW: Aggregate cards from all decks in the new data structure
    if (!studyZoneState.cardData) return [];
    return Object.values(studyZoneState.cardData).flat();
  }, [studyZoneState.cardData]);


  const handleButtonPress = (key, isDown) => { keysRef.current[key] = isDown; };

  const generateLevel = useCallback((currentLevel) => {
    const levelData = { platforms: [], enemies: [], coins: [], flagpole: null, projectiles: [] };
    const levelLength = 150 + currentLevel * 10;
    let currentX = 0;
    let lastPlatformY = GAME_HEIGHT - TILE_SIZE;

    for (let i = 0; i < 10; i++) levelData.platforms.push({ x: i * TILE_SIZE, y: GAME_HEIGHT - TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'normal' });
    currentX = 10;

    while (currentX < levelLength - 15) {
      const choice = Math.random();
      if (choice < 0.7) { // Standard platform
        const gap = Math.floor(Math.random() * 3) + 1;
        currentX += gap;
        if (gap > 1) levelData.platforms.push({x: (currentX-1)*TILE_SIZE, y: GAME_HEIGHT-TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'spike'});

        const width = Math.floor(Math.random() * 5) + 3;
        const heightChange = (Math.floor(Math.random() * 5) - 2) * TILE_SIZE;
        lastPlatformY = Math.max(GAME_HEIGHT - TILE_SIZE * 5, Math.min(GAME_HEIGHT - TILE_SIZE, lastPlatformY + heightChange));

        for (let i = 0; i < width; i++) {
          const platX = (currentX + i) * TILE_SIZE;
          const type = Math.random() < 0.15 ? 'crumble' : 'normal';
          levelData.platforms.push({ x: platX, y: lastPlatformY, width: TILE_SIZE, height: TILE_SIZE, type });
          if (i > 0 && i < width - 1 && Math.random() < 0.5) {
            levelData.coins.push({ id: `c_${currentX+i}`, x: platX + (TILE_SIZE/4), y: lastPlatformY - TILE_SIZE*2 });
          }
        }

        if (width > 3) {
          const enemyTypeRoll = Math.random();
          if (enemyTypeRoll < 0.3) levelData.enemies.push({ id: `e_${currentX}`, x: (currentX + 1) * TILE_SIZE, y: lastPlatformY - TILE_SIZE, dir: -1, type: 'patrol', startX: (currentX+1)*TILE_SIZE, patrol: (width-2)*TILE_SIZE });
          else if (enemyTypeRoll < 0.5) levelData.enemies.push({ id: `e_${currentX}`, x: (currentX + 1) * TILE_SIZE, y: lastPlatformY - TILE_SIZE, dir: -1, type: 'spiky', startX: (currentX+1)*TILE_SIZE, patrol: (width-2)*TILE_SIZE });
          else if (enemyTypeRoll < 0.6) levelData.enemies.push({ id: `e_${currentX}`, x: (currentX + 1) * TILE_SIZE, y: lastPlatformY - TILE_SIZE, type: 'turret', fireCooldown: TURRET_FIRE_RATE });
        }
        currentX += width;
      } else { // Jump Pad challenge
        const gap = 5;
        currentX += gap;
        levelData.platforms.push({ x: (currentX - gap) * TILE_SIZE, y: GAME_HEIGHT - TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'jumpPad'});
        const width = 3;
        lastPlatformY = Math.max(GAME_HEIGHT - TILE_SIZE * 6, lastPlatformY - TILE_SIZE*3);
        for (let i = 0; i < width; i++) {
            levelData.platforms.push({ x: (currentX + i) * TILE_SIZE, y: lastPlatformY, width: TILE_SIZE, height: TILE_SIZE, type: 'normal' });
            levelData.coins.push({ id: `c_${currentX+i}`, x: (currentX + i) * TILE_SIZE + (TILE_SIZE/4), y: lastPlatformY - TILE_SIZE });
        }
        currentX += width;
      }
    }
    
    for (let i = 0; i < 15; i++) levelData.platforms.push({ x: (currentX + i) * TILE_SIZE, y: GAME_HEIGHT - TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'normal' });
    levelData.flagpole = { x: (currentX + 5) * TILE_SIZE, y: GAME_HEIGHT - TILE_SIZE * 5, width: 20, height: TILE_SIZE * 4 };
    
    levelRef.current = levelData;
  }, []);
  
  const resetPlayerState = useCallback((currentScore) => {
    playerState.current = {
      x: 100, y: GAME_HEIGHT - TILE_SIZE - PLAYER_HEIGHT,
      vx: 0, vy: 0, onGround: false, canDoubleJump: true,
      coyoteTime: 0, jumpBuffer: 0, scaleY: 1, invincible: 0,
    };
    cameraXRef.current = 0;
    setScore(currentScore);
  }, []);
  
  const commonStartLogic = useCallback((keepScore = false) => {
    const currentScore = keepScore ? score : 0;
    setLevel(1);
    resetPlayerState(currentScore);
    generateLevel(1);
    setGameState('playing');
  }, [score, resetPlayerState, generateLevel]);

  const nextLevel = useCallback(() => {
    setLevel(l => l + 1);
    resetPlayerState(score);
    generateLevel(level + 1);
    setGameState('playing');
  }, [level, score, generateLevel, resetPlayerState]);

  const startGameWithFlashcards = useCallback(() => { setIsXpMode(false); commonStartLogic(); }, [commonStartLogic]);
  const startXpLevel = useCallback(() => {
    if (stats?.totalXP < 100) { showMessageBox("You need 100 XP to play a single level.", "error"); return; }
    updateStatsInFirestore({ totalXP: stats.totalXP - 100 });
    setIsXpMode(true);
    commonStartLogic();
  }, [stats?.totalXP, commonStartLogic, updateStatsInFirestore]);

  useEffect(() => {
    // If the game is not in the 'playing' state, ensure the timer ref is reset and do nothing.
    if (uiGameState !== 'playing') {
      lastTimeRef.current = 0;
      return;
    }

    let animationFrameId;

    const gameLoop = (timestamp) => {
      // Initialize lastTime on the first frame to prevent a huge initial deltaTime
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }

      let deltaTime = (timestamp - lastTimeRef.current) / (1000 / 60);
      lastTimeRef.current = timestamp;

      // Clamp deltaTime to a max value to prevent physics bugs if the tab is inactive for a long time
      const clampedDeltaTime = Math.min(deltaTime, 3);

      if (gameStateRef.current === 'playing') {
        const p = playerState.current;
        p.onGround = false;
        if (p.invincible > 0) p.invincible -= clampedDeltaTime;

        // --- Input & Movement ---
        let targetVx = 0;
        if (keysRef.current['ArrowLeft'] || keysRef.current['a']) targetVx = -PLAYER_SPEED;
        if (keysRef.current['ArrowRight'] || keysRef.current['d']) targetVx = PLAYER_SPEED;
        p.x += targetVx * clampedDeltaTime;
        
        p.jumpBuffer = (keysRef.current['ArrowUp'] || keysRef.current['w'] || keysRef.current[' ']) ? 10 : p.jumpBuffer - 1;
        p.coyoteTime = p.coyoteTime - 1;
        
        if (p.jumpBuffer > 0) {
          if (p.coyoteTime > 0) {
            p.vy = JUMP_FORCE; p.jumpBuffer = 0; p.coyoteTime = 0; p.scaleY = 1.3;
          } else if (p.canDoubleJump) {
            p.vy = DOUBLE_JUMP_FORCE; p.canDoubleJump = false; p.jumpBuffer = 0; p.scaleY = 1.3;
          }
        }
        
        p.vy += GRAVITY * clampedDeltaTime;
        p.y += p.vy * clampedDeltaTime;
        p.scaleY += (1 - p.scaleY) * 0.1;

        // --- Collision Detection & Resolution ---
        const playerRect = { x: p.x, y: p.y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
        levelRef.current.platforms.forEach(platform => {
          if (playerRect.x < platform.x + platform.width && playerRect.x + playerRect.width > platform.x &&
              playerRect.y < platform.y + platform.height && playerRect.y + playerRect.height > platform.y) {
            if (platform.type === 'spike' && p.invincible <= 0) { setGameState('gameover'); return; }
            if (platform.type === 'jumpPad') { p.vy = JUMP_PAD_BOOST; p.canDoubleJump = true; return; }

            if (p.vy >= 0 && playerRect.y + playerRect.height - platform.y < p.vy * clampedDeltaTime + 5) {
              p.y = platform.y - playerRect.height;
              p.vy = 0;
              p.onGround = true;
              p.coyoteTime = 8;
              p.canDoubleJump = true;
              p.scaleY = 0.8;
              if (platform.type === 'crumble' && !platform.crumbling) platform.crumbling = 30;
            }
          }
        });

        levelRef.current.platforms = levelRef.current.platforms.filter(platform => {
          if (platform.crumbling > 0) platform.crumbling -= clampedDeltaTime;
          return platform.crumbling === undefined || platform.crumbling > 0;
        });

        // --- Enemy & Coin Logic ---
        levelRef.current.enemies.forEach(enemy => {
          if (enemy.type === 'patrol' || enemy.type === 'spiky') {
            enemy.x += enemy.dir * ENEMY_SPEED * clampedDeltaTime;
            if (enemy.x < enemy.startX || enemy.x > enemy.startX + enemy.patrol) enemy.dir *= -1;
          }
          if (enemy.type === 'turret') {
            enemy.fireCooldown -= clampedDeltaTime;
            if (enemy.fireCooldown <= 0) {
              levelRef.current.projectiles.push({id: `proj_${Date.now()}`, x: enemy.x, y: enemy.y, vx: -3});
              enemy.fireCooldown = TURRET_FIRE_RATE;
            }
          }
          const enemyRect = { x: enemy.x, y: enemy.y, width: TILE_SIZE, height: TILE_SIZE };
          if (p.x < enemyRect.x + enemyRect.width && p.x + PLAYER_WIDTH > enemyRect.x &&
              p.y < enemyRect.y + enemyRect.height && p.y + PLAYER_HEIGHT > enemyRect.y) {
            if (enemy.type !== 'spiky' && p.vy > 0 && (p.y + PLAYER_HEIGHT) - enemyRect.y < 20) {
              p.vy = JUMP_FORCE / 1.5; setScore(s => s + 50);
              levelRef.current.enemies = levelRef.current.enemies.filter(e => e.id !== enemy.id);
            } else if (p.invincible <= 0) {
              p.invincible = 120; // 2 seconds of invincibility
              setGameState('gameover'); // For now, any hit is game over
            }
          }
        });

        levelRef.current.projectiles = levelRef.current.projectiles.filter(proj => {
            proj.x += proj.vx * clampedDeltaTime;
            const projRect = {x: proj.x, y: proj.y, width: 10, height: 10};
            if (p.x < projRect.x + projRect.width && p.x + PLAYER_WIDTH > projRect.x &&
                p.y < projRect.y + projRect.height && p.y + PLAYER_HEIGHT > projRect.y) {
                 if (p.invincible <= 0) setGameState('gameover');
                 return false;
            }
            return proj.x > cameraXRef.current - 20;
        });

        levelRef.current.coins = levelRef.current.coins.filter(coin => {
          if (p.x < coin.x + (TILE_SIZE/2) && p.x + PLAYER_WIDTH > coin.x &&
              p.y < coin.y + (TILE_SIZE/2) && p.y + PLAYER_HEIGHT > coin.y) {
            setScore(s => s + 10); return false;
          }
          return true;
        });
        
        if (p.y > GAME_HEIGHT + 100) setGameState('gameover');
        const flagpole = levelRef.current.flagpole;
        if (flagpole && playerRect.x < flagpole.x + flagpole.width && playerRect.x + playerRect.width > flagpole.x) {
            if (isXpMode) setGameState('levelwon'); else nextLevel();
        }
        setTick(t => t + 1);
      }
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    animationFrameId = requestAnimationFrame(gameLoop);

    const handleKey = e => { keysRef.current[e.key] = e.type === 'keydown'; };
    window.addEventListener('keydown', handleKey); window.addEventListener('keyup', handleKey);
    return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleKey); };
  }, [uiGameState, isXpMode, nextLevel]);

  useEffect(() => {
    if (uiGameState === 'playing' && parsedFlashcards.length >= 5 && !isXpMode) {
      const timer = setTimeout(() => {
        const checkGroundAndShowQuiz = () => {
          // Ensure the game is still active before showing the quiz
          if (gameStateRef.current === 'playing' && playerState.current.onGround) {
            setGameState('quiz');
          } else if (gameStateRef.current === 'playing') {
            // If airborne, wait a moment and check again
            setTimeout(checkGroundAndShowQuiz, 100);
          }
        };
        checkGroundAndShowQuiz();
      }, 5000 + Math.random() * 5000); // Quiz appears after 5-10 seconds
      return () => clearTimeout(timer);
    }
    // FIX: Removed `score` from dependencies to prevent the timer from resetting every time the score changes.
    // Also using parsedFlashcards.length to avoid re-renders from the array object itself changing.
  }, [uiGameState, parsedFlashcards.length, isXpMode]);
  
  const handleQuizComplete = useCallback(() => {
    setGameState('playing');
  }, []);

  useEffect(() => {
    // FIX: Only run this logic when the game state is explicitly 'gameover' or 'levelwon'.
    // This prevents the check from running prematurely when the game starts.
    if (uiGameState === 'gameover') {
      if (!isXpMode) {
        if (score > studyZoneState.platformerHighScore) {
          updateStudyZoneState({ platformerHighScore: score });
          showMessageBox(`Game Over! New high score: ${score}`, 'info');
          processAchievement('highScore', score);
          
          // NEW: Loot Drop for high score
          if (score > 1000) { // Require a score of at least 1000 for the rare drop
             const key = 'alchemy_state.inventory.stardust_phial';
             updateStatsInFirestore({ [key]: increment(1) });
             showMessageBox('Your skill has attracted a Stardust Phial!', 'info');
          }

        } else {
          showMessageBox(`Game Over! Your score: ${score}`, 'error');
        }
      }
    } else if (uiGameState === 'levelwon' && isXpMode) {
      updateStatsInFirestore({ totalXP: (stats?.totalXP || 0) + 250 });
      showMessageBox(`Level Complete! You earned 250 XP!`, 'info');
    }
  }, [uiGameState, score, isXpMode, showMessageBox, stats?.totalXP, studyZoneState.platformerHighScore, updateStatsInFirestore, updateStudyZoneState, processAchievement]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-8 mb-4 text-white text-xl font-bold">
        <span>Score: {score}</span>
        <span>High Score: {studyZoneState.platformerHighScore}</span>
        <span>Level: {level}</span>
      </div>
      <div className="relative w-[800px] h-[400px] bg-blue-300 overflow-hidden border-4 border-slate-900 rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-sky-600"></div>
        {/* New Farthest Background Layer */}
        <div className="absolute bottom-0 left-0 w-[2400px] h-64 bg-no-repeat bg-bottom" style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 180"><path d="M0 180 L0 120 C 120 150, 250 100, 400 110 C 550 120, 680 90, 800 100 L800 180 Z" fill="%2314532d" opacity="0.6"/></svg>')`, transform: `translateX(${-cameraXRef.current * 0.2}px)` }}></div>
        <div className="absolute bottom-0 left-0 w-[2400px] h-48 bg-no-repeat bg-bottom" style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 150"><path d="M0 150 L0 100 C 100 50, 200 120, 300 100 C 400 80, 500 140, 600 120 C 700 100, 800 130, 800 130 L800 150 Z" fill="%23166534"/></svg>')`, transform: `translateX(${-cameraXRef.current * 0.5}px)` }}></div>
        <div className="absolute bottom-0 left-0 w-[2400px] h-32 bg-no-repeat bg-bottom" style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 120"><path d="M0 120 L0 90 C 150 110, 250 60, 400 80 C 550 100, 650 70, 800 90 L800 120 Z" fill="%2315803d"/></svg>')`, transform: `translateX(${-cameraXRef.current * 0.8}px)` }}></div>

        {uiGameState === 'menu' && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10 space-y-4 text-center p-4">
            <h3 className="text-4xl text-white font-bold mb-2 drop-shadow-lg">Platformer Challenge</h3>
            {parsedFlashcards.length >= 5 ? (
              <button onClick={startGameWithFlashcards} className="px-8 py-4 bg-green-500 text-white font-bold rounded-lg text-2xl hover:bg-green-600 shadow-xl">Start Full Game</button>
            ) : (
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <p className="text-slate-300">Add at least 5 flashcards in the other tab to play the full game.</p>
                <button onClick={startXpLevel} className="mt-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg text-xl hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed" disabled={(stats?.totalXP || 0) < 100}>
                  Play for XP (Costs 100)
                </button>
              </div>
            )}
          </div>
        )}
        {(uiGameState === 'gameover' || uiGameState === 'levelwon') && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10">
            <h3 className={`text-4xl font-bold mb-4 drop-shadow-lg ${uiGameState === 'levelwon' ? 'text-green-400' : 'text-red-500'}`}>
              {uiGameState === 'levelwon' ? 'Level Complete!' : 'Game Over!'}
            </h3>
            <button onClick={() => setGameState('menu')} className="px-8 py-4 bg-blue-500 text-white font-bold rounded-lg text-2xl hover:bg-blue-600 shadow-xl">Main Menu</button>
          </div>
        )}
        {uiGameState === 'quiz' && <PlatformerQuizModal cards={parsedFlashcards} onComplete={handleQuizComplete} />}
        
        {uiGameState === 'playing' && (
          <GameRenderer 
            playerState={playerState}
            levelRef={levelRef}
            cameraXRef={cameraXRef}
            TILE_SIZE={TILE_SIZE}
            PLAYER_WIDTH={PLAYER_WIDTH}
            PLAYER_HEIGHT={PLAYER_HEIGHT}
          />
        )}
      </div>
      <p className="text-slate-500 mt-2 text-sm hidden md:block">Controls: Arrow keys or A/D to move, Arrow Up, W, or Space to jump/double-jump.</p>
      
      {isMobile && (
        <div className="fixed bottom-4 left-4 right-4 flex justify-between items-center z-20">
          <div className="flex gap-3">
            <button
              onTouchStart={() => handleButtonPress('ArrowLeft', true)}
              onTouchEnd={() => handleButtonPress('ArrowLeft', false)}
              onMouseDown={() => handleButtonPress('ArrowLeft', true)}
              onMouseUp={() => handleButtonPress('ArrowLeft', false)}
              className="w-16 h-16 bg-slate-800/50 text-white text-3xl rounded-full active:bg-indigo-600"
            >
              ←
            </button>
            <button
              onTouchStart={() => handleButtonPress('ArrowRight', true)}
              onTouchEnd={() => handleButtonPress('ArrowRight', false)}
              onMouseDown={() => handleButtonPress('ArrowRight', true)}
              onMouseUp={() => handleButtonPress('ArrowRight', false)}
              className="w-16 h-16 bg-slate-800/50 text-white text-3xl rounded-full active:bg-indigo-600"
            >
              →
            </button>
          </div>
          <button
            onTouchStart={() => handleButtonPress(' ', true)}
            onTouchEnd={() => handleButtonPress(' ', false)}
            onMouseDown={() => handleButtonPress(' ', true)}
            onMouseUp={() => handleButtonPress(' ', false)}
            className="w-20 h-20 bg-slate-800/50 text-white text-4xl rounded-full active:bg-indigo-600"
          >
            ↑
          </button>
        </div>
      )}
    </div>
  );
};

const PlatformerQuizModal = ({ cards, onComplete }) => {
  const [streak, setStreak] = useState(0);
  const [currentCard, setCurrentCard] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(''); // 'correct', 'incorrect', ''

  const getRandomCard = useCallback(() => {
    // The parent component (`PlatformerGame`) is responsible for ensuring cards exist.
    // This function will now only act if it has valid cards, preventing an immediate exit.
    if (cards && cards.length > 0) {
      setCurrentCard(cards[Math.floor(Math.random() * cards.length)]);
    }
    // We REMOVE the `else { onComplete() }` block that was causing the modal to close instantly.
  }, [cards]); // onComplete is no longer a dependency here.

  useEffect(() => {
    // This effect runs on mount and whenever the `cards` prop changes.
    getRandomCard();
  }, [getRandomCard]); // getRandomCard is now stable unless `cards` changes.

  useEffect(() => {
    if (streak >= 3) {
      onComplete();
    }
  }, [streak, onComplete]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Guard against submission when there's no card
    if (!currentCard || feedback) return;

    if (userAnswer.toLowerCase().trim() === currentCard.back.toLowerCase().trim()) {
      setFeedback('correct');
      setStreak(s => s + 1);
    } else {
      setFeedback('incorrect');
      setStreak(0);
    }
    setTimeout(() => {
      setFeedback('');
      setUserAnswer('');
      getRandomCard();
    }, 1500);
  };
  
  // No longer returning null here. The JSX will handle the loading state.

  return (
    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 text-white p-8">
      <h3 className="text-3xl font-bold mb-4">Flashcard Quiz!</h3>
      <p className="mb-4">Get 3 correct in a row to continue.</p>
      <p className="text-2xl font-bold text-green-400 mb-6">Streak: {streak} / 3</p>

      <div className={`p-8 rounded-lg w-full max-w-lg text-center transition-colors ${feedback === 'correct' ? 'bg-green-800' : feedback === 'incorrect' ? 'bg-red-800' : 'bg-slate-700'}`}>
        <p className="text-slate-400 mb-2">FRONT</p>
        <p className="text-3xl text-center font-bold text-white h-10">{currentCard ? currentCard.front : "..."}</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-md text-center text-xl"
            placeholder="Type the back of the card..."
            disabled={feedback !== '' || !currentCard}
          />
        </form>
        {feedback === 'incorrect' && <p className="mt-4 text-lg">Correct answer: <span className="font-bold">{currentCard?.back}</span></p>}
      </div>
    </div>
  );
};


export { PlatformerGame, PlatformerQuizModal, GameRenderer };
