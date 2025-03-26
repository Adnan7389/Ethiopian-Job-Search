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
      description
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
  const { category, job_title, location, company_name, job_type, salary_min, salary_max } = req.query;

  const filters = {
    category,
    job_title,
    location,
    company_name,
    job_type,
    salary_min: salary_min ? parseFloat(salary_min) : null,
    salary_max: salary_max ? parseFloat(salary_max) : null
  };

  try {
    const jobs = await Job.search(filters);
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search jobs', details: error.message });
  }
};

module.exports = { createJob, getJobs, searchJobs };