const pool = require('../config/db');

exports.getAnalytics = async (req, res) => {
  try {
    // Get total active users
    const [activeUsers] = await pool.query(`
      SELECT COUNT(*) as total FROM users
      WHERE is_verified = 1
    `);
    
    // Get job postings by status
    const [jobsByStatus] = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count 
      FROM jobs 
      GROUP BY status
    `);
    
    // Get applications by status
    const [applicationsByStatus] = await pool.query(`
      SELECT 
        status,
        COUNT(*) as count 
      FROM applicants 
      GROUP BY status
    `);
    
    // Get jobs by industry
    const [jobsByIndustry] = await pool.query(`
      SELECT 
        industry,
        COUNT(*) as count 
      FROM jobs 
      GROUP BY industry
    `);
    
    res.json({
      success: true,
      data: {
        activeUsers: activeUsers[0].total,
        jobsByStatus,
        applicationsByStatus,
        jobsByIndustry
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};