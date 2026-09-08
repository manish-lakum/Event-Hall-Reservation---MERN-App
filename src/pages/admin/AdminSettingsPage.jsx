import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Settings, Save, CheckCircle, ShieldCheck, Building2, Sliders, User, Camera } from 'lucide-react';

const defaultSettings = {
  collegeName: 'Sardar Vallabhbhai Global University (SVGU)',
  shortName: 'SVGU',
  contactEmail: 'admin@svgu.edu.in',
  contactPhone: '+91 79 2328 7000',
  allowWeekendBookings: true,
  maxAdvanceBookingDays: 30,
  autoApprovalEnabled: false,
  reservationRules: {
    minBookingDurationHours: 1,
    maxBookingDurationHours: 8,
    advanceBookingLimitDays: 30,
    allowWeekendBooking: true,
    autoApproveFaculty: false
  }
};

const AdminSettingsPage = () => {
  const { currentUser, settings, updateSettings } = useApp();
  const [form, setForm] = useState(() => ({
    ...defaultSettings,
    ...(settings || {}),
    reservationRules: {
      ...defaultSettings.reservationRules,
      ...(settings?.reservationRules || {})
    }
  }));
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (settings) {
      setForm(prev => ({
        ...defaultSettings,
        ...prev,
        ...settings,
        reservationRules: {
          ...defaultSettings.reservationRules,
          ...(prev?.reservationRules || {}),
          ...(settings?.reservationRules || {})
        }
      }));
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateSettings(form);
    setMessage('System governance settings updated successfully!');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">System Configuration</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4338CA] tracking-tight">Admin System Settings</h1>
        <p className="text-xs text-slate-500 mt-1">
          Configure institutional branding, contact details, and global hall booking policies.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-[#0D9488]" />
          <span>{message}</span>
        </div>
      )}

      {/* Admin Profile Overview Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80'}
            alt={currentUser?.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-[#0D9488]"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">{currentUser?.name || 'Administrator'}</h2>
              <span className="bg-[#0D9488] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                {currentUser?.role === 'ADMIN' ? 'ADMIN' : (currentUser?.role || 'ADMIN')}
              </span>
            </div>
            <p className="text-xs text-slate-500">{currentUser?.email}</p>
          </div>
        </div>

        <Link
          to="/admin/profile"
          className="bg-[#4338CA] text-white text-xs px-4 py-2 rounded-xl font-bold hover:bg-indigo-800 transition flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Camera className="w-3.5 h-3.5 text-teal-300" />
          Edit Admin Profile & Photo
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* Section 1: College Info */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Building2 className="w-5 h-5 text-[#4338CA]" />
            <h2 className="text-base font-bold text-[#4338CA]">Institutional Identity</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">College Name *</label>
              <input
                type="text"
                value={form.collegeName ?? ''}
                onChange={(e) => setForm({ ...form, collegeName: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Abbreviation / Short Name</label>
              <input
                type="text"
                value={form.shortName ?? ''}
                onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Helpdesk Email</label>
              <input
                type="email"
                value={form.contactEmail ?? ''}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Helpdesk Phone</label>
              <input
                type="text"
                value={form.contactPhone ?? ''}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Reservation Rules */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <Sliders className="w-5 h-5 text-[#0D9488]" />
            <h2 className="text-base font-bold text-[#4338CA]">Global Reservation Rules</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Min Booking (Hours)</label>
              <input
                type="number"
                min={1}
                max={4}
                value={form.reservationRules?.minBookingDurationHours ?? 1}
                onChange={(e) => setForm({
                  ...form,
                  reservationRules: { ...(form.reservationRules || {}), minBookingDurationHours: Number(e.target.value) }
                })}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Max Booking (Hours)</label>
              <input
                type="number"
                min={4}
                max={24}
                value={form.reservationRules?.maxBookingDurationHours ?? 8}
                onChange={(e) => setForm({
                  ...form,
                  reservationRules: { ...(form.reservationRules || {}), maxBookingDurationHours: Number(e.target.value) }
                })}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Advance Booking Limit (Days)</label>
              <input
                type="number"
                min={7}
                max={180}
                value={form.reservationRules?.advanceBookingLimitDays ?? 30}
                onChange={(e) => setForm({
                  ...form,
                  reservationRules: { ...(form.reservationRules || {}), advanceBookingLimitDays: Number(e.target.value) }
                })}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 font-medium"
              />
            </div>
          </div>

          <div className="pt-3 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(form.reservationRules?.allowWeekendBooking ?? false)}
                onChange={(e) => setForm({
                  ...form,
                  reservationRules: { ...(form.reservationRules || {}), allowWeekendBooking: e.target.checked }
                })}
                className="rounded text-[#0D9488] focus:ring-[#0D9488]"
              />
              <span>Allow Weekend Reservations (Saturday & Sunday)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
              <input
                type="checkbox"
                checked={Boolean(form.reservationRules?.autoApproveFaculty ?? false)}
                onChange={(e) => setForm({
                  ...form,
                  reservationRules: { ...(form.reservationRules || {}), autoApproveFaculty: e.target.checked }
                })}
                className="rounded text-[#0D9488] focus:ring-[#0D9488]"
              />
              <span>Auto-Approve Senior Faculty Requests</span>
            </label>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#0D9488] text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" /> Save System Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettingsPage;
