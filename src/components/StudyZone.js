import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { increment } from 'firebase/firestore';
import { deleteField } from '../utils/firestore';
import StudyArcade from './StudyArcade';
import FlashcardRogue from '../FlashcardRogue';
import { PlatformerGame } from './PlatformerGame';
import { FlashcardFortressGame } from './FlashcardFortressGame';

const StudyZone = ({ stats, updateStatsInFirestore, showMessageBox, processAchievement, isMobile, actionLock }) => {
    const [activeTab, setActiveTab] = useState('flashcards');
    const [isStudying, setIsStudying] = useState(false);
    const [studyQueue, setStudyQueue] = useState([]);
    
    // This is our single source of truth for all study zone data.
    const studyZoneState = stats?.studyZone || { platformerHighScore: 0, deckHierarchy: [], cardData: {} };
    
    // This function will now handle all updates to the studyZone object.
    const updateStudyZoneState = useCallback((newState) => {
        const updatedStudyZone = { ...studyZoneState, ...newState };
        // Return the promise from the parent update function for actionLock
        return updateStatsInFirestore({ studyZone: updatedStudyZone });
    }, [studyZoneState, updateStatsInFirestore]);
    
    // --- ONE-TIME MIGRATION ---
    useEffect(() => {
        // Check if old data exists and new structure doesn't
        if (studyZoneState.flashcardsText && (!studyZoneState.deckHierarchy || studyZoneState.deckHierarchy.length === 0)) {
            console.log("Performing one-time migration of old flashcard data...");
            const parsedCards = (studyZoneState.flashcardsText || '').split('\n')
                .map((line, index) => {
                    const parts = line.split(/→|>>|-/);
                    if (parts.length >= 2) {
                        const front = parts[0].trim();
                        const back = parts.slice(1).join('').trim();
                        const srsData = studyZoneState.flashcardData?.[front] || { repetition: 0, easinessFactor: 2.5, interval: 0, nextReviewDate: new Date().setHours(0,0,0,0) };
                        return { id: `card_${Date.now()}_${index}`, front, back, ...srsData };
                    }
                    return null;
                }).filter(Boolean);

            if (parsedCards.length > 0) {
                const defaultDeckId = `deck_${Date.now()}`;
                const newHierarchy = [{ id: defaultDeckId, name: "My First Deck", type: "deck", parentId: "root" }];
                const newCardData = { [defaultDeckId]: parsedCards };

                // Update firestore and clear out old fields
                updateStudyZoneState({
                    deckHierarchy: newHierarchy,
                    cardData: newCardData,
                    flashcardsText: deleteField(), // Use deleteField to remove old data
                    flashcardData: deleteField(),
                });
                showMessageBox("Your flashcards have been migrated to the new deck system!", "info");
            }
        }
    }, [studyZoneState, updateStudyZoneState]);

    const handleStartStudy = (cardQueue) => {
        if (cardQueue.length === 0) {
            showMessageBox("No cards are due for review in this selection.", "info");
            return;
        }
        setStudyQueue(cardQueue);
        setIsStudying(true);
    };

    const StudyZoneTabButton = ({ tabName, children }) => (
      <button onClick={() => setActiveTab(tabName)} className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === tabName ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}>
        {children}
      </button>
    );

    return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">Study Zone</h2>
          <p className="text-slate-400">Create decks, organize with folders, and use SRS to master your material.</p>
        </div>
      </div>
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl">
        <div className="relative z-10 flex border-b border-slate-700">
          <StudyZoneTabButton tabName="flashcards">Flashcard Deck</StudyZoneTabButton>
          <StudyZoneTabButton tabName="rogue">Flashcard Rogue</StudyZoneTabButton>
          <StudyZoneTabButton tabName="arcade">Study Arcade</StudyZoneTabButton>
          <StudyZoneTabButton tabName="fortress">Flashcard Fortress</StudyZoneTabButton>
          <StudyZoneTabButton tabName="platformer">Platformer Game</StudyZoneTabButton>
        </div>
        <div className="p-6">
          {activeTab === 'arcade' && <StudyArcade studyZoneState={studyZoneState} showMessageBox={showMessageBox} stats={stats} />}
          {activeTab === 'rogue' && (
            (studyZoneState.cardData && Object.keys(studyZoneState.cardData).length > 0) ? 
              <FlashcardRogue studyZoneState={studyZoneState} showMessageBox={showMessageBox} stats={stats} /> : 
              <div className="text-center p-8"><p className="text-slate-400">Loading Flashcards from Firebase...</p></div>
          )}
          {activeTab === 'platformer' && <PlatformerGame stats={stats} updateStatsInFirestore={updateStatsInFirestore} studyZoneState={studyZoneState} updateStudyZoneState={updateStudyZoneState} showMessageBox={showMessageBox} processAchievement={processAchievement} isMobile={isMobile} />}
          {activeTab === 'fortress' && <FlashcardFortressGame stats={stats} studyZoneState={studyZoneState} updateStudyZoneState={updateStudyZoneState} showMessageBox={showMessageBox} processAchievement={processAchievement} />}
          {activeTab === 'flashcards' && (
            isStudying ? 
            <FlashcardSession studyQueue={studyQueue} studyZoneState={studyZoneState} updateStudyZoneState={updateStudyZoneState} onSessionEnd={() => setIsStudying(false)} /> :
            <FlashcardSystem studyZoneState={studyZoneState} updateStudyZoneState={updateStudyZoneState} onStartStudy={handleStartStudy} showMessageBox={showMessageBox} actionLock={actionLock} />
          )}
        </div>
      </div>
    </div>
  );
};

const CreateItemModal = ({ isOpen, onClose, onSubmit, itemType, parentId }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim(), itemType, parentId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70]" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg w-full max-w-md" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4">Create New {itemType === 'deck' ? 'Deck' : 'Folder'}</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`${itemType === 'deck' ? 'Deck' : 'Folder'} Name`}
            className="w-full p-2 bg-slate-800 rounded border border-slate-600"
            autoFocus
          />
          <div className="flex justify-end gap-3 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-600 rounded">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-indigo-600 rounded">Create</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DeleteFolderModal = ({ isOpen, onClose, onConfirmDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[70]" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 p-6 rounded-lg w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <h3 className="text-xl font-bold text-red-400 mb-4">Confirm Deletion</h3>
        <p className="text-slate-300 mb-6">How do you want to handle the items inside this folder?</p>
        <div className="flex justify-around gap-4">
          <button onClick={() => onConfirmDelete(true)} className="flex-1 px-4 py-3 bg-red-800 rounded hover:bg-red-700">
            <p className="font-bold">Delete Everything</p>
            <p className="text-xs text-red-200">Deletes the folder and all decks/folders inside it permanently.</p>
          </button>
          <button onClick={() => onConfirmDelete(false)} className="flex-1 px-4 py-3 bg-slate-600 rounded hover:bg-slate-500">
            <p className="font-bold">Keep Contents</p>
            <p className="text-xs text-slate-300">Deletes the folder but moves its contents up one level.</p>
          </button>
        </div>
      </div>
    </div>
  );
};

const FlashcardSystem = ({ studyZoneState, updateStudyZoneState, onStartStudy, showMessageBox, actionLock }) => {
  const [activeDeckId, setActiveDeckId] = useState(null);
  const [editMode, setEditMode] = useState('structured'); // 'structured' or 'bulk'
  const [deckContent, setDeckContent] = useState({ cards: [], text: '' });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [modalState, setModalState] = useState({ type: null, parentId: null });
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, type }

  const hierarchy = studyZoneState.deckHierarchy || [];
  const cardData = studyZoneState.cardData || {};

  // Effect to load deck content when activeDeckId changes
  useEffect(() => {
    if (activeDeckId) {
      if (hasUnsavedChanges && !window.confirm("You have unsaved changes. Are you sure you want to switch decks? Your changes will be lost.")) {
        // Revert activeDeckId if user cancels
        setActiveDeckId(prevId => prevId); // This is a bit tricky, might need a better state management for prevId
        return;
      }
      const cards = cardData[activeDeckId] || [];
      const text = cards.map(c => `${c.front} → ${c.back}`).join('\n');
      setDeckContent({ cards, text });
      setHasUnsavedChanges(false);
    } else {
      setDeckContent({ cards: [], text: '' });
      setHasUnsavedChanges(false);
    }
  }, [activeDeckId, cardData, hasUnsavedChanges]);

  const handleSaveChanges = () => actionLock(async () => {
    if (!activeDeckId) return;
    let cardsToSave = [];
    if (editMode === 'bulk') {
      // Parse text back into structured cards, preserving SRS data
      const oldCardsMap = new Map((cardData[activeDeckId] || []).map(c => [c.front, c]));
      cardsToSave = deckContent.text.split('\n').filter(Boolean).map((line, index) => {
        const parts = line.split(/→|>>|-/);
        const front = parts[0]?.trim();
        const back = parts.slice(1).join('→').trim();
        if (!front || !back) return null;
        const existingData = oldCardsMap.get(front);
        return {
          id: existingData?.id || `card_${Date.now()}_${index}`,
          front,
          back,
          ...(existingData || { repetition: 0, easinessFactor: 2.5, interval: 0, nextReviewDate: new Date().setHours(0,0,0,0) })
        };
      }).filter(Boolean);
    } else {
      cardsToSave = deckContent.cards;
    }
    
    await updateStudyZoneState({ cardData: { ...cardData, [activeDeckId]: cardsToSave } });
    setHasUnsavedChanges(false);
    showMessageBox("Deck saved successfully!", "info");
  });

  const handleCardChange = (index, field, value) => {
    const newCards = [...deckContent.cards];
    newCards[index][field] = value;
    setDeckContent(prev => ({ ...prev, cards: newCards }));
    setHasUnsavedChanges(true);
  };

  const handleAddCard = () => {
    const newCard = { id: `card_${Date.now()}`, front: '', back: '', repetition: 0, easinessFactor: 2.5, interval: 0, nextReviewDate: new Date().setHours(0,0,0,0) };
    setDeckContent(prev => ({ ...prev, cards: [...prev.cards, newCard] }));
    setHasUnsavedChanges(true);
  };

  const handleDeleteCard = (index) => {
    const newCards = deckContent.cards.filter((_, i) => i !== index);
    setDeckContent(prev => ({ ...prev, cards: newCards }));
    setHasUnsavedChanges(true);
  };
  
  const handleCreateItem = (name, type, parentId) => {
    const newItem = { id: `${type}_${Date.now()}`, name, type, parentId: parentId || 'root' };
    const newHierarchy = [...hierarchy, newItem];
    updateStudyZoneState({ deckHierarchy: newHierarchy });
    setModalState({ type: null });
    if (type === 'deck') setActiveDeckId(newItem.id);
  };
  
  const handleDeleteItem = (id, type) => {
    if (type === 'deck') {
      const newHierarchy = hierarchy.filter(item => item.id !== id);
      const newCardData = { ...cardData };
      delete newCardData[id];
      updateStudyZoneState({ deckHierarchy: newHierarchy, cardData: newCardData });
      if (activeDeckId === id) setActiveDeckId(null);
    } else { // It's a folder
      setDeleteTarget({ id, type });
    }
  };
  
  const handleConfirmDeleteFolder = (deleteContents) => {
    let newHierarchy = [...hierarchy];
    let newCardData = { ...cardData };
    
    const itemsToDelete = new Set();
    const queue = [deleteTarget.id];
    itemsToDelete.add(deleteTarget.id);
    
    while(queue.length > 0) {
      const currentId = queue.shift();
      const children = newHierarchy.filter(item => item.parentId === currentId);
      children.forEach(child => {
        itemsToDelete.add(child.id);
        if (child.type === 'folder') queue.push(child.id);
      });
    }

    if (deleteContents) {
      newHierarchy = newHierarchy.filter(item => !itemsToDelete.has(item.id));
      itemsToDelete.forEach(id => {
        if (cardData[id]) delete newCardData[id];
      });
    } else {
      const folderToDelete = newHierarchy.find(item => item.id === deleteTarget.id);
      const newParentId = folderToDelete.parentId;
      newHierarchy = newHierarchy.map(item => {
        if (item.parentId === deleteTarget.id) {
          return { ...item, parentId: newParentId };
        }
        return item;
      }).filter(item => item.id !== deleteTarget.id);
    }
    
    updateStudyZoneState({ deckHierarchy: newHierarchy, cardData: newCardData });
    setDeleteTarget(null);
  };

  const calculateDueCards = (itemId, type) => {
    const today = new Date().setHours(0, 0, 0, 0);
    let dueCount = 0;
    
    if (type === 'deck') {
      dueCount = (cardData[itemId] || []).filter(c => new Date(c.nextReviewDate).getTime() <= today).length;
    } else { // folder
      const queue = [itemId];
      const visited = new Set([itemId]);
      while(queue.length > 0) {
        const currentId = queue.shift();
        const children = hierarchy.filter(item => item.parentId === currentId);
        children.forEach(child => {
          if (!visited.has(child.id)) {
            if (child.type === 'deck') {
              dueCount += (cardData[child.id] || []).filter(c => new Date(c.nextReviewDate).getTime() <= today).length;
            } else {
              queue.push(child.id);
            }
            visited.add(child.id);
          }
        });
      }
    }
    return dueCount;
  };

  const handleStudy = (itemId, type) => {
    const today = new Date().setHours(0, 0, 0, 0);
    let cardQueue = [];

    if (type === 'deck') {
      cardQueue = (cardData[itemId] || []).filter(c => new Date(c.nextReviewDate).getTime() <= today);
    } else { // folder
       const queue = [itemId];
       const visited = new Set([itemId]);
       while(queue.length > 0) {
         const currentId = queue.shift();
         const children = hierarchy.filter(item => item.parentId === currentId);
         children.forEach(child => {
           if (!visited.has(child.id)) {
             if (child.type === 'deck') {
               cardQueue.push(...(cardData[child.id] || []).filter(c => new Date(c.nextReviewDate).getTime() <= today));
             } else {
               queue.push(child.id);
             }
             visited.add(child.id);
           }
         });
       }
    }
    onStartStudy(cardQueue);
  };

  const renderHierarchy = (parentId = 'root', level = 0) => {
    return hierarchy
      .filter(item => item.parentId === parentId)
      .map(item => (
        <div key={item.id}>
          <div 
            onClick={() => item.type === 'deck' && setActiveDeckId(item.id)}
            className={`flex items-center justify-between p-2 rounded cursor-pointer group ${activeDeckId === item.id ? 'bg-indigo-600/50' : 'hover:bg-slate-700/50'}`}
            style={{ paddingLeft: `${level * 16 + 8}px` }}
          >
            <span className="flex items-center gap-2 text-sm">
              {item.type === 'folder' ? '📁' : '📄'} {item.name}
            </span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
              <button onClick={(e) => { e.stopPropagation(); handleStudy(item.id, item.type);}} className="text-xs bg-green-600 px-2 py-0.5 rounded">Study ({calculateDueCards(item.id, item.type)})</button>
              {item.type === 'folder' && <button onClick={(e) => { e.stopPropagation(); setModalState({ type: 'deck', parentId: item.id })}} className="text-xs bg-slate-600 px-2 py-0.5 rounded">+</button>}
              <button onClick={(e) => { e.stopPropagation(); handleDeleteItem(item.id, item.type)}} className="text-xs bg-red-600 px-2 py-0.5 rounded">🗑️</button>
            </div>
          </div>
          {item.type === 'folder' && level < 2 && renderHierarchy(item.id, level + 1)}
        </div>
      ));
  };

  return (
    <div className="flex gap-6 h-[70vh]">
      <CreateItemModal isOpen={modalState.type !== null} onClose={() => setModalState({ type: null })} onSubmit={handleCreateItem} itemType={modalState.type} parentId={modalState.parentId} />
      <DeleteFolderModal isOpen={deleteTarget !== null} onClose={() => setDeleteTarget(null)} onConfirmDelete={handleConfirmDeleteFolder} />
      {/* Left Sidebar */}
      <div className="w-1/3 bg-slate-900/50 rounded-lg p-3 flex flex-col">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-bold text-white">Decks & Folders</h3>
          <div className="flex gap-2">
            <button onClick={() => setModalState({ type: 'deck', parentId: 'root' })} className="px-2 py-1 text-xs bg-slate-700 rounded hover:bg-slate-600">New Deck</button>
            <button onClick={() => setModalState({ type: 'folder', parentId: 'root' })} className="px-2 py-1 text-xs bg-slate-700 rounded hover:bg-slate-600">New Folder</button>
          </div>
        </div>
        <div className="flex-grow overflow-y-auto space-y-1 pr-2">
          {renderHierarchy()}
        </div>
      </div>

      {/* Right Content */}
      <div className="w-2/3 bg-slate-900/50 rounded-lg p-4 flex flex-col">
        {activeDeckId ? (
          <>
            <div className="flex justify-between items-center mb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <button onClick={() => setEditMode('structured')} className={`px-3 py-1 text-sm rounded ${editMode === 'structured' ? 'bg-indigo-600' : 'bg-slate-700'}`}>Structured</button>
                <button onClick={() => setEditMode('bulk')} className={`px-3 py-1 text-sm rounded ${editMode === 'bulk' ? 'bg-indigo-600' : 'bg-slate-700'}`}>Bulk Edit</button>
              </div>
              <button onClick={handleSaveChanges} disabled={!hasUnsavedChanges} className="px-4 py-2 bg-green-600 rounded disabled:bg-slate-600">Save</button>
            </div>
            <div className="flex-grow overflow-y-auto pr-2">
              {editMode === 'structured' ? (
                <div className="space-y-3">
                  {deckContent.cards.map((card, index) => (
                    <div key={card.id} className="flex gap-2 items-start">
                      <input type="text" value={card.front} onChange={e => handleCardChange(index, 'front', e.target.value)} placeholder="Front" className="flex-1 p-2 bg-slate-700 rounded" />
                      <input type="text" value={card.back} onChange={e => handleCardChange(index, 'back', e.target.value)} placeholder="Back" className="flex-1 p-2 bg-slate-700 rounded" />
                      <button onClick={() => handleDeleteCard(index)} className="p-2 bg-red-800 rounded">🗑️</button>
                    </div>
                  ))}
                  <button onClick={handleAddCard} className="w-full p-2 mt-3 bg-slate-700 rounded hover:bg-slate-600">Add Card</button>
                </div>
              ) : (
                <textarea
                  value={deckContent.text}
                  onChange={e => { setDeckContent(prev => ({...prev, text: e.target.value})); setHasUnsavedChanges(true); }}
                  className="w-full h-full p-3 bg-slate-800 rounded font-mono"
                  placeholder="Front → Back"
                />
              )}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">Select a deck to view or edit its contents.</div>
        )}
      </div>
    </div>
  );
};

const FlashcardSession = ({ studyQueue, studyZoneState, updateStudyZoneState, onSessionEnd }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const calculateSRS = (cardData, quality) => {
        let { repetition, easinessFactor, interval } = cardData;

        if (quality < 3) {
            repetition = 0;
            interval = 1;
        } else {
            repetition += 1;
            easinessFactor = Math.max(1.3, easinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
            if (repetition === 1) interval = 1;
            else if (repetition === 2) interval = 6;
            else interval = Math.ceil(interval * easinessFactor);
        }

        const nextReviewDate = new Date();
        nextReviewDate.setDate(nextReviewDate.getDate() + interval);
        
        return { ...cardData, repetition, easinessFactor, interval, nextReviewDate: nextReviewDate.setHours(0,0,0,0) };
    };

    const handleRating = (quality) => {
      const cardToUpdate = studyQueue[currentIndex];
      const updatedSRSData = calculateSRS(cardToUpdate, quality);
      
      const { front, ...srsDataWithBack } = updatedSRSData;
  
      // Find which deck this card belongs to
      let targetDeckId = null;
      for (const deckId in studyZoneState.cardData) {
          if (studyZoneState.cardData[deckId].some(c => c.id === cardToUpdate.id)) {
              targetDeckId = deckId;
              break;
          }
      }
  
      if (targetDeckId) {
          const newDeckCards = studyZoneState.cardData[targetDeckId].map(c => 
              c.id === cardToUpdate.id ? { ...c, ...srsDataWithBack } : c
          );
          const newCardData = { ...studyZoneState.cardData, [targetDeckId]: newDeckCards };
          updateStudyZoneState({ cardData: newCardData });
      }

      if (currentIndex + 1 >= studyQueue.length) {
          onSessionEnd();
      } else {
          setCurrentIndex(i => i + 1);
          setIsFlipped(false);
      }
    };

    if (!studyQueue || studyQueue.length === 0) {
        return (
            <div className="text-center">
                <h3 className="text-2xl font-semibold text-white mb-2">All Done!</h3>
                <p className="text-slate-400 mb-4">You've reviewed all your due cards for today. Great work!</p>
                <button onClick={onSessionEnd} className="bg-indigo-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-indigo-700">Back to Manager</button>
            </div>
        );
    }
    
    const currentCard = studyQueue[currentIndex];
    const progressPercent = ((currentIndex + 1) / studyQueue.length) * 100;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-white">Study Session</h3>
                <button onClick={onSessionEnd} className="text-sm text-slate-400 hover:text-white">End Session</button>
            </div>
            
            <div className="w-full bg-slate-700 rounded-full h-2.5 mb-6">
              <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${progressPercent}%` }}></div>
            </div>

            <div className="relative w-full h-64 perspective-1000">
                <div className={`absolute w-full h-full transition-transform duration-500 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    <div className="absolute w-full h-full backface-hidden bg-slate-700 rounded-lg flex flex-col items-center justify-center p-4">
                        <p className="text-slate-400 mb-2">FRONT</p>
                        <p className="text-3xl text-center font-bold text-white">{currentCard.front}</p>
                    </div>
                    <div className="absolute w-full h-full backface-hidden bg-slate-700 rounded-lg flex flex-col items-center justify-center p-4 rotate-y-180">
                        <p className="text-slate-400 mb-2">BACK</p>
                        <p className="text-3xl text-center font-bold text-white">{currentCard.back}</p>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                {!isFlipped ? (
                    <button onClick={() => setIsFlipped(true)} className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg text-xl hover:bg-blue-700">Show Answer</button>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <button onClick={() => handleRating(0)} className="py-3 bg-red-800 hover:bg-red-700 rounded-lg">Forgot</button>
                        <button onClick={() => handleRating(3)} className="py-3 bg-orange-700 hover:bg-orange-600 rounded-lg">Hard</button>
                        <button onClick={() => handleRating(4)} className="py-3 bg-green-700 hover:bg-green-600 rounded-lg">Good</button>
                        <button onClick={() => handleRating(5)} className="py-3 bg-sky-600 hover:bg-sky-500 rounded-lg">Easy</button>
                    </div>
                )}
            </div>
        </div>
    );
}; 


export { StudyZone, CreateItemModal, DeleteFolderModal, FlashcardSystem, FlashcardSession };
