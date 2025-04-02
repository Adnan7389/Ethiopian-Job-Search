const pool = require('../config/db.js');

const Job = {
  async create(job) {
    const { job_title, employer_id, job_type, category, location, company_name, salary_min, salary_max, description } = job;
    const [result] = await pool.query(
      'INSERT INTO jobs (job_title, employer_id, job_type, category, location, company_name, salary_min, salary_max, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [job_title, employer_id, job_type, category, location, company_name, salary_min, salary_max, description]
    );
    return result.insertId;
  },

  async findAll() {
    const [jobs] = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
    return jobs;
  },

  async search(filters) {
    const { category, job_title, location, job_type } = filters;
    let query = 'SELECT * FROM jobs WHERE 1=1';
    const values = [];

    if (category) {
      query += ' AND category = ?';
      values.push(category);
    }
    if (job_title) {
      query += ' AND job_title LIKE ?';
      values.push(`%${job_title}%`);
    }
    if (location) {
      query += ' AND location LIKE ?';
      values.push(`%${location}%`);
    }
    if (job_type) {
      query += ' AND job_type = ?';
      values.push(job_type);
    }

    query += ' ORDER BY created_at DESC';
    const [jobs] = await pool.query(query, values);
    return jobs;
  },

  async update(jobId, employerId, updates) {
    const { job_title, job_type, category, location, company_name, salary_min, salary_max, description } = updates;
    const [result] = await pool.query(
      'UPDATE jobs SET job_title = ?, job_type = ?, category = ?, location = ?, company_name = ?, salary_min = ?, salary_max = ?, description = ? WHERE job_id = ? AND employer_id = ?',
      [job_title, job_type, category, location, company_name, salary_min, salary_max, description, jobId, employerId]
    );
    return result.affectedRows;
  },

  async delete(jobId, employerId) {
    const [result] = await pool.query('DELETE FROM jobs WHERE job_id = ? AND employer_id = ?', [jobId, employerId]);
    return result.affectedRows;
  },
};

module.exports = Job;