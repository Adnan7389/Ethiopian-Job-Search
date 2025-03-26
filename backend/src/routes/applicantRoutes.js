const express = require('express');
const {
  applyForJob,
  getJobApplications,
  updateApplication,
  deleteApplication
} = require('../controllers/applicantController');
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/apply', authMiddleware, applyForJob); 
router.get('/job/:job_id', authMiddleware, getJobApplications); 
router.put('/:applicant_id', authMiddleware, updateApplication); 
router.delete('/:applicant_id', authMiddleware, deleteApplication);

module.exports = router;