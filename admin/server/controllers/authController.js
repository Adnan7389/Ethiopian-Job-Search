const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/db');

// Admin login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Using hardcoded admin credentials - in production store securely in database
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign(
        { id: 'admin', username },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      // Log admin login activity
      const ip = req.headers['x-forwarded-for'] || req.ip;
      await pool.query(
        'INSERT INTO login_logs (user_id, ip_address) VALUES (?, ?)',
        ['admin', ip]
      );
      
      return res.json({ success: true, token });
    }
    
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify token
exports.verifyToken = (req, res) => {
  res.json({ success: true, user: req.user });
};