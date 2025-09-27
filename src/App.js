//used libraries: React, Recharts, TailwindCSS, Firebase, Babel or similar, PostCSS
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  getFirestore, doc, getDoc as originalGetDoc, addDoc as originalAddDoc, setDoc as originalSetDoc, 
  updateDoc as originalUpdateDoc, deleteDoc as originalDeleteDoc, onSnapshot as originalOnSnapshot, 
  collection, serverTimestamp, runTransaction as originalRunTransaction, query, where, 
  getDocs as originalGetDocs, orderBy, limit, increment
} from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Asset Imports for Focus Navigator
import cockpitImage from './assets/images/Space_Focus_Timer/Cockpit_View.png';
import starmapImage from './assets/images/Space_Focus_Timer/Starmap_Select_Background.png';
import planet1 from './assets/images/Space_Focus_Timer/planet_1.png';
import planet2 from './assets/images/Space_Focus_Timer/planet_2.png';
import planet3 from './assets/images/Space_Focus_Timer/planet_3.png';
import planet4 from './assets/images/Space_Focus_Timer/planet_4.png';
import planet5 from './assets/images/Space_Focus_Timer/planet_5.png';
import planet6 from './assets/images/Space_Focus_Timer/planet_6.png';
import planet7 from './assets/images/Space_Focus_Timer/planet_7.png';
import planet8 from './assets/images/Space_Focus_Timer/planet_8.png';
import planet9 from './assets/images/Space_Focus_Timer/planet_9.png';
import planet10 from './assets/images/Space_Focus_Timer/planet_10.png';
import starfieldVideo from './assets/videos/Space Focus Timer/Animated_Starfield.mp4';
import hologramScreen from './assets/images/Space_Focus_Timer/hologram_screen_2.png';
import spaceshipIcon from './assets/images/Space_Focus_Timer/spaceship.png';
import hologramButton from './assets/images/Space_Focus_Timer/hologram_button.png';

import wingmenSpriteSheet from './assets/images/Dungeon/Wingmen_icon_sheet.png';

// --- NEW: Asset Imports for Alchemist's Workshop ---
import alchemyLabIndoorBg from './assets/Maps/AlchemyLabIndoors.png';
import alchemyBenchImage from './assets/images/Alchemy Lab/Indoors_assets/bench.png';
import alchemyCauldronImage from './assets/images/Alchemy Lab/Indoors_assets/cauldron.png';
import alchemyGardenBg from './assets/Maps/AlchemyLabOutdoors.png';

// --- NEW: ALCHEMY CAT SPRITES (ALL VARIATIONS) ---
// Cat 1 (Default)
import catIdleSheet from './assets/Sprites/AlchemyLab/Cat-1-Idle.png';
import catItchSheet from './assets/Sprites/AlchemyLab/Cat-1-Itch.png';
import catLayingSheet from './assets/Sprites/AlchemyLab/Cat-1-Laying.png';
import catLicking1Sheet from './assets/Sprites/AlchemyLab/Cat-1-Licking1.png';
import catLicking2Sheet from './assets/Sprites/AlchemyLab/Cat-1-Licking2.png';
import catMeowSheet from './assets/Sprites/AlchemyLab/Cat-1-Meow.png';
import catRunSheet from './assets/Sprites/AlchemyLab/Cat-1-Run.png';
import catSittingSheet from './assets/Sprites/AlchemyLab/Cat-1-Sitting.png';
import catSleeping1Sheet from './assets/Sprites/AlchemyLab/Cat-1-Sleeping1.png';
import catSleeping2Sheet from './assets/Sprites/AlchemyLab/Cat-1-Sleeping2.png';
import catStretchingSheet from './assets/Sprites/AlchemyLab/Cat-1-Stretching.png';
import catWalkSheet from './assets/Sprites/AlchemyLab/Cat-1-Walk.png';
// Cat 2 (Calico) - Assuming filenames, replace if needed
import cat2IdleSheet from './assets/Sprites/AlchemyLab/Cat-2-Idle.png';
import cat2ItchSheet from './assets/Sprites/AlchemyLab/Cat-2-Itch.png';
import cat2LayingSheet from './assets/Sprites/AlchemyLab/Cat-2-Laying.png';
import cat2Licking1Sheet from './assets/Sprites/AlchemyLab/Cat-2-Licking1.png';
import cat2Licking2Sheet from './assets/Sprites/AlchemyLab/Cat-2-Licking2.png';
import cat2MeowSheet from './assets/Sprites/AlchemyLab/Cat-2-Meow.png';
import cat2RunSheet from './assets/Sprites/AlchemyLab/Cat-2-Run.png';
import cat2SittingSheet from './assets/Sprites/AlchemyLab/Cat-2-Sitting.png';
import cat2Sleeping1Sheet from './assets/Sprites/AlchemyLab/Cat-2-Sleeping1.png';
import cat2Sleeping2Sheet from './assets/Sprites/AlchemyLab/Cat-2-Sleeping2.png';
import cat2StretchingSheet from './assets/Sprites/AlchemyLab/Cat-2-Stretching.png';
import cat2WalkSheet from './assets/Sprites/AlchemyLab/Cat-2-Walk.png';
// Cat 3 (Sable)
import cat3IdleSheet from './assets/Sprites/AlchemyLab/Cat-3-Idle.png';
import cat3ItchSheet from './assets/Sprites/AlchemyLab/Cat-3-Itch.png';
import cat3LayingSheet from './assets/Sprites/AlchemyLab/Cat-3-Laying.png';
import cat3Licking1Sheet from './assets/Sprites/AlchemyLab/Cat-3-Licking1.png';
import cat3Licking2Sheet from './assets/Sprites/AlchemyLab/Cat-3-Licking2.png';
import cat3MeowSheet from './assets/Sprites/AlchemyLab/Cat-3-Meow.png';
import cat3RunSheet from './assets/Sprites/AlchemyLab/Cat-3-Run.png';
import cat3SittingSheet from './assets/Sprites/AlchemyLab/Cat-3-Sitting.png';
import cat3Sleeping1Sheet from './assets/Sprites/AlchemyLab/Cat-3-Sleeping1.png';
import cat3Sleeping2Sheet from './assets/Sprites/AlchemyLab/Cat-3-Sleeping2.png';
import cat3StretchingSheet from './assets/Sprites/AlchemyLab/Cat-3-Stretching.png';
import cat3WalkSheet from './assets/Sprites/AlchemyLab/Cat-3-Walk.png';
// Cat 4 (Ginger)
import cat4IdleSheet from './assets/Sprites/AlchemyLab/Cat-4-Idle.png';
import cat4ItchSheet from './assets/Sprites/AlchemyLab/Cat-4-Itch.png';
import cat4LayingSheet from './assets/Sprites/AlchemyLab/Cat-4-Laying.png';
import cat4Licking1Sheet from './assets/Sprites/AlchemyLab/Cat-4-Licking1.png';
import cat4Licking2Sheet from './assets/Sprites/AlchemyLab/Cat-4-Licking2.png';
import cat4MeowSheet from './assets/Sprites/AlchemyLab/Cat-4-Meow.png';
import cat4RunSheet from './assets/Sprites/AlchemyLab/Cat-4-Run.png';
import cat4SittingSheet from './assets/Sprites/AlchemyLab/Cat-4-Sitting.png';
import cat4Sleeping1Sheet from './assets/Sprites/AlchemyLab/Cat-4-Sleeping1.png';
import cat4Sleeping2Sheet from './assets/Sprites/AlchemyLab/Cat-4-Sleeping2.png';
import cat4StretchingSheet from './assets/Sprites/AlchemyLab/Cat-4-Stretching.png';
import cat4WalkSheet from './assets/Sprites/AlchemyLab/Cat-4-Walk.png';
// Cat 5 (Tuxedo)
import cat5IdleSheet from './assets/Sprites/AlchemyLab/Cat-5-Idle.png';
import cat5ItchSheet from './assets/Sprites/AlchemyLab/Cat-5-Itch.png';
import cat5LayingSheet from './assets/Sprites/AlchemyLab/Cat-5-Laying.png';
import cat5Licking1Sheet from './assets/Sprites/AlchemyLab/Cat-5-Licking1.png';
import cat5Licking2Sheet from './assets/Sprites/AlchemyLab/Cat-5-Licking2.png';
import cat5MeowSheet from './assets/Sprites/AlchemyLab/Cat-5-Meow.png';
import cat5RunSheet from './assets/Sprites/AlchemyLab/Cat-5-Run.png';
import cat5SittingSheet from './assets/Sprites/AlchemyLab/Cat-5-Sitting.png';
import cat5Sleeping1Sheet from './assets/Sprites/AlchemyLab/Cat-5-Sleeping1.png';
import cat5Sleeping2Sheet from './assets/Sprites/AlchemyLab/Cat-5-Sleeping2.png';
import cat5StretchingSheet from './assets/Sprites/AlchemyLab/Cat-5-Stretching.png';
import cat5WalkSheet from './assets/Sprites/AlchemyLab/Cat-5-Walk.png';
// Cat 6 (Siamese)
import cat6IdleSheet from './assets/Sprites/AlchemyLab/Cat-6-Idle.png';
import cat6ItchSheet from './assets/Sprites/AlchemyLab/Cat-6-Itch.png';
import cat6LayingSheet from './assets/Sprites/AlchemyLab/Cat-6-Laying.png';
import cat6Licking1Sheet from './assets/Sprites/AlchemyLab/Cat-6-Licking1.png';
import cat6Licking2Sheet from './assets/Sprites/AlchemyLab/Cat-6-Licking2.png';
import cat6MeowSheet from './assets/Sprites/AlchemyLab/Cat-6-Meow.png';
import cat6RunSheet from './assets/Sprites/AlchemyLab/Cat-6-Run.png';
import cat6SittingSheet from './assets/Sprites/AlchemyLab/Cat-6-Sitting.png';
import cat6Sleeping1Sheet from './assets/Sprites/AlchemyLab/Cat-6-Sleeping1.png';
import cat6Sleeping2Sheet from './assets/Sprites/AlchemyLab/Cat-6-Sleeping2.png';
import cat6StretchingSheet from './assets/Sprites/AlchemyLab/Cat-6-Stretching.png';
import cat6WalkSheet from './assets/Sprites/AlchemyLab/Cat-6-Walk.png';

// Loot Ingredients
import ingredientBeak from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/Beak.png';
import ingredientBone from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/Bone.png';
import ingredientBrain from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/Brain.png';
import ingredientCrown from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/Crown.png';
import ingredientCultishSkull from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/Cultish Skull.png';
import ingredientCursedSkull from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/CursedSkull.png';
import ingredientDemonicBook from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/DemonicSpellBook.png';
import ingredientEyeballs from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/Eyes.png';
import ingredientHand from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/Hand.png';
import ingredientHeart from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/Heart.png';
import ingredientJaw from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/Jaw.png';
import ingredientJawV2 from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/JawV2.png';
import ingredientJaggedTooth from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/JaggedTooth.png';
import ingredientMysteriousRing from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/MysteriousRing.png';
import ingredientPoisoniousPoultice from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/PoisoniousPoultice.png';
import ingredientSeveredFoot from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/Severed Foot.png';
import ingredientSeveredHand from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/Severed Hand.png';
import ingredientSkull from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/Skull.png';
import ingredientTeeth from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/Tooth.png';
import ingredientVoodooDoll from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/Voodoodoll.png';
import ingredientWarriorsFist from './assets/images/Alchemy Lab/Loot_icons_in_Inventory/WarriorsFist.png';

// Plant Ingredients
import plantCarrotIcon from './assets/images/Alchemy Lab/Plant_Icons_in_Inventory/Carroticon.png';
import plantChamomileLeavesIcon from './assets/images/Alchemy Lab/Plant_Icons_in_Inventory/ChamomileLeavesicon.png';
import plantDriedRoseIcon from './assets/images/Alchemy Lab/Plant_Icons_in_Inventory/driedroseicon.png';
import plantOnionIcon from './assets/images/Alchemy Lab/Plant_Icons_in_Inventory/Onionicon.png';
import plantOysterMushroomIcon from './assets/images/Alchemy Lab/Plant_Icons_in_Inventory/OysterMushroomicon.png';
import plantPotatoIcon from './assets/images/Alchemy Lab/Plant_Icons_in_Inventory/Potatoicon.png';
import plantRadishIcon from './assets/images/Alchemy Lab/Plant_Icons_in_Inventory/Radishicon.png';
import plantSpinachIcon from './assets/images/Alchemy Lab/Plant_Icons_in_Inventory/spinachicon.png';
import plantSunflowerIcon from './assets/images/Alchemy Lab/Plant_Icons_in_Inventory/Sunflowericon.png';
import plantTurnipIcon from './assets/images/Alchemy Lab/Plant_Icons_in_Inventory/Turnipicon.png';

// Crop Spritesheets
import cropCarrotSheet from './assets/images/Alchemy Lab/Outdoors_assets/carrot.png';
import cropChamomileSheet from './assets/images/Alchemy Lab/Outdoors_assets/chamomile.png';
import cropOnionSheet from './assets/images/Alchemy Lab/Outdoors_assets/onion.png';
import cropPotatoSheet from './assets/images/Alchemy Lab/Outdoors_assets/potato.png';
import cropRadishSheet from './assets/images/Alchemy Lab/Outdoors_assets/radish.png';
import cropRoseSheet from './assets/images/Alchemy Lab/Outdoors_assets/rose.png';
import cropSpinachSheet from './assets/images/Alchemy Lab/Outdoors_assets/spinach.png';
import cropSunflowerSheet from './assets/images/Alchemy Lab/Outdoors_assets/sunflower.png';
import cropTurnipSheet from './assets/images/Alchemy Lab/Outdoors_assets/turnip.png';
import cropOysterSheet from './assets/images/Alchemy Lab/Outdoors_assets/oyster.png';

// Potion Icons
import potionIcon1 from './assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon1.png';
import potionIcon2 from './assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon2.png';
import potionIcon3 from './assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon3.png';
import potionIcon4 from './assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon4.png';
import potionIcon5 from './assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon5.png';
import potionIcon6 from './assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon6.png';
import potionIcon7 from './assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon7.png';
import potionIcon8 from './assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon8.png';
import potionIcon9 from './assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon9.png';
import potionIcon10 from './assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon10.png';
import potionIcon11 from './assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon11.png';
import potionIcon12 from './assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon12.png';
import potionIcon13 from './assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon13.png';
import potionIcon14 from './assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon14.png';
import potionIcon15 from './assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon15.png';
import potionIcon16 from './assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon16.png';
import potionIcon17 from './assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon17.png';
import potionIcon18 from './assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon18.png';
import potionIcon19 from './assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon19.png';
import potionIcon20 from './assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon20.png';


// --- Firestore Logging Wrappers ---
const getDoc = (ref) => {
  console.log('%c[Firestore READ]', 'color: #34d399; font-weight: bold;', { path: ref.path });
  console.trace('Trace for Read');
  return originalGetDoc(ref);
};

const addDoc = (ref, data) => {
  console.log('%c[Firestore WRITE (Add)]', 'color: #60a5fa; font-weight: bold;', { path: ref.path, data });
  console.trace('Trace for Write (Add)');
  return originalAddDoc(ref, data);
};

const setDoc = (ref, data, options) => {
  console.log('%c[Firestore WRITE (Set)]', 'color: #facc15; font-weight: bold;', { path: ref.path, data, options });
  console.trace('Trace for Write (Set)');
  return originalSetDoc(ref, data, options);
};

const updateDoc = (ref, data) => {
  console.log('%c[Firestore WRITE (Update)]', 'color: #f97316; font-weight: bold;', { path: ref.path, data });
  console.trace('Trace for Write (Update)');
  return originalUpdateDoc(ref, data);
};

const deleteDoc = (ref) => {
  console.log('%c[Firestore WRITE (Delete)]', 'color: #ef4444; font-weight: bold;', { path: ref.path });
  console.trace('Trace for Write (Delete)');
  return originalDeleteDoc(ref);
};

const getDocs = (queryRef) => {
    console.log('%c[Firestore READ (Query)]', 'color: #34d399; font-weight: bold;', { query: queryRef });
    console.trace('Trace for Read (Query)');
    return originalGetDocs(queryRef);
};

const onSnapshot = (ref, callback) => {
    console.log('%c[Firestore READ (Listen)]', 'color: #c084fc; font-weight: bold;', { path: ref.path });
    console.trace('Trace for Read (Listen)');
    return originalOnSnapshot(ref, callback);
};

const runTransaction = (firestore, updateFunction) => {
    console.log('%c[Firestore TRANSACTION]', 'color: #ec4899; font-weight: bold;', 'Starting transaction...');
    console.trace('Trace for Transaction');
    return originalRunTransaction(firestore, updateFunction);
};
// Add this line for a quick test
console.log("Is my Project ID loading?", process.env.REACT_APP_PROJECT_ID);
// Global variables
const appId = 'default-app-id';
const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID
};

// Initialize Firebase (only once)
let app;
let db;
let auth;

if (firebaseConfig.projectId && firebaseConfig.projectId !== 'your-project-id-here') {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
  // This log is crucial for debugging.
  console.log(`[Firebase Diagnostics] App initialized for project ID: "${firebaseConfig.projectId}". Please verify this is correct in your Google Cloud Console.`);
} else {
    console.error("[Firebase Diagnostics] Firebase config is missing or using a placeholder Project ID. Please check your .env.local file.");
}


// Utility function for a simple message box (replaces alert)
const showMessageBox = (message, type = 'info', duration = 3000) => {
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

// Cosmetic Item Definitions
const cosmeticItems = {
  avatars: [
    { id: 'avatar_star', name: 'Star Pupil', type: 'avatar', display: '🌟', rarity: 'common', placeholder: 'https://avatarfiles.alphacoders.com/364/thumb-1920-364190.png' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'avatar_brain', name: 'Brainiac', type: 'avatar', display: '🧠', rarity: 'common', placeholder: 'https://media.istockphoto.com/photos/male-brain-picture-id462459425?k=6&m=462459425&s=612x612&w=0&h=3Gz2Umdfe8JjTX6lyfBvU707pzo610et6icnA8_xAuM=' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'avatar_rocket', name: 'Rocket Learner', type: 'avatar', display: '🚀', rarity: 'rare', placeholder: 'https://tse4.mm.bing.net/th/id/OIP.nZ9698V3hFFNkGK0QJ5iOAHaFW?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'avatar_owl', name: 'Wise Owl', type: 'avatar', display: '🦉', rarity: 'common', placeholder: 'https://wallpaperaccess.com/full/156003.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'avatar_robot', name: 'Efficient Bot', type: 'avatar', display: '🤖', rarity: 'rare', placeholder: 'https://wallpaperaccess.com/full/1224636.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'avatar_genius', name: 'Genius Mind', type: 'avatar', display: '💡', rarity: 'rare', placeholder: 'https://is.zobj.net/image-server/v1/images?r=eHDomy1YZ1FrW7ojzlmZmq0NuHjZJVQvvNBgi0dbsJo5k2H9UnazK8si3m1pUUudk2YjTG9EMxDuQKaWKy5QA0OEONAX0WdoENitTVAAl71hADqs5D36GElxGc6W-t8eZFWxQKLwRBUFJykponxzbq5PA5YpjPTupu9eZgTu_yjSv7g9tXyAZgjwUixrW-rrRMjSb7q3qJ-U4AHpKskwaSFVylSRDRuTV21eC62hkJJqDQ5n1SrRX7W7ubw' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'avatar_cat', name: 'Purrfect Student', type: 'avatar', display: '🐱', rarity: 'common', placeholder: 'https://tse2.mm.bing.net/th/id/OIP.9k51CV49PTWmHkkBg-LdFwHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'avatar_dog', name: 'Loyal Companion', type: 'avatar', display: '🐶', rarity: 'common', placeholder: 'https://th.bing.com/th/id/R.4475147aa7d62435c1927ffb8939d122?rik=Jx0WLCZbrcMZLg&pid=ImgRaw&r=0' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'avatar_dragon', name: 'Mythic Scholar', type: 'avatar', display: '🐉', rarity: 'epic', placeholder: 'https://avatarfiles.alphacoders.com/375/375300.png' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'avatar_unicorn', name: 'Magical Thinker', type: 'avatar', display: '🦄', rarity: 'epic', placeholder: 'https://static.vecteezy.com/system/resources/previews/017/047/818/original/cute-unicorn-illustration-unicorn-kawaii-chibi-drawing-style-unicorn-cartoon-vector.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'avatar_fox', name: 'Clever Fox', type: 'avatar', display: '🦊', rarity: 'rare', placeholder: 'https://tse1.explicit.bing.net/th/id/OIP.DO8TDZQv0qYnE_7RgCsYBQHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'avatar_panda', name: 'Zen Master', type: 'avatar', display: '🐼', rarity: 'common', placeholder: 'https://tse4.mm.bing.net/th/id/OIP.735_5CnTHUFnq3EJ5AEYcgHaHZ?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'avatar_lion', name: 'Bold Leader', type: 'avatar', display: '🦁', rarity: 'rare', placeholder: 'https://wallpaperaccess.com/full/1137900.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'avatar_koala', name: 'Chill Learner', type: 'avatar', display: '🐨', rarity: 'common', placeholder: 'https://i.pinimg.com/736x/d0/96/45/d096459c7d33f928c1884b838d76901b.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'avatar_tiger', name: 'Fierce Focus', type: 'avatar', display: '🐯', rarity: 'rare', placeholder: 'https://avatarfiles.alphacoders.com/372/thumb-1920-372778.png' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'avatar_bear', name: 'Strong Foundation', type: 'avatar', display: '🐻', rarity: 'common', placeholder: 'https://i.pinimg.com/474x/cc/ea/6e/ccea6e6f248de50f296154ec95be9e76.jpg?nii=t' /*PLACEHOLD WORK IN PROCESS*/ },
  ],
  banners: [
    { id: 'banner_gradient_blue', name: 'Blue Gradient', type: 'banner', style: 'bg-gradient-to-r from-blue-400 to-purple-500 text-white', rarity: 'rare', themeColors: { primary: '#60a5fa', accent: '#a78bfa', text: '#ffffff' }, placeholder: 'https://th.bing.com/th/id/R.3e6aed2b8eb249ec7b4a25559df7a6e6?rik=qIS4fr0qtZHNrg&riu=http%3a%2f%2fgetwallpapers.com%2fwallpaper%2ffull%2f6%2fe%2fe%2f101557.jpg&ehk=98AjuwsmwgYC1gbZKC8Rd0WY%2bi0AHMINFBKwbXuMXMU%3d&risl=&pid=ImgRaw&r=0' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_confetti', name: 'Confetti Burst', type: 'banner', style: 'bg-yellow-200 text-gray-800', rarity: 'common', placeholder: 'https://tse1.mm.bing.net/th/id/OIP.3eHpbJthJIkcUFgEXWfb0QHaE4?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_geometric', name: 'Geometric Pattern', type: 'banner', style: 'bg-teal-200 text-gray-800', rarity: 'common', placeholder: 'https://wallpaperaccess.com/full/3223142.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_dark_forest', name: 'Dark Forest', type: 'banner', style: 'bg-green-800 text-white', rarity: 'rare', themeColors: { primary: '#16a34a', accent: '#4ade80', text: '#ffffff' }, placeholder: 'https://tse4.mm.bing.net/th/id/OIP.-EJUaTZ_O73RH6LI7rYBcwAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_rainbow', name: 'Rainbow Glow', type: 'banner', style: 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white', rarity: 'rare', placeholder: 'https://th.bing.com/th/id/OIP.hcBH5l3XrU1sXVp0b-jIgAHaEo?w=289&h=180&c=7&r=0&o=7&pid=1.7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_sunset', name: 'Sunset Hues', type: 'banner', style: 'bg-gradient-to-r from-orange-400 to-red-500 text-white', rarity: 'common', themeColors: { primary: '#f97316', accent: '#ef4444', text: '#ffffff' }, placeholder: 'https://th.bing.com/th/id/R.f0d7a60a2efd30f950b6d4f865c42fa3?rik=W2rmzfUrr7zarA&pid=ImgRaw&r=0&sres=1&sresct=1' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_ocean', name: 'Deep Ocean', type: 'banner', style: 'bg-gradient-to-r from-blue-700 to-cyan-500 text-white', rarity: 'rare', placeholder: 'https://th.bing.com/th/id/OIP.2A_RSlYMWxE289IuTWsDTgHaCt?w=330&h=127&c=7&r=0&o=7&pid=1.7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_galaxy', name: 'Stellar Galaxy', type: 'banner', style: 'bg-gradient-to-r from-gray-900 to-indigo-900 text-white', rarity: 'epic', themeColors: { primary: '#4f46e5', accent: '#c084fc', text: '#ffffff' }, placeholder: 'https://tse4.mm.bing.net/th/id/OIP.B9LC-h4DwC7HqGh5Glkf1AHaCx?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_spring', name: 'Spring Blossom', type: 'banner', style: 'bg-pink-200 text-gray-800', rarity: 'common', placeholder: 'https://th.bing.com/th/id/OIP.qK_E2DAamuQBCbPhfwvIagHaCU?w=300&h=109&c=7&r=0&o=7&pid=1.7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_autumn', name: 'Autumn Leaves', type: 'banner', style: 'bg-orange-600 text-white', rarity: 'common', placeholder: 'https://th.bing.com/th/id/OIP.tcuASdYo4L4-v4qsl8jWDwHaDF?w=331&h=145&c=7&r=0&o=5&pid=1.7' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_winter', name: 'Winter Wonderland', type: 'banner', style: 'bg-blue-100 text-blue-800', rarity: 'rare', placeholder: 'https://png.pngtree.com/background/20210715/original/pngtree-winter-landscape-dreamy-banner-background-with-snowflakes-picture-image_1300439.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_lava', name: 'Volcanic Flow', type: 'banner', style: 'bg-gradient-to-r from-red-800 to-yellow-600 text-white', rarity: 'epic', themeColors: { primary: '#dc2626', accent: '#f59e0b', text: '#ffffff' }, placeholder: 'https://img.freepik.com/premium-photo/abstract-background-fire-volcanoes-lava-illustration-banner-design-showcasing-raw-energy-molten-lava-fire-volcanoes-against-captivating-background-generative-ai_198565-7386.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_cyber', name: 'Cyber Grid', type: 'banner', style: 'bg-gray-800 text-green-400', rarity: 'rare', themeColors: { primary: '#2dd4bf', accent: '#6ee7b7', text: '#ffffff' }, placeholder: 'https://static.vecteezy.com/system/resources/previews/013/446/271/large_2x/digital-technology-banner-green-blue-background-cyber-technology-circuit-abstract-binary-tech-innovation-future-data-internet-network-ai-big-data-futuristic-wifi-connection-illustration-vector.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_retro', name: 'Retro Wave', type: 'banner', style: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white', rarity: 'rare', placeholder: 'https://static.vecteezy.com/system/resources/previews/003/818/278/original/vintage-sun-retro-banner-background-colourful-grunge-sunburst-illustration-vector.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_tech', name: 'Circuit Board', type: 'banner', style: 'bg-gray-700 text-cyan-400', rarity: 'epic', placeholder: 'https://as1.ftcdn.net/v2/jpg/01/41/83/86/1000_F_141838647_aKYhGVqL5a0Ynq9IYcKboe9iuzfA0OHQ.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_forest_path', name: 'Forest Path', type: 'banner', style: 'bg-green-600 text-white', rarity: 'common', placeholder: 'https://tse2.mm.bing.net/th/id/OIP.XkqF76yi65wRg7Pln-DqpAHaDt?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
  ],
  backgrounds: [ // Backgrounds are now obtainable from slot machine
    { id: 'bg_clouds', name: 'Cloudy Sky', type: 'background', style: 'bg-blue-100', rarity: 'common', placeholder: 'https://th.bing.com/th/id/R.f690668f8e85ad6fdc21e81d7d0538a9?rik=Ma4pIqjZcWiA5w&riu=http%3a%2f%2fwww.pixelstalk.net%2fwp-content%2fuploads%2f2016%2f05%2fDesktop-Sky-Wallpapers-High-Resolution.jpg&ehk=Lw0FiErzf7ABoZjpB7jwvkd3s8EwXhNNMQW92f9%2bPR8%3d&risl=&pid=ImgRaw&r=0' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'bg_stars', name: 'Starry Night', type: 'background', style: 'bg-gray-900 text-white', rarity: 'rare', placeholder: 'https://tse1.mm.bing.net/th/id/OIP.yGsjLeStOYwvV-1HHi_rlwHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'bg_forest', name: 'Green Forest', type: 'background', style: 'bg-green-100', rarity: 'common', placeholder: 'https://th.bing.com/th/id/R.f40fe88aa1ab108ea55cde6e20ccb1ee?rik=rUnTCCLAYJuK0A&riu=http%3a%2f%2fwallpapercave.com%2fwp%2frlTrbyc.jpg&ehk=Dn1l8qh7JJ5oNmrVX7OJuUJZWBJXF40nNzkaVWrNZpw%3d&risl=&pid=ImgRaw&r=0' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'bg_city', name: 'Cityscape', type: 'background', style: 'bg-gray-300', rarity: 'rare', placeholder: 'https://wallpaperaccess.com/full/1401593.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'bg_desert', name: 'Desert Dunes', type: 'background', style: 'bg-yellow-300', rarity: 'common', placeholder: 'https://th.bing.com/th/id/R.2c1f2e1eccc5aa422a90e00dc03c48f3?rik=w3blTpmcPdtJgA&pid=ImgRaw&r=0' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'bg_snow', name: 'Snowy Peaks', type: 'background', style: 'bg-white text-blue-800', rarity: 'rare', placeholder: 'https://wallpapercave.com/wp/YkLpZ3U.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'bg_beach', name: 'Tropical Beach', type: 'background', style: 'bg-cyan-200', rarity: 'common', placeholder: 'https://th.bing.com/th/id/R.5a627cccd33a20f249e6ff34e0e90abf?rik=wyTXz9qf0tDWuQ&riu=http%3a%2f%2fwallpapercave.com%2fwp%2fQGsncry.jpg&ehk=4LfhxKjnYKmjprvZpGFUZKBjTiRlXQYOmp1ihEOP17A%3d&risl=&pid=ImgRaw&r=0' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'bg_space', name: 'Deep Space', type: 'background', style: 'bg-black text-purple-200', rarity: 'epic', placeholder: 'https://wallpaperaccess.com/full/471779.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'bg_library', name: 'Cozy Library', type: 'background', style: 'bg-amber-100', rarity: 'common', placeholder: 'https://tse4.mm.bing.net/th/id/OIP.ObUZAdXjjcEPM-cKz2LQ7AHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'bg_cafe', name: 'Coffee Shop Vibes', type: 'background', style: 'bg-brown-100', rarity: 'rare', placeholder: 'https://tse4.mm.bing.net/th/id/OIP.MMXkdXq2IueY_waRIzZNIgHaEo?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'bg_underwater', name: 'Underwater Realm', type: 'background', style: 'bg-blue-900 text-cyan-300', rarity: 'epic', placeholder: 'https://th.bing.com/th/id/R.b4e380739b5b7c56cdcfe1e7f5245b2c?rik=sLspB9n8Ox5xkg&pid=ImgRaw&r=0' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'bg_mountain', name: 'Mountain View', type: 'background', style: 'bg-green-700 text-gray-100', rarity: 'rare', placeholder: 'https://tse3.mm.bing.net/th/id/OIP.8MQaDvFKKT0lSxS2H5vHfQHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'bg_volcano', name: 'Volcanic Landscape', type: 'background', style: 'bg-red-900 text-orange-400', rarity: 'epic', placeholder: 'https://wallpapercave.com/wp/wp5814571.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'bg_aurora', name: 'Northern Lights', type: 'background', style: 'bg-indigo-900 text-green-300', rarity: 'legendary', placeholder: 'https://www.hdwallpapers.in/download/aurora_northern_lights_during_nighttime_4k_hd_nature-HD.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'bg_futuristic', name: 'Futuristic City', type: 'background', style: 'bg-gray-800 text-blue-400', rarity: 'epic', placeholder: 'https://wallpaperaccess.com/full/200961.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
  ],
  fonts: [
    { id: 'font_inter', name: 'Inter (Default)', type: 'font', style: 'font-inter', rarity: 'common' },
    { id: 'font_mono', name: 'Space Mono', type: 'font', style: 'font-mono', rarity: 'rare' },
    { id: 'font_serif', name: 'Playfair Display', type: 'font', style: 'font-serif', rarity: 'rare' },
    { id: 'font_cursive', name: 'Dancing Script', type: 'font', style: 'font-cursive', rarity: 'epic' },
    { id: 'font_handwritten', name: 'Permanent Marker', type: 'font', style: 'font-handwritten', rarity: 'rare' },
    { id: 'font_pixel', name: 'Press Start 2P', type: 'font', style: 'font-pixel', rarity: 'epic' },
    { id: 'font_comic', name: 'Comic Neue', type: 'font', style: 'font-comic', rarity: 'common' },
    { id: 'font_fantasy', name: 'Cinzel Decorative', type: 'font', style: 'font-fantasy', rarity: 'epic' },
    { id: 'font_slab', name: 'Roboto Slab', type: 'font', style: 'font-slab', rarity: 'common' },
    { id: 'font_sans_condensed', name: 'Oswald', type: 'font', style: 'font-sans-condensed', rarity: 'common' },
    { id: 'font_baskerville', name: 'Libre Baskerville', type: 'font', style: 'font-baskerville', rarity: 'rare' },
    { id: 'font_lato', name: 'Lato', type: 'font', style: 'font-lato', rarity: 'common' },
    { id: 'font_merriweather', name: 'Merriweather', type: 'font', style: 'font-merriweather', rarity: 'rare' },
    { id: 'font_raleway', name: 'Raleway', type: 'font', style: 'font-raleway', rarity: 'common' },
    { id: 'font_ubuntu', name: 'Ubuntu', type: 'font', style: 'font-ubuntu', rarity: 'rare' },
  ],
  animations: [ // These unlock the animation feature, not equip them individually
    { id: 'animation_sparkle', name: 'Sparkle Burst', type: 'animation', display: '✨', rarity: 'rare', effect: 'sparkle' },
    { id: 'animation_confetti_pop', name: 'Confetti Pop', type: 'animation', display: '🎉', rarity: 'rare', effect: 'confetti' },
    { id: 'animation_fireworks', name: 'Fireworks Display', type: 'animation', display: '🎆', rarity: 'epic', effect: 'fireworks' },
    { id: 'animation_gentle_glow', name: 'Gentle Glow', type: 'animation', display: '🌟', rarity: 'common', effect: 'glow' },
    { id: 'animation_bouncy_bounce', name: 'Bouncy Bounce', type: 'animation', display: '🏀', rarity: 'common', effect: 'bounce' },
    { id: 'animation_flash', name: 'Quick Flash', type: 'animation', display: '⚡', rarity: 'common', effect: 'flash' },
    { id: 'animation_slide_in', name: 'Slide In', type: 'animation', display: '➡️', rarity: 'common', effect: 'slide' },
    { id: 'animation_zoom_out', name: 'Zoom Out', type: 'animation', display: '🔍', rarity: 'rare', effect: 'zoom' },
    { id: 'animation_swirl', name: 'Swirling Effect', type: 'animation', display: '🌀', rarity: 'epic', effect: 'swirl' },
    { id: 'animation_fade_out', name: 'Fade Out', type: 'animation', display: '👻', rarity: 'common', effect: 'fade' },
  ],
  titles: [ // Custom titles obtainable from slot machine
    { id: 'title_lucky_spinner', name: 'Lucky Spinner', type: 'title', rarity: 'rare' },
    { id: 'title_xp_gambler', name: 'XP Gambler', type: 'title', rarity: 'rare' },
    { id: 'title_fortune_seeker', name: 'Fortune Seeker', type: 'title', rarity: 'epic' },
    { id: 'title_risk_taker', name: 'Risk Taker', type: 'title', rarity: 'rare' },
    { id: 'title_golden_hand', name: 'Golden Hand', type: 'title', rarity: 'epic' },
    { id: 'title_master_of_chance', name: 'Master of Chance', type: 'title', rarity: 'legendary' },
    { id: 'title_high_roller', name: 'High Roller', type: 'title', rarity: 'legendary' },
    { id: 'title_jackpot_jockey', name: 'Jackpot Jockey', type: 'title', rarity: 'epic' },
    { id: 'title_spin_king', name: 'Spin King/Queen', type: 'title', rarity: 'rare' },
    { id: 'title_xp_magnet', name: 'XP Magnet', type: 'title', rarity: 'epic' },
  ],
  wallpapers: [ // Purchasable wall textures for the Sanctum
    { id: 'wall_dark_brick', name: 'Dark Brick', type: 'wallpaper', rarity: 'common', cost: 300, style: { backgroundImage: `url('https://www.transparenttextures.com/patterns/dark-brick-wall.png')` } },
    { id: 'wall_white_panel', name: 'White Wood Panels', type: 'wallpaper', rarity: 'common', cost: 300, style: { backgroundImage: `url('https://www.transparenttextures.com/patterns/wood-panel.png')`, backgroundColor: '#E2E8F0' } },
    { id: 'wall_concrete', name: 'Polished Concrete', type: 'wallpaper', rarity: 'rare', cost: 750, style: { backgroundImage: `url('https://www.transparenttextures.com/patterns/concrete-wall-2.png')`, backgroundColor: '#475569' } },
    { id: 'wall_royal_damask', name: 'Royal Damask', type: 'wallpaper', rarity: 'epic', cost: 1500, style: { backgroundImage: `url('https://www.transparenttextures.com/patterns/southern-textiles.png')`, backgroundColor: '#4C1D95' } },
    { id: 'wall_tech_grid', name: 'Cyber Wall', type: 'wallpaper', rarity: 'epic', cost: 2000, style: { backgroundImage: `url('https://www.transparenttextures.com/patterns/cross-scratches.png')`, backgroundColor: '#111827' } },
  ],
  dungeon_emojis: [ // NEW: Emojis for Dungeon Crawler
    { id: 'dc_player_knight', name: 'Knight Player', type: 'dungeon_emoji', cost: 1000, rarity: 'rare', display: '💂', for: 'player' },
    { id: 'dc_player_mage', name: 'Mage Player', type: 'dungeon_emoji', cost: 1000, rarity: 'rare', display: '🧙', for: 'player' },
    { id: 'dc_enemy_goblin_ogre', name: 'Ogre Goblin', type: 'dungeon_emoji', cost: 500, rarity: 'common', display: '👺', for: 'goblin' },
    { id: 'dc_enemy_skeleton_ghost', name: 'Ghost Skeleton', type: 'dungeon_emoji', cost: 500, rarity: 'common', display: '👻', for: 'skeleton' },
  ],
  td_skins: [ // NEW: Skins for Tower Defense
    { id: 'td_archer_elf', name: 'Elven Archer', type: 'td_skin', cost: 2000, rarity: 'rare', display: '🧝', for: 'archer', floorRequired: 5 },
    { id: 'td_cannon_catapult', name: 'Catapult', type: 'td_skin', cost: 2000, rarity: 'rare', display: '☄️', for: 'cannon', floorRequired: 5 },
    { id: 'td_icemage_sorcerer', name: 'Sorcerer', type: 'td_skin', cost: 2500, rarity: 'epic', display: '🧙', for: 'icemage', floorRequired: 8 },
    { id: 'td_sniper_sharpshooter', name: 'Sharpshooter', type: 'td_skin', cost: 3500, rarity: 'legendary', display: '🎯', for: 'sniper', floorRequired: 15 },
    { id: 'td_goblin_imp', name: 'Imp', type: 'td_skin', cost: 1500, rarity: 'common', display: '👿', for: 'goblin', floorRequired: 3 },
    { id: 'td_ogre_cyclops', name: 'Cyclops', type: 'td_skin', cost: 3000, rarity: 'epic', display: '👁️', for: 'ogre', floorRequired: 10 },
    { id: 'td_flyer_gargoyle', name: 'Gargoyle', type: 'td_skin', cost: 2200, rarity: 'rare', display: '🗿', for: 'flyer', floorRequired: 6 },
    { id: 'td_dragon_undead', name: 'Undead Dragon', type: 'td_skin', cost: 4000, rarity: 'legendary', display: '🐉', for: 'dragon', floorRequired: 20 },
  ],
};

const wingmanDefinitions = {
  // XP Recruits
  'recruit_knight': { id: 'recruit_knight', name: 'Knight', role: 'Melee DPS', cost: 3000, currency: 'xp', hp: 80, atk: 15, ap: 2, armor: 3, moveCost: 1, attackCost: 1, moveRange: 1, attackRange: 1.5, combatStyle: 'Martial', abilities: [{ id: 'taunt', name: 'Taunt', cost: 2, range: 2.5, duration: 2, target: 'enemy' }], spriteStyle: { width: 92, height: 76, backgroundPosition: '-124px -85px' } },
  'recruit_cleric': { id: 'recruit_cleric', name: 'Battle Cleric', role: 'Healer', cost: 4000, currency: 'xp', hp: 60, atk: 8, ap: 2, armor: 1, moveCost: 1, attackCost: 1, moveRange: 2, attackRange: 1.5, combatStyle: 'Arcane', abilities: [{ id: 'heal', name: 'Heal', cost: 2, range: 1.5, power: 25, target: 'friendly' }], spriteStyle: { width: 62, height: 80, backgroundPosition: '-241px -169px' } },
  'recruit_mage': { id: 'recruit_mage', name: 'Arcane Apprentice', role: 'Ranged DPS', cost: 4000, currency: 'xp', hp: 50, atk: 20, ap: 2, armor: 0, moveCost: 1, attackCost: 2, moveRange: 2, attackRange: 4, combatStyle: 'Arcane', abilities: [{ id: 'firebolt', name: 'Firebolt', cost: 2, range: 4, power: 30, target: 'enemy' }], spriteStyle: { width: 63, height: 76, backgroundPosition: '-130px -174px' } },
  'recruit_heavy_axeman': { id: 'recruit_heavy_axeman', name: 'Guardian', role: 'Tank', cost: 3000, currency: 'xp', hp: 200, atk: 10, ap: 3, armor: 5, thorns: 0, moveCost: 3, attackCost: 1, moveRange: 1, attackRange: 1.5, combatStyle: 'Martial', abilities: [{ id: 'fortify', name: 'Fortify', cost: 1, selfTarget: true, effect: { tempHp: 40 }, duration: 2, target: 'friendly' }], spriteStyle: { width: 91, height: 81, backgroundPosition: '-34px -174px' } },
  'recruit_undead_vanguard': { id: 'recruit_undead_vanguard', name: 'Undead Vanguard', role: 'Heavy DPS', cost: 4500, currency: 'xp', hp: 70, atk: 28, ap: 2, armor: 2, moveCost: 1, attackCost: 2, moveRange: 1, attackRange: 1.5, combatStyle: 'Martial', abilities: [{ id: 'sunder', name: 'Sunder', cost: 2, range: 1.5, power: 35, armorPiercing: 10, target: 'enemy' }], spriteStyle: { width: 102, height: 87, backgroundPosition: '-231px -255px' } },
  'recruit_crusader': { id: 'recruit_crusader', name: 'Holy Crusader', role: 'Support Tank', cost: 3500, currency: 'xp', hp: 150, atk: 8, ap: 3, armor: 4, moveCost: 2, attackCost: 1, moveRange: 1, attackRange: 1.5, combatStyle: 'Martial', abilities: [{ id: 'divine_shield', name: 'Divine Shield', cost: 2, selfTarget: true, effect: { tempHp: 30 }, duration: 3, target: 'friendly' }], spriteStyle: { width: 98, height: 74, backgroundPosition: '-246px -88px' } },

  // Gold Gacha Recruits
  'recruit_rogue': { id: 'recruit_rogue', name: 'Shadow Rogue', role: 'Assassin', cost: 500, currency: 'gold', hp: 40, atk: 25, ap: 3, armor: 1, moveCost: 1, attackCost: 1, moveRange: 3, attackRange: 1.5, combatStyle: 'Martial', rarity: 'rare', abilities: [{ id: 'shadow_strike', name: 'Shadow Strike', cost: 1, range: 1.5, power: 40, armorPiercing: 5, target: 'enemy' }], spriteStyle: { width: 99, height: 69, backgroundPosition: '-448px -281px' } },
  'recruit_mounted_knight': { id: 'recruit_mounted_knight', name: 'Cavalier', role: 'Mobile DPS', cost: 500, currency: 'gold', hp: 100, atk: 20, ap: 3, armor: 3, moveCost: 1, attackCost: 2, moveRange: 4, attackRange: 1.5, combatStyle: 'Martial', rarity: 'epic', abilities: [{ id: 'piercing_lance', name: 'Piercing Lance', cost: 2, range: 2.5, power: 25, target: 'enemy' }], spriteStyle: { width: 125, height: 145, backgroundPosition: '-348px -17px' } },
  'recruit_duelist': { id: 'recruit_duelist', name: 'Swift Duelist', role: 'Agile DPS', cost: 500, currency: 'gold', hp: 50, atk: 18, ap: 3, armor: 0, moveCost: 0.5, attackCost: 1, moveRange: 2, attackRange: 1.5, combatStyle: 'Finesse', rarity: 'rare', abilities: [{ id: 'riposte', name: 'Riposte', cost: 1, selfTarget: true, effect: { counterAttack: 0.5 }, duration: 1, target: 'friendly' }], spriteStyle: { width: 92, height: 75, backgroundPosition: '-124px -272px' } },
  'recruit_warg_rider': { id: 'recruit_warg_rider', name: 'Warg Rider', role: 'Mobile Skirmisher', cost: 500, currency: 'gold', hp: 90, atk: 18, ap: 3, armor: 2, moveCost: 1, attackCost: 1, moveRange: 3, attackRange: 1.5, combatStyle: 'Martial', rarity: 'epic', abilities: [{ id: 'savage_rush', name: 'Savage Rush', cost: 2, range: 1.5, power: 20, effect: { knockback: 1 }, target: 'enemy' }], spriteStyle: { width: 114, height: 105, backgroundPosition: '-332px -246px' } }

};

// Furniture Item Definitions (with SVG Icons) - UPDATED FOR BETTER VISUALS & STACKING
const furnitureDefinitions = {
  desks: [
    { id: 'desk_simple', name: 'Simple Wooden Desk', type: 'furniture', cost: 250, rarity: 'common', display: '<svg viewBox="0 0 80 60" class="text-amber-700"><path d="M0,20 H80 L75,60 H5 L0,20 Z" fill="currentColor"/><rect x="10" y="20" width="8" height="38" fill="#6b4a2f"/><rect x="62" y="20" width="8" height="38" fill="#6b4a2f"/></svg>', width: 4, height: 3, isObstacle: true },
    { id: 'desk_modern', name: 'Modern Glass Desk', type: 'furniture', cost: 500, rarity: 'rare', display: '<svg viewBox="0 0 80 60"><path d="M0,20 H80 V28 H0 Z" fill="#a5f3fc" fill-opacity="0.7"/><rect x="10" y="28" width="5" height="30" fill="#e0e0e0"/><rect x="65" y="28" width="5" height="30" fill="#e0e0e0"/></svg>', width: 4, height: 3, isObstacle: true },
    { id: 'desk_executive', name: 'Executive Desk', type: 'furniture', cost: 800, rarity: 'epic', display: '<svg viewBox="0 0 100 60"><path d="M0,15 H100 L95,60 H5 L0,15 Z" fill="#583927"/><rect x="10" y="15" width="25" height="42" fill="#4a2f1f"/><rect x="65" y="15" width="25" height="42" fill="#4a2f1f"/><line x1="0" y1="25" x2="100" y2="25" stroke="#4a2f1f" stroke-width="2"/></svg>', width: 5, height: 3, isObstacle: true },
  ],
  seating: [
    { id: 'chair_office', name: 'Office Chair', type: 'furniture', cost: 150, rarity: 'common', display: '<svg viewBox="0 0 40 50"><path d="M5,10 H35 V30 H5 Z" fill="#4a5568"/><rect x="0" y="0" width="40" height="15" rx="5" fill="#2d3748"/><path d="M18,30 v15 h4 v-15"/><path d="M10,45 h20 v5 h-20 z"/></svg>', width: 2, height: 2, isObstacle: true },
    { id: 'chair_gaming', name: 'Gaming Chair', type: 'furniture', cost: 400, rarity: 'rare', display: '<svg viewBox="0 0 40 60"><path d="M5,15 H35 L30,40 H10 Z" fill="#c53030"/><path d="M5,0 H35 V20 L28,15 H12 V20 Z" fill="#e53e3e"/><path d="M18,40 v15 h4 v-15"/><path d="M10,55 h20 v5 h-20 z"/></svg>', width: 2, height: 3, isObstacle: true },
    { id: 'sofa_leather', name: 'Leather Sofa', type: 'furniture', cost: 700, rarity: 'rare', display: '<svg viewBox="0 0 120 60"><rect x="0" y="15" width="120" height="45" rx="10" fill="#7b341e"/><rect x="10" y="0" width="20" height="20" rx="5" fill="#9c4221"/><rect x="90" y="0" width="20" height="20" rx="5" fill="#9c4221"/></svg>', width: 6, height: 3, isObstacle: true },
    { id: 'bean_bag', name: 'Bean Bag', type: 'furniture', cost: 120, rarity: 'common', display: '<svg viewBox="0 0 60 60"><ellipse cx="30" cy="40" rx="30" ry="20" fill="#718096"/><ellipse cx="30" cy="20" rx="15" ry="10" fill="#a0aec0"/></svg>', width: 3, height: 3, isObstacle: true },
  ],
  storage: [
    { id: 'bookshelf_small', name: 'Small Bookshelf', type: 'furniture', cost: 200, rarity: 'common', display: '<svg viewBox="0 0 60 90"><rect width="60" height="90" fill="#8c5a3b"/><rect x="5" y="10" width="50" height="20" fill="#654321"/><rect x="5" y="35" width="50" height="20" fill="#654321"/><rect x="5" y="60" width="50" height="20" fill="#654321"/></svg>', width: 2, height: 4, isObstacle: true },
    { id: 'bookshelf_large', name: 'Large Bookshelf', type: 'furniture', cost: 450, rarity: 'rare', display: '<svg viewBox="0 0 90 120"><rect width="90" height="120" fill="#6b4a2f"/><rect x="8" y="10" width="74" height="25" fill="#583927"/><rect x="8" y="45" width="74" height="25" fill="#583927"/><rect x="8" y="80" width="74" height="25" fill="#583927"/></svg>', width: 3, height: 5, isObstacle: true },
    { id: 'filing_cabinet', name: 'Filing Cabinet', type: 'furniture', cost: 180, rarity: 'common', display: '<svg viewBox="0 0 40 60"><rect width="40" height="60" fill="#a0aec0"/><rect y="5" width="40" height="25" stroke="#4a5568" stroke-width="2"/><rect y="30" width="40" height="25" stroke="#4a5568" stroke-width="2"/><rect x="15" y="15" width="10" height="3" fill="#4a5568"/><rect x="15" y="40" width="10" height="3" fill="#4a5568"/></svg>', width: 2, height: 3, isObstacle: true },
    { id: 'display_case', name: 'Display Case', type: 'furniture', cost: 600, rarity: 'epic', display: '<svg viewBox="0 0 60 90"><rect width="60" height="90" fill="#a0a0a0"/><rect x="5" y="5" width="50" height="80" fill="#d4f1f9" fill-opacity="0.5"/><line x1="5" y1="45" x2="55" y2="45" stroke="#a0a0a0" stroke-width="2"/></svg>', width: 2, height: 4, isObstacle: true },
  ],
  decor: [
    { id: 'rug_shaggy', name: 'Shaggy Rug', type: 'furniture', cost: 100, rarity: 'common', display: '<svg viewBox="0 0 120 90"><rect width="120" height="90" rx="10" fill="#7f9cf5"/></svg>', width: 6, height: 4, isObstacle: false },
    { id: 'plant_potted', name: 'Potted Plant', type: 'furniture', cost: 75, rarity: 'common', display: '<svg viewBox="0 0 40 60"><path d="M5,40 H35 V60 H5 Z" fill="#d59c6a"/><path d="M20,10 C0,30 40,30 20,10 Z" fill="#48bb78"/></svg>', width: 2, height: 3, isObstacle: true },
    { id: 'lamp_floor', name: 'Floor Lamp', type: 'furniture', cost: 120, rarity: 'common', display: '<svg viewBox="0 0 30 90"><rect x="12" y="15" width="6" height="75" fill="#718096"/><path d="M0,0 H30 L20,15 H10 Z" fill="#faf089"/></svg>', width: 1, height: 4, isObstacle: true },
    { id: 'trophy_case', name: 'Trophy Case', type: 'furniture', cost: 1000, rarity: 'epic', display: '<svg viewBox="0 0 90 90"><rect width="90" height="90" fill="#e5b84c"/><rect x="5" y="5" width="80" height="80" fill="#fffaf0" fill-opacity="0.6"/><line x1="5" y1="35" x2="85" y2="35" stroke="#e5b84c" stroke-width="2"/><line x1="5" y1="65" x2="85" y2="65" stroke="#e5b84c" stroke-width="2"/></svg>', width: 3, height: 4, isObstacle: true },
    { id: 'wall_art_abstract', name: 'Abstract Wall Art', type: 'furniture', cost: 220, rarity: 'rare', display: '<svg viewBox="0 0 60 60"><rect width="60" height="60" fill="#1a202c"/><circle cx="30" cy="30" r="25" fill="#e53e3e"/><rect x="10" y="25" width="40" height="10" fill="#f6e05e"/></svg>', width: 3, height: 3, isObstacle: true }, // Note: Wall art logic not implemented, treated as floor item for now
    { id: 'lava_lamp', name: 'Lava Lamp', type: 'furniture', cost: 90, rarity: 'common', display: '<svg viewBox="0 0 30 60"><path d="M5,60 H25 V50 H5 Z" fill="#4a5568"/><path d="M0,0 H30 L25,50 H5 Z" fill="#f56565" fill-opacity="0.8"/><circle cx="15" cy="20" r="5" fill="#fbd38d"/><circle cx="15" cy="40" r="8" fill="#fbd38d"/></svg>', width: 1, height: 3, isObstacle: true },
  ],
  electronics: [
    { id: 'computer_setup', name: 'Desktop Computer', type: 'furniture', cost: 1200, rarity: 'epic', display: '<svg viewBox="0 0 60 60"><rect x="0" y="5" width="60" height="35" rx="5" fill="#2d3748"/><rect x="5" y="10" width="50" height="25" fill="#000"/><rect x="20" y="40" width="20" height="10" fill="#4a5568"/></svg>', width: 2, height: 2, isObstacle: true },
    { id: 'laptop', name: 'Laptop', type: 'furniture', cost: 800, rarity: 'rare', display: '<svg viewBox="0 0 40 30"><path d="M0,25 H40 V28 H0 Z" fill="#a0aec0"/><path d="M2,2 L38,2 L35,25 L5,25 Z" fill="#e2e8f0"/></svg>', width: 2, height: 1, isObstacle: true },
    { id: 'gaming_console', name: 'Gaming Console', type: 'furniture', cost: 500, rarity: 'rare', display: '<svg viewBox="0 0 40 20"><rect width="40" height="20" rx="5" fill="#2d3748"/><circle cx="30" cy="10" r="3" fill="#c53030"/></svg>', width: 2, height: 1, isObstacle: true },
    { id: 'vr_headset', name: 'VR Headset', type: 'furniture', cost: 650, rarity: 'epic', display: '<svg viewBox="0 0 40 30"><path d="M0,5 H40 V25 H0 Z" rx="10" fill="#1a202c"/><path d="M5,0 h30 v5 h-30 z" fill="#4a5568"/></svg>', width: 2, height: 1, isObstacle: true },
  ],
};

// Combine all rollable items (avatars, banners, fonts, animations, titles, backgrounds) for the slot machine animation
const allRollableItems = [
    ...cosmeticItems.avatars,
    ...cosmeticItems.banners,
    ...cosmeticItems.fonts,
    ...cosmeticItems.animations,
    ...cosmeticItems.titles,
    ...cosmeticItems.backgrounds,
];

// Define "filler" items for the slot machine animation reel to make it more dynamic.
const slotMachineFillerItems = [
  ...allRollableItems,
  { id: 'filler_xp_gain_1', name: 'XP Gain', type: 'xp_gain', display: 'XP+', rarity: 'rare' },
  { id: 'filler_xp_gain_2', name: 'XP Gain', type: 'xp_gain', display: 'XP+', rarity: 'rare' },
  { id: 'filler_xp_loss_1', name: 'XP Loss', type: 'xp_loss', display: 'XP-', rarity: 'common' },
  { id: 'filler_shard_gain_1', name: 'Shard Gain', type: 'shard_gain', display: '💎', rarity: 'common' },
  { id: 'filler_shard_gain_2', name: 'Shard Gain', type: 'shard_gain', display: '💎', rarity: 'common' },
];

// Note: rareCosmeticItems was unused and has been removed.
const EGG_REQUIREMENT = 50;
const PET_RARITIES = {
  common: 0.5,
  rare: 0.25,
  epic: 0.2,
  legendary: 0.045,
  mythic: 0.005
};
// Pet Definitions (with evolution stages)
const petDefinitions = {
  common: [
    { id: 'pet_squirrel_1', name: 'Energetic Squirrel', display: '🐿️', xpBuff: 0.5, rarity: 'common',
      evolutions: [
        { id: 'pet_squirrel_2', name: 'Nimble Squirrel', display: '🐿️💨', xpBuff: 0.6, levelRequired: 5, xpCost: 100 },
        { id: 'pet_squirrel_3', name: 'Master Squirrel', display: '🐿️⚡', xpBuff: 0.75, levelRequired: 15, xpCost: 300 }
      ]
    },
    { id: 'pet_bunny_1', name: 'Quick Bunny', display: '🐇', xpBuff: 0.5, rarity: 'common',
      evolutions: [
        { id: 'pet_bunny_2', name: 'Fleet-footed Bunny', display: '🐇💨', xpBuff: 0.6, levelRequired: 5, xpCost: 100 },
        { id: 'pet_bunny_3', name: 'Grand Hare', display: '🐇🌟', xpBuff: 0.75, levelRequired: 15, xpCost: 300 }
      ]
    },
    { id: 'pet_hamster_1', name: 'Busy Hamster', display: '🐹', xpBuff: 0.5, rarity: 'common',
      evolutions: [
        { id: 'pet_hamster_2', name: 'Diligent Hamster', display: '🐹⚙️', xpBuff: 0.6, levelRequired: 5, xpCost: 100 },
        { id: 'pet_hamster_3', name: 'Hyper Hamster', display: '🐹⚡', xpBuff: 0.75, levelRequired: 15, xpCost: 300 }
      ]
    },
    { id: 'pet_chick_1', name: 'Curious Chick', display: '🐥', xpBuff: 0.5, rarity: 'common',
      evolutions: [
        { id: 'pet_chick_2', name: 'Growing Fowl', display: '🐤', xpBuff: 0.6, levelRequired: 5, xpCost: 100 },
        { id: 'pet_chick_3', name: 'Wise Rooster', display: '🐓', xpBuff: 0.75, levelRequired: 15, xpCost: 300 }
      ]
    },
  ],
  rare: [
    { id: 'pet_fox_1', name: 'Clever Fox', display: '🦊', xpBuff: 0.6, rarity: 'rare',
      evolutions: [
        { id: 'pet_fox_2', name: 'Cunning Fox', display: '🦊✨', xpBuff: 1.5, levelRequired: 10, xpCost: 100 },
        { id: 'pet_fox_3', name: 'Mystic Fox', display: '🦊🔮', xpBuff: 2, levelRequired: 25, xpCost: 250 }
      ]
    },
    { id: 'pet_dragonfly_1', name: 'Swift Dragonfly', display: '🐉', xpBuff: 0.6, rarity: 'rare',
      evolutions: [
        { id: 'pet_dragonfly_2', name: 'Soaring Dragonfly', display: '🐉⬆️', xpBuff: 1.5, levelRequired: 10, xpCost: 100 },
        { id: 'pet_dragonfly_3', name: 'Ancient Dragon', display: '🐲', xpBuff: 2, levelRequired: 25, xpCost: 250 }
      ]
    },
    { id: 'pet_hedgehog_1', name: 'Spiky Protector', display: '🦔', xpBuff: 0.6, rarity: 'rare',
      evolutions: [
        { id: 'pet_hedgehog_2', name: 'Resilient Hedgehog', display: '🦔🛡️', xpBuff: 1.5, levelRequired: 10, xpCost: 100 },
        { id: 'pet_hedgehog_3', name: 'Iron Quill', display: '🦔⚔️', xpBuff: 2, levelRequired: 25, xpCost: 250 }
      ]
    },
    { id: 'pet_dolphin_1', name: 'Intelligent Dolphin', display: '🐬', xpBuff: 0.6, rarity: 'rare',
      evolutions: [
        { id: 'pet_dolphin_2', name: 'Wise Dolphin', display: '🐬💡', xpBuff: 1.5, levelRequired: 10, xpCost: 100 },
        { id: 'pet_dolphin_3', name: 'Oceanic Sage', display: '🐬🌊', xpBuff: 2, levelRequired: 25, xpCost: 250 }
      ]
    },
  ],
  epic: [
    { id: 'pet_owl_1', name: 'Wise Owl', display: '🦉', xpBuff: 2, rarity: 'epic',
      evolutions: [
        { id: 'pet_owl_2', name: 'Sage Owl', display: '🦉📜', xpBuff: 2.5, levelRequired: 20, xpCost: 200 },
        { id: 'pet_owl_3', name: 'Oracle Owl', display: '🦉✨', xpBuff: 3.0, levelRequired: 40, xpCost: 400 }
      ]
    },
    { id: 'pet_wolf_1', name: 'Focused Wolf', display: '🐺', xpBuff: 2, rarity: 'epic',
      evolutions: [
        { id: 'pet_wolf_2', name: 'Alpha Wolf', display: '🐺👑', xpBuff: 2.5, levelRequired: 20, xpCost: 200 },
        { id: 'pet_wolf_3', name: 'Spirit Wolf', display: '🐺👻', xpBuff: 3, levelRequired: 40, xpCost: 400 }
      ]
    },
    { id: 'pet_griffin_1', name: 'Noble Griffin', display: '🦅🦁', xpBuff: 2, rarity: 'epic',
      evolutions: [
        { id: 'pet_griffin_2', name: 'Majestic Griffin', display: '🦅👑🦁', xpBuff: 2.5, levelRequired: 20, xpCost: 200 },
        { id: 'pet_griffin_3', name: 'Mythic Griffin', display: '🦅✨🦁', xpBuff: 3, levelRequired: 40, xpCost: 400 }
      ]
    },
  ],
  legendary: [
    { id: 'pet_phoenix_1', name: 'Blazing Phoenix', display: '🔥', xpBuff: 3, rarity: 'legendary',
      evolutions: [
        { id: 'pet_phoenix_2', name: 'Sunfire Phoenix', display: '🔥☀️', xpBuff:5, levelRequired: 30, xpCost: 300 },
        { id: 'pet_phoenix_3', name: 'Cosmic Phoenix', display: '🔥🌌', xpBuff: 6, levelRequired: 50, xpCost: 500 }
      ]
    },
    { id: 'pet_dragon_1', name: 'Ancient Dragon', display: '🐉', xpBuff: 3, rarity: 'legendary',
      evolutions: [
        { id: 'pet_dragon_2', name: 'Elemental Dragon', display: '🐉✨', xpBuff: 5, levelRequired: 30, xpCost: 300 },
        { id: 'pet_dragon_3', name: 'Elder Dragon', display: '🐲👑', xpBuff: 6, levelRequired: 50, xpCost: 500 }
      ]
    },
  ],
  mythic: [
    { id: 'pet_unicorn_1', name: 'Mythical Unicorn', display: '🦄', xpBuff: 4, rarity: 'mythic',
      evolutions: [
        { id: 'pet_unicorn_2', name: 'Celestial Unicorn', display: '🦄🌈', xpBuff: 6, levelRequired: 40, xpCost: 400 },
        { id: 'pet_unicorn_3', name: 'Divine Alicorn', display: '🦄✨', xpBuff: 10, levelRequired: 60, xpCost: 700 }
      ]
    },
  ],
};

// Level-based titles (can be overridden by equipped cosmetic titles)
const levelTitles = [
  { level: 1, title: 'Novice Learner' },
  { level: 5, title: 'Aspiring Student' },
  { level: 10, title: 'Adept Learner' },
  { level: 20, title: 'Dedicated Scholar' },
  { level: 35, title: 'Knowledge Seeker' },
  { level: 50, title: 'Master Scholar' },
  { level: 75, title: 'Academic Ace' },
  { level: 100, title: 'Grand Sage' },
  { level: 150, title: 'Legendary Luminary' },
  { level: 200, title: 'Productivity Paragon' },
  { level: 250, title: 'Ultimate Achiever' },
  { level: 300, title: 'Transcendent Thinker' },
];

// Stress Emojis
const stressEmojis = ['🌸', '😊', '😐', '😟', '💀'];

// Available Tags
const assignmentTags = ['Math', 'English', 'History', 'Science', 'Clubs', 'Extracurriculars', 'Personal Goals'];

// Science Lab Idle Clicker Game Definitions
const labEquipmentDefinitions = {
  beaker: { name: 'Beaker', baseCost: 15, baseSPS: 0.1, clickPower: 0, xpUpgrade: { cost: 100, multiplier: 2 } },
  microscope: { name: 'Microscope', baseCost: 100, baseSPS: 1, clickPower: 0, xpUpgrade: { cost: 500, multiplier: 2 } },
  bunsen_burner: { name: 'Bunsen Burner', baseCost: 1100, baseSPS: 8, clickPower: 0, xpUpgrade: { cost: 2000, multiplier: 2 } },
  computer: { name: 'Super Computer', baseCost: 12000, baseSPS: 47, clickPower: 0, xpUpgrade: { cost: 10000, multiplier: 2 } },
  particle_accelerator: { name: 'Particle Accelerator', baseCost: 130000, baseSPS: 260, clickPower: 0, xpUpgrade: { cost: 50000, multiplier: 2 } },
  quantum_computer: { name: 'Quantum Computer', baseCost: 1400000, baseSPS: 1400, clickPower: 0, xpUpgrade: { cost: 100000, multiplier: 2 } },
  manual_clicker: { name: 'Manual Clicker', baseCost: 50, baseSPS: 0, clickPower: 1, xpUpgrade: { cost: 1000, multiplier: 2 } }
};

// NEW: Achievement Definitions
const achievementDefinitions = {
  assignmentsCompleted: {
    name: "Task Master", icon: "✅",
    tiers: [
      { id: 'ac1', name: "Task Apprentice", goal: 10, reward: { xp: 50 } },
      { id: 'ac2', name: "Task Journeyman", goal: 50, reward: { xp: 150, shards: 5 } },
      { id: 'ac3', name: "Task Expert", goal: 100, reward: { xp: 300, shards: 15 } },
      { id: 'ac4', name: "Task Master", goal: 250, reward: { xp: 500, shards: 30 } },
      { id: 'ac5', name: "Task Grandmaster", goal: 500, reward: { xp: 1000, shards: 50 } },
      { id: 'ac6', name: "Productivity Paragon", goal: 1000, reward: { xp: 2500, shards: 100 } },
    ]
  },
  hardAssignmentsCompleted: {
    name: "Difficulty Conqueror", icon: "🏔️",
    tiers: [
      { id: 'hc1', name: "Hill Climber", goal: 5, reward: { xp: 100 } },
      { id: 'hc2', name: "Mountain Goat", goal: 20, reward: { xp: 250, shards: 10 } },
      { id: 'hc3', name: "Peak Bagger", goal: 50, reward: { xp: 500, shards: 25 } },
      { id: 'hc4', name: "Everest Scaler", goal: 100, reward: { xp: 1200, shards: 60 } },
      { id: 'hc5', name: "Olympian", goal: 200, reward: { xp: 3000, shards: 150 } },
    ]
  },
  towerDefenseWins: {
    name: "Master Strategist", icon: "🏰",
    tiers: [
      { id: 'tdw1', name: "Castle Defender", goal: 1, reward: { xp: 100 } },
      { id: 'tdw2', name: "Strategic Mind", goal: 5, reward: { xp: 250, shards: 10 } },
      { id: 'tdw3', name: "Grand Tactician", goal: 10, reward: { xp: 500, shards: 25 } },
      { id: 'tdw4', name: "War Master", goal: 25, reward: { xp: 1000, shards: 50 } },
      { id: 'tdw5', name: "Legendary Commander", goal: 50, reward: { xp: 2000, shards: 100 } },
    ]
  },
  dungeonFloors: {
    name: "Dungeon Delver", icon: "🗺️",
    tiers: [
      { id: 'df1', name: "Spelunker", goal: 10, reward: { xp: 100 } },
      { id: 'df2', name: "Explorer", goal: 25, reward: { xp: 250, shards: 10 } },
      { id: 'df3', name: "Abyss Walker", goal: 50, reward: { xp: 500, shards: 25 } },
      { id: 'df4', name: "Treasure Hunter", goal: 100, reward: { xp: 1200, shards: 60 } },
      { id: 'df5', name: "Core Reacher", goal: 200, reward: { xp: 3000, shards: 150 } },
    ]
  },
  petsEvolved: {
    name: "Pet Trainer", icon: "🐾",
    tiers: [
        { id: 'pe1', name: "Evolver", goal: 1, reward: { xp: 50 } },
        { id: 'pe2', name: "Beast Master", goal: 5, reward: { xp: 200, shards: 15 } },
        { id: 'pe3', name: "Creature Collector", goal: 10, reward: { xp: 500, shards: 40 } },
        { id: 'pe4', name: "Evolution Expert", goal: 20, reward: { xp: 1000, shards: 80 } },
    ]
  },
  sciencePoints: {
    name: "Mad Scientist", icon: "🧪",
    tiers: [
      { id: 'sp1', name: "Researcher", goal: 1000000, reward: { xp: 100 } }, // 1 Million
      { id: 'sp2', name: "Lead Scientist", goal: 1000000000, reward: { xp: 500, shards: 20 } }, // 1 Billion
      { id: 'sp3', name: "Innovator", goal: 25000000000, reward: { xp: 750, shards: 35 } }, // 25 Billion
      { id: 'sp4', name: "Nobel Laureate", goal: 1000000000000, reward: { xp: 1000, shards: 50 } }, // 1 Trillion
      { id: 'sp5', name: "World Changer", goal: 50000000000000, reward: { xp: 5000, shards: 250 } }, // 50 Trillion
    ]
  },
  cosmeticsCrafted: {
    name: "Artisan", icon: "💎",
    tiers: [
      { id: 'cc1', name: "Tinkerer", goal: 1, reward: { xp: 50 } },
      { id: 'cc2', name: "Crafter", goal: 5, reward: { xp: 150, shards: 10 } },
      { id: 'cc3', name: "Master Artisan", goal: 10, reward: { xp: 300, shards: 25 } },
      { id: 'cc4', name: "Shard-Smith", goal: 25, reward: { xp: 750, shards: 60 } },
    ]
  },
  xpSpentInShop: {
    name: "Shopaholic", icon: "🛍️",
    tiers: [
      { id: 'xs1', name: "Window Shopper", goal: 1000, reward: { xp: 50 } },
      { id: 'xs2', name: "Valued Customer", goal: 5000, reward: { xp: 200, shards: 10 } },
      { id: 'xs3', name: "High Roller", goal: 10000, reward: { xp: 400, shards: 20 } },
      { id: 'xs4', name: "Big Spender", goal: 25000, reward: { xp: 1000, shards: 50 } },
      { id: 'xs5', name: "Patron of the Arts", goal: 50000, reward: { xp: 2500, shards: 125 } },
    ]
  },
  highScore: {
    name: "Arcade Champion", icon: "🕹️",
    tiers: [
      { id: 'hs1', name: "Gamer", goal: 1000, reward: { xp: 50 } },
      { id: 'hs2', name: "Pro Gamer", goal: 2500, reward: { xp: 150, shards: 10 } },
      { id: 'hs3', name: "Record Setter", goal: 5000, reward: { xp: 400, shards: 25 } },
      { id: 'hs4', name: "World Champion", goal: 10000, reward: { xp: 1000, shards: 50 } },
    ]
  },
  furniturePlaced: {
    name: "Interior Designer", icon: "🛋️",
    tiers: [
      { id: 'fp1', name: "Decorator", goal: 1, reward: { xp: 25 } },
      { id: 'fp2', name: "Home Maker", goal: 5, reward: { xp: 100, shards: 5 } },
      { id: 'fp3', name: "Sanctum Architect", goal: 10, reward: { xp: 200, shards: 15 } },
      { id: 'fp4', name: "Master Designer", goal: 25, reward: { xp: 500, shards: 40 } },
    ]
  }
};

// NEW: Quest Definitions
const questDefinitions = {
  daily: [
    { id: 'daily_complete_3_tasks', name: "Daily Dedication", description: "Complete 3 assignments.", goal: 3, reward: { xp: 50, shards: 2 }, type: 'completion' },
    { id: 'daily_complete_1_hard', name: "Challenge Accepted", description: "Complete a 'Hard' assignment.", goal: 1, reward: { xp: 75, shards: 3 }, type: 'difficulty' },
    { id: 'daily_focus_60_min', name: "Focused Hour", description: "Focus for a total of 60 minutes.", goal: 60, reward: { xp: 60, shards: 5 }, type: 'focusTime' },
    { id: 'daily_clear_dungeon', name: "Dungeon Dabbler", description: "Clear 1 floor in the Dungeon Crawler.", goal: 1, reward: { xp: 50 }, type: 'dungeon' },
    { id: 'daily_td_win', name: "Castle Defender", description: "Win 1 game of Tower Defense.", goal: 1, reward: { xp: 100 }, type: 'td_win' },
    { id: 'daily_earn_sp', name: "Lab Assistant", description: "Earn 100,000 Science Points.", goal: 100000, reward: { xp: 40, shards: 2 }, type: 'sciencePoints' },
  ],
  weekly: [
    { id: 'weekly_complete_15_tasks', name: "Weekly Warrior", description: "Complete 15 assignments in a week.", goal: 15, reward: { xp: 250, shards: 15 }, type: 'completion' },
    { id: 'weekly_earn_500_xp', name: "XP Farmer", description: "Earn 500 base XP from assignments.", goal: 500, reward: { xp: 100, shards: 10 }, type: 'xp' },
    { id: 'weekly_focus_300_min', name: "Deep Work", description: "Focus for a total of 300 minutes in a week.", goal: 300, reward: { xp: 300, shards: 20 }, type: 'focusTime' },
    { id: 'weekly_clear_5_dungeon', name: "Dungeon Delver", description: "Clear 5 total floors in the Dungeon Crawler.", goal: 5, reward: { xp: 200, shards: 10 }, type: 'dungeon' },
    { id: 'weekly_td_wave_25', name: "Strategist", description: "Reach wave 25 in a Tower Defense game.", goal: 25, reward: { xp: 250, shards: 15 }, type: 'td_wave' },
    { id: 'weekly_complete_5_hard', name: "Grit", description: "Complete 5 'Hard' assignments in a week.", goal: 5, reward: { xp: 400, shards: 25 }, type: 'difficulty' },
  ]
};
const contractDefinitions = [
  { id: 'contract_deadline_warrior', name: 'Deadline Warrior', description: 'Complete a "Hard" assignment that is due within the next 24 hours.', deposit: 150, reward: { xp: 500, shards: 20 }, timeLimitHours: 24, type: 'completeHardDueSoon' },
  { id: 'contract_task_blitz', name: 'Task Blitz', description: 'Complete any 3 assignments within the next 48 hours.', deposit: 100, reward: { xp: 400, shards: 15 }, timeLimitHours: 48, type: 'completeNumber' },
];
const cosmicEvents = [
  { id: 'asteroid_field', name: 'Asteroid Field', description: 'You successfully navigated a dense asteroid field!', weight: 10, reward: { type: 'shards', amount: 15 } },
  { id: 'solar_wind', name: 'Solar Wind', description: 'You caught a solar wind! Your next assignment completion will award bonus XP.', weight: 8, reward: { type: 'xp_boost', multiplier: 1.5, duration: 1 } },
  { id: 'comet_sighting', name: 'Comet Sighting', description: 'A rare comet passes by, granting you a burst of insight!', weight: 6, reward: { type: 'xp', amount: 200 } },
  { id: 'ancient_signal', name: 'Ancient Signal', description: 'A strange signal leads you to a forgotten relic!', weight: 1, reward: { type: 'cosmetic', cosmeticId: 'avatar_dragon' } },
];

const wingmanUpgrades = {
  // --- XP Recruits ---
  'recruit_knight': {
    stats: [
      { id: 'knight_hp_1', name: 'Vigor I', description: '+15 Max HP', cost: 800, currency: 'xp', effect: { hp: 15 } },
      { id: 'knight_atk_1', name: 'Strength I', description: '+3 Attack', cost: 1200, currency: 'xp', effect: { atk: 3 } },
      { id: 'knight_hp_2', name: 'Vigor II', description: '+20 Max HP', cost: 1600, currency: 'xp', effect: { hp: 20 } },
      { id: 'knight_atk_2', name: 'Strength II', description: '+5 Attack', cost: 2500, currency: 'xp', effect: { atk: 5 } },
      { id: 'knight_armor_1', name: 'Plated Armor I', description: '+2 Armor', cost: 1500, currency: 'xp', effect: { armor: 2 } },
      { id: 'knight_armor_2', name: 'Plated Armor II', description: '+3 Armor', cost: 3000, currency: 'xp', effect: { armor: 3 } },
    ],
    ability: [
      { id: 'knight_ability_a', name: 'Intimidating Shout', description: 'Taunt now also reduces the target\'s Attack by 20% for its duration.', cost: 3000, currency: 'xp', type: 'choice' },
      { id: 'knight_ability_b', name: 'Vengeful Guardian', description: 'While Taunt is active, the Knight will counter-attack for 50% damage when hit.', cost: 3000, currency: 'xp', type: 'choice' }
    ]
  },
  'recruit_cleric': {
    stats: [
      { id: 'cleric_hp_1', name: 'Endurance I', description: '+10 Max HP', cost: 750, currency: 'xp', effect: { hp: 10 } },
      { id: 'cleric_atk_1', name: 'Divine Power I', description: '+2 Attack', cost: 1100, currency: 'xp', effect: { atk: 2 } },
      { id: 'cleric_hp_2', name: 'Endurance II', description: '+15 Max HP', cost: 1500, currency: 'xp', effect: { hp: 15 } },
      { id: 'cleric_atk_2', name: 'Divine Power II', description: '+3 Attack', cost: 2200, currency: 'xp', effect: { atk: 3 } },
      { id: 'cleric_heal_1', name: 'Soothing Light I', description: 'Heal power +5', cost: 1800, currency: 'xp', effect: { healPower: 5 } },
      { id: 'cleric_heal_2', name: 'Soothing Light II', description: 'Heal power +10', cost: 3200, currency: 'xp', effect: { healPower: 10 } },
    ],
    ability: [
      { id: 'cleric_ability_a', name: 'Purifying Light', description: 'Heal now also cleanses one negative status effect (e.g., poison) from the target.', cost: 4000, currency: 'xp', type: 'choice' },
      { id: 'cleric_ability_b', name: 'Divine Favor', description: 'Heal now also grants the target a temporary +15% damage buff for their next turn.', cost: 4000, currency: 'xp', type: 'choice' }
    ]
  },
  'recruit_mage': {
    stats: [
      { id: 'mage_atk_1', name: 'Arcane Focus I', description: '+4 Attack', cost: 1300, currency: 'xp', effect: { atk: 4 } },
      { id: 'mage_hp_1', name: 'Toughness I', description: '+8 Max HP', cost: 800, currency: 'xp', effect: { hp: 8 } },
      { id: 'mage_atk_2', name: 'Arcane Focus II', description: '+6 Attack', cost: 2600, currency: 'xp', effect: { atk: 6 } },
      { id: 'mage_ap_1', name: 'Quick Cast', description: 'Firebolt attack cost reduced by 1 AP.', cost: 5000, currency: 'xp', effect: { attackCost: -1 } },
    ],
    ability: [
      { id: 'mage_ability_a', name: 'Scorching Blast', description: 'Firebolt now leaves a burning effect, dealing 20% of its damage for 2 turns.', cost: 4500, currency: 'xp', type: 'choice' },
      { id: 'mage_ability_b', name: 'Frostbolt', description: 'Firebolt now chills the target, reducing their next movement by 1 tile.', cost: 4500, currency: 'xp', type: 'choice' }
    ]
  },
  'recruit_heavy_axeman': {
    stats: [
      { id: 'heavy_hp_1', name: 'Iron Skin I', description: '+25 Max HP', cost: 1000, currency: 'xp', effect: { hp: 25 } },
      { id: 'heavy_atk_1', name: 'Brute Force I', description: '+2 Attack', cost: 1000, currency: 'xp', effect: { atk: 2 } },
      { id: 'heavy_hp_2', name: 'Iron Skin II', description: '+35 Max HP', cost: 2000, currency: 'xp', effect: { hp: 35 } },
      { id: 'heavy_armor_1', name: 'Steel Plating', description: '+3 Armor', cost: 1800, currency: 'xp', effect: { armor: 3 } },
      { id: 'heavy_thorns_1', name: 'Spiked Armor', description: 'Reflect 2 damage when hit.', cost: 2500, currency: 'xp', effect: { thorns: 2 } },
    ],
    ability: [
      { id: 'heavy_ability_a', name: 'Reinforced Plating', description: 'Fortify now grants an additional +20 temporary HP.', cost: 3500, currency: 'xp', type: 'choice' },
      { id: 'heavy_ability_b', name: 'Retaliation', description: 'While Fortify is active, reflect 25% of melee damage taken.', cost: 3500, currency: 'xp', type: 'choice' }
    ]
  },
  'recruit_undead_vanguard': {
    stats: [
      { id: 'undead_atk_1', name: 'Unholy Strength I', description: '+5 Attack', cost: 1500, currency: 'xp', effect: { atk: 5 } },
      { id: 'undead_hp_1', name: 'Necrotic Vigor I', description: '+10 Max HP', cost: 900, currency: 'xp', effect: { hp: 10 } },
      { id: 'undead_atk_2', name: 'Unholy Strength II', description: '+7 Attack', cost: 3000, currency: 'xp', effect: { atk: 7 } },
      { id: 'undead_armor_1', name: 'Bone Plating', description: '+2 Armor', cost: 1600, currency: 'xp', effect: { armor: 2 } },
    ],
    ability: [
      { id: 'undead_ability_a', name: 'Armor Shatter', description: 'Sunder now permanently reduces the target\'s armor by 2.', cost: 5000, currency: 'xp', type: 'choice' },
      { id: 'undead_ability_b', name: 'Life Drain', description: 'Sunder now heals you for 30% of the damage dealt.', cost: 5000, currency: 'xp', type: 'choice' }
    ]
  },
  'recruit_crusader': {
    stats: [
      { id: 'crusader_hp_1', name: 'Faithful Vigor I', description: '+20 Max HP', cost: 950, currency: 'xp', effect: { hp: 20 } },
      { id: 'crusader_atk_1', name: 'Smite I', description: '+3 Attack', cost: 1150, currency: 'xp', effect: { atk: 3 } },
      { id: 'crusader_hp_2', name: 'Faithful Vigor II', description: '+30 Max HP', cost: 1900, currency: 'xp', effect: { hp: 30 } },
      { id: 'crusader_armor_1', name: 'Holy Aegis', description: '+2 Armor', cost: 1700, currency: 'xp', effect: { armor: 2 } },
    ],
    ability: [
      { id: 'crusader_ability_a', name: 'Aegis of Retribution', description: 'Divine Shield now explodes when it expires, dealing its absorbed damage to adjacent enemies.', cost: 4000, currency: 'xp', type: 'choice' },
      { id: 'crusader_ability_b', name: 'Sanctuary', description: 'Divine Shield now also heals you for 20% of your Max HP over its duration.', cost: 4000, currency: 'xp', type: 'choice' }
    ]
  },
  // --- Gold Gacha Recruits ---
  'recruit_rogue': {
    stats: [
      { id: 'rogue_atk_1', name: 'Lethality I', description: '+5 Attack', cost: 2000, currency: 'xp', effect: { atk: 5 } },
      { id: 'rogue_atk_2', name: 'Lethality II', description: '+8 Attack', cost: 4000, currency: 'xp', effect: { atk: 8 } },
      { id: 'rogue_move_1', name: 'Swiftness', description: '+1 Move Range', cost: 3000, currency: 'xp', effect: { moveRange: 1 } },
    ],
    ability: [
      { id: 'rogue_ability_a', name: 'Venom Strike', description: 'Shadow Strike now applies a poison, dealing 5 damage per turn for 3 turns.', cost: 5000, currency: 'xp', type: 'choice' },
      { id: 'rogue_ability_b', name: 'Fleet Footed', description: 'After using Shadow Strike, gain +1 Move Range for the rest of your turn.', cost: 5000, currency: 'xp', type: 'choice' }
    ]
  },
  'recruit_mounted_knight': {
    stats: [
      { id: 'cavalier_hp_1', name: 'Mount Vigor I', description: '+15 Max HP', cost: 1500, currency: 'xp', effect: { hp: 15 } },
      { id: 'cavalier_atk_1', name: 'Sharp Lance', description: '+4 Attack', cost: 2200, currency: 'xp', effect: { atk: 4 } },
      { id: 'cavalier_armor_1', name: 'Barding', description: '+2 Armor', cost: 1800, currency: 'xp', effect: { armor: 2 } },
    ],
    ability: [
      { id: 'cavalier_ability_a', name: 'Trample', description: 'Piercing Lance now hits a second target in a line behind the first for 50% damage.', cost: 6000, currency: 'xp', type: 'choice' },
      { id: 'cavalier_ability_b', name: 'Momentum', description: 'Piercing Lance deals up to 50% more damage based on the distance traveled this turn.', cost: 6000, currency: 'xp', type: 'choice' }
    ]
  },
  'recruit_duelist': {
    stats: [
      { id: 'duelist_atk_1', name: 'Finesse I', description: '+4 Attack', cost: 1800, currency: 'xp', effect: { atk: 4 } },
      { id: 'duelist_atk_2', name: 'Finesse II', description: '+6 Attack', cost: 3500, currency: 'xp', effect: { atk: 6 } },
      { id: 'duelist_ap_1', name: 'Adrenaline', description: '+1 Max AP per turn', cost: 7000, currency: 'xp', effect: { ap: 1 } },
    ],
    ability: [
      { id: 'duelist_ability_a', name: 'Perfect Riposte', description: 'Riposte now has a 100% chance to counter-attack.', cost: 5500, currency: 'xp', type: 'choice' },
      { id: 'duelist_ability_b', name: 'Parry', description: 'Riposte now also completely blocks the incoming attack.', cost: 5500, currency: 'xp', type: 'choice' }
    ]
  },
  'recruit_warg_rider': {
    stats: [
      { id: 'warg_hp_1', name: 'Warg Vigor I', description: '+12 Max HP', cost: 1400, currency: 'xp', effect: { hp: 12 } },
      { id: 'warg_atk_1', name: 'Savage Claws', description: '+3 Attack', cost: 2000, currency: 'xp', effect: { atk: 3 } },
      { id: 'warg_move_1', name: 'Beastial Speed', description: '+1 Move Range', cost: 3200, currency: 'xp', effect: { moveRange: 1 } },
    ],
    ability: [
      { id: 'warg_ability_a', name: 'Crippling Rush', description: 'Savage Rush now also cripples the target, reducing their next move by 2 tiles.', cost: 6000, currency: 'xp', type: 'choice' },
      { id: 'warg_ability_b', name: 'Frenzied Assault', description: 'After using Savage Rush, the Warg Rider may attack a second time for 50% damage.', cost: 6000, currency: 'xp', type: 'choice' }
    ]
  }
};


// --- NEW: ALCHEMY DEFINITIONS ---

// Master object for all cat animation sheets
const catAnimationSheets = {
  cat1: { idle: catIdleSheet, walk: catWalkSheet, run: catRunSheet, sitting: catSittingSheet, laying: catLayingSheet, sleeping1: catSleeping1Sheet, sleeping2: catSleeping2Sheet, stretching: catStretchingSheet, licking1: catLicking1Sheet, licking2: catLicking2Sheet, itch: catItchSheet, meow: catMeowSheet },
  cat2: { idle: cat2IdleSheet, walk: cat2WalkSheet, run: cat2RunSheet, sitting: cat2SittingSheet, laying: cat2LayingSheet, sleeping1: cat2Sleeping1Sheet, sleeping2: cat2Sleeping2Sheet, stretching: cat2StretchingSheet, licking1: cat2Licking1Sheet, licking2: cat2Licking2Sheet, itch: cat2ItchSheet, meow: cat2MeowSheet },
  cat3: { idle: cat3IdleSheet, walk: cat3WalkSheet, run: cat3RunSheet, sitting: cat3SittingSheet, laying: cat3LayingSheet, sleeping1: cat3Sleeping1Sheet, sleeping2: cat3Sleeping2Sheet, stretching: cat3StretchingSheet, licking1: cat3Licking1Sheet, licking2: cat3Licking2Sheet, itch: cat3ItchSheet, meow: cat3MeowSheet },
  cat4: { idle: cat4IdleSheet, walk: cat4WalkSheet, run: cat4RunSheet, sitting: cat4SittingSheet, laying: cat4LayingSheet, sleeping1: cat4Sleeping1Sheet, sleeping2: cat4Sleeping2Sheet, stretching: cat4StretchingSheet, licking1: cat4Licking1Sheet, licking2: cat4Licking2Sheet, itch: cat4ItchSheet, meow: cat4MeowSheet },
  cat5: { idle: cat5IdleSheet, walk: cat5WalkSheet, run: cat5RunSheet, sitting: cat5SittingSheet, laying: cat5LayingSheet, sleeping1: cat5Sleeping1Sheet, sleeping2: cat5Sleeping2Sheet, stretching: cat5StretchingSheet, licking1: cat5Licking1Sheet, licking2: cat5Licking2Sheet, itch: cat5ItchSheet, meow: cat5MeowSheet },
  cat6: { idle: cat6IdleSheet, walk: cat6WalkSheet, run: cat6RunSheet, sitting: cat6SittingSheet, laying: cat6LayingSheet, sleeping1: cat6Sleeping1Sheet, sleeping2: cat6Sleeping2Sheet, stretching: cat6StretchingSheet, licking1: cat6Licking1Sheet, licking2: cat6Licking2Sheet, itch: cat6ItchSheet, meow: cat6MeowSheet },
};

const alchemyIngredients = {
  // --- Raw Ingredients ---
  // Common Plants
  'focuroot': { id: 'focuroot', name: 'Focuroot', type: 'plant', rarity: 'common', description: 'A common root that aids concentration.', icon: plantCarrotIcon, seedId: 'seed_focuroot', processAs: 'chopped_vegetable' },
  'swiftblossom': { id: 'swiftblossom', name: 'Swiftblossom', type: 'plant', rarity: 'common', description: 'A leafy green that seems to quicken the senses.', icon: plantSpinachIcon, seedId: 'seed_swiftblossom', processAs: 'chopped_vegetable' },
  'stillpetal': { id: 'stillpetal', name: 'Stillpetal Rose', type: 'plant', rarity: 'common', description: 'A calm, aromatic flower.', icon: plantDriedRoseIcon, seedId: 'seed_stillpetal', processAs: 'ground_powder'},
  'oyster_mushroom': { id: 'oyster_mushroom', name: 'Oyster Mushroom', type: 'plant', rarity: 'common', description: 'An earthy, hearty mushroom.', icon: plantOysterMushroomIcon, seedId: 'seed_oyster_mushroom', processAs: 'chopped_vegetable' },

  // Rare Plants
  'sunfruit': { id: 'sunfruit', name: 'Sunfruit', type: 'plant', rarity: 'rare', description: 'A bright, radiant fruit that glows with inner warmth.', icon: plantSunflowerIcon, seedId: 'seed_sunfruit', processAs: 'distilled_liquid' },
  'luckleaf': { id: 'luckleaf', name: 'Luckleaf Chamomile', type: 'plant', rarity: 'rare', description: 'A rare five-petaled flower, said to bring minor fortune.', icon: plantChamomileLeavesIcon, seedId: 'seed_luckleaf', processAs: 'ground_powder'},

  // Dungeon Drops
  'goblin_ear': { id: 'goblin_ear', name: 'Goblin Ear', type: 'loot', rarity: 'common', description: 'Surprisingly waxy. Dropped by Goblins.', icon: ingredientJaggedTooth, processAs: 'distilled_liquid' },
  'skeleton_bone': { id: 'skeleton_bone', name: 'Skeleton Bone', type: 'loot', rarity: 'common', description: 'A dry, brittle bone from a reanimated skeleton.', icon: ingredientBone, processAs: 'ground_powder' },
  'shadow_essence': { id: 'shadow_essence', name: 'Shadow Essence', type: 'loot', rarity: 'rare', description: 'A swirling globule of pure darkness. Dropped by Shadows.', icon: ingredientPoisoniousPoultice, processAs: 'distilled_liquid' },
  'golem_heart': { id: 'golem_heart', name: 'Golem Heart', type: 'loot', rarity: 'epic', description: 'The magical stone that animates a Stone Golem.', icon: ingredientHeart, processAs: 'ground_powder' },

  // Tower Defense Drops
  'pristine_crystal': { id: 'pristine_crystal', name: 'Pristine Crystal', type: 'loot', rarity: 'rare', description: 'Thrums with contained energy. Awarded for fending off many foes.', icon: ingredientMysteriousRing, processAs: 'ground_powder' },
  'dragon_scale': { id: 'dragon_scale', name: 'Dragon Scale', type: 'loot', rarity: 'epic', description: 'An iridescent scale from a powerful dragon.', icon: ingredientCrown, processAs: 'ground_powder' },

  // Platformer Drops
  'stardust_phial': { id: 'stardust_phial', name: 'Stardust Phial', type: 'loot', rarity: 'legendary', description: 'A vial of shimmering, cosmic dust. Awarded for incredible platforming skill.', icon: potionIcon11, processAs: 'distilled_liquid' },
  
  // --- Processed Ingredients ---
  // Chopped Vegetables
  'chopped_vegetable_crude': { id: 'chopped_vegetable_crude', name: 'Roughly Chopped Greens', type: 'processed', rarity: 'common', description: 'A messy but usable chop.', icon: plantSpinachIcon, baseName: 'chopped_vegetable', quality: 'crude', potency: 1 },
  'chopped_vegetable_decent': { id: 'chopped_vegetable_decent', name: 'Decently Chopped Greens', type: 'processed', rarity: 'common', description: 'A standard, clean chop.', icon: plantSpinachIcon, baseName: 'chopped_vegetable', quality: 'decent', potency: 3 },
  'chopped_vegetable_fine': { id: 'chopped_vegetable_fine', name: 'Finely Chopped Greens', type: 'processed', rarity: 'rare', description: 'A precise and perfect chop.', icon: plantSpinachIcon, baseName: 'chopped_vegetable', quality: 'fine', potency: 5 },

  // Ground Powders
  'ground_powder_crude': { id: 'ground_powder_crude', name: 'Crude Dust', type: 'processed', rarity: 'common', description: 'A coarse, gritty powder.', icon: ingredientBone, baseName: 'ground_powder', quality: 'crude', potency: 1 },
  'ground_powder_decent': { id: 'ground_powder_decent', name: 'Decent Dust', type: 'processed', rarity: 'common', description: 'A standard, milled powder.', icon: ingredientBone, baseName: 'ground_powder', quality: 'decent', potency: 3 },
  'ground_powder_fine': { id: 'ground_powder_fine', name: 'Fine Dust', type: 'processed', rarity: 'rare', description: 'An impossibly fine, silky powder.', icon: ingredientBone, baseName: 'ground_powder', quality: 'fine', potency: 5 },
  
  // Distilled Liquids
  'distilled_liquid_crude': { id: 'distilled_liquid_crude', name: 'Murky Distillate', type: 'processed', rarity: 'common', description: 'Cloudy and impure.', icon: ingredientPoisoniousPoultice, baseName: 'distilled_liquid', quality: 'crude', potency: 1 },
  'distilled_liquid_decent': { id: 'distilled_liquid_decent', name: 'Clear Distillate', type: 'processed', rarity: 'common', description: 'A properly distilled liquid.', icon: ingredientPoisoniousPoultice, baseName: 'distilled_liquid', quality: 'decent', potency: 3 },
  'distilled_liquid_fine': { id: 'distilled_liquid_fine', name: 'Pure Essence', type: 'processed', rarity: 'rare', description: 'Perfectly pure and potent.', icon: ingredientPoisoniousPoultice, baseName: 'distilled_liquid', quality: 'fine', potency: 5 },

  // --- Potions & Failures ---
  'dubious_sludge': { id: 'dubious_sludge', name: 'Dubious Sludge', type: 'potion', rarity: 'common', description: 'Something went wrong. It smells... interesting.', icon: potionIcon10, goldValue: 1 },
};

const alchemyPlants = {
  'seed_focuroot': { id: 'seed_focuroot', name: 'Focuroot Seed', yields: 'focuroot', growthTimeSeconds: 60 * 30, spritesheet: cropCarrotSheet },
  'seed_swiftblossom': { id: 'seed_swiftblossom', name: 'Swiftblossom Seed', yields: 'swiftblossom', growthTimeSeconds: 60 * 45, spritesheet: cropSpinachSheet },
  'seed_stillpetal': { id: 'seed_stillpetal', name: 'Stillpetal Seed', yields: 'stillpetal', growthTimeSeconds: 60 * 60, spritesheet: cropRoseSheet },
  'seed_oyster_mushroom': { id: 'seed_oyster_mushroom', name: 'Mushroom Spores', yields: 'oyster_mushroom', growthTimeSeconds: 60 * 75, spritesheet: cropOysterSheet },
  'seed_sunfruit': { id: 'seed_sunfruit', name: 'Sunfruit Seed', yields: 'sunfruit', growthTimeSeconds: 60 * 120, spritesheet: cropSunflowerSheet },
  'seed_luckleaf': { id: 'seed_luckleaf', name: 'Chamomile Seed', yields: 'luckleaf', growthTimeSeconds: 60 * 240, spritesheet: cropChamomileSheet },
};

const alchemyPotions = {
  // --- Standard Potions ---
  'potion_minor_strength': { 
    id: 'potion_minor_strength', name: 'Potion of Minor Strength', goldValue: 50, icon: potionIcon1,
    recipe: [{ baseName: 'chopped_vegetable', amount: 1 }, { baseName: 'distilled_liquid', amount: 1 }],
    maxPotency: 10, // 1 fine + 1 fine
    buff: { target: 'dungeon', type: 'temp_stat', effect: { attack: 10 }, durationFloors: 3, description: 'Grants +10 Attack for 3 floors.' }
  },
  'potion_stonehide': { 
    id: 'potion_stonehide', name: 'Stonehide Draught', goldValue: 150, icon: potionIcon2,
    recipe: [{ baseName: 'ground_powder', amount: 2 }, { baseName: 'chopped_vegetable', amount: 1 }],
    maxPotency: 15, // 2 fine + 1 fine
    buff: { target: 'dungeon', type: 'temp_stat', effect: { hp: 50 }, durationFloors: 3, description: 'Grants +50 Max HP for 3 floors.' }
  },
  'potion_tower_power': { 
    id: 'potion_tower_power', name: 'Elixir of Tower Power', goldValue: 100, icon: potionIcon7,
    recipe: [{ baseName: 'chopped_vegetable', amount: 1 }, { baseName: 'ground_powder', amount: 1 }],
    maxPotency: 10,
    buff: { target: 'tower_defense', type: 'start_boost', effect: { startingXP: 200 }, description: 'Start your next TD game with an extra 200 XP.' }
  },
  'potion_castle_health': { 
    id: 'potion_castle_health', name: 'Draught of Fortification', goldValue: 200, icon: potionIcon15,
    recipe: [{ baseName: 'ground_powder', amount: 2 }, { baseName: 'ground_powder', amount: 1 }],
    maxPotency: 15,
    buff: { target: 'tower_defense', type: 'start_boost', effect: { startingHealth: 2 }, description: 'Start your next TD game with +2 Castle Health.' }
  },
  'potion_xp_boost': { 
    id: 'potion_xp_boost', name: 'Potion of Enlightenment', goldValue: 250, icon: potionIcon20,
    recipe: [{ baseName: 'distilled_liquid', amount: 2 }, { baseName: 'distilled_liquid', amount: 1 }],
    maxPotency: 15,
    buff: { target: 'global', type: 'xp_multiplier', effect: { multiplier: 1.25 }, durationTasks: 3, description: 'Gain 25% more XP from the next 3 completed assignments.' }
  },
  'potion_luck': { 
    id: 'potion_luck', name: 'Brewer\'s Luck Elixir', goldValue: 180, icon: potionIcon13,
    recipe: [{ baseName: 'ground_powder', amount: 1 }, { baseName: 'distilled_liquid', amount: 1 }],
    maxPotency: 10,
    buff: { target: 'global', type: 'slot_machine', effect: { bonus: 'better_odds' }, durationSpins: 5, description: 'Slightly increases your odds of a good result at the Slot Machine for 5 spins.' }
  },
  // --- Potent Potions ---
  'potion_minor_strength_potent': { 
    id: 'potion_minor_strength_potent', name: 'Potent Potion of Strength', goldValue: 100, icon: potionIcon1,
    buff: { target: 'dungeon', type: 'temp_stat', effect: { attack: 18 }, durationFloors: 4, description: 'Grants +18 Attack for 4 floors.' }
  },
  'potion_stonehide_potent': { 
    id: 'potion_stonehide_potent', name: 'Potent Stonehide Draught', goldValue: 300, icon: potionIcon2,
    buff: { target: 'dungeon', type: 'temp_stat', effect: { hp: 80 }, durationFloors: 4, description: 'Grants +80 Max HP for 4 floors.' }
  },
  'potion_tower_power_potent': { 
    id: 'potion_tower_power_potent', name: 'Potent Elixir of Tower Power', goldValue: 200, icon: potionIcon7,
    buff: { target: 'tower_defense', type: 'start_boost', effect: { startingXP: 350 }, description: 'Start your next TD game with an extra 350 XP.' }
  },
  'potion_castle_health_potent': { 
    id: 'potion_castle_health_potent', name: 'Potent Draught of Fortification', goldValue: 400, icon: potionIcon15,
    buff: { target: 'tower_defense', type: 'start_boost', effect: { startingHealth: 4 }, description: 'Start your next TD game with +4 Castle Health.' }
  },
  'potion_xp_boost_potent': { 
    id: 'potion_xp_boost_potent', name: 'Potent Potion of Enlightenment', goldValue: 500, icon: potionIcon20,
    buff: { target: 'global', type: 'xp_multiplier', effect: { multiplier: 1.5 }, durationTasks: 3, description: 'Gain 50% more XP from the next 3 completed assignments.' }
  },
  'potion_luck_potent': { 
    id: 'potion_luck_potent', name: 'Potent Brewer\'s Luck Elixir', goldValue: 360, icon: potionIcon13,
    buff: { target: 'global', type: 'slot_machine', effect: { bonus: 'much_better_odds' }, durationSpins: 5, description: 'Greatly increases your odds of a good result at the Slot Machine for 5 spins.' }
  },
};

const generatePath = () => {
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

const getStartOfDay = (date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const shouldGenerateQuests = (lastUpdatedTimestamp) => {
  if (!lastUpdatedTimestamp || typeof lastUpdatedTimestamp.toDate !== 'function') {
    // If it's null, or not a Firestore Timestamp, don't generate.
    return false;
  }
  const lastDate = lastUpdatedTimestamp.toDate();
  const now = new Date();
  return getStartOfDay(now) > getStartOfDay(lastDate);
};

const generateQuests = () => {
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

// Moved this function to the top-level scope to make it accessible by all components in this file.
const generateInitialDungeonState = () => {
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

// A single, authoritative default structure for a user's stats.
const defaultStats = {
  username: '', totalXP: 0, currentLevel: 1, assignmentsCompleted: 0, friends: [],
  ownedItems: [], equippedItems: { avatar: null, banner: 'banner_default', background: null, font: 'font_inter', animation: null, title: null, wallpaper: null, dungeonEmojis: {}, tdSkins: {} }, ownedFurniture: [], ownedPets: [], currentPet: null, petStatus: 'none', assignmentsToHatch: 0, cosmeticShards: 0,
  focusNavigator: { unlockedLocations: ['genesis_prime'], explorerStreak: 0, lastStreakDay: null, dailyFocusMinutes: 0 },
  activeBoosts: [],
  dungeon_state: generateInitialDungeonState(), dungeon_floor: 0, dungeon_gold: 0,
  dungeon_wingmen: { roster: [], graveyard: [], equipped: null, upgrades: {} },
  td_wins: 0, td_wave: 0, td_castleHealth: 5, td_towers: [], td_path: generatePath(), td_gameOver: false, td_gameWon: false, td_unlockedTowers: [], td_towerUpgrades: {},
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
  studyZone: { flashcardsText: '', platformerHighScore: 0, flashcardData: {} },
  achievements: { assignmentsCompleted: { tier: 0, progress: 0 }, hardAssignmentsCompleted: { tier: 0, progress: 0 } },
  quests: generateQuests(),
  contract: null,
};


// Modal Component for adding new assignments
const AddAssignmentModal = ({ isOpen, onClose, onSubmit }) => {
  const [newAssignment, setNewAssignment] = useState({
    class: '',
    assignment: '',
    dueDate: '',
    timeEstimate: '',
    pointsEarned: '',
    pointsMax: '',
    difficulty: 'Easy',
    status: 'To Do',
    recurrenceType: 'none',
    recurrenceEndDate: '',
    tags: [], // New: tags array
  });
  const [isEpic, setIsEpic] = useState(false);

  const isEligibleForEpic = useMemo(() => {
    return newAssignment.difficulty === 'Hard' && parseFloat(newAssignment.timeEstimate) >= 8;
  }, [newAssignment.difficulty, newAssignment.timeEstimate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment(prev => ({ ...prev, [name]: value }));
  };

  const handleTagChange = (e) => {
    const { value, checked } = e.target;
    setNewAssignment(prev => {
      const newTags = checked
        ? [...prev.tags, value]
        : prev.tags.filter(tag => tag !== value);
      return { ...prev, tags: newTags };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...newAssignment, isEpic: isEligibleForEpic && isEpic });
    // Reset form
    setNewAssignment({
      class: '', assignment: '', dueDate: '', timeEstimate: '',
      pointsEarned: '', pointsMax: '',
      difficulty: 'Easy', status: 'To Do',
      recurrenceType: 'none', recurrenceEndDate: '',
      tags: [],
    });
    setIsEpic(false);
    onClose();
  };

  if (!isOpen) return null;

return (
  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
    <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-8 w-full max-w-3xl max-h-[90vh] flex flex-col text-white">
      <h3 className="text-2xl font-bold mb-6 text-center">Add New Assignment</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 overflow-y-auto pr-2">
          {/* Class and Assignment */}
          <div className="md:col-span-1">
            <label htmlFor="class" className="block text-slate-400 text-sm font-bold mb-1">Class</label>
            <input
              type="text"
              id="class"
              name="class"
              placeholder="e.g., Math 101"
              value={newAssignment.class}
              onChange={handleChange}
              className="p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 w-full"
            />
          </div>
          <div className="md:col-span-1">
            <label htmlFor="assignment" className="block text-slate-400 text-sm font-bold mb-1">Assignment</label>
            <input
              type="text"
              id="assignment"
              name="assignment"
              placeholder="e.g., Homework 3"
              value={newAssignment.assignment}
              onChange={handleChange}
              className="p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 w-full"
              required
            />
          </div>

          {/* Due Date and Time Estimate */}
          <div>
            <label htmlFor="dueDate" className="block text-slate-400 text-sm font-bold mb-1">Due Date</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={newAssignment.dueDate}
              onChange={handleChange}
              className="p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 w-full"
            />
          </div>
          <div>
            <label htmlFor="timeEstimate" className="block text-slate-400 text-sm font-bold mb-1">Time Estimate (hrs)</label>
            <input
              type="number"
              id="timeEstimate"
              name="timeEstimate"
              placeholder="e.g., 2.5"
              value={newAssignment.timeEstimate}
              onChange={handleChange}
              className="p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 w-full"
            />
          </div>

          {/* Difficulty and Status */}
          <div className="md:col-span-1">
            <label htmlFor="difficulty" className="block text-slate-400 text-sm font-bold mb-1">Difficulty</label>
            <select
              id="difficulty"
              name="difficulty"
              value={newAssignment.difficulty}
              onChange={handleChange}
              className="p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 w-full"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div>
            <label htmlFor="status" className="block text-slate-400 text-sm font-bold mb-1">Status</label>
            <select
              id="status"
              name="status"
              value={newAssignment.status}
              onChange={handleChange}
              className="p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 w-full"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Tags Input */}
          <div className="md:col-span-2">
            <label className="block text-slate-400 text-sm font-bold mb-1">Tags</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 text-sm p-3 border border-slate-600 rounded-md bg-slate-700">
              {assignmentTags.map(tag => (
                <label key={tag} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={tag}
                    checked={newAssignment.tags.includes(tag)}
                    onChange={handleTagChange}
                    className="form-checkbox h-4 w-4 text-indigo-500 rounded bg-slate-800 border-slate-600"
                  />
                  <span>{tag}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Epic Quest Option */}
          {isEligibleForEpic && (
            <div className="md:col-span-2 bg-indigo-900/50 border border-indigo-700 p-4 rounded-lg">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isEpic}
                  onChange={(e) => setIsEpic(e.target.checked)}
                  className="form-checkbox h-5 w-5 text-indigo-500 rounded bg-slate-800 border-slate-600"
                />
                <div>
                  <span className="font-bold text-white">Make this an Epic Quest!</span>
                  <p className="text-xs text-indigo-300">This will automatically add milestone subtasks and grant bonus XP for completing them.</p>
                </div>
              </label>
            </div>
          )}

          {/* Recurrence Options */}
          <div className="md:col-span-2 border-t border-slate-700 pt-4 mt-2">
            <label htmlFor="recurrenceType" className="block text-slate-400 text-sm font-bold mb-1">Recurrence</label>
            <select
              id="recurrenceType"
              name="recurrenceType"
              value={newAssignment.recurrenceType}
              onChange={handleChange}
              className="p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 w-full"
            >
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            {newAssignment.recurrenceType !== 'none' && (
              <div className="mt-2">
                <label htmlFor="recurrenceEndDate" className="block text-slate-400 text-sm font-bold mb-1">Recurrence End Date (Optional)</label>
                <input
                  type="date"
                  id="recurrenceEndDate"
                  name="recurrenceEndDate"
                  value={newAssignment.recurrenceEndDate}
                  onChange={handleChange}
                  className="p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 w-full"
                />
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-slate-600 text-slate-300 px-5 py-2 rounded-md hover:bg-slate-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700 transition-colors duration-200 shadow-md"
            >
              Add Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// SlotMachine Animation Modal Component (CSGO Style - With XP Fillers)
// PASTE THIS
const SlotMachineAnimationModal = ({ isOpen, onClose, onAnimationComplete }) => {
  const [animationItems, setAnimationItems] = useState([]);
  const [animationState, setAnimationState] = useState('idle');
  const [finalReward, setFinalReward] = useState(null);
  const reelRef = useRef(null);

  const itemWidth = 100;
  const itemMargin = 2;
  const totalItemWidth = itemWidth + itemMargin * 2;
  const animationDuration = 7;

  useEffect(() => {
    if (isOpen) {
      const reelLength = 150;
      const rewardIndex = 140;
      const reel = Array.from({ length: reelLength }, () => slotMachineFillerItems[Math.floor(Math.random() * slotMachineFillerItems.length)]);

      let prize;
      const spinCost = 50;
      const roll = Math.random();

      if (roll < 0.65) {
        const lossPercentage = 0.3 + Math.random() * 0.5;
        const amount = -Math.floor(spinCost * lossPercentage);
        prize = { id: 'xp_loss_reward', name: `${amount} XP`, type: 'xp_loss', display: `${amount} XP`, rarity: 'common', amount };
      } else if (roll < 0.90) {
        const amount = Math.floor(Math.random() * 100) + 51;
        prize = { id: 'xp_gain_reward', name: `+${amount} XP`, type: 'xp_gain', display: `+${amount} XP`, rarity: amount > 100 ? 'epic' : 'rare', amount };
      } else {
        prize = { ...allRollableItems[Math.floor(Math.random() * allRollableItems.length)] };
      }

      reel[rewardIndex] = prize;

      setFinalReward(prize);
      setAnimationItems(reel);
      setAnimationState('preparing');

    } else {
      setAnimationItems([]);
      setAnimationState('idle');
      setFinalReward(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!reelRef.current) return;

    if (animationState === 'preparing') {
      reelRef.current.style.transition = 'none';
      reelRef.current.style.transform = 'translateX(0px)';
      const timeoutId = setTimeout(() => setAnimationState('spinning'), 50);
      return () => clearTimeout(timeoutId);
    }

    if (animationState === 'spinning') {
      const rewardIndex = 140;
      const containerWidth = reelRef.current.parentElement.offsetWidth;
      const centerOffset = (containerWidth / 2) - (totalItemWidth / 2);
      const randomJitter = (Math.random() - 0.5) * (totalItemWidth * 0.8);
      const finalTranslateX = -(rewardIndex * totalItemWidth) + centerOffset + randomJitter;

      reelRef.current.style.transition = `transform ${animationDuration}s cubic-bezier(0.15, 0.5, 0.25, 1)`;
      reelRef.current.style.transform = `translateX(${finalTranslateX}px)`;

      const timeoutId = setTimeout(() => setAnimationState('finished'), animationDuration * 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [animationState, totalItemWidth]);

  if (!isOpen) return null;

  const showResult = animationState === 'finished';
  const isCosmeticWin = finalReward && finalReward.type !== 'xp_gain' && finalReward.type !== 'xp_loss';

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-4xl overflow-hidden relative">
        <h3 className="text-3xl font-bold text-white text-center mb-6">
          {showResult ? "Result!" : "Spinning..."}
        </h3>

        {showResult && isCosmeticWin && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="absolute rounded-full opacity-0 animate-confetti" style={{ width: `${Math.random()*8+4}px`, height: `${Math.random()*8+4}px`, left: `${Math.random()*100}%`, top: `${Math.random()*100}%`, animationDelay: `${Math.random()*2}s`, backgroundColor: `hsl(${Math.random()*360}, 80%, 60%)` }}></div>
            ))}
          </div>
        )}

        <div className="relative w-full h-32 flex items-center justify-center">
            <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-[12px] border-t-red-500 z-20"></div>
            <div className="w-full h-full overflow-hidden">
              <div ref={reelRef} className="flex h-full items-center" style={{ willChange: 'transform' }}>
                {animationItems.map((item, index) => {
                  const rarityColors = { common: 'border-gray-500', rare: 'border-blue-500', epic: 'border-purple-500', legendary: 'border-orange-500', mythic: 'border-red-600' };
                  const borderColor = item.rarity ? rarityColors[item.rarity] : 'border-transparent';
                  return (
                    <div key={`${item.id}-${index}`} className={`flex-shrink-0 w-[100px] h-24 flex flex-col items-center justify-center m-1 rounded-lg shadow-md border-b-4 ${borderColor} transition-all duration-300 ${showResult && index === 140 ? 'scale-110' : ''} ${item.type === 'xp_gain' ? 'bg-green-800 text-white text-3xl font-bold' : item.type === 'xp_loss' ? 'bg-red-800 text-white text-3xl font-bold' : item.type === 'avatar' ? 'bg-slate-700 text-white text-5xl' : item.type === 'banner' ? item.style : item.type === 'font' ? 'bg-slate-700 text-white text-sm text-center px-1' : item.type === 'background' ? `${item.style} text-black text-sm text-center px-1` : item.type === 'animation' ? 'bg-slate-700 text-white text-sm text-center px-1' : item.type === 'title' ? 'bg-slate-700 text-white text-sm text-center px-1' : 'bg-gray-700 text-gray-300'}`}>
                      {(item.type === 'xp_gain' || item.type === 'xp_loss' || item.type === 'avatar') && <span>{item.display}</span>}
                      {item.type === 'banner' && <span className="text-sm text-center px-1">{item.name}</span>}
                      {item.type === 'font' && <span className={`text-lg text-center px-1 ${item.style}`}>{item.name}</span>}
                      {(item.type === 'background' || item.type === 'animation' || item.type === 'title') && <span className="text-sm text-center px-1">{item.name}</span>}
                      {!item.type && <span className="text-sm">?</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-b-[12px] border-b-red-500 z-20"></div>
        </div>

        {showResult && finalReward && (
          <div className="mt-8 text-center animate-fade-in">
            <h4 className="text-2xl font-bold text-white mb-2">
              {isCosmeticWin ? "Congratulations! You received:" : "Result:"}
            </h4>
            <div className={`inline-flex items-center justify-center p-4 rounded-lg shadow-lg min-w-[200px] text-4xl ${finalReward.type === 'xp_gain' ? 'bg-green-500 text-white' : finalReward.type === 'xp_loss' ? 'bg-red-500 text-white' : finalReward.type === 'avatar' ? 'bg-blue-600 text-white text-6xl' : finalReward.type === 'banner' ? `${finalReward.style}` : finalReward.type === 'font' ? `bg-purple-600 text-white ${finalReward.style}` : finalReward.type === 'background' ? `${finalReward.style} text-white` : finalReward.type === 'animation' ? `bg-indigo-600 text-white` : finalReward.type === 'title' ? `bg-red-600 text-white` : 'bg-gray-500 text-white'}`}>
              {finalReward.type === 'avatar' ? finalReward.display : finalReward.name}
            </div>
            <button
              onClick={() => onAnimationComplete(finalReward)}
              className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200 shadow-lg text-lg"
            >
              Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
// Task Completion Animation Component
const TaskCompletionAnimation = ({ show, onAnimationEnd, equippedAnimationEffect }) => {
  if (!show) return null;

  const animationClass = equippedAnimationEffect === 'sparkle' ? 'animate-sparkle' :
                         equippedAnimationEffect === 'confetti' ? 'animate-confetti-pop' :
                         equippedAnimationEffect === 'fireworks' ? 'animate-fireworks' :
                         equippedAnimationEffect === 'glow' ? 'animate-gentle-glow' :
                         equippedAnimationEffect === 'bounce' ? 'animate-bouncy-bounce' :
                         equippedAnimationEffect === 'flash' ? 'animate-flash' :
                         equippedAnimationEffect === 'slide' ? 'animate-slide-in' :
                         equippedAnimationEffect === 'zoom' ? 'animate-zoom-out' :
                         equippedAnimationEffect === 'swirl' ? 'animate-swirl' :
                         equippedAnimationEffect === 'fade' ? 'animate-fade-out' :
                         'animate-checkmark-pop'; // Default

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
      onAnimationEnd={onAnimationEnd}
    >
      <div className="relative">
        {/* Default Checkmark animation */}
        {animationClass === 'animate-checkmark-pop' && (
          <svg
            className="animate-checkmark-pop text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 52 52"
          >
            <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        )}

        {/* Sparkle animation */}
        {equippedAnimationEffect === 'sparkle' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 10 }).map((_, i) => (
              <span key={`sparkle-${i}`} className="absolute text-yellow-400 text-4xl opacity-0 animate-sparkle-effect"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`
                }}>✨</span>
            ))}
          </div>
        )}

        {/* Confetti Pop animation */}
        {equippedAnimationEffect === 'confetti' && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={`confetti-${i}`}
                className="absolute bg-white rounded-full opacity-0 animate-confetti-effect"
                style={{
                  width: `${Math.random() * 10 + 5}px`,
                  height: `${Math.random() * 10 + 5}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 1.5}s`,
                  backgroundColor: `hsl(${Math.random() * 360}, 70%, 70%)`,
                }}
              ></div>
            ))}
          </div>
        )}

        {/* Fireworks animation */}
        {equippedAnimationEffect === 'fireworks' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={`firework-${i}`} className="absolute animate-fireworks-effect"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.7}s`
                }}>
                {Array.from({ length: 12 }).map((__, j) => (
                  <div key={`particle-${j}`} className="absolute w-2 h-2 rounded-full bg-red-500 animate-firework-particle"
                    style={{
                      transform: `rotate(${j * 30}deg) translateX(20px)`,
                      animationDelay: `${i * 0.7 + j * 0.05}s`,
                      backgroundColor: `hsl(${j * 30}, 70%, 70%)`
                    }}></div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Gentle Glow Effect */}
        {equippedAnimationEffect === 'glow' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-yellow-300 opacity-0 animate-gentle-glow-effect"></div>
          </div>
        )}

        {/* Bouncy Bounce animation */}
        {equippedAnimationEffect === 'bounce' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl animate-bouncy-bounce-effect">✔️</span>
          </div>
        )}

        {/* Quick Flash animation */}
        {equippedAnimationEffect === 'flash' && (
          <div className="absolute inset-0 bg-white opacity-0 animate-flash-effect"></div>
        )}

        {/* Slide In animation */}
        {equippedAnimationEffect === 'slide' && (
          <div className="absolute top-1/2 left-0 -translate-y-1/2 text-6xl opacity-0 animate-slide-in-effect">✔️</div>
        )}

        {/* Zoom Out animation */}
        {equippedAnimationEffect === 'zoom' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl opacity-0 animate-zoom-out-effect">✔️</span>
          </div>
        )}

        {/* Swirling Effect animation */}
        {equippedAnimationEffect === 'swirl' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 border-4 border-blue-500 border-t-transparent rounded-full animate-swirl-effect"></div>
          </div>
        )}

        {/* Fade Out animation */}
        {equippedAnimationEffect === 'fade' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl animate-fade-out-effect">✔️</span>
          </div>
        )}
      </div>
    </div>
  );
};
// Tower Defense Projectile Component
const Projectile = ({ from, to, type }) => {
  const TILE_SIZE = 40;
  const [position, setPosition] = useState({
    top: from.y * TILE_SIZE + TILE_SIZE / 2,
    left: from.x * TILE_SIZE + TILE_SIZE / 2,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setPosition({
        top: to.y * TILE_SIZE + TILE_SIZE / 2,
        left: to.x * TILE_SIZE + TILE_SIZE / 2,
      });
    }, 10);

    return () => clearTimeout(timer);
  }, [from, to]);

  const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);

  const getProjectileVisual = () => {
    switch (type) {
      case 'arrow':
        return <div className="w-4 h-1 bg-yellow-300" style={{ transform: `rotate(${angle}deg)` }} />;
      case 'cannonball':
        return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
      case 'iceShard':
        return <div className="w-3 h-4 bg-blue-300 transform -skew-x-12" />;
      case 'bolt':
        return <div className="w-5 h-2 bg-yellow-500" style={{ transform: `rotate(${angle}deg)` }} />;
      case 'fireball':
        return <div className="w-4 h-4 bg-orange-500 rounded-full shadow-[0_0_8px_theme('colors.orange.500')]" />;
      case 'lightning':
        return <div className="w-2 h-6 bg-yellow-300 rounded-full" />;
      case 'poisonCloud':
        return <div className="w-4 h-4 bg-lime-500/50 rounded-full animate-pulse" />;
      case 'bullet':
        return <div className="w-2 h-1 bg-gray-300" style={{ transform: `rotate(${angle}deg)` }} />;
      case 'crystalShard':
          return <div className="w-3 h-5 bg-purple-400 transform skew-x-12" />;
      default:
        return <div className="w-2 h-2 bg-white rounded-full" />;
    }
  };

  return (
    <div
      className="projectile"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {getProjectileVisual()}
    </div>
  );
};
// Particle Effect Component
const GachaAnimationModal = ({ isOpen, onAnimationComplete, result }) => {
  const [phase, setPhase] = useState('shaking'); // shaking, revealing, revealed

  useEffect(() => {
    if (isOpen) {
      setPhase('shaking');
      const revealTimer = setTimeout(() => setPhase('revealing'), 2000); // 2s shake
      const revealedTimer = setTimeout(() => setPhase('revealed'), 3000); // 1s reveal transition
      return () => {
        clearTimeout(revealTimer);
        clearTimeout(revealedTimer);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const renderResult = () => {
    if (!result) return <p>An error occurred.</p>;
    switch (result.type) {
      case 'wingman':
        return <p className="text-2xl font-bold text-green-400">New Recruit: {result.wingman.name}!</p>;
      case 'gold':
        return <p className="text-2xl font-bold text-yellow-400">You found {result.amount} Gold!</p>;
      case 'nothing':
        return <p className="text-2xl font-bold text-slate-500">The box was empty...</p>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 p-8 rounded-lg text-center">
        <h3 className="text-3xl font-bold mb-6">Opening Lootbox...</h3>
        <div className="w-48 h-48 mx-auto mb-6 text-8xl flex items-center justify-center">
          <span className={`transition-transform duration-1000 ${phase === 'shaking' ? 'animate-shake' : ''} ${phase === 'revealing' || phase === 'revealed' ? 'scale-150 opacity-0' : 'scale-100'}`}>📦</span>
        </div>
        
        {phase === 'revealed' && (
          <div className="animate-fade-in">
            {renderResult()}
            <button onClick={() => onAnimationComplete(result)} className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg">Continue</button>
          </div>
        )}
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake { animation: shake 0.5s infinite; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fade-in 0.5s ease-out; }
      `}</style>
    </div>
  );
};
// In App.js, right after the closing of the Projectile component definition
const Particle = ({ onComplete }) => {  useEffect(() => {
    const timer = setTimeout(onComplete, 500); // Animation duration
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      {Array.from({ length: 5 }).map((_, i) => {
        const size = Math.random() * 8 + 4;
        const angle = (i / 5) * 2 * Math.PI;
        return (
          <div
            key={i}
            className="particle"
            style={{
              width: size, height: size,
              top: `calc(50% - ${size/2}px + ${Math.sin(angle) * 30}px)`,
              left: `calc(50% - ${size/2}px + ${Math.cos(angle) * 30}px)`,
              animationDelay: `${Math.random() * 0.1}s`
            }}
          />
        );
      })}
    </>
  );
}; 

// --- NEW: WingmanBarracks Component with Upgrades ---
const WingmanBarracks = ({ stats, wingmanDefs, updateStatsInFirestore, showMessageBox, sessionGold, sessionXp, isRunActive, pendingEquippedWingman, onEquipWingman }) => {
  const [selectedView, setSelectedView] = useState('recruit'); // 'recruit' or a wingman instanceId
  const [barracksView, setBarracksView] = useState('roster'); // 'roster' or 'graveyard'
  const [isGachaAnimating, setIsGachaAnimating] = useState(false);
  const [gachaResult, setGachaResult] = useState(null);
  
  const roster = stats.dungeon_wingmen?.roster || [];
  const graveyard = stats.dungeon_wingmen?.graveyard || [];
  const selectedUnit = roster.find(w => w.instanceId === selectedView) || graveyard.find(w => w.instanceId === selectedView);

  const handleRecruitXP = (wingmanId) => {
    const def = wingmanDefs[wingmanId];
    if (sessionXp < def.cost) { showMessageBox("Not enough XP!", "error"); return; }
    
    const newWingmanInstance = { ...def, instanceId: `${wingmanId}_${Date.now()}` };

    updateStatsInFirestore({
      totalXP: increment(-def.cost),
      'dungeon_wingmen.roster': [...(stats.dungeon_wingmen.roster || []), newWingmanInstance],
    });
    showMessageBox(`Recruited ${def.name}!`, 'info');
  };

  const handleRecruitGold = () => {
    if (sessionGold < 500) { showMessageBox("Not enough Gold!", "error"); return; }
    
    updateStatsInFirestore({ dungeon_gold: increment(-500) });
    
    const roll = Math.random();
    let result;

    if (roll < 0.1) { // 10% chance of nothing
        result = { type: 'nothing' };
    } else if (roll < 0.4) { // 30% chance of gold
        const amount = Math.floor(Math.random() * 501) + 250; // 250 to 750 gold
        result = { type: 'gold', amount };
    } else { // 60% chance of a wingman
        const gachaPool = Object.values(wingmanDefs).filter(w => w.currency === 'gold');
        
        if (gachaPool.length === 0) { // Should not happen, but good practice
            result = { type: 'gold', amount: 500 };
        } else {
            const recruit = gachaPool[Math.floor(Math.random() * gachaPool.length)];
            const newInstance = { ...recruit, instanceId: `${recruit.id}_${Date.now()}` };
            result = { type: 'wingman', wingman: newInstance };
        }
    }
    
    setGachaResult(result);
    setIsGachaAnimating(true);
  };

  const handleGachaAnimationEnd = (result) => {
      setIsGachaAnimating(false);
      setGachaResult(null);
  
      let updates = {};
      let message = "";
  
      if (result.type === 'gold') {
          updates.dungeon_gold = increment(result.amount);
          message = `You found ${result.amount} Gold in the lootbox!`;
      } else if (result.type === 'wingman') {
          updates['dungeon_wingmen.roster'] = [...(stats.dungeon_wingmen.roster || []), result.wingman];
          message = `From the shadows emerges... ${result.wingman.name}!`;
      } else { // 'nothing'
          message = "The lootbox was empty...";
      }
  
      if (Object.keys(updates).length > 0) {
          updateStatsInFirestore(updates);
      }
      showMessageBox(message, 'info');
  };

  const handlePurchaseUpgrade = (wingman, upgrade) => {
    if (sessionXp < upgrade.cost) { showMessageBox("Not enough XP!", "error"); return; }

    const upgrades = stats.dungeon_wingmen?.upgrades || {};
    const purchasedUpgrades = upgrades[wingman.id] || [];

    // Prevent re-buying a choice-based upgrade
    if (upgrade.type === 'choice') {
      const tierUpgrades = wingmanUpgrades[wingman.id]?.ability || [];
      if (tierUpgrades.some(u => purchasedUpgrades.includes(u.id))) {
        showMessageBox("You have already chosen a specialization for this ability.", "error");
        return;
      }
    }
    
    updateStatsInFirestore({
      totalXP: increment(-upgrade.cost),
      [`dungeon_wingmen.upgrades.${wingman.id}`]: [...purchasedUpgrades, upgrade.id]
    });

    showMessageBox(`Purchased upgrade: ${upgrade.name}!`, 'info');
  };

  const SpriteIcon = ({ style, size = 60 }) => {
    // Determine the scale factor needed to fit the largest dimension of the sprite into the 'size' box.
    const largestDim = Math.max(style.width, style.height);
    const scale = size / largestDim;

    return (
      // Outer container: A fixed-size box that centers its child.
      <div style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden', // Prevents scaled sprite from overflowing
      }}>
        {/* Inner container: Holds the sprite at its original dimensions and is then scaled down. */}
        <div style={{
          width: style.width,          // Original sprite width
          height: style.height,        // Original sprite height
          backgroundImage: `url(${wingmenSpriteSheet})`,
          backgroundPosition: style.backgroundPosition, // Original, unscaled position
          transform: `scale(${scale})`, // Scale the entire element down
          transformOrigin: 'center',   // Ensure scaling happens from the center
          imageRendering: 'pixelated',
          flexShrink: 0, // Prevent flexbox from shrinking this element
        }} />
      </div>
    );
  };
  
  const UpgradedStats = ({ wingman }) => {
    const baseStats = wingmanDefs[wingman.id];
    const mergedWingman = { ...baseStats, ...wingman };

    const { totalStats, bonuses } = useMemo(() => {
        const purchased = stats.dungeon_wingmen?.upgrades?.[mergedWingman.id] || [];
        const available = wingmanUpgrades[mergedWingman.id];
        
        const calculatedBonuses = { hp: 0, atk: 0, armor: 0, thorns: 0 };
        const finalStats = { ...mergedWingman };

        if (available?.stats) {
          purchased.forEach(upgradeId => {
            const upgrade = available.stats.find(u => u.id === upgradeId);
            if (upgrade?.effect) {
              for (const stat in upgrade.effect) {
                // Add to bonus tracker
                if (calculatedBonuses.hasOwnProperty(stat)) {
                  calculatedBonuses[stat] += upgrade.effect[stat];
                }
                // Apply to final stat total
                finalStats[stat] = (finalStats[stat] || 0) + upgrade.effect[stat];
              }
            }
          });
        }
        return { totalStats: finalStats, bonuses: calculatedBonuses };
    }, [mergedWingman.id, stats.dungeon_wingmen?.upgrades]);

    const primaryAbility = mergedWingman.abilities?.[0];

    return (
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <p>HP: <span className="font-bold text-red-400">{mergedWingman.hp} {bonuses.hp > 0 && <span className="text-green-400">(+{bonuses.hp})</span>}</span></p>
        <p>Attack: <span className="font-bold text-yellow-400">{mergedWingman.atk} {bonuses.atk > 0 && <span className="text-green-400">(+{bonuses.atk})</span>}</span></p>
        <p>Armor: <span className="font-bold text-slate-400">{mergedWingman.armor || 0} {bonuses.armor > 0 && <span className="text-green-400">(+{bonuses.armor})</span>}</span></p>
        <p>AP / Turn: <span className="font-bold text-cyan-400">{mergedWingman.ap}</span></p>
        {totalStats.thorns > 0 && <p>Thorns: <span className="font-bold text-orange-400">{totalStats.thorns}</span></p>}
        <p>Move Range: <span className="font-bold text-slate-400">{totalStats.moveRange}</span></p>
        <p>Attack Cost: <span className="font-bold text-slate-400">{totalStats.attackCost} AP</span></p>
        {primaryAbility && <p className="col-span-2">Ability: <span className="font-bold text-slate-400">{primaryAbility.name} ({primaryAbility.cost} AP)</span></p>}
      </div>
    );
  };


  return (
    <div className="mt-6 bg-slate-800/50 border border-slate-700 rounded-2xl p-4">
      <GachaAnimationModal isOpen={isGachaAnimating} onAnimationComplete={handleGachaAnimationEnd} result={gachaResult} />
      <h3 className="text-3xl font-bold text-white mb-4">Barracks</h3>
      <div className="flex flex-col md:flex-row gap-4 min-h-[60vh]">
        {/* Left Panel: Roster / Graveyard */}
        <div className="w-full md:w-1/3 lg:w-1/4 bg-slate-900/50 p-3 rounded-lg flex flex-col">
          <div className="flex border-b border-slate-700 mb-2">
            <button onClick={() => setBarracksView('roster')} className={`flex-1 py-2 text-sm font-semibold ${barracksView === 'roster' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400'}`}>Roster ({roster.length})</button>
            <button onClick={() => setBarracksView('graveyard')} className={`flex-1 py-2 text-sm font-semibold ${barracksView === 'graveyard' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400'}`}>Graveyard ({graveyard.length})</button>
          </div>
          <div className="space-y-2 overflow-y-auto flex-grow">
            {barracksView === 'roster' && roster.map(w => (
              <button key={w.instanceId} onClick={() => setSelectedView(w.instanceId)} className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${selectedView === w.instanceId ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'}`}>
                <div className="w-10 h-10 bg-slate-900 rounded-md flex items-center justify-center flex-shrink-0"><SpriteIcon style={w.spriteStyle} size={36} /></div>
                <div>
                  <p className="font-semibold text-left text-sm">{w.name}</p>
                  <p className="text-xs text-slate-400 text-left">{w.role}</p>
                </div>
              </button>
            ))}
            {barracksView === 'graveyard' && graveyard.map(w => (
              <button key={w.instanceId} onClick={() => setSelectedView(w.instanceId)} className={`w-full flex items-center gap-3 p-2 rounded-md transition-colors ${selectedView === w.instanceId ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'}`}>
                <div className="w-10 h-10 bg-slate-900 rounded-md flex items-center justify-center flex-shrink-0"><SpriteIcon style={w.spriteStyle} size={36} /></div>
                <div>
                  <p className="font-semibold text-left text-sm">{w.name}</p>
                  <p className="text-xs text-slate-500 text-left">Fallen in battle</p>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => { setSelectedView('recruit'); setBarracksView('roster'); }} className={`w-full flex items-center justify-center gap-3 p-2 mt-2 rounded-md transition-colors ${selectedView === 'recruit' ? 'bg-indigo-600' : 'bg-slate-800 hover:bg-slate-700'}`}>
            <span className="text-2xl">+</span><span className="font-semibold">Recruit New Wingmen</span>
          </button>
        </div>

        {/* Right Panel: Details/Recruit */}
        <div className="w-full md:w-2/3 lg:w-3/4 bg-slate-900/50 p-4 rounded-lg">
          {selectedUnit ? (
            <div>
              <div className="flex flex-col sm:flex-row gap-4 items-center mb-4 pb-4 border-b border-slate-700">
                <div className="w-24 h-24 bg-slate-800 rounded-lg flex items-center justify-center"><SpriteIcon style={selectedUnit.spriteStyle} size={80} /></div>
                <div className="flex-grow">
                    <h3 className="text-2xl font-bold">{selectedUnit.name}</h3>
                    <p className="text-indigo-400 font-semibold">{selectedUnit.role}</p>
                    {selectedUnit.dateOfDeath ? (
                      <p className="text-sm text-red-400 mt-2">Defeated on: {new Date(selectedUnit.dateOfDeath).toLocaleDateString()}</p>
                    ) : (
                      <div className="mt-2"><UpgradedStats wingman={selectedUnit} /></div>
                    )}
                </div>
                {!selectedUnit.dateOfDeath && (
                  <div className="flex-shrink-0">
                    {pendingEquippedWingman === selectedUnit.instanceId ?
                      <button onClick={() => onEquipWingman(null)} disabled={isRunActive} className="w-full sm:w-auto bg-slate-600 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50">Equipped</button> :
                      <button onClick={() => onEquipWingman(selectedUnit.instanceId)} disabled={isRunActive} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg disabled:opacity-50">Equip</button>
                    }
                  </div>
                )}
              </div>
              
              {!selectedUnit.dateOfDeath && (
                <>
                  <h4 className="text-xl font-semibold text-white mb-2">Training</h4>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      <div>
                          <h5 className="text-lg font-semibold text-indigo-300 mb-2">Stat Training</h5>
                          <div className="space-y-2">
                              {(wingmanUpgrades[selectedUnit.id]?.stats || []).map(upgrade => {
                                  const purchasedCount = (stats.dungeon_wingmen?.upgrades?.[selectedUnit.id] || []).filter(id => id === upgrade.id).length;
                                  const isOwned = purchasedCount > 0 && upgrade.type !== 'repeatable';
                                  return (
                                      <div key={upgrade.id} className="bg-slate-800 p-3 rounded-md flex justify-between items-center">
                                          <div>
                                              <p className="font-semibold">{upgrade.name}</p>
                                              <p className="text-xs text-slate-400">{upgrade.description}</p>
                                          </div>
                                          <button onClick={() => handlePurchaseUpgrade(selectedUnit, upgrade)} disabled={isOwned} className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white text-sm font-semibold px-3 py-1 rounded-md">
                                            {isOwned ? 'Owned' : `${upgrade.cost} XP`}
                                          </button>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                      <div>
                          <h5 className="text-lg font-semibold text-indigo-300 mb-2">Ability Specialization</h5>
                          <div className="space-y-2">
                            {(wingmanUpgrades[selectedUnit.id]?.ability || []).map(upgrade => {
                                  const purchasedUpgrades = stats.dungeon_wingmen?.upgrades?.[selectedUnit.id] || [];
                                  const isOwned = purchasedUpgrades.includes(upgrade.id);
                                  const hasChosenTier = (wingmanUpgrades[selectedUnit.id]?.ability || []).some(u => purchasedUpgrades.includes(u.id));
                                  return (
                                      <div key={upgrade.id} className="bg-slate-800 p-3 rounded-md">
                                          <p className="font-semibold">{upgrade.name}</p>
                                          <p className="text-xs text-slate-400 mb-2">{upgrade.description}</p>
                                          <button onClick={() => handlePurchaseUpgrade(selectedUnit, upgrade)} disabled={isOwned || hasChosenTier} className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 text-white text-sm font-semibold px-3 py-1 rounded-md">
                                            {isOwned ? 'Chosen' : hasChosenTier ? 'Path Chosen' : `Specialize (${upgrade.cost} XP)`}
                                          </button>
                                      </div>
                                  );
                            })}
                          </div>
                      </div>
                  </div>
                </>
              )}
            </div>
          ) : ( /* Recruit View */
            <div>
              <h4 className="text-xl font-semibold text-white mb-2">Recruit with XP</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {Object.values(wingmanDefs).filter(w => w.currency === 'xp').map(wingman => {
                  const isOwned = roster.some(r => r.id === wingman.id);
                  return (
                    <div key={wingman.id} className="p-4 bg-slate-800/80 rounded-lg flex flex-col items-center text-center border border-slate-700">
                      <div className="h-16 flex items-center justify-center"><SpriteIcon style={wingman.spriteStyle} size={60} /></div>
                      <p className="font-bold mt-2 flex-grow">{wingman.name}</p>
                      <button disabled={isOwned} onClick={() => handleRecruitXP(wingman.id)} className="mt-3 w-full bg-blue-600 text-white text-sm py-1 rounded hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed">
                        {isOwned ? 'Recruited' : `${wingman.cost} XP`}
                      </button>
                    </div>
                  );
                })}
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">Recruit with Gold</h4>
              <button onClick={handleRecruitGold} className="w-full p-4 bg-yellow-600 text-black font-bold rounded-lg hover:bg-yellow-700">
                Spend 500 Gold for a Rare or Epic Recruit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const DungeonCrawler = ({ stats, updateStatsInFirestore, showMessageBox, getFullPetDetails, onResetDungeon, getFullCosmeticDetails, processAchievement, syncDungeonXp, isMobile, addIngredientToInventory }) => {
  const statsPropRef = useRef(stats);
  useEffect(() => {
    statsPropRef.current = stats;
  }, [stats]);
  const [localDungeonState, setLocalDungeonState] = useState(stats.dungeon_state);
  const [animationState, setAnimationState] = useState({ hits: {}, particles: [], enemyPaths: {} });
  const [activeTurn, setActiveTurn] = useState('player');
  const [playerActionPoints, setPlayerActionPoints] = useState(2);
  const [wingmanActionPoints, setWingmanActionPoints] = useState(0);
  const [wingmanAbilityTarget, setWingmanAbilityTarget] = useState(null);
  const [dangerZone, setDangerZone] = useState({ tiles: [], forEnemy: null });
  const [barracksOpen, setBarracksOpen] = useState(false);
  const [pendingEquippedWingman, setPendingEquippedWingman] = useState(stats.dungeon_wingmen?.equipped);
  const [wingmanTurnState, setWingmanTurnState] = useState({ distanceMoved: 0, frenziedAttackAvailable: false });
  const [turnIndicator, setTurnIndicator] = useState(null);

  useEffect(() => {
    if (activeTurn === 'player' && localDungeonState.phase === 'playing') {
      setTurnIndicator('Player Turn');
    } else if (activeTurn === 'enemy' && localDungeonState.phase === 'playing') {
      setTurnIndicator('Enemy Turn');
    }
    
    const timer = setTimeout(() => {
      setTurnIndicator(null);
    }, 1500); // The animation `animate-fade-out-fast` lasts 1.5s
  
    return () => clearTimeout(timer);
  }, [activeTurn, localDungeonState.phase]);

  // These states track resources for the current session to batch updates.
  const [sessionXp, setSessionXp] = useState(stats.totalXP);
  const [sessionGold, setSessionGold] = useState(stats.dungeon_gold || 0);
  
  const dungeonStateRef = useRef(localDungeonState);
  useEffect(() => {
    dungeonStateRef.current = localDungeonState;
  }, [localDungeonState]);

  // Syncs the pending choice with the saved choice from Firestore when stats change.
  useEffect(() => {
    setPendingEquippedWingman(stats.dungeon_wingmen?.equipped);
  }, [stats.dungeon_wingmen?.equipped]);

  // NEW & IMPROVED: Wingman spawning with stat AND ability upgrades.
  useEffect(() => {
    const state = localDungeonState;
    const equippedWingmanInstanceId = pendingEquippedWingman; // This now holds the instanceId

    if (state.phase !== 'playing' || state.floor !== 1 || state.turnCount > 1) return;

    const currentWingmanInstanceId = state.wingman?.instanceId;

    // Handle unequipping
    if (!equippedWingmanInstanceId && currentWingmanInstanceId) {
      const oldPos = `${state.wingman.y},${state.wingman.x}`;
      setLocalDungeonState(prev => {
        const newBoard = { ...prev.board };
        if (newBoard[oldPos]?.type === 'wingman') newBoard[oldPos] = { type: 'empty' };
        return { ...prev, wingman: null, board: newBoard };
      });
      return;
    }

    // Handle equipping a new/different wingman
    if (equippedWingmanInstanceId && equippedWingmanInstanceId !== currentWingmanInstanceId) {
      const wingmanRosterEntry = (stats.dungeon_wingmen?.roster || []).find(w => w.instanceId === equippedWingmanInstanceId);
      if (!wingmanRosterEntry) {
          console.error("Equipped wingman not found in roster:", equippedWingmanInstanceId);
          return;
      }
      
      const upgradedWingman = JSON.parse(JSON.stringify(wingmanRosterEntry)); // Deep copy from the roster entry
      const baseDef = wingmanDefinitions[upgradedWingman.id];
      const purchasedUpgrades = stats.dungeon_wingmen?.upgrades?.[upgradedWingman.id] || [];
      
      // Reset all potentially upgradeable stats to their base definition values
      Object.assign(upgradedWingman, {
        hp: baseDef.hp,
        atk: baseDef.atk,
        armor: baseDef.armor || 0,
        thorns: baseDef.thorns || 0,
      });
      
      // Re-apply all purchased stat upgrades generically
      purchasedUpgrades.forEach(upgradeId => {
        const upgradeDef = wingmanUpgrades[upgradedWingman.id]?.stats.find(u => u.id === upgradeId);
        if (upgradeDef?.effect) {
          for (const stat in upgradeDef.effect) {
            upgradedWingman[stat] = (upgradedWingman[stat] || 0) + upgradeDef.effect[stat];
          }
        }
      });
      upgradedWingman.maxHp = upgradedWingman.hp;

      // Apply ability specializations
      const abilityUpgradeDefs = wingmanUpgrades[upgradedWingman.id]?.ability || [];
      const purchasedAbilityUpgrade = abilityUpgradeDefs.find(u => purchasedUpgrades.includes(u.id));
      if (purchasedAbilityUpgrade) {
          upgradedWingman.abilities = upgradedWingman.abilities.map(ability => ({
              ...ability,
              specialization: purchasedAbilityUpgrade.id // Add specialization ID to the ability object
          }));
      }

      setLocalDungeonState(prev => {
        let newBoard = { ...prev.board };
        if (prev.wingman) {
          const oldPos = `${prev.wingman.y},${prev.wingman.x}`;
          if (newBoard[oldPos]?.type === 'wingman') newBoard[oldPos] = { type: 'empty' };
        }
        
        const possibleSpots = [{x: 1, y: 0}, {x: 0, y: 1}, {x: 2, y: 1}, {x: 1, y: 2}];
        const startPos = possibleSpots.find(p => newBoard[`${p.y},${p.x}`]?.type === 'empty');

        if (startPos) {
          const newWingman = { ...upgradedWingman, x: startPos.x, y: startPos.y, entityType: 'wingman' };
          newBoard[`${startPos.y},${startPos.x}`] = { type: 'wingman' };
          setWingmanActionPoints(newWingman.ap);
          return { ...prev, wingman: newWingman, board: newBoard };
        }
        return { ...prev, wingman: null };
      });
    }
  }, [localDungeonState.phase, localDungeonState.floor, localDungeonState.turnCount, localDungeonState.wingman, pendingEquippedWingman, stats.dungeon_wingmen?.roster, stats.dungeon_wingmen?.upgrades]);

  const [attackTarget, setAttackTarget] = useState(null); // Can be true, or an object like { type: 'secondary' }
  const [abilityTarget, setAbilityTarget] = useState(null);
  const [shopView, setShopView] = useState('buy'); // 'buy' or 'armory'
  const [selectedArmoryItem, setSelectedArmoryItem] = useState(null);
  
  const addLog = useCallback((message, style = 'text-slate-300') => {
    // Add a unique ID to each log entry
    const newLogEntry = { id: Date.now() + Math.random(), message, style };
    setLocalDungeonState(prevState => ({ ...prevState, log: [newLogEntry, ...(prevState.log || []).slice(0, 4)] }));
  }, []);

  useEffect(() => {
    if (syncDungeonXp) {
      syncDungeonXp(sessionXp);
    }
  }, [sessionXp, syncDungeonXp]);
  
  // REFACTORED: saveGame now updates the single stats document.
  const saveGame = useCallback(async (stateToSave) => {

    if (!stateToSave) return;
    try {
      await updateStatsInFirestore({
        dungeon_state: stateToSave,
        dungeon_gold: sessionGold,
        totalXP: sessionXp,
        'cooldowns.saveDungeon': serverTimestamp()
      });
      // Don't show a message on auto-save
    } catch (error) {
      if (error.message.includes('permission-denied')) {
        showMessageBox("You're saving too frequently!", "error");
      } else {
        console.error("Dungeon save failed:", error);
        showMessageBox("Failed to save progress.", "error");
      }
    }
  }, [sessionGold, sessionXp, updateStatsInFirestore, showMessageBox]);

  // FIX: This useEffect was the source of the state reset bug and has been removed.
  // The component now correctly manages its own state after initialization.
  
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (localDungeonState && localDungeonState.phase === 'playing' && !localDungeonState.gameOver) {
        saveGame(localDungeonState);
        showMessageBox("Game progress auto-saved!", "info", 1500);
      }
    }, 600000); // Auto-save every 10 minutes

    return () => clearInterval(autoSaveInterval);
  }, [localDungeonState, saveGame]);

  const dungeonDefinitions = {
    classes: {
      warrior: { name: 'Warrior', icon: '⚔️', combatStyle: 'Martial', description: 'A balanced fighter with strong melee attacks.', startingHp: 100, moveCost: 5, attackCost: 50, attackRange: 1.5, ability: { id: 'whirlwind', name: 'Whirlwind', cost: 120 } },
      mage: { name: 'Mage', icon: '🧙', combatStyle: 'Arcane', description: 'A fragile caster with powerful area-of-effect spells.', startingHp: 60, moveCost: 5, attackCost: 100, attackRange: 4, ability: { id: 'fireball', name: 'Fireball', cost: 200 } },
      archer: { name: 'Archer', icon: '🏹', combatStyle: 'Finesse', description: 'A nimble marksman who attacks from a great distance.', startingHp: 60, moveCost: 5, attackCost: 60, attackRange: 5, ability: { id: 'double_tap', name: 'Double Tap', cost: 150 } },
      tank: { name: 'Tank', icon: '🛡️', combatStyle: 'Martial', description: 'A sturdy protector who can endure heavy damage.', startingHp: 200, moveCost: 8, attackCost: 40, attackRange: 1.5, ability: { id: 'hunker_down', name: 'Hunker Down', cost: 80 } },
    },
primaryWeapons: {
      warrior: {
        swords: [
          { id: 'weapon_sword', name: 'Iron Sword', cost: 500, attack: 10, accuracy: 1.0, attackRange: 1.5, description: "Balanced and reliable." },
          { id: 'weapon_broadsword', name: 'Steel Broadsword', cost: 1200, attack: 22, accuracy: 1.0, attackRange: 1.5, description: "A solid, dependable upgrade." },
          { id: 'weapon_vampiric_falchion', name: 'Vampiric Falchion', cost: 2800, attack: 35, accuracy: 1.0, lifesteal: 0.15, attackRange: 1.5, description: "Restores 15% of damage dealt as health." },
          { id: 'weapon_flame', name: 'Flame Tongue', cost: 2000, attack: 45, accuracy: 1.0, attackRange: 1.5, description: "Deals bonus fire damage." },
          { id: 'weapon_void', name: 'Void Blade', cost: 5000, attack: 70, accuracy: 1.0, attackRange: 1.5, statusEffect: { type: 'weakened', chance: 0.3, duration: 2 }, description: "Has a 30% chance to weaken enemies, reducing their damage." },
          { id: 'weapon_sunforged', name: 'Sunforged Blade', cost: 7500, attack: 100, accuracy: 1.0, attackRange: 1.5,  tdWinsRequired: 5, description: "A legendary, perfectly balanced blade." },
        ],
        axes: [
          { id: 'weapon_axe_iron', name: 'Iron Axe', cost: 550, attack: 16, accuracy: 0.90, cleave: 0.25, attackRange: 1.5, description: "High damage, but less accurate. Hits adjacent enemies for 25% damage." },
          { id: 'weapon_axe_steel', name: 'Steel War Axe', cost: 1000, attack: 25, accuracy: 0.85, cleave: 0.30, attackRange: 1.5, description: "A heavier axe with a better cleave effect." },
          { id: 'weapon_axe_berserker', name: 'Berserker Axe', cost: 1200, attack: 35, accuracy: 0.80, cleave: 0.35, attackRange: 1.5, description: "More powerful, but wilder. Hits adjacent enemies for 35% damage." },
          { id: 'weapon_axe_executioner', name: 'Executioner\'s Axe', cost: 4500, attack: 65, accuracy: 0.75, cleave: 0.40, attackRange: 1.5, description: "Incredibly powerful with a wide swing, but very inaccurate." },
        ],
        spears: [
          { id: 'weapon_spear_iron', name: 'Iron Spear', cost: 600, attack: 9, attackRange: 2.5, accuracy: 1.0, description: "Increased reach allows attacking from a distance." },
          { id: 'weapon_spear_lance', name: 'Lance', cost: 1100, attack: 18, attackRange: 2.5, accuracy: 1.0, description: "A long polearm for controlling the battlefield." },
          { id: 'weapon_spear_pike', name: 'Steel Pike', cost: 1600, attack: 24, attackRange: 2.5, accuracy: 1.0, description: "A powerful polearm with exceptional reach." },
          { id: 'weapon_spear_trident', name: 'Trident', cost: 3200, attack: 40, attackRange: 2.5, accuracy: 0.95, description: "A three-pronged spear that can strike multiple foes in a line." },
        ]
      },
      mage: {
        wands: [
          { id: 'wand_apprentice', name: 'Apprentice Wand', cost: 500, attack: 15, aoeRange: 1.5, accuracy: 1.0, attackRange: 4, description: "Quick, reliable single-target damage." },
          { id: 'wand_fireball', name: 'Fireball Wand', cost: 1200, attack: 28, aoeRange: 1.5, accuracy: 1.0, attackRange: 4, description: "Casts a small exploding fireball." },
          { id: 'wand_frost', name: 'Frost Wand', cost: 1800, attack: 20, aoeRange: 1.5, accuracy: 1.0, attackRange: 4, statusEffect: { type: 'crippled', chance: 1.0, duration: 1, reduction: 1 }, description: "Chills the target on hit, slowing them for a turn." },
          { id: 'wand_lightning', name: 'Lightning Wand', cost: 2500, attack: 50, aoeRange: 2, accuracy: 1.0, attackRange: 4, description: "A more powerful elemental wand." },
          { id: 'wand_void', name: 'Void Core Wand', cost: 5000, attack: 75, aoeRange: 2, accuracy: 1.0, attackRange: 4, description: "Channels unstable but powerful energy." },
          { id: 'wand_archmage', name: 'Archmage\'s Wand', cost: 7500, attack: 110, aoeRange: 2.5, accuracy: 1.0, attackRange: 4, tdWinsRequired: 5, description: "A wand of immense power." },
        ],
        staves: [
          { id: 'staff_charged', name: 'Charged Staff', cost: 1500, attack: 40, aoeRange: 2.0, accuracy: 1.0, attackRange: 4, isChargeable: true, maxCharges: 1, description: "Can be charged for one turn to unleash a x2 damage blast." },
          { id: 'staff_power', name: 'Staff of Power', cost: 2500, attack: 52, aoeRange: 2.0, accuracy: 1.0, attackRange: 4, isChargeable: true, maxCharges: 1, description: "A staff that holds a greater latent charge." },
          { id: 'staff_chain_lightning', name: 'Chain Lightning Staff', cost: 3800, attack: 45, aoeRange: 0, chain: { count: 3, range: 3.5, falloff: 0.7 }, accuracy: 1.0, attackRange: 4, description: "Hits the target, then arcs to 3 nearby enemies for 70% damage." },
          { id: 'staff_grand', name: 'Grand Staff', cost: 4000, attack: 65, aoeRange: 2.5, accuracy: 1.0, attackRange: 4, isChargeable: true, maxCharges: 2, description: "Can be charged up multiple times for immense power." },
        ],
        tomes: [
          { id: 'tome_stunning', name: 'Tome of Stunning', cost: 1800, attack: 5, accuracy: 1.0, attackRange: 4, statusEffect: { type: 'stunned', chance: 0.75, duration: 1 }, description: "Low damage, but has a 75% chance to stun the target for a turn." },
          { id: 'tome_frost', name: 'Tome of Frost', cost: 1800, attack: 5, accuracy: 1.0, attackRange: 4, statusEffect: { type: 'crippled', chance: 1.0, duration: 2, reduction: 1 }, description: "Low damage, but slows the target's movement for 2 turns." },
          { id: 'tome_cursing', name: 'Tome of Cursing', cost: 2200, attack: 10, accuracy: 1.0, attackRange: 4, statusEffect: { type: 'cursed', chance: 0.8, duration: 3, multiplier: 1.2 }, description: "80% chance to curse the target, making them take 20% more damage for 3 turns." },
        ]
      },
      archer: {
        bows: [
          { id: 'bow_short', name: 'Shortbow', cost: 500, attack: 12, accuracy: 1.0, attackRange: 5, description: "A reliable, standard-issue bow." },
          { id: 'bow_long', name: 'Longbow', cost: 1100, attack: 28, accuracy: 1.0, attackRange: 5, description: "Offers greater power and range." },
          { id: 'bow_multishot', name: 'Multishot Bow', cost: 2000, attack: 18, accuracy: 1.0, attackRange: 5, multishot: 3, description: "Fires a spread of 3 arrows at once." },
          { id: 'bow_eagle', name: 'Eagle Eye Bow', cost: 2200, attack: 55, accuracy: 1.0, attackRange: 5, description: "A masterfully crafted bow that rarely misses." },
          { id: 'bow_void', name: 'Voidstring Bow', cost: 5000, attack: 80, accuracy: 1.0, attackRange: 5, description: "Fires arrows imbued with weakening energy." },
          { id: 'bow_sunstrider', name: 'Sunstrider\'s Mark', cost: 7500, attack: 120, accuracy: 1.0, attackRange: 5, tdWinsRequired: 5, description: "A legendary bow of unmatched power." },
        ],
        crossbows: [
          { id: 'crossbow_iron', name: 'Iron Crossbow', cost: 1300, attack: 35, accuracy: 1.0, attackRange: 5, armorPiercing: 5, description: "Slower to fire, but its bolts ignore 5 enemy armor." },
          { id: 'crossbow_hunter', name: 'Hunter\'s Crossbow', cost: 1800, attack: 45, accuracy: 1.0, attackRange: 5, armorPiercing: 7, description: "A well-made crossbow with superior armor penetration." },
          { id: 'crossbow_repeater', name: 'Repeating Crossbow', cost: 2800, attack: 25, accuracy: 1.0, attackRange: 5, armorPiercing: 3, multishot: 2, description: "Fires two bolts in quick succession." },
          { id: 'crossbow_heavy', name: 'Heavy Crossbow', cost: 2500, attack: 60, accuracy: 1.0, attackRange: 5, armorPiercing: 10, description: "A powerful, heavy weapon that is highly effective against armored foes." },
        ]
      },
      tank: {
        sword_and_shield: [
          { id: 'shield_iron', name: 'Iron Sword & Shield', cost: 500, attack: 8, hp: 50, accuracy: 1.0, attackRange: 1.5, description: "A standard, defensive starting weapon." },
          { id: 'shield_steel', name: 'Steel Tower Shield', cost: 1000, attack: 15, hp: 120, accuracy: 1.0, attackRange: 1.5, description: "Provides excellent protection." },
          { id: 'shield_spiked', name: 'Spiked Shield', cost: 1800, attack: 20, hp: 180, accuracy: 1.0, attackRange: 1.5, thorns: 5, description: "Deals 5 damage to melee attackers." },
          { id: 'shield_aegis', name: 'Aegis Wall', cost: 2000, attack: 25, hp: 250, accuracy: 1.0, attackRange: 1.5, description: "An almost impenetrable defensive shield." },
          { id: 'shield_void', name: 'Void Bulwark', cost: 5000, attack: 40, hp: 400, accuracy: 1.0, attackRange: 1.5, description: "A shield that absorbs dark energy." },
          { id: 'shield_unbreakable', name: 'The Unbreakable', cost: 7500, attack: 60, hp: 600, accuracy: 1.0, attackRange: 1.5, tdWinsRequired: 5, description: "A legendary shield said to be indestructible." },
        ],
        hammers: [
          { id: 'hammer_warhammer', name: 'Warhammer', cost: 1200, attack: 20, accuracy: 0.9, attackRange: 1.5, statusEffect: { type: 'stunned', chance: 0.4, duration: 1 }, description: "A heavy two-handed hammer with a 40% chance to stun enemies." },
          { id: 'hammer_maul', name: 'Stunning Maul', cost: 2400, attack: 30, accuracy: 0.9, attackRange: 1.5, statusEffect: { type: 'stunned', chance: 0.6, duration: 1 }, description: "Slower, but has a 60% chance to stun enemies." },
          { id: 'hammer_sunderer', name: 'Sunderer Maul', cost: 3500, attack: 45, accuracy: 0.85, attackRange: 1.5, statusEffect: { type: 'armor_break', chance: 0.5, duration: 3, amount: 5 }, description: "50% chance to reduce enemy armor by 5 for 3 turns." },
        ]
      }
    },
    offhandWeapons: [
      { id: 'offhand_dagger', name: 'Dagger', cost: 200, attack: 8, attackRange: 1.5, accuracy: 1.0, forClass: ['mage', 'archer'] },
      { id: 'offhand_shortbow', name: 'Shortbow', cost: 350, attack: 10, attackRange: 4, accuracy: 1.0, forClass: ['warrior', 'tank'] },
      { id: 'offhand_wand', name: 'Wand', cost: 450, attack: 6, attackRange: 3, accuracy: 1.0, aoeRange: 1.5, forClass: ['warrior', 'tank'] },
      // New additions
      { id: 'offhand_buckler', name: 'Buckler', cost: 300, hp: 25, forClass: ['mage', 'archer'], description: "+25 Max HP." },
      { id: 'offhand_tome', name: 'Tome of Focus', cost: 400, attack: 5, forClass: ['mage'], description: "Passively adds +5 Attack." },
      { id: 'offhand_throwing_axe', name: 'Throwing Axe', cost: 350, attack: 12, attackRange: 3, accuracy: 0.9, forClass: ['warrior', 'tank'] },
    ],
    armors: [ // Universal
      { id: 'armor_leather', name: 'Leather Armor', cost: 500, hp: 50 },
      { id: 'armor_plate', name: 'Steel Plate', cost: 1000, hp: 120 },
      { id: 'armor_regen', name: 'Trollblood Mail', cost: 2000, hp: 200 },
      { id: 'armor_aegis', name: 'Aegis of the Immortal', cost: 5000, hp: 350 },
      { id: 'armor_dragonscale', name: 'Dragonscale Mail', cost: 7500, hp: 500, tdWinsRequired: 5 },
    ],
    attacks: [
      // Warrior
      { id: 'warrior_power_strike', name: 'Power Strike', cost: 70, class: 'warrior', maxUses: 2, effect: { damageMultiplier: 2.5 }, range: 1.5 },
      { id: 'warrior_whirlwind', name: 'Whirlwind', cost: 120, class: 'warrior', maxUses: 2, effect: { damageMultiplier: 0.8, aoe: 1.5 }, range: 1.5 },
      // Mage
      { id: 'mage_lesser_heal', name: 'Lesser Heal', cost: 20, class: 'mage', maxUses: 2, effect: { heal: 25 }, isSelfTarget: true },
      { id: 'mage_fireball', name: 'Fireball', cost: 100, class: 'mage', maxUses: 2, effect: { damageMultiplier: 1.5, aoe: 1.5 }, range: 4 },
      // Archer
      { id: 'archer_piercing_shot', name: 'Piercing Shot', cost: 60, class: 'archer', maxUses: 2, effect: { damageMultiplier: 1.2, armorPiercing: 0.5 }, range: 5 },
      { id: 'archer_crippling_shot', name: 'Crippling Shot', cost: 40, class: 'archer', maxUses: 2, effect: { damageMultiplier: 0.5, status: { type: 'crippled', duration: 1 } }, range: 5 },
      // Tank
      { id: 'tank_shield_bash', name: 'Shield Bash', cost: 30, class: 'tank', maxUses: 2, effect: { damageMultiplier: 0.7, status: { type: 'stunned', duration: 1, chance: 0.8 } }, range: 1.5 },
      { id: 'tank_lay_on_hands', name: 'Lay on Hands', cost: 40, class: 'tank', maxUses: 2, effect: { heal: 40 }, isSelfTarget: true },
    ],
    temp_potions: [
      { id: 'potion_strength', name: 'Potion of Strength', cost: 75, effect: { attack: 15 }, duration: 3, type: 'temp_potion' },
      { id: 'potion_fortitude', name: 'Potion of Fortitude', cost: 75, effect: { hp: 50 }, duration: 3, type: 'temp_potion' },
      { id: 'potion_wealth', name: 'Potion of Wealth', cost: 100, effect: { goldBonus: 0.1 }, duration: 3, type: 'temp_potion' },
    ],
        enemies: [
      { id: 'goblin', name: 'Goblin', combatStyle: 'Martial', hp: 20, atk: 5, minFloor: 1, loot: { id: 'goblin_ear', chance: 0.1 }, moveRange: 1, attackRange: 1.5, ai: 'standard' },
      { id: 'skeleton', name: 'Skeleton', combatStyle: 'Martial', hp: 35, atk: 8, minFloor: 1, loot: { id: 'skeleton_bone', chance: 0.15 }, rareLoot: { id: 'ingredientSkull', chance: 0.05 }, moveRange: 1, attackRange: 1.5, ai: 'standard' },
      { id: 'bat', name: 'Giant Bat', combatStyle: 'Finesse', hp: 15, atk: 6, minFloor: 2, dodgeChance: 0.33, loot: { id: 'ingredientBeak', chance: 0.2 }, moveRange: 2, attackRange: 1.5, ai: 'standard' },
      { id: 'slime', name: 'Slime', combatStyle: 'Martial', hp: 40, atk: 7, minFloor: 3, onDefeat: { type: 'split', into: 'ooze', count: 2 }, moveRange: 1, attackRange: 1.5, ai: 'standard', moveFrequency: 2, moveChance: 0.5 },
      { id: 'ooze', name: 'Ooze', combatStyle: 'Martial', hp: 20, atk: 5, minFloor: 3, moveRange: 1, attackRange: 1.5, ai: 'standard' },
      { id: 'skeleton_archer', name: 'Skeleton Archer', combatStyle: 'Finesse', hp: 25, atk: 10, minFloor: 4, isRanged: true, moveRange: 1, attackRange: 5, ai: 'ranged' },
      { id: 'cultist', name: 'Cultist', combatStyle: 'Arcane', hp: 30, atk: 12, minFloor: 5, isRanged: true, moveRange: 1, attackRange: 4, ai: 'ranged' },
      { id: 'shadow', name: 'Shadow', combatStyle: 'Finesse', hp: 50, atk: 12, minFloor: 6, abilities: [{ type: 'invisible', chance: 0.25, duration: 1 }], loot: { id: 'shadow_essence', chance: 0.25 }, moveRange: 1, attackRange: 1.5, ai: 'cowardly' },
      { id: 'golem', name: 'Stone Golem', combatStyle: 'Martial', hp: 80, atk: 15, minFloor: 8, armor: 5, loot: { id: 'golem_heart', chance: 0.5 }, moveRange: 1, attackRange: 1.5, ai: 'standard', moveFrequency: 2, moveChance: 0.33 },
      { id: 'keyholder_orc', name: 'Orc Keywarden', combatStyle: 'Martial', hp: 50, atk: 12, minFloor: 1, loot: { id: 'ingredientCrown', chance: 1.0 }, moveRange: 1, attackRange: 1.5, ai: 'standard' }
    ],

    bestiary: [
      { 
        id: 'goblin', name: 'Goblin Scavenger',
        icon: (
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <div className="w-10 h-10 text-lime-400 drop-shadow-lg" dangerouslySetInnerHTML={{ __html: `<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' x='0px' y='0px' viewBox='0 0 296.169 488.008' style='enable-background:new 0 0 296.169 488.008;' xml:space='preserve'><g fill="currentColor"><path d='M251.239,469.32l-15.584-6.922c-9.972-4.428-16.415-14.34-16.415-25.25v-26.795l-4.806,6.929   c-0.624,0.899-1.589,1.504-2.67,1.673c-1.086,0.169-2.185-0.112-3.053-0.779l-13.507-10.367l-11.098,13.85   c-0.71,0.887-1.763,1.429-2.896,1.493c-0.075,0.004-0.15,0.006-0.225,0.006c-1.055,0-2.07-0.417-2.822-1.165l-7.589-7.555   c1.909,14.146,4.522,36.294,3.186,42.971c-1.199,6.003-4.935,10.723-7.857,13.624c-1.914,1.901-2.969,4.37-2.969,6.952v0.399   c0,5.307,4.316,9.623,9.623,9.623h74.717c5.384,0,9.765-4.381,9.765-9.765C257.04,474.388,254.763,470.885,251.239,469.32z'/><path d='M167.754,400.341l12.896,12.839l10.762-13.43c1.358-1.7,3.829-2,5.557-0.672l13.284,10.196l9.7-13.986   c1.229-1.774,3.645-2.25,5.454-1.083l12.877,8.302l-15.488-61.351c-8.171-2.333-39.195-10.461-74.712-10.461   s-66.541,8.128-74.712,10.461l-15.488,61.351l12.877-8.302c1.809-1.167,4.224-0.691,5.454,1.083l9.7,13.986l13.284-10.196   c1.727-1.325,4.195-1.028,5.557,0.672l10.762,13.43l12.896-12.839c1.535-1.526,4.007-1.555,5.575-0.067l14.094,13.371   l14.094-13.371C163.749,398.786,166.22,398.814,167.754,400.341z'/><path d='M184.558,185.718c4.238-3.44,6.349-7.709,6.471-13.098c-2.208,0.679-4.517,1.039-6.88,1.039h-6.15   C178.914,178.902,181.067,182.899,184.558,185.718z'/><path d='M105.141,172.62c0.122,5.389,2.233,9.658,6.471,13.098c3.491-2.819,5.643-6.816,6.558-12.059h-6.15   C109.658,173.659,107.349,173.299,105.141,172.62z'/><path d='M172.128,239.8c21.341-8.008,38.856-24.864,46.748-38.017c2.561-4.269,4.979-9.923,7.186-16.808   c0.521-1.625,2.014-2.74,3.72-2.778c0.176-0.005,19.033-0.736,32.733-17.494c6.763-8.273,11.313-24.152,16.131-40.963   c4.774-16.659,9.689-33.807,17.523-47.553c-9.123,0.363-24.585,1.612-33.313,5.854c-10.613,5.158-17.107,15.558-18.826,18.58   c0.225,4.692,0.307,9.315,0.275,13.822c7.071-9.418,16.194-17.063,27.27-22.812c1.959-1.018,4.375-0.255,5.393,1.707   c1.019,1.961,0.254,4.375-1.707,5.393c-13.503,7.011-23.785,17.119-30.6,30.077c2.855,3.123,7.362,9.247,7.706,17.066   c0.506,11.487-8.201,18.826-8.571,19.133c-0.746,0.617-1.649,0.918-2.548,0.918c-1.15,0-2.293-0.494-3.084-1.45   c-1.408-1.702-1.17-4.224,0.532-5.632c0.044-0.037,6.006-5.174,5.679-12.617c-0.338-7.687-7.096-13.495-7.164-13.553   c-0.986-0.835-1.478-2.072-1.405-3.307l-0.014-0.001c2.049-33.403-0.863-78.914-26.371-106.034C194.859,7.85,174.224,0,148.085,0   s-46.774,7.85-61.336,23.332c-25.508,27.12-28.42,72.631-26.371,106.034l-0.011,0.001c0.076,1.241-0.419,2.483-1.42,3.317   c-0.057,0.048-6.814,5.856-7.152,13.543c-0.327,7.434,5.618,12.567,5.679,12.617c1.702,1.408,1.94,3.93,0.532,5.632   c-0.791,0.956-1.934,1.45-3.084,1.45c-0.898,0-1.802-0.301-2.548-0.918c-0.37-0.307-9.077-7.646-8.571-19.133   c0.344-7.819,4.851-13.943,7.706-17.066c-6.814-12.958-17.097-23.066-30.6-30.077c-1.961-1.018-2.726-3.432-1.707-5.393   c1.018-1.962,3.433-2.726,5.393-1.707c11.076,5.749,20.199,13.394,27.27,22.812c-0.032-4.507,0.049-9.13,0.275-13.823   c-1.714-3.013-8.209-13.419-18.826-18.579C24.575,77.794,9.119,76.547,0,76.186c7.835,13.747,12.749,30.894,17.524,47.555   c4.817,16.811,9.368,32.689,16.131,40.963c13.7,16.758,32.558,17.489,32.746,17.494c1.696,0.049,3.189,1.162,3.708,2.778   c2.206,6.885,4.624,12.539,7.185,16.808c7.894,13.154,25.41,30.011,46.752,38.018c2.068,0.776,3.116,3.082,2.34,5.15   c-0.603,1.605-2.127,2.596-3.746,2.596c-0.467,0-0.941-0.082-1.404-0.256c-9.799-3.676-18.859-9.09-26.707-15.197   c-16.247,13.932-32.635,39.116-45.308,69.772c-11.578,28.011-17.818,55.527-15.528,68.472c2.016,11.389,12.201,19.56,18.145,23.448   l29.308-116.096c0.54-2.142,2.71-3.442,4.857-2.898c2.142,0.54,3.439,2.715,2.898,4.857l-13.273,52.58   c12.399-3.27,40.336-9.533,72.458-9.533s60.059,6.263,72.458,9.533l-13.273-52.58c-0.541-2.143,0.757-4.317,2.898-4.857   c2.147-0.541,4.318,0.758,4.857,2.898l29.308,116.096c5.943-3.886,16.129-12.058,18.146-23.448   c2.29-12.944-3.95-40.461-15.528-68.472c-12.673-30.655-29.061-55.84-45.308-69.772c-7.847,6.106-16.905,11.519-26.703,15.196   c-0.463,0.174-0.938,0.256-1.404,0.256c-1.619,0-3.144-0.99-3.746-2.596C169.012,242.882,170.06,240.576,172.128,239.8z    M154.666,118.55c1.283-1.798,3.781-2.216,5.58-0.93l2.487,1.776c1.803,1.288,4.139,1.442,6.097,0.405l31.628-16.777   c1.95-1.038,4.373-0.292,5.407,1.659c1.035,1.951,0.293,4.372-1.659,5.407l-31.628,16.777c-2.047,1.086-4.269,1.623-6.48,1.623   c-2.815,0-5.613-0.87-8.015-2.585l-2.486-1.776C153.799,122.847,153.382,120.348,154.666,118.55z M192.632,141.16   c0,4.1-3.323,7.423-7.423,7.423c-4.1,0-7.423-3.323-7.423-7.423s3.323-7.423,7.423-7.423   C189.308,133.737,192.632,137.061,192.632,141.16z M90.305,104.684c1.034-1.951,3.456-2.697,5.407-1.659l31.628,16.777   c1.96,1.037,4.294,0.883,6.097-0.405l2.487-1.776c1.798-1.283,4.296-0.868,5.58,0.93s0.867,4.297-0.931,5.58l-2.487,1.776   c-2.4,1.715-5.199,2.585-8.014,2.585c-2.212,0-4.434-0.536-6.48-1.623l-31.628-16.777C90.012,109.056,89.27,106.635,90.305,104.684   z M118.402,141.16c0,4.1-3.323,7.423-7.423,7.423s-7.423-3.323-7.423-7.423s3.323-7.423,7.423-7.423   S118.402,137.061,118.402,141.16z M126.284,173.659c-1.268,9.254-5.515,16.104-12.667,20.389c-0.634,0.379-1.345,0.568-2.056,0.568   c-0.761,0-1.52-0.217-2.183-0.647c-9.064-5.901-13.184-14.666-12.033-25.453l-5.24-3.841c-1.782-1.307-2.168-3.81-0.862-5.591   c1.308-1.783,3.813-2.168,5.591-0.862l6.084,4.459c2.659,1.948,5.807,2.979,9.103,2.979h72.129c3.296,0,6.443-1.03,9.103-2.979   l6.084-4.459c1.78-1.303,4.284-0.92,5.591,0.862c1.306,1.781,0.92,4.284-0.862,5.591l-5.24,3.841   c1.151,10.787-2.969,19.552-12.033,25.453c-0.663,0.431-1.423,0.647-2.183,0.647c-0.711,0-1.422-0.189-2.056-0.568   c-7.152-4.285-11.399-11.135-12.667-20.389H126.284z'/><path d='M122.407,457.408c-1.335-6.676,1.278-28.823,3.187-42.97l-7.589,7.555c-0.805,0.8-1.907,1.211-3.047,1.159   c-1.134-0.064-2.187-0.606-2.896-1.493l-11.098-13.85l-13.507,10.367c-0.868,0.666-1.969,0.947-3.053,0.779   c-1.081-0.169-2.046-0.773-2.67-1.673l-4.806-6.929v26.795c0,10.91-6.443,20.822-16.414,25.25l-15.585,6.921   c-3.523,1.565-5.801,5.068-5.801,8.924c0,5.384,4.381,9.765,9.765,9.765h74.717c5.307,0,9.623-4.316,9.623-9.623v-0.399   c0-2.582-1.055-5.051-2.969-6.951C127.343,468.132,123.607,463.412,122.407,457.408z'/></g></svg>` }} />
          </div>
        ),
        description: 'Vicious and cowardly creatures that swarm the upper floors. They often travel in packs, overwhelming unsuspecting adventurers with sheer numbers.',
        abilities: 'A standard melee attacker. Weak alone, but can be dangerous in groups.'
      },
      { 
        id: 'skeleton', name: 'Skeleton',
        icon: (
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <div className="w-10 h-10 text-slate-300 drop-shadow-lg" dangerouslySetInnerHTML={{ __html: `<svg xmlns='http://www.w3.org/2000/svg' version='1.1' viewBox='-5.0 -10.0 110.0 135.0' fill="currentColor"> <path d='m55.238 20.16c1.2539-0.79297 2.207-1.9844 2.7109-3.3828 0.47656-1.3789 0.44531-2.8867-0.089844-4.2461-0.58203-1.4375-1.6172-2.6445-2.9492-3.4414-3.0234-1.8164-6.7969-1.8164-9.8203 0-1.332 0.79297-2.3672 2.0039-2.9492 3.4414-0.51172 1.332-0.50781 2.8086 0.003906 4.1406 0.57812 1.4648 1.6172 2.7031 2.957 3.5352 0.39063 0.25 0.625 0.67969 0.625 1.1445v2.918c0 0.011719 0.003907 0.019531 0.011719 0.027344 0.0625 0.046875 0.13672 0.070313 0.21484 0.066406h8.4219c0.050781 0.007813 0.10547-0.007812 0.14453-0.039062h0.007813c0.007812-0.011719 0.011718-0.03125 0.007812-0.050781v-2.9219c0-0.49609 0.26953-0.94922 0.70312-1.1914zm5.2812-2.5h-0.003906c-0.61719 1.7617-1.75 3.293-3.25 4.4023v2.2109-0.003907c0.003906 0.76562-0.30859 1.4961-0.86328 2.0234-0.54688 0.51562-1.2734 0.80469-2.0234 0.80078h-2.9492v1.2539l14.023-0.003906c0.58203 0 1.1016 0.37109 1.2891 0.92578l4.418 13 4.1289 4.5742c1.5664-0.42969 3.2188-0.42578 4.7852 0.011719 1.8789 0.53125 3.5352 1.6562 4.7266 3.207 0.43359 0.59375 0.31641 1.4297-0.26562 1.8789-0.58594 0.44922-1.4219 0.35547-1.8867-0.21875-0.83594-1.0859-1.9961-1.875-3.3164-2.25-0.85938-0.24219-1.7578-0.29297-2.6406-0.15625l1.0273 2.5664c0.16016 0.33594 0.17578 0.72656 0.039062 1.0781-0.13672 0.34766-0.41016 0.625-0.75781 0.76562-0.35156 0.14063-0.74219 0.13281-1.082-0.027343-0.33984-0.15625-0.60156-0.44922-0.71875-0.80469l-1.5-3.75-4.7461-5.2617c-0.13281-0.14844-0.23438-0.32422-0.29297-0.51172l-4.1797-12.301h-13.051v3.1094h11.234c0.75391 0 1.3672 0.60937 1.3672 1.3633 0 0.75391-0.61328 1.3633-1.3672 1.3633h-11.234v2.9766h8.3164c0.37109-0.011718 0.72656 0.12891 0.98828 0.38672 0.26562 0.25391 0.41406 0.60938 0.41406 0.97656 0 0.36719-0.14844 0.71875-0.41406 0.97656-0.26172 0.25781-0.61719 0.39453-0.98828 0.38672h-8.3164v2.9766h5.5352c0.36719-0.011719 0.72266 0.12891 0.98828 0.38672 0.26172 0.25391 0.41016 0.60938 0.41016 0.97656 0 0.36719-0.14844 0.71875-0.41016 0.97656-0.26562 0.25781-0.62109 0.39453-0.98828 0.38672h-5.5352v3.7578l4.3203-1.8711c1.7695-0.80078 3.8555-0.24219 4.9922 1.3359 1.1328 1.5742 0.99609 3.7344-0.32422 5.1562-0.80469 1.0078-1.4297 2.1484-1.8477 3.3711-0.43359 1.3008-0.64844 2.6641-0.64062 4.0352 0 0.042969 0 0.085938-0.007813 0.12891-0.011719 0.71484-0.22656 1.4141-0.625 2.0117-0.34766 0.51562-0.81641 0.94141-1.3633 1.2383l-0.12891 0.066407 2.8828 12.258c0.050781 0.21875 0.046875 0.44922-0.011719 0.66797l-2.4297 11.801h2.4414c0.36719-0.011719 0.72266 0.12891 0.98828 0.38672 0.26172 0.25391 0.41406 0.60938 0.41406 0.97656 0 0.36719-0.15234 0.71875-0.41406 0.97656-0.26562 0.25781-0.62109 0.39844-0.98828 0.38672h-4.1133c-0.089844 0-0.17969-0.007813-0.26953-0.027344-0.73438-0.15234-1.207-0.86719-1.0625-1.6016l2.7227-13.23-2.8984-12.336c-0.38281-0.10938-0.74219-0.27734-1.0742-0.49609l-0.085938-0.0625-0.51953-0.35547 0.003906 0.003906c-0.78906-0.48047-1.7812-0.46875-2.5586 0.023437l-0.69922 0.42578c-0.28906 0.1875-0.59766 0.33594-0.92578 0.4375l-2.9062 12.355 2.7227 13.23c0.14844 0.73438-0.32422 1.4531-1.0586 1.6016-0.089844 0.019531-0.17969 0.027344-0.27344 0.027344h-4.1133c-0.36719 0.011718-0.72266-0.12891-0.98828-0.38672-0.26562-0.25391-0.41406-0.60938-0.41406-0.97656 0-0.36719 0.14844-0.71875 0.41406-0.97656 0.26562-0.25781 0.62109-0.39453 0.98828-0.38672h2.4414l-2.4297-11.801c-0.058594-0.21875-0.0625-0.44922-0.011719-0.66797l2.8711-12.203c-0.078125-0.035156-0.15625-0.074219-0.23438-0.11719h0.003906c-0.55469-0.30078-1.0273-0.73047-1.3789-1.25-0.41797-0.63281-0.64062-1.375-0.62891-2.1328h-0.011719c0.003906-1.3398-0.22656-2.6719-0.67578-3.9336l-0.019532-0.0625v0.003906c-0.45312-1.2383-1.1016-2.3906-1.9258-3.4141-1.3242-1.4258-1.457-3.582-0.32422-5.1602 1.1367-1.5742 3.2227-2.1328 4.9922-1.332l4.4531 1.9336v-3.8164h-5.3984c-0.36719 0.011719-0.72656-0.12891-0.98828-0.38672-0.26562-0.25391-0.41406-0.60938-0.41406-0.97656 0-0.36719 0.14844-0.71875 0.41406-0.97656 0.26172-0.25781 0.62109-0.39844 0.98828-0.38672h5.3984v-2.9766h-8.1836c-0.36719 0.011719-0.72266-0.12891-0.98828-0.38672-0.26172-0.25391-0.41016-0.60938-0.41016-0.97656 0-0.36719 0.14844-0.71875 0.41016-0.97656 0.26562-0.25781 0.62109-0.39844 0.98828-0.38672h8.1836v-2.9766h-11.098c-0.75391 0-1.3672-0.60938-1.3672-1.3633 0-0.75391 0.61328-1.3633 1.3672-1.3633h11.098v-3.1094h-12.914l-4.1914 12.336c-0.058594 0.17578-0.15234 0.33594-0.27734 0.47656l-4.7695 5.2812-1.6289 3.7617c-0.13672 0.33984-0.40234 0.60547-0.74219 0.74609-0.33984 0.13672-0.71875 0.13672-1.0547-0.007813-0.33594-0.14844-0.59766-0.42187-0.73047-0.76172-0.12891-0.33984-0.11719-0.72266 0.035156-1.0547l1.1016-2.5352c-0.92578-0.13281-1.8672-0.074219-2.7656 0.17188-1.3516 0.35547-2.5469 1.1406-3.4141 2.2383-0.46875 0.55078-1.2891 0.63672-1.8633 0.19141-0.57422-0.44141-0.69922-1.2578-0.28516-1.8516 1.2266-1.5703 2.9297-2.6953 4.8516-3.2109 1.6133-0.4375 3.3125-0.44141 4.9297-0.007812l4.1289-4.5742 4.3906-12.918c0.16016-0.59375 0.69922-1.0078 1.3164-1.0078h13.883v-1.25h-2.7461c-0.75391-0.003906-1.4844-0.28516-2.0469-0.79297-0.57422-0.51953-0.90625-1.2578-0.90625-2.0312v-2.207c-1.5352-1.125-2.7148-2.668-3.3984-4.4453-0.74609-1.9492-0.74609-4.1055 0.003907-6.0547 0.79297-1.9961 2.2109-3.6758 4.0469-4.7852 3.9023-2.3711 8.7969-2.3711 12.699 0 1.8359 1.1094 3.2578 2.7891 4.0469 4.7852 0.76562 1.9531 0.80859 4.1133 0.125 6.0977zm-6.4492 47.559h-0.003906 0.13672c0.15234-0.015625 0.29688-0.058594 0.42969-0.13281 0.16016-0.085938 0.29688-0.21094 0.39844-0.36328 0.10547-0.16016 0.16797-0.33984 0.17969-0.53125v-0.10156 0.003906c-0.007813-1.6719 0.26172-3.3281 0.79297-4.9102 0.51953-1.5352 1.3047-2.9609 2.3203-4.2227 0.027343-0.039063 0.058593-0.074219 0.089843-0.10547 0.44922-0.47266 0.50391-1.1953 0.12891-1.7227-0.375-0.53125-1.0742-0.72266-1.668-0.45703l-4.875 2.1172c-0.59375 0.25781-1.2266 0.39844-1.8711 0.41406h-0.11719c-0.65625 0-1.3086-0.13281-1.9141-0.38281l-0.085937-0.03125-4.8711-2.1172h0.003906c-0.59375-0.26953-1.2969-0.082031-1.6719 0.44922-0.375 0.53516-0.32031 1.2578 0.12891 1.7266l0.074219 0.085938c1.0312 1.2695 1.8398 2.7031 2.4023 4.2383l0.027344 0.066407h-0.003907c0.55469 1.5586 0.83984 3.1953 0.83594 4.8477v0.015625c-0.003906 0.21484 0.058594 0.42188 0.17578 0.60156 0.20703 0.30469 0.54297 0.49609 0.91016 0.51953h0.125c0.18359-0.015624 0.35937-0.074218 0.50781-0.17187l0.070312-0.046876 0.64453-0.38672c1.6758-1.0859 3.8359-1.0938 5.5195-0.019532l0.078125 0.050782 0.48828 0.33594 0.0625 0.039063c0.16406 0.11328 0.35938 0.17969 0.55859 0.1875zm-6.25-51.438c0 0.20312-0.078124 0.39453-0.22266 0.53906-0.30078 0.27734-0.76562 0.26563-1.0547-0.023437-0.28906-0.28906-0.29688-0.75781-0.019531-1.0547 0.21875-0.21875 0.54687-0.28516 0.83203-0.16797 0.28516 0.11719 0.46875 0.39844 0.46875 0.70312zm1.707-2.4648c0.17969 0.17969 0.33594 0.37891 0.47266 0.58984 0.13672-0.21094 0.29297-0.41016 0.47266-0.58984 1.3242-1.3242 3.4609-1.3633 4.832-0.082031l0.09375 0.085937v-0.003906c0.65234 0.65234 1.0195 1.5391 1.0195 2.4648 0 0.92188-0.36719 1.8086-1.0195 2.4609-0.65234 0.65234-1.5391 1.0234-2.4609 1.0234s-1.8086-0.37109-2.4609-1.0234h-0.007812 0.003906c-0.17969-0.17969-0.33594-0.375-0.47266-0.58594-0.13672 0.21484-0.29688 0.41016-0.47656 0.58984-0.64844 0.67188-1.543 1.0508-2.4766 1.0586-0.93359 0.007812-1.8281-0.35938-2.4883-1.0195s-1.0273-1.5586-1.0195-2.4922c0.007813-0.93359 0.39063-1.8242 1.0625-2.4766 0.65234-0.65234 1.5352-1.0195 2.4609-1.0195 0.92188 0 1.8086 0.36719 2.4609 1.0195zm-1.9727 9.7695 1.3008-2.3359-0.003907 0.003906c0.22266-0.44531 0.66406-0.73047 1.1602-0.75 0.49219-0.023437 0.96094 0.22656 1.2188 0.64844l1.4062 2.3008c0.29688 0.41406 0.33594 0.96094 0.10156 1.4141-0.23047 0.45703-0.69922 0.74219-1.2109 0.74219h-2.7891c-0.48047 0-0.92578-0.25391-1.168-0.67188-0.24609-0.41406-0.25391-0.92578-0.019531-1.3477zm6.1445-7.3047c0.007812 0.20703-0.066407 0.40625-0.21094 0.55469-0.14453 0.14844-0.33984 0.23437-0.54688 0.23437-0.20703 0-0.40234-0.085937-0.54688-0.23437-0.14062-0.14844-0.21875-0.34766-0.21094-0.55469 0-0.19922 0.078125-0.39453 0.22266-0.53516 0.28125-0.27734 0.73047-0.29297 1.0352-0.039063l0.039063 0.039063c0.14062 0.14453 0.21875 0.33594 0.21875 0.53516z' fill-rule='evenodd'/></svg>` }} />
          </div>
        ),
        description: 'The reanimated bones of fallen warriors, cursed to guard the dungeon for eternity. They feel no pain and know no fear, marching endlessly.',
        abilities: 'Slightly tougher than a Goblin. Their bony forms make them resilient, but they are slow to react.'
      },
      {
        id: 'bat', name: 'Giant Bat',
        icon: (
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <div className="w-10 h-10 text-slate-500 drop-shadow-lg" dangerouslySetInnerHTML={{ __html: `<svg xmlns='http://www.w3.org/2000/svg' version='1.1' viewBox='-5.0 -10.0 110.0 135.0' fill="currentColor"> <path d='m37.23 47.188 3.1719-1.1875c-0.26172 0.89844-0.625 1.4727-1.0781 1.6562-0.47656 0.19922-1.1953 0.035156-2.0938-0.46875zm-25.234 5.9375c0.43359 12.23 5.918 18.414 15.617 24.461-0.4375-1.9297-0.14062-3.9844 0.90625-5.832 1.1953-2.1094 3.168-3.5469 5.5-4.125-10.414-4.6992-17.672-9.4727-22.023-14.504zm25.621 4.3555c-0.625-0.5-1.2344-1.0312-1.8164-1.6172-1.4688-1.4648-2.7148-3.1406-3.6719-4.9141-8.8516 3.4492-13.875 0.35938-21.977-4.6797-4.6328 4.9258-5.2617 11.918-4.9531 17.008 0.6875 11.328 6.668 24.504 14.062 31.59-0.67969-4.1406-0.12891-7.6992 1.6406-10.414 1.4219-2.1875 3.6172-3.793 6.3164-4.6641-4.5703-2.7773-9.125-6.0273-12.363-10.613-3.5508-5.0352-5.168-11.301-4.9453-19.152 0.015625-0.45313 0.31641-0.84375 0.75391-0.96875 0.4375-0.12891 0.90234 0.046874 1.1562 0.42187 3.7969 5.7188 11.52 11.117 23.582 16.5-0.34766-1.4609-0.36328-3.0117-0.015625-4.4844 0.37891-1.6172 1.1641-3.0117 2.2305-4.0117zm25.652-52.281c-5.0898-0.30859-12.082 0.32422-17.008 4.9531 5.0391 8.1055 8.1289 13.129 4.6797 21.98 1.7773 0.95703 3.4492 2.2031 4.918 3.668 0.57812 0.58203 1.1133 1.1875 1.6172 1.8164 1.0039-1.0625 2.3945-1.8477 4-2.2266 1.6055-0.37891 3.3086-0.32422 4.8828 0.12109-5.4297-12.258-10.883-20.094-16.652-23.93-0.375-0.25-0.54688-0.71875-0.42578-1.1562 0.12891-0.43359 0.51953-0.73828 0.96875-0.75 7.8594-0.22266 14.121 1.3906 19.156 4.9453 4.5273 3.1953 7.7578 7.6758 10.516 12.191 0.89844-2.5117 2.4453-4.5547 4.5234-5.9062 2.7148-1.7656 6.2734-2.3164 10.414-1.6367-7.082-7.3984-20.262-13.375-31.59-14.07zm-9.9023 6.5547c4.9961 4.3203 9.7305 11.496 14.391 21.777 0.65234-2.1172 2.0312-3.8945 3.9922-5.0078 1.9922-1.1328 4.2344-1.3867 6.3008-0.78906-6.1172-9.9219-12.305-15.539-24.684-15.98zm6.207 35.828c0.39844 3.625-0.62109 6.8672-2.875 9.1211-4.7227 4.7227-13.438 3.6875-19.43-2.3047-1.8203-1.8203-3.2578-3.9844-4.1602-6.2578-0.058594-0.14844-0.14844-0.28516-0.27344-0.39062-2.3555-2.1016-4.7148-5.25-7.0156-9.3672 2.1211 0.17188 3.8945 0.58594 5.2891 1.2422 0.26953 0.125 0.58203 0.12891 0.85938 0.007812 0.27344-0.12109 0.48438-0.35156 0.57422-0.64062 0.49609-1.5547 1.3086-2.9062 2.4219-4.0273 1.1172-1.1133 2.4688-1.9297 4.0312-2.4219 0.28516-0.089844 0.51562-0.30078 0.63672-0.57422 0.12109-0.27734 0.11719-0.58984-0.011718-0.85938-0.64844-1.3945-1.0625-3.168-1.2344-5.2891 4.1133 2.3008 7.2578 4.6602 9.3633 7.0156 0.10547 0.12109 0.24219 0.21484 0.39453 0.27344 2.2734 0.90234 4.4336 2.3438 6.2539 4.1602 2.9258 2.9375 4.7656 6.5938 5.1758 10.312zm-16.773-3.082c0.042969-0.35938-0.10547-0.71484-0.39453-0.9375-0.28516-0.22266-0.66406-0.28125-1.0039-0.15234l-6.7734 2.5273c-0.35156 0.13281-0.60547 0.44141-0.66406 0.8125s0.085937 0.74219 0.38281 0.97656c1.7617 1.3984 3.2578 2.0898 4.5391 2.0898 0.4375 0 0.85156-0.078125 1.2383-0.23828 1.4844-0.61328 2.3555-2.2734 2.6758-5.0781zm0.75781-2.0898c0.20312 0.25391 0.50391 0.39844 0.82031 0.39844 0.039063 0 0.078125 0 0.12109-0.003906 2.8008-0.32031 4.4648-1.1953 5.0781-2.6758 0.63281-1.5273 0.027344-3.4141-1.8516-5.7773-0.23047-0.29297-0.60547-0.4375-0.97656-0.37891s-0.67969 0.3125-0.8125 0.66406l-2.5273 6.7734c-0.13281 0.33594-0.074218 0.71484 0.14844 1zm11.906 1.5742c-0.53516-0.21094-1.1367 0.054687-1.3516 0.58594-1.6133 4.0977-5.4492 7.9336-9.5391 9.543-0.53516 0.21094-0.79688 0.81641-0.58984 1.3477 0.16406 0.41406 0.55859 0.66016 0.96875 0.66016 0.12891 0 0.25391-0.023438 0.38281-0.074219 1.0078-0.39453 2-0.91406 2.957-1.5312l1.1992 1.1992c0.20703 0.20703 0.46875 0.30469 0.73828 0.30469 0.26562 0 0.53125-0.097656 0.73438-0.30469 0.41016-0.40234 0.41016-1.0625 0-1.4688l-0.96484-0.96484c1.2031-0.96484 2.3164-2.0781 3.2891-3.2812l0.96094 0.96484c0.20312 0.20312 0.46875 0.30469 0.73438 0.30469 0.26953 0 0.53125-0.10156 0.73828-0.30469 0.40234-0.41016 0.40234-1.0625 0-1.4727l-1.2031-1.1992c0.61719-0.95703 1.1328-1.9492 1.5312-2.9609 0.20703-0.53125-0.054687-1.1367-0.58594-1.3477zm-7.8086-4.6523c0.19922-0.47656 0.03125-1.1992-0.46875-2.0977l-1.1836 3.1758c0.89844-0.26562 1.4648-0.63281 1.6523-1.0781z'/></svg>` }} />
          </div>
        ),
        description: 'Erratic creatures of the dark. Their rapid, unpredictable movements make them difficult to hit, but they are fragile if a blow connects.',
        abilities: 'Low health, but has a 33% chance to completely dodge an incoming attack.'
      },
      {
        id: 'slime', name: 'Corrosive Slime',
        icon: (
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <div className="w-10 h-10 text-green-400 drop-shadow-lg" dangerouslySetInnerHTML={{ __html: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 75' x='0px' y='0px' fill="currentColor"><path d='M51.525,49.463C49.089,48.476,45,46.064,45,41V28a10.986,10.986,0,0,0-4-8.479V13.315a7,7,0,1,0-6,0v3.736c-.33-.03-.662-.051-1-.051H26c-.338,0-.67.021-1,.051V13.315a7,7,0,1,0-6,0v6.206A10.986,10.986,0,0,0,15,28V41c0,5.063-4.088,7.476-6.527,8.464a4.045,4.045,0,0,0-.07,7.424C11.091,58.05,17.472,60,30,60s18.909-1.95,21.6-3.113a4.046,4.046,0,0,0-.075-7.424ZM38,2a4.977,4.977,0,0,1,3.974,2H34.026A4.977,4.977,0,0,1,38,2Zm1,5a1,1,0,1,1-1-1A1,1,0,0,1,39,7ZM33,7a5,5,0,0,1,.1-1h2.083A2.966,2.966,0,0,0,35,7a3,3,0,0,0,6,0,2.966,2.966,0,0,0-.184-1H42.9A5,5,0,1,1,33,7Zm4,6.92a6.29,6.29,0,0,0,2,0v4.294a10.9,10.9,0,0,0-2-.787ZM22,2a4.977,4.977,0,0,1,3.974,2H18.026A4.977,4.977,0,0,1,22,2Zm1,5a1,1,0,1,1-1-1A1,1,0,0,1,23,7ZM17,7a5,5,0,0,1,.1-1h2.083A2.966,2.966,0,0,0,19,7a3,3,0,0,0,6,0,2.966,2.966,0,0,0-.184-1H26.9A5,5,0,1,1,17,7Zm4,6.92a6.29,6.29,0,0,0,2,0v3.507a10.9,10.9,0,0,0-2,.787ZM50.8,55.052C48.257,56.153,42.168,58,30,58S11.743,56.153,9.2,55.053a2.046,2.046,0,0,1,.026-3.737A13.721,13.721,0,0,0,15,47.105V52a1,1,0,0,0,2,0V28a9.01,9.01,0,0,1,9-9h8a9.01,9.01,0,0,1,9,9V52a1,1,0,0,0,2,0v-4.9a13.707,13.707,0,0,0,5.773,4.21,2.047,2.047,0,0,1,.031,3.737Z'/><path d='M27,44a3,3,0,1,0-3,3A3,3,0,0,0,27,44Zm-3,1a1,1,0,1,1,1-1A1,1,0,0,1,24,45Z'/><path d='M30,47a4,4,0,1,0,4,4A4,4,0,0,0,30,47Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,30,53Z'/><path d='M37,42a3,3,0,1,0,3,3A3,3,0,0,0,37,42Zm0,4a1,1,0,1,1,1-1A1,1,0,0,1,37,46Z'/><path d='M21.553,28.9A7.278,7.278,0,0,0,23,29.361V32a7,7,0,0,0,14,0V29.361a7.278,7.278,0,0,0,1.447-.466,1,1,0,0,0,.448-1.328,1.009,1.009,0,0,0-1.331-.467c-.019.008-1.987.9-7.564.9-5.517,0-7.5-.872-7.563-.9a1,1,0,0,0-.884,1.794ZM35,32a5,5,0,0,1-10,0V29.715c.582.076,1.24.144,2,.193V32a2,2,0,0,0,2,2h2a2,2,0,0,0,2-2V29.908c.76-.049,1.418-.117,2-.193Zm-4-2.01V32H29V29.99c.322.006.653.01,1,.01S30.678,30,31,29.99Z'/></svg>` }} />
          </div>
        ),
        description: 'A gelatinous blob that patrols the damp corridors. It seems simple, but its form is unstable and can break apart under stress.',
        abilities: 'When defeated, it splits into two smaller "Ooze" enemies in adjacent tiles.'
      },
      {
        id: 'skeleton_archer', name: 'Skeleton Archer',
        icon: (
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <div className="w-10 h-10 text-slate-400 drop-shadow-lg" dangerouslySetInnerHTML={{ __html: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill="currentColor"><g><path d='M57.8,35.1c3.9,0,7.1-3.2,7.1-7.1s-3.2-7.1-7.1-7.1s-7.1,3.2-7.1,7.1S53.9,35.1,57.8,35.1z M57.8,23.9 c2.3,0,4.1,1.8,4.1,4.1s-1.8,4.1-4.1,4.1s-4.1-1.8-4.1-4.1S55.5,23.9,57.8,23.9z'/><path d='M45.1,58.6c0.1,0,0.1,0,0.2,0c0.8,0,1.4-0.6,1.5-1.3c0.4-3.7,2.1-13.9,4.7-17.4c0.3-0.4,0.4-0.9,0.2-1.3 c-0.1-0.5-0.5-0.8-1-1l-22.3-7.6c0.4-1,0.9-2,1.4-2.9c6.2-10.7,18-13.6,18.1-13.6c0.8-0.2,1.3-1,1.1-1.8c-0.2-0.8-1-1.3-1.8-1.1 c-0.5,0.1-13.2,3.2-20,15c-5,8.7-5.5,19.7-1.5,32.8c0.2,0.6,0.8,1.1,1.4,1.1c0.1,0,0.3,0,0.4-0.1c0.8-0.2,1.2-1.1,1-1.9 c-2.9-9.4-3.3-17.7-1.3-24.6l20.6,7c-2.9,5.7-4.2,16.7-4.3,17.2C43.7,57.8,44.3,58.5,45.1,58.6z'/><path d='M63.1,41c-0.1-0.1-0.2-0.1-0.3-0.1c-0.1,0-0.2,0-0.3-0.1h0c0,0,0,0,0,0c-0.7-0.2-1.4,0.2-1.7,0.9 c-0.1,0.3-0.1,0.5,0,0.8c-0.3,1.4-2.9,7.9-3.4,9.2c-2.2,5.1-5.3,8.8-9.6,11.5c-1,0.6-2,1.2-3.1,1.8c-3.4,2-6.8,4-9.7,7.1 c-4.3,4.7-6,11.2-6.6,15.9c-0.1,0.8,0.5,1.6,1.3,1.7c0.1,0,0.1,0,0.2,0c0.7,0,1.4-0.5,1.5-1.3c0.6-4.2,2.1-10.1,5.9-14.3 c2.5-2.7,5.7-4.6,9-6.5c1-0.6,2.1-1.2,3.1-1.9c4.8-3,8.2-7.1,10.7-12.8c1.7-4,2.7-6.6,3.2-8.3c3.3,2,10.3,7.3,10.6,16.4 c0,0.8,0.7,1.5,1.5,1.4c0.8,0,1.5-0.7,1.4-1.5C76.4,48.1,65.1,41.9,63.1,41z'/><path d='M59.6,89.6c0.3,0,0.7-0.1,1-0.3c0.6-0.5,0.7-1.5,0.2-2.1c-7.5-9.1-9-17.6-9-17.7c-0.1-0.8-0.9-1.4-1.7-1.2 c-0.8,0.1-1.4,0.9-1.2,1.7c0.1,0.4,1.6,9.4,9.6,19.2C58.7,89.4,59.1,89.6,59.6,89.6z'/></g></svg>` }} />
          </div>
        ),
        description: 'A more cunning form of undead, this skeleton retains its martial skill with the bow, firing bone-tipped arrows from a distance.',
        abilities: 'A ranged attacker. It will retaliate against your attacks even from several tiles away.'
      },
      {
        id: 'shadow', name: 'Lurking Shadow',
        icon: (
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <div className="w-10 h-10 text-violet-400 drop-shadow-lg" dangerouslySetInnerHTML={{ __html: `<svg xmlns='http://www.w3.org/2000/svg' version='1.1' viewBox='-5.0 -10.0 110.0 135.0' fill="currentColor"> <path d='m45.883 0.10938c-0.43359 0.039063-2.043 0.16797-3.5742 0.28906-2.8359 0.22656-4.3086 0.55469-9.2109 2.043-4.3789 1.332-6.5977 2.3906-12.281 5.8594-2.0859 1.2734-5.9336 4.6797-8.5391 7.5586-1.6484 1.8242-3.7891 4.957-5.8398 8.5391-2.1953 3.8438-4.2539 9.3008-5.7383 15.242-0.69141 2.7617-0.70703 2.918-0.69922 8.0352 0.011719 6.0273 0.085938 6.6211 1.5977 12.637 1.2539 4.9961 2.6367 8.4727 5.0312 12.688 2.1797 3.8398 6.2891 9.0781 9.1992 11.734 1.457 1.3281 6.2812 4.8164 8.9375 6.4609 6.8125 4.2109 13.883 6.918 21.582 8.2578 3.3438 0.58203 8.707 0.72266 12.07 0.3125 5.0703-0.61328 12.66-3.2773 19.535-6.8477l3.5469-2.418 3.4492-3.1914c5.168-5.2695 8.7227-10.152 11.594-15.914 3.7344-7.4922 4.5547-19.875 1.918-28.938-1.793-6.1562-4.7109-10.922-9.5234-15.555-2.5156-2.418-5.1953-5.1836-9.3008-7.3047-1.3789-0.71094-2.2109-0.98047-3.6367-1.5977-1.8984-0.82031-2.918-0.90625-4.875-2.0664-2.2773-1.3516-2.6562-1.7109-2.6562-2.5156 0-0.80859 0.6875-1.5117 2.6211-2.668 5.5508-3.3242 7.8867-4.7578 8.2578-5.0664 0.32422-0.27344 0.39453-0.51562 0.28125-1-0.33203-1.4023-1.4531-1.3125-4.6758 0.375-4.5117 2.3633-12.566 6.2227-16.055 7.6992-1.8711 0.78906-3.5156 1.5234-3.6484 1.625-0.13672 0.10547-2.3594 1.0352-4.9414 2.0703-6.4805 2.5938-9.1367 4.1914-13.539 8.1367-5.0742 4.5547-7.4805 7.9297-9.1797 12.895-1.0742 3.1328-1.3867 5.2305-1.1211 7.4766 0.37109 3.1367 0.89062 5.1445 1.5664 6.0547 0.33984 0.46094 0.79297 1.3984 1.0078 2.0898 0.43359 1.3867 1.0664 2.1914 2.1289 2.6992 0.43359 0.20703 0.75391 0.55078 0.83984 0.90625 0.28516 1.1914 0.37891 1.332 1.0898 1.6445 0.56641 0.25 0.78906 0.52734 0.99219 1.2383 0.35156 1.2109 1.4648 1.9141 3.3281 2.0938l1.3477 0.12891 0.91797-1.0156c2.0195-2.2266 4.293-6.3359 4.7539-8.5898 0.097656-0.49219 0.33984-0.78125 0.84766-1.0195 0.38672-0.18359 1.2227-0.71875 1.8555-1.1914 0.99219-0.74609 1.1953-1.0312 1.5117-2.1133 0.19922-0.69141 0.41016-1.7227 0.46875-2.2969 0.09375-0.95703 0.21094-1.1328 1.4219-2.1562 1.4609-1.2344 4.0547-2.4805 5.5508-2.6719 0.53125-0.066407 1.3984-0.015625 1.9258 0.11719 1.0195 0.25391-0.64453 1.6523-0.14453 3.2031 0.41016 1.2695 1.168 1.9492 2.5391 2.2734l3.1953-0.71875 0.18359 1.125c0.21875 1.3516 0.085937 2.7812-0.29688 3.2109-0.15625 0.17188-0.57812 0.3125-0.94531 0.3125-0.53906 0-0.71875 0.13281-0.98828 0.72656l-0.77734 2.0469-0.45312 1.457c0 0.87109 0.097656 1.0156 1.6602 2.4727 0.91406 0.84766 2.3789 2.1641 3.2578 2.918 1.3242 1.1445 1.6562 1.5664 1.9609 2.5078 1.1328 3.4844 0.98828 9.2773-0.30078 12.062-1.5391 3.3398-4.9883 6.6953-8.6094 8.3789-2.8594 1.332-5.7383 2.0898-8.4688 2.2227-4.3281 0.21484-7.7695-0.43359-14.617-2.7539-6.9922-2.3672-14.957-8.832-19.02-15.434-4.7383-7.707-6.6797-13.961-6.6797-21.539 0-4.2148 0.25391-6.457 1.2422-11.035 0.84375-3.9023 1.4961-5.4883 4.4336-10.754 1.2539-2.2422 2.1641-3.5 4.4609-6.1562 1.5859-1.8398 3.7422-4.0547 4.7891-4.9258 4.8594-4.043 11.695-7.2852 18.387-8.7148 3.8008-0.80859 7.2773-1.2969 9.2617-1.293 2.0234 0 2.6875-0.29688 2.7852-1.2422 0.12109-1.1719-0.21094-1.2617-4.4648-1.2227-2.0586 0.015625-4.0977 0.0625-4.5312 0.10156z' fill-rule='evenodd'/></svg>` }} />
          </div>
        ),
        description: 'A being of pure darkness that flickers and fades in the torchlight. It is hard to keep track of and can vanish from sight entirely.',
        abilities: 'Has a chance each turn to become invisible, making it untargetable for one turn.'
      },
       {
        id: 'golem', name: 'Stone Golem',
        icon: (
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <div className="w-10 h-10 text-stone-500 drop-shadow-lg" dangerouslySetInnerHTML={{ __html: `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' fill="currentColor"><path d='M316.18 22.05c-28.8.16-57.27 6.13-85.46 17.92-2.34 12.94-6.77 28.27-16.64 41.56-10.4 13.07-26.07 23.34-50.12 23.3-22.8 26.9-33.58 56.57-32.8 87.37-10.23 9.27-21.48 18.86-33.32 26.92-13.04 9.1-27.1 16.65-42.52 20.65-7.57 14.78-13.3 30.26-16.97 46.21 14.6 2.65 28.5 9.86 38.72 22.05 6.18 7.4 10.32 15.53 12.94 24.03 14.84 1.52 28.74 7.07 40.26 18.1 6.1 5.84 10.88 12.43 14.33 19.56 12.12-1.12 23.28 2.37 33.06 7.7 4.06 2.2 7.82 4.75 11.34 7.56 12.1-5.58 26.28-8.6 43.3-6.62 24.52-25.6 54.84-45.2 88.3-58.82 5.52-26.03 6.95-51.65 4.97-76.22-13.38-6.4-26.7-16.23-39.06-30.26-20.67-23.53-35.57-54.06-46.97-86.33-1.47-2.1-2.8-4.2-4.04-6.27 17.1-2.06 34.08-5.86 50.82-11.5-2.7-4.93-5.3-10.16-7.77-15.7 26.8 2.48 54.08-1.15 81.36-9.9 3.38-4.6 6.7-9.38 9.88-14.36-8.6-14.87-11.64-31.55-10.36-49.63-7.26-.22-14.56-.42-21.84-.36zm106.06 39.16c-6.66 1.1-13.18 3.1-19.26 6.05-17.2 8.45-29.14 24.22-35.73 42.06-1.68 4.6-2.93 9.28-3.73 13.96 10.23 16.84 23.38 31.73 38.66 44.28 3.16 2.65 6.43 5.14 9.78 7.48 16.57-2.8 32.92-10.03 46.14-22.4 9.46-8.87 16.64-19.42 21.5-30.83-7.72-12.96-18.55-23.92-31.5-31.7-7.87-4.73-16.4-8.04-25.28-9.86-1.71-.35-3.44-.66-5.16-.88-1.05-.13-2.1-.25-3.16-.32-.1-.02-.2-.02-.3-.02-.98-.06-1.96-.08-2.94-.08zm64.3 121.74c-14.64 6.57-28.38 13.45-41.62 20.6-10.98 5.96-21.5 12.05-31.56 18.3 5.3 9.13 8.6 18.9 9.6 28.67 13.18 1.22 27.5 4.76 41.64 11.58 4.8-10.1 11.66-19.1 19.94-26.5-1.35-16.44.26-33.18 2-52.65zm-94.02 55.07c-2.38 10.5-6.62 20.57-12.78 29.3-5.94 8.42-13.47 15.3-22.07 20.43.9 24.07-.1 48.8-5.4 74.72 12.27 3.76 24.28 8.45 35.92 14.1 6.06-6.9 13.8-12.23 22.3-15.84-1.52-17.35-.77-36.27 5.9-53.77 6.63-17.36 18.4-33.42 37.22-44.5-4.58-9.5-8.26-19.06-10.22-28.67-16.63 3.02-33.4 3.4-50.87 4.23zm-100.57 76.6c-9.55 7.43-19.12 15.46-28.22 24.12 7.27-.1 13.37 1.4 18.6 3.73 3.5-4.1 6.58-8.56 9.1-13.36 3.68-6.85 5.78-9.94.52-14.5zM44.1 390.67c-4.62 12.43-7.65 25.52-8.73 39.05 8.93 2.14 17.66 5.85 25.42 11.35 11.5-7.5 24.53-10.7 37.1-10.5-2.6-9.05-7.14-17.66-13.97-23.72-7.8-6.84-17.4-10.42-26.8-11.38-4.65-.47-9.17-.3-13.05.2zm97.78 34.36c-3.7 6.05-6.4 12.8-7.6 20-1.53 9.05-.26 17.88 3.12 25.67 8.6-1.5 17.47-1.4 26.32.93 7.22 1.88 13.73 5.23 19.26 9.62 6.6-6.82 14.72-11.5 23.26-13.97-1.94-2.92-4.1-5.63-6.6-8-8.26-7.9-19.4-11.78-30.14-10.57-.3.04-.6.08-.9.1-6.94-7.66-16.25-12.73-26.72-13.78zm94.07 34.77c-6.17 5.46-11.35 11.96-14.7 19.35-2.44 5.28-3.75 10.82-4.13 16.3 9.97 2.77 20.37 7.64 29.22 15.55 4.84-1.82 9.62-3.05 14.38-3.57-1.73-10.5-.72-21.1 2.73-31.3-11.9-1.8-20.97-7.04-27.5-16.33z'/></svg>` }} />
          </div>
        ),
        description: 'An animated construct of rock and ancient magic. It is incredibly durable and its heavy fists can shatter bone with ease.',
        abilities: 'Very high health and damage. Its rocky hide acts as armor, reducing all incoming damage.'
      },
      { 
        id: 'keyholder_orc', name: 'Orc Keywarden',
        icon: (
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <div className="w-10 h-10 text-emerald-500 drop-shadow-lg" dangerouslySetInnerHTML={{ __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor"><g><path d="M55.4,63.3c-0.1,0.2-0.3,0.4-0.4,0.6c0.2,0.7,0.6,1.9,1.5,3c1,1.1,2.1,1.7,2.6,1.9c0,0.5,0.1,1.5-0.4,2.6 c-0.7,1.7-1.9,2.6-2.4,2.8c0.7,1.2,1.7,3.2,2.2,5.7c0.7,4.1-0.2,7.4-0.8,8.9h19.3v-1.7c-1.8-0.4-4-1-6.4-2.1 c-1.5-0.7-2.8-1.4-3.9-2.1c1.5-1.6,3.7-4.6,5.1-8.7c0.8-2.4,1-4.5,1.1-6.2c-2.5-6.5-4.9-10-6.9-12c-0.3-0.3-0.7-0.7-1.2-1.4 c-1.8,1.1-3.6,2.4-5.2,3.9C58.1,59.9,56.6,61.5,55.4,63.3z"/><path d="M61.5,41.5c-0.4-1-0.6-2.1-0.7-3.2c-0.1-1.1,0.1-2.2,0.3-3.3c0.2-1.1,0.6-2.1,0.9-3.1c0.3-1,0.6-2,0.9-3.1 c0.3-1,0.6-2.1,0.9-3.1l1.6-6.2c-1.4,0-2.5,0.2-3.5,0.3c-0.3,1.8-0.8,3.5-1.3,5.2c-0.5,1.7-1.1,3.4-1.8,5.1 c-0.7,1.7-1.5,3.3-2.4,4.8c-0.9,1.6-1.8,3.1-2.8,4.6c-1,1.5-2.2,2.9-3.5,4.2c-1.3,1.3-2.6,2.5-4.1,3.5c-2.9,2.1-6.2,3.7-9.6,4.9 c-0.4,1-1,1.8-1.4,2.4c-0.5,0.6-0.9,1.1-1.2,1.4c-1.9,2-4.4,5.5-6.9,12c0.1,1.7,0.3,3.8,1.1,6.2c1.3,4.2,3.6,7.1,5.1,8.7 c-1.1,0.7-2.4,1.4-3.9,2.1c-2.4,1.1-4.5,1.7-6.4,2.1v1.7h19.3c-0.6-1.6-1.5-4.9-0.8-8.9c0.5-2.5,1.4-4.4,2.2-5.7 c-0.5-0.3-1.7-1.2-2.4-2.8c-0.4-1.1-0.4-2-0.4-2.6c0.6-0.3,1.7-0.8,2.6-1.9c0.9-1,1.3-2.2,1.5-3c-0.1-0.2-0.3-0.4-0.4-0.6 c-1.2-1.8-2.7-3.4-4.3-4.8c-1.6-1.5-3.4-2.7-5.2-3.9c0.5,0.3,1,0.5,1.4,0.8c0.5,0.3,0.9,0.6,1.4,0.9c0.9,0.6,1.8,1.2,2.6,1.9 c1.7,1.4,3.2,3,4.5,4.7c0.1,0.2,0.3,0.4,0.4,0.5c0.5,0.7,1,1.5,1.4,2.2c0.5,1,1,1.9,1.4,3c0.7,1.6,1.2,3.2,1.7,4.9 c0.5-1.7,1-3.3,1.7-4.9c0.4-1,0.9-2,1.4-3c0.4-0.8,0.9-1.5,1.4-2.2c0.1-0.2,0.3-0.4,0.4-0.5c1.3-1.8,2.8-3.3,4.5-4.7 c0.8-0.7,1.7-1.3,2.6-1.9c0.5-0.3,0.9-0.6,1.4-0.9c0.5-0.3,0.9-0.5,1.4-0.8c-0.7-0.9-1.4-2-1.9-3.6c-0.2-0.7-0.7-2.5-0.5-4.7 c0.1-0.7,0.2-1.3,0.4-1.9c-0.3-0.4-0.6-0.9-0.8-1.4C61.9,42.5,61.7,42,61.5,41.5z"/><path d="M97.6,69c-3.7-5.5-5-10.2-5.5-13.5c-0.5-3.3-0.4-6.2-2.5-9.1c-1.8-2.6-4.5-3.8-6.4-4.5c-0.2-1.4-0.7-3.5-1.9-5.6 c-0.8-1.5-1.7-2.7-2.5-3.6c0.1-0.9,0.7-5.7-2.5-9.3c-2.2-2.4-5.1-3-7.2-3.4c-1.3-0.3-2.5-0.4-3.6-0.4c-0.3,2.1-0.6,4.2-1.1,6.3 c-0.4,2.1-1,4.2-1.6,6.2c-0.3,1-0.7,2-0.9,3.1c-0.1,0.5-0.2,1-0.3,1.5c-0.1,0.5-0.1,1-0.1,1.6c0,2.1,0.7,4.2,1.6,6.1 c1.2-3.7,4.3-5.9,5-6.3c0.8,1.5,1.9,3.2,3.2,5c1.3,1.8,2.7,3.2,3.9,4.4c1.1,2.8,2.9,6.3,5.7,10c1.5,1.9,3,3.6,4.5,4.9 c-0.6,0.4-2.9,2.3-3.6,5.6c-0.8,4,1.4,7.1,1.7,7.6c0.1-1,0.5-2.8,1.7-4.7c0.9-1.4,1.9-2.3,2.7-2.9c0.5,1.2,1.1,2.5,1.7,3.8 c0.8,1.7,1.7,3.2,2.6,4.5c-0.4,0.2-0.9,0.6-1.4,1.2c-0.9,1-1.1,2.1-1.2,2.7c0.7,0.1,1.7,0.4,2.9,1.2c1,0.6,1.6,1.4,2,1.9 c0.9-0.9,2.2-2.5,3.1-4.8C99,74,98,70.3,97.6,69z"/><path d="M45.8,46.9c2.8-2.1,5.3-4.7,7.3-7.6c1-1.4,1.9-3,2.8-4.5c0.9-1.5,1.7-3.1,2.4-4.7c1.5-3.2,2.7-6.6,3.6-10.1 c-0.3,0.1-0.6,0.1-0.8,0.2c-0.2-0.4-0.6-1-1.3-1.6c-0.5-0.5-1.1-0.8-1.5-1c0.4-0.4,0.9-0.9,1.3-1.5c0.9-1.3,1.3-2.6,1.4-3.4 c-0.6,0-2.4-0.1-3.9,1.1c-0.6,0.5-1.1,1-1.3,1.4c-0.3-0.6-1-1.7-2.3-2.7c-1.4-1-2.9-1.2-3.5-1.3c-0.6,0.1-2.1,0.3-3.5,1.3 c-1.3,0.9-2,2.1-2.3,2.7c-0.3-0.4-0.7-1-1.3-1.4c-1.6-1.2-3.4-1.2-3.9-1.1c0.2,0.8,0.5,2.1,1.4,3.4c0.4,0.6,0.9,1.1,1.3,1.5 c-0.4,0.2-0.9,0.5-1.5,1c-0.6,0.6-1,1.2-1.3,1.6c-1.6-0.4-4.5-0.8-7.9-0.2c-2.2,0.4-5.1,1-7.3,3.4c-3.2,3.5-2.6,8.4-2.5,9.3 c-0.8,0.9-1.7,2.1-2.5,3.6c-1.1,2.2-1.6,4.2-1.9,5.6c-2,0.7-4.6,2-6.4,4.5c-2.1,2.9-2,5.8-2.5,9.1c-0.5,3.3-1.9,8-5.5,13.5 C2,70.3,1,74,2.5,78.3c0.9,2.3,2.2,3.9,3.1,4.8c0.4-0.5,1-1.2,2-1.9c1.1-0.7,2.2-1,2.9-1.2c-0.1-0.5-0.3-1.6-1.2-2.7 c-0.5-0.6-1-0.9-1.4-1.2c0.9-1.3,1.7-2.8,2.6-4.5c0.7-1.3,1.2-2.6,1.7-3.8c0.7,0.6,1.8,1.5,2.7,2.9c1.2,1.9,1.6,3.6,1.7,4.7 c0.4-0.5,2.6-3.5,1.7-7.6c-0.7-3.3-3-5.1-3.6-5.6c1.4-1.3,3-3,4.5-4.9c2.8-3.6,4.6-7.1,5.7-10c1.2-1.2,2.5-2.6,3.9-4.4 c1.4-1.8,2.4-3.5,3.2-5c0.8,0.5,4.8,3.3,5.4,8.2c0.3,2.2-0.2,4.1-0.5,4.7c-0.1,0.4-0.3,0.8-0.4,1.1c1.6-0.7,3.2-1.5,4.8-2.4 C42.9,48.9,44.4,47.9,45.8,46.9z M54.2,16.3c0.4,0,0.8,0.3,0.8,0.8c0,0.4-0.3,0.8-0.8,0.8s-0.8-0.3-0.8-0.8 C53.4,16.7,53.7,16.3,54.2,16.3z M45.8,16.3c0.4,0,0.8,0.3,0.8,0.8c0,0.4-0.3,0.8-0.8,0.8c-0.4,0-0.8-0.3-0.8-0.8 C45.1,16.7,45.4,16.3,45.8,16.3z M44.6,23c0.1-0.2,0.2-0.3,0.3-0.5c0.2-0.3,0.4-0.7,0.6-1c0.2-0.4,0.3-0.7,0.5-1.1 c0.1-0.4,0.2-0.7,0.3-1.1l0.1-0.7l0.3,0.6c0.3,0.6,0.5,1.2,0.4,1.9c0,0.3-0.1,0.6-0.2,0.9c-0.1,0.2-0.2,0.5-0.3,0.7 c0.1,0,0.3-0.1,0.4-0.1c1-0.2,2-0.3,3-0.3c1,0,2,0.1,3,0.3c0.1,0,0.3,0.1,0.4,0.1c-0.1-0.2-0.2-0.4-0.3-0.6 c-0.1-0.3-0.2-0.6-0.2-0.9c-0.1-0.6,0.1-1.3,0.4-1.9l0.3-0.6l0.1,0.7c0.1,0.4,0.2,0.8,0.3,1.1c0.1,0.4,0.3,0.7,0.5,1.1 c0.2,0.4,0.4,0.7,0.6,1c0.1,0.2,0.2,0.3,0.3,0.5c0.1,0.2,0.2,0.3,0.4,0.5c-1-0.2-1.9-0.4-2.9-0.6c-1-0.1-1.9-0.2-2.9-0.1 c-1,0-1.9,0.1-2.9,0.2c-1,0.1-1.9,0.3-2.9,0.5C44.4,23.3,44.5,23.1,44.6,23z"/></g></svg>` }} />
          </div>
        ),
        description: 'A hulking Orc chosen for its brute strength. It is entrusted with the key that unlocks the passage to the deeper levels of the dungeon.',
        abilities: 'A powerful mini-boss. Defeating it drops the key for the floor.'
      },
       {
        id: 'cultist', name: 'Cultist Acolyte',
        icon: (
          <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
            <div className="w-10 h-10 text-purple-400 drop-shadow-lg" dangerouslySetInnerHTML={{ __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h-2zm0 6h2v2h-2z"/></svg>` }} />
          </div>
        ),
        description: 'A robed figure chanting forbidden words. They channel raw magical energy, bypassing physical defenses with ease.',
        abilities: 'A standard ranged attacker that deals Arcane damage, effective against heavily armored foes.'
      },
    ]
  };

  // NEW: This function now updates the LOCAL state instantly, not Firebase.
  const setDungeonState = (updater) => {
    setLocalDungeonState(updater);
  };
  
  // This is now the single source of truth for calculated stats.
  const fullPlayerStats = useMemo(() => {
    if (!localDungeonState || !localDungeonState.playerClass) return { maxHp: 100, attack: 10 };

    const classDef = dungeonDefinitions.classes[localDungeonState.playerClass];
    const allPrimaryWeapons = Object.values(dungeonDefinitions.primaryWeapons)
      .flatMap(classWeapons => Object.values(classWeapons).flat());
    const weapon = allPrimaryWeapons.find(w => w.id === localDungeonState.equippedWeapon);
    const armor = dungeonDefinitions.armors.find(a => a.id === localDungeonState.equippedArmor);
    const pet = stats.currentPet ? getFullPetDetails(stats.currentPet.id) : null;
    
    let potionAttackBonus = 0;
    let potionHpBonus = 0;
    
    // Hunker down is a temporary effect, so we add its bonus here.
    const hunkerDownEffect = localDungeonState.player.activeEffects?.find(e => e.id === 'tank_hunker_down');
    const hunkerHpBonus = hunkerDownEffect ? 100 : 0;

    if (localDungeonState.player.activeEffects) {
        localDungeonState.player.activeEffects.forEach(effect => {
            if (effect.id === 'potion_strength') potionAttackBonus += 15;
            if (effect.id === 'potion_fortitude') potionHpBonus += 50;
        });
    }

    const baseAttack = 10;
    const maxHp = (classDef.startingHp || 100) + (armor?.hp || 0) + (weapon?.hp || 0) + (localDungeonState.boughtStats?.hp || 0) + potionHpBonus + hunkerHpBonus;
    const attack = baseAttack + (weapon?.attack || 0) + (pet?.xpBuff * 50 || 0) + (localDungeonState.boughtStats?.attack || 0) + potionAttackBonus;

    return { maxHp, attack };
  }, [localDungeonState, stats.currentPet, getFullPetDetails, dungeonDefinitions]);
  
  // --- NEW: Pathfinding, AI, and Turn Logic ---

  // Checks line of sight between two points, accounting for walls and pillars.
  const lineOfSightClear = (startPos, endPos, board) => {
    let x0 = startPos.x;
    let y0 = startPos.y;
    const x1 = endPos.x;
    const y1 = endPos.y;
    const dx = Math.abs(x1 - x0);
    const dy = -Math.abs(y1 - y0);
    const sx = x0 < x1 ? 1 : -1;
    const sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;

    while (true) {
      if (x0 === x1 && y0 === y1) break;
      // Check the tile at (x0, y0), but ignore the very start and very end tiles
      if (!(x0 === startPos.x && y0 === startPos.y) && !(x0 === endPos.x && y0 === endPos.y)) {
        const tile = board[`${y0},${x0}`];
        if (tile && (tile.type === 'wall' || tile.type === 'pillar')) {
          return false;
        }
      }
      const e2 = 2 * err;
      if (e2 >= dy) {
        if (x0 === x1) break;
        err += dy;
        x0 += sx;
      }
      if (e2 <= dx) {
        if (y0 === y1) break;
        err += dx;
        y0 += sy;
      }
    }
    return true; // No obstacles found
  };


  // Finds all tiles a unit can move to within its range.
  const getReachableTiles = (start, range, board, allEntities) => {
    const reachable = new Map(); // Stores {pos, dist}
    const queue = [{ pos: start, dist: 0 }];
    const visited = new Set([`${start.x},${start.y}`]);
    reachable.set(`${start.x},${start.y}`, { pos: start, dist: 0 });

    const entityPositions = new Set(allEntities.map(e => `${e.x},${e.y}`));

    while (queue.length > 0) {
      const { pos, dist } = queue.shift();
      if (dist >= range) continue;

        const neighbors = [
          {x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0}, // Cardinal
          {x: 1, y: 1}, {x: 1, y: -1}, {x: -1, y: 1}, {x: -1, y: -1}  // Diagonal
        ];
        for (const n of neighbors) {
            const nextPos = { x: pos.x + n.x, y: pos.y + n.y };
            const key = `${nextPos.x},${nextPos.y}`;

            if (nextPos.x < 0 || nextPos.x >= 10 || nextPos.y < 0 || nextPos.y >= 10 || visited.has(key)) continue;
            
            if (n.x !== 0 && n.y !== 0) {
                const corner1Key = `${pos.x + n.x},${pos.y}`;
                const corner2Key = `${pos.x},${pos.y + n.y}`;
                if (board[corner1Key]?.type === 'wall' || board[corner1Key]?.type === 'pillar' || board[corner2Key]?.type === 'wall' || board[corner2Key]?.type === 'pillar') {
                    continue;
                }
            }

           const tile = board[key];
        if (tile && tile.type !== 'wall' && tile.type !== 'pillar' && tile.type !== 'hatch' && !(tile.type === 'chest' && !tile.opened) && !entityPositions.has(key)) {
          visited.add(key);
          reachable.set(key, { pos: nextPos, dist: dist + 1 });
          queue.push({ pos: nextPos, dist: dist + 1 });
        }
      }
    }
    return Array.from(reachable.values()).map(r => r.pos);
  };

  // Finds the shortest path from start to end using Breadth-First Search.
  const findPathBFS = (start, end, board, allEntities) => {
    const queue = [[start]];
    const visited = new Set([`${start.x},${start.y}`]);
    const entityPositions = new Set(allEntities.map(e => `${e.x},${e.y}`));
    entityPositions.delete(`${start.x},${start.y}`); 
    entityPositions.delete(`${end.x},${end.y}`);   
    
    while(queue.length > 0) {
        const path = queue.shift();
        const pos = path[path.length - 1];
        
        if(pos.x === end.x && pos.y === end.y) return path;
        
        const neighbors = [
          {x: 0, y: 1}, {x: 0, y: -1}, {x: 1, y: 0}, {x: -1, y: 0},
          {x: 1, y: 1}, {x: 1, y: -1}, {x: -1, y: 1}, {x: -1, y: -1}
        ];
        for (const n of neighbors) {
            const nextPos = { x: pos.x + n.x, y: pos.y + n.y };
            const key = `${nextPos.x},${nextPos.y}`;

            if (nextPos.x < 0 || nextPos.x >= 10 || nextPos.y < 0 || nextPos.y >= 10 || visited.has(key)) continue;
            
            if (n.x !== 0 && n.y !== 0) {
                const corner1Key = `${pos.x + n.x},${pos.y}`;
                const corner2Key = `${pos.x},${pos.y + n.y}`;
                 if (board[corner1Key]?.type === 'wall' || board[corner1Key]?.type === 'pillar' || board[corner2Key]?.type === 'wall' || board[corner2Key]?.type === 'pillar') {
                    continue;
                }
            }

           const tile = board[key];
            if (tile && tile.type !== 'wall' && tile.type !== 'pillar' && tile.type !== 'hatch' && !(tile.type === 'chest' && !tile.opened) && !entityPositions.has(key)) {
                const newPath = [...path, nextPos];
                queue.push(newPath);
                visited.add(key);
            }
        }
    }
    return null; // No path found
  };


  // REFACTORED: This now triggers the enemy turn sequence.
  const processEnemyTurns = useCallback(() => {
    addLog("Enemy turn...", 'text-gray-400 italic');
    setLocalDungeonState(prev => ({ ...prev, lastMoveTrails: [] })); // Clear trails at turn start
  }, [addLog]);

  // NEW: React-friendly useEffect for handling sequential enemy turns
  useEffect(() => {
    if (activeTurn !== 'enemy' || dungeonStateRef.current.gameOver) return;
  
    const enemiesToProcess = [...dungeonStateRef.current.enemies];
    let currentEnemyIndex = 0;
  
    const processNextEnemy = () => {
      const currentState = dungeonStateRef.current;
      if (currentEnemyIndex >= enemiesToProcess.length || currentState.player.hp <= 0) {
        // --- End of Enemy Turn / Start of Player Turn ---
        const endTurnLogic = () => {
            const latestState = dungeonStateRef.current;
            let wingmanDiedThisTurn = false;

            if (latestState.wingman && latestState.wingman.hp <= 0) {
                wingmanDiedThisTurn = true;
                addLog(`${latestState.wingman.name} has been defeated! He has been moved to the Graveyard.`, 'text-red-500 font-bold');
                
                const defeatedWingman = { ...latestState.wingman, dateOfDeath: new Date().toISOString() };
                const wingmanInstanceId = defeatedWingman.instanceId;
                const wingmanBaseId = defeatedWingman.id;

                const latestRoster = statsPropRef.current.dungeon_wingmen?.roster || [];
                const latestGraveyard = statsPropRef.current.dungeon_wingmen?.graveyard || [];
                const latestUpgrades = { ...(statsPropRef.current.dungeon_wingmen?.upgrades || {}) };

                const newRoster = latestRoster.filter(w => w.instanceId !== wingmanInstanceId);
                const newGraveyard = [...latestGraveyard, defeatedWingman];
                delete latestUpgrades[wingmanBaseId];

                const boardUpdate = { ...latestState.board };
                boardUpdate[`${defeatedWingman.y},${defeatedWingman.x}`] = { type: 'empty' };

                const stateUpdateForFirestore = {
                  ...latestState,
                  board: boardUpdate,
                  wingman: null,
                };
                
                updateStatsInFirestore({
                    'dungeon_wingmen.roster': newRoster,
                    'dungeon_wingmen.graveyard': newGraveyard,
                    'dungeon_wingmen.upgrades': latestUpgrades,
                    'dungeon_state': stateUpdateForFirestore
                });

                setLocalDungeonState(stateUpdateForFirestore);
            }

setLocalDungeonState(prev => {
                let newState = { ...prev };
                if (wingmanDiedThisTurn) {
                  newState.wingman = null; 
                }
                newState.turnCount = (prev.turnCount || 1) + 1;

                   // --- Player & Wingman End-of-Turn Tile Effects ---
                const checkAndHeal = (entity, entityKey) => {
                    if (!entity) return;
                    const tile = newState.board[`${entity.y},${entity.x}`];
                    
                    // Altar Logic
                    if (tile && tile.type === 'altar') {
                        addLog(`${entity.name || 'You'} activated a mysterious altar!`, 'text-purple-300 font-bold');
                        if (!newState[entityKey].activeEffects) newState[entityKey].activeEffects = [];
                        newState[entityKey].activeEffects.push({ id: 'altar_lifesteal', type: 'lifesteal', amount: 0.25, durationTurns: 3 });
                        newState.board[`${entity.y},${entity.x}`] = { type: 'altar_used' };
                    }

                    // Miasma Damage
                    if (newState.floorModifier?.id === 'miasma') {
                        const maxHp = entityKey === 'player' ? fullPlayerStats.maxHp : entity.maxHp;
                        const miasmaDamage = Math.max(1, Math.round(maxHp * 0.05));
                        newState[entityKey].hp -= miasmaDamage;
                        addLog(`${entity.name || 'You'} take ${miasmaDamage} damage from Miasma.`, 'text-purple-400');
                    }
                    
                    if (tile && tile.type === 'healing_spring') {
                        const maxHp = entityKey === 'player' ? fullPlayerStats.maxHp : entity.maxHp;
                        const healAmount = Math.round(maxHp * 0.15);
                        const healedHp = Math.min(maxHp, entity.hp + healAmount);
                        if (healedHp > entity.hp) {
                           addLog(`${entity.name || 'You'} healed for ${healedHp - entity.hp} HP on the spring.`, 'text-green-300');
                           newState[entityKey].hp = healedHp;
                        }
                    }
                };
                checkAndHeal(newState.player, 'player');
                checkAndHeal(newState.wingman, 'wingman');


                if (newState.wingman) {
                  // ... [rest of the effect processing logic remains the same] ...
                   let newWingman = { ...newState.wingman };
                    let wingmanEffects = [...(newWingman.activeEffects || [])];
                    let effectsToRemove = [];
                    
                    wingmanEffects.forEach((effect, index) => {
                      effect.durationTurns = (effect.durationTurns || 99) - 1;
                      if (effect.specialization === 'crusader_ability_b' && effect.id === 'divine_shield') {
                        const healAmount = Math.round(newWingman.maxHp * 0.2 / effect.duration);
                        newWingman.hp = Math.min(newWingman.maxHp, newWingman.hp + healAmount);
                        addLog(`${newWingman.name}'s Sanctuary heals them for ${healAmount} HP.`, 'text-green-300');
                      }
                      if (effect.durationTurns <= 0) {
                        if (effect.specialization === 'crusader_ability_a' && effect.id === 'divine_shield') {
                           addLog(`${newWingman.name}'s Divine Shield explodes!`, 'text-yellow-300');
                           const explosionDamage = effect.tempHp || 30;
                           newState.enemies.forEach(enemy => {
                             if (Math.hypot(enemy.x - newWingman.x, enemy.y - newWingman.y) < 1.6) enemy.hp -= explosionDamage;
                           });
                        }
                        if (effect.tempHp) newWingman.maxHp -= effect.tempHp;
                        effectsToRemove.push(index);
                      }
                    });
                    
                    newWingman.activeEffects = wingmanEffects.filter((_, index) => !effectsToRemove.includes(index));
                    newState.wingman = newWingman;
                }
                return newState;
            });
            
            setActiveTurn('player');
            setPlayerActionPoints(2);
            setWingmanTurnState({ distanceMoved: 0, frenziedAttackAvailable: false });
            if (dungeonStateRef.current.wingman) setWingmanActionPoints(dungeonStateRef.current.wingman.ap);
            setDangerZone({ tiles: [], forEnemy: null });
      
            if (dungeonStateRef.current.player.hp > 0) addLog("Your turn.", 'text-gray-400 italic');
            else handleGameOver();
        };

        // Use a short timeout to ensure the last state update from an attack has been processed.
        setTimeout(endTurnLogic, 50);
        return;
      }

      const enemy = { ...enemiesToProcess[currentEnemyIndex] };
      const performAttack = (attacker, currentTarget) => {
          const targetId = currentTarget.entityType === 'player' ? 'player' : 'wingman';
          const targetName = targetId === 'player' ? 'you' : (currentTarget.name || 'your wingman');
          
          setLocalDungeonState(prev => {
              if (!prev[targetId]) return prev;
              let newState = JSON.parse(JSON.stringify(prev));
              let defender = newState[targetId];
              let attackerInState = newState.enemies.find(e => e.id === attacker.id);
              
              const riposteEffect = defender.activeEffects?.find(e => e.id === 'riposte');
              if (riposteEffect) {
                  const chance = riposteEffect.specialization === 'duelist_ability_a' ? 1.0 : 0.5;
                  if (Math.random() < chance) {
                      const counterDamage = Math.round(defender.atk * 0.5);
                      if (attackerInState) attackerInState.hp -= counterDamage;
                      newState.log.unshift({ id: Date.now() + Math.random(), message: `${defender.name} ripostes for ${counterDamage} damage!`, style: 'text-sky-400' });
                  }
                  if (riposteEffect.specialization === 'duelist_ability_b') {
                      newState.log.unshift({ id: Date.now() + Math.random(), message: `${defender.name} parries the attack!`, style: 'text-sky-400' });
                      setAnimationState(prevAnims => ({...prevAnims, hits: {...prevAnims.hits, [targetId]: Date.now()}}));
                      return newState;
                  }
              }

              const defenderArmor = defender.armor || 0;
              let finalDamage = Math.max(1, attacker.atk - defenderArmor);

                            // NEW: Rubble tile damage reduction
              const defenderTile = prev.board[`${defender.y},${defender.x}`];
              if (defenderTile && defenderTile.type === 'rubble') {
                finalDamage = Math.round(finalDamage * 0.8); // 20% damage reduction
                newState.log.unshift({ id: Date.now() + Math.random(), message: `${defender.name || 'You'} took cover in the rubble!`, style: 'text-stone-400' });
              }

              // NEW: Volatile Magic modifier
              if (prev.floorModifier?.id === 'volatile_magic') {
                finalDamage = Math.round(finalDamage * 1.25);
              }
              
              const retaliationEffect = defender.activeEffects?.find(e => e.id === 'fortify' && e.specialization === 'heavy_ability_b');
              if (retaliationEffect) {
                  const reflectDamage = Math.round(finalDamage * 0.25);
                  if(attackerInState) attackerInState.hp -= reflectDamage;
                  newState.log.unshift({ id: Date.now() + Math.random(), message: `${defender.name} reflects ${reflectDamage} damage!`, style: 'text-orange-400' });
              }
              
              // Check for player thorns from equipped shield
              const primaryWeapon = Object.values(dungeonDefinitions.primaryWeapons).flat().flatMap(cat => Object.values(cat).flat()).find(w => w.id === prev.equippedWeapon);
              const thornsDamageFromItems = (defender.thorns || 0) + (targetId === 'player' && primaryWeapon?.thorns ? primaryWeapon.thorns : 0);

              if (thornsDamageFromItems > 0 && attackerInState) {
                  attackerInState.hp -= thornsDamageFromItems;
                  newState.log.unshift({ id: Date.now() + Math.random(), message: `${targetName}'s thorns reflect ${thornsDamageFromItems} damage!`, style: 'text-orange-300' });
              }
              
              defender.hp -= finalDamage;
              
              newState.log.unshift({ id: Date.now() + Math.random(), message: `${attacker.name} attacks ${targetName} for ${finalDamage} damage!`, style: 'text-red-400' });
              setAnimationState(prevAnims => ({...prevAnims, hits: {...prevAnims.hits, [targetId]: Date.now()}}));
              
              return newState;
          });
      };
      
      // --- End of Previous Turn Tile Effects ---
      const enemyTile = currentState.board[`${enemy.y},${enemy.x}`];
      if (enemyTile && enemyTile.type === 'healing_spring') {
          const healAmount = Math.round(enemy.maxHp * 0.15);
          enemy.hp = Math.min(enemy.maxHp, enemy.hp + healAmount);
          addLog(`${enemy.name} heals for ${healAmount}HP on the spring.`, 'text-green-300');
      }

      // --- Status Effects ---
            // --- Miasma Damage ---
      if (currentState.floorModifier?.id === 'miasma') {
          const miasmaDamage = Math.max(1, Math.round(enemy.maxHp * 0.05));
          enemy.hp -= miasmaDamage;
          addLog(`${enemy.name} takes ${miasmaDamage} damage from Miasma.`, 'text-purple-400');
          if (enemy.hp <= 0) {
            setLocalDungeonState(prev => ({ ...prev, enemies: prev.enemies.filter(e => e.id !== enemy.id), board: {...prev.board, [`${enemy.y},${enemy.x}`]: {type: 'empty'}} }));
            currentEnemyIndex++; setTimeout(processNextEnemy, 50); return;
          }
      }

      if (enemy.statusEffects) {
        let damageOverTime = 0;
        enemy.statusEffects.forEach(effect => {
            if (effect.type === 'poison' || effect.type === 'burning') damageOverTime += effect.damage;
        });
        if (damageOverTime > 0) {
            enemy.hp -= damageOverTime;
            addLog(`${enemy.name} takes ${damageOverTime} damage from status effects.`, 'text-purple-400');
            if (enemy.hp <= 0) {
              setLocalDungeonState(prev => ({ ...prev, enemies: prev.enemies.filter(e => e.id !== enemy.id) }));
              currentEnemyIndex++; setTimeout(processNextEnemy, 50); return;
            }
        }
        enemy.statusEffects = enemy.statusEffects.map(effect => ({ ...effect, duration: effect.duration - 1 })).filter(e => e.duration > 0);
      }
      
      if ((enemy.moveFrequency && currentState.turnCount % enemy.moveFrequency !== 0) || (enemy.moveChance && Math.random() > enemy.moveChance)) {
          currentEnemyIndex++; setTimeout(processNextEnemy, 50); return;
      }

      // Stun check
      const stunnedEffect = enemy.statusEffects?.find(e => e.type === 'stunned');
      if (stunnedEffect) {
        addLog(`${enemy.name} is stunned and cannot act!`, 'text-yellow-400');
        currentEnemyIndex++;
        setTimeout(processNextEnemy, 50);
        return;
      }
      
      // Cobweb check
      if (enemyTile && enemyTile.type === 'cobweb') {
          addLog(`${enemy.name} is stuck in a cobweb and cannot move!`, 'text-slate-400');
          // Enemy can still attack if target is in range, but cannot move.
          // We remove the cobweb after it's triggered once.
          setLocalDungeonState(prev => {
              const newBoard = { ...prev.board };
              newBoard[`${enemy.y},${enemy.x}`] = { type: 'empty' };
              return { ...prev, board: newBoard };
          });
          // Directly try to attack if possible, otherwise end turn.
          const target = currentState.player; // Simplified target for now
          if (Math.hypot(enemy.x - target.x, enemy.y - target.y) <= enemy.attackRange) {
              performAttack(enemy, target);
          }
          currentEnemyIndex++;
          setTimeout(processNextEnemy, 200);
          return;
      }
  
      // --- AI Logic ---
      let target = currentState.player;
      let allEntities = [...currentState.enemies, currentState.player];
      if (currentState.wingman) {
        allEntities.push(currentState.wingman);
        const tauntEffect = enemy.statusEffects?.find(e => e.type === 'taunted');
        if (tauntEffect) { target = currentState.wingman; } 
        else {
          const distToPlayer = Math.hypot(enemy.x - currentState.player.x, enemy.y - currentState.player.y);
          const distToWingman = Math.hypot(enemy.x - currentState.wingman.x, enemy.y - currentState.wingman.y);
          if (distToWingman < distToPlayer) target = currentState.wingman;
        }
      }
      
      let enemyMoveRange = enemy.moveRange;
      const crippledEffect = enemy.statusEffects?.find(e => e.type === 'crippled');
      if (crippledEffect) enemyMoveRange = Math.max(0, enemyMoveRange - crippledEffect.reduction);
      
      const path = findPathBFS({ x: enemy.x, y: enemy.y }, { x: target.x, y: target.y }, currentState.board, allEntities);
      const inRangeNow = Math.hypot(enemy.x - target.x, enemy.y - target.y) <= enemy.attackRange;

      if (inRangeNow) {
        performAttack(enemy, target);
        currentEnemyIndex++;
        setTimeout(processNextEnemy, 200);
      } else if (path && path.length > 1) {
        const stepsToAdjacent = path.length - 2;
        if (stepsToAdjacent <= enemyMoveRange) { // Can move and attack
          const movePath = path.slice(1, path.length - 1);
          const endPos = movePath.length > 0 ? movePath[movePath.length - 1] : { x: enemy.x, y: enemy.y };
          
          setLocalDungeonState(prev => {
            const newBoard = { ...prev.board };
            newBoard[`${enemy.y},${enemy.x}`] = { type: 'empty' };
            newBoard[`${endPos.y},${endPos.x}`] = { type: 'enemy', enemyId: enemy.id };
            return { ...prev, board: newBoard, enemies: prev.enemies.map(e => e.id === enemy.id ? { ...e, x: endPos.x, y: endPos.y } : e) };
          });

          setTimeout(() => {
            performAttack(enemy, target);
            currentEnemyIndex++;
            setTimeout(processNextEnemy, 50);
          }, 250);

        } else { // Can only move
          const movePath = path.slice(1, enemyMoveRange + 1);
          const endPos = movePath[movePath.length - 1];

          setLocalDungeonState(prev => {
            const newBoard = { ...prev.board };
            newBoard[`${enemy.y},${enemy.x}`] = { type: 'empty' };
            newBoard[`${endPos.y},${endPos.x}`] = { type: 'enemy', enemyId: enemy.id };
            return { ...prev, board: newBoard, enemies: prev.enemies.map(e => e.id === enemy.id ? { ...e, x: endPos.x, y: endPos.y } : e) };
          });

          setTimeout(() => {
            currentEnemyIndex++;
            setTimeout(processNextEnemy, 50);
          }, 250);
        }
      } else { // Cannot move and not in range, so wait
        currentEnemyIndex++;
        setTimeout(processNextEnemy, 200);
      }
    };
  
    processNextEnemy();
  }, [activeTurn]);

  // --- NEW: Danger Zone Logic ---
    const handleEnemyClick = (e, enemy) => {
    e.stopPropagation(); // Prevent tile click from firing

    if (attackTarget) { // this handles both player and wingman attack targeting
        const attackType = typeof attackTarget === 'object' ? attackTarget.type : 'wingman_basic';
        handleAttack(activeTurn, enemy, attackType);
        setAttackTarget(null);
        setAbilityTarget(null);
        return;
    }
    
    if (activeTurn === 'player' && abilityTarget) {
      handleAttack('player', enemy, abilityTarget);
      return;
    }
    
    // NEW: Wingman ability targeting
    if (activeTurn === 'wingman' && wingmanAbilityTarget) {
      handleUseWingmanAbility(enemy);
      return;
    }

    // --- Danger Zone Logic (if not in targeting mode during player turn) ---
    if (dangerZone.forEnemy === enemy.id) {
      setDangerZone({ tiles: [], forEnemy: null });
      return;
    }

    // --- Danger Zone Logic (if not in targeting mode during player turn) ---
    if (dangerZone.forEnemy === enemy.id) {
      setDangerZone({ tiles: [], forEnemy: null });
      return;
    }
    
    // ACCURACY FIX: The danger zone shows what an enemy can do on its upcoming turn.
    // We check the game's current turn count to see if slow enemies (like Golems) will be able to act.
    const enemyWillMove = !enemy.moveFrequency || (localDungeonState.turnCount % enemy.moveFrequency === 0);
    const moveRange = enemyWillMove ? enemy.moveRange : 0;

    const allEntities = [...localDungeonState.enemies, localDungeonState.player];
    const moveTiles = getReachableTiles({ x: enemy.x, y: enemy.y }, moveRange, localDungeonState.board, allEntities);
    const attackTiles = new Set();
    
    const combinedTiles = [...moveTiles, { x: enemy.x, y: enemy.y }];

    combinedTiles.forEach(movePos => {
      for(let y = -enemy.attackRange; y <= enemy.attackRange; y++) {
        for(let x = -enemy.attackRange; x <= enemy.attackRange; x++) {
          if (Math.hypot(x, y) <= enemy.attackRange) {
            const atkX = movePos.x + x;
            const atkY = movePos.y + y;
            if(atkX >= 0 && atkX < 10 && atkY >= 0 && atkY < 10) {
              attackTiles.add(`${atkX},${atkY}`);
            }
          }
        }
      }
    });

    setDangerZone({ tiles: Array.from(attackTiles).map(s => ({x: parseInt(s.split(',')[0]), y: parseInt(s.split(',')[1])})), forEnemy: enemy.id });
  };


  const classDef = localDungeonState ? dungeonDefinitions.classes[localDungeonState.playerClass] : null;

    const CombatStyleIcon = ({ style, size = 'w-4 h-4' }) => {
    const iconMap = {
      Martial: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M16.816 2.331a2.5 2.5 0 00-3.536 0L2.33 13.282a2.5 2.5 0 000 3.536l.884.884a2.5 2.5 0 003.535 0L17.7 6.753a2.5 2.5 0 000-3.535l-.884-.884zM8.25 12.336l-3.536 3.536a.5.5 0 01-.707 0l-.884-.884a.5.5 0 010-.707l3.536-3.536 2.092 2.091z"/></svg>,
      Finesse: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 3a1 1 0 011 1v1.268a2 2 0 001.092 1.836l5.284 2.642a1 1 0 01.44 1.262l-1.328 2.656a1 1 0 01-1.262.44l-5.284-2.642A2 2 0 0010 11.732V16a1 1 0 11-2 0v-4.268a2 2 0 00-1.092-1.836l-5.284-2.642a1 1 0 01-.44-1.262L2.51 3.336a1 1 0 011.262-.44l5.284 2.642A2 2 0 0010 7.268V4a1 1 0 011-1z"/></svg>,
      Arcane: <svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 3.5a1.5 1.5 0 013 0V4a1 1 0 001 1h.5a1.5 1.5 0 010 3H14a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0V8a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H6a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0V4a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3H4a1 1 0 001-1v-.5a1.5 1.5 0 013 0V3a1 1 0 001 1h.5a1.5 1.5 0 013 0V3.5zM1.5 11h.5a1 1 0 001-1v-.5a1.5 1.5 0 013 0V10a1 1 0 001 1h.5a1.5 1.5 0 010 3H8a1 1 0 00-1 1v.5a1.5 1.5 0 01-3 0V14a1 1 0 00-1-1h-.5a1.5 1.5 0 010-3zM12 11.5a1.5 1.5 0 00-3 0V12a1 1 0 01-1 1h-.5a1.5 1.5 0 000 3H8a1 1 0 011-1v-.5a1.5 1.5 0 003 0V13a1 1 0 011-1h.5a1.5 1.5 0 000-3H14a1 1 0 01-1 1v.5z"/></svg>
    };
    const colorMap = {
      Martial: 'text-red-400', Finesse: 'text-green-400', Arcane: 'text-blue-400'
    };
    return <div className={`${size} ${colorMap[style]}`}>{iconMap[style]}</div>
  };

  const handleGameOver = () => {
    const finalState = { ...localDungeonState, gameOver: true, log: [{ message: "You have been defeated! Your adventure ends here.", style: 'text-red-500 font-bold' }, ...(localDungeonState.log || []).slice(0, 4)] };
    setLocalDungeonState(finalState);
    saveGame(finalState);
  };
  
    const generateFloor = (floorNum) => {
    const size = 10;
    let newBoard = {};
    let newEnemies = [];
    
    const floorModifiers = [
      { id: 'horde', name: 'Horde', description: 'Enemy numbers are increased.' },
      { id: 'volatile_magic', name: 'Volatile Magic', description: 'All units deal 25% more damage.' },
      { id: 'miasma', name: 'Miasma', description: 'All units lose 5% of their max HP at the start of their turn.' },
    ];
    // Apply a modifier 33% of the time, but never on the first floor.
    const modifier = floorNum > 1 && Math.random() < 0.33 ? floorModifiers[Math.floor(Math.random() * floorModifiers.length)] : null;

    
    // Initialize board
    for (let y = 0; y < size; y++) { for (let x = 0; x < size; x++) { newBoard[`${y},${x}`] = { type: 'empty' }; } }

    // Place walls
    for (let i = 0; i < 15 + Math.floor(Math.random() * 5); i++) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        if((x !== 1 || y !== 1)) newBoard[`${y},${x}`] = { type: 'wall' };
    }

    // Place special tiles
    const placeTile = (type, count) => {
      for (let i = 0; i < count; i++) {
        let x, y;
        do {
          x = Math.floor(Math.random() * size);
          y = Math.floor(Math.random() * size);
        } while (newBoard[`${y},${x}`].type !== 'empty' || (x === 1 && y === 1));
        newBoard[`${y},${x}`] = { type };
      }
    };
    placeTile('forest', 3 + Math.floor(Math.random() * 3));
    placeTile('pillar', 1 + Math.floor(Math.random() * 2));
    placeTile('fort', 1 + Math.floor(Math.random() * 2));
    placeTile('rough', 5 + Math.floor(Math.random() * 4));
    placeTile('altar', 1); // Place one altar per floor


    // Determine available enemies for this floor
    const availableEnemies = dungeonDefinitions.enemies.filter(e => floorNum >= e.minFloor && e.id !== 'ooze' && e.id !== 'keyholder_orc');
    let enemyCount = floorNum === 1 ? 4 : 6 + Math.floor(floorNum / 2);
    if (modifier?.id === 'horde') {
        enemyCount = Math.round(enemyCount * 1.5);
    }
    
    // Spawn enemies
    for (let i = 0; i < enemyCount; i++) {
        let x, y;
        do { x = Math.floor(Math.random() * size); y = Math.floor(Math.random() * size); } while (newBoard[`${y},${x}`].type !== 'empty');
        
        const type = availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
        const floorMultiplier = 1 + (Math.floor(floorNum / 3) * 0.5);
        const enemyId = `enemy_${i}_${Date.now()}`;

        const isElite = Math.random() < 0.1; // 10% chance to be elite
        
        let newEnemy = { 
            ...type,
            id: enemyId,
            baseId: type.id,
            x, y, 
            hp: Math.round(type.hp * floorMultiplier * (isElite ? 1.5 : 1)), 
            maxHp: Math.round(type.hp * floorMultiplier * (isElite ? 1.5 : 1)), 
            atk: Math.round(type.atk * floorMultiplier * (isElite ? 1.2 : 1)),
            isElite,
        };
        if (isElite) {
            newEnemy.name = `Dire ${type.name}`;
        }
        
        newEnemies.push(newEnemy);
        newBoard[`${y},${x}`] = { type: 'enemy', enemyId: enemyId };
    }
  

    // Spawn keyholder
    let kx, ky;
    do { kx = Math.floor(Math.random() * size); ky = Math.floor(Math.random() * size); } while (newBoard[`${ky},${kx}`].type !== 'empty');
    const keyholderDef = dungeonDefinitions.enemies.find(e => e.id === 'keyholder_orc');
    const keyholderFloorMultiplier = 1 + (Math.floor(floorNum / 3) * 0.5);
    const keyholderInstance = {
      ...keyholderDef,
      id: 'keyholder_instance',
      baseId: keyholderDef.id,
      hp: Math.round(keyholderDef.hp * keyholderFloorMultiplier),
      maxHp: Math.round(keyholderDef.hp * keyholderFloorMultiplier),
      atk: Math.round(keyholderDef.atk * keyholderFloorMultiplier),
      x: kx, y: ky
    };
    newEnemies.push(keyholderInstance);
    newBoard[`${ky},${kx}`] = { type: 'enemy', enemyId: keyholderInstance.id };

    // Place hatch and chests
    let hx, hy;
    do { hx = Math.floor(Math.random() * size); hy = Math.floor(Math.random() * size); } while (newBoard[`${hy},${hx}`].type !== 'empty' || (hx === 1 && hy === 1));
    newBoard[`${hy},${hx}`] = { type: 'hatch' };
    for (let i = 0; i < 2; i++) {
        let cx, cy;
        do { cx = Math.floor(Math.random() * size); cy = Math.floor(Math.random() * size); } while (newBoard[`${cy},${cx}`].type !== 'empty');
        newBoard[`${cy},${cx}`] = { type: 'chest', opened: false };
    }
    
        newBoard['1,1'] = {type: 'player'};
    return { newBoard, newEnemies, modifier };
  };

    const handleSelectClass = (className) => {
    const classDef = dungeonDefinitions.classes[className];
    const { newBoard, newEnemies, modifier } = generateFloor(1);

    // Initialize ability uses for the selected class
    const initialAbilityUses = {};
    dungeonDefinitions.attacks
      .filter(a => a.class === className)
      .forEach(a => {
        initialAbilityUses[a.id] = a.maxUses;
      });

    const initialPlayerState = {
      id: 'player',
      entityType: 'player',
      name: classDef.name,
      x: 1, y: 1, hp: classDef.startingHp, hasKey: false, activeEffects: [],
      moveCost: classDef.moveCost, attackCost: classDef.attackCost, attackRange: classDef.attackRange,
      abilityUses: initialAbilityUses,
      lastWeaponSwitchFloor: 0,
    };
    
    const startingWeaponId = Object.values(dungeonDefinitions.primaryWeapons[className])[0][0].id;

        const newGameState = {
      ...generateInitialDungeonState(),
      phase: 'playing',
      floorModifier: modifier,
      ownedWeapons: [startingWeaponId],
      equippedWeapon: startingWeaponId,
      turnCount: 1,
      playerClass: className,
      board: newBoard,
      enemies: newEnemies,
      log: [`You have entered the dungeon as a ${classDef.name}!`],
      player: initialPlayerState,
    };

    setLocalDungeonState(newGameState);
        updateStatsInFirestore({
      dungeon_state: newGameState,
      'dungeon_wingmen.equipped': pendingEquippedWingman || null // Ensure null instead of undefined
    });
  };

    const goToNextFloor = () => {
    const nextFloor = localDungeonState.floor + 1;
    const { newBoard, newEnemies, modifier } = generateFloor(nextFloor);
    let updatedEffects = (localDungeonState.player.activeEffects || []).map(effect => ({ ...effect, remainingFloors: effect.remainingFloors - 1 })).filter(effect => effect.remainingFloors > 0);
    let newAbilityUses = { ...localDungeonState.player.abilityUses };
    let newLogMessages = [{ message: `You descended to floor ${nextFloor}.`, style: 'text-slate-300' }];

    if (nextFloor % 5 === 0) {
      newLogMessages.unshift({ message: `You feel re-energized. Ability uses have been restored!`, style: 'text-cyan-400 font-bold' });
      dungeonDefinitions.attacks.filter(a => a.class === localDungeonState.playerClass).forEach(a => { newAbilityUses[a.id] = a.maxUses; });
    }

        const nextState = {
        ...localDungeonState,
        floor: nextFloor,
        floorModifier: modifier,
        board: newBoard,
        enemies: newEnemies,
        player: { ...localDungeonState.player, x: 1, y: 1, hasKey: false, activeEffects: updatedEffects, abilityUses: newAbilityUses },
        log: newLogMessages,
        turnCount: 1, // FIX: Reset turn count on new floor
    };
    setLocalDungeonState(nextState);
    updateStatsInFirestore({
        dungeon_floor: Math.max(stats.dungeon_floor || 1, nextFloor),
        dungeon_state: nextState
    }).then(() => {
        // Pass the achievement check function down from App
        processAchievement('dungeonFloors', nextFloor);
    });
  };

  const handleTileClick = (x, y, actorType = 'player') => {
    if (activeTurn !== actorType || localDungeonState.gameOver || !localDungeonState.playerClass) return;
    
    const actor = actorType === 'player' ? localDungeonState.player : localDungeonState.wingman;
    if (!actor) return;

    if (attackTarget && typeof attackTarget === 'object' && attackTarget.type === 'secondary') {
      const targetTile = localDungeonState.board[`${y},${x}`];
      if (targetTile.type === 'enemy') {
        const enemy = localDungeonState.enemies.find(e => e.id === targetTile.enemyId);
        if (enemy) handleAttack('player', enemy, 'secondary');
      } else { addLog("No enemy at that location. Attack cancelled.", 'text-yellow-400'); }
      setAttackTarget(null);
      return;
    }
    
    const currentAP = actorType === 'player' ? playerActionPoints : wingmanActionPoints;
    const moveCostAP = actorType === 'player' ? 1 : (actor.moveCost || 1);
    if (currentAP < moveCostAP) { addLog("Not enough action points to move.", "text-yellow-400"); return; }

    const targetTile = localDungeonState.board[`${y},${x}`];
    if (abilityTarget && actorType === 'player') {
      if (targetTile.type === 'enemy') {
        const enemy = localDungeonState.enemies.find(e => e.id === targetTile.enemyId);
        if (enemy) handleAttack('player', enemy, abilityTarget);
      } else { addLog("No enemy at that location. Ability cancelled.", 'text-yellow-400'); }
      setAbilityTarget(null);
      return;
    }
    if (attackTarget && actorType === 'player') {
      if (targetTile.type === 'enemy') {
        const enemy = localDungeonState.enemies.find(e => e.id === targetTile.enemyId);
        if (enemy) handleAttack(actorType, enemy, attackTarget.type);
      } else { addLog("No enemy at that location. Attack cancelled.", 'text-yellow-400'); }
      setAttackTarget(null);
      return;
    }

    const bonusMoveEffect = actor.activeEffects?.find(e => e.type === 'bonus_move');
    const moveRange = actorType === 'player' ? 1.5 : (actor.moveRange || 1.5) + (bonusMoveEffect ? bonusMoveEffect.amount : 0);

    // Generic movement logic
    if (Math.hypot(x - actor.x, y - actor.y) > moveRange) { addLog("You can only move to adjacent tiles."); return; }
    if (targetTile.type === 'wall') { addLog("You can't move through a wall."); return; }
    if (targetTile.type === 'enemy') { addLog("You cannot move onto an enemy's tile."); return; }
    
    if (actorType === 'player') {
      if (targetTile.type === 'hatch' && !localDungeonState.player.hasKey) { addLog("The hatch is locked. You need a key."); return; }
      const moveCostXP = localDungeonState.player.moveCost || 5;
      if (sessionXp < moveCostXP) { addLog(`Not enough XP to move (costs ${moveCostXP}).`, 'text-red-400'); return; }
      setSessionXp(prevXp => prevXp - moveCostXP);
    } else { // Wingman-specific checks
      // Wingmen can't pick up items or use hatches
      if (['hatch', 'key', 'chest'].includes(targetTile.type)) { addLog("Your wingman cannot interact with that.", "text-yellow-400"); return; }
    }
    
    const distance = Math.round(Math.hypot(x - actor.x, y - actor.y));
    if (actorType === 'wingman') setWingmanTurnState(prev => ({ ...prev, distanceMoved: prev.distanceMoved + distance }));

    let newGold = sessionGold || 0;
    const actorStartPos = { x: actor.x, y: actor.y };
    const newBoard = { ...localDungeonState.board };
    let newActorState = { ...actor }; // Create a mutable copy of the actor
    let apDrained = false;

    if (targetTile.type === 'trap' && !targetTile.triggered) {
      const trapDamage = 15;
      newActorState.hp -= trapDamage;
      addLog(`${newActorState.name || 'You'} triggered a trap for ${trapDamage} damage!`, 'text-orange-400');
      newBoard[`${y},${x}`] = { ...targetTile, triggered: true }; // Trap becomes inert
    }
    
    if (targetTile.type === 'cobweb') {
        addLog(`${newActorState.name || 'You'} are slowed by a thick cobweb!`, 'text-slate-400');
        apDrained = true;
        // The cobweb is a one-time obstacle, so it's removed after being triggered.
        // We'll place the actor on an empty tile where the cobweb was.
        newBoard[`${y},${x}`] = { type: 'empty' };
    }


    newBoard[`${actorStartPos.y},${actorStartPos.x}`] = { type: 'empty' };
    newBoard[`${y},${x}`] = { type: actorType }; // 'player' or 'wingman'
    
    let newState = { ...localDungeonState, board: newBoard };
    if (actorType === 'player') {
        newState.player = { ...newActorState, x, y };
        newState.lastMoveTrails = [actorStartPos];
    } else {
        newState.wingman = { ...newActorState, x, y };
        newState.lastMoveTrails = [...(newState.lastMoveTrails || []), actorStartPos];
    }

    if (actorType === 'player') {
      if (targetTile.type === 'key') {
        newState.player.hasKey = true;
        newState.log.unshift({ id: Date.now(), message: `You picked up the key!`, style: 'text-yellow-400 font-bold' });
      }
      if (targetTile.type === 'chest' && !targetTile.opened) {
        let goldFound = Math.floor(Math.random() * (20 + localDungeonState.floor * 5)) + 10;
        newGold += goldFound;
        newState.log.unshift({ id: Date.now(), message: `You opened a chest and found ${goldFound} gold!`, style: 'text-yellow-400 font-bold' });
        newBoard[`${y},${x}`].opened = true;
      }
      if (targetTile.type === 'hatch') {
        if (localDungeonState.player.hasKey) { goToNextFloor(); return; }
        else { newState.log.unshift({ id: Date.now(), message: "The hatch is locked. You need a key.", style: 'text-yellow-400' }); }
      }
    }
    
    setLocalDungeonState(newState);
    setSessionGold(newGold);
    
    // --- Action Point Deduction and Turn Progression ---
    const newAP = currentAP - moveCostAP;
    if (actorType === 'player') {
      setPlayerActionPoints(newAP);
      if (newAP <= 0) {
        if (localDungeonState.wingman) setActiveTurn('wingman');
        else { setActiveTurn('enemy'); setTimeout(processEnemyTurns, 100); }
      }
    } else {
      setWingmanActionPoints(newAP);
      if (newAP <= 0) {
        setActiveTurn('enemy');
        setTimeout(processEnemyTurns, 100);
      }
    }
  };

// In App.js, inside the DungeonCrawler component

const handleAttack = (actorType, targetEnemy, attackId = 'primary') => {
    const actor = actorType === 'player' ? localDungeonState.player : localDungeonState.wingman;
    if (!actor) return;
    const actorStyle = actor.combatStyle || dungeonDefinitions.classes[actor.name.toLowerCase()]?.combatStyle;

    let weaponDef = null;
    let isAbility = false;
    
    if (actorType === 'player') {
        const playerClass = localDungeonState.playerClass;
        if (attackId === 'primary') {
            if (playerClass && dungeonDefinitions.primaryWeapons[playerClass]) {
                const classWeapons = dungeonDefinitions.primaryWeapons[playerClass];
                const allWeaponTypesForClass = Object.values(classWeapons).flat();
                weaponDef = allWeaponTypesForClass.find(w => w.id === localDungeonState.equippedWeapon);
            }
        } else if (attackId === 'secondary') {
            weaponDef = dungeonDefinitions.offhandWeapons.find(w => w.id === localDungeonState.equippedOffhandWeapon);
        } else {
            weaponDef = dungeonDefinitions.attacks.find(a => a.id === attackId);
            isAbility = true;
        }
    } else {
        weaponDef = { attackRange: actor.attackRange, attack: actor.atk };
    }

    if (!weaponDef) { addLog("Error: Could not find weapon or ability definition.", "text-red-500"); return; }

    const currentAP = actorType === 'player' ? playerActionPoints : wingmanActionPoints;
    const attackCostAP = actorType === 'player' ? 1 : (actor.attackCost || 1);
    if (currentAP < attackCostAP) { addLog("Not enough action points to attack.", "text-yellow-400"); return; }

    const distance = Math.hypot(targetEnemy.x - actor.x, targetEnemy.y - actor.y);
    const attackRange = weaponDef.attackRange || weaponDef.range;

    if (distance > attackRange) { addLog("Target is out of range.", 'text-yellow-400'); setAttackTarget(null); setAbilityTarget(null); return; }

    if (isAbility) {
        if (sessionXp < weaponDef.cost) { addLog(`Not enough XP for ${weaponDef.name}.`, 'text-red-400'); setAttackTarget(null); setAbilityTarget(null); return; }
        if ((actor.abilityUses[attackId] || 0) <= 0) { addLog(`No uses left for ${weaponDef.name}.`, 'text-yellow-400'); return; }
        setSessionXp(prevXp => prevXp - weaponDef.cost);
    }
    
    if (weaponDef.accuracy && Math.random() > weaponDef.accuracy) {
        addLog(`${actor.name || 'Your'} attack missed!`, "text-yellow-400");
    } else {
        let isGameOver = false;
        setLocalDungeonState(prevState => {
            let newState = JSON.parse(JSON.stringify(prevState));
            let { enemies, board, player, log } = newState;
            
            
            if (isAbility) player.abilityUses[attackId]--;

            let baseAttackPower = actorType === 'player' ? (weaponDef.attack || fullPlayerStats.attack) : (newState.wingman.atk || 0);
            let damageMultiplier = isAbility ? (weaponDef.effect?.damageMultiplier || 1) : 1;
            
            const chargeEffect = player.activeEffects?.find(e => e.type === 'charge');
            if (chargeEffect) {
                damageMultiplier *= (chargeEffect.level + 1);
                player.activeEffects = player.activeEffects.filter(e => e.type !== 'charge');
                log.unshift({ id: Date.now() + Math.random(), message: `Unleashed a charged attack!`, style: 'text-cyan-400 font-bold' });
            }

            const mainTarget = enemies.find(e => e.id === targetEnemy.id);
            if (!mainTarget) return prevState;

            let enemiesHitThisAction = new Set();

            const processHit = (target, dmgMultiplier = 1.0, isChain = false) => {
                if (!target || enemiesHitThisAction.has(target.id)) return;
                enemiesHitThisAction.add(target.id);

                // --- NEW: Combat Triangle Logic ---
                const targetStyle = target.combatStyle;
                let advantageModifier = 1.0;
                if (actorStyle === 'Martial' && targetStyle === 'Finesse') advantageModifier = 1.3;
                else if (actorStyle === 'Martial' && targetStyle === 'Arcane') advantageModifier = 0.7;
                else if (actorStyle === 'Finesse' && targetStyle === 'Arcane') advantageModifier = 1.3;
                else if (actorStyle === 'Finesse' && targetStyle === 'Martial') advantageModifier = 0.7;
                else if (actorStyle === 'Arcane' && targetStyle === 'Martial') advantageModifier = 1.3;
                else if (actorStyle === 'Arcane' && targetStyle === 'Finesse') advantageModifier = 0.7;
                
                let finalDamage = Math.round(baseAttackPower * damageMultiplier * dmgMultiplier * advantageModifier);

                // NEW: Volatile Magic modifier
                if (newState.floorModifier?.id === 'volatile_magic') {
                    finalDamage = Math.round(finalDamage * 1.25);
                }
                
                // --- NEW: Defensive Tile Logic ---
                const targetTile = board[`${target.y},${target.x}`];
                if (targetTile && targetTile.type === 'rubble') {
                    finalDamage = Math.round(finalDamage * 0.8); // 20% damage reduction
                    log.unshift({ id: Date.now() + Math.random(), message: `${target.name} takes cover in the rubble!`, style: 'text-stone-400' });
                }

                let targetArmor = target.armor || 0;
                const armorBreakEffect = target.statusEffects?.find(e => e.type === 'armor_break');
                if (armorBreakEffect) targetArmor = Math.max(0, targetArmor - armorBreakEffect.amount);

                const armorPiercing = (actorType === 'player' && weaponDef.armorPiercing) ? weaponDef.armorPiercing : 0;
                finalDamage = Math.max(1, finalDamage - Math.max(0, targetArmor - armorPiercing));
                
                target.hp -= finalDamage;
                log.unshift({ id: Date.now() + Math.random(), message: `${isChain ? "Chain hits" : (actor.name || 'You') + " hit"} ${target.name} for ${finalDamage} damage.`, style: 'text-slate-300' });
                setAnimationState(prev => ({ ...prev, hits: { ...prev.hits, [target.id]: Date.now() } }));

                if (actorType === 'player' && weaponDef.lifesteal) {
                    const healedAmount = Math.round(finalDamage * weaponDef.lifesteal);
                    player.hp = Math.min(fullPlayerStats.maxHp, player.hp + healedAmount);
                }

                if (actorType === 'player' && !isChain && weaponDef.statusEffect && Math.random() < weaponDef.statusEffect.chance) {
                    if (!target.statusEffects) target.statusEffects = [];
                    target.statusEffects = target.statusEffects.filter(e => e.type !== weaponDef.statusEffect.type);
                    target.statusEffects.push({ ...weaponDef.statusEffect });
                    log.unshift({ id: Date.now() + Math.random(), message: `${target.name} is now ${weaponDef.statusEffect.type}!`, style: 'text-yellow-400' });
                }
                return finalDamage;
            };
            
            processHit(mainTarget);

            if (actorType === 'player') {
                if (weaponDef.cleave) enemies.forEach(e => { if (Math.hypot(e.x - mainTarget.x, e.y - mainTarget.y) < 1.6) processHit(e, weaponDef.cleave, true); });
                if (weaponDef.aoeRange) enemies.forEach(e => { if (Math.hypot(e.x - mainTarget.x, e.y - mainTarget.y) <= weaponDef.aoeRange) processHit(e); });

                if (weaponDef.multishot) {
                    const otherTargets = enemies.filter(e => e.id !== mainTarget.id && Math.hypot(e.x - player.x, e.y - player.y) <= attackRange);
                    for(let i=0; i < weaponDef.multishot - 1 && i < otherTargets.length; i++) {
                        processHit(otherTargets[i]);
                    }
                }
                if (weaponDef.chain) {
                    let lastTarget = mainTarget;
                    let lastDamage = baseAttackPower * damageMultiplier;
                    for (let i = 0; i < weaponDef.chain.count; i++) {
                        const nextTarget = enemies.filter(e => !enemiesHitThisAction.has(e.id) && Math.hypot(e.x - lastTarget.x, e.y - lastTarget.y) <= weaponDef.chain.range).sort((a,b) => Math.hypot(a.x - lastTarget.x, a.y - lastTarget.y) - Math.hypot(b.x - lastTarget.x, b.y - lastTarget.y))[0];
                        if (nextTarget) {
                            lastDamage *= weaponDef.chain.falloff;
                            processHit(nextTarget, (lastDamage / baseAttackPower), true);
                            lastTarget = nextTarget;
                        } else break;
                    }
                }
            }

            let newEnemiesToAdd = [];
            newState.enemies = enemies.filter(enemy => {
              if (enemy.hp <= 0) {
                log.unshift({ id: Date.now() + Math.random(), message: `You defeated the ${enemy.name}!`, style: 'text-green-400' });
                board[`${enemy.y},${enemy.x}`] = { type: enemy.baseId === 'keyholder_orc' ? 'key' : 'empty' };
                if (enemy.loot && Math.random() < enemy.loot.chance) addIngredientToInventory(enemy.loot.id);
                if (enemy.rareLoot && Math.random() < enemy.rareLoot.chance) addIngredientToInventory(enemy.rareLoot.id);
                
                // --- RE-INTEGRATED SPLIT LOGIC ---
                if (enemy.onDefeat?.type === 'split') {
                  const oozeDef = dungeonDefinitions.enemies.find(e => e.id === enemy.onDefeat.into);
                  if (oozeDef) {
                    for (let i = 0; i < enemy.onDefeat.count; i++) {
                      const adjacent = [{x:0,y:1}, {x:0,y:-1}, {x:1,y:0}, {x:-1,y:0}].map(d => ({x: enemy.x+d.x, y: enemy.y+d.y}));
                      const emptyTile = adjacent.find(t => board[`${t.y},${t.x}`]?.type === 'empty');
                      if(emptyTile) {
                        const newOoze = { ...oozeDef, id: `ooze_${Date.now()}_${i}`, baseId: oozeDef.id, x: emptyTile.x, y: emptyTile.y, maxHp: oozeDef.hp };
                        newEnemiesToAdd.push(newOoze);
                        board[`${emptyTile.y},${emptyTile.x}`] = { type: 'enemy', enemyId: newOoze.id };
                      }
                    }
                    log.unshift({ id: Date.now() + Math.random(), message: `The ${enemy.name} splits into smaller oozes!`, style: 'text-lime-400' });
                  }
                }
                return false;
              }
              return true;
            }).concat(newEnemiesToAdd);

            if (player.hp <= 0) isGameOver = true;
            return newState;
        });
        if (isGameOver) { handleGameOver(); return; }
    }

    setAttackTarget(null); setAbilityTarget(null);
    const newAP = currentAP - attackCostAP;
    if (actorType === 'player') {
      setPlayerActionPoints(newAP);
      if (newAP <= 0) {
        if (localDungeonState.wingman) setActiveTurn('wingman');
        else { setActiveTurn('enemy'); setTimeout(processEnemyTurns, 100); }
      }
    } else {
      setWingmanActionPoints(newAP);
      if (newAP <= 0) { setActiveTurn('enemy'); setTimeout(processEnemyTurns, 100); }
    }
};



  const handleBuyItem = (item, type, currency) => {
    const cost = item.cost;
    if (currency === 'xp' && sessionXp < cost) { showMessageBox("Not enough XP!", 'error'); return; }
    if (currency === 'gold' && sessionGold < cost) { showMessageBox("Not enough Gold!", 'error'); return; }

    setLocalDungeonState(prev => {
        const newState = { ...prev };
        if (type === 'primaryWeapon') newState.ownedWeapons = [...(newState.ownedWeapons || []), item.id];
        else if (type === 'offhandWeapon') newState.ownedOffhandWeapons = [...(newState.ownedOffhandWeapons || []), item.id];
        else if (type === 'armor') newState.ownedArmor = [...(newState.ownedArmor || []), item.id];
        else if (type === 'potion') newState.potions = (newState.potions || 0) + 1;
        else if (type === 'temp_potion') {
             const existingEffects = newState.player.activeEffects || [];
             const effectIndex = existingEffects.findIndex(e => e.id === item.id);
             if (effectIndex > -1) existingEffects[effectIndex].remainingFloors = item.duration;
             else existingEffects.push({ id: item.id, remainingFloors: item.duration });
             newState.player.activeEffects = existingEffects;
        }
        return newState;
    });

    if (currency === 'xp') setSessionXp(prev => prev - cost);
    if (currency === 'gold') setSessionGold(prev => prev - cost);
    
    showMessageBox(`Purchased ${item.name}! Go to the Armory to equip it.`, 'info');
  };
  
  const handleBuyStat = (stat) => {
    if (sessionXp < 300) { showMessageBox("Not enough XP!", 'error'); return; }

    setLocalDungeonState(prev => ({ ...prev, boughtStats: { ...prev.boughtStats, [stat]: (prev.boughtStats[stat] || 0) + 10 } }));
    setSessionXp(prev => prev - 300);

    showMessageBox(`Bought +10 ${stat}! (Changes will be saved at the next checkpoint)`, 'info');
  };

  const handleBuyPotion = () => {
    // Check against the immediate session XP, not the potentially stale profile prop
    if (sessionXp < 100) { 
      showMessageBox("Not enough XP.", "error"); 
      return; 
    }
    // Update local state, don't write to Firestore directly
    setLocalDungeonState(prev => ({ ...prev, potions: (prev.potions || 0) + 1 }));
      setSessionXp(prev => prev - 100);
      showMessageBox("Bought a potion! (Changes will be saved at the next checkpoint)", 'info');
  };
  
  const handleEquipItem = (item, type) => {
    if (!item) return;

    if (type === 'primaryWeapon') {
        if (localDungeonState.floor <= localDungeonState.player.lastWeaponSwitchFloor) {
            showMessageBox("You can only switch your primary weapon once per floor.", "error");
            return;
        }
        setLocalDungeonState(prev => ({ ...prev, equippedWeapon: item.id, player: { ...prev.player, lastWeaponSwitchFloor: prev.floor } }));
    } else if (type === 'offhandWeapon') {
        setLocalDungeonState(prev => ({ ...prev, equippedOffhandWeapon: item.id }));
    } else if (type === 'armor') {
        setLocalDungeonState(prev => ({ ...prev, equippedArmor: item.id }));
    }
    setSelectedArmoryItem(null); // Close the details panel after equipping
  };

  const handleWingmanAbilityClick = (ability) => {
    setAttackTarget(null); // Cancel any attack targeting
    setWingmanAbilityTarget(ability);
    addLog(`Select a target for ${ability.name}.`, 'text-cyan-400');
  };

  const findEnemy = (enemyId) => {
    // This function is now defined within the component scope.
    // It uses a ref to the latest state to avoid stale closures in callbacks.
    const state = dungeonStateRef.current;
    return state.enemies.find(e => e.id === enemyId);
  };

  const handleCharge = useCallback(() => {
    if (playerActionPoints < 1) {
      addLog("Not enough AP to charge.", "text-yellow-400");
      return;
    }

    setLocalDungeonState(prev => {
      const newState = JSON.parse(JSON.stringify(prev)); // Deep copy
      let effects = newState.player.activeEffects || [];
      const chargeEffect = effects.find(e => e.type === 'charge');
      
      if (chargeEffect) {
        chargeEffect.level += 1;
      } else {
        effects.push({ type: 'charge', level: 1 });
      }
      
      newState.player.activeEffects = effects;
      return newState;
    });

    setPlayerActionPoints(prev => prev - 1);
    addLog("You focus your energy...", "text-cyan-300");
  }, [playerActionPoints, addLog]);

  const handleUseWingmanAbility = (target, isFrenzied = false) => {
    const wingman = localDungeonState.wingman;
    const abilityId = isFrenzied ? 'savage_rush' : wingmanAbilityTarget.id;
    const ability = wingman.abilities.find(a => a.id === abilityId);

    if (!wingman || !ability) return;

    if (!isFrenzied && wingmanActionPoints < ability.cost) {
        addLog(`Not enough AP for ${ability.name}.`, "text-yellow-400");
        setWingmanAbilityTarget(null);
        return;
    }

    const distance = Math.hypot(target.x - wingman.x, target.y - wingman.y);
    if (!isFrenzied && distance > ability.range) {
        addLog(`Target is out of range for ${ability.name}.`, "text-yellow-400");
        setWingmanAbilityTarget(null);
        return;
    }
    
    let success = false;
    setLocalDungeonState(prevState => {
        let newState = JSON.parse(JSON.stringify(prevState));
        let enemyTarget = target.entityType === 'enemy' ? newState.enemies.find(e => e.id === target.id) : null;
        let friendlyTarget = (target.id === 'player' || target.id === wingman.id) ? (target.id === 'player' ? newState.player : newState.wingman) : null;
        
        
        const applyDamage = (enemy, damage, armorPiercing = 0) => {
            let finalDamage = damage - Math.max(0, (enemy.armor || 0) - armorPiercing);
            finalDamage = Math.max(1, Math.round(finalDamage));
            enemy.hp -= finalDamage;
            newState.log.unshift({ id: Date.now() + Math.random(), message: `${wingman.name} hits ${enemy.name} for ${finalDamage} damage!`, style: 'text-orange-400' });
            setAnimationState(prev => ({ ...prev, hits: { ...prev.hits, [enemy.id]: Date.now() } }));
            return finalDamage;
        };

        switch(ability.id) {
            case 'taunt': {
                if (enemyTarget) {
                    if (!enemyTarget.statusEffects) enemyTarget.statusEffects = [];
                    enemyTarget.statusEffects = enemyTarget.statusEffects.filter(e => e.type !== 'taunted');
                    enemyTarget.statusEffects.push({ type: 'taunted', duration: ability.duration });
                    newState.log.unshift({ id: Date.now() + Math.random(), message: `${wingman.name} taunts ${enemyTarget.name}!`, style: 'text-cyan-400' });
                    if (ability.specialization === 'knight_ability_a') {
                        enemyTarget.statusEffects.push({ type: 'attack_debuff', multiplier: 0.8, duration: ability.duration });
                    } else if (ability.specialization === 'knight_ability_b') {
                        if(!newState.wingman.activeEffects) newState.wingman.activeEffects = [];
                        newState.wingman.activeEffects.push({ type: 'counter_attack', power: 0.5, duration: ability.duration });
                    }
                    success = true;
                }
                break;
            }
            case 'heal': {
                 if (target.id === 'player' || target.id === wingman.id) {
                    const isPlayer = target.id === 'player';
                    const healedActor = isPlayer ? newState.player : newState.wingman;
                    const maxHp = isPlayer ? fullPlayerStats.maxHp : wingman.maxHp;
                    const newHp = Math.min(maxHp, healedActor.hp + ability.power);
                    if (newHp > healedActor.hp) newState.log.unshift({ id: Date.now() + Math.random(), message: `${wingman.name} heals for ${newHp - healedActor.hp} HP.`, style: 'text-green-400' });
                    healedActor.hp = newHp;
                    if (ability.specialization === 'cleric_ability_a') { // Purifying Light
                        healedActor.statusEffects = (healedActor.statusEffects || []).filter(e => e.isPositive);
                    } else if (ability.specialization === 'cleric_ability_b') { // Divine Favor
                        if(!healedActor.activeEffects) healedActor.activeEffects = [];
                        healedActor.activeEffects.push({ type: 'damage_buff', multiplier: 1.15, durationTurns: 1 });
                    }
                    success = true;
                }
                break;
            }
            case 'firebolt': {
              if(enemyTarget) {
                applyDamage(enemyTarget, ability.power);
                if (ability.specialization === 'mage_ability_a') {
                  if (!enemyTarget.statusEffects) enemyTarget.statusEffects = [];
                  enemyTarget.statusEffects.push({ type: 'burning', damage: Math.round(ability.power * 0.2), duration: 2 });
                } else if (ability.specialization === 'mage_ability_b') {
                  if (!enemyTarget.statusEffects) enemyTarget.statusEffects = [];
                  enemyTarget.statusEffects.push({ type: 'chilled', reduction: 1, duration: 1 });
                }
                success = true;
              }
              break;
            }
            case 'fortify': {
                if (target.id === wingman.id) {
                    if (!newState.wingman.activeEffects) newState.wingman.activeEffects = [];
                    newState.wingman.activeEffects = newState.wingman.activeEffects.filter(e => e.id !== 'fortify');
                    
                    let tempHpGain = ability.effect.tempHp;
                    let effectToAdd = { id: 'fortify', duration: ability.duration, tempHp: tempHpGain };

                    // Apply specialization logic
                    if (ability.specialization === 'heavy_ability_a') { // Reinforced Plating
                        tempHpGain += 20;
                        effectToAdd.tempHp = tempHpGain;
                    } else if (ability.specialization === 'heavy_ability_b') { // Retaliation
                        effectToAdd.specialization = 'heavy_ability_b'; // Add specialization to the effect for later checks
                    }
                    
                    newState.wingman.activeEffects.push(effectToAdd);
                    newState.wingman.hp += tempHpGain;
                    newState.wingman.maxHp += tempHpGain; 
                    
                    newState.log.unshift({ id: Date.now() + Math.random(), message: `${wingman.name} fortifies for ${tempHpGain} HP!`, style: 'text-cyan-400' });
                    success = true;
                }
                break;
            }
            case 'divine_shield': {
                if (target.id === wingman.id) {
                    if (!newState.wingman.activeEffects) newState.wingman.activeEffects = [];
                    const tempHpGain = ability.effect.tempHp;
                    
                    if (tempHpGain > 0) {
                        newState.wingman.hp += tempHpGain;
                        newState.wingman.maxHp += tempHpGain;
                    }
                    const effect = { 
                        id: ability.id, 
                        duration: ability.duration, 
                        specialization: ability.specialization,
                        tempHp: tempHpGain, // Store shield value for damage calculation
                    };
                    newState.wingman.activeEffects.push(effect);
                    newState.log.unshift({ id: Date.now() + Math.random(), message: `${wingman.name} gains a divine shield for ${tempHpGain} HP!`, style: 'text-yellow-300' });
                    success = true;
                }
                break;
            }
            case 'riposte': {
                if (!newState.wingman.activeEffects) newState.wingman.activeEffects = [];
                let tempHpGain = 0;
                if (ability.id === 'fortify') tempHpGain = ability.effect.tempHp + (ability.specialization === 'heavy_ability_a' ? 20 : 0);
                if (ability.id === 'divine_shield') tempHpGain = ability.effect.tempHp;
                if (tempHpGain > 0) {
                    newState.wingman.hp += tempHpGain;
                    newState.wingman.maxHp += tempHpGain;
                }
                // Add new effect with specialization details
                const effect = { id: ability.id, duration: ability.duration, specialization: ability.specialization };
                newState.wingman.activeEffects.push(effect);
                newState.log.unshift({ id: Date.now() + Math.random(), message: `${wingman.name} uses ${ability.name}!`, style: 'text-cyan-400' });
                success = true;
                break;
            }
            case 'sunder': {
                if(enemyTarget) {
                    const damageDealt = applyDamage(enemyTarget, ability.power, ability.armorPiercing);
                    if (ability.specialization === 'undead_ability_a') enemyTarget.armor = Math.max(0, (enemyTarget.armor || 0) - 2);
                    else if (ability.specialization === 'undead_ability_b') newState.wingman.hp = Math.min(newState.wingman.maxHp, newState.wingman.hp + Math.round(damageDealt * 0.3));
                    success = true;
                }
                break;
            }
            case 'shadow_strike': {
                if (enemyTarget) {
                    applyDamage(enemyTarget, ability.power, ability.armorPiercing);
                    if (ability.specialization === 'rogue_ability_a') {
                        if (!enemyTarget.statusEffects) enemyTarget.statusEffects = [];
                        enemyTarget.statusEffects.push({ type: 'poison', damage: 5, duration: 3 });
                    } else if (ability.specialization === 'rogue_ability_b') {
                         if (!newState.wingman.activeEffects) newState.wingman.activeEffects = [];
                         newState.wingman.activeEffects.push({ type: 'bonus_move', amount: 1, durationTurns: 1});
                    }
                    success = true;
                }
                break;
                
            }
            case 'piercing_lance': {
                if(enemyTarget) {
                    let damage = ability.power;
                    if (ability.specialization === 'cavalier_ability_b') { // Momentum
                        const bonus = Math.min(0.5, (wingmanTurnState.distanceMoved || 0) * 0.1); // 10% bonus per tile, max 50%
                        damage *= (1 + bonus);
                    }
                    applyDamage(enemyTarget, damage);

                    if (ability.specialization === 'cavalier_ability_a') { // Trample
                        const dx = enemyTarget.x - wingman.x;
                        const dy = enemyTarget.y - wingman.y;
                        const behindX = enemyTarget.x + dx;
                        const behindY = enemyTarget.y + dy;
                        const behindTarget = newState.enemies.find(e => e.x === behindX && e.y === behindY);
                        if(behindTarget) {
                            applyDamage(behindTarget, damage * 0.5);
                            newState.log.unshift({ id: Date.now(), message: `The attack pierces through to ${behindTarget.name}!`, style: 'text-orange-300' });
                        }
                    }
                    success = true;
                }
                break;
            }
             case 'savage_rush': {
                if (enemyTarget) {
                    applyDamage(enemyTarget, ability.power);
                    // Knockback logic...
                    if (ability.specialization === 'warg_ability_a') {
                        if (!enemyTarget.statusEffects) enemyTarget.statusEffects = [];
                        enemyTarget.statusEffects.push({ type: 'crippled', reduction: 2, duration: 1 });
                    } else if (ability.specialization === 'warg_ability_b') {
                        if (!newState.wingman.activeEffects) newState.wingman.activeEffects = [];
                        newState.wingman.activeEffects.push({ type: 'frenzied', durationTurns: 1 });
                    }
                    success = true;
                }
                break;
             }
            default:
                if (enemyTarget) {
                    applyDamage(enemyTarget, ability.power || wingman.atk);
                    success = true;
                }
                break;
        }
        return newState;
    });

    if (success) {
        if (isFrenzied) {
            setWingmanTurnState(prev => ({ ...prev, frenziedAttackAvailable: false }));
        } else {
            const newAP = wingmanActionPoints - ability.cost;
            setWingmanActionPoints(newAP);
            if (newAP <= 0) {
              setActiveTurn('enemy');
              setTimeout(processEnemyTurns, 100);
            }
        }
    }
    setWingmanAbilityTarget(null);
  };
  
  const handleFriendlyClick = (e, target) => {
    e.stopPropagation();
    if (activeTurn === 'wingman' && wingmanAbilityTarget?.id === 'heal') {
        handleUseWingmanAbility(target);
    }
  };

  const usePotion = () => {
      if(!localDungeonState || (localDungeonState.potions || 0) <= 0) { 
        addLog("You have no potions.", 'text-yellow-400'); 
        return; 
      }
      
      setLocalDungeonState(prevState => {
        // Use the memoized fullPlayerStats to get the current maxHp
        const currentMaxHp = fullPlayerStats.maxHp; 
        return {
          ...prevState,
          potions: prevState.potions - 1,
          player: {
              ...prevState.player,
              hp: Math.min(currentMaxHp, prevState.player.hp + 50)
          },
          log: [{ message: "You used a potion and restored 50 HP.", style: 'text-green-400' }, ...(prevState.log || []).slice(0, 4)]
        }
      });
  };

  if (!localDungeonState) {
    return <div className="text-center p-10 text-xl text-slate-400">Loading Dungeon...</div>;
  }

  if (localDungeonState.phase === 'class_selection') {
    return (
      <div className="text-center" style={{backgroundImage: `url('https://www.transparenttextures.com/patterns/dark-brick-wall.png')`}}>
            <h2 className="text-3xl font-bold text-white mb-4">Choose Your Class</h2>
            <p className="text-slate-400 mb-8">Your choice will last for this entire dungeon run.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {Object.entries(dungeonDefinitions.classes).map(([key, c]) => (
                    <div key={key} className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 flex flex-col items-center hover:bg-slate-800/80 transition-colors">
                        <span className="text-6xl mb-4">{c.icon}</span>
                        <h3 className="text-2xl font-bold text-white mb-2">{c.name}</h3>
                        <p className="text-slate-400 text-sm mb-4 flex-grow">{c.description}</p>
                        <button onClick={() => handleSelectClass(key)} className="w-full bg-indigo-600 text-white font-semibold py-2 rounded-lg hover:bg-indigo-700 transition-colors">Select</button>
                    </div>
                ))}
            </div>
        </div>
    );
  }
  const renderBoard = () => {
    const size = 10;
    const boardGrid = [];

        const SVGIcons = {
      player: (id) => <div className={`w-8 h-8 text-blue-400 drop-shadow-lg transition-transform ${animationState.hits[id] > Date.now() - 200 ? 'entity-hit' : ''}`}><svg viewBox="0 0 20 20" className="w-full h-full"><path fill="currentColor" d="M10 2a2.5 2.5 0 110 5a2.5 2.5 0 010-5zM5.121 12.121a5.002 5.002 0 018.758 0L15 13.25V18H5v-4.75l.121-.129z"/></svg></div>,
      key: () => <div className="w-8 h-8 text-yellow-400 drop-shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-5.0 -10.0 110.0 135.0" className="w-full h-full"><path fill="currentColor" d="m83.75 17.812 0.3125-0.3125c0.625-0.625 1.25-1.875 1.25-2.8125s-0.625-2.1875-1.25-2.8125c-1.5625-1.5625-4.0625-1.5625-5.625 0l-12.812 12.5c-1.25-0.625-2.8125-0.625-3.75 0.625-0.9375 0.9375-1.25 2.5-0.625 3.75l-29.375 29.375c-1.25-0.625-2.8125-0.625-3.75 0.625-0.625 0.625-0.9375 1.25-0.9375 2.1875-5.3125-2.1875-11.875-1.25-16.25 3.125-5.9375 5.9375-5.9375 15.312 0 20.938 2.8125 2.8125 6.875 4.375 10.625 4.375s7.5-1.5625 10.625-4.375c4.375-4.375 5.625-10.938 3.125-16.25 0.625 0 1.5625-0.3125 2.1875-0.9375s0.9375-1.25 0.9375-2.1875c0-0.625 0-0.9375-0.3125-1.5625l29.375-29.375c0.3125 0.3125 0.9375 0.3125 1.5625 0.3125 0.9375 0 1.5625-0.3125 2.1875-0.9375s0.9375-1.25 0.9375-2.1875c0-0.625 0-0.9375-0.3125-1.5625l0.3125-0.3125 7.1875 7.1875c0.3125 0.3125 0.625 0.3125 0.625 0.3125 0.3125 0 0.625 0 0.625-0.3125l2.1875-2.1875c0.3125-0.3125 0.3125-0.625 0.3125-0.625s0-0.625-0.3125-0.625l-2.8125-2.8125 3.75-3.75 0.9375 0.9375-0.9375 0.9375c-0.3125 0.3125-0.3125 0.625-0.3125 0.625s0 0.625 0.3125 0.625l3.4375 3.4375c0.3125 0.3125 1.25 0.3125 1.5625 0l4.375-4.375c0.625-0.625 0.625-1.25 0.3125-1.5625zm-57.5 61.875c-2.8125 2.8125-7.5 2.8125-10 0-2.8125-2.8125-2.8125-7.5 0-10 2.8125-2.8125 7.5-2.8125 10 0 2.8125 2.5 2.8125 7.1875 0 10zm9.0625-13.438c-0.3125 0.3125-0.9375 0.3125-1.25 0l-4.6875-4.6875c-0.3125-0.3125-0.3125-0.9375 0-1.5625 0.3125-0.3125 0.9375-0.3125 1.25 0l4.6875 4.6875c0.625 0.625 0.625 1.25 0 1.5625zm33.75-33.75c-0.3125 0.3125-0.9375 0.3125-1.25 0l-4.6875-4.6875c-0.3125-0.3125-0.3125-0.9375 0-1.5625 0.3125-0.3125 0.9375-0.3125 1.25 0l4.6875 4.6875c0.625 0.3125 0.625 0.9375 0 1.5625z"/></svg></div>,
      chest_closed:  () => <div className="w-10 h-10 text-amber-500 drop-shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-5.0 -10.0 110.0 135.0" className="w-full h-full"><path fill="currentColor" d="m48.609 45.832v4.168c0 0.76562 0.62109 1.3906 1.3906 1.3906s1.3906-0.62109 1.3906-1.3906v-4.168c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906h-2.7773c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76562 0.62109 1.3906 1.3906 1.3906z"/><path fill="currentColor" d="m70.832 76.391h4.168c3.832 0 6.9453-3.1094 6.9453-6.9453v-27.777c0-9.957-8.0977-18.055-18.055-18.055h-27.777c-9.957 0-18.055 8.0977-18.055 18.055v27.777c0 3.832 3.1094 6.9453 6.9453 6.9453h45.832zm-26.387-27.781v-6.9453c0-0.76562 0.625-1.3906 1.3906-1.3906h8.332c0.76562 0 1.3906 0.625 1.3906 1.3906v11.109c0 0.76562-0.625 1.3906-1.3906 1.3906h-8.332c-0.76563 0-1.3906-0.625-1.3906-1.3906v-4.168zm34.723-6.9414v27.777c0 2.293-1.875 4.168-4.168 4.168 0.875-1.168 1.3906-2.6094 1.3906-4.168v-20.832c0-0.76562-0.625-1.3906-1.3906-1.3906h-16.668v-2.7773h16.668c0.76562 0 1.3906-0.625 1.3906-1.3906v-1.3906c0-5.7773-2.7344-10.93-6.9727-14.234 5.6953 2.207 9.75 7.7656 9.75 14.234zm-54.168 31.941c-2.293 0-4.168-1.875-4.168-4.168v-27.777c0-6.4727 4.0547-12.027 9.75-14.234-4.2344 3.3047-6.9727 8.457-6.9727 14.234v1.3906c0 0.76562 0.625 1.3906 1.3906 1.3906h16.668v2.7773h-16.668c-0.76562 0-1.3906 0.625-1.3906 1.3906v20.832c0 1.5547 0.51562 3 1.3906 4.168z"/><path fill="currentColor" d="m93.785 72.43c-1.3633-0.84375-3.8203-2.7695-4.9688-6.2031-1.6328-4.8945 0.75781-9.1406 1.2539-9.9414 0.40234-0.65234 0.20313-1.5078-0.44922-1.9102s-1.5078-0.20312-1.9141 0.44922c-0.85547 1.3867-3.4961 6.3672-1.5234 12.281 0.91797 2.75 2.5039 4.7148 3.9688 6.0469-2.0469 0.89844-4.5234 2.4688-6.543 5.1875-2.3633 3.1758-3.0586 6.5195-3.1758 9.0195-3.0234-1.8008-6.6562-2.2695-10.023-1.1797-2.9023 0.93359-4.8242 2.7695-6.043 4.4492l-1.9102-7.6289c-0.1875-0.74219-0.94141-1.1992-1.6836-1.0117-0.74609 0.1875-1.1992 0.94141-1.0117 1.6836l2.7773 11.109c0.14844 0.59766 0.67578 1.0234 1.2891 1.0508h0.058594c0.59375 0 1.1211-0.375 1.3125-0.94141 0.16016-0.47266 1.7031-4.668 6.0547-6.0703 3.375-1.0859 7.0938-0.14844 9.707 2.4414 0.42187 0.42188 1.0664 0.52344 1.6016 0.25391 0.53125-0.26953 0.83594-0.84766 0.75-1.4375-0.24219-1.6914-0.48047-6.0547 2.5156-10.086 2.4805-3.3398 5.8008-4.5898 7.5625-5.0391 0.53906-0.13672 0.94531-0.58594 1.0312-1.1367 0.085937-0.55078-0.16797-1.0977-0.64453-1.3906z"/><path fill="currentColor" d="m5.5547 37.5h6.9453c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906h-3.7539c1.4844-1.8906 3.0273-4.5703 3.7266-8.0625 0.79688-3.9844 0.16797-7.4219-0.625-9.8164 2.3242 0.042968 5.1797-0.30469 8.1797-1.6992 3.5391-1.6406 5.8828-4.0781 7.375-6.1992 1.3594 2.8945 3.8086 5.1719 6.8594 6.25 3.1758 1.125 6.0781 0.61328 8.1094-0.12109l-0.66016 2.6406c-0.1875 0.74219 0.26562 1.5 1.0117 1.6836 0.73828 0.18359 1.4961-0.26562 1.6836-1.0117l1.3906-5.5547c0.14062-0.5625-0.082031-1.1523-0.5625-1.4805-0.47656-0.32812-1.1094-0.32422-1.5859 0.007813-0.41016 0.28516-4.1055 2.7539-8.4609 1.2148-3.1445-1.1133-5.457-3.8945-6.0391-7.2617-0.10156-0.59766-0.58203-1.0586-1.1797-1.1406-0.61719-0.082031-1.1836 0.23438-1.4414 0.78516-0.92969 1.9688-3.1602 5.5781-7.6602 7.6641-3.5039 1.6211-6.793 1.5859-8.9375 1.2734-0.50391-0.074219-1.0156 0.13672-1.3203 0.55078-0.30469 0.41406-0.35547 0.96094-0.13672 1.4219 0.875 1.832 2.207 5.6016 1.2812 10.238-0.92969 4.6367-3.6055 7.6055-5.1211 8.9609-0.42969 0.38281-0.57812 0.99219-0.37109 1.5312 0.20312 0.53906 0.72266 0.89453 1.2969 0.89453z"/><path fill="currentColor" d="m69.445 11.109c0.76953 0 1.3906-0.62109 1.3906-1.3906v-1.3906c0-0.76562-0.62109-1.3906-1.3906-1.3906-0.76953 0-1.3906 0.62109-1.3906 1.3906v1.3906c0 0.76562 0.62109 1.3906 1.3906 1.3906z"/><path fill="currentColor" d="m65.277 13.891h1.3906c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906h-1.3906c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76562 0.62109 1.3906 1.3906 1.3906z"/><path fill="currentColor" d="m69.445 13.891c-0.76953 0-1.3906 0.62109-1.3906 1.3906v1.3906c0 0.76562 0.62109 1.3906 1.3906 1.3906 0.76953 0 1.3906-0.62109 1.3906-1.3906v-1.3906c0-0.76562-0.62109-1.3906-1.3906-1.3906z"/><path fill="currentColor" d="m72.223 13.891h1.3906c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906h-1.3906c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76562 0.62109 1.3906 1.3906 1.3906z"/><path fill="currentColor" d="m86.109 8.332c0.76953 0 1.3906-0.62109 1.3906-1.3906v-1.3906c0-0.76562-0.62109-1.3906-1.3906-1.3906s-1.3906 0.62109-1.3906 1.3906v1.3906c0 0.76562 0.62109 1.3906 1.3906 1.3906z"/><path fill="currentColor" d="m81.945 11.109h1.3906c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906h-1.3906c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76562 0.62109 1.3906 1.3906 1.3906z"/><path fill="currentColor" d="m86.109 11.109c-0.76953 0-1.3906 0.62109-1.3906 1.3906v1.3906c0 0.76562 0.62109 1.3906 1.3906 1.3906s1.3906-0.62109 1.3906-1.3906v-1.3906c0-0.76562-0.62109-1.3906-1.3906-1.3906z"/><path fill="currentColor" d="m88.891 11.109h1.3906c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906h-1.3906c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76562 0.62109 1.3906 1.3906 1.3906z"/><path fill="currentColor" d="m8.332 76.391v1.3906c0 0.76562 0.62109 1.3906 1.3906 1.3906 0.76953 0 1.3906-0.62109 1.3906-1.3906v-1.3906c0-0.76562-0.62109-1.3906-1.3906-1.3906-0.76953 0-1.3906 0.62109-1.3906 1.3906z"/><path fill="currentColor" d="m6.9453 79.168h-1.3906c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76562 0.62109 1.3906 1.3906 1.3906h1.3906c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906z"/><path fill="currentColor" d="m9.7227 81.945c-0.76953 0-1.3906 0.62109-1.3906 1.3906v1.3906c0 0.76563 0.62109 1.3906 1.3906 1.3906 0.76953 0 1.3906-0.62109 1.3906-1.3906v-1.3906c0-0.76563-0.62109-1.3906-1.3906-1.3906z"/><path fill="currentColor" d="m13.891 79.168h-1.3906c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76562 0.62109 1.3906 1.3906 1.3906h1.3906c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906z"/><path fill="currentColor" d="m25 88.891c0.76953 0 1.3906-0.62109 1.3906-1.3906v-1.3906c0-0.76562-0.62109-1.3906-1.3906-1.3906s-1.3906 0.62109-1.3906 1.3906v1.3906c0 0.76562 0.62109 1.3906 1.3906 1.3906z"/><path fill="currentColor" d="m22.223 88.891h-1.3906c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76562 0.62109 1.3906 1.3906 1.3906h1.3906c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906z"/><path fill="currentColor" d="m25 91.668c-0.76953 0-1.3906 0.62109-1.3906 1.3906v1.3906c0 0.76562 0.62109 1.3906 1.3906 1.3906s1.3906-0.62109 1.3906-1.3906v-1.3906c0-0.76562-0.62109-1.3906-1.3906-1.3906z"/><path fill="currentColor" d="m29.168 88.891h-1.3906c-0.76953 0-1.3906 0.62109-1.3906 1.3906 0 0.76562 0.62109 1.3906 1.3906 1.3906h1.3906c0.76953 0 1.3906-0.62109 1.3906-1.3906 0-0.76562-0.62109-1.3906-1.3906-1.3906z"/></svg></div>,
      chest_opened: () => <div className="w-10 h-10 text-amber-600 opacity-70 drop-shadow-lg"><svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-5.0 -10.0 110.0 135.0" className="w-full h-full"><path fill="currentColor" d="m92.949 53.078h-85.871c-0.57812-0.011719-1.0508 0.46094-1.0508 1.0391v5.0781c0 0.57813 0.46875 1.0508 1.0508 1.0508l33.73 0.003906c1.1289 0 2.0508 0.92188 2.0508 2.0391v4.2695c0 0.28125 0.10938 0.53906 0.30859 0.73828l3.8984 3.8984c0.19922 0.19922 0.46094 0.30859 0.73828 0.30859h4.4297c0.28125 0 0.53906-0.10938 0.73828-0.30859l3.8984-3.8984c0.19922-0.19922 0.30859-0.46094 0.30859-0.73828v-4.2695c0-1.1211 0.92187-2.0391 2.0508-2.0391h33.73c0.57812 0 1.0508-0.46875 1.0508-1.0508v-5.0703c0-0.57812-0.46875-1.0508-1.0508-1.0508z"/><path fill="currentColor" d="m87.871 81.301c0 0.53125-0.21875 1.0703-0.60938 1.4414l-4.5117 4.5117c-0.37891 0.39062-0.91016 0.60938-1.4414 0.60938l-62.59-0.003906c-0.53125 0-1.0703-0.21875-1.4414-0.60938l-4.5117-4.5117c-0.39062-0.37891-0.60938-0.91016-0.60938-1.4414v-1.9031l-6.125 0.003906v29.68c0 1.1289 0.91016 2.0391 2.0391 2.0391h83.891c1.1289 0 2.0391-0.91016 2.0391-2.0391v-29.68h-6.1289z"/><path fill="currentColor" d="m14.211 62.281v19.031l4.5117 4.5117h62.59l4.5117-4.5117v-19.031h-26.602v5.1211c0 0.26953-0.10156 0.53125-0.30078 0.71875l-5.1211 5.1211c-0.19141 0.19922-0.44922 0.30078-0.71875 0.30078h-6.1289c-0.26953 0-0.53125-0.10156-0.71875-0.30078l-5.1211-5.1211c-0.19922-0.19141-0.30078-0.44922-0.30078-0.71875v-5.1211z"/><path fill="currentColor" d="m7.4883 11.121h85.062c-1.0117-2.0898-2.75-3.6719-4.8398-4.4883-1.0312-0.41016-2.1406-0.62891-3.3086-0.62891l-68.762-0.003906c-1.7617 0-3.4102 0.5-4.8203 1.3906-1.4102 0.89062-2.5586 2.1719-3.3281 3.7305z"/><path fill="currentColor" d="m62.5 26.27-4.3906 5.5195h6.8008z"/><path fill="currentColor" d="m35.121 31.789h6.8008l-4.3906-5.5195z"/><path fill="currentColor" d="m43.352 33.84h-7l11.02 9.5703z"/><path fill="currentColor" d="m43.988 31.109 4.043-5.668h-8.543z"/><path fill="currentColor" d="m46.02 31.789h7.9922l-3.9922-5.6094z"/><path fill="currentColor" d="m7.5508 19.301 8.3711 20.461h24.148l-6.9609-6.0391c-0.16016-0.12891-0.25-0.28125-0.32812-0.44922-0.019531-0.050782-0.039062-0.089844-0.058594-0.14844-0.03125-0.10156-0.058594-0.19922-0.058594-0.30859 0-0.011718 0.011719-0.019531 0.011719-0.03125-0.019531-0.21875-0.011719-0.44922 0.078125-0.67188l3.4609-7.8906c0.17188-0.39062 0.5-0.66016 0.89844-0.76953h0.03125c0.12109-0.03125 0.21875-0.050781 0.32812-0.050781h25.09c0.12109 0 0.23047 0.019531 0.32812 0.050781h0.03125c0.39844 0.12109 0.73047 0.39062 0.89844 0.76953l3.4609 7.8906c0.089844 0.21875 0.10156 0.44922 0.078125 0.67188 0 0.011719 0.011719 0.019532 0.011719 0.03125 0 0.12109-0.03125 0.21094-0.058594 0.30859-0.019531 0.050781-0.039062 0.089844-0.058594 0.14844-0.078125 0.17187-0.17969 0.32031-0.32812 0.44922l-6.9609 6.0391h24.148l8.3711-20.461z"/><path fill="currentColor" d="m9.8281 49.012-1.6406 2.0195h83.652l-2.9414-3.6016-4.5898-5.6094h-26.699l-6.6914 5.8008c-0.16016 0.14062-0.35156 0.21875-0.53125 0.26953-0.10156 0.03125-0.21094 0.050781-0.32031 0.050781-0.019531 0-0.03125 0.011719-0.050781 0.011719s-0.03125-0.011719-0.050781-0.011719c-0.12109 0-0.21875-0.019531-0.32031-0.050781-0.19141-0.050781-0.37891-0.14062-0.53125-0.26953l-6.6914-5.8008h-26.703z"/><path fill="currentColor" d="m50.02 44.41 4.4297-10.57h-8.8711z"/><path fill="currentColor" d="m56.039 31.109 4.5-5.668h-8.5391z"/><path fill="currentColor" d="m56.68 33.84-4.0195 9.5703 11.02-9.5703z"/><path fill="currentColor" d="m92.949 13.16h-85.898c-0.57812 0-1.0508 0.48047-1.0508 1.0586l0.019531 2c0 0.57031 0.46875 1.0391 1.0508 1.0391l85.879 0.003907c0.57812 0 1.0508-0.46875 1.0508-1.0508v-2c0-0.57813-0.46875-1.0508-1.0508-1.0508z"/></svg></div>,
      // Enemies
      goblin: (id) => <div className={`w-5 h-5 text-lime-400 drop-shadow-lg transition-transform ${animationState.hits[id] > Date.now() - 200 ? 'entity-hit' : ''}`}><svg xmlns='http://www.w3.org/2000/svg' xmlnsXlink='http://www.w3.org/1999/xlink' version='1.1' x='0px' y='0px' viewBox='0 0 296.169 488.008' style={{enableBackground:'new 0 0 296.169 488.008'}} xmlSpace='preserve'><g fill="currentColor"><path d='M251.239,469.32l-15.584-6.922c-9.972-4.428-16.415-14.34-16.415-25.25v-26.795l-4.806,6.929   c-0.624,0.899-1.589,1.504-2.67,1.673c-1.086,0.169-2.185-0.112-3.053-0.779l-13.507-10.367l-11.098,13.85   c-0.71,0.887-1.763,1.429-2.896,1.493c-0.075,0.004-0.15,0.006-0.225,0.006c-1.055,0-2.07-0.417-2.822-1.165l-7.589-7.555   c1.909,14.146,4.522,36.294,3.186,42.971c-1.199,6.003-4.935,10.723-7.857,13.624c-1.914,1.901-2.969,4.37-2.969,6.952v0.399   c0,5.307,4.316,9.623,9.623,9.623h74.717c5.384,0,9.765-4.381,9.765-9.765C257.04,474.388,254.763,470.885,251.239,469.32z'/><path d='M167.754,400.341l12.896,12.839l10.762-13.43c1.358-1.7,3.829-2,5.557-0.672l13.284,10.196l9.7-13.986   c1.229-1.774,3.645-2.25,5.454-1.083l12.877,8.302l-15.488-61.351c-8.171-2.333-39.195-10.461-74.712-10.461   s-66.541,8.128-74.712,10.461l-15.488,61.351l12.877-8.302c1.809-1.167,4.224-0.691,5.454,1.083l9.7,13.986l13.284-10.196   c1.727-1.325,4.195-1.028,5.557,0.672l10.762,13.43l12.896-12.839c1.535-1.526,4.007-1.555,5.575-0.067l14.094,13.371   l14.094-13.371C163.749,398.786,166.22,398.814,167.754,400.341z'/><path d='M184.558,185.718c4.238-3.44,6.349-7.709,6.471-13.098c-2.208,0.679-4.517,1.039-6.88,1.039h-6.15   C178.914,178.902,181.067,182.899,184.558,185.718z'/><path d='M105.141,172.62c0.122,5.389,2.233,9.658,6.471,13.098c3.491-2.819,5.643-6.816,6.558-12.059h-6.15   C109.658,173.659,107.349,173.299,105.141,172.62z'/><path d='M172.128,239.8c21.341-8.008,38.856-24.864,46.748-38.017c2.561-4.269,4.979-9.923,7.186-16.808   c0.521-1.625,2.014-2.74,3.72-2.778c0.176-0.005,19.033-0.736,32.733-17.494c6.763-8.273,11.313-24.152,16.131-40.963   c4.774-16.659,9.689-33.807,17.523-47.553c-9.123,0.363-24.585,1.612-33.313,5.854c-10.613,5.158-17.107,15.558-18.826,18.58   c0.225,4.692,0.307,9.315,0.275,13.822c7.071-9.418,16.194-17.063,27.27-22.812c1.959-1.018,4.375-0.255,5.393,1.707   c1.019,1.961,0.254,4.375-1.707,5.393c-13.503,7.011-23.785,17.119-30.6,30.077c2.855,3.123,7.362,9.247,7.706,17.066   c0.506,11.487-8.201,18.826-8.571,19.133c-0.746,0.617-1.649,0.918-2.548,0.918c-1.15,0-2.293-0.494-3.084-1.45   c-1.408-1.702-1.17-4.224,0.532-5.632c0.044-0.037,6.006-5.174,5.679-12.617c-0.338-7.687-7.096-13.495-7.164-13.553   c-0.986-0.835-1.478-2.072-1.405-3.307l-0.014-0.001c2.049-33.403-0.863-78.914-26.371-106.034C194.859,7.85,174.224,0,148.085,0   s-46.774,7.85-61.336,23.332c-25.508,27.12-28.42,72.631-26.371,106.034l-0.011,0.001c0.076,1.241-0.419,2.483-1.42,3.317   c-0.057,0.048-6.814,5.856-7.152,13.543c-0.327,7.434,5.618,12.567,5.679,12.617c1.702,1.408,1.94,3.93,0.532,5.632   c-0.791,0.956-1.934,1.45-3.084,1.45c-0.898,0-1.802-0.301-2.548-0.918c-0.37-0.307-9.077-7.646-8.571-19.133   c0.344-7.819,4.851-13.943,7.706-17.066c-6.814-12.958-17.097-23.066-30.6-30.077c-1.961-1.018-2.726-3.432-1.707-5.393   c1.018-1.962,3.433-2.726,5.393-1.707c11.076,5.749,20.199,13.394,27.27,22.812c-0.032-4.507,0.049-9.13,0.275-13.823   c-1.714-3.013-8.209-13.419-18.826-18.579C24.575,77.794,9.119,76.547,0,76.186c7.835,13.747,12.749,30.894,17.524,47.555   c4.817,16.811,9.368,32.689,16.131,40.963c13.7,16.758,32.558,17.489,32.746,17.494c1.696,0.049,3.189,1.162,3.708,2.778   c2.206,6.885,4.624,12.539,7.185,16.808c7.894,13.154,25.41,30.011,46.752,38.018c2.068,0.776,3.116,3.082,2.34,5.15   c-0.603,1.605-2.127,2.596-3.746,2.596c-0.467,0-0.941-0.082-1.404-0.256c-9.799-3.676-18.859-9.09-26.707-15.197   c-16.247,13.932-32.635,39.116-45.308,69.772c-11.578,28.011-17.818,55.527-15.528,68.472c2.016,11.389,12.201,19.56,18.145,23.448   l29.308-116.096c0.54-2.142,2.71-3.442,4.857-2.898c2.142,0.54,3.439,2.715,2.898,4.857l-13.273,52.58   c12.399-3.27,40.336-9.533,72.458-9.533s60.059,6.263,72.458,9.533l-13.273-52.58c-0.541-2.143,0.757-4.317,2.898-4.857   c2.147-0.541,4.318,0.758,4.857,2.898l29.308,116.096c5.943-3.886,16.129-12.058,18.146-23.448   c2.29-12.944-3.95-40.461-15.528-68.472c-12.673-30.655-29.061-55.84-45.308-69.772c-7.847,6.106-16.905,11.519-26.703,15.196   c-0.463,0.174-0.938,0.256-1.404,0.256c-1.619,0-3.144-0.99-3.746-2.596C169.012,242.882,170.06,240.576,172.128,239.8z    M154.666,118.55c1.283-1.798,3.781-2.216,5.58-0.93l2.487,1.776c1.803,1.288,4.139,1.442,6.097,0.405l31.628-16.777   c1.95-1.038,4.373-0.292,5.407,1.659c1.035,1.951,0.293,4.372-1.659,5.407l-31.628,16.777c-2.047,1.086-4.269,1.623-6.48,1.623   c-2.815,0-5.613-0.87-8.015-2.585l-2.486-1.776C153.799,122.847,153.382,120.348,154.666,118.55z M192.632,141.16   c0,4.1-3.323,7.423-7.423,7.423c-4.1,0-7.423-3.323-7.423-7.423s3.323-7.423,7.423-7.423   C189.308,133.737,192.632,137.061,192.632,141.16z M90.305,104.684c1.034-1.951,3.456-2.697,5.407-1.659l31.628,16.777   c1.96,1.037,4.294,0.883,6.097-0.405l2.487-1.776c1.798-1.283,4.296-0.868,5.58,0.93s0.867,4.297-0.931,5.58l-2.487,1.776   c-2.4,1.715-5.199,2.585-8.014,2.585c-2.212,0-4.434-0.536-6.48-1.623l-31.628-16.777C90.012,109.056,89.27,106.635,90.305,104.684   z M118.402,141.16c0,4.1-3.323,7.423-7.423,7.423s-7.423-3.323-7.423-7.423s3.323-7.423,7.423-7.423   S118.402,137.061,118.402,141.16z M126.284,173.659c-1.268,9.254-5.515,16.104-12.667,20.389c-0.634,0.379-1.345,0.568-2.056,0.568   c-0.761,0-1.52-0.217-2.183-0.647c-9.064-5.901-13.184-14.666-12.033-25.453l-5.24-3.841c-1.782-1.307-2.168-3.81-0.862-5.591   c1.308-1.783,3.813-2.168,5.591-0.862l6.084,4.459c2.659,1.948,5.807,2.979,9.103,2.979h72.129c3.296,0,6.443-1.03,9.103-2.979   l6.084-4.459c1.78-1.303,4.284-0.92,5.591,0.862c1.306,1.781,0.92,4.284-0.862,5.591l-5.24,3.841   c1.151,10.787-2.969,19.552-12.033,25.453c-0.663,0.431-1.423,0.647-2.183,0.647c-0.711,0-1.422-0.189-2.056-0.568   c-7.152-4.285-11.399-11.135-12.667-20.389H126.284z'/><path d='M122.407,457.408c-1.335-6.676,1.278-28.823,3.187-42.97l-7.589,7.555c-0.805,0.8-1.907,1.211-3.047,1.159   c-1.134-0.064-2.187-0.606-2.896-1.493l-11.098-13.85l-13.507,10.367c-0.868,0.666-1.969,0.947-3.053,0.779   c-1.081-0.169-2.046-0.773-2.67-1.673l-4.806-6.929v26.795c0,10.91-6.443,20.822-16.414,25.25l-15.585,6.921   c-3.523,1.565-5.801,5.068-5.801,8.924c0,5.384,4.381,9.765,9.765,9.765h74.717c5.307,0,9.623-4.316,9.623-9.623v-0.399   c0-2.582-1.055-5.051-2.969-6.951C127.343,468.132,123.607,463.412,122.407,457.408z'/></g></svg></div>,
      skeleton: (id) => <div className={`w-10 h-10 text-slate-300 drop-shadow-lg transition-transform ${animationState.hits[id] > Date.now() - 200 ? 'entity-hit' : ''}`}><svg xmlns='http://www.w3.org/2000/svg' version='1.1' viewBox='-5.0 -10.0 110.0 135.0' fill="currentColor"> <path d='m55.238 20.16c1.2539-0.79297 2.207-1.9844 2.7109-3.3828 0.47656-1.3789 0.44531-2.8867-0.089844-4.2461-0.58203-1.4375-1.6172-2.6445-2.9492-3.4414-3.0234-1.8164-6.7969-1.8164-9.8203 0-1.332 0.79297-2.3672 2.0039-2.9492 3.4414-0.51172 1.332-0.50781 2.8086 0.003906 4.1406 0.57812 1.4648 1.6172 2.7031 2.957 3.5352 0.39063 0.25 0.625 0.67969 0.625 1.1445v2.918c0 0.011719 0.003907 0.019531 0.011719 0.027344 0.0625 0.046875 0.13672 0.070313 0.21484 0.066406h8.4219c0.050781 0.007813 0.10547-0.007812 0.14453-0.039062h0.007813c0.007812-0.011719 0.011718-0.03125 0.007812-0.050781v-2.9219c0-0.49609 0.26953-0.94922 0.70312-1.1914zm5.2812-2.5h-0.003906c-0.61719 1.7617-1.75 3.293-3.25 4.4023v2.2109-0.003907c0.003906 0.76562-0.30859 1.4961-0.86328 2.0234-0.54688 0.51562-1.2734 0.80469-2.0234 0.80078h-2.9492v1.2539l14.023-0.003906c0.58203 0 1.1016 0.37109 1.2891 0.92578l4.418 13 4.1289 4.5742c1.5664-0.42969 3.2188-0.42578 4.7852 0.011719 1.8789 0.53125 3.5352 1.6562 4.7266 3.207 0.43359 0.59375 0.31641 1.4297-0.26562 1.8789-0.58594 0.44922-1.4219 0.35547-1.8867-0.21875-0.83594-1.0859-1.9961-1.875-3.3164-2.25-0.85938-0.24219-1.7578-0.29297-2.6406-0.15625l1.0273 2.5664c0.16016 0.33594 0.17578 0.72656 0.039062 1.0781-0.13672 0.34766-0.41016 0.625-0.75781 0.76562-0.35156 0.14063-0.74219 0.13281-1.082-0.027343-0.33984-0.15625-0.60156-0.44922-0.71875-0.80469l-1.5-3.75-4.7461-5.2617c-0.13281-0.14844-0.23438-0.32422-0.29297-0.51172l-4.1797-12.301h-13.051v3.1094h11.234c0.75391 0 1.3672 0.60937 1.3672 1.3633 0 0.75391-0.61328 1.3633-1.3672 1.3633h-11.234v2.9766h8.3164c0.37109-0.011718 0.72656 0.12891 0.98828 0.38672 0.26562 0.25391 0.41406 0.60938 0.41406 0.97656 0 0.36719-0.14844 0.71875-0.41406 0.97656-0.26172 0.25781-0.61719 0.39453-0.98828 0.38672h-8.3164v2.9766h5.5352c0.36719-0.011719 0.72266 0.12891 0.98828 0.38672 0.26172 0.25391 0.41016 0.60938 0.41016 0.97656 0 0.36719-0.14844 0.71875-0.41016 0.97656-0.26562 0.25781-0.62109 0.39453-0.98828 0.38672h-5.5352v3.7578l4.3203-1.8711c1.7695-0.80078 3.8555-0.24219 4.9922 1.3359 1.1328 1.5742 0.99609 3.7344-0.32422 5.1562-0.80469 1.0078-1.4297 2.1484-1.8477 3.3711-0.43359 1.3008-0.64844 2.6641-0.64062 4.0352 0 0.042969 0 0.085938-0.007813 0.12891-0.011719 0.71484-0.22656 1.4141-0.625 2.0117-0.34766 0.51562-0.81641 0.94141-1.3633 1.2383l-0.12891 0.066407 2.8828 12.258c0.050781 0.21875 0.046875 0.44922-0.011719 0.66797l-2.4297 11.801h2.4414c0.36719-0.011719 0.72266 0.12891 0.98828 0.38672 0.26172 0.25391 0.41406 0.60938 0.41406 0.97656 0 0.36719-0.15234 0.71875-0.41406 0.97656-0.26562 0.25781-0.62109 0.39844-0.98828 0.38672h-4.1133c-0.089844 0-0.17969-0.007813-0.26953-0.027344-0.73438-0.15234-1.207-0.86719-1.0625-1.6016l2.7227-13.23-2.8984-12.336c-0.38281-0.10938-0.74219-0.27734-1.0742-0.49609l-0.085938-0.0625-0.51953-0.35547 0.003906 0.003906c-0.78906-0.48047-1.7812-0.46875-2.5586 0.023437l-0.69922 0.42578c-0.28906 0.1875-0.59766 0.33594-0.92578 0.4375l-2.9062 12.355 2.7227 13.23c0.14844 0.73438-0.32422 1.4531-1.0586 1.6016-0.089844 0.019531-0.17969 0.027344-0.27344 0.027344h-4.1133c-0.36719 0.011718-0.72266-0.12891-0.98828-0.38672-0.26562-0.25391-0.41406-0.60938-0.41406-0.97656 0-0.36719 0.14844-0.71875 0.41406-0.97656 0.26562-0.25781 0.62109-0.39453 0.98828-0.38672h2.4414l-2.4297-11.801c-0.058594-0.21875-0.0625-0.44922-0.011719-0.66797l2.8711-12.203c-0.078125-0.035156-0.15625-0.074219-0.23438-0.11719h0.003906c-0.55469-0.30078-1.0273-0.73047-1.3789-1.25-0.41797-0.63281-0.64062-1.375-0.62891-2.1328h-0.011719c0.003906-1.3398-0.22656-2.6719-0.67578-3.9336l-0.019532-0.0625v0.003906c-0.45312-1.2383-1.1016-2.3906-1.9258-3.4141-1.3242-1.4258-1.457-3.582-0.32422-5.1602 1.1367-1.5742 3.2227-2.1328 4.9922-1.332l4.4531 1.9336v-3.8164h-5.3984c-0.36719 0.011719-0.72656-0.12891-0.98828-0.38672-0.26562-0.25391-0.41406-0.60938-0.41406-0.97656 0-0.36719 0.14844-0.71875 0.41406-0.97656 0.26172-0.25781 0.62109-0.39844 0.98828-0.38672h5.3984v-2.9766h-8.1836c-0.36719 0.011719-0.72266-0.12891-0.98828-0.38672-0.26172-0.25391-0.41016-0.60938-0.41016-0.97656 0-0.36719 0.14844-0.71875 0.41016-0.97656 0.26562-0.25781 0.62109-0.39844 0.98828-0.38672h8.1836v-2.9766h-11.098c-0.75391 0-1.3672-0.60938-1.3672-1.3633 0-0.75391 0.61328-1.3633 1.3672-1.3633h11.098v-3.1094h-12.914l-4.1914 12.336c-0.058594 0.17578-0.15234 0.33594-0.27734 0.47656l-4.7695 5.2812-1.6289 3.7617c-0.13672 0.33984-0.40234 0.60547-0.74219 0.74609-0.33984 0.13672-0.71875 0.13672-1.0547-0.007813-0.33594-0.14844-0.59766-0.42187-0.73047-0.76172-0.12891-0.33984-0.11719-0.72266 0.035156-1.0547l1.1016-2.5352c-0.92578-0.13281-1.8672-0.074219-2.7656 0.17188-1.3516 0.35547-2.5469 1.1406-3.4141 2.2383-0.46875 0.55078-1.2891 0.63672-1.8633 0.19141-0.57422-0.44141-0.69922-1.2578-0.28516-1.8516 1.2266-1.5703 2.9297-2.6953 4.8516-3.2109 1.6133-0.4375 3.3125-0.44141 4.9297-0.007812l4.1289-4.5742 4.3906-12.918c0.16016-0.59375 0.69922-1.0078 1.3164-1.0078h13.883v-1.25h-2.7461c-0.75391-0.003906-1.4844-0.28516-2.0469-0.79297-0.57422-0.51953-0.90625-1.2578-0.90625-2.0312v-2.207c-1.5352-1.125-2.7148-2.668-3.3984-4.4453-0.74609-1.9492-0.74609-4.1055 0.003907-6.0547 0.79297-1.9961 2.2109-3.6758 4.0469-4.7852 3.9023-2.3711 8.7969-2.3711 12.699 0 1.8359 1.1094 3.2578 2.7891 4.0469 4.7852 0.76562 1.9531 0.80859 4.1133 0.125 6.0977zm-6.4492 47.559h-0.003906 0.13672c0.15234-0.015625 0.29688-0.058594 0.42969-0.13281 0.16016-0.085938 0.29688-0.21094 0.39844-0.36328 0.10547-0.16016 0.16797-0.33984 0.17969-0.53125v-0.10156 0.003906c-0.007813-1.6719 0.26172-3.3281 0.79297-4.9102 0.51953-1.5352 1.3047-2.9609 2.3203-4.2227 0.027343-0.039063 0.058593-0.074219 0.089843-0.10547 0.44922-0.47266 0.50391-1.1953 0.12891-1.7227-0.375-0.53125-1.0742-0.72266-1.668-0.45703l-4.875 2.1172c-0.59375 0.25781-1.2266 0.39844-1.8711 0.41406h-0.11719c-0.65625 0-1.3086-0.13281-1.9141-0.38281l-0.085937-0.03125-4.8711-2.1172h0.003906c-0.59375-0.26953-1.2969-0.082031-1.6719 0.44922-0.375 0.53516-0.32031 1.2578 0.12891 1.7266l0.074219 0.085938c1.0312 1.2695 1.8398 2.7031 2.4023 4.2383l0.027344 0.066407h-0.003907c0.55469 1.5586 0.83984 3.1953 0.83594 4.8477v0.015625c-0.003906 0.21484 0.058594 0.42188 0.17578 0.60156 0.20703 0.30469 0.54297 0.49609 0.91016 0.51953h0.125c0.18359-0.015624 0.35937-0.074218 0.50781-0.17187l0.070312-0.046876 0.64453-0.38672c1.6758-1.0859 3.8359-1.0938 5.5195-0.019532l0.078125 0.050782 0.48828 0.33594 0.0625 0.039063c0.16406 0.11328 0.35938 0.17969 0.55859 0.1875zm-6.25-51.438c0 0.20312-0.078124 0.39453-0.22266 0.53906-0.30078 0.27734-0.76562 0.26563-1.0547-0.023437-0.28906-0.28906-0.29688-0.75781-0.019531-1.0547 0.21875-0.21875 0.54687-0.28516 0.83203-0.16797 0.28516 0.11719 0.46875 0.39844 0.46875 0.70312zm1.707-2.4648c0.17969 0.17969 0.33594 0.37891 0.47266 0.58984 0.13672-0.21094 0.29297-0.41016 0.47266-0.58984 1.3242-1.3242 3.4609-1.3633 4.832-0.082031l0.09375 0.085937v-0.003906c0.65234 0.65234 1.0195 1.5391 1.0195 2.4648 0 0.92188-0.36719 1.8086-1.0195 2.4609-0.65234 0.65234-1.5391 1.0234-2.4609 1.0234s-1.8086-0.37109-2.4609-1.0234h-0.007812 0.003906c-0.17969-0.17969-0.33594-0.375-0.47266-0.58594-0.13672 0.21484-0.29688 0.41016-0.47656 0.58984-0.64844 0.67188-1.543 1.0508-2.4766 1.0586-0.93359 0.007812-1.8281-0.35938-2.4883-1.0195s-1.0273-1.5586-1.0195-2.4922c0.007813-0.93359 0.39063-1.8242 1.0625-2.4766 0.65234-0.65234 1.5352-1.0195 2.4609-1.0195 0.92188 0 1.8086 0.36719 2.4609 1.0195zm-1.9727 9.7695 1.3008-2.3359-0.003907 0.003906c0.22266-0.44531 0.66406-0.73047 1.1602-0.75 0.49219-0.023437 0.96094 0.22656 1.2188 0.64844l1.4062 2.3008c0.29688 0.41406 0.33594 0.96094 0.10156 1.4141-0.23047 0.45703-0.69922 0.74219-1.2109 0.74219h-2.7891c-0.48047 0-0.92578-0.25391-1.168-0.67188-0.24609-0.41406-0.25391-0.92578-0.019531-1.3477zm6.1445-7.3047c0.007812 0.20703-0.066407 0.40625-0.21094 0.55469-0.14453 0.14844-0.33984 0.23437-0.54688 0.23437-0.20703 0-0.40234-0.085937-0.54688-0.23437-0.14062-0.14844-0.21875-0.34766-0.21094-0.55469 0-0.19922 0.078125-0.39453 0.22266-0.53516 0.28125-0.27734 0.73047-0.29297 1.0352-0.039063l0.039063 0.039063c0.14062 0.14453 0.21875 0.33594 0.21875 0.53516z' fill-rule='evenodd'/></svg></div>,
      bat: (id) => <div className={`w-10 h-10 text-slate-500 drop-shadow-lg transition-transform ${animationState.hits[id] > Date.now() - 200 ? 'entity-hit' : ''}`}><svg xmlns='http://www.w3.org/2000/svg' version='1.1' viewBox='-5.0 -10.0 110.0 135.0' fill="currentColor"> <path d='m37.23 47.188 3.1719-1.1875c-0.26172 0.89844-0.625 1.4727-1.0781 1.6562-0.47656 0.19922-1.1953 0.035156-2.0938-0.46875zm-25.234 5.9375c0.43359 12.23 5.918 18.414 15.617 24.461-0.4375-1.9297-0.14062-3.9844 0.90625-5.832 1.1953-2.1094 3.168-3.5469 5.5-4.125-10.414-4.6992-17.672-9.4727-22.023-14.504zm25.621 4.3555c-0.625-0.5-1.2344-1.0312-1.8164-1.6172-1.4688-1.4648-2.7148-3.1406-3.6719-4.9141-8.8516 3.4492-13.875 0.35938-21.977-4.6797-4.6328 4.9258-5.2617 11.918-4.9531 17.008 0.6875 11.328 6.668 24.504 14.062 31.59-0.67969-4.1406-0.12891-7.6992 1.6406-10.414 1.4219-2.1875 3.6172-3.793 6.3164-4.6641-4.5703-2.7773-9.125-6.0273-12.363-10.613-3.5508-5.0352-5.168-11.301-4.9453-19.152 0.015625-0.45313 0.31641-0.84375 0.75391-0.96875 0.4375-0.12891 0.90234 0.046874 1.1562 0.42187 3.7969 5.7188 11.52 11.117 23.582 16.5-0.34766-1.4609-0.36328-3.0117-0.015625-4.4844 0.37891-1.6172 1.1641-3.0117 2.2305-4.0117zm25.652-52.281c-5.0898-0.30859-12.082 0.32422-17.008 4.9531 5.0391 8.1055 8.1289 13.129 4.6797 21.98 1.7773 0.95703 3.4492 2.2031 4.918 3.668 0.57812 0.58203 1.1133 1.1875 1.6172 1.8164 1.0039-1.0625 2.3945-1.8477 4-2.2266 1.6055-0.37891 3.3086-0.32422 4.8828 0.12109-5.4297-12.258-10.883-20.094-16.652-23.93-0.375-0.25-0.54688-0.71875-0.42578-1.1562 0.12891-0.43359 0.51953-0.73828 0.96875-0.75 7.8594-0.22266 14.121 1.3906 19.156 4.9453 4.5273 3.1953 7.7578 7.6758 10.516 12.191 0.89844-2.5117 2.4453-4.5547 4.5234-5.9062 2.7148-1.7656 6.2734-2.3164 10.414-1.6367-7.082-7.3984-20.262-13.375-31.59-14.07zm-9.9023 6.5547c4.9961 4.3203 9.7305 11.496 14.391 21.777 0.65234-2.1172 2.0312-3.8945 3.9922-5.0078 1.9922-1.1328 4.2344-1.3867 6.3008-0.78906-6.1172-9.9219-12.305-15.539-24.684-15.98zm6.207 35.828c0.39844 3.625-0.62109 6.8672-2.875 9.1211-4.7227 4.7227-13.438 3.6875-19.43-2.3047-1.8203-1.8203-3.2578-3.9844-4.1602-6.2578-0.058594-0.14844-0.14844-0.28516-0.27344-0.39062-2.3555-2.1016-4.7148-5.25-7.0156-9.3672 2.1211 0.17188 3.8945 0.58594 5.2891 1.2422 0.26953 0.125 0.58203 0.12891 0.85938 0.007812 0.27344-0.12109 0.48438-0.35156 0.57422-0.64062 0.49609-1.5547 1.3086-2.9062 2.4219-4.0273 1.1172-1.1133 2.4688-1.9297 4.0312-2.4219 0.28516-0.089844 0.51562-0.30078 0.63672-0.57422 0.12109-0.27734 0.11719-0.58984-0.011718-0.85938-0.64844-1.3945-1.0625-3.168-1.2344-5.2891 4.1133 2.3008 7.2578 4.6602 9.3633 7.0156 0.10547 0.12109 0.24219 0.21484 0.39453 0.27344 2.2734 0.90234 4.4336 2.3438 6.2539 4.1602 2.9258 2.9375 4.7656 6.5938 5.1758 10.312zm-16.773-3.082c0.042969-0.35938-0.10547-0.71484-0.39453-0.9375-0.28516-0.22266-0.66406-0.28125-1.0039-0.15234l-6.7734 2.5273c-0.35156 0.13281-0.60547 0.44141-0.66406 0.8125s0.085937 0.74219 0.38281 0.97656c1.7617 1.3984 3.2578 2.0898 4.5391 2.0898 0.4375 0 0.85156-0.078125 1.2383-0.23828 1.4844-0.61328 2.3555-2.2734 2.6758-5.0781zm0.75781-2.0898c0.20312 0.25391 0.50391 0.39844 0.82031 0.39844 0.039063 0 0.078125 0 0.12109-0.003906 2.8008-0.32031 4.4648-1.1953 5.0781-2.6758 0.63281-1.5273 0.027344-3.4141-1.8516-5.7773-0.23047-0.29297-0.60547-0.4375-0.97656-0.37891s-0.67969 0.3125-0.8125 0.66406l-2.5273 6.7734c-0.13281 0.33594-0.074218 0.71484 0.14844 1zm11.906 1.5742c-0.53516-0.21094-1.1367 0.054687-1.3516 0.58594-1.6133 4.0977-5.4492 7.9336-9.5391 9.543-0.53516 0.21094-0.79688 0.81641-0.58984 1.3477 0.16406 0.41406 0.55859 0.66016 0.96875 0.66016 0.12891 0 0.25391-0.023438 0.38281-0.074219 1.0078-0.39453 2-0.91406 2.957-1.5312l1.1992 1.1992c0.20703 0.20703 0.46875 0.30469 0.73828 0.30469 0.26562 0 0.53125-0.097656 0.73438-0.30469 0.41016-0.40234 0.41016-1.0625 0-1.4688l-0.96484-0.96484c1.2031-0.96484 2.3164-2.0781 3.2891-3.2812l0.96094 0.96484c0.20312 0.20312 0.46875 0.30469 0.73828 0.30469 0.26953 0 0.53125-0.10156 0.73828-0.30469 0.40234-0.41016 0.40234-1.0625 0-1.4727l-1.2031-1.1992c0.61719-0.95703 1.1328-1.9492 1.5312-2.9609 0.20703-0.53125-0.054687-1.1367-0.58594-1.3477zm-7.8086-4.6523c0.19922-0.47656 0.03125-1.1992-0.46875-2.0977l-1.1836 3.1758c0.89844-0.26562 1.4648-0.63281 1.6523-1.0781z'/></svg></div>,
      slime: (id) => <div className={`w-10 h-10 text-green-400 drop-shadow-lg transition-transform ${animationState.hits[id] > Date.now() - 200 ? 'entity-hit' : ''}`}><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 60 75' x='0px' y='0px' fill="currentColor"><path d='M51.525,49.463C49.089,48.476,45,46.064,45,41V28a10.986,10.986,0,0,0-4-8.479V13.315a7,7,0,1,0-6,0v3.736c-.33-.03-.662-.051-1-.051H26c-.338,0-.67.021-1,.051V13.315a7,7,0,1,0-6,0v6.206A10.986,10.986,0,0,0,15,28V41c0,5.063-4.088,7.476-6.527,8.464a4.045,4.045,0,0,0-.07,7.424C11.091,58.05,17.472,60,30,60s18.909-1.95,21.6-3.113a4.046,4.046,0,0,0-.075-7.424ZM38,2a4.977,4.977,0,0,1,3.974,2H34.026A4.977,4.977,0,0,1,38,2Zm1,5a1,1,0,1,1-1-1A1,1,0,0,1,39,7ZM33,7a5,5,0,0,1,.1-1h2.083A2.966,2.966,0,0,0,35,7a3,3,0,0,0,6,0,2.966,2.966,0,0,0-.184-1H42.9A5,5,0,1,1,33,7Zm4,6.92a6.29,6.29,0,0,0,2,0v4.294a10.9,10.9,0,0,0-2-.787ZM22,2a4.977,4.977,0,0,1,3.974,2H18.026A4.977,4.977,0,0,1,22,2Zm1,5a1,1,0,1,1-1-1A1,1,0,0,1,23,7ZM17,7a5,5,0,0,1,.1-1h2.083A2.966,2.966,0,0,0,19,7a3,3,0,0,0,6,0,2.966,2.966,0,0,0-.184-1H26.9A5,5,0,1,1,17,7Zm4,6.92a6.29,6.29,0,0,0,2,0v3.507a10.9,10.9,0,0,0-2,.787ZM50.8,55.052C48.257,56.153,42.168,58,30,58S11.743,56.153,9.2,55.053a2.046,2.046,0,0,1,.026-3.737A13.721,13.721,0,0,0,15,47.105V52a1,1,0,0,0,2,0V28a9.01,9.01,0,0,1,9-9h8a9.01,9.01,0,0,1,9,9V52a1,1,0,0,0,2,0v-4.9a13.707,13.707,0,0,0,5.773,4.21,2.047,2.047,0,0,1,.031,3.737Z'/><path d='M27,44a3,3,0,1,0-3,3A3,3,0,0,0,27,44Zm-3,1a1,1,0,1,1,1-1A1,1,0,0,1,24,45Z'/><path d='M30,47a4,4,0,1,0,4,4A4,4,0,0,0,30,47Zm0,6a2,2,0,1,1,2-2A2,2,0,0,1,30,53Z'/><path d='M37,42a3,3,0,1,0,3,3A3,3,0,0,0,37,42Zm0,4a1,1,0,1,1,1-1A1,1,0,0,1,37,46Z'/><path d='M21.553,28.9A7.278,7.278,0,0,0,23,29.361V32a7,7,0,0,0,14,0V29.361a7.278,7.278,0,0,0,1.447-.466,1,1,0,0,0,.448-1.328,1.009,1.009,0,0,0-1.331-.467c-.019.008-1.987.9-7.564.9-5.517,0-7.5-.872-7.563-.9a1,1,0,0,0-.884,1.794ZM35,32a5,5,0,0,1-10,0V29.715c.582.076,1.24.144,2,.193V32a2,2,0,0,0,2,2h2a2,2,0,0,0,2-2V29.908c.76-.049,1.418-.117,2-.193Zm-4-2.01V32H29V29.99c.322.006.653.01,1,.01S30.678,30,31,29.99Z'/></svg></div>,
      ooze: (id) => <div className={`w-6 h-6 text-lime-600 drop-shadow-lg transition-transform ${animationState.hits[id] > Date.now() - 200 ? 'entity-hit' : ''}`}><svg viewBox="0 0 20 20" className="w-full h-full"><path fill="currentColor" d="M10 2a8 8 0 00-8 8c0 4.42 3.58 8 8 8s8-3.58 8-8a8 8 0 00-8-8z"/></svg></div>,
      skeleton_archer: (id) => <div className={`w-10 h-10 text-slate-400 drop-shadow-lg transition-transform ${animationState.hits[id] > Date.now() - 200 ? 'entity-hit' : ''}`}><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill="currentColor"><g><path d='M57.8,35.1c3.9,0,7.1-3.2,7.1-7.1s-3.2-7.1-7.1-7.1s-7.1,3.2-7.1,7.1S53.9,35.1,57.8,35.1z M57.8,23.9 c2.3,0,4.1,1.8,4.1,4.1s-1.8,4.1-4.1,4.1s-4.1-1.8-4.1-4.1S55.5,23.9,57.8,23.9z'/><path d='M45.1,58.6c0.1,0,0.1,0,0.2,0c0.8,0,1.4-0.6,1.5-1.3c0.4-3.7,2.1-13.9,4.7-17.4c0.3-0.4,0.4-0.9,0.2-1.3 c-0.1-0.5-0.5-0.8-1-1l-22.3-7.6c0.4-1,0.9-2,1.4-2.9c6.2-10.7,18-13.6,18.1-13.6c0.8-0.2,1.3-1,1.1-1.8c-0.2-0.8-1-1.3-1.8-1.1 c-0.5,0.1-13.2,3.2-20,15c-5,8.7-5.5,19.7-1.5,32.8c0.2,0.6,0.8,1.1,1.4,1.1c0.1,0,0.3,0,0.4-0.1c0.8-0.2,1.2-1.1,1-1.9 c-2.9-9.4-3.3-17.7-1.3-24.6l20.6,7c-2.9,5.7-4.2,16.7-4.3,17.2C43.7,57.8,44.3,58.5,45.1,58.6z'/><path d='M63.1,41c-0.1-0.1-0.2-0.1-0.3-0.1c-0.1,0-0.2,0-0.3-0.1h0c0,0,0,0,0,0c-0.7-0.2-1.4,0.2-1.7,0.9 c-0.1,0.3-0.1,0.5,0,0.8c-0.3,1.4-2.9,7.9-3.4,9.2c-2.2,5.1-5.3,8.8-9.6,11.5c-1,0.6-2,1.2-3.1,1.8c-3.4,2-6.8,4-9.7,7.1 c-4.3,4.7-6,11.2-6.6,15.9c-0.1,0.8,0.5,1.6,1.3,1.7c0.1,0,0.1,0,0.2,0c0.7,0,1.4-0.5,1.5-1.3c0.6-4.2,2.1-10.1,5.9-14.3 c2.5-2.7,5.7-4.6,9-6.5c1-0.6,2.1-1.2,3.1-1.9c4.8-3,8.2-7.1,10.7-12.8c1.7-4,2.7-6.6,3.2-8.3c3.3,2,10.3,7.3,10.6,16.4 c0,0.8,0.7,1.5,1.5,1.4c0.8,0,1.5-0.7,1.4-1.5C76.4,48.1,65.1,41.9,63.1,41z'/><path d='M59.6,89.6c0.3,0,0.7-0.1,1-0.3c0.6-0.5,0.7-1.5,0.2-2.1c-7.5-9.1-9-17.6-9-17.7c-0.1-0.8-0.9-1.4-1.7-1.2 c-0.8,0.1-1.4,0.9-1.2,1.7c0.1,0.4,1.6,9.4,9.6,19.2C58.7,89.4,59.1,89.6,59.6,89.6z'/></g></svg></div>,
      shadow: (id) => <div className={`w-10 h-10 text-violet-400 drop-shadow-lg transition-transform ${animationState.hits[id] > Date.now() - 200 ? 'entity-hit' : ''}`}><svg xmlns='http://www.w3.org/2000/svg' version='1.1' viewBox='-5.0 -10.0 110.0 135.0' fill="currentColor"> <path d='m45.883 0.10938c-0.43359 0.039063-2.043 0.16797-3.5742 0.28906-2.8359 0.22656-4.3086 0.55469-9.2109 2.043-4.3789 1.332-6.5977 2.3906-12.281 5.8594-2.0859 1.2734-5.9336 4.6797-8.5391 7.5586-1.6484 1.8242-3.7891 4.957-5.8398 8.5391-2.1953 3.8438-4.2539 9.3008-5.7383 15.242-0.69141 2.7617-0.70703 2.918-0.69922 8.0352 0.011719 6.0273 0.085938 6.6211 1.5977 12.637 1.2539 4.9961 2.6367 8.4727 5.0312 12.688 2.1797 3.8398 6.2891 9.0781 9.1992 11.734 1.457 1.3281 6.2812 4.8164 8.9375 6.4609 6.8125 4.2109 13.883 6.918 21.582 8.2578 3.3438 0.58203 8.707 0.72266 12.07 0.3125 5.0703-0.61328 12.66-3.2773 19.535-6.8477l3.5469-2.418 3.4492-3.1914c5.168-5.2695 8.7227-10.152 11.594-15.914 3.7344-7.4922 4.5547-19.875 1.918-28.938-1.793-6.1562-4.7109-10.922-9.5234-15.555-2.5156-2.418-5.1953-5.1836-9.3008-7.3047-1.3789-0.71094-2.2109-0.98047-3.6367-1.5977-1.8984-0.82031-2.918-0.90625-4.875-2.0664-2.2773-1.3516-2.6562-1.7109-2.6562-2.5156 0-0.80859 0.6875-1.5117 2.6211-2.668 5.5508-3.3242 7.8867-4.7578 8.2578-5.0664 0.32422-0.27344 0.39453-0.51562 0.28125-1-0.33203-1.4023-1.4531-1.3125-4.6758 0.375-4.5117 2.3633-12.566 6.2227-16.055 7.6992-1.8711 0.78906-3.5156 1.5234-3.6484 1.625-0.13672 0.10547-2.3594 1.0352-4.9414 2.0703-6.4805 2.5938-9.1367 4.1914-13.539 8.1367-5.0742 4.5547-7.4805 7.9297-9.1797 12.895-1.0742 3.1328-1.3867 5.2305-1.1211 7.4766 0.37109 3.1367 0.89062 5.1445 1.5664 6.0547 0.33984 0.46094 0.79297 1.3984 1.0078 2.0898 0.43359 1.3867 1.0664 2.1914 2.1289 2.6992 0.43359 0.20703 0.75391 0.55078 0.83984 0.90625 0.28516 1.1914 0.37891 1.332 1.0898 1.6445 0.56641 0.25 0.78906 0.52734 0.99219 1.2383 0.35156 1.2109 1.4648 1.9141 3.3281 2.0938l1.3477 0.12891 0.91797-1.0156c2.0195-2.2266 4.293-6.3359 4.7539-8.5898 0.097656-0.49219 0.33984-0.78125 0.84766-1.0195 0.38672-0.18359 1.2227-0.71875 1.8555-1.1914 0.99219-0.74609 1.1953-1.0312 1.5117-2.1133 0.19922-0.69141 0.41016-1.7227 0.46875-2.2969 0.09375-0.95703 0.21094-1.1328 1.4219-2.1562 1.4609-1.2344 4.0547-2.4805 5.5508-2.6719 0.53125-0.066407 1.3984-0.015625 1.9258 0.11719 1.0195 0.25391-0.64453 1.6523-0.14453 3.2031 0.41016 1.2695 1.168 1.9492 2.5391 2.2734l3.1953-0.71875 0.18359 1.125c0.21875 1.3516 0.085937 2.7812-0.29688 3.2109-0.15625 0.17188-0.57812 0.3125-0.94531 0.3125-0.53906 0-0.71875 0.13281-0.98828 0.72656l-0.77734 2.0469-0.45312 1.457c0 0.87109 0.097656 1.0156 1.6602 2.4727 0.91406 0.84766 2.3789 2.1641 3.2578 2.918 1.3242 1.1445 1.6562 1.5664 1.9609 2.5078 1.1328 3.4844 0.98828 9.2773-0.30078 12.062-1.5391 3.3398-4.9883 6.6953-8.6094 8.3789-2.8594 1.332-5.7383 2.0898-8.4688 2.2227-4.3281 0.21484-7.7695-0.43359-14.617-2.7539-6.9922-2.3672-14.957-8.832-19.02-15.434-4.7383-7.707-6.6797-13.961-6.6797-21.539 0-4.2148 0.25391-6.457 1.2422-11.035 0.84375-3.9023 1.4961-5.4883 4.4336-10.754 1.2539-2.2422 2.1641-3.5 4.4609-6.1562 1.5859-1.8398 3.7422-4.0547 4.7891-4.9258 4.8594-4.043 11.695-7.2852 18.387-8.7148 3.8008-0.80859 7.2773-1.2969 9.2617-1.293 2.0234 0 2.6875-0.29688 2.7852-1.2422 0.12109-1.1719-0.21094-1.2617-4.4648-1.2227-2.0586 0.015625-4.0977 0.0625-4.5312 0.10156z' fill-rule='evenodd'/></svg></div>,
      golem: (id) => <div className={`w-10 h-10 text-stone-500 drop-shadow-lg transition-transform ${animationState.hits[id] > Date.now() - 200 ? 'entity-hit' : ''}`}><svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' fill="currentColor"><path d='M316.18 22.05c-28.8.16-57.27 6.13-85.46 17.92-2.34 12.94-6.77 28.27-16.64 41.56-10.4 13.07-26.07 23.34-50.12 23.3-22.8 26.9-33.58 56.57-32.8 87.37-10.23 9.27-21.48 18.86-33.32 26.92-13.04 9.1-27.1 16.65-42.52 20.65-7.57 14.78-13.3 30.26-16.97 46.21 14.6 2.65 28.5 9.86 38.72 22.05 6.18 7.4 10.32 15.53 12.94 24.03 14.84 1.52 28.74 7.07 40.26 18.1 6.1 5.84 10.88 12.43 14.33 19.56 12.12-1.12 23.28 2.37 33.06 7.7 4.06 2.2 7.82 4.75 11.34 7.56 12.1-5.58 26.28-8.6 43.3-6.62 24.52-25.6 54.84-45.2 88.3-58.82 5.52-26.03 6.95-51.65 4.97-76.22-13.38-6.4-26.7-16.23-39.06-30.26-20.67-23.53-35.57-54.06-46.97-86.33-1.47-2.1-2.8-4.2-4.04-6.27 17.1-2.06 34.08-5.86 50.82-11.5-2.7-4.93-5.3-10.16-7.77-15.7 26.8 2.48 54.08-1.15 81.36-9.9 3.38-4.6 6.7-9.38 9.88-14.36-8.6-14.87-11.64-31.55-10.36-49.63-7.26-.22-14.56-.42-21.84-.36zm106.06 39.16c-6.66 1.1-13.18 3.1-19.26 6.05-17.2 8.45-29.14 24.22-35.73 42.06-1.68 4.6-2.93 9.28-3.73 13.96 10.23 16.84 23.38 31.73 38.66 44.28 3.16 2.65 6.43 5.14 9.78 7.48 16.57-2.8 32.92-10.03 46.14-22.4 9.46-8.87 16.64-19.42 21.5-30.83-7.72-12.96-18.55-23.92-31.5-31.7-7.87-4.73-16.4-8.04-25.28-9.86-1.71-.35-3.44-.66-5.16-.88-1.05-.13-2.1-.25-3.16-.32-.1-.02-.2-.02-.3-.02-.98-.06-1.96-.08-2.94-.08zm64.3 121.74c-14.64 6.57-28.38 13.45-41.62 20.6-10.98 5.96-21.5 12.05-31.56 18.3 5.3 9.13 8.6 18.9 9.6 28.67 13.18 1.22 27.5 4.76 41.64 11.58 4.8-10.1 11.66-19.1 19.94-26.5-1.35-16.44.26-33.18 2-52.65zm-94.02 55.07c-2.38 10.5-6.62 20.57-12.78 29.3-5.94 8.42-13.47 15.3-22.07 20.43.9 24.07-.1 48.8-5.4 74.72 12.27 3.76 24.28 8.45 35.92 14.1 6.06-6.9 13.8-12.23 22.3-15.84-1.52-17.35-.77-36.27 5.9-53.77 6.63-17.36 18.4-33.42 37.22-44.5-4.58-9.5-8.26-19.06-10.22-28.67-16.63 3.02-33.4 3.4-50.87 4.23zm-100.57 76.6c-9.55 7.43-19.12 15.46-28.22 24.12 7.27-.1 13.37 1.4 18.6 3.73 3.5-4.1 6.58-8.56 9.1-13.36 3.68-6.85 5.78-9.94.52-14.5zM44.1 390.67c-4.62 12.43-7.65 25.52-8.73 39.05 8.93 2.14 17.66 5.85 25.42 11.35 11.5-7.5 24.53-10.7 37.1-10.5-2.6-9.05-7.14-17.66-13.97-23.72-7.8-6.84-17.4-10.42-26.8-11.38-4.65-.47-9.17-.3-13.05.2zm97.78 34.36c-3.7 6.05-6.4 12.8-7.6 20-1.53 9.05-.26 17.88 3.12 25.67 8.6-1.5 17.47-1.4 26.32.93 7.22 1.88 13.73 5.23 19.26 9.62 6.6-6.82 14.72-11.5 23.26-13.97-1.94-2.92-4.1-5.63-6.6-8-8.26-7.9-19.4-11.78-30.14-10.57-.3.04-.6.08-.9.1-6.94-7.66-16.25-12.73-26.72-13.78zm94.07 34.77c-6.17 5.46-11.35 11.96-14.7 19.35-2.44 5.28-3.75 10.82-4.13 16.3 9.97 2.77 20.37 7.64 29.22 15.55 4.84-1.82 9.62-3.05 14.38-3.57-1.73-10.5-.72-21.1 2.73-31.3-11.9-1.8-20.97-7.04-27.5-16.33z'/></svg></div>,
      keyholder_orc: (id) => <div className={`w-8 h-8 text-emerald-500 drop-shadow-lg transition-transform ${animationState.hits[id] > Date.now() - 200 ? 'entity-hit' : ''}`}><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="currentColor"><g><path d="M55.4,63.3c-0.1,0.2-0.3,0.4-0.4,0.6c0.2,0.7,0.6,1.9,1.5,3c1,1.1,2.1,1.7,2.6,1.9c0,0.5,0.1,1.5-0.4,2.6 c-0.7,1.7-1.9,2.6-2.4,2.8c0.7,1.2,1.7,3.2,2.2,5.7c0.7,4.1-0.2,7.4-0.8,8.9h19.3v-1.7c-1.8-0.4-4-1-6.4-2.1 c-1.5-0.7-2.8-1.4-3.9-2.1c1.5-1.6,3.7-4.6,5.1-8.7c0.8-2.4,1-4.5,1.1-6.2c-2.5-6.5-4.9-10-6.9-12c-0.3-0.3-0.7-0.7-1.2-1.4 c-1.8,1.1-3.6,2.4-5.2,3.9C58.1,59.9,56.6,61.5,55.4,63.3z"/><path d="M61.5,41.5c-0.4-1-0.6-2.1-0.7-3.2c-0.1-1.1,0.1-2.2,0.3-3.3c0.2-1.1,0.6-2.1,0.9-3.1c0.3-1,0.6-2,0.9-3.1 c0.3-1,0.6-2.1,0.9-3.1l1.6-6.2c-1.4,0-2.5,0.2-3.5,0.3c-0.3,1.8-0.8,3.5-1.3,5.2c-0.5,1.7-1.1,3.4-1.8,5.1 c-0.7,1.7-1.5,3.3-2.4,4.8c-0.9,1.6-1.8,3.1-2.8,4.6c-1,1.5-2.2,2.9-3.5,4.2c-1.3,1.3-2.6,2.5-4.1,3.5c-2.9,2.1-6.2,3.7-9.6,4.9 c-0.4,1-1,1.8-1.4,2.4c-0.5,0.6-0.9,1.1-1.2,1.4c-1.9,2-4.4,5.5-6.9,12c0.1,1.7,0.3,3.8,1.1,6.2c1.3,4.2,3.6,7.1,5.1,8.7 c-1.1,0.7-2.4,1.4-3.9,2.1c-2.4,1.1-4.5,1.7-6.4,2.1v1.7h19.3c-0.6-1.6-1.5-4.9-0.8-8.9c0.5-2.5,1.4-4.4,2.2-5.7 c-0.5-0.3-1.7-1.2-2.4-2.8c-0.4-1.1-0.4-2-0.4-2.6c0.6-0.3,1.7-0.8,2.6-1.9c0.9-1,1.3-2.2,1.5-3c-0.1-0.2-0.3-0.4-0.4-0.6 c-1.2-1.8-2.7-3.4-4.3-4.8c-1.6-1.5-3.4-2.7-5.2-3.9c0.5,0.3,1,0.5,1.4,0.8c0.5,0.3,0.9,0.6,1.4,0.9c0.9,0.6,1.8,1.2,2.6,1.9 c1.7,1.4,3.2,3,4.5,4.7c0.1,0.2,0.3,0.4,0.4,0.5c0.5,0.7,1,1.5,1.4,2.2c0.5,1,1,1.9,1.4,3c0.7,1.6,1.2,3.2,1.7,4.9 c0.5-1.7,1-3.3,1.7-4.9c0.4-1,0.9-2,1.4-3c0.4-0.8,0.9-1.5,1.4-2.2c0.1-0.2,0.3-0.4,0.4-0.5c1.3-1.8,2.8-3.3,4.5-4.7 c0.8-0.7,1.7-1.3,2.6-1.9c0.5-0.3,0.9-0.6,1.4-0.9c0.5-0.3,0.9-0.5,1.4-0.8c-0.7-0.9-1.4-2-1.9-3.6c-0.2-0.7-0.7-2.5-0.5-4.7 c0.1-0.7,0.2-1.3,0.4-1.9c-0.3-0.4-0.6-0.9-0.8-1.4C61.9,42.5,61.7,42,61.5,41.5z"/><path d="M97.6,69c-3.7-5.5-5-10.2-5.5-13.5c-0.5-3.3-0.4-6.2-2.5-9.1c-1.8-2.6-4.5-3.8-6.4-4.5c-0.2-1.4-0.7-3.5-1.9-5.6 c-0.8-1.5-1.7-2.7-2.5-3.6c0.1-0.9,0.7-5.7-2.5-9.3c-2.2-2.4-5.1-3-7.2-3.4c-1.3-0.3-2.5-0.4-3.6-0.4c-0.3,2.1-0.6,4.2-1.1,6.3 c-0.4,2.1-1,4.2-1.6,6.2c-0.3,1-0.7,2-0.9,3.1c-0.1,0.5-0.2,1-0.3,1.5c-0.1,0.5-0.1,1-0.1,1.6c0,2.1,0.7,4.2,1.6,6.1 c1.2-3.7,4.3-5.9,5-6.3c0.8,1.5,1.9,3.2,3.2,5c1.3,1.8,2.7,3.2,3.9,4.4c1.1,2.8,2.9,6.3,5.7,10c1.5,1.9,3,3.6,4.5,4.9 c-0.6,0.4-2.9,2.3-3.6,5.6c-0.8,4,1.4,7.1,1.7,7.6c0.1-1,0.5-2.8,1.7-4.7c0.9-1.4,1.9-2.3,2.7-2.9c0.5,1.2,1.1,2.5,1.7,3.8 c0.8,1.7,1.7,3.2,2.6,4.5c-0.4,0.2-0.9,0.6-1.4,1.2c-0.9,1-1.1,2.1-1.2,2.7c0.7,0.1,1.7,0.4,2.9,1.2c1,0.6,1.6,1.4,2,1.9 c0.9-0.9,2.2-2.5,3.1-4.8C99,74,98,70.3,97.6,69z"/><path d="M45.8,46.9c2.8-2.1,5.3-4.7,7.3-7.6c1-1.4,1.9-3,2.8-4.5c0.9-1.5,1.7-3.1,2.4-4.7c1.5-3.2,2.7-6.6,3.6-10.1 c-0.3,0.1-0.6,0.1-0.8,0.2c-0.2-0.4-0.6-1-1.3-1.6c-0.5-0.5-1.1-0.8-1.5-1c0.4-0.4,0.9-0.9,1.3-1.5c0.9-1.3,1.3-2.6,1.4-3.4 c-0.6,0-2.4-0.1-3.9,1.1c-0.6,0.5-1.1,1-1.3,1.4c-0.3-0.6-1-1.7-2.3-2.7c-1.4-1-2.9-1.2-3.5-1.3c-0.6,0.1-2.1,0.3-3.5,1.3 c-1.3,0.9-2,2.1-2.3,2.7c-0.3-0.4-0.7-1-1.3-1.4c-1.6-1.2-3.4-1.2-3.9-1.1c0.2,0.8,0.5,2.1,1.4,3.4c0.4,0.6,0.9,1.1,1.3,1.5 c-0.4,0.2-0.9,0.5-1.5,1c-0.6,0.6-1,1.2-1.3,1.6c-1.6-0.4-4.5-0.8-7.9-0.2c-2.2,0.4-5.1,1-7.3,3.4c-3.2,3.5-2.6,8.4-2.5,9.3 c-0.8,0.9-1.7,2.1-2.5,3.6c-1.1,2.2-1.6,4.2-1.9,5.6c-2,0.7-4.6,2-6.4,4.5c-2.1,2.9-2,5.8-2.5,9.1c-0.5,3.3-1.9,8-5.5,13.5 C2,70.3,1,74,2.5,78.3c0.9,2.3,2.2,3.9,3.1,4.8c0.4-0.5,1-1.2,2-1.9c1.1-0.7,2.2-1,2.9-1.2c-0.1-0.5-0.3-1.6-1.2-2.7 c-0.5-0.6-1-0.9-1.4-1.2c0.9-1.3,1.7-2.8,2.6-4.5c0.7-1.3,1.2-2.6,1.7-3.8c0.7,0.6,1.8,1.5,2.7,2.9c1.2,1.9,1.6,3.6,1.7,4.7 c0.4-0.5,2.6-3.5,1.7-7.6c-0.7-3.3-3-5.1-3.6-5.6c1.4-1.3,3-3,4.5-4.9c2.8-3.6,4.6-7.1,5.7-10c1.2-1.2,2.5-2.6,3.9-4.4 c1.4-1.8,2.4-3.5,3.2-5c0.8,0.5,4.8,3.3,5.4,8.2c0.3,2.2-0.2,4.1-0.5,4.7c-0.1,0.4-0.3,0.8-0.4,1.1c1.6-0.7,3.2-1.5,4.8-2.4 C42.9,48.9,44.4,47.9,45.8,46.9z M54.2,16.3c0.4,0,0.8,0.3,0.8,0.8c0,0.4-0.3,0.8-0.8,0.8s-0.8-0.3-0.8-0.8 C53.4,16.7,53.7,16.3,54.2,16.3z M45.8,16.3c0.4,0,0.8,0.3,0.8,0.8c0,0.4-0.3,0.8-0.8,0.8c-0.4,0-0.8-0.3-0.8-0.8 C45.1,16.7,45.4,16.3,45.8,16.3z M44.6,23c0.1-0.2,0.2-0.3,0.3-0.5c0.2-0.3,0.4-0.7,0.6-1c0.2-0.4,0.3-0.7,0.5-1.1 c0.1-0.4,0.2-0.7,0.3-1.1l0.1-0.7l0.3,0.6c0.3,0.6,0.5,1.2,0.4,1.9c0,0.3-0.1,0.6-0.2,0.9c-0.1,0.2-0.2,0.5-0.3,0.7 c0.1,0,0.3-0.1,0.4-0.1c1-0.2,2-0.3,3-0.3c1,0,2,0.1,3,0.3c0.1,0,0.3,0.1,0.4,0.1c-0.1-0.2-0.2-0.4-0.3-0.6 c-0.1-0.3-0.2-0.6-0.2-0.9c-0.1-0.6,0.1-1.3,0.4-1.9l0.3-0.6l0.1,0.7c0.1,0.4,0.2,0.8,0.3,1.1c0.1,0.4,0.3,0.7,0.5,1.1 c0.2,0.4,0.4,0.7,0.6,1c0.1,0.2,0.2,0.3,0.3,0.5c0.1,0.2,0.2,0.3,0.4,0.5c-1-0.2-1.9-0.4-2.9-0.6c-1-0.1-1.9-0.2-2.9-0.1 c-1,0-1.9,0.1-2.9,0.2c-1,0.1-1.9,0.3-2.9,0.5C44.4,23.3,44.5,23.1,44.6,23z"/></g></svg></div>,
      rubble: () => <div className="w-8 h-8 text-stone-500"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M1 1 L1 5 L5 5 L5 1 Z M7 1 L7 5 L11 5 L11 1 Z M13 1 L13 5 L17 5 L17 1 Z M1 7 L1 11 L5 11 L5 7 Z M7 7 L7 11 L11 11 L11 7 Z M13 7 L13 11 L17 11 L17 7 Z M1 13 L1 17 L5 17 L5 13 Z M7 13 L7 17 L11 17 L11 13 Z M13 13 L13 17 L17 17 L17 13 Z" opacity="0.4" transform="rotate(15 10 10)"/><path d="M2 2 L2 6 L6 6 L6 2 Z M8 2 L8 6 L12 6 L12 2 Z M14 2 L14 6 L18 6 L18 2 Z M2 8 L2 12 L6 12 L6 8 Z M8 8 L8 12 L12 12 L12 8 Z M14 8 L14 12 L18 12 L18 8 Z M2 14 L2 18 L6 18 L6 14 Z M8 14 L8 18 L12 18 L12 14 Z M14 14 L14 18 L18 18 L18 14 Z" /></svg></div>,
      cobweb: () => <div className="w-10 h-10 text-slate-300 opacity-60"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2 L12 22 M2 12 L22 12 M4.9 4.9 L19.1 19.1 M4.9 19.1 L19.1 4.9"/><path d="M12 2 C 15 5, 17 8, 17 12 S 15 19, 12 22"/><path d="M12 2 C 9 5, 7 8, 7 12 S 9 19, 12 22"/><path d="M2 12 C 5 9, 8 7, 12 7 S 19 9, 22 12"/><path d="M2 12 C 5 15, 8 17, 12 17 S 19 15, 22 12"/></svg></div>,
      healing_spring: () => <div className="w-10 h-10 text-cyan-400 animate-pulse"><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" /></svg></div>,
      trap_triggered: () => <div className="w-8 h-8 text-red-500"><svg viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg></div>,
      altar: () => <div className="w-10 h-10 text-purple-400 drop-shadow-lg animate-pulse"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM5 10a5 5 0 1110 0 5 5 0 01-10 0z"/><path d="M10 4a6 6 0 100 12 6 6 0 000-12zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" opacity="0.4"/></svg></div>,
      altar_used: () => <div className="w-10 h-10 text-slate-600"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM5 10a5 5 0 1110 0 5 5 0 01-10 0z"/><path d="M10 4a6 6 0 100 12 6 6 0 000-12zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" opacity="0.4"/></svg></div>
    };
    
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        const key = `${y},${x}`;
        const tile = localDungeonState.board[key] || { type: 'empty' };
        let tileContent = null;
        let tileStyle = {};
        let tileClass = 'relative ';
        const isTrailTile = localDungeonState.lastMoveTrails?.some(t => t.x === x && t.y === y);

        if (isTrailTile) {
            tileStyle = { backgroundColor: '#334155' };
            tileClass += 'bg-slate-700/50';
        } else {
            tileStyle = {};
            tileClass += 'bg-slate-800/20';
        }

                switch(tile.type) {
            case 'wall': 
              tileClass = 'bg-black/80 shadow-inner'; 
              tileStyle = { backgroundImage: `url('https://www.transparenttextures.com/patterns/brick-wall-dark.png')`};
              break;
            case 'rubble':
              tileClass = 'bg-stone-700/50';
              tileContent = SVGIcons.rubble();
              break;
            case 'cobweb':
              tileContent = SVGIcons.cobweb();
              break;
            case 'healing_spring':
              tileContent = SVGIcons.healing_spring();
              break;
            case 'trap':
              if (tile.triggered) {
                tileClass += 'bg-red-900/30';
                tileContent = SVGIcons.trap_triggered();
              }
              // Untriggered traps are invisible to the player.
              break;
            case 'rubble':
              tileClass = 'bg-stone-700/50';
              tileStyle = { backgroundImage: `url('https://www.transparenttextures.com/patterns/asfalt-light.png')` };
              break;
            case 'cobweb':
              tileClass = 'bg-slate-800/20';
              tileContent = <div className="absolute inset-0 bg-white/20" style={{ backgroundImage: `url('https://www.transparenttextures.com/patterns/cross-scratches.png')` }} />;
              break;
            case 'healing_spring':
              tileClass = 'bg-cyan-800/50 animate-pulse';
              break;
            case 'trap':
              tileClass = `bg-slate-800/20 ${tile.triggered ? 'bg-red-900/50' : ''}`;
              if (tile.triggered) tileContent = <div className="text-red-500 text-2xl">!!</div>;
              break;
            case 'hatch':
                const hasKey = localDungeonState.player.hasKey;
                tileContent = <div className={`w-8 h-8 rounded-md transition-all duration-300 ${hasKey ? 'bg-yellow-600 shadow-[0_0_15px_rgba(250,204,21,0.7)]' : 'bg-purple-800'} border-2 border-black/20`} />;
                break;
            case 'key': tileContent = SVGIcons.key(); break;
            case 'chest': tileContent = tile.opened ? SVGIcons.chest_opened() : SVGIcons.chest_closed(); break;
            // Player and Enemy cases are removed; they will be rendered in a separate layer.
            default: break;
        }
        
        const particlesOnTile = animationState.particles.filter(p => p.x === x && p.y === y);
        const isDangerTile = dangerZone.tiles.some(t => t.x === x && t.y === y);
        const enemyPositions = new Set(localDungeonState.enemies.map(e => `${e.y},${e.x}`));
        
        const ArrowIcon = () => <svg viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 text-white opacity-60"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" /></svg>;

        let pathArrowData = null;
        if (!enemyPositions.has(key)) {
            Object.values(localDungeonState.enemyMovePaths || {}).forEach(path => {
                const index = path.findIndex(p => p && p.x === x && p.y === y);
                if (index > 0) {
                    const prev = path[index-1];
                    const curr = path[index];
                    const dx = curr.x - prev.x;
                    const dy = curr.y - prev.y;
                    
                    // Use Math.atan2 to get the precise angle in radians, then convert to degrees.
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
                    
                    pathArrowData = { rotation: angle };
                }
            });
        }

        row.push(
          <div key={key} onClick={() => handleTileClick(x, y, activeTurn)} style={tileStyle} className={`border border-slate-700/50 flex items-center justify-center transition-colors duration-200 ${tileClass} ${activeTurn !== 'enemy' ? 'cursor-pointer hover:bg-slate-600/50' : 'cursor-wait'} ${isMobile ? 'w-8 h-8' : 'w-12 h-12'}`}>
            {tileContent}
            {isDangerTile && tile.type !== 'wall' && (
              <div className="absolute inset-0 pointer-events-none bg-red-500/20 animate-pulse"></div>
            )}
            {particlesOnTile.map(p => <Particle key={p.id} onComplete={() => {}} />)}
            {pathArrowData && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none animate-fade-in" style={{ transform: `rotate(${pathArrowData.rotation}deg)`}}>
                <ArrowIcon />
              </div>
            )}
          </div>
        );
      }
      boardGrid.push(<div key={y} className="flex">{row}</div>);
    }
    
   const TILE_SIZE = isMobile ? 32 : 48;

    const WingmanSprite = ({ style }) => {
      const containerSize = 32;
      const largestDim = Math.max(style.width, style.height);
      const scale = containerSize / largestDim;
      
      return (
        <div className="relative w-full h-full overflow-hidden">
          <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: style.width, 
              height: style.height,
              backgroundImage: `url(${wingmenSpriteSheet})`,
              backgroundPosition: style.backgroundPosition,
              transform: `translate(-50%, -50%) scale(${scale})`,
              imageRendering: 'pixelated',
          }}/>
        </div>
      );
    };

    const entities = [
        ...localDungeonState.enemies.map(e => ({...e, entityType: 'enemy'})),
        {...localDungeonState.player, id: 'player', entityType: 'player', combatStyle: classDef?.combatStyle}
    ];
    if (localDungeonState.wingman) {
      entities.push({...localDungeonState.wingman, entityType: 'wingman'});
    }

    const entityElements = entities.map(entity => {
      const top = entity.y * TILE_SIZE + (TILE_SIZE / 2 - 16);
      const left = entity.x * TILE_SIZE + (TILE_SIZE / 2 - 16);
      const enemyDef = entity.entityType === 'enemy' 
        ? dungeonDefinitions.enemies.find(e => e.id === entity.baseId) 
        : null;
      const combatStyle = enemyDef ? enemyDef.combatStyle : entity.combatStyle;
      let Icon;
      if (entity.entityType === 'player') {
        Icon = SVGIcons.player(entity.id);
      } else if (entity.entityType === 'wingman') {
        Icon = <WingmanSprite style={entity.spriteStyle} />;
      } else { // enemy

        Icon = SVGIcons[entity.baseId] ? SVGIcons[entity.baseId](entity.id) : <div className="w-8 h-8 rounded-full bg-red-600" />;
      }

                  return (

        <div 
          key={entity.id} 
          onClick={
            entity.entityType === 'enemy' 
              ? (e) => handleEnemyClick(e, entity) 
              : (e) => handleFriendlyClick(e, entity)
          }
          className={`absolute z-10 ${entity.isElite ? 'elite-enemy-glow' : ''}`} 
          style={{ 
            width: 32, height: 32,
            top: top,
            left: left,

            // The browser will now automatically animate any changes to top and left.
            transition: 'top 0.25s linear, left 0.25s linear',
            cursor: 
              (entity.entityType === 'enemy' && activeTurn !== 'enemy' && (attackTarget || abilityTarget || (wingmanAbilityTarget && wingmanAbilityTarget.id !== 'heal'))) ||
              (entity.entityType !== 'enemy' && activeTurn === 'wingman' && wingmanAbilityTarget?.id === 'heal')
               ? 'pointer' : 'default'
          }}
        >
          {Icon}
          <div className="absolute -top-1 -right-1 z-20 bg-slate-900/80 rounded-full p-0.5">
            <CombatStyleIcon style={entity.combatStyle} />
          </div>
          {entity.entityType === 'enemy' && (
            <div className="absolute -bottom-2 w-full h-1.5 bg-red-900/80 rounded-full overflow-hidden border border-black/50">
              <div 
                className="h-full bg-red-500 transition-all duration-200" 
                style={{ width: `${Math.max(0, (entity.hp / entity.maxHp) * 100)}%` }}
              />
            </div>
          )}
        </div>
      );
    });

    return (
      <div className="relative">
        {boardGrid}
        {entityElements}
      </div>
    );
  };

    return (
    <div>
      {localDungeonState.floorModifier && (
        <div className="mb-4 p-4 bg-purple-900/50 border border-purple-700 rounded-lg text-center">
          <h3 className="text-xl font-bold text-purple-300">{localDungeonState.floorModifier.name}</h3>
          <p className="text-sm text-slate-400">{localDungeonState.floorModifier.description}</p>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <div><h2 className="text-3xl font-bold text-white">Dungeon Crawler</h2><p className="text-slate-400">Floor: {localDungeonState.floor} | Highest Floor: {stats.dungeon_floor || 1}</p></div>
        <div className="flex space-x-2">
            <button onClick={() => saveGame(localDungeonState)} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Save</button>
            <button onClick={() => { setBarracksOpen(false); setLocalDungeonState(prev => ({...prev, shopOpen: !prev.shopOpen, bestiaryOpen: false})); setShopView('buy'); setSelectedArmoryItem(null); }} className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">Shop / Armory</button>
            <button onClick={() => { setLocalDungeonState(prev => ({...prev, shopOpen: false, bestiaryOpen: false})); setBarracksOpen(b => !b); }} className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">Barracks</button>
            <button onClick={() => { setBarracksOpen(false); setLocalDungeonState(prev => ({...prev, bestiaryOpen: !prev.bestiaryOpen, shopOpen: false}))}} className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700">Bestiary</button>
            <button onClick={onResetDungeon} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">Reset</button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-grow flex justify-center lg:justify-start">
          <div className="p-2 bg-slate-900/50 border border-slate-700 rounded-lg inline-block relative">
            {turnIndicator && (
                <div key={turnIndicator} className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                    <div className="text-5xl font-bold text-white bg-black/50 px-8 py-4 rounded-lg animate-fade-out-fast" style={{textShadow: '0 0 10px black'}}>
                        {turnIndicator}
                    </div>
                </div>
            )}
            {renderBoard()}
          </div>
        </div>
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-slate-800/50 p-4 rounded-xl mb-4">
            <h3 className="font-bold text-white">Player Stats</h3>
            <p>HP: <span className="text-red-400 font-bold">{localDungeonState.player.hp} / {fullPlayerStats.maxHp}</span></p>
            <div className="w-full bg-slate-700 rounded-full h-2.5 mt-1"><div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${(localDungeonState.player.hp / fullPlayerStats.maxHp) * 100}%` }}></div></div>
            <p>Attack: <span className="text-yellow-400 font-bold">{fullPlayerStats.attack}</span> | Gold: <span className="text-yellow-400 font-bold">{sessionGold || 0}</span></p>
            {activeTurn === 'player' && <p>Action Points: <span className="font-bold text-cyan-400">{playerActionPoints} / 2</span></p>}
             {localDungeonState.wingman && (
              <div className="mt-2 border-t border-slate-700 pt-2">
                <h4 className="text-sm font-bold text-slate-300">Wingman: {localDungeonState.wingman.name}</h4>
                 <p>HP: <span className="text-red-400 font-bold">{localDungeonState.wingman.hp} / {localDungeonState.wingman.maxHp}</span> | Attack: <span className="text-yellow-400 font-bold">{localDungeonState.wingman.atk}</span></p>
                 {activeTurn === 'wingman' && <p>Action Points: <span className="font-bold text-cyan-400">{wingmanActionPoints} / {localDungeonState.wingman.ap}</span></p>}
              </div>
            )}
            <p>Pet: <span className="font-semibold">{stats.currentPet?.name || 'None'}</span> {localDungeonState.player.hasKey && <span className="text-yellow-300 font-bold ml-4">🔑 Key</span>}</p>
            {localDungeonState.player.activeEffects && localDungeonState.player.activeEffects.length > 0 && (
              <div className="mt-2 border-t border-slate-700 pt-2">
                <h4 className="text-sm font-bold text-slate-300">Active Effects:</h4>
                <div className="flex flex-wrap gap-2 text-xs mt-1">
                  {localDungeonState.player.activeEffects.map(effect => {
                    const def = dungeonDefinitions.temp_potions.find(p => p.id === effect.id);
                    return (
                      <span key={effect.id} className="bg-purple-600/50 text-purple-300 px-2 py-1 rounded-full">
                        {def?.name} ({effect.remainingFloors} floors left)
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl mb-4">
            <h3 className="font-bold text-white mb-2">Actions</h3>
            <div className="grid grid-cols-2 gap-2">
                {activeTurn === 'player' && (
                  <>
                    <button onClick={() => setAttackTarget({ type: 'primary' })} className="bg-red-600 text-white p-2 rounded hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-wait" disabled={!!attackTarget || !!abilityTarget || playerActionPoints < 1}>
                        {attackTarget ? "Select Target..." : `Primary Attack (1 AP)`}
                    </button>
                    <button onClick={() => setAttackTarget({ type: 'secondary' })} className="bg-red-800 text-white p-2 rounded hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-wait" disabled={!localDungeonState.equippedOffhandWeapon || !!attackTarget || !!abilityTarget || playerActionPoints < 1}>
                        Secondary Attack (1 AP)
                    </button>
                    <button onClick={usePotion} className="bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:bg-slate-600" disabled={(localDungeonState.potions || 0) <= 0}>
                        Use Potion ({localDungeonState.potions || 0})
                    </button>
                    {dungeonDefinitions.attacks.filter(a => a.class === localDungeonState.playerClass).map(attack => {
                        const usesLeft = localDungeonState.player.abilityUses?.[attack.id] || 0;
                        const canAfford = sessionXp >= attack.cost;
                        const isDisabled = usesLeft <= 0 || !canAfford || !!attackTarget || !!abilityTarget || playerActionPoints < 1;
                        
                        const handleAbilityClick = () => {
                          if (isDisabled) return;
                          setAttackTarget(null);
                          if (attack.isSelfTarget) {
                            handleAttack('player', localDungeonState.player, attack.id);
                          } else {
                            setAbilityTarget(attack.id);
                            addLog(`Select a target for ${attack.name}.`, 'text-cyan-400');
                          }
                        };

                        return (
                            <button key={attack.id} onClick={handleAbilityClick} className="bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 disabled:bg-slate-600/50 disabled:cursor-not-allowed" disabled={isDisabled}>
                                {abilityTarget === attack.id ? 'Select Target...' : `${attack.name} (${usesLeft}/${attack.maxUses})`}
                            </button>
                        );
                    })}
                    
                    {/* NEW: Charge Button */}
                    {(() => {
                        const weapon = Object.values(dungeonDefinitions.primaryWeapons.mage).flat().find(w => w.id === localDungeonState.equippedWeapon);
                        if (activeTurn === 'player' && weapon?.isChargeable) {
                          const chargeEffect = localDungeonState.player.activeEffects?.find(e => e.type === 'charge');
                          const chargeLevel = chargeEffect?.level || 0;
                          const isDisabled = chargeLevel >= weapon.maxCharges || playerActionPoints < 1;
                          return (
                            <button onClick={handleCharge} disabled={isDisabled} className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 disabled:bg-slate-600">
                              Charge Staff ({chargeLevel}/{weapon.maxCharges})
                            </button>
                          )
                        }
                        return null;
                    })()}
                  </>
                )}
                {activeTurn === 'wingman' && localDungeonState.wingman && (
                  <>
                    <button 
                      onClick={() => { setWingmanAbilityTarget(null); setAttackTarget(true); }}
                      className="bg-red-600 text-white p-2 rounded hover:bg-red-700 disabled:bg-slate-600 disabled:cursor-wait" 
                      disabled={!!attackTarget || !!wingmanAbilityTarget || wingmanActionPoints < localDungeonState.wingman.attackCost}
                    >
                      {attackTarget ? 'Select Target...' : `Attack (${localDungeonState.wingman.attackCost} AP)`}
                    </button>
                    {localDungeonState.wingman.abilities?.map(ability => (
                       <button
                           key={ability.id}
                           onClick={() => handleWingmanAbilityClick(ability)}
                           disabled={wingmanActionPoints < ability.cost || !!wingmanAbilityTarget || !!attackTarget}
                           className="bg-purple-600 text-white p-2 rounded hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-wait"
                       >
                           {wingmanAbilityTarget?.id === ability.id ? 'Select Target...' : `${ability.name} (${ability.cost} AP)`}
                       </button>
                    ))}
                    {wingmanTurnState.frenziedAttackAvailable && (
                        <button
                            onClick={() => { setWingmanAbilityTarget(null); setAttackTarget({ isFrenzied: true }); }}
                            className="col-span-2 bg-orange-600 text-white p-2 rounded hover:bg-orange-700 animate-pulse"
                        >
                          Frenzied Assault (Free Action)
                        </button>
                    )}
                  </>
                )}
                 <button onClick={() => {
                   setAttackTarget(null); // Clear any targeting state
                   setAbilityTarget(null);
                   if (activeTurn === 'player') {
                     if (localDungeonState.wingman) setActiveTurn('wingman');
                     else { setActiveTurn('enemy'); setTimeout(processEnemyTurns, 100); }
                   } else if (activeTurn === 'wingman') {
                     setActiveTurn('enemy');
                     setTimeout(processEnemyTurns, 100);
                   }
                 }} className="col-span-2 bg-slate-600 text-white p-2 rounded hover:bg-slate-700 disabled:bg-slate-800 disabled:cursor-wait" disabled={activeTurn === 'enemy'}>
                    End Turn
                </button>
            </div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl">
              <h3 className="font-bold text-white mb-2">Game Log</h3>
              <div className="space-y-1 text-sm">
                  {(localDungeonState.log || []).map((entry) => <p key={entry.id} className={entry.style}>{entry.message}</p>)}
              </div>
          </div>
        </div>
      </div>
      {localDungeonState.gameOver && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-slate-800 p-8 rounded-lg text-center border border-red-500">
                  <h2 className="text-3xl font-bold text-red-400 mb-4">Game Over!</h2>
                  <p className="text-slate-300 mb-6">You were defeated on floor {localDungeonState.floor}.</p>
                  <button onClick={onResetDungeon} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">Play Again</button>
              </div>
          </div>
      )}
            {barracksOpen && (
              <WingmanBarracks 
                stats={stats}
                wingmanDefs={wingmanDefinitions}
                updateStatsInFirestore={updateStatsInFirestore}
                showMessageBox={showMessageBox}
                sessionGold={sessionGold}
                sessionXp={sessionXp}
                isRunActive={localDungeonState.phase === 'playing' && (localDungeonState.floor > 1 || localDungeonState.turnCount > 1)}
                pendingEquippedWingman={pendingEquippedWingman}
                onEquipWingman={setPendingEquippedWingman}
              />
            )}
            {localDungeonState.shopOpen && (
              <div className="mt-6">
                <div className="flex border-b border-slate-700 mb-4">
                  <button onClick={() => setShopView('buy')} className={`px-4 py-2 text-lg font-semibold ${shopView === 'buy' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}>Buy</button>
                  <button onClick={() => { setShopView('armory'); setSelectedArmoryItem(null); }} className={`px-4 py-2 text-lg font-semibold ${shopView === 'armory' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}>Armory</button>
                </div>

                {shopView === 'buy' && (
                  <div className="flex flex-col gap-6">
                    {/* Primary Weapons Section */}
                    <div className="bg-slate-800/80 p-4 rounded-lg">
                        <h3 className="text-xl font-bold text-white mb-3">Primary Weapons</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {Object.entries(dungeonDefinitions.primaryWeapons[localDungeonState.playerClass] || {}).map(([type, weapons]) => (
                                <div key={type} className="bg-slate-900/50 p-3 rounded-md">
                                    <h4 className="font-semibold text-indigo-300 capitalize mb-2">{type}</h4>
                                    <div className="space-y-2">
                                        {weapons.map(w => {
                                            const isOwned = (localDungeonState.ownedWeapons || []).includes(w.id);
                                            const meetsWinReq = !w.tdWinsRequired || (stats.td_wins || 0) >= w.tdWinsRequired;
                                            const canAfford = sessionXp >= w.cost;
                                            const isDisabled = isOwned || !canAfford || !meetsWinReq;

                                            return <button key={w.id} onClick={() => handleBuyItem(w, 'primaryWeapon', 'xp')} disabled={isDisabled} className={`w-full p-2 rounded text-center text-sm ${isOwned ? 'bg-green-800/60' : isDisabled ? 'bg-slate-700 text-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                                                {isOwned ? 'Owned' : !meetsWinReq ? `Req. ${w.tdWinsRequired} TD Wins` : `${w.name} (${w.cost} XP)`}
                                            </button>;
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* Other Items Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-slate-800/80 p-4 rounded-lg space-y-2">
                            <h4 className="font-bold text-white">Secondary Weapons</h4>
                            {dungeonDefinitions.offhandWeapons.filter(w => w.forClass.includes(localDungeonState.playerClass)).map(w => {
                                const isOwned = (localDungeonState.ownedOffhandWeapons || []).includes(w.id);
                                return <button key={w.id} onClick={() => handleBuyItem(w, 'offhandWeapon', 'xp')} disabled={isOwned || sessionXp < w.cost} className={`w-full p-2 rounded text-center text-sm ${isOwned ? 'bg-green-800/60' : sessionXp >= w.cost ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-700 text-slate-400'}`}>{isOwned ? 'Owned' : `${w.name} (${w.cost} XP)`}</button>;
                            })}
                        </div>
                        <div className="bg-slate-800/80 p-4 rounded-lg space-y-2">
                            <h4 className="font-bold text-white">Armor</h4>
                            {dungeonDefinitions.armors.map(a => {
                                const isOwned = (localDungeonState.ownedArmor || []).includes(a.id);
                                const meetsWinReq = !a.tdWinsRequired || (stats.td_wins || 0) >= a.tdWinsRequired;
                                const canAfford = sessionXp >= a.cost;
                                const isDisabled = isOwned || !canAfford || !meetsWinReq;

                                return <button key={a.id} onClick={() => handleBuyItem(a, 'armor', 'xp')} disabled={isDisabled} className={`w-full p-2 rounded text-center text-sm ${isOwned ? 'bg-green-800/60' : isDisabled ? 'bg-slate-700 text-slate-400' : 'bg-indigo-600 hover:bg-indigo-700'}`}>
                                    {isOwned ? 'Owned' : !meetsWinReq ? `Req. ${a.tdWinsRequired} TD Wins` : `${a.name} (${a.cost} XP)`}
                                </button>;
                            })}
                        </div>
                         <div className="bg-slate-800/80 p-4 rounded-lg space-y-2">
                            <h4 className="font-bold text-white">Consumables (Gold)</h4>
                            <button onClick={() => handleBuyItem({name: 'Potion', cost: 50}, 'potion', 'gold')} disabled={(sessionGold || 0) < 50} className="w-full bg-yellow-600 text-black font-semibold p-2 rounded hover:bg-yellow-700 disabled:bg-slate-600">Buy Health Potion (50g)</button>
                            {dungeonDefinitions.temp_potions.map(p => (<button key={p.id} onClick={() => handleBuyItem(p, 'temp_potion', 'gold')} disabled={(sessionGold || 0) < p.cost} className="w-full bg-yellow-600 text-black font-semibold p-2 rounded hover:bg-yellow-700 disabled:bg-slate-600">Buy {p.name} ({p.cost}g)</button>))}
                        </div>
                    </div>
                  </div>
                )}

                {shopView === 'armory' && (() => {
                  const equippedPrimary = Object.values(dungeonDefinitions.primaryWeapons).flatMap(c => Object.values(c).flat()).find(w => w.id === localDungeonState.equippedWeapon);
                  const equippedSecondary = dungeonDefinitions.offhandWeapons.find(w => w.id === localDungeonState.equippedOffhandWeapon);
                  const equippedArmorItem = dungeonDefinitions.armors.find(a => a.id === localDungeonState.equippedArmor);
                  
                  return (
                    <div className="flex flex-col md:flex-row gap-4 min-h-[400px]">
                      {/* Left Side: Item Lists */}
                      <div className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="bg-slate-800/80 p-4 rounded-lg">
                          <h4 className="font-bold text-white mb-2">Primary Weapons</h4>
                          <div className="space-y-1 max-h-96 overflow-y-auto">{(localDungeonState.ownedWeapons || []).map(id => { const item = Object.values(dungeonDefinitions.primaryWeapons).flatMap(c => Object.values(c).flat()).find(w => w.id === id); return item ? <button key={id} onClick={() => setSelectedArmoryItem({ ...item, type: 'primaryWeapon' })} className={`w-full text-left p-2 rounded text-sm ${selectedArmoryItem?.id === id ? 'bg-indigo-500' : 'bg-slate-700 hover:bg-slate-600'}`}>{item.name}</button> : null; })}</div>
                        </div>
                        <div className="bg-slate-800/80 p-4 rounded-lg">
                          <h4 className="font-bold text-white mb-2">Secondary Weapons</h4>
                          <div className="space-y-1 max-h-96 overflow-y-auto">{(localDungeonState.ownedOffhandWeapons || []).map(id => { const item = dungeonDefinitions.offhandWeapons.find(w => w.id === id); return item ? <button key={id} onClick={() => setSelectedArmoryItem({ ...item, type: 'offhandWeapon' })} className={`w-full text-left p-2 rounded text-sm ${selectedArmoryItem?.id === id ? 'bg-indigo-500' : 'bg-slate-700 hover:bg-slate-600'}`}>{item.name}</button> : null; })}</div>
                        </div>
                        <div className="bg-slate-800/80 p-4 rounded-lg">
                          <h4 className="font-bold text-white mb-2">Armor</h4>
                          <div className="space-y-1 max-h-96 overflow-y-auto">{(localDungeonState.ownedArmor || []).map(id => { const item = dungeonDefinitions.armors.find(a => a.id === id); return item ? <button key={id} onClick={() => setSelectedArmoryItem({ ...item, type: 'armor' })} className={`w-full text-left p-2 rounded text-sm ${selectedArmoryItem?.id === id ? 'bg-indigo-500' : 'bg-slate-700 hover:bg-slate-600'}`}>{item.name}</button> : null; })}</div>
                        </div>
                      </div>
                      
                      {/* Right Side: Details & Actions */}
                      <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0 flex flex-col gap-4">
                        <div className="bg-slate-800/80 p-4 rounded-lg">
                            <h4 className="font-bold text-white mb-2">Equipped</h4>
                            <div className="space-y-2 text-sm">
                              <p><strong>Primary:</strong> <span className="text-slate-300">{equippedPrimary?.name || 'None'}</span></p>
                              <p><strong>Secondary:</strong> <span className="text-slate-300">{equippedSecondary?.name || 'None'}</span></p>
                              <p><strong>Armor:</strong> <span className="text-slate-300">{equippedArmorItem?.name || 'None'}</span></p>
                            </div>
                        </div>
                        <div className="bg-slate-800/80 p-4 rounded-lg flex-grow">
                          <h4 className="font-bold text-white mb-2">Item Details</h4>
                          {selectedArmoryItem ? (
                            <div>
                              <p className="text-lg font-semibold">{selectedArmoryItem.name}</p>
                              <div className="text-sm text-slate-300 mt-2 space-y-1">
                                {selectedArmoryItem.attack && <p>Attack: <span className="font-bold text-yellow-300">{selectedArmoryItem.attack}</span></p>}
                                {selectedArmoryItem.hp && <p>Bonus HP: <span className="font-bold text-red-300">{selectedArmoryItem.hp}</span></p>}
                                {selectedArmoryItem.description && <p className="text-xs italic text-slate-400 mt-1">{selectedArmoryItem.description}</p>}
                                {selectedArmoryItem.attackRange && <p>Range: <span className="font-bold">{selectedArmoryItem.attackRange}</span></p>}
                                {selectedArmoryItem.accuracy && <p>Accuracy: <span className="font-bold">{selectedArmoryItem.accuracy * 100}%</span></p>}
                                {selectedArmoryItem.aoeRange && <p>AoE Range: <span className="font-bold">{selectedArmoryItem.aoeRange}</span></p>}
                              </div>
                              <button onClick={() => handleEquipItem(selectedArmoryItem, selectedArmoryItem.type)} className="mt-4 w-full bg-green-600 p-2 rounded hover:bg-green-700">Equip</button>
                            </div>
                          ) : <p className="text-slate-400">Select an item to see its stats.</p>}
                        </div>
                        <div className="bg-slate-800/80 p-4 rounded-lg">
                            <h4 className="font-bold text-white mb-2">Permanent Upgrades</h4>
                            <p className="text-xs text-slate-400 mb-3">Bonus HP: +{localDungeonState.boughtStats?.hp || 0} | Bonus Atk: +{localDungeonState.boughtStats?.attack || 0}</p>
                            <div className="space-y-2">
                              <button onClick={() => handleBuyStat('hp')} disabled={sessionXp < 300} className="w-full bg-blue-600 text-white p-2 rounded text-sm hover:bg-blue-700 disabled:bg-slate-600">Buy +10 HP (300 XP)</button>
                              <button onClick={() => handleBuyStat('attack')} disabled={sessionXp < 300} className="w-full bg-blue-600 text-white p-2 rounded text-sm hover:bg-blue-700 disabled:bg-slate-600">Buy +10 Attack (300 XP)</button>
                            </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
            {localDungeonState.bestiaryOpen && (
    <div className="mt-6">
        <h3 className="text-2xl font-bold text-white mb-4">Bestiary</h3>
        <div className="bg-slate-900/50 p-4 rounded-lg mb-6 border border-slate-700">
            <h4 className="text-lg font-semibold text-center text-white mb-3">Combat Triangle</h4>
            <div className="flex justify-around items-center text-center">
                <div className="flex flex-col items-center">
                    <CombatStyleIcon style="Martial" size="w-8 h-8" />
                    <span className="font-bold text-red-400">Martial</span>
                </div>
                <span className="text-2xl text-slate-400 font-bold">&gt;</span>
                <div className="flex flex-col items-center">
                    <CombatStyleIcon style="Finesse" size="w-8 h-8" />
                    <span className="font-bold text-green-400">Finesse</span>
                </div>
                <span className="text-2xl text-slate-400 font-bold">&gt;</span>
                <div className="flex flex-col items-center">
                    <CombatStyleIcon style="Arcane" size="w-8 h-8" />
                    <span className="font-bold text-blue-400">Arcane</span>
                </div>
            </div>
            <p className="text-xs text-slate-500 text-center mt-2">Martial is strong against Finesse, Finesse against Arcane, and Arcane against Martial. (30% Damage Bonus)</p>
        </div>
        <div className="space-y-4">
            {dungeonDefinitions.bestiary.map(entry => {
                const enemyDef = dungeonDefinitions.enemies.find(e => e.id === entry.id);
                return (
                    <div key={entry.id} className="bg-slate-800/80 p-4 rounded-lg flex items-start gap-4">
                        {entry.icon}
                        <div className="flex-grow">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-xl text-white">{entry.name}</h4>
                                {enemyDef && (
                                    <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full">
                                        <CombatStyleIcon style={enemyDef.combatStyle} size="w-5 h-5" />
                                        <span className="text-sm font-semibold capitalize text-slate-300">{enemyDef.combatStyle}</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-slate-300 text-sm mt-1">{entry.description}</p>
                            <p className="text-sm mt-2"><strong className="text-yellow-400">Combat Info:</strong> <span className="text-slate-400">{entry.abilities}</span></p>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
)}
    </div>
  );
};

const ScienceLab = ({ stats, userId, updateStatsInFirestore, showMessageBox, actionLock, processAchievement }) => {

  const { lab_state } = stats;

  const [localSciencePoints, setLocalSciencePoints] = useState(lab_state?.sciencePoints || 0);
  const sciencePerSecond = useRef(0);
  const hasRunOfflineCalc = useRef(false);
  const PRESTIGE_THRESHOLD = 1e12; // 1 Trillion

  // NEW: Create refs to hold the most up-to-date state without causing effects to re-run.
  const localSciencePointsRef = useRef(localSciencePoints);
  const labStateRef = useRef(lab_state);

    // This effect keeps our refs synchronized with the latest state from props and local state.
    useEffect(() => {
      localSciencePointsRef.current = localSciencePoints;
      labStateRef.current = lab_state;
    }, [localSciencePoints, lab_state]);


  const formatNumber = (num) => {

    if (num < 1000) return num.toFixed(1);
    if (num < 1e6) return `${(num / 1e3).toFixed(2)}K`;
    if (num < 1e9) return `${(num / 1e6).toFixed(2)}M`;
    if (num < 1e12) return `${(num / 1e9).toFixed(2)}B`;
    return `${(num / 1e12).toFixed(2)}T`;
  };
  

  const { totalSPS, totalClickPower, prestigeBonus } = useMemo(() => {
    if (!lab_state) return { totalSPS: 0, totalClickPower: 0, prestigeBonus: 1 };
    let sps = 0;
    let clickPower = 0;
    const prestigeLevel = lab_state.prestigeLevel || 0;
    const prestigeBonusMultiplier = 1 + prestigeLevel * 0.10;

    // FIX: Add a guard clause to prevent crash if labEquipment hasn't loaded
    if (!lab_state.labEquipment) {
        return { totalSPS: 0, totalClickPower: 0, prestigeBonus: 1 };
    }

    for (const key in lab_state.labEquipment) {
      const definition = labEquipmentDefinitions[key];
      const count = lab_state.labEquipment[key] || 0;
      if (count > 0) {
        let itemSPS = definition.baseSPS;
        let itemClickPower = definition.clickPower;
        if (lab_state.labXpUpgrades && lab_state.labXpUpgrades[key]) {
          itemSPS *= definition.xpUpgrade.multiplier;
          itemClickPower *= definition.xpUpgrade.multiplier;
        }
        sps += itemSPS * count;
        clickPower += itemClickPower * count;
      }
    }

    const finalSPS = sps * prestigeBonusMultiplier;
    const finalClickPower = clickPower * prestigeBonusMultiplier;

    sciencePerSecond.current = finalSPS;
    return { totalSPS: finalSPS, totalClickPower: finalClickPower, prestigeBonus: prestigeBonusMultiplier };
  }, [lab_state]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setLocalSciencePoints(prev => prev + sciencePerSecond.current);
    }, 1000);
    return () => clearInterval(gameLoop);
  }, []);

// WITH THIS SINGLE, MORE EFFICIENT useEffect BLOCK
  // EFFICIENT OFFLINE & SAVE LOGIC: This single effect runs only once when the
  // component mounts. It calculates offline progress and saves it immediately.
  useEffect(() => {
    // FIX: Add a type check to ensure lastLogin is a valid Firestore Timestamp
    // before calling .toDate(). This prevents crashes for new users where the
    // serverTimestamp() might not be resolved on the initial data snapshot.
    if (lab_state && lab_state.lastLogin && typeof lab_state.lastLogin.toDate === 'function' && !hasRunOfflineCalc.current) {
      hasRunOfflineCalc.current = true; // Prevent re-running

      const lastLoginTime = lab_state.lastLogin.toDate();
      const currentTime = new Date();
      const timeDifferenceSeconds = Math.round((currentTime - lastLoginTime) / 1000);
      
      // We only calculate if the user has been away for more than a minute.
      if (timeDifferenceSeconds > 60) {
        const pointsEarned = timeDifferenceSeconds * sciencePerSecond.current;
        
        if (pointsEarned > 0) {
          const newTotalPoints = (lab_state.sciencePoints || 0) + pointsEarned;
          
          // Perform a single, efficient write to save the new total.
          updateStatsInFirestore({
            lab_state: {
              ...lab_state,
              sciencePoints: newTotalPoints,
              lastLogin: serverTimestamp(),
            },
          }).then(() => {
            // Update local state *after* successful save to ensure sync.
            setLocalSciencePoints(newTotalPoints);
            showMessageBox(
              `Welcome back! You generated ${formatNumber(pointsEarned)} Science Points.`,
              'info',
              5000,
            );
            // Process achievements after the update is confirmed.
            processAchievement('sciencePoints', newTotalPoints);
          });
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lab_state?.lastLogin]); // This dependency ensures the effect runs when login data is available.



  // FIX: This now returns JSX, preventing conditional hook calls
  if (!lab_state) {
    return <div className="text-center p-10 text-xl text-slate-400">Loading Science Lab...</div>;
  }
  const handleManualClick = () => {
    setLocalSciencePoints(prev => prev + totalClickPower);
  };

  const handleBuyEquipment = (key) => {
    const definition = labEquipmentDefinitions[key];
    const currentCount = lab_state.labEquipment?.[key] || 0;
    const cost = definition.baseCost * Math.pow(1.15, currentCount);

    if (localSciencePoints >= cost) {
      const newSciencePoints = localSciencePoints - cost;
      setLocalSciencePoints(newSciencePoints);
      const newEquipmentStats = { ...(lab_state.labEquipment || {}), [key]: currentCount + 1 };
      updateStatsInFirestore({ lab_state: { ...lab_state, sciencePoints: newSciencePoints, labEquipment: newEquipmentStats } });
    }
  };

  const handleBuyXpUpgrade = (key) => {
    const definition = labEquipmentDefinitions[key];
    if (stats.totalXP >= definition.xpUpgrade.cost && !(lab_state.labXpUpgrades && lab_state.labXpUpgrades[key])) {
      const newXpUpgrades = { ...(lab_state.labXpUpgrades || {}), [key]: true };
      updateStatsInFirestore({ 
          totalXP: stats.totalXP - definition.xpUpgrade.cost,
          lab_state: { ...lab_state, labXpUpgrades: newXpUpgrades }
      });
      showMessageBox(`${definition.name} production doubled!`, 'info');
    }
  };

  const handlePrestige = () => actionLock(async () => {
    if (localSciencePoints < PRESTIGE_THRESHOLD) { showMessageBox("Not enough Science Points.", "error"); return; }
    if (!db || !userId) return;

    const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, userId);

    try {
      await runTransaction(db, async (transaction) => {
        const statsDoc = await transaction.get(statsDocRef);
        if (!statsDoc.exists()) throw new Error("User data missing.");

        const serverStats = statsDoc.data();
        const newPrestigeLevel = (serverStats.lab_state.prestigeLevel || 0) + 1;
        const newLabState = {
          sciencePoints: 0,
          labEquipment: { beaker: 0, microscope: 0, bunsen_burner: 0, computer: 0, particle_accelerator: 0, quantum_computer: 0, manual_clicker: 1 },
          labXpUpgrades: {},
          prestigeLevel: newPrestigeLevel,
          lastLogin: serverTimestamp(),
        };
        
        transaction.update(statsDocRef, { 
          lab_state: newLabState,
          lastActionTimestamp: serverTimestamp(),
          cooldowns: { ...(serverStats.cooldowns || {}), prestigeLab: serverTimestamp() }
        });
      });
      
      setLocalSciencePoints(0);
      showMessageBox(`Prestige successful! Level ${(lab_state.prestigeLevel || 0) + 1}.`, "info", 6000);
    } catch (error) {
      const errorMsg = error.message.includes('permission-denied') ? "You're acting too quickly!" : "Server error during prestige.";
      showMessageBox(errorMsg, "error");
    }
  });

  const scienceShopItems = [
    { id: 'avatar_dragon', cost: 1e7, ...cosmeticItems.avatars.find(i => i.id === 'avatar_dragon') },
    { id: 'banner_galaxy', cost: 5e7, ...cosmeticItems.banners.find(i => i.id === 'banner_galaxy') },
    { id: 'bg_aurora', cost: 1e9, ...cosmeticItems.backgrounds.find(i => i.id === 'bg_aurora') },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white">Science Lab</h2>
        <p className="text-slate-400">Generate Science Points to unlock powerful upgrades and exclusive cosmetics.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-slate-800/50 p-6 rounded-2xl shadow-xl text-center">
             <h3 className="text-slate-400 text-lg">Science Points</h3>
             <p className="text-5xl font-bold text-cyan-400 my-2">{formatNumber(localSciencePoints)}</p>
             <p className="text-green-400 font-semibold">{formatNumber(totalSPS)} per second</p>
             {(lab_state.prestigeLevel || 0) > 0 && (
                <p className="text-purple-400 font-semibold text-sm mt-1">Prestige Bonus: +{((prestigeBonus - 1) * 100).toFixed(0)}%</p>
             )}
          </div>
          <div 
             onClick={handleManualClick}
             className="bg-slate-800/50 p-6 rounded-2xl shadow-xl text-center flex-grow flex flex-col justify-center items-center cursor-pointer hover:bg-slate-800/80 transition-colors"
          >
             <div className="text-8xl animate-pulse">🧪</div>
             <p className="mt-4 text-xl font-bold text-white">Click to Generate</p>
             <p className="text-cyan-300">+{formatNumber(totalClickPower)} points per click</p>
          </div>
          {localSciencePoints >= PRESTIGE_THRESHOLD && (
            <div className="bg-purple-900/50 border-2 border-purple-600 p-6 rounded-2xl shadow-xl text-center">
              <h3 className="text-2xl font-bold text-white mb-2">Prestige Available!</h3>
              <p className="text-purple-300 mb-4">Reset your Science Lab progress to gain a permanent 10% boost to all future generation.</p>
              <button onClick={handlePrestige} className="w-full bg-purple-600 text-white font-bold py-3 rounded-lg hover:bg-purple-700 transition-colors">
                Prestige Now
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-slate-800/50 p-6 rounded-2xl shadow-xl">
               <h3 className="text-xl font-semibold text-white mb-4">Lab Equipment</h3>
               <div className="space-y-3">
                 {lab_state.labEquipment && Object.entries(labEquipmentDefinitions).map(([key, item]) => {
                    const currentCount = lab_state.labEquipment[key] || 0;
                    const cost = item.baseCost * Math.pow(1.15, currentCount);
                    return (
                        <div key={key} className="bg-slate-800/70 p-3 rounded-lg flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <h4 className="font-bold text-white">{item.name} <span className="text-sm text-slate-400">(Owned: {currentCount})</span></h4>
                                <p className="text-xs text-cyan-400">
                                    {item.baseSPS > 0 && `+${formatNumber(item.baseSPS * ((lab_state.labXpUpgrades && lab_state.labXpUpgrades[key]) ? 2 : 1) * prestigeBonus)} SPS each`}
                                    {item.clickPower > 0 && `+${formatNumber(item.clickPower * ((lab_state.labXpUpgrades && lab_state.labXpUpgrades[key]) ? 2 : 1) * prestigeBonus)} Click Power each`}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {!(lab_state.labXpUpgrades && lab_state.labXpUpgrades[key]) && (
                                   <button onClick={() => handleBuyXpUpgrade(key)} disabled={stats.totalXP < item.xpUpgrade.cost} className="text-xs bg-purple-600 text-white px-3 py-2 rounded-md hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed">
                                       2x with {item.xpUpgrade.cost} XP
                                   </button>
                                )}
                                <button onClick={() => handleBuyEquipment(key)} disabled={localSciencePoints < cost} className="text-sm bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed w-32">
                                    Buy: {formatNumber(cost)}
                                </button>
                            </div>
                        </div>
                    );
                 })}
               </div>
            </div>
            {/* The Science Point Shop remains unchanged */}
        </div>
      </div>
    </div>
  );
};

const TowerDefenseGame = ({ stats, updateStatsInFirestore, showMessageBox, onResetGame, getFullCosmeticDetails, generatePath, processAchievement, addIngredientToInventory }) => {
  const [gameSpeed, setGameSpeed] = useState(1);
  // This local state is for transient, in-wave data like enemies, projectiles, and the towers active for the wave
  const [localWaveState, setLocalWaveState] = useState({
    projectiles: [],
    waveInProgress: false,
    enemies: [],
    towers: [], // This holds the snapshot of towers for the current wave
    soldiers: [], // NEW: Add soldiers to the wave state
  });
  // This local state is for managing the UI and pre-wave setup
  const [localUIState, setLocalUIState] = useState({
    selectedTile: null,
    selectedTower: null,
    shopOpen: false,
  });

  // Get persistent state from props
  const {
    td_wave = 0,
    td_castleHealth = 5,
    td_towers = [],
    td_path = [],
    td_gameOver = false,
    td_gameWon = false,
    td_wins = 0,
    td_unlockedTowers = [],
    td_towerUpgrades = {},
  } = stats || {}; // FIX: Destructure from stats OR an empty object if stats is null/undefined.

  // NEW: This state holds the tower setup between waves, locally,
  // initialized directly from props to ensure saved data is loaded.
  const [localTowers, setLocalTowers] = useState(stats?.td_towers || []);

  // Memoize stringified versions of props to prevent unnecessary re-syncs
  // that would wipe out local state changes (like placing a tower) before they are saved.
  const stringifiedTowers = useMemo(() => JSON.stringify(stats?.td_towers), [stats?.td_towers]);
  const stringifiedTowerUpgrades = useMemo(() => JSON.stringify(stats?.td_towerUpgrades), [stats?.td_towerUpgrades]);

  // Sync local towers ONLY when the actual saved data from Firestore changes.
  useEffect(() => {
    setLocalTowers(stats?.td_towers || []);
  }, [stringifiedTowers]);

  // NEW: This state holds tower upgrades locally, initialized from props.
  const [localTowerUpgrades, setLocalTowerUpgrades] = useState(stats?.td_towerUpgrades || {});

  // Sync local upgrades ONLY when the actual saved data from Firestore changes.
  useEffect(() => {
    setLocalTowerUpgrades(stats?.td_towerUpgrades || {});
  }, [stringifiedTowerUpgrades]);

  // FIX: This hook automatically resets the game if the path is missing,
  // preventing crashes for users with corrupted game states.
  useEffect(() => {
    if ((!td_path || td_path.length === 0) && td_wave > 0 && !td_gameOver && !td_gameWon) {
        showMessageBox("Tower Defense state error detected. Resetting game.", "error", 4000);
        onResetGame();
    }
  }, [td_path, td_wave, td_gameOver, td_gameWon, onResetGame, showMessageBox]);

  // Local state for tracking health BETWEEN saves, initialized from props
  const [sessionHealth, setSessionHealth] = useState(stats?.td_castleHealth);

  // Refs for accessing the latest values inside the game loop's interval
  const pathRef = useRef(td_path);
  const waveRef = useRef(td_wave);
  const winsRef = useRef(td_wins);
  const sessionHealthRef = useRef(sessionHealth);

  // Sync session health with the ref so the loop can access it
  useEffect(() => {
    sessionHealthRef.current = sessionHealth;
  }, [sessionHealth]);

  // When a game is reset (wave goes to 0), sync our session health
  useEffect(() => {
    if (td_wave === 0) {
      setSessionHealth(td_castleHealth);
    }
  }, [td_wave, td_castleHealth]);

  const handlePurchaseShopItem = (item) => {
    if (stats.totalXP < item.cost || td_wins < item.winsRequired) return;
    
    updateStatsInFirestore({ 
      totalXP: stats.totalXP - item.cost,
      td_unlockedTowers: [...td_unlockedTowers, item.unlocks]
    });
    showMessageBox(`Unlocked ${item.name}!`, "info");
  };

  const handleUpgradeTower = (towerId, upgrade) => {
    if (stats.totalXP < upgrade.cost) {
      showMessageBox("Not enough XP for this upgrade!", "error");
      return;
    }

    // Update local towers state instantly
    setLocalTowers(prevTowers => prevTowers.map(t => {
      if (t.id !== towerId) return t;
      return { ...t, ...upgrade.effect };
    }));

    // Update local upgrades state instantly
    setLocalTowerUpgrades(prevUpgrades => ({
      ...prevUpgrades,
      [towerId]: [...(prevUpgrades[towerId] || []), upgrade.id]
    }));

    // The only immediate write is the transactional XP cost
    updateStatsInFirestore({ totalXP: stats.totalXP - upgrade.cost });
    showMessageBox(`Upgraded tower with ${upgrade.name}!`, "info");
  };

  // FIX: Rebalanced attack speeds for better gameplay and corrected the Dragon's speed.
  const towerTypes = {
    free: [
      { id: 'archer', name: 'Archer', cost: 100, damage: 3, range: 5, attackSpeed: 1, projectileType: 'arrow', canHitFlying: true },
      { id: 'cannon', name: 'Cannon', cost: 200, damage: 5, range: 4, attackSpeed: 0.5, projectileType: 'cannonball', canHitFlying: false },
      { id: 'icemage', name: 'Ice Mage', cost: 500, damage: 2, range: 5, attackSpeed: 1, slow: 0.5, projectileType: 'iceShard', canHitFlying: true },
      { id: 'barracks', name: 'Barracks', cost: 800, damage: 0, range: 0, attackSpeed: 0, spawnRate: 5, projectileType: null },
      { id: 'ballista', name: 'Ballista', cost: 1000, damage: 10, range: 6, attackSpeed: 0.3, projectileType: 'bolt' },
    ],
    unlockable: [
      { id: 'fire', name: 'Fire Tower', cost: 800, damage: 7, range: 6, attackSpeed: 1.2, dot: 1, projectileType: 'fireball' },
      { id: 'tesla', name: 'Tesla', cost: 900, damage: 7, range: 6, attackSpeed: 1.5, chain: 3, projectileType: 'lightning' },
      { id: 'poison', name: 'Poison Tower', cost: 1000, damage: 2, range: 5, attackSpeed: 1.2, poison: 10, projectileType: 'poisonCloud' },
      { id: 'sniper', name: 'Sniper', cost: 1500, damage: 20, range: 8, attackSpeed: 0.2, projectileType: 'bullet' },
      { id: 'dragon', name: 'Dragon', cost: 2000, damage: 0.5, range: 6, attackSpeed: 50, aoe: 2, projectileType: 'fireball' },
    ],
    dungeon_unlockable: [
        { id: 'dungeoncannon', name: 'Dungeon Cannon', cost: 1500, damage: 25, range: 5, attackSpeed: 0.4, floorRequired: 10, aoe: 1.0, projectileType: 'cannonball' },
        { id: 'crystalspire', name: 'Crystal Spire', cost: 2200, damage: 40, range: 7, attackSpeed: 0.2, floorRequired: 20, projectileType: 'crystalShard' },
    ],
  };

const towerUpgrades = {
  archer: [
    { id: 'archer_damage', name: 'Sharper Arrows', cost: 300, effect: { damage: 7 } },
    { id: 'archer_range', name: 'Longbow', cost: 450, effect: { range: 7 } },
    { id: 'archer_speed', name: 'Quick Draw', cost: 520, effect: { attackSpeed: 1.5 } },
  ],
  cannon: [
    { id: 'cannon_damage', name: 'Bigger Cannonballs', cost: 500, effect: { damage: 13 } },
    { id: 'cannon_aoe', name: 'Explosive Shells', cost: 200, effect: { aoe: 1 } },
    { id: 'cannon_speed', name: 'Auto-loader', cost: 180, effect: { attackSpeed: 0.8 } },
  ],
  icemage: [
    { id: 'icemage_slow', name: 'Deeper Freeze', cost: 400, effect: { slow: 0.65 } },
    { id: 'icemage_damage', name: 'Ice Shards', cost: 250, effect: { damage: 6 } },
    { id: 'icemage_aoe', name: 'Frost Nova', cost: 500, effect: { aoe: 0.5 } },
  ],
  barracks: [
    { id: 'barracks_spawnRate', name: 'Reinforcements', cost: 350, effect: { spawnRate: -2 } },
    { id: 'barracks_soldierDamage', name: 'Forged Blades', cost: 300, effect: { soldierDamage: 2 } },
    { id: 'barracks_soldierHealth', name: 'Iron Mail', cost: 300, effect: { soldierHealth: 10 } },
  ],
  ballista: [
    { id: 'ballista_damage', name: 'Heavy Bolts', cost: 400, effect: { damage: 22 } },
    { id: 'ballista_range', name: 'Eagle-Eye Scope', cost: 350, effect: { range: 8 } },
    { id: 'ballista_pierce', name: 'Penetrating Shots', cost: 600, effect: { pierce: 2 } },
  ],
  fire: [
    { id: 'fire_dot', name: 'Wildfire', cost: 450, effect: { dot: 3 } },
    { id: 'fire_damage', name: 'Combustion', cost: 350, effect: { damage: 12 } },
    { id: 'fire_aoe', name: 'Fireball', cost: 550, effect: { aoe: 1.5 } },
  ],
  tesla: [
    { id: 'tesla_chain', name: 'Superconductor', cost: 600, effect: { chain: 5 } },
    { id: 'tesla_speed', name: 'Overcharge', cost: 500, effect: { attackSpeed: 3 } },
    { id: 'tesla_damage', name: 'High Voltage', cost: 450, effect: { damage: 11 } },
  ],
  poison: [
    { id: 'poison_damage', name: 'Virulent Toxin', cost: 500, effect: { poison: 25 } },
    { id: 'poison_slow', name: 'Debilitating Poison', cost: 400, effect: { slow: 0.3 } },
    { id: 'poison_aoe', name: 'Noxious Fumes', cost: 600, effect: { aoe: 1 } },
  ],
  sniper: [
    { id: 'sniper_damage', name: '.50 Caliber', cost: 800, effect: { damage: 45 } },
    { id: 'sniper_range', name: 'Advanced Scope', cost: 600, effect: { range: 12 } },
    { id: 'sniper_cripple', name: 'Crippling Shot', cost: 900, effect: { crippleChance: 0.2, crippleDuration: 1 } },
  ],
  dragon: [
        { id: 'dragon_damage', name: 'Blue Flame', cost: 1200, effect: { damage: 1.0 } },
    { id: 'dragon_aoe', name: 'Inferno Breath', cost: 1500, effect: { aoe: 3 } },
    { id: 'dragon_fear', name: 'Terrifying Roar', cost: 2000, effect: { fearChance: 0.1 } },
  ],
  dungeoncannon: [
    { id: 'dungeoncannon_gold', name: 'Gilded Shot', cost: 600, effect: { goldBonus: 0.15 } },
    { id: 'dungeoncannon_stun', name: 'Cave-In', cost: 750, effect: { stunChance: 0.2, stunDuration: 1.5 } },
    { id: 'dungeoncannon_damage', name: 'Dungeon Keeper\'s Wrath', cost: 850, effect: { damage: 35 } },
  ],
  crystalspire: [
    { id: 'crystalspire_chain', name: 'Prismatic Shard', cost: 700, effect: { chain: 3, chainDamageFalloff: 0.3 } },
    { id: 'crystalspire_aura', name: 'Energize', cost: 800, effect: { auraAttackSpeed: 1.2, auraRange: 5 } },
    { id: 'crystalspire_range', name: 'Crystalline Lens', cost: 650, effect: { range: 10 } },
  ],
};

  const shopItems = [
    { id: 'unlock_fire', name: 'Unlock Fire Tower', cost: 500, winsRequired: 5, unlocks: 'fire' },
    { id: 'unlock_tesla', name: 'Unlock Tesla', cost: 800, winsRequired: 8, unlocks: 'tesla' },
    { id: 'unlock_poison', name: 'Unlock Poison Tower', cost: 650, winsRequired: 6, unlocks: 'poison' },
    { id: 'unlock_sniper', name: 'Unlock Sniper', cost: 1000, winsRequired: 10, unlocks: 'sniper' },
    { id: 'unlock_dragon', name: 'Unlock Dragon', cost: 2000, winsRequired: 15, unlocks: 'dragon' },
  ];

  const enemyTypes = {
    normal: [
      { id: 'goblin', name: 'Goblin', health: 10, speed: 0.1 },
      { id: 'shieldbearer', name: 'Shieldbearer', health: 20, speed: 0.08, armor: 2 },
      { id: 'runner', name: 'Runner', health: 5, speed: 0.5 },
      { id: 'healer', name: 'Healer', health: 15, speed: 0.1, heal: 2 },
      { id: 'flyer', name: 'Flyer', health: 12, speed: 0.4, flying: true },
    ],
    juggernaut: [
      { id: 'ogre', name: 'Ogre', health: 100, speed: 0.08, loot: { id: 'ingredientEyeballs', chance: 0.3 } },
      { id: 'siege_engine', name: 'Siege Engine', health: 150, speed: 0.01 },
      { id: 'necromancer', name: 'Necromancer', health: 80, speed: 0.2, spawn: 2, loot: { id: 'ingredientDemonicBook', chance: 0.4 } },
      { id: 'dragon', name: 'Dragon', health: 200, speed: 0.08, flying: true, loot: { id: 'dragon_scale', chance: 0.5 } },
    ],
  };

  const petEffects = {
    dragon: { castleHealth: 1 },
    owl: { attackSpeed: 0.1 },
    squirrel: { sellRefund: 0.15 },
  };

  const boardSize = 10;
  const board = Array(boardSize).fill().map(() => Array(boardSize).fill(null));

  const handleTileClick = (x, y) => {
    if (localWaveState.waveInProgress || td_gameOver || td_gameWon) return;
    if (td_path.some(tile => tile.x === x && tile.y === y)) return;
    const existingTower = localTowers.find(t => t.x === x && t.y === y);
    setLocalUIState(prev => ({ ...prev, selectedTile: { x, y }, selectedTower: existingTower || null }));
  };

  const handleTowerSelect = (tower) => {
    if (!localUIState.selectedTile || stats.totalXP < tower.cost) return;
    const newTower = { ...tower, id: `${tower.id}_${Date.now()}`, x: localUIState.selectedTile.x, y: localUIState.selectedTile.y, lastAttack: 0 };
    
    // XP update is immediate and correct.
    updateStatsInFirestore({ totalXP: stats.totalXP - tower.cost });
    
    // This updates the local tower array, NOT Firestore.
    setLocalTowers(prev => [...prev, newTower]);
    setLocalUIState(prev => ({ ...prev, selectedTile: null, selectedTower: null }));
  };

  const sellTower = () => {
    if (!localUIState.selectedTile) return;
    const towerIndex = localTowers.findIndex(t => t.x === localUIState.selectedTile.x && t.y === localUIState.selectedTile.y);
    if (towerIndex === -1) return;
    const tower = localTowers[towerIndex];
    const refund = Math.floor(tower.cost * (petEffects.squirrel?.sellRefund || 0.15));
    
    // XP update is immediate and correct.
    updateStatsInFirestore({ totalXP: stats.totalXP + refund });
    
    // This updates the local tower array, NOT Firestore.
    setLocalTowers(prev => prev.filter((_, i) => i !== towerIndex));
    setLocalUIState(prev => ({ ...prev, selectedTile: null, selectedTower: null }));
  };

const startWave = () => {
    if (localWaveState.waveInProgress || td_gameOver || td_gameWon) return;
    const waveNumber = td_wave + 1;
    const newEnemies = generateWave(waveNumber);
    
        let updateData = { 
        td_wave: waveNumber,
        'cooldowns.startWave': serverTimestamp()
    };

    // CHECKPOINT LOGIC: Save tower configuration every 3 waves
    if (waveNumber % 3 === 0) {
        updateData.td_towers = localTowers;
        updateData.td_towerUpgrades = localTowerUpgrades;
        showMessageBox(`Checkpoint reached! Tower configuration saved (Wave ${waveNumber}).`, 'info', 3000);
    } else {
        // If not a checkpoint wave, just acknowledge the wave start locally/in database for progress
        showMessageBox(`Starting Wave ${waveNumber}. Next checkpoint at Wave ${Math.ceil(waveNumber / 3) * 3}.`, 'info', 1500);
    }

    updateStatsInFirestore(updateData);
    
    // This now fully resets the transient state for the new wave.
    setLocalWaveState(prev => ({ 
      ...prev, 
      waveInProgress: true, 
      enemies: newEnemies,
      towers: [...localTowers],
      soldiers: [], 
      projectiles: [],
    }));
    
    setLocalUIState(prev => ({ ...prev, selectedTile: null, selectedTower: null }));
  };


  const generateWave = (waveNumber) => {
    const enemies = [];
    const isJuggernautWave = waveNumber % 10 === 0;
    if (isJuggernautWave) {
      const type = enemyTypes.juggernaut[Math.min(Math.floor(waveNumber / 10) - 1, enemyTypes.juggernaut.length - 1)];
      enemies.push({ ...type, id: `${type.id}_${Date.now()}`, health: type.health * (1 + waveNumber / 20), x: 0, y: 0, progress: 0 });
    } else {
      for (let i = 0; i < 5 + waveNumber * 2; i++) {
        const type = enemyTypes.normal[Math.floor(Math.random() * enemyTypes.normal.length)];
        enemies.push({ ...type, id: `${type.id}_${i}_${Date.now()}`, health: type.health * (1 + waveNumber / 50), x: 0, y: 0, progress: -i * 0.2 });
      }
    }
    return enemies;
  };

  // Game Loop for Tower Defense
  useEffect(() => {
    // This effect keeps the refs updated with the latest values from props
    // without causing the game loop interval to reset.
    pathRef.current = td_path;
    waveRef.current = td_wave;
    winsRef.current = td_wins;
  }, [td_path, td_wave, td_wins]);

  useEffect(() => {
    if (!localWaveState.waveInProgress) return;

    // CORE FIX: This accumulator is now scoped to the entire wave's effect instance.
    // It will persist across all interval ticks for the duration of the wave.
    const waveDamageAccumulator = { current: 0 };

    const interval = setInterval(() => {
      setLocalWaveState(prev => {
        if (!prev.waveInProgress) return prev;

        let newEnemies = [...prev.enemies];
        let newSoldiers = [...prev.soldiers];
        let newTowers = [...prev.towers];
        let newProjectiles = prev.projectiles.filter(p => Date.now() < p.expires);
        
        // This variable now only tracks damage for the CURRENT 100ms tick.
        let damageThisTick = 0;

        // --- 1. Update Tower States (e.g., Barracks Spawning) ---
        newTowers = newTowers.map(tower => {
          if (tower.id.startsWith('barracks') && Date.now() - (tower.lastSpawn || 0) > (tower.spawnRate * 1000)) {
            newSoldiers.push({
              id: `soldier_${Date.now()}`, x: tower.x, y: tower.y,
              health: tower.soldierHealth || 20, damage: tower.soldierDamage || 1,
              targetId: null, despawnTime: Date.now() + 20000,
            });
            return { ...tower, lastSpawn: Date.now() };
          }
          return tower;
        });

        // --- 2. Update Soldiers (Movement & Attacking) ---
        newSoldiers = newSoldiers.map(soldier => {
          if (!soldier.targetId || !newEnemies.find(e => e.id === soldier.targetId)) {
            let closestEnemy = null; let minDist = Infinity;
            newEnemies.forEach(enemy => {
              if (!enemy.flying) {
                const dist = Math.hypot(soldier.x - enemy.x, soldier.y - enemy.y);
                if (dist < minDist) { minDist = dist; closestEnemy = enemy; }
              }
            });
            soldier.targetId = closestEnemy ? closestEnemy.id : null;
          }
          const target = newEnemies.find(e => e.id === soldier.targetId);
          if (target) {
            const dist = Math.hypot(soldier.x - target.x, soldier.y - target.y);
            if (dist > 0.5) {
              soldier.x += ((target.x - soldier.x) / dist) * 0.05 * gameSpeed;
              soldier.y += ((target.y - soldier.y) / dist) * 0.05 * gameSpeed;
            } else {
              target.health -= soldier.damage * 0.1 * gameSpeed;
            }
          }
          return soldier;
        }).filter(s => s.health > 0 && s.despawnTime > Date.now());

        // --- 3. Update Enemies (Movement, Status Effects) ---
        newEnemies = newEnemies.map(enemy => {
          let currentSpeed = enemy.speed;
          if (enemy.slowedUntil && Date.now() < enemy.slowedUntil) {
            currentSpeed *= (1 - enemy.slowAmount);
          }
          const newProgress = enemy.progress + currentSpeed * 0.1 * gameSpeed;
          if (newProgress >= 1) { damageThisTick++; return null; }
          const path = pathRef.current;
          const pathIndex = Math.min(Math.floor(newProgress * (path.length - 1)), path.length - 1);
          const pathTile = path[Math.max(0, pathIndex)];
          return { ...enemy, progress: newProgress, x: pathTile.x, y: pathTile.y };
        }).filter(Boolean);

        // --- 4. Tower Targeting & Firing ---
        newTowers = newTowers.map(tower => {
          if (tower.id.startsWith('barracks') || Date.now() - tower.lastAttack < 1000 / tower.attackSpeed) return tower;
          const target = newEnemies.find(e => (tower.canHitFlying || !e.flying) && Math.hypot(e.x - tower.x, e.y - tower.y) <= tower.range && e.progress >= 0);
          if (target) {
            newProjectiles.push({ id: `p_${Date.now()}_${Math.random()}`, from: { x: tower.x, y: tower.y }, to: { x: target.x, y: target.y }, type: tower.projectileType, expires: Date.now() + 300, towerData: tower });
            return { ...tower, lastAttack: Date.now() };
          }
          return tower;
        });

        // --- 5. Projectile Collision & Effects ---
        newProjectiles.forEach(proj => {
          if (Date.now() > proj.expires - 100) {
            newEnemies.forEach(enemy => {
              if (Math.hypot(enemy.x - proj.to.x, enemy.y - proj.to.y) < 1) {
                const damage = proj.towerData.damage - (enemy.armor || 0);
                enemy.health -= Math.max(1, damage);
                if (proj.towerData.slow) { enemy.slowedUntil = Date.now() + 1000; enemy.slowAmount = proj.towerData.slow; }
                if (proj.towerData.aoe) {
                  newEnemies.forEach(otherEnemy => {
                    if (otherEnemy.id !== enemy.id && Math.hypot(otherEnemy.x - enemy.x, otherEnemy.y - enemy.y) <= proj.towerData.aoe) {
                      otherEnemy.health -= Math.max(1, (proj.towerData.damage / 2) - (otherEnemy.armor || 0));
                    }
                  });
                }
              }
            });
          }
        });

        // --- 6. Cleanup & State Updates ---
        const defeatedEnemies = prev.enemies.filter(e => !newEnemies.some(ne => ne.id === e.id));
        if (defeatedEnemies.length > 0) {
            defeatedEnemies.forEach(enemy => {
                if (enemy.loot && Math.random() < enemy.loot.chance) {
                    addIngredientToInventory(enemy.loot.id);
                }
            });
        }
        const remainingEnemies = newEnemies.filter(e => e.health > 0);
        
        // CORE FIX: Add this tick's damage to the wave's total accumulator
        if (damageThisTick > 0) {
          waveDamageAccumulator.current += damageThisTick;
        }
        
        // CORE FIX: Use the accumulator for the final health calculation
        const newSessionHealth = sessionHealthRef.current - waveDamageAccumulator.current;
        const isGameOver = newSessionHealth <= 0;
        const isGameWon = waveRef.current >= 50 && remainingEnemies.length === 0 && !isGameOver;
        const isWaveOver = !isGameOver && !isGameWon && prev.enemies.length > 0 && remainingEnemies.length === 0;

        if (isGameOver || isGameWon || isWaveOver) {
          setSessionHealth(newSessionHealth);
          let update = {};
          // CORE FIX: Use the accumulator to determine if an update is needed
          if (waveDamageAccumulator.current > 0) update.td_castleHealth = newSessionHealth;
          if (isGameOver) update.td_gameOver = true;
          if (isGameWon) { update.td_gameWon = true; update.td_wins = winsRef.current + 1; }
          
          // NEW: Loot Drop on Boss Wave & Victory
          if (isWaveOver && waveRef.current > 0 && waveRef.current % 10 === 0) {
             const key = 'alchemy_state.inventory.pristine_crystal';
             update[key] = increment(1);
             showMessageBox('You earned a Pristine Crystal for surviving the boss wave!', 'info');
          }
          if (isGameWon) {
             const key = 'alchemy_state.inventory.dragon_scale';
             update[key] = increment(1);
             showMessageBox('You earned a Dragon Scale for your victory!', 'info');
          }

          if (Object.keys(update).length > 0) {
            updateStatsInFirestore(update).then(() => {
              if (update.td_gameWon) processAchievement('towerDefenseWins');
            });
          }
          return { ...prev, waveInProgress: false, enemies: [], projectiles: [], soldiers: [] };
        }
        
        return { ...prev, enemies: remainingEnemies, soldiers: newSoldiers, projectiles: newProjectiles, towers: newTowers };
      });
    }, 100 / gameSpeed);

    return () => clearInterval(interval);
  }, [localWaveState.waveInProgress, gameSpeed, updateStatsInFirestore, showMessageBox, processAchievement]);


  const petEffectsApplied = stats.currentPet ? (petEffects[stats.currentPet.id.split('_')[0]] || {}) : {};
  
  const getTowerEmoji = (id) => {
    const towerBaseId = id.split('_')[0];
    const skinId = stats.equippedItems?.tdSkins?.[towerBaseId];
    if (skinId) {
        const skin = getFullCosmeticDetails(skinId, 'td_skins');
        if (skin) return skin.display;
    }
    // Fallback to default
    return { archer: '🏹', cannon: '💣', icemage: '❄️', barracks: '🛡️', ballista: '🎯', fire: '🔥', tesla: '⚡', poison: '☠️', sniper: '🎯', dragon: '🐉', dungeoncannon: '🌋', crystalspire: '💎' }[towerBaseId] || '❓';
  };
  const enemyDisplayMap = (enemyId) => {
    const enemyBaseId = enemyId.split('_')[0];
    const skinId = stats.equippedItems?.tdSkins?.[enemyBaseId];
    if (skinId) {
        const skin = getFullCosmeticDetails(skinId, 'td_skins');
        if (skin) return skin.display;
    }
    // Fallback
    return { goblin: '👹', shieldbearer: '🛡️', runner: '🏃', healer: '💉', flyer: '🦇', ogre: '👹', siege_engine: '🏗️', necromancer: '🧙', dragon: '🐉' }[enemyBaseId] || '❓';
  };

    const renderBoard = () => {
    // FIX: Determine the single source of truth for towers based on game phase.
    const currentTowers = localWaveState.waveInProgress ? localWaveState.towers : localTowers;

    return board.map((row, y) => (
      <div key={y} className="flex">
        {row.map((_, x) => {
          // Use the unified 'currentTowers' list for all rendering logic.
          const tower = currentTowers.find(t => t.x === x && t.y === y);
          const isAttacking = tower && Date.now() - tower.lastAttack < 300;

          return (
            <div
              key={x}
              onClick={() => handleTileClick(x, y)}
              className={`w-10 h-10 border border-slate-600 flex items-center justify-center relative ${td_path.some(p => p.x === x && p.y === y) ? 'bg-slate-700' : 'bg-slate-800'} ${localUIState.selectedTile?.x === x && localUIState.selectedTile?.y === y ? 'ring-2 ring-indigo-500' : ''}`}
            >
              {tower && <div className={`text-lg transition-transform duration-200 ${isAttacking ? 'tower-attack' : ''}`}>{getTowerEmoji(tower.id)}</div>}
            </div>
          );
        })}
      </div>
    ));
  };
  
  const renderSoldiers = () => (
    (localWaveState.soldiers || []).map(soldier => {
      const TILE_SIZE = 40;
      const top = soldier.y * TILE_SIZE + TILE_SIZE / 2;
      const left = soldier.x * TILE_SIZE + TILE_SIZE / 2;
      // Calculate remaining lifetime for fade-out effect. 20000ms is the lifespan.
      const lifetimeRemainingRatio = Math.max(0, (soldier.despawnTime - Date.now()) / 20000);

      return (
        <div 
          key={soldier.id} 
          className="absolute z-10 transition-opacity duration-500" 
          style={{ 
            top, left, transform: 'translate(-50%, -50%)', 
            // Start fading out in the last 25% of life
            opacity: lifetimeRemainingRatio < 0.25 ? 0.5 : 1 
          }}
        >
          <div className="text-lg">⚔️</div>
          <div className="absolute -bottom-2 left-0 right-0 h-1 w-6 mx-auto bg-slate-600"><div className="h-full bg-green-500" style={{ width: `${(soldier.health / 20) * 100}%`}} /></div>
        </div>
      );
    })
  );

  const renderEnemies = () => (
    (localWaveState.enemies || []).map(enemy => {
        if(enemy.progress < 0) return null;
        const TILE_SIZE = 40;
        const top = enemy.y * TILE_SIZE + TILE_SIZE / 2;
        const left = enemy.x * TILE_SIZE + TILE_SIZE / 2;
        
        const enemyBaseName = enemy.id.split('_')[0];
        const baseHealthDef = enemyTypes.normal.find(e => e.id === enemyBaseName) || enemyTypes.juggernaut.find(e => e.id === enemyBaseName);
        
        const baseHealth = baseHealthDef ? baseHealthDef.health : 10;

        return (
          <div key={enemy.id} className={`absolute z-10 ${enemy.justHit ? 'enemy-hit-animation' : ''}`} style={{ top: `${top}px`, left: `${left}px`, transform: 'translate(-50%, -50%)' }}>
              <div className="text-lg">{enemyDisplayMap(enemy.id)}</div>
              <div className="absolute -bottom-2 left-0 right-0 h-1 w-6 mx-auto bg-slate-600"><div className="h-full bg-red-500" style={{ width: `${(enemy.health / baseHealth) * 100}%`}} /></div>
          </div>
        );
    })
  );

  const renderTowerSelection = () => {
    if (!localUIState.selectedTile) return null;
    const towerAtTile = localTowers.find(t => t.x === localUIState.selectedTile.x && t.y === localUIState.selectedTile.y);
    if (towerAtTile) {
      return (
        <div className="text-white">
          <h3 className="text-xl font-bold mb-2">{towerAtTile.name}</h3>
          <p>Damage: {towerAtTile.damage}</p>
          <p>Range: {towerAtTile.range}</p>
          <p>Attack Speed: {towerAtTile.attackSpeed}/s</p>
          <div className="mt-4">
            <h4 className="font-bold mb-2">Upgrades</h4>
            {(towerUpgrades[towerAtTile.id.split('_')[0]] || []).map(upgrade => {
              const isPurchased = localTowerUpgrades[towerAtTile.id]?.includes(upgrade.id);
              return (
                <div key={upgrade.id} className="mb-2 p-2 bg-slate-700/50 rounded">
                  <p className="font-medium">{upgrade.name}</p>
                  <p className="text-sm text-slate-400">Cost: {upgrade.cost} XP</p>
                  <button onClick={() => handleUpgradeTower(towerAtTile.id, upgrade)} disabled={isPurchased || stats.totalXP < upgrade.cost} className={`mt-1 px-2 py-1 text-sm rounded w-full ${isPurchased ? 'bg-green-800' : stats.totalXP >= upgrade.cost ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-600 text-slate-400'}`}>
                    {isPurchased ? 'Purchased' : 'Buy Upgrade'}
                  </button>
                </div>
              );
            })}
          </div>
          <button onClick={sellTower} className="mt-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 w-full">
            Sell for {Math.floor(towerAtTile.cost * (petEffectsApplied.sellRefund || 0.15))} XP
          </button>
        </div>
      );
    }
    const availableTowers = [
        ...towerTypes.free,
        ...td_unlockedTowers.map(id => towerTypes.unlockable.find(t => t.id === id)).filter(Boolean),
        ...towerTypes.dungeon_unlockable.filter(t => (stats.dungeon_floor || 0) >= t.floorRequired)
    ];
    return (
      <div className="text-white">
        <h3 className="text-xl font-bold mb-2">Select Tower</h3>
        <div className="grid grid-cols-2 gap-2">
          {availableTowers.map(tower => (
            <button key={tower.id} onClick={() => handleTowerSelect(tower)} disabled={stats.totalXP < tower.cost} className={`p-2 rounded-md flex flex-col items-center ${stats.totalXP < tower.cost ? 'bg-slate-700 text-slate-500' : 'bg-slate-700 hover:bg-slate-600'}`}>
              <span className="text-2xl">{getTowerEmoji(tower.id)}</span>
              <span>{tower.name}</span>
              <span className="text-sm text-yellow-400">{tower.cost} XP</span>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
       <div className="flex justify-between items-center mb-6">
        <div><h2 className="text-3xl font-bold text-white">Tower Defense</h2><p className="text-slate-400">Use your XP to build towers and defend your castle!</p></div>
        <div className="flex space-x-4">
          <button onClick={() => setLocalUIState(prev => ({ ...prev, shopOpen: !prev.shopOpen }))} className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition-colors">{localUIState.shopOpen ? 'Close Shop' : 'Open Shop'}</button>
          {(td_gameOver || td_gameWon) && <button onClick={onResetGame} className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700">{td_gameWon ? 'Play Again' : 'Try Again'}</button>}
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-grow">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-800/50 p-3 rounded-lg text-center"><span className="text-slate-400">Wave:</span> <span className="font-bold text-white">{td_wave}/50</span></div>
            <div className="bg-slate-800/50 p-3 rounded-lg text-center"><span className="text-slate-400">Health:</span> <span className="font-bold text-red-400">{sessionHealth}/5</span></div>            <div className="bg-slate-800/50 p-3 rounded-lg text-center"><span className="text-slate-400">XP:</span> <span className="font-bold text-yellow-400">{stats.totalXP}</span></div>
            <div className="bg-slate-800/50 p-3 rounded-lg text-center"><span className="text-slate-400">Wins:</span> <span className="font-bold text-green-400">{td_wins}</span></div>
          </div>
          <div className="p-2 bg-slate-900/50 border border-slate-700 rounded-lg inline-block relative">
            {renderBoard()}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {renderEnemies()}
              {renderSoldiers()}
              {localWaveState.projectiles.map(p => <Projectile key={p.id} from={p.from} to={p.to} type={p.type} />)}
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <button onClick={startWave} disabled={localWaveState.waveInProgress || td_gameOver || td_gameWon} className={`flex-grow px-4 py-3 rounded-lg text-lg font-bold transition-colors ${localWaveState.waveInProgress || td_gameOver || td_gameWon ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>{localWaveState.waveInProgress ? 'Wave In Progress' : td_wave === 0 ? 'Start Wave 1' : `Start Wave ${td_wave + 1}`}</button>
            <button onClick={() => setGameSpeed(speed => (speed === 1 ? 2 : 1))} className="w-24 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-600">
              SPEED x{gameSpeed}
            </button>
          </div>
        </div>
        <div className="w-full lg:w-80 flex-shrink-0"><div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl sticky top-6"><h3 className="text-xl font-bold text-white mb-4 text-center">{localUIState.selectedTile && !localTowers.some(t => t.x === localUIState.selectedTile.x && t.y === localUIState.selectedTile.y) ? "Build Tower" : localUIState.selectedTile ? "Tower Control" : "Select a Tile"}</h3>{renderTowerSelection()}</div></div>
      </div>
      {td_gameOver && <div className="mt-4 p-4 bg-red-500/30 text-red-300 border border-red-500 rounded-lg"><p className="font-bold text-lg">Game Over!</p><p>Your castle was destroyed on wave {td_wave}.</p></div>}
      {td_gameWon && <div className="mt-4 p-4 bg-green-500/30 text-green-300 border border-green-500 rounded-lg"><p className="font-bold text-lg">Victory!</p><p>You successfully defended your castle against all 50 waves!</p></div>}
      {localUIState.shopOpen && (<div className="mt-6"><h3 className="text-2xl font-bold text-white mb-4">Shop</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{shopItems.map(item => (<div key={item.id} className="p-4 bg-slate-800/80 rounded-lg shadow-lg border border-slate-700"><h4 className="font-bold text-white">{item.name}</h4><p className="text-slate-400 text-sm">Cost: {item.cost} XP | Wins Required: {item.winsRequired}</p><button onClick={() => handlePurchaseShopItem(item)} disabled={td_unlockedTowers.includes(item.unlocks) || stats.totalXP < item.cost || td_wins < item.winsRequired} className={`mt-2 w-full px-3 py-1.5 rounded text-sm font-semibold transition-colors ${td_unlockedTowers.includes(item.unlocks) ? 'bg-green-500/20 text-green-400' : (stats.totalXP < item.cost || td_wins < item.winsRequired) ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>{td_unlockedTowers.includes(item.unlocks) ? 'Purchased' : 'Buy'}</button></div>))}</div></div>)}
    </div>
  );
};
// Component for Achievements Page
const AchievementsComponent = ({ gameProgress }) => {
  const allAchievements = Object.entries(achievementDefinitions);
  const userAchievements = gameProgress.achievements || {};

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white">Achievements</h2>
        <p className="text-slate-400">Track your long-term progress and earn rewards for your dedication.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allAchievements.map(([key, def]) => {
          const userAch = userAchievements[key] || { tier: 0, progress: 0 };
          const currentTierIndex = userAch.tier;
          const nextTier = def.tiers[currentTierIndex];
          const lastTier = def.tiers[def.tiers.length - 1];
          const isMaxed = !nextTier;

          let progressPercent = 0;
          let goalText = '';
          let rewardText = '';
          let currentTierName = isMaxed ? lastTier.name : (def.tiers[currentTierIndex - 1]?.name || 'Unranked');

          if (isMaxed) {
            progressPercent = 100;
            goalText = "Completed!";
            rewardText = `All tiers of ${def.name} complete.`;
          } else {
            progressPercent = Math.min(100, (userAch.progress / nextTier.goal) * 100);
            goalText = `${userAch.progress} / ${nextTier.goal}`;
            rewardText = `Next: ${nextTier.reward.xp} XP` + (nextTier.reward.shards ? ` & ${nextTier.reward.shards}💎` : '');
          }

          return (
            <div key={key} className={`bg-slate-800/50 border border-slate-700 p-5 rounded-2xl shadow-lg flex flex-col transition-all duration-300 ${isMaxed ? 'opacity-60 bg-slate-800' : ''}`}>
              <div className="flex items-start gap-4">
                <span className="text-4xl pt-1">{def.icon}</span>
                <div className="flex-1">
                  <h3 className={`font-bold text-lg ${isMaxed ? 'text-yellow-400' : 'text-white'}`}>{def.name}</h3>
                  <p className="text-xs text-slate-400">{isMaxed ? 'Mastered' : `Current Tier: ${currentTierName}`}</p>
                </div>
              </div>
              <div className="mt-4 flex-grow">
                <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
                  <span>{isMaxed ? 'Mastered' : nextTier.name}</span>
                  <span className="font-mono">{goalText}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full transition-width duration-500 ${isMaxed ? 'bg-yellow-500' : 'bg-indigo-500'}`} style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
              <p className="text-xs text-slate-300 mt-2 text-center h-4">{rewardText}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
// In App.js, right after the closing of the Sanctum component definition

};

// NEW: Component for the Weekly Triage Ritual
const WeeklyTriageModal = ({ isOpen, onClose, assignments, triageSettings, onCompleteTriage, onSaveSettings }) => {
  const [view, setView] = useState(triageSettings ? 'triage' : 'setup');
  const [selectedDay, setSelectedDay] = useState(triageSettings?.triageDay ?? 1); // Default to Monday
  
  const initialQuadrants = {
    urgent_important: [],
    not_urgent_important: [],
    urgent_not_important: [],
    not_urgent_not_important: [],
    unassigned: assignments,
  };

  const [quadrants, setQuadrants] = useState(initialQuadrants);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    // Reset when modal is opened
    if (isOpen) {
      setView(triageSettings ? 'triage' : 'setup');
      setQuadrants({
        urgent_important: [],
        not_urgent_important: [],
        urgent_not_important: [],
        not_urgent_not_important: [],
        unassigned: assignments,
      });
    }
  }, [isOpen, assignments, triageSettings]);

  const handleDragStart = (item, sourceQuadrant) => {
    setDraggedItem({ item, sourceQuadrant });
  };

  const handleDrop = (targetQuadrant) => {
    if (!draggedItem) return;
    
    const { item, sourceQuadrant } = draggedItem;

    // Remove from source
    const newSourceItems = quadrants[sourceQuadrant].filter(i => i.id !== item.id);
    
    // Add to target
    const newTargetItems = [...quadrants[targetQuadrant], item];

    setQuadrants(prev => ({
      ...prev,
      [sourceQuadrant]: newSourceItems,
      [targetQuadrant]: newTargetItems,
    }));
    
    setDraggedItem(null);
  };

  const handleSaveSetup = () => {
    onSaveSettings({ triageDay: selectedDay });
    setView('triage');
  };
  
  const handleFinalize = () => {
    const assignmentsWithPriority = [];
    for (const quadrantName in quadrants) {
      if (quadrantName !== 'unassigned') {
        quadrants[quadrantName].forEach(assignment => {
          assignmentsWithPriority.push({
            id: assignment.id,
            priorityQuadrant: quadrantName,
          });
        });
      }
    }
    onCompleteTriage(assignmentsWithPriority);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-xl w-full max-w-7xl h-[90vh] flex flex-col text-white" onClick={e => e.stopPropagation()}>
        <h3 className="text-3xl font-bold p-6 text-center border-b border-slate-700">
          {view === 'setup' ? 'Setup Your Weekly Triage' : 'Weekly Triage'}
        </h3>
        
        {view === 'setup' ? (
          <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
            <h4 className="text-2xl font-semibold text-indigo-300">Choose Your Planning Day</h4>
            <p className="text-slate-400 max-w-lg mx-auto my-4">Select one day each week to plan your assignments. Completing this ritual grants the week-long "Clarity" buff.</p>
            <div className="flex flex-wrap justify-center gap-3 my-6">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => (
                <button key={day} onClick={() => setSelectedDay(index)} className={`px-5 py-3 rounded-lg font-semibold transition-colors ${selectedDay === index ? 'bg-indigo-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}>
                  {day}
                </button>
              ))}
            </div>
            <button onClick={handleSaveSetup} className="px-10 py-4 bg-green-600 text-white font-bold rounded-lg text-xl hover:bg-green-700">
              Save & Start First Triage
            </button>
          </div>
        ) : (
          <div className="flex-grow flex flex-col md:flex-row p-4 gap-4 overflow-hidden">
            {/* Unassigned Column */}
            <div className="w-full md:w-1/4 flex flex-col bg-slate-800/50 rounded-lg p-4">
              <h4 className="text-xl font-semibold text-center mb-4">Upcoming Assignments ({quadrants.unassigned.length})</h4>
              <div onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop('unassigned')} className="flex-grow overflow-y-auto space-y-2 pr-2">
                {quadrants.unassigned.map(item => (
                  <div key={item.id} draggable onDragStart={() => handleDragStart(item, 'unassigned')} className="p-3 bg-slate-700 rounded-md cursor-grab active:cursor-grabbing">
                    <p className="font-semibold">{item.assignment}</p>
                    <p className="text-xs text-slate-400">{item.class} - Due: {item.dueDate?.toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Eisenhower Matrix */}
            <div className="flex-grow grid grid-cols-2 grid-rows-2 gap-4">
              {Object.entries({
                urgent_important: { title: 'Urgent & Important', color: 'border-red-500' },
                not_urgent_important: { title: 'Important, Not Urgent', color: 'border-blue-500' },
                urgent_not_important: { title: 'Urgent, Not Important', color: 'border-yellow-500' },
                not_urgent_not_important: { title: 'Not Urgent or Important', color: 'border-slate-500' }
              }).map(([key, { title, color }]) => (
                <div key={key} onDragOver={(e) => e.preventDefault()} onDrop={() => handleDrop(key)} className={`bg-slate-800/50 rounded-lg p-4 flex flex-col border-t-4 ${color}`}>
                  <h5 className="font-bold text-center mb-2">{title}</h5>
                  <div className="flex-grow overflow-y-auto space-y-2 pr-2">
                    {quadrants[key].map(item => (
                       <div key={item.id} draggable onDragStart={() => handleDragStart(item, key)} className="p-3 bg-slate-700 rounded-md cursor-grab active:cursor-grabbing">
                         <p className="font-semibold">{item.assignment}</p>
                         <p className="text-xs text-slate-400">{item.class}</p>
                       </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {view === 'triage' && (
          <div className="p-4 border-t border-slate-700 text-right">
            <button onClick={handleFinalize} disabled={quadrants.unassigned.length > 0} className="px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed">
              Finalize Plan & Get Buff
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Component for the "Why I made this" tab
const WhyTab = () => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white">Why I Built This</h2>
        <p className="text-slate-400">The story and motivation behind the project.</p>
      </div>
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl p-8 max-w-4xl mx-auto">
        <div className="text-slate-300 space-y-6 prose prose-invert max-w-none">
          {/* --- PASTE YOUR CONTENT BELOW --- */}

          <h3 className="text-2xl font-semibold text-white">My Motivation</h3>
          <p>
            [Your opening paragraph goes here. Explain the initial problem or the idea that sparked this project. What were you trying to solve for yourself or for others?]
          </p>
          <p>
            [Add another paragraph if needed to elaborate on the background or the challenges you faced before starting.]
          </p>

          <h3 className="text-2xl font-semibold text-white">The Journey & The Goal</h3>
          <p>
            [Describe the process of building this application. What were some key decisions you made? What features are you most proud of?]
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>[A key feature or lesson learned during development.]</li>
            <li>[Another interesting fact or challenge you overcame.]</li>
            <li>[What you hope users will achieve by using this tool.]</li>
          </ul>

          <p>
            [Your closing thoughts here. You can thank the user for checking out your project or share what you hope they get out of the experience.]
          </p>

          {/* --- END OF CONTENT AREA --- */}
        </div>
      </div>
    </div>
  );
};
// --- FOCUS NAVIGATOR SYSTEM ---

// Data definition for the star chart
const starChartData = {
  locations: [
    { id: 'genesis_prime', name: 'Genesis Prime', type: 'planet', iconAsset: planet1, position: { top: '50%', left: '10%' }, description: "A lush, green terrestrial world. The perfect starting point for any academic journey." },
    { id: 'luna_minor', name: 'Luna Minor', type: 'moon', iconAsset: planet6, position: { top: '35%', left: '20%' }, description: "The small, rocky moon of Genesis Prime." },
    { id: 'ryzen_outpost', name: 'Ryzen Outpost', type: 'station', iconAsset: planet7, position: { top: '65%', left: '22%' }, description: "A bustling trade hub in the asteroid belt." },
    { id: 'planet_pyro', name: 'Planet Pyro', type: 'planet', iconAsset: planet4, position: { top: '50%', left: '35%' }, description: "A volcanic world with intense heat and pressure." },
    { id: 'helios_nebula', name: 'Helios Nebula', type: 'nebula', iconAsset: planet10, position: { top: '20%', left: '45%' }, description: "A beautiful but treacherous gas cloud." },
    { id: 'planet_cryo', name: 'Planet Cryo', type: 'planet', iconAsset: planet8, position: { top: '80%', left: '45%' }, description: "An ice-covered planet with a mysterious sub-surface ocean." },
    { id: 'aetheria', name: 'Aetheria', type: 'planet', iconAsset: planet2, position: { top: '50%', left: '65%' }, description: "A gas giant with swirling, colorful clouds." },
    { id: 'eris_moon', name: 'Eris Moon', type: 'moon', iconAsset: planet9, position: { top: '65%', left: '78%' }, description: "The chaotic, tidally-locked moon of Aetheria." },
    { id: 'terminus', name: 'Terminus', type: 'planet', iconAsset: planet5, position: { top: '30%', left: '85%' }, description: "A dark, foreboding world at the edge of the system." },
  ],
  routes: [
    { id: 'r1', from: 'genesis_prime', to: 'luna_minor', duration: 25, xpReward: 100 },
    { id: 'r2', from: 'genesis_prime', to: 'ryzen_outpost', duration: 45, xpReward: 180 },
    { id: 'r3', from: 'ryzen_outpost', to: 'planet_pyro', duration: 60, xpReward: 250 },
    { id: 'r4', from: 'planet_pyro', to: 'helios_nebula', duration: 80, xpReward: 350 },
    { id: 'r5', from: 'planet_pyro', to: 'planet_cryo', duration: 80, xpReward: 350 },
    { id: 'r6', from: 'helios_nebula', to: 'aetheria', duration: 100, xpReward: 450 },
    { id: 'r7', from: 'planet_cryo', to: 'aetheria', duration: 100, xpReward: 450 },
    { id: 'r8', from: 'aetheria', to: 'eris_moon', duration: 45, xpReward: 200 },
    { id: 'r9', from: 'aetheria', to: 'terminus', duration: 120, xpReward: 600 },
  ]
};

// Component for the Sanctum
const Sanctum = ({ stats, completedAssignments, updateStatsInFirestore, showMessageBox, getFullCosmeticDetails, getItemStyle, processAchievement }) => {  const [editMode, setEditMode] = useState(false);
  const [selectedItemForPlacing, setSelectedItemForPlacing] = useState(null);  const [ghostPosition, setGhostPosition] = useState(null);
  const [selectedPlacedItem, setSelectedPlacedItem] = useState(null);
  const [showTrophyModal, setShowTrophyModal] = useState(false);
  const [showFunFactModal, setShowFunFactModal] = useState(false);
  const [currentFunFact, setCurrentFunFact] = useState('');
  const [petPosition, setPetPosition] = useState({ x: 1, y: 1 });

  const GRID_COLS = 20;
  const GRID_ROWS = 12;

  const motivationalQuotes = [
    "The secret of getting ahead is getting started.",
    "The only way to do great work is to love what you do.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Don't watch the clock; do what it does. Keep going.",
    "Believe you can and you're halfway there.",
    "The future depends on what you do today.",
    "Well done is better than well said."
  ];

  const equippedWallpaper = getFullCosmeticDetails(stats?.equippedItems?.wallpaper, 'wallpapers');
  const wallStyle = equippedWallpaper?.style || { background: 'linear-gradient(to bottom, #475569, #334155)' };

  const getFurnitureDef = (itemId) => Object.values(furnitureDefinitions).flat().find(f => f.id === itemId);

  const placedItems = stats?.sanctumLayout?.placedItems || [];

  // Pet Roaming Logic
  useEffect(() => {
    if (stats?.currentPet && !editMode) {
      const isOccupied = (x, y) => {
        return placedItems.some(item => {
          const def = getFurnitureDef(item.id);
          if (!def || !def.isObstacle) return false;
          return x >= item.x && x < item.x + def.width && y >= item.y && y < item.y + def.height;
        });
      };

      const interval = setInterval(() => {
        setPetPosition(currentPos => {
          let newX, newY, attempts = 0;
          do {
            newX = Math.floor(Math.random() * GRID_COLS);
            newY = Math.floor(Math.random() * GRID_ROWS);
            attempts++;
          } while (isOccupied(newX, newY) && attempts < 50); // Try 50 times to find a free spot

          return attempts < 50 ? { x: newX, y: newY } : currentPos; // If no spot found, stay put
        });
      }, 7000); // Move every 7 seconds

      return () => clearInterval(interval);
    }
  }, [stats?.currentPet, editMode, placedItems]);

    const ownedFurnitureDetails = useMemo(() => {
    return (stats?.ownedFurniture || []).map(id => getFurnitureDef(id)).filter(Boolean);
  }, [stats?.ownedFurniture]);

  const updateLayout = (newPlacedItems) => {
    updateStatsInFirestore({ sanctumLayout: { ...(stats?.sanctumLayout || { placedItems: [] }), placedItems: newPlacedItems } });
  };


  const handleSelectForPlacing = (item) => {
    setSelectedItemForPlacing(item);
    setSelectedPlacedItem(null);
  };

  const handleGridCellHover = (x, y) => {
    if (editMode && selectedItemForPlacing) {
      setGhostPosition({ x, y });
    }
  };

  const handleGridClick = (x, y) => {
    if (!editMode) return;
    
    if (selectedItemForPlacing) {
        const inventoryItem = selectedItemForPlacing;
        const newItemRect = { x, y, width: inventoryItem.width, height: inventoryItem.height };
        
        if (newItemRect.x + newItemRect.width > GRID_COLS || newItemRect.y + newItemRect.height > GRID_ROWS) {
            showMessageBox("Item cannot be placed out of bounds.", "error");
            return;
        }

        const isOccupied = placedItems.some(item => {
            const def = getFurnitureDef(item.id);
            if (!def || !def.isObstacle) return false;
            const existingItemRect = { x: item.x, y: item.y, width: def.width, height: def.height };
            return (
                newItemRect.x < existingItemRect.x + existingItemRect.width &&
                newItemRect.x + newItemRect.width > existingItemRect.x &&
                newItemRect.y < existingItemRect.y + existingItemRect.height &&
                newItemRect.y + newItemRect.height > existingItemRect.y
            );
        });

        if (isOccupied) {
            showMessageBox("This space is occupied by an obstacle.", "error");
            return;
        }
        
        const newItem = { instanceId: `${inventoryItem.id}_${Date.now()}`, id: inventoryItem.id, x, y };
        updateLayout([...placedItems, newItem]);
        processAchievement('furniturePlaced');
        setSelectedItemForPlacing(null);
        setGhostPosition(null);
    } else {
      setSelectedPlacedItem(null);
    }
  };

  const handleItemClick = (e, item) => {
    e.stopPropagation();
    if (editMode) {
      setSelectedPlacedItem(item);
      setSelectedItemForPlacing(null);
      setGhostPosition(null);
    } else if (item.id.includes('trophy_case')) {
      setShowTrophyModal(true);
    } else if (item.id.includes('computer_setup')) {
      setCurrentFunFact(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
      setShowFunFactModal(true);
    }
  };

  const handleRemoveItem = () => {
    if (!selectedPlacedItem) return;
    const newItems = placedItems.filter(item => item.instanceId !== selectedPlacedItem.instanceId);
    updateLayout(newItems);
    setSelectedPlacedItem(null);
  };
  
  const handleExitEditMode = () => {
    setEditMode(false);
    setSelectedItemForPlacing(null);
    setSelectedPlacedItem(null);
    setGhostPosition(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white">My Sanctum</h2>
          <p className="text-slate-400">Your personal space to decorate and display achievements.</p>
        </div>
        <button
          onClick={() => editMode ? handleExitEditMode() : setEditMode(true)}
          className={`px-5 py-2 rounded-lg font-semibold transition-colors z-30 ${editMode ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
        >
          {editMode ? 'Exit Edit Mode' : 'Edit Sanctum'}
        </button>
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        <div 
            className="flex-grow w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-xl relative min-h-[500px] overflow-hidden" 
            style={{ perspective: '1200px' }}
        >
            <div className="absolute top-0 left-0 w-full h-[60%]" style={wallStyle} />
            <div 
              className="absolute top-[60%] left-0 w-full h-full" 
              style={{ 
                  transform: 'rotateX(60deg)', 
                  transformOrigin: 'top center', 
                  transformStyle: 'preserve-3d',
              }}
            >
                {/* Main Grid for Interaction */}
                <div 
                    className="absolute inset-0 grid" 
                    style={{ gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`, gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)` }}
                    onMouseLeave={() => setGhostPosition(null)}
                >
                    {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => {
                        const x = i % GRID_COLS;
                        const y = Math.floor(i / GRID_COLS);
                        return <div key={i} onMouseEnter={() => handleGridCellHover(x, y)} onClick={() => handleGridClick(x, y)} className={`border-r border-b border-slate-600/10 ${editMode ? 'hover:bg-indigo-500/20' : ''}`} />;
                    })}
                </div>

                {/* Placed Items */}
                {placedItems
                    .map(item => ({...item, def: getFurnitureDef(item.id)}))
                    .filter(item => item.def)
                    .sort((a, b) => (a.y + a.def.height) - (b.y + b.def.height))
                    .map(item => (
                      <div key={item.instanceId} onClick={(e) => handleItemClick(e, item)} className={`absolute transition-all duration-200 ${editMode ? 'cursor-pointer hover:brightness-110' : ''} ${selectedPlacedItem?.instanceId === item.instanceId ? 'ring-2 ring-red-500' : ''}`} style={{ left: `${(item.x / GRID_COLS) * 100}%`, top: `${(item.y / GRID_ROWS) * 100}%`, width: `${(item.def.width / GRID_COLS) * 100}%`, height: `${(item.def.height / GRID_ROWS) * 100}%`, transform: `translateZ(5px)`, transformStyle: 'preserve-3d' }}>
                        <div className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-4/5 h-2/5" style={{ background: 'rgba(0, 0, 0, 0.4)', borderRadius: '50%', filter: 'blur(12px)', transform: 'scaleY(0.4) translateZ(-1px)' }} />
                        <div className="w-full h-full drop-shadow-lg" style={{ transform: 'rotateX(-60deg)', transformOrigin: 'bottom center' }} dangerouslySetInnerHTML={{ __html: item.def.display }} />
                      </div>
                    ))
                }

                {/* Roaming Pet */}
                {stats?.currentPet && !editMode && (
                  <div className="absolute transition-all duration-1000 ease-in-out" style={{ left: `${(petPosition.x / GRID_COLS) * 100}%`, top: `${(petPosition.y / GRID_ROWS) * 100}%`, width: `${(1 / GRID_COLS) * 100}%`, height: `${(1 / GRID_ROWS) * 100}%`, transform: 'translateZ(10px)', zIndex: 50 }}>
                    <div className="w-full h-full text-2xl" style={{ transform: 'rotateX(-60deg) scale(1.5)', transformOrigin: 'bottom center' }}>
                      {stats.currentPet.display}
                    </div>
                  </div>
                )}
                
                {/* Ghost Placement Preview */}
                {editMode && ghostPosition && selectedItemForPlacing && (
                    <div className="absolute bg-green-500/30 border-2 border-dashed border-green-400 pointer-events-none" style={{ left: `${(ghostPosition.x / GRID_COLS) * 100}%`, top: `${(ghostPosition.y / GRID_ROWS) * 100}%`, width: `${(selectedItemForPlacing.width / GRID_COLS) * 100}%`, height: `${(selectedItemForPlacing.height / GRID_ROWS) * 100}%`, zIndex: 999 }} />
                )}
            </div>
        </div>

        {editMode && (
          <div className="xl:w-80 flex-shrink-0">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex flex-col gap-4">
              {selectedPlacedItem ? (
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{getFurnitureDef(selectedPlacedItem.id)?.name}</h3>
                  <p className="text-sm text-slate-400 capitalize mb-3">Rarity: {getFurnitureDef(selectedPlacedItem.id)?.rarity}</p>
                  <button onClick={handleRemoveItem} className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Remove Item</button>
                  <button onClick={() => setSelectedPlacedItem(null)} className="w-full mt-2 bg-slate-600 text-white px-4 py-2 rounded-md hover:bg-slate-500">Deselect</button>
                </div>
              ) : (
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">My Furniture</h3>
                  <p className="text-sm text-slate-400 mb-4">{selectedItemForPlacing ? `Placing: ${selectedItemForPlacing.name}` : "Select an item to place."}</p>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                    {ownedFurnitureDetails.map(item => (
                      <div key={item.id} onClick={() => handleSelectForPlacing(item)} className={`bg-slate-700/80 p-3 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-slate-700 ${selectedItemForPlacing?.id === item.id ? 'ring-2 ring-indigo-500' : ''}`}>
                        <div className="w-12 h-12 bg-slate-800 rounded flex-shrink-0 flex items-center justify-center p-1" dangerouslySetInnerHTML={{ __html: item.display }}></div>
                        <div>
                          <p className="font-semibold text-white">{item.name}</p>
                          <p className="text-xs text-slate-400">{item.width}x{item.height} | {item.rarity}</p>
                        </div>
                      </div>
                    ))}
                    {ownedFurnitureDetails.length === 0 && <p className="text-center text-slate-500">Buy furniture from the shop!</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {showTrophyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setShowTrophyModal(false)}>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl p-8 w-full max-w-3xl max-h-[80vh] flex flex-col text-white" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-6 text-center">My Trophy Wall</h3>
            <div className="overflow-y-auto pr-2 space-y-4">
              {completedAssignments.length > 0 ? completedAssignments.map(trophy => (
                <div key={trophy.id} className="bg-slate-700/50 p-4 rounded-lg">
                  <p className="font-bold text-lg text-yellow-400">{trophy.assignment}</p>
                  <p className="text-sm text-slate-300">Class: {trophy.class}</p>
                  <p className="text-sm text-slate-400">Completed on: {new Date(trophy.dateCompleted).toLocaleDateString()}</p>
                </div>
              )) : <p className="text-slate-400 text-center">No trophies earned yet.</p>}
            </div>
          </div>
        </div>
      )}
      {showFunFactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={() => setShowFunFactModal(false)}>
          <div className="bg-slate-800 border border-indigo-500 rounded-2xl shadow-xl p-8 w-full max-w-md text-white text-center" onClick={e => e.stopPropagation()}>
            <h3 className="text-2xl font-bold mb-4 text-indigo-300">A Quick Byte of Motivation!</h3>
            <p className="text-lg text-slate-300 mb-6">"{currentFunFact}"</p>
            <button onClick={() => setShowFunFactModal(false)} className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700">Close</button>
          </div>
        </div>
      )}
    </div>
  );
};
// NEW: Component for the "Mission Control" Modal
const MissionControlModal = ({ isOpen, onClose, assignment, unlockedLocations, onLaunchMission }) => {
  const [departure, setDeparture] = useState(null);
  const [destination, setDestination] = useState(null);
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    // Reset state when the modal is opened/closed
    setDeparture(null);
    setDestination(null);
    setSelectedRoute(null);
  }, [isOpen]);

  const handleLocationSelect = (location) => {
    // If we haven't selected a start point yet...
    if (!departure) {
      // We can only depart from an unlocked location.
      if (!unlockedLocations.includes(location.id)) {
        showMessageBox("You must depart from an unlocked location.", "error");
        return;
      }
      setDeparture(location);
      setDestination(null);
      setSelectedRoute(null);
    } else {
      // If we click the departure point again, deselect everything.
      if (location.id === departure.id) {
        setDeparture(null);
        setDestination(null);
        setSelectedRoute(null);
        return;
      }
      
      // Check if a route exists from our departure point to the selected location.
      const route = starChartData.routes.find(r => 
        (r.from === departure.id && r.to === location.id) || 
        (r.from === location.id && r.to === departure.id)
      );

      if (route) {
        setDestination(location);
        setSelectedRoute(route);
      } else {
        showMessageBox("No direct route to that location.", "error");
      }
    }
  };
  
  const getPosition = (locationId) => {
    const loc = starChartData.locations.find(l => l.id === locationId);
    return loc ? loc.position : { top: 0, left: 0 };
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col text-white" onClick={e => e.stopPropagation()}>
        <h3 className="text-3xl font-bold p-6 text-center border-b border-slate-700">Mission Control</h3>
        <div className="flex-grow flex flex-col md:flex-row">
          <div className="w-full md:w-1/4 p-6 border-r border-slate-700 flex flex-col">
            <h4 className="text-xl font-semibold text-indigo-300">Mission Briefing</h4>
            <p className="text-sm text-slate-400 mt-1">Focusing on:</p>
            <p className="text-lg font-bold text-white mb-4">{assignment.assignment}</p>
            
            <div className="mt-4">
              <p className="text-sm text-slate-400">Departure:</p>
              <p className={`text-lg font-semibold ${departure ? 'text-green-400' : 'text-slate-500'}`}>{departure ? departure.name : 'Select a starting point'}</p>
            </div>
            <div className="mt-2">
              <p className="text-sm text-slate-400">Destination:</p>
              <p className={`text-lg font-semibold ${destination ? 'text-blue-400' : 'text-slate-500'}`}>{destination ? destination.name : 'Select a destination'}</p>
            </div>
            
            {selectedRoute && (
              <div className="mt-auto bg-slate-800/50 p-4 rounded-lg">
                <p className="font-semibold">Route Details:</p>
                <p>Duration: <span className="font-bold text-cyan-400">{selectedRoute.duration} minutes</span></p>
                <p>Reward: <span className="font-bold text-yellow-400">{selectedRoute.xpReward} XP</span> (Banked on completion)</p>
              </div>
            )}
            <div className="mt-4 text-center text-xs text-yellow-400/80 p-2 bg-yellow-900/20 rounded-md border border-yellow-700/30">
              <p><strong>Heads Up:</strong> The mission will fail if you leave or switch tabs. Stay focused, pilot!</p>
            </div>

            <button onClick={() => onLaunchMission(selectedRoute)} disabled={!selectedRoute} className="mt-4 w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors">
              LAUNCH MISSION
            </button>
          </div>

          <div className="flex-grow relative bg-cover bg-center" style={{ backgroundImage: `url(${starmapImage})` }}>
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {starChartData.routes.map(route => {
                const pos1 = getPosition(route.from);
                const pos2 = getPosition(route.to);
                const isAvailable = unlockedLocations.includes(route.from) || unlockedLocations.includes(route.to);
                const isSelected = selectedRoute && selectedRoute.id === route.id;
                return (
                  <line 
                    key={route.id} 
                    x1={pos1.left} y1={pos1.top} 
                    x2={pos2.left} y2={pos2.top} 
                    stroke={isSelected ? '#34d399' : isAvailable ? 'rgba(100, 116, 139, 0.5)' : 'rgba(71, 85, 105, 0.2)'} 
                    strokeWidth="2" 
                    strokeDasharray={isSelected ? "0" : "5, 5"}
                  />
                )
              })}
            </svg>
            {starChartData.locations.map(loc => {
              const isUnlocked = unlockedLocations.includes(loc.id);
              const isDeparture = departure?.id === loc.id;
              const isDestination = destination?.id === loc.id;
              return (
                <div key={loc.id} onClick={() => handleLocationSelect(loc)} className="absolute transform -translate-x-1/2 -translate-y-1/2 group" style={{...loc.position}}>
                  <img 
                    src={loc.iconAsset} 
                    alt={loc.name} 
                    className={`w-16 h-16 transition-all duration-200 ${isUnlocked ? 'cursor-pointer hover:scale-110' : 'filter grayscale opacity-50'} ${isDeparture ? 'ring-4 ring-green-500 rounded-full' : ''} ${isDestination ? 'ring-4 ring-blue-500 rounded-full' : ''}`}
                  />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max bg-slate-800 text-white text-sm px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <p className="font-bold">{loc.name}</p>
                    <p className="text-xs text-slate-400">{loc.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  );
};


// NEW: Component for the Cockpit Focus View (Revised Styling)
const CockpitView = ({ mission, onMissionComplete, isMobile }) => {
  const [remainingTime, setRemainingTime] = useState(mission.route.duration * 60);
  const [isGracePeriod, setIsGracePeriod] = useState(false);
  const [graceTimeLeft, setGraceTimeLeft] = useState(15);
  const gracePeriodTimer = useRef(null);
  const [isPortrait, setIsPortrait] = useState(window.innerHeight > window.innerWidth);

  useEffect(() => {
    if (!isMobile) return;
    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth);
    };
    window.addEventListener('resize', checkOrientation);
    checkOrientation();
    return () => window.removeEventListener('resize', checkOrientation);
  }, [isMobile]);

  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
  const rawProgress = ((mission.route.duration * 60 - remainingTime) / (mission.route.duration * 60));
  
  const mainViewProgressPercent = 5 + (rawProgress * 90);
  const verticalArc = -40 * Math.sin(rawProgress * Math.PI);

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onMissionComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onMissionComplete]);
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsGracePeriod(true);
        gracePeriodTimer.current = setInterval(() => {
          setGraceTimeLeft(prev => {
            if (prev <= 1) {
              clearInterval(gracePeriodTimer.current);
              onMissionComplete(false);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setIsGracePeriod(false);
        setGraceTimeLeft(15);
        clearInterval(gracePeriodTimer.current);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      clearInterval(gracePeriodTimer.current);
    };
  }, [onMissionComplete]);

  return (
    <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center">
      {isMobile && isPortrait && (
        <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-[100] text-white text-center p-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <h3 className="text-2xl font-bold">Please Rotate Your Device</h3>
          <p className="text-slate-400 mt-2">For the best experience, please use landscape mode.</p>
        </div>
      )}

      {/* MASTER CONTAINER */}
      <div className={`relative w-full max-w-[1920px] ${isMobile && isPortrait ? 'invisible' : ''}`} style={{ aspectRatio: '1920 / 1080' }}>
        <video src={starfieldVideo} autoPlay loop muted playsInline className="absolute top-0 left-0 w-full h-full object-cover" />
        <img src={cockpitImage} alt="Cockpit View" className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none z-10" />

        {/* --- DIEGETIC UI ELEMENTS (Positioned relative to the master container) --- */}
        <div className="absolute z-0 pointer-events-none" style={{ top: '23%', left: '33%', width: '34%', height: '40%' }}>
            <div className="absolute top-1/2" style={{ left: `${mainViewProgressPercent}%`, transform: `translate(-50%, -50%) translateY(${verticalArc}px)` }}>
                <img src={spaceshipIcon} alt="Scholar Ship" className="w-10 h-10" />
            </div>
        </div>
        
        <div className="absolute z-20" style={{ top: '68.2%', left: '33.8%', width: '14%', height: '14%' }}>
            <div className="relative w-full h-full p-2 flex flex-col justify-center font-mono bg-black/20 rounded-md">
                <div style={{ textShadow: '0 0 8px rgba(0, 255, 255, 0.9)' }}>
                    <p className="text-cyan-300 text-[10px] leading-tight">MISSION OBJECTIVE</p>
                    <p className="text-white text-xs leading-tight truncate">{mission.assignmentName}</p>
                    <p className="text-cyan-300 text-[10px] mt-1 leading-tight">TIME REMAINING</p>
                    <p className="text-white text-3xl font-bold leading-none">{formatTime(remainingTime)}</p>
                </div>
            </div>
        </div>
        
        <div className="absolute z-20 flex items-center justify-center" style={{ top: '68%', left: '50%', width: '8%', height: '12%', transform: 'translateX(-50%)' }}>
             <button 
               onClick={() => onMissionComplete(false)} 
               className="w-[95%] h-[95%] bg-red-900/80 text-white font-bold flex flex-col items-center justify-center rounded-md border-2 border-red-700/80 hover:bg-red-800 transition-colors"
             >
               <span className="text-xl leading-none font-mono">ABANDON</span>
               <span className="text-lg leading-none font-mono">MISSION</span>
             </button>
        </div>

        <div className="absolute z-20 flex items-center font-mono" style={{ top: '89%', left: '50%', width: '16%', height: '1.5%', transform: 'translateX(-50%)' }}>
            <div className="w-full h-full bg-black/50 border border-cyan-700/50 rounded-sm p-0.5">
                <div className="h-full bg-cyan-400 rounded-sm" style={{ width: `${rawProgress * 100}%`, transition: 'width 1s linear' }}></div>
            </div>
        </div>
      </div>

      {isGracePeriod && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <h3 className="text-4xl font-bold text-yellow-400">MISSION PAUSED</h3>
          <p className="text-6xl font-mono my-4">{graceTimeLeft}</p>
          <p className="text-slate-400 mb-6">Return to this tab before the timer runs out!</p>
        </div>
      )}
    </div>
  );
};

// --- REVISED: Alchemist's Workshop Component ---
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


// --- Sub-Modals for Alchemist's Workshop ---

// NEW: Cattery Modal to change cat appearance
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
              <img src={item.icon} alt={item.name} className="w-16 h-16 mx-auto object-contain" />
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
                  <img src={item.icon} alt={item.name} className="w-16 h-16 mx-auto" />
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
            <img src={currentItem.icon} alt={currentItem.name} className="w-20 h-20 mb-4" />
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
                        <img src={ing.def.icon} alt={ing.def.name} className="w-10 h-10" />
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
                         <img src={ing.def.icon} alt={ing.def.name} className="w-10 h-10" />
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
// --- NEW: ALCHEMY SHOP DEFINITIONS ---
const alchemyShopItems = {
  seeds: [
    { id: 'seed_focuroot', cost: 15 },
    { id: 'seed_swiftblossom', cost: 25 },
    { id: 'seed_stillpetal', cost: 40 },
    { id: 'seed_oyster_mushroom', cost: 60 },
    { id: 'seed_sunfruit', cost: 150 },
    { id: 'seed_luckleaf', cost: 300 },
  ],
  cats: [
    { id: 'cat2', name: 'Calico Companion', cost: 2000, previewIcon: cat2IdleSheet },
    { id: 'cat3', name: 'Sable Shadow', cost: 2000, previewIcon: cat3IdleSheet },
    { id: 'cat4', name: 'Golden Bombay', cost: 2000, previewIcon: cat4IdleSheet },
    { id: 'cat5', name: 'White Persian', cost: 2500, previewIcon: cat5IdleSheet },
    { id: 'cat6', name: 'Siamese Sphinx', cost: 2500, previewIcon: cat6IdleSheet },
  ],
  rawIngredients: [
    { id: 'goblin_ear', cost: 100 },
    { id: 'skeleton_bone', cost: 120 },
    { id: 'shadow_essence', cost: 400 },
    { id: 'pristine_crystal', cost: 800 },
  ],
  upgrades: [
    // Garden
    { id: 'garden_plot_2', name: 'Additional Garden Plot', description: 'Adds one more plot to your garden.', cost: 500, required: { key: 'garden_plots', value: 1 }, action: { 'alchemy_state.upgrades.garden_plots': 2 } },
    { id: 'garden_plot_3', name: 'Additional Garden Plot', description: 'Adds one more plot to your garden.', cost: 1200, required: { key: 'garden_plots', value: 2 }, action: { 'alchemy_state.upgrades.garden_plots': 3 } },
    { id: 'garden_plot_4', name: 'Additional Garden Plot', description: 'Adds one more plot to your garden.', cost: 2500, required: { key: 'garden_plots', value: 3 }, action: { 'alchemy_state.upgrades.garden_plots': 4 } },
    // Bench
    { id: 'bench_level_2', name: 'Sturdy Mortar', description: 'Improves your tools, making it easier to achieve "Fine" quality.', cost: 750, required: { key: 'bench_level', value: 1 }, action: { 'alchemy_state.upgrades.bench_level': 2 } },
    { id: 'bench_level_3', name: 'Refined Alchemist\'s Kit', description: 'Top-tier tools significantly increase the "Fine" quality zone.', cost: 2000, required: { key: 'bench_level', value: 2 }, action: { 'alchemy_state.upgrades.bench_level': 3 } },
    // Cauldron
    { id: 'cauldron_level_2', name: 'Cast-Iron Cauldron', description: 'Reduces the chance of failure when brewing.', cost: 1000, required: { key: 'cauldron_level', value: 1 }, action: { 'alchemy_state.upgrades.cauldron_level': 2 } },
    { id: 'cauldron_level_3', name: 'Star-Metal Cauldron', description: 'Greatly reduces failure chance and may save ingredients.', cost: 3000, required: { key: 'cauldron_level', value: 2 }, action: { 'alchemy_state.upgrades.cauldron_level': 3 } },
    // Grimoire
    { id: 'grimoire_level_2', name: 'Leather-Bound Tome', description: 'Reduces the cost of researching new recipes.', cost: 1500, required: { key: 'grimoire_level', value: 1 }, action: { 'alchemy_state.upgrades.grimoire_level': 2 } },
  ]
};

// --- NEW: Alchemy Shop Modal Component ---
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
                    <img src={ingDef.icon} alt={def.name} className="w-16 h-16 mx-auto object-contain" />
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
                    <img src={def.icon} alt={def.name} className="w-16 h-16 mx-auto object-contain" />
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
                    <img src={item.def.icon} alt={item.def.name} className="w-16 h-16 mx-auto object-contain" />
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

// --- NEW: Alchemy Cat Component ---
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



// --- END OF NEW ALCHEMY COMPONENTS ---

// --- NEW: Garden Modal Component ---
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

// --- NEW: Plant Plot Component ---
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

// --- NEW: Seed Selection Modal ---
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
                            <img src={alchemyIngredients[seed.def.yields].icon} alt={seed.def.name} className="w-12 h-12 mx-auto" />
                            <p className="text-xs font-bold mt-1">{seed.def.name}</p>
                            <p className="text-xs">x{seed.count}</p>
                        </button>
                    )) : <p className="col-span-3 text-center text-slate-500">You have no seeds!</p>}
                </div>
            </div>
        </div>
    );
};
// Component for the XP Gain Animation
const XpBarAnimation = ({ xpGained, stats, calculateLevelInfo, onAnimationComplete, onAudioReady, originEvent }) => {
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

// Helper hook for preventing button spam on async operations
const useActionLock = () => {
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

// NEW: Friend Profile Modal
const FriendProfileModal = ({ profile, onClose, getFullCosmeticDetails, getItemStyle, calculateLevelInfo }) => {
  if (!profile) return null;

  const levelInfo = calculateLevelInfo(profile.totalXP);
  
  const equippedAvatar = getFullCosmeticDetails(profile.equippedItems?.avatar, 'avatars');
  const equippedBanner = getFullCosmeticDetails(profile.equippedItems?.banner, 'banners');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-xl w-full max-w-md text-white" onClick={e => e.stopPropagation()}>
        <div 
          className="h-32 rounded-t-2xl flex items-end p-4 relative" 
          style={getItemStyle(equippedBanner) || {backgroundColor: '#475569'}}
        >
          <div className="w-24 h-24 rounded-full bg-slate-700 flex items-center justify-center text-5xl border-4 border-slate-800" style={getItemStyle(equippedAvatar)}>
            {(!equippedAvatar?.placeholder || equippedAvatar.placeholder === 'URL_PLACEHOLDER') && (equippedAvatar?.display || '👤')}
          </div>
          <h3 className="ml-4 text-3xl font-bold text-white" style={{textShadow: '2px 2px 4px rgba(0,0,0,0.7)'}}>{profile.username}</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <p className="text-sm text-slate-400">Level</p>
              <p className="text-2xl font-bold">{levelInfo.level}</p>
            </div>
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <p className="text-sm text-slate-400">Total XP</p>
              <p className="text-2xl font-bold">{profile.totalXP}</p>
            </div>
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <p className="text-sm text-slate-400">Tasks Completed</p>
              <p className="text-2xl font-bold">{profile.assignmentsCompleted}</p>
            </div>
            <div className="bg-slate-700/50 p-3 rounded-lg">
              <p className="text-sm text-slate-400">Highest Dungeon Floor</p>
              <p className="text-2xl font-bold">{profile.dungeon_floor || 0}</p>
            </div>
          </div>
          <button onClick={onClose} className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const useDebounce = (value, delay) => {

    const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
};
const useWindowSize = () => {
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
const cacheData = (key, data) => {
  const item = {
    data: data,
    timestamp: Date.now(),
  };
  sessionStorage.setItem(key, JSON.stringify(item));
};

const getCachedData = (key, maxAgeSeconds) => {
  const itemStr = sessionStorage.getItem(key);
  if (!itemStr) return null;

  try {
    const item = JSON.parse(itemStr);
    const now = Date.now();
    if (now - item.timestamp > maxAgeSeconds * 1000) {
      sessionStorage.removeItem(key);
      return null;
    }
    return item.data;
  } catch (error) {
    console.error("Failed to parse cached data:", error);
    return null;
  }
};
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
            
            try {
              // Create the private stats document
              await setDoc(statsDocRef, newUserData);
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

// Component for Assignment Tracker Sheet
const AssignmentTracker = ({ stats, assignments, setIsAddModalOpen, handleCompletedToggle, addAssignmentToFirestore, updateAssignmentInFirestore, deleteAssignmentFromFirestore, isAddModalOpen, promptMissionStart, isMobile, updateStatsInFirestore }) => {
    const [expandedAssignmentId, setExpandedAssignmentId] = useState(null);
    const [editingAssignmentData, setEditingAssignmentData] = useState(null);
    const [newSubtaskName, setNewSubtaskName] = useState('');

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

    const handleToggleDetails = (assignment) => {
      if (expandedAssignmentId === assignment.id) {
        setExpandedAssignmentId(null);
        setEditingAssignmentData(null);
      } else {
        setExpandedAssignmentId(assignment.id);
        // Create a local copy of the assignment for editing
        setEditingAssignmentData({ ...assignment });
      }
    };
    
    const handleEditingChange = (field, value) => {
      let updatedValue = value;
      if (field === 'dueDate' || field === 'dateCompleted' || field === 'recurrenceEndDate') {
        updatedValue = value ? new Date(value) : null;
      } else if (field.startsWith('points') || field === 'timeEstimate') {
        updatedValue = parseFloat(value) || 0;
      }
      setEditingAssignmentData(prev => ({ ...prev, [field]: updatedValue }));
    };

    const handleSaveAssignmentChanges = async () => {
      if (!editingAssignmentData) return;
      
      const { id, ...dataToSave } = editingAssignmentData;

      // CRITICAL FIX: Sanitize the data to prevent sending undefined fields to Firestore.
      const sanitizedData = {
        ...dataToSave,
        dueDate: dataToSave.dueDate || null,
        dateCompleted: dataToSave.dateCompleted || null,
        recurrenceEndDate: dataToSave.recurrenceEndDate || null,
      };

      await updateAssignmentInFirestore(id, sanitizedData);
      
      showMessageBox("Changes saved!", "info");
      setExpandedAssignmentId(null);
      setEditingAssignmentData(null);
    };


    const handleDelete = async (id) => {
      await deleteAssignmentFromFirestore(id);
      showMessageBox("Assignment deleted.", "info");
    };

    const handleAddSubtask = async (assignmentId) => {
      if (!newSubtaskName.trim()) {
        showMessageBox("Subtask name cannot be empty.", "error");
        return;
      }
      const assignment = assignments.find(a => a.id === assignmentId);
      if (assignment) {
        const updatedSubtasks = [...(assignment.subtasks || []), { name: newSubtaskName.trim(), completed: false }];
        await updateAssignmentInFirestore(assignmentId, { subtasks: updatedSubtasks });
        // Also update the local editing state if this is the expanded assignment
        if (editingAssignmentData && editingAssignmentData.id === assignmentId) {
          setEditingAssignmentData(prev => ({...prev, subtasks: updatedSubtasks}));
        }
        setNewSubtaskName('');
      }
    };

    const handleToggleSubtask = async (assignmentId, subtaskIndex) => {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (assignment) {
        const updatedSubtasks = [...assignment.subtasks];
        const wasCompleted = updatedSubtasks[subtaskIndex].completed;
        updatedSubtasks[subtaskIndex].completed = !updatedSubtasks[subtaskIndex].completed;
        
        await updateAssignmentInFirestore(assignmentId, { subtasks: updatedSubtasks });
        
        // Award XP for completing an Epic Quest milestone
        if (assignment.isEpicQuest && !wasCompleted) {
          updateStatsInFirestore({ totalXP: increment(15) });
          showMessageBox("Milestone Complete! +15 XP", "info");
        }

         if (editingAssignmentData && editingAssignmentData.id === assignmentId) {
          setEditingAssignmentData(prev => ({...prev, subtasks: updatedSubtasks}));
        }
      }
    };

    const handleDeleteSubtask = async (assignmentId, subtaskIndex) => {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (assignment) {
        const updatedSubtasks = assignment.subtasks.filter((_, index) => index !== subtaskIndex);
        await updateAssignmentInFirestore(assignmentId, { subtasks: updatedSubtasks });
        if (editingAssignmentData && editingAssignmentData.id === assignmentId) {
          setEditingAssignmentData(prev => ({...prev, subtasks: updatedSubtasks}));
        }
      }
    };

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">Assignment Tracker</h2>
            <p className="text-slate-400">Manage, track, and complete your assignments.</p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md flex items-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            <span>Add New</span>
          </button>
        </div>
        <AddAssignmentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddAssignment}
        />

        <AddAssignmentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddAssignment}
        />

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-white">
              <thead>
                <tr className="text-slate-400 uppercase text-sm leading-normal">
                  <th className={`py-3 ${isMobile ? 'px-2' : 'px-6'} text-left`}>Class</th>
                  <th className={`py-3 ${isMobile ? 'px-2' : 'px-6'} text-left`}>Assignment</th>
                  <th className={`py-3 ${isMobile ? 'px-2' : 'px-6'} text-left`}>Due Date</th>
                  {!isMobile && <th className="py-3 px-6 text-center">Status</th>}
                  {!isMobile && <th className="py-3 px-6 text-left">Difficulty</th>}
                  {!isMobile && <th className="py-3 px-6 text-left">Tags</th>}
                  <th className={`py-3 ${isMobile ? 'px-2' : 'px-6'} text-center`}>Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-300 text-sm font-light">
                {assignments.map((assignment) => {
                  const isCurrentlyLate = assignment.status !== 'Completed' && assignment.dueDate && new Date() > assignment.dueDate;
                  const wasCompletedLate = assignment.status === 'Completed' && assignment.dateCompleted && assignment.dueDate && assignment.dateCompleted > assignment.dueDate;
                  
                  return (
                    <React.Fragment key={assignment.id}>
                      <tr className={`border-b border-slate-700 hover:bg-slate-800/70 ${assignment.isEpicQuest ? 'bg-indigo-900/30' : ''}`}>
                        <td className={`py-3 ${isMobile ? 'px-2' : 'px-6'} text-left whitespace-nowrap`}>{assignment.class || '⚠️'}</td>
                        <td className={`py-3 ${isMobile ? 'px-2' : 'px-6'} text-left`}>
                          <div className="flex items-center">
                            {assignment.isEpicQuest && <span className="text-yellow-400 mr-2 text-lg" title="Epic Quest">📜</span>}
                            <span>{assignment.assignment}</span>
                          </div>
                        </td>
                        <td className={`py-3 ${isMobile ? 'px-2' : 'px-6'} text-left`}>{assignment.dueDate ? assignment.dueDate.toLocaleDateString() : '⚠️'}</td>
                        {!isMobile && <td className="py-3 px-6 text-center">
                          <input
                            type="checkbox"
                            checked={assignment.status === 'Completed'}
                            onChange={async (e) => {
                              // FIX: This ensures that if the details panel is open for this row,
                              // the most up-to-date edited data is used for the completion action.
                              const assignmentData = expandedAssignmentId === assignment.id ? editingAssignmentData : assignment;
                              
                              // Await the parent's Firestore operation to complete.
                              await handleCompletedToggle(e, assignment.id, assignmentData);
                              
                              // AFTER the operation is done, clean up the local UI state.
                              // This collapses the panel and ensures consistency.
                              if (expandedAssignmentId === assignment.id) {
                                setExpandedAssignmentId(null);
                                setEditingAssignmentData(null);
                              }
                            }}
                            className="form-checkbox h-5 w-5 text-indigo-500 rounded bg-slate-700 border-slate-600 focus:ring-indigo-500"
                          />
                          {(isCurrentlyLate || wasCompletedLate) && (<span className="ml-2 text-red-500 font-semibold text-xs">Late!</span>)}
                        </td>}
                        {!isMobile && <td className="py-3 px-6 text-left">{assignment.difficulty}</td>}
                        {!isMobile && <td className="py-3 px-6 text-left">
                          <div className="flex flex-wrap gap-1">
                            {assignment.tags && assignment.tags.map(tag => (
                              <span key={tag} className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">{tag}</span>
                            ))}
                          </div>
                        </td>}
                        <td className={`py-3 ${isMobile ? 'px-2' : 'px-6'} text-center`}>
                          <div className="flex items-center justify-center gap-2">
                            {assignment.status !== 'Completed' && (
                              <button onClick={() => promptMissionStart(assignment)} className="text-cyan-400 hover:text-cyan-300 p-1 text-xl" title="Start Focus Mission">
                                🚀
                              </button>
                            )}
                            <button onClick={() => handleToggleDetails(assignment)} className="text-indigo-400 hover:text-indigo-300 p-1" title="Details">
                              {expandedAssignmentId === assignment.id ? '🔼' : '🔽'}
                            </button>
                             <button onClick={() => handleDelete(assignment.id)} className="text-red-400 hover:text-red-600 p-1" title="Delete">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                      {expandedAssignmentId === assignment.id && editingAssignmentData && (
                        <tr className="bg-slate-800">
                          <td colSpan="7" className="p-4 border-t-2 border-slate-700">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm p-4 bg-slate-900/50 rounded-lg">
                                <div>
                                  <strong className="text-slate-400 block mb-1">Assignment Name:</strong>
                                  <input type="text" value={editingAssignmentData.assignment || ''} onChange={(e) => handleEditingChange('assignment', e.target.value)} className="bg-slate-700 border border-slate-600 rounded p-2 w-full"/>
                                </div>
                                <div>
                                  <strong className="text-slate-400 block mb-1">Class Name:</strong>
                                  <input type="text" value={editingAssignmentData.class || ''} onChange={(e) => handleEditingChange('class', e.target.value)} className="bg-slate-700 border border-slate-600 rounded p-2 w-full"/>
                                </div>
                                <div>
                                  <strong className="text-slate-400 block mb-1">Due Date:</strong>
                                  <input type="date" value={editingAssignmentData.dueDate ? new Date(editingAssignmentData.dueDate).toISOString().split('T')[0] : ''} onChange={(e) => handleEditingChange('dueDate', e.target.value)} className="bg-slate-700 border border-slate-600 rounded p-2 w-full"/>
                                </div>
                                <div>
                                  <strong className="text-slate-400 block mb-1">Time Est. (hrs):</strong>
                                  <input type="number" value={editingAssignmentData.timeEstimate || ''} onChange={(e) => handleEditingChange('timeEstimate', e.target.value)} className="bg-slate-700 border border-slate-600 rounded p-2 w-full"/>
                                </div>
                                <div>
                                  <strong className="text-slate-400 block mb-1">Recurrence:</strong>
                                  <span className="capitalize p-2 block">{editingAssignmentData.recurrenceType}</span>
                                </div>
                                <div className="md:col-span-3 pt-2 mt-2 border-t border-slate-700">
                                  <strong className="text-slate-400 block mb-2">Subtasks:</strong>
                                {editingAssignmentData.subtasks && editingAssignmentData.subtasks.length > 0 ? (
                                  editingAssignmentData.subtasks.map((subtask, idx) => (
                                    <div key={`${editingAssignmentData.id}-subtask-${idx}`} className="flex items-center justify-between bg-slate-700/50 p-2 rounded-md mb-1">
                                      <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={subtask.completed}
                                          onChange={() => handleToggleSubtask(editingAssignmentData.id, idx)}
                                          className="form-checkbox h-4 w-4 text-green-500 rounded bg-slate-800"
                                        />
                                        <span className={`text-slate-300 ${subtask.completed ? 'line-through text-slate-500' : ''}`}>
                                          {subtask.name}
                                        </span>
                                      </label>
                                      <button
                                        onClick={() => handleDeleteSubtask(editingAssignmentData.id, idx)}
                                        className="text-red-400 hover:text-red-600"
                                      >
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                      </button>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-slate-500 text-xs">No subtasks added yet.</p>
                                )}
                                <div className="flex mt-2 space-x-2">
                                  <input
                                    type="text"
                                    placeholder="New subtask..."
                                    value={newSubtaskName}
                                    onChange={(e) => setNewSubtaskName(e.target.value)}
                                    className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md text-sm focus:ring-indigo-500"
                                  />
                                  <button
                                    onClick={() => handleAddSubtask(editingAssignmentData.id)}
                                    className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                                  >
                                    Add
                                  </button>
                                </div>
                              </div>
                               <div className="md:col-span-3 flex justify-end space-x-2 mt-4">
                                <button onClick={() => handleToggleDetails(editingAssignmentData)} className="bg-slate-600 text-white px-4 py-2 rounded-md hover:bg-slate-500">Cancel</button>
                                <button onClick={handleSaveAssignmentChanges} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">Save Changes</button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
    
// Component for My Profile Sheet
const MyProfile = ({ stats, user, userId, updateStatsInFirestore, handleEvolvePet, getFullPetDetails, getFullCosmeticDetails, getItemStyle, db, appId, showMessageBox, actionLock, processAchievement, calculateLevelInfo }) => {
  // Create a unified draft state from the incoming props
  const [draftState, setDraftState] = useState({ ...stats });
  const [activeTab, setActiveTab] = useState('collections');
  const [friendUsernameInput, setFriendUsernameInput] = useState('');
  const [friendProfiles, setFriendProfiles] = useState({});
  const [viewingFriendProfile, setViewingFriendProfile] = useState(null);
  
  const [usernameInput, setUsernameInput] = useState(stats.username || '');

  const craftingCosts = {
    common: 20, rare: 60, epic: 200, legendary: 500,
  };

  // Sync draft with external changes from props
  useEffect(() => {
    setDraftState({ ...stats });
  }, [stats]);
  
  // Sync username input only when the source of truth in the draft changes
  useEffect(() => {
    setUsernameInput(draftState.username || '');
  }, [draftState.username]);
  
  useEffect(() => {
    if (!db || !stats.friends || stats.friends.length === 0) {
      setFriendProfiles({}); // Clear profiles if no friends
      return;
    }

    const fetchFriendProfiles = async () => {
      try {
        const statsCollectionRef = collection(db, `artifacts/${appId}/public/data/stats`);
        const friendIds = stats.friends;
        const profiles = {};
        const batches = [];

        // Firestore 'in' query is limited to 30 items, so we batch requests
        for (let i = 0; i < friendIds.length; i += 30) {
          const batchIds = friendIds.slice(i, i + 30);
          if (batchIds.length > 0) {
            batches.push(getDocs(query(statsCollectionRef, where(document.Id, 'in', batchIds))));
          }
        }
        
        const querySnapshotsArray = await Promise.all(batches);

        querySnapshotsArray.forEach(snapshot => {
          snapshot.forEach(doc => {
            profiles[doc.id] = { id: doc.id, ...doc.data() };
          });
        });

        setFriendProfiles(profiles);
      } catch (error) {
        console.error("Error fetching friend profiles:", error);
      }
    };

    fetchFriendProfiles();
  }, [db, stats.friends, appId]);
  
  // Check for unsaved changes by comparing the draft to the original props
  const hasUnsavedChanges = useMemo(() => {
    // Only compare the fields that can be changed in this component
    const editableFields = {
        username: draftState.username,
        friends: draftState.friends,
        equippedItems: draftState.equippedItems,
        currentPet: draftState.currentPet,
    };
    const originalFields = {
        username: stats.username,
        friends: stats.friends,
        equippedItems: stats.equippedItems,
        currentPet: stats.currentPet,
    };
    // Normalize to prevent false positives from timestamp differences or undefined properties
    return JSON.stringify(normalizeTimestamps(editableFields)) !== JSON.stringify(normalizeTimestamps(originalFields));
  }, [draftState, stats]);


  // --- Handlers for Save/Discard ---
  const handleSaveChanges = () => actionLock(async () => {
    if (!db || !user) return;
    const { username, friends, equippedItems, currentPet } = draftState;

    await updateStatsInFirestore({
      username,
      friends,
      equippedItems,
      currentPet
    });

    showMessageBox("Profile changes saved!", "info");
  });


  const handleDiscardChanges = () => {
    setDraftState({ ...stats }); // Revert all local changes
    showMessageBox("Changes discarded.", "info");
  };
  
  // --- Transactional & Immediate Handlers (Unchanged for data integrity) ---
  const handleCraftItem = useCallback(async (itemToCraft) => actionLock(async () => {
    if (!db || !user) return;
    const cost = craftingCosts[itemToCraft.rarity];
    if (!cost) { showMessageBox("This item cannot be crafted.", "error"); return; }

    const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);

    try {
        await runTransaction(db, async (transaction) => {
            const statsDoc = await transaction.get(statsDocRef);
            if (!statsDoc.exists()) throw new Error("User data not found.");
            
            const serverStats = statsDoc.data();
            if ((serverStats.cosmeticShards || 0) < cost) throw new Error("INSUFFICIENT_SHARDS");
            if ((serverStats.ownedItems || []).includes(itemToCraft.id)) throw new Error("ALREADY_OWNED");

            transaction.update(statsDocRef, {
                cosmeticShards: serverStats.cosmeticShards - cost,
                ownedItems: [...(serverStats.ownedItems || []), itemToCraft.id],
                cooldowns: { ...(serverStats.cooldowns || {}), craftShopItem: serverTimestamp() }
            });
        });
        showMessageBox(`Successfully crafted ${itemToCraft.name}!`, "info");
        processAchievement('cosmeticsCrafted');
    } catch (e) {
        const errorMsg = e.message.includes('permission-denied') ? "You're crafting too fast!" :
                         e.message === "INSUFFICIENT_SHARDS" ? "You don't have enough shards." :
                         e.message === "ALREADY_OWNED" ? "You already own this item." : "A server error occurred.";
        showMessageBox(errorMsg, "error");
    }
  }), [user, db, appId, showMessageBox, actionLock, processAchievement]);

    const handleBuyItem = async (item) => actionLock(async () => {
    if (!db || !user) return;
    
    const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);
    
    try {
      await runTransaction(db, async (transaction) => {
        const statsDoc = await transaction.get(statsDocRef);
        if (!statsDoc.exists()) throw new Error("User data missing.");
        
        const serverStats = statsDoc.data();

        if (serverStats.totalXP < item.cost) throw new Error("Not enough XP.");
        // FIX: Provide a fallback empty array to prevent .includes() on undefined
        if ((serverStats.ownedItems || []).includes(item.id) || (serverStats.ownedFurniture || []).includes(item.id)) throw new Error("Already owned.");

        const isFurniture = item.type === 'furniture';
        
        const updateData = {
            totalXP: serverStats.totalXP - item.cost,
            cooldowns: { ...(serverStats.cooldowns || {}), buyShopItem: serverTimestamp() },
            // FIX: Use fallback arrays here as well to safely add the new item
            ownedItems: !isFurniture ? [...(serverStats.ownedItems || []), item.id] : (serverStats.ownedItems || []),
            ownedFurniture: isFurniture ? [...(serverStats.ownedFurniture || []), item.id] : (serverStats.ownedFurniture || []),
        };
        transaction.update(statsDocRef, updateData);
      });
      showMessageBox(`Purchased ${item.name}!`, 'info');
      processAchievement('xpSpentInShop', item.cost); // We send the cost as progress
    } catch (error) {

        const errorMsg = error.message.includes('permission-denied') ? "You're buying too fast!" : error.message;
        showMessageBox(errorMsg, "error");
    }
  });
  
  // --- Handlers Refactored for Draft State ---
  const handleSaveUsername = () => {
    actionLock(async () => {
      const trimmedUsername = usernameInput.trim();
      if (trimmedUsername.length < 3 || trimmedUsername.length > 15) { showMessageBox("Username must be 3-15 characters.", "error"); return; }
      if (/\s/.test(trimmedUsername)) { showMessageBox("Username cannot contain spaces.", "error"); return; }
      if (trimmedUsername === stats.username) { showMessageBox("This is already your username.", "info"); return; }

      const newUsernameLower = trimmedUsername.toLowerCase();
      const usernameDocRef = doc(db, `usernames/${newUsernameLower}`);

      try {
        await runTransaction(db, async (transaction) => {
          const usernameDoc = await transaction.get(usernameDocRef);
          
          if (usernameDoc.exists() && usernameDoc.data().userId !== user.uid) {
            throw new Error("This username is already taken.");
          }

          const oldUsernameLower = stats.username?.toLowerCase();
          if (oldUsernameLower && oldUsernameLower !== newUsernameLower) {
            const oldUsernameDocRef = doc(db, `usernames/${oldUsernameLower}`);
            transaction.delete(oldUsernameDocRef);
          }
          
          transaction.set(usernameDocRef, { userId: user.uid });
          
          setDraftState(prev => ({ ...prev, username: trimmedUsername }));
        });
        
        showMessageBox(`Username set to "${trimmedUsername}"! Remember to save your profile changes.`, "info");
      } catch (error) {
        console.error("Username validation failed:", error);
        showMessageBox(error.message, "error");
      }
    });
  };


  const handleEquipItem = (item) => {
    setDraftState(prev => {
        let newEquippedItems = { ...prev.equippedItems };
        if (item.type === 'td_skin' || item.type === 'dungeon_emoji') {
            const category = item.type === 'td_skin' ? 'tdSkins' : 'dungeonEmojis';
            newEquippedItems[category] = { ...(prev.equippedItems[category] || {}), [item.for]: item.id };
        } else {
            newEquippedItems[item.type] = item.id;
        }
        return { ...prev, equippedItems: newEquippedItems };
    });
  };

  const handleEquipPet = (pet) => {
    setDraftState(prev => ({ ...prev, currentPet: pet }));
  };
  
     const handleAddFriendByUsername = () => {
    actionLock(async () => {
      const username = friendUsernameInput.trim();
      if (!username) { showMessageBox('Username cannot be empty.', 'error'); return; }
      if (username.toLowerCase() === (stats.username || '').toLowerCase()) { showMessageBox("You can't add yourself.", 'error'); return; }

      try {
        const usernameLower = username.toLowerCase();
        const usernameDocRef = doc(db, `usernames/${usernameLower}`);
        const usernameDoc = await getDoc(usernameDocRef);

        if (!usernameDoc.exists()) {
          showMessageBox(`User "${username}" not found. Usernames are case-insensitive.`, "error");
          return;
        }
        
        const friendId = usernameDoc.data().userId;

        if (draftState.friends.includes(friendId)) {
          showMessageBox(`"${username}" is already your friend.`, 'error');
          return;
        }
        
        setDraftState(prev => ({ ...prev, friends: [...prev.friends, friendId] }));
        setFriendUsernameInput('');
        showMessageBox(`Added ${username} as a friend! Remember to save changes.`, 'info');

      } catch (error) {
        console.error("Error adding friend by username:", error);
        showMessageBox("An error occurred while trying to add friend.", "error");
      }
    });
  };

  const handleRemoveFriend = (friendId) => {
    setDraftState(prev => ({ ...prev, friends: prev.friends.filter(id => id !== friendId) }));
  };

  const copyUserIdToClipboard = () => {
    navigator.clipboard.writeText(userId).then(() => showMessageBox('User ID copied!', 'info'), () => showMessageBox('Failed to copy.', 'error'));
  };

  const TabButton = ({ tabName, children }) => (
    <button onClick={() => setActiveTab(tabName)} className={`px-4 py-2 text-lg font-semibold transition-colors duration-200 ease-in-out ${activeTab === tabName ? 'text-accent border-b-2 border-accent' : 'text-slate-400 hover:text-white'}`}>
      {children}
    </button>
  );

  // Read from the `stats` prop for things the user owns.
  const ownedAvatars = stats.ownedItems.map(id => getFullCosmeticDetails(id, 'avatars')).filter(Boolean);
  const ownedBanners = stats.ownedItems.map(id => getFullCosmeticDetails(id, 'banners')).filter(Boolean);
  const ownedWallpapers = stats.ownedItems.map(id => getFullCosmeticDetails(id, 'wallpapers')).filter(Boolean);
  const ownedPetsFullDetails = stats.ownedPets.map(pet => getFullPetDetails(pet.id)).filter(Boolean);
  const ownedTdSkins = stats.ownedItems.map(id => getFullCosmeticDetails(id, 'td_skins')).filter(Boolean);
  const ownedDungeonEmojis = stats.ownedItems.map(id => getFullCosmeticDetails(id, 'dungeon_emojis')).filter(Boolean);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white">My Profile</h2>
        <p className="text-slate-400">Manage your collections, friends, and shop for new items.</p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl">
       <div className="flex border-b border-slate-700">
          <TabButton tabName="collections">Collections</TabButton>
          <TabButton tabName="shop">Shop</TabButton>
          <TabButton tabName="crafting">Crafting</TabButton>
          <TabButton tabName="friends">Friends</TabButton>
        </div>
        
        <div className="p-6">
          {activeTab === 'collections' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-semibold text-white">Your Items</h3>
              <div>
                <h4 className="text-xl font-semibold text-indigo-300 mb-3">Avatars</h4>
                 <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                  {ownedAvatars.map(item => (<div key={item.id} onClick={() => handleEquipItem(item)} className={`aspect-square bg-slate-800/70 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700/70 transition-colors duration-200 ${draftState.equippedItems.avatar === item.id ? 'ring-2 ring-indigo-500' : ''}`}><div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-4xl mb-1" style={getItemStyle(item)}>{(!item.placeholder || item.placeholder === 'URL_PLACEHOLDER') && item.display}</div><p className="text-xs font-medium text-slate-300 text-center">{item.name}</p></div>))}
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-indigo-300 mb-3">Banners</h4>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {ownedBanners.map(item => (<div key={item.id} onClick={() => handleEquipItem(item)} className={`p-4 h-24 rounded-lg cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center text-center ${!getItemStyle(item).backgroundImage ? item.style : ''} ${draftState.equippedItems.banner === item.id ? 'ring-2 ring-indigo-500' : ''}`} style={getItemStyle(item)}><p className={`font-bold ${!getItemStyle(item).backgroundImage ? 'text-white bg-black bg-opacity-50 px-2 py-1 rounded' : ''}`}>{item.name}</p></div>))}
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-indigo-300 mb-3">Sanctum Walls</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {ownedWallpapers.map(item => (<div key={item.id} onClick={() => handleEquipItem(item)} className={`p-4 h-24 rounded-lg cursor-pointer flex items-center justify-center text-center transition-all ${draftState.equippedItems.wallpaper === item.id ? 'ring-2 ring-indigo-500' : 'hover:opacity-80'}`} style={item.style}><p className="font-bold text-white bg-black/50 px-2 py-1 rounded">{item.name}</p></div>))}
                </div>
              </div>
              <div>
                 <h4 className="text-xl font-semibold text-indigo-300 mb-3">Pets</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {ownedPetsFullDetails.map(pet => {
                    const basePetDef = Object.values(petDefinitions).flat().find(p => p.id === pet.id || p.evolutions?.some(e => e.id === pet.id));
                    const nextEvolutionStage = basePetDef?.evolutions?.[basePetDef.evolutions.findIndex(e => e.id === pet.id) + 1];
                    const canEvolve = nextEvolutionStage && stats.currentLevel >= nextEvolutionStage.levelRequired && stats.totalXP >= nextEvolutionStage.xpCost;
                    return (<div key={pet.id} className={`p-4 bg-slate-800/70 rounded-lg flex flex-col items-center text-center transition-colors ${draftState.currentPet?.id === pet.id ? 'ring-2 ring-green-500' : ''}`}><span className="text-5xl mb-2 cursor-pointer" onClick={() => handleEquipPet(pet)}>{pet.display}</span><p className="text-sm font-medium text-white">{pet.name}</p><p className={`text-xs font-bold capitalize ${pet.rarity}`}>{pet.rarity}</p>{nextEvolutionStage && (<div className="mt-2 w-full"><button onClick={(e) => { e.stopPropagation(); handleEvolvePet(pet); }} disabled={!canEvolve} className={`w-full text-xs px-2 py-1.5 rounded transition-colors ${canEvolve ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}> Evolve </button>{!canEvolve && <p className="text-xs text-slate-500 mt-1">Lvl {nextEvolutionStage.levelRequired} & {nextEvolutionStage.xpCost} XP</p>}</div>)}</div>);
                  })}
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-indigo-300 mb-3">Tower Defense Skins</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {ownedTdSkins.map(item => (<div key={item.id} onClick={() => handleEquipItem(item)} className={`p-4 bg-slate-800/70 rounded-lg flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${draftState.equippedItems.tdSkins?.[item.for] === item.id ? 'ring-2 ring-indigo-500' : 'hover:bg-slate-700'}`}><span className="text-4xl mb-2">{item.display}</span><p className="text-sm font-medium text-white flex-grow">{item.name}</p><p className="text-xs text-slate-400 capitalize">For: {item.for}</p></div>))}
                </div>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-indigo-300 mb-3">Dungeon Emojis</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {ownedDungeonEmojis.map(item => (<div key={item.id} onClick={() => handleEquipItem(item)} className={`p-4 bg-slate-800/70 rounded-lg flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${draftState.equippedItems.dungeonEmojis?.[item.for] === item.id ? 'ring-2 ring-indigo-500' : 'hover:bg-slate-700'}`}><span className="text-4xl mb-2">{item.display}</span><p className="text-sm font-medium text-white flex-grow">{item.name}</p><p className="text-xs text-slate-400 capitalize">For: {item.for}</p></div>))}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'shop' && (
             <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-semibold text-white mb-3">Wallpaper Shop</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {cosmeticItems.wallpapers.map(item => {
                    const isOwned = stats.ownedItems.includes(item.id);
                    const canAfford = stats.totalXP >= item.cost;
                    return (<div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col text-center"><div className="w-full h-20 mb-3 rounded" style={item.style}></div><p className="font-semibold text-white flex-grow">{item.name}</p><p className="text-xs text-slate-400 capitalize mb-3">{item.rarity}</p><button onClick={() => handleBuyItem(item)} disabled={isOwned || !canAfford} className={`w-full px-3 py-1.5 rounded text-sm font-semibold transition-colors ${isOwned ? 'bg-green-500/20 text-green-400 cursor-default' : !canAfford ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>{isOwned ? 'Owned' : `${item.cost} XP`}</button></div>);
                  })}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-3">Furniture Shop</h3>
                {Object.entries(furnitureDefinitions).map(([category, items]) => (<div key={category}><h4 className="text-xl font-semibold text-indigo-300 capitalize mb-3">{category}</h4><div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{items.map(item => { const isOwned = stats.ownedFurniture.includes(item.id); const canAfford = stats.totalXP >= item.cost; return (<div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col items-center text-center"><div className="w-24 h-24 mb-2 flex items-center justify-center text-slate-300"><div className="w-16 h-16" dangerouslySetInnerHTML={{ __html: item.display }} /></div><p className="font-semibold text-white flex-grow">{item.name}</p><p className="text-xs text-slate-400 capitalize mb-3">{item.rarity}</p><button onClick={() => handleBuyItem(item)} disabled={isOwned || !canAfford} className={`w-full px-3 py-1.5 rounded text-sm font-semibold transition-colors ${isOwned ? 'bg-green-500/20 text-green-400 cursor-default' : !canAfford ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>{isOwned ? 'Owned' : `${item.cost} XP`}</button></div>);})}</div></div>))}
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-3">Tower Defense Skins</h3>
                <p className="text-sm text-slate-400 mb-4">Unlock skins by reaching higher floors in the Dungeon Crawler.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{cosmeticItems.td_skins.map(item => { const isOwned = stats.ownedItems.includes(item.id); const canAfford = stats.totalXP >= item.cost; const meetsRequirement = (stats.dungeon_floor || 0) >= item.floorRequired; const isLocked = !meetsRequirement; return (<div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col items-center text-center"><div className="w-16 h-16 mb-2 flex items-center justify-center text-4xl bg-slate-700 rounded-lg">{item.display}</div><p className="font-semibold text-white flex-grow">{item.name}</p><p className="text-xs text-slate-400 capitalize mb-1">For: {item.for}</p><p className="text-xs text-slate-400 capitalize mb-3">{item.rarity}</p><button onClick={() => handleBuyItem(item)} disabled={isOwned || !canAfford || isLocked} className={`w-full px-3 py-1.5 rounded text-sm font-semibold transition-colors ${isOwned ? 'bg-green-500/20 text-green-400 cursor-default' : isLocked ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : !canAfford ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>{isOwned ? 'Owned' : isLocked ? `Requires Floor ${item.floorRequired}` : `${item.cost} XP`}</button></div>);})}</div>
              </div>
              <div>
                <h3 className="text-2xl font-semibold text-white mb-3">Dungeon Emoji Shop</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{cosmeticItems.dungeon_emojis.map(item => { const isOwned = stats.ownedItems.includes(item.id); const canAfford = stats.totalXP >= item.cost; return (<div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col items-center text-center"><div className="w-16 h-16 mb-2 flex items-center justify-center text-4xl bg-slate-700 rounded-lg">{item.display}</div><p className="font-semibold text-white flex-grow">{item.name}</p><p className="text-xs text-slate-400 capitalize mb-1">For: {item.for}</p><p className="text-xs text-slate-400 capitalize mb-3">{item.rarity}</p><button onClick={() => handleBuyItem(item)} disabled={isOwned || !canAfford} className={`w-full px-3 py-1.5 rounded text-sm font-semibold transition-colors ${isOwned ? 'bg-green-500/20 text-green-400 cursor-default' : !canAfford ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>{isOwned ? 'Owned' : `${item.cost} XP`}</button></div>);})}</div>
              </div>
            </div>
          )}
          {activeTab === 'crafting' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-white">Item Crafting</h3>
                <div className="bg-slate-900/50 px-4 py-2 rounded-lg font-bold text-lg">
                  💎 <span className="text-cyan-400">{stats.cosmeticShards || 0}</span>
                </div>
              </div>
              <p className="text-slate-400 mb-6">Use Cosmetic Shards, earned from duplicate slot machine wins, to craft items you're missing.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {allRollableItems
                  .filter(item => !stats.ownedItems.includes(item.id) && craftingCosts[item.rarity])
                  .map(item => {
                    const cost = craftingCosts[item.rarity];
                    const canAfford = (stats.cosmeticShards || 0) >= cost;
                    return (
                      <div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col text-center">
                        <div className={`w-full h-20 mb-3 rounded flex items-center justify-center text-4xl ${item.style || ''}`} style={getItemStyle(item)}>
                          {item.display && !item.placeholder ? item.display : ''}
                        </div>
                        <p className="font-semibold text-white flex-grow text-sm">{item.name}</p>
                        <p className={`text-xs capitalize mb-3 font-bold ${item.rarity}`}>{item.rarity}</p>
                        <button 
                          onClick={() => handleCraftItem(item)} 
                          disabled={!canAfford} 
                          className={`w-full px-3 py-1.5 rounded text-sm font-semibold transition-colors ${!canAfford ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-cyan-600 text-white hover:bg-cyan-700'}`}
                        >
                          Craft (💎 {cost})
                        </button>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
          {activeTab === 'friends' && (
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4">Profile & Friends</h3>
              <div className="mb-8 p-4 bg-slate-900/50 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-2">Your Public Username</h4>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input type="text" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="Enter a username" className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500"/>
                  <button onClick={handleSaveUsername} className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700">Set Name</button>
                </div>
                <p className="text-xs text-slate-500 mt-2">This will appear on leaderboards. Changes are not saved until you hit "Save Changes" at the bottom.</p>
              </div>
              <h4 className="text-lg font-semibold text-white mb-2">Friend Management</h4>
              <div className="flex flex-col md:flex-row gap-4"><div className="flex-grow"><label className="text-sm text-slate-400 block mb-1">Your User ID (for sharing)</label><div onClick={copyUserIdToClipboard} className="p-3 bg-slate-700 border border-slate-600 rounded-md cursor-pointer truncate">{userId}</div></div><div className="flex-grow"><label htmlFor="friendUsername" className="text-sm text-slate-400 block mb-1">Add Friend by Username</label><div className="flex gap-2"><input id="friendUsername" type="text" value={friendUsernameInput} onChange={(e) => setFriendUsernameInput(e.target.value)} placeholder="Enter friend's username" className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500"/><button onClick={handleAddFriendByUsername} className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700">Add</button></div></div></div>
              <div className="mt-6">
                  <h4 className="text-lg font-semibold text-white mb-2">Friend List</h4>
                  {draftState.friends && draftState.friends.length > 0 ? (<ul className="space-y-2 max-h-48 overflow-y-auto pr-2">{draftState.friends.map(friendId => (<li key={friendId} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg"><span className="font-semibold text-sm text-slate-300 truncate">{friendProfiles[friendId]?.username || 'Loading...'}</span><div className="flex items-center gap-2"><button onClick={() => setViewingFriendProfile(friendProfiles[friendId])} className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold" disabled={!friendProfiles[friendId]}>View</button><button onClick={() => handleRemoveFriend(friendId)} className="text-red-400 hover:text-red-600 text-sm font-semibold">Remove</button></div></li>))}</ul>) : (<p className="text-slate-500">You haven't added any friends yet.</p>)}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Save/Discard UI */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-10 right-1/2 translate-x-1/2 z-50 bg-slate-800 border-2 border-slate-700 rounded-lg shadow-2xl p-4 flex items-center gap-4 animate-fade-in-up">
            <p className="text-white font-semibold">You have unsaved changes.</p>
            <button onClick={handleDiscardChanges} className="px-5 py-2 bg-slate-600 hover:bg-slate-500 rounded-md transition-colors">
                Discard
            </button>
            <button onClick={handleSaveChanges} className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors">
                Save Changes
            </button>
        </div>
      )}
      {viewingFriendProfile && (
        <FriendProfileModal 
          profile={viewingFriendProfile} 
          onClose={() => setViewingFriendProfile(null)}
          getFullCosmeticDetails={getFullCosmeticDetails}
          getItemStyle={getItemStyle}
          calculateLevelInfo={calculateLevelInfo}
        />
      )}
    </div>
  );
};
const QuestsComponent = ({ quests }) => {
  if (!quests || (!quests.daily?.length && !quests.weekly?.length)) {
    return (
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl">
        <h3 className="text-xl font-semibold text-white mb-3">Quests</h3>
        <p className="text-slate-500">New quests will appear tomorrow!</p>
      </div>
    );
  }

  const QuestItem = ({ quest }) => {
    const progressPercent = Math.min(100, ((quest.progress || 0) / quest.goal) * 100);
    return (
      <div className={`p-3 rounded-lg ${quest.completed ? 'bg-slate-700/50 opacity-60' : 'bg-slate-700'}`}>
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-white">{quest.name}</p>
            <p className="text-xs text-slate-400">{quest.description}</p>
          </div>
          {quest.completed && <span className="text-green-400 text-2xl">✓</span>}
        </div>
        <div className="flex items-center justify-between mt-2 text-xs">
          <p className="text-slate-300">Reward: {quest.reward.xp} XP {quest.reward.shards ? `& ${quest.reward.shards}💎` : ''}</p>
          <p className="font-mono text-slate-400">{(quest.progress || 0)}/{quest.goal}</p>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2 mt-1">
          <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl">
      <h3 className="text-xl font-semibold text-white mb-4">Quests</h3>
      <div className="space-y-4">
        {quests.daily?.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">Daily</h4>
            <div className="space-y-2">
              {quests.daily.map(q => <QuestItem key={q.id} quest={q} />)}
            </div>
          </div>
        )}
        {quests.weekly?.length > 0 && (
          <div>
            <h4 className="text-sm font-bold text-slate-400 uppercase mb-2">Weekly</h4>
            <div className="space-y-2">
              {quests.weekly.map(q => <QuestItem key={q.id} quest={q} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
// Component for Stats + XP Tracker Sheet
  const StatsXPTracker = ({ stats, assignments, completedAssignments, handleRefresh, isRefreshing, getProductivityPersona, calculateLevelInfo, getStartOfWeek, collectFirstEgg, hatchEgg, collectNewEgg, spinProductivitySlotMachine, shouldPromptForTriage, onStartTriage, onAcceptContract }) => {
    const persona = getProductivityPersona();
    const currentLevelBasedTitle = levelTitles.slice().reverse().find(t => stats.currentLevel >= t.level) || { title: 'Novice Learner' };
    const currentTitle = stats?.equippedItems?.title ? cosmeticItems.titles.find(t => t.id === stats.equippedItems.title)?.name : currentLevelBasedTitle.title;

    const completedAssignmentsWithScores = completedAssignments.filter(t =>
      t.pointsEarned !== undefined && t.pointsEarned !== null &&
      t.pointsMax !== undefined && t.pointsMax !== null && t.pointsMax > 0
    );

    const tagAnalytics = {};
    assignmentTags.forEach(tag => {
      tagAnalytics[tag] = {
        totalPointsEarned: 0,
        totalPointsMax: 0,
        totalTimeSpent: 0,
        assignmentCount: 0,
      };
    });

    completedAssignmentsWithScores.forEach(t => {
      const assignmentDate = new Date(t.dateCompleted);
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      if (assignmentDate >= oneYearAgo && t.tags && t.tags.length > 0) {
        t.tags.forEach(tag => {
          if (tagAnalytics[tag]) {
            tagAnalytics[tag].totalPointsEarned += t.pointsEarned;
            tagAnalytics[tag].totalPointsMax += t.pointsMax;
            tagAnalytics[tag].totalTimeSpent += t.timeEstimate || 0;
            tagAnalytics[tag].assignmentCount++;
          }
        });
      }
    });

    const getFormattedAnalytics = (tag) => {
      const data = tagAnalytics[tag];
      const avgTime = data.assignmentCount > 0 ? (data.totalTimeSpent / data.assignmentCount).toFixed(1) : 'N/A';
      return { avgTime };
    };

    const calculateStressRisk = useCallback(() => {
      let totalStressScore = 0;
      const now = new Date();
      const upcomingAssignments = assignments.filter(a =>
        a.status !== 'Completed' && a.dueDate && a.dueDate > now && (a.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 14
      ).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

      const difficultyMap = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
      const timeEstimateWeight = 0.5;
      const proximityWeight = 10;

      upcomingAssignments.forEach(assignment => {
        const difficultyFactor = difficultyMap[assignment.difficulty] || 1;
        const timeFactor = assignment.timeEstimate || 1;
        const daysUntilDue = Math.ceil((assignment.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        let assignmentStress = (difficultyFactor * 5) + (timeFactor * timeEstimateWeight);
        if (daysUntilDue <= 3) assignmentStress += (3 - daysUntilDue + 1) * 10;
        else if (daysUntilDue <= 7) assignmentStress += (7 - daysUntilDue + 1) * 5;
        totalStressScore += assignmentStress;
      });

      for (let i = 0; i < upcomingAssignments.length; i++) {
        for (let j = i + 1; j < upcomingAssignments.length; j++) {
          const diffDays = Math.abs(upcomingAssignments[i].dueDate.getTime() - upcomingAssignments[j].dueDate.getTime()) / (1000 * 60 * 60 * 24);
          if (diffDays <= 2) totalStressScore += proximityWeight;
        }
      }

      const maxPossibleStress = 500;
      return Math.max(0, Math.min(100, (totalStressScore / maxPossibleStress) * 100));
    }, [assignments]);

    const stressRisk = calculateStressRisk();
    const stressEmoji = stressRisk <= 20 ? stressEmojis[0] : stressRisk <= 40 ? stressEmojis[1] : stressRisk <= 60 ? stressEmojis[2] : stressRisk <= 80 ? stressEmojis[3] : stressEmojis[4];

    // Data for XP Gain graph
    const xpGainData = assignments
      .filter(a => a.status === 'Completed' && a.dateCompleted)
      .sort((a, b) => a.dateCompleted.getTime() - b.dateCompleted.getTime())
      .reduce((acc, assignment) => {
        const dateString = assignment.dateCompleted.toLocaleDateString();
        const existing = acc.find(item => item.date === dateString);
        const points = assignment.pointsEarned || 0;
        if (existing) existing.xp += points;
        else acc.push({ date: dateString, xp: points });
        return acc;
      }, []);

    let cumulativeXP = 0;
    const cumulativeXPGainData = xpGainData.map(data => {
      cumulativeXP += data.xp;
      return { date: data.date, cumulativeXP: cumulativeXP };
    });

    // Data for Predicted Hours graph
    const predictedHoursData = assignments
      .filter(a => a.status !== 'Completed')
      .reduce((acc, assignment) => {
        const classCategory = assignment.class || 'Uncategorized';
        acc[classCategory] = (acc[classCategory] || 0) + (assignment.timeEstimate || 0);
        return acc;
      }, {});
    const predictedHoursGraphData = Object.keys(predictedHoursData).map(key => ({
      class: key,
      hours: predictedHoursData[key],
    }));
      
    // Data for Hours Spent graph
    const hoursSpentWorkingData = {};
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
    assignments
      .filter(a => a.status === 'Completed' && a.dateCompleted && a.dateCompleted >= oneMonthAgo)
      .forEach(assignment => {
        const weekStart = getStartOfWeek(assignment.dateCompleted);
        const weekKey = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        hoursSpentWorkingData[weekKey] = (hoursSpentWorkingData[weekKey] || 0) + (assignment.timeEstimate || 0);
      });
    const hoursSpentWorkingGraphData = Object.keys(hoursSpentWorkingData)
      .map(weekKey => ({ week: weekKey, hours: hoursSpentWorkingData[weekKey], sortDate: new Date(weekKey) }))
      .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());

    return (
      <div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">Dashboard</h2>
            <p className="text-slate-400">Your productivity at a glance.</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed disabled:text-slate-500 transition-colors flex items-center space-x-2"
          >
            <svg className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 10.5M20 20l-1.5-1.5A9 9 0 013.5 13.5" />
            </svg>
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
                {shouldPromptForTriage && (
          <div className="mb-8 p-6 bg-indigo-900/50 border-2 border-indigo-700 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white">✨ It's Time for Your Weekly Triage!</h3>
              <p className="text-indigo-300">Plan your week in 5 minutes to earn the powerful 'Clarity' buff.</p>
            </div>
            <button onClick={onStartTriage} className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-500 transition-colors shadow-lg flex-shrink-0">
              Start Planning
            </button>
          </div>
        )}

        {stats.contract && (
          <div className={`mb-8 p-6 border-2 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 ${stats.contract.status === 'offered' ? 'bg-slate-800/80 border-yellow-600/80' : 'bg-slate-800/50 border-slate-700'}`}>
            <div>
              <h3 className="text-2xl font-bold text-white">
                {stats.contract.status === 'offered' ? '📜 New Contract Available!' : 'Active Contract'}
              </h3>
              <p className="text-yellow-300 font-semibold">{stats.contract.name}</p>
              <p className="text-slate-400">{stats.contract.description}</p>
            </div>
            {stats.contract.status === 'offered' ? (
              <button onClick={onAcceptContract} className="px-6 py-3 bg-yellow-600 text-black font-bold rounded-lg hover:bg-yellow-500 transition-colors shadow-lg flex-shrink-0">
                Accept (Cost: {stats.contract.deposit} XP)
              </button>
            ) : (
              <div className="text-center">
                <p className="text-slate-300 font-semibold">Contract is active.</p>
                <p className="text-xs text-slate-500">Time Limit: {stats.contract.timeLimitHours} hours</p>
              </div>
            )}
          </div>
        )}

        {/* Top Stat Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl transition-transform duration-200 hover:-translate-y-1">
            <p className="text-slate-400">Total XP</p>
            <p className="text-4xl font-bold text-white mt-2">{stats.totalXP}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl transition-transform duration-200 hover:-translate-y-1">
            <div className="flex justify-between items-baseline">
                <p className="text-slate-400">Current Level</p>
                <p className="text-sm text-slate-400">
                    {calculateLevelInfo(stats.totalXP).xpProgressInLevel.toLocaleString()} / {calculateLevelInfo(stats.totalXP).xpNeededForLevelUp.toLocaleString()} XP
                </p>
            </div>
            <p className="text-4xl font-bold text-white mt-1">{stats.currentLevel}</p>
            <div className="w-full bg-slate-700 rounded-full h-2.5 mt-4">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: `${(calculateLevelInfo(stats.totalXP).xpProgressInLevel / calculateLevelInfo(stats.totalXP).xpNeededForLevelUp) * 100}%` }}></div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl transition-transform duration-200 hover:-translate-y-1">
            <p className="text-slate-400">Title</p>
            <p className="text-2xl font-bold text-accent mt-2">{currentTitle}</p>
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (Graphs & Table) */}
            <div className="lg:col-span-2">
              <div className="flex flex-col gap-6">
                  {/* XP Gain Graph */}
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl">
                      <h3 className="text-xl font-semibold text-white mb-4">XP Gain Over Time</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={cumulativeXPGainData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                          <XAxis dataKey="date" tick={{ fill: '#94a3b8' }} />
                          <YAxis tick={{ fill: '#94a3b8' }}/>
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}/>
                          <Legend wrapperStyle={{ color: '#94a3b8' }} />
                          <Line type="monotone" dataKey="cumulativeXP" stroke="#818cf8" strokeWidth={2} activeDot={{ r: 8 }} name="Cumulative XP" />
                        </LineChart>
                      </ResponsiveContainer>
                  </div>
                  {/* Two bottom graphs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl">
                          <h3 className="text-xl font-semibold text-white mb-4">Predicted Workload</h3>
                          <ResponsiveContainer width="100%" height={250}>
                              <LineChart data={predictedHoursGraphData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                                  <XAxis dataKey="class" tick={{ fill: '#94a3b8' }}/>
                                  <YAxis tick={{ fill: '#94a3b8' }}/>
                                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}/>
                                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                                  <Line type="monotone" dataKey="hours" stroke="#34d399" activeDot={{ r: 8 }} name="Predicted Hours" />
                              </LineChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl">
                          <h3 className="text-xl font-semibold text-white mb-4">Hours Worked (Weekly)</h3>
                          <ResponsiveContainer width="100%" height={250}>
                              <LineChart data={hoursSpentWorkingGraphData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="#475569"/>
                                  <XAxis dataKey="week" tick={{ fill: '#94a3b8' }}/>
                                  <YAxis tick={{ fill: '#94a3b8' }}/>
                                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }}/>
                                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                                  <Line type="monotone" dataKey="hours" stroke="#facc15" activeDot={{ r: 8 }} name="Hours Worked" />
                              </LineChart>
                          </ResponsiveContainer>
                      </div>
                  </div>
              </div>
              
              {/* Analytics Table with corrected margin */}
              <div className="mt-8 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
                  <h3 className="text-xl font-bold text-white p-6">Analytics by Tag (Last Year)</h3>
                  <div className="overflow-x-auto">
                      <table className="min-w-full text-white">
                      <thead>
                          <tr className="text-slate-400 uppercase text-sm leading-normal border-b-2 border-slate-700">
                          <th className="py-3 px-6 text-left">Tag</th>
                          <th className="py-3 px-6 text-center">Assignments</th>
                          <th className="py-3 px-6 text-center">Avg Time (hrs)</th>
                          </tr>
                      </thead>
                      <tbody className="text-slate-300 text-sm font-light">
                          {assignmentTags.map(tag => {
                          const analytics = getFormattedAnalytics(tag);
                          const data = tagAnalytics[tag];
                          return (
                              <tr key={tag} className="border-b border-slate-700 hover:bg-slate-800/70">
                              <td className="py-4 px-6 text-left font-medium">{tag}</td>
                              <td className="py-4 px-6 text-center">{data.assignmentCount}</td>
                              <td className="py-4 px-6 text-center">{analytics.avgTime}</td>
                              </tr>
                          );
                          })}
                      </tbody>
                      </table>
                  </div>
              </div>
            </div>

                        {/* Right Column (Widgets) */}
            <div className="flex flex-col gap-6">
                <QuestsComponent quests={stats.quests} />
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl">
                  <h3 className="text-xl font-semibold text-white mb-3 flex items-center space-x-2">
                    <span>🔥</span>
                    <span>Explorer's Streak</span>
                  </h3>
                  <div className="flex items-center justify-between">
                    <p className="text-4xl font-bold text-orange-400">{stats.focusNavigator?.explorerStreak || 0} Days</p>
                    <p className="text-slate-400 text-sm font-semibold">
                      Today: {(stats.focusNavigator?.dailyFocusMinutes || 0)} / 45 min
                    </p>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2.5 mt-3">
                    <div 
                      className="bg-orange-500 h-2.5 rounded-full" 
                      style={{ width: `${Math.min(100, ((stats.focusNavigator?.dailyFocusMinutes || 0) / 45) * 100)}%` }}>
                    </div>
                  </div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl">
                    <h3 className="text-xl font-semibold text-white mb-3">Your Work Style</h3>
                    <div className="flex items-center space-x-4">
                        <span className="text-5xl">{persona.icon}</span>
                        <div>
                            <p className="text-lg font-bold text-white">{persona.name}</p>
                            <p className="text-sm text-slate-400">{persona.description}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl">
                    <h3 className="text-xl font-semibold text-white mb-3">Productivity Pet</h3>
                      {stats.petStatus === 'none' ? (
                        <button onClick={collectFirstEgg} className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 w-full">Get First Egg</button>
                      ) : stats.petStatus === 'egg' ? (
                        <>
                          <div className="text-center text-5xl mb-2">🥚</div>
                          <p className="text-slate-400 mb-2 text-center">
                            {stats.assignmentsToHatch > 0 ? `${stats.assignmentsToHatch} more to hatch!` : "Ready to hatch!"}
                          </p>
                          <div className="w-full bg-slate-700 rounded-full h-4 mb-2">
                            <div className="bg-purple-500 h-4 rounded-full" style={{ width: `${((EGG_REQUIREMENT - stats.assignmentsToHatch) / EGG_REQUIREMENT) * 100}%` }}/>
                          </div>
                          {stats.assignmentsToHatch <= 0 && <button onClick={hatchEgg} className="mt-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 w-full">Hatch Now!</button>}
                        </>
                      ) : (
                        <>
                          <div className="flex items-center space-x-4 mb-2">
                            <span className="text-6xl">{stats.currentPet?.display}</span>
                            <div>
                              <p className="text-lg font-semibold text-white">{stats.currentPet?.name}</p>
                              <p className="text-sm text-green-400">+{(stats.currentPet?.xpBuff * 100).toFixed(0)}% XP</p>
                            </div>
                          </div>
                          <button onClick={collectNewEgg} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 w-full">Find New Egg</button>
                        </>
                      )}
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl">
                    <h3 className="text-xl font-semibold text-white mb-3 flex items-center space-x-2">
                        <span>Stress Risk</span>
                        <span className="text-2xl">{stressEmoji}</span>
                    </h3>
                    <p className="text-3xl font-bold text-red-400">{stressRisk.toFixed(0)}%</p>
                    <div className="w-full bg-slate-700 rounded-full h-2.5 mt-2">
                        <div className={`h-2.5 rounded-full ${stressRisk <= 33 ? 'bg-green-500' : stressRisk <= 66 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${stressRisk}%` }}></div>
                    </div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl">
                    <h3 className="text-xl font-semibold text-white mb-3">Slot Machine</h3>
                    <p className="text-slate-400 mb-4 text-sm">Spin for 50 XP for a chance to win cosmetics or more XP!</p>
                    <button onClick={spinProductivitySlotMachine} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg w-full transition-colors hover:bg-indigo-700">Spin Now</button>
                </div>
            </div>
        </div>
      </div>
    );
  };

  // Component for Badge System Sheet (No longer a top-level tab, but keeping for reference of badge definitions)
  const BadgeSystem = () => {
    const badges = [
      { name: 'Early Bird', xp: '+10 XP', description: 'Complete 3 assignments early in a week.' },
      { name: 'Perfect Week', xp: '+15 XP', description: 'Complete all assignments on time for 7 days.' },
      { name: 'Late Slayer', xp: '+5 XP', description: 'Successfully clear a late task.' },
      { name: 'Time Lord', xp: '+7 XP', description: 'Submit an assignment 48+ hours early.' },
      { name: 'High Achiever', xp: '+8 XP', description: 'Achieve 90% or higher on an assignment.' },
      { name: 'Difficulty Conqueror', xp: '+12 XP', description: 'Complete a "Hard" difficulty assignment.' },
      { name: 'Productivity Spree', xp: '+10 XP', description: 'Complete 3 assignments within 24 hours.' },
      { name: 'Point Accumulator', xp: '+15 XP', description: 'Earn 50 points from completed assignments (cumulative).' },
      { name: 'Lucky Streak', xp: 'Varies (Slot Machine)', description: 'Win a reward from the slot machine.' },
      { name: 'Streak Starter', xp: '+5 XP', description: 'Complete assignments for 3 consecutive days.' },
      { name: 'Consistent Contributor', xp: '+10 XP', description: 'Complete assignments for 7 consecutive days.' },
      { name: 'Master Organizer', xp: '+15 XP', description: 'Utilize subtasks for all assignments in a week.' },
      { name: 'Problem Solver', xp: '+10 XP', description: 'Complete an assignment with 5+ subtasks.' },
      { name: 'Efficiency Expert', xp: '+12 XP', description: 'Complete an assignment with a time estimate of 5+ hours in less than half the estimated time.' },
      { name: 'Knowledge King/Queen', xp: '+20 XP', description: 'Complete 5 assignments across different tags.' },
      { name: 'Deadline Dominator', xp: '+18 XP', description: 'Complete 3 "Hard" assignments within a single week.' },
    ];

    return (
      <div className="p-6 bg-white rounded-lg shadow-xl flex flex-col h-full">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">All Badges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
          {badges.map((badge, index) => (
            <div key={index} className="bg-purple-50 p-6 rounded-lg shadow-md border-l-4 border-purple-400">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">{badge.name}</h3>
              <p className="text-lg font-bold text-purple-700">{badge.xp}</p>
              <p className="text-sm text-gray-600 mt-2">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

 // Component for Calendar View Sheet
  const CalendarView = ({ assignments }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendarDays = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const numDays = daysInMonth(year, month);
      const firstDay = firstDayOfMonth(year, month);
      const startingDay = firstDay === 0 ? 6 : firstDay - 1;

      const calendarDays = [];
      for (let i = 0; i < startingDay; i++) {
        calendarDays.push(<div key={`empty-prev-${i}`} className="border-t border-l border-slate-700 bg-slate-800/50"></div>);
      }

      for (let day = 1; day <= numDays; day++) {
        const date = new Date(year, month, day);
        const assignmentsOnDay = assignments.filter(a =>
          a.status !== 'Completed' && // This will remove completed tasks from the calendar
          a.dueDate &&
          a.dueDate.getFullYear() === year &&
          a.dueDate.getMonth() === month &&
          a.dueDate.getDate() === day
        );

        calendarDays.push(
          <div key={`day-${day}`} className="p-2 border-t border-l border-slate-700 h-32 flex flex-col overflow-hidden bg-slate-800/30 hover:bg-slate-800/60 transition-colors">
            <span className="font-bold text-slate-300">{day}</span>
            <div className="flex-grow overflow-y-auto mt-1 space-y-1 pr-1">
              {assignmentsOnDay.map(a => (
                <div key={a.id} className={`text-xs p-1.5 rounded-md truncate
                  ${a.status === 'Completed' ? 'bg-green-500/30 text-green-300' :
                    a.dueDate && new Date() > a.dueDate && a.status !== 'Completed' ? 'bg-red-500/30 text-red-300' :
                    'bg-indigo-500/30 text-indigo-300'
                  }`}>
                  {a.assignment}
                </div>
              ))}
            </div>
          </div>
        );
      }

      return calendarDays;
    };

    const goToPreviousMonth = () => {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">Calendar View</h2>
            <p className="text-slate-400">View your assignment deadlines on a monthly calendar.</p>
          </div>
          <div className="flex items-center space-x-4">
             <h3 className="text-xl font-semibold text-white">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={goToPreviousMonth} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={goToNextMonth} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-7 text-center font-semibold text-slate-400">
                {daysOfWeek.map(day => <div key={day} className="py-3 border-b border-l border-slate-700">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 grid-rows-5">
                {renderCalendarDays()}
            </div>
        </div>
      </div>
    );
  };

// NEW FEATURE: Study Zone (Platformer + Flashcards) with SRS
const StudyZone = ({ stats, updateStatsInFirestore, showMessageBox, processAchievement, isMobile }) => {
    const [activeTab, setActiveTab] = useState('game');
    const [isStudying, setIsStudying] = useState(false);
    const studyZoneState = stats?.studyZone || { flashcardsText: '', platformerHighScore: 0, flashcardData: {} };
    
    const updateStudyZoneState = useCallback((newState) => {
        updateStatsInFirestore({ studyZone: { ...studyZoneState, ...newState } });
    }, [studyZoneState, updateStatsInFirestore]);

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
          <p className="text-slate-400">Play a game and review your flashcards to boost your learning.</p>
        </div>
      </div>
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl">
        <div className="relative z-10 flex border-b border-slate-700">
          <StudyZoneTabButton tabName="game">Platformer Game</StudyZoneTabButton>
          <StudyZoneTabButton tabName="flashcards">Flashcard Deck</StudyZoneTabButton>
        </div>
        <div className="p-6">
          {activeTab === 'game' && <PlatformerGame stats={stats} updateStatsInFirestore={updateStatsInFirestore} studyZoneState={studyZoneState} updateStudyZoneState={updateStudyZoneState} showMessageBox={showMessageBox} processAchievement={processAchievement} isMobile={isMobile} />}
          {activeTab === 'flashcards' && (
            isStudying ? 
            <FlashcardSession studyZoneState={studyZoneState} updateStudyZoneState={updateStudyZoneState} onSessionEnd={() => setIsStudying(false)} /> :
            <FlashcardManager studyZoneState={studyZoneState} updateStudyZoneState={updateStudyZoneState} onStartStudy={() => setIsStudying(true)} />
          )}
        </div>
      </div>
    </div>
  );
};


// --- Sub-components for Study Zone ---

const FlashcardManager = ({ studyZoneState, updateStudyZoneState, onStartStudy }) => {
  const [text, setText] = useState(studyZoneState.flashcardsText || '');
  const [cardsToReview, setCardsToReview] = useState(0);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const parseFlashcards = useCallback((rawText) => {
    const lines = (rawText || '').split('\n').filter(line => line.trim() !== '');
    const separators = ['→', '>>', '-'];
    return lines.map(line => {
      for (const sep of separators) {
        if (line.includes(sep)) {
          const parts = line.split(sep);
          const front = parts[0].trim();
          const back = parts.slice(1).join(sep).trim();
          if (front && back) return { front, back };
        }
      }
      return null;
    }).filter(Boolean);
  }, []);

  const calculateReviewableCards = useCallback(() => {
      const today = new Date().setHours(0, 0, 0, 0);
      const reviewable = Object.values(studyZoneState.flashcardData || {}).filter(card => 
          new Date(card.nextReviewDate).getTime() <= today
      ).length;
      setCardsToReview(reviewable);
  }, [studyZoneState.flashcardData]);

  // Effect to update the review count when data changes
  useEffect(() => {
    calculateReviewableCards();
  }, [calculateReviewableCards]);
  
  // Effect to track unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(text !== studyZoneState.flashcardsText);
  }, [text, studyZoneState.flashcardsText]);

  // Update local text when the source of truth from Firebase changes
  useEffect(() => {
    setText(studyZoneState.flashcardsText || '');
  }, [studyZoneState.flashcardsText]);


  const handleSave = async () => {
    const parsedCards = parseFlashcards(text);
    const oldData = studyZoneState.flashcardData || {};
    const newData = {};
    const today = new Date().setHours(0, 0, 0, 0);
    const frontsFromText = new Set(parsedCards.map(c => c.front));

    // 1. Carry over or update existing cards that are still in the text
    parsedCards.forEach(card => {
      const existing = oldData[card.front];
      newData[card.front] = existing 
        ? { ...existing, back: card.back } // Update back, keep SRS data
        : { back: card.back, repetition: 0, easinessFactor: 2.5, interval: 0, nextReviewDate: today }; // New card
    });
    
    // 2. Carry over old cards that were removed from the text (so SRS data isn't lost)
    Object.keys(oldData).forEach(front => {
        if (!frontsFromText.has(front)) {
            newData[front] = oldData[front];
        }
    });

    await updateStudyZoneState({ flashcardData: newData, flashcardsText: text });
    showMessageBox("Flashcards saved!", "info");
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div>
          <h3 className="text-2xl font-semibold text-white">Manage Your Flashcards</h3>
          <p className="text-slate-400">Enter cards as "Front → Back". Click Save to sync.</p>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={handleSave} 
            disabled={!hasUnsavedChanges}
            className="bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
          >
            {hasUnsavedChanges ? "Save Changes" : "Saved"}
          </button>
          <button 
            onClick={onStartStudy} 
            disabled={cardsToReview === 0 || hasUnsavedChanges}
            className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors"
            title={hasUnsavedChanges ? "Save changes before studying" : ""}
          >
            Study ({cardsToReview} Due)
          </button>
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full h-96 p-4 bg-slate-900 border border-slate-600 rounded-lg text-slate-300 font-mono focus:ring-2 focus:ring-indigo-500"
        placeholder={"Example:\nCapital of France → Paris\n2 + 2 - 4"}
      />
    </div>
  );
};

const FlashcardSession = ({ studyZoneState, updateStudyZoneState, onSessionEnd }) => {
    const [studyQueue, setStudyQueue] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        const today = new Date().setHours(0, 0, 0, 0);
        const allCards = Object.entries(studyZoneState.flashcardData || {});
        const reviewable = allCards
            .filter(([front, data]) => new Date(data.nextReviewDate).getTime() <= today)
            .map(([front, data]) => ({ front, ...data }));

        // Shuffle the queue
        for (let i = reviewable.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [reviewable[i], reviewable[j]] = [reviewable[j], reviewable[i]];
        }
        setStudyQueue(reviewable);
    }, [studyZoneState.flashcardData]);

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
        
        const { front, back, ...srsData } = updatedSRSData;
        const newFlashcardData = { ...studyZoneState.flashcardData, [cardToUpdate.front]: srsData };
        
        updateStudyZoneState({ flashcardData: newFlashcardData });

        if (currentIndex + 1 >= studyQueue.length) {
            onSessionEnd();
        } else {
            setCurrentIndex(i => i + 1);
            setIsFlipped(false);
        }
    };

    if (studyQueue.length === 0) {
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
const PlatformerGame = ({ stats, studyZoneState, updateStudyZoneState, updateStatsInFirestore, showMessageBox, processAchievement, isMobile }) => {
  // --- Core Game Constants ---
  const GAME_WIDTH = 800;
  const GAME_HEIGHT = 400;
  const GRAVITY = 0.6;
  const JUMP_FORCE = -12;
  const DOUBLE_JUMP_FORCE = -10;
  const PLAYER_SPEED = 5;
  const PLAYER_WIDTH = 28;
  const PLAYER_HEIGHT = 38;
  const TILE_SIZE = 40;
  const ENEMY_SPEED = 1;
  const JUMP_PAD_BOOST = -20;
  const TURRET_FIRE_RATE = 180; // Every 3 seconds

  // --- State Management ---
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [isXpMode, setIsXpMode] = useState(false);
  const [uiGameState, setUiGameState] = useState('menu');
  const [tick, setTick] = useState(0);
  
  // --- Refs for Game Loop ---
  const gameStateRef = useRef('menu');
  const lastTimeRef = useRef(0);
  const levelRef = useRef({ platforms: [], enemies: [], coins: [], flagpole: null, projectiles: [] });
  const keysRef = useRef({});
  const cameraXRef = useRef(0);
  const playerState = useRef({
    x: 100, y: GAME_HEIGHT - TILE_SIZE - PLAYER_HEIGHT,
    vx: 0, vy: 0, onGround: false, canDoubleJump: true,
    coyoteTime: 0, jumpBuffer: 0, scaleY: 1, invincible: 0,
  });

  const setGameState = (newState) => {
    gameStateRef.current = newState;
    setUiGameState(newState);
  };

  const parsedFlashcards = useMemo(() => {
    const lines = (studyZoneState.flashcardsText || '').split('\n').filter(line => line.trim() !== '');
    const separators = ['→', '>>', '-'];
    return lines.map(line => {
      for (const sep of separators) {
        if (line.includes(sep)) {
          const parts = line.split(sep);
          return { front: parts[0].trim(), back: parts.slice(1).join(sep).trim() };
        }
      }
      return null;
    }).filter(Boolean);
  }, [studyZoneState.flashcardsText]);

const GameRenderer = React.memo(({ playerState, levelRef, cameraXRef, TILE_SIZE, PLAYER_WIDTH, PLAYER_HEIGHT }) => {
  cameraXRef.current = Math.max(0, playerState.current.x - GAME_WIDTH / 3);
  
  return (
    <>
      {/* Level Geometry */}
      {levelRef.current.platforms.map((p, i) => {
        let content;
        switch(p.type) {
          case 'crumble': content = <div className="w-full h-full bg-yellow-800 border-t-4 border-yellow-600 opacity-80" />; break;
          case 'jumpPad': content = <div className="w-full h-full bg-emerald-500 border-t-4 border-emerald-300" />; break;
          case 'spike': content = <div className="w-full h-full text-slate-500"><svg viewBox="0 0 40 40"><path d="M0 40 L20 0 L40 40 Z" fill="currentColor"/></svg></div>; break;
          default: content = <div className="w-full h-full bg-green-800 border-t-4 border-green-500" />;
        }
        return <div key={`p_${i}`} className="absolute" style={{ width: p.width, height: p.height, transform: `translate(${p.x - cameraXRef.current}px, ${p.y}px)` }}>{content}</div>
      })}
      
      {/* Enemies & Projectiles */}
      {levelRef.current.enemies.map((e) => {
        let enemySprite;
        switch(e.type) {
          case 'spiky': enemySprite = <svg viewBox="0 0 40 40"><circle cx="20" cy="25" r="15" fill="#f97316"/><path d="M5 25 L20 10 L35 25 Z" fill="#fdba74"/></svg>; break;
          case 'turret': enemySprite = <svg viewBox="0 0 40 40"><rect x="5" y="15" width="30" height="20" rx="5" fill="#475569"/><circle cx="20" cy="15" r="10" fill="#ef4444"/></svg>; break;
          default: enemySprite = <svg viewBox="0 0 40 40"><rect x="5" y="5" width="30" height="30" rx="5" fill="#7e22ce"/><rect x="12" y="15" width="5" height="10" fill="white"/><rect x="23" y="15" width="5" height="10" fill="white"/></svg>;
        }
        return <div key={e.id} className="absolute" style={{ width: TILE_SIZE, height: TILE_SIZE, transform: `translate(${e.x - cameraXRef.current}px, ${e.y}px)`}}>{enemySprite}</div>
      })}
      {levelRef.current.projectiles.map(p => <div key={p.id} className="absolute bg-red-500 rounded-full" style={{ width: 10, height: 10, transform: `translate(${p.x - cameraXRef.current}px, ${p.y}px)` }} />)}

      {/* Collectibles */}
      {levelRef.current.coins.map((c) => <div key={c.id} className="absolute animate-pulse" style={{ width: TILE_SIZE/2, height: TILE_SIZE/2, transform: `translate(${c.x - cameraXRef.current}px, ${c.y}px)`}}><svg viewBox="0 0 20 20"><circle cx="10" cy="10" r="10" fill="#facc15"/><circle cx="10" cy="10" r="7" fill="#fde047"/><text x="50%" y="50%" dy=".3em" textAnchor="middle" fill="#ca8a04" fontSize="12" fontWeight="bold">$</text></svg></div>)}
      
      {/* Goal */}
      {levelRef.current.flagpole && <div className="absolute bg-gray-500" style={{ width: levelRef.current.flagpole.width, height: levelRef.current.flagpole.height, transform: `translate(${levelRef.current.flagpole.x - cameraXRef.current}px, ${levelRef.current.flagpole.y}px)` }}/>}
      
      {/* Player */}
      <div className={`absolute transition-opacity duration-200 ${playerState.current.invincible > 0 && Math.floor(playerState.current.invincible / 5) % 2 === 0 ? 'opacity-50' : 'opacity-100'}`} style={{ width: PLAYER_WIDTH, height: PLAYER_HEIGHT, transform: `translate(${playerState.current.x - cameraXRef.current}px, ${playerState.current.y}px) scaleY(${playerState.current.scaleY})`, transition: 'transform 0.1s' }}>
         <svg viewBox="0 0 28 38" className="w-full h-full">
           <rect x="4" y="0" width="20" height="20" rx="10" fill="#fde047"/>
           <rect x="0" y="18" width="28" height="20" rx="5" fill="#be123c"/>
           <circle cx="10" cy="10" r="3" fill="white"/><circle cx="19" cy="10" r="3" fill="white"/>
           <circle cx="10" cy="10" r="1" fill="black"/><circle cx="19" cy="10" r="1" fill="black"/>
         </svg>
      </div>
    </>
  );
});

  const handleButtonPress = (key, isDown) => { keysRef.current[key] = isDown; };

  const generateLevel = useCallback((currentLevel) => {
    const levelData = { platforms: [], enemies: [], coins: [], flagpole: null, projectiles: [] };
    const levelLength = 150 + currentLevel * 10;
    let currentX = 0;
    let lastPlatformY = GAME_HEIGHT - TILE_SIZE;

    for (let i = 0; i < 10; i++) levelData.platforms.push({ x: i * TILE_SIZE, y: GAME_HEIGHT - TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'normal' });
    currentX = 10;

    while (currentX < levelLength - 15) {
      const choice = Math.random();
      if (choice < 0.7) { // Standard platform
        const gap = Math.floor(Math.random() * 3) + 1;
        currentX += gap;
        if (gap > 1) levelData.platforms.push({x: (currentX-1)*TILE_SIZE, y: GAME_HEIGHT-TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'spike'});

        const width = Math.floor(Math.random() * 5) + 3;
        const heightChange = (Math.floor(Math.random() * 5) - 2) * TILE_SIZE;
        lastPlatformY = Math.max(GAME_HEIGHT - TILE_SIZE * 5, Math.min(GAME_HEIGHT - TILE_SIZE, lastPlatformY + heightChange));

        for (let i = 0; i < width; i++) {
          const platX = (currentX + i) * TILE_SIZE;
          const type = Math.random() < 0.15 ? 'crumble' : 'normal';
          levelData.platforms.push({ x: platX, y: lastPlatformY, width: TILE_SIZE, height: TILE_SIZE, type });
          if (i > 0 && i < width - 1 && Math.random() < 0.5) {
            levelData.coins.push({ id: `c_${currentX+i}`, x: platX + (TILE_SIZE/4), y: lastPlatformY - TILE_SIZE*2 });
          }
        }

        if (width > 3) {
          const enemyTypeRoll = Math.random();
          if (enemyTypeRoll < 0.3) levelData.enemies.push({ id: `e_${currentX}`, x: (currentX + 1) * TILE_SIZE, y: lastPlatformY - TILE_SIZE, dir: -1, type: 'patrol', startX: (currentX+1)*TILE_SIZE, patrol: (width-2)*TILE_SIZE });
          else if (enemyTypeRoll < 0.5) levelData.enemies.push({ id: `e_${currentX}`, x: (currentX + 1) * TILE_SIZE, y: lastPlatformY - TILE_SIZE, dir: -1, type: 'spiky', startX: (currentX+1)*TILE_SIZE, patrol: (width-2)*TILE_SIZE });
          else if (enemyTypeRoll < 0.6) levelData.enemies.push({ id: `e_${currentX}`, x: (currentX + 1) * TILE_SIZE, y: lastPlatformY - TILE_SIZE, type: 'turret', fireCooldown: TURRET_FIRE_RATE });
        }
        currentX += width;
      } else { // Jump Pad challenge
        const gap = 5;
        currentX += gap;
        levelData.platforms.push({ x: (currentX - gap) * TILE_SIZE, y: GAME_HEIGHT - TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'jumpPad'});
        const width = 3;
        lastPlatformY = Math.max(GAME_HEIGHT - TILE_SIZE * 6, lastPlatformY - TILE_SIZE*3);
        for (let i = 0; i < width; i++) {
            levelData.platforms.push({ x: (currentX + i) * TILE_SIZE, y: lastPlatformY, width: TILE_SIZE, height: TILE_SIZE, type: 'normal' });
            levelData.coins.push({ id: `c_${currentX+i}`, x: (currentX + i) * TILE_SIZE + (TILE_SIZE/4), y: lastPlatformY - TILE_SIZE });
        }
        currentX += width;
      }
    }
    
    for (let i = 0; i < 15; i++) levelData.platforms.push({ x: (currentX + i) * TILE_SIZE, y: GAME_HEIGHT - TILE_SIZE, width: TILE_SIZE, height: TILE_SIZE, type: 'normal' });
    levelData.flagpole = { x: (currentX + 5) * TILE_SIZE, y: GAME_HEIGHT - TILE_SIZE * 5, width: 20, height: TILE_SIZE * 4 };
    
    levelRef.current = levelData;
  }, []);
  
  const resetPlayerState = useCallback((currentScore) => {
    playerState.current = {
      x: 100, y: GAME_HEIGHT - TILE_SIZE - PLAYER_HEIGHT,
      vx: 0, vy: 0, onGround: false, canDoubleJump: true,
      coyoteTime: 0, jumpBuffer: 0, scaleY: 1, invincible: 0,
    };
    cameraXRef.current = 0;
    setScore(currentScore);
  }, []);
  
  const commonStartLogic = useCallback((keepScore = false) => {
    const currentScore = keepScore ? score : 0;
    setLevel(1);
    resetPlayerState(currentScore);
    generateLevel(1);
    setGameState('playing');
  }, [score, resetPlayerState, generateLevel]);

  const nextLevel = useCallback(() => {
    setLevel(l => l + 1);
    resetPlayerState(score);
    generateLevel(level + 1);
    setGameState('playing');
  }, [level, score, generateLevel, resetPlayerState]);

  const startGameWithFlashcards = useCallback(() => { setIsXpMode(false); commonStartLogic(); }, [commonStartLogic]);
  const startXpLevel = useCallback(() => {
    if (stats?.totalXP < 100) { showMessageBox("You need 100 XP to play a single level.", "error"); return; }
    updateStatsInFirestore({ totalXP: stats.totalXP - 100 });
    setIsXpMode(true);
    commonStartLogic();
  }, [stats?.totalXP, commonStartLogic, updateStatsInFirestore]);

  useEffect(() => {
    // If the game is not in the 'playing' state, ensure the timer ref is reset and do nothing.
    if (uiGameState !== 'playing') {
      lastTimeRef.current = 0;
      return;
    }

    let animationFrameId;

    const gameLoop = (timestamp) => {
      // Initialize lastTime on the first frame to prevent a huge initial deltaTime
      if (lastTimeRef.current === 0) {
        lastTimeRef.current = timestamp;
      }

      let deltaTime = (timestamp - lastTimeRef.current) / (1000 / 60);
      lastTimeRef.current = timestamp;

      // Clamp deltaTime to a max value to prevent physics bugs if the tab is inactive for a long time
      const clampedDeltaTime = Math.min(deltaTime, 3);

      if (gameStateRef.current === 'playing') {
        const p = playerState.current;
        p.onGround = false;
        if (p.invincible > 0) p.invincible -= clampedDeltaTime;

        // --- Input & Movement ---
        let targetVx = 0;
        if (keysRef.current['ArrowLeft'] || keysRef.current['a']) targetVx = -PLAYER_SPEED;
        if (keysRef.current['ArrowRight'] || keysRef.current['d']) targetVx = PLAYER_SPEED;
        p.x += targetVx * clampedDeltaTime;
        
        p.jumpBuffer = (keysRef.current['ArrowUp'] || keysRef.current['w'] || keysRef.current[' ']) ? 10 : p.jumpBuffer - 1;
        p.coyoteTime = p.coyoteTime - 1;
        
        if (p.jumpBuffer > 0) {
          if (p.coyoteTime > 0) {
            p.vy = JUMP_FORCE; p.jumpBuffer = 0; p.coyoteTime = 0; p.scaleY = 1.3;
          } else if (p.canDoubleJump) {
            p.vy = DOUBLE_JUMP_FORCE; p.canDoubleJump = false; p.jumpBuffer = 0; p.scaleY = 1.3;
          }
        }
        
        p.vy += GRAVITY * clampedDeltaTime;
        p.y += p.vy * clampedDeltaTime;
        p.scaleY += (1 - p.scaleY) * 0.1;

        // --- Collision Detection & Resolution ---
        const playerRect = { x: p.x, y: p.y, width: PLAYER_WIDTH, height: PLAYER_HEIGHT };
        levelRef.current.platforms.forEach(platform => {
          if (playerRect.x < platform.x + platform.width && playerRect.x + playerRect.width > platform.x &&
              playerRect.y < platform.y + platform.height && playerRect.y + playerRect.height > platform.y) {
            if (platform.type === 'spike' && p.invincible <= 0) { setGameState('gameover'); return; }
            if (platform.type === 'jumpPad') { p.vy = JUMP_PAD_BOOST; p.canDoubleJump = true; return; }

            if (p.vy >= 0 && playerRect.y + playerRect.height - platform.y < p.vy * clampedDeltaTime + 5) {
              p.y = platform.y - playerRect.height;
              p.vy = 0;
              p.onGround = true;
              p.coyoteTime = 8;
              p.canDoubleJump = true;
              p.scaleY = 0.8;
              if (platform.type === 'crumble' && !platform.crumbling) platform.crumbling = 30;
            }
          }
        });

        levelRef.current.platforms = levelRef.current.platforms.filter(platform => {
          if (platform.crumbling > 0) platform.crumbling -= clampedDeltaTime;
          return platform.crumbling === undefined || platform.crumbling > 0;
        });

        // --- Enemy & Coin Logic ---
        levelRef.current.enemies.forEach(enemy => {
          if (enemy.type === 'patrol' || enemy.type === 'spiky') {
            enemy.x += enemy.dir * ENEMY_SPEED * clampedDeltaTime;
            if (enemy.x < enemy.startX || enemy.x > enemy.startX + enemy.patrol) enemy.dir *= -1;
          }
          if (enemy.type === 'turret') {
            enemy.fireCooldown -= clampedDeltaTime;
            if (enemy.fireCooldown <= 0) {
              levelRef.current.projectiles.push({id: `proj_${Date.now()}`, x: enemy.x, y: enemy.y, vx: -3});
              enemy.fireCooldown = TURRET_FIRE_RATE;
            }
          }
          const enemyRect = { x: enemy.x, y: enemy.y, width: TILE_SIZE, height: TILE_SIZE };
          if (p.x < enemyRect.x + enemyRect.width && p.x + PLAYER_WIDTH > enemyRect.x &&
              p.y < enemyRect.y + enemyRect.height && p.y + PLAYER_HEIGHT > enemyRect.y) {
            if (enemy.type !== 'spiky' && p.vy > 0 && (p.y + PLAYER_HEIGHT) - enemyRect.y < 20) {
              p.vy = JUMP_FORCE / 1.5; setScore(s => s + 50);
              levelRef.current.enemies = levelRef.current.enemies.filter(e => e.id !== enemy.id);
            } else if (p.invincible <= 0) {
              p.invincible = 120; // 2 seconds of invincibility
              setGameState('gameover'); // For now, any hit is game over
            }
          }
        });

        levelRef.current.projectiles = levelRef.current.projectiles.filter(proj => {
            proj.x += proj.vx * clampedDeltaTime;
            const projRect = {x: proj.x, y: proj.y, width: 10, height: 10};
            if (p.x < projRect.x + projRect.width && p.x + PLAYER_WIDTH > projRect.x &&
                p.y < projRect.y + projRect.height && p.y + PLAYER_HEIGHT > projRect.y) {
                 if (p.invincible <= 0) setGameState('gameover');
                 return false;
            }
            return proj.x > cameraXRef.current - 20;
        });

        levelRef.current.coins = levelRef.current.coins.filter(coin => {
          if (p.x < coin.x + (TILE_SIZE/2) && p.x + PLAYER_WIDTH > coin.x &&
              p.y < coin.y + (TILE_SIZE/2) && p.y + PLAYER_HEIGHT > coin.y) {
            setScore(s => s + 10); return false;
          }
          return true;
        });
        
        if (p.y > GAME_HEIGHT + 100) setGameState('gameover');
        const flagpole = levelRef.current.flagpole;
        if (flagpole && playerRect.x < flagpole.x + flagpole.width && playerRect.x + playerRect.width > flagpole.x) {
            if (isXpMode) setGameState('levelwon'); else nextLevel();
        }
        setTick(t => t + 1);
      }
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    animationFrameId = requestAnimationFrame(gameLoop);

    const handleKey = e => { keysRef.current[e.key] = e.type === 'keydown'; };
    window.addEventListener('keydown', handleKey); window.addEventListener('keyup', handleKey);
    return () => { cancelAnimationFrame(animationFrameId); window.removeEventListener('keydown', handleKey); window.removeEventListener('keyup', handleKey); };
  }, [uiGameState, isXpMode, nextLevel]);

  useEffect(() => {
    if (uiGameState === 'playing' && parsedFlashcards.length >= 5 && !isXpMode) {
      const timer = setTimeout(() => {
        const checkGroundAndShowQuiz = () => {
          // Ensure the game is still active before showing the quiz
          if (gameStateRef.current === 'playing' && playerState.current.onGround) {
            setGameState('quiz');
          } else if (gameStateRef.current === 'playing') {
            // If airborne, wait a moment and check again
            setTimeout(checkGroundAndShowQuiz, 100);
          }
        };
        checkGroundAndShowQuiz();
      }, 5000 + Math.random() * 5000); // Quiz appears after 5-10 seconds
      return () => clearTimeout(timer);
    }
    // FIX: Removed `score` from dependencies to prevent the timer from resetting every time the score changes.
    // Also using parsedFlashcards.length to avoid re-renders from the array object itself changing.
  }, [uiGameState, parsedFlashcards.length, isXpMode]);
  
  const handleQuizComplete = useCallback(() => {
    setGameState('playing');
  }, []);

  useEffect(() => {
    // FIX: Only run this logic when the game state is explicitly 'gameover' or 'levelwon'.
    // This prevents the check from running prematurely when the game starts.
    if (uiGameState === 'gameover') {
      if (!isXpMode) {
        if (score > studyZoneState.platformerHighScore) {
          updateStudyZoneState({ platformerHighScore: score });
          showMessageBox(`Game Over! New high score: ${score}`, 'info');
          processAchievement('highScore', score);
          
          // NEW: Loot Drop for high score
          if (score > 1000) { // Require a score of at least 1000 for the rare drop
             const key = 'alchemy_state.inventory.stardust_phial';
             updateStatsInFirestore({ [key]: increment(1) });
             showMessageBox('Your skill has attracted a Stardust Phial!', 'info');
          }

        } else {
          showMessageBox(`Game Over! Your score: ${score}`, 'error');
        }
      }
    } else if (uiGameState === 'levelwon' && isXpMode) {
      updateStatsInFirestore({ totalXP: (stats?.totalXP || 0) + 250 });
      showMessageBox(`Level Complete! You earned 250 XP!`, 'info');
    }
  }, [uiGameState, score, isXpMode, showMessageBox, stats?.totalXP, studyZoneState.platformerHighScore, updateStatsInFirestore, updateStudyZoneState, processAchievement]);

  return (
    <div className="flex flex-col items-center">
      <div className="flex gap-8 mb-4 text-white text-xl font-bold">
        <span>Score: {score}</span>
        <span>High Score: {studyZoneState.platformerHighScore}</span>
        <span>Level: {level}</span>
      </div>
      <div className="relative w-[800px] h-[400px] bg-blue-300 overflow-hidden border-4 border-slate-900 rounded-lg">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-sky-600"></div>
        {/* New Farthest Background Layer */}
        <div className="absolute bottom-0 left-0 w-[2400px] h-64 bg-no-repeat bg-bottom" style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 180"><path d="M0 180 L0 120 C 120 150, 250 100, 400 110 C 550 120, 680 90, 800 100 L800 180 Z" fill="%2314532d" opacity="0.6"/></svg>')`, transform: `translateX(${-cameraXRef.current * 0.2}px)` }}></div>
        <div className="absolute bottom-0 left-0 w-[2400px] h-48 bg-no-repeat bg-bottom" style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 150"><path d="M0 150 L0 100 C 100 50, 200 120, 300 100 C 400 80, 500 140, 600 120 C 700 100, 800 130, 800 130 L800 150 Z" fill="%23166534"/></svg>')`, transform: `translateX(${-cameraXRef.current * 0.5}px)` }}></div>
        <div className="absolute bottom-0 left-0 w-[2400px] h-32 bg-no-repeat bg-bottom" style={{ backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 120"><path d="M0 120 L0 90 C 150 110, 250 60, 400 80 C 550 100, 650 70, 800 90 L800 120 Z" fill="%2315803d"/></svg>')`, transform: `translateX(${-cameraXRef.current * 0.8}px)` }}></div>

        {uiGameState === 'menu' && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10 space-y-4 text-center p-4">
            <h3 className="text-4xl text-white font-bold mb-2 drop-shadow-lg">Platformer Challenge</h3>
            {parsedFlashcards.length >= 5 ? (
              <button onClick={startGameWithFlashcards} className="px-8 py-4 bg-green-500 text-white font-bold rounded-lg text-2xl hover:bg-green-600 shadow-xl">Start Full Game</button>
            ) : (
              <div className="bg-slate-800/50 p-4 rounded-lg">
                <p className="text-slate-300">Add at least 5 flashcards in the other tab to play the full game.</p>
                <button onClick={startXpLevel} className="mt-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-lg text-xl hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed" disabled={(stats?.totalXP || 0) < 100}>
                  Play for XP (Costs 100)
                </button>
              </div>
            )}
          </div>
        )}
        {(uiGameState === 'gameover' || uiGameState === 'levelwon') && (
          <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center z-10">
            <h3 className={`text-4xl font-bold mb-4 drop-shadow-lg ${uiGameState === 'levelwon' ? 'text-green-400' : 'text-red-500'}`}>
              {uiGameState === 'levelwon' ? 'Level Complete!' : 'Game Over!'}
            </h3>
            <button onClick={() => setGameState('menu')} className="px-8 py-4 bg-blue-500 text-white font-bold rounded-lg text-2xl hover:bg-blue-600 shadow-xl">Main Menu</button>
          </div>
        )}
        {uiGameState === 'quiz' && <FlashcardQuizModal cards={parsedFlashcards} onComplete={handleQuizComplete} />}
        
        {uiGameState === 'playing' && (
          <GameRenderer 
            playerState={playerState}
            levelRef={levelRef}
            cameraXRef={cameraXRef}
            TILE_SIZE={TILE_SIZE}
            PLAYER_WIDTH={PLAYER_WIDTH}
            PLAYER_HEIGHT={PLAYER_HEIGHT}
          />
        )}
      </div>
      <p className="text-slate-500 mt-2 text-sm hidden md:block">Controls: Arrow keys or A/D to move, Arrow Up, W, or Space to jump/double-jump.</p>
      
      {isMobile && (
        <div className="fixed bottom-4 left-4 right-4 flex justify-between items-center z-20">
          <div className="flex gap-3">
            <button
              onTouchStart={() => handleButtonPress('ArrowLeft', true)}
              onTouchEnd={() => handleButtonPress('ArrowLeft', false)}
              onMouseDown={() => handleButtonPress('ArrowLeft', true)}
              onMouseUp={() => handleButtonPress('ArrowLeft', false)}
              className="w-16 h-16 bg-slate-800/50 text-white text-3xl rounded-full active:bg-indigo-600"
            >
              ←
            </button>
            <button
              onTouchStart={() => handleButtonPress('ArrowRight', true)}
              onTouchEnd={() => handleButtonPress('ArrowRight', false)}
              onMouseDown={() => handleButtonPress('ArrowRight', true)}
              onMouseUp={() => handleButtonPress('ArrowRight', false)}
              className="w-16 h-16 bg-slate-800/50 text-white text-3xl rounded-full active:bg-indigo-600"
            >
              →
            </button>
          </div>
          <button
            onTouchStart={() => handleButtonPress(' ', true)}
            onTouchEnd={() => handleButtonPress(' ', false)}
            onMouseDown={() => handleButtonPress(' ', true)}
            onMouseUp={() => handleButtonPress(' ', false)}
            className="w-20 h-20 bg-slate-800/50 text-white text-4xl rounded-full active:bg-indigo-600"
          >
            ↑
          </button>
        </div>
      )}
    </div>
  );
};



const FlashcardQuizModal = ({ cards, onComplete }) => {
  const [streak, setStreak] = useState(0);
  const [currentCard, setCurrentCard] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [feedback, setFeedback] = useState(''); // 'correct', 'incorrect', ''

  const getRandomCard = useCallback(() => {
    // The parent component (`PlatformerGame`) is responsible for ensuring cards exist.
    // This function will now only act if it has valid cards, preventing an immediate exit.
    if (cards && cards.length > 0) {
      setCurrentCard(cards[Math.floor(Math.random() * cards.length)]);
    }
    // We REMOVE the `else { onComplete() }` block that was causing the modal to close instantly.
  }, [cards]); // onComplete is no longer a dependency here.

  useEffect(() => {
    // This effect runs on mount and whenever the `cards` prop changes.
    getRandomCard();
  }, [getRandomCard]); // getRandomCard is now stable unless `cards` changes.

  useEffect(() => {
    if (streak >= 3) {
      onComplete();
    }
  }, [streak, onComplete]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Guard against submission when there's no card
    if (!currentCard || feedback) return;

    if (userAnswer.toLowerCase().trim() === currentCard.back.toLowerCase().trim()) {
      setFeedback('correct');
      setStreak(s => s + 1);
    } else {
      setFeedback('incorrect');
      setStreak(0);
    }
    setTimeout(() => {
      setFeedback('');
      setUserAnswer('');
      getRandomCard();
    }, 1500);
  };
  
  // No longer returning null here. The JSX will handle the loading state.

  return (
    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-20 text-white p-8">
      <h3 className="text-3xl font-bold mb-4">Flashcard Quiz!</h3>
      <p className="mb-4">Get 3 correct in a row to continue.</p>
      <p className="text-2xl font-bold text-green-400 mb-6">Streak: {streak} / 3</p>

      <div className={`p-8 rounded-lg w-full max-w-lg text-center transition-colors ${feedback === 'correct' ? 'bg-green-800' : feedback === 'incorrect' ? 'bg-red-800' : 'bg-slate-700'}`}>
        <p className="text-slate-400 mb-2">FRONT</p>
        <p className="text-3xl font-bold mb-6 h-10">{currentCard ? currentCard.front : "..."}</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="w-full p-3 bg-slate-800 border border-slate-600 rounded-md text-center text-xl"
            placeholder="Type the back of the card..."
            disabled={feedback !== '' || !currentCard}
          />
        </form>
        {feedback === 'incorrect' && <p className="mt-4 text-lg">Correct answer: <span className="font-bold">{currentCard?.back}</span></p>}
      </div>
    </div>
  );
};

  



const normalizeTimestamps = (data) => {
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

const App = () => {
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [activeSheet, setActiveSheet] = useState('Stats + XP Tracker');
  const dungeonXpRef = useRef(null);

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

  // Effect to handle sidebar state when resizing across the breakpoint
  useEffect(() => {
    setIsSidebarOpen(!isMobile);
  }, [isMobile]);
  const [assignments, setAssignments] = useState([]);
  const statsRef = useRef({});

  // REFACTORED: Single state object for all user data
    const [stats, setStats] = useState(() => getCachedData('statsCache', 60) || {
    username: '',
    totalXP: 0,
    currentLevel: 1,
    assignmentsCompleted: 0,
    friends: [],
    ownedItems: [],
    equippedItems: { avatar: null, banner: 'banner_default', background: null, font: 'font_inter', animation: null, title: null, wallpaper: null, dungeonEmojis: {}, tdSkins: {} },
    ownedFurniture: [],
    ownedPets: [],
    currentPet: null,
    petStatus: 'none',
    assignmentsToHatch: 0,
    cosmeticShards: 0,
    focusNavigator: { unlockedLocations: ['genesis_prime'], explorerStreak: 0, lastStreakDay: null, dailyFocusMinutes: 0 },
    dungeon_state: null,
    dungeon_floor: 0,
    dungeon_gold: 0,
    td_wins: 0,
    td_wave: 0,
    td_castleHealth: 5,
    td_towers: [],
    td_path: generatePath(),
    td_gameOver: false,
    td_gameWon: false,
    td_unlockedTowers: [],
    td_towerUpgrades: {},
    lab_state: null,
    studyZone: { flashcardsText: '', platformerHighScore: 0, flashcardData: {} },
    achievements: { assignmentsCompleted: { tier: 0, progress: 0 }, hardAssignmentsCompleted: { tier: 0, progress: 0 } },
    quests: { daily: [], weekly: [], lastUpdated: null },
  });

  const completedAssignments = useMemo(() => assignments.filter(a => a.status === 'Completed'), [assignments]);

  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  // REFACTORED: Single update function for the consolidated stats document
  const updateStatsInFirestore = useCallback(async (dataToUpdate) => {
    if (!db || !user) return;
    const docRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);
    const finalData = { ...dataToUpdate, lastActionTimestamp: serverTimestamp() };
    try {
      // FIX: Use updateDoc instead of setDoc with merge. This correctly handles
      // dot notation for nested fields (like 'dungeon_wingmen.roster') and
      // sentinel values like increment().
      await updateDoc(docRef, finalData);
    } catch (error) {
      console.error("Firestore Write Error (Stats):", error);
      showMessageBox(`Failed to update stats.`, "error");
    }
  }, [user, db, appId]);


  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSlotAnimationOpen, setIsSlotAnimationOpen] = useState(false);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [xpGainToShow, setXpGainToShow] = useState(0);
  const [xpAnimationKey, setXpAnimationKey] = useState(0);
  const [xpAnimationOriginEvent, setXpAnimationOriginEvent] = useState(null);
  const primeAudioRef = useRef(null);
  
  const [appKey, setAppKey] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      // Clear cache on sign out
      sessionStorage.removeItem('statsCache');
    } catch (error) {
      console.error("Error signing out:", error);
      showMessageBox("Failed to sign out.", "error");
    }
  };

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

  const handleRefreshAllData = () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    // Clear cache and force a re-render which triggers the listener useEffect
    sessionStorage.removeItem('statsCache');
    setAppKey(prevKey => prevKey + 1);
    showMessageBox('Force refreshing all data...', 'info');
    setTimeout(() => setIsRefreshing(false), 2000);
  };

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
  const equippedAvatarDisplay = equippedAvatar ? equippedAvatar.display : '👤';

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

  useEffect(() => {
    if (!auth) {
      console.error("Firebase not initialized.");
      setIsAuthReady(true);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // REFACTORED: useEffect for a single data listener
  useEffect(() => {
    if (!isAuthReady || !user) return;
    const userId = user.uid;

    const cached = getCachedData('statsCache', 60);
    if (cached) {
      setStats(cached);
    }

    // --- Single Listener for all stats ---
    const docRef = doc(db, `artifacts/${appId}/public/data/stats`, userId);
    const unsubStats = onSnapshot(docRef, (docSnap) => {
      // MERGE Firestore data with a complete default structure.
      // This prevents crashes if a user's document is missing a newer field.
      // It now correctly uses the globally defined `defaultStats`.
      const data = docSnap.exists() 
        ? { ...defaultStats, ...docSnap.data(), username: docSnap.data().username || user.email.split('@')[0] } 
        : { ...defaultStats, username: user.email.split('@')[0] };
      setStats(data);
      cacheData('statsCache', data);
    }, (error) => console.error(`Error listening to stats:`, error));
    
    // --- Listener for assignments (separate collection) ---
    const assignmentsQuery = query(collection(db, `artifacts/${appId}/public/data/assignmentTracker`), where("userId", "==", userId), orderBy("dueDate", "asc"), limit(50));
    const unsubAssignments = onSnapshot(assignmentsQuery, (snapshot) => {
        const fetchedAssignments = snapshot.docs.map(doc => ({
            id: doc.id, ...doc.data(),
            dueDate: doc.data().dueDate?.toDate(),
            dateCompleted: doc.data().dateCompleted?.toDate(),
            subtasks: doc.data().subtasks || [],
            recurrenceType: doc.data().recurrenceType || 'none',
            recurrenceEndDate: doc.data().recurrenceEndDate?.toDate(),
            tags: doc.data().tags || [],
            isEpicQuest: doc.data().isEpicQuest || false, // Explicitly check for the new flag
        }));
        setAssignments(fetchedAssignments);
    });

    return () => {
      unsubStats();
      unsubAssignments();
    };
  }, [user, isAuthReady, appKey]);

    // NEW: Effect to check for and generate new daily/weekly quests on load
    useEffect(() => {
    if (user && stats.quests && stats.quests.lastUpdated) {
      if (shouldGenerateQuests(stats.quests.lastUpdated)) {
        console.log("Generating new daily/weekly quests...");
        const newQuests = generateQuests();
        updateStatsInFirestore({ quests: newQuests });
        showMessageBox("Your daily and weekly quests have been refreshed!", "info");
      }
    }
    }, [user, stats.quests, updateStatsInFirestore]);

  const triageableAssignments = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const tenDaysFromNow = new Date();
    tenDaysFromNow.setDate(tenDaysFromNow.getDate() + 10);
    tenDaysFromNow.setHours(23, 59, 59, 999);

    return assignments.filter(a => {
      if (a.status === 'Completed' || !a.dueDate) {
        return false;
      }
      // Task must be due between the start of today and 10 days from now.
      return a.dueDate >= startOfToday && a.dueDate <= tenDaysFromNow;
    });
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
        icon: "✨"
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

    if (avgScore >= 98 && lateSubmissionsCount === 0) return { name: "The Perfectionist", description: "You have an impeccable record of submitting flawless work on time.", icon: "💎"};
    if (avgScore >= 90 && hardCompletionRate >= 20) return { name: "The High-Achieving Conqueror", description: "You consistently aim for excellence and tackle the toughest challenges!", icon: "👑" };
    if (totalAssignments >= 50 && latePercentage <= 10) return { name: "The Marathoner", description: "You have a long, proven track record of consistency and endurance.", icon: "🏃‍♂️" };
    if (avgDaysEarly >= 2 && lateSubmissionsCount === 0) return { name: "The Early Bird Planner", description: "You love to get things done ahead of time.", icon: "⏰" };
    if (hardCompletionRate >= 30) return { name: "The Challenge Seeker", description: "You actively seek out and conquer difficult assignments.", icon: "🏔️" };
    if (latePercentage > 40 && avgScore >= 70) return { name: "The Deadline Dynamo", description: "You thrive under pressure, delivering quality work just in time.", icon: "⚡" };
    if (avgDaysEarly < 0.5 && lateSubmissionsCount === 0) return { name: "The Just-in-Time Submitter", description: "You masterfully use every minute, delivering right on schedule.", icon: "🎯" };
    if (totalAssignments >= 10 && avgDaysEarly < 1 && latePercentage <= 20) return { name: "The Steady Progressor", description: "You consistently chip away at tasks, making reliable progress.", icon: "🐢" };
    if (totalAssignments >= 15 && avgScore >= 80 && latePercentage <= 15) return { name: "The All-Rounder", description: "A well-balanced performer, delivering high-quality work on time.", icon: "🏅" };
    if (totalAssignments > 0) return { name: "The Emerging Star", description: "You're building solid habits! Keep going.", icon: "🌟" };
    return { name: "The Newbie", description: "Start completing assignments to discover your persona!", icon: "✨" };
  }, [completedAssignments]);

  // Pet Hatching Logic
  const generateNewPet = useCallback(() => {
    let petRarity = '';
    const roll = Math.random();
    if (roll < PET_RARITIES.mythic) petRarity = 'mythic';
    else if (roll < PET_RARITIES.mythic + PET_RARITIES.legendary) petRarity = 'legendary';
    else if (roll < PET_RARITIES.mythic + PET_RARITIES.legendary + PET_RARITIES.epic) petRarity = 'epic';
    else if (roll < PET_RARITIES.mythic + PET_RARITIES.legendary + PET_RARITIES.epic + PET_RARITIES.rare) petRarity = 'rare';
    else petRarity = 'common';
    
    const availablePetsOfRarity = petDefinitions[petRarity];
    return availablePetsOfRarity[Math.floor(Math.random() * availablePetsOfRarity.length)];
  }, []);
  
    const collectFirstEgg = useCallback(async () => actionLock(async () => {
    if (!db || !user) return;
    const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);
    try {
      await updateDoc(statsDocRef, {
        petStatus: 'egg',
        assignmentsToHatch: EGG_REQUIREMENT,
        'cooldowns.collectEgg': serverTimestamp()
      });
      showMessageBox(`You found your first egg! Complete ${EGG_REQUIREMENT} assignments to hatch it.`, "info", 3000);
    } catch (error) {
      const errorMsg = error.message.includes('permission-denied') ? "You're acting too quickly!" : "Server error.";
      showMessageBox(errorMsg, "error");
    }
  }), [db, user, appId, actionLock, showMessageBox]);

  const collectNewEgg = useCallback(async () => actionLock(async () => {
    if (!db || !user) return;
    if (stats.petStatus !== 'hatched' && stats.petStatus !== 'none') return;
    const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);
    try {
      await runTransaction(db, async (transaction) => {
        const statsDoc = await transaction.get(statsDocRef);
        if (!statsDoc.exists()) throw new Error("User data missing.");
        transaction.update(statsDocRef, { 
            petStatus: 'egg', 
            assignmentsToHatch: EGG_REQUIREMENT,
            'cooldowns.collectEgg': serverTimestamp() // Use dot notation
        });
      });
      showMessageBox(`You found a new egg! Complete ${EGG_REQUIREMENT} assignments to hatch it.`, "info", 3000);
    } catch (error) {
      const errorMsg = error.message.includes('permission-denied') ? "You're acting too quickly!" : "Server error.";
      showMessageBox(errorMsg, "error");
    }
  }), [db, user, appId, stats.petStatus, actionLock, showMessageBox]);

  
  const handleEvolvePet = useCallback(async (petToEvolve) => {
    if (!db || !user) return;

    actionLock(async () => {
      // Find the base pet definition and the next evolution stage
      let basePetOfCurrent = null;
      for (const rarityGroup of Object.values(petDefinitions)) {
          basePetOfCurrent = rarityGroup.find(p => p.id === petToEvolve.id || (p.evolutions && p.evolutions.some(e => e.id === petToEvolve.id)));
          if (basePetOfCurrent) break;
      }

      let nextEvolution = null;
      if (basePetOfCurrent?.evolutions) {
          const currentIndexInEvoChain = petToEvolve.id === basePetOfCurrent.id ? -1 : basePetOfCurrent.evolutions.findIndex(e => e.id === petToEvolve.id);
          if (currentIndexInEvoChain + 1 < basePetOfCurrent.evolutions.length) {
              nextEvolution = basePetOfCurrent.evolutions[currentIndexInEvoChain + 1];
          }
      }

      if (!nextEvolution) { showMessageBox("This pet has reached its final evolution!", "info"); return; }

      const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);

      try {
        await runTransaction(db, async (transaction) => {
          const statsDoc = await transaction.get(statsDocRef);
          if (!statsDoc.exists()) throw new Error("User data missing!");

          const serverStats = statsDoc.data();
          
          if (serverStats.currentLevel < nextEvolution.levelRequired) throw new Error(`Level ${nextEvolution.levelRequired} required.`);
          if (serverStats.totalXP < nextEvolution.xpCost) throw new Error(`You need ${nextEvolution.xpCost} XP to evolve.`);

          const newTotalXP = serverStats.totalXP - nextEvolution.xpCost;
          const { level: newLevel } = calculateLevelInfo(newTotalXP);
          
          const updatedOwnedPets = (serverStats.ownedPets || []).map(p => p.id === petToEvolve.id ? nextEvolution : p);
          const newCurrentPet = serverStats.currentPet?.id === petToEvolve.id ? nextEvolution : serverStats.currentPet;
          
          transaction.update(statsDocRef, {
            totalXP: newTotalXP,
            currentLevel: newLevel,
            currentPet: newCurrentPet,
            ownedPets: updatedOwnedPets,
            'cooldowns.evolvePet': serverTimestamp()
          });
        });

        showMessageBox(`Your ${petToEvolve.name} evolved into a ${nextEvolution.name}!`, "info", 5000);
        // After the evolution is successful, check for an achievement.
        await processAchievement('petsEvolved');
      } catch (error) {
        console.error("Evolution transaction failed: ", error);
        const errorMsg = error.message.includes('permission-denied') ? "You're acting too quickly! Please wait a moment." : error.message;
        showMessageBox(errorMsg, "error");
      }
    });
  }, [user, db, appId, calculateLevelInfo, actionLock, showMessageBox]);

  
  const resetDungeonGame = () => actionLock(async () => {
    if (!db || !user) return;

    const initialDungeonState = generateInitialDungeonState();
    
    // Optimistically update the local state for an instant UI change
    setStats(prevStats => ({
      ...prevStats,
      dungeon_state: initialDungeonState,
      dungeon_floor: 0,
      dungeon_gold: 0,
    }));
    
    // Perform the Firestore update in the background
    const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);
    try {
      await updateDoc(statsDocRef, {
        dungeon_state: initialDungeonState,
        dungeon_floor: 0,
        dungeon_gold: 0,
        'cooldowns.resetDungeon': serverTimestamp(),
        lastActionTimestamp: serverTimestamp()
      });
      setDungeonResetKey(prev => prev + 1); // Force remount for a clean slate
      showMessageBox("Dungeon has been reset! Choose your class.", "info");
    } catch (error) {
      // The listener will eventually correct the state if the update fails.
      const errorMsg = error.message.includes('permission-denied') ? "You're resetting too quickly!" : "Dungeon reset failed.";
      showMessageBox(errorMsg, "error");
    }
  });

  const resetTowerDefenseGame = useCallback(() => actionLock(async () => {
    if (!db || !user) return;
    const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);
    
    try {
      const petEffects = { dragon: { castleHealth: 1 } };
      const petId = stats.currentPet?.id.split('_')[0];
      const petEffectsApplied = petEffects[petId] || {};

      await runTransaction(db, async (transaction) => {
        const statsDoc = await transaction.get(statsDocRef);
        if (!statsDoc.exists()) throw new Error("Game state not found.");
        
        transaction.update(statsDocRef, {
          td_wave: 0,
          td_castleHealth: 5 + (petEffectsApplied.castleHealth || 0),
          td_towers: [],
          td_path: generatePath(),
          td_gameOver: false,
          td_gameWon: false,
          td_towerUpgrades: {},
          'cooldowns.resetTowerDefense': serverTimestamp(), // Use dot notation
          lastActionTimestamp: serverTimestamp()
        });
      });
      showMessageBox("New game started!", "info");
    } catch (error) {
      const errorMsg = error.message.includes('permission-denied') ? "You're resetting too quickly!" : "Game reset failed.";
      showMessageBox(errorMsg, "error");
    }
  }), [db, user, appId, stats.currentPet, actionLock, showMessageBox]);

const spinProductivitySlotMachine = useCallback(() => {
    if (statsRef.current.totalXP < 50) {
      showMessageBox(`You need 50 XP to spin.`, "error");
      return;
    }
    setIsSlotAnimationOpen(true);
}, []);

const handleSlotAnimationComplete = useCallback(async (reward) => {
    setIsSlotAnimationOpen(false);
    if (!db || !user) return;
    const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);

    try {
        const messageToShow = await runTransaction(db, async (transaction) => {
            const statsDoc = await transaction.get(statsDocRef);
            if (!statsDoc.exists()) throw new Error("User data is missing.");
            
            const serverStats = statsDoc.data();
            
            if (serverStats.totalXP < 50) throw new Error("INSUFFICIENT_XP");

            let xpChange = 0, shardChange = 0, message = "";
            let newOwnedItems = [...(serverStats.ownedItems || [])];
            let isNewItem = false;

            if (reward.type === 'xp_gain') xpChange = reward.amount;
            else if (reward.type === 'xp_loss') xpChange = reward.amount;
            else if (reward.id) { // It's a cosmetic item
                if (!newOwnedItems.includes(reward.id)) {
                    newOwnedItems.push(reward.id); isNewItem = true;
                } else {
                    const rarityShardMap = { common: 2, rare: 5, epic: 15, legendary: 30, mythic: 75 };
                    shardChange = rarityShardMap[reward.rarity] || 2;
                }
            }

            const finalTotalXP = serverStats.totalXP - 50 + xpChange;
            const newShards = (serverStats.cosmeticShards || 0) + shardChange;
            const { level: newLevel } = calculateLevelInfo(finalTotalXP);
            
            if (isNewItem) message = `You won: ${reward.name}!`;
            else if (xpChange > 0) message = `You won ${xpChange} XP!`;
            else if (shardChange > 0) message = `Duplicate ${reward.name}! You get ${shardChange} shards.`;
            else if (xpChange < 0) message = `You lost ${Math.abs(xpChange)} XP.`;
            else message = `Spin resulted in no change.`;

            transaction.update(statsDocRef, {
                totalXP: finalTotalXP,
                currentLevel: newLevel,
                ownedItems: newOwnedItems,
                cosmeticShards: newShards,
                'cooldowns.spinSlotMachine': serverTimestamp()
            });
            
            return message;
        });
        if (messageToShow) showMessageBox(messageToShow, "info");
    } catch (e) {
        if (e.message === "INSUFFICIENT_XP") showMessageBox("Not enough XP.", "error");
        else showMessageBox(e.message.includes('permission-denied') ? "You're spinning too fast! Please wait a moment." : "Server error. XP not spent.", "error");
    }
}, [user, db, appId, calculateLevelInfo]);

  const hatchEgg = useCallback(async () => actionLock(async () => {
    if (!db || !user) return;
    if (stats.petStatus !== 'egg' || stats.assignmentsToHatch > 0) return;
    const newPet = generateNewPet();
    const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);
    try {
      await runTransaction(db, async (transaction) => {
        const statsDoc = await transaction.get(statsDocRef);
        if (!statsDoc.exists()) throw new Error("User data missing.");
        
        const serverStats = statsDoc.data();
        const updatedOwnedPets = [...(serverStats.ownedPets || []), newPet];

        transaction.update(statsDocRef, {
            petStatus: 'hatched',
            currentPet: newPet, 
            ownedPets: updatedOwnedPets, 
            assignmentsToHatch: EGG_REQUIREMENT,
            'cooldowns.hatchPet': serverTimestamp() // Use dot notation
        });
      });
      showMessageBox(`Your egg hatched! You got a ${newPet.rarity.toUpperCase()} ${newPet.name}!`, "info", 5000);
    } catch (error) {
      const errorMsg = error.message.includes('permission-denied') ? "You're acting too quickly!" : "Server error.";
      showMessageBox(errorMsg, "error");
    }
  }), [db, user, appId, stats, generateNewPet, actionLock, showMessageBox]);

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
            showMessageBox(`✨ Cosmic Event: ${chosenEvent.description}`, 'info', 6000);
            
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
                        {activeMissionState.isActive && <CockpitView mission={activeMissionState} onMissionComplete={handleMissionComplete} isMobile={isMobile} />}
      <WeeklyTriageModal
        isOpen={triageState.isOpen}
        onClose={() => setTriageState({ isOpen: false, needsSetup: false })}
        assignments={triageableAssignments}
        triageSettings={stats.triageSettings}
        onSaveSettings={handleSaveTriageSettings}
        onCompleteTriage={handleCompleteTriage}
      />
      <MissionControlModal 
        isOpen={missionControlState.isOpen}
        onClose={() => setMissionControlState({ isOpen: false, assignment: null })}
        assignment={missionControlState.assignment}
        unlockedLocations={stats.focusNavigator?.unlockedLocations || ['genesis_prime']}
        onLaunchMission={launchMission}
      />
      <div className={`min-h-screen font-inter text-slate-300 flex bg-slate-900 relative ${equippedFontStyle || 'font-inter'} ${activeMissionState.isActive ? 'pointer-events-none' : ''}`}>
      <style>{`
          /* All your @import and CSS variables... */
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script&family=Inter:wght@400;700&family=Oswald&family=Permanent+Marker&family=Playfair+Display&family=Press+Start+2P&family=Roboto+Slab&family=Space+Mono&family=Cinzel+Decorative&family=Comic+Neue&family=Libre+Baskerville&family=Lato&family=Merriweather&family=Raleway&family=Ubuntu&display=swap');
          :root { --primary-color: #4f46e5; --accent-color: #818cf8; --text-color: #ffffff; transition: --primary-color 0.3s, --accent-color 0.3s; }
          @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
          .animate-fade-in { animation: fade-in 0.3s ease-in-out; }
          body { background-color: #0f172a; }
          .bg-primary { background-color: var(--primary-color); }
          .text-accent { color: var(--accent-color); }
          .border-accent { border-color: var(--accent-color); }
          .font-inter { font-family: 'Inter', sans-serif; }
          .font-mono { font-family: 'Space Mono', monospace; }
          .font-serif { font-family: 'Playfair Display', serif; }
          .font-cursive { font-family: 'Dancing Script', cursive; }
          .font-handwritten { font-family: 'Permanent Marker', cursive; }
          .font-pixel { font-family: 'Press Start 2P', cursive; }
          .font-comic { font-family: 'Comic Neue', cursive; }
          .font-fantasy { font-family: 'Cinzel Decorative', cursive; }
          .font-slab { font-family: 'Roboto Slab', serif; }
          .font-sans-condensed { font-family: 'Oswald', sans-serif; }
          .font-baskerville { font-family: 'Libre Baskerville', serif; }
          .font-lato { font-family: 'Lato', sans-serif; }
          .font-merriweather { font-family: 'Merriweather', serif; }
          .font-raleway { font-family: 'Raleway', sans-serif; }
          .font-ubuntu { font-family: 'Ubuntu', sans-serif; }
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: #1e293b; }
          ::-webkit-scrollbar-thumb { background: var(--primary-color); border-radius: 4px; }
          .projectile { position: absolute; transform: translate(-50%, -50%); transition: top 0.3s linear, left 0.3s linear; z-index: 20; pointer-events: none; display: flex; align-items: center; justify-content: center; }          @keyframes enemy-hit { 0% { filter: brightness(1); } 50% { filter: brightness(3); } 100% { filter: brightness(1); } }
          .enemy-hit-animation { animation: enemy-hit 0.2s ease-in-out; }
          .xp-bar-container { position: fixed; bottom: 2%; left: 0; width: 100%; display: flex; justify-content: center; pointer-events: none; z-index: 9999; opacity: 0; animation: fade-in-bar 0.5s ease-out forwards; }
          @keyframes fade-in-bar { to { opacity: 1; } }
          .xp-bar-wrapper { position: relative; width: 50%; max-width: 600px; height: 20px; }
          .xp-bar-background { width: 100%; height: 16px; background-color: #1e293b; border: 2px solid #0f172a; border-radius: 2px; overflow: hidden; }
          .xp-bar-fill { height: 100%; background-color: #6366f1; transition: width 0.1s linear; }
          .xp-level-text { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-weight: bold; font-size: 12px; text-shadow: 1px 1px 2px #000; }
          .xp-orb { position: fixed; border-radius: 50%; background-color: #a7f3d0; box-shadow: 0 0 10px #34d399, 0 0 4px white; opacity: 0; will-change: transform, opacity; transform: translate(-50%, -50%); }
          .xp-orb.satis-low { width: 8px; height: 8px; }
          .xp-orb.satis-medium { width: 12px; height: 12px; }
          .xp-orb.satis-high { width: 16px; height: 16px; }
          @keyframes fly-to-bar-minecraft { 0% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; } 100% { top: 98vh; left: 50vw; transform: translate(-50%, -50%) scale(0); opacity: 0; } }
          
          /* Tower Defense Tower Animation */
          @keyframes tower-attack-pulse { 0% { transform: scale(1); } 50% { transform: scale(1.15); } 100% { transform: scale(1); } }
          .tower-attack { animation: tower-attack-pulse 0.3s ease-out; }

          /* Dungeon Crawler Animations */
          @keyframes entity-hit-flash { 0% { filter: brightness(1); } 50% { filter: brightness(3) drop-shadow(0 0 5px #fff); } 100% { filter: brightness(1); } }
                    .entity-hit { animation: entity-hit-flash 0.2s ease-in-out; }

          @keyframes elite-glow {
            0%, 100% { filter: drop-shadow(0 0 3px #fde047); }
            50% { filter: drop-shadow(0 0 7px #fde047); }
          }
          .elite-enemy-glow {
            animation: elite-glow 2s infinite;
          }
          
          @keyframes particle-burst {
            0% { transform: scale(0); opacity: 1; }
            100% { transform: scale(1.5); opacity: 0; }
          }
          .particle {
            position: absolute;
            background-color: #f59e0b; /* Orange-yellow for impact */
            border-radius: 50%;
            animation-name: particle-burst;
            animation-duration: 0.5s;
            animation-timing-function: ease-out;
            animation-fill-mode: forwards;
          }
          @keyframes fade-out-fast {
            0% { opacity: 1; transform: scale(1.1); }
            80% { opacity: 1; transform: scale(1); }
            100% { opacity: 0; transform: scale(0.9); }
          }
          .animate-fade-out-fast {
            animation: fade-out-fast 1.5s ease-in-out forwards;
          }
      `}</style>

      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/60 z-30 md:hidden"></div>
      )}

      <div id="messageBox" className="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-y-full opacity-0">
        <p id="messageText" className="text-white"></p>
      </div>

      <TaskCompletionAnimation show={showCompletionAnimation} onAnimationEnd={() => setShowCompletionAnimation(false)} equippedAnimationEffect={stats?.equippedItems?.animation ? cosmeticItems.animations.find(a => a.id === stats.equippedItems.animation)?.effect : null}/>      <SlotMachineAnimationModal isOpen={isSlotAnimationOpen} onClose={() => setIsSlotAnimationOpen(false)} onAnimationComplete={handleSlotAnimationComplete} />
      <XpBarAnimation
        key={xpAnimationKey}
        xpGained={xpGainToShow}
        stats={stats}
        calculateLevelInfo={calculateLevelInfo}
        onAnimationComplete={() => {
          setXpGainToShow(0);
          setXpAnimationOriginEvent(null);
        }}
        onAudioReady={(primeFn) => { primeAudioRef.current = primeFn; }}
        originEvent={xpAnimationOriginEvent}
      />
      
      <nav className={`fixed top-0 left-0 h-full w-64 bg-slate-900 p-6 flex-shrink-0 flex flex-col shadow-2xl z-40 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Nav content is unchanged, but the parent nav tag is now responsive */}
        <ul className="space-y-2 flex-grow">
          {[
            { name: 'Dashboard', sheet: 'Stats + XP Tracker', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg> },
            { name: 'Assignments', sheet: 'Assignment Tracker', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg> },
            { name: 'Achievements', sheet: 'Achievements', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg> },
            { name: 'Sanctum', sheet: 'Sanctum', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 20a10 10 0 110-20 10 10 0 010 20zM9 4a1 1 0 112 0v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V7H8a1 1 0 010-2h1V4z" /></svg> },
            { name: 'Alchemist\'s Workshop', sheet: 'Alchemist\'s Workshop', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z" /><path d="M4 9a1 1 0 011-1 7 7 0 017 7 1 1 0 11-2 0 5 5 0 00-5-5 1 1 0 01-1-1z" /></svg>},
            { name: 'Calendar', sheet: 'Calendar View', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg> },
            { name: 'Dungeon Crawler', sheet: 'Dungeon Crawler', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M1.5 6.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-2zM6 11a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 4a1 1 0 100 2h4a1 1 0 100-2H7zM2 2.5a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h2a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5h-2zM2.5 14a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-2zM14 2.5a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h2a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5h-2zM13.5 14a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-2z" clipRule="evenodd"/></svg>},
            { name: 'Tower Defense', sheet: 'Tower Defense', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a1 1 0 011-1h8a1 1 0 011 1v2h1a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h1V3zm3 4a1 1 0 011-1h2a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" /></svg>},
            { name: 'Science Lab', sheet: 'Science Lab', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 2a.5.5 0 01.5.5V3h5V2.5a.5.5 0 011 0V3h1a2 2 0 012 2v1.5a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5V5a1 1 0 00-1-1H7a1 1 0 00-1 1v.5a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5V5a2 2 0 012-2h1V2.5A.5.5 0 017 2zM4.002 8.5a.5.5 0 01.498.5v7a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-7a.5.5 0 01.5-.5h1zM16 8.5a.5.5 0 01.5.5v7a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-7a.5.5 0 01.5-.5h1zM7 9a1 1 0 00-1 1v5a1 1 0 102 0v-5a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v5a1 1 0 102 0v-5a1 1 0 00-1-1z" clipRule="evenodd" /></svg>},
            { name: 'Study Zone', sheet: 'Study Zone', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L9 9.58v5.528l-3-1.286a1 1 0 00-1.212.86l-.5 2.5a1 1 0 00.97 1.245l5-1a1 1 0 00.484 0l5 1a1 1 0 00.97-1.245l-.5-2.5a1 1 0 00-1.212-.86l-3 1.286V9.58l6.406-2.658a1 1 0 000-1.84l-7-3zM9 4.399l5.223 2.155L10 8.517 4.777 6.554 9 4.399z" /></svg>},
          ].map((item) => (
            <li key={item.name}><button onClick={() => {setActiveSheet(item.sheet); if(isMobile) setIsSidebarOpen(false);}} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${activeSheet === item.sheet ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'}`}>{item.icon}<span>{item.name}</span></button></li>
          ))}
        </ul>

        <div className="border-t border-slate-700 mx-[-1.5rem] my-4"></div>
        <ul className="space-y-2">
            <li><button onClick={() => {setActiveSheet('Why'); if(isMobile) setIsSidebarOpen(false);}} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${activeSheet === 'Why' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg><span>Why I Built This</span></button></li>
        </ul>

        <div className={`pt-4 space-y-2 ${isMobile ? '' : 'mt-auto'}`}>
            <button onClick={() => {setActiveSheet('My Profile'); if(isMobile) setIsSidebarOpen(false);}} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-all duration-200 hover:translate-x-1">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl border-2 border-slate-600">{equippedAvatarDisplay}</div>
                <div className="flex-1 text-left"><p className="text-sm font-semibold text-white">My Profile</p><p className="text-xs text-slate-400 truncate">ID: {user?.uid}</p></div>
            </button>
            <button onClick={handleSignOut} className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-900/50 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg><span>Sign Out</span></button>
        </div>
      </nav>

      <main key={appKey} className="flex-grow p-4 md:p-8 overflow-auto w-full md:w-auto">
        {/* Hamburger Button */}
        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800/80 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        {activeSheet === 'Assignment Tracker' && <AssignmentTracker stats={stats} assignments={assignments.filter(a => a.status !== 'Completed')} isAddModalOpen={isAddModalOpen} setIsAddModalOpen={setIsAddModalOpen} addAssignmentToFirestore={addAssignmentToFirestore} updateAssignmentInFirestore={updateAssignmentInFirestore} deleteAssignmentFromFirestore={deleteAssignmentFromFirestore} handleCompletedToggle={handleCompletedToggle} promptMissionStart={promptMissionStart} isMobile={isMobile} updateStatsInFirestore={updateStatsInFirestore} />}               {activeSheet === 'Achievements' && <AchievementsComponent gameProgress={stats} />}
        {activeSheet === 'Stats + XP Tracker' && <StatsXPTracker stats={stats} assignments={assignments} completedAssignments={completedAssignments} handleRefresh={handleRefreshAllData} isRefreshing={isRefreshing} getProductivityPersona={getProductivityPersona} calculateLevelInfo={calculateLevelInfo} getStartOfWeek={getStartOfWeek} collectFirstEgg={collectFirstEgg} hatchEgg={hatchEgg} collectNewEgg={collectNewEgg} spinProductivitySlotMachine={spinProductivitySlotMachine} shouldPromptForTriage={shouldShowTriageBanner} onStartTriage={() => setTriageState({ isOpen: true, needsSetup: !stats.triageSettings })} onAcceptContract={handleAcceptContract} />}        {activeSheet === 'My Profile' && <MyProfile stats={stats} user={user} userId={user?.uid} updateStatsInFirestore={updateStatsInFirestore} handleEvolvePet={handleEvolvePet} getFullPetDetails={getFullPetDetails} getFullCosmeticDetails={getFullCosmeticDetails} getItemStyle={getItemStyle} db={db} appId={appId} showMessageBox={showMessageBox} actionLock={actionLock} processAchievement={processAchievement} calculateLevelInfo={calculateLevelInfo} />}
        {activeSheet === 'Sanctum' && <Sanctum stats={stats} completedAssignments={completedAssignments} updateStatsInFirestore={updateStatsInFirestore} showMessageBox={showMessageBox} getFullCosmeticDetails={getFullCosmeticDetails} getItemStyle={getItemStyle} processAchievement={processAchievement} />}

        {activeSheet === 'Why' && <WhyTab />}
        {activeSheet === 'Calendar View' && <CalendarView assignments={assignments}/>}
        {activeSheet === 'Dungeon Crawler' && <DungeonCrawler key={dungeonResetKey} stats={stats} updateStatsInFirestore={updateStatsInFirestore} showMessageBox={showMessageBox} getFullPetDetails={getFullPetDetails} onResetDungeon={resetDungeonGame} getFullCosmeticDetails={getFullCosmeticDetails} processAchievement={processAchievement} syncDungeonXp={newXp => { dungeonXpRef.current = newXp; }} isMobile={isMobile} addIngredientToInventory={addIngredientToInventory} />}
        {activeSheet === 'Tower Defense' && <TowerDefenseGame stats={stats} updateStatsInFirestore={updateStatsInFirestore} showMessageBox={showMessageBox} onResetGame={resetTowerDefenseGame} getFullCosmeticDetails={getFullCosmeticDetails} generatePath={generatePath} processAchievement={processAchievement} addIngredientToInventory={addIngredientToInventory} />}
        {activeSheet === 'Science Lab' && <ScienceLab stats={stats} userId={user?.uid} updateStatsInFirestore={updateStatsInFirestore} showMessageBox={showMessageBox} actionLock={actionLock} processAchievement={processAchievement} />}
        {activeSheet === 'Study Zone' && <StudyZone stats={stats} updateStatsInFirestore={updateStatsInFirestore} showMessageBox={showMessageBox} processAchievement={processAchievement} isMobile={isMobile} />}
        {activeSheet === "Alchemist's Workshop" && <AlchemistsWorkshop stats={stats} updateStatsInFirestore={updateStatsInFirestore} showMessageBox={showMessageBox} />}
      </main>
    </div>
    </>
  );
}

export default App;
