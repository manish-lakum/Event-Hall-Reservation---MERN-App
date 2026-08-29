import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  Building2,
  Calendar,
  Clock,
  Users,
  CheckSquare,
  FileText,
  User,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

const ReserveHallPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser, halls, addReservation, checkAvailability } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const paramHallId = searchParams.get('hallId') || halls[0]?.id || 'hall-1';
  const paramDate = searchParams.get('date') || todayStr;
  const paramStart = searchParams.get('startTime') || '09:00';
  const paramEnd = searchParams.get('endTime') || '12:00';

  const [formData, setFormData] = useState({
    userName: currentUser?.name || 'Dr. Sarah Jenkins',
    userEmail: currentUser?.email || 'sarah.jenkins@college.edu',
    userType: currentUser?.userType || 'Faculty',
    department: currentUser?.department || 'Computer Science',
    employeeId: currentUser?.employeeId || 'EMP-CS-402',

    hallId: paramHallId,
    eventTitle: '',
    eventType: 'Seminar / Workshop',
    eventDescription: '',
    date: paramDate,
    startTime: paramStart,
    endTime: paramEnd,
    expectedParticipants: 100,
    requestedFacilities: ['Projector', 'Microphone', 'Sound System'],
    additionalNotes: ''
  });

  const [error, setError] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const selectedHall = halls.find(h => h.id === formData.hallId) || halls[0];

  const handleFacilityChange = (facility) => {
    setFormData(prev => {
      const exists = prev.requestedFacilities.includes(facility);
      if (exists) {
        return { ...prev, requestedFacilities: prev.requestedFacilities.filter(f => f !== facility) };
      } else {
        return { ...prev, requestedFacilities: [...prev.requestedFacilities, facility] };
      }
    });
  };

  const handlePreSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (formData.endTime <= formData.startTime) {
      setError('End time must be later than start time.');
      return;
    }

    if (Number(formData.expectedParticipants) > selectedHall.capacity) {
      setError(`Expected participants (${formData.expectedParticipants}) exceeds selected hall capacity (${selectedHall.capacity}).`);
      return;
    }

    // Availability validation check
    const check = checkAvailability(formData.hallId, formData.date, formData.startTime, formData.endTime);
    if (!check.available) {
      setError(check.message);
      return;
    }

    setShowConfirmModal(true);
  };

  const handleFinalSubmit = () => {
    const res = addReservation(formData);
    if (res.success) {
      navigate('/my-reservations', { state: { newId: res.reservation.id } });
    } else {
      setError(res.message);
    }
  };

  const allFacilitiesList = [
    'Projector',
    'Microphone',
    'Sound System',
    'Stage',
    'Wi-Fi',
    'Air Conditioning',
    'Extra Chairs',
    'Smart Board'
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">Hall Reservation Portal</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4338CA] tracking-tight">Request Hall Reservation</h1>
        <p className="text-xs text-slate-500 mt-1">
          Complete the form below to submit an official reservation request to Campus Estate Management.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePreSubmit} className="space-y-8">
        {/* SECTION 1: User Information */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 bg-indigo-50 text-[#4338CA] rounded-lg">
              <User className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[#4338CA]">1. Requester Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Campus Email</label>
              <input
                type="email"
                value={formData.userEmail}
                onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">User Type</label>
              <select
                value={formData.userType}
                onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-semibold text-slate-700 bg-white"
              >
                <option value="Faculty">Faculty Member</option>
                <option value="Student">Student Representative</option>
                <option value="Staff">Administrative Staff</option>
                <option value="Department">Department Head</option>
                <option value="College Club/Committee">College Club / Committee</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Department / Club</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Enrollment / Employee ID</label>
              <input
                type="text"
                value={formData.employeeId}
                onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Reservation Information */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 bg-teal-50 text-[#0D9488] rounded-lg">
              <Building2 className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[#4338CA]">2. Event & Hall Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Target Hall</label>
              <select
                value={formData.hallId}
                onChange={(e) => setFormData({ ...formData, hallId: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-bold text-[#4338CA] bg-white"
              >
                {halls.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.type} • Capacity: {h.capacity} Persons)
                  </option>
                ))}
              </select>
              <div className="text-[11px] text-slate-500 mt-1 font-medium">
                Max seating capacity for {selectedHall?.name}: <strong>{selectedHall?.capacity}</strong> persons.
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Event Title</label>
              <input
                type="text"
                value={formData.eventTitle}
                onChange={(e) => setFormData({ ...formData, eventTitle: e.target.value })}
                placeholder="e.g. Annual MCA Technical Symposium 2026"
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Event Category</label>
              <select
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-semibold text-slate-700 bg-white"
              >
                <option value="Seminar / Workshop">Seminar / Workshop</option>
                <option value="Guest Lecture">Guest Lecture</option>
                <option value="Student Activity">Student Activity</option>
                <option value="Club Event">Club Event</option>
                <option value="Cultural Program">Cultural Program</option>
                <option value="Academic Presentation">Academic Presentation</option>
                <option value="Sports Activity">Sports Activity</option>
                <option value="Department Meeting">Department Meeting</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Expected Participants</label>
              <input
                type="number"
                min={1}
                max={selectedHall?.capacity}
                value={formData.expectedParticipants}
                onChange={(e) => setFormData({ ...formData, expectedParticipants: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Event Date</label>
              <input
                type="date"
                min={todayStr}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Event Description</label>
              <textarea
                rows={3}
                value={formData.eventDescription}
                onChange={(e) => setFormData({ ...formData, eventDescription: e.target.value })}
                placeholder="Brief summary of event objectives and agenda..."
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Facility Requirements */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
            <div className="p-2 bg-indigo-50 text-[#4338CA] rounded-lg">
              <CheckSquare className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-[#4338CA]">3. Equipment & Facility Requirements</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            {allFacilitiesList.map((facility) => {
              const checked = formData.requestedFacilities.includes(facility);
              return (
                <label
                  key={facility}
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition font-medium ${
                    checked
                      ? 'bg-teal-50 border-[#0D9488] text-teal-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => handleFacilityChange(facility)}
                    className="rounded text-[#0D9488] focus:ring-[#0D9488]"
                  />
                  <span>{facility}</span>
                </label>
              );
            })}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Additional Requirements & Notes
            </label>
            <textarea
              rows={2}
              value={formData.additionalNotes}
              onChange={(e) => setFormData({ ...formData, additionalNotes: e.target.value })}
              placeholder="e.g. Podium mic setup, stage decoration access 1 hour prior..."
              className="w-full px-3 py-2.5 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
            />
          </div>
        </div>

        {/* Form Action Buttons */}
        <div className="flex items-center justify-end gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-3 text-xs font-bold text-slate-600 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-8 py-3.5 text-sm font-extrabold text-white bg-[#0D9488] hover:bg-teal-700 rounded-xl transition shadow-md flex items-center gap-2"
          >
            <CheckCircle2 className="w-5 h-5" />
            Submit Reservation Request
          </button>
        </div>
      </form>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleFinalSubmit}
        title="Confirm Hall Reservation Request"
        message={`Are you sure you want to submit a reservation request for ${selectedHall?.name} on ${formData.date} (${formData.startTime} - ${formData.endTime})? The request will be submitted to Admin for review.`}
        confirmText="Confirm & Submit"
        cancelText="Review Form"
      />
    </div>
  );
};

export default ReserveHallPage;
