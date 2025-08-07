const Shop = require('../models/Shop');
const mongoose = require('mongoose');

// Get all shops (for public and user view)
exports.getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find().populate('owner', 'name email');
    res.json(shops);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// Get shops for the logged-in owner
exports.getMyShops = async (req, res) => {
  try {
    const myShops = await Shop.find({ owner: req.user._id });
    res.status(200).json(myShops);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Failed to fetch your shops' });
  }
};

// Add a new shop (only for owners, only one shop per owner)
exports.addShop = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ msg: 'Only owners can add shops.' });
    }

    // Only one shop per owner
    const existingShop = await Shop.findOne({ owner: req.user._id });
    if (existingShop) {
      return res.status(400).json({ msg: 'You already have a shop. Only one shop per owner is allowed.' });
    }

    const { shopName, location, phone, menuItems } = req.body;
    if (!shopName || !Array.isArray(menuItems)) {
      return res.status(400).json({ msg: 'Invalid input. shopName and menuItems are required.' });
    }

    const newShop = new Shop({
      shopName,
      location: location || 'N/A',
      phone: phone || '', // New: phone
      owner: req.user._id,
      menuItems: menuItems.map(item => ({
        name: item.name,
        price: item.price,
        breakfastQty: item.breakfastQty || 0,
        lunchQty: item.lunchQty || 0,
        dinnerQty: item.dinnerQty || 0,
        // Auto-set available quantities
        availableBreakfastQty: item.breakfastQty || 0,
        availableLunchQty: item.lunchQty || 0,
        availableDinnerQty: item.dinnerQty || 0
      }))
    });

    await newShop.save();
    res.status(201).json(newShop);
  } catch (err) {
    console.error('Error in addShop:', err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// Update shop details (name, location, phone)
exports.updateShop = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ msg: 'Only owners can update shops.' });
    }

    const { id } = req.params;
    const { shopName, location, phone } = req.body;

    const shop = await Shop.findById(id);
    if (!shop) return res.status(404).json({ msg: 'Shop not found.' });

    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized.' });
    }

    if (shopName) shop.shopName = shopName;
    if (location) shop.location = location;
    if (phone) shop.phone = phone;

    await shop.save();
    res.json({ msg: 'Shop updated successfully.', shop });
  } catch (err) {
    console.error('Update shop error:', err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// Add a new menu item to a shop
exports.addMenuItem = async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ msg: 'Only owners can add menu items.' });

    const { shopId } = req.params;
    const { name, price, breakfastQty = 0, lunchQty = 0, dinnerQty = 0 } = req.body;

    if (!name || !price) {
      return res.status(400).json({ msg: 'Name and price are required.' });
    }

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ msg: 'Shop not found.' });

    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized.' });
    }

    // Check if item already exists
    const existingItem = shop.menuItems.find(item => item.name.toLowerCase() === name.toLowerCase());
    if (existingItem) {
      return res.status(400).json({ msg: 'Menu item with this name already exists.' });
    }

    // Create new menu item with proper available quantities
    const newMenuItem = {
      name,
      price: Number(price),
      breakfastQty: Number(breakfastQty) || 0,
      lunchQty: Number(lunchQty) || 0,
      dinnerQty: Number(dinnerQty) || 0,
      availableBreakfastQty: Number(breakfastQty) || 0,
      availableLunchQty: Number(lunchQty) || 0,
      availableDinnerQty: Number(dinnerQty) || 0
    };

    shop.menuItems.push(newMenuItem);
    await shop.save();

    console.log('Added menu item:', newMenuItem); // Debug log

    res.json({ 
      msg: 'Menu item added successfully.',
      menuItem: newMenuItem,
      shop 
    });
  } catch (err) {
    console.error('Add menu item error:', err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// Update a menu item
exports.updateMenuItem = async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ msg: 'Only owners can update menu items.' });

    const { shopId, itemId } = req.params;
    const { name, price, breakfastQty, lunchQty, dinnerQty } = req.body;

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ msg: 'Shop not found.' });

    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized.' });
    }

    const menuItem = shop.menuItems.id(itemId);
    if (!menuItem) return res.status(404).json({ msg: 'Menu item not found.' });

    // Update basic info
    if (name) menuItem.name = name;
    if (price) menuItem.price = Number(price);

    // Daily update: Directly set available quantities to new total quantities
    if (breakfastQty !== undefined) {
      const newBreakfastQty = Number(breakfastQty) || 0;
      menuItem.breakfastQty = newBreakfastQty;
      menuItem.availableBreakfastQty = newBreakfastQty; // Directly set to new total
    }

    if (lunchQty !== undefined) {
      const newLunchQty = Number(lunchQty) || 0;
      menuItem.lunchQty = newLunchQty;
      menuItem.availableLunchQty = newLunchQty; // Directly set to new total
    }

    if (dinnerQty !== undefined) {
      const newDinnerQty = Number(dinnerQty) || 0;
      menuItem.dinnerQty = newDinnerQty;
      menuItem.availableDinnerQty = newDinnerQty; // Directly set to new total
    }

    // Update availability status
    menuItem.isAvailable = (menuItem.availableBreakfastQty > 0 || menuItem.availableLunchQty > 0 || menuItem.availableDinnerQty > 0);

    await shop.save();

    console.log('Updated menu item with daily reset:', menuItem); // Debug log

    res.json({ 
      msg: 'Menu item updated successfully with daily quantity reset.', 
      menuItem,
      shop 
    });
  } catch (err) {
    console.error('Update menu item error:', err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// Delete a menu item – Improved error handling එකතු කළා
exports.deleteMenuItem = async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ msg: 'Only owners can delete menu items.' });

    const { shopId, itemId } = req.params;

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ msg: 'Shop not found.' });

    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized.' });
    }

    const menuItemIndex = shop.menuItems.findIndex(item => item._id.toString() === itemId);
    if (menuItemIndex === -1) return res.status(404).json({ msg: 'Menu item not found.' });

    shop.menuItems.splice(menuItemIndex, 1); // Remove the item from the array
    await shop.save();

    res.json({ msg: 'Menu item deleted successfully.', shop });
  } catch (err) {
    console.error('Delete menu item error:', err);
    res.status(500).json({ msg: 'Server error. Please try again.' });
  }
};

// Delete a menu item
exports.deleteMenuItem = async (req, res) => {
  try {
    if (req.user.role !== 'owner') return res.status(403).json({ msg: 'Only owners can delete menu items.' });

    const { shopId, itemId } = req.params;

    const shop = await Shop.findById(shopId);
    if (!shop) return res.status(404).json({ msg: 'Shop not found.' });

    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: 'Not authorized.' });
    }

    const menuItem = shop.menuItems.id(itemId);
    if (!menuItem) return res.status(404).json({ msg: 'Menu item not found.' });

    shop.menuItems.pull(itemId); // Remove the item from the array
    await shop.save();

    res.json({ msg: 'Menu item deleted successfully.', shop });
  } catch (err) {
    console.error('Delete menu item error:', err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// DELETE a shop (only for owners, only their own shop)
exports.deleteShop = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ msg: 'Only owners can delete shops.' });
    }

    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ msg: 'Shop not found.' });

    if (!shop.owner.equals(req.user._id)) {
      return res.status(403).json({ msg: 'You are not authorized to delete this shop.' });
    }

    // Using deleteOne() which is the modern way
    await shop.deleteOne();
    res.json({ msg: 'Shop deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// Debug helper - Check shop data
exports.checkShopData = async (req, res) => {
  try {
    const shops = await Shop.find({});
    
    for (let shop of shops) {
      console.log(`\n--- Shop: ${shop.shopName} ---`);
      for (let item of shop.menuItems) {
        console.log(`Item: ${item.name}`);
        console.log(`Total Qtys - B:${item.breakfastQty}, L:${item.lunchQty}, D:${item.dinnerQty}`);
        console.log(`Available Qtys - B:${item.availableBreakfastQty}, L:${item.availableLunchQty}, D:${item.availableDinnerQty}`);
        console.log(`Available: ${item.isAvailable}`);
        console.log('---');
      }
    }
    
    res.json({ msg: 'Check console for data' });
  } catch (error) {
    console.error('Check data error:', error);
    res.status(500).json({ msg: 'Error checking data' });
  }
};
