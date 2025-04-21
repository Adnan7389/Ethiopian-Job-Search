const Applicant = require('../models/Applicant');
const Job = require('../models/jobModel');

const applyForJob = async (req, res) => {
  const { job_id, resume_url } = req.body;
  const job_seeker_id = req.user.userId; // From JWT

  if (req.user.user_type !== 'job_seeker') {
    return res.status(403).json({ error: 'Only job seekers can apply for jobs' });
  }

  try {
    // Check if job exists
    const job = await Job.findById(job_id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Applicant.findByJobSeekerAndJob(job_seeker_id, job_id);
    if (existingApplication) {
      return res.status(400).json({ error: 'You have already applied for this job' });
    }

    const applicantId = await Applicant.create({ job_id, job_seeker_id, resume_url });
    res.status(201).json({ message: 'Application submitted', applicant_id: applicantId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to apply for job', details: error.message });
  }
};

const getApplicationsByJobId = async (req, res) => {
  try {
    const { jobId } = req.params;
    console.log(`applicantController.getApplicationsByJobId: Fetching job ${jobId} for user ${req.user.userId}`);

    // Verify that the job exists and belongs to the authenticated employer
    const job = await Job.findById(jobId);
    if (!job) {
      console.log(`applicantController.getApplicationsByJobId: Job ${jobId} not found`);
      return res.status(404).json({ message: "Job not found" });
    }
    if (job.employer_id !== req.user.userId) {
      console.log(`applicantController.getApplicationsByJobId: Job ${jobId} does not belong to employer ${req.user.userId}`);
      return res.status(403).json({ message: "Job not found or you do not have permission to view its applicants" });
    }

    const applications = await Applicant.findByJobId(jobId);
    console.log(`applicantController.getApplicationsByJobId: Found ${applications.length} applications for job ${jobId}`);
    res.status(200).json(applications);
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateApplication = async (req, res) => {
  const { applicant_id } = req.params;
  const { resume_url } = req.body; // Only allow updating resume_url for now

  if (req.user.user_type !== 'job_seeker') {
    return res.status(403).json({ error: 'Only job seekers can update their applications' });
  }

  try {
    const application = await Applicant.findById(applicant_id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    if (application.job_seeker_id !== req.user.userId) {
      return res.status(403).json({ error: 'You are not authorized to update this application' });
    }
    if (application.status !== 'applied') {
      return res.status(400).json({ error: 'Cannot update application after approval/review' });
    }

    const updates = { resume_url: resume_url || application.resume_url };
    const affectedRows = await Applicant.update(applicant_id, updates);
    if (affectedRows === 0) {
      return res.status(400).json({ error: 'No changes made' });
    }
    res.json({ message: 'Application updated' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update application', details: error.message });
  }
};

const deleteApplication = async (req, res) => {
  const { applicant_id } = req.params;

  if (req.user.user_type !== 'job_seeker') {
    return res.status(403).json({ error: 'Only job seekers can delete their applications' });
  }

  try {
    const application = await Applicant.findById(applicant_id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    if (application.job_seeker_id !== req.user.userId) {
      return res.status(403).json({ error: 'You are not authorized to delete this application' });
    }

    const affectedRows = await Applicant.delete(applicant_id);
    if (affectedRows === 0) {
      return res.status(400).json({ error: 'Failed to delete application' });
    }
    res.json({ message: 'Application withdrawn' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete application', details: error.message });
  }
};

module.exports = { applyForJob, getApplicationsByJobId, updateApplication, deleteApplication };