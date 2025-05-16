const pool = require('../config/db');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT u.user_id, u.username, u.email, u.created_at, u.user_type,
        CASE 
          WHEN u.user_type = 'job_seeker' THEN jsp.full_name
          WHEN u.user_type = 'employer' THEN ep.company_name
          ELSE NULL
        END as name,
        CASE 
          WHEN u.user_type = 'job_seeker' THEN 'active'
          WHEN u.user_type = 'employer' THEN ep.isApproved
          ELSE NULL
        END as status
      FROM users u
      LEFT JOIN job_seeker_profiles jsp ON u.user_id = jsp.user_id
      LEFT JOIN employer_profiles ep ON u.user_id = ep.user_id
      WHERE u.username != 'admin'
      ORDER BY u.created_at DESC
    `);
    res.json({ success: true, data: users });
  } catch (error) {
    console.error('getAllUsers Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Toggle user suspension
exports.toggleUserSuspension = async (req, res) => {
  console.log('toggleUserSuspension called with body:', req.body);
  try {
    const { userId, suspended } = req.body;
    console.log('Updating user suspension status:', { userId, suspended });
    
    const [result] = await pool.query(`
      UPDATE users
      SET is_suspended = ?
      WHERE user_id = ?
    `, [suspended ? 1 : 0, userId]);
    
    console.log('Update result:', result);
    
    if (result.affectedRows === 0) {
      console.log('No user found with ID:', userId);
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    console.log('User suspension status updated successfully');
    res.json({ 
      success: true, 
      message: `User ${suspended ? 'suspended' : 'activated'} successfully` 
    });
  } catch (error) {
    console.error('toggleUserSuspension Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user details
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Fetch user details from the database
    const [[user]] = await pool.query(
      "SELECT * FROM users WHERE user_id = ? AND username != 'admin'",
      [userId]
    );
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Fetch profile details based on user type
    let profile = null;
    if (user.user_type === 'job_seeker') {
      const [[jobSeekerProfile]] = await pool.query(
        "SELECT * FROM job_seeker_profiles WHERE user_id = ?",
        [userId]
      );
      profile = jobSeekerProfile;
    } else if (user.user_type === 'employer') {
      const [[employerProfile]] = await pool.query(
        "SELECT * FROM employer_profiles WHERE user_id = ?",
        [userId]
      );
      profile = employerProfile;
    }
    
    res.json({
      success: true,
      data: {
        ...user,
        ...profile
      }
    });
  } catch (error) {
    console.error('getUserDetails Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error', 
      details: error.message 
    });
  }
};