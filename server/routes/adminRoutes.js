// server/routes/adminRoutes.js

const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const adminController = require('../controllers/adminController');

router.get('/stats', adminAuth, adminController.getStats);
router.get('/users', adminAuth, adminController.getAllUsers);
router.put('/users/:id/role', adminAuth, adminController.updateUserRole);
router.delete('/users/:id', adminAuth, adminController.deleteUser);

module.exports = router;
