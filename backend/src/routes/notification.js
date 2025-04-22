const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authMiddleware = require("../middleware/authMiddleware");

console.log("Setting up /api/notifications route");
router.get("/", (req, res, next) => {
  console.log("Reached /api/notifications route");
  console.log("Headers:", req.headers);
  next();
}, authMiddleware(), notificationController.getNotifications);

module.exports = router;