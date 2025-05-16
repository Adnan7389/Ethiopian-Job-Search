const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stopwords = require('stopwords').english;
const stemmer = natural.PorterStemmer;
const pool = require("../config/db");
const redis = require("../config/redis");
const Notification = require('../models/Notification');
const { getIO } = require('../socket');

const LOW_FIT_THRESHOLD = 40;

function extractKeywords(text) {
  if (!text) return [];
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const filtered = tokens.filter(token => token.length > 2 && !stopwords.includes(token));
  const stemmed = filtered.map(token => stemmer.stem(token));
  return [...new Set(stemmed)];
}

function safeParseJSON(jsonString, fallback = []) {
  if (!jsonString) return fallback;
  if (Array.isArray(jsonString)) return jsonString;
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.warn('Warning: invalid JSON, falling back to default', e);
    return fallback;
  }
}

async function processJobSeeker(userId) {
  const cacheKey = `job_seeker_profile:${userId}`;
  const cachedProfile = await redis.get(cacheKey);

  if (cachedProfile) {
    return JSON.parse(cachedProfile);
  }

  const [rows] = await pool.query(
    "SELECT skills, education, experience, bio, resume_text FROM job_seeker_profiles WHERE user_id = ?",
    [userId]
  );

  const seeker = rows[0];
  if (!seeker) throw new Error('Job seeker profile not found');

  const skills = safeParseJSON(seeker.skills, []);
  const education = safeParseJSON(seeker.education, []);
  const experience = safeParseJSON(seeker.experience, []);

  const skillKeywords = skills.flatMap(skill => extractKeywords(skill));
  const educationKeywords = education.flatMap(edu => [
    ...extractKeywords(edu.degree || ''),
    ...extractKeywords(edu.institution || ''),
  ]);
  const experienceKeywords = experience.flatMap(exp => [
    ...extractKeywords(exp.position || ''),
    ...extractKeywords(exp.company || ''),
    ...extractKeywords(exp.description || ''),
  ]);
  const bioKeywords = extractKeywords(seeker.bio || '');
  const resumeKeywords = extractKeywords(seeker.resume_text || '');

  const processedProfile = {
    userId,
    skills,
    education,
    experience,
    highestEducation: getHighestEducation(education),
    yearsOfExperience: calculateTotalExperience(experience),
    extractedKeywords: [...new Set([...skillKeywords, ...educationKeywords, ...experienceKeywords, ...bioKeywords, ...resumeKeywords])],
  };

  await redis.set(cacheKey, JSON.stringify(processedProfile), 'EX', 86400);
  return processedProfile;
}

async function processJobRequirements(jobId) {
  const cacheKey = `job_requirements:${jobId}`;
  const cachedRequirements = await redis.get(cacheKey);

  if (cachedRequirements) {
    return JSON.parse(cachedRequirements);
  }

  const [rows] = await pool.query(
    "SELECT title, description, industry, experience_level, job_type FROM jobs WHERE job_id = ?",
    [jobId]
  );

  const job = rows[0];
  if (!job) throw new Error('Job not found');

  // Extract skills and requirements from description
  const descriptionKeywords = extractKeywords(job.description);
  const titleKeywords = extractKeywords(job.title);
  
  // Map experience levels to years
  const experienceMap = {
    'entry-level': 0,
    'mid-level': 3,
    'senior': 5
  };
  
  const requiredExperience = experienceMap[job.experience_level] || 0;

  // Extract education requirements from description
  const educationKeywords = extractKeywords(job.description).filter(keyword => 
    ['bachelor', 'master', 'phd', 'degree', 'diploma', 'certificate'].includes(keyword)
  );

  const processedRequirements = {
    jobId,
    skills: [...new Set([...descriptionKeywords, ...titleKeywords])],
    requiredEducation: educationKeywords.join(' '),
    requiredExperience,
    extractedKeywords: [...new Set([...descriptionKeywords, ...titleKeywords, ...educationKeywords])],
  };

  await redis.set(cacheKey, JSON.stringify(processedRequirements), 'EX', 86400);
  return processedRequirements;
}

function calculateKeywordMatchScore(seekerKeywords, jobKeywords) {
  const intersection = seekerKeywords.filter(k => jobKeywords.includes(k));
  return (intersection.length / jobKeywords.length) * 100 || 0;
}

function calculateSkillsMatchScore(seekerSkills, jobSkills) {
  const intersection = seekerSkills.filter(s => jobSkills.includes(s));
  return (intersection.length / jobSkills.length) * 100 || 0;
}

function calculateEducationMatchScore(seekerHighestEducation, requiredEducation) {
  return seekerHighestEducation.toLowerCase().includes(requiredEducation.toLowerCase()) ? 100 : 0;
}

function calculateExperienceMatchScore(seekerExperience, requiredExperience) {
  return (seekerExperience >= requiredExperience ? 100 : (seekerExperience / requiredExperience) * 100) || 0;
}

function getHighestEducation(education) {
  return education.length > 0 ? education[0].degree || '' : '';
}

function calculateTotalExperience(experience) {
  return experience.reduce((total, exp) => {
    const start = parseInt(exp.start_year);
    const end = exp.end_year ? parseInt(exp.end_year) : new Date().getFullYear();
    return total + (end - start);
  }, 0);
}

async function calculateMatchScore(userId, jobId) {
  const cacheKey = `match_score:${userId}:${jobId}`;
  const cachedScore = await redis.get(cacheKey);

  if (cachedScore) {
    return JSON.parse(cachedScore);
  }

  const jobSeeker = await processJobSeeker(userId);
  const jobRequirements = await processJobRequirements(jobId);

  const keywordMatchingScore = calculateKeywordMatchScore(jobSeeker.extractedKeywords, jobRequirements.extractedKeywords);
  const skillsMatchScore = calculateSkillsMatchScore(jobSeeker.skills, jobRequirements.skills);
  const educationMatchScore = calculateEducationMatchScore(jobSeeker.highestEducation, jobRequirements.requiredEducation);
  const experienceMatchScore = calculateExperienceMatchScore(jobSeeker.yearsOfExperience, jobRequirements.requiredExperience);

  const totalScore = Math.round(
    (keywordMatchingScore * 0.4) +
    (skillsMatchScore * 0.3) +
    (educationMatchScore * 0.15) +
    (experienceMatchScore * 0.15)
  );

  const result = {
    score: totalScore,
    details: {
      keywordMatch: keywordMatchingScore,
      skillsMatch: skillsMatchScore,
      educationMatch: educationMatchScore,
      experienceMatch: experienceMatchScore,
    },
    isQualified: totalScore >= LOW_FIT_THRESHOLD,
  };

  await redis.set(cacheKey, JSON.stringify(result), 'EX', 86400);
  return result;
}

async function processJobApplication(userId, jobId, resume_url) {
  // Validate inputs
  if (!userId || !jobId) {
    console.error('Invalid inputs:', { userId, jobId });
    return {
      success: false,
      message: "Invalid user ID or job ID",
      score: 0
    };
  }

  try {
  const matchResult = await calculateMatchScore(userId, jobId);

  if (matchResult.score < LOW_FIT_THRESHOLD) {
    const [jobRows] = await pool.query(
        "SELECT j.title, u.username as company_name, j.experience_level, j.industry FROM jobs j JOIN users u ON j.employer_id = u.user_id WHERE j.job_id = ?",
      [jobId]
    );

    if (jobRows.length > 0) {
      const job = jobRows[0];
        
        // Create application record with failed status
        const [result] = await pool.query(
          "INSERT INTO applicants (job_id, job_seeker_id, resume_url, match_score, status) VALUES (?, ?, ?, ?, ?)",
          [jobId, userId, resume_url || null, matchResult.score, 'unqualified']
        );

        try {
          // Create a more detailed notification for the job seeker
      const notification = await Notification.create({
        user_id: userId,
            message: `Your application for ${job.title} at ${job.company_name} was not accepted. The position requires ${job.experience_level} experience in ${job.industry}. Consider updating your profile with relevant skills and experience to better match similar positions.`,
            type: 'application_status',
            reference_id: result.insertId,
        is_read: false,
            payload: {
              match_details: matchResult.details,
              required_experience: job.experience_level,
              industry: job.industry
            }
      });

          // Emit notification via Socket.IO with error handling
      const io = getIO();
          if (io) {
            try {
      io.to(userId.toString()).emit('notification', notification);
            } catch (socketError) {
              console.error('Socket emission error:', socketError);
              // Continue execution even if socket emission fails
            }
          }
        } catch (notificationError) {
          console.error('Notification creation error:', notificationError);
          // Continue execution even if notification creation fails
    }

    return {
      success: false,
      message: "Your qualifications do not match the job requirements.",
      score: matchResult.score,
          applicationId: result.insertId,
          status: 'unqualified',
          details: matchResult.details
        };
      }

      return {
        success: false,
        message: "Job not found.",
        score: 0
    };
  }

  const [result] = await pool.query(
      "INSERT INTO applicants (job_id, job_seeker_id, resume_url, match_score, status) VALUES (?, ?, ?, ?, ?)",
      [jobId, userId, resume_url || null, matchResult.score, 'pending']
  );

    try {
      // Create notification for successful application
      const [jobInfo] = await pool.query(
        "SELECT j.title, u.username as company_name FROM jobs j JOIN users u ON j.employer_id = u.user_id WHERE j.job_id = ?",
        [jobId]
      );

      if (jobInfo.length > 0) {
        const job = jobInfo[0];
        const notification = await Notification.create({
          user_id: userId,
          message: `Your application for ${job.title} at ${job.company_name} has been submitted successfully.`,
          type: 'application_status',
          reference_id: result.insertId,
          is_read: false
        });

        // Emit notification via Socket.IO with error handling
        const io = getIO();
        if (io) {
          try {
            io.to(userId.toString()).emit('notification', notification);
          } catch (socketError) {
            console.error('Socket emission error:', socketError);
            // Continue execution even if socket emission fails
          }
        }
      }
    } catch (notificationError) {
      console.error('Notification creation error:', notificationError);
      // Continue execution even if notification creation fails
    }

  return {
    success: true,
    message: "Application submitted successfully.",
    score: matchResult.score,
      applicationId: result.insertId,
      status: 'pending'
    };
  } catch (error) {
    console.error('Error processing job application:', error);
    return {
      success: false,
      message: "An error occurred while processing your application. Please try again.",
      score: 0
  };
  }
}

async function getQualifiedApplicants(jobId, page = 1, limit = 20) {
  console.log(`Fetching qualified applicants for job ${jobId} with threshold ${LOW_FIT_THRESHOLD}`);
  const offset = (page - 1) * limit;
  
  const [applicants] = await pool.query(
    `SELECT a.*, u.username, jsp.full_name, jsp.profile_picture_url
     FROM applicants a
     JOIN users u ON a.job_seeker_id = u.user_id
     JOIN job_seeker_profiles jsp ON a.job_seeker_id = jsp.user_id
     WHERE a.job_id = ? AND a.match_score >= ?
     ORDER BY a.match_score DESC, a.applied_at DESC
     LIMIT ? OFFSET ?`,
    [jobId, LOW_FIT_THRESHOLD, limit, offset]
  );

  console.log(`Found ${applicants.length} qualified applicants for job ${jobId}`);

  const [countResult] = await pool.query(
    "SELECT COUNT(*) as total FROM applicants WHERE job_id = ? AND match_score >= ?",
    [jobId, LOW_FIT_THRESHOLD]
  );

  console.log(`Total qualified applicants count: ${countResult[0].total}`);

  return {
    applicants,
    pagination: {
      page,
      limit,
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limit),
    },
  };
}

function invalidateCache(type, id) {
  const cacheKey = type === 'job_seeker' ? `job_seeker_profile:${id}` : `job_requirements:${id}`;
  return redis.del(cacheKey);
}

module.exports = {
  calculateMatchScore,
  processJobApplication,
  getQualifiedApplicants,
  invalidateCache,
  LOW_FIT_THRESHOLD,
};