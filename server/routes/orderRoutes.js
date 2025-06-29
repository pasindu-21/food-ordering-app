// server/routes/orderRoutes.js

const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const orderController = require('../controllers/orderController'); // <<<<---- Controller එක import කරා

// 1. User: Place order
router.post('/', auth, orderController.createOrder);

// 2. User: Get my orders
router.get('/my-orders', auth, orderController.getMyOrders);

// 3. Owner: Get orders for their shop(s)
router.get('/my', auth, orderController.getOwnerOrders);

// 4. Owner: Update overall order status
router.put('/:id/status', auth, orderController.updateOrderStatus);

// <<<<---- NEW ROUTE: For deleting an order ---->>>>
router.delete('/:id', auth, orderController.deleteOrder);

module.exports = router;
