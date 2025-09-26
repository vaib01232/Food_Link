const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true},
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['donor', 'ngo', 'admin'], default: 'donor'},
    phoneNumber: { type: String },
    address: { type: String },
    profilePhotoURL: { type: String },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);