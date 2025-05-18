require('dotenv').config();
const mysql = require('mysql2/promise');

async function createLoginLogsTable() {
  const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  try {
    console.log('Creating login_logs table in main application database...');
    
    await db.query(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    console.log('login_logs table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating login_logs table:', error);
    process.exit(1);
  }
}

createLoginLogsTable(); 