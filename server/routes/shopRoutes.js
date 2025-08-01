const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const auth = require('../middleware/auth');

// Public route to get all shops - auth ඕනෙ නැහැ, visitors ට බලන්න පුලුවන්
router.get('/', shopController.getAllShops);

// Protected routes
router.post('/', auth, shopController.addShop);
router.get('/my', auth, shopController.getMyShops);
router.put('/:id', auth, shopController.updateShop);
router.delete('/:id', auth, shopController.deleteShop);

module.exports = router;
