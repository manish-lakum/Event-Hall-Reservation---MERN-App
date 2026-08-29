import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import DashboardCard from '../../components/cards/DashboardCard';
import StatusBadge from '../../components/common/StatusBadge';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  PlusCircle,
  Search,
  ArrowRight,
  User,
  MapPin,
  AlertCircle
} from 'lucide-react';

const UserDashboardPage = () => {
  const { currentUser, reservations, halls } = useApp();

  // User specific reservations
  const userReservations = reservations.filter(r => r.userId === currentUser?.id || r.userEmail === currentUser?.email);

  const totalRes = userReservations.length;
  const pendingRes = userReservations.filter(r => r.status === 'Pending').length;
  const approvedRes = userReservations.filter(r => r.status === 'Approved').length;
  const upcomingRes = userReservations.filter(r => r.status === 'Approved' && new Date(r.date) >= new Date()).length;

  const nextUpcoming = userReservations
    .filter(r => r.status === 'Approved' && new Date(r.date) >= new Date())
    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

  const recentRequests = userReservations.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-[#4338CA] text-white rounded-2xl p-6 sm:p-8 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <span className="bg-indigo-800 text-teal-300 text-xs font-semibold px-3 py-1 rounded-full border border-indigo-600">
            {currentUser?.userType || 'Campus Member'} • {currentUser?.department}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser?.name || 'Member'}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 max-w-xl leading-relaxed">
            Manage your hall reservation requests, track approval statuses, and verify facility availability across campus.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/reserve"
            className="bg-[#0D9488] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-teal-700 transition shadow-sm flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            Reserve Hall Now
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardCard
          title="Total Reservations"
          value={totalRes}
          subtitle="All-time user submissions"
          icon={CalendarCheck}
          color="indigo"
        />
        <DashboardCard
          title="Pending Requests"
          value={pendingRes}
          subtitle="Awaiting admin review"
          icon={Clock}
          color="amber"
        />
        <DashboardCard
          title="Approved Reservations"
          value={approvedRes}
          subtitle="Confirmed bookings"
          icon={CheckCircle2}
          color="teal"
        />
        <DashboardCard
          title="Upcoming Events"
          value={upcomingRes}
          subtitle="Scheduled on calendar"
          icon={Calendar}
          color="indigo"
        />
      </div>

      {/* Dashboard Content Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Upcoming & Recent */}
        <div className="lg:col-span-8 space-y-8">
          {/* Next Upcoming Reservation Spotlight */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0D9488]" />
                <h2 className="text-base font-bold text-[#4338CA]">Next Upcoming Approved Event</h2>
              </div>
              {nextUpcoming && <StatusBadge status={nextUpcoming.status} />}
            </div>

            {nextUpcoming ? (
              <div className="bg-[#F8FAFC] p-4 rounded-xl border border-indigo-100 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h3 className="font-extrabold text-[#4338CA] text-base">{nextUpcoming.eventTitle}</h3>
                  <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                    {nextUpcoming.eventType}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-teal-600" />
                    <span>{nextUpcoming.hallName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-teal-600" />
                    <span>{nextUpcoming.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-teal-600" />
                    <span>{nextUpcoming.startTime} - {nextUpcoming.endTime}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Link
                    to={`/my-reservations/${nextUpcoming.id}`}
                    className="text-xs font-bold text-[#0D9488] hover:text-teal-800 flex items-center gap-1 hover:underline"
                  >
                    <span>View Reservation Pass</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs space-y-2">
                <AlertCircle className="w-8 h-8 mx-auto text-slate-400" />
                <p>No upcoming approved events scheduled.</p>
                <Link to="/halls" className="text-[#0D9488] font-bold hover:underline inline-block">
                  Browse Halls & Request Booking
                </Link>
              </div>
            )}
          </div>

          {/* Recent Reservations Table */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-[#4338CA]">Recent Reservation Requests</h2>
              <Link to="/my-reservations" className="text-xs font-bold text-[#0D9488] hover:underline">
                View All ({userReservations.length})
              </Link>
            </div>

            {recentRequests.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F8FAFC] text-[#4338CA] font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">Req ID</th>
                      <th className="p-3">Hall</th>
                      <th className="p-3">Event Title</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {recentRequests.map((res) => (
                      <tr key={res.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono text-slate-500">{res.id}</td>
                        <td className="p-3 font-bold text-slate-800">{res.hallName}</td>
                        <td className="p-3 text-slate-700 max-w-[180px] truncate">{res.eventTitle}</td>
                        <td className="p-3 text-slate-600">
                          {res.date}<br />
                          <span className="text-[10px] text-slate-400">{res.startTime} - {res.endTime}</span>
                        </td>
                        <td className="p-3">
                          <StatusBadge status={res.status} />
                        </td>
                        <td className="p-3 text-right">
                          <Link
                            to={`/my-reservations/${res.id}`}
                            className="text-xs font-bold text-[#4338CA] hover:text-indigo-900"
                          >
                            Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-500 text-center py-4">No reservation requests submitted yet.</p>
            )}
          </div>
        </div>

        {/* Right Column: Quick Actions & Campus Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#4338CA] border-b border-slate-100 pb-3">Quick Actions</h2>
            <div className="space-y-2.5">
              <Link
                to="/halls"
                className="w-full flex items-center justify-between p-3 rounded-lg bg-indigo-50 text-[#4338CA] hover:bg-indigo-100 transition font-semibold text-xs border border-indigo-100"
              >
                <div className="flex items-center gap-2.5">
                  <Building2 className="w-4 h-4 text-[#0D9488]" />
                  <span>Browse Campus Halls</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/availability"
                className="w-full flex items-center justify-between p-3 rounded-lg bg-teal-50 text-teal-800 hover:bg-teal-100 transition font-semibold text-xs border border-teal-100"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-teal-600" />
                  <span>Check Hall Availability</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/reserve"
                className="w-full flex items-center justify-between p-3 rounded-lg bg-[#0D9488] text-white hover:bg-teal-700 transition font-bold text-xs shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className="w-4 h-4 text-white" />
                  <span>Reserve Hall Request</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/my-reservations"
                className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition font-semibold text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <CalendarCheck className="w-4 h-4 text-slate-500" />
                  <span>Track My Reservations</span>
                </div>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Quick Hall Availability Snapshot */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-[#4338CA] border-b border-slate-100 pb-3">Campus Facilities</h2>
            <div className="space-y-3">
              {halls.slice(0, 4).map((h) => (
                <div key={h.id} className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-800">{h.name}</div>
                    <div className="text-[10px] text-slate-500">{h.type} • Cap: {h.capacity}</div>
                  </div>
                  <Link to={`/halls/${h.id}`} className="text-[#0D9488] font-bold hover:underline">
                    Details
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboardPage;
