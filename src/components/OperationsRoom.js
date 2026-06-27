import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { db, collection, query, where, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, deleteDoc, getDocs, writeBatch, appId, deleteField, serverTimestamp, addDoc, runTransaction } from '../utils/firestore';

import { increment } from 'firebase/firestore';
import { stressEmojis, assignmentTags } from '../constants/constants';

const CreateDivisionModal = ({ isOpen, onClose, onCreateDivision, divisionCount }) => {
  const [divisionName, setDivisionName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (divisionName.trim().length > 2) {
      onCreateDivision(divisionName.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-slate-700 p-6 rounded-lg w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4 font-mono text-green-400">FORM A NEW DIVISION</h3>
        <form onSubmit={handleSubmit}>
          <input 
            type="text"
            value={divisionName}
            onChange={(e) => setDivisionName(e.target.value)}
            placeholder="Division Name (e.g., The Vanguard)"
            className="w-full p-3 bg-slate-800 rounded-md border border-slate-600 focus:ring-2 focus:ring-green-500 font-mono"
            maxLength="30"
          />
          <div className="flex justify-end gap-4 mt-6">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-600 rounded hover:bg-slate-500">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-green-600 rounded hover:bg-green-700 disabled:bg-slate-500 disabled:cursor-not-allowed" disabled={divisionName.trim().length < 3 || divisionCount >= 3}>
              {divisionCount >= 3 ? 'Limit Reached' : 'Form Division'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OperationsRoomHelpModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-slate-700 p-8 rounded-lg w-full max-w-2xl shadow-lg prose prose-invert prose-slate" onClick={e => e.stopPropagation()}>
        <h2 className="font-mono text-green-400">MISSION BRIEFING: THE OPERATIONS ROOM</h2>
        <h4>Objective</h4>
        <p>The Operations Room is your command center for collaborative success. Its purpose is to synchronize efforts with your allies (friends) in shared "Divisions" to conquer academic and personal goals.</p>
        
        <h4>Key Features</h4>
        <ul>
          <li><strong>Form Divisions:</strong> Create or join small, focused groups (up to 3) to tackle specific subjects, projects, or goals.</li>
          <li><strong>Strategy Calendar:</strong> A shared calendar where every member can post their personal commitments (classes, work) and propose group operations (study sessions, project meetings).</li>
          <li><strong>Visual Intelligence:</strong> Each division member is assigned a unique color. At a glance, you can see who is busy on any given day, making it easy to identify windows of opportunity for collaboration.</li>
          <li><strong>Coordinate Operations:</strong> Schedule group study sessions and link them directly to assignments from your tracker. This ensures everyone is focused on the same objective.</li>
        </ul>

        <h4>The Goal</h4>
        <p>By sharing scheduling information, you eliminate the back-and-forth of planning. Use this tool to find the optimal times to work together, hold each other accountable, and turn individual assignments into team victories.</p>

        <div className="text-center mt-6">
          <button onClick={onClose} className="px-6 py-2 bg-indigo-600 rounded hover:bg-indigo-700">Understood</button>
        </div>
      </div>
    </div>
  );
}

const DayDetailModal = ({ isOpen, onClose, dayData, divisionMembers, allAssignments, user, onRsvp, onDeleteEvent, onVoteToDelete, isRsvping, onEditEvent }) => {
  if (!isOpen) return null;

  const { date, events } = dayData;
  const memberMap = divisionMembers.reduce((acc, member) => {
    acc[member.uid] = member;
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-slate-700 p-6 rounded-lg w-full max-w-2xl shadow-lg" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4 font-mono text-green-400">Operations for {date.toLocaleDateString()}</h3>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          {events.length > 0 ? events.map(event => {
            const memberColor = divisionMembers.find(m => m.uid === event.creatorId)?.color || '#94a3b8';
            const eventTypeLabel = event.eventType === 'group_operation' ? 'Group Operation' : 'Personal Commitment';
            
            return (
              <div key={event.id} className="bg-slate-800/70 p-3 rounded-md flex items-start gap-3">
                <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: memberColor }} />
                <div className="flex-grow">
                  <p className="font-bold text-white">{event.title}</p>
                  <p className="text-sm text-slate-400">
                    {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                    {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs">
                    <span className={`px-2 py-0.5 rounded-full ${event.priority === 'High' ? 'bg-red-500/30 text-red-300' : event.priority === 'Medium' ? 'bg-yellow-500/30 text-yellow-300' : 'bg-slate-600'}`}>{event.priority}</span>
                    <span className="text-slate-500">•</span>
                    <span className="text-slate-400">{eventTypeLabel} by {event.creatorUsername}</span>
                  </div>
                  {event.linkedAssignmentId && (
                    <div className="mt-2 text-xs text-indigo-300 border-t border-slate-700/50 pt-2">
                      <strong>Linked Assignment:</strong> {allAssignments.find(a => a.id === event.linkedAssignmentId)?.assignment || 'Unknown'}
                    </div>
                  )}
                  {/* RSVP and Delete UI */}
                  <div className="mt-3 pt-3 border-t border-slate-700/50 flex justify-between items-center">
                    {event.eventType === 'group_operation' ? (
                      <div className="flex items-center gap-2" title={`Attending: ${(event.rsvps || []).map(uid => divisionMembers.find(m => m.uid === uid)?.username || '...').join(', ')}`}>
                        <button 
                          onClick={() => onRsvp(event.id, true)} 
                          disabled={isRsvping === event.id}
                          className={`px-3 py-1 text-xs rounded transition-colors ${event.rsvps?.includes(user.uid) ? 'bg-green-600 text-white' : 'bg-slate-600 hover:bg-slate-500'} disabled:bg-slate-500 disabled:cursor-wait`}
                        >
                          {isRsvping === event.id ? '...' : `I'm In (${event.rsvps?.length || 0})`}
                        </button>
                        <button 
                          onClick={() => onRsvp(event.id, false)} 
                          disabled={isRsvping === event.id}
                          className="px-3 py-1 text-xs rounded bg-slate-600 hover:bg-slate-500 disabled:bg-slate-500 disabled:cursor-wait"
                        >
                          {isRsvping === event.id ? '...' : 'Decline'}
                        </button>
                      </div>
                    ) : <div />}
                    <div className="flex gap-2">
                      {event.creatorId === user.uid && (
                        <button onClick={() => onEditEvent(event)} className="text-xs text-indigo-400 hover:text-indigo-300">Edit</button>
                      )}
                      {event.creatorId === user.uid ? (
                        <button onClick={() => onDeleteEvent(event.id)} className="text-xs text-red-400 hover:text-red-300">Delete Operation</button>
                      ) : (
                        <button onClick={() => onVoteToDelete(event.id)} className="text-xs text-yellow-400 hover:text-yellow-300">
                          Vote to Delete ({event.deleteVotes?.length || 0}/{Math.ceil(divisionMembers.length / 2)})
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          }) : (
            <p className="text-slate-400 text-center py-8">No operations scheduled for this day.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const FindTimeModal = ({ isOpen, onClose, onSchedule, onFind, assignments }) => {
  const [step, setStep] = useState('params'); // 'params' or 'results'
  const [params, setParams] = useState({ duration: 120, linkedAssignmentId: '' });
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('params');
      setSuggestions([]);
      setParams({ duration: 120, linkedAssignmentId: '' });
    }
  }, [isOpen]);

  const handleFindClick = async () => {
    setIsLoading(true);
    const results = await onFind(params);
    setSuggestions(results);
    setIsLoading(false);
    setStep('results');
  };

  const linkedAssignment = assignments.find(a => a.id === params.linkedAssignmentId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-slate-700 p-6 rounded-lg w-full max-w-2xl shadow-lg" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4 font-mono text-green-400">Strategic Opportunity Finder</h3>
        {step === 'params' && (
          <div className="space-y-4">
            <p className="text-sm text-slate-400">Set the parameters for your operation to find the best time to meet.</p>
            <div>
              <label htmlFor="duration" className="block text-sm font-bold text-slate-400 mb-1">Operation Duration</label>
              <select name="duration" value={params.duration} onChange={e => setParams(p => ({...p, duration: parseInt(e.target.value)}))} className="w-full p-2 bg-slate-800 rounded-md border border-slate-600">
                <option value={60}>1 Hour</option>
                <option value={90}>1.5 Hours</option>
                <option value={120}>2 Hours</option>
                <option value={180}>3 Hours</option>
              </select>
            </div>
            <div>
              <label htmlFor="linkedAssignmentId" className="block text-sm font-bold text-slate-400 mb-1">Link to Assignment (Optional)</label>
              <select name="linkedAssignmentId" value={params.linkedAssignmentId} onChange={e => setParams(p => ({...p, linkedAssignmentId: e.target.value}))} className="w-full p-2 bg-slate-800 rounded-md border border-slate-600">
                <option value="">-- None --</option>
                {assignments.map(a => <option key={a.id} value={a.id}>{a.assignment}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
              <button onClick={onClose} className="px-5 py-2 bg-slate-600 rounded hover:bg-slate-500">Cancel</button>
              <button onClick={handleFindClick} className="px-5 py-2 bg-green-600 text-black font-bold rounded hover:bg-green-700">Find Time</button>
            </div>
          </div>
        )}
        {step === 'results' && (
          <div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {isLoading ? <p className="text-center">Analyzing schedules...</p> : suggestions.length > 0 ? suggestions.map((slot, index) => (
                <div key={index} className="bg-slate-800/70 p-3 rounded-md flex justify-between items-center">
                  <div>
                    <p className="font-bold text-white">{slot.start.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    <div className="flex items-center gap-2 text-xs mt-1">
                        <span className="text-green-400">✅ {slot.availableMembers}/{slot.totalMembers} Available</span>
                        {linkedAssignment && slot.deadlineScore < 0 && <span className="text-red-400">🚨 Near Deadline!</span>}
                    </div>
                  </div>
                  <button onClick={() => onSchedule(slot.start)} className="bg-green-600 text-black font-bold px-4 py-1 rounded hover:bg-green-700">Schedule</button>
                </div>
              )) : (
                <p className="text-slate-400 text-center py-8">Could not find any optimal time slots.</p>
              )}
            </div>
            <button onClick={() => setStep('params')} className="mt-4 text-sm text-indigo-400 hover:underline">Back to Parameters</button>
          </div>
        )}
      </div>
    </div>
  );
};

const AddEventModal = ({ isOpen, onClose, onAddEvent, activeDivision, assignments, showMessageBox, prefilledTime, editingEvent }) => {
  const [eventData, setEventData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    priority: 'Medium',
    eventType: 'group_operation',
    recurrenceType: 'none',
    recurrenceEndDate: '',
    linkedAssignmentId: '',
  });

  // Effect to reset form when modal is reopened for a new event or when editing an event
  useEffect(() => {
    if (isOpen) {
      if (editingEvent) {
        // Pre-fill with editing event data
        const startTimeISO = new Date(editingEvent.startTime.getTime() - (editingEvent.startTime.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        const endTimeISO = new Date(editingEvent.endTime.getTime() - (editingEvent.endTime.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
        
        setEventData({
          title: editingEvent.title || '',
          startTime: startTimeISO,
          endTime: endTimeISO,
          priority: editingEvent.priority || 'Medium',
          eventType: editingEvent.eventType || 'group_operation',
          recurrenceType: editingEvent.recurrenceType || 'none',
          recurrenceEndDate: editingEvent.recurrenceEndDate ? new Date(editingEvent.recurrenceEndDate.getTime() - (editingEvent.recurrenceEndDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : '',
          linkedAssignmentId: editingEvent.linkedAssignmentId || '',
        });
      } else {
        // Convert prefilledTime to the format required by datetime-local input
        const startTimeISO = prefilledTime ? new Date(prefilledTime.getTime() - (prefilledTime.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '';
        const endTimeDate = prefilledTime ? new Date(prefilledTime.getTime() + 3600000) : '';
        const endTimeISO = endTimeDate ? new Date(endTimeDate.getTime() - (endTimeDate.getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '';

        setEventData({
          title: '', 
          startTime: startTimeISO, 
          endTime: endTimeISO, 
          priority: 'Medium',
          eventType: 'group_operation', 
          recurrenceType: 'none', 
          recurrenceEndDate: '',
          linkedAssignmentId: '',
        });
      }
    }
  }, [isOpen, prefilledTime, editingEvent]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!eventData.title || !eventData.startTime || !eventData.endTime) {
      showMessageBox("Title, start time, and end time are required.", "error");
      return;
    }
    if (new Date(eventData.endTime) <= new Date(eventData.startTime)) {
      showMessageBox("End time must be after the start time.", "error");
      return;
    }
    
    onAddEvent({
      ...eventData,
      startTime: new Date(eventData.startTime),
      endTime: new Date(eventData.endTime),
      recurrenceEndDate: eventData.recurrenceEndDate ? new Date(eventData.recurrenceEndDate) : null,
      ...(editingEvent && { id: editingEvent.id }) // Include event ID if editing
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-slate-700 p-6 rounded-lg w-full max-w-lg shadow-lg" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4 font-mono text-green-400">{editingEvent ? 'EDIT OPERATION' : 'SCHEDULE OPERATION'} for "{activeDivision?.squadName}"</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-bold text-slate-400 mb-1">Operation Title</label>
            <input type="text" name="title" value={eventData.title} onChange={handleChange} placeholder="e.g., Midterm, Soccer Practice" required className="w-full p-2 bg-slate-800 rounded-md border border-slate-600 focus:ring-2 focus:ring-green-500 font-mono"/>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-bold text-slate-400 mb-1">Start Time</label>
              <input type="datetime-local" name="startTime" value={eventData.startTime} onChange={handleChange} required className="w-full p-2 bg-slate-800 rounded-md border border-slate-600 focus:ring-2 focus:ring-green-500 font-mono"/>
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-bold text-slate-400 mb-1">End Time</label>
              <input type="datetime-local" name="endTime" value={eventData.endTime} onChange={handleChange} required className="w-full p-2 bg-slate-800 rounded-md border border-slate-600 focus:ring-2 focus:ring-green-500 font-mono"/>
            </div>
          </div>
           <div>
            <label htmlFor="priority" className="block text-sm font-bold text-slate-400 mb-1">Priority</label>
            <select name="priority" value={eventData.priority} onChange={handleChange} className="w-full p-2 bg-slate-800 rounded-md border border-slate-600 focus:ring-2 focus:ring-green-500 font-mono">
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-400 mb-2">Event Type</label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2">
                <input type="radio" name="eventType" value="group_operation" checked={eventData.eventType === 'group_operation'} onChange={handleChange} className="form-radio text-green-500 bg-slate-700 border-slate-600"/>
                <span>Group Operation</span>
              </label>
              <label className="flex items-center space-x-2">
                <input type="radio" name="eventType" value="personal_commitment" checked={eventData.eventType === 'personal_commitment'} onChange={handleChange} className="form-radio text-green-500 bg-slate-700 border-slate-600"/>
                <span>Personal Commitment</span>
              </label>
            </div>
          </div>
           <div>
            <label htmlFor="linkedAssignmentId" className="block text-sm font-bold text-slate-400 mb-1">Link to Assignment (Optional)</label>
            <select name="linkedAssignmentId" value={eventData.linkedAssignmentId} onChange={handleChange} className="w-full p-2 bg-slate-800 rounded-md border border-slate-600 focus:ring-2 focus:ring-green-500 font-mono">
              <option value="">-- None --</option>
              {assignments.map(a => <option key={a.id} value={a.id}>{a.assignment}</option>)}
            </select>
          </div>
          {/* Recurrence Options */}
          <div className="pt-4 border-t border-slate-700">
            <label htmlFor="recurrenceType" className="block text-sm font-bold text-slate-400 mb-1">Recurrence</label>
            <select name="recurrenceType" value={eventData.recurrenceType} onChange={handleChange} className="w-full p-2 bg-slate-800 rounded-md border border-slate-600 focus:ring-2 focus:ring-green-500 font-mono">
              <option value="none">Does not repeat</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
            {eventData.recurrenceType !== 'none' && (
              <div className="mt-2">
                <label htmlFor="recurrenceEndDate" className="block text-sm font-bold text-slate-400 mb-1">Recurrence End Date (Optional)</label>
                <input type="date" name="recurrenceEndDate" value={eventData.recurrenceEndDate} onChange={handleChange} className="w-full p-2 bg-slate-800 rounded-md border border-slate-600 focus:ring-2 focus:ring-green-500 font-mono"/>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-600 rounded hover:bg-slate-500">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-green-600 text-black font-bold rounded hover:bg-green-700">{editingEvent ? 'Save Changes' : 'Schedule'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InviteFriendModal = ({ isOpen, onClose, friends, divisionMembers, onInvite }) => {
  if (!isOpen) return null;

  const memberIds = new Set(Object.keys(divisionMembers));
  const friendsToInvite = friends.filter(friend => !memberIds.has(friend.id));

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-slate-700 p-6 rounded-lg w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-4 font-mono text-green-400">Invite a Friend</h3>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {friendsToInvite.length > 0 ? (
            friendsToInvite.map(friend => (
              <div key={friend.id} className="flex justify-between items-center bg-slate-800 p-3 rounded-md">
                <span className="font-semibold">{friend.username}</span>
                <button onClick={() => onInvite(friend.id, friend.username)} className="bg-green-600 text-black font-bold px-4 py-1 rounded hover:bg-green-700">Invite</button>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center">All of your friends are already in this division.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const DivisionSidebar = ({ view, divisions, activeDivision, selectedMemberId, user, onSelectDivision, onCreateDivision, onBackToDivisions, onSelectMember, onInviteClick, onKickMember }) => {
  const divisionCount = divisions.length;
  const isLeader = activeDivision && activeDivision.leaderId === user.uid;

  return (
    <div className="w-full md:w-64 flex-shrink-0 bg-slate-900/70 border border-slate-700 p-4 rounded-lg flex flex-col">
      {view === 'divisions' ? (
        <>
          <h3 className="text-lg font-semibold text-white mb-4 font-mono">MY DIVISIONS [{divisionCount}/3]</h3>
          <div className="flex-grow space-y-2 overflow-y-auto pr-2">
            {divisions.map(division => (
              <button key={division.id} onClick={() => onSelectDivision(division.id)} className="w-full text-left p-3 rounded-md text-sm font-semibold transition-colors bg-slate-800 hover:bg-slate-700">
                {division.squadName}
              </button>
            ))}
          </div>
          <button onClick={onCreateDivision} disabled={divisionCount >= 3} title={divisionCount >= 3 ? "You can be in a maximum of 3 divisions." : "Form a new division"} className="mt-4 w-full p-3 bg-green-800 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed">
            + Form New Division
          </button>
        </>
      ) : ( // Member View
        <>
          <div className="flex items-center mb-4">
            <button onClick={onBackToDivisions} className="mr-3 p-2 rounded-full hover:bg-slate-700">←</button>
            <h3 className="text-lg font-semibold text-white font-mono truncate">{activeDivision?.squadName}</h3>
          </div>
          <div className="flex-grow space-y-2 overflow-y-auto pr-2">
            <button onClick={() => onSelectMember(null)} className={`w-full text-left p-3 rounded-md text-sm font-semibold transition-colors ${!selectedMemberId ? 'bg-green-600 text-black' : 'bg-slate-800 hover:bg-slate-700'}`}>
              All Members
            </button>
            {Object.entries(activeDivision?.members || {}).map(([uid, member]) => (
              <div key={uid} className={`w-full flex justify-between items-center p-3 rounded-md transition-colors ${selectedMemberId === uid ? 'bg-green-600 text-black' : 'bg-slate-800'}`}>
                <button onClick={() => onSelectMember(uid)} className="flex-grow text-left flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: member.color }}></div>
                  <span className="font-semibold text-sm">{member.username}</span>
                </button>
                {isLeader && user.uid !== uid && (
                  <button onClick={() => onKickMember(uid, member.username)} className="text-red-400 hover:text-red-300 text-xs font-bold">KICK</button>
                )}
              </div>
            ))}
          </div>
          {isLeader && (
            <button onClick={onInviteClick} className="mt-4 w-full p-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700">
              + Invite Friend
            </button>
          )}
        </>
      )}
    </div>
  );
};

const StrategyCalendar = ({ activeDivision, onAddEvent, monthlyEvents, currentDate, setCurrentDate, onDayClick, onRefreshEvents, isLoadingEvents, selectedMemberId, onShowAll, onFindTime }) => {
  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay(); // Sunday - 0

  const renderCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const numDays = daysInMonth(year, month);
    const firstDay = firstDayOfMonth(year, month);
    const startingDay = firstDay === 0 ? 6 : firstDay - 1; // Monday - 0

    const calendarDays = [];
    for (let i = 0; i < startingDay; i++) {
      calendarDays.push(<div key={`empty-prev-${i}`} className="border-t border-l border-slate-700/50 bg-slate-800/10"></div>);
    }

    for (let day = 1; day <= numDays; day++) {
      const date = new Date(year, month, day);
      const eventsForDay = monthlyEvents.filter(e => {
        const eventDate = new Date(e.startTime);
        return eventDate.getFullYear() === year && eventDate.getMonth() === month && eventDate.getDate() === day;
      });

      // Get unique member IDs for the activity dots
      const memberIdsWithEvents = [...new Set(eventsForDay.map(e => e.creatorId))];

      calendarDays.push(
        <div key={`day-${day}`} onClick={() => onDayClick(date, eventsForDay)} className="p-2 border-t border-l border-slate-700/50 min-h-[120px] flex flex-col bg-slate-800/30 hover:bg-slate-800/60 transition-colors cursor-pointer">
          <span className="font-bold text-slate-400">{day}</span>
          <div className="flex gap-1 mt-1 flex-wrap">
            {memberIdsWithEvents.map(memberId => {
              const member = Object.values(activeDivision.members).find(m => m.uid === memberId) || {};
              return <div key={memberId} className="w-2 h-2 rounded-full" style={{ backgroundColor: member.color || '#94a3b8' }} title={member.username} />
            })}
          </div>
        </div>
      );
    }
    return calendarDays;
  };
  
  const goToPreviousMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const goToNextMonth = () => setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));

  return (
    <div className="flex-grow bg-slate-900/70 border border-slate-700 p-4 rounded-lg flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-xl font-bold text-green-400 font-mono tracking-widest">{activeDivision.squadName}</h3>
          <p className="text-sm text-slate-400">{currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={goToPreviousMonth} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600">{'<'}</button>
          <button onClick={goToNextMonth} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600">{'>'}</button>
          <button onClick={onRefreshEvents} disabled={isLoadingEvents} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-wait" title="Refresh Calendar">
            <svg className={`h-5 w-5 ${isLoadingEvents ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 10.5M20 20l-1.5-1.5A9 9 0 013.5 13.5" />
            </svg>
          </button>
          <button onClick={onFindTime} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600" title="Find Best Time to Meet">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>
          </button>
          <button onClick={onAddEvent} className="bg-green-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 text-black">+ Add Operation</button>
        </div>
      </div>
      <div className="grid grid-cols-7 text-center text-xs text-slate-400 font-bold font-mono">
        {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => <div key={day} className="py-2 border-b border-slate-700/50">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 flex-grow">
        {renderCalendarDays()}
      </div>
    </div>
  );
};

const DivisionMemberPanel = ({ activeDivision, user, friends, onInviteFriend }) => {
  // This would eventually fetch full friend profiles
  return (
    <div className="bg-slate-800/50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold">Members ({activeDivision.members.length})</h3>
        {activeDivision.leaderId === user.uid && (
          <button className="bg-slate-600 px-3 py-1 rounded text-sm hover:bg-slate-500">Invite Friend</button>
        )}
      </div>
      <div className="flex flex-wrap gap-4">
        {activeDivision.members.map(memberId => (
          <div key={memberId} className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: activeDivision.memberColors[memberId] || '#94a3b8' }} />
            <span className="text-sm font-semibold">{memberId.slice(0, 8)}...</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ScheduleLinkedOperationModal = ({ isOpen, onClose, onSchedule, assignmentTitle, divisions, showMessageBox }) => {
  const [eventData, setEventData] = useState({
    divisionId: divisions[0]?.id || '', startTime: '', endTime: '', priority: 'Medium', eventType: 'group_operation'
  });

  useEffect(() => {
    // Pre-fill division if not set or if the previously selected one is gone
    if (isOpen && divisions.length > 0 && !divisions.find(d => d.id === eventData.divisionId)) {
      setEventData(prev => ({ ...prev, divisionId: divisions[0].id }));
    }
  }, [isOpen, divisions, eventData.divisionId]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setEventData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!eventData.divisionId || !eventData.startTime || !eventData.endTime) {
      showMessageBox("Division, start time, and end time are required.", "error");
      return;
    }
    onSchedule({
      ...eventData,
      title: assignmentTitle,
      startTime: new Date(eventData.startTime),
      endTime: new Date(eventData.endTime)
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-slate-900 border-2 border-slate-700 p-6 rounded-lg w-full max-w-lg shadow-lg" onClick={e => e.stopPropagation()}>
        <h3 className="text-2xl font-bold mb-1 font-mono text-green-400">Schedule Operation</h3>
        <p className="text-slate-400 mb-4">For assignment: <span className="font-semibold text-white">{assignmentTitle}</span></p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="divisionId" className="block text-sm font-bold text-slate-400 mb-1">Select Division</label>
            <select name="divisionId" value={eventData.divisionId} onChange={handleChange} className="w-full p-2 bg-slate-800 rounded-md border border-slate-600 focus:ring-2 focus:ring-green-500 font-mono">
              {divisions.map(div => <option key={div.id} value={div.id}>{div.squadName}</option>)}
            </select>
          </div>
           <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-bold text-slate-400 mb-1">Start Time</label>
              <input type="datetime-local" name="startTime" value={eventData.startTime} onChange={handleChange} required className="w-full p-2 bg-slate-800 rounded-md border border-slate-600"/>
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-bold text-slate-400 mb-1">End Time</label>
              <input type="datetime-local" name="endTime" value={eventData.endTime} onChange={handleChange} required className="w-full p-2 bg-slate-800 rounded-md border border-slate-600"/>
            </div>
          </div>
           <div className="flex justify-end gap-4 pt-4 border-t border-slate-700">
            <button type="button" onClick={onClose} className="px-5 py-2 bg-slate-600 rounded hover:bg-slate-500">Cancel</button>
            <button type="submit" className="px-5 py-2 bg-green-600 text-black font-bold rounded hover:bg-green-700">Schedule</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const OperationsRoom = ({ stats, user, updateStatsInFirestore, assignments, divisionData, friendProfiles, showMessageBox, setActiveSheet, setIsSidebarOpen, monthlyEvents, setMonthlyEvents, lastEventCheckTime }) => {
  const [view, setView] = useState('divisions'); // 'divisions' or 'members'
  const [activeDivisionId, setActiveDivisionId] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [isEventModalOpen, setEventModalOpen] = useState(false);
  const [isHelpModalOpen, setHelpModalOpen] = useState(false);
  const [isFindTimeModalOpen, setIsFindTimeModalOpen] = useState(false);
  const [timeSuggestions, setTimeSuggestions] = useState([]);
  const [prefilledEventTime, setPrefilledEventTime] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null); // NEW: State for editing events

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDayDetailModalOpen, setIsDayDetailModalOpen] = useState(false);
  const [selectedDayDetails, setSelectedDayDetails] = useState({ date: null, events: [] });
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [rsvpingEventId, setRsvpingEventId] = useState(null);
  const eventListenerUnsubscribeRef = useRef(null);
  const rsvpCooldownsRef = useRef({}); // FIX: Define the missing ref
  
  // When active division changes, switch to member view
  useEffect(() => {
    if (activeDivisionId) {
      setView('members');
      setSelectedMemberId(null); // Default to "All Members" view
    } else {
      setView('divisions');
    }
  }, [activeDivisionId]);

  useEffect(() => {
    const divisionIds = Object.keys(divisionData);
    // This effect now only runs when the division data itself changes.
    // It correctly sets a default view or handles the case where the active division is deleted.
    // It no longer interferes with the user explicitly setting the view back to the division list.
    if (divisionIds.length > 0 && (!activeDivisionId || !divisionData[activeDivisionId])) {
      setActiveDivisionId(divisionIds[0]);
    } else if (divisionIds.length === 0) {
      setActiveDivisionId(null);
    }
  }, [divisionData]); // FIX: Removed activeDivisionId from dependencies

  const fetchMonthlyEvents = useCallback(() => {
    if (!activeDivisionId || !db) {
      setMonthlyEvents([]);
      return;
    }

    if (eventListenerUnsubscribeRef.current) {
      eventListenerUnsubscribeRef.current();
    }
    
    setIsLoadingEvents(true);
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const endOfMonth = new Date(year, month + 1, 0, 23, 59, 59);

    const eventsCollectionRef = collection(db, `squads/${activeDivisionId}/events`);
    const q = query(eventsCollectionRef, 
      where("startTime", ">=", startOfMonth), 
      where("startTime", "<=", endOfMonth)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const events = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        startTime: doc.data().startTime.toDate(),
        endTime: doc.data().endTime.toDate(),
      }));
      setMonthlyEvents(events);
      setIsLoadingEvents(false);
    }, (error) => {
      console.error("Error fetching events:", error);
      setIsLoadingEvents(false);
    });

    eventListenerUnsubscribeRef.current = unsubscribe;
  }, [activeDivisionId, currentDate, db]);

  // Effect to clean up listeners and state when the active division changes.
  useEffect(() => {
    // When the active division changes, clear old events. This does NOT fetch new ones.
    setMonthlyEvents([]);
    
    // This return function acts as a cleanup. It runs when the component unmounts
    // OR just before the effect runs again for a new divisionId.
    return () => {
      if (eventListenerUnsubscribeRef.current) {
        eventListenerUnsubscribeRef.current();
        eventListenerUnsubscribeRef.current = null;
      }
    };
  }, [activeDivisionId]);

  const handleDayClick = (date, events) => {
    setSelectedDayDetails({ date, events });
    setIsDayDetailModalOpen(true);
  };

  const handleRsvp = async (eventId, isAttending) => {
    // ROBUST FIX: Time-based cooldown per event to prevent all forms of spam.
    const now = Date.now();
    const COOLDOWN_MS = 1500; // 3 second cooldown
    const lastRsvpTime = rsvpCooldownsRef.current[eventId] || 0;

    if (now - lastRsvpTime < COOLDOWN_MS) {
      showMessageBox("You're changing your RSVP too quickly. Please wait a moment.", "error");
      return;
    }
    
    // If another event is already processing, block this action.
    if (rsvpingEventId) return;

    // Set the timestamp and loading state immediately to block subsequent clicks.
    rsvpCooldownsRef.current[eventId] = now;
    setRsvpingEventId(eventId);

    const eventRef = doc(db, `squads/${activeDivisionId}/events`, eventId);
    try {
      if (isAttending) {
        await updateDoc(eventRef, { rsvps: arrayUnion(user.uid) });
      } else {
        await updateDoc(eventRef, { rsvps: arrayRemove(user.uid) });
      }
    } catch (error) {
      console.error("Error RSVPing to event:", error);
      showMessageBox("Failed to update RSVP.", "error");
      // If the write fails, reset the cooldown so the user can try again without waiting.
      rsvpCooldownsRef.current[eventId] = 0;
    } finally {
      setRsvpingEventId(null);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!activeDivisionId) return;
    if (window.confirm("Are you sure you want to permanently delete this operation?")) {
      const eventRef = doc(db, `squads/${activeDivisionId}/events`, eventId);
      await deleteDoc(eventRef);
      showMessageBox("Operation deleted.", "info");
    }
  };

  const handleVoteToDelete = async (eventId) => {
    if (!activeDivisionId) return;
    const eventRef = doc(db, `squads/${activeDivisionId}/events`, eventId);
    await updateDoc(eventRef, { deleteVotes: arrayUnion(user.uid) });
    showMessageBox("Your vote to delete has been registered.", "info");
    // Note: A Cloud Function would be needed to automatically delete
    // the event once the vote threshold is met.
  };

  const handleFindBestTime = async (params) => {
    if (!activeDivisionId) return [];

    setIsFindTimeModalOpen(true); // Open the modal immediately

    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 7);

    const eventsRef = collection(db, `squads/${activeDivisionId}/events`);
    const q = query(eventsRef, where("startTime", ">=", start), where("startTime", "<=", end));
    
    try {
        const querySnapshot = await getDocs(q);
        const allEvents = querySnapshot.docs.map(doc => ({ ...doc.data(), startTime: doc.data().startTime.toDate(), endTime: doc.data().endTime.toDate() }));
        
        const memberUids = Object.keys(activeDivision.members);
        const memberCount = memberUids.length;

        // Fetch public profiles to get availability preferences
        const publicProfilesRef = collection(db, 'publicProfiles');
        const profilesQuery = query(publicProfilesRef, where('__name__', 'in', memberUids));
        const profilesSnapshot = await getDocs(profilesQuery);
        const memberPreferences = {};
        profilesSnapshot.forEach(doc => {
            memberPreferences[doc.id] = doc.data().availabilityPreferences || { primeTimes: [], unavailableDays: [] };
        });

        const suggestions = [];
        const linkedAssignment = assignments.find(a => a.id === params.linkedAssignmentId);

        // Check 30-minute slots for the next 7 days
        for (let d = 0; d < 7; d++) {
            const currentDay = new Date(start);
            currentDay.setDate(start.getDate() + d);
            const dayOfWeek = currentDay.getDay();

            for (let h = 8; h <= 21; h++) { // 8 AM to 9 PM
                for (let m = 0; m < 60; m += 30) {
                    const slotStart = new Date(start);
                    slotStart.setDate(start.getDate() + d);
                    slotStart.setHours(h, m, 0, 0);
                    const slotEnd = new Date(slotStart.getTime() + params.duration * 60 * 1000);

                    const busyMembers = new Set();
                    allEvents.forEach(event => {
                        if (event.startTime < slotEnd && event.endTime > slotStart) {
                            busyMembers.add(event.creatorId);
                        }
                    });
                    
                    const availableMemberIds = memberUids.filter(uid => !busyMembers.has(uid));

                    // --- Scoring Heuristics ---
                    // 1. Availability Score (Weight: 100)
                    const availabilityScore = (availableMemberIds.length / memberCount) * 100;
                    
                    // 2. Deadline Proximity Score (Weight: 50, Negative)
                    let deadlineScore = 0;
                    if (linkedAssignment && linkedAssignment.dueDate) {
                        const daysUntilDue = (linkedAssignment.dueDate.getTime() - slotStart.getTime()) / (1000 * 3600 * 24);
                        if (daysUntilDue < 0) deadlineScore = -1000; // Impossible
                        else if (daysUntilDue < 1) deadlineScore = -40;
                        else if (daysUntilDue < 2) deadlineScore = -20;
                    }

                    const finalScore = availabilityScore + deadlineScore;
                    
                    if (availabilityScore > 50) { // Only suggest if at least half the team is free
                        suggestions.push({
                            start: slotStart,
                            availableMembers: availableMemberIds.length,
                            totalMembers: memberCount,
                            score: finalScore,
                            deadlineScore: deadlineScore
                        });
                    }
                }
            }
        }
        
        suggestions.sort((a, b) => b.score - a.score);
        return suggestions.slice(0, 5);

    } catch (error) {
        console.error("Error finding best time:", error);
        showMessageBox("Could not analyze division schedule.", "error");
        return [];
    }
  };

  const handleScheduleFromSuggestion = (startTime) => {
    setIsFindTimeModalOpen(false);
    setPrefilledEventTime(startTime);
    setEventModalOpen(true);
  };


  const activeDivision = divisionData[activeDivisionId];
  const divisionCount = stats.squads?.length || 0;

  const handleInviteFriend = async (friendId, friendUsername) => {
    if (!activeDivisionId) return;
    const batch = writeBatch(db);
    const squadRef = doc(db, 'squads', activeDivisionId);
    batch.update(squadRef, { pendingInvites: arrayUnion(friendId) });
    const friendStatsRef = doc(db, `artifacts/${appId}/public/data/stats`, friendId);
    batch.update(friendStatsRef, { squadInvites: arrayUnion(activeDivisionId) });
    await batch.commit();
    showMessageBox(`Invited ${friendUsername} to the division!`, 'info');
  };

  const handleKickMember = async (memberId, memberUsername) => {
    if (!activeDivisionId || activeDivision.leaderId !== user.uid || user.uid === memberId) return;
    if (!window.confirm(`Are you sure you want to kick ${memberUsername}?`)) return;

    const batch = writeBatch(db);
    const squadRef = doc(db, 'squads', activeDivisionId);
    batch.update(squadRef, { [`members.${memberId}`]: deleteField() });
    const memberStatsRef = doc(db, `artifacts/${appId}/public/data/stats`, memberId);
    batch.update(memberStatsRef, { squads: arrayRemove(activeDivisionId) });
    await batch.commit();
    showMessageBox(`${memberUsername} has been removed from the division.`, 'info');
  };

  // NEW: Handle opening edit modal for an event
  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setEventModalOpen(true);
  };

  const handleCreateEvent = async (eventData) => {
    const lastEventTime = stats.cooldowns?.createEvent?.toDate()?.getTime();
    
    // Only apply cooldown to new events, not edits
    if (!eventData.id && lastEventTime && Date.now() - lastEventTime < 30000) { // 30 second cooldown
      showMessageBox("You can create an event every 30 seconds.", "error");
      return;
    }
    if (!activeDivisionId) {
      showMessageBox("No active division selected.", "error");
      return;
    }

    try {
      if (eventData.id) {
        // EDITING: Update existing event
        const eventDocRef = doc(db, `squads/${activeDivisionId}/events`, eventData.id);
        const { id, ...dataToUpdate } = eventData;
        await updateDoc(eventDocRef, {
          ...dataToUpdate,
          updatedAt: serverTimestamp(),
        });
        showMessageBox("Operation updated successfully!", "info");
      } else {
        // CREATING: New event
        const eventCollectionRef = collection(db, `squads/${activeDivisionId}/events`);
        const newEventData = {
          ...eventData,
          creatorId: user.uid,
          creatorUsername: stats.username,
          createdAt: serverTimestamp(),
        };
        await addDoc(eventCollectionRef, newEventData);
        // Also update the user's cooldown in their stats doc
        await updateStatsInFirestore({ 'cooldowns.createEvent': serverTimestamp() });
        showMessageBox("Operation successfully scheduled!", "info");
      }
      
      setEventModalOpen(false);
      setEditingEvent(null);
    } catch (error) {
      console.error("Error creating/updating event:", error);
      showMessageBox(eventData.id ? "Failed to update operation." : "Failed to schedule operation.", "error");
    }
  };

  const handleCreateDivision = async (divisionName) => {
    if (divisionCount >= 3) {
      showMessageBox("You cannot be in more than 3 divisions.", "error");
      return;
    }
    const lastCreate = stats.cooldowns?.createSquad?.toDate()?.getTime();
    if (lastCreate && Date.now() - lastCreate < 60000) { // 1 minute cooldown
      showMessageBox("You can form a new division once per minute.", "error");
      return;
    }
    
    const newSquadRef = doc(collection(db, 'squads'));
    const userStatsRef = doc(db, `artifacts/${appId}/public/data/stats`, user.uid);
    
    const newSquadData = {
      squadName: divisionName,
      leaderId: user.uid,
      members: { [user.uid]: { username: stats.username, color: '#34d399' } }, // Use a map for members
      createdAt: serverTimestamp(),
      pendingInvites: [] // Initialize pending invites array
    };
    
    try {
        await runTransaction(db, async (transaction) => {
          transaction.set(newSquadRef, newSquadData);
          transaction.update(userStatsRef, {
            squads: arrayUnion(newSquadRef.id),
            'cooldowns.createSquad': serverTimestamp(),
          });
        });
        showMessageBox(`Division "${divisionName}" established!`, "info");
        setCreateModalOpen(false);
    } catch (e) {
        showMessageBox("Failed to establish division.", "error");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white">The Operations Room</h2>
          <p className="text-slate-400 mb-6">Coordinate with your divisions, schedule joint study operations, and track shared objectives to ensure academic victory.</p>
        </div>
        <button onClick={() => setHelpModalOpen(true)} className="w-10 h-10 flex-shrink-0 bg-slate-700 text-white font-bold rounded-full flex items-center justify-center text-xl hover:bg-slate-600 transition-colors">?</button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)]">
        <DivisionSidebar 
          view={view}
          divisions={Object.values(divisionData)} 
          activeDivision={activeDivision}
          selectedMemberId={selectedMemberId}
          user={user}
          onSelectDivision={setActiveDivisionId}
          onCreateDivision={() => setCreateModalOpen(true)}
          onBackToDivisions={() => setActiveDivisionId(null)}
          onSelectMember={setSelectedMemberId}
          onInviteClick={() => setInviteModalOpen(true)}
          onKickMember={handleKickMember}
        />
        <div className="flex-grow flex flex-col gap-6">
          {activeDivision ? (
              <StrategyCalendar 
                activeDivision={activeDivision}
                onAddEvent={() => { setPrefilledEventTime(null); setEventModalOpen(true); }}
                monthlyEvents={monthlyEvents.filter(event => !selectedMemberId || event.creatorId === selectedMemberId)}
              currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                onDayClick={handleDayClick}
                onRefreshEvents={fetchMonthlyEvents}
                isLoadingEvents={isLoadingEvents}
                selectedMemberId={selectedMemberId}
                onShowAll={() => setSelectedMemberId(null)}
                onFindTime={handleFindBestTime}
              />
          ) : (
            <div className="flex-grow flex items-center justify-center bg-slate-900/70 border border-slate-700 rounded-lg">
              <p className="text-slate-400">Select a division to view its calendar, or form a new one.</p>
            </div>
          )}
        </div>
      </div>

      <CreateDivisionModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} onCreateDivision={handleCreateDivision} divisionCount={divisionCount} />
      <InviteFriendModal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} friends={friendProfiles} divisionMembers={activeDivision?.members || {}} onInvite={handleInviteFriend} />
      <AddEventModal isOpen={isEventModalOpen} onClose={() => { setEventModalOpen(false); setEditingEvent(null); setPrefilledEventTime(null); }} onAddEvent={handleCreateEvent} activeDivision={activeDivision} assignments={assignments.filter(a => a.status !== 'Completed')} showMessageBox={showMessageBox} prefilledTime={prefilledEventTime} editingEvent={editingEvent} />
      <OperationsRoomHelpModal isOpen={isHelpModalOpen} onClose={() => setHelpModalOpen(false)} />
<FindTimeModal isOpen={isFindTimeModalOpen} onClose={() => setIsFindTimeModalOpen(false)} suggestions={timeSuggestions} onSchedule={handleScheduleFromSuggestion} onFind={handleFindBestTime} assignments={assignments.filter(a => a.status !== 'Completed')} />
      <DayDetailModal 
        isOpen={isDayDetailModalOpen} 
        onClose={() => setIsDayDetailModalOpen(false)} 
        dayData={selectedDayDetails}
        divisionMembers={activeDivision ? Object.values(activeDivision.members) : []}
        allAssignments={assignments}
        user={user}
        onRsvp={handleRsvp}
        onDeleteEvent={handleDeleteEvent}
        onVoteToDelete={handleVoteToDelete}
        isRsvping={rsvpingEventId}
        onEditEvent={handleEditEvent}
      />
    </div>
  );
};

const AddAssignmentModal = ({ isOpen, onClose, onSubmit, onScheduleLinkedOperation, showMessageBox }) => {
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
    pinned: false,
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

  const handleAddAndSchedule = (e) => {
    e.preventDefault();
    const assignmentTitle = newAssignment.assignment.trim();
    if (!assignmentTitle) {
      showMessageBox("Assignment name is required to schedule an operation.", "error");
      return;
    }
    // First, submit the assignment to be created
    handleSubmit(e);
    // Then, trigger the scheduling flow
    onScheduleLinkedOperation(assignmentTitle);
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
              type="button"
              onClick={handleAddAndSchedule}
              className="bg-green-600 text-white px-5 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 shadow-md"
            >
              Add & Schedule Session
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


export { OperationsRoom, CreateDivisionModal, OperationsRoomHelpModal, DayDetailModal, FindTimeModal, AddEventModal, InviteFriendModal, DivisionSidebar, StrategyCalendar, DivisionMemberPanel, ScheduleLinkedOperationModal, AddAssignmentModal };
