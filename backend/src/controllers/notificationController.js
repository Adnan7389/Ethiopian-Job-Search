// Remove the employer-only check and add limit & markAllAsRead

const Notification = require("../models/Notification");

exports.getNotifications = async (req, res) => {
  try {
    // req.user is guaranteed by authMiddleware
    const userId = req.user.userId;

    // parse optional ?limit=3
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;

    // fetch all
    let notifications = await Notification.findByUser(userId);

    // apply limit if provided
    if (limit) {
      notifications = notifications.slice(0, limit);
    }

    return res.status(200).json(notifications);
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await Notification.markAllAsRead(userId);
    return res.json({ message: `Marked ${count} notifications as read` });
  } catch (error) {
    console.error("Mark all as read error:", error);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
};
