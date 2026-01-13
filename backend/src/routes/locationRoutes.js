const express = require('express');
const router = express.Router();
const locationController = require('../controllers/locationController');
const { validateLocationAnalysis, validateCoordinates } = require('../utils/validators');

// POST /api/location/analyze - Analyze location for disaster risks
router.post('/analyze', validateLocationAnalysis, locationController.analyzeLocation);

// GET /api/location/nearby-cities - Get nearby cities
router.get('/nearby-cities', validateCoordinates, locationController.getNearbyCities);

// POST /api/location/geocode - Convert address to coordinates
router.post('/geocode', locationController.geocode);

// GET /api/location/reverse-geocode - Convert coordinates to address
router.get('/reverse-geocode', validateCoordinates, locationController.reverseGeocode);

module.exports = router;