import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  db,
  appId,
  getDoc,
  getDocs,
  onSnapshot,
  doc,
  collection,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
  serverTimestamp,
} from '../utils/firestore';
import {
  showMessageBox,
  defaultStats,
  cacheData,
  getCachedData,
} from '../utils/helpers';

const PUBLIC_PROFILE_FIELDS = [
  'username',
  'totalXP',
  'currentLevel',
  'equippedItems',
  'assignmentsCompleted',
  'dungeon_floor',
];

function mapAssignmentDoc(docSnap) {
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    dueDate: data.dueDate?.toDate(),
    dateCompleted: data.dateCompleted?.toDate(),
    subtasks: data.subtasks || [],
    recurrenceType: data.recurrenceType || 'none',
    recurrenceEndDate: data.recurrenceEndDate?.toDate(),
    tags: data.tags || [],
    isEpicQuest: data.isEpicQuest || false,
  };
}

function buildStatsFromSnapshot(docSnap, fallbackUsername) {
  if (!docSnap.exists()) {
    return { ...defaultStats, username: fallbackUsername };
  }

  const data = docSnap.data();
  return {
    ...defaultStats,
    ...data,
    username: data.username || fallbackUsername,
  };
}

/**
 * Manages consolidated user stats, assignments, Firestore sync, and caching.
 */
export function useGameState(user, isAuthReady) {
  const [stats, setStats] = useState(
    () => getCachedData('statsCache', 60) || defaultStats
  );
  const [assignments, setAssignments] = useState([]);
  const [friendProfiles, setFriendProfiles] = useState({});
  const [appKey, setAppKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastVisibleAssignment, setLastVisibleAssignment] = useState(null);
  const [hasMoreAssignments, setHasMoreAssignments] = useState(true);

  const statsRef = useRef(stats);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  const completedAssignments = useMemo(
    () => assignments.filter((assignment) => assignment.status === 'Completed'),
    [assignments]
  );

  const updateStatsInFirestore = useCallback(
    async (dataToUpdate) => {
      if (!db || !user) return;

      const lastActionTime = statsRef.current.lastActionTimestamp?.toDate()?.getTime();
      if (lastActionTime && Date.now() - lastActionTime < 150) {
        showMessageBox("You're acting too quickly!", 'error');
        return Promise.reject(new Error('COOLDOWN_ACTIVE'));
      }

      const docRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);
      const finalData = { ...dataToUpdate, lastActionTimestamp: serverTimestamp() };

      try {
        const publicProfileRef = doc(db, 'publicProfiles', user.uid);
        const publicDataToUpdate = {};

        Object.keys(dataToUpdate).forEach((key) => {
          const baseKey = key.split('.')[0];
          if (PUBLIC_PROFILE_FIELDS.includes(baseKey)) {
            publicDataToUpdate[key] = dataToUpdate[key];
          }
        });

        const batch = writeBatch(db);
        batch.update(docRef, finalData);

        if (Object.keys(publicDataToUpdate).length > 0) {
          batch.set(publicProfileRef, publicDataToUpdate, { merge: true });
        }

        await batch.commit();
      } catch (error) {
        console.error('Firestore Write Error (Stats):', error);
        showMessageBox('Failed to update stats.', 'error');
      }
    },
    [user]
  );

  const handleRefreshAllData = useCallback(() => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    sessionStorage.removeItem('statsCache');
    if (user?.uid) {
      sessionStorage.removeItem(`statsCache_${user.uid}`);
      sessionStorage.removeItem(`assignmentsCache_${user.uid}`);
    }
    setAppKey((prevKey) => prevKey + 1);
    showMessageBox('Force refreshing all data...', 'info');
    setTimeout(() => setIsRefreshing(false), 2000);
  }, [isRefreshing, user]);

  useEffect(() => {
    if (!isAuthReady || !user) return;

    const userId = user.uid;
    const fallbackUsername = user.email?.split('@')[0] || '';
    let unsubStats;
    let unsubAssignments;

    const attachListeners = () => {
      console.log('%c[LISTENERS] Attaching real-time listeners.', 'color: #c084fc;');

      const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, userId);
      unsubStats = onSnapshot(statsDocRef, (docSnap) => {
        const data = buildStatsFromSnapshot(docSnap, fallbackUsername);
        setStats(data);
        cacheData(`statsCache_${userId}`, data);
      });

      const assignmentsQueryRT = query(
        collection(db, `artifacts/${appId}/public/data/assignmentTracker`),
        where('userId', '==', userId),
        orderBy('dueDate', 'asc'),
        limit(50)
      );

      unsubAssignments = onSnapshot(assignmentsQueryRT, (snapshot) => {
        const fetchedAssignments = snapshot.docs.map(mapAssignmentDoc);
        setAssignments(fetchedAssignments);
        cacheData(`assignmentsCache_${userId}`, fetchedAssignments);
      });
    };

    const cachedStats = getCachedData(`statsCache_${userId}`);
    const cachedAssignments = getCachedData(`assignmentsCache_${userId}`);

    if (cachedStats && cachedAssignments) {
      console.log('%c[CACHE HIT] Loading initial data from session storage.', 'color: #f59e0b;');
      setStats(cachedStats);
      setAssignments(cachedAssignments);

      const listenerTimer = setTimeout(attachListeners, 1500);
      return () => {
        clearTimeout(listenerTimer);
        if (unsubStats) unsubStats();
        if (unsubAssignments) unsubAssignments();
      };
    }

    console.log('%c[CACHE MISS] Fetching fresh data from Firestore.', 'color: #ef4444;');
    const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, userId);
    getDoc(statsDocRef).then((docSnap) => {
      const data = buildStatsFromSnapshot(docSnap, fallbackUsername);
      setStats(data);
      cacheData(`statsCache_${userId}`, data);
    });

    attachListeners();
    return () => {
      if (unsubStats) unsubStats();
      if (unsubAssignments) unsubAssignments();
    };
  }, [user, isAuthReady, appKey]);

  useEffect(() => {
    if (!db || !stats.friends || stats.friends.length === 0) {
      setFriendProfiles({});
      return;
    }

    const fetchFriendProfiles = async () => {
      try {
        const publicProfilesCollectionRef = collection(db, 'publicProfiles');
        const friendIds = stats.friends;
        const profiles = {};
        const batches = [];

        for (let i = 0; i < friendIds.length; i += 30) {
          const batchIds = friendIds.slice(i, i + 30);
          if (batchIds.length > 0) {
            const friendQuery = query(
              publicProfilesCollectionRef,
              where('__name__', 'in', batchIds)
            );
            batches.push(getDocs(friendQuery));
          }
        }

        const querySnapshotsArray = await Promise.all(batches);
        querySnapshotsArray.forEach((snapshot) => {
          snapshot.forEach((profileDoc) => {
            profiles[profileDoc.id] = { id: profileDoc.id, ...profileDoc.data() };
          });
        });

        setFriendProfiles(profiles);
      } catch (error) {
        console.error('Error fetching friend profiles:', error);
      }
    };

    fetchFriendProfiles();
  }, [stats.friends]);

  return {
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
  };
}
