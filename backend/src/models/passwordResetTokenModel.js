const mongoose = require('mongoose');

const passwordResetTokenSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    token: { 
        type: String, 
        required: true,
        unique: true
    },
    expiresAt: { 
        type: Date, 
        required: true,
        default: () => new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Automatically delete expired tokens
passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
