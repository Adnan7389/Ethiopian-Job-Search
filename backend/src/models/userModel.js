const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  async create({ username, email, password, user_type }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, user_type) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, user_type]
    );
    return result.insertId;
  },

  async findByEmailOrUsername(identifier) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? OR username = ?', [identifier, identifier]);
    return rows[0];
  },

  async createEmailVerification(email) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await pool.query(
      'INSERT INTO email_verifications (email, token, expires_at) VALUES (?, ?, ?)',
      [email, token, expiresAt]
    );
    return token; // Mock email send in controller
  },

  async verifyEmailToken(token) {
    const [rows] = await pool.query(
      'SELECT * FROM email_verifications WHERE token = ? AND used = FALSE AND expires_at > NOW()',
      [token]
    );
    const verification = rows[0];
    if (verification) {
      await pool.query('UPDATE users SET is_verified = TRUE WHERE email = ?', [verification.email]);
      await pool.query('UPDATE email_verifications SET used = TRUE WHERE token = ?', [token]);
    }
    return verification;
  },

  async createPasswordReset(email) {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await pool.query(
      'INSERT INTO password_resets (email, token, expires_at) VALUES (?, ?, ?)',
      [email, token, expiresAt]
    );
    return token; // Mock email send in controller
  },

  async verifyResetToken(token) {
    const [rows] = await pool.query(
      'SELECT * FROM password_resets WHERE token = ? AND used = FALSE AND expires_at > NOW()',
      [token]
    );
    const reset = rows[0];
    if (reset) {
      await pool.query('UPDATE password_resets SET used = TRUE WHERE token = ?', [token]);
    }
    return reset;
  },

  async updatePassword(email, password) {
    await pool.query('UPDATE users SET password = ? WHERE email = ?', [password, email]);
  }
};

module.exports = User;