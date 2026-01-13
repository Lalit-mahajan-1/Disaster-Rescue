const axios = require('axios');
const { NASA_EONET_API_URL, RELIEFWEB_API_URL } = require('../config/env');
const logger = require('../utils/logger');
const Disaster = require('../models/Disaster');

class DisasterDataService {
  
  /**
   * Fetch disasters from NASA EONET API (Free, no API key needed)
   */
  async fetchFromNASA(days = 365) {
    try {
      const response = await axios.get(`${NASA_EONET_API_URL}`, {
        params: {
          days: days,
          status: 'all'
        }
      });

      const disasters = response.data.events.map(event => {
        const coords = event.geometry[0].coordinates;
        
        // Try to extract location from title or description
        const locationInfo = this.extractLocationFromText(event.title);
        
        return {
          eventId: `nasa_${event.id}`,
          type: this.mapNASACategory(event.categories[0].id),
          title: event.title,
          description: event.description || '',
          location: {
            type: 'Point',
            coordinates: [coords[0], coords[1]], // [longitude, latitude]
            city: locationInfo.city,
            region: locationInfo.region,
            country: locationInfo.country
          },
          dateOccurred: new Date(event.geometry[0].date),
          sources: event.sources.map(source => ({
            name: source.id,
            url: source.url,
            fetchedAt: new Date()
          })),
          isActive: event.closed === null
        };
      });

      return disasters;
    } catch (error) {
      logger.error(`NASA EONET API error: ${error.message}`);
      return [];
    }
  }

  /**
   * Fetch disasters from ReliefWeb API (Free)
   */
  async fetchFromReliefWeb(limit = 100) {
    try {
      const response = await axios.post(`${RELIEFWEB_API_URL}`, {
        limit: limit,
        query: {
          fields: ['name', 'type', 'date', 'country', 'primary_country', 'status'],
          sort: ['date:desc']
        }
      });

      const disasters = response.data.data.map(item => {
        const fields = item.fields;
        
        return {
          eventId: `reliefweb_${item.id}`,
          type: this.mapReliefWebType(fields.type?.[0]?.name),
          title: fields.name,
          description: '',
          location: {
            country: fields.primary_country?.name,
            coordinates: fields.primary_country?.location 
              ? [fields.primary_country.location.lon, fields.primary_country.location.lat]
              : [0, 0]
          },
          dateOccurred: new Date(fields.date.created),
          isActive: fields.status === 'ongoing'
        };
      });

      return disasters.filter(d => d.location.coordinates[0] !== 0);
    } catch (error) {
      logger.error(`ReliefWeb API error: ${error.message}`);
      return [];
    }
  }

  /**
   * Map NASA category to our disaster types
   */
  mapNASACategory(categoryId) {
    const mapping = {
      '6': 'drought',
      '7': 'dust',
      '8': 'earthquake',
      '9': 'flood',
      '10': 'landslide',
      '12': 'storm',
      '13': 'temperature',
      '14': 'volcano',
      '15': 'water',
      '16': 'wildfire',
      '17': 'snow',
      '18': 'ice',
      '19': 'sea'
    };
    
    return mapping[categoryId] || 'storm';
  }

  /**
   * Map ReliefWeb disaster type to our types
   */
  mapReliefWebType(type) {
    if (!type) return 'storm';
    
    const typeLower = type.toLowerCase();
    
    if (typeLower.includes('flood')) return 'flood';
    if (typeLower.includes('earthquake')) return 'earthquake';
    if (typeLower.includes('hurricane') || typeLower.includes('cyclone')) return 'hurricane';
    if (typeLower.includes('tornado')) return 'tornado';
    if (typeLower.includes('fire')) return 'wildfire';
    if (typeLower.includes('tsunami')) return 'tsunami';
    if (typeLower.includes('volcano')) return 'volcano';
    if (typeLower.includes('drought')) return 'drought';
    if (typeLower.includes('landslide')) return 'landslide';
    if (typeLower.includes('storm')) return 'storm';
    if (typeLower.includes('avalanche')) return 'avalanche';
    
    return 'storm';
  }

  /**
   * Save disasters to database
   */
  async saveDisasters(disasters) {
    let savedCount = 0;
    let updatedCount = 0;

    for (const disaster of disasters) {
      try {
        const existing = await Disaster.findOne({ eventId: disaster.eventId });
        
        if (existing) {
          await Disaster.updateOne(
            { eventId: disaster.eventId },
            { $set: { ...disaster, lastUpdated: new Date() } }
          );
          updatedCount++;
        } else {
          await Disaster.create(disaster);
          savedCount++;
        }
      } catch (error) {
        logger.error(`Error saving disaster ${disaster.eventId}: ${error.message}`);
      }
    }

    return { savedCount, updatedCount };
  }

  /**
   * Get disasters near a location
   */
  async getDisastersNearLocation(longitude, latitude, radiusKm = 50, options = {}) {
    const {
      types = null,
      startDate = null,
      endDate = null,
      severity = null,
      limit = 100
    } = options;

    const query = {
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          $maxDistance: radiusKm * 1000 // Convert km to meters
        }
      }
    };

    if (types && types.length > 0) {
      query.type = { $in: types };
    }

    if (startDate || endDate) {
      query.dateOccurred = {};
      if (startDate) query.dateOccurred.$gte = new Date(startDate);
      if (endDate) query.dateOccurred.$lte = new Date(endDate);
    }

    if (severity) {
      query.severity = { $gte: severity };
    }

    const disasters = await Disaster.find(query)
      .limit(limit)
      .sort({ dateOccurred: -1 })
      .lean();

    return disasters;
  }

  /**
   * Get disaster statistics for a location
   */
  async getDisasterStatistics(longitude, latitude, radiusKm = 50) {
    const disasters = await this.getDisastersNearLocation(longitude, latitude, radiusKm, {
      limit: 1000
    });

    const stats = {
      total: disasters.length,
      byType: {},
      byYear: {},
      bySeverity: {},
      mostRecent: null,
      riskScore: 0
    };

    disasters.forEach(disaster => {
      // Count by type
      stats.byType[disaster.type] = (stats.byType[disaster.type] || 0) + 1;

      // Count by year
      const year = new Date(disaster.dateOccurred).getFullYear();
      stats.byYear[year] = (stats.byYear[year] || 0) + 1;

      // Count by severity
      stats.bySeverity[disaster.severity] = (stats.bySeverity[disaster.severity] || 0) + 1;
    });

    // Find most recent disaster
    if (disasters.length > 0) {
      stats.mostRecent = disasters[0];
    }

    // Calculate risk score (0-10)
    const recentDisasters = disasters.filter(d => {
      const yearsDiff = (Date.now() - new Date(d.dateOccurred)) / (1000 * 60 * 60 * 24 * 365);
      return yearsDiff <= 10;
    });

    stats.riskScore = Math.min(
      Math.round((recentDisasters.length / 10) * 2 + 
      (Object.keys(stats.byType).length * 0.5)),
      10
    );

    return stats;
  }

  /**
   * Extract location information from text (title or description)
   */
  extractLocationFromText(text) {
    if (!text) return { city: null, region: null, country: null };

    // Common patterns: "Event in City, Country" or "City Event"
    const patterns = [
      /in\s+([^,]+),\s*([^,]+)$/i,  // "in City, Country"
      /,\s*([^,]+),\s*([^,]+)$/,     // "Event, City, Country"
      /-\s*([^,]+),\s*([^,]+)$/,     // "Event - City, Country"
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return {
          city: match[1].trim(),
          region: null,
          country: match[2].trim()
        };
      }
    }

    // If no pattern matches, try to extract just country
    const countries = ['USA', 'Japan', 'China', 'India', 'Indonesia', 'Philippines', 'Australia', 
                      'Brazil', 'Mexico', 'Chile', 'Italy', 'Greece', 'Turkey', 'Iran', 'Pakistan'];
    
    for (const country of countries) {
      if (text.includes(country)) {
        return { city: null, region: null, country };
      }
    }

    return { city: null, region: null, country: null };
  }
}

module.exports = new DisasterDataService();