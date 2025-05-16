const pool = require('../config/db');

// Get all employers
exports.getAllEmployers = async (req, res) => {
  try {
    const [employers] = await pool.query(`
      SELECT u.user_id, u.username, u.email, u.created_at,
        ep.company_name, ep.industry, ep.website, ep.location, ep.isApproved
      FROM users u
      LEFT JOIN employer_profiles ep ON u.user_id = ep.user_id
      WHERE u.user_type = 'employer' AND u.username != 'admin'
      ORDER BY u.created_at DESC
    `);
    res.json({ success: true, data: employers });
  } catch (error) {
    console.error('getAllEmployers Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Approve/reject employer
exports.toggleEmployerApproval = async (req, res) => {
  console.log('toggleEmployerApproval called with body:', req.body);
  try {
    const { userId, approved } = req.body;
    console.log('Updating employer approval status:', { userId, approved });
    
    // First check if user exists and is an employer
    const [[user]] = await pool.query(
      'SELECT * FROM users WHERE user_id = ? AND user_type = ?',
      [userId, 'employer']
    );
    
    if (!user) {
      console.log('No employer user found with ID:', userId);
      return res.status(404).json({ 
        success: false, 
        message: 'Employer user not found' 
      });
    }
    
    // Check if employer profile exists
    const [[profile]] = await pool.query(
      'SELECT * FROM employer_profiles WHERE user_id = ?',
      [userId]
    );
    
    if (!profile) {
      console.log('No employer profile found for user:', userId);
      return res.status(404).json({ 
        success: false, 
        message: 'Employer profile not found. Please ensure the employer profile is created first.' 
      });
    }
    
    // Update existing profile
    const [result] = await pool.query(`
      UPDATE employer_profiles
      SET isApproved = ?
      WHERE user_id = ?
    `, [approved ? 1 : 0, userId]);
    
    console.log('Update result:', result);
    
    if (result.affectedRows === 0) {
      console.log('Failed to update employer profile for ID:', userId);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to update employer status' 
      });
    }
    
    console.log('Employer approval status updated successfully');
    res.json({ 
      success: true, 
      message: `Employer ${approved ? 'approved' : 'disapproved'} successfully` 
    });
  } catch (error) {
    console.error('toggleEmployerApproval Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get employer details with stats
exports.getEmployerDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('getEmployerDetails: Request params:', req.params);
    console.log('getEmployerDetails: User object:', req.user);
    
    // For admin user, allow access to any employer's details
    if (req.user.user_id === 'admin' || req.user.isAdmin) {
      try {
        // Fetch employer details from the database
        const [[employer]] = await pool.query(
          "SELECT * FROM users WHERE user_id = ? AND user_type = 'employer'",
          [userId]
        );
        console.log('getEmployerDetails: Employer found:', employer);

        if (!employer) {
          console.log('getEmployerDetails: Employer not found');
          return res.status(404).json({ 
            success: false, 
            message: 'Employer not found' 
          });
        }

        // Fetch employer profile details
        const [[profile]] = await pool.query(
          "SELECT * FROM employer_profiles WHERE user_id = ?",
          [userId]
        );
        console.log('getEmployerDetails: Profile found:', profile);

        // Fetch jobs posted by the employer
        const [jobs] = await pool.query(
          "SELECT * FROM jobs WHERE employer_id = ?",
          [userId]
        );
        console.log('getEmployerDetails: Jobs found:', jobs);

        // Initialize empty application stats
        let applicationStats = [];

        // Try to fetch application stats if the table exists
        try {
          const [stats] = await pool.query(
            "SELECT status, COUNT(*) as count FROM applicants WHERE job_id IN (SELECT job_id FROM jobs WHERE employer_id = ?) GROUP BY status",
            [userId]
          );
          applicationStats = stats;
          console.log('getEmployerDetails: Application stats:', applicationStats);
        } catch (statsError) {
          console.log('getEmployerDetails: Applicants table not available, using empty stats');
          // If the applicants table doesn't exist, we'll just use empty stats
        }

        return res.json({
          success: true,
          data: {
            employer: { ...employer, ...profile },
            jobs,
            applicationStats
          }
        });
      } catch (dbError) {
        console.error('getEmployerDetails Database Error:', dbError);
        return res.status(500).json({
          success: false,
          message: 'Database error',
          details: dbError.message
        });
      }
    }

    // For non-admin users, only allow access to their own details
    if (req.user.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to access this employer\'s details'
      });
    }

    try {
      // Fetch employer details from the database
      const [[employer]] = await pool.query(
        "SELECT * FROM users WHERE user_id = ? AND user_type = 'employer'",
        [userId]
      );
      console.log('getEmployerDetails: Employer found:', employer);
    
      if (!employer) {
        console.log('getEmployerDetails: Employer not found');
        return res.status(404).json({ 
          success: false, 
          message: 'Employer not found' 
        });
    }
    
      // Fetch employer profile details
      const [[profile]] = await pool.query(
        "SELECT * FROM employer_profiles WHERE user_id = ?",
        [userId]
      );
      console.log('getEmployerDetails: Profile found:', profile);
      
      // Fetch jobs posted by the employer
      const [jobs] = await pool.query(
        "SELECT * FROM jobs WHERE employer_id = ?",
        [userId]
      );
      console.log('getEmployerDetails: Jobs found:', jobs);
    
      // Initialize empty application stats
      let applicationStats = [];

      // Try to fetch application stats if the table exists
      try {
        const [stats] = await pool.query(
          "SELECT status, COUNT(*) as count FROM applicants WHERE job_id IN (SELECT job_id FROM jobs WHERE employer_id = ?) GROUP BY status",
          [userId]
        );
        applicationStats = stats;
        console.log('getEmployerDetails: Application stats:', applicationStats);
      } catch (statsError) {
        console.log('getEmployerDetails: Applicants table not available, using empty stats');
        // If the applicants table doesn't exist, we'll just use empty stats
      }
    
    res.json({
      success: true,
      data: {
          employer: { ...employer, ...profile },
        jobs,
        applicationStats
      }
    });
    } catch (dbError) {
      console.error('getEmployerDetails Database Error:', dbError);
      return res.status(500).json({
        success: false,
        message: 'Database error',
        details: dbError.message
      });
    }
  } catch (error) {
    console.error('getEmployerDetails Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      details: error.message 
    });
  }
};