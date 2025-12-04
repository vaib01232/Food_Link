const mongoose = require('mongoose');

const verificationTokenSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    token: { 
        type: String, 
        required: true
    },
    expiresAt: { 
        type: Date, 
        required: true,
        default: () => new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

verificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

verificationTokenSchema.index({ token: 1 }, { unique: true });

module.exports = mongoose.model('VerificationToken', verificationTokenSchema);
