import React from 'react';
import { useApp } from '../../context/AppContext';
import CalendarView from '../../components/calendar/CalendarView';

const UserCalendarPage = () => {
  const { reservations, blockedSlots, halls } = useApp();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">Campus Schedule</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4338CA] tracking-tight">User Event Calendar</h1>
        <p className="text-xs text-slate-500 mt-1">
          View all approved college hall reservations and scheduled maintenance blocks across campus.
        </p>
      </div>

      <CalendarView reservations={reservations} blockedSlots={blockedSlots} halls={halls} />
    </div>
  );
};

export default UserCalendarPage;
