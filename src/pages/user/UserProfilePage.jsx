import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { profileService } from '../../services/profileService';
import { CheckCircle, Save, AlertCircle } from 'lucide-react';

const UserProfilePage = () => {
  const { currentUser, updateUserProfile } = useApp();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    department: currentUser?.department || '',
    phone: currentUser?.phone || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        department: currentUser.department || '',
        phone: currentUser.phone || ''
      });
    }
  }, [currentUser]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      setMessage('');
      const res = await updateUserProfile({
        name: profileForm.name,
        department: profileForm.department,
        phone: profileForm.phone
      });

      if (res.success) {
        setMessage('Profile information successfully updated!');
        setTimeout(() => setMessage(''), 4000);
      } else {
        setError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.message || 'Server error updating profile.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setMessage('');

      const res = await profileService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      });

      if (res.success) {
        setMessage('Account password successfully changed!');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setMessage(''), 4000);
      } else {
        setError(res.message || 'Password change failed.');
      }
    } catch (err) {
      setError(err.message || 'Password update error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">Account Settings</span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4338CA] tracking-tight">Member Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Manage your personal details, institutional department info, and account credentials.
        </p>
      </div>

      {message && (
        <div className="p-4 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl font-bold flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-[#0D9488]" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Profile Showcase Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Profile Card Top Banner */}
        <div className="bg-[#4338CA] p-6 text-white flex flex-col sm:flex-row items-center gap-5">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'}
            alt={currentUser?.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-[#0D9488] shadow-md shrink-0"
          />
          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h2 className="text-xl font-extrabold">{currentUser?.name}</h2>
              <span className="bg-[#0D9488] text-white text-[10px] font-bold px-2 py-0.5 rounded">
                {currentUser?.userType || currentUser?.role}
              </span>
            </div>
            <p className="text-xs text-indigo-200 font-medium">{currentUser?.email}</p>
            <p className="text-xs text-indigo-200">
              Department: <strong>{currentUser?.department || 'General'}</strong> • ID: <strong>{currentUser?.collegeId || 'ID-001'}</strong>
            </p>
          </div>
        </div>

        {/* Form Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 text-xs font-bold">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 px-4 transition border-b-2 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-[#0D9488] text-[#4338CA]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Edit Profile Details
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`pb-3 px-4 transition border-b-2 cursor-pointer ${
              activeTab === 'password'
                ? 'border-[#0D9488] text-[#4338CA]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Change Password
          </button>
        </div>

        {/* Tab 1: Edit Profile */}
        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="p-6 sm:p-8 space-y-5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Institutional Email</label>
                <input
                  type="email"
                  value={profileForm.email}
                  disabled
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Department / Unit</label>
                <input
                  type="text"
                  value={profileForm.department}
                  onChange={(e) => setProfileForm({ ...profileForm, department: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  required
                  className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#0D9488] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-teal-700 transition shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Profile Updates'}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Change Password */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordSubmit} className="p-6 sm:p-8 space-y-5 text-xs max-w-md">
            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Current Password</label>
              <input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">New Password</label>
              <input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1 uppercase tracking-wider">Confirm New Password</label>
              <input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-[#4338CA] outline-hidden font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-[#0D9488] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-teal-700 transition shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
