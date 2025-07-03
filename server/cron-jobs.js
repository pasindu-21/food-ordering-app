// server/cron-jobs.js (PRODUCTION VERSION)

const cron = require('node-cron');
const Order = require('./models/Order');
const DailySummary = require('./models/DailySummary');

const startDailyJobs = () => {
  // --- JOB 1: DAILY SUMMARY GENERATION (Runs every day at midnight) ---
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON - DAILY] Running daily job: Archiving and Summarizing...');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.setHours(0, 0, 0, 0));
    const endOfYesterday = new Date(yesterday.setHours(23, 59, 59, 999));

    try {
      // Step 1: Expire Pending Orders from yesterday
      await Order.updateMany(
        { status: 'pending', createdAt: { $lte: endOfYesterday }, isArchived: false },
        { $set: { status: 'expired' } }
      );
      console.log('[CRON - DAILY] Checked for pending orders to expire.');

      // Step 2: Generate Daily Summaries for COMPLETED orders from yesterday
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
        console.log(`[CRON - DAILY] Generated daily summaries for ${Object.keys(ownerSummaries).length} owners.`);
      } else {
        console.log('[CRON - DAILY] No completed orders from yesterday for summary generation.');
      }

      // Step 3: Archive all "closed" orders from yesterday
      await Order.updateMany(
        { status: { $in: ['completed', 'rejected', 'expired'] }, createdAt: { $lte: endOfYesterday }, isArchived: false },
        { $set: { isArchived: true } }
      );
      console.log('[CRON - DAILY] Checked for old orders to archive.');
      console.log('[CRON - DAILY] Daily job finished successfully.');

    } catch (error) {
      console.error('[CRON - DAILY] Error during daily job execution:', error);
    }
  }, { timezone: "Asia/Colombo" });

  // --- JOB 2: MONTHLY CLEANUP (Checks every day at 11:58 PM) ---
  cron.schedule('58 23 * * *', async () => {
    console.log('[CRON - MONTHLY CHECK] Running monthly cleanup check...');
    const today = new Date();
    
    // Check if today is the last day of the month
    const isLastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate() === today.getDate();
    
    if (isLastDay) {
      console.log('[CRON - MONTHLY] Today is the last day of the month. Starting cleanup...');
      try {
        // Deletes all documents in the DailySummary collection
        const result = await DailySummary.deleteMany({});
        console.log(`[CRON - MONTHLY] Successfully deleted ${result.deletedCount} summary reports. Ready for the new month!`);
      } catch (error) {
        console.error('[CRON - MONTHLY] Error during monthly cleanup:', error);
      }
    } else {
        console.log('[CRON - MONTHLY CHECK] Not the last day of the month. Skipping cleanup.');
    }
  }, { timezone: "Asia/Colombo" });
};

module.exports = startDailyJobs;
