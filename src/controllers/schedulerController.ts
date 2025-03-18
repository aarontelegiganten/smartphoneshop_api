import schedule from "node-schedule";
import { fetchAndUpdateStock } from '@/controllers/productController';

let stockUpdateJob: schedule.Job | null = null;
let lastRunTime: Date | null = null;
export let isUpdateRunning = false; // Flag to track if an update is currently running

export function initializeStockUpdateScheduler() {
  if (stockUpdateJob) {
    console.log('Stock update scheduler already initialized');
    return;
  }

  console.log('Initializing stock update scheduler...');
  
  // Schedule to run at 01:00 UTC every day
  const scheduleTime = "0 1 * * *"; // Run at 01:00 UTC every day
  console.log(`Setting up daily schedule for: ${scheduleTime}`);
  
  stockUpdateJob = schedule.scheduleJob(scheduleTime, async () => {
    if (isUpdateRunning) {
      console.log('Stock update is already running, skipping this scheduled run');
      return;
    }

    try {
      isUpdateRunning = true;
      console.log('Starting daily stock update job at 01:00 UTC...');
      lastRunTime = new Date();
      await fetchAndUpdateStock();
      console.log('Stock update job completed successfully');
    } catch (error) {
      console.error('Error in scheduled stock update:', error);
      if (stockUpdateJob) {
        const nextRun = stockUpdateJob.nextInvocation();
        console.log('Next scheduled run:');
        console.log(`UTC time: ${nextRun.toISOString()}`);
        console.log(`Copenhagen time: ${nextRun.toLocaleString('en-US', { timeZone: 'Europe/Copenhagen' })}`);
      }
    } finally {
      isUpdateRunning = false;
    }
  });

  // Log the next scheduled run time
  if (stockUpdateJob) {
    console.log('Stock update scheduler initialized');
    const nextRun = stockUpdateJob.nextInvocation();
    console.log('Next scheduled run:');
    console.log(`UTC time: ${nextRun.toISOString()}`);
    console.log(`Copenhagen time: ${nextRun.toLocaleString('en-US', { timeZone: 'Europe/Copenhagen' })}`);
  } else {
    console.error('Failed to initialize stock update scheduler');
  }
}

export function stopStockUpdateScheduler() {
  if (stockUpdateJob) {
    console.log('Stopping stock update scheduler...');
    stockUpdateJob.cancel();
    stockUpdateJob = null;
    console.log('Stock update scheduler stopped');
  }
}

export function getSchedulerStatus() {
  const status = {
    isRunning: !!stockUpdateJob,
    isUpdateRunning,
    lastRunTime,
    nextScheduledRun: stockUpdateJob?.nextInvocation(),
    currentTime: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
  console.log('Current scheduler status:', status);
  return status;
}

export async function runStockUpdateNow() {
  if (isUpdateRunning) {
    return { 
      success: false, 
      message: 'Stock update is already running, please wait for it to complete' 
    };
  }

  try {
    isUpdateRunning = true;
    console.log('Starting immediate stock update...');
    lastRunTime = new Date();
    await fetchAndUpdateStock();
    console.log('Immediate stock update completed successfully');
    return { success: true, message: 'Stock update completed successfully' };
  } catch (error: any) {
    console.error('Error in immediate stock update:', error);
    return { success: false, message: 'Stock update failed', error: error?.message || 'Unknown error' };
  } finally {
    isUpdateRunning = false;
  }
} 