import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

// Auth Pages
import LandingPage from './pages/auth/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import OtpVerificationPage from './pages/auth/OtpVerificationPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// User Pages
import UserDashboardPage from './pages/user/UserDashboardPage';
import BrowseHallsPage from './pages/user/BrowseHallsPage';
import HallDetailsPage from './pages/user/HallDetailsPage';
import CheckAvailabilityPage from './pages/user/CheckAvailabilityPage';
import ReserveHallPage from './pages/user/ReserveHallPage';
import MyReservationsPage from './pages/user/MyReservationsPage';
import ReservationDetailsPage from './pages/user/ReservationDetailsPage';
import UserCalendarPage from './pages/user/UserCalendarPage';
import UserNotificationsPage from './pages/user/UserNotificationsPage';
import UserProfilePage from './pages/user/UserProfilePage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import HallManagementPage from './pages/admin/HallManagementPage';
import AddEditHallPage from './pages/admin/AddEditHallPage';
import AdminReservationsPage from './pages/admin/AdminReservationsPage';
import AdminReservationDetailsPage from './pages/admin/AdminReservationDetailsPage';
import AdminCalendarPage from './pages/admin/AdminCalendarPage';
import BlockHallPage from './pages/admin/BlockHallPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ReportsPage from './pages/admin/ReportsPage';
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public / Authentication Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/verify-otp" element={<OtpVerificationPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
          </Route>

          {/* User Portal Routes */}
          <Route element={<UserLayout />}>
            <Route path="/dashboard" element={<UserDashboardPage />} />
            <Route path="/halls" element={<BrowseHallsPage />} />
            <Route path="/halls/:id" element={<HallDetailsPage />} />
            <Route path="/availability" element={<CheckAvailabilityPage />} />
            <Route path="/reserve" element={<ReserveHallPage />} />
            <Route path="/my-reservations" element={<MyReservationsPage />} />
            <Route path="/my-reservations/:id" element={<ReservationDetailsPage />} />
            <Route path="/calendar" element={<UserCalendarPage />} />
            <Route path="/notifications" element={<UserNotificationsPage />} />
            <Route path="/profile" element={<UserProfilePage />} />
          </Route>

          {/* Admin Portal Routes */}
          <Route element={<AdminLayout title="Admin Control Panel" />}>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/halls" element={<HallManagementPage />} />
            <Route path="/admin/halls/add" element={<AddEditHallPage />} />
            <Route path="/admin/halls/edit/:id" element={<AddEditHallPage />} />
            <Route path="/admin/reservations" element={<AdminReservationsPage />} />
            <Route path="/admin/reservations/:id" element={<AdminReservationDetailsPage />} />
            <Route path="/admin/calendar" element={<AdminCalendarPage />} />
            <Route path="/admin/block-hall" element={<BlockHallPage />} />
            <Route path="/admin/users" element={<UserManagementPage />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/notifications" element={<AdminNotificationsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
