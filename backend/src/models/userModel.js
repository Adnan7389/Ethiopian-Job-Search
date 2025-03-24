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

  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }
};

module.exports = User;