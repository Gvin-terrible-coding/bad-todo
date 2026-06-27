import React, { useState, useEffect, useRef, useMemo } from 'react';
import { TILE_SIZE, tilesetDefinitions, cosmeticItems, CANVAS_DIMS } from '../constants/constants';
import { defaultStats } from '../utils/helpers';
import { showMessageBox } from '../utils/helpers';



  

  














  

    
  

  
    

      
        
    
  





  
              

                

                






export let tileRegistry = null;
export let tilesetData = null;
const initializeTileRegistry = () => {
  if (tileRegistry) return; // Guard: Already initialized
  const registry = new Map();
  const data = {};
  let globalIdOffset = 1;
  const sortedKeys = Object.keys(tilesetDefinitions).sort();
  for (const key of sortedKeys) {
    const tileset = tilesetDefinitions[key];
    const totalTiles = tileset.widthInTiles * tileset.heightInTiles;
    data[key] = { ...tileset, key, offset: globalIdOffset, totalTiles };
    for (let i = 0; i < totalTiles; i++) {
      registry.set(globalIdOffset + i, { tilesetKey: key, localId: i });
    }
    globalIdOffset += totalTiles;
  }
  tileRegistry = registry;
  tilesetData = data;
};
const getSanctumTileStyle = (globalId) => {
  initializeTileRegistry(); // This will run only once on the very first call.
  if (globalId === 0) {
    return { backgroundColor: 'transparent', backgroundImage: 'none' };
  }
  const tileInfo = tileRegistry.get(globalId);
  if (!tileInfo) {
    return { backgroundColor: '#FF00FF' }; // Error color for missing tiles
  }
  const tileset = tilesetData[tileInfo.tilesetKey];
  if (!tileset) {
    return { backgroundColor: '#FF00FF' };
  }
  // --- THIS IS THE FIX ---
  // Instead of pixel math, we use percentage-based math which works for both
  // the main canvas and the differently-sized preview tiles in the palette.
  const tileX = tileInfo.localId % tileset.widthInTiles;
  const tileY = Math.floor(tileInfo.localId / tileset.widthInTiles);
  // Calculate the total size of the background image as a percentage of the container.
  // If a sheet is 4 tiles wide, the background needs to be 400% the width of the div to show one tile at 100% size.
  const backgroundSizeX = tileset.widthInTiles * 100;
  const backgroundSizeY = tileset.heightInTiles * 100;
  // Calculate the position of the tile we want.
  // We use (width - 1) because the positioning for N items is over N-1 intervals.
  const backgroundPositionX = tileset.widthInTiles > 1 
    ? (tileX / (tileset.widthInTiles - 1)) * 100 
    : 0;
  const backgroundPositionY = tileset.heightInTiles > 1
    ? (tileY / (tileset.heightInTiles - 1)) * 100
    : 0;
  return {
    backgroundImage: `url(${tileset.src})`,
    backgroundSize: `${backgroundSizeX}% ${backgroundSizeY}%`,
    backgroundPosition: `${backgroundPositionX}% ${backgroundPositionY}%`,
    imageRendering: 'pixelated',
    backgroundRepeat: 'no-repeat' // Explicitly prevent repeating
  };
};
const SanctumEditor = ({ stats, updateStatsInFirestore, showMessageBox, processAchievement, onExit }) => {
  const [savedState, setSavedState] = useState(stats.sanctumCanvas);
  const [draftState, setDraftState] = useState(stats.sanctumCanvas);
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [activeTool, setActiveTool] = useState('brush');
  const [activeTileId, setActiveTileId] = useState(1);
  const [history, setHistory] = useState([stats.sanctumCanvas]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const canvasRef = useRef(null);
  const lastPaintedTile = useRef(null);
  const [isPainting, setIsPainting] = useState(false);
  const [editingLayer, setEditingLayer] = useState(null);
  const [isGridVisible, setIsGridVisible] = useState(true);
  const [brushSize, setBrushSize] = useState(1); // NEW: Brush size state
  const hasUnsavedChanges = useMemo(() => JSON.stringify(savedState) !== JSON.stringify(draftState), [savedState, draftState]);
  useMemo(initializeTileRegistry, []);
  const unlockedTilesets = useMemo(() => {
    const unlockedIds = new Set(stats.unlockedTilesets || []);
    return Object.entries(tilesetData)
      .filter(([key, data]) => data.isDefault || unlockedIds.has(data.unlockId))
      .map(([key, data]) => ({ key, name: data.name }));
  }, [stats.unlockedTilesets]);
  const [activeTilesetKey, setActiveTilesetKey] = useState(unlockedTilesets[0]?.key || '');
  const activeTileset = tilesetData[activeTilesetKey];
  const recordHistory = (newState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setDraftState(history[newIndex]);
    }
  };
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setDraftState(history[newIndex]);
    }
  };
  const handleAddLayer = () => {
    if ((draftState.layers?.length || 0) >= 5) {
      showMessageBox("Maximum of 5 layers reached.", "error");
      return;
    }
    const newLayer = Array(CANVAS_DIMS.width * CANVAS_DIMS.height).fill(0).join(',');
    const newState = {
      ...draftState,
      layers: [...(draftState.layers || []), newLayer],
      layerNames: [...(draftState.layerNames || []), `Layer ${(draftState.layers?.length || 0) + 1}`],
      layerVisibility: [...(draftState.layerVisibility || []), true],
    };
    setDraftState(newState);
    recordHistory(newState);
    setActiveLayerIndex(draftState.layers?.length || 0);
  };
  const handleDeleteLayer = () => {
    if (draftState.layers.length <= 1) {
      showMessageBox("Cannot delete the last layer.", "error");
      return;
    }
    const newLayers = draftState.layers.filter((_, i) => i !== activeLayerIndex);
    const newNames = draftState.layerNames.filter((_, i) => i !== activeLayerIndex);
    const newVis = draftState.layerVisibility.filter((_, i) => i !== activeLayerIndex);
    const newState = { ...draftState, layers: newLayers, layerNames: newNames, layerVisibility: newVis };
    setDraftState(newState);
    recordHistory(newState);
    setActiveLayerIndex(Math.max(0, activeLayerIndex - 1));
  };
  const handleToggleLayerVisibility = (index) => {
    const newVis = [...draftState.layerVisibility];
    newVis[index] = !newVis[index];
    const newState = { ...draftState, layerVisibility: newVis };
    setDraftState(newState);
  };
  const handleRenameLayer = () => {
    if (!editingLayer || editingLayer.name.trim() === '') {
      setEditingLayer(null);
      return;
    }
    const newLayerNames = [...draftState.layerNames];
    newLayerNames[editingLayer.index] = editingLayer.name.trim();
    const newState = { ...draftState, layerNames: newLayerNames };
    setDraftState(newState);
    setEditingLayer(null);
  };
  // MODIFIED: This function now handles different brush sizes
  const handleCanvasAction = (tileIndex, tool) => {
    const newLayers = [...draftState.layers];
    let layerToEdit = newLayers[activeLayerIndex].split(',').map(Number);
    let stateChanged = false;
    const applyTool = (index) => {
      if (tool === 'brush' && layerToEdit[index] !== activeTileId) {
        layerToEdit[index] = activeTileId;
        stateChanged = true;
      } else if (tool === 'eraser' && layerToEdit[index] !== 0) {
        layerToEdit[index] = 0;
        stateChanged = true;
      }
    };
    if (brushSize > 1 && (tool === 'brush' || tool === 'eraser')) {
      const startX = (tileIndex % CANVAS_DIMS.width) - Math.floor(brushSize / 2);
      const startY = Math.floor(tileIndex / CANVAS_DIMS.width) - Math.floor(brushSize / 2);
      for (let y = 0; y < brushSize; y++) {
        for (let x = 0; x < brushSize; x++) {
          const currentX = startX + x;
          const currentY = startY + y;
          if (currentX >= 0 && currentX < CANVAS_DIMS.width && currentY >= 0 && currentY < CANVAS_DIMS.height) {
            const currentIndex = currentY * CANVAS_DIMS.width + currentX;
            applyTool(currentIndex);
          }
        }
      }
    } else if (tool === 'brush' || tool === 'eraser') {
      applyTool(tileIndex);
    } else if (tool === 'colorize') {
        let foundTileId = 0;
        for (let i = draftState.layers.length - 1; i >= 0; i--) {
            if (draftState.layerVisibility[i]) {
                const layer = draftState.layers[i].split(',').map(Number);
                if (layer[tileIndex] !== 0) {
                    foundTileId = layer[tileIndex];
                    break;
                }
            }
        }
        if (foundTileId !== 0) {
          setActiveTileId(foundTileId);
          setActiveTool('brush');
        }
        return; // No state change to record
    } else if (tool === 'format_color_fill') {
        const targetTile = layerToEdit[tileIndex];
        if (targetTile === activeTileId) return;
        const queue = [tileIndex];
        const visited = new Set([tileIndex]);
        while(queue.length > 0) {
            const current = queue.shift();
            layerToEdit[current] = activeTileId;
            stateChanged = true;
            const x = current % CANVAS_DIMS.width;
            const y = Math.floor(current / CANVAS_DIMS.width);
            const neighbors = [{nx: x, ny: y - 1}, {nx: x, ny: y + 1}, {nx: x - 1, ny: y}, {nx: x + 1, ny: y}];
            for (const n of neighbors) {
                if (n.nx >= 0 && n.nx < CANVAS_DIMS.width && n.ny >= 0 && n.ny < CANVAS_DIMS.height) {
                    const nIndex = n.ny * CANVAS_DIMS.width + n.nx;
                    if (layerToEdit[nIndex] === targetTile && !visited.has(nIndex)) {
                        visited.add(nIndex);
                        queue.push(nIndex);
                    }
                }
            }
        }
    }
    if (stateChanged) {
      newLayers[activeLayerIndex] = layerToEdit.join(',');
      const newState = { ...draftState, layers: newLayers };
      setDraftState(newState);
      if (tool === 'format_color_fill') recordHistory(newState);
      processAchievement('sanctumTilesPlaced');
    }
  };
  const handleMouseDown = (e) => {
    if (e.button !== 0 || !canvasRef.current) return;
    setIsPainting(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
    if (x >= 0 && x < CANVAS_DIMS.width && y >= 0 && y < CANVAS_DIMS.height) {
      const tileIndex = y * CANVAS_DIMS.width + x;
      lastPaintedTile.current = tileIndex;
      handleCanvasAction(tileIndex, activeTool);
    }
  };
  const handleMouseMove = (e) => {
    if (!isPainting || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / TILE_SIZE);
    const y = Math.floor((e.clientY - rect.top) / TILE_SIZE);
    if (x >= 0 && x < CANVAS_DIMS.width && y >= 0 && y < CANVAS_DIMS.height) {
      const tileIndex = y * CANVAS_DIMS.width + x;
      if (lastPaintedTile.current !== tileIndex && (activeTool === 'brush' || activeTool === 'eraser')) {
        lastPaintedTile.current = tileIndex;
        handleCanvasAction(tileIndex, activeTool);
      }
    }
  };
  const handleMouseUp = () => {
    if (isPainting) recordHistory(draftState);
    setIsPainting(false);
    lastPaintedTile.current = null;
  };
  const handleSaveChanges = async () => {
    try {
      await updateStatsInFirestore({ sanctumCanvas: draftState });
      setSavedState(draftState);
      showMessageBox("Sanctum saved successfully!", "info");
    } catch (error) {
      showMessageBox("Failed to save Sanctum.", "error");
    }
  };
  const handleDiscardChanges = () => {
    setDraftState(savedState);
    setHistory([savedState]);
    setHistoryIndex(0);
    showMessageBox("Changes discarded.", "info");
  };
  const handleExitEditor = () => {
    if (hasUnsavedChanges) {
      if (window.confirm("You have unsaved changes that will be lost. Are you sure you want to exit?")) {
        handleDiscardChanges();
        onExit();
      }
    } else {
      onExit();
    }
  };
  return (
    <div className="fixed inset-0 bg-neutral-900 z-50 theme-webcrumbs">
      <div id="webcrumbs" className="h-full">
        <div className="bg-neutral-900 h-full flex flex-col text-neutral-200 font-['Inter',sans-serif]">
          <main className="flex-1 grid grid-cols-[280px_1fr] overflow-hidden">
            {/* --- LEFT SIDEBAR (GRID ITEM) --- */}
            <aside className="bg-neutral-800/95 backdrop-blur-sm border-r border-neutral-700 flex flex-col p-4 overflow-hidden">
              <div className="flex-shrink-0 mb-4">
                <h2 className="text-sm uppercase tracking-wider text-neutral-400 mb-2">Toolbar</h2>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    {id: 'brush', icon: 'brush'}, {id: 'eraser', icon: 'ink_eraser'}, {id: 'format_color_fill', icon: 'format_color_fill'}, {id: 'colorize', icon: 'colorize'}, 
                    {id: 'undo', icon: 'undo'}, {id: 'redo', icon: 'redo'},
                    {id: 'toggle_grid', icon: isGridVisible ? 'grid_off' : 'grid_on'}
                  ].map(tool => (
                      <button 
                          key={tool.id} 
                          onClick={
                            tool.id === 'undo' ? handleUndo : 
                            tool.id === 'redo' ? handleRedo :
                            tool.id === 'toggle_grid' ? () => setIsGridVisible(v => !v) : 
                            () => setActiveTool(tool.id)
                          } 
                          className={`w-10 h-10 flex items-center justify-center rounded-md transition-all group ${activeTool === tool.id ? 'bg-indigo-500' : 'hover:bg-neutral-700'}`} 
                          title={tool.id.charAt(0).toUpperCase() + tool.id.slice(1).replace(/_/g, ' ')}
                      >
                        <span className="material-symbols-outlined text-neutral-200 group-hover:scale-110 transition-transform">{tool.icon}</span>
                      </button>
                  ))}
                </div>
              </div>
              {/* NEW: Brush Size Selector */}
              <div className="flex-shrink-0 mb-4">
                <h2 className="text-sm uppercase tracking-wider text-neutral-400 mb-2">Brush Size</h2>
                <div className="flex gap-2">
                  {[1, 3, 5].map(size => (
                    <button 
                      key={size}
                      onClick={() => setBrushSize(size)}
                      className={`w-10 h-10 flex items-center justify-center rounded-md transition-all fon
t-bold ${brushSize === size ? 'bg-indigo-500' : 'bg-neutral-700 hover:bg-neutral-600'}`}
                      title={`${size}x${size} Brush`}
                    >
                      {size}x{size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex-shrink-0">
                  <h2 className="text-sm uppercase tracking-wider text-neutral-400 mb-2">Tile Palette</h2>
                  <div className="mb-4">
                    <select value={activeTilesetKey} onChange={(e) => setActiveTilesetKey(e.target.value)} className="w-full p-2 bg-neutral-700 border border-neutral-600 rounded-md text-white">
                      {unlockedTilesets.map(ts => <option key={ts.key} value={ts.key}>{ts.name}</option>)}
                    </select>
                  </div>
                  <div className="mb-4 bg-neutral-700/50 border border-neutral-700 rounded-md p-3">
                    <h3 className="text-xs text-neutral-400 mb-2">Active Tile</h3>
                    <div className="w-16 h-16 rounded-md mb-1 overflow-hidden bg-neutral-900" style={getSanctumTileStyle(activeTileId)}></div>
                    <div className="text-xs text-neutral-400">Global ID: {activeTileId}</div>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                  {activeTileset && (
                    <div className="grid grid-cols-5 gap-1">
                      {Array.from({ length: activeTileset.usableTileCount }).map((_, i) => {
                        const globalId = activeTileset.offset + i;
                        return (
                          <div key={globalId} onClick={() => setActiveTileId(globalId)} className={`aspect-square rounded hover:ring-2 ring-indigo-500 transition-all cursor-pointer ${activeTileId === globalId ? 'ring-2 ring-indigo-500' : ''}`} style={getSanctumTileStyle(globalId)} />
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </aside>
            {/* --- MAIN CONTENT AREA (GRID ITEM) --- */}
            <div className="grid grid-cols-[1fr_240px] overflow-hidden">
              <div className="bg-[#1a1a1a] relative overflow-hidden">
                <div className="absolute inset-0 overflow-auto p-8 flex justify-center items-start">
                  <div
                    ref={canvasRef}
                    className="relative grid shadow-lg overflow-hidden cursor-crosshair flex-shrink-0"
                    style={{
                      gridTemplateColumns: `repeat(${CANVAS_DIMS.width}, ${TILE_SIZE}px)`,
                      width: `${CANVAS_DIMS.width * TILE_SIZE}px`,
                      height: `${CANVAS_DIMS.height * TILE_SIZE}px`,
                      backgroundColor: isGridVisible ? '#3f3f46' : '#27272a',
                      backgroundImage: isGridVisible 
                        ? 'linear-gradient(45deg, #3f3f46 25%, transparent 25%), linear-gradient(-45deg, #3f3f46 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #3f3f46 75%), linear-gradient(-45deg, transparent 75%, #3f3f46 75%)'
                        : 'none',
                      backgroundSize: '32px 32px'
                    }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {draftState.layers.map((layerStr, layerIndex) => {
                      if (!draftState.layerVisibility[layerIndex]) return null;
                      const tiles = layerStr.split(',').map(Number);
                      return (
                        <div key={layerIndex} className="absolute inset-0 grid pointer-events-none" style={{ zIndex: layerIndex, gridTemplateColumns: `repeat(${CANVAS_DIMS.width}, 1fr)`}}>
                          {tiles.map((tileId, tileIndex) => (
                            <div key={tileIndex} style={getSanctumTileStyle(tileId)} />
                          ))}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 bg-neutral-800/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg flex gap-6 text-sm">
                  <button onClick={handleSaveChanges} disabled={!hasUnsavedChanges} className="px-4 py-1.5 bg-green-600 hover:bg-green-500 rounded-full transition-colors flex items-center gap-2 disabled:bg-gray-500 disabled:cursor-not-allowed"><span className="material-symbols-outlined text-sm">save</span>Save Canvas</button>
                  <button onClick={handleDiscardChanges} disabled={!hasUnsavedChanges} className="px-4 py-1.5 bg-neutral-700 hover:bg-neutral-600 rounded-full transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><span className="material-symbols-outlined text-sm">refresh</span>Discard</button>
                  <button onClick={handleExitEditor} className="px-4 py-1.5 bg-red-600 hover:bg-red-500 rounded-full transition-colors flex items-center gap-2"><span className="material-symbols-outlined text-sm">close</span>Exit Editor</button>
                </div>
              </div>
              <aside className="bg-neutral-800/95 backdrop-blur-sm border-l border-neutral-700 p-4 flex flex-col overflow-y-auto shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm uppercase tracking-wider text-neutral-400">Layers</h2>
                  <div className="flex gap-2">
                    <button onClick={handleAddLayer} className="w-8 h-8 flex items-center justify-center hover:bg-neutral-700 rounded transition-all" title="Add New Layer"><span className="material-symbols-outlined text-neutral-400 hover:text-neutral-300">add</span></button>
                    <button onClick={handleDeleteLayer} className="w-8 h-8 flex items-center justify-center hover:bg-neutral-700 rounded transition-all" title="Delete Selected Layer"><span className="material-symbols-outlined text-neutral-400 hover:text-neutral-300">delete</span></button>
                  </div>
                </div>
                <div className="space-y-2">
                  {(draftState.layerNames || []).map((name, index) => (
                    <div key={index} onClick={() => setActiveLayerIndex(index)} onDoubleClick={() => setEditingLayer({ index, name })} className={`p-2 rounded flex items-center justify-between group transition-all cursor-pointer ${activeLayerIndex === index ? 'bg-indigo-500/20 border border-indigo-500/30' : 'bg-neutral-700/50 hover:bg-neutral-700'}`}>
                      <div className="flex items-center gap-2 overflow-hidden">
                        <button onClick={(e) => { e.stopPropagation(); handleToggleLayerVisibility(index); }} className="text-sm text-neutral-300 flex-shrink-0"><span className="material-symbols-outlined">{draftState.layerVisibility[index] ? 'visibility' : 'visibility_off'}</span></button>
                        {editingLayer?.index === index ? (
                          <input type="text" value={editingLayer.name} onChange={(e) => setEditingLayer({ ...editingLayer, name: e.target.value })} onBlur={handleRenameLayer} onKeyDown={(e) => { if (e.key === 'Enter') handleRenameLayer(); if (e.key === 'Escape') setEditingLayer(null); }} autoFocus className="bg-neutral-900 text-sm text-white rounded px-1 -my-1 w-full"/>
                        ) : (
                          <span className="text-sm text-neutral-200 truncate">{name}</span>
                        )}
                      </div>
                      <span className="material-symbols-outlined text-sm text-neutral-400 group-hover:text-neutral-300">drag_indicator</span>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
const Sanctum = ({ stats, setEditMode }) => {
  const renderStaticCanvas = () => {
    const state = stats.sanctumCanvas || defaultStats.sanctumCanvas;
    return (
      <div 
        className="relative grid bg-neutral-700 rounded-md shadow-lg overflow-hidden" 
        style={{
          gridTemplateColumns: `repeat(${CANVAS_DIMS.width}, ${TILE_SIZE}px)`,
          width: `${CANVAS_DIMS.width * TILE_SIZE}px`,
          height: `${CANVAS_DIMS.height * TILE_SIZE}px`,
          backgroundImage: 'linear-gradient(45deg, #3f3f46 25%, transparent 25%), linear-gradient(-45deg, #3f3f46 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #3f3f46 75%), linear-gradient(-45deg, transparent 75%, #3f3f46 75%)',
          backgroundSize: '32px 32px'
        }}
      >
         {state.layers.map((layerStr, layerIndex) => {
            if (!state.layerVisibility[layerIndex]) return null;
            const tiles = layerStr.split(',').map(Number);
            return (
              <div 
                key={layerIndex} 
                className="absolute inset-0 grid pointer-events-none"
                style={{ zIndex: layerIndex, gridTemplateColumns: `repeat(${CANVAS_DIMS.width}, 1fr)`}}
              >
                {tiles.map((tileId, tileIndex) => (
                  <div key={tileIndex} style={getSanctumTileStyle(tileId)} />
                ))}
              </div>
            );
          })}
      </div>
    );
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">The Creator's Canvas</h2>
          <p className="text-slate-400">Your personal space to design and create.</p>
        </div>
        <button onClick={() => setEditMode(true)} className="px-5 py-2 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700">
          Edit Sanctum
        </button>
      </div>
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex items-center justify-center">
         {renderStaticCanvas()}
      </div>
    </div>
  );
};
export { Sanctum, SanctumEditor, getSanctumTileStyle, initializeTileRegistry };
