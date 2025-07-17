// server/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth'); // Use our new admin middleware
const adminController = require('../controllers/adminController'); // <<<<---- Controller import කරා

// @route   GET /api/admin/stats
// @desc    Get system-wide statistics (Admin only)
router.get('/stats', adminAuth, adminController.getStats);

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
router.get('/users', adminAuth, adminController.getAllUsers);

// <<<<---- NEW: Update a user's role (Admin only) ---->>>>
// @route   PUT /api/admin/users/:id/role
// @desc    Update a user's role
// @access  Admin
router.put('/users/:id/role', adminAuth, adminController.updateUserRole);

// <<<<---- NEW: Delete a user (Admin only) ---->>>>
// @route   DELETE /api/admin/users/:id
// @desc    Delete a user
// @access  Admin
router.delete('/users/:id', adminAuth, adminController.deleteUser);

module.exports = router;
