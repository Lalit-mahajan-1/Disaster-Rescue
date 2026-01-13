const geocodingService = require('../services/geocodingService');
const disasterDataService = require('../services/disasterDataService');
const calculationService = require('../services/calculationService');
const { RADIUS_KM } = require('../config/constants');
const logger = require('../utils/logger');

class LocationController {
  
  /**
   * Analyze location for disaster risks
   * POST /api/location/analyze
   * Body: { address: string } OR { latitude: number, longitude: number }
   */
  async analyzeLocation(req, res, next) {
    try {
      let locationData;

      // Get coordinates from address or use provided coordinates
      if (req.body.address) {
        locationData = await geocodingService.geocode(req.body.address);
      } else if (req.body.latitude && req.body.longitude) {
        locationData = await geocodingService.reverseGeocode(
          req.body.latitude,
          req.body.longitude
        );
      } else {
        return res.status(400).json({
          success: false,
          message: 'Please provide either address or coordinates'
        });
      }

      const { latitude, longitude } = locationData;
      const radiusKm = req.body.radius || RADIUS_KM;

      // Get disasters near the location
      const disasters = await disasterDataService.getDisastersNearLocation(
        longitude,
        latitude,
        radiusKm
      );

      // Calculate statistics
      const statistics = await disasterDataService.getDisasterStatistics(
        longitude,
        latitude,
        radiusKm
      );

      // Get seasonal patterns
      const seasonalPatterns = calculationService.getSeasonalPatterns(disasters);

      // Get nearby cities
      const nearbyCities = await geocodingService.getNearbyCities(
        latitude,
        longitude,
        radiusKm
      );

      // Calculate risk score
      const riskScore = calculationService.calculateRiskScore(statistics);

      // Get top disaster types
      const topDisasters = Object.entries(statistics.byType)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // Generate recommendations
      const recommendations = calculationService.generateRecommendations(
        statistics,
        topDisasters
      );

      // Predict future trends
      const futureTrends = {};
      topDisasters.forEach(([type]) => {
        futureTrends[type] = calculationService.predictFutureRisk(disasters, type);
      });

      res.json({
        success: true,
        data: {
          location: locationData,
          searchRadius: radiusKm,
          statistics,
          riskScore,
          topDisasters: topDisasters.map(([type, count]) => ({ type, count })),
          seasonalPatterns,
          nearbyCities: nearbyCities.slice(0, 20),
          recommendations,
          futureTrends,
          recentDisasters: disasters.slice(0, 100)  // Return up to 100 disasters
        }
      });

    } catch (error) {
      logger.error(`Location analysis error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Get nearby cities
   * GET /api/location/nearby-cities
   * Query: latitude, longitude, radius
   */
  async getNearbyCities(req, res, next) {
    try {
      const { latitude, longitude, radius = RADIUS_KM } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      const cities = await geocodingService.getNearbyCities(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(radius)
      );

      res.json({
        success: true,
        data: {
          cities,
          count: cities.length
        }
      });

    } catch (error) {
      logger.error(`Get nearby cities error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Geocode an address
   * POST /api/location/geocode
   * Body: { address: string }
   */
  async geocode(req, res, next) {
    try {
      const { address } = req.body;

      if (!address) {
        return res.status(400).json({
          success: false,
          message: 'Address is required'
        });
      }

      const locationData = await geocodingService.geocode(address);

      res.json({
        success: true,
        data: locationData
      });

    } catch (error) {
      logger.error(`Geocoding error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Reverse geocode coordinates
   * GET /api/location/reverse-geocode
   * Query: latitude, longitude
   */
  async reverseGeocode(req, res, next) {
    try {
      const { latitude, longitude } = req.query;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required'
        });
      }

      const locationData = await geocodingService.reverseGeocode(
        parseFloat(latitude),
        parseFloat(longitude)
      );

      res.json({
        success: true,
        data: locationData
      });

    } catch (error) {
      logger.error(`Reverse geocoding error: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new LocationController();