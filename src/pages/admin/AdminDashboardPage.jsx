import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import DashboardCard from '../../components/cards/DashboardCard';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import {
  Building2,
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  Check,
  X,
  Eye,
  BarChart3,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

const AdminDashboardPage = () => {
  const { halls, reservations, approveReservation, rejectReservation, blockedSlots } = useApp();

  const [rejectModalTarget, setRejectModalTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approveConfirmId, setApproveConfirmId] = useState(null);

  // Stats calculations
  const totalHalls = halls.length;
  const totalReservations = reservations.length;
  const pendingRequests = reservations.filter(r => r.status === 'Pending');
  const approvedCount = reservations.filter(r => r.status === 'Approved').length;

  const todayStr = new Date().toISOString().split('T')[0];
  const todaysReservations = reservations.filter(r => r.date === todayStr && r.status === 'Approved');
  const upcomingCount = reservations.filter(r => r.status === 'Approved' && r.date >= todayStr).length;

  // Monthly stats calculation for charts
  const monthlyData = [
    { month: 'Apr', count: 12 },
    { month: 'May', count: 18 },
    { month: 'Jun', count: 8 },
    { month: 'Jul', count: 24 },
    { month: 'Aug', count: 32 },
    { month: 'Sep', count: 28 }
  ];

  const maxMonthCount = Math.max(...monthlyData.map(m => m.count));

  const handleConfirmReject = () => {
    if (!rejectReason.trim()) {
      alert('Please enter a valid reason for rejection.');
      return;
    }
    rejectReservation(rejectModalTarget.id, rejectReason);
    setRejectModalTarget(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-[#4338CA] text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="bg-[#0D9488] text-white text-xs font-bold px-3 py-1 rounded-full">
            Admin Management Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Campus Governance Overview</h1>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
            Monitor real-time hall bookings, process pending reservation requests, manage maintenance schedules, and audit campus usage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/reservations"
            className="bg-[#0D9488] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-teal-700 transition shadow-xs flex items-center gap-2"
          >
            Review Requests ({pendingRequests.length})
          </Link>
        </div>
      </div>

      {/* 6 Key Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <DashboardCard title="Total Halls" value={totalHalls} subtitle="Active campus venues" icon={Building2} color="indigo" />
        <DashboardCard title="Reservations" value={totalReservations} subtitle="All time requests" icon={CalendarCheck} color="indigo" />
        <DashboardCard title="Pending" value={pendingRequests.length} subtitle="Requires review" icon={Clock} color="amber" />
        <DashboardCard title="Approved" value={approvedCount} subtitle="Active bookings" icon={CheckCircle2} color="teal" />
        <DashboardCard title="Today's Events" value={todaysReservations.length} subtitle="Scheduled today" icon={Calendar} color="teal" />
        <DashboardCard title="Upcoming" value={upcomingCount} subtitle="Calendar bookings" icon={TrendingUp} color="indigo" />
      </div>

      {/* Main Section Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Pending Actions & Today's Schedule */}
        <div className="lg:col-span-8 space-y-8">
          {/* Pending Reservation Requests Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-600" />
                <h2 className="text-base font-bold text-[#4338CA]">Pending Requests Requiring Admin Action</h2>
              </div>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                {pendingRequests.length} Pending
              </span>
            </div>

            {pendingRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-[#4338CA] font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Req ID</th>
                      <th className="p-3">Requester</th>
                      <th className="p-3">Hall</th>
                      <th className="p-3">Event Title</th>
                      <th className="p-3">Date & Slot</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {pendingRequests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-[#4338CA]">{req.id}</td>
                        <td className="p-3">
                          <div className="font-bold text-slate-800">{req.userName}</div>
                          <div className="text-[10px] text-slate-500">{req.userType} • {req.department}</div>
                        </td>
                        <td className="p-3 font-semibold text-slate-800">{req.hallName}</td>
                        <td className="p-3 max-w-[150px] truncate">{req.eventTitle}</td>
                        <td className="p-3">
                          <div className="font-bold">{req.date}</div>
                          <div className="text-[10px] text-slate-500">{req.startTime} - {req.endTime}</div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setApproveConfirmId(req.id)}
                              className="p-1.5 bg-[#0D9488] text-white hover:bg-teal-700 rounded-md transition"
                              title="Approve Request"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setRejectModalTarget(req)}
                              className="p-1.5 bg-rose-600 text-white hover:bg-rose-700 rounded-md transition"
                              title="Reject Request"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              to={`/admin/reservations/${req.id}`}
                              className="p-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md transition"
                              title="View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs bg-teal-50/50 rounded-xl border border-teal-100">
                <CheckCircle2 className="w-6 h-6 mx-auto text-[#0D9488] mb-1" />
                All pending reservation requests have been processed!
              </div>
            )}
          </div>

          {/* Today's Hall Usage Schedule */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-[#4338CA]">Today's Hall Utilization ({todayStr})</h2>
              <Link to="/admin/calendar" className="text-xs font-bold text-[#0D9488] hover:underline">
                Open Schedule Calendar
              </Link>
            </div>

            {todaysReservations.length > 0 ? (
              <div className="space-y-2.5">
                {todaysReservations.map((r) => (
                  <div key={r.id} className="p-3.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#4338CA] text-sm">{r.eventTitle}</div>
                      <div className="text-slate-600 mt-0.5">
                        Venue: <strong>{r.hallName}</strong> • Organizer: {r.userName} ({r.department})
                      </div>
                    </div>
                    <div className="text-right font-bold text-teal-800 bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200">
                      {r.startTime} - {r.endTime}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No events scheduled for today.</p>
            )}
          </div>
        </div>

        {/* Right Column: Analytics & Usage Charts */}
        <div className="lg:col-span-4 space-y-6">
          {/* Bar Chart: Reservations by Month (60:30:10 Palette) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#4338CA]" />
                <h2 className="text-base font-bold text-[#4338CA]">Reservations Volume</h2>
              </div>
              <span className="text-[10px] text-slate-400 font-bold uppercase">Monthly Trend</span>
            </div>

            <div className="h-44 flex items-end justify-between gap-2 pt-4 px-2">
              {monthlyData.map((d) => {
                const heightPercent = Math.round((d.count / maxMonthCount) * 100);
                return (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[10px] font-extrabold text-[#4338CA]">{d.count}</span>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full bg-[#4338CA] hover:bg-[#0D9488] transition-colors rounded-t-md"
                    ></div>
                    <span className="text-[11px] font-bold text-slate-500">{d.month}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent System Activity Feed */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#4338CA] border-b border-slate-100 pb-3">
              Recent System Activity
            </h2>
            <div className="space-y-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-[#4338CA]">New Reservation Request</div>
                <div className="text-slate-600">Prof. Alan Turing requested Conference Hall.</div>
                <div className="text-[10px] text-slate-400">10 mins ago</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-[#0D9488]">Reservation Approved</div>
                <div className="text-slate-600">Rahul Verma reservation for Seminar Hall approved.</div>
                <div className="text-[10px] text-slate-400">1 hour ago</div>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <div className="font-bold text-rose-700">Maintenance Slot Blocked</div>
                <div className="text-slate-600">Auditorium Hall blocked for HVAC repairs.</div>
                <div className="text-[10px] text-slate-400">Yesterday</div>
              </div>
            </div>
          </div>
        </div>
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
        title="Approve Reservation Request"
        message={`Are you sure you want to approve reservation request ${approveConfirmId}? The selected hall slot will be locked.`}
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
            Provide an official reason for rejecting request <strong>{rejectModalTarget?.id}</strong> ({rejectModalTarget?.eventTitle}). This remark will be sent directly to the requester.
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 uppercase tracking-wider">
              Reason for Rejection *
            </label>
            <textarea
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Hall pre-allocated for University Semester Exam Evaluation."
              required
              className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 outline-hidden font-medium"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
