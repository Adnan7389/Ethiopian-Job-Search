require('dotenv').config();
const pool = require('../config/db');

async function createLoginLogsTable() {
  try {
    console.log('Creating login_logs table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS login_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
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