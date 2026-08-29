import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import EmptyState from '../../components/common/EmptyState';
import { Bell, CheckCheck, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const UserNotificationsPage = () => {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [filter, setFilter] = useState('All');

  const userNotifs = notifications.filter(
    n => n.recipientType === 'User' && (n.recipientId === currentUser?.id || !n.recipientId)
  );

  const filteredNotifs = userNotifs.filter(n => {
    if (filter === 'Unread') return !n.isRead;
    return true;
  });

  const getNotifIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-[#0D9488]" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default:
        return <Info className="w-5 h-5 text-[#4338CA]" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">Alert Center</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4338CA] tracking-tight">Notifications</h1>
          <p className="text-xs text-slate-500 mt-1">
            System updates regarding your hall reservation submissions, approvals, and reminders.
          </p>
        </div>

        <button
          onClick={() => markAllNotificationsRead('User')}
          className="bg-indigo-50 text-[#4338CA] hover:bg-indigo-100 px-3.5 py-2 rounded-xl text-xs font-bold transition border border-indigo-200 flex items-center gap-1.5 w-fit"
        >
          <CheckCheck className="w-4 h-4 text-[#0D9488]" />
          Mark All as Read
        </button>
      </div>

      {/* Filter Options */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilter('All')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            filter === 'All' ? 'bg-[#4338CA] text-white' : 'bg-white border border-slate-200 text-slate-600'
          }`}
        >
          All ({userNotifs.length})
        </button>
        <button
          onClick={() => setFilter('Unread')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
            filter === 'Unread' ? 'bg-[#4338CA] text-white' : 'bg-white border border-slate-200 text-slate-600'
          }`}
        >
          Unread ({userNotifs.filter(n => !n.isRead).length})
        </button>
      </div>

      {/* Notifications List */}
      {filteredNotifs.length > 0 ? (
        <div className="space-y-3">
          {filteredNotifs.map((n) => (
            <div
              key={n.id}
              onClick={() => markNotificationRead(n.id)}
              className={`p-4 rounded-xl border transition flex items-start gap-3.5 cursor-pointer ${
                n.isRead
                  ? 'bg-white border-slate-200 opacity-85'
                  : 'bg-indigo-50/50 border-indigo-200 ring-1 ring-indigo-200'
              }`}
            >
              <div className="shrink-0 mt-0.5">{getNotifIcon(n.type)}</div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-xs text-[#4338CA]">{n.title}</h4>
                  <span className="text-[10px] text-slate-400 font-medium">{n.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">{n.message}</p>
                {n.reservationId && (
                  <Link
                    to={`/my-reservations/${n.reservationId}`}
                    className="text-[11px] font-bold text-[#0D9488] hover:underline inline-block mt-1"
                  >
                    View Reservation →
                  </Link>
                )}
              </div>
              {!n.isRead && (
                <span className="w-2 h-2 rounded-full bg-[#0D9488] shrink-0 mt-1.5" title="Unread"></span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Notifications"
          message="You have no notifications matching the selected filter."
        />
      )}
    </div>
  );
};

export default UserNotificationsPage;
