// server/controllers/orderController.js - Updated with quantity reduction
const Order = require('../models/Order');
const Shop = require('../models/Shop');
const mongoose = require('mongoose');

const TIME_SLOT_MAPPING = {
  Breakfast: '8.00 A.M',
  Lunch: '12.00 P.M',
  Dinner: '8.00 P.M'
};

// Helper function to get quantity field based on time slot
const getQuantityField = (timeSlot) => {
  switch(timeSlot) {
    case 'Breakfast': return 'availableBreakfastQty';
    case 'Lunch': return 'availableLunchQty';  
    case 'Dinner': return 'availableDinnerQty';
    default: return null;
  }
};

// 1. User: Place order with quantity reduction
exports.createOrder = async (req, res) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ msg: 'Only users can place orders.' });

    const { shopId, items, location, timeSlot } = req.body;
    if (!shopId || !items || !Array.isArray(items) || items.length === 0 || !location || !timeSlot) {
      return res.status(400).json({ msg: 'Invalid order data. Time slot is required.' });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ msg: 'Shop not found.' });

    // Start database transaction for atomic operation
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const quantityField = getQuantityField(timeSlot);
      if (!quantityField) {
        throw new Error('Invalid time slot.');
      }

      // 1. Check availability for all items
      for (let orderItem of items) {
        const menuItem = shop.menuItems.find(item => item.name === orderItem.name);
        if (!menuItem) {
          throw new Error(`Menu item '${orderItem.name}' not found.`);
        }

        const availableQty = menuItem[quantityField];
        if (availableQty < orderItem.qty) {
          throw new Error(`Insufficient quantity for '${orderItem.name}'. Available: ${availableQty}, Requested: ${orderItem.qty}`);
        }
      }

      // 2. Reduce quantities
      for (let orderItem of items) {
        const menuItemIndex = shop.menuItems.findIndex(item => item.name === orderItem.name);
        shop.menuItems[menuItemIndex][quantityField] -= orderItem.qty;
      }

      // Save shop with reduced quantities
      await shop.save({ session });

      // 3. Create order
      const itemsWithStatus = items.map(item => ({ ...item, status: 'pending' }));
      const total = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const slotTime = TIME_SLOT_MAPPING[timeSlot];

      const order = await Order.create([{
        user: req.user._id,
        shop: shopId,
        items: itemsWithStatus,
        total,
        location,
        timeSlot,
        slotTime,
        owner: shop.owner
      }], { session });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      res.status(201).json({ 
        message: 'Order placed successfully! Quantities updated.',
        order: order[0] 
      });

    } catch (error) {
      // Rollback transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: err.message || 'Server error.' });
  }
};

// Rest of the controller methods remain the same...
exports.getMyOrders = async (req, res) => {
  try {
    if (req.user.role !== 'user') return res.status(403).json({ msg: 'Only users can view their orders.' });
    const orders = await Order.find({ user: req.user._id }).populate('shop', 'shopName').sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

exports.getOwnerOrders = async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ msg: 'Only owners can view orders.' });

    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));

    const orders = await Order.find({
      owner: req.user._id,
      isArchived: false,
      createdAt: { $gte: startOfToday }
    })
      .populate('user', 'name email phone')
      .populate('shop', 'shopName')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ msg: 'Only owners can update orders.' });
    const { status } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found.' });
    if (order.owner.toString() !== req.user._id.toString()) return res.status(403).json({ msg: 'Not your shop.' });

    order.status = status;
    await order.save();
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: 'User not authorized to delete this order' });
    }
    if ((new Date() - new Date(order.createdAt)) < 24 * 60 * 60 * 1000) {
      return res.status(400).json({ msg: 'Recent orders cannot be deleted.' });
    }

    await order.deleteOne();
    res.json({ msg: 'Order removed successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ msg: 'Order not found' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ msg: 'Unauthorized' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ msg: 'Cannot cancel this order now' });
    }

    order.status = 'cancelled';
    await order.save();
    res.json({ msg: 'Order cancelled', order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
};
