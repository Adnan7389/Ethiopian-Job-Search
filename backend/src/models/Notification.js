const pool = require("../config/db");

// Add a timeout wrapper for database queries
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
        10000 // 10-second timeout
      );
      return rows;
    } catch (error) {
      throw new Error(`Failed to fetch notifications: ${error.message}`);
    }
  },

  async markAllAsRead(userId) {
    const [result] = await pool.query(
      "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0",
      [userId]
    );
    return result.affectedRows; // number updated
  }
};

module.exports = Notification;