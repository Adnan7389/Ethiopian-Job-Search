const Notification = require("../models/Notification");
const { getIO } = require("../socket");

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : null;
    let notifications = await Notification.findByUser(userId);
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
    const io = getIO();
    io.to(userId.toString()).emit('notificationsMarkedAsRead', { message: `Marked ${count} notifications as read` });
    return res.json({ message: `Marked ${count} notifications as read` });
  } catch (error) {
    console.error("Mark all as read error:", error);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notificationId = req.params.id;
    const count = await Notification.markAsRead(userId, notificationId);
    if (count === 0) {
      return res.status(404).json({ message: "Notification not found or not authorized" });
    }
    const io = getIO();
    io.to(userId.toString()).emit('notificationUpdated', { id: notificationId, is_read: true });
    return res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const userId = req.user.userId;
    const notificationId = req.params.id;
    const count = await Notification.delete(userId, notificationId);
    if (count === 0) {
      return res.status(404).json({ message: "Notification not found or not authorized" });
    }
    const io = getIO();
    io.to(userId.toString()).emit('notificationDeleted', { id: notificationId });
    return res.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Delete notification error:", error);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
};

exports.deleteAllNotifications = async (req, res) => {
  try {
    const userId = req.user.userId;
    const count = await Notification.deleteAll(userId);
    const io = getIO();
    io.to(userId.toString()).emit('notificationCleared', { message: `All ${count} notifications cleared` });
    return res.status(200).json({ message: `All ${count} notifications cleared` });
  } catch (error) {
    console.error("Delete all notifications error:", error);
    return res.status(500).json({ message: `Server error: ${error.message}` });
  }
};