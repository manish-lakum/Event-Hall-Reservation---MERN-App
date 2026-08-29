import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { Building2, Plus, Search, Edit3, Trash2, Power, Eye } from 'lucide-react';

const HallManagementPage = () => {
  const { halls, toggleHallStatus, deleteHall } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const filteredHalls = halls.filter(h =>
    h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    h.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">Campus Governance</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4338CA] tracking-tight">Hall Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, update, enable, or disable internal university hall facilities.
          </p>
        </div>

        <Link
          to="/admin/halls/add"
          className="bg-[#0D9488] text-white px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-teal-700 transition shadow-sm flex items-center gap-1.5 w-fit"
        >
          <Plus className="w-4 h-4" /> Add New Hall
        </Link>
      </div>

      {/* Table Box */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hall name, type, location..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
            />
          </div>

          <div className="text-xs font-semibold text-slate-500">
            Total Venues: <strong className="text-[#4338CA]">{filteredHalls.length}</strong>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#4338CA] font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="p-3.5">Venue Image & Name</th>
                <th className="p-3.5">Type</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Capacity</th>
                <th className="p-3.5">Hours</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredHalls.map((hall) => (
                <tr key={hall.id} className="hover:bg-slate-50 transition">
                  <td className="p-3.5 flex items-center gap-3">
                    <img
                      src={hall.image}
                      alt={hall.name}
                      className="w-12 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <div className="font-bold text-[#4338CA] text-sm">{hall.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {hall.id}</div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="bg-indigo-50 text-[#4338CA] font-semibold px-2 py-0.5 rounded border border-indigo-100">
                      {hall.type}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 max-w-[180px] truncate">{hall.location}</td>
                  <td className="p-3.5 font-bold text-slate-800">{hall.capacity} Persons</td>
                  <td className="p-3.5 text-slate-500">{hall.openingTime} - {hall.closingTime}</td>
                  <td className="p-3.5">
                    <StatusBadge status={hall.status} />
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        to={`/halls/${hall.id}`}
                        className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-md transition"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        to={`/admin/halls/edit/${hall.id}`}
                        className="p-1.5 text-indigo-700 hover:bg-indigo-50 rounded-md transition"
                        title="Edit Hall Specs"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => toggleHallStatus(hall.id)}
                        className={`p-1.5 rounded-md transition ${
                          hall.status === 'Active'
                            ? 'text-amber-700 hover:bg-amber-50'
                            : 'text-teal-700 hover:bg-teal-50'
                        }`}
                        title={hall.status === 'Active' ? 'Disable Hall' : 'Enable Hall'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTargetId(hall.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md transition"
                        title="Delete Hall"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Dialog for Delete */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() => {
          if (deleteTargetId) {
            deleteHall(deleteTargetId);
            setDeleteTargetId(null);
          }
        }}
        title="Confirm Hall Deletion"
        message="Are you sure you want to delete this hall record? This action cannot be undone."
        confirmText="Delete Hall"
        type="danger"
      />
    </div>
  );
};

export default HallManagementPage;
