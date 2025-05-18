require('dotenv').config();
const pool = require('../config/db');

async function insertTestLogins() {
  try {
    console.log('Inserting test login data...');
    
    // Insert some test login records with different timestamps
    const testLogins = [
      { user_id: 1, ip_address: '192.168.1.100', login_time: new Date() },
      { user_id: 2, ip_address: '192.168.1.101', login_time: new Date(Date.now() - 1000 * 60 * 5) }, // 5 minutes ago
      { user_id: 3, ip_address: '192.168.1.102', login_time: new Date(Date.now() - 1000 * 60 * 10) }, // 10 minutes ago
      { user_id: 1, ip_address: '192.168.1.103', login_time: new Date(Date.now() - 1000 * 60 * 15) }, // 15 minutes ago
      { user_id: 2, ip_address: '192.168.1.104', login_time: new Date(Date.now() - 1000 * 60 * 20) }  // 20 minutes ago
    ];

    for (const login of testLogins) {
      await pool.query(
        'INSERT INTO login_logs (user_id, ip_address, login_time) VALUES (?, ?, ?)',
        [login.user_id, login.ip_address, login.login_time]
      );
    }
    
    console.log('Test data inserted successfully!');
    
    // Verify the data
    const [logs] = await pool.query(`
      SELECT l.*, u.username 
      FROM login_logs l 
      LEFT JOIN users u ON l.user_id = u.user_id 
      ORDER BY login_time DESC
    `);
    
    console.log('\nRecent login logs:');
    console.table(logs);
    
    process.exit(0);
  } catch (error) {
    console.error('Error inserting test data:', error);
    process.exit(1);
  }
}

insertTestLogins(); 