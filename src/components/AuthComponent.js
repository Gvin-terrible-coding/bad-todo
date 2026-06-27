import React, { useState } from 'react';
import { auth } from '../utils/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const AuthComponent = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      if (!auth || !db) {
          setError("Firebase is not configured correctly.");
          return;
      }
      try {
        if (isLogin) {
          await signInWithEmailAndPassword(auth, email, password);
                } else {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          if (user) {
            const defaultUsername = email.split('@')[0];
            const newUserData = {
              ...defaultStats,
              username: defaultUsername, 
              quests: generateQuests(),
              dungeon_state: generateInitialDungeonState(),
              td_path: generatePath(),
              lab_state: {
                ...defaultStats.lab_state,
                lastLogin: serverTimestamp()
              },
            };

            const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);
            const usernameDocRef = doc(db, `usernames/${defaultUsername.toLowerCase()}`);
            const publicProfileDocRef = doc(db, `publicProfiles`, user.uid);
            
            try {
              // Create the private stats document
              await setDoc(statsDocRef, newUserData);

              // Create the public profile document with only non-sensitive info
              await setDoc(publicProfileDocRef, {
                username: newUserData.username,
                totalXP: newUserData.totalXP,
                currentLevel: newUserData.currentLevel,
                equippedItems: newUserData.equippedItems,
                assignmentsCompleted: newUserData.assignmentsCompleted,
                dungeon_floor: newUserData.dungeon_floor,
              });

              // Create the public username document so the user is searchable immediately
              await setDoc(usernameDocRef, { userId: user.uid });
            } catch (dbError) {
              console.error("Firestore document creation failed after user signup:", dbError);
              setError("Account was created, but failed to save initial user data. Please contact support.");
            }
          }
        }

      } catch (authError) {
        console.error("Authentication error:", authError);
        setError(authError.message.replace('Firebase: ', ''));
      }
    };

    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
        <div className="w-full max-w-md p-8 space-y-6 bg-slate-800 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-center">{isLogin ? 'Sign In' : 'Sign Up'}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="text-sm font-bold text-slate-400 block mb-2">Email Address</label>
              <input
                type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="password"className="text-sm font-bold text-slate-400 block mb-2">Password</label>
              <input
                type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button type="submit" className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-md text-white font-bold transition-colors">
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
          <div className="text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-indigo-400 hover:underline">
              {isLogin ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </div>
    );
  };

export default AuthComponent;
