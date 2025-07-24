// server/cron-jobs.js

const cron = require('node-cron');
const Order = require('./models/Order');
const DailySummary = require('./models/DailySummary');

const startDailyJobs = () => {
  // Test කරන්න විනාඩි 2කට සැරයක් run වෙන්න හදලා තියෙන්නේ
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily automation job in TEST MODE...');

    // <<<<---- TEST કરવાට පමණයි: අපි 'yesterday' වෙනුවට 'today' data process කරනවා ---->>>>
    const today = new Date();
    const startOfToday = new Date(today.setHours(0, 0, 0, 0));
    const endOfToday = new Date(today.setHours(23, 59, 59, 999));

    try {
      // 1. Expire Pending Orders from today (for testing)
      await Order.updateMany(
        { status: 'pending', createdAt: { $lte: endOfToday }, isArchived: false },
        { $set: { status: 'expired' } }
      );
      console.log('Checked for pending orders to expire...');

      // 2. Generate Daily Summaries for COMPLETED orders from today
      const completedOrders = await Order.find({
        status: 'completed',
        updatedAt: { $gte: startOfToday, $lte: endOfToday }
      });

      if (completedOrders.length > 0) {
        const ownerSummaries = {};
        for (const order of completedOrders) {
          const ownerId = order.owner.toString();
          if (!ownerSummaries[ownerId]) {
            ownerSummaries[ownerId] = { totalSales: 0, totalOrders: 0, itemSummary: new Map() };
          }
          ownerSummaries[ownerId].totalSales += order.total;
          ownerSummaries[ownerId].totalOrders += 1;
          order.items.forEach(item => {
            const currentQty = ownerSummaries[ownerId].itemSummary.get(item.name) || 0;
            ownerSummaries[ownerId].itemSummary.set(item.name, currentQty + item.qty);
          });
        }

        for (const ownerId in ownerSummaries) {
          await DailySummary.findOneAndUpdate(
            { owner: ownerId, date: startOfToday }, // Use startOfToday for the date
            { $set: ownerSummaries[ownerId] },
            { upsert: true }
          );
        }
        console.log(`Generated daily summaries for ${Object.keys(ownerSummaries).length} owners.`);
      } else {
        console.log('No completed orders found for summary generation today.');
      }

      // 3. Archive all "closed" orders from today
      await Order.updateMany(
        {
          status: { $in: ['completed', 'rejected', 'expired'] },
          createdAt: { $lte: endOfToday },
          isArchived: false
        },
        { $set: { isArchived: true } }
      );
      console.log('Checked for old orders to archive...');
      console.log('Daily job (TEST MODE) finished successfully.');

    } catch (error) {
      console.error('Error during daily job execution (TEST MODE):', error);
    }
  }, { timezone: "Asia/Colombo" });
};

module.exports = startDailyJobs;
