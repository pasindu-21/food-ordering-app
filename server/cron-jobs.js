const cron = require('node-cron');
const Order = require('./models/Order');
const DailySummary = require('./models/DailySummary');

const startDailyJobs = () => {
  // Test mode: run every 2 minutes (*/2 * * * *)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running DAILY JOB in TEST MODE for TODAY ...');

    // 🟢 USE "TODAY" (`startOfToday` / `endOfToday`) INSTEAD of "yesterday"
    const now = new Date();
    const startOfToday = new Date(now.setHours(0, 0, 0, 0));
    const endOfToday = new Date(now.setHours(23, 59, 59, 999));

    try {
      // 1. Expire pending orders from **today**
      await Order.updateMany(
        { status: 'pending', createdAt: { $lte: endOfToday }, isArchived: false },
        { $set: { status: 'expired' } }
      );
      console.log('Checked for pending orders to expire (today)...');

      // 2. Generate summaries for completed orders (today)
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
          const summary = ownerSummaries[ownerId];
          summary.itemSummary = Object.fromEntries(summary.itemSummary.entries());
          await DailySummary.findOneAndUpdate(
            { owner: ownerId, date: startOfToday },
            { $set: summary },
            { upsert: true }
          );
        }
        console.log(`Generated daily summaries for ${Object.keys(ownerSummaries).length} owners.`);
      } else {
        console.log('No completed orders found for summary generation today.');
      }

      // 3. Archive "closed" orders from today
      await Order.updateMany(
        {
          status: { $in: ['completed', 'rejected', 'expired'] },
          createdAt: { $lte: endOfToday },
          isArchived: false
        },
        { $set: { isArchived: true } }
      );
      console.log('Checked for old orders to archive...');
      console.log('Daily job (TEST MODE today) finished successfully.');
    } catch (error) {
      console.error('Error during daily job execution (test mode):', error);
    }
  }, { timezone: "Asia/Colombo" });
};

module.exports = startDailyJobs;
