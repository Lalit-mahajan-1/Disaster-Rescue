const mongoose = require('mongoose');

const disasterSchema = new mongoose.Schema({
  eventId: {
    type: String,
    unique: true,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['earthquake', 'flood', 'hurricane', 'tornado', 'wildfire', 'tsunami', 'volcano', 'drought', 'landslide', 'storm', 'cyclone', 'avalanche']
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  severity: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    city: String,
    country: String,
    region: String
  },
  dateOccurred: {
    type: Date,
    required: true
  },
  dateReported: {
    type: Date,
    default: Date.now
  },
  casualties: {
    deaths: { type: Number, default: 0 },
    injured: { type: Number, default: 0 },
    missing: { type: Number, default: 0 },
    affected: { type: Number, default: 0 }
  },
  damage: {
    estimated: Number,
    currency: { type: String, default: 'USD' }
  },
  magnitude: Number, // For earthquakes, volcanic eruptions
  windSpeed: Number, // For hurricanes, tornadoes
  area: Number, // Affected area in sq km
  sources: [{
    name: String,
    url: String,
    fetchedAt: Date
  }],
  images: [String],
  isActive: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create geospatial index for location-based queries
disasterSchema.index({ location: '2dsphere' });
disasterSchema.index({ type: 1, dateOccurred: -1 });
disasterSchema.index({ 'location.country': 1, type: 1 });

// Method to calculate risk score
disasterSchema.methods.calculateRiskScore = function() {
  let score = this.severity * 2;
  
  if (this.casualties.deaths > 0) score += 2;
  if (this.casualties.affected > 1000) score += 1;
  if (this.isActive) score += 2;
  
  return Math.min(score, 10);
};

module.exports = mongoose.model('Disaster', disasterSchema);