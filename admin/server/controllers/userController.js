const pool = require('../config/db');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    // Use a JOIN to include suspension status
    const [users] = await pool.query(`
      SELECT user_id, username, email, user_type, created_at, is_verified
      FROM users
      ORDER BY created_at DESC
    `);
    
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle user suspension
exports.toggleUserSuspension = async (req, res) => {
  try {
    const { userId, suspended } = req.body;
    
    // Note: You'll need to add is_suspended column to users table
    await pool.query(`
      UPDATE users
      SET is_suspended = ?
      WHERE user_id = ?
    `, [suspended ? 1 : 0, userId]);
    
    res.json({ 
      success: true, 
      message: `User ${suspended ? 'suspended' : 'unsuspended'} successfully` 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user details
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user basic info
    const [userInfo] = await pool.query(`
      SELECT user_id, username, email, user_type, created_at, is_verified
      FROM users
      WHERE user_id = ?
    `, [userId]);
    
    if (!userInfo.length) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    let profileData = {};
    
    // Get profile details based on user type
    if (userInfo[0].user_type === 'job_seeker') {
      const [profile] = await pool.query(`
        SELECT full_name, bio, skills, education, experience, location, profile_picture_url
        FROM job_seeker_profiles
        WHERE user_id = ?
      `, [userId]);
      
      if (profile.length) {
        profileData = profile[0];
        
        // Parse JSON fields
        if (profileData.skills) profileData.skills = JSON.parse(profileData.skills);
        if (profileData.education) profileData.education = JSON.parse(profileData.education);
        if (profileData.experience) profileData.experience = JSON.parse(profileData.experience);
      }
      
      // Get applications
      const [applications] = await pool.query(`
        SELECT a.applicant_id, a.job_id, a.applied_at, a.status,
          j.title as job_title, j.job_type
        FROM applicants a
        JOIN jobs j ON a.job_id = j.job_id
        WHERE a.job_seeker_id = ?
        ORDER BY a.applied_at DESC
      `, [userId]);
      
      profileData.applications = applications;
    } else if (userInfo[0].user_type === 'employer') {
      const [profile] = await pool.query(`
        SELECT company_name, industry, website, description, contact_email, location
        FROM employer_profiles
        WHERE user_id = ?
      `, [userId]);
      
      if (profile.length) {
        profileData = profile[0];
      }
      
      // Get job postings
      const [jobs] = await pool.query(`
        SELECT job_id, title, job_type, industry, status, created_at
        FROM jobs
        WHERE employer_id = ?
        ORDER BY created_at DESC
      `, [userId]);
      
      profileData.jobs = jobs;
    }
    
    res.json({
      success: true,
      data: {
        user: userInfo[0],
        profile: profileData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};