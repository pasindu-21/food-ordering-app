// server/cron-jobs.js

const cron = require('node-cron');
const Order = require('./models/Order');
const DailySummary = require('./models/DailySummary');

const startDailyJobs = () => {
  // <<<<---- PRODUCTION SCHEDULE: හැමදාම රෑ 12ට (00:00) run වෙනවා ---->>>>
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily production job: Archiving old orders and generating summaries...');

    // <<<<---- PRODUCTION LOGIC: 'yesterday' data process කරනවා ---->>>>
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
    const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

    try {
      // 1. Expire Pending Orders from yesterday
      await Order.updateMany(
        { status: 'pending', createdAt: { $lte: endOfYesterday }, isArchived: false },
        { $set: { status: 'expired' } }
      );
      console.log('Checked for pending orders to expire.');

      // 2. Generate Daily Summaries for COMPLETED orders from yesterday
      const completedOrders = await Order.find({
        status: 'completed',
        updatedAt: { $gte: startOfYesterday, $lte: endOfYesterday }
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
            { owner: ownerId, date: startOfYesterday },
            { $set: ownerSummaries[ownerId] },
            { upsert: true }
          );
        }
        console.log(`Generated daily summaries for ${Object.keys(ownerSummaries).length} owners.`);
      } else {
        console.log('No completed orders found from yesterday for summary generation.');
      }

      // 3. Archive all "closed" orders from yesterday
      await Order.updateMany(
        {
          status: { $in: ['completed', 'rejected', 'expired'] },
          createdAt: { $lte: endOfYesterday },
          isArchived: false
        },
        { $set: { isArchived: true } }
      );
      console.log('Checked for old orders to archive.');
      console.log('Daily production job finished successfully.');

    } catch (error) {
      console.error('Error during daily production job execution:', error);
    }
  }, { timezone: "Asia/Colombo" });
};

module.exports = startDailyJobs;
