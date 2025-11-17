require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cron = require('node-cron');
const authRoutes = require('./src/routes/authRoutes');
const donationRoutes = require('./src/routes/donationRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const { removeExpiredDonations, markExpiredDonations, removeOldExpiredDonations } = require('./src/services/cleanupService');
const path = require('path');

const app = express();

// CORS configuration
app.use(cors({ 
  origin: process.env.FRONTEND_URL || "http://localhost:5173", 
  credentials: true 
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req,res) => res.send({ok: true, msg: 'Food_Link API'}));
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/admin', adminRoutes);

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));