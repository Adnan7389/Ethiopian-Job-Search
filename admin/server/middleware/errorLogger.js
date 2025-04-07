const pool = require('../config/db');

const errorLogger = async (err, req, res, next) => {
  try {
    // Log the error to the database
    await pool.query(
      `INSERT INTO error_logs 
       (error_type, message, stack_trace, user_id, ip_address, endpoint) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        err.name || 'UnknownError',
        err.message,
        err.stack,
        req.user?.id || null,
        req.ip,
        req.originalUrl
      ]
    );
  } catch (logError) {
    // If logging fails, just console.error it
    console.error('Failed to log error:', logError);
  }

  // Continue with error handling
  next(err);
};

module.exports = errorLogger; 