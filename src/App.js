//used libraries: React, Recharts, TailwindCSS, Firebase, Babel or similar, PostCSS
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc, onSnapshot, collection, query, where, getDocs, serverTimestamp, runTransaction } from 'firebase/firestore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Global variables provided by the Canvas environment
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// Initialize Firebase (only once)
let app;
let db;
let auth;

if (Object.keys(firebaseConfig).length > 0) {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
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
    { id: 'banner_gradient_blue', name: 'Blue Gradient', type: 'banner', style: 'bg-gradient-to-r from-blue-400 to-purple-500 text-white', rarity: 'rare', placeholder: 'https://th.bing.com/th/id/R.3e6aed2b8eb249ec7b4a25559df7a6e6?rik=qIS4fr0qtZHNrg&riu=http%3a%2f%2fgetwallpapers.com%2fwallpaper%2ffull%2f6%2fe%2fe%2f101557.jpg&ehk=98AjuwsmwgYC1gbZKC8Rd0WY%2bi0AHMINFBKwbXuMXMU%3d&risl=&pid=ImgRaw&r=0' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_confetti', name: 'Confetti Burst', type: 'banner', style: 'bg-yellow-200 text-gray-800', rarity: 'common', placeholder: 'https://tse1.mm.bing.net/th/id/OIP.3eHpbJthJIkcUFgEXWfb0QHaE4?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_geometric', name: 'Geometric Pattern', type: 'banner', style: 'bg-teal-200 text-gray-800', rarity: 'common', placeholder: 'https://wallpaperaccess.com/full/3223142.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_dark_forest', name: 'Dark Forest', type: 'banner', style: 'bg-green-800 text-white', rarity: 'rare', placeholder: 'https://tse4.mm.bing.net/th/id/OIP.-EJUaTZ_O73RH6LI7rYBcwAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_rainbow', name: 'Rainbow Glow', type: 'banner', style: 'bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 text-white', rarity: 'rare', placeholder: 'https://th.bing.com/th/id/OIP.hcBH5l3XrU1sXVp0b-jIgAHaEo?w=289&h=180&c=7&r=0&o=7&pid=1.7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_sunset', name: 'Sunset Hues', type: 'banner', style: 'bg-gradient-to-r from-orange-400 to-red-500 text-white', rarity: 'common', placeholder: 'https://th.bing.com/th/id/R.f0d7a60a2efd30f950b6d4f865c42fa3?rik=W2rmzfUrr7zarA&pid=ImgRaw&r=0&sres=1&sresct=1' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_ocean', name: 'Deep Ocean', type: 'banner', style: 'bg-gradient-to-r from-blue-700 to-cyan-500 text-white', rarity: 'rare', placeholder: 'https://th.bing.com/th/id/OIP.2A_RSlYMWxE289IuTWsDTgHaCt?w=330&h=127&c=7&r=0&o=7&pid=1.7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_galaxy', name: 'Stellar Galaxy', type: 'banner', style: 'bg-gradient-to-r from-gray-900 to-indigo-900 text-white', rarity: 'epic', placeholder: 'https://tse4.mm.bing.net/th/id/OIP.B9LC-h4DwC7HqGh5Glkf1AHaCx?r=0&rs=1&pid=ImgDetMain&o=7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_spring', name: 'Spring Blossom', type: 'banner', style: 'bg-pink-200 text-gray-800', rarity: 'common', placeholder: 'https://th.bing.com/th/id/OIP.qK_E2DAamuQBCbPhfwvIagHaCU?w=300&h=109&c=7&r=0&o=7&pid=1.7&rm=3' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_autumn', name: 'Autumn Leaves', type: 'banner', style: 'bg-orange-600 text-white', rarity: 'common', placeholder: 'https://th.bing.com/th/id/OIP.tcuASdYo4L4-v4qsl8jWDwHaDF?w=331&h=145&c=7&r=0&o=5&pid=1.7' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_winter', name: 'Winter Wonderland', type: 'banner', style: 'bg-blue-100 text-blue-800', rarity: 'rare', placeholder: 'https://png.pngtree.com/background/20210715/original/pngtree-winter-landscape-dreamy-banner-background-with-snowflakes-picture-image_1300439.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_lava', name: 'Volcanic Flow', type: 'banner', style: 'bg-gradient-to-r from-red-800 to-yellow-600 text-white', rarity: 'epic', placeholder: 'https://img.freepik.com/premium-photo/abstract-background-fire-volcanoes-lava-illustration-banner-design-showcasing-raw-energy-molten-lava-fire-volcanoes-against-captivating-background-generative-ai_198565-7386.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
    { id: 'banner_cyber', name: 'Cyber Grid', type: 'banner', style: 'bg-gray-800 text-green-400', rarity: 'rare', placeholder: 'https://static.vecteezy.com/system/resources/previews/013/446/271/large_2x/digital-technology-banner-green-blue-background-cyber-technology-circuit-abstract-binary-tech-innovation-future-data-internet-network-ai-big-data-futuristic-wifi-connection-illustration-vector.jpg' /*PLACEHOLD WORK IN PROCESS*/ },
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
// We add duplicates to influence how often they appear visually during the spin.
const slotMachineFillerItems = [
  ...allRollableItems,
  { id: 'filler_xp_gain_1', name: 'XP Gain', type: 'xp_gain', display: 'XP+', rarity: 'rare' },
  { id: 'filler_xp_gain_2', name: 'XP Gain', type: 'xp_gain', display: 'XP+', rarity: 'rare' },
  { id: 'filler_xp_loss_1', name: 'XP Loss', type: 'xp_loss', display: 'XP-', rarity: 'common' },
  { id: 'filler_xp_loss_2', name: 'XP Loss', type: 'xp_loss', display: 'XP-', rarity: 'common' },
  { id: 'filler_xp_loss_3', name: 'XP Loss', type: 'xp_loss', display: 'XP-', rarity: 'common' },
];

// Filter for rare items for the slot machine rare drop chance (rare, epic, legendary)
const rareCosmeticItems = allRollableItems.filter(item => item.rarity === 'rare' || item.rarity === 'epic' || item.rarity === 'legendary');
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
        { id: 'pet_owl_3', name: 'Oracle Owl', display: '🦉✨', xpBuff: 0.18, levelRequired: 40, xpCost: 400 }
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
  // Manual click power upgrade
  manual_clicker: { name: 'Manual Clicker', baseCost: 50, baseSPS: 0, clickPower: 1, xpUpgrade: { cost: 1000, multiplier: 2 } }
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
    onSubmit(newAssignment);
    setNewAssignment({ // Reset form
      class: '', assignment: '', dueDate: '', timeEstimate: '',
      pointsEarned: '', pointsMax: '',
      difficulty: 'Easy', status: 'To Do',
      recurrenceType: 'none', recurrenceEndDate: '',
      tags: [],
    });
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

          {/* Points Input */}
          <div className="md:col-span-2">
            <label className="block text-slate-400 text-sm font-bold mb-1">Points</label>
            <div className="flex space-x-2">
              <input
                type="number"
                name="pointsEarned"
                placeholder="Earned"
                value={newAssignment.pointsEarned}
                onChange={handleChange}
                className="p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 w-1/2"
              />
              <span className="self-center text-slate-400">/</span>
              <input
                type="number"
                name="pointsMax"
                placeholder="Max"
                value={newAssignment.pointsMax}
                onChange={handleChange}
                className="p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500 w-1/2"
              />
            </div>
          </div>

          {/* Difficulty and Status */}
          <div>
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

          {/* Recurrence Options */}
          <div className="md:col-span-2 border-t border-slate-700 pt-4 mt-4">
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
  }, [animationState]);

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
              <span key={i} className="absolute text-yellow-400 text-4xl opacity-0 animate-sparkle-effect"
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
                key={i}
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
              <div key={i} className="absolute animate-fireworks-effect"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  animationDelay: `${i * 0.7}s`
                }}>
                {Array.from({ length: 12 }).map((__, j) => (
                  <div key={j} className="absolute w-2 h-2 rounded-full bg-red-500 animate-firework-particle"
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
const Projectile = ({ from, to }) => {
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
    }, 10); // Delay allows CSS transition to trigger properly

    return () => clearTimeout(timer);
  }, [from, to]);

  return (
    <div
      className="projectile"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    />
  );
};
// Component for Dungeon Crawler Game
const DungeonCrawler = ({ stats, dungeonState, updateStatsInFirestore, showMessageBox, getFullPetDetails, onResetDungeon, getFullCosmeticDetails }) => {
  const dungeonDefinitions = {
    weapons: [
      { id: 'weapon_sword', name: 'Iron Sword', cost: 500, attack: 10 },
      { id: 'weapon_axe', name: 'Battle Axe', cost: 1000, attack: 25 },
      { id: 'weapon_flame', name: 'Flame Tongue', cost: 2000, attack: 45, skill: { id: 'burn', name: 'Burn', damage: 10, duration: 2 } },
      { id: 'weapon_void', name: 'Void Blade', cost: 5000, attack: 70, skill: { id: 'lifesteal', name: 'Lifesteal', percent: 0.1 } },
      { id: 'weapon_sunforged', name: 'Sunforged Blade', cost: 7500, attack: 100, tdWinsRequired: 5 },
      { id: 'weapon_stormbringer', name: 'Stormbringer Axe', cost: 12000, attack: 140, tdWinsRequired: 10 },
      { id: 'weapon_soulreaver', name: 'Soulreaver Scythe', cost: 20000, attack: 200, tdWinsRequired: 20 },
    ],
    armors: [
      { id: 'armor_leather', name: 'Leather Armor', cost: 500, hp: 50 },
      { id: 'armor_plate', name: 'Steel Plate', cost: 1000, hp: 120 },
      { id: 'armor_regen', name: 'Trollblood Mail', cost: 2000, hp: 200, skill: { id: 'regen', name: 'Regen', amount: 10 } },
      { id: 'armor_aegis', name: 'Aegis of the Immortal', cost: 5000, hp: 350, skill: { id: 'block', name: 'Block', chance: 0.15 } },
      { id: 'armor_dragonscale', name: 'Dragonscale Mail', cost: 7500, hp: 500, tdWinsRequired: 5 },
      { id: 'armor_bulwark', name: 'Bulwark of the Ancients', cost: 12000, hp: 800, tdWinsRequired: 10 },
      { id: 'armor_godplate', name: 'Plate of the God-King', cost: 20000, hp: 1300, tdWinsRequired: 20 },
    ],
    attacks: [
      { id: 'attack_normal', name: 'Normal Attack', xpCost: 50, power: 10 },
      { id: 'attack_heavy', name: 'Heavy Slam', cost: 3000, xpCost: 50, power: 25, effect: 'stun', effectChance: 0.2 },
      { id: 'attack_fire', name: 'Fire Blast', cost: 6000, xpCost: 70, power: 35, effect: 'burn', dot: 15, duration: 3 },
    ],
  };

  // This wrapper function correctly handles state updates and prevents sending functions to Firestore.
  const setDungeonState = (updater) => {
    const newDungeonState = typeof updater === 'function' ? updater(dungeonState) : updater;
    updateStatsInFirestore({ dungeon_state: newDungeonState });
  };

  const getFullPlayerStats = useMemo(() => {
    if (!dungeonState) return { maxHp: 100, attack: 10 };
    const weapon = dungeonDefinitions.weapons.find(w => w.id === dungeonState.equippedWeapon);
    const armor = dungeonDefinitions.armors.find(a => a.id === dungeonState.equippedArmor);
    const pet = stats.currentPet ? getFullPetDetails(stats.currentPet.id) : null;
    const baseAttack = 10;
    const maxHp = 100 + (armor?.hp || 0) + (dungeonState.boughtStats?.hp || 0);
    const attack = baseAttack + (weapon?.attack || 0) + (pet?.xpBuff * 50 || 0) + (dungeonState.boughtStats?.attack || 0);
    return { maxHp, attack };
  }, [dungeonState, stats.currentPet, getFullPetDetails]);

  // This effect synchronizes the derived player stats (maxHp, attack) with the player state.
  useEffect(() => {
    if (!dungeonState) return;
    const fullStats = getFullPlayerStats;
    const { player } = dungeonState;
    if (player.maxHp !== fullStats.maxHp || player.attack !== fullStats.attack) {
      setDungeonState(prevState => {
        const hpGained = fullStats.maxHp - (prevState.player.maxHp || 100);
        return {
          ...prevState,
          player: {
            ...prevState.player,
            maxHp: fullStats.maxHp,
            attack: fullStats.attack,
            hp: Math.min(fullStats.maxHp, prevState.player.hp + hpGained),
          }
        };
      });
    }
  }, [dungeonState?.equippedWeapon, dungeonState?.equippedArmor, dungeonState?.boughtStats, stats.currentPet, getFullPlayerStats]);

  if (!dungeonState) {
    return <div className="text-center p-10 text-xl text-slate-400">Loading Dungeon...</div>;
  }

  const addLog = (message, style = 'text-slate-300') => {
    setDungeonState(prevState => ({
      ...prevState,
      log: [{ message, style }, ...(prevState.log || []).slice(0, 4)]
    }));
  };

  const handleGameOver = () => {
    setDungeonState(prevState => ({
      ...prevState,
      gameOver: true,
      log: [{ message: "You have been defeated! Your adventure ends here.", style: 'text-red-500 font-bold' }, ...(prevState.log || []).slice(0, 4)]
    }));
  };
  
  const generateFloor = (floorNum) => {
    const size = 10;
    let newBoard = {};
    let newEnemies = [];
    for (let y = 0; y < size; y++) { for (let x = 0; x < size; x++) { newBoard[`${y},${x}`] = { type: 'empty', visited: false }; } }
    for (let i = 0; i < 15; i++) {
        const x = Math.floor(Math.random() * size);
        const y = Math.floor(Math.random() * size);
        if((x !== 1 || y !== 1)) newBoard[`${y},${x}`] = { type: 'wall' };
    }
    const enemyCount = 3 + Math.floor(floorNum / 2);
    const enemyTypes = [{name: 'Goblin', display: '👹', hp: 20, atk: 5}, {name: 'Skeleton', display: '💀', hp: 35, atk: 8}];
    for (let i = 0; i < enemyCount; i++) {
        let x, y;
        do { x = Math.floor(Math.random() * size); y = Math.floor(Math.random() * size); } while (newBoard[`${y},${x}`].type !== 'empty');
        const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        const floorMultiplier = 1 + (Math.floor(floorNum / 3) * 0.5);
        newEnemies.push({ id: `enemy_${i}`, ...type, x, y, hp: Math.round(type.hp * floorMultiplier), maxHp: Math.round(type.hp * floorMultiplier), atk: Math.round(type.atk * floorMultiplier) });
        newBoard[`${y},${x}`] = { type: 'enemy', enemyId: `enemy_${i}`};
    }
    let kx, ky;
    do { kx = Math.floor(Math.random() * size); ky = Math.floor(Math.random() * size); } while (newBoard[`${ky},${kx}`].type !== 'empty');
    const floorMultiplier = 1 + (Math.floor(floorNum / 3) * 0.5);
    newEnemies.push({ id: 'keyholder', name: 'Keyholder Orc', display: '덩', hp: 50 * floorMultiplier, maxHp: 50 * floorMultiplier, atk: 12 * floorMultiplier, isKeyholder: true, x: kx, y: ky });
    newBoard[`${ky},${kx}`] = { type: 'enemy', enemyId: 'keyholder' };
    let hx, hy;
    do { hx = Math.floor(Math.random() * size); hy = Math.floor(Math.random() * size); } while (newBoard[`${hy},${hx}`].type !== 'empty' || (hx === 1 && hy === 1));
    newBoard[`${hy},${hx}`] = { type: 'hatch' };
    newBoard['1,1'] = {type: 'player', visited: true};
    return { newBoard, newEnemies };
  };

  const handleTileClick = (x, y) => {
    if (dungeonState.gameOver) return;
    const dx = Math.abs(x - dungeonState.player.x);
    const dy = Math.abs(y - dungeonState.player.y);
    if (dx > 1 || dy > 1 || (dx === 1 && dy === 1)) { addLog("You can only move to adjacent tiles."); return; }
    const targetTile = dungeonState.board[`${y},${x}`];
    if (targetTile.type === 'wall') { addLog("You can't move through a wall."); return; }
    if(stats.totalXP < 5) { addLog("Not enough XP to move.", 'text-red-400'); return; }
    
    const newBoard = { ...dungeonState.board };
    newBoard[`${dungeonState.player.y},${dungeonState.player.x}`] = { type: 'empty', visited: true };
    newBoard[`${y},${x}`] = { type: 'player', visited: true };
    
    let playerHp = dungeonState.player.hp;
    const newLogMessages = [];
    dungeonState.enemies.forEach(enemy => {
        if(Math.hypot(enemy.x - x, enemy.y - y) < 1.5) {
            playerHp -= enemy.atk; 
            newLogMessages.push({ message: `The ${enemy.name} hit you for ${enemy.atk} damage.`, style: 'text-slate-300' });
        }
    });

    if(playerHp <= 0) { handleGameOver(); return; }

    let newState = {
        ...dungeonState,
        player: { ...dungeonState.player, x, y, hp: playerHp },
        board: newBoard,
        log: [...newLogMessages, ...(dungeonState.log || [])].slice(0, 5)
    };

    if (targetTile.type === 'hatch') {
        if(dungeonState.player.hasKey) {
            goToNextFloor(); return;
        } else {
            newState.log = [{ message: "The hatch is locked. You need a key.", style: 'text-yellow-400' }, ...newState.log].slice(0,5);
        }
    }
    
    updateStatsInFirestore({
        totalXP: stats.totalXP - 5,
        dungeon_state: newState
    });
  };

  const goToNextFloor = () => {
    const nextFloor = dungeonState.floor + 1;
    const { newBoard, newEnemies } = generateFloor(nextFloor);
    const fullStats = getFullPlayerStats;
    
    updateStatsInFirestore({
        dungeon_floor: Math.max(stats.dungeon_floor || 1, nextFloor),
        dungeon_state: {
            ...dungeonState,
            floor: nextFloor,
            board: newBoard,
            enemies: newEnemies,
            player: { ...dungeonState.player, x: 1, y: 1, hp: fullStats.maxHp, hasKey: false },
            log: [{ message: `You descended to floor ${nextFloor}. Your health is restored.`, style: 'text-slate-300' }]
        }
    });
  };

  const handleAttack = (attackId) => {
      if(dungeonState.gameOver) return;
      const attackDef = dungeonDefinitions.attacks.find(a => a.id === attackId) || {name: 'Attack', xpCost: 20, power: 10};
      if(stats.totalXP < attackDef.xpCost) { addLog(`Not enough XP to use ${attackDef.name}.`, 'text-red-400'); return; }
      const targetEnemy = dungeonState.enemies.find(e => Math.hypot(e.x - dungeonState.player.x, e.y - dungeonState.player.y) < 1.5);
      if(!targetEnemy) { addLog("No enemy in range to attack."); return; }
      
      let newEnemies = JSON.parse(JSON.stringify(dungeonState.enemies));
      let newLog = [];
      let playerHasKey = dungeonState.player.hasKey;
      let newBoard = { ...dungeonState.board };
      let newPlayerHp = dungeonState.player.hp;
      let isGameOver = dungeonState.gameOver;

      // Player attacks enemy
      const totalAttackPower = dungeonState.player.attack + attackDef.power;
      const enemyIndex = newEnemies.findIndex(e => e.id === targetEnemy.id);
      newEnemies[enemyIndex].hp -= totalAttackPower;
      newLog.push({ message: `You hit the ${targetEnemy.name} for ${totalAttackPower} damage.`, style: 'text-slate-300' });

      // Check if enemy is defeated
      if (newEnemies[enemyIndex].hp <= 0) {
          newLog.push({ message: `You defeated the ${targetEnemy.name}!`, style: 'text-green-400' });
          if (newEnemies[enemyIndex].isKeyholder) { 
              newLog.push({ message: `You found a key!`, style: 'text-yellow-400 font-bold' });
              playerHasKey = true; 
          }
          newBoard[`${targetEnemy.y},${targetEnemy.x}`] = { type: 'empty', visited: true };
          newEnemies.splice(enemyIndex, 1);
      } else {
          // If enemy is not defeated, it retaliates for half damage
          const counterDamage = Math.max(1, Math.round(targetEnemy.atk / 2));
          newPlayerHp -= counterDamage;
          newLog.push({ message: `The ${targetEnemy.name} retaliates for ${counterDamage} damage.`, style: 'text-orange-400' });
          
          if (newPlayerHp <= 0) {
              newPlayerHp = 0;
              isGameOver = true;
              newLog.push({ message: "You have been defeated!", style: 'text-red-500 font-bold' });
          }
      }
      
      updateStatsInFirestore({
          totalXP: stats.totalXP - attackDef.xpCost,
          dungeon_state: {
              ...dungeonState,
              board: newBoard,
              enemies: newEnemies,
              player: {...dungeonState.player, hp: newPlayerHp, hasKey: playerHasKey},
              log: [...newLog, ...(dungeonState.log || [])].slice(0, 5),
              gameOver: isGameOver,
          }
      });
  };

  // FIX: All shop functions now perform a single atomic update to Firestore.
  const handleBuyItem = (item, type) => {
      if(stats.totalXP < item.cost) { showMessageBox("Not enough XP!", 'error'); return; }
      
      const newDungeonState = { ...dungeonState };
      switch(type) {
          case 'weapon': newDungeonState.ownedWeapons.push(item.id); newDungeonState.equippedWeapon = item.id; break;
          case 'armor': newDungeonState.ownedArmor.push(item.id); newDungeonState.equippedArmor = item.id; break;
          case 'attack': newDungeonState.ownedAttacks.push(item.id); break;
      }
      
      updateStatsInFirestore({
          totalXP: stats.totalXP - item.cost,
          dungeon_state: newDungeonState
      });
      showMessageBox(`You bought ${item.name}!`, 'info');
  };
  
  const handleBuyStat = (stat) => {
      if(stats.totalXP < 300) { showMessageBox("Not enough XP!", 'error'); return; }
      const newDungeonState = {...dungeonState, boughtStats: {...dungeonState.boughtStats, [stat]: (dungeonState.boughtStats[stat] || 0) + 10}};
      updateStatsInFirestore({
          totalXP: stats.totalXP - 300,
          dungeon_state: newDungeonState
      });
      showMessageBox(`You bought +10 ${stat}!`, 'info');
  };

  const handleBuyPotion = () => {
    if(stats.totalXP < 100) { showMessageBox("Not enough XP to buy a potion.", "error"); return; }
    const newDungeonState = {...dungeonState, potions: dungeonState.potions + 1};
    updateStatsInFirestore({
        totalXP: stats.totalXP - 100,
        dungeon_state: newDungeonState
    });
    showMessageBox("You bought a potion!", "info");
  };

  // FIX: This now performs a single atomic update for both potion count and player health.
  const usePotion = () => {
      if(dungeonState.potions <= 0) { addLog("You have no potions.", 'text-yellow-400'); return; }
      
      const newDungeonState = {
          ...dungeonState,
          potions: dungeonState.potions - 1,
          player: {
              ...dungeonState.player,
              hp: Math.min(dungeonState.player.maxHp, dungeonState.player.hp + 50)
          },
          log: [{ message: "You used a potion and restored 50 HP.", style: 'text-green-400' }, ...(dungeonState.log || []).slice(0, 4)]
      };
      
      setDungeonState(newDungeonState);
  };

  const renderBoard = () => {
    const size = 10;
    const boardGrid = [];
    for (let y = 0; y < size; y++) {
      const row = [];
      for (let x = 0; x < size; x++) {
        const tile = dungeonState.board[`${y},${x}`] || { type: 'empty' };
        let display = null;
        if(tile.type === 'player') {
            const playerSkinId = stats.equippedItems?.dungeonEmojis?.player;
            if (playerSkinId) {
                const skin = getFullCosmeticDetails(playerSkinId, 'dungeon_emojis');
                display = skin ? skin.display : '🧍';
            } else {
                display = '🧍';
            }
        }
        else if(tile.type === 'wall') display = '🧱';
        else if(tile.type === 'hatch') display = dungeonState.player.hasKey ? '🔑' : '🚪';
        else if(tile.type === 'enemy') {
            const enemy = dungeonState.enemies.find(e => e.id === tile.enemyId);
            if (enemy) {
                let enemyBaseType = '';
                if (enemy.name.toLowerCase().includes('goblin')) enemyBaseType = 'goblin';
                if (enemy.name.toLowerCase().includes('skeleton')) enemyBaseType = 'skeleton';
                
                const enemySkinId = stats.equippedItems?.dungeonEmojis?.[enemyBaseType];
                if (enemySkinId) {
                    const skin = getFullCosmeticDetails(enemySkinId, 'dungeon_emojis');
                    display = skin ? skin.display : enemy.display;
                } else {
                    display = enemy.display;
                }
            }
        }

        row.push(
          <div key={`${x}-${y}`} onClick={() => handleTileClick(x, y)} className={`w-12 h-12 border border-slate-700 flex items-center justify-center text-2xl ${tile.visited ? 'bg-slate-800/60' : 'bg-slate-800/20'} cursor-pointer hover:bg-slate-700/80`}>
            {display}
          </div>
        );
      }
      boardGrid.push(<div key={y} className="flex">{row}</div>);
    }
    return boardGrid;
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div><h2 className="text-3xl font-bold text-white">Dungeon Crawler</h2><p className="text-slate-400">Floor: {dungeonState.floor} | Highest Floor: {stats.dungeon_floor || 1}</p></div>
        <div className="flex space-x-4">
            <button onClick={() => setDungeonState({...dungeonState, shopOpen: !dungeonState.shopOpen})} className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700">{dungeonState.shopOpen ? 'Close Shop' : 'Open Shop'}</button>
            <button onClick={onResetDungeon} className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700">Reset Dungeon</button>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-grow">
          <div className="p-2 bg-slate-900/50 border border-slate-700 rounded-lg inline-block">
            {renderBoard()}
          </div>
        </div>
        <div className="w-full lg:w-96 flex-shrink-0">
          <div className="bg-slate-800/50 p-4 rounded-xl mb-4">
            <h3 className="font-bold text-white">Player Stats</h3>
            <p>HP: <span className="text-red-400 font-bold">{dungeonState.player.hp} / {dungeonState.player.maxHp}</span></p>
            <div className="w-full bg-slate-700 rounded-full h-2.5 mt-1"><div className="bg-red-600 h-2.5 rounded-full" style={{ width: `${(dungeonState.player.hp / dungeonState.player.maxHp) * 100}%` }}></div></div>
            <p>Attack: <span className="text-yellow-400 font-bold">{dungeonState.player.attack}</span> | XP: <span className="text-blue-400 font-bold">{stats.totalXP}</span></p>
            <p>Pet: <span className="font-semibold">{stats.currentPet?.name || 'None'}</span> {dungeonState.player.hasKey && <span className="text-yellow-300 font-bold ml-4">🔑 Key</span>}</p>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl mb-4">
            <h3 className="font-bold text-white mb-2">Actions</h3>
            <div className="grid grid-cols-2 gap-2">
                {dungeonState.ownedAttacks.map(attkId => {
                    const attk = dungeonDefinitions.attacks.find(a => a.id === attkId) || {name: 'Attack', xpCost: 20};
                    return <button key={attkId} onClick={() => handleAttack(attkId)} className="bg-red-600 text-white p-2 rounded hover:bg-red-700">{attk.name} ({attk.xpCost} XP)</button>
                })}
                <button onClick={usePotion} className="bg-green-600 text-white p-2 rounded hover:bg-green-700">Use Potion ({dungeonState.potions})</button>
            </div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl">
              <h3 className="font-bold text-white mb-2">Game Log</h3>
              <div className="space-y-1 text-sm">
                  {(dungeonState.log || []).map((entry, i) => <p key={i} className={entry.style}>{entry.message}</p>)}
              </div>
          </div>
        </div>
      </div>
      {dungeonState.gameOver && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
              <div className="bg-slate-800 p-8 rounded-lg text-center border border-red-500">
                  <h2 className="text-3xl font-bold text-red-400 mb-4">Game Over!</h2>
                  <p className="text-slate-300 mb-6">You were defeated on floor {dungeonState.floor}.</p>
                  <button onClick={onResetDungeon} className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">Play Again</button>
              </div>
          </div>
      )}
      {dungeonState.shopOpen && (
          <div className="mt-6">
              <h3 className="text-2xl font-bold text-white mb-4">Dungeon Shop</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-slate-800/80 p-4 rounded-lg">
                      <h4 className="font-bold mb-2 text-white">General</h4>
                      <button onClick={() => handleBuyStat('hp')} disabled={stats.totalXP < 300} className="w-full bg-indigo-600 p-2 rounded mb-2 hover:bg-indigo-700 disabled:bg-slate-600/50 disabled:cursor-not-allowed">Buy +10 HP (300 XP)</button>
                      <button onClick={() => handleBuyStat('attack')} disabled={stats.totalXP < 300} className="w-full bg-indigo-600 p-2 rounded mb-2 hover:bg-indigo-700 disabled:bg-slate-600/50 disabled:cursor-not-allowed">Buy +10 Attack (300 XP)</button>
                      <button onClick={handleBuyPotion} disabled={stats.totalXP < 100} className="w-full bg-indigo-600 p-2 rounded hover:bg-indigo-700 disabled:bg-slate-600/50 disabled:cursor-not-allowed">Buy Potion (100 XP)</button>
                  </div>
                   <div className="bg-slate-800/80 p-4 rounded-lg">
                      <h4 className="font-bold mb-2 text-white">Weapons & Armor</h4>
                      {dungeonDefinitions.weapons.map(w => {
                          const isOwned = dungeonState.ownedWeapons.includes(w.id);
                          const canAfford = stats.totalXP >= w.cost;
                          const meetsRequirement = !w.tdWinsRequired || (stats.td_wins || 0) >= w.tdWinsRequired;
                          const isLocked = !meetsRequirement;
                          return (
                            <button 
                              key={w.id} 
                              onClick={() => handleBuyItem(w, 'weapon')} 
                              disabled={isOwned || !canAfford || isLocked} 
                              className={`w-full p-2 rounded mb-2 font-semibold transition-colors text-center ${
                                isLocked 
                                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                  : isOwned 
                                  ? 'bg-green-800/60 text-green-400 cursor-default' 
                                  : canAfford 
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              {isLocked ? `Requires ${w.tdWinsRequired} TD Wins` : isOwned ? 'Owned' : `${w.name} (${w.cost} XP)`}
                            </button>
                          );
                      })}
                      {dungeonDefinitions.armors.map(a => {
                          const isOwned = dungeonState.ownedArmor.includes(a.id);
                          const canAfford = stats.totalXP >= a.cost;
                          const meetsRequirement = !a.tdWinsRequired || (stats.td_wins || 0) >= a.tdWinsRequired;
                          const isLocked = !meetsRequirement;
                          return (
                            <button 
                              key={a.id} 
                              onClick={() => handleBuyItem(a, 'armor')} 
                              disabled={isOwned || !canAfford || isLocked} 
                              className={`w-full p-2 rounded mb-2 font-semibold transition-colors text-center ${
                                isLocked
                                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                  : isOwned 
                                  ? 'bg-green-800/60 text-green-400 cursor-default' 
                                  : canAfford 
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              {isLocked ? `Requires ${a.tdWinsRequired} TD Wins` : isOwned ? 'Owned' : `${a.name} (${a.cost} XP)`}
                            </button>
                          );
                      })}
                  </div>
                  <div className="bg-slate-800/80 p-4 rounded-lg">
                      <h4 className="font-bold mb-2 text-white">Skills</h4>
                      {dungeonDefinitions.attacks.filter(a => a.id !== 'attack_normal').map(a => {
                          const isOwned = dungeonState.ownedAttacks.includes(a.id);
                          const canAfford = stats.totalXP >= a.cost;
                          return (
                            <button 
                              key={a.id} 
                              onClick={() => handleBuyItem(a, 'attack')} 
                              disabled={isOwned || !canAfford} 
                              className={`w-full p-2 rounded mb-2 font-semibold transition-colors ${
                                isOwned 
                                  ? 'bg-green-800/60 text-green-400 cursor-default' 
                                  : canAfford 
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
                                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              {isOwned ? 'Owned' : `${a.name} (${a.cost} XP)`}
                            </button>
                          );
                      })}
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
// Component for Science Lab Idle Clicker
const ScienceLab = ({ stats, updateStatsInFirestore, showMessageBox }) => {
  // Use a local state for science points to allow for smooth UI updates every second,
  // without constantly writing to Firestore.
  const [localSciencePoints, setLocalSciencePoints] = useState(stats.sciencePoints || 0);
  
  // A ref to hold the calculated Science Per Second (SPS)
  const sciencePerSecond = useRef(0);

  // Function to format large numbers for display
  const formatNumber = (num) => {
    if (num < 1000) return num.toFixed(1);
    if (num < 1000000) return `${(num / 1000).toFixed(2)}K`;
    if (num < 1000000000) return `${(num / 1000000).toFixed(2)}M`;
    return `${(num / 1000000000).toFixed(2)}B`;
  };

  // Memoized calculation for total SPS and Click Power
  const { totalSPS, totalClickPower } = useMemo(() => {
    let sps = 0;
    let clickPower = 0;
    for (const key in stats.labEquipment) {
      const definition = labEquipmentDefinitions[key];
      const count = stats.labEquipment[key] || 0;
      if (count > 0) {
        let itemSPS = definition.baseSPS;
        let itemClickPower = definition.clickPower;
        // Apply XP upgrade multiplier if purchased
        if (stats.labXpUpgrades && stats.labXpUpgrades[key]) {
          itemSPS *= definition.xpUpgrade.multiplier;
          itemClickPower *= definition.xpUpgrade.multiplier;
        }
        sps += itemSPS * count;
        clickPower += itemClickPower * count;
      }
    }
    sciencePerSecond.current = sps; // Update ref for use in intervals
    return { totalSPS: sps, totalClickPower: clickPower };
  }, [stats.labEquipment, stats.labXpUpgrades]);

  // Main Game Loop: Handles real-time point generation
  useEffect(() => {
    const gameLoop = setInterval(() => {
      setLocalSciencePoints(prev => prev + sciencePerSecond.current);
    }, 1000); // Generate points every second

    return () => clearInterval(gameLoop);
  }, []); // Runs only once on component mount

  // Persistence Loop: Saves progress to Firebase every 5 minutes
  useEffect(() => {
    const persistenceLoop = setInterval(() => {
      updateStatsInFirestore({
        sciencePoints: localSciencePoints,
        lastLogin: serverTimestamp(),
      });
    }, 300000); // 300,000 ms = 5 minutes

    return () => clearInterval(persistenceLoop);
  }, [localSciencePoints, updateStatsInFirestore]);
  
  // Offline Progress Calculation: Runs once when the component first loads
  useEffect(() => {
    let isMounted = true;
    const calculateOfflineProgress = async () => {
      if (stats.lastLogin) {
        const lastLoginTime = stats.lastLogin.toDate();
        const currentTime = new Date();
        const timeDifferenceSeconds = Math.round((currentTime - lastLoginTime) / 1000);

        if (timeDifferenceSeconds > 10) { // Only calculate if offline for more than 10 seconds
          const offlineSPS = sciencePerSecond.current;
          const pointsEarned = timeDifferenceSeconds * offlineSPS;
          
          if (pointsEarned > 0 && isMounted) {
            setLocalSciencePoints(prev => prev + pointsEarned);
            showMessageBox(`Welcome back! You earned ${formatNumber(pointsEarned)} Science Points while you were away.`, 'info', 5000);
          }
        }
      }
      // Set the new "last login" time immediately
      updateStatsInFirestore({ lastLogin: serverTimestamp() });
    };
    
    calculateOfflineProgress();

    return () => { isMounted = false; };
  }, []); // Empty dependency array ensures this runs only ONCE

  // Handler for manual clicks
  const handleManualClick = () => {
    setLocalSciencePoints(prev => prev + totalClickPower);
  };
  
  // Handler for buying equipment
  const handleBuyEquipment = (key) => {
    const definition = labEquipmentDefinitions[key];
    const currentCount = stats.labEquipment[key] || 0;
    const cost = definition.baseCost * Math.pow(1.15, currentCount);

    if (localSciencePoints >= cost) {
      const newSciencePoints = localSciencePoints - cost;
      setLocalSciencePoints(newSciencePoints);
      
      const newEquipmentStats = { ...stats.labEquipment, [key]: currentCount + 1 };
      
      updateStatsInFirestore({
        sciencePoints: newSciencePoints,
        labEquipment: newEquipmentStats
      });
    }
  };
  
  // Handler for buying XP upgrades
  const handleBuyXpUpgrade = (key) => {
    const definition = labEquipmentDefinitions[key];
    if (stats.totalXP >= definition.xpUpgrade.cost && !(stats.labXpUpgrades && stats.labXpUpgrades[key])) {
      const newXpUpgrades = { ...(stats.labXpUpgrades || {}), [key]: true };
      updateStatsInFirestore({
        totalXP: stats.totalXP - definition.xpUpgrade.cost,
        labXpUpgrades: newXpUpgrades
      });
      showMessageBox(`${definition.name} production has been doubled!`, 'info');
    }
  };

  // Handler for buying cosmetics from the Science Shop
  const handleBuyCosmetic = (item) => {
     if (localSciencePoints >= item.cost && !stats.ownedItems.includes(item.id)) {
        const newSciencePoints = localSciencePoints - item.cost;
        setLocalSciencePoints(newSciencePoints);
        
        const newOwnedItems = [...stats.ownedItems, item.id];
        
        updateStatsInFirestore({
            sciencePoints: newSciencePoints,
            ownedItems: newOwnedItems
        });
        showMessageBox(`Unlocked the cosmetic: ${item.name}!`, 'info');
     }
  };
  
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
        {/* Left Column: Clicker & Stats */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-slate-800/50 p-6 rounded-2xl shadow-xl text-center">
             <h3 className="text-slate-400 text-lg">Science Points</h3>
             <p className="text-5xl font-bold text-cyan-400 my-2">{formatNumber(localSciencePoints)}</p>
             <p className="text-green-400 font-semibold">{formatNumber(totalSPS)} per second</p>
          </div>
          <div 
             onClick={handleManualClick}
             className="bg-slate-800/50 p-6 rounded-2xl shadow-xl text-center flex-grow flex flex-col justify-center items-center cursor-pointer hover:bg-slate-800/80 transition-colors"
          >
             <div className="text-8xl animate-pulse">🧪</div>
             <p className="mt-4 text-xl font-bold text-white">Click to Generate</p>
             <p className="text-cyan-300">+{formatNumber(totalClickPower)} points per click</p>
          </div>
        </div>

        {/* Right Column: Upgrades & Shop */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="bg-slate-800/50 p-6 rounded-2xl shadow-xl">
               <h3 className="text-xl font-semibold text-white mb-4">Lab Equipment</h3>
               <div className="space-y-3">
                 {Object.entries(labEquipmentDefinitions).map(([key, item]) => {
                    const currentCount = stats.labEquipment[key] || 0;
                    const cost = item.baseCost * Math.pow(1.15, currentCount);
                    const isXpUpgraded = stats.labXpUpgrades && stats.labXpUpgrades[key];

                    return (
                        <div key={key} className="bg-slate-800/70 p-3 rounded-lg flex items-center justify-between gap-4">
                            <div className="flex-1">
                                <h4 className="font-bold text-white">{item.name} <span className="text-sm text-slate-400">(Owned: {currentCount})</span></h4>
                                <p className="text-xs text-cyan-400">
                                    {item.baseSPS > 0 && `+${formatNumber(item.baseSPS * (isXpUpgraded ? 2 : 1))} SPS each`}
                                    {item.clickPower > 0 && `+${formatNumber(item.clickPower * (isXpUpgraded ? 2 : 1))} Click Power each`}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isXpUpgraded && (
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
            <div className="bg-slate-800/50 p-6 rounded-2xl shadow-xl">
                <h3 className="text-xl font-semibold text-white mb-4">Science Point Shop</h3>
                <div className="space-y-3">
                    {scienceShopItems.map(item => {
                        const isOwned = stats.ownedItems.includes(item.id);
                        return (
                             <div key={item.id} className="bg-slate-800/70 p-3 rounded-lg flex items-center justify-between gap-4">
                                <div>
                                    <h4 className="font-bold text-white flex items-center gap-2">
                                      <span className="text-2xl">{item.display}</span>{item.name}
                                    </h4>
                                    <p className="text-xs text-slate-400 capitalize">{item.rarity} {item.type}</p>
                                </div>
                                <button onClick={() => handleBuyCosmetic(item)} disabled={isOwned || localSciencePoints < item.cost} className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:bg-green-800 disabled:cursor-not-allowed w-48">
                                    {isOwned ? 'Owned' : `Buy: ${formatNumber(item.cost)} SP`}
                                </button>
                             </div>
                        );
                    })}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
const TowerDefenseGame = ({ stats, updateStatsInFirestore, showMessageBox, onResetGame, updateTowerDefenseState, getFullCosmeticDetails }) => {
  // Local state for non-persistent UI elements
  const [localState, setLocalState] = useState({
    selectedTile: null,
    selectedTower: null,
    projectiles: [],
    shopOpen: false,
    waveInProgress: false,
    enemies: [],
    // FIX: Add towers to local state. This is crucial for correctly tracking
    // the 'lastAttack' timestamp for each tower during a wave.
    towers: [],
  });

  // Derived state from props for easier access
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
  } = stats;

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
    
    const newTowers = td_towers.map(t => {
      if (t.id !== towerId) {
        return t; 
      }
      return {
        ...t,
        ...upgrade.effect
      };
    });

    const newTowerUpgrades = { ...td_towerUpgrades, [towerId]: [...(td_towerUpgrades[towerId] || []), upgrade.id] };

    updateStatsInFirestore({
        totalXP: stats.totalXP - upgrade.cost,
        td_towers: newTowers,
        td_towerUpgrades: newTowerUpgrades,
    });
    
    showMessageBox(`Upgraded tower with ${upgrade.name}!`, "info");
  };

  // FIX: Rebalanced attack speeds for better gameplay and corrected the Dragon's speed.
  const towerTypes = {
    free: [
      { id: 'archer', name: 'Archer', cost: 100, damage: 3, range: 5, attackSpeed: 1 }, // 1 attack/sec
      { id: 'cannon', name: 'Cannon', cost: 200, damage: 5, range: 4, attackSpeed: 0.5 }, // 1 attack/2 sec
      { id: 'icemage', name: 'Ice Mage', cost: 500, damage: 2, range: 5, attackSpeed: 1, slow: 0.5 }, // 1 attack/sec
      { id: 'barracks', name: 'Barracks', cost: 800, damage: 0, range: 0, attackSpeed: 0, spawnRate: 5 },
      { id: 'ballista', name: 'Ballista', cost: 1000, damage: 10, range: 6, attackSpeed: 0.3 }, // 1 attack/3.3 sec
    ],
    unlockable: [
            { id: 'fire', name: 'Fire Tower', cost: 800, damage: 7, range: 6, attackSpeed: 1.2, dot: 1 }, // 1.2 attacks/sec
      { id: 'tesla', name: 'Tesla', cost: 900, damage: 7, range: 6, attackSpeed: 1.5, chain: 3 }, // 1.5 attacks/sec
      { id: 'poison', name: 'Poison Tower', cost: 1000, damage: 2, range: 5, attackSpeed: 1.2, poison: 10 }, // 1.2 attacks/sec
      { id: 'sniper', name: 'Sniper', cost: 1500, damage: 20, range: 8, attackSpeed: 0.2 }, // 1 attack/5 sec
      { id: 'dragon', name: 'Dragon', cost: 2000, damage: 0.5, range: 6, attackSpeed: 50, aoe: 2 }, // 1 attack/2.5 sec (damage buffed to compensate)
    ],
    dungeon_unlockable: [ // NEW TOWER CATEGORY
        { id: 'dungeoncannon', name: 'Dungeon Cannon', cost: 1500, damage: 25, range: 5, attackSpeed: 0.4, floorRequired: 10, aoe: 1.0 }, // A stronger cannon
        { id: 'crystalspire', name: 'Crystal Spire', cost: 2200, damage: 40, range: 7, attackSpeed: 0.2, floorRequired: 20 }, // A stronger sniper
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
      { id: 'ogre', name: 'Ogre', health: 100, speed: 0.08 },
      { id: 'siege_engine', name: 'Siege Engine', health: 150, speed: 0.01 },
      { id: 'necromancer', name: 'Necromancer', health: 80, speed: 0.2, spawn: 2 },
      { id: 'dragon', name: 'Dragon', health: 200, speed: 0.08, flying: true },
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
    if (localState.waveInProgress || td_gameOver || td_gameWon) return;
    if (td_path.some(tile => tile.x === x && tile.y === y)) return;
    const existingTower = td_towers.find(t => t.x === x && t.y === y);
    setLocalState(prev => ({ ...prev, selectedTile: {x, y}, selectedTower: existingTower || null }));
  };

  const handleTowerSelect = (tower) => {
    if (!localState.selectedTile || stats.totalXP < tower.cost) return;
    const newTower = { ...tower, id: `${tower.id}_${Date.now()}`, x: localState.selectedTile.x, y: localState.selectedTile.y, lastAttack: 0 };
    
    updateStatsInFirestore({
        totalXP: stats.totalXP - tower.cost,
        td_towers: [...td_towers, newTower]
    });
    setLocalState(prev => ({ ...prev, selectedTile: null, selectedTower: null }));
  };

  const sellTower = () => {
    if (!localState.selectedTile) return;
    const towerIndex = td_towers.findIndex(t => t.x === localState.selectedTile.x && t.y === localState.selectedTile.y);
    if (towerIndex === -1) return;
    const tower = td_towers[towerIndex];
    const refund = Math.floor(tower.cost * (petEffects.squirrel?.sellRefund || 0.15));
    
    updateStatsInFirestore({
        totalXP: stats.totalXP + refund,
        td_towers: td_towers.filter((_, i) => i !== towerIndex)
    });
    setLocalState(prev => ({ ...prev, selectedTile: null, selectedTower: null }));
  };

  // FIX: Updated startWave to copy the persistent towers from props into the
  // transient local state for use in the game loop.
  const startWave = () => {
    if (localState.waveInProgress || td_gameOver || td_gameWon) return;
    const waveNumber = td_wave + 1;
    const newEnemies = generateWave(waveNumber);
    updateTowerDefenseState({ td_wave: waveNumber });
    setLocalState(prev => ({ 
      ...prev, 
      waveInProgress: true, 
      enemies: newEnemies,
      towers: [...td_towers] // Creates the local copy for this wave
    }));
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

  // FIX: Complete rewrite of the game loop. This new logic correctly updates the
  // tower's lastAttack time within the local state, ensuring attack speed is respected.
  useEffect(() => {
    if (!localState.waveInProgress) return;
    const interval = setInterval(() => {
        setLocalState(prevLocal => {
            if (!prevLocal.waveInProgress) return prevLocal;
            
            let currentCastleHealth = td_castleHealth;

            // 1. Move enemies and calculate castle damage
            let castleDamage = 0;
            let movedEnemies = (prevLocal.enemies || []).map(enemy => {
                const newProgress = enemy.progress + enemy.speed * 0.1;
                if (newProgress >= 1) {
                    castleDamage++;
                    return null;
                }
                const pathIndex = Math.min(Math.floor(newProgress * (td_path.length - 1)), td_path.length - 1);
                const pathTile = td_path[Math.max(0, pathIndex)];
                return { ...enemy, progress: newProgress, x: pathTile.x, y: pathTile.y };
            }).filter(Boolean);

            currentCastleHealth -= castleDamage;

            // 2. Towers attack enemies
            let newProjectiles = [...prevLocal.projectiles.filter(p => p.expires > Date.now())];
            let enemiesAfterAttack = [...movedEnemies];
            
            const updatedTowers = prevLocal.towers.map(tower => {
                // Use >= to ensure attacks happen consistently
                if (Date.now() - tower.lastAttack >= 1000 / tower.attackSpeed) {
                    const targetIndex = enemiesAfterAttack.findIndex(enemy => {
                        const distance = Math.hypot(enemy.x - tower.x, enemy.y - tower.y);
                        return distance <= tower.range && enemy.progress >= 0;
                    });

                    if (targetIndex !== -1) {
                        const target = enemiesAfterAttack[targetIndex];
                        newProjectiles.push({ id: `p_${Date.now()}_${Math.random()}`, from: { x: tower.x, y: tower.y }, to: { x: target.x, y: target.y }, expires: Date.now() + 300 });
                        enemiesAfterAttack[targetIndex] = { ...target, health: target.health - tower.damage };
                        return { ...tower, lastAttack: Date.now() }; // Update lastAttack time
                    }
                }
                return tower; // Return tower unchanged if it didn't attack
            });

            // 3. Filter out defeated enemies
            const finalEnemies = enemiesAfterAttack.filter(e => e.health > 0);
            
            // 4. Check game/wave end conditions
            const isGameOver = currentCastleHealth <= 0;
            const isGameWon = td_wave >= 50 && finalEnemies.length === 0;
            const isWaveOver = prevLocal.enemies.length > 0 && finalEnemies.length === 0;

            if (isGameOver || isGameWon || isWaveOver) {
                if(castleDamage > 0) updateTowerDefenseState({ td_castleHealth: Math.max(0, currentCastleHealth) });
                if(isGameOver) updateTowerDefenseState({ td_gameOver: true });
                if(isGameWon) updateTowerDefenseState({ td_gameWon: true, td_wins: td_wins + 1 });
                return { ...prevLocal, waveInProgress: false, enemies: [], towers: [] };
            }

            if(castleDamage > 0) {
              updateTowerDefenseState({ td_castleHealth: Math.max(0, currentCastleHealth) });
            }

            // 5. Return the new local state for the next tick
            return { 
                ...prevLocal, 
                enemies: finalEnemies, 
                projectiles: newProjectiles,
                towers: updatedTowers // This is the crucial update
            };
        });
    }, 100);
    return () => clearInterval(interval);
  }, [localState.waveInProgress, td_path, td_castleHealth, td_wave, td_wins, updateTowerDefenseState]);


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

  const renderBoard = () => (
    board.map((row, y) => (
      <div key={y} className="flex">
        {row.map((_, x) => (
          <div
            key={x}
            onClick={() => handleTileClick(x, y)}
            className={`w-10 h-10 border border-slate-600 flex items-center justify-center relative ${td_path.some(p => p.x === x && p.y === y) ? 'bg-slate-700' : 'bg-slate-800'} ${localState.selectedTile?.x === x && localState.selectedTile?.y === y ? 'ring-2 ring-indigo-500' : ''}`}
          >
            {td_towers.find(t => t.x === x && t.y === y) && <div className="text-lg">{getTowerEmoji(td_towers.find(t => t.x === x && t.y === y).id)}</div>}
          </div>
        ))}
      </div>
    ))
  );
  
  const renderEnemies = () => (
    (localState.enemies || []).map(enemy => {
        if(enemy.progress < 0) return null;
        const TILE_SIZE = 40;
        const top = enemy.y * TILE_SIZE + TILE_SIZE / 2;
        const left = enemy.x * TILE_SIZE + TILE_SIZE / 2;
        
        const enemyBaseName = enemy.id.split('_')[0];
        const baseHealthDef = enemyTypes.normal.find(e => e.id === enemyBaseName) || enemyTypes.juggernaut.find(e => e.id === enemyBaseName);
        
        const baseHealth = baseHealthDef ? baseHealthDef.health : 10;

        return (
          <div key={enemy.id} className="absolute z-10" style={{ top: `${top}px`, left: `${left}px`, transform: 'translate(-50%, -50%)' }}>
              <div className="text-lg">{enemyDisplayMap(enemy.id)}</div>
              <div className="absolute -bottom-2 left-0 right-0 h-1 w-6 mx-auto bg-slate-600"><div className="h-full bg-red-500" style={{ width: `${(enemy.health / baseHealth) * 100}%`}} /></div>
          </div>
        );
    })
  );

  const renderTowerSelection = () => {
    if (!localState.selectedTile) return null;
    const towerAtTile = td_towers.find(t => t.x === localState.selectedTile.x && t.y === localState.selectedTile.y);
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
              const isPurchased = td_towerUpgrades[towerAtTile.id]?.includes(upgrade.id);
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
          <button onClick={() => setLocalState(prev => ({ ...prev, shopOpen: !prev.shopOpen }))} className="bg-purple-600 text-white px-5 py-2 rounded-lg hover:bg-purple-700 transition-colors">{localState.shopOpen ? 'Close Shop' : 'Open Shop'}</button>
          {(td_gameOver || td_gameWon) && <button onClick={onResetGame} className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700">{td_gameWon ? 'Play Again' : 'Try Again'}</button>}
        </div>
      </div>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-grow">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-slate-800/50 p-3 rounded-lg text-center"><span className="text-slate-400">Wave:</span> <span className="font-bold text-white">{td_wave}/50</span></div>
            <div className="bg-slate-800/50 p-3 rounded-lg text-center"><span className="text-slate-400">Health:</span> <span className="font-bold text-red-400">{td_castleHealth}/5</span></div>
            <div className="bg-slate-800/50 p-3 rounded-lg text-center"><span className="text-slate-400">XP:</span> <span className="font-bold text-yellow-400">{stats.totalXP}</span></div>
            <div className="bg-slate-800/50 p-3 rounded-lg text-center"><span className="text-slate-400">Wins:</span> <span className="font-bold text-green-400">{td_wins}</span></div>
          </div>
          <div className="p-2 bg-slate-900/50 border border-slate-700 rounded-lg inline-block relative">
            {renderBoard()}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              {renderEnemies()}
              {localState.projectiles.map(p => <Projectile key={p.id} from={p.from} to={p.to} />)}
            </div>
          </div>
          <div className="mt-4"><button onClick={startWave} disabled={localState.waveInProgress || td_gameOver || td_gameWon} className={`w-full px-4 py-3 rounded-lg text-lg font-bold transition-colors ${localState.waveInProgress || td_gameOver || td_gameWon ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>{localState.waveInProgress ? 'Wave In Progress' : td_wave === 0 ? 'Start Wave 1' : `Start Wave ${td_wave + 1}`}</button></div>
        </div>
        <div className="w-full lg:w-80 flex-shrink-0"><div className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl sticky top-6"><h3 className="text-xl font-bold text-white mb-4 text-center">{localState.selectedTile && !td_towers.some(t => t.x === localState.selectedTile.x && t.y === localState.selectedTile.y) ? "Build Tower" : localState.selectedTile ? "Tower Control" : "Select a Tile"}</h3>{renderTowerSelection()}</div></div>
      </div>
      {td_gameOver && <div className="mt-4 p-4 bg-red-500/30 text-red-300 border border-red-500 rounded-lg"><p className="font-bold text-lg">Game Over!</p><p>Your castle was destroyed on wave {td_wave}.</p></div>}
      {td_gameWon && <div className="mt-4 p-4 bg-green-500/30 text-green-300 border border-green-500 rounded-lg"><p className="font-bold text-lg">Victory!</p><p>You successfully defended your castle against all 50 waves!</p></div>}
      {localState.shopOpen && (<div className="mt-6"><h3 className="text-2xl font-bold text-white mb-4">Shop</h3><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{shopItems.map(item => (<div key={item.id} className="p-4 bg-slate-800/80 rounded-lg shadow-lg border border-slate-700"><h4 className="font-bold text-white">{item.name}</h4><p className="text-slate-400 text-sm">Cost: {item.cost} XP | Wins Required: {item.winsRequired}</p><button onClick={() => handlePurchaseShopItem(item)} disabled={td_unlockedTowers.includes(item.unlocks) || stats.totalXP < item.cost || td_wins < item.winsRequired} className={`mt-2 w-full px-3 py-1.5 rounded text-sm font-semibold transition-colors ${td_unlockedTowers.includes(item.unlocks) ? 'bg-green-500/20 text-green-400' : (stats.totalXP < item.cost || td_wins < item.winsRequired) ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>{td_unlockedTowers.includes(item.unlocks) ? 'Purchased' : 'Buy'}</button></div>))}</div></div>)}
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
// Component for the Sanctum
const Sanctum = ({ stats, trophies, updateStatsInFirestore, showMessageBox, getFullCosmeticDetails, getItemStyle }) => {
  const [editMode, setEditMode] = useState(false);
  const [selectedItemForPlacing, setSelectedItemForPlacing] = useState(null);
  const [ghostPosition, setGhostPosition] = useState(null);
  const [selectedPlacedItem, setSelectedPlacedItem] = useState(null);
  const [showTrophyModal, setShowTrophyModal] = useState(false);

  const GRID_COLS = 20;
  const GRID_ROWS = 12;

  const equippedWallpaper = getFullCosmeticDetails(stats.equippedItems.wallpaper, 'wallpapers');
  const wallStyle = equippedWallpaper?.style || { background: 'linear-gradient(to bottom, #475569, #334155)' };

  const getFurnitureDef = (itemId) => Object.values(furnitureDefinitions).flat().find(f => f.id === itemId);

  const ownedFurnitureDetails = useMemo(() => {
    return stats.ownedFurniture.map(id => getFurnitureDef(id)).filter(Boolean);
  }, [stats.ownedFurniture]);

  const placedItems = stats.sanctumLayout?.placedItems || [];

  const updateLayout = (newPlacedItems) => {
    updateStatsInFirestore({ sanctumLayout: { ...stats.sanctumLayout, placedItems: newPlacedItems } });
  };

  const handleSelectForPlacing = (item) => {
    setSelectedItemForPlacing(item);
    setSelectedPlacedItem(null); // Deselect any placed item
  };

  const handleGridCellHover = (x, y) => {
    if (editMode && selectedItemForPlacing) {
      setGhostPosition({ x, y });
    }
  };

  const handleGridClick = (x, y) => {
    if (!editMode) return;
    
    // If we have an item selected for placement, try to place it
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
        
        // Clear selection after placing
        setSelectedItemForPlacing(null);
        setGhostPosition(null);
    } else {
      // If nothing is selected for placing, deselect any placed item
      setSelectedPlacedItem(null);
    }
  };

  const handleItemClick = (e, item) => {
    e.stopPropagation();
    if (editMode) {
      setSelectedPlacedItem(item);
      setSelectedItemForPlacing(null); // Deselect item from inventory
      setGhostPosition(null);
    } else if (item.id.includes('trophy_case')) {
      setShowTrophyModal(true);
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
  className="absolute bottom-0 left-0 w-full h-[40%]" 
  style={{ 
      transform: 'rotateX(60deg)', 
      transformOrigin: 'top center', 
      transformStyle: 'preserve-3d' // Crucial for correct 3D nesting
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
                        return (
                            <div 
                                key={i} 
                                onMouseEnter={() => handleGridCellHover(x, y)}
                                onClick={() => handleGridClick(x, y)} 
                                className={`border-r border-b border-slate-600/10 ${editMode ? 'hover:bg-indigo-500/20' : ''}`}
                            />
                        );
                    })}
                </div>

                {/* Placed Items */}
                {placedItems
                    .map(item => ({...item, def: getFurnitureDef(item.id)}))
                    .filter(item => item.def)
                    .sort((a, b) => (a.y + a.def.height) - (b.y + b.def.height))
                    .map(item => (
                        <div
    key={item.instanceId}
    onClick={(e) => handleItemClick(e, item)}
    className={`absolute transition-all duration-200 ${editMode ? 'cursor-pointer hover:brightness-110' : ''} ${selectedPlacedItem?.instanceId === item.instanceId ? 'ring-2 ring-red-500' : ''}`}
    style={{
        left: `${(item.x / GRID_COLS) * 100}%`,
        top: `${(item.y / GRID_ROWS) * 100}%`,
        width: `${(item.def.width / GRID_COLS) * 100}%`,
        height: `${(item.def.height / GRID_ROWS) * 100}%`,
        transform: `translateZ(5px)`, // Lift item more to make room for the shadow
        transformStyle: 'preserve-3d', // Create a 3D context for children
    }}
>
    {/* Shadow Element */}
    <div
        className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-4/5 h-2/5"
        style={{
            background: 'rgba(0, 0, 0, 0.4)',
            borderRadius: '50%',
            filter: 'blur(12px)',
            transform: 'scaleY(0.4) translateZ(-1px)', // Flatten and push behind item
        }}
    />

   {/* Furniture Element */}
   <div 
        className="w-full h-full drop-shadow-lg" 
        style={{
            transform: 'rotateX(-60deg)', // Counter-rotate to make it stand up
            transformOrigin: 'bottom center',
        }}
        dangerouslySetInnerHTML={{ __html: item.def.display }} 
   />
</div>
                    ))
                }

                {/* Ghost Placement Preview */}
                {editMode && ghostPosition && selectedItemForPlacing && (
                    <div
                        className="absolute bg-green-500/30 border-2 border-dashed border-green-400 pointer-events-none"
                        style={{
                            left: `${(ghostPosition.x / GRID_COLS) * 100}%`,
                            top: `${(ghostPosition.y / GRID_ROWS) * 100}%`,
                            width: `${(selectedItemForPlacing.width / GRID_COLS) * 100}%`,
                            height: `${(selectedItemForPlacing.height / GRID_ROWS) * 100}%`,
                            zIndex: 999
                        }}
                    />
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
                            <p className="text-sm text-slate-400 mb-4">
                                {selectedItemForPlacing ? `Placing: ${selectedItemForPlacing.name}` : "Select an item to place."}
                            </p>
                            <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                                {ownedFurnitureDetails.map(item => (
                                    <div 
                                      key={item.id} 
                                      onClick={() => handleSelectForPlacing(item)} 
                                      className={`bg-slate-700/80 p-3 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-slate-700 ${selectedItemForPlacing?.id === item.id ? 'ring-2 ring-indigo-500' : ''}`}
                                    >
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
              {trophies.length > 0 ? trophies.map(trophy => (
                <div key={trophy.id} className="bg-slate-700/50 p-4 rounded-g">
                  <p className="font-bold text-lg text-yellow-400">{trophy.assignment}</p>
                  <p className="text-sm text-slate-300">Class: {trophy.class}</p>
                  <p className="text-sm text-slate-400">Completed on: {new Date(trophy.dateCompleted).toLocaleDateString()}</p>
                </div>
              )) : <p className="text-slate-400 text-center">No trophies earned yet.</p>}
            </div>
          </div>
        </div>
      )}
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
  
  const initialXp = useMemo(() => stats.totalXP - xpGained, [stats.totalXP, xpGained]);
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
      if (originEvent && originEvent.target) {
          const rect = originEvent.target.getBoundingClientRect();
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
};

// Main App Component
const App = () => {
  const [activeSheet, setActiveSheet] = useState('Assignment Tracker');
  const [assignments, setAssignments] = useState([]);
  const [trophies, setTrophies] = useState([]);
  const [stats, setStats] = useState({
    totalXP: 0,
    currentLevel: 1,
    xpProgress: 0,
    badgesEarned: {},
    lastAwardedWeek: {}, // To track weekly badges
    lastAwardedDay: {},  // To track daily badges
    totalPointsEarned: 0, // For Point Accumulator badge (sum of pointsEarned)
    lastPointAccumulatorThreshold: 0, // For Point Accumulator badge
    ownedItems: [], // Array of owned cosmetic item IDs
    equippedItems: { avatar: null, banner: null, background: null, font: 'font_inter', animation: null, title: null, wallpaper: null, dungeonEmojis: {}, tdSkins: {} },
    petStatus: 'none', // 'none' | 'egg' | 'hatched'
    assignmentsToHatch: 0, // Assignments needed to hatch
    currentPet: null, // The currently active pet for buffs
    ownedPets: [], // Array of owned pet objects (now stores full pet objects including evolutions)
    friends: [], // Array of friend UIDs
    assignmentsCompleted: 0, // Counter for leaderboard
    trophiesEarned: 0, // For leaderboard
    dungeon_floor: 0, // For leaderboard
    dungeon_state: null,
    ownedFurniture: [], // IDs of purchased furniture
    sanctumLayout: { placedItems: [] }, // Position and ID of placed furniture
  td_wave: 0,
  td_castleHealth: 5,
  td_towers: [],
  td_path: [],
  td_gameOver: false,
  td_gameWon: false,
  td_wins: 10,
  td_unlockedTowers: [],
  td_towerUpgrades: {},
    // Science Lab State
    sciencePoints: 0,
    lastLogin: null,
    labEquipment: {
      beaker: 0,
      microscope: 0,
      bunsen_burner: 0,
      computer: 0,
      particle_accelerator: 0,
      quantum_computer: 0,
      manual_clicker: 1, // Start with 1 click power
    },
    labXpUpgrades: {}, // e.g., { beaker: true }
  });


  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // State for Add Assignment modal
  const [isSlotAnimationOpen, setIsSlotAnimationOpen] = useState(false); // State for Slot Machine Animation modal
  const [currentSlotReward, setCurrentSlotReward] = useState(null);
  const [currentSlotXPChange, setCurrentSlotXPChange] = useState(0);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false); // State for task completion animation
  const [xpGainToShow, setXpGainToShow] = useState(0); // For XP bar animation
  const [xpAnimationKey, setXpAnimationKey] = useState(0); // To re-trigger animation
  const [xpAnimationOriginEvent, setXpAnimationOriginEvent] = useState(null); // To store click event for orb animation
  const primeAudioRef = useRef(null); // To hold the audio priming function
  const statsRef = useRef(stats);
  useEffect(() => { statsRef.current = stats; }, [stats]);

  // New Leveling System Helpers
  const getTotalXpForLevel = useCallback((level) => {
    if (level <= 1) return 0;
    const n = level - 1;
    // Sum of an arithmetic series: Sn = n/2 * (2a + (n-1)d)
    // a = 100 (XP for level 1->2), d = 50 (increase per level)
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

      return {
          level,
          xpProgressInLevel,
          xpNeededForLevelUp,
      };
  }, [getTotalXpForLevel]);


  // Firebase Initialization and Auth Listener
  useEffect(() => {
    if (!db || !auth) {
      showMessageBox("Firebase not initialized. Please check configuration.", "error");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
          } else {
            await signInAnonymously(auth);
          }
        } catch (error) {
          console.error("Error signing in:", error);
          showMessageBox("Failed to sign in. Some features may not work.", "error");
        }
      }
      setIsAuthReady(true);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Firestore Data Listeners
  useEffect(() => {
    if (!db || !userId || !isAuthReady) return;

    // Listener for Assignments
    const assignmentsCollectionRef = collection(db, `artifacts/${appId}/public/data/assignmentTracker`);
    const unsubscribeAssignments = onSnapshot(assignmentsCollectionRef, (snapshot) => {
      const fetchedAssignments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate ? new Date(doc.data().dueDate.toDate()) : null,
        dateCompleted: doc.data().dateCompleted ? new Date(doc.data().dateCompleted.toDate()) : null,
        subtasks: doc.data().subtasks || [], // Initialize subtasks array
        recurrenceType: doc.data().recurrenceType || 'none', // New: recurrence type
        recurrenceEndDate: doc.data().recurrenceEndDate ? new Date(doc.data().recurrenceEndDate.toDate()) : null, // New: recurrence end date
        tags: doc.data().tags || [], // New: tags array
      }));
      setAssignments(fetchedAssignments);
    }, (error) => {
      console.error("Error fetching assignments:", error);
      showMessageBox("Failed to load assignments.", "error");
    });

    // Listener for Trophies
    const trophiesCollectionRef = collection(db, `artifacts/${appId}/public/data/trophyWall`);
    const unsubscribeTrophies = onSnapshot(trophiesCollectionRef, (snapshot) => {
      const fetchedTrophies = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dateCompleted: doc.data().dateCompleted ? doc.data().dateCompleted.toDate() : null,
      }));
      setTrophies(fetchedTrophies);
    }, (error) => {
      console.error("Error fetching trophies:", error);
      showMessageBox("Failed to load trophies.", "error");
    });

    // Listener for Stats
    const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats/${userId}`);
// In the App component
// In the App component
const unsubscribeStats = onSnapshot(statsDocRef, (docSnap) => {
    if (docSnap.exists()) {
        const data = docSnap.data();
        if (!data.dungeon_state) {
            console.log("Dungeon state not found, initializing...");
            updateStatsInFirestore({ dungeon_state: generateInitialDungeonState() });
        }
        // FIX: Only generate a path if one doesn't already exist for the player.
        if (!data.td_path || data.td_path.length === 0) {
            data.td_path = generatePath(); // Now it only runs once when needed!
        }
        setStats(prevStats => ({
            ...prevStats,
            ...data,
            badgesEarned: data.badgesEarned || {},
            lastAwardedWeek: data.lastAwardedWeek || {},
            lastAwardedDay: data.lastAwardedDay || {},
            totalPointsEarned: data.totalPointsEarned || 0,
            ownedItems: data.ownedItems || [],
            equippedItems: data.equippedItems || { avatar: null, banner: null, background: null, font: 'font_inter', animation: null, title: null, wallpaper: null, dungeonEmojis: {}, tdSkins: {} },
            petStatus: data.petStatus || 'egg',
            assignmentsToHatch: data.assignmentsToHatch !== undefined ? data.assignmentsToHatch : 50,
            currentPet: data.currentPet || null,
            ownedPets: data.ownedPets || [],
            friends: data.friends || [],
            assignmentsCompleted: data.assignmentsCompleted || 0,
            trophiesEarned: data.trophiesEarned || 0,
            dungeon_floor: data.dungeon_floor || 0,
            dungeon_state: data.dungeon_state || null,
            ownedFurniture: data.ownedFurniture || [],
            sanctumLayout: data.sanctumLayout || { placedItems: [] },
        }));
    } else {
        // Initialize stats if they don't exist
        setDoc(statsDocRef, { ...stats, dungeon_state: generateInitialDungeonState() }, { merge: true });
    }
}, (error) => {
    console.error("Error fetching stats:", error);
    showMessageBox("Failed to load stats.", "error");
});

    return () => {
      unsubscribeAssignments();
      unsubscribeTrophies();
      unsubscribeStats();
    };
  }, [db, userId, isAuthReady]);

  // Function to calculate days early
  const calculateDaysEarly = (dueDate, dateCompleted) => {
    if (!dueDate || !dateCompleted) return null;
    const diffTime = dueDate.getTime() - dateCompleted.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Function to get current week string (YYYY-WW)
  const getWeekString = (date) => {
    const year = date.getFullYear();
    const firstDayOfYear = new Date(year, 0, 1);
    const pastDaysYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    const week = Math.ceil((pastDaysYear + firstDayOfYear.getDay() + 1) / 7);
    return `${year}-${String(week).padStart(2, '0')}`;
  };

  // Function to get current day string (YYYY-MM-DD)
  const getDayString = (date) => {
    return date.toISOString().split('T')[0];
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
    if (!db) return;
    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/assignmentTracker`), {
         ...newAssignment, // Contains fields from the form, converted in handleAddAssignment
        // The Date objects from newAssignment are passed directly; Firebase SDK converts them to Timestamps.
        // Using serverTimestamp() was causing the selected date to be overwritten with the current date.
        dueDate: newAssignment.dueDate,
        recurrenceEndDate: newAssignment.recurrenceEndDate,
        // Initialize fields not present in the modal form
        dateCompleted: null,
        subtasks: [],
      });
    } catch (error) {
      console.error("Error adding assignment:", error);
      showMessageBox("Failed to add assignment.", "error");
    }
  };

  // Function to delete assignment from Firestore
  const deleteAssignmentFromFirestore = async (assignmentId) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, `artifacts/${appId}/public/data/assignmentTracker`, assignmentId));
    } catch (error) {
      console.error("Error deleting assignment:", error);
      showMessageBox("Failed to delete assignment.", "error");
    }
  };

  // Function to update stats in Firestore
  const updateStatsInFirestore = async (newStats) => {
    if (!db || !userId) return;
    try {
      const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats/${userId}`);
      await setDoc(statsDocRef, newStats, { merge: true });
    } catch (error) {
      console.error("Error updating stats:", error);
      showMessageBox("Failed to update stats.", "error");
    }
  };

  // Function to add trophy to Firestore
  const addTrophyToFirestore = async (newTrophy) => {
    if (!db) return;
    try {
      await addDoc(collection(db, `artifacts/${appId}/public/data/trophyWall`), {
        ...newTrophy,
        dateCompleted: newTrophy.dateCompleted ? serverTimestamp() : null, // Convert Date to Timestamp
      });
    } catch (error) {
      console.error("Error adding trophy:", error);
      showMessageBox("Failed to add trophy.", "error");
    }
  };

   // Productivity Persona Logic
  const getProductivityPersona = useCallback(() => {
    if (trophies.length === 0) {
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
    const totalAssignments = trophies.length;
    let onTimeSubmissions = 0;

    trophies.forEach(trophy => {
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

    // Persona logic is ordered from most specific to most general

    if (avgScore >= 98 && lateSubmissionsCount === 0) {
        return {
            name: "The Perfectionist",
            description: "You have an impeccable record of submitting flawless work on time. Nothing short of perfect will do!",
            icon: "💎"
        };
    }

    if (avgScore >= 90 && hardCompletionRate >= 20) {
      return {
        name: "The High-Achieving Conqueror",
        description: "You consistently aim for excellence and aren't afraid to tackle the toughest challenges!",
        icon: "👑"
      };
    }

    if (totalAssignments >= 50 && latePercentage <= 10) {
        return {
            name: "The Marathoner",
            description: "You have a long and proven track record of consistency and endurance. You're in it for the long haul!",
            icon: "🏃‍♂️"
        };
    }

    if (avgDaysEarly >= 2 && lateSubmissionsCount === 0) {
      return {
        name: "The Early Bird Planner",
        description: "You love to get things done ahead of time and avoid last-minute rushes!",
        icon: "⏰"
      };
    }
    
    if (hardCompletionRate >= 30) {
      return {
        name: "The Challenge Seeker",
        description: "You actively seek out and conquer difficult assignments, embracing the challenge!",
        icon: "🏔️"
      };
    }

    if (latePercentage > 40 && avgScore >= 70) {
      return {
        name: "The Deadline Dynamo",
        description: "You thrive under pressure, often finishing tasks close to the deadline, but still deliver quality work!",
        icon: "⚡"
      };
    }
    
    if (avgDaysEarly < 0.5 && lateSubmissionsCount === 0) {
        return {
            name: "The Just-in-Time Submitter",
            description: "You have mastered the art of using every minute available, delivering your work right on schedule.",
            icon: "🎯"
        }
    }

    if (totalAssignments >= 10 && avgDaysEarly < 1 && latePercentage <= 20) {
      return {
        name: "The Steady Progressor",
        description: "You consistently chip away at your tasks, making reliable and steady progress!",
        icon: "🐢"
      };
    }

    if (totalAssignments >= 15 && avgScore >= 80 && latePercentage <= 15) {
        return {
            name: "The All-Rounder",
            description: "You are a well-balanced performer, delivering high-quality work on time across the board.",
            icon: " संतुलित" // (Balanced in Hindi) or another suitable icon
        }
    }

    if (totalAssignments > 0) {
      return {
        name: "The Emerging Star",
        description: "You're building solid habits! Keep going to discover your unique style.",
        icon: "🌟"
      };
    }

    // Default fallback, though the initial check should catch this.
    return {
      name: "The Newbie",
      description: "Start completing assignments to discover your productivity persona!",
      icon: "✨"
    };
  }, [trophies]);

  // Pet Hatching Logic
  const generateNewPet = useCallback(() => {
    let petRarity = '';
    const roll = Math.random();
    if (roll < PET_RARITIES.mythic) { // 0.5% Mythic
      petRarity = 'mythic';
    } else if (roll < PET_RARITIES.mythic + PET_RARITIES.legendary) { // 4.5% Legendary
      petRarity = 'legendary';
    } else if (roll < PET_RARITIES.mythic + PET_RARITIES.legendary + PET_RARITIES.epic) { // 20% Epic
      petRarity = 'epic';
    } else if (roll < PET_RARITIES.mythic + PET_RARITIES.legendary + PET_RARITIES.epic + PET_RARITIES.rare) { // 25% Rare
      petRarity = 'rare';
    } else { // 50% Common
      petRarity = 'common';
    }

    const availablePetsOfRarity = petDefinitions[petRarity];
    const newPetBase = availablePetsOfRarity[Math.floor(Math.random() * availablePetsOfRarity.length)];
    return newPetBase;
  }, []);
  
  const collectFirstEgg = useCallback(async () => {
    await updateStatsInFirestore({
      petStatus: 'egg',
      assignmentsToHatch: EGG_REQUIREMENT
    });
    showMessageBox(
      `You found your first egg! Complete ${EGG_REQUIREMENT} assignments to hatch it.`,
      "info",
      3000
    );
  }, [updateStatsInFirestore]);

  const hatchEgg = useCallback(async () => {
    if (stats.petStatus !== 'egg' || stats.assignmentsToHatch > 0) return;
    
    const newPet = generateNewPet();
    
    await updateStatsInFirestore({
      petStatus: 'hatched',
      currentPet: newPet,
      ownedPets: [...stats.ownedPets, newPet],
      assignmentsToHatch: EGG_REQUIREMENT // Reset for next potential egg
    });
    showMessageBox(
      `Your egg hatched! You got a ${newPet.rarity.toUpperCase()} ${newPet.name}! It grants +${(newPet.xpBuff * 100).toFixed(0)}% XP!`, 
      "info", 
      5000
    );
  }, [stats.petStatus, stats.assignmentsToHatch, stats.ownedPets, generateNewPet, updateStatsInFirestore]);

  const collectNewEgg = useCallback(async () => {
    // Only collect if we've hatched the previous pet
    if (stats.petStatus !== 'hatched' && stats.petStatus !== 'none') return; // Also allow if no pet was ever collected

    await updateStatsInFirestore({
      petStatus: 'egg',
      assignmentsToHatch: EGG_REQUIREMENT, // Reset counter for new egg
    });

    showMessageBox(
      `You found a new egg! Complete ${EGG_REQUIREMENT} assignments to hatch it.`,
      "info",
      3000
    );
  }, [stats.petStatus, updateStatsInFirestore]);

  // Pet Evolution Function
  const handleEvolvePet = useCallback(async (petToEvolve) => {
    if (!db || !userId) return;

    // Find the full definition of the current pet stage
    let currentPetDefinition = null;
    for (const rarityGroup of Object.values(petDefinitions)) {
      currentPetDefinition = rarityGroup.find(p => p.id === petToEvolve.id);
      if (currentPetDefinition) break;
      for (const basePet of rarityGroup) {
        if (basePet.evolutions) {
          currentPetDefinition = basePet.evolutions.find(evo => evo.id === petToEvolve.id);
          if (currentPetDefinition) break;
        }
      }
      if (currentPetDefinition) break;
    }

    if (!currentPetDefinition) {
      showMessageBox("Pet definition not found.", "error");
      return;
    }

    // Find the next evolution stage from the base pet's evolutions list
    let nextEvolution = null;
    // Find the base pet that this currentPetDefinition belongs to
    for (const rarityGroup of Object.values(petDefinitions)) {
        const basePetFound = rarityGroup.find(p => p.id === currentPetDefinition.id || (p.evolutions && p.evolutions.some(e => e.id === currentPetDefinition.id)));
        if (basePetFound && basePetFound.evolutions) {
            const currentIndex = basePetFound.evolutions.findIndex(e => e.id === currentPetDefinition.id);
            if (currentIndex !== -1 && currentIndex + 1 < basePetFound.evolutions.length) {
                nextEvolution = basePetFound.evolutions[currentIndex + 1];
                break;
            }
        }
    }


    if (!nextEvolution) {
      showMessageBox("This pet has reached its final evolution!", "info");
      return;
    }

    // Check level and XP requirements
    if (stats.currentLevel < nextEvolution.levelRequired) {
      showMessageBox(`You need to reach Level ${nextEvolution.levelRequired} to evolve this pet.`, "error");
      return;
    }
    if (stats.totalXP < nextEvolution.xpCost) {
      showMessageBox(`You need ${nextEvolution.xpCost} XP to evolve this pet. You have ${stats.totalXP} XP.`, "error");
      return;
    }

    // Deduct XP and update pet
    const newTotalXP = stats.totalXP - nextEvolution.xpCost;
    const newXpProgress = newTotalXP % 100;
    const newLevel = Math.floor(newTotalXP / 100) + 1; // Recalculate level based on new XP

    // Update ownedPets list: replace old pet with new evolved pet
    const updatedOwnedPets = stats.ownedPets.map(p =>
      p.id === petToEvolve.id ? nextEvolution : p
    );

    await updateStatsInFirestore({
      totalXP: newTotalXP,
      currentLevel: newLevel,
      xpProgress: newXpProgress,
      currentPet: nextEvolution, // Automatically equip the evolved pet
      ownedPets: updatedOwnedPets,
    });

    showMessageBox(`Your ${petToEvolve.name} evolved into a ${nextEvolution.name}! You spent ${nextEvolution.xpCost} XP.`, "info", 5000);

  }, [stats, db, userId, updateStatsInFirestore]);

// In App.jsx, add this entire function
const generateInitialDungeonState = () => {
  const size = 10;
  let newBoard = {};
  let newEnemies = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      newBoard[`${y},${x}`] = { type: 'empty', visited: false };
    }
  }

  for (let i = 0; i < 15; i++) {
    const x = Math.floor(Math.random() * size);
    const y = Math.floor(Math.random() * size);
    if (x !== 1 || y !== 1) newBoard[`${y},${x}`] = { type: 'wall' };
  }

  const enemyTypes = [{ name: 'Goblin', display: '👹', hp: 20, atk: 5 }, { name: 'Skeleton', display: '💀', hp: 35, atk: 8 }];
  for (let i = 0; i < 3; i++) {
    let x, y;
    do { x = Math.floor(Math.random() * size); y = Math.floor(Math.random() * size); } while (newBoard[`${y},${x}`].type !== 'empty');
    const type = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    newEnemies.push({ id: `enemy_${i}`, ...type, x, y, hp: type.hp, maxHp: type.hp, atk: type.atk });
    newBoard[`${y},${x}`] = { type: 'enemy', enemyId: `enemy_${i}` };
  }

  let kx, ky;
  do { kx = Math.floor(Math.random() * size); ky = Math.floor(Math.random() * size); } while (newBoard[`${ky},${kx}`].type !== 'empty');
  newEnemies.push({ id: 'keyholder', name: 'Keyholder Orc', display: '덩', hp: 50, maxHp: 50, atk: 12, isKeyholder: true, x: kx, y: ky });
  newBoard[`${ky},${kx}`] = { type: 'enemy', enemyId: 'keyholder' };

  let hx, hy;
  do { hx = Math.floor(Math.random() * size); hy = Math.floor(Math.random() * size); } while (newBoard[`${hy},${hx}`].type !== 'empty' || (hx === 1 && hy === 1));
  newBoard[`${hy},${hx}`] = { type: 'hatch' };

  newBoard['1,1'] = { type: 'player', visited: true };

  return {
    floor: 1,
    board: newBoard,
    player: { x: 1, y: 1, hp: 100, maxHp: 100, attack: 10, hasKey: false },
    enemies: newEnemies,
    log: ['You have entered the dungeon.'],
    gameOver: false,
    shopOpen: false,
    ownedWeapons: [],
    ownedArmor: [],
    ownedAttacks: ['attack_normal'],
    equippedWeapon: null,
    equippedArmor: null,
    potions: 0,
    boughtStats: { hp: 0, attack: 0 },
  };
};
const resetDungeonGame = () => {
  const newDungeonState = generateInitialDungeonState();
  // We also need to update player stats based on current equipment
  const pet = stats.currentPet ? getFullPetDetails(stats.currentPet.id) : null;
  newDungeonState.player.attack = 10 + (pet?.xpBuff * 50 || 0);

  updateStatsInFirestore({
    dungeon_state: newDungeonState,
    dungeon_floor: 1
  });
  showMessageBox("Dungeon has been reset!", "info");
};
// This is the blueprint for creating a random maze path.
const generatePath = useCallback(() => {
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
}, []);
// Function for saving small game updates
const updateTowerDefenseState = useCallback((newState) => {
    updateStatsInFirestore(newState);
}, [updateStatsInFirestore]);

// Function for the big "Reset Game" button
const resetTowerDefenseGame = useCallback(() => {
    const petEffects = { dragon: { castleHealth: 1 } };
    const petEffectsApplied = stats.currentPet ? (petEffects[stats.currentPet.id.split('_')[1]] || {}) : {};
    
    const newPath = generatePath(); // Use the blueprints to make a new maze!
    updateStatsInFirestore({
        td_wave: 0,
        td_castleHealth: 5 + (petEffectsApplied.castleHealth || 0),
        td_towers: [], // Clear old towers
        td_path: newPath, // Save the new maze path
        td_gameOver: false,
        td_gameWon: false,
    });
    showMessageBox("New game started!", "info");
}, [stats.currentPet, generatePath, updateStatsInFirestore]);
  // Productivity Chest Opening Logic (FIXED)
const spinProductivitySlotMachine = useCallback(() => {
    if (statsRef.current.totalXP < 50) {
      showMessageBox(`You need 50 XP to spin.`, "error");
      return;
    }
    setIsSlotAnimationOpen(true);
  }, []);
// In the App component
// This is the only code you need to change.
const handleSlotAnimationComplete = useCallback(async (reward) => {
    // Immediately close the modal for a better user experience.
    setIsSlotAnimationOpen(false);

    // Guard against missing Firebase details.
    if (!db || !userId || !appId) {
        showMessageBox("Cannot process spin: Connection error.", "error");
        return;
    }

    const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats/${userId}`);

    try {
        // FIX: A Firebase Transaction makes this entire operation "atomic", meaning
        // it happens as one single, uninterruptible step on the server.
        // This completely prevents race conditions and data loss.
        const messageToShow = await runTransaction(db, async (transaction) => {
            const statsDoc = await transaction.get(statsDocRef);

            if (!statsDoc.exists()) {
                throw new Error("FATAL: User stats document not found.");
            }

            // Get the most up-to-date stats directly from the server inside the transaction.
            const serverStats = statsDoc.data();
            const spinCost = 50;

            // Server-side check to ensure the user can afford the spin.
            if (serverStats.totalXP < spinCost) {
                throw new Error("INSUFFICIENT_XP");
            }

            let xpChange = 0;
            let newOwnedItems = [...(serverStats.ownedItems || [])];
            let newBadgesEarned = { ...(serverStats.badgesEarned || {}) };
            let message = "";
            let isNewItem = false;

            if (reward.type === 'xp_gain' || reward.type === 'xp_loss') {
                xpChange = reward.amount;
            } else if (reward.id) { // It's a cosmetic item
                if (!newOwnedItems.includes(reward.id)) {
                    newOwnedItems.push(reward.id);
                    isNewItem = true;
                } else {
                    xpChange = 25; // Consolation XP for duplicate
                }
            }

            if (xpChange > 0 || isNewItem) {
                 newBadgesEarned['Lucky Streak'] = (newBadgesEarned['Lucky Streak'] || 0) + 1;
            }

            const finalTotalXP = serverStats.totalXP - spinCost + xpChange;
            const { level: finalLevel, xpProgressInLevel: finalXpProgress } = calculateLevelInfo(finalTotalXP);

            if (isNewItem) {
                message = `You won: ${reward.name}!`;
            } else if (xpChange > 0 && reward.type === 'xp_gain') {
                message = `You won ${xpChange} XP!`;
            } else if (xpChange > 0) { // Consolation XP case
                message = `Duplicate ${reward.name}. You get 25 XP instead!`;
            } else if (xpChange < 0) {
                message = `You lost ${Math.abs(xpChange)} XP.`;
            }

            // Update the document within the transaction.
            transaction.update(statsDocRef, {
                totalXP: finalTotalXP,
                currentLevel: finalLevel,
                xpProgress: finalXpProgress,
                badgesEarned: newBadgesEarned,
                ownedItems: newOwnedItems,
            });

            return message;
        });

        if (messageToShow) {
            showMessageBox(messageToShow, "info");
        }

    } catch (e) {
        console.error("Spin transaction failed:", e);
        if (e.message === "INSUFFICIENT_XP") {
            showMessageBox("You don't have enough XP to spin.", "error");
        } else {
            showMessageBox("A server error occurred. Your XP was not spent.", "error");
        }
    }
}, [userId, db, appId, calculateLevelInfo]);

  // Badge System Logic
  const checkAndAwardBadges = useCallback(async (completedAssignment) => {
    if (!db || !userId) return;

    const statsDocRef = doc(db, `artifacts/${appId}/public/data/stats/${userId}`);

    try {
      // Use a transaction to calculate XP gain and update stats atomically.
      // The transaction will return the final XP bonus amount.
      const xpBonus = await runTransaction(db, async (transaction) => {
        const statsDoc = await transaction.get(statsDocRef);
        if (!statsDoc.exists()) throw new Error("Stats doc missing!");
        
        const serverStats = statsDoc.data();
        const difficultyXpMap = { 'Easy': 10, 'Medium': 15, 'Hard': 20 };
        let calculatedXpBonus = difficultyXpMap[completedAssignment.difficulty] || 10;

        let newBadgesEarned = { ...(serverStats.badgesEarned || {}) };
        let newTotalPointsEarned = serverStats.totalPointsEarned || 0;
        let newAssignmentsToHatch = serverStats.assignmentsToHatch;
        
        if (serverStats.petStatus === 'egg') {
          newAssignmentsToHatch = Math.max(0, serverStats.assignmentsToHatch - 1);
        }

        let petBuffMultiplier = 1 + (serverStats.currentPet?.xpBuff || 0);

        if (completedAssignment.daysEarly >= 2) {
          calculatedXpBonus += 7;
          newBadgesEarned['Time Lord'] = (newBadgesEarned['Time Lord'] || 0) + 1;
        }

        if (completedAssignment.difficulty === 'Hard') {
          calculatedXpBonus += 12;
          newBadgesEarned['Difficulty Conqueror'] = (newBadgesEarned['Difficulty Conqueror'] || 0) + 1;
        }

        newTotalPointsEarned += completedAssignment.pointsEarned || 0;
        const lastThreshold = serverStats.lastPointAccumulatorThreshold || 0;
        const currentPointThreshold = Math.floor(newTotalPointsEarned / 50);
        if (currentPointThreshold > lastThreshold) {
          const awardsCount = currentPointThreshold - lastThreshold;
          calculatedXpBonus += (15 * awardsCount);
          newBadgesEarned['Point Accumulator'] = (newBadgesEarned['Point Accumulator'] || 0) + awardsCount;
        }

        const finalXpGained = Math.round(calculatedXpBonus * petBuffMultiplier);
        const newTotalXP = (serverStats.totalXP || 0) + finalXpGained;
        const { level: newLevel, xpProgressInLevel: newXpProgress } = calculateLevelInfo(newTotalXP);

        const updatePayload = {
          totalXP: newTotalXP,
          currentLevel: newLevel,
          xpProgress: newXpProgress,
          badgesEarned: newBadgesEarned,
          totalPointsEarned: newTotalPointsEarned,
          lastPointAccumulatorThreshold: currentPointThreshold,
          assignmentsToHatch: newAssignmentsToHatch,
        };

        transaction.update(statsDocRef, updatePayload);
        return finalXpGained; // Return the final XP amount
      });

      // After the transaction is successful, trigger the animations.
      showMessageBox(`Task complete! +${xpBonus} XP.`, "info");
      setXpGainToShow(xpBonus);
      setXpAnimationKey(k => k + 1);
      
      // Check if egg hatches (using pre-update stats for the check)
      if (stats.petStatus === 'egg' && (stats.assignmentsToHatch - 1) <= 0) {
        await hatchEgg();
      }

    } catch (error) {
      console.error("XP Award Transaction failed: ", error);
      showMessageBox("Failed to award XP due to a server error.", "error");
    }
  }, [stats, db, userId, appId, hatchEgg, calculateLevelInfo]);

  // Handle assignment status change (now driven by checkbox)
  const handleCompletedToggle = async (e, id, currentAssignment) => {
    const isCompleting = currentAssignment.status !== 'Completed';

    // --- PATH 1: Task is being marked as COMPLETE ---
    if (isCompleting) {
      // Prime audio and store click event for animation origin
      if (primeAudioRef.current) {
        primeAudioRef.current();
        setXpAnimationOriginEvent(e);
      }

      const completionDate = new Date();
      const daysEarly = calculateDaysEarly(currentAssignment.dueDate, completionDate);

      // Trigger the checkmark animation immediately for better responsiveness
      setShowCompletionAnimation(true);

      // Update the specific assignment document in Firestore
      await updateAssignmentInFirestore(id, {
        status: 'Completed',
        dateCompleted: serverTimestamp(),
        daysEarly: daysEarly,
      });

      // Update general user stats (like the completion counter)
      await updateStatsInFirestore({
        assignmentsCompleted: stats.assignmentsCompleted + 1
      });

      // This function handles all XP, badge, and pet logic in a single transaction
      // and will trigger the XP bar animation when it's done.
      await checkAndAwardBadges({ ...currentAssignment, dateCompleted: completionDate, daysEarly });

      // Handle logic for recurring tasks after the main task is processed
      if (currentAssignment.recurrenceType && currentAssignment.recurrenceType !== 'none') {
        let nextDueDate = new Date(currentAssignment.dueDate);
        if (currentAssignment.recurrenceType === 'daily') nextDueDate.setDate(nextDueDate.getDate() + 1);
        else if (currentAssignment.recurrenceType === 'weekly') nextDueDate.setDate(nextDueDate.getDate() + 7);
        else if (currentAssignment.recurrenceType === 'monthly') nextDueDate.setMonth(nextDueDate.getMonth() + 1);

        if (!currentAssignment.recurrenceEndDate || nextDueDate <= currentAssignment.recurrenceEndDate) {
          const newRecurringAssignment = {
            ...currentAssignment,
            dueDate: nextDueDate,
            status: 'To Do',
            dateCompleted: null,
            daysEarly: null,
            subtasks: (currentAssignment.subtasks || []).map(st => ({ ...st, completed: false })),
          };
          delete newRecurringAssignment.id; // Remove ID to create a new document
          await addAssignmentToFirestore(newRecurringAssignment);
          showMessageBox(`New instance of recurring assignment "${newRecurringAssignment.assignment}" created.`, "info");
        } else {
          showMessageBox(`Recurring assignment "${currentAssignment.assignment}" has ended.`, "info");
        }
      }
    }
    // --- PATH 2: Task is being UN-COMPLETED ---
    else {
      // Revert the assignment's status
      await updateAssignmentInFirestore(id, {
        status: 'To Do',
        dateCompleted: null,
        daysEarly: null,
      });

      // Revert the user's completion counter
      await updateStatsInFirestore({
        assignmentsCompleted: Math.max(0, stats.assignmentsCompleted - 1)
      });
      
      // Inform the user. Note: Reverting XP/badges is complex and not implemented.
      showMessageBox("Assignment marked as not completed.", "info");
    }
  };

  // Component for Assignment Tracker Sheet
  const AssignmentTracker = () => {
    const [expandedAssignmentId, setExpandedAssignmentId] = useState(null);
    const [newSubtaskName, setNewSubtaskName] = useState('');

    const handleAddAssignment = async (newAssignmentData) => {
      if (!newAssignmentData.assignment) {
        showMessageBox("Assignment Name is required.", "error");
        return;
      }

      const assignmentToSave = {
        ...newAssignmentData,
        dueDate: newAssignmentData.dueDate ? new Date(newAssignmentData.dueDate) : null,
        timeEstimate: parseFloat(newAssignmentData.timeEstimate) || 0,
        pointsEarned: parseFloat(newAssignmentData.pointsEarned) || 0,
        pointsMax: parseFloat(newAssignmentData.pointsMax) || 0,
        recurrenceType: newAssignmentData.recurrenceType || 'none',
        recurrenceEndDate: newAssignmentData.recurrenceEndDate ? new Date(newAssignmentData.recurrenceEndDate) : null,
        tags: newAssignmentData.tags || [],
      };

      await addAssignmentToFirestore(assignmentToSave);
      showMessageBox("Assignment added successfully!", "info");
    };

    const handleEdit = (id, field, value) => {
      let updatedValue = value;
      if (field === 'dueDate' || field === 'dateCompleted' || field === 'recurrenceEndDate') {
        updatedValue = value ? new Date(value) : null;
      } else if (field.startsWith('points') || field === 'timeEstimate') {
        updatedValue = parseFloat(value) || 0;
      } else if (field === 'tags') {
        updatedValue = value;
      }
      updateAssignmentInFirestore(id, { [field]: updatedValue });
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
        setNewSubtaskName('');
      }
    };

    const handleToggleSubtask = async (assignmentId, subtaskIndex) => {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (assignment) {
        const updatedSubtasks = [...assignment.subtasks];
        updatedSubtasks[subtaskIndex].completed = !updatedSubtasks[subtaskIndex].completed;
        await updateAssignmentInFirestore(assignmentId, { subtasks: updatedSubtasks });
      }
    };

    const handleDeleteSubtask = async (assignmentId, subtaskIndex) => {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (assignment) {
        const updatedSubtasks = assignment.subtasks.filter((_, index) => index !== subtaskIndex);
        await updateAssignmentInFirestore(assignmentId, { subtasks: updatedSubtasks });
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

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-white">
              <thead>
                <tr className="text-slate-400 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Class</th>
                  <th className="py-3 px-6 text-left">Assignment</th>
                  <th className="py-3 px-6 text-left">Due Date</th>
                  <th className="py-3 px-6 text-center">Status</th>
                  <th className="py-3 px-6 text-left">Difficulty</th>
                  <th className="py-3 px-6 text-left">Tags</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-slate-300 text-sm font-light">
                {assignments.map((assignment) => {
                  const isCurrentlyLate = assignment.status !== 'Completed' && assignment.dueDate && new Date() > assignment.dueDate;
                  const wasCompletedLate = assignment.status === 'Completed' && assignment.dateCompleted && assignment.dueDate && assignment.dateCompleted > assignment.dueDate;
                  
                  return (
                    <React.Fragment key={assignment.id}>
                      <tr className="border-b border-slate-700 hover:bg-slate-800/70">
                        <td className="py-3 px-6 text-left whitespace-nowrap">{assignment.class || '⚠️'}</td>
                        <td className="py-3 px-6 text-left">{assignment.assignment}</td>
                        <td className="py-3 px-6 text-left">{assignment.dueDate ? assignment.dueDate.toLocaleDateString() : '⚠️'}</td>
                        <td className="py-3 px-6 text-center">
<input type="checkbox" checked={assignment.status === 'Completed'} onChange={(e) => handleCompletedToggle(e, assignment.id, assignment)} className="form-checkbox h-5 w-5 text-indigo-500 rounded bg-slate-700 border-slate-600 focus:ring-indigo-500"/>
                          {(isCurrentlyLate || wasCompletedLate) && (<span className="ml-2 text-red-500 font-semibold text-xs">Late!</span>)}
                        </td>
                        <td className="py-3 px-6 text-left">{assignment.difficulty}</td>
                        <td className="py-3 px-6 text-left">
                          <div className="flex flex-wrap gap-1">
                            {assignment.tags && assignment.tags.map(tag => (
                              <span key={tag} className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded-full">{tag}</span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-6 text-center">
                          <button onClick={() => handleDelete(assignment.id)} className="text-red-400 hover:text-red-600 transition-colors duration-200 mr-2">Delete</button>
                          <button onClick={() => setExpandedAssignmentId(expandedAssignmentId === assignment.id ? null : assignment.id)} className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200">
                            {expandedAssignmentId === assignment.id ? 'Hide' : 'Details'}
                          </button>
                        </td>
                      </tr>
                      {expandedAssignmentId === assignment.id && (
                        <tr className="bg-slate-800">
                          <td colSpan="7" className="p-4 border-t-2 border-slate-700">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm p-4 bg-slate-900/50 rounded-lg">
                                <div>
                                  <strong className="text-slate-400 block mb-1">Assignment Name:</strong>
                                  <input type="text" value={assignment.assignment || ''} onChange={(e) => handleEdit(assignment.id, 'assignment', e.target.value)} className="bg-slate-700 border border-slate-600 rounded p-2 w-full"/>
                                </div>
                                <div>
                                  <strong className="text-slate-400 block mb-1">Class Name:</strong>
                                  <input type="text" value={assignment.class || ''} onChange={(e) => handleEdit(assignment.id, 'class', e.target.value)} className="bg-slate-700 border border-slate-600 rounded p-2 w-full"/>
                                </div>
                                <div>
                                  <strong className="text-slate-400 block mb-1">Due Date:</strong>
                                  <input type="date" value={assignment.dueDate ? assignment.dueDate.toISOString().split('T')[0] : ''} onChange={(e) => handleEdit(assignment.id, 'dueDate', e.target.value)} className="bg-slate-700 border border-slate-600 rounded p-2 w-full"/>
                                </div>
                                <div>
                                  <strong className="text-slate-400 block mb-1">Time Est. (hrs):</strong>
                                  <input type="number" value={assignment.timeEstimate || ''} onChange={(e) => handleEdit(assignment.id, 'timeEstimate', e.target.value)} className="bg-slate-700 border border-slate-600 rounded p-2 w-full"/>
                                </div>
                                <div>
                                  <strong className="text-slate-400 block mb-1">Points:</strong>
                                  <div className="flex items-center space-x-1">
                                    <input type="number" value={assignment.pointsEarned || ''} onChange={(e) => handleEdit(assignment.id, 'pointsEarned', e.target.value)} className="bg-slate-700 border border-slate-600 rounded p-2 w-1/2"/>
                                    <span className="text-slate-500">/</span>
                                    <input type="number" value={assignment.pointsMax || ''} onChange={(e) => handleEdit(assignment.id, 'pointsMax', e.target.value)} className="bg-slate-700 border border-slate-600 rounded p-2 w-1/2"/>
                                  </div>
                                </div>
                                <div>
                                  <strong className="text-slate-400 block mb-1">Recurrence:</strong>
                                  <span className="capitalize p-2 block">{assignment.recurrenceType}</span>
                                </div>
                                <div className="md:col-span-3 pt-2 mt-2 border-t border-slate-700">
                                  <strong className="text-slate-400 block mb-2">Subtasks:</strong>
                                {assignment.subtasks && assignment.subtasks.length > 0 ? (
                                  assignment.subtasks.map((subtask, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-slate-700/50 p-2 rounded-md mb-1">
                                      <label className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                          type="checkbox"
                                          checked={subtask.completed}
                                          onChange={() => handleToggleSubtask(assignment.id, idx)}
                                          className="form-checkbox h-4 w-4 text-green-500 rounded bg-slate-800"
                                        />
                                        <span className={`text-slate-300 ${subtask.completed ? 'line-through text-slate-500' : ''}`}>
                                          {subtask.name}
                                        </span>
                                      </label>
                                      <button
                                        onClick={() => handleDeleteSubtask(assignment.id, idx)}
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
                                    onClick={() => handleAddSubtask(assignment.id)}
                                    className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                                  >
                                    Add
                                  </button>
                                </div>
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
// Component for My Profile Sheet
const MyProfile = ({ getFullPetDetails, getFullCosmeticDetails, getItemStyle, stats, updateStatsInFirestore, userId, handleEvolvePet }) => {
  const [friendIdInput, setFriendIdInput] = useState('');
  const [activeTab, setActiveTab] = useState('collections');

  const handleEquipItem = async (item) => {
    let newEquippedItems = { ...stats.equippedItems };

    if (item.type === 'td_skin' || item.type === 'dungeon_emoji') {
        const category = item.type === 'td_skin' ? 'tdSkins' : 'dungeonEmojis';
        newEquippedItems[category] = {
            ...(stats.equippedItems[category] || {}),
            [item.for]: item.id,
        };
    } else {
        newEquippedItems = { ...stats.equippedItems, [item.type]: item.id };
    }
    
    await updateStatsInFirestore({ equippedItems: newEquippedItems });
    showMessageBox(`Equipped ${item.name}!`, "info");
  };

  const handleEquipPet = async (pet) => {
    await updateStatsInFirestore({ currentPet: pet });
    showMessageBox(`Equipped ${pet.name}! XP buff: +${(pet.xpBuff * 100).toFixed(0)}%`, "info");
  };
  
  const handleAddFriend = async () => {
    const friendId = friendIdInput.trim();
    if (!friendId) { showMessageBox('Friend ID cannot be empty.', 'error'); return; }
    if (friendId === userId) { showMessageBox("You can't add yourself.", 'error'); return; }
    if (stats.friends.includes(friendId)) { showMessageBox('Already a friend.', 'error'); return; }
    await updateStatsInFirestore({ friends: [...stats.friends, friendId] });
    showMessageBox('Friend added!', 'info');
    setFriendIdInput('');
  };

  const handleRemoveFriend = async (friendId) => {
    await updateStatsInFirestore({ friends: stats.friends.filter(id => id !== friendId) });
    showMessageBox('Friend removed.', 'info');
  };

  const copyUserIdToClipboard = () => {
    navigator.clipboard.writeText(userId).then(() => showMessageBox('User ID copied!', 'info'), () => showMessageBox('Failed to copy.', 'error'));
  };

// Located inside the MyProfile component
const handleBuyItem = async (item) => {
    if (stats.totalXP < item.cost) { showMessageBox("Not enough XP.", "error"); return; }
    // FIX: Check if the item ID exists in either ownedItems OR ownedFurniture
    if (stats.ownedItems.includes(item.id) || stats.ownedFurniture.includes(item.id)) {
      showMessageBox("Already owned.", "error");
      return;
    }

    // FIX: Correctly identify if the item is furniture by its 'type' property.
    const isFurniture = item.type === 'furniture';
    
    await updateStatsInFirestore({
        totalXP: stats.totalXP - item.cost,
        // Add to ownedItems if it's NOT furniture
        ownedItems: !isFurniture ? [...stats.ownedItems, item.id] : stats.ownedItems,
        // Add to ownedFurniture if it IS furniture
        ownedFurniture: isFurniture ? [...stats.ownedFurniture, item.id] : stats.ownedFurniture,
    });
    showMessageBox(`Purchased ${item.name}!`, 'info');
  };
  
  const TabButton = ({ tabName, children }) => (
    <button onClick={() => setActiveTab(tabName)} className={`px-4 py-2 text-lg font-semibold transition-colors ${activeTab === tabName ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-400 hover:text-white'}`}>
      {children}
    </button>
  );

  const ownedAvatars = stats.ownedItems.map(id => getFullCosmeticDetails(id, 'avatars')).filter(Boolean);
  const ownedBanners = stats.ownedItems.map(id => getFullCosmeticDetails(id, 'banners')).filter(Boolean);
  const ownedWallpapers = stats.ownedItems.map(id => getFullCosmeticDetails(id, 'wallpapers')).filter(Boolean);
  const ownedPetsFullDetails = stats.ownedPets.map(pet => getFullPetDetails(pet.id)).filter(Boolean);
  const allFurniture = Object.values(furnitureDefinitions).flat();
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
          <TabButton tabName="friends">Friends</TabButton>
        </div>
        
        <div className="p-6">
          {activeTab === 'collections' && (
            <div className="space-y-8">
              <h3 className="text-2xl font-semibold text-white">Your Items</h3>
              {/* Avatars */}
              <div>
                <h4 className="text-xl font-semibold text-indigo-300 mb-3">Avatars</h4>
                 <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                  {ownedAvatars.length > 0 ? ownedAvatars.map(item => (<div key={item.id} onClick={() => handleEquipItem(item)} className={`aspect-square bg-slate-800/70 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-700/70 transition-colors duration-200 ${stats.equippedItems.avatar === item.id ? 'ring-2 ring-indigo-500' : ''}`}><div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-4xl mb-1" style={getItemStyle(item)}>{(!item.placeholder || item.placeholder === 'URL_PLACEHOLDER') && item.display}</div><p className="text-xs font-medium text-slate-300 text-center">{item.name}</p></div>)) : <p className="text-slate-500 col-span-full">No avatars owned.</p>}
                </div>
              </div>
              {/* Banners */}
              <div>
                <h4 className="text-xl font-semibold text-indigo-300 mb-3">Banners</h4>
                 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {ownedBanners.length > 0 ? ownedBanners.map(item => (<div key={item.id} onClick={() => handleEquipItem(item)} className={`p-4 h-24 rounded-lg cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center text-center ${!getItemStyle(item).backgroundImage ? item.style : ''} ${stats.equippedItems.banner === item.id ? 'ring-2 ring-indigo-500' : ''}`} style={getItemStyle(item)}><p className={`font-bold ${!getItemStyle(item).backgroundImage ? 'text-white bg-black bg-opacity-50 px-2 py-1 rounded' : ''}`}>{item.name}</p></div>)) : <p className="text-slate-500 col-span-full">No banners owned.</p>}
                </div>
              </div>
               {/* Wallpapers */}
              <div>
                <h4 className="text-xl font-semibold text-indigo-300 mb-3">Sanctum Walls</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {ownedWallpapers.length > 0 ? ownedWallpapers.map(item => (
                    <div key={item.id} onClick={() => handleEquipItem(item)} className={`p-4 h-24 rounded-lg cursor-pointer flex items-center justify-center text-center transition-all ${stats.equippedItems.wallpaper === item.id ? 'ring-2 ring-indigo-500' : 'hover:opacity-80'}`} style={item.style}>
                      <p className="font-bold text-white bg-black/50 px-2 py-1 rounded">{item.name}</p>
                    </div>
                  )) : <p className="text-slate-500 col-span-full">No wallpapers owned.</p>}
                </div>
              </div>
               {/* Pets */}
              <div>
                 <h4 className="text-xl font-semibold text-indigo-300 mb-3">Pets</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {ownedPetsFullDetails.length > 0 ? ownedPetsFullDetails.map(pet => {
                    const basePetDef = Object.values(petDefinitions).flat().find(p => p.id === pet.id || p.evolutions?.some(e => e.id === pet.id));
                    const nextEvolutionStage = basePetDef?.evolutions?.[basePetDef.evolutions.findIndex(e => e.id === pet.id) + 1];
                    const canEvolve = nextEvolutionStage && stats.currentLevel >= nextEvolutionStage.levelRequired && stats.totalXP >= nextEvolutionStage.xpCost;
                    return (<div key={pet.id} className={`p-4 bg-slate-800/70 rounded-lg flex flex-col items-center text-center transition-colors ${stats.currentPet?.id === pet.id ? 'ring-2 ring-green-500' : ''}`}><span className="text-5xl mb-2 cursor-pointer" onClick={() => handleEquipPet(pet)}>{pet.display}</span><p className="text-sm font-medium text-white">{pet.name}</p><p className={`text-xs font-bold capitalize ${pet.rarity}`}>{pet.rarity}</p>{nextEvolutionStage && (<div className="mt-2 w-full"><button onClick={(e) => { e.stopPropagation(); handleEvolvePet(pet); }} disabled={!canEvolve} className={`w-full text-xs px-2 py-1.5 rounded transition-colors ${canEvolve ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}> Evolve </button>{!canEvolve && <p className="text-xs text-slate-500 mt-1">Lvl {nextEvolutionStage.levelRequired} & {nextEvolutionStage.xpCost} XP</p>}</div>)}</div>);
                  }) : <p className="text-slate-500 col-span-full">No pets owned.</p>}
                </div>
              </div>
              {/* TD Skins */}
              <div>
                <h4 className="text-xl font-semibold text-indigo-300 mb-3">Tower Defense Skins</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {ownedTdSkins.length > 0 ? ownedTdSkins.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => handleEquipItem(item)} 
                      className={`p-4 bg-slate-800/70 rounded-lg flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${stats.equippedItems.tdSkins?.[item.for] === item.id ? 'ring-2 ring-indigo-500' : 'hover:bg-slate-700'}`}
                    >
                      <span className="text-4xl mb-2">{item.display}</span>
                      <p className="text-sm font-medium text-white flex-grow">{item.name}</p>
                      <p className="text-xs text-slate-400 capitalize">For: {item.for}</p>
                    </div>
                  )) : <p className="text-slate-500 col-span-full">No TD skins owned.</p>}
                </div>
              </div>
              {/* Dungeon Emojis */}
              <div>
                <h4 className="text-xl font-semibold text-indigo-300 mb-3">Dungeon Emojis</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {ownedDungeonEmojis.length > 0 ? ownedDungeonEmojis.map(item => (
                    <div 
                      key={item.id} 
                      onClick={() => handleEquipItem(item)} 
                      className={`p-4 bg-slate-800/70 rounded-lg flex flex-col items-center justify-center text-center transition-colors cursor-pointer ${stats.equippedItems.dungeonEmojis?.[item.for] === item.id ? 'ring-2 ring-indigo-500' : 'hover:bg-slate-700'}`}
                    >
                      <span className="text-4xl mb-2">{item.display}</span>
                      <p className="text-sm font-medium text-white flex-grow">{item.name}</p>
                      <p className="text-xs text-slate-400 capitalize">For: {item.for}</p>
                    </div>
                  )) : <p className="text-slate-500 col-span-full">No Dungeon emojis owned.</p>}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'shop' && (
            <div className="space-y-6">
              {/* Wallpapers Shop */}
              <div>
                <h3 className="text-2xl font-semibold text-white mb-3">Wallpaper Shop</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {cosmeticItems.wallpapers.map(item => {
                    const isOwned = stats.ownedItems.includes(item.id);
                    const canAfford = stats.totalXP >= item.cost;
                    return (
                      <div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col text-center">
                        <div className="w-full h-20 mb-3 rounded" style={item.style}></div>
                        <p className="font-semibold text-white flex-grow">{item.name}</p>
                        <p className="text-xs text-slate-400 capitalize mb-3">{item.rarity}</p>
                        <button onClick={() => handleBuyItem(item)} disabled={isOwned || !canAfford} className={`w-full px-3 py-1.5 rounded text-sm font-semibold transition-colors ${isOwned ? 'bg-green-500/20 text-green-400 cursor-default' : !canAfford ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>{isOwned ? 'Owned' : `${item.cost} XP`}</button>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Furniture Shop */}
              <div>
                <h3 className="text-2xl font-semibold text-white mb-3">Furniture Shop</h3>
                {Object.entries(furnitureDefinitions).map(([category, items]) => (
                  <div key={category}>
                    <h4 className="text-xl font-semibold text-indigo-300 capitalize mb-3">{category}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {items.map(item => {
                        const isOwned = stats.ownedFurniture.includes(item.id);
                        const canAfford = stats.totalXP >= item.cost;
                        return (
                          <div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col items-center text-center">
                            <div className="w-24 h-24 mb-2 flex items-center justify-center text-slate-300">
                              <div className="w-16 h-16" dangerouslySetInnerHTML={{ __html: item.display }} />
                            </div>
                            <p className="font-semibold text-white flex-grow">{item.name}</p>
                            <p className="text-xs text-slate-400 capitalize mb-3">{item.rarity}</p>
                            <button onClick={() => handleBuyItem(item)} disabled={isOwned || !canAfford} className={`w-full px-3 py-1.5 rounded text-sm font-semibold transition-colors ${isOwned ? 'bg-green-500/20 text-green-400 cursor-default' : !canAfford ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>{isOwned ? 'Owned' : `${item.cost} XP`}</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
               {/* TD Skins Shop */}
              <div>
                <h3 className="text-2xl font-semibold text-white mb-3">Tower Defense Skins</h3>
                <p className="text-sm text-slate-400 mb-4">Unlock skins by reaching higher floors in the Dungeon Crawler.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {cosmeticItems.td_skins.map(item => {
                    const isOwned = stats.ownedItems.includes(item.id);
                    const canAfford = stats.totalXP >= item.cost;
                    const meetsRequirement = (stats.dungeon_floor || 0) >= item.floorRequired;
                    const isLocked = !meetsRequirement;
                    return (
                      <div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col items-center text-center">
                        <div className="w-16 h-16 mb-2 flex items-center justify-center text-4xl bg-slate-700 rounded-lg">{item.display}</div>
                        <p className="font-semibold text-white flex-grow">{item.name}</p>
                        <p className="text-xs text-slate-400 capitalize mb-1">For: {item.for}</p>
                        <p className="text-xs text-slate-400 capitalize mb-3">{item.rarity}</p>
                        <button onClick={() => handleBuyItem(item)} disabled={isOwned || !canAfford || isLocked} className={`w-full px-3 py-1.5 rounded text-sm font-semibold transition-colors ${isOwned ? 'bg-green-500/20 text-green-400 cursor-default' : isLocked ? 'bg-gray-800 text-gray-600 cursor-not-allowed' : !canAfford ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                          {isOwned ? 'Owned' : isLocked ? `Requires Floor ${item.floorRequired}` : `${item.cost} XP`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Dungeon Emoji Shop */}
              <div>
                <h3 className="text-2xl font-semibold text-white mb-3">Dungeon Emoji Shop</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {cosmeticItems.dungeon_emojis.map(item => {
                    const isOwned = stats.ownedItems.includes(item.id);
                    const canAfford = stats.totalXP >= item.cost;
                    return (
                      <div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col items-center text-center">
                        <div className="w-16 h-16 mb-2 flex items-center justify-center text-4xl bg-slate-700 rounded-lg">{item.display}</div>
                        <p className="font-semibold text-white flex-grow">{item.name}</p>
                        <p className="text-xs text-slate-400 capitalize mb-1">For: {item.for}</p>
                        <p className="text-xs text-slate-400 capitalize mb-3">{item.rarity}</p>
                        <button onClick={() => handleBuyItem(item)} disabled={isOwned || !canAfford} className={`w-full px-3 py-1.5 rounded text-sm font-semibold transition-colors ${isOwned ? 'bg-green-500/20 text-green-400 cursor-default' : !canAfford ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                          {isOwned ? 'Owned' : `${item.cost} XP`}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
          {activeTab === 'friends' && (
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4">Manage Friends</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow">
                  <label className="text-sm text-slate-400 block mb-1">Your User ID (Click to copy)</label>
                  <div onClick={copyUserIdToClipboard} className="p-3 bg-slate-700 border border-slate-600 rounded-md cursor-pointer truncate">{userId}</div>
                </div>
                <div className="flex-grow">
                    <label htmlFor="friendId" className="text-sm text-slate-400 block mb-1">Add Friend by ID</label>
                    <div className="flex gap-2">
                        <input id="friendId" type="text" value={friendIdInput} onChange={(e) => setFriendIdInput(e.target.value)} placeholder="Paste friend's User ID here" className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500"/>
                        <button onClick={handleAddFriend} className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700">Add</button>
                    </div>
                </div>
              </div>
              <div className="mt-6">
                  <h4 className="text-lg font-semibold text-white mb-2">Friend List</h4>
                  {stats.friends && stats.friends.length > 0 ? (
                      <ul className="space-y-2 max-h-48 overflow-y-auto pr-2">
                          {stats.friends.map(friendId => (<li key={friendId} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg"><span className="font-mono text-sm text-slate-300 truncate">{friendId}</span><button onClick={() => handleRemoveFriend(friendId)} className="text-red-400 hover:text-red-600 text-sm font-semibold">Remove</button></li>))}
                      </ul>
                  ) : (<p className="text-slate-500">You haven't added any friends yet.</p>)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


  // Component for Stats + XP Tracker Sheet
  const StatsXPTracker = () => {
    const persona = getProductivityPersona();

    const currentLevelBasedTitle = levelTitles.slice().reverse().find(t => stats.currentLevel >= t.level) || { title: 'Novice Learner' };
    const currentTitle = stats.equippedItems.title ? cosmeticItems.titles.find(t => t.id === stats.equippedItems.title)?.name : currentLevelBasedTitle.title;

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
        const date = assignment.dateCompleted.toLocaleDateString();
        const existing = acc.find(item => item.date === date);
        const points = assignment.pointsEarned || 0;
        if (existing) existing.xp += points;
        else acc.push({ date, xp: points });
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
        <div className="mb-6">
            <h2 className="text-3xl font-bold text-white">Dashboard</h2>
            <p className="text-slate-400">Your productivity at a glance.</p>
        </div>

        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl">
            <p className="text-slate-400">Total XP</p>
            <p className="text-4xl font-bold text-white mt-2">{stats.totalXP}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl">
            <div className="flex justify-between items-baseline">
                <p className="text-slate-400">Current Level</p>
                <p className="text-sm text-slate-400">
                    {calculateLevelInfo(stats.totalXP).xpProgressInLevel.toLocaleString()} / {calculateLevelInfo(stats.totalXP).xpNeededForLevelUp.toLocaleString()} XP
                </p>
            </div>
            <p className="text-4xl font-bold text-white mt-1">{stats.currentLevel}</p>
            <div className="w-full bg-slate-700 rounded-full h-2.5 mt-4">
                <div className="bg-indigo-500 h-2.5 rounded-full" style={{ width: `${(calculateLevelInfo(stats.totalXP).xpProgressInLevel / calculateLevelInfo(stats.totalXP).xpNeededForLevelUp) * 100}%` }}></div>
            </div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl">
            <p className="text-slate-400">Title</p>
            <p className="text-2xl font-bold text-indigo-400 mt-2">{currentTitle}</p>
          </div>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column (Graphs) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
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

            {/* Right Column (Widgets) */}
            <div className="flex flex-col gap-6">
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
                            <span className="text-6xl">{stats.currentPet.display}</span>
                            <div>
                              <p className="text-lg font-semibold text-white">{stats.currentPet.name}</p>
                              <p className="text-sm text-green-400">+{(stats.currentPet.xpBuff * 100).toFixed(0)}% XP</p>
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

 // Component for Calendar View Sheet
  const CalendarView = () => {
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
  // Component for GPA & Tags Analytics Sheet
  const GPATagsAnalytics = () => {
    const calculateGPA = (pointsEarned, pointsMax) => {
      if (!pointsMax || pointsMax <= 0) return null;
      return ((pointsEarned / pointsMax) * 4.0).toFixed(2);
    };

    const completedAssignmentsWithScores = trophies.filter(t =>
      t.pointsEarned !== undefined && t.pointsEarned !== null &&
      t.pointsMax !== undefined && t.pointsMax !== null && t.pointsMax > 0
    );

    const getGPAPeriod = (periodInMonths) => {
      const now = new Date();
      const cutoffDate = new Date();
      cutoffDate.setMonth(now.getMonth() - periodInMonths);

      const relevantAssignments = completedAssignmentsWithScores.filter(t =>
        t.dateCompleted && new Date(t.dateCompleted) >= cutoffDate
      );

      let totalWeightedScore = 0;
      let totalMaxPoints = 0;

      relevantAssignments.forEach(t => {
        totalWeightedScore += t.pointsEarned;
        totalMaxPoints += t.pointsMax;
      });

      if (totalMaxPoints === 0) return 'N/A';
      return calculateGPA(totalWeightedScore, totalMaxPoints);
    };

    const gpaMonth = getGPAPeriod(1);
    const gpa3Months = getGPAPeriod(3);
    const gpaYear = getGPAPeriod(12);

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
      const avgScore = data.assignmentCount > 0 ? ((data.totalPointsEarned / data.totalPointsMax) * 100).toFixed(1) : 'N/A';
      const avgTime = data.assignmentCount > 0 ? (data.totalTimeSpent / data.assignmentCount).toFixed(1) : 'N/A';
      const avgGpa = data.totalPointsMax > 0 ? calculateGPA(data.totalPointsEarned, data.totalPointsMax) : 'N/A';
      return { avgScore, avgTime, avgGpa };
    };

    return (
      <div>
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white">GPA & Tags Analytics</h2>
          <p className="text-slate-400">Analyze your academic performance over time and by subject.</p>
        </div>

        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl text-center">
            <h3 className="text-lg font-semibold text-slate-400 mb-2">GPA (Last Month)</h3>
            <p className="text-4xl font-bold text-blue-400">{gpaMonth}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl text-center">
            <h3 className="text-lg font-semibold text-slate-400 mb-2">GPA (Last 3 Months)</h3>
            <p className="text-4xl font-bold text-green-400">{gpa3Months}</p>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-2xl shadow-xl text-center">
            <h3 className="text-lg font-semibold text-slate-400 mb-2">GPA (Last Year)</h3>
            <p className="text-4xl font-bold text-yellow-400">{gpaYear}</p>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
          <h3 className="text-xl font-bold text-white p-6">Analytics by Tag (Last Year)</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-white">
              <thead>
                <tr className="text-slate-400 uppercase text-sm leading-normal border-b-2 border-slate-700">
                  <th className="py-3 px-6 text-left">Tag</th>
                  <th className="py-3 px-6 text-center">Assignments</th>
                  <th className="py-3 px-6 text-center">Avg Score (%)</th>
                  <th className="py-3 px-6 text-center">Avg Time (hrs)</th>
                  <th className="py-3 px-6 text-center">Avg GPA (4.0)</th>
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
                      <td className="py-4 px-6 text-center">{analytics.avgScore}</td>
                      <td className="py-4 px-6 text-center">{analytics.avgTime}</td>
                      <td className="py-4 px-6 text-center">{analytics.avgGpa}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };
// Component for Friends Leaderboard
const Leaderboard = ({ db, appId, userId, friends }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: 'totalXP', direction: 'descending' });

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      if (!db || !userId) return;
      setLoading(true);

      const userIdsToFetch = [userId, ...friends];
      const uniqueUserIds = [...new Set(userIdsToFetch)];

      try {
        const promises = uniqueUserIds.map(id => getDoc(doc(db, `artifacts/${appId}/public/data/stats/${id}`)));
        const userDocs = await Promise.all(promises);

        const data = userDocs
          .filter(doc => doc.exists())
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        
        setLeaderboardData(data);
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        showMessageBox("Could not load leaderboard data.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, [db, appId, userId, friends]);

  const sortedData = useMemo(() => {
    let sortableItems = [...leaderboardData];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [leaderboardData, sortConfig]);

  const requestSort = (key) => {
    let direction = 'descending';
    if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = 'ascending';
    }
    setSortConfig({ key, direction });
  };
  
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'descending' ? '▼' : '▲';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="text-xl text-slate-400">Loading Leaderboard...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-white">Friends Leaderboard</h2>
        <p className="text-slate-400">See how you stack up against your friends.</p>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-white">
            <thead>
              <tr className="text-slate-400 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">Rank</th>
                <th className="py-3 px-6 text-left">User</th>
                <th className="py-3 px-6 text-center cursor-pointer" onClick={() => requestSort('totalXP')}>Lifetime XP {getSortIndicator('totalXP')}</th>
                <th className="py-3 px-6 text-center cursor-pointer" onClick={() => requestSort('assignmentsCompleted')}>Tasks Done {getSortIndicator('assignmentsCompleted')}</th>
                <th className="py-3 px-6 text-center cursor-pointer" onClick={() => requestSort('dungeon_floor')}>Dungeon Floor {getSortIndicator('dungeon_floor')}</th>
                <th className="py-3 px-6 text-center cursor-pointer" onClick={() => requestSort('td_wins')}>TD Wins {getSortIndicator('td_wins')}</th>
              </tr>
            </thead>
            <tbody className="text-slate-300 text-sm font-light">
              {sortedData.map((user, index) => (
                <tr key={user.id} className={`border-b border-slate-700 hover:bg-slate-800/70 ${user.id === userId ? 'bg-indigo-900/50' : ''}`}>
                  <td className="py-4 px-6 text-left font-bold">{index + 1}</td>
                  <td className="py-4 px-6 text-left font-mono">{user.id === userId ? `${user.id} (You)` : user.id}</td>
                  <td className="py-4 px-6 text-center">{user.totalXP || 0}</td>
                  <td className="py-4 px-6 text-center">{user.assignmentsCompleted || 0}</td>
                  <td className="py-4 px-6 text-center">{user.dungeon_floor || 0}</td>
                  <td className="py-4 px-6 text-center">{user.td_wins || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};


  // Helper functions to find full item details from definitions
  const getFullPetDetails = (petId) => {
    for (const rarityGroup of Object.values(petDefinitions)) {
      const basePet = rarityGroup.find(p => p.id === petId);
      if (basePet) return basePet;
      for (const p of rarityGroup) {
        if (p.evolutions) {
          const evolvedPet = p.evolutions.find(evo => evo.id === petId);
          if (evolvedPet) return evolvedPet;
        }
      }
    }
    return null;
  };

  const getFullCosmeticDetails = (itemId, type) => {
    if (!itemId || !cosmeticItems[type]) return null;
    return cosmeticItems[type].find(i => i.id === itemId);
  };

  const getItemStyle = (item) => {
    if (item && item.placeholder && item.placeholder !== 'URL_PLACEHOLDER') {
        return { backgroundImage: `url('${item.placeholder}')`, backgroundSize: 'cover', backgroundPosition: 'center' };
    }
    return {};
  };

  const equippedAvatar = getFullCosmeticDetails(stats.equippedItems.avatar, 'avatars');
  const equippedAvatarDisplay = equippedAvatar?.display || '👤';
  const equippedFontStyle = stats.equippedItems.font ? (cosmeticItems.fonts.find(f => f.id === stats.equippedItems.font) || {}).style : 'font-inter';


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-blue-600 text-2xl font-semibold">Loading your tracker...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-inter text-slate-300 flex bg-slate-900 ${equippedFontStyle || 'font-inter'}`}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script&family=Inter:wght@400;700&family=Oswald&family=Permanent+Marker&family=Playfair+Display&family=Press+Start+2P&family=Roboto+Slab&family=Space+Mono&family=Cinzel+Decorative&family=Comic+Neue&family=Libre+Baskerville&family=Lato&family=Merriweather&family=Raleway&family=Ubuntu&display=swap');
          body { background-color: #0f172a; } /* bg-slate-900 */
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

          /* Custom scrollbar for dark theme */
          ::-webkit-scrollbar { width: 8px; }
          ::-webkit-scrollbar-track { background: #1e293b; } /* bg-slate-800 */
          ::-webkit-scrollbar-thumb { background: #4f46e5; border-radius: 4px; } /* bg-indigo-600 */
          ::-webkit-scrollbar-thumb:hover { background: #6366f1; } /* bg-indigo-500 */


          /* Confetti, Checkmark, and other animations from previous steps remain unchanged */
          @keyframes confetti-fall { 0% { transform: translateY(-100vh) rotate(0deg); opacity: 0; } 10% { opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
          .animate-confetti { animation: confetti-fall 3s ease-out forwards; animation-fill-mode: forwards; }
          @keyframes checkmark-circle { 0% { stroke-dasharray: 0, 157; stroke-width: 0; } 25% { stroke-dasharray: 0, 157; stroke-width: 4; } 50% { stroke-dasharray: 157, 0; stroke-width: 4; } 100% { stroke-dasharray: 157, 0; stroke-width: 4; opacity: 0; } }
          @keyframes checkmark-check { 0% { stroke-dasharray: 0, 50; stroke-width: 0; } 50% { stroke-dasharray: 0, 50; stroke-width: 4; } 100% { stroke-dasharray: 50, 0; stroke-width: 4; opacity: 0; } }
          .animate-checkmark-pop .checkmark-circle { stroke-dasharray: 157; stroke-dashoffset: 157; stroke-width: 4; stroke: #4CAF50; fill: none; animation: checkmark-circle 1s ease-out forwards; }
          .animate-checkmark-pop .checkmark-check { stroke-dasharray: 50; stroke-dashoffset: 50; stroke-width: 4; stroke: #4CAF50; fill: none; animation: checkmark-check 1s ease-out 0.5s forwards; }

          /* Tower Defense Projectile Animation */
          .projectile {
            position: absolute;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: #facc15; /* yellow-400 */
            transform: translate(-50%, -50%);
            transition: top 0.3s linear, left 0.3s linear;
            z-index: 20;
            pointer-events: none;
          }
          /* --- XP Bar Animation Styles --- */
          .xp-bar-container {
            position: fixed;
            bottom: 2%;
            left: 0;
            width: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            pointer-events: none;
            z-index: 9999;
            opacity: 0;
            animation: fade-in-bar 0.5s ease-out forwards;
          }
          @keyframes fade-in-bar {
            to { opacity: 1; }
          }
          .xp-bar-wrapper {
            position: relative;
            width: 50%;
            max-width: 600px;
            height: 20px;
          }
          .xp-bar-background {
            width: 100%;
            height: 16px;
            background-color: #1e293b; /* bg-slate-800 */
            border: 2px solid #0f172a; /* bg-slate-900 */
            border-radius: 2px;
            overflow: hidden;
            box-shadow: inset 0 0 5px rgba(0,0,0,0.5);
          }
          .xp-bar-fill {
            height: 100%;
            background-color: #6366f1; /* bg-indigo-500 */
            transition: width 0.1s linear;
            box-shadow: inset 0 -2px 2px rgba(0,0,0,0.2);
          }
          .xp-level-text {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: white;
            font-weight: bold;
            font-size: 12px;
            text-shadow: 1px 1px 2px #000;
            z-index: 2;
          }
          .xp-orb {
            position: fixed;
            border-radius: 50%;
            background-color: #a7f3d0; /* emerald-200 */
            box-shadow: 0 0 10px #34d399, 0 0 4px white; /* emerald-400 */
            opacity: 0;
            will-change: transform, opacity, top, left;
            transform: translate(-50%, -50%); /* Center the orb on its coordinates */
          }
          .xp-orb.satis-low { width: 8px; height: 8px; }
          .xp-orb.satis-medium { width: 12px; height: 12px; }
          .xp-orb.satis-high { width: 16px; height: 16px; }

          @keyframes fly-to-bar-minecraft {
              0% {
                  transform: translate(-50%, -50%) scale(1.2);
                  opacity: 1;
              }
              100% {
                  top: 98vh; /* Animate towards the bar's Y position */
                  left: 50vw; /* Animate towards the bar's X position */
                  transform: translate(-50%, -50%) scale(0);
                  opacity: 0;
              }
          }
        `}
      </style>

      {/* Message Box */}
      <div id="messageBox" className="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-y-full opacity-0">
        <p id="messageText" className="text-white"></p>
      </div>

      <TaskCompletionAnimation
        show={showCompletionAnimation}
        onAnimationEnd={() => setShowCompletionAnimation(false)}
        equippedAnimationEffect={stats.equippedItems.animation ? cosmeticItems.animations.find(a => a.id === stats.equippedItems.animation)?.effect : null}
      />
      <SlotMachineAnimationModal
        isOpen={isSlotAnimationOpen}
        onClose={() => setIsSlotAnimationOpen(false)}
        onAnimationComplete={handleSlotAnimationComplete}
      />
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
      {/* Sidebar Navigation */}
      <nav className="w-64 bg-slate-900 p-6 flex-shrink-0 flex flex-col shadow-2xl">
        <ul className="space-y-2 flex-grow">
          {[
            { name: 'Dashboard', sheet: 'Stats + XP Tracker', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg> },
            { name: 'Assignments', sheet: 'Assignment Tracker', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg> },
            { name: 'Sanctum', sheet: 'Sanctum', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 20a10 10 0 110-20 10 10 0 010 20zM9 4a1 1 0 112 0v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V7H8a1 1 0 010-2h1V4z" /></svg> },
            { name: 'Leaderboard', sheet: 'Leaderboard', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0118 15v3h-2zM4.75 12.094A5.973 5.973 0 004 15v3H2v-3a3.005 3.005 0 012.25-2.906z" /></svg> },
            { name: 'Calendar', sheet: 'Calendar View', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg> },
            { name: 'Analytics', sheet: 'GPA & Tags Analytics', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg> },
            { name: 'Dungeon Crawler', sheet: 'Dungeon Crawler', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M1.5 6.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-2zM6 11a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 4a1 1 0 100 2h4a1 1 0 100-2H7zM2 2.5a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h2a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5h-2zM2.5 14a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-2zM14 2.5a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h2a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5h-2zM13.5 14a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-2z" clipRule="evenodd"/></svg>},
            { name: 'Tower Defense', sheet: 'Tower Defense', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a1 1 0 011-1h8a1 1 0 011 1v2h1a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h1V3zm3 4a1 1 0 011-1h2a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" /></svg>},
            { name: 'Science Lab', sheet: 'Science Lab', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 2a.5.5 0 01.5.5V3h5V2.5a.5.5 0 011 0V3h1a2 2 0 012 2v1.5a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5V5a1 1 0 00-1-1H7a1 1 0 00-1 1v.5a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5V5a2 2 0 012-2h1V2.5A.5.5 0 017 2zM4.002 8.5a.5.5 0 01.498.5v7a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-7a.5.5 0 01.5-.5h1zM16 8.5a.5.5 0 01.5.5v7a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-7a.5.5 0 01.5-.5h1zM7 9a1 1 0 00-1 1v5a1 1 0 102 0v-5a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v5a1 1 0 102 0v-5a1 1 0 00-1-1z" clipRule="evenodd" /></svg>},
          ].map((item) => (
            <li key={item.name}>
                <button onClick={() => setActiveSheet(item.sheet)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-3 ${
                    activeSheet === item.sheet
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    {item.icon}<span>{item.name}</span>
                </button>
            </li>
          ))}
        </ul>

        {/* Separator and new tab */}
        <div className="border-t border-slate-700 mx-[-1.5rem] my-4"></div>

        <ul className="space-y-2">
            <li>
                <button onClick={() => setActiveSheet('Why')}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center space-x-3 ${
                    activeSheet === 'Why'
                        ? 'bg-indigo-600 text-white shadow-lg'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    <span>Why I Built This</span>
                </button>
            </li>
        </ul>

        {/* Profile Section */}
        <div className="mt-auto pt-4">
            <button onClick={() => setActiveSheet('My Profile')} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-colors">
                <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl border-2 border-slate-600">
                    {equippedAvatarDisplay || '👤'}
                </div>
                <div className="flex-1 text-left">
                    <p className="text-sm font-semibold text-white">My Profile</p>
                    <p className="text-xs text-slate-400 truncate">ID: {userId}</p>
                </div>
            </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow p-8 overflow-auto">
        {activeSheet === 'Assignment Tracker' && <AssignmentTracker />}
        {activeSheet === 'Stats + XP Tracker' && <StatsXPTracker />}
        {activeSheet === 'My Profile' && <MyProfile 
            stats={stats} 
            userId={userId} 
            updateStatsInFirestore={updateStatsInFirestore} 
            handleEvolvePet={handleEvolvePet}
            getFullPetDetails={getFullPetDetails} 
            getFullCosmeticDetails={getFullCosmeticDetails} 
            getItemStyle={getItemStyle} 
        />}        
        {activeSheet === 'Sanctum' && <Sanctum 
            stats={stats} 
            trophies={trophies} 
            updateStatsInFirestore={updateStatsInFirestore} 
            showMessageBox={showMessageBox} 
            getFullCosmeticDetails={getFullCosmeticDetails} // Pass this down
            getItemStyle={getItemStyle}                   // Pass this down
        />}
        {activeSheet === 'Leaderboard' && <Leaderboard db={db} appId={appId} userId={userId} friends={stats.friends} />}
        {activeSheet === 'Why' && <WhyTab />}
        {activeSheet === 'Calendar View' && <CalendarView />}
        {activeSheet === 'GPA & Tags Analytics' && <GPATagsAnalytics />}
        {activeSheet === 'Dungeon Crawler' && <DungeonCrawler stats={stats} dungeonState={stats.dungeon_state} updateStatsInFirestore={updateStatsInFirestore} showMessageBox={showMessageBox} getFullPetDetails={getFullPetDetails} onResetDungeon={resetDungeonGame} getFullCosmeticDetails={getFullCosmeticDetails} />}
        {activeSheet === 'Tower Defense' && <TowerDefenseGame 
            stats={stats} 
            updateStatsInFirestore={updateStatsInFirestore} 
            showMessageBox={showMessageBox}
            onResetGame={resetTowerDefenseGame}
            updateTowerDefenseState={updateTowerDefenseState}
            getFullCosmeticDetails={getFullCosmeticDetails}
        />}
        {activeSheet === 'Science Lab' && <ScienceLab stats={stats} updateStatsInFirestore={updateStatsInFirestore} showMessageBox={showMessageBox} />}
      </main>
    </div>
  );
};

export default App;