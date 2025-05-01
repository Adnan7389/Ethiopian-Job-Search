const express = require("express");
const { getNotifications, markAllAsRead } = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// now allows any authenticated user
router.get("/", authMiddleware(), getNotifications);

// new endpoint
router.put("/mark-all-read", authMiddleware(), markAllAsRead);

module.exports = router;