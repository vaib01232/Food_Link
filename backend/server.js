require('dotenv').config();

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const authRoutes = require('./src/routes/authRoutes');
const donationRoutes = require('./src/routes/donationRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
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

// Serve uploads statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));