import React, { useState } from 'react';

  const CalendarView = ({ assignments }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const renderCalendarDays = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const numDays = daysInMonth(year, month);
      const firstDay = firstDayOfMonth(year, month);
      const startingDay = firstDay === 0 ? 6 : firstDay - 1;

      const calendarDays = [];
      for (let i = 0; i < startingDay; i++) {
        calendarDays.push(<div key={`empty-prev-${i}`} className="border-t border-l border-slate-700 bg-slate-800/50"></div>);
      }

      for (let day = 1; day <= numDays; day++) {
        const date = new Date(year, month, day);
        const assignmentsOnDay = assignments.filter(a =>
          a.status !== 'Completed' && // This will remove completed tasks from the calendar
          a.dueDate &&
          a.dueDate.getFullYear() === year &&
          a.dueDate.getMonth() === month &&
          a.dueDate.getDate() === day
        );

        calendarDays.push(
          <div key={`day-${day}`} className="p-2 border-t border-l border-slate-700 h-32 flex flex-col overflow-hidden bg-slate-800/30 hover:bg-slate-800/60 transition-colors">
            <span className="font-bold text-slate-300">{day}</span>
            <div className="flex-grow overflow-y-auto mt-1 space-y-1 pr-1">
              {assignmentsOnDay.map(a => (
                <div key={a.id} className={`text-xs p-1.5 rounded-md truncate
                  ${a.status === 'Completed' ? 'bg-green-500/30 text-green-300' :
                    a.dueDate && new Date() > a.dueDate && a.status !== 'Completed' ? 'bg-red-500/30 text-red-300' :
                    'bg-indigo-500/30 text-indigo-300'
                  }`}>
                  {a.assignment}
                </div>
              ))}
            </div>
          </div>
        );
      }

      return calendarDays;
    };

    const goToPreviousMonth = () => {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
      setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">Calendar View</h2>
            <p className="text-slate-400">View your assignment deadlines on a monthly calendar.</p>
          </div>
          <div className="flex items-center space-x-4">
             <h3 className="text-xl font-semibold text-white">
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
            <button onClick={goToPreviousMonth} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={goToNextMonth} className="p-2 rounded-full bg-slate-700 hover:bg-slate-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
            <div className="grid grid-cols-7 text-center font-semibold text-slate-400">
                {daysOfWeek.map(day => <div key={day} className="py-3 border-b border-l border-slate-700">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 grid-rows-5">
                {renderCalendarDays()}
            </div>
        </div>
      </div>
    );
  };


export default CalendarView;
