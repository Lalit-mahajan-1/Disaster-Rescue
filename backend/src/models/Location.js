const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true,
      min: -90,
      max: 90
    },
    longitude: {
      type: Number,
      required: true,
      min: -180,
      max: 180
    }
  },
  city: String,
  state: String,
  country: {
    type: String,
    required: true
  },
  countryCode: String,
  region: String,
  population: Number,
  timezone: String,
  
  // Cache for disaster statistics
  disasterStats: {
    totalDisasters: { type: Number, default: 0 },
    byType: {
      earthquake: { type: Number, default: 0 },
      flood: { type: Number, default: 0 },
      hurricane: { type: Number, default: 0 },
      tornado: { type: Number, default: 0 },
      wildfire: { type: Number, default: 0 },
      tsunami: { type: Number, default: 0 },
      volcano: { type: Number, default: 0 },
      drought: { type: Number, default: 0 },
      landslide: { type: Number, default: 0 },
      storm: { type: Number, default: 0 },
      cyclone: { type: Number, default: 0 },
      avalanche: { type: Number, default: 0 }
    },
    lastCalculated: Date
  },
  
  lastQueried: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create compound index for coordinates
locationSchema.index({ 'coordinates.latitude': 1, 'coordinates.longitude': 1 });
locationSchema.index({ country: 1, city: 1 });

module.exports = mongoose.model('Location', locationSchema);