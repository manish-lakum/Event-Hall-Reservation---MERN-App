const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { initReservationReminderJob } = require('./jobs/reservationReminderJob');

// Route Imports
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const hallRoutes = require('./routes/hallRoutes');
const availabilityRoutes = require('./routes/availabilityRoutes');
const blockRoutes = require('./routes/blockRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const adminReservationRoutes = require('./routes/adminReservationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const profileRoutes = require('./routes/profileRoutes');
const adminUserRoutes = require('./routes/adminUserRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB Database
connectDB();

// Initialize Reservation Reminder Cron Job Engine
initReservationReminderJob();

// Initialize Express Application
const app = express();

// CORS Configuration
const frontendURL = process.env.FRONTEND_URL || 'http://localhost:5173';
const corsOptions = {
  origin: [frontendURL, 'http://localhost:5173', 'http://localhost:5175'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cors(corsOptions));

// Body Parsing Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount Application Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/halls', availabilityRoutes);     // Mounts /api/halls/:id/availability and /api/halls/:id/schedule
app.use('/api', hallRoutes);                   // Mounts /api/halls and /api/admin/halls endpoints
app.use('/api/admin/hall-blocks', blockRoutes); // Mounts /api/admin/hall-blocks endpoints
app.use('/api/reservations', reservationRoutes); // Mounts /api/reservations user endpoints
app.use('/api/admin/reservations', adminReservationRoutes); // Mounts /api/admin/reservations admin endpoints
app.use('/api', dashboardRoutes);             // Mounts /api/dashboard/user and /api/admin/dashboard
app.use('/api', calendarRoutes);              // Mounts /api/calendar/user, /api/admin/calendar, /api/admin/calendar/today
app.use('/api/notifications', notificationRoutes); // Mounts /api/notifications endpoints
app.use('/api/profile', profileRoutes);        // Mounts /api/profile endpoints
app.use('/api/admin/users', adminUserRoutes);  // Mounts /api/admin/users endpoints
app.use('/api/admin/reports', reportRoutes);  // Mounts /api/admin/reports endpoints

// Base Route Handler
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'College Event Hall Reservation System API Engine Online'
  });
});

// 404 Not Found Middleware
app.use(notFound);

// Global Error Handler Middleware
app.use(errorHandler);

// Server Listener
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\x1b[36m%s\x1b[0m`, `[Server] Event Hall Reservation Server running on port ${PORT}`);
  console.log(`\x1b[36m%s\x1b[0m`, `[Server] Allowed CORS Origin: ${frontendURL}`);
});
