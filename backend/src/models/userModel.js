const pool = require("../config/db");
const bcrypt = require("bcryptjs");

const User = {
  async create({ username, email, password, user_type }) {
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password, user_type) VALUES (?, ?, ?, ?)",
      [username, email, password, user_type]
    );
    return result.insertId;
  },

  async findByEmailOrUsername(identifier) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? OR username = ?",
      [identifier, identifier]
    );
    return rows[0];
  },

  async findByEmail(email) {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    return rows[0];
  },

  async findById(userId) {
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [userId]);
    return rows[0];
  },

  async update(userId, updates) {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    const query = `UPDATE users SET ${fields.map((field) => `${field} = ?`).join(", ")} WHERE user_id = ?`;
    await pool.query(query, [...values, userId]);
  },

  async updatePassword(email, password) {
    await pool.query("UPDATE users SET password = ? WHERE email = ?", [password, email]);
  },

  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  },

  // New methods for 6-digit code
  async storeVerificationCode(userId, code, expiresAt) {
    await pool.query(
      "UPDATE users SET verification_code = ?, code_expires_at = ? WHERE user_id = ?",
      [code, expiresAt, userId]
    );
  },

  async verifyCode(email, code) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND verification_code = ?",
      [email, code]
    );
    return rows[0];
  },

  async clearVerificationCode(userId) {
    await pool.query(
      "UPDATE users SET verification_code = NULL, code_expires_at = NULL WHERE user_id = ?",
      [userId]
    );
  },
};

module.exports = User;