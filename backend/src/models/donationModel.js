const mongoose = require('mongoose');

// Function to generate unique donation ID
const generateDonationId = () => {
    const timestamp = Date.now();
    const random = Math.floor(1000 + Math.random() * 9000); // 4-digit random number
    return `DON-${timestamp}-${random}`;
};

const donationSchema = new mongoose.Schema({
    donationId: { 
        type: String, 
        unique: true,
        index: true
    },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    quantity: { type: Number, required: true },
    pickupAddress: { type: String, required: true },
    pickupGeo: {
        lat: { type: Number },
        lng: { type: Number }
    },
    pickupDateTime: { type: Date, required: true },
    expireDateTime: { type: Date, required: true },
    status: { type: String, enum: ['available', 'reserved', 'collected', 'expired', 'cancelled'], default: 'available' },
    reservedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reservedAt: { type: Date },
    collectedAt: { type: Date },
    photos: [String]
}, { timestamps: true });

// Indexes for better query performance
donationSchema.index({ status: 1, expireDateTime: 1 });
donationSchema.index({ donorId: 1, createdAt: -1 });
donationSchema.index({ reservedBy: 1 });
donationSchema.index({ pickupDateTime: 1 });
donationSchema.index({ 'pickupGeo.lat': 1, 'pickupGeo.lng': 1 });

// Pre-save middleware to generate donation ID
donationSchema.pre('save', function(next) {
    if (!this.donationId) {
        this.donationId = generateDonationId();
    }
    next();
});

module.exports = mongoose.model('Donation', donationSchema);