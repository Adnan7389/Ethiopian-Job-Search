const pool = require("../config/db");

const queryWithTimeout = async (query, params, timeout = 10000) => {
  const queryPromise = pool.query(query, params);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => {
      reject(new Error('Database query timed out'));
    }, timeout);
  });
  return Promise.race([queryPromise, timeoutPromise]);
};

const Notification = {
  async create(data) {
    try {
      const [result] = await queryWithTimeout(
        "INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, ?)",
        [data.user_id, data.message, false]
      );
      return { id: result.insertId, ...data };
    } catch (error) {
      throw new Error(`Failed to create notification: ${error.message}`);
    }
  },

  async findByUser(userId) {
    try {
      const [rows] = await queryWithTimeout(
        "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
        [userId],
        10000
      );
      return rows;
    } catch (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
  },

  async markAllAsRead(userId) {
    try {
      const [result] = await queryWithTimeout(
        "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
        [userId]
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(`Failed to mark notifications as read: ${error.message}`);
    }
  },

  async markAsRead(userId, notificationId) {
    try {
      const [result] = await queryWithTimeout(
        "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ? AND is_read = 0",
        [notificationId, userId]
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(`Failed to mark notification as read: ${error.message}`);
    }
  },

  async delete(userId, notificationId) {
    try {
      const [result] = await queryWithTimeout(
        "DELETE FROM notifications WHERE id = ? AND user_id = ?",
        [notificationId, userId]
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(`Failed to delete notification: ${error.message}`);
    }
  },

  async deleteAll(userId) {
    try {
      const [result] = await queryWithTimeout(
        "DELETE FROM notifications WHERE user_id = ?",
        [userId]
      );
      return result.affectedRows;
    } catch (error) {
      throw new Error(`Failed to delete notifications: ${error.message}`);
    }
  }
};

module.exports = Notification;