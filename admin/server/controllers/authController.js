const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const pool = require('../config/db');

// Admin login
exports.login = async (req, res) => {
  try {
    console.log('Login attempt received:', { 
      username: req.body.username,
      hasPassword: !!req.body.password,
      envUsername: process.env.ADMIN_USERNAME,
      hasEnvPassword: !!process.env.ADMIN_PASSWORD,
      hasJwtSecret: !!process.env.JWT_SECRET
    });

    const { username, password } = req.body;
    
    // Using hardcoded admin credentials - in production store securely in database
    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
      console.log('Credentials matched, generating token');
      const token = jwt.sign(
        { id: 'admin', username },
        process.env.JWT_SECRET,
        { expiresIn: '8h' }
      );

      // Log admin login activity
      const ip = req.headers['x-forwarded-for'] || req.ip;
      try {
        // Use 0 as the admin user_id in login_logs
        await pool.query(
          'INSERT INTO login_logs (user_id, ip_address) VALUES (?, ?)',
          [0, ip]
        );
        console.log('Login log created successfully');
      } catch (logError) {
        console.error('Failed to create login log:', logError);
        // Continue with login even if logging fails
      }
      
      return res.json({ success: true, token });
    }
    
    console.log('Invalid credentials provided');
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Verify token
exports.verifyToken = (req, res) => {
  res.json({ success: true, user: req.user });
};