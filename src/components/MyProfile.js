import React, { useState, useEffect, useRef } from 'react';
import { cosmeticItems } from '../constants/constants';

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

const BreakPasscodeRewardModal = ({ isOpen, onClose, passcode }) => {
  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(passcode).then(() => {
      showMessageBox("Passcode copied to clipboard!", "info");
    }).catch(err => {
      showMessageBox("Failed to copy passcode.", "error");
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
      <div className="bg-slate-900 border-2 border-indigo-500 rounded-2xl shadow-2xl p-8 w-full max-w-lg text-center text-white">
        <h2 className="text-3xl font-bold text-green-400 mb-4">Reward Unlocked!</h2>
        <p className="text-slate-300 mb-6">You've earned a break! Use this passcode in the blocker's 'stop.py' script to pause it.</p>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6 font-mono text-lg break-all">
          {passcode}
        </div>

        <div className="flex justify-center gap-4">
          <button 
            onClick={handleCopy}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors"
          >
            Copy Passcode
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-slate-600 hover:bg-slate-500 rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const AvailabilityPreferencesModal = ({ isOpen, onClose, currentPrefs, onSave }) => {
  // Initialize with time grid format: array of 7 days, each with 24 hour slots
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeBlocks = ['12am', '1am', '2am', '3am', '4am', '5am', '6am', '7am', '8am', '9am', '10am', '11am', '12pm', '1pm', '2pm', '3pm', '4pm', '5pm', '6pm', '7pm', '8pm', '9pm', '10pm', '11pm'];
  
  // Parse current prefs or create empty grid
  const [timeGrid, setTimeGrid] = useState(
    currentPrefs?.timeGrid || Array(7).fill(null).map(() => Array(24).fill(false))
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState('select'); // 'select' or 'deselect'

  useEffect(() => {
    if (isOpen) {
      setTimeGrid(currentPrefs?.timeGrid || Array(7).fill(null).map(() => Array(24).fill(false)));
      setIsDragging(false);
    }
  }, [isOpen, currentPrefs]);

  // Handle mouseup to stop dragging
  useEffect(() => {
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleMouseUp);
      return () => document.removeEventListener('mouseup', handleMouseUp);
    }
  }, [isDragging]);

  const handleCellMouseDown = (day, hour) => {
    setIsDragging(true);
    setDragMode(!timeGrid[day][hour] ? 'select' : 'deselect');
    toggleCell(day, hour);
  };

  const handleCellMouseEnter = (day, hour) => {
    if (isDragging) {
      const newGrid = timeGrid.map(row => [...row]);
      newGrid[day][hour] = dragMode === 'select';
      setTimeGrid(newGrid);
    }
  };

  const toggleCell = (day, hour) => {
    const newGrid = timeGrid.map(row => [...row]);
    newGrid[day][hour] = !newGrid[day][hour];
    setTimeGrid(newGrid);
  };

  const fillDay = (dayIndex) => {
    const newGrid = timeGrid.map((row, idx) => idx === dayIndex ? Array(24).fill(true) : [...row]);
    setTimeGrid(newGrid);
  };

  const clearDay = (dayIndex) => {
    const newGrid = timeGrid.map((row, idx) => idx === dayIndex ? Array(24).fill(false) : [...row]);
    setTimeGrid(newGrid);
  };

  const fillAllDays = () => {
    setTimeGrid(Array(7).fill(null).map(() => Array(24).fill(true)));
  };

  const clearAllDays = () => {
    setTimeGrid(Array(7).fill(null).map(() => Array(24).fill(false)));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-slate-700 p-6 rounded-lg w-full max-w-6xl shadow-lg my-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4 font-mono text-green-400">Set Your Availability</h3>
        <p className="text-sm text-slate-400 mb-4">Click and drag to select times when you're available for group operations. <strong>Green</strong> = Available, <strong>Gray</strong> = Not Available.</p>
        
        <div className="flex justify-end gap-2 mb-4">
          <button onClick={fillAllDays} className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 rounded">Fill All</button>
          <button onClick={clearAllDays} className="px-3 py-1 text-xs bg-red-600 hover:bg-red-700 rounded">Clear All</button>
        </div>

        <div className="overflow-x-auto bg-slate-800/50 rounded-lg p-4">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                <th className="bg-slate-700 p-2 text-left">Day</th>
                {timeBlocks.map(time => (
                  <th key={time} className="bg-slate-700 p-1 text-center h-8 text-xs">{time}</th>
                ))}
                <th className="bg-slate-700 p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {dayNames.map((day, dayIndex) => (
                <tr key={day}>
                  <td className="bg-slate-800 p-2 font-semibold text-slate-300">{day}</td>
                  {Array(24).fill(null).map((_, hour) => (
                    <td
                      key={`${dayIndex}-${hour}`}
                      onMouseDown={() => handleCellMouseDown(dayIndex, hour)}
                      onMouseEnter={() => handleCellMouseEnter(dayIndex, hour)}
                      className={`p-1 border border-slate-700 cursor-pointer h-8 transition-colors ${
                        timeGrid[dayIndex][hour] ? 'bg-green-600/60 hover:bg-green-500' : 'bg-slate-700 hover:bg-slate-600'
                      }`}
                    />
                  ))}
                  <td className="bg-slate-800 p-2 flex gap-1">
                    <button onClick={() => fillDay(dayIndex)} className="px-2 py-0.5 text-xs bg-green-700 hover:bg-green-600 rounded">Fill</button>
                    <button onClick={() => clearDay(dayIndex)} className="px-2 py-0.5 text-xs bg-red-700 hover:bg-red-600 rounded">Clear</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-slate-700">
          <button onClick={onClose} className="px-5 py-2 bg-slate-600 rounded hover:bg-slate-500">Cancel</button>
          <button onClick={() => onSave({ timeGrid })} className="px-5 py-2 bg-green-600 text-black font-bold rounded hover:bg-green-700">Save Preferences</button>
        </div>
      </div>
    </div>
  );
};

const MyProfile = ({ stats, user, userId, updateStatsInFirestore, handleEvolvePet, getFullPetDetails, getFullCosmeticDetails, getItemStyle, db, appId, showMessageBox, actionLock, processAchievement, calculateLevelInfo, onAcceptInvite, onDeclineInvite, divisionData, friendProfiles }) => {
  const [draftState, setDraftState] = useState({ ...stats });
  const [activeTab, setActiveTab] = useState('collections');
  const [friendUsernameInput, setFriendUsernameInput] = useState('');
  const [friendUidInput, setFriendUidInput] = useState('');
  const [addFriendMethod, setAddFriendMethod] = useState('username');
  const [viewingFriendProfile, setViewingFriendProfile] = useState(null);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  
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
        
        const isTilesetUnlock = item.type === 'tileset_unlock';
        if (!isTilesetUnlock && (serverStats.ownedItems || []).includes(item.id)) throw new Error("Already owned.");
        if (isTilesetUnlock && (serverStats.unlockedTilesets || []).includes(item.id)) throw new Error("Already owned.");

        const updateData = {
            totalXP: increment(-item.cost),
            'cooldowns.buyShopItem': serverTimestamp()
        };

        if (isTilesetUnlock) {
            updateData.unlockedTilesets = arrayUnion(item.id);
        } else {
            updateData.ownedItems = arrayUnion(item.id);
        }
        
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
  
  const handleSaveAvailability = (prefs) => {
    updateStatsInFirestore({ availabilityPreferences: prefs });
    setIsAvailabilityModalOpen(false);
    showMessageBox("Availability preferences saved!", "info");
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

  const handleAddFriendByUserId = () => actionLock(async () => {
    const uid = friendUidInput.trim();
    if (!uid) { showMessageBox('User ID cannot be empty.', 'error'); return; }
    if (uid === user.uid) { showMessageBox("You can't add yourself.", 'error'); return; }
    if (draftState.friends.includes(uid)) {
      showMessageBox(`This user is already your friend.`, 'error');
      return;
    }

    try {
      // FIX: Query the public `usernames` collection instead of the private `stats` doc.
      const usernamesCollectionRef = collection(db, 'usernames');
      const q = query(usernamesCollectionRef, where("userId", "==", uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
          showMessageBox(`User with ID "${uid}" not found.`, "error");
          return;
      }

      // The username is the ID of the document in this collection.
      const friendUsername = querySnapshot.docs[0].id;
      
      setDraftState(prev => ({ ...prev, friends: [...prev.friends, uid] }));
      setFriendUidInput('');
      showMessageBox(`Added ${friendUsername} as a friend! Remember to save changes.`, 'info');

    } catch (error) {
        console.error("Error adding friend by User ID:", error);
        showMessageBox("An error occurred while trying to add friend.", "error");
    }
  });

  const copyUserIdToClipboard = () => {
    navigator.clipboard.writeText(userId).then(() => showMessageBox('User ID copied!', 'info'), () => showMessageBox('Failed to copy.', 'error'));
  };

  const TabButton = ({ tabName, children }) => (
    <button onClick={() => setActiveTab(tabName)} className={`px-4 py-2 text-lg font-semibold transition-colors duration-200 ease-in-out ${activeTab === tabName ? 'text-accent border-b-2 border-accent' : 'text-slate-400 hover:text-white'}`}>
      {children}
    </button>
  );

  const pendingInvites = (stats.squadInvites || []).map(id => divisionData[id]).filter(Boolean);

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
          <TabButton tabName="invites">Invites ({pendingInvites.length})</TabButton>
          <TabButton tabName="settings">Settings</TabButton>
        </div>
        
        <div className="p-6">
          {activeTab === 'invites' && (
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4">Division Invites</h3>
              <div className="space-y-3">
                {pendingInvites.length > 0 ? pendingInvites.map(invite => (
                  <div key={invite.id} className="bg-slate-700/50 p-3 rounded-lg flex justify-between items-center">
                    <div>
                      <p className="font-bold">{invite.squadName}</p>
                      <p className="text-xs text-slate-400">Led by: {Object.values(invite.members).find(m => m.uid === invite.leaderId)?.username || '...'} | Members: {Object.keys(invite.members).length}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onDeclineInvite(invite.id)} className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Decline</button>
                      <button onClick={() => onAcceptInvite(invite.id)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Accept</button>
                    </div>
                  </div>
                )) : (
                  <p className="text-slate-500 text-center">No pending invites.</p>
                )}
              </div>
            </div>
          )}
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
                <h3 className="text-2xl font-semibold text-white mb-3">Tile Schematics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {/* THIS IS THE FIX */}
                    {cosmeticItems.tileset_unlocks.filter(item => item.cost > 0).map(item => {
                        const isOwned = (stats.unlockedTilesets || []).includes(item.id);
                        const canAfford = stats.totalXP >= item.cost;
                        
                        // Find a representative tile for the preview
                        const previewTilesetKey = Object.keys(tilesetDefinitions).find(key => tilesetDefinitions[key].unlockId === item.id);
                        let previewStyle = {};
                        if (previewTilesetKey && tilesetData) {
                            const tilesetMeta = tilesetData[previewTilesetKey];
                            if (tilesetMeta) {
                                // FIX: Instead of the first tile (which might be empty), pick a more representative one.
                                // The second tile (offset + 1) is a safe choice. Handle edge case of 1-tile sheets.
                                const previewTileId = tilesetMeta.totalTiles > 1 ? tilesetMeta.offset + 1 : tilesetMeta.offset;
                                previewStyle = getSanctumTileStyle(previewTileId);
                            }
                        }
                        
                        // Extract a category name from the item name for clarity
                        const category = item.name.replace("Schematics", "").replace("Guide", "").replace("Catalog", "").replace("Blueprints", "").replace("Pack", "").trim();

                        return (
                            <div key={item.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col text-center">
                                <div className="w-full h-20 mb-3 rounded bg-slate-700 flex items-center justify-center overflow-hidden" style={{ backgroundImage: 'linear-gradient(45deg, #3f3f46 25%, transparent 25%), linear-gradient(-45deg, #3f3f46 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #3f3f46 75%), linear-gradient(-45deg, transparent 75%, #3f3f46 75%)', backgroundSize: '32px 32px' }}>
                                  <div className="w-16 h-16" style={previewStyle} />
                                </div>
                                <p className="font-semibold text-white flex-grow">{item.name}</p>
                                <p className="text-xs text-slate-400 capitalize mb-1">Unlocks: {category}</p>
                                <p className="text-xs text-slate-400 capitalize mb-3">{item.rarity}</p>
                                <button onClick={() => handleBuyItem(item)} disabled={isOwned || !canAfford} className={`w-full px-3 py-1.5 rounded text-sm font-semibold transition-colors ${isOwned ? 'bg-green-500/20 text-green-400 cursor-default' : !canAfford ? 'bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>{isOwned ? 'Owned' : `${item.cost} XP`}</button>
                            </div>
                        );
                    })}
                </div>
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
          {activeTab === 'settings' && (
            <div>
              <h3 className="text-2xl font-semibold text-white mb-4">User Settings</h3>
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold text-white mb-2">Scheduling Preferences</h4>
                <p className="text-sm text-slate-400 mb-3">Help the Strategic Opportunity Finder by setting your preferred collaboration times.</p>
                <button onClick={() => setIsAvailabilityModalOpen(true)} className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700">
                  Edit Availability
                </button>
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
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-grow"><label className="text-sm text-slate-400 block mb-1">Your User ID (for sharing)</label><div onClick={copyUserIdToClipboard} className="p-3 bg-slate-700 border border-slate-600 rounded-md cursor-pointer truncate">{userId}</div></div>
                <div className="flex-grow">
                  <div className="flex border-b border-slate-600 mb-2">
                    <button onClick={() => setAddFriendMethod('username')} className={`px-3 py-1 text-sm ${addFriendMethod === 'username' ? 'border-b-2 border-indigo-400 text-white' : 'text-slate-400'}`}>Add by Username</button>
                    <button onClick={() => setAddFriendMethod('uid')} className={`px-3 py-1 text-sm ${addFriendMethod === 'uid' ? 'border-b-2 border-indigo-400 text-white' : 'text-slate-400'}`}>Add by User ID</button>
                  </div>
                  {addFriendMethod === 'username' ? (
                    <div className="flex gap-2">
                      <input id="friendUsername" type="text" value={friendUsernameInput} onChange={(e) => setFriendUsernameInput(e.target.value)} placeholder="Enter friend's username" className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500"/>
                      <button onClick={handleAddFriendByUsername} className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700">Add</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input id="friendUid" type="text" value={friendUidInput} onChange={(e) => setFriendUidInput(e.target.value)} placeholder="Enter friend's User ID" className="flex-grow p-3 bg-slate-700 border border-slate-600 rounded-md focus:ring-2 focus:ring-indigo-500"/>
                      <button onClick={handleAddFriendByUserId} className="bg-indigo-600 text-white px-5 py-2 rounded-md hover:bg-indigo-700">Add</button>
                    </div>
                  )}
                </div>
              </div>
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
      <AvailabilityPreferencesModal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        currentPrefs={stats.availabilityPreferences}
        onSave={handleSaveAvailability}
      />
    </div>
  );
};


export { MyProfile, AvailabilityPreferencesModal, FriendProfileModal, BreakPasscodeRewardModal };
