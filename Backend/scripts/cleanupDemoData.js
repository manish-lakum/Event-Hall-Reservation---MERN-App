const dotenv = require('dotenv');
const mongoose = require('mongoose');

const User = require('../models/userModel');
const { Hall } = require('../models/Hall');
const { HallBlock } = require('../models/HallBlock');
const { Reservation } = require('../models/Reservation');
const Notification = require('../models/Notification');

dotenv.config();

// Safety Rule: Default to DRY_RUN=true unless explicitly set to 'false'
const isDryRun = process.env.DRY_RUN === 'false' ? false : true;

// Candidate pattern for test/demo-only records
const TEST_KEYWORD_REGEX = /(CASE|E2E|Automated|Conflict Event|Cancel Event|Reject Event|Test|Temporary|Sample)/i;
const TEST_USER_REGEX = /(test|dummy|sample|e2e|temp)/i;

const cleanupDemoData = async () => {
  let connection;
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/EventHall_db';
    connection = await mongoose.connect(mongoURI);

    console.log('\n======================================================');
    console.log('       COLLEGE EVENT HALL - DEMO DATA CLEANUP');
    console.log('======================================================');
    console.log(` Database URI : ${mongoURI}`);
    console.log(` Database Name: EventHall_db`);
    console.log(` Mode         : ${isDryRun ? 'DRY RUN (NO DATA WILL BE DELETED)' : 'EXECUTE (PERFORMING SPECIFIC DELETIONS)'}`);
    console.log('======================================================\n');

    // ----------------------------------------------------
    // TASK 7: BEFORE COUNTS
    // ----------------------------------------------------
    const beforeCounts = {
      users: await User.countDocuments({}),
      halls: await Hall.countDocuments({}),
      reservations: await Reservation.countDocuments({}),
      hallBlocks: await HallBlock.countDocuments({}),
      notifications: await Notification.countDocuments({})
    };

    console.log('--- BEFORE CLEANUP COUNTS ---');
    console.log(` Users        : ${beforeCounts.users} (Collection: 'SVGU')`);
    console.log(` Halls        : ${beforeCounts.halls} (Collection: 'halls')`);
    console.log(` Reservations : ${beforeCounts.reservations} (Collection: 'reservations')`);
    console.log(` HallBlocks   : ${beforeCounts.hallBlocks} (Collection: 'hallblocks')`);
    console.log(` Notifications: ${beforeCounts.notifications} (Collection: 'notifications')`);
    console.log('-----------------------------\n');

    // Fetch all existing data for analysis
    const allUsers = await User.find({}).lean();
    const allHalls = await Hall.find({}).lean();
    const allReservations = await Reservation.find({}).populate('user', 'name email').populate('hall', 'hallName').lean();
    const allHallBlocks = await HallBlock.find({}).populate('hall', 'hallName').lean();
    const allNotifications = await Notification.find({}).lean();

    const userMap = new Map(allUsers.map(u => [u._id.toString(), u]));
    const hallMap = new Map(allHalls.map(h => [h._id.toString(), h]));
    const reservationMap = new Map(allReservations.map(r => [r._id.toString(), r]));

    // ----------------------------------------------------
    // TASK 3 & 4: CANDIDATE DETECTION
    // ----------------------------------------------------
    const candidateReservations = [];
    for (const res of allReservations) {
      let candidateReason = null;

      if (TEST_KEYWORD_REGEX.test(res.eventTitle || '')) {
        candidateReason = `Event title matches test pattern: "${res.eventTitle}"`;
      } else if (TEST_KEYWORD_REGEX.test(res.eventDescription || '')) {
        candidateReason = `Event description matches test pattern: "${res.eventDescription}"`;
      } else if (res.user && TEST_USER_REGEX.test(res.user.email || '')) {
        candidateReason = `Created by test user email: "${res.user.email}"`;
      }

      if (candidateReason) {
        candidateReservations.push({
          _id: res._id.toString(),
          eventTitle: res.eventTitle,
          status: res.status,
          eventDate: res.eventDate,
          hall: res.hall?.hallName || res.hall || 'Unknown Hall',
          user: res.user?.email || res.user?.name || res.user || 'Unknown User',
          createdAt: res.createdAt ? new Date(res.createdAt).toISOString() : 'N/A',
          reason: candidateReason
        });
      }
    }

    const candidateResIds = new Set(candidateReservations.map(r => r._id));

    // Candidate Notifications (referencing test reservations or test patterns or orphaned IDs)
    const candidateNotifications = [];
    for (const notif of allNotifications) {
      let candidateReason = null;

      if (notif.reservation && candidateResIds.has(notif.reservation.toString())) {
        candidateReason = `References candidate test reservation ID: ${notif.reservation.toString()}`;
      } else if (notif.reservation && !reservationMap.has(notif.reservation.toString())) {
        candidateReason = `Orphaned notification referencing non-existent reservation ID: ${notif.reservation.toString()}`;
      } else if (notif.recipient && !userMap.has(notif.recipient.toString())) {
        candidateReason = `Orphaned notification referencing non-existent recipient user ID: ${notif.recipient.toString()}`;
      } else if (TEST_KEYWORD_REGEX.test(notif.title || '') || TEST_KEYWORD_REGEX.test(notif.message || '')) {
        candidateReason = `Notification title/message matches test pattern: "${notif.title}"`;
      }

      if (candidateReason) {
        candidateNotifications.push({
          _id: notif._id.toString(),
          title: notif.title,
          type: notif.type,
          recipient: notif.recipient?.toString() || 'N/A',
          reason: candidateReason
        });
      }
    }

    // Candidate HallBlocks (referencing non-existent halls/users or test notes)
    const candidateHallBlocks = [];
    for (const block of allHallBlocks) {
      let candidateReason = null;

      if (block.hall && !hallMap.has(block.hall._id ? block.hall._id.toString() : block.hall.toString())) {
        candidateReason = `References non-existent hall ID`;
      } else if (block.createdBy && !userMap.has(block.createdBy.toString())) {
        candidateReason = `References non-existent creator user ID`;
      } else if (TEST_KEYWORD_REGEX.test(block.notes || '')) {
        candidateReason = `Block notes match test pattern: "${block.notes}"`;
      }

      if (candidateReason) {
        candidateHallBlocks.push({
          _id: block._id.toString(),
          hall: block.hall?.hallName || block.hall || 'Unknown Hall',
          reason: block.reason,
          notes: block.notes || '',
          selectedReason: candidateReason
        });
      }
    }

    // Candidate Users (test/dummy users not referenced anywhere important)
    const candidateUsers = [];
    for (const user of allUsers) {
      if (user.role === 'ADMIN') continue; // Never select Admin as candidate

      if (TEST_USER_REGEX.test(user.email || '') || TEST_USER_REGEX.test(user.name || '')) {
        // Check safety references
        const hasValidRes = allReservations.some(r => !candidateResIds.has(r._id.toString()) && r.user && r.user._id && r.user._id.toString() === user._id.toString());
        const createdHall = allHalls.some(h => h.createdBy && h.createdBy.toString() === user._id.toString());
        const createdBlock = allHallBlocks.some(b => b.createdBy && b.createdBy.toString() === user._id.toString());

        if (!hasValidRes && !createdHall && !createdBlock) {
          candidateUsers.push({
            _id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            reason: `Test user pattern in name/email and has no valid references`
          });
        }
      }
    }

    // ----------------------------------------------------
    // PRINT CANDIDATES DETAILS
    // ----------------------------------------------------
    console.log('--- CANDIDATE SELECTION REPORT ---');
    console.log(`Test Reservations Found : ${candidateReservations.length}`);
    candidateReservations.forEach((r, idx) => {
      console.log(`  [${idx + 1}] ID: ${r._id}`);
      console.log(`      Title     : ${r.eventTitle}`);
      console.log(`      Status    : ${r.status}`);
      console.log(`      Date      : ${r.eventDate}`);
      console.log(`      Hall      : ${r.hall}`);
      console.log(`      User      : ${r.user}`);
      console.log(`      Created At: ${r.createdAt}`);
      console.log(`      Reason    : ${r.reason}`);
    });

    console.log(`\nTest Notifications Found : ${candidateNotifications.length}`);
    candidateNotifications.forEach((n, idx) => {
      console.log(`  [${idx + 1}] ID: ${n._id} | Title: "${n.title}" | Reason: ${n.reason}`);
    });

    console.log(`\nTest HallBlocks Found   : ${candidateHallBlocks.length}`);
    candidateHallBlocks.forEach((b, idx) => {
      console.log(`  [${idx + 1}] ID: ${b._id} | Hall: ${b.hall} | Reason: ${b.selectedReason}`);
    });

    console.log(`\nTest Users Found        : ${candidateUsers.length}`);
    candidateUsers.forEach((u, idx) => {
      console.log(`  [${idx + 1}] ID: ${u._id} | Email: ${u.email} | Reason: ${u.reason}`);
    });

    console.log('\n-----------------------------------\n');

    // ----------------------------------------------------
    // TASK 2, 6 & 7: EXECUTION OR DRY RUN SUMMARY
    // ----------------------------------------------------
    if (isDryRun) {
      console.log('======================================================');
      console.log('           DRY RUN - NO DATA DELETED');
      console.log('======================================================');
      console.log('Projected Counts After Cleanup:');
      console.log(` Users        : ${beforeCounts.users - candidateUsers.length}`);
      console.log(` Halls        : ${beforeCounts.halls} (Preserved all halls)`);
      console.log(` Reservations : ${beforeCounts.reservations - candidateReservations.length}`);
      console.log(` HallBlocks   : ${beforeCounts.hallBlocks - candidateHallBlocks.length}`);
      console.log(` Notifications: ${beforeCounts.notifications - candidateNotifications.length}`);
      console.log('======================================================\n');
      console.log('To execute actual cleanup, run:');
      console.log('  Windows PowerShell: $env:DRY_RUN="false"; npm run cleanup:demo');
      console.log('  CMD / Bash        : set DRY_RUN=false && npm run cleanup:demo');
      console.log('======================================================\n');
    } else {
      console.log('======================================================');
      console.log('           EXECUTING SPECIFIC DELETIONS');
      console.log('======================================================');

      let deletedNotifsCount = 0;
      let deletedResCount = 0;
      let deletedBlocksCount = 0;
      let deletedUsersCount = 0;

      // Safe Deletions via specific ID array filter ($in)
      if (candidateNotifications.length > 0) {
        const notifIds = candidateNotifications.map(n => n._id);
        const res = await Notification.deleteMany({ _id: { $in: notifIds } });
        deletedNotifsCount = res.deletedCount || 0;
      }

      if (candidateReservations.length > 0) {
        const resIds = candidateReservations.map(r => r._id);
        const res = await Reservation.deleteMany({ _id: { $in: resIds } });
        deletedResCount = res.deletedCount || 0;
      }

      if (candidateHallBlocks.length > 0) {
        const blockIds = candidateHallBlocks.map(b => b._id);
        const res = await HallBlock.deleteMany({ _id: { $in: blockIds } });
        deletedBlocksCount = res.deletedCount || 0;
      }

      if (candidateUsers.length > 0) {
        const userIds = candidateUsers.map(u => u._id);
        const res = await User.deleteMany({ _id: { $in: userIds } });
        deletedUsersCount = res.deletedCount || 0;
      }

      console.log(`Actual Deleted Counts:`);
      console.log(` Notifications Deleted : ${deletedNotifsCount}`);
      console.log(` Reservations Deleted  : ${deletedResCount}`);
      console.log(` HallBlocks Deleted    : ${deletedBlocksCount}`);
      console.log(` Users Deleted         : ${deletedUsersCount}`);
      console.log('-----------------------------------');

      const afterCounts = {
        users: await User.countDocuments({}),
        halls: await Hall.countDocuments({}),
        reservations: await Reservation.countDocuments({}),
        hallBlocks: await HallBlock.countDocuments({}),
        notifications: await Notification.countDocuments({})
      };

      console.log('Final Database Counts:');
      console.log(` Users        : ${afterCounts.users}`);
      console.log(` Halls        : ${afterCounts.halls}`);
      console.log(` Reservations : ${afterCounts.reservations}`);
      console.log(` HallBlocks   : ${afterCounts.hallBlocks}`);
      console.log(` Notifications: ${afterCounts.notifications}`);
      console.log('======================================================\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', `[Cleanup Error] Script failed: ${error.message}`);
    if (connection) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

cleanupDemoData();
