const express = require("express");
const { getNotifications, markAllAsRead, markAsRead, deleteNotification, deleteAllNotifications } = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Get all notifications for the authenticated user
router.get("/", authMiddleware(), getNotifications);

// Mark all notifications as read
router.put("/mark-all-read", authMiddleware(), markAllAsRead);

// Mark a single notification as read
router.put("/:id/read", authMiddleware(), markAsRead);

// Delete a single notification
router.delete("/:id", authMiddleware(), deleteNotification);

// Clear all notifications for the user
router.delete("/", authMiddleware(), deleteAllNotifications);

module.exports = router;