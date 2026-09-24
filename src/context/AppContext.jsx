import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { hallService } from '../services/hallService';
import { reservationService } from '../services/reservationService';
import { blockService } from '../services/blockService';
import { notificationService } from '../services/notificationService';
import { adminUserService } from '../services/adminUserService';
import { profileService } from '../services/profileService';
import { formatDateTimeIST } from '../utils/dateTime';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('aitm_token') || null);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('aitm_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('aitm_role') || 'User';
  });

  const [halls, setHalls] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [users, setUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [settings, setSettings] = useState({
    siteName: 'SVGU Campus Hall Portal',
    collegeName: 'Sardar Vallabhbhai Global University (SVGU)',
    shortName: 'SVGU',
    contactEmail: 'admin@svgu.edu.in',
    contactPhone: '+91 79 2328 7000',
    allowWeekendBookings: true,
    maxAdvanceBookingDays: 30,
    autoApprovalEnabled: false,
    reservationRules: {
      minBookingDurationHours: 1,
      maxBookingDurationHours: 8,
      advanceBookingLimitDays: 30,
      allowWeekendBooking: true,
      autoApproveFaculty: false
    }
  });

  // Mapper utilities to ensure frontend component field compatibility
  const mapHall = useCallback((h) => ({
    ...h,
    id: h._id || h.id,
    name: h.hallName || h.name,
    status: h.isActive ? 'Active' : 'Inactive'
  }), []);

  const mapReservation = useCallback((r) => ({
    ...r,
    id: r._id || r.id,
    date: r.eventDate || r.date,
    hallId: r.hall?._id || r.hall || r.hallId,
    hallName: r.hall?.hallName || r.hallName || 'Hall',
    userName: r.user?.name || r.userName || 'User',
    userEmail: r.user?.email || r.userEmail || '',
    userType: r.user?.userType || r.userType || 'FACULTY',
    department: r.user?.department || r.department || '',
    createdAt: r.createdAt,
    approvedAt: r.approvedAt,
    rejectedAt: r.rejectedAt,
    cancelledAt: r.cancelledAt,
    requestedOn: formatDateTimeIST(r.createdAt || r.requestedOn),
    approvedOn: formatDateTimeIST(r.approvedAt),
    rejectedOn: formatDateTimeIST(r.rejectedAt),
    cancelledOn: formatDateTimeIST(r.cancelledAt),
    status: (r.status || 'PENDING').charAt(0).toUpperCase() + (r.status || 'PENDING').slice(1).toLowerCase()
  }), []);

  const mapBlock = useCallback((b) => ({
    ...b,
    id: b._id || b.id,
    hallId: b.hall?._id || b.hall || b.hallId,
    hallName: b.hall?.hallName || b.hallName || 'Hall',
    status: b.isActive ? 'Active' : 'Disabled'
  }), []);

  const mapUser = useCallback((u) => {
    if (!u) return null;
    const userData = u.user || u;
    const userPhoto = userData.profilePhoto || userData.avatar || '';
    return {
      ...userData,
      id: userData._id || userData.id,
      name: userData.name || '',
      email: userData.email || '',
      department: userData.department || '',
      phone: userData.phone || '',
      collegeId: userData.collegeId || '',
      userType: userData.userType || 'FACULTY',
      role: userData.role || 'USER',
      avatar: userPhoto,
      profilePhoto: userPhoto,
      status: userData.isActive !== false ? 'Active' : 'Inactive',
      createdAtFormatted: formatDateTimeIST(userData.createdAt)
    };
  }, []);

  const mapNotification = useCallback((n) => ({
    ...n,
    id: n._id || n.id,
    title: n.title,
    message: n.message,
    timestamp: formatDateTimeIST(n.createdAt || n.timestamp),
    isRead: n.isRead,
    type: (n.type || 'info').toLowerCase()
  }), []);

  // Fetch initial data
  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);

      // Verify token & restore session
      if (token) {
        try {
          const userRes = await authService.getMe();
          const userData = userRes.data?.user || userRes.data;
          if (userRes.success && userData) {
            const mappedUser = mapUser(userData);
            setCurrentUser(mappedUser);
            localStorage.setItem('aitm_user', JSON.stringify(mappedUser));
            const role = mappedUser.role === 'ADMIN' ? 'Admin' : 'User';
            setCurrentRole(role);
            localStorage.setItem('aitm_role', role);
          } else {
            authService.logout();
            setToken(null);
            setCurrentUser(null);
            setCurrentRole('User');
          }
        } catch {
          authService.logout();
          setToken(null);
          setCurrentUser(null);
          setCurrentRole('User');
        }
      } else {
        setCurrentUser(null);
        setCurrentRole('User');
      }

      // Fetch public halls
      try {
        const hallRes = await hallService.getHalls();
        if (hallRes.success && Array.isArray(hallRes.data)) {
          setHalls(hallRes.data.map(mapHall));
        }
      } catch (err) {
        console.error('Failed to load halls:', err.message);
      }

      // Fetch unread notifications count if logged in
      if (token) {
        try {
          const notifRes = await notificationService.getNotifications();
          if (notifRes.success && Array.isArray(notifRes.data)) {
            setNotifications(notifRes.data.map(mapNotification));
          }
          const unreadRes = await notificationService.getUnreadCount();
          if (unreadRes.success && typeof unreadRes.data?.unreadCount === 'number') {
            setUnreadCount(unreadRes.data.unreadCount);
          }
        } catch (err) {
          console.error('Failed to load notifications:', err.message);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Auth operations
  const login = async (email, password) => {
    try {
      // Purge any stale session state before setting new session
      authService.logout();
      setToken(null);
      setCurrentUser(null);
      setReservations([]);
      setNotifications([]);
      setUnreadCount(0);

      const res = await authService.login(email, password);
      if (res.success && res.data) {
        const tokenVal = res.data.token;
        const mappedUser = mapUser(res.data.user);
        const role = mappedUser.role === 'ADMIN' ? 'Admin' : 'User';

        setToken(tokenVal);
        setCurrentUser(mappedUser);
        setCurrentRole(role);

        localStorage.setItem('aitm_token', tokenVal);
        localStorage.setItem('aitm_user', JSON.stringify(mappedUser));
        localStorage.setItem('aitm_role', role);

        return { success: true, role, user: mappedUser };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (err) {
      return { success: false, message: err.message || 'Invalid credentials or server unavailable' };
    }
  };

  const logout = () => {
    authService.logout();
    setToken(null);
    setCurrentUser(null);
    setCurrentRole('User');
    setReservations([]);
    setNotifications([]);
    setUnreadCount(0);
  };

  const switchRole = (role) => {
    if (currentUser?.role === 'ADMIN') {
      setCurrentRole(role);
      localStorage.setItem('aitm_role', role);
    } else {
      setCurrentRole('User');
      localStorage.setItem('aitm_role', 'User');
    }
  };

  // Availability Checker using live Backend API
  const checkAvailability = async (hallId, date, startTime, endTime) => {
    try {
      const res = await hallService.checkAvailability(hallId, date, startTime, endTime);
      if (res.success && res.data) {
        const isAvail = Boolean(res.data.isAvailable ?? res.data.available);
        return {
          available: isAvail,
          reason: res.data.reason || '',
          message: isAvail
            ? 'Hall is available for reservation!'
            : (res.data.message || res.data.reason || 'Requested time slot is unavailable.')
        };
      }
      return { available: false, message: res?.message || 'Could not verify availability.' };
    } catch (err) {
      return { available: false, message: err.message || 'Availability check failed.' };
    }
  };

  // Reservation Actions
  const addReservation = async (formData) => {
    try {
      const payload = {
        hallId: formData.hallId,
        eventTitle: formData.eventTitle,
        eventType: (formData.eventType || 'SEMINAR').toUpperCase(),
        eventDescription: formData.eventDescription || '',
        eventDate: formData.date || formData.eventDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        expectedParticipants: Number(formData.expectedParticipants),
        requestedFacilities: formData.requestedFacilities || [],
        additionalNotes: formData.additionalNotes || ''
      };

      const res = await reservationService.createReservation(payload);
      if (res.success && res.data) {
        const newRes = mapReservation(res.data);
        setReservations(prev => [newRes, ...prev]);

        // Refresh notification unread count
        try {
          const unreadRes = await notificationService.getUnreadCount();
          if (unreadRes.success) setUnreadCount(unreadRes.data.unreadCount);
        } catch (e) {
          console.error(e);
        }

        return { success: true, reservation: newRes, message: 'Reservation request submitted successfully.' };
      }
      return { success: false, message: res.message || 'Failed to submit reservation.' };
    } catch (err) {
      return { success: false, message: err.message || 'Failed to create reservation.' };
    }
  };

  const cancelReservation = async (reservationId, reason = '') => {
    try {
      const res = await reservationService.cancelReservation(reservationId, reason);
      if (res.success) {
        setReservations(prev =>
          prev.map(r => (r.id === reservationId ? { ...r, status: 'Cancelled' } : r))
        );
        return { success: true, message: 'Reservation cancelled successfully.' };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const approveReservation = async (reservationId, remarks = 'Approved by Admin.') => {
    try {
      const res = await reservationService.approveReservation(reservationId, remarks);
      if (res.success && res.data) {
        const updated = mapReservation(res.data);
        setReservations(prev => prev.map(r => (r.id === reservationId ? updated : r)));
        return { success: true, reservation: updated };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const rejectReservation = async (reservationId, reason) => {
    try {
      const res = await reservationService.rejectReservation(reservationId, reason);
      if (res.success && res.data) {
        const updated = mapReservation(res.data);
        setReservations(prev => prev.map(r => (r.id === reservationId ? updated : r)));
        return { success: true, reservation: updated };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // Hall Management Actions
  const fetchHalls = useCallback(async (params = {}) => {
    try {
      const res = (params.admin || currentRole === 'Admin')
        ? await hallService.getAdminHalls(params)
        : await hallService.getHalls(params);
      if (res.success && Array.isArray(res.data)) {
        const mapped = res.data.map(mapHall);
        setHalls(mapped);
        return mapped;
      }
    } catch (err) {
      console.error('Fetch halls error:', err.message);
    }
    return [];
  }, [mapHall, currentRole]);

  const addHall = async (hallData) => {
    try {
      const payload = {
        hallName: hallData.name || hallData.hallName,
        hallType: (hallData.hallType || 'SEMINAR').toUpperCase(),
        capacity: Number(hallData.capacity),
        location: hallData.location,
        description: hallData.description,
        openingTime: hallData.openingTime,
        closingTime: hallData.closingTime,
        facilities: hallData.facilities || [],
        image: hallData.image || ''
      };
      const res = await hallService.createHall(payload);
      if (res.success && res.data) {
        const newHall = mapHall(res.data);
        setHalls(prev => [...prev, newHall]);
        return { success: true, hall: newHall };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateHall = async (hallId, updatedData) => {
    try {
      const payload = {
        hallName: updatedData.name || updatedData.hallName,
        hallType: updatedData.hallType ? updatedData.hallType.toUpperCase() : undefined,
        capacity: updatedData.capacity ? Number(updatedData.capacity) : undefined,
        location: updatedData.location,
        description: updatedData.description,
        openingTime: updatedData.openingTime,
        closingTime: updatedData.closingTime,
        facilities: updatedData.facilities,
        image: updatedData.image
      };
      const res = await hallService.updateHall(hallId, payload);
      if (res.success && res.data) {
        const updated = mapHall(res.data);
        setHalls(prev => prev.map(h => (h.id === hallId ? updated : h)));
        return { success: true, hall: updated };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteHall = async (hallId) => {
    try {
      const res = await hallService.deleteHall(hallId);
      if (res.success) {
        setHalls(prev => prev.filter(h => h.id !== hallId));
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const toggleHallStatus = async (hallId) => {
    try {
      const target = halls.find(h => h.id === hallId);
      const newStatus = target ? target.status !== 'Active' : true;
      const res = await hallService.toggleHallStatus(hallId, newStatus);
      if (res.success && res.data) {
        const updated = mapHall(res.data);
        setHalls(prev => prev.map(h => (h.id === hallId ? updated : h)));
        return { success: true, hall: updated };
      }
    } catch (err) {
      console.error('Toggle hall status error:', err.message);
    }
  };

  // Block Hall Actions
  const fetchBlockedSlots = async (params = {}) => {
    try {
      const res = await blockService.getHallBlocks(params);
      if (res.success && Array.isArray(res.data)) {
        const mapped = res.data.map(mapBlock);
        setBlockedSlots(mapped);
        return mapped;
      }
    } catch (err) {
      console.error('Fetch blocked slots error:', err.message);
    }
    return [];
  };

  const addBlockedSlot = async (blockData) => {
    try {
      const payload = {
        hall: blockData.hallId,
        startDate: blockData.startDate,
        endDate: blockData.endDate,
        startTime: blockData.startTime || '08:00',
        endTime: blockData.endTime || '18:00',
        reason: (blockData.reason || 'MAINTENANCE').toUpperCase(),
        notes: blockData.notes || blockData.reasonDetails || ''
      };

      const res = await blockService.createHallBlock(payload);
      if (res.success && res.data) {
        const newBlock = mapBlock(res.data);
        setBlockedSlots(prev => [newBlock, ...prev]);
        return { success: true, block: newBlock };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const deleteBlockedSlot = async (blockId) => {
    try {
      const res = await blockService.deleteHallBlock(blockId);
      if (res.success) {
        setBlockedSlots(prev => prev.filter(b => b.id !== blockId));
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  // User Management Actions
  const fetchUsers = async (params = {}) => {
    try {
      const res = await adminUserService.getAllUsers({ limit: 1000, ...params });
      if (res.success && Array.isArray(res.data)) {
        const mapped = res.data.map(mapUser);
        setUsers(mapped);
        return mapped;
      }
    } catch (err) {
      console.error('Fetch users error:', err.message);
    }
    return [];
  };

  const addUser = async (userData) => {
    try {
      const res = await adminUserService.createUser(userData);
      if (res.success && res.data) {
        const newUser = mapUser(res.data);
        setUsers(prev => [newUser, ...prev]);
        return { success: true, user: newUser, message: 'User account created successfully.' };
      }
      return { success: false, message: res.message || 'Failed to create user' };
    } catch (err) {
      return { success: false, message: err.message || 'Error creating user account' };
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      const target = users.find(u => u.id === userId);
      const newStatus = target ? target.status !== 'Active' : true;
      const res = await adminUserService.toggleUserStatus(userId, newStatus);
      if (res.success && res.data) {
        const updated = mapUser(res.data);
        setUsers(prev => prev.map(u => (u.id === userId ? updated : u)));
        return { success: true, user: updated };
      }
    } catch (err) {
      console.error('Toggle user status error:', err.message);
    }
  };


  // Notifications Actions
  const fetchNotifications = async () => {
    try {
      const res = await notificationService.getNotifications();
      if (res.success && Array.isArray(res.data)) {
        const mapped = res.data.map(mapNotification);
        setNotifications(mapped);
      }
      const unreadRes = await notificationService.getUnreadCount();
      if (unreadRes.success) setUnreadCount(unreadRes.data.unreadCount);
    } catch (err) {
      console.error('Fetch notifications error:', err.message);
    }
  };

  const markNotificationRead = async (notifId) => {
    try {
      const res = await notificationService.markAsRead(notifId);
      if (res.success) {
        setNotifications(prev =>
          prev.map(n => (n.id === notifId ? { ...n, isRead: true } : n))
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('Mark notification read error:', err.message);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      const res = await notificationService.markAllAsRead();
      if (res.success) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('Mark all read error:', err.message);
    }
  };

  // Profile Update Actions
  const updateUserProfile = async (updatedProfile) => {
    try {
      const res = await profileService.updateProfile(updatedProfile);
      if (res.success && res.data) {
        const userData = res.data.user || res.data;
        const updated = mapUser(userData);
        setCurrentUser(updated);
        localStorage.setItem('aitm_user', JSON.stringify(updated));
        return { success: true, user: updated };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const uploadProfilePhoto = async (photoData) => {
    try {
      const res = await profileService.uploadProfilePhoto(photoData);
      if (res.success && res.data) {
        const userData = res.data.user || res.data;
        const updated = mapUser(userData);
        setCurrentUser(updated);
        localStorage.setItem('aitm_user', JSON.stringify(updated));
        return { success: true, user: updated };
      }
      return { success: false, message: res.message || 'Failed to upload profile photo' };
    } catch (err) {
      return { success: false, message: err.message || 'Error uploading profile photo' };
    }
  };

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <AppContext.Provider
      value={{
        token,
        currentUser,
        currentRole,
        halls,
        reservations,
        blockedSlots,
        users,
        notifications,
        unreadCount,
        settings,
        loading,
        login,
        logout,
        switchRole,
        checkAvailability,
        addReservation,
        cancelReservation,
        approveReservation,
        rejectReservation,
        fetchHalls,
        addHall,
        updateHall,
        deleteHall,
        toggleHallStatus,
        fetchBlockedSlots,
        addBlockedSlot,
        deleteBlockedSlot,
        fetchUsers,
        addUser,
        toggleUserStatus,
        fetchNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        updateUserProfile,
        uploadProfilePhoto,
        updateSettings,
        mapHall,
        mapReservation,
        mapBlock,
        mapUser,
        mapNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
