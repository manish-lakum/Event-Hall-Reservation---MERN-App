import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import { useApp } from '../context/AppContext';

const PROTECTED_USER_ROUTES = [
  '/dashboard',
  '/reserve',
  '/my-reservations',
  '/calendar',
  '/notifications',
  '/profile'
];

const UserLayout = () => {
  const { token, currentUser, loading } = useApp();
  const location = useLocation();

  const isProtectedRoute = PROTECTED_USER_ROUTES.some(route =>
    location.pathname === route || location.pathname.startsWith('/my-reservations/')
  );

  if (!loading && isProtectedRoute && (!token || !currentUser)) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;
