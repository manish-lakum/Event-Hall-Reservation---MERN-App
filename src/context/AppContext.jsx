import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  initialHalls,
  initialReservations,
  initialBlockedSlots,
  initialUsers,
  initialNotifications,
  initialSettings
} from '../data/mockData';
import { checkSlotOverlap, checkBlockedOverlap } from '../services/apiServices';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('aitm_user');
    return saved ? JSON.parse(saved) : initialUsers[1]; // Default to Student Rahul Verma
  });

  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('aitm_role') || 'User';
  });

  const [halls, setHalls] = useState(() => {
    const saved = localStorage.getItem('aitm_halls');
    return saved ? JSON.parse(saved) : initialHalls;
  });

  const [reservations, setReservations] = useState(() => {
    const saved = localStorage.getItem('aitm_reservations');
    return saved ? JSON.parse(saved) : initialReservations;
  });

  const [blockedSlots, setBlockedSlots] = useState(() => {
    const saved = localStorage.getItem('aitm_blocked');
    return saved ? JSON.parse(saved) : initialBlockedSlots;
  });

  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('aitm_users');
    return saved ? JSON.parse(saved) : initialUsers;
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('aitm_notifications');
    return saved ? JSON.parse(saved) : initialNotifications;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('aitm_settings');
    return saved ? JSON.parse(saved) : initialSettings;
  });

  // Sync state to LocalStorage for persistence across tab reloads
  useEffect(() => {
    localStorage.setItem('aitm_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('aitm_role', currentRole);
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem('aitm_halls', JSON.stringify(halls));
  }, [halls]);

  useEffect(() => {
    localStorage.setItem('aitm_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('aitm_blocked', JSON.stringify(blockedSlots));
  }, [blockedSlots]);

  useEffect(() => {
    localStorage.setItem('aitm_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('aitm_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('aitm_settings', JSON.stringify(settings));
  }, [settings]);

  // Auth Operations
  const login = (email, password) => {
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setCurrentUser(foundUser);
      const role = foundUser.userType === 'Admin' ? 'Admin' : 'User';
      setCurrentRole(role);
      return { success: true, role, user: foundUser };
    }
    // Mock login fallback if user email is new
    const isMockAdmin = email.includes('admin');
    const role = isMockAdmin ? 'Admin' : 'User';
    const mockUser = {
      id: isMockAdmin ? 'admin-1' : 'user-2',
      name: email.split('@')[0].replace('.', ' '),
      email,
      userType: role === 'Admin' ? 'Admin' : 'Faculty',
      department: 'Computer Science',
      employeeId: role === 'Admin' ? 'ADMIN-01' : 'EMP-CS-100',
      phone: '+91 98000 00000',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80'
    };
    setCurrentUser(mockUser);
    setCurrentRole(role);
    return { success: true, role, user: mockUser };
  };

  const logout = () => {
    setCurrentUser(null);
    setCurrentRole('User');
    localStorage.removeItem('aitm_user');
  };

  const switchRole = (role) => {
    setCurrentRole(role);
    if (role === 'Admin') {
      const adminUser = users.find(u => u.userType === 'Admin') || initialUsers[5];
      setCurrentUser(adminUser);
    } else {
      const regularUser = users.find(u => u.userType !== 'Admin') || initialUsers[1];
      setCurrentUser(regularUser);
    }
  };

  // Availability Checker
  const checkAvailability = (hallId, date, startTime, endTime) => {
    const hall = halls.find(h => h.id === hallId);
    if (!hall) return { available: false, message: 'Hall not found.' };
    if (hall.status !== 'Active') return { available: false, message: 'Hall is currently disabled by Admin.' };

    // Check operating hours
    if (startTime < hall.openingTime || endTime > hall.closingTime) {
      return {
        available: false,
        message: `Requested slot outside hall operating hours (${hall.openingTime} - ${hall.closingTime}).`
      };
    }

    // Check maintenance / blocked slots
    const isBlocked = checkBlockedOverlap(blockedSlots, hallId, date, startTime, endTime);
    if (isBlocked) {
      const blockReason = blockedSlots.find(b => b.hallId === hallId && b.startDate <= date && b.endDate >= date);
      return {
        available: false,
        message: `Hall is unavailable due to maintenance/blocked status: ${blockReason?.reason || 'Administrative Block'}.`
      };
    }

    // Check existing reservations
    const hallReservations = reservations.filter(r => r.hallId === hallId);
    const hasOverlap = checkSlotOverlap(hallReservations, date, startTime, endTime);

    if (hasOverlap) {
      return {
        available: false,
        message: 'This hall already has an approved or pending reservation during the selected time slot.'
      };
    }

    return { available: true, message: 'Hall is available for reservation!' };
  };

  // Reservation Actions
  const addReservation = (formData) => {
    const availability = checkAvailability(formData.hallId, formData.date, formData.startTime, formData.endTime);
    if (!availability.available) {
      return { success: false, message: availability.message };
    }

    const hall = halls.find(h => h.id === formData.hallId);
    if (Number(formData.expectedParticipants) > hall.capacity) {
      return {
        success: false,
        message: `Expected participants (${formData.expectedParticipants}) exceeds hall capacity (${hall.capacity}).`
      };
    }

    const newRes = {
      id: `RES-2026-${String(reservations.length + 1).padStart(3, '0')}`,
      userId: currentUser?.id || 'user-guest',
      userName: formData.userName || currentUser?.name || 'Authorized Member',
      userEmail: formData.userEmail || currentUser?.email || 'user@college.edu',
      userType: formData.userType || currentUser?.userType || 'Student',
      department: formData.department || currentUser?.department || 'General',
      employeeId: formData.employeeId || currentUser?.employeeId || 'ID-000',
      hallId: formData.hallId,
      hallName: hall.name,
      eventTitle: formData.eventTitle,
      eventType: formData.eventType,
      eventDescription: formData.eventDescription,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      expectedParticipants: Number(formData.expectedParticipants),
      requestedFacilities: formData.requestedFacilities || [],
      additionalNotes: formData.additionalNotes || '',
      status: 'Pending',
      requestedOn: new Date().toISOString().replace('T', ' ').substring(0, 16),
      adminRemarks: ''
    };

    setReservations(prev => [newRes, ...prev]);

    // Push notification to Admin
    const adminNotif = {
      id: `notif-${Date.now()}`,
      recipientId: 'admin-1',
      recipientType: 'Admin',
      title: 'New Reservation Request',
      message: `${newRes.userName} requested ${newRes.hallName} for "${newRes.eventTitle}" on ${newRes.date}.`,
      type: 'info',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      isRead: false,
      reservationId: newRes.id
    };
    setNotifications(prev => [adminNotif, ...prev]);

    return { success: true, reservation: newRes };
  };

  const cancelReservation = (reservationId) => {
    setReservations(prev =>
      prev.map(r => (r.id === reservationId ? { ...r, status: 'Cancelled' } : r))
    );
    const targetRes = reservations.find(r => r.id === reservationId);
    if (targetRes) {
      const adminNotif = {
        id: `notif-${Date.now()}`,
        recipientId: 'admin-1',
        recipientType: 'Admin',
        title: 'Reservation Cancelled',
        message: `Reservation ${reservationId} for ${targetRes.hallName} was cancelled by the user.`,
        type: 'warning',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        isRead: false,
        reservationId
      };
      setNotifications(prev => [adminNotif, ...prev]);
    }
  };

  const approveReservation = (reservationId, adminRemarks = 'Approved by Admin.') => {
    let approvedRes = null;
    setReservations(prev =>
      prev.map(r => {
        if (r.id === reservationId) {
          approvedRes = { ...r, status: 'Approved', adminRemarks };
          return approvedRes;
        }
        return r;
      })
    );

    if (approvedRes) {
      const userNotif = {
        id: `notif-${Date.now()}`,
        recipientId: approvedRes.userId,
        recipientType: 'User',
        title: 'Reservation Approved!',
        message: `Your request for ${approvedRes.hallName} on ${approvedRes.date} (${approvedRes.startTime}-${approvedRes.endTime}) has been approved.`,
        type: 'success',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        isRead: false,
        reservationId
      };
      setNotifications(prev => [userNotif, ...prev]);
    }
  };

  const rejectReservation = (reservationId, reason) => {
    let rejectedRes = null;
    setReservations(prev =>
      prev.map(r => {
        if (r.id === reservationId) {
          rejectedRes = { ...r, status: 'Rejected', adminRemarks: reason };
          return rejectedRes;
        }
        return r;
      })
    );

    if (rejectedRes) {
      const userNotif = {
        id: `notif-${Date.now()}`,
        recipientId: rejectedRes.userId,
        recipientType: 'User',
        title: 'Reservation Request Declined',
        message: `Your request for ${rejectedRes.hallName} on ${rejectedRes.date} was rejected: ${reason}`,
        type: 'error',
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        isRead: false,
        reservationId
      };
      setNotifications(prev => [userNotif, ...prev]);
    }
  };

  // Hall Management
  const addHall = (hallData) => {
    const newHall = {
      id: `hall-${halls.length + 1}`,
      ...hallData,
      status: 'Active',
      capacity: Number(hallData.capacity)
    };
    setHalls(prev => [...prev, newHall]);
    return newHall;
  };

  const updateHall = (hallId, updatedData) => {
    setHalls(prev =>
      prev.map(h => (h.id === hallId ? { ...h, ...updatedData, capacity: Number(updatedData.capacity || h.capacity) } : h))
    );
  };

  const deleteHall = (hallId) => {
    setHalls(prev => prev.filter(h => h.id !== hallId));
  };

  const toggleHallStatus = (hallId) => {
    setHalls(prev =>
      prev.map(h => (h.id === hallId ? { ...h, status: h.status === 'Active' ? 'Disabled' : 'Active' } : h))
    );
  };

  // Block Hall
  const addBlockedSlot = (blockData) => {
    const hall = halls.find(h => h.id === blockData.hallId);
    const newBlock = {
      id: `BLK-${String(blockedSlots.length + 1).padStart(3, '0')}`,
      ...blockData,
      hallName: hall ? hall.name : 'College Hall'
    };
    setBlockedSlots(prev => [...prev, newBlock]);
  };

  const deleteBlockedSlot = (blockId) => {
    setBlockedSlots(prev => prev.filter(b => b.id !== blockId));
  };

  // User Management
  const toggleUserStatus = (userId) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u))
    );
  };

  // Notifications
  const markNotificationRead = (notifId) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsRead = (recipientType = 'User') => {
    setNotifications(prev =>
      prev.map(n => (n.recipientType === recipientType ? { ...n, isRead: true } : n))
    );
  };

  const updateUserProfile = (updatedProfile) => {
    setCurrentUser(prev => ({ ...prev, ...updatedProfile }));
    setUsers(prev =>
      prev.map(u => (u.id === currentUser.id ? { ...u, ...updatedProfile } : u))
    );
  };

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        currentRole,
        halls,
        reservations,
        blockedSlots,
        users,
        notifications,
        settings,
        login,
        logout,
        switchRole,
        checkAvailability,
        addReservation,
        cancelReservation,
        approveReservation,
        rejectReservation,
        addHall,
        updateHall,
        deleteHall,
        toggleHallStatus,
        addBlockedSlot,
        deleteBlockedSlot,
        toggleUserStatus,
        markNotificationRead,
        markAllNotificationsRead,
        updateUserProfile,
        updateSettings
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
