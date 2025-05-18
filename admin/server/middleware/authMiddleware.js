const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authMiddleware = (role) => {
  return async (req, res, next) => {
    try {
      console.log('Auth middleware called for path:', req.path);
      console.log('Required role:', role);
      
      const token = req.headers.authorization?.split(' ')[1];
      console.log('Token present:', !!token);
      
      if (!token) {
        console.log('No token provided');
        return res.status(401).json({ error: 'No token provided' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token decoded:', decoded);
      
      // Handle admin user
      if (decoded.id === 'admin') {
        console.log('Admin user detected');
        req.user = { 
          id: 'admin', 
          username: 'admin', 
          role: 'admin'
        };
        return next();
      }

      // Get user from database
      const userId = decoded.userId || decoded.id;
      console.log('Looking up user with ID:', userId);
      
      const [users] = await pool.query('SELECT * FROM users WHERE user_id = ?', [userId]);
      const user = users[0];
      console.log('User found:', !!user);

      if (!user) {
        console.log('User not found in database');
        return res.status(401).json({ error: 'User not found' });
      }

      console.log('User role:', user.role);
      if (role && user.role !== role) {
        console.log('Insufficient permissions. Required:', role, 'Got:', user.role);
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      // Log login activity
      const ip = req.headers['x-forwarded-for'] || req.ip;
      console.log('Logging login activity for user:', user.user_id, 'IP:', ip);
      
      await pool.query(
        'INSERT INTO login_logs (user_id, ip_address) VALUES (?, ?)',
        [user.user_id, ip]
      );

      req.user = user;
      console.log('Authentication successful for user:', user.user_id);
      next();
    } catch (error) {
      console.error('Auth middleware error:', {
        message: error.message,
        stack: error.stack
      });
      res.status(401).json({ error: 'Invalid token' });
    }
  };
};

module.exports = { authMiddleware }; 