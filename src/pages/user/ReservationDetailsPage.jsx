import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  ShieldCheck,
  Ban
} from 'lucide-react';

const ReservationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reservations, halls, cancelReservation } = useApp();

  const reservation = reservations.find(r => r.id === id) || reservations[0];
  const hall = halls.find(h => h.id === reservation?.hallId);

  // Status Progress Steps calculation
  const getProgressState = () => {
    switch (reservation?.status) {
      case 'Pending':
        return 2; // Step 2: Under Admin Review
      case 'Approved':
        return 3; // Step 3: Approved
      case 'Completed':
        return 4; // Step 4: Completed
      case 'Rejected':
      case 'Cancelled':
        return -1; // Failed or Cancelled terminal state
      default:
        return 1;
    }
  };

  const currentStep = getProgressState();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/my-reservations')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4338CA] hover:underline bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to My Reservations
        </button>

        <div className="text-xs font-mono text-slate-500 font-bold">
          ID: {reservation?.id}
        </div>
      </div>

      {/* Main Reservation Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md space-y-6">
        {/* Card Header Banner */}
        <div className="bg-[#4338CA] px-6 sm:px-8 py-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="bg-indigo-800 text-teal-300 text-xs font-semibold px-2.5 py-1 rounded-md border border-indigo-600">
              {reservation?.eventType}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">{reservation?.eventTitle}</h1>
            <p className="text-xs text-indigo-200">Venue: {reservation?.hallName} • Date: {reservation?.date}</p>
          </div>
          <div>
            <StatusBadge status={reservation?.status} />
          </div>
        </div>

        {/* SECTION: Reservation Progress Tracker */}
        <div className="px-6 sm:px-8 py-4 bg-slate-50 border-y border-slate-200">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Reservation Progress Status
          </h3>

          {currentStep === -1 ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3">
              <Ban className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-rose-900">
                  Request {reservation?.status}
                </h4>
                <p className="mt-0.5">{reservation?.adminRemarks || 'This reservation request is no longer active.'}</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className={`p-2.5 rounded-xl border font-bold ${currentStep >= 1 ? 'bg-teal-50 border-[#0D9488] text-teal-900' : 'bg-white border-slate-200 text-slate-400'}`}>
                1. Request Submitted
              </div>
              <div className={`p-2.5 rounded-xl border font-bold ${currentStep >= 2 ? 'bg-amber-50 border-amber-400 text-amber-900' : 'bg-white border-slate-200 text-slate-400'}`}>
                2. Admin Review
              </div>
              <div className={`p-2.5 rounded-xl border font-bold ${currentStep >= 3 ? 'bg-indigo-50 border-[#4338CA] text-[#4338CA]' : 'bg-white border-slate-200 text-slate-400'}`}>
                3. Approved
              </div>
              <div className={`p-2.5 rounded-xl border font-bold ${currentStep >= 4 ? 'bg-slate-100 border-slate-400 text-slate-800' : 'bg-white border-slate-200 text-slate-400'}`}>
                4. Completed
              </div>
            </div>
          )}
        </div>

        {/* SECTION: Admin Remarks (If Rejected or Approved with remarks) */}
        {reservation?.adminRemarks && (
          <div className="px-6 sm:px-8">
            <div className={`p-4 rounded-xl border ${reservation.status === 'Rejected' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-indigo-50 border-indigo-200 text-indigo-900'} space-y-1`}>
              <div className="font-bold text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
                Admin Remarks / Response:
              </div>
              <p className="text-xs leading-relaxed pl-5 font-medium">{reservation.adminRemarks}</p>
            </div>
          </div>
        )}

        {/* SECTION: Event & Requester Specifications */}
        <div className="px-6 sm:px-8 pb-8 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slate-700">
          {/* Box 1: Event & Schedule Info */}
          <div className="bg-[#F8FAFC] p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-[#4338CA] text-sm border-b border-slate-200 pb-2">Event Specifications</h3>
            <div><strong>Hall Venue:</strong> {reservation?.hallName}</div>
            <div><strong>Event Category:</strong> {reservation?.eventType}</div>
            <div><strong>Scheduled Date:</strong> {reservation?.date}</div>
            <div><strong>Time Slot:</strong> {reservation?.startTime} - {reservation?.endTime}</div>
            <div><strong>Expected Participants:</strong> {reservation?.expectedParticipants} persons</div>
            <div><strong>Requested On:</strong> {reservation?.requestedOn}</div>
            <div className="pt-2">
              <strong>Event Summary:</strong>
              <p className="text-slate-600 mt-1 leading-relaxed">{reservation?.eventDescription}</p>
            </div>
          </div>

          {/* Box 2: Requester & Facility Requirements */}
          <div className="bg-[#F8FAFC] p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-[#4338CA] text-sm border-b border-slate-200 pb-2">Requester & Equipment</h3>
            <div><strong>Organizer Name:</strong> {reservation?.userName}</div>
            <div><strong>User Role:</strong> {reservation?.userType}</div>
            <div><strong>Department / Unit:</strong> {reservation?.department}</div>
            <div><strong>ID Number:</strong> {reservation?.employeeId}</div>
            <div><strong>Contact Email:</strong> {reservation?.userEmail}</div>

            <div className="pt-2">
              <strong>Requested Facilities:</strong>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {reservation?.requestedFacilities?.map((f) => (
                  <span key={f} className="bg-teal-50 text-teal-800 text-[11px] font-semibold px-2 py-0.5 rounded border border-teal-200">
                    ✓ {f}
                  </span>
                ))}
              </div>
            </div>

            {reservation?.additionalNotes && (
              <div className="pt-2">
                <strong>Additional Notes:</strong>
                <p className="text-slate-600 mt-0.5">{reservation.additionalNotes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationDetailsPage;
