import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import { Search, UserPlus, X, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';

const UserManagementPage = () => {
  const { users, fetchUsers, toggleUserStatus, addUser } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const initialForm = {
    name: '',
    email: '',
    password: '',
    role: 'USER',
    userType: 'FACULTY',
    department: 'General',
    collegeId: '',
    phone: ''
  };

  const [formData, setFormData] = useState(initialForm);

  const loadUsers = async () => {
    setLoading(true);
    await fetchUsers();
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggle = async (userId) => {
    await toggleUserStatus(userId);
    await loadUsers();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };

  const openAddModal = () => {
    setFormData(initialForm);
    setFormError('');
    setFormSuccess('');
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const closeAddModal = () => {
    setIsModalOpen(false);
    setFormError('');
    setFormSuccess('');
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setFormError('Please fill in all required fields (Full Name, Email, and Password).');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters long.');
      return;
    }

    setFormSubmitting(true);
    const res = await addUser(formData);
    setFormSubmitting(false);

    if (res.success) {
      setFormSuccess('User account created successfully!');
      setTimeout(() => {
        closeAddModal();
      }, 1000);
    } else {
      setFormError(res.message || 'Failed to create user account.');
    }
  };

  const filteredUsers = users.filter((u) => {
    if (u.role === 'ADMIN') return false;

    const name = u.name || '';
    const email = u.email || '';
    const dept = u.department || '';
    const userType = u.userType || u.role || '';
    const status = u.status || (u.isActive ? 'Active' : 'Inactive');

    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === 'All' || userType.toLowerCase() === selectedRole.toLowerCase();
    const matchesStatus = selectedStatus === 'All' || status.toLowerCase() === selectedStatus.toLowerCase();

    return matchesSearch && matchesRole && matchesStatus;
  });

  const activeMembersCount = users.filter((u) => u.role !== 'ADMIN').length;

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

        <div className="flex items-center gap-3">
          <div className="text-xs font-semibold text-slate-500 bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-2xs">
            Registered Members: <strong className="text-[#4338CA]">{activeMembersCount}</strong>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 bg-[#4338CA] hover:bg-[#3730A3] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New User</span>
          </button>
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
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs font-semibold">Loading users from database...</div>
        ) : filteredUsers.length > 0 ? (
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
                {filteredUsers.map((u) => {
                  const roleStr = u.userType || u.role;
                  const isAdmin = u.role === 'ADMIN';
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5 flex items-center gap-3">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-[#4338CA] text-xs sm:text-sm">{u.name}</div>
                          <div className="text-[11px] text-slate-500">{u.email} • ID: {u.collegeId || 'ID-001'}</div>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-indigo-50 text-[#4338CA] font-semibold px-2 py-0.5 rounded border border-indigo-100">
                          {roleStr}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-700">{u.department || 'General'}</td>
                      <td className="p-3.5 text-slate-500 font-mono">{u.phone || 'N/A'}</td>
                      <td className="p-3.5">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="p-3.5 text-right">
                        {!isAdmin && (
                          <button
                            onClick={() => handleToggle(u.id)}
                            className={`px-3 py-1 rounded-lg font-bold text-[11px] transition border cursor-pointer ${
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
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="No Matching Users Found" message="Try adjusting your role or status filter." />
        )}
      </div>

      {/* Add New User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-[#F8FAFC]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-[#4338CA] flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">Add New User</h3>
                  <p className="text-[11px] text-slate-500">Create a new member account in the system</p>
                </div>
              </div>
              <button
                onClick={closeAddModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleCreateUser} className="p-6 space-y-4 text-xs">
              {/* Feedback Alerts */}
              {formError && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-lg text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="flex items-center gap-2 bg-teal-50 border border-teal-200 text-teal-700 px-3.5 py-2.5 rounded-lg text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              {/* Grid Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Dr. Rajesh Kumar"
                    required
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium text-slate-800"
                  />
                </div>

                {/* Email Address */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. rajesh@svgu.edu.in"
                    required
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium text-slate-800"
                  />
                </div>

                {/* Password */}
                <div className="sm:col-span-2 relative">
                  <label className="block font-bold text-slate-700 mb-1">Password * (Min 6 chars)</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full pl-3.5 pr-10 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium text-slate-800"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">System Role *</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-semibold text-slate-700 bg-white"
                  >
                    <option value="USER">USER (Standard)</option>
                    <option value="ADMIN">ADMIN (Administrator)</option>
                  </select>
                </div>

                {/* User Type / Category */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">User Category *</label>
                  <select
                    name="userType"
                    value={formData.userType}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-semibold text-slate-700 bg-white"
                  >
                    <option value="FACULTY">Faculty</option>
                  </select>
                </div>

                {/* Department */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    placeholder="e.g. Computer Science"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium text-slate-800"
                  />
                </div>

                {/* College ID */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">College / Roll ID</label>
                  <input
                    type="text"
                    name="collegeId"
                    value={formData.collegeId}
                    onChange={handleInputChange}
                    placeholder="e.g. 21BCE045"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium text-slate-800"
                  />
                </div>

                {/* Phone Number */}
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={formSubmitting}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center gap-2 bg-[#4338CA] hover:bg-[#3730A3] text-white text-xs font-bold px-5 py-2 rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? (
                    <span>Creating Account...</span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create User</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;

