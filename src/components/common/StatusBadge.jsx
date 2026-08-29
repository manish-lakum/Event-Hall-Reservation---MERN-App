import React from 'react';

const StatusBadge = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'active':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rejected':
      case 'inactive':
      case 'disabled':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'cancelled':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'completed':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getBadgeStyle()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-75"></span>
      {status}
    </span>
  );
};

export default StatusBadge;
