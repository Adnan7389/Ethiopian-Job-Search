const mysql = require('mysql2/promise');

   const pool = mysql.createPool({
     host: process.env.DB_HOST || 'localhost',
     user: process.env.DB_USER || 'root',
     password: process.env.DB_PASSWORD || 'Ad@3A2Eej',
     database: process.env.DB_NAME || 'ethiopian_job_search',
     waitForConnections: true,
     connectionLimit: 20,
     queueLimit: 0,
   });

   // Log pool errors
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

// Test connection on startup
(async () => {
  try {
    const [rows] = await pool.query('SELECT 1');
    console.log('Database connection successful:', rows);
  } catch (error) {
    console.error('Database connection error on startup:', error);
  }
})();

// Log connection usage
pool.on('acquire', (connection) => {
  console.log(`Connection ${connection.threadId} acquired`);
});

pool.on('release', (connection) => {
  console.log(`Connection ${connection.threadId} released`);
});

module.exports = pool;