// server/routes/shopRoutes.js

const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const auth = require('../middleware/auth');

// <<<<---- NEW PUBLIC ROUTE: Login නැතුව shops ගන්න ---->>>>
router.get('/public', shopController.getAllShops);

// POST - Add new shop (owners only)
router.post('/', auth, shopController.addShop);

// GET - All shops (for LOGGED-IN users)
router.get('/all', auth, shopController.getAllShops);

// GET - Owner's shops
router.get('/my', auth, shopController.getMyShops);

// PUT - Update shop
router.put('/:id', auth, shopController.updateShop);

// DELETE - Delete shop
router.delete('/:id', auth, shopController.deleteShop);

module.exports = router;
