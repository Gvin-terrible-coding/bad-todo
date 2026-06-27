import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { showMessageBox } from '../utils/helpers';

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


export default DefinitionDescent;
