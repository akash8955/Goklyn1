const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const { getDashboardStats, getAnalyticsData } = require('../controllers/analytics.controller');

/**
 * @route   GET /api/analytics/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin)
 */
router.get('/stats', protect, isAdmin, getDashboardStats);

/**
 * @route   GET /api/analytics/data
 * @desc    Get analytics data for charts
 * @access  Private (Admin)
 */
router.get('/data', protect, isAdmin, getAnalyticsData);

module.exports = router;
