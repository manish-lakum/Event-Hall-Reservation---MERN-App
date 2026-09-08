import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { calendarService } from '../../services/calendarService';
import CalendarView from '../../components/calendar/CalendarView';
import { Filter } from 'lucide-react';

const AdminCalendarPage = () => {
  const { halls, mapReservation, mapBlock } = useApp();
  const [selectedHallId, setSelectedHallId] = useState('All');
  const [adminEvents, setAdminEvents] = useState([]);
  const [adminBlocks, setAdminBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchAdminCal = async () => {
      try {
        setLoading(true);
        const params = selectedHallId !== 'All' ? { hallId: selectedHallId } : {};
        const res = await calendarService.getAdminCalendar(params);

        if (res.success && res.data && isMounted) {
          const rawItems = Array.isArray(res.data) ? res.data : [];
          
          const reservationItems = rawItems
            .filter(item => item.slotType !== 'BLOCK')
            .map(r => mapReservation({
              ...r,
              _id: r.id || r._id,
              eventTitle: r.title || r.eventTitle,
              eventDate: r.date || r.eventDate,
              hall: r.hall,
              status: r.status || 'APPROVED'
            }));

          const blockItems = rawItems
            .filter(item => item.slotType === 'BLOCK')
            .map(b => mapBlock({
              ...b,
              _id: b.id || b._id,
              reasonDetails: b.notes,
              startDate: b.date,
              endDate: b.date,
              hall: b.hall
            }));

          setAdminEvents(reservationItems);
          setAdminBlocks(blockItems);
        }
      } catch (err) {
        console.error('Failed to load admin calendar:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAdminCal();
    return () => {
      isMounted = false;
    };
  }, [selectedHallId, mapReservation, mapBlock]);

  const filteredReservations = selectedHallId === 'All'
    ? adminEvents
    : adminEvents.filter(r => r.hallId === selectedHallId || r.hall?._id === selectedHallId);

  const filteredBlocks = selectedHallId === 'All'
    ? adminBlocks
    : adminBlocks.filter(b => b.hallId === selectedHallId || b.hall?._id === selectedHallId);

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
              <option key={h.id} value={h.id}>{h.name || h.hallName}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs font-semibold">Loading master schedule...</div>
      ) : (
        <CalendarView reservations={filteredReservations} blockedSlots={filteredBlocks} halls={halls} />
      )}
    </div>
  );
};

export default AdminCalendarPage;
