const express = require('express');
const router = express.Router();
const { getDashboardMetrics, getRecommendations } = require('../controllers/insightsController');

// Placeholder middleware if you have it implemented: router.use(authMiddleware);

router.get('/dashboard', getDashboardMetrics);
router.get('/recommendations', getRecommendations);

module.exports = router;
