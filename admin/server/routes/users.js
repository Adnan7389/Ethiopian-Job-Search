// server/routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, userController.getAllUsers);
router.post('/toggle-suspension', authenticate, userController.toggleUserSuspension);
router.get('/:userId', authenticate, userController.getUserDetails);

module.exports = router;