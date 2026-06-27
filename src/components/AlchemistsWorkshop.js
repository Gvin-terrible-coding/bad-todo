import React, { useState, useEffect, useRef, useCallback } from 'react';
import { increment } from 'firebase/firestore';
import { alchemyIngredients, alchemyPlants, alchemyPotions, catAnimationSheets, alchemyShopItems } from '../constants/constants';

const AlchemistsWorkshop = ({ stats, updateStatsInFirestore, showMessageBox }) => {
  const [activeModal, setActiveModal] = useState(null);
  
  // HOOKS MOVED TO TOP: All hooks must be called before any conditional returns.
  const catObstacles = useMemo(() => [
    { top: 70, left: 20, width: 20, height: 20 }, // Cauldron area
    { top: 68, left: 78, width: 15, height: 15 }, // Bench area
  ], []);

  const alchemyState = stats?.alchemy_state;
  if (!alchemyState) {
    return <div>Loading Alchemist's Workshop...</div>;
  }

  const closeModal = () => setActiveModal(null);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white font-['Cinzel_Decorative']">Alchemist's Workshop</h2>
          <p className="text-slate-400">Brew potions to sell or use as powerful buffs in other games.</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 px-4 py-2 rounded-lg">
          <span className="text-yellow-400 font-bold text-lg">💰 {alchemyState.gold || 0} Gold</span>
        </div>
      </div>

      <div 
        className="relative w-full max-w-5xl mx-auto aspect-[3/2] bg-slate-900 rounded-2xl shadow-xl border border-slate-700 overflow-hidden"
      >
        <div className="absolute inset-0 bg-contain bg-no-repeat bg-center" style={{ backgroundImage: `url(${alchemyLabIndoorBg})` }} />
        <div className="absolute pointer-events-none" style={{ top: '75%', left: '85%', width: '15%', height: '15%', backgroundImage: `url(${alchemyBenchImage})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', transform: 'translate(-50%, -50%)' }} />
        <div className="absolute pointer-events-none" style={{ top: '80%', left: '30%', width: '15%', height: '15%', backgroundImage: `url(${alchemyCauldronImage})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', transform: 'translate(-50%, -50%)' }} />
        
        <AlchemyCat obstacles={catObstacles} equippedAppearance={alchemyState.cat?.equippedAppearance || 'cat1'} />

        {/* --- HOTSPOTS --- */}
        <div className="absolute cursor-pointer group" style={{ top: '70%', left: '81%', width: '9%', height: '12%' }} onClick={() => setActiveModal('bench')} >
           <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" title="Use Alchemy Bench"></div>
        </div>
        <div className="absolute cursor-pointer group" style={{ top: '75%', left: '25%', width: '10%', height: '15%' }} onClick={() => setActiveModal('cauldron')} >
           <div className="absolute inset-0 bg-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" title="Use Cauldron"></div>
        </div>
        <div className="absolute cursor-pointer group" style={{ top: '36%', left: '91%', width: '8%', height: '20%' }} onClick={() => setActiveModal('garden')} >
          <div className="absolute inset-0 bg-green-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" title="Go to Garden"></div>
        </div>
        <div className="absolute cursor-pointer group" style={{ top: '42%', left: '42%', width: '12%', height: '20%' }} onClick={() => setActiveModal('grimoire')} >
          <div className="absolute inset-0 bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" title="Open Grimoire (Recipes)"></div>
        </div>
        <div className="absolute cursor-pointer group" style={{ top: '42%', left: '62%', width: '12%', height: '20%' }} onClick={() => setActiveModal('storeroom')} >
          <div className="absolute inset-0 bg-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" title="Open Storeroom (Inventory)"></div>
        </div>
        <div className="absolute cursor-pointer group" style={{ top: '42%', left: '13%', width: '10%', height: '50%' }} onClick={() => setActiveModal('shop')} >
          <div className="absolute inset-0 bg-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-md" title="Open Shop"></div>
        </div>
        <div className="absolute cursor-pointer group" style={{ top: '82%', left: '89%', width: '10%', height: '10%' }} onClick={() => setActiveModal('cattery')} >
          <div className="absolute inset-0 bg-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full" title="Open Cattery"></div>
        </div>
      </div>

      {/* --- MODALS --- */}
      {activeModal === 'garden' && <GardenModal stats={stats} updateStatsInFirestore={updateStatsInFirestore} onClose={closeModal} />}
      {activeModal === 'bench' && <AlchemyBenchModal stats={stats} updateStatsInFirestore={updateStatsInFirestore} onClose={closeModal} showMessageBox={showMessageBox} />}
      {activeModal === 'cauldron' && <CauldronModal stats={stats} updateStatsInFirestore={updateStatsInFirestore} onClose={closeModal} showMessageBox={showMessageBox} />}
      {activeModal === 'grimoire' && <GrimoireModal stats={stats} updateStatsInFirestore={updateStatsInFirestore} onClose={closeModal} showMessageBox={showMessageBox} />}
      {activeModal === 'storeroom' && <StoreroomModal stats={stats} onClose={closeModal} />}
      {activeModal === 'shop' && <AlchemyShopModal stats={stats} updateStatsInFirestore={updateStatsInFirestore} onClose={closeModal} showMessageBox={showMessageBox} />}
      {activeModal === 'cattery' && <CatteryModal stats={stats} updateStatsInFirestore={updateStatsInFirestore} onClose={closeModal} showMessageBox={showMessageBox} />}
    </div>
  );
};

const CatteryModal = ({ stats, onClose, updateStatsInFirestore, showMessageBox }) => {
  const { cat = {} } = stats.alchemy_state;

  const { unlockedAppearances = ['cat1'], equippedAppearance = 'cat1' } = cat;

  const catDetails = [
    { id: 'cat1', name: 'Silver Tabby', preview: catIdleSheet },
    { id: 'cat2', name: 'Calico Companion', preview: cat2IdleSheet },
    { id: 'cat3', name: 'Sable Shadow', preview: cat3IdleSheet },
    { id: 'cat4', name: 'Golden Bombay', preview: cat4IdleSheet },
    { id: 'cat5', name: 'White Persian', preview: cat5IdleSheet },
    { id: 'cat6', name: 'Siamese Sphinx', preview: cat6IdleSheet },
  ];

  const handleEquip = (catId) => {
    updateStatsInFirestore({ 'alchemy_state.cat.equippedAppearance': catId });
    showMessageBox('Your companion has been changed!', 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-amber-100 border-4 border-amber-800 rounded-lg p-6 flex flex-col" style={{ backgroundColor: '#F3EADF' }} onClick={e => e.stopPropagation()}>
        <h2 className="text-3xl font-['Cinzel_Decorative'] text-amber-900 text-center mb-4">Cattery</h2>
        <p className="text-center text-amber-800/80 mb-4 text-sm">Choose your loyal companion for the workshop.</p>
        <div className="flex-grow bg-black/10 overflow-y-auto p-4 rounded-lg grid grid-cols-2 md:grid-cols-3 gap-4">
          {unlockedAppearances.map(catId => {
            const detail = catDetails.find(c => c.id === catId);
            if (!detail) return null;
            const isEquipped = equippedAppearance === catId;
            return (
              <div key={catId} className={`bg-amber-200/40 p-3 rounded-md text-center flex flex-col ${isEquipped ? 'ring-2 ring-amber-800' : ''}`}>
                <div className="w-20 h-20 mx-auto flex items-center justify-center overflow-hidden">
                  <div
                    style={{
                      width: '80px',
                      height: '80px',
                      backgroundImage: `url(${detail.preview})`,
                      backgroundSize: `${10 * 80}px 80px`, // 10 frames * 80px width
                      backgroundPosition: '0px 0px',
                      backgroundRepeat: 'no-repeat',
                      imageRendering: 'pixelated',
                      flexShrink: 0,
                    }}
                  />
                </div>
                <p className="text-sm font-bold text-amber-900 mt-2 flex-grow">{detail.name}</p>
                <button onClick={() => handleEquip(catId)} disabled={isEquipped} className="mt-2 w-full bg-amber-700 text-white text-sm py-1 rounded hover:bg-amber-800 disabled:bg-slate-500">
                  {isEquipped ? 'Equipped' : 'Select'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const StoreroomModal = ({ stats, onClose }) => {
  const inventory = stats.alchemy_state.inventory || {};
  
  const categorized = useMemo(() => {
    const cats = { raw: [], processed: [], potions: [], seeds: [] };
    for (const itemId in inventory) {
      const itemDef = alchemyIngredients[itemId] || alchemyPotions[itemId] || alchemyPlants[itemId];
      if (!itemDef) continue;
      
      const itemEntry = { ...itemDef, count: inventory[itemId] };
      if (itemDef.type === 'plant' || itemDef.type === 'loot') cats.raw.push(itemEntry);
      else if (itemDef.type === 'processed') cats.processed.push(itemEntry);
      else if (itemDef.type === 'potion') cats.potions.push(itemEntry);
      else if (itemDef.yields) cats.seeds.push(itemEntry);
    }
    return cats;
  }, [inventory]);

  const [activeTab, setActiveTab] = useState('raw');

  const TabButton = ({ name, label }) => (
    <button onClick={() => setActiveTab(name)} className={`px-4 py-2 text-sm font-semibold ${activeTab === name ? 'bg-amber-800 text-white' : 'bg-amber-900/50 text-amber-200'}`}>
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl h-[70vh] bg-amber-100 border-4 border-amber-800 rounded-lg p-6 flex flex-col font-['Lato']" style={{ backgroundColor: '#F3EADF' }} onClick={e => e.stopPropagation()}>
        <h2 className="text-3xl font-['Cinzel_Decorative'] text-amber-900 text-center mb-4">Storeroom</h2>
        <div className="flex rounded-t-lg overflow-hidden border-b-2 border-amber-800">
          <TabButton name="raw" label="Raw Ingredients" />
          <TabButton name="processed" label="Processed" />
          <TabButton name="potions" label="Potions" />
          <TabButton name="seeds" label="Seeds" />
        </div>
        <div className="flex-grow bg-black/10 overflow-y-auto p-4 rounded-b-lg grid grid-cols-2 md:grid-cols-4 gap-4">
          {categorized[activeTab].map(item => (
            <div key={item.id} className="bg-amber-200/40 p-2 rounded-md text-center flex flex-col" title={item.description}>
              <img src={item.icon} alt={item.name} loading="lazy" className="w-16 h-16 mx-auto object-contain" />
              <p className="text-sm font-bold text-amber-900 mt-2 flex-grow">{item.name}</p>
              <p className="text-lg font-mono text-black">x{item.count}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const GrimoireModal = ({ stats, updateStatsInFirestore, onClose, showMessageBox }) => {
  const { alchemy_state } = stats;
  const { unlockedRecipes = [], upgrades = {} } = alchemy_state;
  const grimoireLevel = upgrades.grimoire_level || 1;
  
  const handleResearch = () => {
    const researchCost = [250, 200, 150][grimoireLevel - 1] || 150;
    const allRecipeIds = Object.keys(alchemyPotions).filter(id => !id.includes('_potent'));
    const unlearned = allRecipeIds.filter(id => !unlockedRecipes.includes(id));

    if (unlearned.length === 0) { showMessageBox("You've learned every recipe!", "info"); return; }
    if ((alchemy_state.gold || 0) < researchCost) { showMessageBox("Not enough gold to research.", "error"); return; }
    
    const newRecipeId = unlearned[Math.floor(Math.random() * unlearned.length)];
    
    updateStatsInFirestore({
      'alchemy_state.gold': increment(-researchCost),
      'alchemy_state.unlockedRecipes': [...unlockedRecipes, newRecipeId]
    });
    showMessageBox(`You discovered the recipe for ${alchemyPotions[newRecipeId].name}!`, 'info');
  };

  const researchCost = [250, 200, 150][grimoireLevel - 1] || 150;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl h-[70vh] bg-amber-100 border-4 border-amber-800 rounded-lg p-6 flex flex-col" style={{ backgroundColor: '#F3EADF' }} onClick={e => e.stopPropagation()}>
        <h2 className="text-3xl font-['Cinzel_Decorative'] text-amber-900 text-center mb-4">Grimoire of Potions</h2>
        <div className="flex-grow bg-black/10 overflow-y-auto p-4 rounded-lg space-y-3">
          {unlockedRecipes.map(id => {
            const recipe = alchemyPotions[id];
            if (!recipe) return null;
            return (
              <div key={id} className="bg-amber-200/40 p-3 rounded-md">
                <p className="font-bold text-amber-900">{recipe.name}</p>
                <div className="flex gap-2 mt-1">
                  {recipe.recipe.map((req, i) => {
                    const baseName = req.baseName.replace(/_/g, ' ');
                    return <span key={i} className="text-xs bg-amber-800/80 text-white px-2 py-1 rounded-full capitalize">{req.amount}x {baseName}</span>
                  })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <button onClick={handleResearch} className="w-full bg-amber-800 text-white font-bold py-3 rounded-lg hover:bg-amber-900">
            Research New Recipe ({researchCost} Gold)
          </button>
        </div>
      </div>
    </div>
  );
};

const AlchemyBenchModal = ({ stats, updateStatsInFirestore, onClose, showMessageBox }) => {
  const [gameState, setGameState] = useState('selection');
  const [currentItem, setCurrentItem] = useState(null);
  const [progress, setProgress] = useState(0);
  const [resultQuality, setResultQuality] = useState(null);
  const progressIntervalRef = useRef(null);

  const { inventory = {}, upgrades = {} } = stats.alchemy_state || {};
  const benchLevel = upgrades.bench_level || 1;

  const processableItems = useMemo(() => {
    return Object.keys(inventory)
      .map(id => alchemyIngredients[id])
      .filter(item => item && item.processAs && inventory[item.id] > 0);
  }, [inventory]);

  const startProcessing = (item) => {
    setCurrentItem(item);
    setGameState('processing');
    setProgress(0);
    
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    progressIntervalRef.current = setInterval(() => {
      let shouldStop = false;
      let finalProgress = 0;

      setProgress(p => {
        const nextP = p + 1.5;
        if (nextP >= 100) {
          shouldStop = true;
          finalProgress = p; // Capture the last progress value before exceeding 100
          return 100;
        }
        return nextP;
      });

      if (shouldStop) {
        clearInterval(progressIntervalRef.current);
        handleStopProcessing(finalProgress, item);
      }
    }, 30);
  };

  const handleStopProcessing = (currentProgress, itemBeingProcessed) => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    const item = itemBeingProcessed || currentItem;
    if (!item) {
      console.error("Processing stopped without a valid item.");
      setGameState('selection');
      return;
    }

    let quality;
    const fineZoneStart = 90 - ((benchLevel - 1) * 5); // Level 1: 90, Level 2: 85, Level 3: 80
    const decentZoneStart = 70 - ((benchLevel - 1) * 5); // Level 1: 70, Level 2: 65, Level 3: 60

    if (currentProgress >= fineZoneStart && currentProgress <= 99) {
      quality = 'fine';
    } else if (currentProgress >= decentZoneStart && currentProgress < fineZoneStart) {
      quality = 'decent';
    } else {
      quality = 'crude';
    }
    setResultQuality(quality);

    const processedItemId = `${item.processAs}_${quality}`;
    const processedItemDef = alchemyIngredients[processedItemId];

    if (!processedItemDef) {
        console.error("Could not find definition for processed item:", processedItemId);
        showMessageBox(`Error: Could not process item. Definition missing.`, 'error');
        setGameState('selection');
        return;
    }

    const newInventory = { ...inventory };
    newInventory[item.id] = (newInventory[item.id] || 1) - 1;
    if (newInventory[item.id] <= 0) delete newInventory[item.id];
    newInventory[processedItemId] = (newInventory[processedItemId] || 0) + 1;

    updateStatsInFirestore({ 'alchemy_state.inventory': newInventory });
    showMessageBox(`Created 1x ${processedItemDef.name}!`, 'info');
    
    setGameState('result');
    setTimeout(() => {
      setGameState('selection');
      setCurrentItem(null);
      setResultQuality(null);
    }, 2000);
  };
  
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-2xl bg-amber-100 border-4 border-amber-800 rounded-lg p-6 flex flex-col" style={{ backgroundColor: '#F3EADF', minHeight: '300px' }} onClick={e => e.stopPropagation()}>
        <h2 className="text-3xl font-['Cinzel_Decorative'] text-amber-900 text-center mb-4">Alchemy Bench</h2>
        
        {gameState === 'selection' && (
          <>
            <p className="text-center text-amber-800/80 mb-4 text-sm">Select a raw ingredient to prepare it for the cauldron.</p>
            <div className="flex-grow bg-black/10 overflow-y-auto p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4">
              {processableItems.map(item => (
                <button key={item.id} onClick={() => startProcessing(item)} className="bg-amber-200/40 p-2 rounded-md hover:bg-amber-300/60 transition-colors">
                  <img src={item.icon} alt={item.name} loading="lazy" className="w-16 h-16 mx-auto" />
                  <p className="text-sm font-bold text-amber-900 mt-1">{item.name}</p>
                  <p className="text-xs text-black">x{inventory[item.id]}</p>
                </button>
              ))}
              {processableItems.length === 0 && <p className="col-span-full text-center text-slate-500 self-center">No processable ingredients.</p>}
            </div>
          </>
        )}

        {gameState === 'processing' && (
          <div className="flex flex-col items-center justify-center flex-grow">
            <img src={currentItem.icon} alt={currentItem.name} loading="lazy" className="w-20 h-20 mb-4" />
            <div className="w-full bg-slate-400 rounded-full h-8 border-2 border-slate-600 relative overflow-hidden">
              <div className="absolute top-0 bottom-0 bg-red-600/50" style={{ left: '0%', width: `${70 - ((benchLevel - 1) * 5)}%` }}></div>
              <div className="absolute top-0 bottom-0 bg-green-600/50" style={{ left: `${70 - ((benchLevel - 1) * 5)}%`, width: '20%' }}></div>
              <div className="absolute top-0 bottom-0 bg-yellow-400/70" style={{ left: `${90 - ((benchLevel - 1) * 5)}%`, width: `${9 + ((benchLevel - 1) * 5)}%` }}></div>
              <div className="absolute top-0 bottom-0 bg-slate-800 h-full" style={{ transform: `translateX(${progress}%)`, width: '4px', transition: 'transform 0.03s linear' }}></div>
            </div>
            {/* FIX: Pass currentItem to handleStopProcessing to avoid using stale state on manual stop */}
            <button onClick={() => handleStopProcessing(progress, currentItem)} className="mt-6 bg-amber-800 text-white font-bold py-3 px-8 rounded-lg text-xl hover:bg-amber-900">
              STOP
            </button>
          </div>
        )}
        
        {gameState === 'result' && (
            <div className="flex flex-col items-center justify-center flex-grow animate-fade-in">
              <p className="text-xl font-semibold text-amber-900">Result:</p>
              <p className={`text-4xl font-bold font-['Cinzel_Decorative'] ${resultQuality === 'fine' ? 'text-yellow-500' : resultQuality === 'decent' ? 'text-green-600' : 'text-red-700'}`}>
                {resultQuality.toUpperCase()}
              </p>
            </div>
        )}

      </div>
    </div>
  );
};

const CauldronModal = ({ stats, updateStatsInFirestore, onClose, showMessageBox }) => {
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [cauldronSlots, setCauldronSlots] = useState([]);
  const { inventory = {}, unlockedRecipes = [], upgrades = {} } = stats.alchemy_state || {};
  const cauldronLevel = upgrades.cauldron_level || 1;

  const selectedRecipe = selectedRecipeId ? alchemyPotions[selectedRecipeId] : null;

  const processedInventory = useMemo(() => {
    return Object.entries(inventory)
      .map(([id, count]) => ({ id, def: alchemyIngredients[id], count }))
      .filter(item => item.def && item.def.type === 'processed');
  }, [inventory]);

  const addIngredientToCauldron = (ingredient) => {
    if (!selectedRecipe) { showMessageBox("Select a recipe first.", "info"); return; }
    if (cauldronSlots.length >= selectedRecipe.recipe.length) { showMessageBox("Cauldron is full for this recipe.", "info"); return; }

    const ingredientInCauldronCount = cauldronSlots.filter(i => i.id === ingredient.id).length;
    if (ingredientInCauldronCount >= ingredient.count) { showMessageBox("Not enough of that ingredient.", "error"); return; }

    setCauldronSlots(prev => [...prev, ingredient]);
  };
  
  const removeIngredientFromCauldron = (index) => {
    setCauldronSlots(prev => prev.filter((_, i) => i !== index));
  };

  const handleRecipeSelect = (recipeId) => {
    setSelectedRecipeId(recipeId);
    setCauldronSlots([]); // Clear cauldron when recipe changes
  };

  const handleBrew = () => {
    if (!selectedRecipe || cauldronSlots.length === 0) { showMessageBox("Cauldron is empty or no recipe is selected.", "error"); return; }

    let success = true;
    let totalPotency = 0;
    const required = {};
    selectedRecipe.recipe.forEach(req => {
      required[req.baseName] = (required[req.baseName] || 0) + req.amount;
    });
    
    // Check for recipe match
    if (cauldronSlots.length !== selectedRecipe.recipe.length) {
      success = false;
    } else {
      const added = {};
      cauldronSlots.forEach(ing => {
        const baseName = ing.def.baseName;
        added[baseName] = (added[baseName] || 0) + 1;
        totalPotency += ing.def.potency;
      });
      for(const baseName in required) {
        if (required[baseName] !== added[baseName]) {
          success = false;
          break;
        }
      }
    }

    const failureChance = [1.0, 0.4, 0.15][cauldronLevel - 1] || 0.15;
    if (!success && Math.random() < failureChance) {
      // It's a failure
    } else if (!success) {
      success = true; // Salvaged
      showMessageBox("Your improved cauldron salvaged the brew!", "info");
    }

    const newInventory = { ...inventory };
    
    const shouldSaveIngredients = !success && cauldronLevel === 3 && Math.random() < 0.25; // 25% chance to save on fail with Lvl3
    if (!shouldSaveIngredients) {
        cauldronSlots.forEach(ing => {
            newInventory[ing.id] = (newInventory[ing.id] || 1) - 1;
            if (newInventory[ing.id] <= 0) delete newInventory[ing.id];
        });
    } else {
        showMessageBox("Your Star-Metal Cauldron saved your ingredients!", "info");
    }


    let potionId, message;
    if (success) {
      const isPotent = totalPotency >= selectedRecipe.maxPotency * 0.8; // 80% of max possible potency
      potionId = isPotent ? `${selectedRecipe.id}_potent` : selectedRecipe.id;
      const potionDef = alchemyPotions[potionId] || selectedRecipe;
      message = `Success! You brewed a ${potionDef.name}!`;
    } else {
      potionId = 'dubious_sludge';
      message = "The mixture failed... You created Dubious Sludge.";
    }

    newInventory[potionId] = (newInventory[potionId] || 0) + 1;
    
    updateStatsInFirestore({ 'alchemy_state.inventory': newInventory });
    showMessageBox(message, success ? 'info' : 'error');
    setCauldronSlots([]);
    setSelectedRecipeId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-4xl h-[80vh] bg-amber-100 border-4 border-amber-800 rounded-lg p-6 flex flex-col" style={{ backgroundColor: '#F3EADF' }} onClick={e => e.stopPropagation()}>
        <h2 className="text-3xl font-['Cinzel_Decorative'] text-amber-900 text-center mb-4">The Cauldron</h2>
        <div className="flex-grow flex gap-4">
          {/* Left: Recipe List */}
          <div className="w-1/3 bg-black/10 rounded-lg p-2 overflow-y-auto">
            {unlockedRecipes.map(id => {
              const recipe = alchemyPotions[id];
              return (
                <button key={id} onClick={() => handleRecipeSelect(id)} className={`w-full text-left p-2 rounded mb-1 text-sm ${selectedRecipeId === id ? 'bg-amber-800 text-white' : 'bg-amber-200/50 hover:bg-amber-300/50 text-amber-900'}`}>
                  {recipe.name}
                </button>
              );
            })}
          </div>
          {/* Right: Brewing Interface */}
          <div className="w-2/3 bg-black/10 rounded-lg p-4 flex flex-col">
            {selectedRecipe ? (
              <>
                <h3 className="text-xl font-bold text-amber-900 text-center">{selectedRecipe.name}</h3>
                <p className="text-xs text-center text-slate-600 mb-2">Requires: {selectedRecipe.recipe.map(r => `${r.amount}x ${r.baseName.replace('_', ' ')}`).join(', ')}</p>
                
                <div className="flex-grow flex flex-col items-center justify-center bg-purple-900/20 rounded-lg p-4 min-h-[150px]">
                  <div className="flex gap-2 flex-wrap justify-center">
                    {cauldronSlots.map((ing, i) => (
                      <button key={i} onClick={() => removeIngredientFromCauldron(i)} className="p-1 bg-slate-800 rounded-md">
                        <img src={ing.def.icon} alt={ing.def.name} loading="lazy" className="w-10 h-10" />
                      </button>
                    ))}
                    {Array.from({ length: selectedRecipe.recipe.length - cauldronSlots.length }).map((_, i) => (
                      <div key={i} className="w-12 h-12 bg-black/20 rounded-md border-2 border-dashed border-slate-500" />
                    ))}
                  </div>
                </div>

                <div className="h-40 mt-4 overflow-y-auto bg-slate-200/30 p-2 rounded-lg grid grid-cols-5 gap-2">
                   {processedInventory.length > 0 ? processedInventory.map(ing => (
                      <button key={ing.id} onClick={() => addIngredientToCauldron(ing)} className="p-1 bg-amber-200/50 rounded-md flex flex-col items-center justify-between hover:bg-amber-300/80">
                         <img src={ing.def.icon} alt={ing.def.name} loading="lazy" className="w-10 h-10" />
                         <p className="text-xs text-black">x{ing.count - cauldronSlots.filter(slot => slot.id === ing.id).length}</p>
                      </button>
                   )) : <p className="col-span-full text-center text-slate-500 self-center">No processed ingredients.</p>}
                </div>

                <button onClick={handleBrew} className="w-full mt-4 bg-purple-800 text-white font-bold py-3 rounded-lg hover:bg-purple-900">
                  Brew Potion
                </button>
              </>
            ) : (
              <div className="flex-grow flex items-center justify-center text-slate-500">
                <p>Select a recipe to begin.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const AlchemyShopModal = ({ stats, updateStatsInFirestore, onClose, showMessageBox }) => {
  const [activeTab, setActiveTab] = useState('seeds');
  const { gold = 0, inventory = {}, upgrades = {}, cat = {} } = stats.alchemy_state;
  const { unlockedAppearances = ['cat1'] } = cat;

  const handleTransaction = (item, type) => {
    if (type === 'buy_seed') {
      if (gold < item.cost) { showMessageBox("Not enough gold.", "error"); return; }
      updateStatsInFirestore({ 'alchemy_state.gold': increment(-item.cost), [`alchemy_state.inventory.${item.id}`]: increment(1) });
      showMessageBox(`Purchased 1x ${alchemyPlants[item.id].name}!`, 'info');
    } else if (type === 'buy_ingredient') {
      if (gold < item.cost) { showMessageBox("Not enough gold.", "error"); return; }
      updateStatsInFirestore({ 'alchemy_state.gold': increment(-item.cost), [`alchemy_state.inventory.${item.id}`]: increment(1) });
      showMessageBox(`Purchased 1x ${alchemyIngredients[item.id].name}!`, 'info');
    } else if (type === 'sell_potion') {
      if ((inventory[item.id] || 0) < 1) { showMessageBox("You don't have any to sell.", "error"); return; }
      const potionDef = alchemyPotions[item.id] || alchemyIngredients[item.id];
      const sellValue = Math.round(potionDef.goldValue * 0.75);
      updateStatsInFirestore({ 'alchemy_state.gold': increment(sellValue), [`alchemy_state.inventory.${item.id}`]: increment(-1) });
      showMessageBox(`Sold 1x ${potionDef.name} for ${sellValue} gold.`, 'info');
    } else if (type === 'buy_upgrade') {
      if (gold < item.cost) { showMessageBox("Not enough gold.", "error"); return; }
      const updates = { 'alchemy_state.gold': increment(-item.cost), ...item.action };
      updateStatsInFirestore(updates);
      showMessageBox(`Upgrade purchased: ${item.name}!`, 'info');
    } else if (type === 'buy_cat') {
      if (gold < item.cost) { showMessageBox("Not enough gold.", "error"); return; }
      const updates = { 
        'alchemy_state.gold': increment(-item.cost),
        'alchemy_state.cat.unlockedAppearances': [...unlockedAppearances, item.id]
      };
      updateStatsInFirestore(updates);
      showMessageBox(`You've adopted the ${item.name}!`, 'info');
    }
  };

  const TabButton = ({ name, label }) => (
    <button onClick={() => setActiveTab(name)} className={`px-4 py-2 text-sm font-semibold transition-colors ${activeTab === name ? 'bg-amber-800 text-white' : 'bg-amber-900/50 text-amber-200'}`}>
      {label}
    </button>
  );
  
  const sellablePotions = useMemo(() => {
    return Object.entries(inventory)
      .map(([id, count]) => ({ id, count, def: alchemyPotions[id] || alchemyIngredients[id] }))
      .filter(item => item.def && item.def.goldValue > 0 && item.count > 0);
  }, [inventory]);

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-3xl h-[80vh] bg-amber-100 border-4 border-amber-800 rounded-lg p-6 flex flex-col font-['Lato']" style={{ backgroundColor: '#F3EADF' }} onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-['Cinzel_Decorative'] text-amber-900">The Spirited Cauldron</h2>
          <div className="bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-lg">
            <span className="text-yellow-400 font-bold text-lg">💰 {gold} Gold</span>
          </div>
        </div>
        <div className="flex rounded-t-lg overflow-hidden border-b-2 border-amber-800">
          <TabButton name="seeds" label="Buy Seeds" />
          <TabButton name="raw" label="Raw Materials" />
          <TabButton name="sell" label="Sell Potions" />
          <TabButton name="upgrades" label="Upgrades" />
          <TabButton name="cats" label="Cats" />
        </div>
        <div className="flex-grow bg-black/10 overflow-y-auto p-4 rounded-b-lg">
          {activeTab === 'seeds' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {alchemyShopItems.seeds.map(item => {
                const def = alchemyPlants[item.id];
                const ingDef = alchemyIngredients[def.yields];
                return (
                  <div key={item.id} className="bg-amber-200/40 p-2 rounded-md text-center flex flex-col">
                    <img src={ingDef.icon} alt={def.name} loading="lazy" className="w-16 h-16 mx-auto object-contain" />
                    <p className="text-sm font-bold text-amber-900 mt-2 flex-grow">{def.name}</p>
                    <button onClick={() => handleTransaction(item, 'buy_seed')} className="mt-2 w-full bg-green-700 text-white text-sm py-1 rounded hover:bg-green-800 disabled:bg-slate-500" disabled={gold < item.cost}>
                      Buy ({item.cost}g)
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {activeTab === 'raw' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {alchemyShopItems.rawIngredients.map(item => {
                const def = alchemyIngredients[item.id];
                return (
                  <div key={item.id} className="bg-amber-200/40 p-2 rounded-md text-center flex flex-col">
                    <img src={def.icon} alt={def.name} loading="lazy" className="w-16 h-16 mx-auto object-contain" />
                    <p className="text-sm font-bold text-amber-900 mt-2 flex-grow">{def.name}</p>
                    <button onClick={() => handleTransaction(item, 'buy_ingredient')} className="mt-2 w-full bg-green-700 text-white text-sm py-1 rounded hover:bg-green-800 disabled:bg-slate-500" disabled={gold < item.cost}>
                      Buy ({item.cost}g)
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          {activeTab === 'sell' && (
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {sellablePotions.map(item => (
                  <div key={item.id} className="bg-amber-200/40 p-2 rounded-md text-center flex flex-col">
                    <img src={item.def.icon} alt={item.def.name} loading="lazy" className="w-16 h-16 mx-auto object-contain" />
                    <p className="text-sm font-bold text-amber-900 mt-2 flex-grow">{item.def.name} (x{item.count})</p>
                    <button onClick={() => handleTransaction(item, 'sell_potion')} className="mt-2 w-full bg-yellow-700 text-white text-sm py-1 rounded hover:bg-yellow-800">
                      Sell ({Math.round(item.def.goldValue * 0.75)}g)
                    </button>
                  </div>
               ))}
               {sellablePotions.length === 0 && <p className="col-span-full text-center text-slate-500 self-center">No potions to sell.</p>}
             </div>
          )}
          {activeTab === 'upgrades' && (
            <div className="space-y-3">
              {alchemyShopItems.upgrades.map(item => {
                const upgradeKey = item.required.key;
                const currentLevel = upgrades[upgradeKey] || 1;
                const isMaxed = !item.action; // A way to define max level items if needed
                const isPurchased = currentLevel > item.required.value;
                const canAfford = gold >= item.cost;
                const meetsRequirement = currentLevel === item.required.value;

                return (
                  <div key={item.id} className="bg-amber-200/40 p-3 rounded-md flex justify-between items-center">
                    <div>
                      <p className="font-bold text-amber-900">{item.name}</p>
                      <p className="text-xs text-slate-600">{item.description}</p>
                    </div>
                    <button 
                      onClick={() => handleTransaction(item, 'buy_upgrade')} 
                      disabled={isPurchased || !canAfford || !meetsRequirement} 
                      className="bg-indigo-700 text-white text-sm py-2 px-4 rounded hover:bg-indigo-800 disabled:bg-slate-500 disabled:cursor-not-allowed flex-shrink-0 w-40 text-center"
                    >
                      {isPurchased ? 'Purchased' : !meetsRequirement ? 'Locked' : `Buy (${item.cost}g)`}
                    </button>
                  </div>
                )
              })}
            </div>
          )}
          {activeTab === 'cats' && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {alchemyShopItems.cats.map(item => {
                const isOwned = unlockedAppearances.includes(item.id);
                const canAfford = gold >= item.cost;
                return (
                  <div key={item.id} className="bg-amber-200/40 p-2 rounded-md text-center flex flex-col">
                    <div className="w-24 h-24 mx-auto flex items-center justify-center overflow-hidden">
                      <div
                        style={{
                          width: '80px',
                          height: '80px',
                          backgroundImage: `url(${item.previewIcon})`,
                          backgroundSize: `${10 * 80}px 80px`, // 10 frames * 80px width
                          backgroundPosition: '0px 0px',
                          backgroundRepeat: 'no-repeat',
                          imageRendering: 'pixelated',
                          flexShrink: 0,
                        }}
                      />
                    </div>
                    <p className="text-sm font-bold text-amber-900 mt-2 flex-grow">{item.name}</p>
                    <button onClick={() => handleTransaction(item, 'buy_cat')} className="mt-2 w-full bg-pink-600 text-white text-sm py-1 rounded hover:bg-pink-700 disabled:bg-slate-500" disabled={isOwned || !canAfford}>
                      {isOwned ? 'Adopted' : `Adopt (${item.cost}g)`}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AlchemyCat = React.memo(({ obstacles, equippedAppearance }) => {
  const displaySize = { width: 128, height: 128 }; // Increased size

  const animations = useMemo(() => {
    const selectedCatSheets = catAnimationSheets[equippedAppearance] || catAnimationSheets.cat1;
    return {
      idle: { sheet: selectedCatSheets.idle, frames: 10, speed: 150, loop: true },
      walk: { sheet: selectedCatSheets.walk, frames: 8, speed: 100, loop: true },
      run: { sheet: selectedCatSheets.run, frames: 8, speed: 80, loop: true },
      sitting: { sheet: selectedCatSheets.sitting, frames: 1, speed: 5000, loop: false, onComplete: 'idle' },
      laying: { sheet: selectedCatSheets.laying, frames: 8, speed: 150, loop: false, onComplete: 'sleeping1' },
      sleeping1: { sheet: selectedCatSheets.sleeping1, frames: 1, speed: 5000, loop: true }, // Loop static pose
      sleeping2: { sheet: selectedCatSheets.sleeping2, frames: 1, speed: 5000, loop: true }, // Loop static pose
      stretching: { sheet: selectedCatSheets.stretching, frames: 13, speed: 150, loop: false, onComplete: 'idle' },
      licking1: { sheet: selectedCatSheets.licking1, frames: 5, speed: 150, loop: false, onComplete: 'idle' },
      licking2: { sheet: selectedCatSheets.licking2, frames: 5, speed: 150, loop: false, onComplete: 'idle' },
      itch: { sheet: selectedCatSheets.itch, frames: 12, speed: 100, loop: false, onComplete: 'idle' },
      meow: { sheet: selectedCatSheets.meow, frames: 4, speed: 150, loop: false, onComplete: 'idle' },
    };
  }, [equippedAppearance]);

  const [catState, setCatState] = useState({
    x: 80, y: 85,
    action: 'idle',
    frame: 0,
    facing: 'right',
    target: null,
    pendingAction: null, // The action to perform after walking somewhere
  });

  useEffect(() => {
    const CATTERY_POS = { x: 94, y: 88 };
    const BOUNDS = { minX: 45, maxX: 92, minY: 70, maxY: 90 };
    const isOccupied = (x, y) => {
      return obstacles.some(o => x > o.left && x < o.left + o.width && y > o.top && y < o.top + o.height);
    };

    let animationFrameId;
    let lastTime = 0;
    let actionTimer = 2500;
    let frameTimer = 0;

    const gameLoop = (currentTime) => {
      if (lastTime === 0) lastTime = currentTime;
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      setCatState(s => {
        let { x, y, action, target, facing, frame, pendingAction } = s;
        const anim = animations[action] || animations.idle;

        // --- 1. Animation Update ---
        frameTimer += deltaTime;
        if (frameTimer >= anim.speed) {
          frameTimer %= anim.speed;
          frame = (frame + 1);

          if (!anim.loop && frame >= anim.frames) {
            action = anim.onComplete || 'idle';
            frame = 0;
          } else if (anim.loop) {
            frame %= anim.frames;
          }
        }

        // --- 2. AI & Logic Update ---
        actionTimer -= deltaTime;
        if (actionTimer <= 0) {
          const oldAction = action;
          const nextActionRoll = Math.random();
          let decidedAction = null;
          
          if (action.includes('sleeping')) {
            decidedAction = 'stretching'; // Wake up
          } else if (nextActionRoll < 0.25 && action !== 'walk') { // Decide to sleep
            decidedAction = 'laying';
          } else if (nextActionRoll < 0.6 && action !== 'walk') { // Decide to walk somewhere random
            decidedAction = 'walk_random'; 
          } else { // Decide to do an idle action
            const idleActions = ['idle', 'sitting', 'licking1', 'itch', 'meow'];
            decidedAction = idleActions[Math.floor(Math.random() * idleActions.length)];
          }

          if (decidedAction === 'laying') {
            action = 'walk';
            target = CATTERY_POS;
            pendingAction = 'laying';
          } else if (decidedAction === 'walk_random') {
            let newTarget, attempts = 0;
            do {
              newTarget = { x: Math.random() * (BOUNDS.maxX - BOUNDS.minX) + BOUNDS.minX, y: Math.random() * (BOUNDS.maxY - BOUNDS.minY) + BOUNDS.minY };
              attempts++;
            } while (isOccupied(newTarget.x, newTarget.y) && attempts < 20);

            if (attempts < 20) {
              action = 'walk';
              target = newTarget;
              pendingAction = null;
            } else {
              action = 'idle';
              target = null;
              pendingAction = null;
            }
          } else if (decidedAction) {
            action = decidedAction;
            target = null;
            pendingAction = null;
          }
          
          actionTimer = Math.random() * 8000 + 4000;
          if (action !== oldAction) {
            frame = 0;
            frameTimer = 0;
          }
        }

        // --- 3. Movement & Physics Update ---
        if (action === 'walk' && target) {
          const dx = target.x - x;
          const dy = target.y - y;
          const dist = Math.hypot(dx, dy);
          const speed = 2.5; // % per second

          if (dist < 1) { // Reached target
            action = pendingAction || 'idle';
            pendingAction = null;
            target = null;
            frame = 0;
          } else {
            const moveX = (dx / dist) * (speed / 1000) * deltaTime;
            const moveY = (dy / dist) * (speed / 1000) * deltaTime;
            x += moveX;
            y += moveY;
            if (Math.abs(moveX) > 0.01) {
              facing = moveX > 0 ? 'right' : 'left';
            }
          }
        }
        
        // --- 4. Boundary checks ---
        x = Math.max(BOUNDS.minX, Math.min(BOUNDS.maxX, x));
        y = Math.max(BOUNDS.minY, Math.min(BOUNDS.maxY, y));
        
        return { x, y, action, target, facing, frame, pendingAction };
      });
      
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [animations, obstacles]);

  const currentAnim = animations[catState.action] || animations.idle;

  return (
    <div 
      className="absolute pointer-events-none z-20" 
      style={{
        left: `${catState.x}%`,
        top: `${catState.y}%`,
        width: `${displaySize.width}px`,
        height: `${displaySize.height}px`,
        transform: `translate(-50%, -50%) scaleX(${catState.facing === 'right' ? 1 : -1})`,
        willChange: 'left, top',
        overflow: 'hidden',
      }}
    >
      <div 
        className="h-full"
        style={{
          backgroundImage: `url(${currentAnim.sheet})`,
          width: `${currentAnim.frames * displaySize.width}px`,
          transform: `translateX(-${catState.frame * displaySize.width}px)`,
          transition: 'transform 0s',
          imageRendering: 'pixelated',
          backgroundSize: 'cover',
        }}
      />
    </div>
  );
});

const GardenModal = ({ stats, updateStatsInFirestore, onClose }) => {
  const [seedModalState, setSeedModalState] = useState({ isOpen: false, plotIndex: null });

  // DEFENSIVE DATA HANDLING:
  // These lines ensure that even if parts of the alchemy_state are missing from the user's data,
  // the component will use safe, empty defaults instead of crashing.
  const alchemyState = stats?.alchemy_state || {};
  const upgrades = alchemyState.upgrades || {};
  const inventory = alchemyState.inventory || {};
  const gardenPlots = Array.isArray(alchemyState.gardenPlots) ? alchemyState.gardenPlots : [];

  const handlePlant = (seedId, plotIndex) => {
    const newInventory = { ...inventory };
    newInventory[seedId] = (newInventory[seedId] || 1) - 1;
    if (newInventory[seedId] <= 0) {
      delete newInventory[seedId];
    }
    
    const newGardenPlots = [...gardenPlots];
    // Ensure the array is long enough, filling with empty plots if needed
    while (newGardenPlots.length <= plotIndex) {
      newGardenPlots.push({ plantId: null, plantedAt: null, stage: 0 });
    }
    newGardenPlots[plotIndex] = {
      plantId: alchemyPlants[seedId].yields,
      plantedAt: new Date(), // Firestore client SDK converts this to a Timestamp
      stage: 0
    };

    updateStatsInFirestore({
      'alchemy_state.inventory': newInventory,
      'alchemy_state.gardenPlots': newGardenPlots
    });
    setSeedModalState({ isOpen: false, plotIndex: null });
  };

  const handleHarvest = (plotIndex) => {
    const plot = gardenPlots[plotIndex];
    if (!plot || !plot.plantId) return;

    const ingredientId = plot.plantId;
    const newInventory = { ...inventory };
    newInventory[ingredientId] = (newInventory[ingredientId] || 0) + 1;

    const newGardenPlots = [...gardenPlots];
    newGardenPlots[plotIndex] = { plantId: null, plantedAt: null, stage: 0 };
    
    updateStatsInFirestore({
      'alchemy_state.inventory': newInventory,
      'alchemy_state.gardenPlots': newGardenPlots
    });
  };

  // Use nullish coalescing (??) for the safest default value.
  const numPlots = upgrades.garden_plots ?? 1;
  
  // Create an array of plot data to render, ensuring it matches the number of unlocked plots.
  const plotsToRender = Array.from({ length: numPlots }).map((_, index) => {
    return gardenPlots[index] || { plantId: null, plantedAt: null, stage: 0 };
  });

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center" onClick={onClose}>
      <div 
        className="w-full max-w-4xl h-[80vh] bg-yellow-50/10 border-4 border-amber-800/80 rounded-lg p-6 flex flex-col"
        style={{ backgroundColor: '#F3EADF', boxShadow: 'inset 0 0 20px #00000080' }}
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-4xl font-['Cinzel_Decorative'] text-amber-900 text-center mb-4">The Garden</h2>
        <div 
          className="flex-grow bg-cover bg-center rounded-md p-4 grid grid-cols-4 gap-4"
          style={{ backgroundImage: `url(${alchemyGardenBg})` }}
        >
          {plotsToRender.map((plot, index) => (
            <PlantPlot 
              key={index}
              plotData={plot}
              onHarvest={() => handleHarvest(index)}
              onPlant={() => setSeedModalState({ isOpen: true, plotIndex: index })}
            />
          ))}
        </div>
      </div>
      {seedModalState.isOpen && 
        <SeedSelectionModal 
          stats={stats} 
          onClose={() => setSeedModalState({ isOpen: false, plotIndex: null })} 
          onSelectSeed={(seedId) => handlePlant(seedId, seedModalState.plotIndex)}
        />}
    </div>
  );
};

const PlantPlot = ({ plotData, onHarvest, onPlant }) => {
  const [growthState, setGrowthState] = useState({ percent: 0, isGrown: false });

  // This effect will run whenever the plotData prop changes.
  useEffect(() => {
    // If there is no plant, we don't need to run any timers.
    if (!plotData?.plantId || !plotData.plantedAt) {
      setGrowthState({ percent: 0, isGrown: false });
      return; // Exit the effect early.
    }

    // A plant exists, so we set up an interval to check its growth.
    const interval = setInterval(() => {
      const plantDef = Object.values(alchemyPlants).find(p => p.yields === plotData.plantId);
      if (!plantDef) return;

      // This safely handles both Firestore Timestamps (from saved data) and JS Dates (from newly planted seeds).
      const plantedAtDate = plotData.plantedAt.toDate ? plotData.plantedAt.toDate() : new Date(plotData.plantedAt);
      
      const secondsElapsed = (new Date().getTime() - plantedAtDate.getTime()) / 1000;
      const percent = Math.min(100, (secondsElapsed / plantDef.growthTimeSeconds) * 100);
      
      setGrowthState({ percent, isGrown: percent >= 100 });
    }, 1000); // Check every second

    // This is a cleanup function. React runs it when the component is removed or the effect re-runs.
    return () => clearInterval(interval);
  }, [plotData]); // The effect re-runs ONLY when plotData changes.

  // --- Render Logic ---

  // If there's no plantId, it's an empty plot. Render the "+" button.
  if (!plotData?.plantId) {
    return (
      <button 
        onClick={onPlant}
        className="bg-amber-900/50 border-2 border-dashed border-amber-800/70 rounded-lg flex items-center justify-center text-amber-200/80 hover:bg-amber-900/70 transition-colors w-full h-full"
      >
        <span className="text-4xl font-thin">+</span>
      </button>
    );
  }

  // A plant exists. Find its definitions.
  const plantDef = Object.values(alchemyPlants).find(p => p.yields === plotData.plantId);
  const ingredientDef = alchemyIngredients[plotData.plantId];
  
  // Safety check in case of bad data.
  if (!plantDef || !ingredientDef) {
      return <div className="bg-red-900/50 rounded-lg flex items-center justify-center text-white p-2 text-xs">Data Error</div>;
  }

  // Determine which frame of the spritesheet to show.
  const stage = Math.min(3, Math.floor(growthState.percent / 25));

  return (
    <div className="bg-black/20 rounded-lg flex flex-col items-center justify-between p-2 relative h-full">
      <p className="text-white text-xs font-bold text-center" style={{ textShadow: '1px 1px 2px #000' }}>{ingredientDef.name}</p>
      <div 
        className="w-16 h-16 bg-no-repeat bg-center" 
        style={{ 
          backgroundImage: `url(${plantDef.spritesheet})`,
          backgroundPosition: `-${stage * 16}px 0px`,
          width: '16px', height: '16px',
          transform: 'scale(4)',
          imageRendering: 'pixelated',
        }}
      />
      
      {growthState.isGrown ? (
        <button onClick={onHarvest} className="w-full bg-green-600 text-white font-bold text-sm py-1 rounded hover:bg-green-700 transition-colors">
          HARVEST
        </button>
      ) : (
         <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full" style={{ width: `${growthState.percent}%` }}></div>
         </div>
      )}
    </div>
  );
};

const SeedSelectionModal = ({ stats, onClose, onSelectSeed }) => {
    const availableSeeds = Object.entries(stats.alchemy_state.inventory)
        .map(([key, count]) => ({
            id: key,
            count: count,
            def: alchemyPlants[key]
        }))
        .filter(item => item.def);

    return (
        <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center" onClick={onClose}>
            <div className="bg-amber-100 border-2 border-amber-800 p-4 rounded-lg text-amber-900" onClick={e => e.stopPropagation()}>
                <h3 className="font-['Cinzel_Decorative'] text-xl mb-4 text-center">Plant a Seed</h3>
                <div className="grid grid-cols-3 gap-2">
                    {availableSeeds.length > 0 ? availableSeeds.map(seed => (
                        <button 
                            key={seed.id} 
                            onClick={() => onSelectSeed(seed.id)}
                            className="p-2 bg-amber-200/50 rounded-md hover:bg-amber-300/80 transition-colors"
                        >
                            <img src={alchemyIngredients[seed.def.yields].icon} alt={seed.def.name} loading="lazy" className="w-12 h-12 mx-auto" />
                            <p className="text-xs font-bold mt-1">{seed.def.name}</p>
                            <p className="text-xs">x{seed.count}</p>
                        </button>
                    )) : <p className="col-span-3 text-center text-slate-500">You have no seeds!</p>}
                </div>
            </div>
        </div>
    );
};


export { AlchemistsWorkshop, CatteryModal, StoreroomModal, GrimoireModal, AlchemyBenchModal, CauldronModal, AlchemyShopModal, AlchemyCat, GardenModal, PlantPlot, SeedSelectionModal };
