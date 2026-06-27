// Helper functions and custom hooks
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { increment } from 'firebase/firestore';
import { db, updateDoc, doc, serverTimestamp } from './firestore';
import { questDefinitions, dungeon_emojis, petDefinitions, EGG_REQUIREMENT, PET_RARITIES, contractDefinitions, cosmeticItems, CANVAS_DIMS } from '../constants/constants';

export const showMessageBox = (message, type = 'info', duration = 3000) => {
  const messageBox = document.getElementById('messageBox');
  const messageText = document.getElementById('messageText');
  if (messageBox && messageText) {
    messageText.textContent = message;
    messageBox.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform ${
      type === 'error' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
    } translate-y-0 opacity-100`;
    setTimeout(() => {
      messageBox.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-y-full opacity-0`;
    }, duration);
  }
};

export const generatePath = () => {
    const boardSize = 10;
    const newPath = [{ x: 0, y: 0 }];
    const visited = new Set(['0,0']);
    let current = { x: 0, y: 0 };

    while (current.x < boardSize - 1 || current.y < boardSize - 1) {
        const moves = [];
        if (current.x < boardSize - 1) moves.push({ x: current.x + 1, y: current.y });
        if (current.y < boardSize - 1) moves.push({ x: current.x, y: current.y + 1 });
        
        const validMoves = moves.filter(m => !visited.has(`${m.x},${m.y}`));

        if (validMoves.length > 0) {
            const nextMove = validMoves[Math.floor(Math.random() * validMoves.length)];
            current = nextMove;
            newPath.push(current);
            visited.add(`${current.x},${current.y}`);
        } else {
            const allNeighbors = [
                { x: current.x + 1, y: current.y }, { x: current.x, y: current.y + 1 },
                { x: current.x - 1, y: current.y }, { x: current.x, y: current.y - 1 }
            ].filter(n => n.x >= 0 && n.x < boardSize && n.y >= 0 && n.y < boardSize && !visited.has(`${n.x},${n.y}`));
            
            if (allNeighbors.length > 0) {
                current = allNeighbors[0];
                newPath.push(current);
                visited.add(`${current.x},${current.y}`);
            } else {
                break;
            }
        }
    }
    return newPath;
};

export const getStartOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const shouldGenerateQuests = (lastUpdatedTimestamp) => {
  if (!lastUpdatedTimestamp || typeof lastUpdatedTimestamp.toDate !== 'function') {
    // If it's null, or not a Firestore Timestamp, don't generate.
    return false;
  }
  const lastDate = lastUpdatedTimestamp.toDate();
  const now = new Date();
  return getStartOfDay(now) > getStartOfDay(lastDate);
};

export const generateQuests = () => {
  const daily = [];
  const weekly = [];
  const dailyPool = [...questDefinitions.daily];
  const weeklyPool = [...questDefinitions.weekly];

  // Select 2 random daily quests
  for (let i = 0; i < 2; i++) {
    if (dailyPool.length === 0) break;
    const randomIndex = Math.floor(Math.random() * dailyPool.length);
    daily.push({ ...dailyPool[randomIndex], progress: 0, completed: false });
    dailyPool.splice(randomIndex, 1);
  }

  // Select 1 random weekly quest
  if (weeklyPool.length > 0) {
    const randomIndex = Math.floor(Math.random() * weeklyPool.length);
    weekly.push({ ...weeklyPool[randomIndex], progress: 0, completed: false });
  }

  let contract = null;
  // 25% chance to generate a new contract offer if one isn't already active/offered
  if (Math.random() < 0.25) {
      const contractDef = contractDefinitions[Math.floor(Math.random() * contractDefinitions.length)];
      contract = { ...contractDef, status: 'offered' };
  }

  return { daily, weekly, lastUpdated: serverTimestamp(), contract };
};

export const generateInitialDungeonState = () => {
  return {
    phase: 'class_selection', // Start at class selection
    playerClass: null,
    floor: 1,
    board: {},
    player: { 
        id: 'player', entityType: 'player', x: 1, y: 1, hp: 100, maxHp: 100, attack: 10, hasKey: false, activeEffects: [],
        lastWeaponSwitchFloor: 0,
    },
    enemies: [],
    enemyMovePaths: {}, 
    lastMoveTrails: [],
    turnCount: 1,
    log: ['Choose your class to begin your adventure.'],
    gameOver: false,
    shopOpen: false,
    shopView: 'buy', // 'buy' or 'armory'
    ownedWeapons: [],
    ownedOffhandWeapons: [],
    ownedArmor: [],
    equippedWeapon: null,
    equippedOffhandWeapon: null,
    equippedArmor: null,
    potions: 10,
        boughtStats: { hp: 0, attack: 0 },
    floorModifier: null,
  };
};

export const defaultStats = {
  username: '', totalXP: 0, currentLevel: 1, assignmentsCompleted: 0, friends: [],
  ownedItems: [], equippedItems: { avatar: null, banner: 'banner_default', background: null, font: 'font_inter', animation: null, title: null, wallpaper: null, dungeonEmojis: {}, tdSkins: {} }, 
  unlockedTilesets: ['starter_pack'], // NEW: For Sanctum tile editor
  sanctumCanvas: { // NEW: Replaces sanctumLayout
    layers: [Array(CANVAS_DIMS.width * CANVAS_DIMS.height).fill(0).join(',')], // A single layer, filled with "empty" tile 0
    layerNames: ["Floor"],
    layerVisibility: [true],
  },
  ownedPets: [], currentPet: null, petStatus: 'none', assignmentsToHatch: 0, cosmeticShards: 0,
  focusNavigator: { unlockedLocations: ['genesis_prime'], explorerStreak: 0, lastStreakDay: null, dailyFocusMinutes: 0 },
  activeBoosts: [],
  dungeon_state: generateInitialDungeonState(), dungeon_floor: 0, dungeon_gold: 0,
  dungeon_wingmen: { roster: [], graveyard: [], equipped: null, upgrades: {} },
  td_wins: 0, td_wave: 0, td_castleHealth: 5, td_towers: [], td_path: generatePath(), td_gameOver: false, td_gameWon: false, td_unlockedTowers: [], td_towerUpgrades: {},
  td_commander: { x: 5, y: 5, lastMove: null, abilityCooldowns: {}, activeBuffs: [] },
  lab_state: {
    sciencePoints: 0,
    lastLogin: serverTimestamp(),
    labEquipment: { beaker: 0, microscope: 0, bunsen_burner: 0, computer: 0, particle_accelerator: 0, quantum_computer: 0, manual_clicker: 1 },
    labXpUpgrades: {},
    prestigeLevel: 0,
  },
  alchemy_state: {
    gold: 100,
    inventory: { 'seed_focuroot': 3 },
    unlockedRecipes: ['potion_minor_strength', 'potion_stonehide', 'potion_tower_power'],
    upgrades: { 
      garden_plots: 1,
      bench_level: 1,
      cauldron_level: 1,
      grimoire_level: 1,
    },
    cat: {
      name: 'Jasper',
      equippedAppearance: 'cat1',
      unlockedAppearances: ['cat1'],
    },
    gardenPlots: [
      { plantId: null, plantedAt: null, stage: 0 }
    ],
  },
  studyZone: {
    platformerHighScore: 0,
    // NEW STRUCTURE
    deckHierarchy: [], // Stores { id, name, type: 'folder' | 'deck', parentId, childrenIds: [] }
    cardData: {},      // Stores { [deckId]: [{ id, front, back, ...srsData }] }
    // Legacy fields for migration
    flashcardsText: '', 
    flashcardData: {},
  },
  achievements: { assignmentsCompleted: { tier: 0, progress: 0 }, hardAssignmentsCompleted: { tier: 0, progress: 0 }, sanctumTilesPlaced: { tier: 0, progress: 0 } },
  quests: generateQuests(),
  contract: null,
  squads: [], // Array of squad IDs the user is a member of
  squadInvites: [], // Array of squad IDs the user is invited to
  cooldowns: {}, // Stores timestamps of last actions to prevent spam
  availabilityPreferences: {
    primeTimes: ['afternoons'], // 'mornings', 'afternoons', 'evenings'
    unavailableDays: [], // 0 for Sunday, 1 for Monday, etc.
  },
};

export const XpBarAnimation = ({ xpGained, stats, calculateLevelInfo, onAnimationComplete, onAudioReady, originEvent }) => {
  const [visible, setVisible] = useState(false);
  const [orbs, setOrbs] = useState([]);
  const [barFillWidth, setBarFillWidth] = useState('0%');
  const [levelText, setLevelText] = useState('');
  
  const audioRef = useRef(null);
  const currentLevelRef = useRef(1);
  
  const initialXp = useMemo(() => (stats?.totalXP || 0) - xpGained, [stats?.totalXP, xpGained]);
  const initialLevelInfo = useMemo(() => calculateLevelInfo(initialXp), [initialXp, calculateLevelInfo]);

  useEffect(() => {
    // A short, crisp audio pop sound, base64 encoded.
    const soundFile = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';
    audioRef.current = new Audio(soundFile);
    audioRef.current.volume = 0.9;
    
    const primeAudio = () => {
        if (audioRef.current && audioRef.current.paused) {
            const promise = audioRef.current.play();
            if (promise !== undefined) {
                promise.then(_ => {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                }).catch(error => { /* Silently fail on browsers that block this */ });
            }
        }
    };
    onAudioReady(primeAudio);
  }, [onAudioReady]);
  
  const playSound = useCallback((pitch = 1) => {
    if (!audioRef.current) return;
    try {
      audioRef.current.playbackRate = pitch;
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(e => { /* Fail silently */ });
    } catch(e) { /* Fail silently */ }
  }, []);
    useEffect(() => {
    if (!stats || !stats.equippedItems) return; // Guard against initial undefined state
    const bannerId = stats.equippedItems.banner || 'banner_default';
    const banner = cosmeticItems.banners.find(b => b.id === bannerId) 
                  || cosmeticItems.banners.find(b => b.id === 'banner_default'); // Fallback to default
    
    if (banner && banner.themeColors) {
      const root = document.documentElement;
      root.style.setProperty('--primary-color', banner.themeColors.primary);
      root.style.setProperty('--accent-color', banner.themeColors.accent);
      root.style.setProperty('--text-color', banner.themeColors.text);
    }
  }, [stats?.equippedItems?.banner]); // Depend on the specific property
  useEffect(() => {
    if (xpGained > 0) {
      setVisible(true);
      const initialFill = (initialLevelInfo.xpProgressInLevel / initialLevelInfo.xpNeededForLevelUp) * 100;
      setBarFillWidth(`${initialFill}%`);
      setLevelText(String(initialLevelInfo.level));
      currentLevelRef.current = initialLevelInfo.level;

      const satisfactionMultiplier = xpGained > 25 ? 0.7 : xpGained > 10 ? 0.85 : 1;
      const orbDelay = 40 * satisfactionMultiplier;
      const orbTravelDuration = 800;
      
      let startX = window.innerWidth / 2;
      let startY = window.innerHeight / 4;
      // FIX: The 'originEvent' is now the DOM element itself, not the synthetic event object.
      // This check is now simpler and correctly uses the stored element.
      if (originEvent) {
          const rect = originEvent.getBoundingClientRect();
          startX = rect.left + rect.width / 2;
          startY = rect.top + rect.height / 2;
      }

      const newOrbs = Array.from({ length: xpGained }, (_, i) => ({
        id: `${Date.now()}-${i}`,
        delay: i * orbDelay,
        duration: orbTravelDuration + Math.random() * 400,
        startX: startX + (Math.random() - 0.5) * 40,
        startY: startY + (Math.random() - 0.5) * 40,
      }));
      setOrbs(newOrbs);

      newOrbs.forEach((orb, i) => {
        const hitTime = orb.delay + orb.duration;
        setTimeout(() => {
          const pitch = 1.0 + (i / xpGained) * 0.7;
          playSound(pitch);

          const currentAnimatedXp = initialXp + i + 1;
          const newLevelInfo = calculateLevelInfo(currentAnimatedXp);
          
          const newFill = (newLevelInfo.xpProgressInLevel / newLevelInfo.xpNeededForLevelUp) * 100;
          setBarFillWidth(`${newFill}%`);
          
          if (newLevelInfo.level > currentLevelRef.current) {
              currentLevelRef.current = newLevelInfo.level;
              setLevelText(String(newLevelInfo.level));
              playSound(2.0);
          }
        }, hitTime);
      });
      
      const totalAnimationTime = (newOrbs.length > 0 ? newOrbs[newOrbs.length - 1].delay + newOrbs[newOrbs.length - 1].duration : 0) + 1500;
      
      const timeoutId = setTimeout(() => {
        setVisible(false);
        setOrbs([]);
        onAnimationComplete();
      }, totalAnimationTime);

      return () => clearTimeout(timeoutId);
    }
  }, [xpGained, initialLevelInfo, initialXp, calculateLevelInfo, onAnimationComplete, playSound, originEvent]);

  const satisfactionClass = xpGained > 25 ? 'satis-high' : xpGained > 10 ? 'satis-medium' : 'satis-low';

  if (!visible) return null;

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        {orbs.map(orb => (
                    <div
            key={orb.id}
            className={`xp-orb ${satisfactionClass}`}
            style={{
              top: `${orb.startY}px`,
              left: `${orb.startX}px`,
              animation: `fly-to-bar-minecraft ${orb.duration}ms cubic-bezier(0.5, 0, 1, 0.5) ${orb.delay}ms forwards`,
            }}
          />
        ))}
      </div>
      <div className="xp-bar-container">
        <div className="xp-bar-wrapper">
          <div className="xp-bar-background">
            <div className="xp-bar-fill" style={{ width: barFillWidth }} />
          </div>
          <div className="xp-level-text">{levelText}</div>
        </div>
      </div>
    </>
  );
// In App.js, right before the main App component definition

};

export const useActionLock = () => {
  const isLocked = useRef(false);

  const withLock = useCallback(async (asyncFunction) => {
    if (isLocked.current) {
      console.warn("Action prevented due to spam lock.");
      return;
    }
    try {
      isLocked.current = true;
      await asyncFunction();
    } catch (error) {
      console.error("Locked action failed:", error);
    } finally {
      // Add a small delay before unlocking to prevent rapid re-clicks
      setTimeout(() => {
        isLocked.current = false;
      }, 1000);
    }
  }, []);

  return withLock;
};

export const generateBreakPasscode = () => {
  const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
  const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const DIGIT_CHARS = '0123456789';
  const SPECIAL_CHARS = '!@#$%^&*()_+-=[]{};:,.<>/?`~';
  
  const ALL_CHARS = LOWERCASE_CHARS + UPPERCASE_CHARS + DIGIT_CHARS + SPECIAL_CHARS;
  
  const PASSWORD_LENGTH = 20; // A longer password increases uniqueness dramatically

  // Helper to get a random character from a string
  const getRandomChar = (str) => str[Math.floor(Math.random() * str.length)];

  // Helper to shuffle an array (Fisher-Yates shuffle)
  const shuffleArray = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Helper to check for more than 2 consecutive identical characters (e.g., "aaa")
  const containsTripleChars = (str) => {
    for (let i = 0; i < str.length - 2; i++) {
      if (str[i] === str[i + 1] && str[i] === str[i + 2]) {
        return true;
      }
    }
    return false;
  };
  
  // Helper to check for sequential characters (e.g., "abc" or "123")
  const containsSequentialChars = (str) => {
    for (let i = 0; i < str.length - 2; i++) {
      const c1 = str.charCodeAt(i);
      const c2 = str.charCodeAt(i + 1);
      const c3 = str.charCodeAt(i + 2);
      if (c2 === c1 + 1 && c3 === c2 + 1) {
        return true;
      }
    }
    return false;
  };

  // Keep generating passwords until one passes all validation checks
  let candidatePassword = '';
  let attempts = 0;
  while (true) {
    attempts++;
    if (attempts > 50) { // Failsafe to prevent infinite loops
      console.error("Failed to generate a valid password after 50 attempts.");
      return "generation-error-please-retry";
    }

    // 1. Ensure all required character types are present
    let passwordChars = [
      getRandomChar(LOWERCASE_CHARS),
      getRandomChar(UPPERCASE_CHARS),
      getRandomChar(DIGIT_CHARS),
      getRandomChar(SPECIAL_CHARS),
    ];

    // 2. Fill the rest of the password with random characters
    for (let i = passwordChars.length; i < PASSWORD_LENGTH; i++) {
      passwordChars.push(getRandomChar(ALL_CHARS));
    }

    // 3. Shuffle to ensure requirements aren't just at the beginning
    passwordChars = shuffleArray(passwordChars);
    candidatePassword = passwordChars.join('');

    // 4. Validate against complex rules
    if (!containsTripleChars(candidatePassword) && !containsSequentialChars(candidatePassword)) {
      // If it passes our local checks, it's good to go.
      // Its high randomness makes it extremely unlikely to fail the Python script's historical checks.
      return candidatePassword;
    }
  }
};

export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set debouncedValue to value (passed in) after the specified delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Return a cleanup function that will be called every time ...
    // ... useEffect is re-called. useEffect will only be re-called ...
    // ... if value changes (see the dependency array below).
    // This is how we prevent debouncedValue from changing if value is ...
    // ... changed within the delay period. Timeout gets cleared and restarted.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Only re-call effect if value or delay changes

  return debouncedValue;
};

export const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    // Call handler right away so state gets updated with initial window size
    handleResize();
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return windowSize;
};

export const cacheData = (key, data) => {
  if (!window.sessionStorage) return;
  const item = {
    data: data,
    timestamp: Date.now(),
  };
  try {
    sessionStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.warn("Could not cache data:", error);
  }
};

export const getCachedData = (key, maxAgeSeconds = 60) => {
  if (!window.sessionStorage) return null;
  const itemStr = sessionStorage.getItem(key);
  if (!itemStr) return null;

  try {
    // Use reviver function directly during JSON.parse to properly restore Date objects
    const item = JSON.parse(itemStr, (k, v) => {
        if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(v)) {
            return new Date(v);
        }
        if (typeof v === 'object' && v !== null && v.seconds && typeof v.nanoseconds === 'number') {
            return new Date(v.seconds * 1000 + v.nanoseconds / 1000000);
        }
        return v;
    });
    
    const now = Date.now();
    if (now - item.timestamp > maxAgeSeconds * 1000) {
      sessionStorage.removeItem(key);
      return null;
    }
    return item.data;
  } catch (error) {
    console.error("Failed to parse cached data:", error);
    sessionStorage.removeItem(key);
    return null;
  }
};

export const normalizeTimestamps = (data) => {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map(normalizeTimestamps);
  }
  if (typeof data === 'object' && data !== null) {
    // Check for Firestore Timestamp
    if (typeof data.toDate === 'function') {
      return data.toDate().toISOString(); // Convert to a standard, comparable string
    }
    // Recurse for nested objects
    const newObj = {};
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        newObj[key] = normalizeTimestamps(data[key]);
      }
    }
    return newObj;
  }
  return data;
};

