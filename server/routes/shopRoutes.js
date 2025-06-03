const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const auth = require('../middleware/auth');

// POST - Add new shop (owners only)
router.post('/', auth, shopController.addShop);

// GET - All shops (users only)
router.get('/all', auth, shopController.getAllShops);

// GET - Owner's shops
router.get('/my', auth, shopController.getMyShops);

// PUT - Update shop (owners only, and only their shops)
router.put('/:id', auth, shopController.updateShop);

// DELETE - Delete shop (owners only, and only their shops)
router.delete('/:id', auth, shopController.deleteShop);

module.exports = router;
