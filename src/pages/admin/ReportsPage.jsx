import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { reportService } from '../../services/reportService';
import DashboardCard from '../../components/cards/DashboardCard';
import {
  Download,
  Printer,
  Building2,
  CheckCircle2,
  XCircle,
  Users,
  FileSpreadsheet,
  PieChart,
  RotateCcw
} from 'lucide-react';

const ReportsPage = () => {
  const { halls } = useApp();

  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'All',
    hallId: 'All',
    startDate: '',
    endDate: ''
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.status !== 'All') params.status = filters.status;
      if (filters.hallId !== 'All') params.hallId = filters.hallId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const res = await reportService.getReportsAnalytics(params);
      if (res.success && res.data) {
        setReportData(res.data);
      }
    } catch (err) {
      console.error('Failed to load reports analytics:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const summary = reportData?.summary || {};
  const total = summary.totalReservations ?? 0;
  const approved = summary.approvedReservations ?? 0;
  const rejected = summary.rejectedReservations ?? 0;
  const approvalRate = summary.approvalRate ?? (total > 0 ? Math.round((approved / total) * 100) : 0);

  const topHallObj = reportData?.topHalls?.[0];
  const topHallName = topHallObj?.hallName || 'N/A';
  const topCount = topHallObj?.totalReservations ?? topHallObj?.approvedReservations ?? 0;

  const rawTopHalls = Array.isArray(reportData?.topHalls) ? reportData.topHalls : [];
  const hallUtilization = rawTopHalls.length > 0
    ? rawTopHalls.map(h => ({
        id: h.hallId || h._id,
        name: h.hallName,
        type: h.hallType,
        count: h.totalReservations ?? h.approvedReservations ?? 0
      }))
    : halls.map(h => ({
        id: h.id,
        name: h.name || h.hallName,
        type: h.hallType || h.type,
        count: 0
      }));

  const userTypeMap = {};
  (reportData?.userTypes || []).forEach(ut => {
    let label = 'Student';
    if (ut.userType === 'FACULTY') label = 'Faculty';
    else if (ut.userType === 'STUDENT') label = 'Student';
    else if (ut.userType === 'DEPARTMENT') label = 'Department';
    else if (ut.userType === 'CLUB') label = 'Club/Committee';
    else if (ut.userType === 'STAFF') label = 'Staff';
    userTypeMap[label] = (userTypeMap[label] || 0) + (ut.reservationCount || ut.approvedCount || 0);
  });

  const userTypeBreakdown = {
    Faculty: userTypeMap['Faculty'] || 0,
    Student: userTypeMap['Student'] || 0,
    Department: userTypeMap['Department'] || 0,
    'Club/Committee': userTypeMap['Club/Committee'] || 0
  };

  const handleExportCSV = async () => {
    try {
      const params = {};
      if (filters.status !== 'All') params.status = filters.status;
      if (filters.hallId !== 'All') params.hallId = filters.hallId;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      await reportService.exportCSV(params);
    } catch (err) {
      console.error('CSV Export Error:', err.message);
    }
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
            className="px-4 py-2.5 bg-[#0D9488] text-white rounded-xl text-xs font-bold hover:bg-teal-700 transition shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Export Report (CSV)
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2.5 bg-white text-[#4338CA] border border-indigo-200 hover:bg-indigo-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4 text-[#0D9488]" /> Print Report
          </button>
        </div>
      </div>

      {/* Printable Header */}
      <div className="hidden print:block border-b border-slate-300 pb-4 mb-6">
        <h1 className="text-xl font-bold text-slate-900">Sardar Vallabhbhai Global University (SVGU)</h1>
        <h2 className="text-sm font-semibold text-slate-700">Official Hall Utilization & Audit Report</h2>
        <p className="text-xs text-slate-500">Generated on: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Filter Options Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 print:hidden">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Reservation Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-semibold text-slate-700 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="APPROVED">Approved</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* Hall Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Hall Venue</label>
            <select
              value={filters.hallId}
              onChange={(e) => setFilters(prev => ({ ...prev, hallId: e.target.value }))}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-semibold text-slate-700 bg-white"
            >
              <option value="All">All Halls</option>
              {halls.map(h => (
                <option key={h.id} value={h.id}>{h.name || h.hallName}</option>
              ))}
            </select>
          </div>

          {/* Start Date Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-medium text-slate-700 bg-white"
            />
          </div>

          {/* End Date Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-medium text-slate-700 bg-white"
            />
          </div>

          {/* Reset Filters */}
          <div className="self-end">
            <button
              onClick={() => setFilters({ status: 'All', hallId: 'All', startDate: '', endDate: '' })}
              className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Top Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardCard title="Total Submissions" value={loading ? '...' : total} subtitle="All reservation requests" icon={FileSpreadsheet} color="indigo" />
        <DashboardCard title="Approved Bookings" value={loading ? '...' : approved} subtitle={`${approvalRate}% approval rate`} icon={CheckCircle2} color="teal" />
        <DashboardCard title="Rejected Requests" value={loading ? '...' : rejected} subtitle="Declined with remarks" icon={XCircle} color="rose" />
        <DashboardCard title="Most Popular Venue" value={loading ? '...' : topHallName} subtitle={`${topCount} total bookings`} icon={Building2} color="indigo" />
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
            <span className="text-xs text-slate-500 font-semibold">Total Halls: {hallUtilization.length}</span>
          </div>

          <div className="space-y-4 pt-2 text-xs">
            {hallUtilization.map((h, i) => {
              const count = h.count || 0;
              const percent = total > 0 ? Math.min(100, Math.round((count / total) * 100)) : 0;
              return (
                <div key={h.id || i} className="space-y-1">
                  <div className="flex justify-between font-semibold text-slate-800">
                    <span>{h.name || h.hallName} ({h.type || h.hallType})</span>
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
            {Object.entries(userTypeBreakdown).map(([role, count]) => (
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
