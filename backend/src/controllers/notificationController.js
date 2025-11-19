const Notification = require("../models/notificationModel");

const createNotification = async (req, res) => {
    try {
        const { userId, message, type, donationId, metadata } = req.body;

        if (!userId || !message || !type || !donationId) {
            return res.status(400).json({ 
                success: false,
                message: 'Missing required fields' 
            });
        }

        const notification = new Notification({
            userId,
            message,
            type,
            donationId,
            metadata
        });

        await notification.save();

        res.status(201).json({ 
            success: true,
            message: 'Notification created successfully',
            notification 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            error: err.message 
        });
    }
};

const getUserNotifications = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized' 
            });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            Notification.find({ userId: req.user.id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Notification.countDocuments({ userId: req.user.id })
        ]);

        const unreadCount = await Notification.countDocuments({ 
            userId: req.user.id, 
            isRead: false 
        });

        res.json({
            success: true,
            data: notifications,
            unreadCount,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

const markAsRead = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized' 
            });
        }

        const { id } = req.params;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId: req.user.id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ 
                success: false,
                message: 'Notification not found' 
            });
        }

        res.json({ 
            success: true,
            message: 'Notification marked as read',
            notification 
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

const markAllAsRead = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized' 
            });
        }

        await Notification.updateMany(
            { userId: req.user.id, isRead: false },
            { isRead: true }
        );

        res.json({ 
            success: true,
            message: 'All notifications marked as read'
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

const getUnreadCount = async (req, res) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ 
                success: false,
                message: 'Unauthorized' 
            });
        }

        const count = await Notification.countDocuments({ 
            userId: req.user.id, 
            isRead: false 
        });

        res.json({ 
            success: true,
            unreadCount: count
        });
    } catch (err) {
        res.status(500).json({ 
            success: false,
            message: "Server error", 
            error: err.message 
        });
    }
};

module.exports = { 
    createNotification, 
    getUserNotifications, 
    markAsRead, 
    markAllAsRead,
    getUnreadCount
};
