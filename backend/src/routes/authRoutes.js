const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
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
        body('role').isIn(['donor', 'ngo']).withMessage('Role must be either donor or ngo')
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

module.exports = router;