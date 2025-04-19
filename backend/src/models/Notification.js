const pool = require("../config/db");

const Notification = {
  async create(data) {
    const [result] = await pool.query(
      "INSERT INTO notifications (user_id, message, is_read) VALUES (?, ?, ?)",
      [data.user_id, data.message, false]
    );
    return { id: result.insertId, ...data };
  },

  async findByUser(userId) {
    const [rows] = await pool.query(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC",
      [userId]
    );
    return rows;
  }
};

module.exports = Notification;