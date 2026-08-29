import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Users, Info } from 'lucide-react';
import Modal from '../common/Modal';
import StatusBadge from '../common/StatusBadge';

const CalendarView = ({ reservations = [], blockedSlots = [], halls = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month & days in month
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Get events on a specific date (YYYY-MM-DD)
  const getEventsForDate = (dayNum) => {
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;

    const dateRes = reservations.filter(
      r => r.date === formattedDate && (r.status === 'Approved' || r.status === 'Pending')
    );

    const dateBlocks = blockedSlots.filter(
      b => b.startDate <= formattedDate && b.endDate >= formattedDate
    );

    return { reservations: dateRes, blocks: dateBlocks };
  };

  const renderCalendarDays = () => {
    const days = [];

    // Empty lead cells for previous month padding
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="bg-slate-50/50 min-h-[110px] p-2 border border-slate-100 opacity-40"></div>);
    }

    // Day cells
    for (let day = 1; day <= daysInMonth; day++) {
      const { reservations: dayRes, blocks: dayBlocks } = getEventsForDate(day);
      const isToday =
        day === new Date().getDate() &&
        month === new Date().getMonth() &&
        year === new Date().getFullYear();

      days.push(
        <div
          key={`day-${day}`}
          className={`min-h-[110px] p-2 border border-slate-200 bg-white transition hover:bg-slate-50 flex flex-col justify-between ${
            isToday ? 'ring-2 ring-[#0D9488] bg-teal-50/30' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                isToday ? 'bg-[#0D9488] text-white' : 'text-slate-700'
              }`}
            >
              {day}
            </span>
            {(dayRes.length > 0 || dayBlocks.length > 0) && (
              <span className="text-[10px] text-slate-400 font-semibold">
                {dayRes.length + dayBlocks.length} item(s)
              </span>
            )}
          </div>

          <div className="space-y-1.5 mt-2 flex-1 overflow-y-auto max-h-[80px]">
            {dayBlocks.map((blk) => (
              <button
                key={blk.id}
                onClick={() => setSelectedEvent({ ...blk, isBlock: true })}
                className="w-full text-left bg-indigo-900 text-indigo-100 p-1 rounded text-[10px] font-semibold truncate hover:bg-indigo-950 transition block border-l-2 border-amber-400"
              >
                🚫 BLOCKED: {blk.hallName} ({blk.reason})
              </button>
            ))}

            {dayRes.map((res) => (
              <button
                key={res.id}
                onClick={() => setSelectedEvent({ ...res, isBlock: false })}
                className={`w-full text-left p-1 rounded text-[10px] font-medium truncate block border-l-2 ${
                  res.status === 'Approved'
                    ? 'bg-teal-50 text-teal-800 border-[#0D9488] hover:bg-teal-100'
                    : 'bg-amber-50 text-amber-800 border-amber-500 hover:bg-amber-100'
                }`}
              >
                🕒 {res.startTime} - {res.hallName}: {res.eventTitle}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Calendar Header Controls */}
      <div className="bg-[#4338CA] px-6 py-4 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-6 h-6 text-teal-400" />
          <h2 className="text-lg font-bold tracking-tight">
            {monthNames[month]} {year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-semibold bg-indigo-800 text-teal-300 rounded-md hover:bg-indigo-900 transition border border-indigo-600"
          >
            Today
          </button>
          <div className="flex items-center bg-indigo-800 rounded-md border border-indigo-600">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-indigo-100 hover:text-white transition"
              title="Previous Month"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="w-px h-4 bg-indigo-600"></span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-indigo-100 hover:text-white transition"
              title="Next Month"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels Header */}
      <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200 text-center text-xs font-bold text-[#4338CA] py-2.5">
        <div>SUN</div>
        <div>MON</div>
        <div>TUE</div>
        <div>WED</div>
        <div>THU</div>
        <div>FRI</div>
        <div>SAT</div>
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 bg-slate-200 gap-px">
        {renderCalendarDays()}
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Modal
          isOpen={Boolean(selectedEvent)}
          onClose={() => setSelectedEvent(null)}
          title={selectedEvent.isBlock ? 'Blocked Hall Period Details' : 'Reservation Details'}
          maxWidth="max-w-md"
        >
          {selectedEvent.isBlock ? (
            <div className="space-y-3">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-2.5">
                <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900 text-sm">Maintenance / Administrative Block</h4>
                  <p className="text-xs text-amber-700 mt-0.5">{selectedEvent.notes || 'This hall is unavailable for booking during this timeframe.'}</p>
                </div>
              </div>
              <div className="space-y-2 text-xs text-slate-600 pt-2">
                <div><strong>Hall:</strong> {selectedEvent.hallName}</div>
                <div><strong>Dates:</strong> {selectedEvent.startDate} to {selectedEvent.endDate}</div>
                <div><strong>Reason:</strong> {selectedEvent.reason}</div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <StatusBadge status={selectedEvent.status} />
                <span className="text-xs text-slate-500 font-mono">ID: {selectedEvent.id}</span>
              </div>

              <div>
                <h4 className="font-bold text-[#4338CA] text-base">{selectedEvent.eventTitle}</h4>
                <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded mt-1 inline-block">
                  {selectedEvent.eventType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg text-xs text-slate-700">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-teal-600" />
                  <span>{selectedEvent.hallName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-600" />
                  <span>{selectedEvent.startTime} - {selectedEvent.endTime}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-teal-600" />
                  <span>{selectedEvent.expectedParticipants} Participants</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-teal-600" />
                  <span>{selectedEvent.date}</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <div><strong>Organizer:</strong> {selectedEvent.userName} ({selectedEvent.userType})</div>
                <div><strong>Department:</strong> {selectedEvent.department}</div>
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default CalendarView;
