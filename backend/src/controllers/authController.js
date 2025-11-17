const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

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
        let user = await User.findOne({ email });
        if(user) {
            return res.status(400).json({ 
                success: false,
                message: 'User already exists' 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            passwordHash,
            role
        });

        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token
        });
    } catch (error) {
        console.error('[Auth] Registration error:', error);
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

    const { email,password } = req.body;

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
        console.error('[Auth] Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: error.message 
        });
    }
};

module.exports = { registerUser, loginUser };