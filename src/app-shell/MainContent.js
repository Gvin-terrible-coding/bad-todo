import { AlchemistsWorkshop } from '../components/AlchemistsWorkshop';
import { AssignmentTracker } from '../components/AssignmentTracker';
import BadgeSystem from '../components/BadgeSystem';
import CalendarView from '../components/CalendarView';
import { DungeonCrawler } from '../components/DungeonCrawler';
import { MyProfile } from '../components/MyProfile';
import { OperationsRoom } from '../components/OperationsRoom';
import ScienceLab from '../components/ScienceLab';
import { Sanctum } from '../components/Sanctum';
import { StatsXPTracker } from '../components/StatsXPTracker';
import { StudyZone } from '../components/StudyZone';
import TowerDefenseGame from '../components/TowerDefenseGame';

const AchievementsComponent = BadgeSystem;

const WhyTab = () => (
  <div className="max-w-3xl mx-auto bg-slate-800 rounded-xl p-8 shadow-xl">
    <h1 className="text-3xl font-bold text-white mb-4">Why I Built This</h1>
    <p className="text-slate-300 leading-relaxed">
      This space turns assignments, study sessions, and routines into a more playful command center.
    </p>
  </div>
);

const MainContent = ({
  actionLock,
  activeSheet,
  addIngredientToInventory,
  appId,
  appKey,
  assignments,
  calculateLevelInfo,
  collectFirstEgg,
  collectNewEgg,
  completedAssignments,
  db,
  deleteAssignmentFromFirestore,
  divisionData,
  dungeonResetKey,
  dungeonXpRef,
  friendProfiles,
  generatePath,
  getFullCosmeticDetails,
  getFullPetDetails,
  getItemStyle,
  getProductivityPersona,
  getStartOfWeek,
  handleAcceptContract,
  handleAcceptInvite,
  handleCompletedToggle,
  handleDeclineInvite,
  handleEvolvePet,
  handleRefreshAllData,
  handleTogglePin,
  hasMoreAssignments,
  hatchEgg,
  isMobile,
  isRefreshing,
  lastEventCheckTime,
  loadMoreAssignments,
  monthlyEvents,
  processAchievement,
  promptMissionStart,
  resetDungeonGame,
  resetTowerDefenseGame,
  setActiveSheet,
  setIsAddModalOpen,
  setIsSidebarOpen,
  setMonthlyEvents,
  setSanctumEditMode,
  setTriageState,
  shouldShowTriageBanner,
  showMessageBox,
  spinProductivitySlotMachine,
  stats,
  updateAssignmentInFirestore,
  updateStatsInFirestore,
  user,
}) => {
  return (
    <main key={appKey} className="flex-grow p-4 md:p-8 overflow-auto w-full md:w-auto">
        {/* Hamburger Button */}
        <button onClick={() => setIsSidebarOpen(true)} className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800/80 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
        {activeSheet === 'Stats + XP Tracker' && <StatsXPTracker stats={stats} assignments={assignments} completedAssignments={completedAssignments} handleRefresh={handleRefreshAllData} isRefreshing={isRefreshing} getProductivityPersona={getProductivityPersona} calculateLevelInfo={calculateLevelInfo} getStartOfWeek={getStartOfWeek} collectFirstEgg={collectFirstEgg} hatchEgg={hatchEgg} collectNewEgg={collectNewEgg} spinProductivitySlotMachine={spinProductivitySlotMachine} shouldPromptForTriage={shouldShowTriageBanner} onStartTriage={() => setTriageState({ isOpen: true, needsSetup: !stats.triageSettings })} onAcceptContract={handleAcceptContract} />}
        {activeSheet === 'Assignment Tracker' && <AssignmentTracker stats={stats} assignments={assignments} setIsAddModalOpen={setIsAddModalOpen} handleCompletedToggle={handleCompletedToggle} updateAssignmentInFirestore={updateAssignmentInFirestore} deleteAssignmentFromFirestore={deleteAssignmentFromFirestore} promptMissionStart={promptMissionStart} isMobile={isMobile} onLoadMore={loadMoreAssignments} hasMore={hasMoreAssignments} onTogglePin={handleTogglePin} updateStatsInFirestore={updateStatsInFirestore} />}
        {activeSheet === 'Achievements' && <AchievementsComponent gameProgress={stats} />}
        {activeSheet === 'My Profile' && <MyProfile stats={stats} user={user} userId={user?.uid} updateStatsInFirestore={updateStatsInFirestore} handleEvolvePet={handleEvolvePet} getFullPetDetails={getFullPetDetails} getFullCosmeticDetails={getFullCosmeticDetails} getItemStyle={getItemStyle} db={db} appId={appId} showMessageBox={showMessageBox} actionLock={actionLock} processAchievement={processAchievement} calculateLevelInfo={calculateLevelInfo} onAcceptInvite={handleAcceptInvite} onDeclineInvite={handleDeclineInvite} divisionData={divisionData} friendProfiles={friendProfiles} />}
        {activeSheet === 'Sanctum' && <Sanctum stats={stats} setEditMode={setSanctumEditMode} />}
        {activeSheet === 'Alchemist\'s Workshop' && <AlchemistsWorkshop stats={stats} updateStatsInFirestore={updateStatsInFirestore} showMessageBox={showMessageBox} />}
        {activeSheet === 'Operations Room' && <OperationsRoom stats={stats} user={user} updateStatsInFirestore={updateStatsInFirestore} assignments={assignments} divisionData={divisionData} friendProfiles={Object.values(friendProfiles)} showMessageBox={showMessageBox} setActiveSheet={setActiveSheet} setIsSidebarOpen={setIsSidebarOpen} monthlyEvents={monthlyEvents} setMonthlyEvents={setMonthlyEvents} lastEventCheckTime={lastEventCheckTime} />}
        {activeSheet === 'Calendar View' && <CalendarView assignments={assignments}/>}
        {activeSheet === 'Dungeon Crawler' && <DungeonCrawler key={dungeonResetKey} stats={stats} updateStatsInFirestore={updateStatsInFirestore} showMessageBox={showMessageBox} getFullPetDetails={getFullPetDetails} onResetDungeon={resetDungeonGame} getFullCosmeticDetails={getFullCosmeticDetails} processAchievement={processAchievement} syncDungeonXp={newXp => { dungeonXpRef.current = newXp; }} isMobile={isMobile} addIngredientToInventory={addIngredientToInventory} />}
        {activeSheet === 'Tower Defense' && <TowerDefenseGame stats={stats} updateStatsInFirestore={updateStatsInFirestore} showMessageBox={showMessageBox} onResetGame={resetTowerDefenseGame} getFullCosmeticDetails={getFullCosmeticDetails} generatePath={generatePath} processAchievement={processAchievement} addIngredientToInventory={addIngredientToInventory} />}
        {activeSheet === 'Science Lab' && <ScienceLab stats={stats} userId={user?.uid} updateStatsInFirestore={updateStatsInFirestore} showMessageBox={showMessageBox} actionLock={actionLock} processAchievement={processAchievement} />}
        {activeSheet === 'Study Zone' && <StudyZone stats={stats} updateStatsInFirestore={updateStatsInFirestore} showMessageBox={showMessageBox} processAchievement={processAchievement} isMobile={isMobile} actionLock={actionLock} />}
        {activeSheet === 'Why' && <WhyTab />}
      </main>
  );
};

export default MainContent;

