const Disaster = require('../models/Disaster');
const { ANIMATION_CONFIGS, DISASTER_COLORS } = require('../config/constants');
const logger = require('../utils/logger');

class VisualizationController {
  
  /**
   * Get disasters formatted for 3D globe visualization
   * GET /api/visualization/globe-data
   * Query: startDate, endDate, types, severity
   */
  async getGlobeData(req, res, next) {
    try {
      const {
        startDate,
        endDate,
        types,
        severity,
        limit = 500
      } = req.query;

      const query = {};

      if (types) {
        query.type = { $in: types.split(',') };
      }

      if (severity) {
        query.severity = { $gte: parseInt(severity) };
      }

      if (startDate || endDate) {
        query.dateOccurred = {};
        if (startDate) query.dateOccurred.$gte = new Date(startDate);
        if (endDate) query.dateOccurred.$lte = new Date(endDate);
      }

      const disasters = await Disaster.find(query)
        .sort({ dateOccurred: -1 })
        .limit(parseInt(limit))
        .select('type title dateOccurred location severity magnitude casualties isActive')
        .lean();

      // Format for 3D visualization
      const formattedData = disasters.map(disaster => ({
        id: disaster._id,
        type: disaster.type,
        title: disaster.title,
        coordinates: {
          lat: disaster.location.coordinates[1],
          lng: disaster.location.coordinates[0]
        },
        date: disaster.dateOccurred,
        severity: disaster.severity,
        magnitude: disaster.magnitude,
        casualties: disaster.casualties,
        isActive: disaster.isActive,
        color: DISASTER_COLORS[disaster.type] || '#808080',
        animationConfig: ANIMATION_CONFIGS[disaster.type] || {
          type: 'pulse',
          color: 0x808080,
          duration: 2000,
          intensity: 'medium'
        }
      }));

      res.json({
        success: true,
        data: {
          disasters: formattedData,
          count: formattedData.length,
          filters: {
            startDate: startDate || null,
            endDate: endDate || null,
            types: types ? types.split(',') : null,
            severity: severity || null
          }
        }
      });

    } catch (error) {
      logger.error(`Get globe data error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Get timeline data for disaster visualization
   * GET /api/visualization/timeline
   * Query: startYear, endYear, type
   */
  async getTimelineData(req, res, next) {
    try {
      const {
        startYear = new Date().getFullYear() - 10,
        endYear = new Date().getFullYear(),
        type
      } = req.query;

      const query = {
        dateOccurred: {
          $gte: new Date(`${startYear}-01-01`),
          $lte: new Date(`${endYear}-12-31`)
        }
      };

      if (type) {
        query.type = type;
      }

      // Aggregate by month and year
      const timeline = await Disaster.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              year: { $year: '$dateOccurred' },
              month: { $month: '$dateOccurred' },
              type: '$type'
            },
            count: { $sum: 1 },
            avgSeverity: { $avg: '$severity' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]);

      // Format timeline data
      const formattedTimeline = timeline.map(item => ({
        year: item._id.year,
        month: item._id.month,
        type: item._id.type,
        count: item.count,
        avgSeverity: Math.round(item.avgSeverity * 10) / 10,
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`
      }));

      res.json({
        success: true,
        data: {
          timeline: formattedTimeline,
          range: {
            startYear: parseInt(startYear),
            endYear: parseInt(endYear)
          }
        }
      });

    } catch (error) {
      logger.error(`Get timeline data error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Get heatmap data for disaster intensity
   * GET /api/visualization/heatmap
   */
  async getHeatmapData(req, res, next) {
    try {
      const { type, year } = req.query;

      const query = {};

      if (type) query.type = type;
      
      if (year) {
        query.dateOccurred = {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`)
        };
      }

      // Aggregate disasters by location
      const heatmapData = await Disaster.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              lat: { $arrayElemAt: ['$location.coordinates', 1] },
              lng: { $arrayElemAt: ['$location.coordinates', 0] }
            },
            count: { $sum: 1 },
            maxSeverity: { $max: '$severity' },
            types: { $addToSet: '$type' }
          }
        }
      ]);

      const formattedHeatmap = heatmapData.map(item => ({
        lat: item._id.lat,
        lng: item._id.lng,
        intensity: item.count * item.maxSeverity,
        count: item.count,
        maxSeverity: item.maxSeverity,
        types: item.types
      }));

      res.json({
        success: true,
        data: {
          points: formattedHeatmap,
          count: formattedHeatmap.length
        }
      });

    } catch (error) {
      logger.error(`Get heatmap data error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Get disaster animation sequences for the globe
   * GET /api/visualization/animation-sequence
   * Query: startDate, endDate, speed
   */
  async getAnimationSequence(req, res, next) {
    try {
      const {
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        endDate = new Date().toISOString(),
        speed = 'normal'
      } = req.query;

      const disasters = await Disaster.find({
        dateOccurred: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
        .sort({ dateOccurred: 1 })
        .lean();

      // Create animation frames
      const frames = [];
      let currentFrame = [];
      let currentDate = null;

      disasters.forEach((disaster, index) => {
        const disasterDate = new Date(disaster.dateOccurred).toDateString();

        if (currentDate !== disasterDate) {
          if (currentFrame.length > 0) {
            frames.push({
              date: currentDate,
              disasters: currentFrame,
              count: currentFrame.length
            });
          }
          currentFrame = [];
          currentDate = disasterDate;
        }

        currentFrame.push({
          id: disaster._id,
          type: disaster.type,
          title: disaster.title,
          coordinates: {
            lat: disaster.location.coordinates[1],
            lng: disaster.location.coordinates[0]
          },
          severity: disaster.severity,
          animationConfig: ANIMATION_CONFIGS[disaster.type]
        });
      });

      // Add last frame
      if (currentFrame.length > 0) {
        frames.push({
          date: currentDate,
          disasters: currentFrame,
          count: currentFrame.length
        });
      }

      // Calculate speed multiplier
      const speedMultipliers = {
        slow: 1,
        normal: 2,
        fast: 4,
        veryfast: 8
      };

      res.json({
        success: true,
        data: {
          frames,
          totalFrames: frames.length,
          totalDisasters: disasters.length,
          config: {
            speed: speed,
            speedMultiplier: speedMultipliers[speed] || 2,
            dateRange: {
              start: startDate,
              end: endDate
            }
          }
        }
      });

    } catch (error) {
      logger.error(`Get animation sequence error: ${error.message}`);
      next(error);
    }
  }

  /**
   * Get disaster clusters for efficient rendering
   * GET /api/visualization/clusters
   */
  async getClusters(req, res, next) {
    try {
      const { zoom = 3, bounds } = req.query;

      let query = {};

      // If bounds provided, filter by bounding box
      if (bounds) {
        const [minLng, minLat, maxLng, maxLat] = bounds.split(',').map(parseFloat);
        query['location.coordinates'] = {
          $geoWithin: {
            $box: [
              [minLng, minLat],
              [maxLng, maxLat]
            ]
          }
        };
      }

      // Determine cluster precision based on zoom level
      const precision = Math.max(1, Math.min(5, Math.floor(zoom / 3)));

      const clusters = await Disaster.aggregate([
        { $match: query },
        {
          $group: {
            _id: {
              lat: { $round: [{ $arrayElemAt: ['$location.coordinates', 1] }, precision] },
              lng: { $round: [{ $arrayElemAt: ['$location.coordinates', 0] }, precision] }
            },
            count: { $sum: 1 },
            types: { $addToSet: '$type' },
            maxSeverity: { $max: '$severity' },
            disasters: { $push: '$$ROOT' }
          }
        }
      ]);

      const formattedClusters = clusters.map(cluster => ({
        lat: cluster._id.lat,
        lng: cluster._id.lng,
        count: cluster.count,
        types: cluster.types,
        maxSeverity: cluster.maxSeverity,
        disasters: cluster.count <= 10 ? cluster.disasters : []
      }));

      res.json({
        success: true,
        data: {
          clusters: formattedClusters,
          totalClusters: formattedClusters.length,
          zoom: parseInt(zoom)
        }
      });

    } catch (error) {
      logger.error(`Get clusters error: ${error.message}`);
      next(error);
    }
  }
}

module.exports = new VisualizationController();