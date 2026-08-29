import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import {
  Users,
  MapPin,
  Clock,
  CheckCircle,
  Calendar,
  ArrowRight,
  ArrowLeft,
  Building2,
  AlertTriangle,
  Info
} from 'lucide-react';

const HallDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { halls, reservations, blockedSlots } = useApp();

  const hall = halls.find(h => h.id === id) || halls[0];

  // Occupied slots for this hall
  const hallReservations = reservations.filter(
    r => r.hallId === hall.id && (r.status === 'Approved' || r.status === 'Pending')
  );

  const hallBlocks = blockedSlots.filter(b => b.hallId === hall.id);

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4338CA] hover:underline bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Hall Listing
        </button>
      </div>

      {/* Hero Showcase Card */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-md">
        <div className="relative h-72 sm:h-96 w-full">
          <img
            src={hall.image}
            alt={hall.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6 sm:p-8 text-white space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-[#0D9488] text-white text-xs font-extrabold px-3 py-1 rounded-md">
                {hall.type}
              </span>
              <StatusBadge status={hall.status} />
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">{hall.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-200 font-medium">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-teal-400" />
                <span>{hall.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-teal-400" />
                <span>Capacity: <strong className="text-white">{hall.capacity}</strong> Seats</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-teal-400" />
                <span>Operating Hours: {hall.openingTime} - {hall.closingTime}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Details Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-8 space-y-6">
            <div>
              <h3 className="text-base font-bold text-[#4338CA] mb-2">Venue Overview</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                {hall.description}
              </p>
            </div>

            {/* Facilities Included */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-base font-bold text-[#4338CA]">Available Hall Facilities</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hall.facilities.map((facility) => (
                  <div
                    key={facility}
                    className="flex items-center gap-2.5 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 text-xs font-semibold text-[#4338CA]"
                  >
                    <CheckCircle className="w-4 h-4 text-[#0D9488] shrink-0" />
                    <span>{facility}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Occupied & Maintenance Slots */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-[#4338CA]">Upcoming Occupied & Maintenance Slots</h3>
                <span className="text-xs text-slate-500 font-medium">Check before requesting slot</span>
              </div>

              {hallBlocks.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Maintenance / Administrative Blocked Periods
                  </div>
                  {hallBlocks.map((blk) => (
                    <div key={blk.id} className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                      <div>
                        <strong>{blk.reason}</strong>: {blk.startDate} to {blk.endDate} ({blk.startTime || 'Full Day'})
                        <div className="text-[11px] text-amber-700">{blk.notes}</div>
                      </div>
                      <span className="bg-amber-600 text-white font-bold px-2 py-0.5 rounded text-[10px]">Blocked</span>
                    </div>
                  ))}
                </div>
              )}

              {hallReservations.length > 0 ? (
                <div className="space-y-2">
                  {hallReservations.map((res) => (
                    <div
                      key={res.id}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-bold text-slate-800">{res.eventTitle}</div>
                        <div className="text-[11px] text-slate-500">
                          Organizer: {res.userName} ({res.department})
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-right">
                        <div>
                          <div className="font-semibold text-[#4338CA]">{res.date}</div>
                          <div className="text-[11px] text-slate-500">{res.startTime} - {res.endTime}</div>
                        </div>
                        <StatusBadge status={res.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-teal-50 rounded-xl border border-teal-200 text-xs text-teal-800 flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#0D9488]" />
                  <span>No conflicting reservations found for this hall in the immediate schedule.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Action Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#F8FAFC] p-6 rounded-2xl border border-indigo-100 shadow-xs space-y-5 sticky top-24">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Venue Actions</span>
                <h3 className="text-lg font-extrabold text-[#4338CA]">Reserve Venue</h3>
              </div>

              <div className="space-y-3">
                <Link
                  to={`/reserve?hallId=${hall.id}`}
                  className="w-full bg-[#0D9488] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-teal-700 transition shadow-md flex items-center justify-center gap-2"
                >
                  <span>Submit Reservation Request</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to={`/availability?hallId=${hall.id}`}
                  className="w-full bg-white text-[#4338CA] border border-indigo-300 py-3 rounded-xl font-bold text-xs hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                >
                  <Clock className="w-4 h-4 text-[#0D9488]" />
                  <span>Check Time Slot Availability</span>
                </Link>
              </div>

              <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 space-y-2">
                <div className="font-bold text-slate-700">Reservation Guidelines:</div>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Requests must be submitted at least 24 hours prior.</li>
                  <li>Expected participants cannot exceed {hall.capacity}.</li>
                  <li>Admin review required before confirmation.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HallDetailsPage;
