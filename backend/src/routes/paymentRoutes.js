const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route POST /api/payments/initialize/:jobId
 * @desc Initialize a payment for job posting
 * @access Private (Employers only)
 */
router.post('/initialize/:jobId', authMiddleware('employer'), jobController.createJob);

/**
 * @route GET /api/payments/verify/:tx_ref
 * @desc Verify a payment after completion
 * @access Public (Called by Chapa webhook)
 */
router.get('/verify/:tx_ref', jobController.verifyPayment);

module.exports = router;