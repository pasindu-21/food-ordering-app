// server/controllers/shopController.js

const Shop = require('../models/Shop');

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

    const { shopName, location, phone, menuItems } = req.body; // New: phone
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
      }))
    });

    await newShop.save();
    res.status(201).json(newShop);
  } catch (err) {
    console.error('Error in addShop:', err);
    res.status(500).json({ msg: 'Server error.' });
  }
};

// Update a shop (name/location/phone/menu item update/delete/add)
exports.updateShop = async (req, res) => {
  try {
    if (req.user.role !== 'owner') {
      return res.status(403).json({ msg: 'Only owners can update shops.' });
    }

    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ msg: 'Shop not found.' });
    if (!shop.owner.equals(req.user._id)) {
      return res.status(403).json({ msg: 'You are not authorized to update this shop.' });
    }

    // Update shop name/location/phone if provided
    shop.shopName = req.body.shopName || shop.shopName;
    shop.location = req.body.location || shop.location;
    shop.phone = req.body.phone || shop.phone; // New: phone

    // Menu item full replace (for add new item via full array)
    if (Array.isArray(req.body.menuItems)) {
      shop.menuItems = req.body.menuItems;
    }
    // Menu item update (edit one item)
    else if (req.body.menuItemUpdate) {
      const { itemId, name, price, breakfastQty, lunchQty, dinnerQty } = req.body.menuItemUpdate;
      const item = shop.menuItems.find(item => item._id.toString() === itemId);
      if (!item) {
        return res.status(404).json({ msg: 'Menu item not found.' });
      }
      if (name !== undefined) item.name = name;
      if (price !== undefined) item.price = price;
      if (breakfastQty !== undefined) item.breakfastQty = breakfastQty;
      if (lunchQty !== undefined) item.lunchQty = lunchQty;
      if (dinnerQty !== undefined) item.dinnerQty = dinnerQty;
    }
    // Menu item delete (delete one item)
    else if (req.body.menuItemDeleteId) {
      const idx = shop.menuItems.findIndex(
        item => item._id.toString() === req.body.menuItemDeleteId
      );
      if (idx === -1) {
        return res.status(404).json({ msg: 'Menu item not found.' });
      }
      shop.menuItems.splice(idx, 1);
    }

    await shop.save();
    res.json(shop);
  } catch (err) {
    console.error(err);
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
