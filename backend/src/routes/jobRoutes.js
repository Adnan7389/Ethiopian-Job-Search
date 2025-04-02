const express = require('express');
const { getJobs, createJob, searchJobs, updateJob, deleteJob } = require('../controllers/jobController.js');
const authenticateToken = require('../middleware/auth.js');

const router = express.Router();

router.get('/', authenticateToken, getJobs);
router.get('/search', authenticateToken, searchJobs);
router.post('/', authenticateToken, createJob);
router.put('/:jobId', authenticateToken, updateJob);
router.delete('/:jobId', authenticateToken, deleteJob);

module.exports = router;