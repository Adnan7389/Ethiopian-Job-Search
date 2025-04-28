const Applicant = require('../models/Applicant'); // Use your Applicant model!

const getMyApplications = async (req, res) => {
  try {
    const jobSeekerId = req.user.user_id; // Get logged-in user's ID

    // Fetch all applications by job seeker using the model
    const applications = await Applicant.findByJobSeekerId(jobSeekerId);

    res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching my applications:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = getMyApplications;
