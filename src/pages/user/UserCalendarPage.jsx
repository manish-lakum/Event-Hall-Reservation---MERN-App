import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { calendarService } from '../../services/calendarService';
import CalendarView from '../../components/calendar/CalendarView';

const UserCalendarPage = () => {
  const { halls, mapReservation, mapBlock } = useApp();
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [calendarBlocks, setCalendarBlocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchCalendar = async () => {
      try {
        setLoading(true);
        const res = await calendarService.getUserCalendar();
        if (res.success && res.data && isMounted) {
          // Backend returns array of calendar event objects
          const eventsList = Array.isArray(res.data)
            ? res.data
            : (Array.isArray(res.data.reservations) ? res.data.reservations : []);

          const mappedEvents = eventsList.map(r => mapReservation({
            ...r,
            _id: r.id || r._id,
            eventTitle: r.title || r.eventTitle,
            eventDate: r.date || r.eventDate,
            hall: r.hall,
            status: r.status || 'APPROVED'
          }));

          setCalendarEvents(mappedEvents);

          const blocksList = Array.isArray(res.data.blocks) ? res.data.blocks : [];
          setCalendarBlocks(blocksList.map(mapBlock));
        }
      } catch (err) {
        console.error('Failed to load user calendar:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCalendar();
    return () => {
      isMounted = false;
    };
  }, [mapReservation, mapBlock]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">Campus Schedule</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4338CA] tracking-tight">User Event Calendar</h1>
        <p className="text-xs text-slate-500 mt-1">
          View all approved college hall reservations and scheduled maintenance blocks across campus.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-500 text-xs font-semibold">Loading campus schedule...</div>
      ) : (
        <CalendarView reservations={calendarEvents} blockedSlots={calendarBlocks} halls={halls} />
      )}
    </div>
  );
};

export default UserCalendarPage;
