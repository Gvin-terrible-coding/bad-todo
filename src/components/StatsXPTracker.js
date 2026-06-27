import React, { useState, useEffect, useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { cosmeticItems, levelTitles, assignmentTags } from '../constants/constants';

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

const StatsXPTracker = ({ stats, assignments, completedAssignments, handleRefresh, isRefreshing, getProductivityPersona, calculateLevelInfo, getStartOfWeek, collectFirstEgg, hatchEgg, collectNewEgg, spinProductivitySlotMachine, shouldPromptForTriage, onStartTriage, onAcceptContract }) => {
    
    // --- Data Calculation Hooks ---
    const persona = getProductivityPersona();
    const levelInfo = calculateLevelInfo(stats.totalXP);
    const currentLevelBasedTitle = levelTitles.slice().reverse().find(t => stats.currentLevel >= t.level) || { title: 'Novice Learner' };
    const currentTitle = stats?.equippedItems?.title ? cosmeticItems.titles.find(t => t.id === stats.equippedItems.title)?.name : currentLevelBasedTitle.title;

    const cumulativeXPGainData = useMemo(() => {
        const xpGainData = assignments
            .filter(a => a.status === 'Completed' && a.dateCompleted)
            .sort((a, b) => a.dateCompleted.getTime() - b.dateCompleted.getTime())
            .reduce((acc, assignment) => {
                const dateString = assignment.dateCompleted.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const existing = acc.find(item => item.date === dateString);
                const points = assignment.pointsEarned || 0;
                if (existing) existing.xp += points;
                else acc.push({ date: dateString, xp: points });
                return acc;
            }, []);
        
        let cumulativeXP = 0;
        return xpGainData.map(data => {
            cumulativeXP += data.xp;
            return { date: data.date, cumulativeXP: cumulativeXP };
        });
    }, [assignments]);

    const predictedHoursGraphData = useMemo(() => {
        const predictedHoursData = assignments
            .filter(a => a.status !== 'Completed')
            .reduce((acc, assignment) => {
                const classCategory = assignment.class || 'Uncategorized';
                acc[classCategory] = (acc[classCategory] || 0) + (assignment.timeEstimate || 0);
                return acc;
            }, {});
        return Object.keys(predictedHoursData).map(key => ({ class: key, hours: predictedHoursData[key] }));
    }, [assignments]);
    
    const hoursSpentWorkingGraphData = useMemo(() => {
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
        return Object.keys(hoursSpentWorkingData)
            .map(weekKey => ({ week: weekKey, hours: hoursSpentWorkingData[weekKey], sortDate: new Date(weekKey) }))
            .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime());
    }, [assignments, getStartOfWeek]);

    const tagAnalytics = useMemo(() => {
        const analytics = {};
        assignmentTags.forEach(tag => {
            analytics[tag] = { totalTimeSpent: 0, assignmentCount: 0 };
        });
        completedAssignments.forEach(t => {
            if (t.tags && t.tags.length > 0) {
                t.tags.forEach(tag => {
                    if (analytics[tag]) {
                        analytics[tag].totalTimeSpent += t.timeEstimate || 0;
                        analytics[tag].assignmentCount++;
                    }
                });
            }
        });
        return analytics;
    }, [completedAssignments]);

    const stressRisk = useMemo(() => {
        let totalStressScore = 0;
        const now = new Date();
        const upcomingAssignments = assignments.filter(a => a.status !== 'Completed' && a.dueDate && a.dueDate > now && (a.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 14);
        const difficultyMap = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };
        upcomingAssignments.forEach(assignment => {
            const daysUntilDue = Math.ceil((assignment.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
            let assignmentStress = (difficultyMap[assignment.difficulty] || 1) * 5 + (assignment.timeEstimate || 1) * 0.5;
            if (daysUntilDue <= 3) assignmentStress += (3 - daysUntilDue + 1) * 10;
            totalStressScore += assignmentStress;
        });
        return Math.min(100, (totalStressScore / 500) * 100);
    }, [assignments]);

    const stressDisplay = useMemo(() => {
        if (stressRisk <= 33) return { text: 'Low', color: 'text-green-400', emoji: '😊' };
        if (stressRisk <= 66) return { text: 'Medium', color: 'text-yellow-400', emoji: '😐' };
        return { text: 'High', color: 'text-red-400', emoji: '💀' };
    }, [stressRisk]);

    return (
    <div className="grid flex-1 gap-8 md:grid-cols-3 lg:grid-cols-4">
        <div className="flex flex-col gap-8 md:col-span-2 lg:col-span-3">
            {/* --- HEADER --- */}
            <div className="flex justify-between items-center px-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tighter text-white">Welcome back, {stats.username}</h2>
                    <p className="text-white/60">Here's your productivity overview.</p>
                </div>
                <button onClick={handleRefresh} disabled={isRefreshing} className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 disabled:bg-slate-800 disabled:cursor-not-allowed disabled:text-slate-500 transition-colors flex items-center space-x-2">
                    <svg className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 10.5M20 20l-1.5-1.5A9 9 0 013.5 13.5" /></svg>
                    <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
            </div>

            {/* --- TOP STAT CARDS --- */}
            <div className="grid gap-4 sm:grid-cols-3">
                <div className="bg-glass rounded-xl p-4 shadow-lg ring-1 ring-white/10">
                    <p className="text-sm font-medium text-white/70">Total XP</p>
                    <p className="text-4xl font-bold text-white">{stats.totalXP.toLocaleString()}</p>
                </div>
                <div className="bg-glass rounded-xl p-4 shadow-lg ring-1 ring-white/10">
                    <p className="text-sm font-medium text-white/70">Current Level</p>
                    <p className="text-4xl font-bold text-white">Level {levelInfo.level}</p>
                    <div className="mt-1 h-2 w-full rounded-full bg-white/10">
                        <div className="h-2 rounded-full bg-primary" style={{ width: `${(levelInfo.xpProgressInLevel / levelInfo.xpNeededForLevelUp) * 100}%`, boxShadow: '0 0 8px var(--primary-color)' }}></div>
                    </div>
                </div>
                <div className="bg-glass rounded-xl p-4 shadow-lg ring-1 ring-white/10">
                    <p className="text-sm font-medium text-white/70">Title</p>
                    <p className="text-4xl font-bold text-white truncate">{currentTitle}</p>
                </div>
            </div>

            {/* --- ALERT BANNERS --- */}
            <div className="flex flex-col gap-4">
                {shouldPromptForTriage && (
                    <div className="bg-glass flex items-center gap-6 rounded-xl p-4 shadow-lg ring-1 ring-white/10">
                        <div className="flex-grow">
                            <p className="text-sm font-bold text-primary" style={{ textShadow: '0 0 2px var(--primary-color)' }}>✨ New Triage</p>
                            <h3 className="text-lg font-bold text-white">Weekly Review</h3>
                            <p className="text-sm text-white/70">Review your weekly tasks and prioritize for optimal productivity.</p>
                        </div>
                        <button onClick={onStartTriage} className="px-5 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/80 transition-colors">Start Planning</button>
                    </div>
                )}
                {stats.contract && (
                    <div className="bg-glass flex items-center gap-6 rounded-xl p-4 shadow-lg ring-1 ring-white/10">
                        <div className="flex-grow">
                            <p className="text-sm font-bold text-yellow-400" style={{ textShadow: '0 0 5px #facc15' }}>{stats.contract.status === 'offered' ? '📜 New Contract' : 'Active Contract'}</p>
                            <h3 className="text-lg font-bold text-white">{stats.contract.name}</h3>
                            <p className="text-sm text-white/70">{stats.contract.description}</p>
                        </div>
                        {stats.contract.status === 'offered' && (
                            <button onClick={onAcceptContract} className="px-5 py-2 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors">Accept ({stats.contract.deposit} XP)</button>
                        )}
                    </div>
                )}
            </div>

                        {/* --- GRAPHS --- */}
            <div className="bg-glass rounded-xl p-4 shadow-lg ring-1 ring-white/10">
                <h3 className="text-lg font-bold text-white mb-4">XP Gain Over Time</h3>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={cumulativeXPGainData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <defs><linearGradient id="xpGradient" x1="0" y1="0" x2="1" y2="0"><stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.8}/><stop offset="95%" stopColor="#0bda73" stopOpacity={0.8}/></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis dataKey="date" tick={{ fill: '#ffffff99', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#ffffff99', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(25, 16, 34, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)' }}/>
                            <Line type="monotone" dataKey="cumulativeXP" stroke="url(#xpGradient)" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#fff' }} name="Cumulative XP" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
<div className="bg-glass rounded-xl p-4 shadow-lg ring-1 ring-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Predicted Workload</h3>
                    <div className="h-48">
                        {predictedHoursGraphData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={predictedHoursGraphData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                                    <XAxis dataKey="class" tick={{ fill: '#ffffff99', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fill: '#ffffff99', fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(25, 16, 34, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)' }} cursor={{fill: 'rgba(255, 255, 255, 0.1)'}}/>
                                    <Legend wrapperStyle={{ color: '#ffffff99', fontSize: 12 }} />
                                    <Bar dataKey="hours" fill="#34d399" name="Predicted Hours" />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-center text-white/50">
                                <div>
                                    <p className="font-semibold">No data to display.</p>
                                    <p className="text-xs mt-1">Add upcoming assignments with a time estimate to see your workload.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="bg-glass rounded-xl p-4 shadow-lg ring-1 ring-white/10">
                    <h3 className="text-lg font-bold text-white mb-4">Hours Worked (Weekly)</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={hoursSpentWorkingGraphData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)"/>
                                <XAxis dataKey="week" tick={{ fill: '#ffffff99', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fill: '#ffffff99', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(25, 16, 34, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)' }}/>
                                <Line type="monotone" dataKey="hours" stroke="#facc15" strokeWidth={3} dot={{ fill: '#facc15' }} activeDot={{ r: 6, fill: '#fff' }} name="Hours Worked" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* --- ANALYTICS TABLE --- */}
            <div className="bg-glass rounded-xl shadow-lg ring-1 ring-white/10">
                <h3 className="border-b border-white/10 p-4 text-lg font-bold text-white">Analytics by Tag</h3>
                <div className="overflow-x-auto"><table className="w-full text-left"><thead><tr className="border-b border-white/10 text-xs uppercase text-white/60"><th className="px-4 py-3 font-medium">Tag</th><th className="px-4 py-3 font-medium text-center">Assignments</th><th className="px-4 py-3 font-medium text-center">Avg Time (hrs)</th></tr></thead><tbody className="divide-y divide-white/10 text-sm">{assignmentTags.map(tag => { const data = tagAnalytics[tag]; const avgTime = data.assignmentCount > 0 ? (data.totalTimeSpent / data.assignmentCount).toFixed(1) : 'N/A'; return (<tr key={tag}><td className="px-4 py-3 text-white">{tag}</td><td className="px-4 py-3 text-center text-white/70">{data.assignmentCount}</td><td className="px-4 py-3 text-center text-white/70">{avgTime}</td></tr>);})}</tbody></table></div>
            </div>
        </div>

        {/* --- SIDEBAR WIDGETS --- */}
        <aside className="flex flex-col gap-8 md:col-span-1 lg:col-span-1">
            <div className="bg-glass flex flex-col gap-4 rounded-xl p-4 shadow-lg ring-1 ring-white/10"><QuestsComponent quests={stats.quests} /></div>
<div className="bg-glass rounded-xl p-4 shadow-lg ring-1 ring-white/10">
                <h3 className="text-lg font-bold text-white">Explorer's Streak</h3>
                <p className="text-3xl font-bold text-primary" style={{ textShadow: '0 0 3px var(--primary-color)' }}>{stats.focusNavigator?.explorerStreak || 0} Days</p>
            </div>
            <div className="bg-glass rounded-xl p-4 shadow-lg ring-1 ring-white/10"><h3 className="text-lg font-bold text-white">Work Style: {persona.name} {persona.icon}</h3><p className="text-sm text-white/70">{persona.description}</p></div>
            <div className="bg-glass rounded-xl p-4 shadow-lg ring-1 ring-white/10">
                <h3 className="text-lg font-bold text-white">Productivity Pet</h3>
                {stats.petStatus === 'none' && <button onClick={collectFirstEgg} className="mt-2 w-full rounded-lg bg-primary py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105">Get First Egg</button>}
                {stats.petStatus === 'egg' && (<div className="text-center mt-2"><p className="text-5xl">🥚</p><p className="text-sm text-white/70">{stats.assignmentsToHatch > 0 ? `${stats.assignmentsToHatch} more to hatch!` : "Ready to hatch!"}</p>{stats.assignmentsToHatch <= 0 && <button onClick={hatchEgg} className="mt-2 w-full rounded-lg bg-primary py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105">Hatch Now!</button>}</div>)}
                {stats.petStatus === 'hatched' && stats.currentPet && (<div className="mt-2 text-center"><p className="text-5xl">{stats.currentPet.display}</p><p className="font-bold">{stats.currentPet.name}</p><p className="text-sm text-green-400">+{stats.currentPet.xpBuff * 100}% XP</p><button onClick={collectNewEgg} className="mt-2 w-full rounded-lg bg-primary/50 py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105">Find New Egg</button></div>)}
            </div>
            <div className="bg-glass rounded-xl p-4 shadow-lg ring-1 ring-white/10"><h3 className="text-lg font-bold text-white">Stress Risk</h3><p className={`text-3xl font-bold ${stressDisplay.color}`}>{stressDisplay.text} {stressDisplay.emoji}</p></div>
            <div className="bg-glass flex flex-col items-center gap-4 rounded-xl p-4 text-center shadow-lg ring-1 ring-white/10">
                <h3 className="text-lg font-bold text-white">Slot Machine</h3>
                <p className="text-sm text-white/70">Spin for a random reward!</p>
                <button onClick={spinProductivitySlotMachine} className="w-full rounded-lg bg-primary py-2 text-sm font-bold text-white shadow-lg transition-transform hover:scale-105" style={{ boxShadow: '0 0 15px var(--primary-color)' }}>Spin</button>
            </div>
        </aside>
    </div>
    );
};


export { StatsXPTracker, QuestsComponent };
