import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { Users, Search, Filter, Power, UserCheck, Shield } from 'lucide-react';

const UserManagementPage = () => {
  const { users, toggleUserStatus } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === 'All' || u.userType.toLowerCase() === selectedRole.toLowerCase();
    const matchesStatus = selectedStatus === 'All' || u.status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">User Governance</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4338CA] tracking-tight">User Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit registered campus members, filter by department roles, and manage access authorization.
          </p>
        </div>

        <div className="text-xs font-semibold text-slate-500 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs w-fit">
          Registered Members: <strong className="text-[#4338CA]">{users.length}</strong>
        </div>
      </div>

      {/* Filters Box */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search user by name, email, department..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
            />
          </div>

          {/* Role Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-semibold text-slate-700 bg-white"
            >
              <option value="All">All User Roles</option>
              <option value="Faculty">Faculty</option>
              <option value="Student">Student</option>
              <option value="Staff">Staff</option>
              <option value="Department">Department</option>
              <option value="College Club/Committee">Club/Committee</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-semibold text-slate-700 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFC] text-[#4338CA] font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3.5">User Profile & ID</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition">
                    <td className="p-3.5 flex items-center gap-3">
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'}
                        alt={u.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-[#4338CA] text-xs sm:text-sm">{u.name}</div>
                        <div className="text-[11px] text-slate-500">{u.email} • ID: {u.employeeId}</div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="bg-indigo-50 text-[#4338CA] font-semibold px-2 py-0.5 rounded border border-indigo-100">
                        {u.userType}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700">{u.department}</td>
                    <td className="p-3.5 text-slate-500 font-mono">{u.phone}</td>
                    <td className="p-3.5">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="p-3.5 text-right">
                      {u.userType !== 'Admin' && (
                        <button
                          onClick={() => toggleUserStatus(u.id)}
                          className={`px-3 py-1 rounded-lg font-bold text-[11px] transition border ${
                            u.status === 'Active'
                              ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                              : 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                          }`}
                        >
                          {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No Matching Users Found" message="Try adjusting your role or status filter." />
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;
