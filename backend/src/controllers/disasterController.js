const Disaster = require('../models/Disaster');
const disasterDataService = require('../services/disasterDataService');
const logger = require('../utils/logger');
const { DISASTER_TYPES } = require('../config/constants');

class DisasterController {
  
  /**
   * Get all disasters with filters
   * GET /api/disasters
   * Query: type, severity, startDate, endDate, limit, page
   */
  async getAllDisasters(req, res, next) {
    try {
      const {
        type,
        severity,
        startDate,
        endDate,
        country,
        isActive,
        limit = 50,
        page = 1
      } = req.query;

      const query = {};

      if (type) query.type = type;
      if (severity) query.severity = { $gte: parseInt(severity) };
      if (country) query['location.country'] = new RegExp(country, 'i');
      if (isActive !== undefined) query.isActive = isActive === 'true';

      if (startDate || endDate) {
        query.dateOccurred = {};
        if (startDate) query.dateOccurred.$gte = new Date(startDate);
        if (endDate) query.dateOccurred.$lte = new Date(endDate);
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const disasters = await Disaster.find(query)
        .sort({ dateOccurred: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean();

      const total = await Disaster.countDocuments(query);

      res.json({
        success: true,
        data: {
          disasters,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });

    } catch (error) {
      logger.error(`Get disasters error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Get single disaster by ID
   * GET /api/disasters/:id
   */
  async getDisasterById(req, res, next) {
    try {
      const disaster = await Disaster.findById(req.params.id);

      if (!disaster) {
        return res.status(404).json({
          success: false,
          message: 'Disaster not found'
        });
      }

      res.json({
        success: true,
        data: disaster
      });

    } catch (error) {
      logger.error(`Get disaster by ID error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Get disasters by type
   * GET /api/disasters/type/:type
   */
  async getDisastersByType(req, res, next) {
    try {
      const { type } = req.params;
      const { limit = 50, page = 1 } = req.query;

      if (!Object.values(DISASTER_TYPES).includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid disaster type'
        });
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const disasters = await Disaster.find({ type })
        .sort({ dateOccurred: -1 })
        .limit(parseInt(limit))
        .skip(skip)
        .lean();

      const total = await Disaster.countDocuments({ type });

      res.json({
        success: true,
        data: {
          type,
          disasters,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / parseInt(limit))
          }
        }
      });

    } catch (error) {
      logger.error(`Get disasters by type error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Get active/ongoing disasters
   * GET /api/disasters/active
   */
  async getActiveDisasters(req, res, next) {
    try {
      const disasters = await Disaster.find({ isActive: true })
        .sort({ dateOccurred: -1 })
        .lean();

      res.json({
        success: true,
        data: {
          disasters,
          count: disasters.length
        }
      });

    } catch (error) {
      logger.error(`Get active disasters error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Get disaster statistics
   * GET /api/disasters/stats
   */
  async getStatistics(req, res, next) {
    try {
      const stats = {
        total: await Disaster.countDocuments(),
        active: await Disaster.countDocuments({ isActive: true }),
        byType: {},
        bySeverity: {},
        byYear: {}
      };

      // Count by type
      const typeAggregation = await Disaster.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);
      typeAggregation.forEach(item => {
        stats.byType[item._id] = item.count;
      });

      // Count by severity
      const severityAggregation = await Disaster.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ]);
      severityAggregation.forEach(item => {
        stats.bySeverity[item._id] = item.count;
      });

      // Count by year
      const yearAggregation = await Disaster.aggregate([
        {
          $group: {
            _id: { $year: '$dateOccurred' },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: -1 } }
      ]);
      yearAggregation.forEach(item => {
        stats.byYear[item._id] = item.count;
      });

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      logger.error(`Get statistics error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Search disasters
   * GET /api/disasters/search
   * Query: q (search query)
   */
  async searchDisasters(req, res, next) {
    try {
      const { q, limit = 20 } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const disasters = await Disaster.find({
        $or: [
          { title: new RegExp(q, 'i') },
          { description: new RegExp(q, 'i') },
          { 'location.city': new RegExp(q, 'i') },
          { 'location.country': new RegExp(q, 'i') }
        ]
      })
        .sort({ dateOccurred: -1 })
        .limit(parseInt(limit))
        .lean();

      res.json({
        success: true,
        data: {
          query: q,
          disasters,
          count: disasters.length
        }
      });

    } catch (error) {
      logger.error(`Search disasters error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Update disaster data from external APIs
   * POST /api/disasters/update-data
   */
  async updateDisasterData(req, res, next) {
    try {
      logger.info('Starting disaster data update...');

      // Fetch from NASA EONET
      const nasaDisasters = await disasterDataService.fetchFromNASA(365);
      const nasaResult = await disasterDataService.saveDisasters(nasaDisasters);

      // Fetch from ReliefWeb
      const reliefWebDisasters = await disasterDataService.fetchFromReliefWeb(100);
      const reliefWebResult = await disasterDataService.saveDisasters(reliefWebDisasters);

      const totalSaved = nasaResult.savedCount + reliefWebResult.savedCount;
      const totalUpdated = nasaResult.updatedCount + reliefWebResult.updatedCount;

      logger.info(`Data update complete: ${totalSaved} saved, ${totalUpdated} updated`);

      res.json({
        success: true,
        data: {
          saved: totalSaved,
          updated: totalUpdated,
          sources: {
            nasa: nasaResult,
            reliefWeb: reliefWebResult
          }
        }
      });

    } catch (error) {
      logger.error(`Update disaster data error: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new DisasterController();