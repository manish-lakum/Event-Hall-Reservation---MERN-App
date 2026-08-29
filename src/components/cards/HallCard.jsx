import React from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPin, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';

const HallCard = ({ hall, isAdmin = false, onToggleStatus, onDelete }) => {
  const { id, name, type, capacity, location, description, facilities, image, status } = hall;

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
      {/* Hall Image with Badge Overlay */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="bg-[#4338CA] text-white text-xs font-bold px-2.5 py-1 rounded-md shadow-xs">
            {type}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <StatusBadge status={status} />
        </div>
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs font-medium px-2.5 py-1 rounded-md flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-teal-400" />
          <span>Capacity: <strong className="text-white">{capacity}</strong> persons</span>
        </div>
      </div>

      {/* Hall Specs & Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[#4338CA] group-hover:text-indigo-800 transition tracking-tight">
            {name}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">{location}</span>
          </div>

          <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
            {description}
          </p>

          {/* Facility Chips */}
          <div className="mt-3.5 flex flex-wrap gap-1.5">
            {facilities?.slice(0, 5).map((fac) => (
              <span
                key={fac}
                className="bg-indigo-50 text-indigo-700 text-[11px] font-medium px-2 py-0.5 rounded border border-indigo-100 flex items-center gap-1"
              >
                <CheckCircle className="w-3 h-3 text-teal-600" />
                {fac}
              </span>
            ))}
            {facilities?.length > 5 && (
              <span className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2 py-0.5 rounded">
                +{facilities.length - 5} more
              </span>
            )}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {isAdmin ? (
            <div className="flex items-center gap-2 w-full">
              <Link
                to={`/admin/halls/edit/${id}`}
                className="flex-1 text-center py-2 text-xs font-semibold bg-indigo-50 text-[#4338CA] hover:bg-indigo-100 rounded-lg transition"
              >
                Edit
              </Link>
              <button
                onClick={() => onToggleStatus(id)}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
                  status === 'Active'
                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                    : 'bg-teal-50 text-teal-700 hover:bg-teal-100'
                }`}
              >
                {status === 'Active' ? 'Disable' : 'Enable'}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between w-full gap-2">
              <Link
                to={`/halls/${id}`}
                className="text-xs font-semibold text-slate-700 hover:text-[#4338CA] px-3 py-2 rounded-lg hover:bg-slate-100 transition"
              >
                View Details
              </Link>

              <Link
                to={`/reserve?hallId=${id}`}
                className="bg-[#0D9488] text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-teal-700 transition shadow-xs flex items-center gap-1.5"
              >
                <span>Reserve Hall</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HallCard;
