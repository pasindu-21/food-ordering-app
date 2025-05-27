const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const authMiddleware = require('../middleware/auth');

// Get all shops (accessible to any authenticated user - user or owner)
router.get('/all', authMiddleware, shopController.getAllShops);

// Get shops for the current owner (only for 'owner' role)
router.get('/my', authMiddleware, shopController.getMyShops);

// Add a new shop (only for 'owner' role)
router.post('/', authMiddleware, shopController.addShop);

// Update a shop (only for 'owner' role, and only their own shop)
router.put('/:id', authMiddleware, shopController.updateShop);

// Delete a shop (only for 'owner' role, and only their own shop)
router.delete('/:id', authMiddleware, shopController.deleteShop);

module.exports = router;