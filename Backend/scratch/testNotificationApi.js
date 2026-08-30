const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const { runUpcomingReservationReminderJob } = require('../services/notificationService');

const makeRequest = (options, postData) => {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', (e) => reject(e));
    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
};

async function runAllNotificationTests() {
  console.log('=============== EXECUTING PROMPT 8: NOTIFICATION API TEST CASES ===============\n');

  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/EventHall_db');

  // Login Admin & Users
  const adminLogin = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@svgu.edu.in', password: 'AdminPass@123' });
  const adminToken = adminLogin.body.data?.token;

  const user1Login = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'rahul.verma@student.svgu.edu.in', password: 'studentpassword123' });
  const user1Token = user1Login.body.data?.token;

  const user2Login = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'priya.sharma@faculty.svgu.edu.in', password: 'facultypassword123' });
  const user2Token = user2Login.body.data?.token;

  const hallsRes = await makeRequest({ hostname: 'localhost', port: 5000, path: '/api/halls', method: 'GET' });
  const hallId = hallsRes.body.data?.[1]?._id || hallsRes.body.data?.[0]?._id;

  const uniqueSuffix = Date.now().toString().slice(-4);
  const randomDays = Math.floor(Math.random() * 200) + 100;
  const d1 = new Date(); d1.setDate(d1.getDate() + randomDays);
  const d2 = new Date(); d2.setDate(d2.getDate() + randomDays + 1);
  const d3 = new Date(); d3.setDate(d3.getDate() + randomDays + 2);

  const date1 = d1.toISOString().split('T')[0];
  const date2 = d2.toISOString().split('T')[0];
  const date3 = d3.toISOString().split('T')[0];

  // 1. Test Reservation Creation Triggers
  const res1 = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/reservations', method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` }
  }, { hallId, eventTitle: `Notif Submit ${uniqueSuffix}`, eventType: 'SEMINAR', eventDescription: 'Desc', eventDate: date1, startTime: '10:00', endTime: '12:00', expectedParticipants: 30 });
  console.log('[DEBUG res1]', res1.status, res1.body.message || res1.body);
  const res1Id = res1.body.data?._id;

  const userNotifsAfterSubmit = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/notifications', method: 'GET',
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  console.log('[DEBUG userNotifs]', JSON.stringify(userNotifsAfterSubmit.body.data?.[0]));
  const submitUserNotif = userNotifsAfterSubmit.body.data?.find(n => n.type === 'RESERVATION_SUBMITTED');

  const adminNotifsAfterSubmit = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/notifications', method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` }
  });
  const newReqAdminNotif = adminNotifsAfterSubmit.body.data?.find(n => n.type === 'NEW_RESERVATION_REQUEST' && String(n.reservation?._id) === String(res1Id));

  console.log('1. Submission Triggers:',
    'User RESERVATION_SUBMITTED:', Boolean(submitUserNotif),
    'Admin NEW_RESERVATION_REQUEST:', Boolean(newReqAdminNotif)
  );

  // 2. Test Approval Trigger
  const approveRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: `/api/admin/reservations/${res1Id}/approve`, method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` }
  }, { remarks: 'Approved for test' });

  const userNotifsAfterApprove = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/notifications', method: 'GET',
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  const approveUserNotif = userNotifsAfterApprove.body.data?.find(n => n.type === 'RESERVATION_APPROVED' && String(n.reservation?._id) === String(res1Id));
  console.log('2. Approval Trigger:', 'User RESERVATION_APPROVED:', Boolean(approveUserNotif));

  // 3. Test Rejection Trigger
  const res2 = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/reservations', method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` }
  }, { hallId, eventTitle: `Notif Reject ${uniqueSuffix}`, eventType: 'WORKSHOP', eventDescription: 'Desc', eventDate: date2, startTime: '10:00', endTime: '12:00', expectedParticipants: 20 });
  const res2Id = res2.body.data?._id;

  await makeRequest({
    hostname: 'localhost', port: 5000, path: `/api/admin/reservations/${res2Id}/reject`, method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` }
  }, { reason: 'Hall under inspection' });

  const userNotifsAfterReject = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/notifications', method: 'GET',
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  const rejectUserNotif = userNotifsAfterReject.body.data?.find(n => n.type === 'RESERVATION_REJECTED' && String(n.reservation?._id) === String(res2Id));
  console.log('3. Rejection Trigger:', 'User RESERVATION_REJECTED:', Boolean(rejectUserNotif), 'Message:', rejectUserNotif?.message);

  // 4. Test Cancellation Trigger
  const res3 = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/reservations', method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` }
  }, { hallId, eventTitle: `Notif Cancel ${uniqueSuffix}`, eventType: 'MEETING', eventDescription: 'Desc', eventDate: date3, startTime: '10:00', endTime: '12:00', expectedParticipants: 15 });
  const res3Id = res3.body.data?._id;

  await makeRequest({
    hostname: 'localhost', port: 5000, path: `/api/reservations/${res3Id}/cancel`, method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user1Token}` }
  }, { reason: 'Schedule conflict' });

  const userNotifsAfterCancel = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/notifications', method: 'GET',
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  const cancelUserNotif = userNotifsAfterCancel.body.data?.find(n => n.type === 'RESERVATION_CANCELLED' && String(n.reservation?._id) === String(res3Id));
  console.log('4. Cancellation Trigger:', 'User RESERVATION_CANCELLED:', Boolean(cancelUserNotif));

  // 5. Get Unread Count API
  const unreadRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/notifications/unread-count', method: 'GET',
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  console.log('5. Unread Count API:', unreadRes.status, `unreadCount = ${unreadRes.body.data?.unreadCount}`);

  // 6. Get Notification Details by ID
  const targetNotifId = submitUserNotif?._id;
  const singleNotifRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: `/api/notifications/${targetNotifId}`, method: 'GET',
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  console.log('6. Get Notification By ID:', singleNotifRes.status, 'Title:', singleNotifRes.body.data?.title);

  // 7. Mark Single Notification Read
  const markReadRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: `/api/notifications/${targetNotifId}/read`, method: 'PATCH',
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  console.log('7. Mark Single Read:', markReadRes.status, `isRead = ${markReadRes.body.data?.isRead}`);

  // 8. Cross-User Security Test
  const crossUserRead = await makeRequest({
    hostname: 'localhost', port: 5000, path: `/api/notifications/${targetNotifId}/read`, method: 'PATCH',
    headers: { Authorization: `Bearer ${user2Token}` }
  });
  console.log('8. Cross-User Security Test (User 2 tries reading User 1 notif):', crossUserRead.status, crossUserRead.body.message);

  // 9. Mark All Notifications Read
  const markAllRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/notifications/read-all', method: 'PATCH',
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  const unreadAfterMarkAll = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/notifications/unread-count', method: 'GET',
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  console.log('9. Mark All Read:', markAllRes.status, `Remaining Unread: ${unreadAfterMarkAll.body.data?.unreadCount}`);

  // 10. Delete Notification API
  const deleteNotifRes = await makeRequest({
    hostname: 'localhost', port: 5000, path: `/api/notifications/${targetNotifId}`, method: 'DELETE',
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  console.log('10. Delete Notification:', deleteNotifRes.status, deleteNotifRes.body.message);

  // 11. Pagination & Filters Test
  const paginatedNotifs = await makeRequest({
    hostname: 'localhost', port: 5000, path: '/api/notifications?page=1&limit=2', method: 'GET',
    headers: { Authorization: `Bearer ${user1Token}` }
  });
  console.log('11. Pagination Test:', paginatedNotifs.status, `Page Items: ${paginatedNotifs.body.data?.length}`, `Total Pages: ${paginatedNotifs.body.pagination?.pages}`);

  // 12. Upcoming Reminder Job & Duplicate Prevention Test
  console.log('\n--- 12. UPCOMING REMINDER JOB & DUPLICATE PREVENTION TEST ---');
  const jobRun1 = await runUpcomingReservationReminderJob();
  console.log('12a. Reminder Job Run 1:', jobRun1);

  const jobRun2 = await runUpcomingReservationReminderJob();
  console.log('12b. Reminder Job Run 2 (Duplicate Prevention Check):', jobRun2);

  console.log('\n================ ALL PROMPT 8 NOTIFICATION TESTS COMPLETED ================\n');
  process.exit(0);
}

runAllNotificationTests();
