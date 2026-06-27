import { useState, useEffect, useRef } from 'react';
import { db, onSnapshot, doc } from '../utils/firestore';

/**
 * Subscribes to real-time Firestore updates for the user's squad divisions.
 */
export function useDivisionData(user, squads, updateStatsInFirestore) {
  const [divisionData, setDivisionData] = useState({});
  const listenersRef = useRef({});
  const squadsRef = useRef(squads);

  useEffect(() => {
    squadsRef.current = squads;
  }, [squads]);

  useEffect(() => {
    if (!user || !db || !squads) {
      Object.values(listenersRef.current).forEach((unsubscribe) => unsubscribe());
      listenersRef.current = {};
      setDivisionData({});
      return;
    }

    const divisionIds = squads || [];
    const currentListeners = { ...listenersRef.current };

    Object.keys(currentListeners).forEach((divisionId) => {
      if (!divisionIds.includes(divisionId)) {
        currentListeners[divisionId]();
        delete currentListeners[divisionId];
      }
    });

    divisionIds.forEach((divisionId) => {
      if (currentListeners[divisionId]) return;

      console.log(
        `%c[Firestore LISTEN] Subscribing to division: ${divisionId}`,
        'color: #8b5cf6; font-weight: bold;'
      );

      const squadRef = doc(db, 'squads', divisionId);
      currentListeners[divisionId] = onSnapshot(squadRef, (docSnap) => {
        if (docSnap.exists()) {
          setDivisionData((prev) => ({
            ...prev,
            [divisionId]: { id: docSnap.id, ...docSnap.data() },
          }));
          return;
        }

        setDivisionData((prev) => {
          const newData = { ...prev };
          delete newData[divisionId];
          return newData;
        });

        updateStatsInFirestore({
          squads: (squadsRef.current || []).filter((id) => id !== divisionId),
        });
      });
    });

    listenersRef.current = currentListeners;

    return () => {
      Object.values(listenersRef.current).forEach((unsubscribe) => unsubscribe());
      listenersRef.current = {};
    };
  }, [user, squads, updateStatsInFirestore]);

  return { divisionData };
}
