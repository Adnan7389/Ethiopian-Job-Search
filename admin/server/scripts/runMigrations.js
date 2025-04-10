require('dotenv').config();
const pool = require('../config/db');

async function runMigrations() {
  try {
    console.log('Starting database migrations...');

    // Create error_logs table
    console.log('Creating error_logs table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS error_logs (
        error_id INT AUTO_INCREMENT PRIMARY KEY,
        error_type VARCHAR(50) NOT NULL,
        message TEXT NOT NULL,
        stack_trace TEXT,
        user_id INT,
        ip_address VARCHAR(45),
        endpoint VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);
    console.log('error_logs table created successfully');

    // Create audit_logs table
    console.log('Creating audit_logs table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        audit_id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(50) NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id INT,
        old_value JSON,
        new_value JSON,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      )
    `);
    console.log('audit_logs table created successfully');

    console.log('All migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations(); 