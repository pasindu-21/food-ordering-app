// server/routes/shopRoutes.js

const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const auth = require('../middleware/auth');

router.get('/public', shopController.getAllShops);
router.post('/', auth, shopController.addShop);
router.get('/my', auth, shopController.getMyShops);
router.put('/:id', auth, shopController.updateShop);
router.delete('/:id', auth, shopController.deleteShop);

module.exports = router;
