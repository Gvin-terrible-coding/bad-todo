import React from 'react';
import { cosmeticItems } from '../constants/constants';
import { XpBarAnimation } from '../utils/helpers';
import { BreakPasscodeRewardModal } from '../components/MyProfile';
import { WeeklyTriageModal, MissionControlModal, CockpitView } from '../components/AssignmentTracker';
import { AddAssignmentModal, ScheduleLinkedOperationModal } from '../components/OperationsRoom';
import { SlotMachineAnimationModal, TaskCompletionAnimation } from '../components/DungeonCrawler';

/**
 * Central overlay layer for modals, mission cockpit, and reward animations.
 */
const AppModals = ({
  stats,
  calculateLevelInfo,
  isMobile,
  triageableAssignments,
  divisionData,
  rewardModal,
  triageModal,
  addAssignmentModal,
  missionControlModal,
  scheduleLinkedOperationModal,
  activeMissionState,
  onMissionComplete,
  completionAnimations,
}) => {
  const equippedAnimationEffect = stats?.equippedItems?.animation
    ? cosmeticItems.animations.find((a) => a.id === stats.equippedItems.animation)?.effect
    : null;

  const divisions = Object.values(divisionData || {});

  return (
    <>
      <BreakPasscodeRewardModal
        isOpen={rewardModal.isOpen}
        onClose={rewardModal.onClose}
        passcode={rewardModal.passcode}
      />

      {activeMissionState.isActive && (
        <CockpitView
          mission={activeMissionState}
          onMissionComplete={onMissionComplete}
          isMobile={isMobile}
        />
      )}

      <WeeklyTriageModal
        isOpen={triageModal.isOpen}
        onClose={triageModal.onClose}
        assignments={triageableAssignments}
        triageSettings={stats.triageSettings}
        onSaveSettings={triageModal.onSaveSettings}
        onCompleteTriage={triageModal.onCompleteTriage}
      />

      <AddAssignmentModal
        isOpen={addAssignmentModal.isOpen}
        onClose={addAssignmentModal.onClose}
        onSubmit={addAssignmentModal.onSubmit}
        onScheduleLinkedOperation={addAssignmentModal.onScheduleLinkedOperation}
        showMessageBox={addAssignmentModal.showMessageBox}
      />

      <MissionControlModal
        isOpen={missionControlModal.isOpen}
        onClose={missionControlModal.onClose}
        assignment={missionControlModal.assignment}
        unlockedLocations={
          missionControlModal.unlockedLocations ||
          stats.focusNavigator?.unlockedLocations ||
          ['genesis_prime']
        }
        onLaunchMission={missionControlModal.onLaunchMission}
      />

      <ScheduleLinkedOperationModal
        isOpen={scheduleLinkedOperationModal.isOpen}
        onClose={scheduleLinkedOperationModal.onClose}
        onSchedule={scheduleLinkedOperationModal.onSchedule}
        assignmentTitle={scheduleLinkedOperationModal.assignmentTitle}
        divisions={divisions}
        showMessageBox={scheduleLinkedOperationModal.showMessageBox}
      />

      <TaskCompletionAnimation
        show={completionAnimations.showCompletionAnimation}
        onAnimationEnd={completionAnimations.onCompletionAnimationEnd}
        equippedAnimationEffect={equippedAnimationEffect}
      />

      <SlotMachineAnimationModal
        isOpen={completionAnimations.isSlotAnimationOpen}
        onClose={completionAnimations.onSlotClose}
        onAnimationComplete={completionAnimations.onSlotComplete}
      />

      <XpBarAnimation
        key={completionAnimations.xpAnimationKey}
        xpGained={completionAnimations.xpGainToShow}
        stats={stats}
        calculateLevelInfo={calculateLevelInfo}
        onAnimationComplete={completionAnimations.onXpAnimationComplete}
        onAudioReady={completionAnimations.onAudioReady}
        originEvent={completionAnimations.xpAnimationOriginEvent}
      />
    </>
  );
};

export default AppModals;
