const pool = require('../config/db');

const Job = {
  async create({ job_title, employer_id, job_type, category, location, company_name, salary_min, salary_max, description }) {
    const [result] = await pool.query(
      'INSERT INTO jobs (job_title, employer_id, job_type, category, location, company_name, salary_min, salary_max, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [job_title, employer_id, job_type, category, location, company_name, salary_min || null, salary_max || null, description]
    );
    return result.insertId;
  },

  async findAll() {
    const [rows] = await pool.query('SELECT * FROM jobs ORDER BY created_at DESC');
    return rows;
  },

  async findById(job_id) {
    const [rows] = await pool.query('SELECT * FROM jobs WHERE job_id = ?', [job_id]);
    return rows[0];
  },

  async update(job_id, updates) {
    const [result] = await pool.query('UPDATE jobs SET ? WHERE job_id = ?', [updates, job_id]);
    return result.affectedRows;
  },

  async delete(job_id) {
    const [result] = await pool.query('DELETE FROM jobs WHERE job_id = ?', [job_id]);
    return result.affectedRows;
  },

  async search(filters) {
    let query = 'SELECT * FROM jobs WHERE 1=1'; // Base query
    const params = [];

    if (filters.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }
    if (filters.job_title) {
      query += ' AND job_title LIKE ?';
      params.push(`%${filters.job_title}%`);
    }
    if (filters.location) {
      query += ' AND location LIKE ?';
      params.push(`%${filters.location}%`);
    }
    if (filters.company_name) {
      query += ' AND company_name LIKE ?';
      params.push(`%${filters.company_name}%`);
    }
    if (filters.job_type) {
      query += ' AND job_type = ?';
      params.push(filters.job_type);
    }
    if (filters.salary_min) {
      query += ' AND (salary_max >= ? OR salary_max IS NULL)';
      params.push(filters.salary_min);
    }
    if (filters.salary_max) {
      query += ' AND (salary_min <= ? OR salary_min IS NULL)';
      params.push(filters.salary_max);
    }

    query += ' ORDER BY created_at DESC'; // Latest jobs first

    const [rows] = await pool.query(query, params);
    return rows;
  }
};

module.exports = Job;