// server/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

// System Stats
router.get('/stats', adminAuth, adminController.getStats);

// User Management Routes
router.get('/users', adminAuth, adminController.getAllUsers);

// <<<<---- නව මාර්ගය (Route): Update a user's details ---->>>>
router.put('/users/:id', adminAuth, adminController.updateUser);

router.put('/users/:id/suspend', adminAuth, adminController.suspendUser);
router.delete('/users/:id', adminAuth, adminController.deleteUser);

module.exports = router;
