const cron = require('node-cron');
const Order = require('./models/Order');
const DailySummary = require('./models/DailySummary');

const startDailyJobs = () => {
  // Test mode: run every 2 minutes (*/2 * * * *)
  // Production: '0 0 * * *' (midnight daily)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running DAILY JOB in TEST MODE for TODAY ...');

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    // For production, uncomment for YESTERDAY
    // const yesterday = new Date(now);
    // yesterday.setDate(now.getDate() - 1);
    // const startOfDay = new Date(yesterday);
    // startOfDay.setHours(0, 0, 0, 0);
    // const endOfDay = new Date(yesterday);
    // endOfDay.setHours(23, 59, 59, 999);

    try {
      // 1. Expire pending orders from the day
      await Order.updateMany(
        { status: 'pending', createdAt: { $lte: endOfDay }, isArchived: false },
        { $set: { status: 'expired' } }
      );
      console.log('Checked for pending orders to expire...');

      // 2. Generate summaries for completed orders (created or updated in the day range)
      const completedOrders = await Order.find({
        status: 'completed',
        $or: [
          { createdAt: { $gte: startOfDay, $lte: endOfDay } },
          { updatedAt: { $gte: startOfDay, $lte: endOfDay } }
        ]
      });
      console.log(`Found ${completedOrders.length} completed orders for summary.`); // DEBUG LOG

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
          const summary = ownerSummaries[ownerId];
          summary.itemSummary = Object.fromEntries(summary.itemSummary.entries());
          await DailySummary.findOneAndUpdate(
            { owner: ownerId, date: startOfDay },
            { $set: summary },
            { upsert: true }
          );
        }
        console.log(`Generated daily summaries for ${Object.keys(ownerSummaries).length} owners.`);
      } else {
        console.log('No completed orders found for summary generation today.');
      }

      // 3. Archive "closed" orders from the day
      await Order.updateMany(
        {
          status: { $in: ['completed', 'rejected', 'expired'] },
          createdAt: { $lte: endOfDay },
          isArchived: false
        },
        { $set: { isArchived: true } }
      );
      console.log('Checked for old orders to archive...');
      console.log('Daily job (TEST MODE) finished successfully.');
    } catch (error) {
      console.error('Error during daily job execution:', error);
    }
  }, { timezone: "Asia/Colombo" });
};

module.exports = startDailyJobs;
