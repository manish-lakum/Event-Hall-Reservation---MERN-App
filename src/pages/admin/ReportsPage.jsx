import React from 'react';
import { useApp } from '../../context/AppContext';
import DashboardCard from '../../components/cards/DashboardCard';
import {
  BarChart3,
  Download,
  Printer,
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Users,
  FileSpreadsheet,
  PieChart
} from 'lucide-react';

const ReportsPage = () => {
  const { reservations, halls } = useApp();

  const total = reservations.length;
  const approved = reservations.filter(r => r.status === 'Approved').length;
  const rejected = reservations.filter(r => r.status === 'Rejected').length;
  const cancelled = reservations.filter(r => r.status === 'Cancelled').length;

  // Most frequently used hall
  const hallCounts = {};
  reservations.forEach(r => {
    hallCounts[r.hallName] = (hallCounts[r.hallName] || 0) + 1;
  });

  let topHallName = 'Auditorium Hall';
  let topCount = 0;
  Object.entries(hallCounts).forEach(([name, count]) => {
    if (count > topCount) {
      topCount = count;
      topHallName = name;
    }
  });

  // User type breakdown
  const userTypeCounts = {
    Faculty: reservations.filter(r => r.userType === 'Faculty').length,
    Student: reservations.filter(r => r.userType === 'Student').length,
    Department: reservations.filter(r => r.userType === 'Department').length,
    'Club/Committee': reservations.filter(r => r.userType.includes('Club')).length
  };

  const handleExportCSV = () => {
    alert('Generating & Exporting Campus Reservation Report in CSV format...');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 print:p-6 print:bg-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 print:hidden">
        <div>
          <span className="text-xs font-bold text-[#0D9488] uppercase tracking-wider">Campus Governance</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#4338CA] tracking-tight">Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive audit metrics, hall utilization statistics, and reservation export tools.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-[#0D9488] text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export Report (CSV)
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-white text-[#4338CA] border border-indigo-200 hover:bg-indigo-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-[#0D9488]" /> Print Report
          </button>
        </div>
      </div>

      {/* Printable Header */}
      <div className="hidden print:block border-b border-slate-300 pb-4 mb-6">
        <h1 className="text-xl font-bold text-slate-900">Apex Institute of Technology & Management</h1>
        <h2 className="text-sm font-semibold text-slate-700">Official Hall Utilization & Audit Report</h2>
        <p className="text-xs text-slate-500">Generated on: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Top Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardCard title="Total Submissions" value={total} subtitle="All reservation requests" icon={FileSpreadsheet} color="indigo" />
        <DashboardCard title="Approved Bookings" value={approved} subtitle={`${Math.round((approved / (total || 1)) * 100)}% approval rate`} icon={CheckCircle2} color="teal" />
        <DashboardCard title="Rejected Requests" value={rejected} subtitle="Declined with remarks" icon={XCircle} color="rose" />
        <DashboardCard title="Most Popular Venue" value={topHallName} subtitle={`${topCount} total bookings`} icon={Building2} color="indigo" />
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Hall Utilization Rates Bar Breakdown */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-[#4338CA] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#0D9488]" />
              Hall Utilization Distribution
            </h2>
            <span className="text-xs text-slate-500 font-semibold">Total Halls: {halls.length}</span>
          </div>

          <div className="space-y-4 pt-2 text-xs">
            {halls.map((h) => {
              const count = reservations.filter(r => r.hallId === h.id).length;
              const percent = Math.min(100, Math.round((count / (total || 1)) * 100));
              return (
                <div key={h.id} className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{h.name} ({h.type})</span>
                    <span className="text-[#4338CA] font-bold">{count} Bookings ({percent}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className="bg-[#4338CA] h-full rounded-full transition-all duration-500"
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* User Type Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-[#4338CA] flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0D9488]" />
              Bookings by User Role
            </h2>
            <PieChart className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3 pt-2 text-xs">
            {Object.entries(userTypeCounts).map(([role, count]) => (
              <div key={role} className="p-3 bg-[#F8FAFC] rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-[#4338CA]">{role} Member</div>
                  <div className="text-[10px] text-slate-500">Authorized Campus Category</div>
                </div>
                <div className="text-right font-black text-base text-[#0D9488]">{count}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
