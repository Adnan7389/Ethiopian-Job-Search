require('dotenv').config();
const pool = require('../config/db');
const axios = require('axios');

async function insertTestData() {
  try {
    console.log('Inserting test login data...');
    
    // Insert some test login records
    const testLogins = [
      { user_id: 1, ip_address: '192.168.1.100' },
      { user_id: 2, ip_address: '192.168.1.101' },
      { user_id: 3, ip_address: '192.168.1.102' },
      { user_id: 1, ip_address: '192.168.1.103' },
      { user_id: 2, ip_address: '192.168.1.104' }
    ];

    for (const login of testLogins) {
      await pool.query(
        'INSERT INTO login_logs (user_id, ip_address) VALUES (?, ?)',
        [login.user_id, login.ip_address]
      );
    }
    
    console.log('Test data inserted successfully!');
    
    // Verify the data
    const [logs] = await pool.query('SELECT * FROM login_logs ORDER BY login_time DESC');
    console.log('\nRecent login logs:');
    console.table(logs);
    
    // Test the system monitor endpoint
    console.log('\nTesting system monitor endpoint...');
    const response = await axios.get('http://localhost:3000/api/admin/system-monitor', {
      headers: {
        'Authorization': `Bearer ${process.env.ADMIN_TOKEN}`
      }
    });
    
    console.log('\nSystem Monitor Response:');
    console.log('Uptime:', response.data.uptime);
    console.log('Total Users:', response.data.totalUsers);
    console.log('\nRecent Logins:');
    console.table(response.data.recentLogins);
    
    process.exit(0);
  } catch (error) {
    console.error('Error during testing:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

insertTestData(); 