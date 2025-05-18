const pool = require("../config/db");

const JobReport = {
  async create({ job_id, reported_by, reason }) {
    try {
      const [result] = await pool.query(
        "INSERT INTO job_reports (job_id, reported_by, reason) VALUES (?, ?, ?)",
        [job_id, reported_by, reason]
      );
      return result.insertId;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('You have already reported this job');
      }
      throw error;
    }
  },

  async getReportCountByJob(job_id) {
    const [rows] = await pool.query(
      "SELECT COUNT(DISTINCT reported_by) as report_count FROM job_reports WHERE job_id = ?",
      [job_id]
    );
    return rows[0].report_count;
  },

  async getReportCountByEmployer(employer_id) {
    const [rows] = await pool.query(
      `SELECT COUNT(DISTINCT jr.job_id) as report_count 
       FROM job_reports jr 
       JOIN jobs j ON jr.job_id = j.job_id 
       WHERE j.employer_id = ?`,
      [employer_id]
    );
    return rows[0].report_count;
  },

  async hasUserReportedJob(job_id, user_id) {
    const [rows] = await pool.query(
      "SELECT 1 FROM job_reports WHERE job_id = ? AND reported_by = ?",
      [job_id, user_id]
    );
    return rows.length > 0;
  }
};

module.exports = JobReport; 