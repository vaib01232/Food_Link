const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: "No token, authorization denied" 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select("name email role");
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: "User not found" 
            });
        }
        req.user = {
            id: user._id.toString(),
            role: user.role,
            name: user.name,
            email: user.email
        };

        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            console.log('[Auth] Token expired for:', err.expiredAt);
            return res.status(401).json({ 
                success: false,
                message: "Token has expired",
                expired: true
            });
        }
        if (err.name === 'JsonWebTokenError') {
            console.log('[Auth] Invalid token');
            return res.status(401).json({ 
                success: false,
                message: "Invalid token" 
            });
        }
        console.error('[Auth] Token verification error:', err);
        res.status(401).json({ 
            success: false,
            message: "Token is not valid" 
        });
    }
};

module.exports = authMiddleware;
