const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    if (!req.user || req.user.user_type !== "employer") {
      return res.status(403).json({ message: "Only employers can view notifications" });
    }
    const notifications = await Notification.findByUser(req.user.userId);
    res.status(200).json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};