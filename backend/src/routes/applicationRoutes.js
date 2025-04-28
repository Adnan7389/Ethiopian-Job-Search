// backend/src/routes/applicationRoutes.js

const express = require('express');
const getMyApplications = require('../controllers/applicationController'); 
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get logged-in user's applications
router.get('/my-applications', authMiddleware("job_seeker"), getMyApplications);


module.exports = router;
