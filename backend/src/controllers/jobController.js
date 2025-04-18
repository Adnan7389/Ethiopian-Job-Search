const Job = require("../models/jobModel");
const User = require("../models/userModel");
const Applicant = require("../models/Applicant");
const Notification = require("../models/Notification");

const createJob = async (req, res) => {
  const { title, description, location, salary_range, job_type, industry, experience_level, application_deadline, status } = req.body;
  const employerId = req.user.userId;

  console.log("Received createJob request:", { employerId, ...req.body });

  if (req.user.user_type !== "employer") {
    console.log("Authorization failed: User is not an employer");
    return res.status(403).json({ error: "Only employers can create jobs" });
  }

  // Validate required fields
  if (!title || !description || !location || !job_type || !industry || !experience_level || !status) {
    console.log("Validation failed: Missing required fields");
    return res.status(400).json({ error: "All required fields must be provided" });
  }

  try {
    const jobData = {
      employer_id: employerId,
      title,
      description,
      location,
      salary_range,
      job_type,
      industry,
      experience_level,
      expires_at: application_deadline ? new Date(application_deadline) : null,
      status,
      is_archived: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    console.log("Creating job with data:", jobData);
    const job = await Job.create(jobData);
    console.log("Job created successfully:", { jobId: job.job_id, slug: job.slug });
    res.status(201).json({ message: "Job created successfully", jobId: job.job_id, slug: job.slug });
  } catch (error) {
    console.error("Error creating job:", error.message);
    res.status(500).json({ error: "Failed to create job", details: error.message });
  }
};

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
      status: status || "open",
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
  try {
    const { slug } = req.params;
    const job = await Job.findBySlug(slug);
    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }
    res.status(200).json(job);
  } catch (error) {
    console.error("Get job error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const applyForJob = async (req, res) => {
  try {
    const { slug } = req.params;
    const job = await Job.findBySlug(slug);
    if (!job || job.status !== "open") {
      return res.status(404).json({ message: "Job not found or closed" });
    }
    if (job.expires_at && new Date(job.expires_at) < new Date()) {
      return res.status(400).json({ message: "Application deadline passed" });
    }
    if (!req.user || req.user.user_type !== "job_seeker") {
      return res.status(403).json({ message: "Only job seekers can apply" });
    }
    const existingApplication = await Applicant.findByJobSeekerAndJob(req.user.id, job.job_id);
    if (existingApplication) {
      return res.status(400).json({ message: "You have already applied for this job" });
    }
    const applicantId = await Applicant.create({
      job_id: job.job_id,
      job_seeker_id: req.user.id,
      resume_url: req.user.resume_url || null,
    });
    await Notification.create({
      user_id: job.employer_id,
      message: `New application for ${job.title} from ${req.user.username}`,
    });
    res.status(201).json({ message: "Application submitted", applicantId });
  } catch (error) {
    console.error("Apply error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const getApplicationsByJobId = async (req, res) => {
  try {
    if (!req.user || req.user.user_type !== "employer") {
      return res.status(403).json({ message: "Only employers can view applications" });
    }
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job || job.employer_id !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to view applications for this job" });
    }
    const applications = await Applicant.findByJobId(jobId);
    res.status(200).json(applications);
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
const updateJob = async (req, res) => {
  const { slug } = req.params;
  const { title, description, location, salary_range, job_type, industry, experience_level, application_deadline, status } = req.body;
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
      salary_range: salary_range !== undefined ? salary_range : job.salary_range,
      job_type: job_type || job.job_type,
      industry: industry || job.industry,
      experience_level: experience_level || job.experience_level,
      expires_at: application_deadline ? new Date(application_deadline) : job.expires_at,
      status: status || job.status,
    };
    const updatedJob = await Job.update(slug, updates);
    res.json({ message: "Job updated successfully", slug: updatedJob.slug });
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
    const newJob = await Job.duplicate(jobId);
    if (!newJob) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json({ message: "Job duplicated successfully", newJobId: newJob.job_id, slug: newJob.slug });
  } catch (error) {
    res.status(500).json({ error: "Failed to duplicate job", details: error.message });
  }
};

module.exports = { createJob, getJobs, getEmployerJobs, getJobBySlug, updateJob, archiveJob, restoreJob, duplicateJob, applyForJob, getApplicationsByJobId };