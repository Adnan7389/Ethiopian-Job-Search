const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { uploadResume, uploadProfilePicture } = require('../middleware/multerConfig');
const authMiddleware = require('../middleware/authMiddleware');
const validator = require('validator');
const path = require('path');
const fs = require('fs');

// Utility to wrap database queries with a timeout
const queryWithTimeout = async (query, params, timeout = 15000) => {
  const queryPromise = pool.query(query, params);
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Database query timed out')), timeout);
  });
  return Promise.race([queryPromise, timeoutPromise]);
};

// Debug route to bypass middleware
router.get('/debug', (req, res) => {
  console.log(`[${new Date().toISOString()}] profileRoutes: Handling GET /debug`);
  res.json({ message: 'Debug route working' });
});

// Validate JSON fields
const validateJsonFields = (field, fieldName, maxEntries = 10) => {
  if (!field) return null;
  try {
    const parsed = typeof field === 'string' ? JSON.parse(field) : field;
    if (!Array.isArray(parsed)) {
      throw new Error(`${fieldName} must be an array`);
    }
    if (parsed.length > maxEntries) {
      throw new Error(`${fieldName} cannot have more than ${maxEntries} entries`);
    }
    return parsed;
  } catch (error) {
    throw new Error(`Invalid ${fieldName} format: ${error.message}`);
  }
};

// Get Profile
router.get('/', (req, res, next) => {
  console.log(`[${new Date().toISOString()}] profileRoutes: Entering GET / route`);
  next();
}, authMiddleware(), async (req, res) => {
  console.log(`[${new Date().toISOString()}] profileRoutes: Handling GET / for user:`, req.user);

  const { userId, user_type } = req.user;

  console.time('Profile endpoint'); // Start total timer
  try {
    let query;
    let params = [userId];
    if (user_type === 'job_seeker') {
      query = `
        SELECT 
          jsp.user_id, 
          jsp.full_name, 
          jsp.bio, 
          jsp.skills, 
          jsp.education, 
          jsp.experience, 
          jsp.location, 
          jsp.profile_picture_url, 
          u.email, 
          u.resume_url
        FROM job_seeker_profiles jsp
        LEFT JOIN users u ON jsp.user_id = u.user_id
        WHERE jsp.user_id = ?
      `;
    } else if (user_type === 'employer') {
      query = `
        SELECT 
          ep.user_id, 
          ep.company_name, 
          ep.industry, 
          ep.website, 
          ep.description, 
          ep.contact_email, 
          ep.location, 
          ep.profile_picture_url, 
          u.email, 
          u.resume_url
        FROM employer_profiles ep
        LEFT JOIN users u ON ep.user_id = u.user_id
        WHERE ep.user_id = ?
      `;
    } else {
      console.timeEnd('Profile endpoint');
      return res.status(400).json({ message: 'Invalid user type' });
    }

    console.time('Database query');
    const [rows] = await queryWithTimeout(query, params);
    console.timeEnd('Database query');

    console.time('Response serialization');
    const profile = rows[0] || {};
    const response = {
      ...profile,
      email: profile.email || null,
      resume_url: profile.resume_url || null,
      user_type,
    };
    console.timeEnd('Response serialization');

    console.timeEnd('Profile endpoint');
    res.json(response);
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    console.timeEnd('Profile endpoint');
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Update Profile
router.put('/', authMiddleware(), async (req, res) => {
  const { userId, user_type } = req.user;
  let profileData = req.body;

  try {
    // Validate email if provided
    if (profileData.email) {
      if (!validator.isEmail(profileData.email)) {
        return res.status(400).json({ message: 'Invalid email format' });
      }
      // Check if email is already in use by another user
      const [existingEmail] = await queryWithTimeout(
        'SELECT user_id FROM users WHERE email = ? AND user_id != ?',
        [profileData.email, userId]
      );
      if (existingEmail.length > 0) {
        return res.status(409).json({ message: 'Email is already in use by another user' });
      }
      // Update email in users table
      await queryWithTimeout(
        'UPDATE users SET email = ? WHERE user_id = ?',
        [profileData.email, userId]
      );
    }

    // Remove email from profileData to avoid storing it in profile tables
    delete profileData.email;

    if (user_type === 'job_seeker') {
      // Validate Job Seeker fields
      const { full_name, bio, skills, education, experience, location } = profileData;

      if (full_name && (full_name.length < 2 || full_name.length > 100)) {
        return res.status(400).json({ message: 'Full name must be between 2 and 100 characters' });
      }
      if (bio && bio.length > 1000) {
        return res.status(400).json({ message: 'Bio must be less than 1000 characters' });
      }
      if (location && location.length > 100) {
        return res.status(400).json({ message: 'Location must be less than 100 characters' });
      }

      // Validate JSON fields
      const validatedSkills = validateJsonFields(skills, 'Skills');
      const validatedEducation = validateJsonFields(education, 'Education');
      const validatedExperience = validateJsonFields(experience, 'Experience');

      // Additional validation for education and experience objects
      if (validatedEducation) {
        for (const edu of validatedEducation) {
          if (!edu.degree || !edu.institution || !edu.year) {
            return res.status(400).json({ message: 'Each education entry must have degree, institution, and year' });
          }
        }
      }
      if (validatedExperience) {
        for (const exp of validatedExperience) {
          if (!exp.position || !exp.company || !exp.start_year) {
            return res.status(400).json({ message: 'Each experience entry must have position, company, and start year' });
          }
        }
      }

      const [existing] = await queryWithTimeout(
        'SELECT 1 FROM job_seeker_profiles WHERE user_id = ?',
        [userId]
      );
      if (existing.length > 0) {
        // Update existing profile
        await queryWithTimeout(
          `UPDATE job_seeker_profiles 
           SET full_name = ?, bio = ?, skills = ?, education = ?, experience = ?, location = ?
           WHERE user_id = ?`,
          [
            full_name || null,
            bio || null,
            validatedSkills ? JSON.stringify(validatedSkills) : null,
            validatedEducation ? JSON.stringify(validatedEducation) : null,
            validatedExperience ? JSON.stringify(validatedExperience) : null,
            location || null,
            userId,
          ]
        );
      } else {
        // Insert new profile
        await queryWithTimeout(
          `INSERT INTO job_seeker_profiles (user_id, full_name, bio, skills, education, experience, location)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            full_name || null,
            bio || null,
            validatedSkills ? JSON.stringify(validatedSkills) : null,
            validatedEducation ? JSON.stringify(validatedEducation) : null,
            validatedExperience ? JSON.stringify(validatedExperience) : null,
            location || null,
          ]
        );
      }
    } else if (user_type === 'employer') {
      // Validate Employer fields
      const { company_name, industry, website, description, contact_email, location } = profileData;
      if (!company_name || company_name.length < 2 || company_name.length > 100) {
        return res.status(400).json({ message: 'Company name is required and must be between 2 and 100 characters' });
      }
      if (industry && industry.length > 50) {
        return res.status(400).json({ message: 'Industry must be less than 50 characters' });
      }
      if (website && !validator.isURL(website)) {
        return res.status(400).json({ message: 'Invalid website URL' });
      }
      if (contact_email && !validator.isEmail(contact_email)) {
        return res.status(400).json({ message: 'Invalid contact email' });
      }
      if (description && description.length > 1000) {
        return res.status(400).json({ message: 'Description must be less than 1000 characters' });
      }
      if (location && location.length > 100) {
        return res.status(400).json({ message: 'Location must be less than 100 characters' });
      }

      const [existing] = await queryWithTimeout(
        'SELECT 1 FROM employer_profiles WHERE user_id = ?',
        [userId]
      );
      if (existing.length > 0) {
        // Update existing profile
        await queryWithTimeout(
          `UPDATE employer_profiles 
           SET company_name = ?, industry = ?, website = ?, description = ?, contact_email = ?, location = ?
           WHERE user_id = ?`,
          [company_name, industry || null, website || null, description || null, contact_email || null, location || null, userId]
        );
      } else {
        // Insert new profile
        await queryWithTimeout(
          `INSERT INTO employer_profiles (user_id, company_name, industry, website, description, contact_email, location)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [userId, company_name, industry || null, website || null, description || null, contact_email || null, location || null]
        );
      }
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error.message);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Upload Resume (Job Seekers Only)
router.post('/resume', authMiddleware(), uploadResume.single('resume'), async (req, res) => {
  const { userId, user_type } = req.user;

  if (user_type !== 'job_seeker') {
    return res.status(403).json({ message: 'Only job seekers can upload resumes' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const resumePath = `/uploads/resumes/${req.file.filename}`;

    // Delete old resume file if it exists
    const [userRows] = await queryWithTimeout(
      'SELECT resume_url FROM users WHERE user_id = ?',
      [userId]
    );
    const oldResumePath = userRows[0]?.resume_url;
    if (oldResumePath && fs.existsSync(path.join(__dirname, '..', oldResumePath))) {
      fs.unlinkSync(path.join(__dirname, '..', oldResumePath));
    }

    // Update resume_url in users table
    await queryWithTimeout(
      'UPDATE users SET resume_url = ? WHERE user_id = ?',
      [resumePath, userId]
    );

    res.json({ message: 'Resume uploaded successfully', resume_url: resumePath });
  } catch (error) {
    console.error('Error uploading resume:', error.message);
    // Delete the uploaded file if DB update fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Download Resume (Job Seekers Only)
router.get('/resume/download', authMiddleware(), async (req, res) => {
  const { userId, user_type } = req.user;

  if (user_type !== 'job_seeker') {
    return res.status(403).json({ message: 'Only job seekers can download resumes' });
  }

  try {
    const [rows] = await queryWithTimeout(
      'SELECT resume_url FROM users WHERE user_id = ?',
      [userId]
    );
    const resumeUrl = rows[0]?.resume_url;

    if (!resumeUrl) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const filePath = path.join(__dirname, '..', resumeUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Resume file not found on server' });
    }

    res.download(filePath);
  } catch (error) {
    console.error('Error downloading resume:', error.message);
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

// Upload Profile Picture
router.post('/profile-picture', authMiddleware(), uploadProfilePicture.single('profilePicture'), async (req, res) => {
  const { userId, user_type } = req.user;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const profilePicturePath = `/uploads/profile_pictures/${req.file.filename}`;
    const tableName = user_type === 'job_seeker' ? 'job_seeker_profiles' : 'employer_profiles';

    // Delete old profile picture if it exists
    const [profileRows] = await queryWithTimeout(
      `SELECT profile_picture_url FROM ${tableName} WHERE user_id = ?`,
      [userId]
    );
    const oldPicturePath = profileRows[0]?.profile_picture_url;
    if (oldPicturePath && fs.existsSync(path.join(__dirname, '..', oldPicturePath))) {
      fs.unlinkSync(path.join(__dirname, '..', oldPicturePath));
    }

    // Update profile_picture_url in the appropriate table
    const [existing] = await queryWithTimeout(
      `SELECT 1 FROM ${tableName} WHERE user_id = ?`,
      [userId]
    );
    if (existing.length > 0) {
      await queryWithTimeout(
        `UPDATE ${tableName} SET profile_picture_url = ? WHERE user_id = ?`,
        [profilePicturePath, userId]
      );
    } else {
      // Insert a minimal profile if it doesn't exist
      if (user_type === 'job_seeker') {
        await queryWithTimeout(
          `INSERT INTO job_seeker_profiles (user_id, profile_picture_url) VALUES (?, ?)`,
          [userId, profilePicturePath]
        );
      } else {
        return res.status(400).json({ message: 'Employer profile must be created before uploading a profile picture' });
      }
    }

    res.json({ message: 'Profile picture uploaded successfully', profile_picture_url: profilePicturePath });
  } catch (error) {
    console.error('Error uploading profile picture:', error.message);
    // Delete the uploaded file if DB update fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: 'Server error', details: error.message });
  }
});

module.exports = router;