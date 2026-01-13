const mongoose = require('mongoose');
const Disaster = require('../src/models/Disaster');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/disaster_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Sample diverse disasters to seed
const diverseDisasters = [
  // Earthquakes (Orange)
  {
    eventId: 'seed_eq_001',
    type: 'earthquake',
    title: 'Magnitude 7.2 Earthquake - Tokyo, Japan',
    description: 'Major earthquake strikes Tokyo metropolitan area',
    location: { type: 'Point', coordinates: [139.6917, 35.6895], country: 'Japan', city: 'Tokyo' },
    severity: 5,
    isActive: true,
    dateOccurred: new Date('2025-01-10')
  },
  {
    eventId: 'seed_eq_002',
    type: 'earthquake',
    title: 'Earthquake - San Francisco, USA',
    description: 'Moderate earthquake in California',
    location: { type: 'Point', coordinates: [-122.4194, 37.7749], country: 'USA', city: 'San Francisco' },
    severity: 4,
    isActive: false,
    dateOccurred: new Date('2024-12-15')
  },
  {
    eventId: 'seed_eq_003',
    type: 'earthquake',
    title: 'Earthquake - Istanbul, Turkey',
    description: 'Seismic activity detected',
    location: { type: 'Point', coordinates: [28.9784, 41.0082], country: 'Turkey', city: 'Istanbul' },
    severity: 5,
    isActive: true,
    dateOccurred: new Date('2025-01-08')
  },
  
  // Floods (Blue)
  {
    eventId: 'seed_flood_001',
    type: 'flood',
    title: 'Severe Flooding - Mumbai, India',
    description: 'Monsoon floods affecting millions',
    location: { type: 'Point', coordinates: [72.8777, 19.0760], country: 'India', city: 'Mumbai' },
    severity: 5,
    isActive: true,
    dateOccurred: new Date('2025-01-12')
  },
  {
    eventId: 'seed_flood_002',
    type: 'flood',
    title: 'Flash Floods - Bangkok, Thailand',
    description: 'Heavy rainfall causes flooding',
    location: { type: 'Point', coordinates: [100.5018, 13.7563], country: 'Thailand', city: 'Bangkok' },
    severity: 4,
    isActive: true,
    dateOccurred: new Date('2025-01-11')
  },
  {
    eventId: 'seed_flood_003',
    type: 'flood',
    title: 'River Flooding - Venice, Italy',
    description: 'Acqua alta flooding event',
    location: { type: 'Point', coordinates: [12.3155, 45.4408], country: 'Italy', city: 'Venice' },
    severity: 3,
    isActive: false,
    dateOccurred: new Date('2024-11-20')
  },
  
  // Wildfires (Red)
  {
    eventId: 'seed_fire_001',
    type: 'wildfire',
    title: 'Wildfire - Los Angeles, USA',
    description: 'Major wildfire threatening residential areas',
    location: { type: 'Point', coordinates: [-118.2437, 34.0522], country: 'USA', city: 'Los Angeles' },
    severity: 5,
    isActive: true,
    dateOccurred: new Date('2025-01-13')
  },
  {
    eventId: 'seed_fire_002',
    type: 'wildfire',
    title: 'Bushfire - Sydney, Australia',
    description: 'Bushfire season in full swing',
    location: { type: 'Point', coordinates: [151.2093, -33.8688], country: 'Australia', city: 'Sydney' },
    severity: 5,
    isActive: true,
    dateOccurred: new Date('2025-01-09')
  },
  {
    eventId: 'seed_fire_003',
    type: 'wildfire',
    title: 'Forest Fire - Amazon, Brazil',
    description: 'Deforestation-related fires',
    location: { type: 'Point', coordinates: [-60.0217, -3.4653], country: 'Brazil', region: 'Amazon' },
    severity: 4,
    isActive: false,
    dateOccurred: new Date('2024-09-15')
  },
  
  // Volcanoes (Dark Red)
  {
    eventId: 'seed_volcano_001',
    type: 'volcano',
    title: 'Mt. Fuji Eruption - Japan',
    description: 'Volcanic activity detected',
    location: { type: 'Point', coordinates: [138.7274, 35.3606], country: 'Japan' },
    severity: 5,
    isActive: true,
    dateOccurred: new Date('2025-01-14')
  },
  {
    eventId: 'seed_volcano_002',
    type: 'volcano',
    title: 'Kilauea Eruption - Hawaii, USA',
    description: 'Lava flows threatening communities',
    location: { type: 'Point', coordinates: [-155.2834, 19.4069], country: 'USA', region: 'Hawaii' },
    severity: 5,
    isActive: true,
    dateOccurred: new Date('2025-01-10')
  },
  {
    eventId: 'seed_volcano_003',
    type: 'volcano',
    title: 'Mt. Etna Activity - Sicily, Italy',
    description: 'Increased volcanic activity',
    location: { type: 'Point', coordinates: [15.0041, 37.7510], country: 'Italy', region: 'Sicily' },
    severity: 4,
    isActive: false,
    dateOccurred: new Date('2024-10-05')
  },
  
  // Tsunamis (Teal)
  {
    eventId: 'seed_tsunami_001',
    type: 'tsunami',
    title: 'Tsunami Warning - Banda Aceh, Indonesia',
    description: 'Tsunami following undersea earthquake',
    location: { type: 'Point', coordinates: [95.3238, 5.5483], country: 'Indonesia', city: 'Banda Aceh' },
    severity: 5,
    isActive: true,
    dateOccurred: new Date('2025-01-13')
  },
  {
    eventId: 'seed_tsunami_002',
    type: 'tsunami',
    title: 'Tsunami - Sendai, Japan',
    description: 'Coastal areas evacuated',
    location: { type: 'Point', coordinates: [140.8719, 38.2682], country: 'Japan', city: 'Sendai' },
    severity: 5,
    isActive: true,
    dateOccurred: new Date('2025-01-11')
  },
  {
    eventId: 'seed_tsunami_003',
    type: 'tsunami',
    title: 'Tsunami Alert - Chile Coast',
    description: 'Minor tsunami waves detected',
    location: { type: 'Point', coordinates: [-70.6693, -33.4489], country: 'Chile' },
    severity: 3,
    isActive: false,
    dateOccurred: new Date('2024-08-22')
  },
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding with diverse disasters...');
    
    let addedCount = 0;
    let skippedCount = 0;
    
    for (const disaster of diverseDisasters) {
      const existing = await Disaster.findOne({ eventId: disaster.eventId });
      
      if (!existing) {
        await Disaster.create(disaster);
        console.log(`✅ Added: ${disaster.title}`);
        addedCount++;
      } else {
        console.log(`⏭️  Skipped (already exists): ${disaster.title}`);
        skippedCount++;
      }
    }
    
    console.log(`\n📊 Seeding complete!`);
    console.log(`   Added: ${addedCount} disasters`);
    console.log(`   Skipped: ${skippedCount} disasters`);
    
    // Show type distribution
    const allDisasters = await Disaster.find({});
    const typeCounts = allDisasters.reduce((acc, d) => {
      acc[d.type] = (acc[d.type] || 0) + 1;
      return acc;
    }, {});
    
    console.log(`\n🌍 Current database type distribution:`);
    Object.entries(typeCounts).forEach(([type, count]) => {
      console.log(`   ${type}: ${count}`);
    });
    
    mongoose.connection.close();
    console.log('\n✨ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}

seedDatabase();
