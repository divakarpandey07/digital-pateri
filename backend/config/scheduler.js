const MandiRate = require('../models/MandiRate');
const { fetchMandiRatesFromAPI } = require('../services/mandiService');

/**
 * Runs the Mandi rates fetch job with automatic retry on failure.
 */
const runMandiJob = async () => {
  console.log('[Scheduler] Running daily Mandi rates fetch job...');
  try {
    const result = await fetchMandiRatesFromAPI();
    if (result && result.error) {
      console.error(`[Scheduler] Job completed with warnings: ${result.error}`);
      // Retry in 30 minutes on API error
      scheduleRetry();
    } else {
      console.log(`[Scheduler] Job completed successfully. Source: ${result?.source || 'UNKNOWN'}`);
    }
  } catch (err) {
    console.error('[Scheduler] Critical error executing Mandi rates job:', err);
    // Retry in 30 minutes on crash
    scheduleRetry();
  }
};

/**
 * Schedules a retry in 30 minutes
 */
const scheduleRetry = () => {
  const RETRY_DELAY = 30 * 60 * 1000; // 30 minutes
  console.log(`[Scheduler] Scheduling a retry in 30 minutes (${RETRY_DELAY / 1000 / 60} mins)...`);
  setTimeout(async () => {
    console.log('[Scheduler] Retrying Mandi rates fetch job...');
    try {
      await fetchMandiRatesFromAPI();
      console.log('[Scheduler] Retry completed successfully.');
    } catch (err) {
      console.error('[Scheduler] Retry failed again:', err);
    }
  }, RETRY_DELAY);
};

/**
 * Schedules the daily job at 6:00 AM
 */
const scheduleDailyJob = () => {
  const now = new Date();
  const nextRun = new Date();
  
  nextRun.setHours(6, 0, 0, 0); // Target 6:00 AM
  
  // If it is already past 6:00 AM today, schedule for tomorrow
  if (now.getTime() >= nextRun.getTime()) {
    nextRun.setDate(nextRun.getDate() + 1);
  }

  const delay = nextRun.getTime() - now.getTime();
  console.log(`[Scheduler] Daily Mandi Rates job scheduled. Next run at: ${nextRun.toLocaleString()} (in ${Math.round(delay / 1000 / 60)} mins)`);

  setTimeout(() => {
    runMandiJob();
    // Re-schedule for the next day
    scheduleDailyJob();
  }, delay);
};

/**
 * Initializes the scheduler
 */
const initScheduler = async () => {
  console.log('[Scheduler] Initializing Mandi rates scheduler...');
  
  // 1. Startup check: Execute immediately if DB is empty or data is stale (older than 24 hours)
  try {
    const count = await MandiRate.countDocuments({});
    if (count === 0) {
      console.log('[Scheduler] MandiRate collection is empty. Running initial seed/fetch immediately...');
      await runMandiJob();
    } else {
      const latestRecord = await MandiRate.findOne({}).sort({ arrivalDate: -1 });
      if (latestRecord) {
        const hoursSinceLastUpdate = (new Date().getTime() - latestRecord.arrivalDate.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastUpdate > 24) {
          console.log(`[Scheduler] Mandi rates are stale (${Math.round(hoursSinceLastUpdate)} hours old). Running fetch immediately...`);
          await runMandiJob();
        } else {
          console.log('[Scheduler] Mandi rates are up to date in database.');
        }
      }
    }
  } catch (err) {
    console.error('[Scheduler] Error performing startup checks:', err);
  }

  // 2. Schedule the daily job at 6:00 AM
  scheduleDailyJob();
};

module.exports = {
  initScheduler
};
