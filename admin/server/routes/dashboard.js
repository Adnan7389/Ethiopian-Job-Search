// server/routes/dashboard.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.get('/analytics', authenticate, dashboardController.getAnalytics);

module.exports = router;