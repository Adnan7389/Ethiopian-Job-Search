const express = require('express');
const { createJob, getJobs, searchJobs } = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', authMiddleware, createJob); // Protected: only employers can post
router.get('/', getJobs); // Public: all jobs
router.get('/search', searchJobs); // Public: filtered search

module.exports = router;