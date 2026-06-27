import React, { useState, useEffect, useRef, useCallback } from 'react';
import { starChartData } from '../constants/constants';
import { showMessageBox } from '../utils/helpers';

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
        <img src={cockpitImage} loading="lazy" alt="Cockpit View" className="absolute top-0 left-0 w-full h-full object-contain pointer-events-none z-10" />

        {/* --- DIEGETIC UI ELEMENTS (Positioned relative to the master container) --- */}
        <div className="absolute z-0 pointer-events-none" style={{ top: '23%', left: '33%', width: '34%', height: '40%' }}>
            <div className="absolute top-1/2" style={{ left: `${mainViewProgressPercent}%`, transform: `translate(-50%, -50%) translateY(${verticalArc}px)` }}>
                <img src={spaceshipIcon} alt="Scholar Ship" loading="lazy" className="w-10 h-10" />
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

const AssignmentTracker = ({ stats, assignments, setIsAddModalOpen, handleCompletedToggle, updateAssignmentInFirestore, deleteAssignmentFromFirestore, promptMissionStart, isMobile, onLoadMore, hasMore, onTogglePin, updateStatsInFirestore }) => {
    const [expandedAssignmentId, setExpandedAssignmentId] = useState(null);
    const [editingAssignmentData, setEditingAssignmentData] = useState(null);
    const [newSubtaskName, setNewSubtaskName] = useState('');

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
                      <tr className={`border-b border-slate-700 hover:bg-slate-800/70 transition-colors ${assignment.isEpicQuest ? 'bg-indigo-900/30' : ''} ${assignment.pinned ? 'bg-amber-900/20 border-l-4 border-amber-500' : ''}`}>
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
                             <button onClick={() => onTogglePin(assignment.id, assignment.pinned)} className={`p-1 ${assignment.pinned ? 'text-yellow-400' : 'text-slate-500 hover:text-yellow-300'}`} title={assignment.pinned ? "Unpin" : "Pin to Top"}>
                              📌
                            </button>
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
            {hasMore && (
              <div className="p-4 text-center">
                <button onClick={onLoadMore} className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-5 py-2 rounded-lg">
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


export { AssignmentTracker, WeeklyTriageModal, WhyTab, MissionControlModal, CockpitView };
