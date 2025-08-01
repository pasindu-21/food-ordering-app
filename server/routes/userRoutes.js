// server/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Your auth middleware
const userController = require('../controllers/userController');

// Get profile route (fetch data)
router.get('/profile', auth, userController.getProfile);

// Update profile route
router.patch('/profile', auth, userController.updateProfile);

module.exports = router;
