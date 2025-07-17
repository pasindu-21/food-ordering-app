// server/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

router.get('/stats', adminAuth, adminController.getStats);
router.get('/users', adminAuth, adminController.getAllUsers);

// <<<<---- NEW: Suspend/Unsuspend user route ---->>>>
router.put('/users/:id/suspend', adminAuth, adminController.suspendUser);

router.delete('/users/:id', adminAuth, adminController.deleteUser);

module.exports = router;
