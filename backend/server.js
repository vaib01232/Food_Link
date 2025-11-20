require('dotenv').config();

// Validate environment variables
const validateEnv = require('./src/utils/validateEnv');
validateEnv();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cron = require('node-cron');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// const mongoSanitize = require('express-mongo-sanitize'); // Removed due to Express 5 compatibility
const customMongoSanitize = require('./src/middleware/sanitize');
const authRoutes = require('./src/routes/authRoutes');
const donationRoutes = require('./src/routes/donationRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');
const { removeExpiredDonations, markExpiredDonations, removeOldExpiredDonations } = require('./src/services/cleanupService');
const path = require('path');

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allow images to load
}));

// Rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 20, // 20 requests per window
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: false,
  legacyHeaders: false,
});

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS configuration
app.use(cors({ 
  origin: process.env.FRONTEND_URL || "http://localhost:5173", 
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize data to prevent NoSQL injection (Express 5 compatible)
app.use(customMongoSanitize);

app.use(morgan('dev'));

app.get('/', (req,res) => res.send({ok: true, msg: 'Food_Link API'}));

// Apply rate limiting to auth routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/donations', apiLimiter, donationRoutes);
app.use('/api/uploads', apiLimiter, uploadRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/contact', apiLimiter, contactRoutes);
app.use('/api/notifications', apiLimiter, notificationRoutes);

// Serve uploads statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  console.log('MongoDB connected');
  
  // Initialize cleanup service
  initializeCleanupService();
})
.catch(err => {
  console.log('MongoDB connection error:', err);
  process.exit(1); // Exit if database connection fails
});

/**
 * Initialize cleanup service for expired donations
 * Configurable via environment variables
 */
function initializeCleanupService() {
  const CLEANUP_MODE = process.env.CLEANUP_MODE || 'delete'; // 'delete' or 'mark'
  const CLEANUP_INTERVAL = process.env.CLEANUP_INTERVAL || '*/30 * * * *'; // Default: every 30 minutes
  const CLEANUP_OLD_DAYS = parseInt(process.env.CLEANUP_OLD_DAYS || '7'); // Days before deleting marked expired

  console.log('[Cleanup Service] Initializing...');
  console.log(`[Cleanup Service] Mode: ${CLEANUP_MODE}`);
  console.log(`[Cleanup Service] Schedule: ${CLEANUP_INTERVAL}`);

  if (CLEANUP_MODE === 'delete') {
    // Mode 1: Directly delete expired donations
    cron.schedule(CLEANUP_INTERVAL, async () => {
      console.log('[Cleanup Service] Running scheduled cleanup...');
      try {
        await removeExpiredDonations();
      } catch (err) {
        console.error('[Cleanup Service] Scheduled cleanup failed:', err.message);
      }
    });
    
    // Run initial cleanup on startup
    removeExpiredDonations().catch(err => 
      console.error('[Cleanup Service] Initial cleanup failed:', err.message)
    );
  } else if (CLEANUP_MODE === 'mark') {
    // Mode 2: Mark as expired, then delete after X days
    cron.schedule(CLEANUP_INTERVAL, async () => {
      console.log('[Cleanup Service] Running scheduled cleanup...');
      try {
        await markExpiredDonations();
        await removeOldExpiredDonations(CLEANUP_OLD_DAYS);
      } catch (err) {
        console.error('[Cleanup Service] Scheduled cleanup failed:', err.message);
      }
    });
    
    // Run initial cleanup on startup
    Promise.all([
      markExpiredDonations(),
      removeOldExpiredDonations(CLEANUP_OLD_DAYS)
    ]).catch(err => 
      console.error('[Cleanup Service] Initial cleanup failed:', err.message)
    );
  }

  console.log('[Cleanup Service] Initialized successfully');
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.stack);
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate entry',
      field: Object.keys(err.keyPattern)[0]
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));