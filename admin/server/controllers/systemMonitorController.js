const pool = require('../config/db');
const os = require('os');

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

    // Get recent error logs
    console.log('Fetching error logs...');
    const [errorLogs] = await pool.query(`
      SELECT 
        e.error_id,
        e.error_type,
        e.message,
        e.endpoint,
        e.ip_address,
        e.created_at,
        u.username
      FROM error_logs e
      LEFT JOIN users u ON e.user_id = u.user_id
      ORDER BY e.created_at DESC
      LIMIT 10
    `);

    // Get recent audit logs
    console.log('Fetching audit logs...');
    const [auditLogs] = await pool.query(`
      SELECT 
        a.audit_id,
        a.action,
        a.entity_type,
        a.entity_id,
        a.old_value,
        a.new_value,
        a.ip_address,
        a.created_at,
        u.username
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.user_id
      ORDER BY a.created_at DESC
      LIMIT 10
    `);

    // Get error statistics
    const [errorStats] = await pool.query(`
      SELECT 
        error_type,
        COUNT(*) as count
      FROM error_logs
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
      GROUP BY error_type
    `);

    // Get system performance metrics
    const cpuUsage = os.loadavg()[0];
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem * 100).toFixed(2);
    
    // Get application metrics
    const [newUsersToday] = await pool.query('SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = CURDATE()');
    const [activeJobs] = await pool.query('SELECT COUNT(*) as count FROM jobs WHERE status = "open"');
    
    // Get detailed employer statistics
    const [employerStats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN ep.isApproved = 1 THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN ep.isApproved = 0 THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN u.is_suspended = 1 THEN 1 ELSE 0 END) as suspended
      FROM employer_profiles ep
      JOIN users u ON ep.user_id = u.user_id
    `);

    // Get user type distribution with more details
    const [userTypes] = await pool.query(`
      SELECT 
        user_type,
        COUNT(*) as total,
        SUM(CASE WHEN is_verified = 1 THEN 1 ELSE 0 END) as verified,
        SUM(CASE WHEN is_suspended = 1 THEN 1 ELSE 0 END) as suspended
      FROM users
      GROUP BY user_type
    `);

    // Get job statistics
    const [jobStats] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed,
        SUM(CASE WHEN status = 'paused' THEN 1 ELSE 0 END) as paused
      FROM jobs
    `);

    const responseData = {
      uptime: "99.9%",
      totalUsers: userCount[0].count,
      recentLogins: loginLogs,
      errorLogs: errorLogs,
      auditLogs: auditLogs,
      errorStats: errorStats,
      systemMetrics: {
        cpuUsage: `${cpuUsage.toFixed(2)}%`,
        memoryUsage: `${memoryUsage}%`,
        totalMemory: `${(totalMem / (1024 * 1024 * 1024)).toFixed(2)} GB`,
        freeMemory: `${(freeMem / (1024 * 1024 * 1024)).toFixed(2)} GB`,
        serverTime: new Date().toISOString(),
        nodeVersion: process.version
      },
      applicationMetrics: {
        newUsersToday: newUsersToday[0].count,
        activeJobs: activeJobs[0].count,
        employerStats: employerStats[0],
        jobStats: jobStats[0]
      },
      userDistribution: userTypes
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