const pool = require('../config/db');

// Get all employers
exports.getAllEmployers = async (req, res) => {
  try {
    const [employers] = await pool.query(`
      SELECT u.user_id, u.username, u.email, u.created_at, u.is_verified,
        ep.company_name, ep.industry, ep.website, ep.location
      FROM users u
      LEFT JOIN employer_profiles ep ON u.user_id = ep.user_id
      WHERE u.user_type = 'employer'
      ORDER BY u.created_at DESC
    `);
    
    res.json({ success: true, data: employers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve/reject employer
exports.toggleEmployerApproval = async (req, res) => {
  try {
    const { userId, approved } = req.body;
    
    await pool.query(`
      UPDATE users
      SET is_verified = ?
      WHERE user_id = ? AND user_type = 'employer'
    `, [approved ? 1 : 0, userId]);
    
    res.json({ 
      success: true, 
      message: `Employer ${approved ? 'approved' : 'rejected'} successfully` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get employer details with stats
exports.getEmployerDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get employer details
    const [employerDetails] = await pool.query(`
      SELECT u.user_id, u.username, u.email, u.created_at, u.is_verified,
        ep.company_name, ep.industry, ep.website, ep.location, ep.description
      FROM users u
      LEFT JOIN employer_profiles ep ON u.user_id = ep.user_id
      WHERE u.user_id = ? AND u.user_type = 'employer'
    `, [userId]);
    
    if (!employerDetails.length) {
      return res.status(404).json({ success: false, message: 'Employer not found' });
    }
    
    // Get employer's job postings
    const [jobs] = await pool.query(`
      SELECT job_id, title, job_type, industry, status, created_at, expires_at
      FROM jobs
      WHERE employer_id = ?
      ORDER BY created_at DESC
    `, [userId]);
    
    // Get application stats for this employer
    const [applicationStats] = await pool.query(`
      SELECT a.status, COUNT(*) as count
      FROM applicants a
      JOIN jobs j ON a.job_id = j.job_id
      WHERE j.employer_id = ?
      GROUP BY a.status
    `, [userId]);
    
    res.json({
      success: true,
      data: {
        employer: employerDetails[0],
        jobs,
        applicationStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};