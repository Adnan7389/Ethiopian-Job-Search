const Job = require("../models/jobModel");
const User = require("../models/userModel");
const pool = require("../config/db"); 
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

const getJobsByEmployer = async (req, res) => {
  try {
    if (req.user.user_type !== "employer") {
      return res.status(403).json({ message: "Only employers can view their jobs" });
    }
    const { page = 1, limit = 10, search, job_type, industry, experience_level, status, date_posted, includeArchived } = req.query;

    let query = "SELECT * FROM jobs WHERE employer_id = ?";
    let countQuery = "SELECT COUNT(*) as total FROM jobs WHERE employer_id = ?";
    const queryParams = [req.user.userId];
    const countParams = [req.user.userId];

    if (search) {
      query += " AND (title LIKE ? OR description LIKE ?)";
      countQuery += " AND (title LIKE ? OR description LIKE ?)";
      const searchParam = `%${search}%`;
      queryParams.push(searchParam, searchParam);
      countParams.push(searchParam, searchParam);
    }

    if (job_type) {
      query += " AND job_type = ?";
      countQuery += " AND job_type = ?";
      queryParams.push(job_type);
      countParams.push(job_type);
    }

    if (industry) {
      query += " AND industry = ?";
      countQuery += " AND industry = ?";
      queryParams.push(industry);
      countParams.push(industry);
    }

    if (experience_level) {
      query += " AND experience_level = ?";
      countQuery += " AND experience_level = ?";
      queryParams.push(experience_level);
      countParams.push(experience_level);
    }

    if (status) {
      query += " AND status = ?";
      countQuery += " AND status = ?";
      queryParams.push(status);
      countParams.push(status);
    }

    if (date_posted) {
      let dateCondition;
      if (date_posted === "last_24_hours") {
        dateCondition = "created_at >= NOW() - INTERVAL 1 DAY";
      } else if (date_posted === "last_7_days") {
        dateCondition = "created_at >= NOW() - INTERVAL 7 DAY";
      } else if (date_posted === "last_30_days") {
        dateCondition = "created_at >= NOW() - INTERVAL 30 DAY";
      }
      if (dateCondition) {
        query += ` AND ${dateCondition}`;
        countQuery += ` AND ${dateCondition}`;
      }
    }

    if (!includeArchived) {
      query += " AND is_archived = 0";
      countQuery += " AND is_archived = 0";
    }

    query += " LIMIT ? OFFSET ?";
    queryParams.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const [jobs] = await pool.query(query, queryParams);
    const [[{ total }]] = await pool.query(countQuery, countParams);

    res.status(200).json({
      jobs,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    console.error("Get jobs by employer error:", error);
    res.status(500).json({ message: "Server error" });
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

    console.log("Entering applyForJob for slug:", slug);
    console.log("req.user at start of applyForJob:", req.user);

    // Validate user type
    if (!req.user || !req.user.user_type) {
      console.log("Missing user or user_type in req.user");
      return res.status(401).json({ message: "User authentication failed: missing user type" });
    }

    if (req.user.user_type !== "job_seeker") {
      console.log("User type is not job_seeker:", req.user.user_type);
      return res.status(403).json({ message: "Only job seekers can apply for jobs" });
    }

    // Validate userId
    if (!req.user.userId) {
      console.log("User ID is missing from req.user:", req.user);
      return res.status(400).json({ message: "User ID is missing from token" });
    }

    console.log("Applying for job with userId:", req.user.userId);

    const [jobs] = await pool.query(
      "SELECT * FROM jobs WHERE slug = ? AND status = 'open'",
      [slug]
    );
    const job = jobs[0];
    if (!job) {
      console.log("Job not found or closed for slug:", slug);
      return res.status(404).json({ message: "Job not found or closed" });
    }

    console.log("Found job:", job);

    const existingApplication = await Applicant.findByJobSeekerAndJob(req.user.userId, job.job_id);
    if (existingApplication) {
      console.log("User has already applied for job:", job.job_id);
      return res.status(400).json({ message: "You have already applied for this job" });
    }

    console.log("Creating new application for job_id:", job.job_id, "with job_seeker_id:", req.user.userId);

    const applicantId = await Applicant.create({
      job_id: job.job_id,
      job_seeker_id: req.user.userId,
      resume_url: req.body.resume_url || null,
    });

    console.log("Application created with applicantId:", applicantId);

    await Notification.create({
      user_id: job.employer_id,
      message: `New application for ${job.title} from user ${req.user.userId}`,
    });

    console.log("Notification created for employer:", job.employer_id);

    res.status(201).json({ message: "Application submitted successfully", applicantId });
  } catch (error) {
    console.error("Apply for job error:", error);
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

module.exports = { createJob, getJobs, getJobsByEmployer, getJobBySlug, updateJob, archiveJob, restoreJob, duplicateJob, applyForJob, getApplicationsByJobId };