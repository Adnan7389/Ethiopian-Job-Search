const natural = require('natural');
const tokenizer = new natural.WordTokenizer();
const stopwords = require('stopwords').english;
const stemmer = natural.PorterStemmer;
const pool = require("../config/db");
const { LOW_FIT_THRESHOLD } = require('./applicantMatchingService');

// Extract and normalize keywords
function extractKeywords(text) {
  if (!text) return [];
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const filtered = tokens.filter(token => token.length > 2 && !stopwords.includes(token));
  const stemmed = filtered.map(token => stemmer.stem(token));
  return [...new Set(stemmed)];
}

// Process job seeker profile
async function processJobSeeker(userId) {
  const [rows] = await pool.query(
    "SELECT skills, education, experience, bio, resume_text FROM job_seeker_profiles WHERE user_id = ?",
    [userId]
  );
  const seeker = rows[0];
  if (!seeker) throw new Error('Job seeker profile not found');

  // Safely parse JSON fields
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

  return {
    skills,
    education,
    experience,
    highestEducation: getHighestEducation(education),
    yearsOfExperience: calculateTotalExperience(experience),
    extractedKeywords: [...new Set([
        ...skillKeywords,
      ...educationKeywords,
      ...experienceKeywords,
        ...bioKeywords,
        ...resumeKeywords
    ])]
  };
}

// Process job posting
async function processJobPosting(job) {
  const titleKeywords = extractKeywords(job.title);
  const descriptionKeywords = extractKeywords(job.description);
  const industryKeywords = extractKeywords(job.industry);
  const experienceLevelKeywords = extractKeywords(job.experience_level);

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

  return {
    ...job,
    requiredExperience,
    requiredEducation: educationKeywords.join(' '),
    extractedKeywords: [...new Set([
      ...titleKeywords,
      ...descriptionKeywords,
      ...industryKeywords,
      ...experienceLevelKeywords,
      ...educationKeywords
    ])]
  };
}

// Helper functions
function safeParseJSON(json, defaultValue = []) {
  if (!json) return defaultValue;
  try {
    return typeof json === 'string' ? JSON.parse(json) : json;
  } catch {
    return defaultValue;
  }
}

function getHighestEducation(education) {
  if (!education?.length) return '';
  const levels = {
    'phd': 4,
    'master': 3,
    'bachelor': 2,
    'diploma': 1,
    'certificate': 0
  };
  return education.reduce((highest, edu) => {
    const level = Object.keys(levels).find(key => 
      edu.degree?.toLowerCase().includes(key)
    );
    return (!highest || (level && levels[level] > levels[highest])) ? level : highest;
  }, null) || '';
}

function calculateTotalExperience(experience) {
  if (!experience?.length) return 0;
  return experience.reduce((total, exp) => {
    const start = new Date(exp.start_date);
    const end = exp.end_date ? new Date(exp.end_date) : new Date();
    const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
    return total + years;
  }, 0);
}

// Calculate match scores
function calculateKeywordMatchScore(seekerKeywords, jobKeywords) {
  const intersection = seekerKeywords.filter(k => jobKeywords.includes(k));
  return (intersection.length / jobKeywords.length) * 100 || 0;
}

function calculateSkillsMatchScore(seekerSkills, jobKeywords) {
  const skillKeywords = seekerSkills.flatMap(skill => extractKeywords(skill));
  const intersection = skillKeywords.filter(k => jobKeywords.includes(k));
  return (intersection.length / jobKeywords.length) * 100 || 0;
}

function calculateEducationMatchScore(seekerHighestEducation, requiredEducation) {
  return seekerHighestEducation.toLowerCase().includes(requiredEducation.toLowerCase()) ? 100 : 0;
}

function calculateExperienceMatchScore(seekerExperience, requiredExperience) {
  return (seekerExperience >= requiredExperience ? 100 : (seekerExperience / requiredExperience) * 100) || 0;
}

// Find matching jobs
async function findMatchingJobs(userId, topN = 5) {
  const processedSeeker = await processJobSeeker(userId);
  const [jobs] = await pool.query(
    "SELECT * FROM jobs WHERE status = 'open' AND is_archived = 0 AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY created_at DESC"
  );

  // Filter out any invalid jobs first
  const validJobs = jobs.filter(job => job && job.job_id);

  const processedJobs = await Promise.all(validJobs.map(job => processJobPosting(job)));
  const matches = processedJobs.map(job => {
    const keywordMatchingScore = calculateKeywordMatchScore(processedSeeker.extractedKeywords, job.extractedKeywords);
    const skillsMatchScore = calculateSkillsMatchScore(processedSeeker.skills, job.extractedKeywords);
    const educationMatchScore = calculateEducationMatchScore(processedSeeker.highestEducation, job.requiredEducation);
    const experienceMatchScore = calculateExperienceMatchScore(processedSeeker.yearsOfExperience, job.requiredExperience);

    const totalScore = Math.round(
      (keywordMatchingScore * 0.4) +
      (skillsMatchScore * 0.3) +
      (educationMatchScore * 0.15) +
      (experienceMatchScore * 0.15)
    );

    return {
      job: { 
        ...job,
        match_score: totalScore
      },
      score: totalScore,
      details: {
        keywordMatch: keywordMatchingScore,
        skillsMatch: skillsMatchScore,
        educationMatch: educationMatchScore,
        experienceMatch: experienceMatchScore,
      }
    };
  });

  const filteredMatches = matches.filter(match => match.score >= LOW_FIT_THRESHOLD);

return filteredMatches
    .sort((a, b) => b.score - a.score || new Date(b.job.created_at) - new Date(a.job.created_at))
    .slice(0, topN);
}

// Update recommendations for all seekers when a new job is posted
async function updateAllRecommendations(newJobId) {
  const [seekers] = await pool.query("SELECT user_id FROM job_seeker_profiles");
  for (const seeker of seekers) {
    const recommendations = await findMatchingJobs(seeker.user_id);
    await pool.query(
      "UPDATE job_seeker_profiles SET recommended_jobs = ? WHERE user_id = ?",
      [JSON.stringify(recommendations), seeker.user_id]
    );
  }
}

module.exports = { findMatchingJobs, updateAllRecommendations };