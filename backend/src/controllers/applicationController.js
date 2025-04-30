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

const updateApplicationStatus = async (req, res) => {
  const { id } = req.params; // applicant_id
  const { status } = req.body;

  try {
    const validStatuses = ['pending', 'shortlisted', 'rejected', 'interviewed', 'accepted'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const affectedRows = await Applicant.updateStatus(id, status);
    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Schedule interview
const scheduleInterview = async (req, res) => {
  const { id } = req.params; // applicant_id
  const { date, time, location } = req.body;

  try {
    if (!date || !time || !location) {
      return res.status(400).json({ message: 'Missing interview details' });
    }

    const affectedRows = await Applicant.scheduleInterview(id, { date, time, location });
    if (affectedRows === 0) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    res.json({ message: 'Interview scheduled successfully' });
  } catch (error) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMyApplications, scheduleInterview, updateApplicationStatus};
