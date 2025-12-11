const User = require('../models/userModel');
const VerificationToken = require('../models/verificationTokenModel');
const PasswordResetToken = require('../models/passwordResetTokenModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');

const registerUser = async (req, res) => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role } = req.body;

    try {
        let user = await User.findOne({ email });
        if(user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            passwordHash,
            role,
            isEmailVerified: false
        });

        await user.save();

        const verificationToken = crypto.randomBytes(32).toString('hex');
        await VerificationToken.create({
            userId: user._id,
            token: verificationToken,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000)
        });

        await sendVerificationEmail(email, name, verificationToken);

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            requiresVerification: true
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if(!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isEmailVerified) {
            return res.status(403).json({
                success: false,
                message: 'Please verify your email before logging in',
                requiresVerification: true,
                email: user.email
            });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.json({
            success: true,
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const verifyEmail = async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ success: false, message: 'Verification token is required' });
    }

    try {
        const verificationToken = await VerificationToken.findOne({ token });

        if (!verificationToken) {
            return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
        }

        if (verificationToken.expiresAt < new Date()) {
            await VerificationToken.deleteOne({ _id: verificationToken._id });
            return res.status(400).json({ success: false, message: 'Verification token has expired' });
        }

        const user = await User.findById(verificationToken.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.isEmailVerified) {
            await VerificationToken.deleteOne({ _id: verificationToken._id });
            return res.status(400).json({ success: false, message: 'Email is already verified' });
        }

        user.isEmailVerified = true;
        user.emailVerifiedAt = new Date();
        await user.save();

        await VerificationToken.deleteOne({ _id: verificationToken._id });

        res.json({ success: true, message: 'Email verified successfully! You can now log in.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const resendVerificationEmail = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ success: false, message: 'Email is already verified' });
        }

        await VerificationToken.deleteMany({ userId: user._id });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        await VerificationToken.create({
            userId: user._id,
            token: verificationToken,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000)
        });

        await sendVerificationEmail(email, user.name, verificationToken);

        res.json({ success: true, message: 'Verification email sent successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const forgotPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.json({ success: true, message: 'If an account exists with this email, you will receive a password reset link' });
        }

        await PasswordResetToken.deleteMany({ userId: user._id });

        const resetToken = crypto.randomBytes(32).toString('hex');
        await PasswordResetToken.create({
            userId: user._id,
            token: resetToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000)
        });

        await sendPasswordResetEmail(email, user.name, resetToken);

        res.json({ success: true, message: 'If an account exists with this email, you will receive a password reset link' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const resetPassword = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { token, newPassword } = req.body;

    try {
        const resetToken = await PasswordResetToken.findOne({ token });

        if (!resetToken) {
            return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
        }

        if (resetToken.expiresAt < new Date()) {
            await PasswordResetToken.deleteOne({ _id: resetToken._id });
            return res.status(400).json({ success: false, message: 'Reset token has expired' });
        }

        const user = await User.findById(resetToken.userId);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();

        await PasswordResetToken.deleteOne({ _id: resetToken._id });

        res.json({ success: true, message: 'Password reset successfully! You can now log in with your new password.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const updatePhone = async (req, res) => {
    const { phoneNumber } = req.body;

    if (!phoneNumber) {
        return res.status(400).json({ success: false, message: 'Phone number is required' });
    }

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.phoneNumber = phoneNumber;
        user.isPhoneVerified = false;
        await user.save();

        res.json({ success: true, message: 'Phone number updated successfully', phoneNumber: user.phoneNumber });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const verifyPhoneNumber = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        user.isPhoneVerified = true;
        await user.save();

        res.json({ success: true, message: 'Phone number verified successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

module.exports = { 
    registerUser, 
    loginUser, 
    verifyEmail, 
    resendVerificationEmail, 
    forgotPassword, 
    resetPassword,
    updatePhone,
    verifyPhoneNumber
};