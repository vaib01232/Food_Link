const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true,
        index: true
    },
    message: { 
        type: String, 
        required: true 
    },
    type: { 
        type: String, 
        enum: ['donation_deleted', 'donation_claimed', 'donation_unclaimed'],
        required: true 
    },
    donationId: { 
        type: String,
        required: true 
    },
    isRead: { 
        type: Boolean, 
        default: false,
        index: true
    },
    metadata: {
        ngoName: String,
        donorName: String,
        donationTitle: String
    }
}, { timestamps: true });

// Indexes for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
