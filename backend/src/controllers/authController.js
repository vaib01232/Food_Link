const User = require('../models/userModel');
const VerificationToken = require('../models/verificationTokenModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { sendVerificationEmail } = require('../services/emailService');

const registerUser = async (req, res) => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()){
        return res.status(400).json({ 
            success: false,
            message: 'Validation failed',
            errors: errors.array() 
        });
    }

    const { name, email, password, role } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if(existingUser) {
            return res.status(400).json({ 
                success: false,
                message: 'User already exists' 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = new User({
            name,
            email,
            passwordHash,
            role,
            isEmailVerified: false
        });

        await user.save();

        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        const tokenDoc = new VerificationToken({
            userId: user._id,
            token: verificationToken,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000)
        });
        await tokenDoc.save();

        try {
            await sendVerificationEmail(email, name, verificationToken);
        } catch (emailError) {
        }

        res.status(201).json({
            success: true,
            message: 'Registration successful! Please check your email to verify your account.',
            requiresVerification: true,
            email: email
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
};


const loginUser = async (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            message: 'Validation failed',
            errors: errors.array() 
        });
    }

    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if(!user){
            return res.status(400).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if(!isMatch) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid credentials' 
            });
        }

        if (!user.isEmailVerified && user.role !== 'admin') {
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
                role: user.role,
                isEmailVerified: user.isEmailVerified
            }
        });

    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
};

const verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({
                success: false,
                message: 'Verification token is required'
            });
        }

        const tokenDoc = await VerificationToken.findOne({ token });

        if (!tokenDoc) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification token'
            });
        }

        if (new Date() > tokenDoc.expiresAt) {
            await VerificationToken.deleteOne({ _id: tokenDoc._id });
            return res.status(400).json({
                success: false,
                message: 'Verification token has expired. Please request a new one.',
                expired: true
            });
        }

        const user = await User.findById(tokenDoc.userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        user.isEmailVerified = true;
        user.emailVerifiedAt = new Date();
        await user.save();

        await VerificationToken.deleteOne({ _id: tokenDoc._id });

        const loginToken = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.json({
            success: true,
            message: 'Email verified successfully! You can now log in.',
            autoLogin: true,
            token: loginToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isEmailVerified: true
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error during verification',
            error: error.message
        });
    }
};

const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                success: false,
                message: 'Email is already verified'
            });
        }

        await VerificationToken.deleteMany({ userId: user._id });

        const verificationToken = crypto.randomBytes(32).toString('hex');
        
        const tokenDoc = new VerificationToken({
            userId: user._id,
            token: verificationToken,
            expiresAt: new Date(Date.now() + 30 * 60 * 1000)
        });
        await tokenDoc.save();

        try {
            await sendVerificationEmail(email, user.name, verificationToken);

            res.json({
                success: true,
                message: 'Verification email sent! Please check your inbox.',
                email: email
            });
        } catch (emailError) {
            res.status(500).json({
                success: false,
                message: 'Failed to send verification email. Please try again later.'
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Server error',
            error: error.message
        });
    }
};

module.exports = { registerUser, loginUser, verifyEmail, resendVerificationEmail };