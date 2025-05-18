const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { getSystemMonitorData } = require('../controllers/systemMonitorController');

router.get('/system-monitor', authMiddleware('admin'), getSystemMonitorData);

module.exports = router; 