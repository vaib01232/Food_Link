require('dotenv').config();

const validateEnv = require('./src/utils/validateEnv');
validateEnv();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const cron = require('node-cron');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
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

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const authLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 20,
  message: 'Too many authentication attempts, please try again later',
  standardHeaders: false,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors({ 
  origin: process.env.FRONTEND_URL || "http://localhost:5173", 
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(customMongoSanitize);

app.use(morgan('dev'));

app.get('/', (req,res) => res.send({ok: true, msg: 'Food_Link API'}));

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/donations', apiLimiter, donationRoutes);
app.use('/api/uploads', apiLimiter, uploadRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/contact', apiLimiter, contactRoutes);
app.use('/api/notifications', apiLimiter, notificationRoutes);

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

mongoose.connect(process.env.MONGO_URI)
.then(() => {
  initializeCleanupService();
})
.catch(err => {
  process.exit(1);
});

function initializeCleanupService() {
  const CLEANUP_MODE = process.env.CLEANUP_MODE || 'delete';
  const CLEANUP_INTERVAL = process.env.CLEANUP_INTERVAL || '*/30 * * * *';
  const CLEANUP_OLD_DAYS = parseInt(process.env.CLEANUP_OLD_DAYS || '7');

  if (CLEANUP_MODE === 'delete') {
    cron.schedule(CLEANUP_INTERVAL, async () => {
      try {
        await removeExpiredDonations();
      } catch (err) {
      }
    });
    
    removeExpiredDonations().catch(err => {});
  } else if (CLEANUP_MODE === 'mark') {
    cron.schedule(CLEANUP_INTERVAL, async () => {
      try {
        await markExpiredDonations();
        await removeOldExpiredDonations(CLEANUP_OLD_DAYS);
      } catch (err) {
      }
    });
    
    Promise.all([
      markExpiredDonations(),
      removeOldExpiredDonations(CLEANUP_OLD_DAYS)
    ]).catch(err => {});
  }
}

app.use((err, req, res, next) => {
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
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {});