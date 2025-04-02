const Job = require('../models/jobModel');

const createJob = async (req, res) => {
  const { job_title, job_type, category, location, company_name, salary_min, salary_max, description } = req.body;
  const employer_id = req.user.userId; // From JWT middleware

  if (!['full_time', 'part_time', 'contract'].includes(job_type)) {
    return res.status(400).json({ error: 'Invalid job type' });
  }
  if (!['IT', 'Healthcare', 'Engineering', 'Finance', 'Education', 'Other'].includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    const jobId = await Job.create({
      job_title,
      employer_id,
      job_type,
      category,
      location,
      company_name,
      salary_min,
      salary_max,
      description,
    });
    res.status(201).json({ message: 'Job created', job_id: jobId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create job', details: error.message });
  }
};

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.findAll();
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch jobs', details: error.message });
  }
};

const searchJobs = async (req, res) => {
  const { category, job_title, location, job_type } = req.query;

  const filters = {
    category,
    job_title,
    location,
    job_type,
  };

  try {
    const jobs = await Job.search(filters);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search jobs', details: error.message });
  }
};

const updateJob = async (req, res) => {
  const { jobId } = req.params;
  const { job_title, job_type, category, location, company_name, salary_min, salary_max, description } = req.body;
  const employer_id = req.user.userId;

  if (req.user.user_type !== 'employer') {
    return res.status(403).json({ error: 'Only employers can update jobs' });
  }

  if (!['full_time', 'part_time', 'contract'].includes(job_type)) {
    return res.status(400).json({ error: 'Invalid job type' });
  }
  if (!['IT', 'Healthcare', 'Engineering', 'Finance', 'Education', 'Other'].includes(category)) {
    return res.status(400).json({ error: 'Invalid category' });
  }

  try {
    const affectedRows = await Job.update(jobId, employer_id, {
      job_title,
      job_type,
      category,
      location,
      company_name,
      salary_min,
      salary_max,
      description,
    });
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Job not found or not authorized' });
    }
    res.json({ message: 'Job updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update job', details: error.message });
  }
};

const deleteJob = async (req, res) => {
  const { jobId } = req.params;
  const employer_id = req.user.userId;

  if (req.user.user_type !== 'employer') {
    return res.status(403).json({ error: 'Only employers can delete jobs' });
  }

  try {
    const affectedRows = await Job.delete(jobId, employer_id);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Job not found or not authorized' });
    }
    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete job', details: error.message });
  }
};

module.exports = { createJob, getJobs, searchJobs, updateJob, deleteJob };