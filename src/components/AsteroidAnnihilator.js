import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { showMessageBox } from '../utils/helpers';

const AsteroidAnnihilator = ({ flashcards, showMessageBox }) => {
  const GAME_WIDTH = 960;
  const GAME_HEIGHT = 540;
  const gameAreaRef = useRef(null);
  const gameLoopRef = useRef(null);
  const lastTimeRef = useRef(0);
  const keysRef = useRef({});
  
  const [gameState, setGameState] = useState({
    mode: 'menu',
    score: 0,
    combo: 0,
    prompt: null,
    asteroids: [],
    projectiles: [],
    player: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50, fireCooldown: 0 },
    highScore: 0, // We'll need to load this from stats later
  });

  const generateNewProblem = (currentCards) => {
    if (currentCards.length < 4) return null;

    let availableCards = [...currentCards];
    const correctCardIndex = Math.floor(Math.random() * availableCards.length);
    const correctCard = availableCards.splice(correctCardIndex, 1)[0];
    
    let distractors = [];
    for (let i = 0; i < 3; i++) {
      if (availableCards.length === 0) break;
      const distractorIndex = Math.floor(Math.random() * availableCards.length);
      distractors.push(availableCards.splice(distractorIndex, 1)[0]);
    }
    
    return {
      prompt: correctCard.back,
      correctAnswer: correctCard.front,
      distractors: distractors.map(d => d.front),
    };
  };

  const resetGame = () => {
    setGameState(s => ({
      ...s,
      mode: 'playing',
      score: 0,
      combo: 0,
      prompt: generateNewProblem(flashcards),
      asteroids: [],
      projectiles: [],
      player: { x: GAME_WIDTH / 2, y: GAME_HEIGHT - 50, fireCooldown: 0 },
    }));
  };

  useEffect(() => {
    const handleKey = e => { keysRef.current[e.key.toLowerCase()] = e.type === 'keydown'; };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
  }, []);

  useEffect(() => {
    if (gameState.mode !== 'playing') {
      if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
      lastTimeRef.current = 0;
      return;
    }

    const gameLoop = (timestamp) => {
      if (lastTimeRef.current === 0) lastTimeRef.current = timestamp;
      let dt = (timestamp - lastTimeRef.current) / 16.67; // Normalize to 60 FPS
      lastTimeRef.current = timestamp;
      if (dt > 3) dt = 1;

      setGameState(s => {
        if (s.mode !== 'playing') return s;
        let newState = JSON.parse(JSON.stringify(s));

        // Player Movement & Firing
        if (newState.player.fireCooldown > 0) newState.player.fireCooldown -= dt;
        if (keysRef.current['a'] || keysRef.current['arrowleft']) newState.player.x -= 5 * dt;
        if (keysRef.current['d'] || keysRef.current['arrowright']) newState.player.x += 5 * dt;
        newState.player.x = Math.max(25, Math.min(GAME_WIDTH - 25, newState.player.x));

        if ((keysRef.current[' '] || keysRef.current['w']) && newState.player.fireCooldown <= 0) {
          newState.projectiles.push({ id: Math.random(), x: newState.player.x, y: newState.player.y });
          newState.player.fireCooldown = 20; // Cooldown frames
        }
        
        // Projectile Movement
        newState.projectiles = newState.projectiles.filter(p => {
          p.y -= 8 * dt;
          return p.y > -10;
        });

        // Asteroid Spawning (Staggered & Randomized)
        if (newState.prompt && newState.asteroids.length === 0) {
          let answers = [
            { text: newState.prompt.correctAnswer, isCorrect: true },
            ...newState.prompt.distractors.map(d => ({ text: d, isCorrect: false }))
          ];

          // --- THIS IS THE FIX: Shuffle the answers before creating asteroids ---
          for (let i = answers.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [answers[i], answers[j]] = [answers[j], answers[i]];
          }

          answers.forEach((answer, index) => {
            newState.asteroids.push({
              id: Math.random(),
              text: answer.text,
              isCorrect: answer.isCorrect,
              x: Math.random() * (GAME_WIDTH - 100) + 50,
              y: -50 - (index * 100), // Increased stagger distance for clarity
              speed: 1 + (s.score / 2000),
            });
          });
        }
        
        // Asteroid Movement & Loss Condition
        let gameOver = false;
        newState.asteroids.forEach(a => {
          a.y += a.speed * dt;
          if (a.isCorrect && a.y > GAME_HEIGHT) {
            gameOver = true;
          }
        });
        if (gameOver) {
          showMessageBox("Game Over: Correct asteroid missed!", "error");
          return { ...s, mode: 'gameover' };
        }
        newState.asteroids = newState.asteroids.filter(a => a.y < GAME_HEIGHT + 50);

        // Collision Detection
        let hitOccurred = false;
        newState.projectiles = newState.projectiles.filter(p => {
          for (let i = newState.asteroids.length - 1; i >= 0; i--) {
            const a = newState.asteroids[i];
            if (Math.hypot(p.x - a.x, p.y - a.y) < 40) {
              if (a.isCorrect) {
                newState.score += 100 + newState.combo * 10;
                newState.combo += 1;
                newState.asteroids = []; // Clear all asteroids
                newState.prompt = generateNewProblem(flashcards);
                hitOccurred = true;
              } else {
                showMessageBox("Game Over: Hit wrong asteroid!", "error");
                newState.mode = 'gameover';
              }
              return false; // Remove projectile
            }
          }
          return true; // Keep projectile
        });
        
        if (hitOccurred) newState.projectiles = []; // Clear projectiles on correct hit

        return newState;
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };
    gameLoopRef.current = requestAnimationFrame(gameLoop);

  }, [gameState.mode, flashcards, showMessageBox]);

  if (flashcards.length < 4) {
    return (
      <div className="text-center p-8 bg-slate-900 rounded-lg">
        <h3 className="text-2xl font-bold text-yellow-400">Not Enough Flashcards!</h3>
        <p className="text-slate-300 mt-2">The Study Arcade requires a deck of at least 4 flashcards to play.</p>
        <p className="text-slate-400">Please add more cards in the "Flashcard Deck" tab.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-4xl flex justify-between mb-2 text-white font-bold text-lg">
        <span>Score: {gameState.score}</span>
        <span>Combo: x{gameState.combo}</span>
        <span>High Score: {gameState.highScore}</span>
      </div>
      <div
        ref={gameAreaRef}
        className="relative bg-black border-4 border-slate-900 rounded-lg overflow-hidden"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT, background: '#0a0a1a' }}
      >
        {gameState.mode === 'menu' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center">
            <h3 className="text-4xl font-bold text-white mb-2">Asteroid Annihilator</h3>
            <p className="text-slate-300 mb-6 max-w-md">Shoot the asteroid that matches the definition. Don't hit the wrong one, and don't let the correct one pass!</p>
            <button onClick={resetGame} className="px-8 py-4 bg-green-500 text-white font-bold rounded-lg text-2xl hover:bg-green-600">Start Game</button>
          </div>
        )}

        {gameState.mode === 'gameover' && (
           <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10">
            <h3 className="text-4xl font-bold text-red-500">Game Over</h3>
            <p className="text-2xl text-white my-4">Final Score: {gameState.score}</p>
            <button onClick={resetGame} className="px-8 py-4 bg-blue-500 text-white font-bold rounded-lg text-xl hover:bg-blue-600">Play Again</button>
          </div>
        )}

        {gameState.mode === 'playing' && (
          <>
            <div className="absolute top-0 left-0 right-0 p-4 bg-black/30 text-center">
              <p className="text-xl font-semibold text-white">{gameState.prompt?.prompt}</p>
            </div>
            {/* Player */}
            <div className="absolute w-12 h-12 bg-blue-500" style={{ transform: `translate(${gameState.player.x - 24}px, ${gameState.player.y - 24}px)` }} />
            {/* Asteroids */}
            {gameState.asteroids.map(a => (
              <div key={a.id} className="absolute w-20 h-20 bg-gray-600 rounded-full flex items-center justify-center text-center p-2" style={{ transform: `translate(${a.x - 40}px, ${a.y - 40}px)` }}>
                <span className="text-white font-bold text-xs">{a.text}</span>
              </div>
            ))}
            {/* Projectiles */}
            {gameState.projectiles.map(p => (
              <div key={p.id} className="absolute w-2 h-6 bg-yellow-400" style={{ transform: `translate(${p.x - 1}px, ${p.y - 3}px)` }} />
            ))}
          </>
        )}
      </div>
      <p className="text-slate-500 mt-2 text-sm">Controls: A/D or ⬅️➡️ to move. W or Spacebar to shoot.</p>
    </div>
  );
};


export default AsteroidAnnihilator;
