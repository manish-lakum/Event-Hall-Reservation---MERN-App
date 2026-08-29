import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  CalendarDays,
  Ban,
  Users,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ShieldCheck,
  ArrowLeft,
  X
} from 'lucide-react';

const AdminSidebar = ({ isOpen, onClose }) => {
  const { currentRole, switchRole, logout, notifications, settings } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const unreadAdminNotifs = notifications.filter(n => n.recipientType === 'Admin' && !n.isRead);

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Hall Management', path: '/admin/halls', icon: Building2 },
    { name: 'Reservations', path: '/admin/reservations', icon: CalendarCheck },
    { name: 'Schedule Calendar', path: '/admin/calendar', icon: CalendarDays },
    { name: 'Block / Maintenance', path: '/admin/block-hall', icon: Ban },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    {
      name: 'Notifications',
      path: '/admin/notifications',
      icon: Bell,
      badge: unreadAdminNotifs.length > 0 ? unreadAdminNotifs.length : null
    },
    { name: 'Settings', path: '/admin/settings', icon: Settings }
  ];

  const handleSwitchToUser = () => {
    switchRole('User');
    navigate('/dashboard');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#4338CA] text-white flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } shadow-xl`}
      >
        {/* Admin Header / Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-indigo-700">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#0D9488] rounded-md shadow-sm">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm leading-tight text-white">{settings.shortName || 'SVGU Campus'}</h2>
              <span className="text-[11px] text-teal-300 font-semibold uppercase tracking-wider">Admin Control Panel</span>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-indigo-200 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Navigation Items */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-indigo-900 text-white font-bold shadow-sm border-l-4 border-[#0D9488]'
                    : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-indigo-200'}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="bg-[#0D9488] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-indigo-700 bg-indigo-900/60 space-y-2">
          <button
            onClick={handleSwitchToUser}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold bg-indigo-700 text-teal-200 rounded-lg hover:bg-indigo-600 transition border border-indigo-500 shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Switch to User Portal
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-indigo-200 hover:text-rose-200 hover:bg-rose-900/30 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out System
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
