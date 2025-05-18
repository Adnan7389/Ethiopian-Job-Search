const pool = require("../config/db");

// Import queryWithTimeout from app.js (or define here if not accessible)
const queryWithTimeout = async (query, params, timeout = 10000) => {
  const queryPromise = pool.query(query, params);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Database query timed out')), timeout);
  });
  return Promise.race([queryPromise, timeoutPromise]);
};

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

  // Add searchKeywords method inside the class
  searchKeywords(searchTerm) {
    if (!searchTerm) return '';
    const keywords = searchTerm.toLowerCase().split(/\s+/).filter(k => k.length > 2);
    if (keywords.length === 0) return '';
    
    const conditions = keywords.map(keyword => 
      `(j.title LIKE ? OR j.description LIKE ? OR e.company_name LIKE ?)`
    ).join(' AND ');
    
    return conditions;
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

    const [[{ company_name }]] = await queryWithTimeout(
      `SELECT company_name FROM employer_profiles WHERE user_id = ?`,
      [data.employer_id]
    );
    // Generate a unique slug based on title and location
    const baseSlug = `${title}-${location}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").trim();
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const [existing] = await queryWithTimeout("SELECT job_id FROM jobs WHERE slug = ?", [slug], 5000);
      if (existing.length === 0) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const mappedJobType = this.mapJobType(job_type);

    const [result] = await queryWithTimeout(
      `INSERT INTO jobs (
        employer_id, slug, title, description, location, salary_range, job_type, industry,
        experience_level, expires_at, status, is_archived, created_at, updated_at, company_name
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        company_name
      ],
      5000
    );
    return this.findById(result.insertId);
  }

  async findById(jobId) {
    const [rows] = await queryWithTimeout("SELECT *, company_name FROM jobs WHERE job_id = ?", [jobId], 5000);
    return rows[0];
  }

  async findBySlug(slug) {
    const [rows] = await queryWithTimeout(
      `
      SELECT 
        j.*, 
        e.company_name,
        e.website,
        e.location AS company_location,
        e.profile_picture_url,
        e.description AS company_description
      FROM jobs j
      JOIN employer_profiles e ON j.employer_id = e.user_id
      WHERE j.slug = ?
        AND j.is_archived = 0
        AND (j.expires_at IS NULL OR j.expires_at > NOW())
      `,
      [slug]
    );
    return rows[0];
  }

  async findAll({ page, limit, search, job_type, industry, experience_level, status, date_posted, includeArchived, location }) {
    console.log('Job Model - findAll called with params:', {
      page,
      limit,
      search,
      job_type,
      industry,
      experience_level,
      status,
      date_posted,
      includeArchived,
      location
    });

    try {
      // Only non-archived, non-expired, with an explicit status filter
      let query = `
        SELECT
          j.*,
          e.company_name,
          e.website,
          e.location AS company_location,
          e.profile_picture_url,
          e.description AS company_description
        FROM jobs j
        JOIN employer_profiles e ON j.employer_id = e.user_id
        WHERE j.is_archived = ?
          AND j.status = ?
          AND (j.expires_at IS NULL OR j.expires_at > NOW())
      `;
      let countQuery = `
        SELECT COUNT(*) AS total
        FROM jobs j
        JOIN employer_profiles e ON j.employer_id = e.user_id
        WHERE j.is_archived = ?
          AND j.status = ?
          AND (j.expires_at IS NULL OR j.expires_at > NOW())
      `;
      // First two params are is_archived and status
      const params = [includeArchived ? 1 : 0, status || "open"];
      const countParams = [includeArchived ? 1 : 0, status || "open"];

      if (search) {
        const keywordConditions = this.searchKeywords(search);
        if (keywordConditions) {
          const searchParams = [];
          const keywords = search.toLowerCase().split(/\s+/).filter(k => k.length > 2);
          keywords.forEach(keyword => {
            searchParams.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
          });
          
          query += ` AND ${keywordConditions}`;
          countQuery += ` AND ${keywordConditions}`;
          params.push(...searchParams);
          countParams.push(...searchParams);
        }
      }

      if (location) {
        query += " AND j.location LIKE ?";
        countQuery += " AND j.location LIKE ?";
        const locationTerm = `%${location}%`;
        params.push(locationTerm);
        countParams.push(locationTerm);
      }

      if (job_type) {
        const mappedJobType = this.mapJobType(job_type);
        query += " AND j.job_type = ?";
        countQuery += " AND j.job_type = ?";
        params.push(mappedJobType);
        countParams.push(mappedJobType);
      }
      if (industry) {
        query += " AND j.industry = ?";
        countQuery += " AND j.industry = ?";
        params.push(industry);
        countParams.push(industry);
      }
      if (experience_level) {
        query += " AND j.experience_level = ?";
        countQuery += " AND j.experience_level = ?";
        params.push(experience_level);
        countParams.push(experience_level);
      }
      if (date_posted) {
        let dateFilter;
        if (date_posted === "last_24_hours") dateFilter = "DATE_SUB(NOW(), INTERVAL 1 DAY)";
        else if (date_posted === "last_7_days") dateFilter = "DATE_SUB(NOW(), INTERVAL 7 DAY)";
        else if (date_posted === "last_30_days") dateFilter = "DATE_SUB(NOW(), INTERVAL 30 DAY)";
        if (dateFilter) {
          query += ` AND j.created_at >= ${dateFilter}`;
          countQuery += ` AND j.created_at >= ${dateFilter}`;
        }
      }

      const offset = (page - 1) * limit;
      query += ` ORDER BY j.created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, (page-1)*limit);

      console.log('Executing job search query:', {
        query,
        params,
        countQuery,
        countParams
      });

      const [jobs] = await queryWithTimeout(query, params);
      const [[{ total }]] = await queryWithTimeout(countQuery, countParams);

      console.log('Job search results:', {
        jobsFound: jobs.length,
        total,
        page,
        limit
      });

      return { jobs, total };
    } catch (error) {
      console.error('Error in Job.findAll:', {
        error: error.message,
        stack: error.stack,
        query: error.sql,
        params: error.params,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
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
      else if (date_posted === "last_30_days") dateFilter = "DATE_SUB(NOW(), INTERVAL 30 DAY)";
      if (dateFilter) {
        query += ` AND created_at >= ${dateFilter}`;
        countQuery += ` AND created_at >= ${dateFilter}`;
      }
    }

    const offset = (page - 1) * limit;
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(parseInt(limit), offset);

    const [jobs] = await queryWithTimeout(query, params, 10000);
    const [[{ total }]] = await queryWithTimeout(countQuery, countParams, 5000);
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

    if (updates.employer_id) {
      const [[{ company_name }]] = await queryWithTimeout(
        `SELECT company_name FROM employer_profiles WHERE user_id = ?`,
        [updates.employer_id]
      );
      updates.company_name = company_name;
    }
    // Update slug if title changes
    let newSlug = slug;
    if (title) {
      const baseSlug = `${title}-${data.location || location}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").trim();
      let counter = 1;
      while (true) {
        const [existing] = await queryWithTimeout(
          "SELECT job_id FROM jobs WHERE slug = ? AND slug != ?",
          [newSlug, slug],
          5000
        );
        if (existing.length === 0) break;
        newSlug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    const mappedJobType = job_type ? this.mapJobType(job_type) : null;

    const [result] = await queryWithTimeout(
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
        company_name = COALESCE(?, company_name),   -- ← include here
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
        updates.company_name,
        new Date(),
        slug,
      ],
      5000
    );

    if (result.affectedRows === 0) {
      throw new Error("Job not found");
    }
    return this.findBySlug(newSlug || slug);
  }

  async archive(jobId) {
    const [result] = await queryWithTimeout(
      "UPDATE jobs SET is_archived = 1 WHERE job_id = ?",
      [jobId],
      5000
    );
    if (result.affectedRows === 0) {
      throw new Error("Job not found");
    }
  }

  async restore(jobId) {
    const [result] = await queryWithTimeout(
      "UPDATE jobs SET is_archived = 0 WHERE job_id = ?",
      [jobId],
      5000
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
    const [rows] = await queryWithTimeout(query, [now, in24Hours], 5000);
    return rows;
  }
}

module.exports = new Job();