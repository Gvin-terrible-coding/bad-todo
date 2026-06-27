// Static definitions and configurations for the app
import React from 'react';
// Asset Imports for Focus Navigator
import cockpitImage from '../assets/images/Space_Focus_Timer/Cockpit_View.png';
import starmapImage from '../assets/images/Space_Focus_Timer/Starmap_Select_Background.png';
import planet1 from '../assets/images/Space_Focus_Timer/planet_1.png';
import planet2 from '../assets/images/Space_Focus_Timer/planet_2.png';
import planet3 from '../assets/images/Space_Focus_Timer/planet_3.png';
import planet4 from '../assets/images/Space_Focus_Timer/planet_4.png';
import planet5 from '../assets/images/Space_Focus_Timer/planet_5.png';
import planet6 from '../assets/images/Space_Focus_Timer/planet_6.png';
import planet7 from '../assets/images/Space_Focus_Timer/planet_7.png';
import planet8 from '../assets/images/Space_Focus_Timer/planet_8.png';
import planet9 from '../assets/images/Space_Focus_Timer/planet_9.png';
import planet10 from '../assets/images/Space_Focus_Timer/planet_10.png';
import starfieldVideo from '../assets/videos/Space Focus Timer/Animated_Starfield.mp4';
import hologramScreen from '../assets/images/Space_Focus_Timer/hologram_screen_2.png';
import spaceshipIcon from '../assets/images/Space_Focus_Timer/spaceship.png';
import hologramButton from '../assets/images/Space_Focus_Timer/hologram_button.png';
// --- NEW: Asset Imports for Flashcard Fortress ---
import enemyScampIcon from '../assets/images/FlashcardFortress/enemy_scamp.png';
import enemyOgreIcon from '../assets/images/FlashcardFortress/enemy_ogre.png';
import enemyShamanIcon from '../assets/images/FlashcardFortress/enemy_shaman.png';
import enemySpecterIcon from '../assets/images/FlashcardFortress/enemy_specter.png';
import enemySapperIcon from '../assets/images/FlashcardFortress/enemy_sapper.png';
import enemyDefaultIcon from '../assets/images/FlashcardFortress/enemy_default.png';

import wingmenSpriteSheet from '../assets/images/Dungeon/Wingmen_icon_sheet.png';
// --- NEW: Sanctum Tile Editor Assets ---
import SFriskFantasyInteriorFloor from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Floors/Floors.png';
import SFriskFantasyInteriorItems from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Items/AllItems.png';
import SFriskFantasyInteriorFurniture from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Furniture/AllFurniture.png';
import SFriskFantasyInteriorChair from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Chair/Chair.png';
import SFriskFantasyInteriorDarkGreenCarpet from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Carpet/DarkGreenCarpet.png';
import SFriskFantasyInteriorLightGreenCarpet from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Carpet/LightGreenCarpet.png';
import SFriskFantasyInteriorRedCarpet from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Carpet/RedCarpet.png';
import SFriskFantasyInteriorBlueCarpet from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Carpet/BlueCarpet.png';
import SFriskFantasyInteriorExteriorBorder from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Border/ExteriorBorder.png';
import SFriskFantasyInteriorBackground from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Background/Background.png';
import SFriskFantasyInteriorWindows from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Wall_Decor/Windows.png';
import SFriskFantasyInteriorSign from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Wall_Decor/Sign.png';
import SFriskFantasyInteriorShelf from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Wall_Decor/Shelf.png';
import SFriskFantasyInteriorPainting from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Wall_Decor/Painting.png';
import SFriskFantasyInteriorFireplace from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Wall_Decor/Fireplace.png';
import SFriskFantasyInteriorDoors from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Wall_Decor/Doors.png';
import SFriskFantasyInteriorBanners from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Wall_Decor/Banners.png';
import SFriskFantasyInteriorWallPaneling from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Walls/Paneling.png';
import SFriskFantasyInteriorWainscotingWall from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Walls/WainscotingWall.png';
import SFriskFantasyInteriorStoneWalls from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Walls/StoneWall.png';
import SFriskFantasyInteriorPanelingWithStone from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Walls/PanelingWithStone.png';
import SFriskFantasyInteriorWallwithStone from '../assets/tilesets/S_Frisk_-_Fantasy_Interior_Tileset/Walls/WallwithStone.png';
// --- NEW: Asset Imports for Alchemist's Workshop ---
import alchemyLabIndoorBg from '../assets/Maps/AlchemyLabIndoors.png';
import alchemyBenchImage from '../assets/images/Alchemy Lab/Indoors_assets/bench.png';
import alchemyCauldronImage from '../assets/images/Alchemy Lab/Indoors_assets/cauldron.png';
import alchemyGardenBg from '../assets/Maps/AlchemyLabOutdoors.png';


// --- NEW: ALCHEMY CAT SPRITES (ALL VARIATIONS) ---
// Cat 1 (Default)
import catIdleSheet from '../assets/Sprites/AlchemyLab/Cat-1-Idle.png';
import catItchSheet from '../assets/Sprites/AlchemyLab/Cat-1-Itch.png';
import catLayingSheet from '../assets/Sprites/AlchemyLab/Cat-1-Laying.png';
import catLicking1Sheet from '../assets/Sprites/AlchemyLab/Cat-1-Licking1.png';
import catLicking2Sheet from '../assets/Sprites/AlchemyLab/Cat-1-Licking2.png';
import catMeowSheet from '../assets/Sprites/AlchemyLab/Cat-1-Meow.png';
import catRunSheet from '../assets/Sprites/AlchemyLab/Cat-1-Run.png';
import catSittingSheet from '../assets/Sprites/AlchemyLab/Cat-1-Sitting.png';
import catSleeping1Sheet from '../assets/Sprites/AlchemyLab/Cat-1-Sleeping1.png';
import catSleeping2Sheet from '../assets/Sprites/AlchemyLab/Cat-1-Sleeping2.png';
import catStretchingSheet from '../assets/Sprites/AlchemyLab/Cat-1-Stretching.png';
import catWalkSheet from '../assets/Sprites/AlchemyLab/Cat-1-Walk.png';
// Cat 2 (Calico) - Assuming filenames, replace if needed
import cat2IdleSheet from '../assets/Sprites/AlchemyLab/Cat-2-Idle.png';
import cat2ItchSheet from '../assets/Sprites/AlchemyLab/Cat-2-Itch.png';
import cat2LayingSheet from '../assets/Sprites/AlchemyLab/Cat-2-Laying.png';
import cat2Licking1Sheet from '../assets/Sprites/AlchemyLab/Cat-2-Licking1.png';
import cat2Licking2Sheet from '../assets/Sprites/AlchemyLab/Cat-2-Licking2.png';
import cat2MeowSheet from '../assets/Sprites/AlchemyLab/Cat-2-Meow.png';
import cat2RunSheet from '../assets/Sprites/AlchemyLab/Cat-2-Run.png';
import cat2SittingSheet from '../assets/Sprites/AlchemyLab/Cat-2-Sitting.png';
import cat2Sleeping1Sheet from '../assets/Sprites/AlchemyLab/Cat-2-Sleeping1.png';
import cat2Sleeping2Sheet from '../assets/Sprites/AlchemyLab/Cat-2-Sleeping2.png';
import cat2StretchingSheet from '../assets/Sprites/AlchemyLab/Cat-2-Stretching.png';
import cat2WalkSheet from '../assets/Sprites/AlchemyLab/Cat-2-Walk.png';
// Cat 3 (Sable)
import cat3IdleSheet from '../assets/Sprites/AlchemyLab/Cat-3-Idle.png';
import cat3ItchSheet from '../assets/Sprites/AlchemyLab/Cat-3-Itch.png';
import cat3LayingSheet from '../assets/Sprites/AlchemyLab/Cat-3-Laying.png';
import cat3Licking1Sheet from '../assets/Sprites/AlchemyLab/Cat-3-Licking1.png';
import cat3Licking2Sheet from '../assets/Sprites/AlchemyLab/Cat-3-Licking2.png';
import cat3MeowSheet from '../assets/Sprites/AlchemyLab/Cat-3-Meow.png';
import cat3RunSheet from '../assets/Sprites/AlchemyLab/Cat-3-Run.png';
import cat3SittingSheet from '../assets/Sprites/AlchemyLab/Cat-3-Sitting.png';
import cat3Sleeping1Sheet from '../assets/Sprites/AlchemyLab/Cat-3-Sleeping1.png';
import cat3Sleeping2Sheet from '../assets/Sprites/AlchemyLab/Cat-3-Sleeping2.png';
import cat3StretchingSheet from '../assets/Sprites/AlchemyLab/Cat-3-Stretching.png';
import cat3WalkSheet from '../assets/Sprites/AlchemyLab/Cat-3-Walk.png';
// Cat 4 (Ginger)
import cat4IdleSheet from '../assets/Sprites/AlchemyLab/Cat-4-Idle.png';

// Loot Ingredients
import ingredientBeak from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/Beak.png';
import ingredientBone from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/Bone.png';
import ingredientBrain from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/Brain.png';
import ingredientCrown from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/Crown.png';
import ingredientCultishSkull from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/Cultish Skull.png';
import ingredientCursedSkull from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/CursedSkull.png';
import ingredientDemonicBook from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/DemonicSpellBook.png';
import ingredientEyeballs from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/Eyes.png';
import ingredientHand from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/Hand.png';
import ingredientHeart from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/Heart.png';
import ingredientJaw from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/Jaw.png';
import ingredientJawV2 from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/JawV2.png';
import ingredientJaggedTooth from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/JaggedTooth.png';
import ingredientMysteriousRing from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/MysteriousRing.png';
import ingredientPoisoniousPoultice from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/PoisoniousPoultice.png';
import ingredientSeveredFoot from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/Severed Foot.png';
import ingredientSeveredHand from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/Severed Hand.png';
import ingredientSkull from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/Skull.png';
import ingredientTeeth from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/Tooth.png';
import ingredientVoodooDoll from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/Voodoodoll.png';
import ingredientWarriorsFist from '../assets/images/Alchemy Lab/Loot_icons_in_Inventory/WarriorsFist.png';

// Plant Ingredients
import plantCarrotIcon from '../assets/images/Alchemy Lab/Plant_Icons_in_Inventory/Carroticon.png';
import plantChamomileLeavesIcon from '../assets/images/Alchemy Lab/Plant_Icons_in_Inventory/ChamomileLeavesicon.png';
import plantDriedRoseIcon from '../assets/images/Alchemy Lab/Plant_Icons_in_Inventory/driedroseicon.png';
import plantOnionIcon from '../assets/images/Alchemy Lab/Plant_Icons_in_Inventory/Onionicon.png';
import plantOysterMushroomIcon from '../assets/images/Alchemy Lab/Plant_Icons_in_Inventory/OysterMushroomicon.png';
import plantPotatoIcon from '../assets/images/Alchemy Lab/Plant_Icons_in_Inventory/Potatoicon.png';
import plantRadishIcon from '../assets/images/Alchemy Lab/Plant_Icons_in_Inventory/Radishicon.png';
import plantSpinachIcon from '../assets/images/Alchemy Lab/Plant_Icons_in_Inventory/spinachicon.png';
import plantSunflowerIcon from '../assets/images/Alchemy Lab/Plant_Icons_in_Inventory/Sunflowericon.png';
import plantTurnipIcon from '../assets/images/Alchemy Lab/Plant_Icons_in_Inventory/Turnipicon.png';

// Crop Spritesheets
import cropCarrotSheet from '../assets/images/Alchemy Lab/Outdoors_assets/carrot.png';
import cropChamomileSheet from '../assets/images/Alchemy Lab/Outdoors_assets/chamomile.png';
import cropOnionSheet from '../assets/images/Alchemy Lab/Outdoors_assets/onion.png';
import cropPotatoSheet from '../assets/images/Alchemy Lab/Outdoors_assets/potato.png';
import cropRadishSheet from '../assets/images/Alchemy Lab/Outdoors_assets/radish.png';
import cropRoseSheet from '../assets/images/Alchemy Lab/Outdoors_assets/rose.png';
import cropSpinachSheet from '../assets/images/Alchemy Lab/Outdoors_assets/spinach.png';
import cropSunflowerSheet from '../assets/images/Alchemy Lab/Outdoors_assets/sunflower.png';
import cropTurnipSheet from '../assets/images/Alchemy Lab/Outdoors_assets/turnip.png';
import cropOysterSheet from '../assets/images/Alchemy Lab/Outdoors_assets/oyster.png';

// Potion Icons
import potionIcon1 from '../assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon1.png';
import potionIcon2 from '../assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon2.png';
import potionIcon3 from '../assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon3.png';
import potionIcon4 from '../assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon4.png';
import potionIcon5 from '../assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon5.png';
import potionIcon6 from '../assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon6.png';
import potionIcon7 from '../assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon7.png';
import potionIcon8 from '../assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon8.png';
import potionIcon9 from '../assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon9.png';
import potionIcon10 from '../assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon10.png';
import potionIcon11 from '../assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon11.png';
import potionIcon12 from '../assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon12.png';
import potionIcon13 from '../assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon13.png';
import potionIcon14 from '../assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon14.png';
import potionIcon15 from '../assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon15.png';
import potionIcon16 from '../assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon16.png';
import potionIcon17 from '../assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon17.png';
import potionIcon18 from '../assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon18.png';
import potionIcon19 from '../assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon19.png';
import potionIcon20 from '../assets/images/Alchemy Lab/Potions_Icons_in_Inventory/Icon20.png';



export const TILE_SIZE = 16;
export const CANVAS_DIMS = { width: 48, height: 48 };
export const EGG_REQUIREMENT = 50;

export const PET_RARITIES = {
  common: 0.5,
  rare: 0.35,
  epic: 0.14,
  legendary: 0.01
};

export const cosmeticItems = {
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
  tileset_unlocks: [ // NEW: Sanctum Tileset Unlocks for the Shop
    { id: 'unlock_backgrounds', name: 'Background Schematics', type: 'tileset_unlock', cost: 200, rarity: 'common' },
    { id: 'unlock_walls_stone', name: 'Stonemasonry Guide', type: 'tileset_unlock', cost: 500, rarity: 'common' },
    { id: 'unlock_walls_panel', name: 'Fine Carpentry', type: 'tileset_unlock', cost: 500, rarity: 'common' },
    { id: 'unlock_borders', name: 'Exterior Blueprints', type: 'tileset_unlock', cost: 750, rarity: 'rare' },
    { id: 'unlock_carpets_basic', name: 'Basic Weaving', type: 'tileset_unlock', cost: 400, rarity: 'common' },
    { id: 'unlock_carpets_adv', name: 'Advanced Dyes', type: 'tileset_unlock', cost: 800, rarity: 'rare' },
    { id: 'unlock_furniture', name: 'Furniture Catalog', type: 'tileset_unlock', cost: 1200, rarity: 'rare' },
    { id: 'unlock_items', name: 'Clutter & Items', type: 'tileset_unlock', cost: 1000, rarity: 'rare' },
    { id: 'unlock_decor_basic', name: 'Basic Decor Pack', type: 'tileset_unlock', cost: 600, rarity: 'common' },
    { id: 'unlock_decor_adv', name: 'Advanced Decor Pack', type: 'tileset_unlock', cost: 1500, rarity: 'epic' },
  ],
};
export const wingmanDefinitions = {
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
export const tilesetDefinitions = {
  'sfrisk_floors': { name: 'Floors', src: SFriskFantasyInteriorFloor, widthInTiles: 3, heightInTiles: 4, usableTileCount: 12, isDefault: true },
  'sfrisk_items': { name: 'Items & Clutter', src: SFriskFantasyInteriorItems, widthInTiles: 6, heightInTiles: 3, usableTileCount: 256, unlockId: 'unlock_items' },
  'sfrisk_furniture': { name: 'Furniture', src: SFriskFantasyInteriorFurniture, widthInTiles: 6, heightInTiles: 8, usableTileCount: 256, unlockId: 'unlock_furniture' },
  'sfrisk_chairs': { name: 'Chairs', src: SFriskFantasyInteriorChair, widthInTiles: 2, heightInTiles: 1, usableTileCount: 2, unlockId: 'unlock_furniture' },
  'sfrisk_carpet_dark_green': { name: 'Dark Green Carpet', src: SFriskFantasyInteriorDarkGreenCarpet, widthInTiles: 4, heightInTiles: 6, usableTileCount: 12, unlockId: 'unlock_carpets_basic' },
  'sfrisk_carpet_light_green': { name: 'Light Green Carpet', src: SFriskFantasyInteriorLightGreenCarpet, widthInTiles: 4, heightInTiles: 6, usableTileCount: 12, unlockId: 'unlock_carpets_adv' },
  'sfrisk_carpet_red': { name: 'Red Carpet', src: SFriskFantasyInteriorRedCarpet, widthInTiles: 4, heightInTiles: 6, usableTileCount: 12, unlockId: 'unlock_carpets_basic' },
  'sfrisk_carpet_blue': { name: 'Blue Carpet', src: SFriskFantasyInteriorBlueCarpet, widthInTiles: 4, heightInTiles: 6, usableTileCount: 12, unlockId: 'unlock_carpets_adv' },
  'sfrisk_borders': { name: 'Exterior Borders', src: SFriskFantasyInteriorExteriorBorder, widthInTiles: 15, heightInTiles: 1, usableTileCount: 100, unlockId: 'unlock_borders' },
  'sfrisk_background': { name: 'Backgrounds', src: SFriskFantasyInteriorBackground, widthInTiles: 1, heightInTiles: 1, usableTileCount: 100, unlockId: 'unlock_backgrounds' },
  'sfrisk_windows': { name: 'Windows', src: SFriskFantasyInteriorWindows, widthInTiles: 3, heightInTiles: 4, usableTileCount: 16, unlockId: 'unlock_decor_basic' },
  'sfrisk_signs': { name: 'Signs', src: SFriskFantasyInteriorSign, widthInTiles: 4, heightInTiles: 3, usableTileCount:12, unlockId: 'unlock_decor_adv' },
  'sfrisk_shelves': { name: 'Shelves', src: SFriskFantasyInteriorShelf, widthInTiles: 4, heightInTiles: 4, usableTileCount: 16, unlockId: 'unlock_decor_basic' },
  'sfrisk_paintings': { name: 'Paintings', src: SFriskFantasyInteriorPainting, widthInTiles: 1, heightInTiles: 1, usableTileCount: 16, unlockId: 'unlock_decor_adv' },
  'sfrisk_fireplaces': { name: 'Fireplaces', src: SFriskFantasyInteriorFireplace, widthInTiles: 1, heightInTiles: 4, usableTileCount: 16, unlockId: 'unlock_decor_adv' },
  'sfrisk_doors': { name: 'Doors', src: SFriskFantasyInteriorDoors, widthInTiles: 2, heightInTiles: 2, usableTileCount: 4, unlockId: 'unlock_decor_basic' },
  'sfrisk_banners': { name: 'Banners', src: SFriskFantasyInteriorBanners, widthInTiles: 4, heightInTiles: 4, usableTileCount: 16, unlockId: 'unlock_decor_adv' },
  'sfrisk_walls_panel': { name: 'Wall Paneling', src: SFriskFantasyInteriorWallPaneling, widthInTiles: 14, heightInTiles: 3, usableTileCount: 100, unlockId: 'unlock_walls_panel' },
  'sfrisk_walls_wainscot': { name: 'Wainscoting Walls', src: SFriskFantasyInteriorWainscotingWall, widthInTiles: 14, heightInTiles: 3, usableTileCount: 100, unlockId: 'unlock_walls_panel' },
  'sfrisk_walls_stone': { name: 'Stone Walls', src: SFriskFantasyInteriorStoneWalls, widthInTiles: 14, heightInTiles: 3, usableTileCount: 100, unlockId: 'unlock_walls_stone' },
  'sfrisk_walls_mix1': { name: 'Paneling with Stone', src: SFriskFantasyInteriorPanelingWithStone, widthInTiles: 14, heightInTiles: 3, usableTileCount: 100, unlockId: 'unlock_walls_stone' },
  'sfrisk_walls_mix2': { name: 'Wall with Stone', src: SFriskFantasyInteriorWallwithStone, widthInTiles: 14, heightInTiles: 3, usableTileCount: 100, unlockId: 'unlock_walls_stone' },
};
export const allRollableItems = [
    ...cosmeticItems.avatars,
    ...cosmeticItems.banners,
    ...cosmeticItems.fonts,
    ...cosmeticItems.animations,
    ...cosmeticItems.titles,
    ...cosmeticItems.backgrounds,
];
export const slotMachineFillerItems = [
  ...allRollableItems,
  { id: 'filler_xp_gain_1', name: 'XP Gain', type: 'xp_gain', display: 'XP+', rarity: 'rare' },
  { id: 'filler_xp_gain_2', name: 'XP Gain', type: 'xp_gain', display: 'XP+', rarity: 'rare' },
  { id: 'filler_xp_loss_1', name: 'XP Loss', type: 'xp_loss', display: 'XP-', rarity: 'common' },
  { id: 'filler_shard_gain_1', name: 'Shard Gain', type: 'shard_gain', display: '💎', rarity: 'common' },
  { id: 'filler_shard_gain_2', name: 'Shard Gain', type: 'shard_gain', display: '💎', rarity: 'common' },
];
export const petDefinitions = {
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
export const levelTitles = [
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
export const stressEmojis = ['🌸', '😊', '😐', '😟', '💀'];
export const assignmentTags = ['Math', 'English', 'History', 'Science', 'Clubs', 'Extracurriculars', 'Personal Goals'];
export const labEquipmentDefinitions = {
  beaker: { name: 'Beaker', baseCost: 15, baseSPS: 0.1, clickPower: 0, xpUpgrade: { cost: 100, multiplier: 2 } },
  microscope: { name: 'Microscope', baseCost: 100, baseSPS: 1, clickPower: 0, xpUpgrade: { cost: 500, multiplier: 2 } },
  bunsen_burner: { name: 'Bunsen Burner', baseCost: 1100, baseSPS: 8, clickPower: 0, xpUpgrade: { cost: 2000, multiplier: 2 } },
  computer: { name: 'Super Computer', baseCost: 12000, baseSPS: 47, clickPower: 0, xpUpgrade: { cost: 10000, multiplier: 2 } },
  particle_accelerator: { name: 'Particle Accelerator', baseCost: 130000, baseSPS: 260, clickPower: 0, xpUpgrade: { cost: 50000, multiplier: 2 } },
  quantum_computer: { name: 'Quantum Computer', baseCost: 1400000, baseSPS: 1400, clickPower: 0, xpUpgrade: { cost: 100000, multiplier: 2 } },
  manual_clicker: { name: 'Manual Clicker', baseCost: 50, baseSPS: 0, clickPower: 1, xpUpgrade: { cost: 1000, multiplier: 2 } }
};
export const achievementDefinitions = {
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
export const questDefinitions = {
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
export const contractDefinitions = [
  { id: 'contract_deadline_warrior', name: 'Deadline Warrior', description: 'Complete a "Hard" assignment that is due within the next 24 hours.', deposit: 150, reward: { xp: 500, shards: 20 }, timeLimitHours: 24, type: 'completeHardDueSoon' }
];
export const cosmicEvents = [
  { id: 'asteroid_field', name: 'Asteroid Field', description: 'You successfully navigated a dense asteroid field!', weight: 10, reward: { type: 'shards', amount: 15 } }
];
export const wingmanUpgrades = {
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
export const catAnimationSheets = {
  cat1: { idle: catIdleSheet, walk: catWalkSheet, run: catRunSheet, sitting: catSittingSheet, laying: catLayingSheet, sleeping1: catSleeping1Sheet, sleeping2: catSleeping2Sheet, stretching: catStretchingSheet, licking1: catLicking1Sheet, licking2: catLicking2Sheet, itch: catItchSheet, meow: catMeowSheet },
  cat2: { idle: cat2IdleSheet, walk: cat2WalkSheet, run: cat2RunSheet, sitting: cat2SittingSheet, laying: cat2LayingSheet, sleeping1: cat2Sleeping1Sheet, sleeping2: cat2Sleeping2Sheet, stretching: cat2StretchingSheet, licking1: cat2Licking1Sheet, licking2: cat2Licking2Sheet, itch: cat2ItchSheet, meow: cat2MeowSheet },
  cat3: { idle: cat3IdleSheet, walk: cat3WalkSheet, run: cat3RunSheet, sitting: cat3SittingSheet, laying: cat3LayingSheet, sleeping1: cat3Sleeping1Sheet, sleeping2: cat3Sleeping2Sheet, stretching: cat3StretchingSheet, licking1: cat3Licking1Sheet, licking2: cat3Licking2Sheet, itch: cat3ItchSheet, meow: cat3MeowSheet },
  cat4: { idle: cat4IdleSheet, walk: cat4WalkSheet, run: cat4RunSheet, sitting: cat4SittingSheet, laying: cat4LayingSheet, sleeping1: cat4Sleeping1Sheet, sleeping2: cat4Sleeping2Sheet, stretching: cat4StretchingSheet, licking1: cat4Licking1Sheet, licking2: cat4Licking2Sheet, itch: cat4ItchSheet, meow: cat4MeowSheet },
  cat5: { idle: cat5IdleSheet, walk: cat5WalkSheet, run: cat5RunSheet, sitting: cat5SittingSheet, laying: cat5LayingSheet, sleeping1: cat5Sleeping1Sheet, sleeping2: cat5Sleeping2Sheet, stretching: cat5StretchingSheet, licking1: cat5Licking1Sheet, licking2: cat5Licking2Sheet, itch: cat5ItchSheet, meow: cat5MeowSheet },
  cat6: { idle: cat6IdleSheet, walk: cat6WalkSheet, run: cat6RunSheet, sitting: cat6SittingSheet, laying: cat6LayingSheet, sleeping1: cat6Sleeping1Sheet, sleeping2: cat6Sleeping2Sheet, stretching: cat6StretchingSheet, licking1: cat6Licking1Sheet, licking2: cat6Licking2Sheet, itch: cat6ItchSheet, meow: cat6MeowSheet },
};
export const alchemyIngredients = {
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
export const alchemyPlants = {
  'seed_focuroot': { id: 'seed_focuroot', name: 'Focuroot Seed', yields: 'focuroot', growthTimeSeconds: 60 * 30, spritesheet: cropCarrotSheet },
  'seed_swiftblossom': { id: 'seed_swiftblossom', name: 'Swiftblossom Seed', yields: 'swiftblossom', growthTimeSeconds: 60 * 45, spritesheet: cropSpinachSheet },
  'seed_stillpetal': { id: 'seed_stillpetal', name: 'Stillpetal Seed', yields: 'stillpetal', growthTimeSeconds: 60 * 60, spritesheet: cropRoseSheet },
  'seed_oyster_mushroom': { id: 'seed_oyster_mushroom', name: 'Mushroom Spores', yields: 'oyster_mushroom', growthTimeSeconds: 60 * 75, spritesheet: cropOysterSheet },
  'seed_sunfruit': { id: 'seed_sunfruit', name: 'Sunfruit Seed', yields: 'sunfruit', growthTimeSeconds: 60 * 120, spritesheet: cropSunflowerSheet },
  'seed_luckleaf': { id: 'seed_luckleaf', name: 'Chamomile Seed', yields: 'luckleaf', growthTimeSeconds: 60 * 240, spritesheet: cropChamomileSheet },
};
export const alchemyPotions = {
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
export const starChartData = {
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
export const alchemyShopItems = {
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
export const fortressUpgradeDefinitions = {
  common: [
    { id: 'player_speed', name: 'Momentum', description: 'Increases your movement speed by 15%.', maxLevel: 5 },
    { id: 'drop_magnet', name: 'Drop Magnetism', description: 'Increases gold and XP collection radius by 30%.', maxLevel: 5 },
    { id: 'focused_power', name: 'Focused Power', description: 'Increases your projectile damage by 2.', maxLevel: 5 },
  ],
  rare: [
    { id: 'xp_boost', name: 'Learning Algorithm', description: 'Gain 25% more XP from defeated enemies.', maxLevel: 3 },
    { id: 'gold_boost', name: 'Efficient Looting', description: 'Enemies drop 20% more gold.', maxLevel: 3 },
    { id: 'piercing_shot', name: 'Piercing Shot', description: 'Your projectiles pierce through 1 additional enemy.', maxLevel: 3 },
    { id: 'tower_discount', name: 'Engineering Degree', description: 'Reduces the cost of building and upgrading towers by 10%.', maxLevel: 3 },
  ],
  epic: [
    { id: 'quick_recovery', name: 'Quick Recovery', description: 'Reduces the attack cooldown from an incorrect answer by 20%.', maxLevel: 2 },
    { id: 'multishot', name: 'Multishot', description: 'Fire two additional projectiles in a cone.', maxLevel: 1 },
    { id: 'tower_overclock', name: 'Tower Overclock', description: 'All towers fire 15% faster.', maxLevel: 2 },
    { id: 'reinforced_construction', name: 'Reinforced Construction', description: 'All towers are built with 25% more health.', maxLevel: 2 },
  ],
};
export const survivorEnemyDefinitions = {
  scamp: { name: 'Scamp', health: 8, speed: 0.09, type: 'runner', gold: 8, icon: enemyScampIcon }, // Was 0.12
  ogre: { name: 'Ogre', health: 100, speed: 0.011, type: 'brute', gold: 40, icon: enemyOgreIcon }, // Was 0.015
  shaman: { name: 'Shaman', health: 40, speed: 0.03, type: 'healer', gold: 30, healPower: 10, healRadius: 100, healCooldown: 5000, lastHeal: 0, icon: enemyShamanIcon }, // Was 0.04
  specter: { name: 'Specter', health: 35, speed: 0.04, type: 'bypass', gold: 20, isEthereal: true, icon: enemySpecterIcon }, // Was 0.05
  sapper: { name: 'Sapper', health: 5, speed: 50, type: 'tower-buster', gold: 15, damage: 75, icon: enemySapperIcon }, // Was 35
  default: { name: 'Term', health: 15, speed: 0.04, type: 'normal', gold: 10, icon: enemyDefaultIcon } // Was 0.05
};
export const survivorTowerDefinitions = {
  sentry: {
    name: 'Sentry Turret',
    baseCost: 50,
    base: { damage: 2, fireRate: 1, range: 150, maxHealth: 100, projectileType: 'sentry_bullet' },
    upgrades: {
      tier1: [
        { id: 'sentry_dmg1', name: 'Damage I', cost: 75, effect: { damage: 2 }, description: "+2 Damage" },
        { id: 'sentry_spd1', name: 'Speed I', cost: 100, effect: { fireRate: 1.5 }, description: "x1.5 Fire Rate" },
      ],
      tier2: [
        { id: 'sentry_spec_gatling', name: 'Spec: Gatling Gun', cost: 300, path: 'gatling', requires: ['sentry_spd1'], effect: { fireRate: 2.5 }, description: "Massively increases fire rate again." },
        { id: 'sentry_spec_heavy', name: 'Spec: Heavy Caliber', cost: 300, path: 'heavy', requires: ['sentry_dmg1'], effect: { damage: 8 }, description: "Massively increases damage." },
      ],
      tier3: [
        { id: 'sentry_gatling_dmg', name: 'Gatling Damage', cost: 250, requires: ['sentry_spec_gatling'], effect: { damage: 3 }, description: "+3 Damage" },
        { id: 'sentry_heavy_spd', name: 'Heavy Speed', cost: 250, requires: ['sentry_spec_heavy'], effect: { fireRate: 1.3 }, description: "x1.3 Fire Rate" },
      ]
    }
  },
  cannon: {
    name: 'Cannon Tower',
    baseCost: 125,
    base: { damage: 10, fireRate: 0.4, range: 120, maxHealth: 150, projectileType: 'cannonball', aoeRadius: 40 },
    upgrades: {
      tier1: [
        { id: 'cannon_dmg1', name: 'Damage I', cost: 150, effect: { damage: 8 }, description: "+8 Damage" },
        { id: 'cannon_aoe1', name: 'Wider Blast', cost: 200, effect: { aoeRadius: 20 }, description: "+20 Blast Radius" },
      ]
    }
  },
  mage: {
    name: 'Mage Tower',
    baseCost: 150,
    base: { damage: 5, fireRate: 0.8, range: 160, maxHealth: 80, canHitEthereal: true, slow: { amount: 0.3, duration: 1500 } },
    upgrades: {
      tier1: [
        { id: 'mage_dmg1', name: 'Power I', cost: 175, effect: { damage: 4 }, description: "+4 Damage" },
        { id: 'mage_slow1', name: 'Deeper Freeze', cost: 225, effect: { slow: { amount: 0.2 } }, description: "+20% Slow" },
      ]
    }
  },
  sniper: {
    name: 'Sniper Tower',
    baseCost: 250,
    base: { damage: 25, fireRate: 0.2, range: 300, maxHealth: 75, targetPriority: 'strongest' },
    upgrades: {
      tier1: [
        { id: 'sniper_dmg1', name: 'Heavy Caliber', cost: 300, effect: { damage: 25 }, description: "+25 Damage" },
      ]
    }
  },
  bank: {
    name: 'Bank',
    baseCost: 75,
    base: { income: 2, fireRate: 1, maxHealth: 50 },
    upgrades: {
      tier1: [
        { id: 'bank_inc1', name: 'Interest I', cost: 100, effect: { income: 2 }, description: "+2 Gold/sec" },
        { id: 'bank_inc2', name: 'Interest II', cost: 250, effect: { income: 4 }, description: "+4 Gold/sec" },
      ]
    }
  },
};
export const fortressBossDefinitions = {
  juggernaut: {
    name: 'The Juggernaut',
    health: 5000,
    speed: 0.01,
    gold: 500,
    xp: 5,
    icon: enemyOgreIcon,
    abilities: [
      { id: 'tower_stun', cooldown: 10000, lastUse: 0, description: 'Disables a random tower.' },
      { id: 'spawn_minions', cooldown: 15000, lastUse: 0, description: 'Spawns a group of Scamps.' },
    ]
  }
};
export const survivorBuffDefinitions = {
  rapid_fire: { name: 'Rapid Fire', cost: 100, duration: 10000 },
  gold_rush: { name: 'Gold Rush', cost: 250, duration: 15000 },
};
