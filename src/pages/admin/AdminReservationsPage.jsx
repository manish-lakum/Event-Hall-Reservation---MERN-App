import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import EmptyState from '../../components/common/EmptyState';
import { CalendarCheck, Search, Filter, Check, X, Eye, ShieldCheck } from 'lucide-react';

const AdminReservationsPage = () => {
  const { reservations, halls, approveReservation, rejectReservation } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHall, setSelectedHall] = useState('All');
  const [selectedUserType, setSelectedUserType] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedDate, setSelectedDate] = useState('');

  const [rejectModalTarget, setRejectModalTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approveConfirmId, setApproveConfirmId] = useState(null);

  const filteredReservations = reservations.filter((r) => {
    const matchesSearch =
      r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.eventTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesHall = selectedHall === 'All' || r.hallId === selectedHall;
    const matchesUserType = selectedUserType === 'All' || r.userType.toLowerCase() === selectedUserType.toLowerCase();
    const matchesStatus = selectedStatus === 'All' || r.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesDate = !selectedDate || r.date === selectedDate;

    return matchesSearch && matchesHall && matchesUserType && matchesStatus && matchesDate;
  });

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      alert('Please state a reason for rejection.');
      return;
    }
    rejectReservation(rejectModalTarget.id, rejectReason);
    setRejectModalTarget(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">Campus Governance</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4338CA] tracking-tight">Reservation Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review submitted hall booking requests, issue official approvals or rejections with remarks.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs w-fit">
          Showing <strong className="text-[#4338CA]">{filteredReservations.length}</strong> of {reservations.length} total
        </div>
      </div>

      {/* Filter Control Box */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <div className="sm:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Req ID, Requester or Event..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
            />
          </div>

          {/* Hall Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedHall}
              onChange={(e) => setSelectedHall(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-semibold text-slate-700 bg-white"
            >
              <option value="All">All Campus Halls</option>
              {halls.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          {/* User Type Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedUserType}
              onChange={(e) => setSelectedUserType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-semibold text-slate-700 bg-white"
            >
              <option value="All">All User Types</option>
              <option value="Faculty">Faculty</option>
              <option value="Student">Student</option>
              <option value="Staff">Staff</option>
              <option value="Department">Department</option>
              <option value="College Club/Committee">Club/Committee</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-semibold text-slate-700 bg-white"
            >
              <option value="All">All Request Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Cancelled">Cancelled</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Box */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {filteredReservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#4338CA] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Req ID</th>
                  <th className="p-3.5">Requester & Role</th>
                  <th className="p-3.5">Hall Venue</th>
                  <th className="p-3.5">Event Title</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Count</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredReservations.map((res) => {
                  const isPending = res.status === 'Pending';
                  return (
                    <tr key={res.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-mono font-bold text-[#4338CA]">{res.id}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{res.userName}</div>
                        <div className="text-[10px] text-slate-500">{res.userType} • {res.department}</div>
                      </td>
                      <td className="p-3.5 font-bold text-slate-800">{res.hallName}</td>
                      <td className="p-3.5 max-w-[180px] truncate">{res.eventTitle}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800">{res.date}</div>
                        <div className="text-[10px] text-slate-500">{res.startTime} - {res.endTime}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">{res.expectedParticipants}</td>
                      <td className="p-3.5">
                        <StatusBadge status={res.status} />
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => setApproveConfirmId(res.id)}
                                className="p-1.5 bg-[#0D9488] text-white hover:bg-teal-700 rounded-md transition"
                                title="Approve Request"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setRejectModalTarget(res)}
                                className="p-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-md transition"
                                title="Reject Request"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          <Link
                            to={`/admin/reservations/${res.id}`}
                            className="p-1.5 bg-indigo-50 text-[#4338CA] hover:bg-indigo-100 rounded-md transition font-bold"
                            title="View Complete Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title="No Matching Reservations"
            message="No reservation requests match your filter selection."
          />
        )}
      </div>

      {/* Confirmation Dialog for Approval */}
      <ConfirmDialog
        isOpen={Boolean(approveConfirmId)}
        onClose={() => setApproveConfirmId(null)}
        onConfirm={() => {
          if (approveConfirmId) {
            approveReservation(approveConfirmId);
            setApproveConfirmId(null);
          }
        }}
        title="Confirm Request Approval"
        message={`Are you sure you want to approve reservation request ${approveConfirmId}?`}
        confirmText="Approve Request"
      />

      {/* Modal for Rejection Reason */}
      <Modal
        isOpen={Boolean(rejectModalTarget)}
        onClose={() => setRejectModalTarget(null)}
        title="Reject Reservation Request"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              onClick={() => setRejectModalTarget(null)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReject}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs"
            >
              Confirm Rejection
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            State the official reason for declining request <strong>{rejectModalTarget?.id}</strong>:
          </p>
          <textarea
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="e.g. Schedule conflict with scheduled university exam evaluation."
            className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-hidden font-medium"
          />
        </div>
      </Modal>
    </div>
  );
};

export default AdminReservationsPage;
