const express = require('express');
const { registerUser, loginUser, verifyEmail, resendVerificationEmail } = require('../controllers/authController');
const { body } = require('express-validator');

const router = express.Router();

router.post(
    '/register',
    [
        body('name').notEmpty().withMessage('Name is required').trim().escape(),
        body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters')
            .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
            .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
        body('role').isIn(['donor', 'ngo']).withMessage('Role must be either donor or ngo'),
        body('phoneNumber').optional().isMobilePhone().withMessage('Invalid phone number')
    ],
    registerUser
);

router.post(
    '/login',
    [
        body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
        body('password').notEmpty().withMessage('Password is required').trim()
    ],
    loginUser
);

// Email verification endpoint
router.get('/verify-email', verifyEmail);

// Resend verification email endpoint
router.post(
    '/resend-verification',
    [
        body('email').isEmail().withMessage('Valid email is required').normalizeEmail()
    ],
    resendVerificationEmail
);

module.exports = router;