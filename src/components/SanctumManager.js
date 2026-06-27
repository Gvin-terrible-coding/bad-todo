import React from 'react';
import { SanctumEditor } from './Sanctum';

/**
 * Renders the full-screen Sanctum editor when edit mode is active.
 */
export function SanctumManager({
  isActive,
  onExit,
  stats,
  updateStatsInFirestore,
  showMessageBox,
  processAchievement,
}) {
  if (!isActive) return null;

  return (
    <SanctumEditor
      stats={stats}
      updateStatsInFirestore={updateStatsInFirestore}
      showMessageBox={showMessageBox}
      processAchievement={processAchievement}
      onExit={onExit}
    />
  );
}
