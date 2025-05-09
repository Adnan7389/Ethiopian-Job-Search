const pool = require("../config/db");
const bcrypt = require("bcryptjs");

const User = {
  async create({ username, email, password, user_type }) {
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password, user_type, is_verified) VALUES (?, ?, ?, ?, ?)",
      [username, email, password, user_type, false]
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
  
  async findByUsername(username) {
    const [rows] = await pool.query("SELECT * FROM users WHERE username = ?", [username]);
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

  async updateResendAttempts(email, resendCount, lastResendAt, resendWindowStart) {
    await pool.query(
      "UPDATE users SET resend_count = ?, last_resend_at = ?, resend_window_start = ? WHERE email = ?",
      [resendCount, lastResendAt, resendWindowStart, email]
    );
  },

  async resetResendCount(email) {
    await pool.query(
      "UPDATE users SET resend_count = 0, resend_window_start = NULL WHERE email = ?",
      [email]
    );
  },

  async storeResetCode(email, code, expiresAt) {
    await pool.query(
      "UPDATE users SET reset_code = ?, reset_code_expires_at = ? WHERE email = ?",
      [code, expiresAt, email]
    );
  },

  async verifyResetCode(email, code) {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? AND reset_code = ?",
      [email, code]
    );
    return rows[0];
  },

  async clearResetCode(email) {
    await pool.query(
      "UPDATE users SET reset_code = NULL, reset_code_expires_at = NULL WHERE email = ?",
      [email]
    );
  },
};

module.exports = User;