// backend/src/routes/applicationRoutes.js

const express = require('express');
const applicantController = require('../controllers/applicationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get logged-in job seeker's applications
router.get('/my-applications', authMiddleware("job_seeker"), applicantController.getMyApplications);
router.put('/:id/status', authMiddleware("employer"), applicantController.updateApplicationStatus);
router.put('/:id/schedule', authMiddleware("employer"), applicantController.scheduleInterview);
router.get('/summary', authMiddleware("job_seeker"), applicantController.getApplicationsSummary);

module.exports = router;
