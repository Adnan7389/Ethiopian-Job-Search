const pool = require("../config/db");
const JobReport = require("../models/jobReportModel");
const Notification = require("../models/Notification");

const JOB_REPORT_THRESHOLD = 5;
const EMPLOYER_REPORT_THRESHOLD = 10;

const handleReportActions = async (job_id) => {
  try {
    // Get job details to find employer_id
    const [[job]] = await pool.query(
      "SELECT employer_id FROM jobs WHERE job_id = ?",
      [job_id]
    );

    if (!job) {
      throw new Error("Job not found");
    }

    // Check job report count
    const jobReportCount = await JobReport.getReportCountByJob(job_id);
    if (jobReportCount >= JOB_REPORT_THRESHOLD) {
      // Archive the job
      await pool.query(
        "UPDATE jobs SET is_archived = 1 WHERE job_id = ?",
        [job_id]
      );

      // Notify employer
      await Notification.create({
        user_id: job.employer_id,
        message: `Your job posting has been archived due to receiving ${jobReportCount} reports.`,
        is_read: false
      });
    }

    // Check employer report count
    const employerReportCount = await JobReport.getReportCountByEmployer(job.employer_id);
    if (employerReportCount >= EMPLOYER_REPORT_THRESHOLD) {
      // Suspend employer account
      await pool.query(
        "UPDATE users SET is_suspended = 1 WHERE user_id = ?",
        [job.employer_id]
      );

      // Notify employer
      await Notification.create({
        user_id: job.employer_id,
        message: "Your account has been suspended due to multiple reported job postings.",
        is_read: false
      });
    }
  } catch (error) {
    console.error("Error handling report actions:", error);
    throw error;
  }
};

module.exports = {
  handleReportActions
}; 