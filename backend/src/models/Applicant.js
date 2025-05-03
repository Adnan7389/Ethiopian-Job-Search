const pool = require('../config/db');

const Applicant = {
  async create({ job_id, job_seeker_id, resume_url }) {
    const [result] = await pool.query(
      'INSERT INTO applicants (job_id, job_seeker_id, resume_url) VALUES (?, ?, ?)',
      [job_id, job_seeker_id, resume_url || null]
    );
    return result.insertId;
  },

  async findByJobId(job_id) {
    const [rows] = await pool.query(
      'SELECT a.*, u.username, u.email FROM applicants a JOIN users u ON a.job_seeker_id = u.user_id WHERE a.job_id = ? ORDER BY a.applied_at DESC',
      [job_id]
    );
    return rows;
  },

  async findById(applicant_id) {
    const [rows] = await pool.query(
      'SELECT * FROM applicants WHERE applicant_id = ?',
      [applicant_id]
    );
    return rows[0];
  },

  async findByJobSeekerAndJob(job_seeker_id, job_id) {
    const [rows] = await pool.query(
      'SELECT * FROM applicants WHERE job_seeker_id = ? AND job_id = ?',
      [job_seeker_id, job_id]
    );
    return rows[0];
  },

  async findByJobSeekerId(job_seeker_id) {
    const [rows] = await pool.query(
         `SELECT 
             a.*, 
             j.title  AS job_title, 
             j.company_name 
          FROM applicants a 
          JOIN jobs j ON a.job_id = j.job_id 
          WHERE a.job_seeker_id = ?
          ORDER BY a.applied_at DESC`,
         [job_seeker_id]
       );
    return rows;
  },
  
  async updateStatus(applicant_id, status) {
    const [result] = await pool.query(
      'UPDATE applicants SET status = ? WHERE applicant_id = ?',
      [status, applicant_id]
    );
    return result.affectedRows;
  },
  
  async scheduleInterview(applicant_id, { date, time, location }) {
    const [result] = await pool.query(
      `UPDATE applicants 
       SET interview_date = ?, interview_time = ?, interview_location = ?, status = 'scheduled'
       WHERE applicant_id = ?`,
      [date, time, location, applicant_id]
    );
    return result.affectedRows;
  },
  
  async update(applicant_id, updates) {
    const [result] = await pool.query(
      'UPDATE applicants SET ? WHERE applicant_id = ?',
      [updates, applicant_id]
    );
    return result.affectedRows;
  },

  async delete(applicant_id) {
    const [result] = await pool.query(
      'DELETE FROM applicants WHERE applicant_id = ?',
      [applicant_id]
    );
    return result.affectedRows;
  },

  // New: count applications per status for a given job seeker
  async summaryByJobSeeker(job_seeker_id) {
    const [rows] = await pool.query(
      `SELECT 
          status AS status, 
          COUNT(*) AS count
       FROM applicants
       WHERE job_seeker_id = ?
       GROUP BY status`,
      [job_seeker_id]
    );
    return rows;
  }
};

module.exports = Applicant;