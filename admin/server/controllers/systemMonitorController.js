const pool = require('../config/db');

const getSystemMonitorData = async (req, res) => {
  try {
    console.log('Fetching system monitor data for user:', req.user.id);
    
    // Get total users count
    console.log('Fetching total users count...');
    const [userCount] = await pool.query('SELECT COUNT(*) as count FROM users');
    console.log('Total users:', userCount[0].count);
    
    // Get recent login logs with usernames
    console.log('Fetching recent login logs...');
    const [loginLogs] = await pool.query(`
      SELECT 
        l.user_id,
        u.username,
        l.ip_address as ip,
        l.login_time
      FROM login_logs l
      LEFT JOIN users u ON l.user_id = u.user_id
      ORDER BY l.login_time DESC
      LIMIT 10
    `);
    console.log('Recent login logs count:', loginLogs.length);

    // Mock uptime (in a real system, this would be calculated)
    const uptime = "99.9%";
    console.log('System uptime:', uptime);

    const responseData = {
      uptime,
      totalUsers: userCount[0].count,
      recentLogins: loginLogs
    };
    
    console.log('Sending system monitor response');
    res.json(responseData);
  } catch (error) {
    console.error('Error in getSystemMonitorData:', {
      message: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to fetch system monitor data' });
  }
};

module.exports = {
  getSystemMonitorData
}; 