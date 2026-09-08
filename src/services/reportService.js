import { api } from './api';

export const reportService = {
  getSummaryReport: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(query ? `/admin/reports/summary?${query}` : '/admin/reports/summary');
  },

  getReservationReport: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(query ? `/admin/reports/reservations?${query}` : '/admin/reports/reservations');
  },

  getReservationList: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(query ? `/admin/reports/reservations/list?${query}` : '/admin/reports/reservations/list');
  },

  getHallReport: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(query ? `/admin/reports/halls?${query}` : '/admin/reports/halls');
  },

  getEventReport: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(query ? `/admin/reports/events?${query}` : '/admin/reports/events');
  },

  getUserReport: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(query ? `/admin/reports/users?${query}` : '/admin/reports/users');
  },

  getMonthlyReport: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(query ? `/admin/reports/monthly?${query}` : '/admin/reports/monthly');
  },

  getReportDashboard: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(query ? `/admin/reports/dashboard?${query}` : '/admin/reports/dashboard');
  },

  getReportsAnalytics: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return await api.get(query ? `/admin/reports/dashboard?${query}` : '/admin/reports/dashboard');
  },

  exportCSV: async (params = {}) => {
    const res = await reportService.getReservationList({ ...params, limit: 1000 });
    if (res.success && Array.isArray(res.data)) {
      const headers = ['Reservation ID', 'Event Title', 'Event Type', 'Date', 'Time Slot', 'Status', 'Requester Name', 'User Category', 'Department', 'Hall Venue'];
      const rows = res.data.map(r => [
        `"${r.reservationId || ''}"`,
        `"${r.eventTitle || ''}"`,
        `"${r.eventType || ''}"`,
        `"${r.eventDate || ''}"`,
        `"${r.startTime || ''} - ${r.endTime || ''}"`,
        `"${r.status || ''}"`,
        `"${r.userName || ''}"`,
        `"${r.userType || ''}"`,
        `"${r.department || ''}"`,
        `"${r.hallName || ''}"`
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `campus_reservation_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { success: true };
    }
    return res;
  }
};
