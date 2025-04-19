const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authMiddleware = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer <token>
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [rows] = await pool.query(
      'SELECT user_id, user_type, username, email, resume_url FROM users WHERE user_id = ?',
      [decoded.userId]
    );
    if (!rows[0]) {
      return res.status(401).json({ error: 'User not found' });
    }
    req.user = {
      id: rows[0].user_id,
      user_type: rows[0].user_type,
      username: rows[0].username,
      email: rows[0].email,
      resume_url: rows[0].resume_url,
    };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;