import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  ArrowLeft,
  User,
  Building2,
  Calendar,
  Clock,
  Check,
  X,
  ShieldCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';

const AdminReservationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { reservations, approveReservation, rejectReservation } = useApp();

  const reservation = reservations.find(r => r.id === id) || reservations[0];

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    rejectReservation(reservation.id, rejectReason);
    setRejectModalOpen(false);
    setRejectReason('');
  };

  const isPending = reservation?.status === 'Pending';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/admin/reservations')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4338CA] hover:underline bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Reservation Table
        </button>

        <span className="text-xs font-mono font-bold text-slate-500">ID: {reservation?.id}</span>
      </div>

      {/* Main Detail Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md space-y-6">
        {/* Banner */}
        <div className="bg-[#4338CA] p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="bg-[#0D9488] text-white text-xs font-bold px-2.5 py-1 rounded-md">
              {reservation?.eventType}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight mt-1">{reservation?.eventTitle}</h1>
            <p className="text-xs text-indigo-200">
              Venue: <strong>{reservation?.hallName}</strong> • Date: <strong>{reservation?.date}</strong>
            </p>
          </div>
          <div>
            <StatusBadge status={reservation?.status} />
          </div>
        </div>

        {/* Requester & Event Info Grid */}
        <div className="px-6 sm:px-8 space-y-6 text-xs text-slate-700">
          {/* User Information */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-[#4338CA] text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
              <User className="w-4 h-4 text-[#0D9488]" />
              Requester Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><strong>Name:</strong> {reservation?.userName}</div>
              <div><strong>Email:</strong> {reservation?.userEmail}</div>
              <div><strong>Role:</strong> {reservation?.userType}</div>
              <div><strong>Department:</strong> {reservation?.department}</div>
              <div><strong>Employee/Enroll ID:</strong> {reservation?.employeeId}</div>
              <div><strong>Submitted On:</strong> {reservation?.requestedOn}</div>
            </div>
          </div>

          {/* Event & Hall Information */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-[#4338CA] text-sm flex items-center gap-2 border-b border-slate-200 pb-2">
              <Building2 className="w-4 h-4 text-[#0D9488]" />
              Event & Venue Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div><strong>Target Hall:</strong> {reservation?.hallName}</div>
              <div><strong>Scheduled Date:</strong> {reservation?.date}</div>
              <div><strong>Time Slot:</strong> {reservation?.startTime} - {reservation?.endTime}</div>
              <div><strong>Expected Participants:</strong> {reservation?.expectedParticipants} persons</div>
              <div className="sm:col-span-2">
                <strong>Requested Facilities:</strong>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {reservation?.requestedFacilities?.map(f => (
                    <span key={f} className="bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded border border-teal-200 text-[11px]">
                      ✓ {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <strong>Event Description:</strong>
              <p className="text-slate-600 mt-1 leading-relaxed">{reservation?.eventDescription}</p>
            </div>

            {reservation?.additionalNotes && (
              <div className="pt-2 border-t border-slate-200">
                <strong>Additional Notes:</strong>
                <p className="text-slate-600 mt-1">{reservation.additionalNotes}</p>
              </div>
            )}
          </div>

          {/* Admin Remarks if exists */}
          {reservation?.adminRemarks && (
            <div className={`p-4 rounded-xl border ${reservation.status === 'Rejected' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-teal-50 border-teal-200 text-teal-900'} space-y-1`}>
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
                Admin Remarks Record:
              </div>
              <p className="pl-5 font-medium">{reservation.adminRemarks}</p>
            </div>
          )}
        </div>

        {/* Admin Governance Actions Bar */}
        {isPending && (
          <div className="bg-slate-100 p-6 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              onClick={() => setRejectModalOpen(true)}
              className="px-5 py-2.5 bg-rose-600 text-white hover:bg-rose-700 rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5"
            >
              <X className="w-4 h-4" /> Reject Request
            </button>
            <button
              onClick={() => setApproveConfirmOpen(true)}
              className="px-6 py-2.5 bg-[#0D9488] text-white hover:bg-teal-700 rounded-xl font-extrabold text-xs shadow-md flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" /> Approve Request
            </button>
          </div>
        )}
      </div>

      {/* Confirm Dialog for Approval */}
      <ConfirmDialog
        isOpen={approveConfirmOpen}
        onClose={() => setApproveConfirmOpen(false)}
        onConfirm={() => {
          approveReservation(reservation.id);
          setApproveConfirmOpen(false);
        }}
        title="Approve Reservation Request"
        message={`Are you sure you want to approve request ${reservation?.id} for ${reservation?.hallName}?`}
        confirmText="Approve Request"
      />

      {/* Modal for Rejection Reason */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Reservation Request"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReject}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg"
            >
              Confirm Rejection
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Please enter the official reason for declining request <strong>{reservation?.id}</strong>:
          </p>
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Venue is reserved for mandatory University Accreditation Committee inspection."
            className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-hidden font-medium"
          />
        </div>
      </Modal>
    </div>
  );
};

export default AdminReservationDetailsPage;
