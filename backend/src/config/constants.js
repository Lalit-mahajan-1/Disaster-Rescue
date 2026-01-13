module.exports = {
  DISASTER_TYPES: {
    EARTHQUAKE: 'earthquake',
    FLOOD: 'flood',
    HURRICANE: 'hurricane',
    TORNADO: 'tornado',
    WILDFIRE: 'wildfire',
    TSUNAMI: 'tsunami',
    VOLCANO: 'volcano',
    DROUGHT: 'drought',
    LANDSLIDE: 'landslide',
    STORM: 'storm',
    CYCLONE: 'cyclone',
    AVALANCHE: 'avalanche'
  },

  SEVERITY_LEVELS: {
    LOW: 1,
    MODERATE: 2,
    HIGH: 3,
    SEVERE: 4,
    EXTREME: 5
  },

  RADIUS_KM: 50, // Default radius for nearby cities

  DISASTER_COLORS: {
    earthquake: '#8B4513',
    flood: '#1E90FF',
    hurricane: '#4B0082',
    tornado: '#696969',
    wildfire: '#FF4500',
    tsunami: '#00CED1',
    volcano: '#DC143C',
    drought: '#D2691E',
    landslide: '#8B7355',
    storm: '#708090',
    cyclone: '#483D8B',
    avalanche: '#F0F8FF'
  },

  // Animation configurations for 3D visualization
  ANIMATION_CONFIGS: {
    earthquake: {
      type: 'pulse',
      color: 0xff0000,
      duration: 2000,
      intensity: 'high'
    },
    flood: {
      type: 'spread',
      color: 0x0000ff,
      duration: 3000,
      intensity: 'medium'
    },
    hurricane: {
      type: 'spiral',
      color: 0x800080,
      duration: 4000,
      intensity: 'high'
    },
    wildfire: {
      type: 'flame',
      color: 0xff4500,
      duration: 2500,
      intensity: 'high'
    },
    tsunami: {
      type: 'wave',
      color: 0x00ced1,
      duration: 3500,
      intensity: 'extreme'
    },
    volcano: {
      type: 'eruption',
      color: 0xdc143c,
      duration: 3000,
      intensity: 'extreme'
    }
  },

  CACHE_DURATION: 3600000, // 1 hour in milliseconds
  
  DEFAULT_PAGINATION: {
    page: 1,
    limit: 50
  }
};