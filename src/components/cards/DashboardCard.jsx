import React from 'react';

const DashboardCard = ({ title, value, subtitle, icon: Icon, color = 'teal', trend }) => {
  const getColorStyles = () => {
    switch (color) {
      case 'indigo':
        return {
          bg: 'bg-indigo-50',
          text: 'text-[#4338CA]',
          border: 'border-indigo-100',
          iconBg: 'bg-[#4338CA] text-white'
        };
      case 'teal':
        return {
          bg: 'bg-teal-50',
          text: 'text-[#0D9488]',
          border: 'border-teal-100',
          iconBg: 'bg-[#0D9488] text-white'
        };
      case 'amber':
        return {
          bg: 'bg-amber-50',
          text: 'text-amber-700',
          border: 'border-amber-100',
          iconBg: 'bg-amber-600 text-white'
        };
      case 'rose':
        return {
          bg: 'bg-rose-50',
          text: 'text-rose-700',
          border: 'border-rose-100',
          iconBg: 'bg-rose-600 text-white'
        };
      default:
        return {
          bg: 'bg-slate-50',
          text: 'text-slate-700',
          border: 'border-slate-200',
          iconBg: 'bg-slate-700 text-white'
        };
    }
  };

  const styles = getColorStyles();

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
      <div className="space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
        <div className="text-2xl font-black text-[#4338CA] tracking-tight">{value}</div>
        {subtitle && <p className="text-[11px] font-medium text-slate-500">{subtitle}</p>}
      </div>

      {Icon && (
        <div className={`p-3.5 rounded-xl ${styles.iconBg} shadow-xs`}>
          <Icon className="w-6 h-6" />
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
