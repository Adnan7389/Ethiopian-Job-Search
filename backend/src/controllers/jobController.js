const Job = require("../models/jobModel");
const User = require("../models/userModel");

const createJob = async (req, res) => {
  const { title, description, location, salary, job_type, industry, experience_level, expires_at, status } = req.body;
  const employerId = req.user.userId;

  if (req.user.user_type !== "employer") {
    return res.status(403).json({ error: "Only employers can create jobs" });
  }

  try {
    const jobData = {
      employer_id: employerId,
      title,
      description,
      location,
      salary,
      job_type,
      industry,
      experience_level,
      expires_at: expires_at ? new Date(expires_at) : null,
      status,
    };
    const jobId = await Job.create(jobData);
    res.status(201).json({ message: "Job created successfully", jobId });
  } catch (error) {
    res.status(500).json({ error: "Failed to create job", details: error.message });
  }
};

// New method for job seekers to fetch available jobs
const getJobs = async (req, res) => {
  const { page = 1, limit = 10, search, job_type, industry, experience_level, status, date_posted, includeArchived = "false" } = req.query;

  try {
    const { jobs, total } = await Job.findAll({
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      job_type,
      industry,
      experience_level,
      status: status || "open", // Default to open jobs
      date_posted,
      includeArchived: includeArchived === "true",
    });
    res.json({
      jobs,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs", details: error.message });
  }
};

const getEmployerJobs = async (req, res) => {
  const employerId = req.user.userId;
  const { page = 1, limit = 10, search, job_type, industry, experience_level, status, date_posted, includeArchived = "false" } = req.query;

  if (req.user.user_type !== "employer") {
    return res.status(403).json({ error: "Only employers can view their jobs" });
  }

  try {
    const { jobs, total } = await Job.findByEmployer(employerId, {
      page: parseInt(page),
      limit: parseInt(limit),
      search,
      job_type,
      industry,
      experience_level,
      status,
      date_posted,
      includeArchived: includeArchived === "true",
    });
    res.json({
      jobs,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch jobs", details: error.message });
  }
};

const getJobBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const job = await Job.findBySlug(slug);
    if (!job || job.is_archived) {
      return res.status(404).json({ error: "Job not found" });
    }
    if (job.status !== "open" || (job.expires_at && new Date(job.expires_at) < new Date())) {
      return res.status(403).json({ error: "Job is not available" });
    }
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch job", details: error.message });
  }
};

const updateJob = async (req, res) => {
  const { slug } = req.params;
  const { title, description, location, salary, job_type, industry, experience_level, expires_at, status } = req.body;
  const employerId = req.user.userId;

  if (req.user.user_type !== "employer") {
    return res.status(403).json({ error: "Only employers can update jobs" });
  }

  try {
    const job = await Job.findBySlug(slug);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    if (job.employer_id !== employerId) {
      return res.status(403).json({ error: "You can only update your own jobs" });
    }

    const updates = {
      title: title || job.title,
      description: description || job.description,
      location: location || job.location,
      salary: salary !== undefined ? salary : job.salary,
      job_type: job_type || job.job_type,
      industry: industry || job.industry,
      experience_level: experience_level || job.experience_level,
      expires_at: expires_at ? new Date(expires_at) : job.expires_at,
      status: status || job.status,
    };
    await Job.update(slug, updates);
    res.json({ message: "Job updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update job", details: error.message });
  }
};

const archiveJob = async (req, res) => {
  const { jobId } = req.params;
  const employerId = req.user.userId;

  if (req.user.user_type !== "employer") {
    return res.status(403).json({ error: "Only employers can delete jobs" });
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    if (job.employer_id !== employerId) {
      return res.status(403).json({ error: "You can only delete your own jobs" });
    }
    await Job.archive(jobId);
    res.json({ message: "Job archived successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete job", details: error.message });
  }
};

const restoreJob = async (req, res) => {
  const { jobId } = req.params;
  const employerId = req.user.userId;

  if (req.user.user_type !== "employer") {
    return res.status(403).json({ error: "Only employers can restore jobs" });
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    if (job.employer_id !== employerId) {
      return res.status(403).json({ error: "You can only restore your own jobs" });
    }
    if (!job.is_archived) {
      return res.status(400).json({ error: "Job is not archived" });
    }
    await Job.restore(jobId);
    res.json({ message: "Job restored successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to restore job", details: error.message });
  }
};

const duplicateJob = async (req, res) => {
  const { jobId } = req.params;
  const employerId = req.user.userId;

  if (req.user.user_type !== "employer") {
    return res.status(403).json({ error: "Only employers can duplicate jobs" });
  }

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    if (job.employer_id !== employerId) {
      return res.status(403).json({ error: "You can only duplicate your own jobs" });
    }
    const newJobId = await Job.duplicate(jobId);
    if (!newJobId) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json({ message: "Job duplicated successfully", newJobId });
  } catch (error) {
    res.status(500).json({ error: "Failed to duplicate job", details: error.message });
  }
};

module.exports = { createJob, getJobs, getEmployerJobs, getJobBySlug, updateJob, archiveJob, restoreJob, duplicateJob };