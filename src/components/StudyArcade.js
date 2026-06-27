import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import AsteroidAnnihilator from './AsteroidAnnihilator';
import PlatformerGame from './PlatformerGame';
import DefinitionDescent from './DefinitionDescent';
import { FlashcardFortressGame } from './FlashcardFortressGame';

const StudyArcade = ({ studyZoneState, showMessageBox, stats }) => {
  const [activeGame, setActiveGame] = useState('menu'); // 'menu', 'asteroid', 'descent', 'run'

  const parsedFlashcards = useMemo(() => {
    // NEW: Aggregate cards from all decks in the new data structure
    if (!studyZoneState.cardData) return [];
    return Object.values(studyZoneState.cardData).flat();
  }, [studyZoneState.cardData]);

  const GameCard = ({ title, description, onClick, disabled = false }) => (
    <div className={`bg-slate-800/50 border border-slate-700 p-6 rounded-lg text-center flex flex-col ${disabled ? 'opacity-50' : 'hover:bg-slate-800/80 transition-colors'}`}>
      <h4 className="text-2xl font-bold text-white">{title}</h4>
      <p className="text-sm text-slate-400 mt-2 flex-grow">{description}</p>
      {disabled ? (
        <span className="mt-4 block w-full bg-slate-600 text-slate-400 font-bold py-3 rounded-lg cursor-not-allowed">Coming Soon</span>
      ) : (
        <button onClick={onClick} className="mt-4 w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">
          Play Now
        </button>
      )}
    </div>
  );

  if (activeGame !== 'menu') {
    return (
      <div>
        <button onClick={() => setActiveGame('menu')} className="mb-4 bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-500">
          ← Back to Arcade Menu
        </button>
        {activeGame === 'asteroid' && <AsteroidAnnihilator flashcards={parsedFlashcards} showMessageBox={showMessageBox} />}
        {activeGame === 'descent' && <DefinitionDescent flashcards={parsedFlashcards} showMessageBox={showMessageBox} />}
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h3 className="text-4xl font-bold text-white">Study Arcade</h3>
        <p className="text-slate-400 mt-2">Quick, fun games to test your knowledge.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <GameCard 
          title="Asteroid Annihilator"
          description="Shoot the correct asteroid that matches the definition. Drills rapid recognition under pressure."
          onClick={() => setActiveGame('asteroid')}
        />
        <GameCard 
          title="Definition Descent"
          description="Jump your way up an endless tower of platforms by landing on the correct term."
          onClick={() => setActiveGame('descent')}
        />
        <GameCard 
          title="Term-ple Run"
          description="Switch lanes to run through the correct gate in a fast-paced, endless runner."
          disabled={true}
        />
      </div>
    </div>
  );
};


export default StudyArcade;
