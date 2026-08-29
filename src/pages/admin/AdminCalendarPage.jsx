import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import CalendarView from '../../components/calendar/CalendarView';
import { Filter, Calendar as CalendarIcon, Building2 } from 'lucide-react';

const AdminCalendarPage = () => {
  const { reservations, blockedSlots, halls } = useApp();
  const [selectedHallId, setSelectedHallId] = useState('All');

  const filteredReservations = selectedHallId === 'All'
    ? reservations
    : reservations.filter(r => r.hallId === selectedHallId);

  const filteredBlocks = selectedHallId === 'All'
    ? blockedSlots
    : blockedSlots.filter(b => b.hallId === selectedHallId);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">Schedule Governance</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4338CA] tracking-tight">Admin Master Schedule</h1>
          <p className="text-xs text-slate-500 mt-1">
            Master calendar visualization of all hall bookings, maintenance shutdowns, and campus events.
          </p>
        </div>

        {/* Hall Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-[#0D9488]" /> Filter Hall:
          </label>
          <select
            value={selectedHallId}
            onChange={(e) => setSelectedHallId(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-bold text-[#4338CA] bg-white shadow-2xs"
          >
            <option value="All">All Campus Halls</option>
            {halls.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>
      </div>

      <CalendarView reservations={filteredReservations} blockedSlots={filteredBlocks} halls={halls} />
    </div>
  );
};

export default AdminCalendarPage;
