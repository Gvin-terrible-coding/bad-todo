import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../utils/firestore';
import { showMessageBox } from '../utils/helpers';

/**
 * Manages Firebase authentication state and sign-out lifecycle.
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (!auth) {
      console.error('Firebase not initialized.');
      setIsAuthReady(true);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = useCallback(async () => {
    try {
      const userId = auth.currentUser?.uid;
      await signOut(auth);
      sessionStorage.removeItem('statsCache');
      if (userId) {
        sessionStorage.removeItem(`statsCache_${userId}`);
        sessionStorage.removeItem(`assignmentsCache_${userId}`);
      }
    } catch (error) {
      console.error('Error signing out:', error);
      showMessageBox('Failed to sign out.', 'error');
    }
  }, []);

  return {
    user,
    isAuthReady,
    handleSignOut,
  };
}
