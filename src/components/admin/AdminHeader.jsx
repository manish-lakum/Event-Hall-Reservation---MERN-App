import React from 'react';
import { Menu, Bell, ShieldCheck, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

const AdminHeader = ({ onMenuClick, title }) => {
  const { currentUser, notifications } = useApp();

  const unreadAdminNotifs = notifications.filter(n => n.recipientType === 'Admin' && !n.isRead);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 px-4 md:px-6 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-slate-600 hover:text-indigo-700 hover:bg-slate-100 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-[#4338CA] tracking-tight">{title || 'Admin Management'}</h1>
          <p className="text-[11px] text-slate-500 font-medium hidden sm:block">Campus Facilities & Reservation Governance</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Admin Notifications */}
        <Link
          to="/admin/notifications"
          className="relative p-2 text-slate-600 hover:text-[#4338CA] hover:bg-slate-100 rounded-full transition"
          title="Admin Notifications"
        >
          <Bell className="w-5 h-5" />
          {unreadAdminNotifs.length > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#0D9488] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
              {unreadAdminNotifs.length}
            </span>
          )}
        </Link>

        {/* Admin User Profile Tag */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80'}
            alt="Admin"
            className="w-8 h-8 rounded-full object-cover border-2 border-[#0D9488]"
          />
          <div className="hidden sm:block text-left">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <span>{currentUser?.name || 'Administrator'}</span>
              <ShieldCheck className="w-3 h-3 text-[#0D9488]" />
            </div>
            <div className="text-[10px] text-slate-500 font-semibold">{currentUser?.userType || 'Admin'}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
