const pool = require("../config/db");

class Job {
  // Mapping function for job_type
  mapJobType(jobType) {
    const jobTypeMap = {
      'full-time': 'full_time',
      'part-time': 'part_time',
      'contract': 'contract',
    };
    return jobTypeMap[jobType] || 'full_time'; // Default to 'full_time' if invalid
  }

  async create(data) {
    const {
      employer_id,
      title,
      description,
      location,
      salary_range,
      job_type,
      industry,
      experience_level,
      expires_at,
      status,
      is_archived,
      created_at,
      updated_at,
    } = data;

    // Generate a unique slug based on title and location
    const baseSlug = `${title}-${location}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").trim();
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const [existing] = await pool.query("SELECT job_id FROM jobs WHERE slug = ?", [slug]);
      if (existing.length === 0) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const mappedJobType = this.mapJobType(job_type);

    const [result] = await pool.query(
      `INSERT INTO jobs (
        employer_id, slug, title, description, location, salary_range, job_type, industry,
        experience_level, expires_at, status, is_archived, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employer_id,
        slug,
        title,
        description,
        location || null,
        salary_range || null,
        mappedJobType || "full_time",
        industry || "Other",
        experience_level || "entry-level",
        expires_at || null,
        status || "open",
        is_archived || false,
        created_at || new Date(),
        updated_at || new Date(),
      ]
    );
    return this.findById(result.insertId);
  }

  async findById(jobId) {
    const [rows] = await pool.query("SELECT * FROM jobs WHERE job_id = ?", [jobId]);
    return rows[0];
  }

  async findBySlug(slug) {
    const [rows] = await pool.query(
      "SELECT * FROM jobs WHERE slug = ? AND (expires_at IS NULL OR expires_at > NOW())",
      [slug]
    );
    return rows[0];
  }

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
      const mappedJobType = this.mapJobType(job_type);
      query += " AND job_type = ?";
      countQuery += " AND job_type = ?";
      params.push(mappedJobType);
      countParams.push(mappedJobType);
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
      const mappedJobType = this.mapJobType(job_type);
      query += " AND job_type = ?";
      countQuery += " AND job_type = ?";
      params.push(mappedJobType);
      countParams.push(mappedJobType);
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
      else if (date_posted === "last_30_days") dateFilter = "DATE_SUB(NOW(), INTERVAL 7 DAY)";
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
      salary_range,
      job_type,
      industry,
      experience_level,
      expires_at,
      status,
    } = data;

    // Update slug if title changes
    let newSlug = slug;
    if (title) {
      const baseSlug = `${title}-${data.location || location}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").trim();
      let counter = 1;
      while (true) {
        const [existing] = await pool.query(
          "SELECT job_id FROM jobs WHERE slug = ? AND slug != ?",
          [newSlug, slug]
        );
        if (existing.length === 0) break;
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const mappedJobType = job_type ? this.mapJobType(job_type) : null;

    const [result] = await pool.query(
      `UPDATE jobs SET
        title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        location = COALESCE(?, location),
        salary_range = COALESCE(?, salary_range),
        job_type = COALESCE(?, job_type),
        industry = COALESCE(?, industry),
        experience_level = COALESCE(?, experience_level),
        expires_at = COALESCE(?, expires_at),
        status = COALESCE(?, status),
        updated_at = ?
      WHERE slug = ?`,
      [
        title || null,
        newSlug || null,
        description || null,
        location || null,
        salary_range || null,
        mappedJobType || null,
        industry || null,
        experience_level || null,
        expires_at || null,
        status || null,
        new Date(),
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

    const { employer_id, title, description, location, salary_range, job_type, industry, experience_level } = job;
    const newTitle = `${title} (Copy)`;
    const newJobData = {
      employer_id,
      title: newTitle,
      description,
      location,
      salary_range,
      job_type,
      industry,
      experience_level,
      status: "open",
      is_archived: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    return this.create(newJobData);
  }

  // New method to find jobs expiring soon
  async findExpiringJobs() {
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
    const query = `
      SELECT j.*, u.email
      FROM jobs j
      JOIN users u ON j.employer_id = u.user_id
      WHERE j.expires_at IS NOT NULL
        AND j.expires_at >= ?
        AND j.expires_at <= ?
        AND j.status = 'open'
        AND j.is_archived = 0
    `;
    const [rows] = await pool.query(query, [now, in24Hours]);
    return rows;
  }
}

module.exports = new Job();