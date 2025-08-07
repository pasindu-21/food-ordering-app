const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const auth = require('../middleware/auth');

// Public route to get all shops - auth ඕනෙ නැහැ, visitors ට බලන්න පුලුවන්
router.get('/', shopController.getAllShops);

// Protected routes for shops
router.post('/', auth, shopController.addShop);
router.get('/my', auth, shopController.getMyShops);
router.put('/:id', auth, shopController.updateShop);
router.delete('/:id', auth, shopController.deleteShop);

// Menu item routes (inventory management සඳහා)
router.post('/:shopId/menu-items', auth, shopController.addMenuItem); // Add new menu item with quantities
router.put('/:shopId/menu-items/:itemId', auth, shopController.updateMenuItem); // Update menu item quantities
router.delete('/:shopId/menu-items/:itemId', auth, shopController.deleteMenuItem); // Delete menu item

// Optional debug route (production එකේ remove කරන්න)
router.get('/check-data', auth, shopController.checkShopData);

module.exports = router;
