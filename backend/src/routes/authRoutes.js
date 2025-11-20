const express = require('express');
const { 
    registerUser, 
    loginUser, 
    verifyEmail, 
    resendVerificationEmail,
    forgotPassword,
    resetPassword,
    updatePhone,
    verifyPhoneNumber
} = require('../controllers/authController');
const { body } = require('express-validator');
const authMiddleware = require('../middleware/authMiddleware');

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

// Forgot password endpoint
router.post(
    '/forgot-password',
    [
        body('email').isEmail().withMessage('Valid email is required').normalizeEmail()
    ],
    forgotPassword
);

// Reset password endpoint
router.post(
    '/reset-password',
    [
        body('token').notEmpty().withMessage('Reset token is required'),
        body('newPassword')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters')
    ],
    resetPassword
);

// Update phone number endpoint (requires authentication)
router.post(
    '/update-phone',
    authMiddleware,
    [
        body('phoneNumber').isMobilePhone().withMessage('Invalid phone number')
    ],
    updatePhone
);

// Verify phone number endpoint (requires authentication)
// Firebase handles OTP verification on frontend, this just saves the verified number
router.post(
    '/verify-phone',
    authMiddleware,
    [
        body('phoneNumber').notEmpty().withMessage('Phone number is required')
    ],
    verifyPhoneNumber
);

module.exports = router;