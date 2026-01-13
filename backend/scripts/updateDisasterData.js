require('dotenv').config();
const cron = require('node-cron');
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../src/config/env');
const disasterDataService = require('../src/services/disasterDataService');
const logger = require('../src/utils/logger');

/**
 * Update disaster data from external APIs
 */
async function updateDisasterData() {
  try {
    logger.info('Starting disaster data update...');
    console.log('🔄 Updating disaster data...');

    // Fetch recent disasters (last 90 days)
    const nasaDisasters = await disasterDataService.fetchFromNASA(90);
    const reliefWebDisasters = await disasterDataService.fetchFromReliefWeb(100);

    // Save to database
    const nasaResult = await disasterDataService.saveDisasters(nasaDisasters);
    const reliefWebResult = await disasterDataService.saveDisasters(reliefWebDisasters);

    const totalSaved = nasaResult.savedCount + reliefWebResult.savedCount;
    const totalUpdated = nasaResult.updatedCount + reliefWebResult.updatedCount;

    console.log(`✅ Update complete: ${totalSaved} saved, ${totalUpdated} updated`);
    logger.info(`Data update complete: ${totalSaved} saved, ${totalUpdated} updated`);

    return { totalSaved, totalUpdated };

  } catch (error) {
    console.error('❌ Update error:', error.message);
    logger.error(`Update error: ${error.message}`);
    throw error;
  }
}

/**
 * Run as a cron job or one-time update
 */
async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    logger.info('Connected to MongoDB');

    // Check if running as cron or one-time
    const runAsCron = process.argv.includes('--cron');

    if (runAsCron) {
      console.log('🕒 Running as cron job (updates every 6 hours)...');
      logger.info('Started cron job for disaster data updates');

      // Schedule updates every 6 hours
      cron.schedule('0 */6 * * *', async () => {
        console.log('\n⏰ Cron job triggered');
        await updateDisasterData();
      });

      // Run immediately on start
      await updateDisasterData();

      console.log('✅ Cron job is running. Press Ctrl+C to stop.');

    } else {
      // Run once and exit
      await updateDisasterData();
      console.log('✅ One-time update completed');
      process.exit(0);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    logger.error(`Main error: ${error.message}`);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down gracefully...');
  mongoose.connection.close(() => {
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

// Run the script
main();