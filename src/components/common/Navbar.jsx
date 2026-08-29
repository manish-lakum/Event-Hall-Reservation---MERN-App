import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Building2,
  Calendar,
  Clock,
  Bell,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  LayoutDashboard,
  CheckCircle2
} from 'lucide-react';

const Navbar = () => {
  const { currentUser, currentRole, switchRole, logout, notifications, settings } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const unreadUserNotifs = notifications.filter(n => n.recipientType === 'User' && !n.isRead);

  const isPublicPage = ['/', '/login', '/forgot-password', '/verify-otp', '/reset-password'].includes(location.pathname);

  const navLinks = isPublicPage && !currentUser
    ? [
        { name: 'Home', path: '/' },
        { name: 'Halls', path: '/halls' },
        { name: 'About', path: '/#about' },
        { name: 'Contact', path: '/#contact' }
      ]
    : [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Browse Halls', path: '/halls', icon: Building2 },
        { name: 'Availability', path: '/availability', icon: Clock },
        { name: 'My Reservations', path: '/my-reservations', icon: CheckCircle2 },
        { name: 'Calendar', path: '/calendar', icon: Calendar }
      ];

  const handleRoleToggle = () => {
    if (currentRole === 'User') {
      switchRole('Admin');
      navigate('/admin/dashboard');
    } else {
      switchRole('User');
      navigate('/dashboard');
    }
  };

  return (
    <nav className="bg-[#4338CA] text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <Link to={currentUser ? '/dashboard' : '/'} className="flex items-center gap-2.5 group">
              <div className="p-2 bg-[#0D9488] rounded-lg shadow-sm group-hover:bg-teal-700 transition">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-lg tracking-tight leading-none text-white">
                  {settings.shortName || 'SVGU Campus'}
                </span>
                <span className="text-xs text-indigo-200 font-medium">Hall Reservation System</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-indigo-800 text-white font-semibold shadow-inner'
                      : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
                  }`}
                >
                  {link.icon && <link.icon className="w-4 h-4 text-indigo-200" />}
                  {link.name}
                </Link>
              );
            })}
          </div>

          {/* Action Tools & User Profile */}
          <div className="hidden md:flex items-center gap-3">
            {/* Quick Demo Role Switcher Badge */}
            <button
              onClick={handleRoleToggle}
              title="Click to toggle demo portal mode"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-800 text-teal-300 border border-indigo-500 hover:bg-indigo-900 hover:border-teal-400 transition shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Role: <strong className="text-white">{currentRole}</strong></span>
              <span className="text-[10px] bg-teal-600 text-white px-1.5 py-0.5 rounded ml-1">Switch</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3 pl-2 border-l border-indigo-500">
                {/* Notifications Bell */}
                <div className="relative">
                  <Link
                    to="/notifications"
                    className="p-2 text-indigo-100 hover:text-white rounded-full hover:bg-indigo-600 transition block relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadUserNotifs.length > 0 && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-[#0D9488] text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-[#4338CA]">
                        {unreadUserNotifs.length}
                      </span>
                    )}
                  </Link>
                </div>

                {/* Profile Link */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 text-sm text-indigo-100 hover:text-white font-medium hover:bg-indigo-600 px-2.5 py-1.5 rounded-lg transition"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'}
                    alt={currentUser.name}
                    className="w-7 h-7 rounded-full object-cover border border-indigo-400"
                  />
                  <span className="max-w-[120px] truncate">{currentUser.name}</span>
                </Link>

                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 text-indigo-200 hover:text-white rounded-lg hover:bg-indigo-600 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-[#0D9488] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-700 transition shadow-sm flex items-center gap-1.5"
              >
                <UserIcon className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu trigger button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={handleRoleToggle}
              className="text-xs bg-indigo-800 text-teal-300 px-2 py-1 rounded border border-indigo-500 font-semibold"
            >
              {currentRole}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-indigo-100 hover:text-white rounded-lg focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-indigo-900 border-t border-indigo-800 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-indigo-100 hover:bg-indigo-800 hover:text-white"
            >
              {link.name}
            </Link>
          ))}
          {currentUser ? (
            <div className="pt-4 border-t border-indigo-800 space-y-2">
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2 text-indigo-100 hover:bg-indigo-800 rounded-md"
              >
                <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-full" />
                <div>
                  <div className="font-semibold text-white">{currentUser.name}</div>
                  <div className="text-xs text-indigo-300">{currentUser.email}</div>
                </div>
              </Link>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-rose-300 hover:bg-indigo-800 rounded-md font-medium"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-center mt-3 bg-[#0D9488] text-white px-4 py-2 rounded-lg font-semibold"
            >
              Login
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
