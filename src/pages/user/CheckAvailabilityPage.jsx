import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { Search, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

const getLocalDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDefaultStartTime = () => {
  const now = new Date();
  const nextHour = (now.getHours() + 1) % 24;
  const hourStr = String(nextHour < 8 ? 8 : (nextHour > 18 ? 18 : nextHour)).padStart(2, '0');
  return `${hourStr}:00`;
};

const getDefaultEndTime = (startStr) => {
  const hours = parseInt(startStr.split(':')[0], 10) || 10;
  const endHour = Math.min(hours + 2, 20);
  return `${String(endHour).padStart(2, '0')}:00`;
};

const CheckAvailabilityPage = () => {
  const [searchParams] = useSearchParams();
  const { halls, checkAvailability, reservations, blockedSlots } = useApp();

  const todayStr = getLocalDateString();
  const initialStart = getDefaultStartTime();
  const initialEnd = getDefaultEndTime(initialStart);

  const [selectedHallId, setSelectedHallId] = useState('');
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [startTime, setStartTime] = useState(initialStart);
  const [endTime, setEndTime] = useState(initialEnd);
  const [loading, setLoading] = useState(false);
  const [checkResult, setCheckResult] = useState(null);

  useEffect(() => {
    const urlHallId = searchParams.get('hallId');
    if (urlHallId) {
      setSelectedHallId(urlHallId);
    } else if (halls.length > 0 && !selectedHallId) {
      setSelectedHallId(halls[0].id || halls[0]._id);
    }
  }, [searchParams, halls]);

  const effectiveHallId = selectedHallId || (halls[0]?.id ? halls[0].id : halls[0]?._id ? halls[0]._id : '');
  const selectedHall = halls.find(h => String(h.id || h._id) === String(effectiveHallId)) || halls[0];

  // Schedule for selected date & hall
  const dayReservations = reservations.filter(
    r => {
      const rHallId = String(r.hallId || r.hall?._id || r.hall || '');
      const targetHallId = String(effectiveHallId || '');
      const rDate = r.date || r.eventDate;
      const statusLower = String(r.status || '').toLowerCase();
      return rHallId === targetHallId && rDate === selectedDate && (statusLower === 'approved' || statusLower === 'pending');
    }
  );

  const dayBlocks = blockedSlots.filter(
    b => {
      const bHallId = String(b.hallId || b.hall?._id || b.hall || '');
      const targetHallId = String(effectiveHallId || '');
      return bHallId === targetHallId && b.startDate <= selectedDate && b.endDate >= selectedDate;
    }
  );

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!effectiveHallId) return;

    if (endTime <= startTime) {
      setCheckResult({
        available: false,
        message: 'End time must be later than start time.'
      });
      return;
    }

    try {
      setLoading(true);
      const res = await checkAvailability(effectiveHallId, selectedDate, startTime, endTime);
      setCheckResult(res);
    } catch (err) {
      setCheckResult({
        available: false,
        message: err.message || 'Availability check failed.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">Slot Verification Tool</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4338CA] tracking-tight">Check Hall Availability</h1>
        <p className="text-xs text-slate-500 mt-1">
          Verify hall schedules in real-time to avoid time slot conflicts before submitting a reservation request.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Availability Form Panel */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handleCheck} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-[#4338CA] border-b border-slate-100 pb-3 flex items-center gap-2">
              <Search className="w-5 h-5 text-[#0D9488]" />
              Select Date & Time Slot
            </h2>

            {/* Hall Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Select Campus Hall
              </label>
              <select
                value={effectiveHallId}
                onChange={(e) => {
                  setSelectedHallId(e.target.value);
                  setCheckResult(null);
                }}
                className="w-full px-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-bold text-[#4338CA] bg-white"
              >
                {halls.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name || h.hallName} ({h.hallType || h.type} • Cap: {h.capacity})
                  </option>
                ))}
              </select>
            </div>

            {/* Date Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Event Date
              </label>
              <input
                type="date"
                min={todayStr}
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setCheckResult(null);
                }}
                required
                className="w-full px-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
              />
            </div>

            {/* Time Slot Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Start Time
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setCheckResult(null);
                  }}
                  required
                  className="w-full px-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  End Time
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    setCheckResult(null);
                  }}
                  required
                  className="w-full px-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0D9488] text-white py-3 rounded-xl font-bold text-sm hover:bg-teal-700 transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Checking Engine...' : 'Check Slot Availability'}
            </button>
          </form>

          {/* Result Alert Banner */}
          {checkResult && (
            <div
              className={`p-6 rounded-2xl border ${
                checkResult.available
                  ? 'bg-teal-50 border-teal-200 text-teal-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              } space-y-4 shadow-xs`}
            >
              <div className="flex items-start gap-3">
                {checkResult.available ? (
                  <CheckCircle2 className="w-6 h-6 text-[#0D9488] shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="font-extrabold text-sm">
                    {checkResult.available
                      ? 'Slot Available!'
                      : (checkResult.reason === 'PAST_TIME' || checkResult.message?.toLowerCase().includes('passed') || checkResult.message?.toLowerCase().includes('past date'))
                      ? 'Time Slot Expired'
                      : (checkResult.message?.toLowerCase().includes('outside hall operating hours') || checkResult.message?.toLowerCase().includes('operating hours'))
                      ? 'Outside Operating Hours'
                      : 'Slot Conflict Detected'}
                  </h3>
                  <p className="text-xs mt-1 leading-relaxed">{checkResult.message}</p>
                </div>
              </div>

              {checkResult.available && (
                <div className="pt-2">
                  <Link
                    to={`/reserve?hallId=${effectiveHallId}&date=${selectedDate}&startTime=${startTime}&endTime=${endTime}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D9488] text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition shadow-sm"
                  >
                    <span>Proceed to Reserve This Slot</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Existing Schedule Visualization for Selected Date */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#4338CA]">{selectedHall?.name || selectedHall?.hallName} Schedule</h2>
                <p className="text-xs text-slate-500">Date: {selectedDate}</p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded">
                Operating: {selectedHall?.openingTime} - {selectedHall?.closingTime}
              </span>
            </div>

            {/* Blocked Slots */}
            {dayBlocks.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Blocked Maintenance Period
                </div>
                <div>{dayBlocks[0].reason}: {dayBlocks[0].notes}</div>
              </div>
            )}

            {/* Occupied Reservations */}
            {dayReservations.length > 0 ? (
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Existing Reservations ({dayReservations.length})
                </div>
                {dayReservations.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-slate-800">{r.eventTitle}</div>
                      <div className="text-[11px] text-slate-500">{r.userName} ({r.department})</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-[#4338CA]">{r.startTime} - {r.endTime}</div>
                      <StatusBadge status={r.status} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 bg-teal-50/40 rounded-xl border border-teal-100 space-y-2">
                <CheckCircle2 className="w-6 h-6 mx-auto text-[#0D9488]" />
                <p className="font-semibold text-teal-900">No reservations booked on {selectedDate}.</p>
                <p className="text-[11px]">The hall is fully open for requests during operating hours.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckAvailabilityPage;
