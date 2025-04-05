const pool = require("../config/db");

class Job {
  async create(data) {
    const {
      employer_id,
      title,
      description,
      location,
      salary,
      job_type,
      industry,
      experience_level,
      expires_at,
      status,
    } = data;

    // Generate slug
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const [existing] = await pool.query("SELECT job_id FROM jobs WHERE slug = ?", [slug]);
      if (existing.length === 0) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const [result] = await pool.query(
      `INSERT INTO jobs (
        employer_id, title, slug, description, location, salary, job_type, industry,
        experience_level, expires_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employer_id,
        title,
        slug,
        description,
        location || null,
        salary || null,
        job_type || "full-time",
        industry || "Other",
        experience_level || "entry-level",
        expires_at || null,
        status || "open",
      ]
    );
    return this.findById(result.insertId);
  }

  async findById(jobId) {
    const [rows] = await pool.query("SELECT * FROM jobs WHERE job_id = ?", [jobId]);
    return rows[0];
  }

  async findBySlug(slug) {
    const [rows] = await pool.query("SELECT * FROM jobs WHERE slug = ? AND (expires_at IS NULL OR expires_at > NOW())", [slug]);
    return rows[0];
  }

  // New method to fetch all available jobs for job seekers
  async findAll({ page, limit, search, job_type, industry, experience_level, status, date_posted, includeArchived }) {
    let query = "SELECT * FROM jobs WHERE is_archived = 0 AND status = ? AND (expires_at IS NULL OR expires_at > NOW())";
    let countQuery = "SELECT COUNT(*) as total FROM jobs WHERE is_archived = 0 AND status = ? AND (expires_at IS NULL OR expires_at > NOW())";
    const params = [status || "open"];
    const countParams = [status || "open"];

    if (search) {
      query += " AND (title LIKE ? OR description LIKE ?)";
      countQuery += " AND (title LIKE ? OR description LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm);
    }

    if (job_type) {
      query += " AND job_type = ?";
      countQuery += " AND job_type = ?";
      params.push(job_type);
      countParams.push(job_type);
    }
    if (industry) {
      query += " AND industry = ?";
      countQuery += " AND industry = ?";
      params.push(industry);
      countParams.push(industry);
    }
    if (experience_level) {
      query += " AND experience_level = ?";
      countQuery += " AND experience_level = ?";
      params.push(experience_level);
      countParams.push(experience_level);
    }
    if (date_posted) {
      let dateFilter;
      if (date_posted === "last_24_hours") dateFilter = "DATE_SUB(NOW(), INTERVAL 1 DAY)";
      else if (date_posted === "last_7_days") dateFilter = "DATE_SUB(NOW(), INTERVAL 7 DAY)";
      else if (date_posted === "last_30_days") dateFilter = "DATE_SUB(NOW(), INTERVAL 30 DAY)";
      if (dateFilter) {
        query += ` AND created_at >= ${dateFilter}`;
        countQuery += ` AND created_at >= ${dateFilter}`;
      }
    }

    const offset = (page - 1) * limit;
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [jobs] = await pool.query(query, params);
    const [[{ total }]] = await pool.query(countQuery, countParams);
    return { jobs, total };
  }

  async findByEmployer(employerId, { page, limit, search, job_type, industry, experience_level, status, date_posted, includeArchived }) {
    let query = "SELECT * FROM jobs WHERE employer_id = ? AND is_archived = ?";
    let countQuery = "SELECT COUNT(*) as total FROM jobs WHERE employer_id = ? AND is_archived = ?";
    const params = [employerId, includeArchived ? 1 : 0];
    const countParams = [employerId, includeArchived ? 1 : 0];

    // Filter out expired jobs
    query += " AND (expires_at IS NULL OR expires_at > NOW())";
    countQuery += " AND (expires_at IS NULL OR expires_at > NOW())";

    if (search) {
      query += " AND (title LIKE ? OR description LIKE ?)";
      countQuery += " AND (title LIKE ? OR description LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm);
    }

    if (job_type) {
      query += " AND job_type = ?";
      countQuery += " AND job_type = ?";
      params.push(job_type);
      countParams.push(job_type);
    }
    if (industry) {
      query += " AND industry = ?";
      countQuery += " AND industry = ?";
      params.push(industry);
      countParams.push(industry);
    }
    if (experience_level) {
      query += " AND experience_level = ?";
      countQuery += " AND experience_level = ?";
      params.push(experience_level);
      countParams.push(experience_level);
    }
    if (status) {
      query += " AND status = ?";
      countQuery += " AND status = ?";
      params.push(status);
      countParams.push(status);
    }
    if (date_posted) {
      let dateFilter;
      if (date_posted === "last_24_hours") dateFilter = "DATE_SUB(NOW(), INTERVAL 1 DAY)";
      else if (date_posted === "last_7_days") dateFilter = "DATE_SUB(NOW(), INTERVAL 7 DAY)";
      else if (date_posted === "last_30_days") dateFilter = "DATE_SUB(NOW(), INTERVAL 30 DAY)";
      if (dateFilter) {
        query += ` AND created_at >= ${dateFilter}`;
        countQuery += ` AND created_at >= ${dateFilter}`;
      }
    }

    const offset = (page - 1) * limit;
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [jobs] = await pool.query(query, params);
    const [[{ total }]] = await pool.query(countQuery, countParams);
    return { jobs, total };
  }

  async update(slug, data) {
    const {
      title,
      description,
      location,
      salary,
      job_type,
      industry,
      experience_level,
      expires_at,
      status,
    } = data;

    // Update slug if title changes
    let newSlug = undefined;
    if (title) {
      const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      let slug = baseSlug;
      let counter = 1;
      while (true) {
        const [existing] = await pool.query(
          "SELECT job_id FROM jobs WHERE slug = ? AND slug != ?",
          [slug, slug]
        );
        if (existing.length === 0) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      newSlug = slug;
    }

    const [result] = await pool.query(
      `UPDATE jobs SET
        title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        location = ?,
        salary = ?,
        job_type = COALESCE(?, job_type),
        industry = COALESCE(?, industry),
        experience_level = COALESCE(?, experience_level),
        expires_at = ?,
        status = COALESCE(?, status)
      WHERE slug = ?`,
      [
        title || null,
        newSlug || null,
        description || null,
        location || null,
        salary || null,
        job_type || null,
        industry || null,
        experience_level || null,
        expires_at || null,
        status || null,
        slug,
      ]
    );

    if (result.affectedRows === 0) {
      throw new Error("Job not found");
    }
    return this.findBySlug(newSlug || slug);
  }

  async archive(jobId) {
    const [result] = await pool.query(
      "UPDATE jobs SET is_archived = 1 WHERE job_id = ?",
      [jobId]
    );
    if (result.affectedRows === 0) {
      throw new Error("Job not found");
    }
  }

  async restore(jobId) {
    const [result] = await pool.query(
      "UPDATE jobs SET is_archived = 0 WHERE job_id = ?",
      [jobId]
    );
    if (result.affectedRows === 0) {
      throw new Error("Job not found");
    }
  }

  async duplicate(jobId) {
    const job = await this.findById(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    const { employer_id, title, description, location, salary, job_type, industry, experience_level } = job;
    const newTitle = `${title} (Copy)`;
    const newJobData = {
      employer_id,
      title: newTitle,
      description,
      location,
      salary,
      job_type,
      industry,
      experience_level,
      status: "open",
    };
    return this.create(newJobData);
  }
}

module.exports = new Job();