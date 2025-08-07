// server/scripts/fixAvailableQuantities.js
const mongoose = require('mongoose');
const Shop = require('../models/Shop');

const fixAvailableQuantities = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/your-database-name');
    
    console.log('Starting to fix available quantities...');
    
    // Get all shops
    const shops = await Shop.find({});
    
    for (let shop of shops) {
      let updated = false;
      
      for (let item of shop.menuItems) {
        // If available quantities are not set, set them equal to total quantities
        if (item.availableBreakfastQty === undefined || item.availableBreakfastQty === null) {
          item.availableBreakfastQty = item.breakfastQty || 0;
          updated = true;
        }
        if (item.availableLunchQty === undefined || item.availableLunchQty === null) {
          item.availableLunchQty = item.lunchQty || 0;
          updated = true;
        }
        if (item.availableDinnerQty === undefined || item.availableDinnerQty === null) {
          item.availableDinnerQty = item.dinnerQty || 0;
          updated = true;
        }
      }
      
      if (updated) {
        await shop.save();
        console.log(`Fixed quantities for shop: ${shop.shopName}`);
      }
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

fixAvailableQuantities();
