const express = require('express');
const router = express.Router();
const disasterController = require('../controllers/disasterController');

// GET /api/disasters - Get all disasters with filters
router.get('/', disasterController.getAllDisasters);

// GET /api/disasters/stats - Get disaster statistics
router.get('/stats', disasterController.getStatistics);

// GET /api/disasters/active - Get active disasters
router.get('/active', disasterController.getActiveDisasters);

// GET /api/disasters/search - Search disasters
router.get('/search', disasterController.searchDisasters);

// POST /api/disasters/update-data - Update disaster data from APIs
router.post('/update-data', disasterController.updateDisasterData);

// GET /api/disasters/type/:type - Get disasters by type
router.get('/type/:type', disasterController.getDisastersByType);

// GET /api/disasters/:id - Get single disaster
router.get('/:id', disasterController.getDisasterById);

module.exports = router;