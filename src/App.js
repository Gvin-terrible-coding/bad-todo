// Core Libraries
import React, { useState, useEffect, useCallback, useRef, useMemo, useReducer } from 'react';
import { initializeApp } from 'firebase/app';
import { increment } from 'firebase/firestore';

// Firestore and Auth Helpers
import { db, appId, addDoc, setDoc, updateDoc, deleteDoc, getDocs, doc, collection, query, where, orderBy, limit, startAfter, writeBatch, serverTimestamp, arrayUnion, arrayRemove, runTransaction } from './utils/firestore';

// Constants
import {
  cosmeticItems, wingmanDefinitions, TILE_SIZE, CANVAS_DIMS, tilesetDefinitions, allRollableItems,
  slotMachineFillerItems, petDefinitions, levelTitles, stressEmojis, assignmentTags, labEquipmentDefinitions,
  achievementDefinitions, questDefinitions, contractDefinitions, cosmicEvents, wingmanUpgrades,
  catAnimationSheets, alchemyIngredients, alchemyPlants, alchemyPotions, starChartData,
  fortressUpgradeDefinitions, survivorEnemyDefinitions, survivorTowerDefinitions, fortressBossDefinitions,
  survivorBuffDefinitions
} from './constants/constants';

// Business Logic / Helper Functions & Custom Hooks
import {
  showMessageBox, generatePath, getStartOfDay, shouldGenerateQuests, generateQuests,
  useActionLock,
  generateBreakPasscode, useDebounce, useWindowSize
} from './utils/helpers';

import { useAuth } from './hooks/useAuth';
import { useGameState } from './hooks/useGameState';
import { useDivisionData } from './hooks/useDivisionData';
import { usePetSystem } from './hooks/usePetSystem';
import { useMinigames } from './hooks/useMinigames';
import { useSanctum } from './hooks/useSanctum';

// Components
import AuthComponent from './components/AuthComponent';
import AppGlobalStyles from './app-shell/AppGlobalStyles';
import AppModals from './app-shell/AppModals';
import MainContent from './app-shell/MainContent';
import Sidebar from './app-shell/Sidebar';
import { SanctumManager } from './components/SanctumManager';

const App = () => {
  const { user, isAuthReady, handleSignOut } = useAuth();
  const {
    stats,
    setStats,
    statsRef,
    assignments,
    setAssignments,
    completedAssignments,
    friendProfiles,
    updateStatsInFirestore,
    appKey,
    isRefreshing,
    handleRefreshAllData,
    lastVisibleAssignment,
    setLastVisibleAssignment,
    hasMoreAssignments,
    setHasMoreAssignments,
  } = useGameState(user, isAuthReady);
  const { divisionData } = useDivisionData(user, stats.squads, updateStatsInFirestore);
  const { isSanctumEditMode, exitSanctumEditMode, setSanctumEditMode } = useSanctum();

  const [activeSheet, setActiveSheet] = useState('Stats + XP Tracker');
  const [isScheduleLinkedOperationModalOpen, setIsScheduleLinkedOperationModalOpen] = useState(false);
  const [linkedAssignmentTitle, setLinkedAssignmentTitle] = useState('');
  const dungeonXpRef = useRef(null);

  // --- NEW: State for Break Passcode Rewards ---
  const [tasksForReward, setTasksForReward] = useState(0);
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [generatedPasscode, setGeneratedPasscode] = useState('');
  const TASKS_PER_REWARD = 3; // How many tasks to complete to get a passcode

  // --- NEW: Triage State ---
  // NEW: Triage State ---
  const [triageState, setTriageState] = useState({ isOpen: false, needsSetup: false });
  const [dungeonResetKey, setDungeonResetKey] = useState(0); // NEW: Key to force dungeon remount

  // --- NEW: Focus Navigator State ---
  const [missionControlState, setMissionControlState] = useState({ isOpen: false, assignment: null });
  const [activeMissionState, setActiveMissionState] = useState({ isActive: false, route: null, assignmentName: null });
  
  // --- Mobile Responsiveness State ---
  const { width } = useWindowSize();
  const isMobile = width < 768; // Tailwind's `md` breakpoint
  const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
  const pinCooldownsRef = useRef({});
  
  // NEW: State for Operations Room events tracking
  const [monthlyEvents, setMonthlyEvents] = useState([]);
  const [lastEventCheckTime, setLastEventCheckTime] = useState(null);

  // Effect to handle sidebar state when resizing across the breakpoint
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);

  // NEW: Compute if there are new events
  const hasNewEvents = useMemo(() => {
    if (!lastEventCheckTime || monthlyEvents.length === 0) return false;
    return monthlyEvents.some(event => {
      const eventCreatedTime = event.createdAt?.toDate?.()?.getTime?.() || 0;
      return eventCreatedTime > lastEventCheckTime;
    });
  }, [monthlyEvents, lastEventCheckTime]);

  const handleOpenOperationsRoom = () => {
    setActiveSheet('Operations Room');
    setLastEventCheckTime(Date.now());
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSlotAnimationOpen, setIsSlotAnimationOpen] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [xpGainToShow, setXpGainToShow] = useState(0);
  const [xpAnimationKey, setXpAnimationKey] = useState(0);
  const [xpAnimationOriginEvent, setXpAnimationOriginEvent] = useState(null);
  const primeAudioRef = useRef(null);
  const processAchievementRef = useRef(null);

  const addIngredientToInventory = useCallback(async (ingredientId, amount = 1) => {
    if (!db || !user) return;
    const key = `alchemy_state.inventory.${ingredientId}`;
    try {
        await updateStatsInFirestore({ [key]: increment(amount) });
        const ingredientName = alchemyIngredients[ingredientId]?.name || 'an ingredient';
        showMessageBox(`You found: ${amount}x ${ingredientName}!`, 'info');
    } catch (error) {
        console.error("Error adding ingredient:", error);
        showMessageBox("Failed to add ingredient to inventory.", "error");
    }
  }, [user, db, updateStatsInFirestore, showMessageBox]);

  const actionLock = useActionLock();

  const getFullPetDetails = useCallback((petId) => {
    if (!petId) return null;
    for (const rarity of Object.keys(petDefinitions)) {
      for (const basePet of petDefinitions[rarity]) {
        if (basePet.id === petId) return basePet;
        if (basePet.evolutions) {
          const evolution = basePet.evolutions.find(evo => evo.id === petId);
          if (evolution) return evolution;
        }
      }
    }
    return null;
  }, []);

  const getFullCosmeticDetails = useCallback((itemId, itemType) => {
    if (!itemId || !itemType || !cosmeticItems[itemType]) return null;
    return cosmeticItems[itemType].find(item => item.id === itemId) || null;
  }, []);

  const getItemStyle = useCallback((item) => {
    if (!item) return {};
    if (item.placeholder && item.placeholder !== 'URL_PLACEHOLDER') {
      return { backgroundImage: `url(${item.placeholder})`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    return item.style && typeof item.style === 'object' ? item.style : {};
  }, []);

  // REFACTORED: Derive from single `stats` object
  // REFACTORED: Derive from single `stats` object
  // FIX: Use optional chaining (?.) to prevent crash if `equippedItems` is undefined during data load.
  const equippedFont = getFullCosmeticDetails(stats?.equippedItems?.font, 'fonts');
  const equippedFontStyle = equippedFont ? equippedFont.style : 'font-inter';
  
  const equippedAvatar = getFullCosmeticDetails(stats?.equippedItems?.avatar, 'avatars');
  const equippedAvatarDisplay = equippedAvatar ? equippedAvatar.display : 'ðŸ‘¤';

  const userId = user?.uid;

  const getTotalXpForLevel = useCallback((level) => {
    if (level <= 1) return 0;
    const n = level - 1;
    const totalXp = (n / 2) * (2 * 100 + (n - 1) * 50);
    return Math.floor(totalXp);
  }, []);

  const calculateLevelInfo = useCallback((totalXP) => {
    let level = 1;
    while (totalXP >= getTotalXpForLevel(level + 1)) {
      level++;
    }
    const xpForCurrentLevel = getTotalXpForLevel(level);
    const xpForNextLevel = getTotalXpForLevel(level + 1);
    const xpProgressInLevel = totalXP - xpForCurrentLevel;
    const xpNeededForLevelUp = xpForNextLevel - xpForCurrentLevel;
    return { level, xpProgressInLevel, xpNeededForLevelUp };
  }, [getTotalXpForLevel]);

  const {
    collectFirstEgg,
    collectNewEgg,
    handleEvolvePet,
    hatchEgg,
  } = usePetSystem({ user, stats, actionLock, calculateLevelInfo, processAchievementRef });

  const {
    resetDungeonGame,
    resetTowerDefenseGame,
    spinProductivitySlotMachine,
    handleSlotAnimationComplete,
  } = useMinigames({
    user,
    stats,
    statsRef,
    setStats,
    actionLock,
    calculateLevelInfo,
    setIsSlotAnimationOpen,
    setDungeonResetKey,
  });

  const handleTogglePin = async (assignmentId, isPinned) => {
    const now = Date.now();
    const COOLDOWN_MS = 2000; // 2 second cooldown
    const lastPinTime = pinCooldownsRef.current[assignmentId] || 0;

    if (now - lastPinTime < COOLDOWN_MS) {
      showMessageBox("You're toggling this pin too quickly.", "error");
      return;
    }

    const pinnedCount = assignments.filter(a => a.pinned).length;
    if (!isPinned && pinnedCount >= 5) {
      showMessageBox("You can only pin a maximum of 5 assignments.", "error");
      return;
    }

    pinCooldownsRef.current[assignmentId] = now;

    try {
      await updateAssignmentInFirestore(assignmentId, { pinned: !isPinned });
    } catch (error) {
      console.error("Error toggling pin:", error);
      // Reset cooldown on failure so user can try again
      pinCooldownsRef.current[assignmentId] = 0;
    }
  };

  const loadMoreAssignments = async () => {
    if (!hasMoreAssignments || !lastVisibleAssignment) return;

    const assignmentsQuery = query(
      collection(db, `artifacts/${appId}/public/data/assignmentTracker`),
      where("userId", "==", user.uid),
      where("status", "!=", "Completed"),
      where("pinned", "==", false),
      orderBy("dueDate", "asc"),
      startAfter(lastVisibleAssignment),
      limit(20)
    );

    const documentSnapshots = await getDocs(assignmentsQuery);
    const newAssignments = documentSnapshots.docs.map(doc => ({
        id: doc.id, ...doc.data(),
        dueDate: doc.data().dueDate?.toDate(),
        dateCompleted: doc.data().dateCompleted?.toDate(),
    }));

    setLastVisibleAssignment(documentSnapshots.docs[documentSnapshots.docs.length-1]);
    setAssignments(prev => [...prev, ...newAssignments]);
    if (documentSnapshots.docs.length < 20) {
      setHasMoreAssignments(false);
    }
  };

  const handleScheduleLinkedOperation = async (eventData) => {
    const { divisionId, ...restOfEventData } = eventData;
    if (!divisionId) {
      showMessageBox("Error: No division was selected for the operation.", "error");
      return;
    }
    
    const eventCollectionRef = collection(db, `squads/${divisionId}/events`);
    const newEventData = {
      ...restOfEventData,
      creatorId: user.uid,
      creatorUsername: stats.username,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(eventCollectionRef, newEventData);
      showMessageBox(`Operation "${eventData.title}" scheduled in division!`, "info");
      setIsScheduleLinkedOperationModalOpen(false);
    } catch (error) {
      console.error("Error creating linked event:", error);
      showMessageBox("Failed to schedule the operation.", "error");
    }
  };

  const openScheduleLinkedOperationModal = (assignmentTitle) => {
setLinkedAssignmentTitle(assignmentTitle);
    setIsScheduleLinkedOperationModalOpen(true);
  };

  const handleAcceptInvite = async (squadId) => {
    if ((stats.squads || []).length >= 3) {
      showMessageBox("You cannot be in more than 3 divisions.", "error");
      return;
    }
    const batch = writeBatch(db);
    const squadRef = doc(db, 'squads', squadId);
    batch.update(squadRef, {
      [`members.${user.uid}`]: { username: stats.username, color: '#f87171' }, // Default color, can be randomized later
      pendingInvites: arrayRemove(user.uid)
    });
    const userStatsRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);
    batch.update(userStatsRef, {
      squads: arrayUnion(squadId),
      squadInvites: arrayRemove(squadId)
    });
    await batch.commit();
    showMessageBox("Joined division!", "info");
  };
  
  const handleDeclineInvite = async (squadId) => {
    const batch = writeBatch(db);
    const squadRef = doc(db, 'squads', squadId);
    batch.update(squadRef, { pendingInvites: arrayRemove(user.uid) });
    const userStatsRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);
    batch.update(userStatsRef, { squadInvites: arrayRemove(squadId) });
    await batch.commit();
    showMessageBox("Invite declined.", "info");
  };



  const handleAddAssignment = async (newAssignmentData) => {
    if (!newAssignmentData.assignment) {
      showMessageBox("Assignment Name is required.", "error");
      return;
    }

    let subtasks = [];
    if (newAssignmentData.isEpic) {
      subtasks = [
        { name: 'Research & Outline', completed: false },
        { name: 'Complete First Draft', completed: false },
        { name: 'Review & Edit Pass', completed: false },
        { name: 'Final Submission Prep', completed: false }
      ];
    }

    const assignmentToSave = {
      ...newAssignmentData,
      isEpicQuest: newAssignmentData.isEpic || false,
      dueDate: newAssignmentData.dueDate ? new Date(newAssignmentData.dueDate) : null,
      timeEstimate: parseFloat(newAssignmentData.timeEstimate) || 0,
      pointsEarned: parseFloat(newAssignmentData.pointsEarned) || 0,
      pointsMax: parseFloat(newAssignmentData.pointsMax) || 0,
      recurrenceType: newAssignmentData.recurrenceType || 'none',
      recurrenceEndDate: newAssignmentData.recurrenceEndDate ? new Date(newAssignmentData.recurrenceEndDate) : null,
      tags: newAssignmentData.tags || [],
      dateCompleted: null,
      subtasks: subtasks,
    };
    delete assignmentToSave.isEpic; // clean up temp flag


    await addAssignmentToFirestore(assignmentToSave);
    showMessageBox("Assignment added successfully!", "info");
  };


  useEffect(() => {
    if (user && stats.quests && stats.quests.lastUpdated) {
      if (shouldGenerateQuests(stats.quests.lastUpdated)) {
        console.log('Generating new daily/weekly quests...');
        const newQuests = generateQuests();
        updateStatsInFirestore({ quests: newQuests });
        showMessageBox('Your daily and weekly quests have been refreshed!', 'info');
      }
    }
  }, [user, stats.quests, updateStatsInFirestore]);

  const triageableAssignments = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const tenDaysFromNow = new Date();
    tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);
    tenDaysFromNow.setHours(23, 59, 59, 999);

    const triage = assignments.filter(a => {
      if (a.status === 'Completed' || !a.dueDate) {
        return false;
      }
      // Ensure dueDate is a valid Date object for comparison
      const dueDateObj = a.dueDate instanceof Date ? a.dueDate : new Date(a.dueDate);
      // Task must be due between the start of today and 10 days from now.
      return dueDateObj >= startOfToday && dueDateObj <= tenDaysFromNow;
    });
    
    if (triage.length === 0 && assignments.length > 0) {
      console.warn("[Triage Debug] No triageable assignments found. Total assignments:", assignments.length);
      console.warn("[Triage Debug] Sample assignment:", assignments[0]);
      assignments.forEach((a, i) => {
        console.warn(`[Triage Debug] Assignment ${i}: status=${a.status}, dueDate=${a.dueDate}, dueDate instanceof Date=${a.dueDate instanceof Date}`);
      });
    }
    
    return triage;
  }, [assignments]);

  // --- NEW: Triage and Buff Logic ---
  // FIX: This logic is moved into a useEffect to prevent re-render loops.
  useEffect(() => {
    // This condition checks if the user has never set up triage.
    // It will trigger the setup modal to appear automatically one time.
    if (user && !triageState.isOpen && !stats.triageSettings && !stats.lastTriageCompleted) {
      const timer = setTimeout(() => {
        setTriageState({ isOpen: true, needsSetup: true });
      }, 1500); // Delay slightly to not be too jarring on load.
      return () => clearTimeout(timer);
    }
  }, [user, stats.triageSettings, stats.lastTriageCompleted, triageState.isOpen]);

  // This function now only determines if the BANNER should be shown. It has no side effects.
  const shouldShowTriageBanner = useMemo(() => {
    if (!stats.triageSettings) return false; // Don't show banner if setup isn't done.

    const today = new Date();
    const triageDay = stats.triageSettings.triageDay;

    // Calculate the date of this week's triage day.
    const thisWeeksTriageDate = new Date();
    thisWeeksTriageDate.setDate(today.getDate() - (today.getDay() - triageDay + 7) % 7);
    thisWeeksTriageDate.setHours(0, 0, 0, 0);
    
    // Don't show the banner if today is before this week's triage day.
    if (today < thisWeeksTriageDate) {
      return false;
    }

    // FIX: Safely handle the timestamp, which might not be a Firestore object when loaded from cache.
    const lastCompletion = stats.lastTriageCompleted && typeof stats.lastTriageCompleted.toDate === 'function'
      ? stats.lastTriageCompleted.toDate()
      : null;

    // If they have never completed it, show the banner (after setup is done).
    if (!lastCompletion) return true;

    // Show the banner if the last completion was before this week's triage day.
    return lastCompletion < thisWeeksTriageDate;
  }, [stats.triageSettings, stats.lastTriageCompleted]);

  const handleSaveTriageSettings = useCallback((settings) => {
    updateStatsInFirestore({ triageSettings: settings });
    setTriageState({ isOpen: true, needsSetup: false });
  }, [updateStatsInFirestore]);

  const handleCompleteTriage = useCallback(async (assignmentsWithPriority) => {
    if (!db || !user) return;
    const batch = [];
    assignmentsWithPriority.forEach(assignmentUpdate => {
      const docRef = doc(db, `artifacts/${appId}/public/data/assignmentTracker`, assignmentUpdate.id);
      batch.push(updateDoc(docRef, { priorityQuadrant: assignmentUpdate.priorityQuadrant }));
    });
    
    await Promise.all(batch);

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    // Add the buff to the active boosts
    const clarityBuff = { id: 'clarity', name: 'Clarity', expiresAt: sevenDaysFromNow };
    const newActiveBoosts = [...(stats.activeBoosts || []).filter(b => b.id !== 'clarity'), clarityBuff];

    await updateStatsInFirestore({
      lastTriageCompleted: serverTimestamp(),
      activeBoosts: newActiveBoosts
    });
    
    showMessageBox("Weekly Triage Complete! 'Clarity' buff is active.", "info");

  }, [db, user, appId, stats.activeBoosts, updateStatsInFirestore]);


  // Function to calculate days early
  const calculateDaysEarly = (dueDate, dateCompleted) => {
    if (!dueDate || !dateCompleted) return null;
    const diffTime = dueDate.getTime() - dateCompleted.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };



  // Function to get the start of the week (Monday) for a given date
  const getStartOfWeek = (date) => {
    const d = new Date(date);
    const day = d.getDay(); // Sunday - 0, Monday - 1, ..., Saturday - 6
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    return new Date(d.setDate(diff));
  };

  // Function to update assignment in Firestore
  const updateAssignmentInFirestore = async (assignmentId, data) => {
    if (!db) return;
    try {
      const assignmentRef = doc(db, `artifacts/${appId}/public/data/assignmentTracker`, assignmentId);
      await updateDoc(assignmentRef, data);
    } catch (error) {
      console.error("Error updating assignment:", error);
      showMessageBox("Failed to update assignment.", "error");
    }
  };

 // Function to add assignment to Firestore
  const addAssignmentToFirestore = async (newAssignment) => {
    if (!db || !user?.uid) return;
    try {
      // The calling function is responsible for creating a complete, valid object.
      // This function just adds the userId and writes to Firestore.
      await addDoc(collection(db, `artifacts/${appId}/public/data/assignmentTracker`), {
        ...newAssignment,
        userId: user.uid,
      });
    } catch (error) {
      console.error("Error adding assignment:", error);
      // Check for the specific error you mentioned
      if (error.message.includes("Unsupported field value: undefined")) {
          showMessageBox("Failed to add task. A date field might be missing or invalid.", "error");
      } else {
          showMessageBox("Failed to add assignment.", "error");
      }
    }
  };

  // Function to delete assignment from Firestore
  const deleteAssignmentFromFirestore = async (assignmentId) => {
    if (!db) return;
    const docRef = doc(db, `artifacts/${appId}/public/data/assignmentTracker`, assignmentId);
    console.log('%c[Firestore DELETE]', 'color: #ef4444; font-weight: bold;', { path: docRef.path });
    console.trace('Trace for Delete');
    try {
      await deleteDoc(docRef);
    } catch (error) {
      console.error("Error deleting assignment:", error);
      showMessageBox("Failed to delete assignment.", "error");
    }
  };

   // Productivity Persona Logic
  const getProductivityPersona = useCallback(() => {
    if (completedAssignments.length === 0) {
      return {
        name: "The Newbie",
        description: "Start completing assignments to discover your productivity persona!",
        icon: "âœ¨"
      };
    }

    let totalDaysEarly = 0;
    let lateSubmissionsCount = 0;
    let totalPointsScore = 0;
    let totalPointsMax = 0;
    let hardAssignmentsCompleted = 0;
    const totalAssignments = completedAssignments.length;
    let onTimeSubmissions = 0;

    completedAssignments.forEach(trophy => {
      if (trophy.daysEarly !== null) {
        totalDaysEarly += trophy.daysEarly;
      }
      const isLate = trophy.dateCompleted && trophy.dueDate && trophy.dateCompleted > trophy.dueDate;
      if (isLate) {
        lateSubmissionsCount++;
      } else {
        onTimeSubmissions++;
      }
      if (trophy.pointsEarned !== null && trophy.pointsMax !== null && trophy.pointsMax > 0) {
        totalPointsScore += trophy.pointsEarned;
        totalPointsMax += trophy.pointsMax;
      }
      if (trophy.difficulty === 'Hard') {
        hardAssignmentsCompleted++;
      }
    });

    const avgDaysEarly = totalAssignments > 0 ? totalDaysEarly / totalAssignments : 0;
    const avgScore = totalPointsMax > 0 ? (totalPointsScore / totalPointsMax) * 100 : 0;
    const hardCompletionRate = totalAssignments > 0 ? (hardAssignmentsCompleted / totalAssignments) * 100 : 0;
    const latePercentage = (lateSubmissionsCount / totalAssignments) * 100;

    if (avgScore >= 98 && lateSubmissionsCount === 0) return { name: "The Perfectionist", description: "You have an impeccable record of submitting flawless work on time.", icon: "ðŸ’Ž"};
    if (avgScore >= 90 && hardCompletionRate >= 20) return { name: "The High-Achieving Conqueror", description: "You consistently aim for excellence and tackle the toughest challenges!", icon: "ðŸ‘‘" };
    if (totalAssignments >= 50 && latePercentage <= 10) return { name: "The Marathoner", description: "You have a long, proven track record of consistency and endurance.", icon: "ðŸƒâ€â™‚ï¸" };
    if (avgDaysEarly >= 2 && lateSubmissionsCount === 0) return { name: "The Early Bird Planner", description: "You love to get things done ahead of time.", icon: "â°" };
    if (hardCompletionRate >= 30) return { name: "The Challenge Seeker", description: "You actively seek out and conquer difficult assignments.", icon: "ðŸ”ï¸" };
    if (latePercentage > 40 && avgScore >= 70) return { name: "The Deadline Dynamo", description: "You thrive under pressure, delivering quality work just in time.", icon: "âš¡" };
    if (avgDaysEarly < 0.5 && lateSubmissionsCount === 0) return { name: "The Just-in-Time Submitter", description: "You masterfully use every minute, delivering right on schedule.", icon: "ðŸŽ¯" };
    if (totalAssignments >= 10 && avgDaysEarly < 1 && latePercentage <= 20) return { name: "The Steady Progressor", description: "You consistently chip away at tasks, making reliable progress.", icon: "ðŸ¢" };
    if (totalAssignments >= 15 && avgScore >= 80 && latePercentage <= 15) return { name: "The All-Rounder", description: "A well-balanced performer, delivering high-quality work on time.", icon: "ðŸ…" };
    if (totalAssignments > 0) return { name: "The Emerging Star", description: "You're building solid habits! Keep going.", icon: "ðŸŒŸ" };
    return { name: "The Newbie", description: "Start completing assignments to discover your persona!", icon: "âœ¨" };
  }, [completedAssignments]);

  const processCompletionRewards = useCallback(async (completedAssignment) => {
      if (!db || !user) return;
      const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);

      try {
          const { xpBonus, newAchievements, completedQuests, assignmentsToHatch } = await runTransaction(db, async (transaction) => {
              const statsDoc = await transaction.get(statsDocRef);
              if (!statsDoc.exists()) throw new Error("User document is missing!");

              const serverStats = statsDoc.data();
              
              const currentXp = dungeonXpRef.current !== null ? dungeonXpRef.current : serverStats.totalXP;
              dungeonXpRef.current = null;

              let calculatedXpBonus = 0, shardBonus = 0;
              let newAchievementsAwarded = [], newlyCompletedQuests = [];
              let activeBoosts = serverStats.activeBoosts || [];

              // Apply and update XP boosts
              const xpBoostIndex = activeBoosts.findIndex(b => b.type === 'xp');
              if (xpBoostIndex > -1) {
                const boost = activeBoosts[xpBoostIndex];
                calculatedXpBonus *= boost.multiplier;
                showMessageBox(`XP Boost applied! (+${((boost.multiplier - 1) * 100).toFixed(0)}%)`, 'info');
                boost.remaining -= 1;
                if (boost.remaining <= 0) {
                  activeBoosts.splice(xpBoostIndex, 1);
                }
              }
              
              if (completedAssignment.focusXpReward) calculatedXpBonus += completedAssignment.focusXpReward;

              const difficultyXpMap = { 'Easy': 10, 'Medium': 15, 'Hard': 20 };
              const baseXpForTask = difficultyXpMap[completedAssignment.difficulty] || 10;
              calculatedXpBonus += baseXpForTask;
              const petBuff = serverStats.currentPet?.xpBuff || 0;
              const newAssignmentsToHatch = serverStats.petStatus === 'egg' 
                ? Math.max(0, (serverStats.assignmentsToHatch || 0) - 1) 
                : (serverStats.assignmentsToHatch || 0);
              
              let quests = JSON.parse(JSON.stringify(serverStats.quests || { daily: [], weekly: [] }));
              const processQuestList = (list) => {
                  list.forEach(q => {
                      if (q.completed) return;
                      let progressMade = false;
                      if (q.type === 'completion') progressMade = true;
                      else if (q.type === 'difficulty' && completedAssignment.difficulty === 'Hard') progressMade = true;
                      else if (q.type === 'tag' && completedAssignment.tags?.includes(q.tag)) progressMade = true;
                      else if (q.type === 'xp') { q.progress = (q.progress || 0) + baseXpForTask; progressMade = true; }
                      
                      if (progressMade && q.type !== 'xp') q.progress = (q.progress || 0) + 1;

                      if (q.progress >= q.goal) {
                          q.completed = true;
                          calculatedXpBonus += q.reward.xp;
                          shardBonus += (q.reward.shards || 0);
                          newlyCompletedQuests.push(q);
                      }
                  });
              };
              processQuestList(quests.daily);
              processQuestList(quests.weekly);

              let achievements = serverStats.achievements || {};
              const checkAchievement = (key) => {
                const def = achievementDefinitions[key];
                let current = achievements[key] || { tier: 0, progress: 0 };
                current.progress += 1;
                const nextTier = def.tiers[current.tier];
                if (nextTier && current.progress >= nextTier.goal) {
                  current.tier += 1;
                  calculatedXpBonus += nextTier.reward.xp;
                  shardBonus += nextTier.reward.shards || 0;
                  newAchievementsAwarded.push(nextTier);
                }
                achievements[key] = current;
              };
              checkAchievement('assignmentsCompleted');
              if (completedAssignment.difficulty === 'Hard') checkAchievement('hardAssignmentsCompleted');
              
              const finalXpGained = Math.round(calculatedXpBonus * (1 + petBuff));
              const newTotalXP = currentXp + finalXpGained;
              const newShards = (serverStats.cosmeticShards || 0) + shardBonus;
              const { level: newLevel } = calculateLevelInfo(newTotalXP);
              
              const statsUpdate = {
                totalXP: newTotalXP,
                currentLevel: newLevel,
                assignmentsCompleted: (serverStats.assignmentsCompleted || 0) + 1,
                assignmentsToHatch: newAssignmentsToHatch,
                cosmeticShards: newShards,
                quests,
                achievements,
                activeBoosts, // Save the updated boosts array
                'cooldowns.completeAssignment': serverTimestamp()
              };

              transaction.update(statsDocRef, statsUpdate);

              return { xpBonus: finalXpGained, newAchievements: newAchievementsAwarded, completedQuests: newlyCompletedQuests, assignmentsToHatch: newAssignmentsToHatch };
          });

          showMessageBox(`Task complete! +${xpBonus} XP.`, "info");
          setXpGainToShow(xpBonus);
          setXpAnimationKey(k => k + 1);
          newAchievements.forEach(a => showMessageBox(`Achievement Unlocked: ${a.name}!`, 'info', 4000));
          completedQuests.forEach(q => showMessageBox(`Quest Complete: ${q.name}!`, 'info', 4000));

          if (stats.petStatus === 'egg' && assignmentsToHatch <= 0) {
            await hatchEgg();
          }
      } catch (error) {
          console.error("Reward processing transaction failed: ", error);
          showMessageBox("Failed to award XP due to a server error.", "error");
      }
  }, [user, db, appId, calculateLevelInfo, hatchEgg, stats.petStatus]);
    const processAchievement = useCallback(async (achievementKey, progressValue = null) => {
    if (!db || !user) return;
    const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);
    
    try {
        await runTransaction(db, async (transaction) => {
            const statsDoc = await transaction.get(statsDocRef);
            if (!statsDoc.exists()) throw new Error("User data missing for achievement.");

            const serverStats = statsDoc.data();
            
            const achievements = serverStats.achievements || {};
            const achievement = achievements[achievementKey] || { tier: 0, progress: 0 };
            const definition = achievementDefinitions[achievementKey];
            const nextTier = definition.tiers[achievement.tier];
            
            if (!nextTier) return;

            const newProgress = progressValue ? Math.max(achievement.progress, progressValue) : achievement.progress + 1;
            achievement.progress = newProgress;
            
            if (newProgress >= nextTier.goal) {
                achievement.tier += 1;
                
                const { xp, shards } = nextTier.reward;
                const petBuff = serverStats.currentPet?.xpBuff || 0;
                const finalXp = Math.round(xp * (1 + petBuff));
                
                const newTotalXP = serverStats.totalXP + finalXp;
                const { level: newLevel } = calculateLevelInfo(newTotalXP);
                
                const updateData = {
                    totalXP: newTotalXP,
                    currentLevel: newLevel,
                    achievements: achievements
                };
                if (shards) {
                    updateData.cosmeticShards = (serverStats.cosmeticShards || 0) + shards;
                }
                transaction.update(statsDocRef, updateData);

                setTimeout(() => {
                    showMessageBox(`Achievement Unlocked: ${nextTier.name}!`, 'info', 4000);
                }, 500);
            } else {
                transaction.update(statsDocRef, { achievements });
            }
        });
    } catch (error) {
        console.error(`Achievement processing failed for ${achievementKey}:`, error);
    }
  }, [user, db, appId, calculateLevelInfo]);
  processAchievementRef.current = processAchievement;

  const handleCompletedToggle = (e, id, currentAssignment) => actionLock(async () => {
    if (!db || !user?.uid) return;
    const isCompleting = currentAssignment.status !== 'Completed';

    try {
      if (isCompleting) {
        const completionDate = new Date();
        const daysEarly = calculateDaysEarly(currentAssignment.dueDate, completionDate);

        // This object contains all the edited data from the panel, plus the new completion status.
        const dataToSave = {
          ...currentAssignment,
          status: 'Completed',
          dateCompleted: serverTimestamp(),
          daysEarly: daysEarly,
          // CRITICAL FIX: Ensure any undefined date fields are converted to null before saving.
          dueDate: currentAssignment.dueDate || null,
          recurrenceEndDate: currentAssignment.recurrenceEndDate || null,
        };
        delete dataToSave.id; // Ensure the doc ID isn't written as a field

        // This single update saves both edits and the completion status.
        await updateAssignmentInFirestore(id, dataToSave);

        // Trigger animations and process rewards
        setShowCompletionAnimation(true);
        if (primeAudioRef.current) { primeAudioRef.current(); setXpAnimationOriginEvent(e.currentTarget); }
        await processCompletionRewards({ ...currentAssignment, dateCompleted: completionDate, daysEarly });

        // --- NEW: Break Passcode Reward Logic ---
          const newTasksCount = tasksForReward + 1;
          if (newTasksCount >= TASKS_PER_REWARD) {
            const passcode = generateBreakPasscode();
            setGeneratedPasscode(passcode);
            setIsRewardModalOpen(true);
            setTasksForReward(0); // Reset the counter
          } else {
            setTasksForReward(newTasksCount);
            showMessageBox(`${TASKS_PER_REWARD - newTasksCount} more task(s) until your next break!`, 'info');
          }

          // Handle recurrence after the original task is successfully completed
        if (currentAssignment.recurrenceType && currentAssignment.recurrenceType !== 'none' && currentAssignment.dueDate) {
          let nextDueDate = new Date(currentAssignment.dueDate);
          if (currentAssignment.recurrenceType === 'daily') nextDueDate.setDate(nextDueDate.getDate() + 1);
          else if (currentAssignment.recurrenceType === 'weekly') nextDueDate.setDate(nextDueDate.getDate() + 7);
          else if (currentAssignment.recurrenceType === 'monthly') nextDueDate.setMonth(nextDueDate.getMonth() + 1);

          if (!currentAssignment.recurrenceEndDate || nextDueDate <= currentAssignment.recurrenceEndDate) {
            const newRecurringAssignment = {
              ...currentAssignment,
              dueDate: nextDueDate,
              status: 'To Do',
              dateCompleted: null, // Reset completion status
              daysEarly: null,
              subtasks: (currentAssignment.subtasks || []).map(st => ({ ...st, completed: false })),
              recurrenceEndDate: currentAssignment.recurrenceEndDate || null,
            };
            delete newRecurringAssignment.id; // Remove ID for the new document
            
            await addAssignmentToFirestore(newRecurringAssignment);
            showMessageBox(`New recurring task "${newRecurringAssignment.assignment}" created.`, "info");
          }
        }
      } else {
        // This is for un-completing a task
        await updateAssignmentInFirestore(id, { status: 'To Do', dateCompleted: null, daysEarly: null });
        showMessageBox("Assignment marked as to-do.", "info");
      }
    } catch (error) {
      console.error("Error toggling completion:", error);
      showMessageBox(`Operation failed: ${error.message}`, "error");
    }
  });

const handleAcceptContract = useCallback(() => actionLock(async () => {
    const contract = stats.contract;
    if (!db || !user || !contract || contract.status !== 'offered') return;
    
    if (stats.totalXP < contract.deposit) {
      showMessageBox("Not enough XP to accept this contract.", "error");
      return;
    }

    const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);
    try {
      await updateDoc(statsDocRef, {
        totalXP: increment(-contract.deposit),
        'contract.status': 'active',
        'contract.acceptedAt': serverTimestamp(),
      });
      showMessageBox(`Contract accepted! Deposit of ${contract.deposit} XP paid. Good luck.`, "info");
    } catch (error) {
      showMessageBox("Failed to accept contract.", "error");
    }
  }), [user, db, appId, stats.contract, stats.totalXP, actionLock, showMessageBox]);

  const promptMissionStart = useCallback((assignment) => {
    if (stats.totalXP < 5) {
      showMessageBox("You need 5 XP to start a mission.", "error");
      return;
    }
    setMissionControlState({ isOpen: true, assignment: assignment });
  }, [stats.totalXP]);

  const launchMission = useCallback(async (route) => {
    if (!route) return;
    setMissionControlState({ isOpen: false, assignment: null });
    // Deduct cost immediately for launching
    await updateStatsInFirestore({ totalXP: stats.totalXP - 5 });
    setActiveMissionState({
      isActive: true,
      route: route,
      assignmentId: missionControlState.assignment.id,
      assignmentName: missionControlState.assignment.assignment,
    });
  }, [missionControlState.assignment, stats.totalXP, updateStatsInFirestore]);

    const handleMissionComplete = useCallback(async (isSuccess) => {
    const mission = activeMissionState;
    setActiveMissionState({ isActive: false, route: null, assignmentName: null });

    if (isSuccess) {
      showMessageBox(`Mission Success! Arrived at ${starChartData.locations.find(l => l.id === mission.route.to).name}.`, 'info');
      
      await updateAssignmentInFirestore(mission.assignmentId, { focusXpReward: mission.route.xpReward });

      const missionDuration = mission.route.duration;
      const focusNavigator = stats.focusNavigator || { unlockedLocations: ['genesis_prime'], explorerStreak: 0, lastStreakDay: null, dailyFocusMinutes: 0 };
      const newUnlocked = [...new Set([...focusNavigator.unlockedLocations, mission.route.to, mission.route.from])];

      const today = new Date();
      const lastSessionDate = focusNavigator.lastStreakDay ? focusNavigator.lastStreakDay.toDate() : null;
      const isSameDay = lastSessionDate ? getStartOfDay(today).getTime() === getStartOfDay(lastSessionDate).getTime() : false;

      let newStreak = focusNavigator.explorerStreak || 0;
      let newDailyMinutes = focusNavigator.dailyFocusMinutes || 0;
      
      if (isSameDay) {
        newDailyMinutes += missionDuration;
      } else {
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const wasYesterday = lastSessionDate ? getStartOfDay(lastSessionDate).getTime() === getStartOfDay(yesterday).getTime() : false;
        
        if (wasYesterday && newDailyMinutes >= 45) {
          newStreak += 1;
          showMessageBox(`Explorer's Streak extended to ${newStreak} days!`, 'info', 4000);
        } else if (lastSessionDate) { // Avoid resetting streak for the very first session ever
          if (newStreak > 0) showMessageBox(`Daily focus goal missed. Streak reset.`, 'error', 4000);
          newStreak = 0;
        }
        newDailyMinutes = missionDuration;
      }

      if (newDailyMinutes >= 45 && (!focusNavigator.dailyFocusMinutes || focusNavigator.dailyFocusMinutes < 45 || !isSameDay)) {
        showMessageBox(`Daily focus goal of 45 minutes reached!`, 'info', 4000);
        if (newStreak === 0) newStreak = 1;
      }

      // Quest progress for focus time
      // This part doesn't need a transaction as it's not a currency.
      // We will read the latest stats and then update.
      const currentQuests = stats.quests || { daily: [], weekly: [] };
      let questsUpdated = false;
      const updateQuestProgress = (list) => {
        list.forEach(q => {
          if (!q.completed && q.type === 'focusTime') {
            q.progress = (q.progress || 0) + missionDuration;
            questsUpdated = true;
            if (q.progress >= q.goal) {
              // Note: The reward for focus quests is given immediately, not on task completion.
              q.completed = true;
              const rewardXp = q.reward.xp || 0;
              const rewardShards = q.reward.shards || 0;
              updateStatsInFirestore({
                totalXP: stats.totalXP + rewardXp,
                cosmeticShards: (stats.cosmeticShards || 0) + rewardShards,
              });
              showMessageBox(`Quest Complete: ${q.name}!`, 'info', 4000);
            }
          }
        });
      };
      updateQuestProgress(currentQuests.daily);
      updateQuestProgress(currentQuests.weekly);

      const newFocusNavigatorState = {
        ...focusNavigator,
        unlockedLocations: newUnlocked,
        explorerStreak: newStreak,
        dailyFocusMinutes: newDailyMinutes,
        lastStreakDay: serverTimestamp(),
      };
      
      // --- Cosmic Event Logic ---
      const didExtendStreak = newStreak > (focusNavigator.explorerStreak || 0);
      if (didExtendStreak && Math.random() < 0.33) { // 33% chance on streak extension
        const totalWeight = cosmicEvents.reduce((sum, event) => sum + event.weight, 0);
        let roll = Math.random() * totalWeight;
        const chosenEvent = cosmicEvents.find(event => {
          roll -= event.weight;
          return roll <= 0;
        });

        if (chosenEvent) {
          setTimeout(() => { // Delay message to show after "Mission Success"
            showMessageBox(`âœ¨ Cosmic Event: ${chosenEvent.description}`, 'info', 6000);
            
            const eventUpdate = {};
            switch (chosenEvent.reward.type) {
              case 'shards':
                eventUpdate.cosmeticShards = (stats.cosmeticShards || 0) + chosenEvent.reward.amount;
                break;
              case 'xp':
                eventUpdate.totalXP = (stats.totalXP || 0) + chosenEvent.reward.amount;
                break;
              case 'xp_boost':
                eventUpdate.activeBoosts = [...(stats.activeBoosts || []), { type: 'xp', multiplier: chosenEvent.reward.multiplier, remaining: chosenEvent.reward.duration }];
                break;
              case 'cosmetic':
                if (!stats.ownedItems.includes(chosenEvent.reward.cosmeticId)) {
                  eventUpdate.ownedItems = [...(stats.ownedItems || []), chosenEvent.reward.cosmeticId];
                }
                break;
              default: break;
            }
            if (Object.keys(eventUpdate).length > 0) {
              updateStatsInFirestore(eventUpdate);
            }
          }, 1500);
        }
      }

      await updateStatsInFirestore({ focusNavigator: newFocusNavigatorState });

    } else {
      showMessageBox("Mission Failed. No reward gained.", "error");
    }
  }, [activeMissionState, stats.focusNavigator, updateStatsInFirestore]);
  
  if (!isAuthReady) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
  }

  if (!user) {
    return <AuthComponent />;
  }

  return (
    <>
      <AppModals
        stats={stats}
        calculateLevelInfo={calculateLevelInfo}
        isMobile={isMobile}
        triageableAssignments={triageableAssignments}
        divisionData={divisionData}
        rewardModal={{
          isOpen: isRewardModalOpen,
          onClose: () => setIsRewardModalOpen(false),
          passcode: generatedPasscode,
        }}
        triageModal={{
          isOpen: triageState.isOpen,
          onClose: () => setTriageState({ isOpen: false, needsSetup: false }),
          onSaveSettings: handleSaveTriageSettings,
          onCompleteTriage: handleCompleteTriage,
        }}
        addAssignmentModal={{
          isOpen: isAddModalOpen,
          onClose: () => setIsAddModalOpen(false),
          onSubmit: handleAddAssignment,
          onScheduleLinkedOperation: openScheduleLinkedOperationModal,
          showMessageBox,
        }}
        missionControlModal={{
          isOpen: missionControlState.isOpen,
          onClose: () => setMissionControlState({ isOpen: false, assignment: null }),
          assignment: missionControlState.assignment,
          unlockedLocations: stats.focusNavigator?.unlockedLocations,
          onLaunchMission: launchMission,
        }}
        scheduleLinkedOperationModal={{
          isOpen: isScheduleLinkedOperationModalOpen,
          onClose: () => setIsScheduleLinkedOperationModalOpen(false),
          onSchedule: handleScheduleLinkedOperation,
          assignmentTitle: linkedAssignmentTitle,
          showMessageBox,
        }}
        activeMissionState={activeMissionState}
        onMissionComplete={handleMissionComplete}
        completionAnimations={{
          showCompletionAnimation,
          onCompletionAnimationEnd: () => setShowCompletionAnimation(false),
          isSlotAnimationOpen,
          onSlotClose: () => setIsSlotAnimationOpen(false),
          onSlotComplete: handleSlotAnimationComplete,
          xpAnimationKey,
          xpGainToShow,
          xpAnimationOriginEvent,
          onXpAnimationComplete: () => {
            setXpGainToShow(0);
            setXpAnimationOriginEvent(null);
          },
          onAudioReady: (primeFn) => {
            primeAudioRef.current = primeFn;
          },
        }}
      />

      <SanctumManager
        isActive={isSanctumEditMode}
        onExit={exitSanctumEditMode}
        stats={stats}
        updateStatsInFirestore={updateStatsInFirestore}
        showMessageBox={showMessageBox}
        processAchievement={processAchievement}
      />

      <div
        className={`min-h-screen font-inter text-slate-300 flex bg-slate-900 relative ${equippedFontStyle || 'font-inter'} ${activeMissionState.isActive ? 'pointer-events-none' : ''} ${isSanctumEditMode ? 'hidden' : ''}`}
      >
        <AppGlobalStyles />

        {isMobile && isSidebarOpen && (
          <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-30 md:hidden"></div>
        )}

        <div id="messageBox" className="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-y-full opacity-0">
          <p id="messageText" className="text-white"></p>
        </div>

        <Sidebar
          activeSheet={activeSheet}
          equippedAvatarDisplay={equippedAvatarDisplay}
          hasNewEvents={hasNewEvents}
          isMobile={isMobile}
          isSidebarOpen={isSidebarOpen}
          onOpenOperationsRoom={handleOpenOperationsRoom}
          onSheetChange={setActiveSheet}
          onSignOut={handleSignOut}
          setIsSidebarOpen={setIsSidebarOpen}
          stats={stats}
          user={user}
        />
        <MainContent
          actionLock={actionLock}
          activeSheet={activeSheet}
          addIngredientToInventory={addIngredientToInventory}
          appId={appId}
          appKey={appKey}
          assignments={assignments}
          calculateLevelInfo={calculateLevelInfo}
          collectFirstEgg={collectFirstEgg}
          collectNewEgg={collectNewEgg}
          completedAssignments={completedAssignments}
          db={db}
          deleteAssignmentFromFirestore={deleteAssignmentFromFirestore}
          divisionData={divisionData}
          dungeonResetKey={dungeonResetKey}
          dungeonXpRef={dungeonXpRef}
          friendProfiles={friendProfiles}
          generatePath={generatePath}
          getFullCosmeticDetails={getFullCosmeticDetails}
          getFullPetDetails={getFullPetDetails}
          getItemStyle={getItemStyle}
          getProductivityPersona={getProductivityPersona}
          getStartOfWeek={getStartOfWeek}
          handleAcceptContract={handleAcceptContract}
          handleAcceptInvite={handleAcceptInvite}
          handleCompletedToggle={handleCompletedToggle}
          handleDeclineInvite={handleDeclineInvite}
          handleEvolvePet={handleEvolvePet}
          handleRefreshAllData={handleRefreshAllData}
          handleTogglePin={handleTogglePin}
          hasMoreAssignments={hasMoreAssignments}
          hatchEgg={hatchEgg}
          isMobile={isMobile}
          isRefreshing={isRefreshing}
          lastEventCheckTime={lastEventCheckTime}
          loadMoreAssignments={loadMoreAssignments}
          monthlyEvents={monthlyEvents}
          processAchievement={processAchievement}
          promptMissionStart={promptMissionStart}
          resetDungeonGame={resetDungeonGame}
          resetTowerDefenseGame={resetTowerDefenseGame}
          setActiveSheet={setActiveSheet}
          setIsAddModalOpen={setIsAddModalOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          setMonthlyEvents={setMonthlyEvents}
          setSanctumEditMode={setSanctumEditMode}
          setTriageState={setTriageState}
          shouldShowTriageBanner={shouldShowTriageBanner}
          showMessageBox={showMessageBox}
          spinProductivitySlotMachine={spinProductivitySlotMachine}
          stats={stats}
          updateAssignmentInFirestore={updateAssignmentInFirestore}
          updateStatsInFirestore={updateStatsInFirestore}
          user={user}
        />
      </div>
    </>
  );
}

export default App;


