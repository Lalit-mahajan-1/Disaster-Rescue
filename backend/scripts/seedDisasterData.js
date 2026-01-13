require('dotenv').config();
const mongoose = require('mongoose');
const { MONGODB_URI } = require('../src/config/env');
const disasterDataService = require('../src/services/disasterDataService');
const logger = require('../src/utils/logger');

/**
 * Seed disaster data from external APIs
 */
async function seedDisasterData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🔄 Fetching disaster data from NASA EONET...');
    const nasaDisasters = await disasterDataService.fetchFromNASA(730); // Last 2 years
    console.log(`✅ Fetched ${nasaDisasters.length} disasters from NASA`);

    console.log('🔄 Fetching disaster data from ReliefWeb...');
    const reliefWebDisasters = await disasterDataService.fetchFromReliefWeb(200);
    console.log(`✅ Fetched ${reliefWebDisasters.length} disasters from ReliefWeb`);

    console.log('🔄 Saving disasters to database...');
    const nasaResult = await disasterDataService.saveDisasters(nasaDisasters);
    const reliefWebResult = await disasterDataService.saveDisasters(reliefWebDisasters);

    console.log('\n📊 Seeding Results:');
    console.log(`NASA: ${nasaResult.savedCount} saved, ${nasaResult.updatedCount} updated`);
    console.log(`ReliefWeb: ${reliefWebResult.savedCount} saved, ${reliefWebResult.updatedCount} updated`);
    console.log(`\nTotal: ${nasaResult.savedCount + reliefWebResult.savedCount} saved, ${nasaResult.updatedCount + reliefWebResult.updatedCount} updated`);

    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    logger.error(`Seeding error: ${error.message}`);
    process.exit(1);
  }
}

// Run the seeding
seedDisasterData();