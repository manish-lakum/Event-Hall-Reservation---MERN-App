import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { Ban, Calendar, Clock, Plus, Trash2, AlertTriangle, ShieldCheck } from 'lucide-react';

const BlockHallPage = () => {
  const { halls, blockedSlots, addBlockedSlot, deleteBlockedSlot } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    hallId: halls[0]?.id || 'hall-1',
    startDate: todayStr,
    endDate: todayStr,
    startTime: '08:00',
    endTime: '18:00',
    reason: 'Maintenance',
    notes: ''
  });

  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    addBlockedSlot(form);
    setForm({
      hallId: halls[0]?.id || 'hall-1',
      startDate: todayStr,
      endDate: todayStr,
      startTime: '08:00',
      endTime: '18:00',
      reason: 'Maintenance',
      notes: ''
    });
  };

  const reasonsList = [
    'Maintenance',
    'Examination',
    'College Function',
    'Cleaning',
    'Technical Work',
    'Administrative Use'
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">Maintenance Governance</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4338CA] tracking-tight">Block Hall / Scheduled Maintenance</h1>
        <p className="text-xs text-slate-500 mt-1">
          Lock hall slots for university exams, repairs, accreditation visits, or campus functions to block user bookings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
            <h2 className="text-base font-bold text-[#4338CA] border-b border-slate-100 pb-3 flex items-center gap-2">
              <Ban className="w-5 h-5 text-amber-600" />
              Schedule New Maintenance Block
            </h2>

            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Select Hall Venue</label>
              <select
                value={form.hallId}
                onChange={(e) => setForm({ ...form, hallId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-bold text-[#4338CA] bg-white"
              >
                {halls.map(h => (
                  <option key={h.id} value={h.id}>{h.name} ({h.type})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Reason for Block</label>
              <select
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-semibold text-slate-700 bg-white"
              >
                {reasonsList.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Start Date</label>
                <input
                  type="date"
                  min={todayStr}
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">End Date</label>
                <input
                  type="date"
                  min={form.startDate}
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Start Time</label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">End Time</label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Notes / Technical Remarks</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Electrical panel inspection & ceiling repairs..."
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-medium"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#4338CA] text-white py-3 rounded-xl font-bold hover:bg-indigo-900 transition shadow-md flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-teal-400" /> Apply Hall Maintenance Block
            </button>
          </form>
        </div>

        {/* Existing Blocks Table Column */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#4338CA] border-b border-slate-100 pb-3 flex items-center justify-between">
              <span>Active & Scheduled Maintenance Blocks</span>
              <span className="text-xs text-slate-500 font-semibold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-200">
                {blockedSlots.length} Blocks Total
              </span>
            </h2>

            {blockedSlots.length > 0 ? (
              <div className="space-y-3 text-xs">
                {blockedSlots.map((blk) => (
                  <div key={blk.id} className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#4338CA] text-sm">{blk.hallName}</span>
                        <span className="bg-amber-600 text-white font-bold px-2 py-0.2 rounded text-[10px]">
                          {blk.reason}
                        </span>
                      </div>
                      <div className="text-slate-700 font-medium">
                        <strong>Period:</strong> {blk.startDate} to {blk.endDate} ({blk.startTime} - {blk.endTime})
                      </div>
                      {blk.notes && <div className="text-slate-600 text-[11px]">{blk.notes}</div>}
                    </div>

                    <button
                      onClick={() => setDeleteTargetId(blk.id)}
                      className="p-1.5 bg-white text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition shrink-0"
                      title="Remove Maintenance Block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No Active Maintenance Blocks" message="All halls are currently open for user reservations." />
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) {
            deleteBlockedSlot(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Remove Maintenance Block"
        message="Are you sure you want to unblock this hall? Users will be able to submit reservations for this time period."
        confirmText="Unblock Hall"
        type="warning"
      />
    </div>
  );
};

export default BlockHallPage;
