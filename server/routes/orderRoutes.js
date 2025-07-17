// server/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const orderController = require('../controllers/orderController');

router.post('/', auth, orderController.createOrder);
router.get('/my-orders', auth, orderController.getMyOrders);
router.get('/my', auth, orderController.getOwnerOrders);
router.put('/:id/status', auth, orderController.updateOrderStatus);
router.delete('/:id', auth, orderController.deleteOrder);

module.exports = router;
