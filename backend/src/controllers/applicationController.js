const Applicant = require('../models/Applicant'); // Use your Applicant model!

const getMyApplications = async (req, res) => {
  try {
    
    const jobSeekerId = req.user.userId;

    const applications = await Applicant.findByJobSeekerId(jobSeekerId);

    return res.status(200).json(applications);
  } catch (error) {
    console.error('Error fetching my applications:', error);
    return res.status(500).json({ message: 'Server Error' });
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
const getApplicationsSummary = async (req, res) => {
  try {
    const userId = req.user.userId; // from authMiddleware
    const rows = await Applicant.summaryByJobSeeker(userId);

    console.log('📊 Raw summary rows from DB:', rows); 
    // initialize all statuses to zero
    const summary = {
      total: 0,
      pending: 0,
      shortlisted: 0,
      scheduled: 0,
      interviewed: 0,
      accepted: 0,
      rejected: 0
    };

    // normalize and accumulate counts
    rows.forEach(({ status, count }) => {
      const key = status?.toLowerCase(); // Normalize
      if (key in summary) {
        summary[key] = count;
        summary.total += count;
      }
    });

    console.log('✅ Final summary object:', summary); 
    res.json(summary);
  } catch (error) {
    console.error('Error fetching applications summary:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMyApplications, scheduleInterview, updateApplicationStatus, getApplicationsSummary};
