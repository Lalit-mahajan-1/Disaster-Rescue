/**
 * Validation middleware functions
 */

const validateLocationAnalysis = (req, res, next) => {
  const { address, latitude, longitude } = req.body;

  if (!address && (!latitude || !longitude)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide either an address or coordinates (latitude and longitude)'
    });
  }

  if (latitude && (latitude < -90 || latitude > 90)) {
    return res.status(400).json({
      success: false,
      message: 'Latitude must be between -90 and 90'
    });
  }

  if (longitude && (longitude < -180 || longitude > 180)) {
    return res.status(400).json({
      success: false,
      message: 'Longitude must be between -180 and 180'
    });
  }

  next();
};

const validateCoordinates = (req, res, next) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({
      success: false,
      message: 'Both latitude and longitude are required'
    });
  }

  const lat = parseFloat(latitude);
  const lon = parseFloat(longitude);

  if (isNaN(lat) || lat < -90 || lat > 90) {
    return res.status(400).json({
      success: false,
      message: 'Invalid latitude. Must be between -90 and 90'
    });
  }

  if (isNaN(lon) || lon < -180 || lon > 180) {
    return res.status(400).json({
      success: false,
      message: 'Invalid longitude. Must be between -180 and 180'
    });
  }

  next();
};

const validatePagination = (req, res, next) => {
  const { page = 1, limit = 50 } = req.query;

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  if (isNaN(pageNum) || pageNum < 1) {
    return res.status(400).json({
      success: false,
      message: 'Page must be a positive integer'
    });
  }

  if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
    return res.status(400).json({
      success: false,
      message: 'Limit must be between 1 and 100'
    });
  }

  next();
};

module.exports = {
  validateLocationAnalysis,
  validateCoordinates,
  validatePagination
};