const cron = require('node-cron');
const { runUpcomingReservationReminderJob } = require('../services/notificationService');

/**
 * Initialize Reservation Reminder Cron Job
 * Runs daily at 08:00 AM server time
 */
const initReservationReminderJob = () => {
  try {
    // Cron schedule: 0 8 * * * (At 08:00 AM every day)
    cron.schedule('0 8 * * *', async () => {
      console.log('[Cron Job] Running daily upcoming reservation reminder job...');
      await runUpcomingReservationReminderJob();
    });

    console.log('\x1b[36m%s\x1b[0m', '[Job Engine] Reservation Reminder Cron Job scheduled daily at 08:00 AM');
  } catch (error) {
    console.error('[Job Engine Error] Failed to schedule reservation reminder cron job:', error.message);
  }
};

module.exports = { initReservationReminderJob };
