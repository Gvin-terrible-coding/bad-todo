// Firebase initialization and wrapper functions
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  getFirestore, doc, getDoc as originalGetDoc, addDoc as originalAddDoc, setDoc as originalSetDoc, 
  updateDoc as originalUpdateDoc, deleteDoc as originalDeleteDoc, onSnapshot as originalOnSnapshot, 
  collection, serverTimestamp, runTransaction as originalRunTransaction, query, where, 
  getDocs as originalGetDocs, orderBy, limit, increment, arrayUnion, writeBatch, deleteField, arrayRemove, startAfter
} from 'firebase/firestore';

// Global variables
export const appId = 'default-app-id';
export const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

// Initialize Firebase (only once)
export let app;
export let db;
export let auth;

if (firebaseConfig.projectId && firebaseConfig.projectId !== 'your-project-id-here') {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  console.log(`[Firebase Diagnostics] App initialized for project ID: "${firebaseConfig.projectId}".`);
} else {
  console.error("[Firebase Diagnostics] Firebase config is missing or using a placeholder Project ID. Please check your .env.local file.");
}

export const getDoc = (ref) => {
  console.log('%c[Firestore READ]', 'color: #34d399; font-weight: bold;', { path: ref.path });
  console.trace('Trace for Read');
  return originalGetDoc(ref);
};

export const addDoc = (ref, data) => {
  console.log('%c[Firestore WRITE (Add)]', 'color: #60a5fa; font-weight: bold;', { path: ref.path, data });
  console.trace('Trace for Write (Add)');
  return originalAddDoc(ref, data);
};

export const setDoc = (ref, data, options) => {
  console.log('%c[Firestore WRITE (Set)]', 'color: #facc15; font-weight: bold;', { path: ref.path, data, options });
  console.trace('Trace for Write (Set)');
  return originalSetDoc(ref, data, options);
};

export const updateDoc = (ref, data) => {
  console.log('%c[Firestore WRITE (Update)]', 'color: #f97316; font-weight: bold;', { path: ref.path, data });
  console.trace('Trace for Write (Update)');
  return originalUpdateDoc(ref, data);
};

export const deleteDoc = (ref) => {
  console.log('%c[Firestore WRITE (Delete)]', 'color: #ef4444; font-weight: bold;', { path: ref.path });
  console.trace('Trace for Write (Delete)');
  return originalDeleteDoc(ref);
};

export const getDocs = (queryRef) => {
    console.log('%c[Firestore READ (Query)]', 'color: #34d399; font-weight: bold;', { query: queryRef });
    console.trace('Trace for Read (Query)');
    return originalGetDocs(queryRef);
};

export const onSnapshot = (ref, callback) => {
    console.log('%c[Firestore READ (Listen)]', 'color: #c084fc; font-weight: bold;', { path: ref.path });
    console.trace('Trace for Read (Listen)');
    return originalOnSnapshot(ref, callback);
};

export const runTransaction = (firestore, updateFunction) => {
    console.log('%c[Firestore TRANSACTION]', 'color: #ec4899; font-weight: bold;', 'Starting transaction...');
    console.trace('Trace for Transaction');
    return originalRunTransaction(firestore, updateFunction);
};


export { 
  doc, 
  collection, 
  serverTimestamp, 
  query, 
  where, 
  orderBy, 
  limit, 
  increment, 
  arrayUnion, 
  writeBatch, 
  deleteField, 
  arrayRemove, 
  startAfter 
};
