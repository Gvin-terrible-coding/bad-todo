const Sidebar = ({
  activeSheet,
  equippedAvatarDisplay,
  hasNewEvents,
  isMobile,
  isSidebarOpen,
  onOpenOperationsRoom,
  onSheetChange,
  onSignOut,
  setIsSidebarOpen,
  stats,
  user,
}) => {
  return (
    <nav className={`fixed top-0 left-0 h-full w-64 bg-slate-900 p-6 flex-shrink-0 flex flex-col shadow-2xl z-40 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Nav content is unchanged, but the parent nav tag is now responsive */}
        <ul className="space-y-2 flex-grow">
          {[
            { name: 'Dashboard', sheet: 'Stats + XP Tracker', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" /></svg> },
            { name: 'Assignments', sheet: 'Assignment Tracker', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" /></svg> },
            { name: 'Achievements', sheet: 'Achievements', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01-.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg> },
            { name: 'Sanctum', sheet: 'Sanctum', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 20a10 10 0 110-20 10 10 0 010 20zM9 4a1 1 0 112 0v1h1a1 1 0 110 2h-1v1a1 1 0 11-2 0V7H8a1 1 0 010-2h1V4z" /></svg> },
            { name: 'Alchemist\'s Workshop', sheet: 'Alchemist\'s Workshop', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z" /><path d="M4 9a1 1 0 011-1 7 7 0 017 7 1 1 0 11-2 0 5 5 0 00-5-5 1 1 0 01-1-1z" /></svg>},
            { name: 'Operations Room', sheet: 'Operations Room', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" /></svg>},
            { name: 'Calendar', sheet: 'Calendar View', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg> },
            { name: 'Dungeon Crawler', sheet: 'Dungeon Crawler', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M1.5 6.5a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-2zM6 11a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 4a1 1 0 100 2h4a1 1 0 100-2H7zM2 2.5a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h2a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5h-2zM2.5 14a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-2zM14 2.5a.5.5 0 00-.5.5v2a.5.5 0 00.5.5h2a.5.5 0 00.5-.5v-2a.5.5 0 00-.5-.5h-2zM13.5 14a.5.5 0 01.5-.5h2a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 01-.5-.5v-2z" clipRule="evenodd"/></svg>},
            { name: 'Tower Defense', sheet: 'Tower Defense', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 3a1 1 0 011-1h8a1 1 0 011 1v2h1a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1h1V3zm3 4a1 1 0 011-1h2a1 1 0 110 2H8a1 1 0 01-1-1z" clipRule="evenodd" /></svg>},
            { name: 'Science Lab', sheet: 'Science Lab', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7 2a.5.5 0 01.5.5V3h5V2.5a.5.5 0 011 0V3h1a2 2 0 012 2v1.5a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5V5a1 1 0 00-1-1H7a1 1 0 00-1 1v.5a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5V5a2 2 0 012-2h1V2.5A.5.5 0 017 2zM4.002 8.5a.5.5 0 01.498.5v7a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-7a.5.5 0 01.5-.5h1zM16 8.5a.5.5 0 01.5.5v7a.5.5 0 01-.5.5h-1a.5.5 0 01-.5-.5v-7a.5.5 0 01.5-.5h1zM7 9a1 1 0 00-1 1v5a1 1 0 102 0v-5a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v5a1 1 0 102 0v-5a1 1 0 00-1-1z" clipRule="evenodd" /></svg>},
            { name: 'Study Zone', sheet: 'Study Zone', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L9 9.58v5.528l-3-1.286a1 1 0 00-1.212.86l-.5 2.5a1 1 0 00.97 1.245l5-1a1 1 0 00.484 0l5 1a1 1 0 00.97-1.245l-.5-2.5a1 1 0 00-1.212-.86l-3 1.286V9.58l6.406-2.658a1 1 0 000-1.84l-7-3zM9 4.399l5.223 2.155L10 8.517 4.777 6.554 9 4.399z" /></svg>},
          ].map((item) => (
            <li key={item.name}>
              <button 
                onClick={() => {
                  if (item.sheet === 'Operations Room') {
                    onOpenOperationsRoom();
                  } else {
                    onSheetChange(item.sheet); 
                    if(isMobile) setIsSidebarOpen(false);
                  }
                }} 
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-3 relative ${activeSheet === item.sheet ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'}`}
              >
                {item.icon}
                <span>{item.name}</span>
                {item.sheet === 'Operations Room' && hasNewEvents && (
                  <div className="absolute right-2 top-2.5 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </button>
            </li>
          ))}
        </ul>

        <div className="border-t border-slate-700 mx-[-1.5rem] my-4"></div>
        <ul className="space-y-2">
            <li><button onClick={() => {onSheetChange('Why'); if(isMobile) setIsSidebarOpen(false);}} className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-3 ${activeSheet === 'Why' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white hover:translate-x-1'}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg><span>Why I Built This</span></button></li>
        </ul>

        <div className={`pt-4 space-y-2 ${isMobile ? '' : 'mt-auto'}`}>
            <button onClick={() => {onSheetChange('My Profile'); if(isMobile) setIsSidebarOpen(false);}} className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-slate-800 transition-all duration-200 hover:translate-x-1 relative">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl border-2 border-slate-600">{equippedAvatarDisplay}</div>
                  {((stats.squadInvites?.length || 0) > 0) && (
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border border-slate-800">
                      {Math.min(stats.squadInvites.length, 9)}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left"><p className="text-sm font-semibold text-white">My Profile</p><p className="text-xs text-slate-400 truncate">ID: {user?.uid}</p></div>
            </button>
            <button onClick={onSignOut} className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-900/50 hover:text-white transition-colors"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg><span>Sign Out</span></button>
        </div>
      </nav>
  );
};

export default Sidebar;
