const express = require("express");
const { getUserNotifications, markAsRead, markAllAsRead, getUnreadCount } = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getUserNotifications);
router.get("/unread-count", authMiddleware, getUnreadCount);
router.patch("/:id/read", authMiddleware, markAsRead);
router.patch("/mark-all-read", authMiddleware, markAllAsRead);

module.exports = router;
