const express = require('express');
const router = express.Router();
const visualizationController = require('../controllers/visualizationController');

// GET /api/visualization/globe-data - Get data for 3D globe
router.get('/globe-data', visualizationController.getGlobeData);

// GET /api/visualization/timeline - Get timeline data
router.get('/timeline', visualizationController.getTimelineData);

// GET /api/visualization/heatmap - Get heatmap data
router.get('/heatmap', visualizationController.getHeatmapData);

// GET /api/visualization/animation-sequence - Get animation sequence
router.get('/animation-sequence', visualizationController.getAnimationSequence);

// GET /api/visualization/clusters - Get disaster clusters
router.get('/clusters', visualizationController.getClusters);

module.exports = router;