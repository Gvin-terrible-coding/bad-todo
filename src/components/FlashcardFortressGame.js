import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { increment } from 'firebase/firestore';
import { fortressUpgradeDefinitions, survivorEnemyDefinitions, survivorTowerDefinitions, fortressBossDefinitions, survivorBuffDefinitions } from '../constants/constants';
import { showMessageBox } from '../utils/helpers';

const FlashcardFortressQuizModal = ({ card, allCards, onAnswer, onClose }) => {
  const [options, setOptions] = useState([]);

  useEffect(() => {
    if (card && allCards.length > 0) {
      const correctOption = card.back;
      let wrongOptions = allCards
        .filter(c => c.id !== card.id) // Ensure we don't pick the same card
        .map(c => c.back);
      
      // Shuffle wrong options to get a random set
      for (let i = wrongOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wrongOptions[i], wrongOptions[j]] = [wrongOptions[j], wrongOptions[i]];
      }
      // Get 2 unique wrong answers
      wrongOptions = [...new Set(wrongOptions)].slice(0, 2);

      const finalOptions = [correctOption, ...wrongOptions];
      
      // Shuffle the final options so the correct answer isn't always first
      for (let i = finalOptions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [finalOptions[i], finalOptions[j]] = [finalOptions[j], finalOptions[i]];
      }
      setOptions(finalOptions);
    }
  }, [card, allCards]);

  if (!card) return null;

  return (
    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-30 p-4">
      <div className="bg-slate-800 border-2 border-slate-700 p-8 rounded-lg w-full max-w-2xl text-center">
        <p className="text-slate-400">TERM:</p>
        <h3 className="text-3xl font-bold text-white mb-6">{card.front}</h3>
        <div className="grid grid-cols-1 gap-4">
          {options.map((option, i) => (
            <button key={i} onClick={() => onAnswer(option === card.back)} className="w-full text-lg p-4 bg-slate-700 hover:bg-indigo-600 rounded-md transition-colors">
              {option}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="mt-6 text-sm text-slate-500 hover:text-white">Cancel Attack</button>
      </div>
    </div>
  );
};

const FlashcardFortressLevelUpModal = ({ onSelectUpgrade, upgrades }) => {
  if (!upgrades || upgrades.length === 0) return null;
// --- NEW: Definition Descent Game Component ---
const DefinitionDescent = ({ flashcards, showMessageBox }) => {
  const GAME_WIDTH = 600;
  const GAME_HEIGHT = 800;
  const GRAVITY = 0.3;
  const JUMP_BOOST = -12;
  const WEAK_JUMP_BOOST = -4;
  const PLAYER_WIDTH = 40;
  const PLAYER_HEIGHT = 40;
  const PLATFORM_WIDTH = 120;
  const PLATFORM_HEIGHT = 20;

  const gameAreaRef = useRef(null);
  const gameLoopRef = useRef(null);
  const lastTimeRef = useRef(0);
  const keysRef = useRef({});
  const mouseXRef = useRef(GAME_WIDTH / 2);
  const isMouseDownRef = useRef(false);

  const [uiState, setUiState] = useState({
    mode: 'menu',
    score: 0,
    prompt: '',
    highScore: 0 // Will load from stats later
  });

  const playerRef = useRef({ x: GAME_WIDTH / 2, y: GAME_HEIGHT - 100, vx: 0, vy: 0 });
  const platformsRef = useRef([]);
  const cameraYRef = useRef(0);
  const scoreRef = useRef(0);

  const generateNewProblem = useCallback(() => {
    if (flashcards.length < 3) return null;
    let available = [...flashcards];
    const correctIndex = Math.floor(Math.random() * available.length);
    const correctCard = available.splice(correctIndex, 1)[0];

    let distractors = [];
    for (let i = 0; i < 2; i++) {
      if (available.length === 0) break;
      const distractorIndex = Math.floor(Math.random() * available.length);
      distractors.push(available.splice(distractorIndex, 1)[0]);
    }
    
    // Return the full problem object instead of setting state here
    return {
      prompt: correctCard.back,
      correctAnswer: correctCard.front,
      distractors: distractors.map(d => d.front)
    };
  }, [flashcards]);

  const generatePlatforms = useCallback((baseY, problem) => {
    let newPlatforms = [];
    let answers = [{ text: problem.correct, isCorrect: true }, ...problem.distractors.map(d => ({ text: d, isCorrect: false }))];
    
    // Shuffle answers
    for (let i = answers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [answers[i], answers[j]] = [answers[j], answers[i]];
    }

    const verticalJumpDistance = Math.random() * 60 + 90; // 90 to 150px range
    const setBaseY = baseY - verticalJumpDistance;

    answers.forEach((ans, i) => {
      newPlatforms.push({
        id: `plat_${Date.now()}_${i}`,
        x: (i * (GAME_WIDTH / 3)) + (GAME_WIDTH / 6) - (PLATFORM_WIDTH / 2) + (Math.random() * 40 - 20),
        y: setBaseY - (Math.random() * 30),
        width: PLATFORM_WIDTH,
        height: PLATFORM_HEIGHT,
        text: ans.text,
        isCorrect: ans.isCorrect,
        isCrumbling: false,
      });
    });

    platformsRef.current.push(...newPlatforms);
  }, []);

  const resetGame = useCallback(() => {
    playerRef.current = { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50, vx: 0, vy: -10 };
    scoreRef.current = 0;
    cameraYRef.current = 0;
    
    platformsRef.current = [{
      id: 'start', x: GAME_WIDTH / 2 - PLATFORM_WIDTH / 2, y: GAME_HEIGHT - 30,
      width: PLATFORM_WIDTH, height: PLATFORM_HEIGHT, text: 'Start', isCorrect: true,
    }];
    
    const problem = generateNewProblem();
    let initialPrompt = '';
    if (problem) {
      generatePlatforms(GAME_HEIGHT - 200, { correct: problem.correctAnswer, distractors: problem.distractors });
      initialPrompt = problem.prompt;
    }

    setUiState(s => ({ ...s, mode: 'playing', score: 0, prompt: initialPrompt }));
  }, [generateNewProblem, generatePlatforms]);

  useEffect(() => {
    const handleKey = e => { keysRef.current[e.key.toLowerCase()] = e.type === 'keydown'; };
    const gameArea = gameAreaRef.current;

    const updateMouseX = (clientX) => {
        if (gameArea) {
            mouseXRef.current = clientX - gameArea.getBoundingClientRect().left;
        }
    };

    const handleMouseMove = e => updateMouseX(e.clientX);
    const handleTouchMove = e => {
      e.preventDefault(); // Prevent scrolling on mobile
      updateMouseX(e.touches[0].clientX);
    };
    
    const handleMouseDown = e => { isMouseDownRef.current = true; };
    const handleMouseUp = e => { isMouseDownRef.current = false; };
    const handleTouchStart = e => { 
      e.preventDefault(); // Prevent click events from firing too
      isMouseDownRef.current = true; 
    };
    const handleTouchEnd = e => { isMouseDownRef.current = false; };

    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);

    if (gameArea) {
        gameArea.addEventListener('mousemove', handleMouseMove);
        gameArea.addEventListener('touchmove', handleTouchMove, { passive: false });
        gameArea.addEventListener('mousedown', handleMouseDown);
        gameArea.addEventListener('mouseup', handleMouseUp);
        gameArea.addEventListener('touchstart', handleTouchStart, { passive: false });
        gameArea.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
        window.removeEventListener('keydown', handleKey);
        window.removeEventListener('keyup', handleKey);
        if (gameArea) {
            gameArea.removeEventListener('mousemove', handleMouseMove);
            gameArea.removeEventListener('touchmove', handleTouchMove);
            gameArea.removeEventListener('mousedown', handleMouseDown);
            gameArea.removeEventListener('mouseup', handleMouseUp);
            gameArea.removeEventListener('touchstart', handleTouchStart);
            gameArea.removeEventListener('touchend', handleTouchEnd);
        }
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);

useEffect(() => {
    if (uiState.mode !== 'playing') {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      lastTimeRef.current = 0;
      return;
    }

    const gameLoop = (timestamp) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      let dt = (timestamp - lastTimeRef.current) / 16.67; // Normalize to 60 FPS
      lastTimeRef.current = timestamp;
      if (dt > 3) dt = 1;

      let promptToSet = null; // Variable to hold a potential prompt update

      // Player Movement
      let targetX = playerRef.current.x;
      const isKeyboardMoving = keysRef.current['a'] || keysRef.current['arrowleft'] || keysRef.current['d'] || keysRef.current['arrowright'];

      if (isKeyboardMoving) {
        if (keysRef.current['a'] || keysRef.current['arrowleft']) targetX -= 6 * dt;
        if (keysRef.current['d'] || keysRef.current['arrowright']) targetX += 6 * dt;
      } else if (isMouseDownRef.current) { // Only steer with mouse if held down and no keys are pressed
        targetX = mouseXRef.current;
      }
      
      playerRef.current.x += (targetX - playerRef.current.x) * 0.5;
      if (playerRef.current.x > GAME_WIDTH) playerRef.current.x = 0;
      if (playerRef.current.x < 0) playerRef.current.x = GAME_WIDTH;

      // Player Physics
      playerRef.current.vy += GRAVITY * dt;
      playerRef.current.y += playerRef.current.vy * dt;
      
      // Collision
      if (playerRef.current.vy > 0) {
        platformsRef.current.forEach(p => {
          if (!p.isCrumbling &&
              playerRef.current.x > p.x && playerRef.current.x < p.x + p.width &&
              playerRef.current.y + PLAYER_HEIGHT > p.y && playerRef.current.y + PLAYER_HEIGHT < p.y + p.height + 10) {

            if (p.isCorrect) {
              playerRef.current.vy = JUMP_BOOST;
              const problem = generateNewProblem();
              if (problem) {
                generatePlatforms(p.y, { correct: problem.correctAnswer, distractors: problem.distractors });
                promptToSet = problem.prompt; // Store the new prompt to be updated
              }
            } else {
              playerRef.current.vy = WEAK_JUMP_BOOST;
              p.isCrumbling = true;
              p.crumbleTimer = 500;
            }
          }
        });
      }
      
      // Update crumbling platforms
      platformsRef.current.forEach(p => {
        if(p.isCrumbling) {
          p.crumbleTimer -= dt * 16.67;
          if(p.crumbleTimer <= 0) p.y += 10 * dt; // Make it fall
        }
      });

      // Update camera and score
      if (playerRef.current.y < cameraYRef.current + GAME_HEIGHT / 2) {
        cameraYRef.current = playerRef.current.y - GAME_HEIGHT / 2;
      }
      scoreRef.current = Math.max(scoreRef.current, -Math.floor(cameraYRef.current / 10));

      // Remove off-screen platforms
      platformsRef.current = platformsRef.current.filter(p => p.y < cameraYRef.current + GAME_HEIGHT + 50);

      // Game Over
      if (playerRef.current.y > cameraYRef.current + GAME_HEIGHT) {
        setUiState(s => ({...s, mode: 'gameover'}));
      }
      
      // Force a re-render to update the screen
      if(gameAreaRef.current) {
        gameAreaRef.current.style.transform = `translateY(${-cameraYRef.current}px)`;
        const playerEl = gameAreaRef.current.querySelector('.player');
        if(playerEl) playerEl.style.transform = `translate(${playerRef.current.x - PLAYER_WIDTH/2}px, ${playerRef.current.y}px)`;
        
        platformsRef.current.forEach(p => {
          const platEl = gameAreaRef.current.querySelector(`#${p.id}`);
          if(platEl) platEl.style.transform = `translate(${p.x}px, ${p.y}px)`;
        });
      }
      
      // Update state for score and potentially the prompt in one batch
      setUiState(s => {
        const updatedState = { ...s, score: scoreRef.current };
        if (promptToSet !== null) {
          updatedState.prompt = promptToSet;
        }
        return updatedState;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [uiState.mode, generateNewProblem, generatePlatforms]);
  
  if (flashcards.length < 3) {
     return <div className="text-center p-8 bg-slate-900 rounded-lg"><h3 className="text-2xl font-bold text-yellow-400">Not Enough Flashcards!</h3><p className="text-slate-300 mt-2">Definition Descent requires at least 3 flashcards to play.</p></div>;
  }
  
  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-lg flex justify-between mb-2 text-white font-bold text-lg">
        <span>Height: {uiState.score}m</span>
        <span>High Score: {uiState.highScore}m</span>
      </div>
      <div className="relative border-4 border-slate-900 rounded-lg overflow-hidden" style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}>
        <div className="absolute inset-0 bg-gradient-to-b from-sky-700 to-indigo-900"/>
        
        {uiState.mode === 'playing' && (
          <div className="absolute w-full top-0 text-center p-4 bg-black/30 z-20">
            <p className="text-lg font-semibold text-white">{uiState.prompt}</p>
          </div>
        )}
        
        {uiState.mode === 'menu' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center">
            <h3 className="text-4xl font-bold text-white mb-2">Definition Descent</h3>
            <p className="text-slate-300 mb-6 max-w-md">Jump on the correct term to climb higher. Use A/D, arrow keys, or your mouse to steer.</p>
            <button onClick={resetGame} className="px-8 py-4 bg-green-500 text-white font-bold rounded-lg text-2xl hover:bg-green-600">Start Climbing</button>
          </div>
        )}
        {uiState.mode === 'gameover' && (
           <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10">
            <h3 className="text-4xl font-bold text-red-500">Game Over</h3>
            <p className="text-2xl text-white my-4">Final Height: {uiState.score}m</p>
            <button onClick={resetGame} className="px-8 py-4 bg-blue-500 text-white font-bold rounded-lg text-xl hover:bg-blue-600">Try Again</button>
          </div>
        )}

        <div ref={gameAreaRef} className="absolute inset-0">
          <div className="player absolute" style={{ width: PLAYER_WIDTH, height: PLAYER_HEIGHT, transform: `translate(${playerRef.current.x - PLAYER_WIDTH/2}px, ${playerRef.current.y}px)` }}>
            <div className="w-full h-full bg-yellow-400 rounded-full" />
          </div>
          {platformsRef.current.map(p => (
            <div key={p.id} id={p.id} className={`absolute transition-all duration-100 ${p.isCrumbling ? 'opacity-50' : ''}`} style={{ width: p.width, height: p.height, transform: `translate(${p.x}px, ${p.y}px)` }}>
              <div className={`w-full h-full rounded flex items-center justify-center text-center text-xs font-bold p-1 bg-slate-600`}>{p.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
  return (
    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-30 p-4">
      <div className="bg-slate-900 border-2 border-slate-700 p-8 rounded-lg w-full max-w-4xl text-center">
        <h2 className="text-4xl font-bold text-yellow-400 mb-2">LEVEL UP!</h2>
        <p className="text-slate-300 mb-6">Choose a temporary upgrade for this run.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {upgrades.map((upgrade, i) => (
            <button key={i} onClick={() => onSelectUpgrade(upgrade)} className="p-6 bg-slate-800 border border-slate-700 rounded-lg text-left hover:bg-indigo-900/50 hover:border-indigo-600 transition-all transform hover:scale-105">
              <h3 className="text-xl font-bold text-white">
                {upgrade.name} 
                {upgrade.maxLevel > 1 && (
                  <span className="text-base font-medium text-slate-400 ml-2">({(upgrade.currentLevel || 0) + 1}/{upgrade.maxLevel})</span>
                )}
              </h3>
              <p className="text-slate-400 text-sm mt-2">{upgrade.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const PlayerIcon = () => (
  <svg viewBox="0 0 32 40" className="w-full h-full">
    <path d="M16 4 A 8 8 0 0 1 16 20 A 8 8 0 0 1 16 4" fill="#4f46e5" stroke="#c7d2fe" strokeWidth="1.5"/>
    <rect x="11" y="10" width="4" height="6" rx="2" fill="white"/>
    <rect x="17" y="10" width="4" height="6" rx="2" fill="white"/>
    <rect x="13" y="12" width="2" height="3" rx="1" fill="black"/>
    <rect x="19" y="12" width="2" height="3" rx="1" fill="black"/>
    <path d="M4 38 L4 24 A 4 4 0 0 1 8 20 L24 20 A 4 4 0 0 1 28 24 L28 38 Z" fill="#312e81"/>
    <rect x="10" y="22" width="12" height="14" fill="#4338ca"/>
  </svg>
);

const TowerIcons = ({ type }) => {
  const icons = {
    sentry: <path d="M12 20 L28 20 L28 32 L12 32 Z M20 12 L20 20 M14 12 L26 12" stroke="#94a3b8" strokeWidth="4" fill="none" strokeLinecap="round" />,
    cannon: <><circle cx="20" cy="20" r="14" fill="#475569" /><path d="M20 20 L38 12" stroke="#1e293b" strokeWidth="8" fill="none" strokeLinecap="round" /></>,
    mage: <><path d="M20 2 L 38 38 L 2 38 Z" fill="#7c3aed" /><circle cx="20" cy="14" r="6" fill="#c4b5fd" /></>,
    sniper: <><rect x="4" y="18" width="32" height="4" fill="#334155" /><circle cx="10" cy="20" r="8" fill="#475569" /></>,
    bank: <><circle cx="20" cy="20" r="16" fill="#ca8a04" /><text x="20" y="28" fontSize="24" fill="#fefce8" textAnchor="middle">$</text></>,
    gold_magnet: <><path d="M10 10 C 10 30, 30 30, 30 10" fill="none" stroke="#f59e0b" strokeWidth="4" /><path d="M15 15 C 15 28, 25 28, 25 15" fill="none" stroke="#f59e0b" strokeWidth="3" /><path d="M4 38 L 36 38 L 20 28 Z" fill="#475569" /></>,
  };
  return <svg viewBox="0 0 40 40" className="w-full h-full drop-shadow-lg">{icons[type] || <circle cx="20" cy="20" r="15" fill="#64748b"/>}</svg>;
};

const EnemyIcons = ({ iconSrc }) => {
  return <img src={iconSrc} alt="Enemy" loading="lazy" className="w-full h-full object-contain drop-shadow-lg" />;
};

const ProjectileVisuals = ({ type }) => {
  const visuals = {
    sentry_bullet: <rect x="-4" y="-1" width="8" height="2" fill="#fde047" />,
    cannonball: <circle cx="0" cy="0" r="6" fill="#475569" />,
    magic_bolt: <path d="M-8 0 L8 0 M-6 -4 L0 0 L-6 4" stroke="#a78bfa" strokeWidth="3" strokeLinecap="round" />,
    sniper_bullet: <rect x="-6" y="-1" width="12" height="2" fill="white" />,
    player_bullet: (
      <g>
        <line x1="-12" x2="8" stroke="#D1D5DB" strokeWidth="2.5" />
        <polygon fill="#D1D5DB" points="10 0, 4 4, 4 -4" />
      </g>
    ),
  };
  return <svg viewBox="-15 -15 30 30" overflow="visible">{visuals[type] || <circle cx="0" cy="0" r="3" fill="white"/>}</svg>;
};

const FlashcardFortressGame = ({ stats, studyZoneState, updateStudyZoneState, showMessageBox, processAchievement }) => {
  const GAME_WIDTH = 960;
  const GAME_HEIGHT = 540;
  
  const [gameState, setGameState] = useState({ mode: 'menu' });
  
  const keysRef = useRef({});
  const gameLoopRef = useRef(null);
  const lastTimeRef = useRef(0);
  const gameAreaRef = useRef(null);
  const enemySpawnIntervalRef = useRef(null);
  const pathRef = useRef(generateSurvivorPath()); // FIX: Add pathRef definition

  // --- NEW: Refs and State for Aiming ---
  const aimStateRef = useRef({
    isAiming: false,
    startPos: { x: 0, y: 0 },
    angle: 0,
    power: 0,
    arcPath: "",
  });
  // We use a separate state for just the visual part of aiming to trigger re-renders
  const [visualAimState, setVisualAimState] = useState({ angle: 0, power: 0, arcPath: "" });
  const buildSlotsRef = useRef([]);

  const parsedFlashcards = useMemo(() => {
    // NEW: Aggregate cards from all decks in the new data structure
    if (!studyZoneState.cardData) return [];
    return Object.values(studyZoneState.cardData).flat();
  }, [studyZoneState.cardData]);

  const cardsRef = useRef(parsedFlashcards);
  useEffect(() => { cardsRef.current = parsedFlashcards; }, [parsedFlashcards]);

  const resetGame = useCallback(() => {
    if (parsedFlashcards.length < 4) {
      showMessageBox("Please add at least 4 flashcards in the Study Zone before starting the game.", "error");
      return; // Prevent game from starting
    }

    if (enemySpawnIntervalRef.current) clearInterval(enemySpawnIntervalRef.current);
    pathRef.current = generateSurvivorPath();
    buildSlotsRef.current = generateBuildSlots(pathRef.current, 5, 80);
    setGameState({
      mode: 'playing',
      gameTimer: 600000,
      castleHealth: 10,
      score: 0,
      gold: 150,
      level: 1,
      xp: 0,
      xpToNextLevel: 10,
      combo: 0,
      comboTimeout: 0,
      markedTargetId: null,
      nemesisTargetId: null,
      wave: 0,
      isBetweenWaves: false, // Start the first wave immediately
      boss: null,
      
      player: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 30, attackCooldown: 0, collectionRadius: 60, activeBuffs: {} },
      playerUpgrades: [],
      enemies: [],
      towers: [],
      projectiles: [],
      goldDrops: [],
      xpFragmentDrops: [],
      visualEffects: [],
      
      quizTarget: null,
      aimTargetPos: null,
      levelUpOptions: [],
      buildSlotMenu: null,
      upgradeTarget: null,
    });
  }, [parsedFlashcards, showMessageBox]);


  const startNextWave = useCallback(() => {
    setGameState(s => {
      let newState = { ...s, isBetweenWaves: false, wave: s.wave + 1 };
      const waveNumber = newState.wave;
      const timeElapsed = 600 - (newState.gameTimer / 1000);

      // Boss Wave Logic
      if (waveNumber > 0 && waveNumber % 5 === 0) {
        const bossDef = fortressBossDefinitions.juggernaut; // Only one boss for now
        const healthMultiplier = 1 + (waveNumber / 5 - 1) * 0.5; // Boss gets 50% stronger each appearance
        const boss = { 
          ...bossDef, 
          id: 'boss_juggernaut', 
          x: pathRef.current[0].x, y: pathRef.current[0].y, 
          progress: 0, 
          health: bossDef.health * healthMultiplier,
          maxHealth: bossDef.health * healthMultiplier,
          abilities: bossDef.abilities.map(a => ({...a})), // Deep copy abilities
        };
        newState.boss = boss;
        newState.enemies = [boss];
        return newState;
      }
      
      // Normal Wave Logic
      const enemyCount = 5 + waveNumber * 2;
      let enemiesToSpawn = [];
      for (let i = 0; i < enemyCount; i++) {
        const enemyTypes = ['scamp', 'ogre', 'shaman', 'specter', 'sapper'];
        const typeKey = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const def = survivorEnemyDefinitions[typeKey] || survivorEnemyDefinitions.default;
        
        const healthMultiplier = 1 + timeElapsed / 50;
        const speedMultiplier = 1 + timeElapsed / 200;

        const isElite = Math.random() < 0.1; // 10% chance to be elite
        
        let newEnemy = { 
          ...def, 
          id: `${typeKey}_${Date.now()}_${i}`,
          isElite,
          x: pathRef.current[0].x, y: pathRef.current[0].y, 
          speed: def.speed * (def.type === 'tower-buster' ? speedMultiplier : 1), 
          progress: -i * (0.5 / enemyCount), // Stagger spawn
          health: def.health * healthMultiplier * (isElite ? 3 : 1), 
          maxHealth: def.health * healthMultiplier * (isElite ? 3 : 1), 
          gold: def.gold * (isElite ? 5 : 1),
          xp: (def.xp || 1) * (isElite ? 5 : 1),
          card: { ...cardsRef.current[Math.floor(Math.random() * cardsRef.current.length)] }, 
          slowTimer: 0, slowAmount: 0, isEnraged: false 
        };
        enemiesToSpawn.push(newEnemy);
      }
      newState.enemies = enemiesToSpawn;
      return newState;
    });
  }, []);

  const handleSelectUpgrade = useCallback((upgrade, isBossReward = false) => {
    setGameState(s => ({ ...s, mode: 'playing', level: isBossReward ? s.level : s.level + 1, xp: 0, xpToNextLevel: Math.floor(s.xpToNextLevel * 1.5), playerUpgrades: [...s.playerUpgrades, upgrade.id] }));
  }, []);

  useEffect(() => {
    const handleKey = e => { keysRef.current[e.key.toLowerCase()] = e.type === 'keydown'; };
    const handleRightClick = e => { e.preventDefault(); };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    window.addEventListener('contextmenu', handleRightClick);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
      window.removeEventListener('contextmenu', handleRightClick);
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };
  }, []);
  
  useEffect(() => {
    // PAUSE the game loop if not in 'playing' mode.
    if (gameState.mode !== 'playing') {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      lastTimeRef.current = 0;
      return;
    }

    const gameLoop = (timestamp) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      let dt = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;
      if (dt > 100) dt = 16.67;

      setGameState(s => {
        // Double-check mode inside the updater to prevent updates after mode changes.
        if (s.mode !== 'playing') return s;
        let newState = JSON.parse(JSON.stringify(s));

        // Only count down the main timer when a wave is active
        if (!newState.isBetweenWaves) {
            newState.gameTimer -= dt;
        }
        if (newState.player.attackCooldown > 0) newState.player.attackCooldown -= dt;
        if (newState.comboTimeout > 0) newState.comboTimeout -= dt;
        if (newState.comboTimeout <= 0 && newState.combo > 0) newState.combo = 0;
        Object.keys(newState.player.activeBuffs || {}).forEach(buffId => {
          newState.player.activeBuffs[buffId] -= dt;
          if (newState.player.activeBuffs[buffId] <= 0) delete newState.player.activeBuffs[buffId];
        });
        newState.visualEffects = newState.visualEffects.filter(effect => Date.now() - effect.createdAt < effect.duration);
        
        const speedLevels = newState.playerUpgrades.filter(u => u === 'player_speed').length;
        const currentSpeed = 250 * Math.pow(1.15, speedLevels);
        let vx = 0;
        if (keysRef.current['a'] || keysRef.current['arrowleft']) vx -= 1;
        if (keysRef.current['d'] || keysRef.current['arrowright']) vx += 1;
        newState.player.x += vx * currentSpeed * (dt / 1000);
        newState.player.x = Math.max(20, Math.min(GAME_WIDTH - 20, newState.player.x));
        
        // --- BOSS ABILITY LOGIC ---
        if (newState.boss) {
          newState.boss.abilities.forEach(ability => {
            if (Date.now() - ability.lastUse > ability.cooldown) {
              ability.lastUse = Date.now();
              if (ability.id === 'tower_stun' && newState.towers.length > 0) {
                const randomTower = newState.towers[Math.floor(Math.random() * newState.towers.length)];
                if (randomTower) {
                  randomTower.stunnedUntil = Date.now() + 5000; // Stun for 5s
                  newState.visualEffects.push({ id: Math.random(), type: 'stun_effect', x: randomTower.x, y: randomTower.y, duration: 5000, createdAt: Date.now() });
                }
              }
              if (ability.id === 'spawn_minions') {
                for (let i = 0; i < 3; i++) {
                  const def = survivorEnemyDefinitions.scamp;
                  newState.enemies.push({ ...def, id: `minion_${Date.now()}_${i}`, x: newState.boss.x, y: newState.boss.y, progress: newState.boss.progress, health: def.health, maxHealth: def.health, card: { ...cardsRef.current[0] } });
                }
              }
            }
          });
        }

        newState.enemies.forEach(enemy => {
            if(enemy.progress < 0) { enemy.progress += enemy.speed * (dt / 1000); return; }
            if (enemy.type === 'healer' && Date.now() - (enemy.lastHeal || 0) > enemy.healCooldown) {
                newState.enemies.forEach(target => { if (target.id !== enemy.id && target.health < target.maxHealth && Math.hypot(target.x - enemy.x, target.y - enemy.y) < enemy.healRadius) { target.health = Math.min(target.maxHealth, target.health + enemy.healPower); } });
                enemy.lastHeal = Date.now();
            }
            if (enemy.type === 'tower-buster') {
                let closestTower = null, minDist = Infinity;
                newState.towers.forEach(t => { const dist = Math.hypot(t.x - enemy.x, t.y - enemy.y); if (dist < minDist) { minDist = dist; closestTower = t; } });
                if (closestTower) {
                    if (minDist < 20) {
                      closestTower.health -= enemy.damage; 
                      enemy.health = 0;
                      newState.visualEffects.push({ id: Math.random(), type: 'explosion', x: enemy.x, y: enemy.y, size: 80, duration: 400, createdAt: Date.now() });
                    } else { 
                      enemy.x += (closestTower.x - enemy.x) / minDist * enemy.speed * (dt/1000); 
                      enemy.y += (closestTower.y - enemy.y) / minDist * enemy.speed * (dt/1000); 
                    }
                }
            } else {
              let currentSpeed = enemy.speed;
              if (enemy.isEnraged) currentSpeed *= 1.5;
              if (enemy.slowTimer > 0) { enemy.slowTimer -= dt; currentSpeed *= (1 - enemy.slowAmount); }
              enemy.progress += currentSpeed * (dt / 1000);
              if (enemy.progress >= 1) { newState.castleHealth -= 1; enemy.health = 0; } 
              else {
                const path = pathRef.current;
                const pathIndexFloat = enemy.progress * (path.length - 1);
                let pathIndex = Math.round(pathIndexFloat);
                pathIndex = Math.max(0, Math.min(path.length - 1, pathIndex));
                const targetPoint = path[pathIndex];
                if (targetPoint) { enemy.x = targetPoint.x; enemy.y = targetPoint.y; }
              }
            }
        });
        
        newState.towers = newState.towers.filter(t => {
            if (t.health <= 0 && !t.isDestroyed) {
                t.isDestroyed = true;
                t.destroyedAt = Date.now();
                newState.visualEffects.push({ id: Math.random(), type: 'explosion', x: t.x, y: t.y, size: 40, duration: 400, createdAt: Date.now() });
            }
            // Keep tower in state for a moment to play fade-out animation
            return !t.isDestroyed || (Date.now() - t.destroyedAt < 500);
        });

        const overclockLevels = newState.playerUpgrades.filter(u => u === 'tower_overclock').length;
        const fireRateMultiplier = Math.pow(1.15, overclockLevels);

        newState.towers.forEach(tower => {
            if (tower.isDestroyed || (tower.stunnedUntil && Date.now() < tower.stunnedUntil)) return;
            if (tower.type === 'bank') {
                if (Date.now() - (tower.lastFire || 0) > 1000 / tower.fireRate) { newState.gold += tower.income; tower.lastFire = Date.now(); }
                return;
            }
            if (Date.now() - (tower.lastFire || 0) > 1000 / (tower.fireRate * fireRateMultiplier)) {
                let target = null;
                if (newState.markedTargetId) {
                    const marked = newState.enemies.find(e => e.id === newState.markedTargetId);
                    if (marked && Math.hypot(marked.x - tower.x, marked.y - tower.y) <= tower.range) target = marked;
                }
                if (!target) {
                  let bestTarget = null, bestMetric = tower.targetPriority === 'strongest' ? 0 : Infinity;
                  newState.enemies.forEach(e => {
                    const dist = Math.hypot(e.x - tower.x, e.y - tower.y);
                    if (dist <= tower.range && (!e.isEthereal || tower.canHitEthereal)) {
                      let metric = tower.targetPriority === 'strongest' ? e.health : e.progress;
                      if (tower.targetPriority === 'strongest' ? metric > bestMetric : metric < bestMetric) { bestMetric = metric; bestTarget = e; }
                    }
                  });
                  target = bestTarget;
                }
                if (target) {
                    tower.lastFire = Date.now();
                    const angle = Math.atan2(target.y - tower.y, target.x - tower.x);
                    newState.projectiles.push({ id: Math.random(), x: tower.x, y: tower.y, angle, fromTower: true, ...tower });
                }
            }
        });
        
        // --- NEW: Robust Damage Application Logic ---
        const damageMap = {}; // { enemyId: totalDamage }

        newState.projectiles = newState.projectiles.filter(proj => {
            // Player arrow physics
            if (proj.fromPlayer) {
              proj.vy += 0.3 * (dt / 16.67); // Gravity
              proj.x += proj.vx * (dt / 16.67);
              proj.y += proj.vy * (dt / 16.67);
              proj.angle = Math.atan2(proj.vy, proj.vx);
            } else { // Tower projectile physics
              const speed = proj.fromTower ? 600 : 900;
              proj.x += Math.cos(proj.angle) * speed * (dt / 1000); 
              proj.y += Math.sin(proj.angle) * speed * (dt / 1000);
            }

            // Collision Detection
            for (const enemy of newState.enemies) {
                if (proj.hitEnemies?.includes(enemy.id)) continue;
                if ((enemy.isEthereal && !proj.canHitEthereal) && !proj.fromPlayer) continue;
                if (Math.hypot(proj.x - enemy.x, proj.y - enemy.y) < 16) {
                    let finalDamage = proj.damage;
                    
                    // Record damage instead of applying it directly
                    damageMap[enemy.id] = (damageMap[enemy.id] || 0) + finalDamage;
                    
                    // Handle AoE damage recording
                    if (proj.aoeRadius) {
                      newState.enemies.forEach(other => {
                        if (other.id !== enemy.id && Math.hypot(other.x - enemy.x, other.y - enemy.y) < proj.aoeRadius) {
                           damageMap[other.id] = (damageMap[other.id] || 0) + finalDamage / 2;
                        }
                      });
                    }

                    // Handle other on-hit effects
                    if (proj.slow) { enemy.slowTimer = proj.slow.duration; enemy.slowAmount = proj.slow.amount; }
                    
                    // Handle pierce
                    if (proj.pierce > 0) {
                      proj.pierce--;
                      if (!proj.hitEnemies) proj.hitEnemies = [];
                      proj.hitEnemies.push(enemy.id);
                    } else {
                      return false; // Remove projectile
                    }
                }
            }
            return proj.x > -20 && proj.x < GAME_WIDTH + 20 && proj.y > -20 && proj.y < GAME_HEIGHT + 20;
        });

        // Apply all recorded damage and create visual effects in a clean step
        if (Object.keys(damageMap).length > 0) {
          newState.enemies.forEach(enemy => {
            if (damageMap[enemy.id]) {
              const damageTaken = Math.round(damageMap[enemy.id]);
              enemy.health -= damageTaken;
              // We can still check for crit on the projectile that caused the first hit in the map if we want
              const isCrit = newState.projectiles.find(p => p.hitEnemies?.includes(enemy.id))?.isCrit || false;
              newState.visualEffects.push({ id: Math.random(), type: 'damage_number', x: enemy.x, y: enemy.y, amount: damageTaken, isCrit: isCrit, duration: 1000, createdAt: Date.now() });
            }
          });
        }
        
        const magnetLevels = newState.playerUpgrades.filter(u => u === 'drop_magnet').length;
        const collectionRadius = newState.player.collectionRadius * Math.pow(1.3, magnetLevels);
        const magnetTowers = newState.towers.filter(t => t.type === 'gold_magnet' && !t.isDestroyed);
        
        newState.goldDrops = newState.goldDrops.filter(d => {
          let collected = false;
          if (Math.hypot(newState.player.x - d.x, newState.player.y - d.y) < collectionRadius) collected = true;
          if (!collected) {
            for (const magnet of magnetTowers) {
              if (Math.hypot(magnet.x - d.x, magnet.y - d.y) < magnet.range) { collected = true; break; }
            }
          }
          if (collected) { newState.gold += d.amount; return false; }
          return true;
        });
        
        newState.xpFragmentDrops = newState.xpFragmentDrops.filter(d => { 
          if(Math.hypot(newState.player.x - d.x, newState.player.y - d.y) < collectionRadius) { 
            newState.xp += d.amount; 
            return false;
          } 
          return true; 
        });
        
        newState.enemies = newState.enemies.filter(e => {
            if (e.health <= 0) {
                if (e.id === newState.nemesisTargetId) newState.nemesisTargetId = null;
                if (e.id === newState.boss?.id) {
                  newState.mode = 'levelup';
                  newState.boss = null;
                  const epicUpgrades = [...fortressUpgradeDefinitions.epic];
                  newState.levelUpOptions = [epicUpgrades[Math.floor(Math.random() * epicUpgrades.length)]];
                }
                const dropY = GAME_HEIGHT - 60;
                const comboMultiplier = 1 + (newState.combo * 0.05);
                const goldRushMultiplier = newState.player.activeBuffs?.gold_rush > 0 ? 2 : 1;
                const goldBoostLevels = newState.playerUpgrades.filter(u => u === 'gold_boost').length;
                const goldMultiplier = Math.pow(1.2, goldBoostLevels);
                let goldAmount = Math.round((e.gold || 10) * comboMultiplier * goldRushMultiplier * goldMultiplier);
                newState.goldDrops.push({ id: Math.random(), x: e.x, y: dropY, amount: goldAmount });
                const xpBoostLevels = newState.playerUpgrades.filter(u => u === 'xp_boost').length;
  
              const xpMultiplier = Math.pow(1.25, xpBoostLevels);
                let xpAmount = (e.xp || 1) * comboMultiplier * xpMultiplier;
                newState.xpFragmentDrops.push({ id: Math.random(), x: e.x, y: dropY, amount: xpAmount });
                return false;
            }
            return true;
        });

        if (newState.enemies.length === 0 && !newState.isBetweenWaves && !newState.boss) {
          newState.isBetweenWaves = true;
        }

        if (newState.xp >= newState.xpToNextLevel) {
          newState.mode = 'levelup';
          const allUpgrades = [...fortressUpgradeDefinitions.common, ...fortressUpgradeDefinitions.rare, ...fortressUpgradeDefinitions.epic];
          const upgradeCounts = newState.playerUpgrades.reduce((acc, id) => { acc[id] = (acc[id] || 0) + 1; return acc; }, {});
          const available = allUpgrades.filter(u => (upgradeCounts[u.id] || 0) < u.maxLevel);
          for (let i = available.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [available[i], available[j]] = [available[j], available[i]]; }
          const choices = [];
          for (let i = 0; i < 3 && i < available.length; i++) { const choice = available[i]; choices.push({ ...choice, currentLevel: upgradeCounts[choice.id] || 0 }); }
          newState.levelUpOptions = choices;
        }

        if ((newState.gameTimer <= 0 || newState.castleHealth <= 0) && s.mode === 'playing') {
            newState.mode = newState.castleHealth > 0 ? 'won' : 'gameover';
            if (newState.score > (studyZoneState.platformerHighScore || 0)) {
                updateStudyZoneState({ platformerHighScore: newState.score });
                processAchievement('highScore', newState.score);
                showMessageBox(`New High Score: ${newState.score}!`, 'info');
            }
        }
        return newState;
      });
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    gameLoopRef.current = requestAnimationFrame(gameLoop);

  }, [gameState.mode, parsedFlashcards]);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) {
      // Correct answer: enter aiming mode
      setGameState(s => {
        return {
          ...s,
          mode: 'aiming',
          aimTargetPos: { x: s.quizTarget.x, y: s.quizTarget.y },
          quizTarget: null,
          combo: s.combo + 1,
          comboTimeout: 8000,
        };
      });
    } else {
      // Incorrect answer: apply penalty and return to playing
      setGameState(s => {
        const recoveryLevels = s.playerUpgrades.filter(u => u === 'quick_recovery').length;
        const cooldownMultiplier = Math.pow(0.8, recoveryLevels);
        if (s.player.activeBuffs?.rapid_fire > 0) return { ...s, mode: 'playing', combo: 0 };
        const newEnemies = s.enemies.map(e => e.id === s.quizTarget.id ? { ...e, isEnraged: true } : e);
        const newVisualEffects = [...s.visualEffects, { id: Math.random(), type: 'correctAnswerFlash', x: s.quizTarget.x, y: s.quizTarget.y, text: s.quizTarget.card.back, duration: 2000, createdAt: Date.now() }];
        showMessageBox("Incorrect! Attack is on cooldown.", "error");
        return { ...s, mode: 'playing', combo: 0, player: { ...s.player, attackCooldown: 1500 * cooldownMultiplier }, nemesisTargetId: s.quizTarget.id, enemies: newEnemies, visualEffects: newVisualEffects, quizTarget: null };
      });
    }
  };

  const handleBuildTower = (towerType) => {
    setGameState(s => {
      const def = survivorTowerDefinitions[towerType];
      const discountLevels = s.playerUpgrades.filter(u => u === 'tower_discount').length;
      const costMultiplier = Math.pow(0.9, discountLevels);
      const finalCost = Math.round(def.baseCost * costMultiplier);
      if (s.gold < finalCost) return s;
      const constructionLevels = s.playerUpgrades.filter(u => u === 'reinforced_construction').length;
      const healthMultiplier = Math.pow(1.25, constructionLevels);
      const finalMaxHealth = Math.round(def.base.maxHealth * healthMultiplier);
      const newTower = { id: Math.random(), type: towerType, x: s.buildSlotMenu.slot.x, y: s.buildSlotMenu.slot.y, purchasedUpgrades: [], health: finalMaxHealth, maxHealth: finalMaxHealth, ...def.base };
      return {...s, mode: 'playing', gold: s.gold - finalCost, towers: [...s.towers, newTower]};
    });
  };

  const handleTowerClick = (tower) => {
    setGameState(s => ({...s, mode: 'upgrade', upgradeTarget: tower, quizFirePosition: null}));
  };

  const handlePurchaseTowerUpgrade = (upgrade) => {
    setGameState(s => {
      const discountLevels = s.playerUpgrades.filter(u => u === 'tower_discount').length;
      const costMultiplier = Math.pow(0.9, discountLevels);
      const finalCost = Math.round(upgrade.cost * costMultiplier);
      if (s.gold < finalCost) { showMessageBox("Not enough gold!", "error"); return s; }
      const newTowers = s.towers.map(t => {
        if (t.id === s.upgradeTarget.id) {
          let newTower = { ...t, purchasedUpgrades: [...(t.purchasedUpgrades || []), upgrade.id] };
          if (upgrade.path) newTower.path = upgrade.path;
          for (const key in upgrade.effect) {
             if (key === 'fireRate') newTower.fireRate *= upgrade.effect.fireRate;
             else newTower[key] = (newTower[key] || 0) + upgrade.effect[key];
          }
          return newTower;
        }
        return t;
      });
      return { ...s, mode: 'playing', gold: s.gold - finalCost, towers: newTowers, upgradeTarget: null };
    });
    showMessageBox(`Upgraded tower!`, "info");
  };

  const handleActivateBuff = (buffId) => {
    const def = survivorBuffDefinitions[buffId];
    if (!def) return;
    setGameState(s => {
      if (s.gold < def.cost || s.player.activeBuffs?.[buffId] > 0) return s;
      const newActiveBuffs = { ...s.player.activeBuffs, [buffId]: def.duration };
      return { ...s, gold: s.gold - def.cost, player: { ...s.player, activeBuffs: newActiveBuffs } };
    });
    showMessageBox(`${def.name} activated!`, 'info', 2000);
  };

  const getMouseSVG = (e) => {
    if (!gameAreaRef.current) return { x: 0, y: 0 };
    const rect = gameAreaRef.current.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const handleAimStart = (e) => {
    e.preventDefault();
    if (gameState.mode !== 'aiming') return;

    aimStateRef.current.isAiming = true;
    aimStateRef.current.startPos = getMouseSVG(e);

    const onAimMove = (moveEvent) => handleAimMove(moveEvent);
    const onAimEnd = (endEvent) => handleAimEnd(endEvent);

    window.addEventListener('mousemove', onAimMove);
    window.addEventListener('mouseup', onAimEnd);
    window.addEventListener('touchmove', onAimMove);
    window.addEventListener('touchend', onAimEnd);

    // Store cleanup functions
    aimStateRef.current.cleanup = () => {
      window.removeEventListener('mousemove', onAimMove);
      window.removeEventListener('mouseup', onAimEnd);
      window.removeEventListener('touchmove', onAimMove);
      window.removeEventListener('touchend', onAimEnd);
    };
  };

  const handleAimMove = (e) => {
    if (!aimStateRef.current.isAiming) return;
    e.preventDefault();

    const currentPos = getMouseSVG(e);
    const playerPos = gameState.player;
    
    const dx = currentPos.x - playerPos.x;
    const dy = currentPos.y - playerPos.y;
    
    const angle = Math.atan2(dy, dx);
    const power = Math.min(Math.hypot(dx, dy), 100);
    
    aimStateRef.current.angle = angle;
    aimStateRef.current.power = power;

    // --- FINAL, CORRECT ARC LOGIC ---
    // This is a direct physics simulation that mirrors the projectile's movement in the game loop.
    let path = `M${playerPos.x},${playerPos.y}`;
    const simulationFrames = 60; // How many future frames to simulate for the preview
    
    // 1. Get the initial velocity, exactly as it's calculated in handleAimEnd
    let simX = playerPos.x;
    let simY = playerPos.y;
    let simVx = Math.cos(angle) * power * 0.4;
    let simVy = Math.sin(angle) * power * 0.4;

    // 2. Loop through future frames and apply the exact same physics as the game loop
    for (let i = 0; i < simulationFrames; i++) {
      // Apply gravity (this constant matches the one in the main game loop's useEffect)
      simVy += 0.3; 
      
      // Apply velocity
      simX += simVx;
      simY += simVy;
      
      // 3. Add a point to the path for EVERY simulated frame. This is the key to a smooth arc.
      path += ` L${simX},${simY}`;
      
      // Stop the preview if it goes off-screen
      if (simY > GAME_HEIGHT + 20 || simX < -20 || simX > GAME_WIDTH + 20) break;
    }

    aimStateRef.current.arcPath = path;
    setVisualAimState({ angle: angle, power: power, arcPath: path });
  };
  
  const handleAimEnd = (e) => {
    if (!aimStateRef.current.isAiming) return;
    e.preventDefault();
    aimStateRef.current.isAiming = false;
    if (aimStateRef.current.cleanup) aimStateRef.current.cleanup();

    const { angle, power } = aimStateRef.current;
    if (power < 10) { // Not drawn back enough, cancel shot
        setGameState(s => ({ ...s, mode: 'playing', aimTargetPos: null }));
        setVisualAimState({ angle: 0, power: 0, arcPath: "" });
        return;
    }

    setGameState(s => {
        const { player, playerUpgrades, combo } = s;
        const pierceLevels = playerUpgrades.filter(u => u === 'piercing_shot').length;
        const damageLevels = playerUpgrades.filter(u => u === 'focused_power').length;
        const hasMultishot = playerUpgrades.includes('multishot');
        const critChance = Math.min(0.5, combo * 0.05);
        const isCrit = Math.random() < critChance;
        let baseDamage = 5 + (damageLevels * 2) + (combo * 0.5);
        if (isCrit) baseDamage *= 2;
        
        let projectilesToAdd = [];
        const baseProjectile = { 
            projectileType: 'player_bullet', 
            x: player.x, y: player.y, 
            damage: baseDamage, 
            pierce: pierceLevels, 
            hitEnemies: [], 
            fromPlayer: true, 
            isCrit,
            vx: Math.cos(angle) * power * 0.4,
            vy: Math.sin(angle) * power * 0.4,
        };
        projectilesToAdd.push({ ...baseProjectile, id: Math.random() });

        if (hasMultishot) {
          const angle1 = angle - 0.2;
          const angle2 = angle + 0.2;
          projectilesToAdd.push({ ...baseProjectile, id: Math.random() + 1, vx: Math.cos(angle1) * power * 0.4, vy: Math.sin(angle1) * power * 0.4 });
          projectilesToAdd.push({ ...baseProjectile, id: Math.random() + 2, vx: Math.cos(angle2) * power * 0.4, vy: Math.sin(angle2) * power * 0.4 });
        }
        
        return { ...s, mode: 'playing', aimTargetPos: null, projectiles: [...s.projectiles, ...projectilesToAdd] };
    });

    setVisualAimState({ angle: 0, power: 0, arcPath: "" });
  };
  
  const handlePlayerActionClick = (e, targetEnemy) => {
      e.preventDefault();
      if (gameState.mode !== 'playing' || !gameAreaRef.current) return;
      
      const target = targetEnemy; // The enemy div itself is passed now
      
      if (e.button === 2) { setGameState(s => ({...s, markedTargetId: target ? target.id : null })); return; }
      if (gameState.nemesisTargetId && target?.id !== gameState.nemesisTargetId) { showMessageBox("You must defeat your Nemesis first!", "error"); return; }
      if (gameState.player.attackCooldown > 0) { showMessageBox("Reloading...", "error", 1000); return; }
      if (target) {setGameState(s => ({...s, mode: 'quiz', quizTarget: target }));
      };
    };

  const xpPercentage = (gameState.xp / gameState.xpToNextLevel) * 100;
  
  return (
    <div className="flex flex-col items-center">
      <style>{`
        #arc-gradient stop { stop-color: white; }
        .player-bow { fill: none; stroke-linecap: round; vector-effect: non-scaling-stroke; }
        .player-bow-wood { stroke: #ddd; }
        .player-bow-string { fill: none; stroke: #88ce02; stroke-width: 3px; stroke-linecap: round; }
        .aim-arrow-use { pointer-events: none; }
      `}</style>
      <div className="flex w-full max-w-4xl justify-between mb-2 text-white text-lg font-bold">
        <span>Time: {gameState.gameTimer ? `${Math.floor(gameState.gameTimer / 60000)}:${(Math.floor(gameState.gameTimer / 1000) % 60).toString().padStart(2, '0')}` : '10:00'}</span>
        <span>Wave: {gameState.wave || 0}</span>
        <span>🏰 {gameState.castleHealth || 10}</span>
        <span>💰 {gameState.gold || 0}</span>
        <span className="text-yellow-400">Combo: x{gameState.combo || 0}</span>
      </div>
       <div className="w-full max-w-4xl mb-2 h-4 bg-slate-700 rounded-full"><div className="h-full bg-yellow-400 rounded-full transition-width duration-300" style={{ width: `${xpPercentage}%`}}></div></div>
      <div 
        ref={gameAreaRef} 
        onMouseDown={gameState.mode === 'playing' ? (e) => handlePlayerActionClick(e, null) : handleAimStart}
        onContextMenu={(e) => { e.preventDefault(); if (gameState.mode === 'playing') handlePlayerActionClick(e, null); }}
        className="relative bg-gray-900 border-4 border-slate-900 rounded-lg overflow-hidden cursor-crosshair" 
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
      >
        {gameState.mode === 'menu' && ( <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-20 space-y-4 text-center p-4"><h3 className="text-4xl text-white font-bold mb-2 drop-shadow-lg">Flashcard Fortress</h3><p className="text-slate-300 max-w-md">Survive the horde of terms for 10 minutes. Click an enemy to answer a question, then aim and fire your bow!</p><button onClick={resetGame} className="mt-4 px-8 py-4 bg-green-500 text-white font-bold rounded-lg text-2xl hover:bg-green-600 shadow-xl">Start Survival</button><p className="text-slate-400">High Score: {studyZoneState.platformerHighScore || 0}</p></div> )}
        {gameState.mode !== 'menu' && (
          <>
            {gameState.boss && (
              <div className="absolute top-2 left-1/4 w-1/2 z-30">
                <p className="text-center font-bold text-red-400">{gameState.boss.name}</p>
                <div className="w-full bg-slate-700 rounded-full h-4 border-2 border-black"><div className="h-full bg-red-500 rounded-full" style={{width: `${(gameState.boss.health / gameState.boss.maxHealth) * 100}%`}} /></div>
              </div>
            )}
            {gameState.isBetweenWaves && !gameState.boss && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-4">
                {gameState.wave > 0 && (
                  <h3 className="text-3xl font-bold text-green-400">Wave {gameState.wave} Cleared!</h3>
                )}
                <button onClick={startNextWave} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg text-lg hover:bg-indigo-700">
                  Start Wave {gameState.wave + 1}
                </button>
              </div>
            )}
            <svg className="absolute inset-0 pointer-events-none z-0" viewBox={`0 0 ${GAME_WIDTH} ${GAME_HEIGHT}`}><path d={`M ${pathRef.current.map(p => `${p.x} ${p.y}`).join(" L ")}`} stroke="#3f3f46" strokeWidth="35" strokeLinejoin="round" fill="none" /><path d={`M ${pathRef.current.map(p => `${p.x} ${p.y}`).join(" L ")}`} stroke="#71717a" strokeWidth="25" strokeLinejoin="round" fill="none" /></svg>
            <div className="absolute text-6xl z-10 pointer-events-none" style={{ transform: `translate(${pathRef.current[pathRef.current.length - 1].x - 40}px, ${pathRef.current[pathRef.current.length - 1].y - 30}px)`}}>🏰</div>
            {buildSlotsRef.current.map((slot, i) => <div key={i} onClick={(e) => {e.stopPropagation(); setGameState(s => ({...s, mode: 'build', buildSlotMenu: {slot, index: i}}))}} className="absolute w-12 h-12 bg-black/30 border-2 border-dashed border-slate-500 rounded-full cursor-pointer hover:bg-slate-600/50" style={{transform: `translate(${slot.x-24}px, ${slot.y-24}px)`}}/>)}
            {gameState.goldDrops?.map(d => <div key={d.id} className="absolute text-yellow-400 font-bold text-lg" style={{transform: `translate(${d.x}px, ${d.y}px)`}}>💰</div>)}
            {gameState.xpFragmentDrops?.map(d => <div key={d.id} className="absolute w-3 h-3 bg-cyan-400 rounded-full" style={{transform: `translate(${d.x-6}px, ${d.y-6}px)`}} />)}
            {gameState.mode !== 'aiming' && <div className="absolute z-20 pointer-events-none" style={{ width: 32, height: 40, transform: `translate(${gameState.player.x-16}px, ${gameState.player.y-20}px)`}} ><PlayerIcon /></div>}
            {gameState.towers?.map(t => (
              <button key={t.id} onClick={(e) => {e.stopPropagation(); handleTowerClick(t)}} className="absolute z-10" style={{transform: `translate(${t.x-20}px, ${t.y-20}px)`}}>
                <div className={`w-10 h-10 transition-opacity ${t.isDestroyed ? 'opacity-0' : 'opacity-100'}`}><TowerIcons type={t.type} /></div>
                {!t.isDestroyed && <div className="absolute -bottom-3 w-10 h-2 bg-slate-700 rounded-full shadow-inner"><div className="h-full bg-green-500 rounded-full" style={{width: `${(t.health / t.maxHealth) * 100}%`}} /></div>}
              </button>
            ))}
            {gameState.enemies?.map(e => (
              <div key={e.id} onClick={(event) => {event.stopPropagation(); handlePlayerActionClick(event, e)}} className="absolute z-10" style={{transform: `translate(${e.x - 20}px, ${e.y - 20}px)`}}>
                <div className={`flex items-center justify-center relative transition-all duration-300 ${e.isElite ? 'w-12 h-12 elite-glow' : 'w-10 h-10'} ${e.isEnraged ? 'nemesis-aura rounded-full' : ''}`}><EnemyIcons iconSrc={e.icon} /></div>
                <div className={`absolute -bottom-2 w-full h-2 bg-slate-700 rounded-full shadow-inner ${e.isElite ? 'w-12' : 'w-10'}`}><div className="h-full bg-red-500 rounded-full" style={{width: `${(e.health / e.maxHealth) * 100}%`}} /></div>
                {e.id === gameState.markedTargetId && <div className="absolute -inset-1 border-2 border-red-500 rounded-full animate-pulse"/>}
              </div>
            ))}
            {gameState.projectiles?.map(p => <div key={p.id} className="absolute pointer-events-none" style={{ transform: `translate(${p.x}px, ${p.y}px) rotate(${p.angle}rad)`}} ><div className="w-8 h-8 -translate-x-4 -translate-y-4"><ProjectileVisuals type={p.projectileType} /></div></div>)}
            {gameState.visualEffects?.map(effect => {
              if (effect.type === 'explosion') return <div key={effect.id} className="absolute rounded-full bg-orange-500/80 animate-explosion" style={{ left: effect.x, top: effect.y, width: effect.size, height: effect.size, transform: 'translate(-50%, -50%)' }} />;
              if (effect.type === 'correctAnswerFlash') return <div key={effect.id} className="absolute bg-green-500 text-white font-bold text-sm px-3 py-1 rounded-lg shadow-lg correct-answer-popup" style={{ left: effect.x, top: effect.y - 40 }}>{effect.text}</div>;
              if (effect.type === 'damage_number') return <div key={effect.id} className={`absolute font-bold damage-number pointer-events-none ${effect.isCrit ? 'text-orange-400 text-lg' : 'text-white text-base'}`} style={{ left: effect.x, top: effect.y, textShadow:'1px 1px 2px black' }}>{effect.amount}</div>;
              if (effect.type === 'stun_effect') return <div key={effect.id} className="absolute text-2xl font-bold text-yellow-300 animate-pulse" style={{ left: effect.x, top: effect.y - 30, transform: 'translateX(-50%)' }}>⚡</div>
              return null;
            })}
            
            {(gameState.mode === 'aiming' || aimStateRef.current.isAiming) && (
              <svg className="absolute inset-0 pointer-events-none z-20" viewBox={`0 0 ${GAME_WIDTH} ${GAME_HEIGHT}`} overflow="visible">
                <defs>
                  {/* Arrow definition remains the same */}
                  <g id="fortress-arrow">
                    <line x2="30" stroke="#888" strokeWidth="2" />
                    <polygon fill="#888" points="32 0 29 2 28 0 29 -2" />
                    <polygon fill="#88ce02" points="1 -2 -2 -2 -0.5 0 -2 2 1 2 2.5 0" />
                  </g>
                </defs>

                {/* The Arc Preview - Now a dashed white line for visibility */}
                <path 
                  id="arc" 
                  d={visualAimState.arcPath} 
                  fill="none" 
                  stroke="white" 
                  strokeWidth={visualAimState.power > 10 ? 2 : 0} 
                  strokeDasharray="5, 8"
                  opacity="0.6"
                />
                
                {/* NEW, ROBUST Aiming Visual Group */}
                <g style={{ transform: `translate(${gameState.player.x}px, ${gameState.player.y}px) rotate(${visualAimState.angle * 180 / Math.PI}deg)` }}>
                  {/* The Bow */}
                  <path 
                    d={`M0,-25 C 20, -15, 20, 15, 0, 25`}
                    fill="none" 
                    stroke="#ddd" 
                    strokeWidth="3"
                    style={{ transform: `scaleX(${1 + visualAimState.power / 150})`, transformOrigin: '0% 50%' }}
                  />
                  {/* The String */}
                  <polyline
                    points={`0,-25 ${-visualAimState.power},0 0,25`}
                    fill="none"
                    stroke="#88ce02"
                    strokeWidth="2"
                  />
                  {/* The Arrow */}
                  <g className="aim-arrow-use">
                    <use xlinkHref="#fortress-arrow" x={-visualAimState.power} y="0"/>
                  </g>
                </g>
              </svg>
            )}
          </>
        )}
        {gameState.mode === 'quiz' && <FlashcardFortressQuizModal card={gameState.quizTarget.card} allCards={parsedFlashcards} onAnswer={handleAnswer} onClose={() => setGameState(s => ({...s, mode: 'playing'}))} />}
        {gameState.mode === 'levelup' && <FlashcardFortressLevelUpModal upgrades={gameState.levelUpOptions} onSelectUpgrade={(u) => handleSelectUpgrade(u, gameState.boss !== null)} />}
        {gameState.mode === 'build' && ( <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30" onClick={() => setGameState(s => ({...s, mode: 'playing'}))}><div className="bg-slate-800 p-4 rounded-lg flex flex-wrap gap-4 justify-center max-w-md" onClick={e => e.stopPropagation()}>{Object.entries(survivorTowerDefinitions).map(([key, def]) => { const discountLevels = gameState.playerUpgrades.filter(u => u === 'tower_discount').length; const finalCost = Math.round(def.baseCost * Math.pow(0.9, discountLevels)); return ( <button key={key} onClick={() => handleBuildTower(key)} disabled={gameState.gold < finalCost} className="p-3 bg-slate-700 rounded hover:bg-indigo-600 disabled:bg-slate-900 disabled:text-slate-600 text-center w-32"><p className="text-lg font-bold">{def.name}</p><p className="text-sm">Cost: {finalCost}g</p></button> )})}</div></div> )}
        {gameState.mode === 'upgrade' && (() => {
          const tower = gameState.upgradeTarget;
          const def = survivorTowerDefinitions[tower.type];
          return (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30" onClick={() => setGameState(s => ({...s, mode: 'playing'}))}>
              <div className="bg-slate-800 p-4 rounded-lg flex flex-col gap-2 justify-center max-w-lg" onClick={e => e.stopPropagation()}>
                <h3 className="w-full text-center text-xl font-bold mb-2">Upgrades for {def.name}</h3>
                {Object.entries(def.upgrades).map(([tier, upgrades]) => (
                  <div key={tier}>
                    <h4 className="font-semibold text-indigo-300 mb-1 capitalize">{tier.replace('tier', 'Tier ')}</h4>
                    <div className="flex flex-wrap gap-2">
                      {upgrades.map(upgrade => {
                        const isPurchased = tower.purchasedUpgrades?.includes(upgrade.id);
                        const hasPrereq = !upgrade.requires || upgrade.requires.every(req => tower.purchasedUpgrades?.includes(req));
                        const hasChosenPath = upgrade.path && tower.path && tower.path !== upgrade.path;
                        const discountLevels = gameState.playerUpgrades.filter(u => u === 'tower_discount').length;
                        const finalCost = Math.round(upgrade.cost * Math.pow(0.9, discountLevels));
                        return (
                          <button key={upgrade.id} onClick={() => handlePurchaseTowerUpgrade(upgrade)} disabled={isPurchased || gameState.gold < finalCost || !hasPrereq || hasChosenPath} className="p-3 bg-slate-700 rounded hover:bg-indigo-600 disabled:bg-slate-900 disabled:text-slate-600 text-center w-40">
                            <p className="text-md font-bold">{upgrade.name}</p>
                            <p className="text-xs text-slate-400 h-8">{upgrade.description}</p>
                            <p className="text-sm mt-1">{isPurchased ? 'Purchased' : !hasPrereq ? 'Locked' : hasChosenPath ? 'Wrong Path' : `Cost: ${finalCost}g`}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
        {(gameState.mode === 'gameover' || gameState.mode === 'won') && ( <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-20"><h3 className={`text-4xl font-bold mb-2 ${gameState.mode === 'won' ? 'text-green-400' : 'text-red-500'}`}>{gameState.mode === 'won' ? 'Victory!' : 'Game Over!'}</h3><p className="text-2xl text-white mb-4">Final Score: {gameState.score}</p><button onClick={() => setGameState(s => ({...s, mode: 'menu'}))} className="px-8 py-4 bg-blue-500 text-white font-bold rounded-lg text-2xl hover:bg-blue-600 shadow-xl">Main Menu</button></div> )}
      </div>
      <div className="w-full max-w-4xl mt-3 p-3 bg-slate-900/50 border border-slate-700 rounded-lg flex justify-center items-center gap-4">
        <p className="text-sm font-bold text-slate-400 mr-4">Temporary Buffs:</p>
        {Object.entries(survivorBuffDefinitions).map(([key, def]) => {
          const isActive = gameState.player?.activeBuffs?.[key] > 0;
          const canAfford = (gameState.gold || 0) >= def.cost;
          return ( <button key={key} onClick={() => handleActivateBuff(key)} disabled={isActive || !canAfford || gameState.mode !== 'playing'} className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-indigo-600 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors"><p className="font-semibold">{def.name}</p><p className="text-xs">{isActive ? `Active (${Math.ceil((gameState.player.activeBuffs[key] || 0) / 1000)}s)` : `Cost: ${def.cost}g`}</p></button> );
        })}
      </div>
      <p className="text-slate-500 mt-2 text-sm">Controls: A/D or ⬅️➡️ to move. Click an enemy to answer a question. On correct, click and drag to aim and release to fire.</p>
    </div>
  );
};


export { FlashcardFortressGame, FlashcardFortressQuizModal, FlashcardFortressLevelUpModal, PlayerIcon, EnemyIcons, ProjectileVisuals };
