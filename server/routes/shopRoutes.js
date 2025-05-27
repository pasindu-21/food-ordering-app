const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const auth = require('../middleware/auth'); // Use 'auth' consistently for the middleware

// POST - Add new shop (owners only)
router.post('/', auth, shopController.addShop); // Path was '/api/shops' but handled by app.use('/api/shops', shopRoutes)

// GET - All shops (users only)
router.get('/all', auth, shopController.getAllShops); // Path was '/api/shops/all'

// GET - Owner's shops
router.get('/my', auth, shopController.getMyShops); // Path was '/api/shops/my'

// PUT - Update shop (owners only, and only their shops)
router.put('/:id', auth, shopController.updateShop); // Path was '/api/shops/:id'

// DELETE - Delete shop (owners only, and only their shops)
router.delete('/:id', auth, shopController.deleteShop); // Path was '/api/shops/:id'

module.exports = router;