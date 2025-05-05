// server/routes/employers.js
const express = require('express');
const router = express.Router();
const employerController = require('../controllers/employerController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, employerController.getAllEmployers);
router.post('/toggle-approval', authenticate, employerController.toggleEmployerApproval);
router.get('/:userId', authenticate, employerController.getEmployerDetails);

module.exports = router;