import React from 'react';

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


export default BadgeSystem;
