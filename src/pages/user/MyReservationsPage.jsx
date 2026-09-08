import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { reservationService } from '../../services/reservationService';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Search, Eye, XCircle } from 'lucide-react';

const MyReservationsPage = () => {
  const { mapReservation } = useApp();

  const [myReservations, setMyReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelTargetId, setCancelTargetId] = useState(null);

  const fetchMyRes = async () => {
    try {
      setLoading(true);
      const res = await reservationService.getMyReservations();
      if (res.success && Array.isArray(res.data)) {
        setMyReservations(res.data.map(mapReservation));
      }
    } catch (err) {
      console.error('Failed to fetch my reservations:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRes();
  }, []);

  const handleConfirmCancel = async () => {
    if (!cancelTargetId) return;
    try {
      const res = await reservationService.cancelReservation(cancelTargetId);
      if (res.success) {
        setCancelTargetId(null);
        await fetchMyRes();
      }
    } catch (err) {
      console.error('Cancel failed:', err.message);
    }
  };

  const filteredReservations = myReservations.filter((res) => {
    const status = res.status || 'Pending';
    const matchesTab = activeTab === 'All' || status.toLowerCase() === activeTab.toLowerCase();
    const idStr = String(res.id || '');
    const hallStr = String(res.hallName || '');
    const titleStr = String(res.eventTitle || '');

    const matchesSearch =
      idStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      hallStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      titleStr.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const tabs = ['All', 'Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">User Portal</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4338CA] tracking-tight">My Hall Reservations</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track status, view approval remarks, and manage your submitted hall booking requests.
          </p>
        </div>

        <Link
          to="/reserve"
          className="bg-[#0D9488] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-teal-700 transition shadow-sm w-fit flex items-center gap-1.5"
        >
          + Request New Booking
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => {
              const count = tab === 'All'
                ? myReservations.length
                : myReservations.filter(r => (r.status || '').toLowerCase() === tab.toLowerCase()).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    activeTab === tab
                      ? 'bg-[#4338CA] text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <span>{tab}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === tab ? 'bg-indigo-900 text-teal-300' : 'bg-slate-100 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, Hall or Event..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
            />
          </div>
        </div>

        {/* Table View */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs font-semibold">Loading reservations from database...</div>
        ) : filteredReservations.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#4338CA] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Req ID</th>
                  <th className="p-3.5">Hall</th>
                  <th className="p-3.5">Event Title</th>
                  <th className="p-3.5">Schedule</th>
                  <th className="p-3.5">Requested On</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredReservations.map((res) => {
                  const canCancel = res.status === 'Pending' || res.status === 'Approved';
                  return (
                    <tr key={res.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 font-mono text-[#4338CA] font-bold">{String(res.id).slice(-8)}</td>
                      <td className="p-3.5 font-bold text-slate-800">{res.hallName}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{res.eventTitle}</div>
                        <div className="text-[10px] text-slate-500">{res.eventType} • {res.expectedParticipants} Persons</div>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-800">{res.date}</div>
                        <div className="text-[10px] text-slate-500">{res.startTime} - {res.endTime}</div>
                      </td>
                      <td className="p-3.5 text-slate-500 text-[11px]">{res.requestedOn}</td>
                      <td className="p-3.5">
                        <StatusBadge status={res.status} />
                      </td>
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/my-reservations/${res.id}`}
                            className="p-1.5 text-indigo-700 hover:bg-indigo-50 rounded-md transition font-bold flex items-center gap-1"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </Link>

                          {canCancel && (
                            <button
                              onClick={() => setCancelTargetId(res.id)}
                              className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                              title="Cancel Request"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Cancel</span>
                            </button>
                          )}
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
            title="No Reservations Found"
            message={`No reservation records found for tab filter "${activeTab}".`}
            action={
              <Link
                to="/reserve"
                className="bg-[#0D9488] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-teal-700 transition"
              >
                Submit Reservation Request
              </Link>
            }
          />
        )}
      </div>

      {/* Confirmation Dialog for Cancellation */}
      <ConfirmDialog
        isOpen={Boolean(cancelTargetId)}
        onClose={() => setCancelTargetId(null)}
        onConfirm={handleConfirmCancel}
        title="Confirm Reservation Cancellation"
        message={`Are you sure you want to cancel reservation request? This action will release the hall slot.`}
        confirmText="Yes, Cancel Request"
        cancelText="Keep Reservation"
        type="danger"
      />
    </div>
  );
};

export default MyReservationsPage;
