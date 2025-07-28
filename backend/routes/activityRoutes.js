const express = require('express');
const activityController = require('../controllers/activityController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

// Debug: Log all activity controller methods
console.log('Activity Controller Methods:');
console.log('- getRecentActivities:', typeof activityController.getRecentActivities);
console.log('- getEntityActivities:', typeof activityController.getEntityActivities);
console.log('- getUserActivities:', typeof activityController.getUserActivities);
console.log('- cleanupOldActivities:', typeof activityController.cleanupOldActivities);

// Define routes with error handling
const defineRoute = (method, path, handler) => {
  if (typeof handler !== 'function') {
    console.error(`Error: Handler for ${method.toUpperCase()} ${path} is not a function`);
    throw new Error(`Handler for ${method.toUpperCase()} ${path} is not a function`);
  }
  return router[method](path, handler);
};

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: Activity logging and retrieval
 */

// Get recent activities
/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Get recent activities
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of activities to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by activity type
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *         description: Filter by entity type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (ISO format)
 *     responses:
 *       200:
 *         description: List of activities
 */
defineRoute('get', '/', activityController.getRecentActivities);

// Get activities for a specific entity
/**
 * @swagger
 * /api/activities/entity/{entityType}/{entityId}:
 *   get:
 *     summary: Get activities for a specific entity
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *         description: Type of the entity (e.g., 'user', 'project')
 *       - in: path
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the entity
 *     responses:
 *       200:
 *         description: List of activities for the specified entity
 */
defineRoute('get', '/entity/:entityType/:entityId', activityController.getEntityActivities);

// Get activities for a specific user or current user
/**
 * @swagger
 * /api/activities/user/me:
 *   get:
 *     summary: Get activities for the current user
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of activities for the current user
 */
/**
 * @swagger
 * /api/activities/user/{userId}:
 *   get:
 *     summary: Get activities for a specific user (admin only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       200:
 *         description: List of activities for the specified user
 */
defineRoute('get', '/user/me', activityController.getUserActivities);
defineRoute('get', '/user/:userId', authorize('admin'), activityController.getUserActivities);

// Clean up old activities (admin only)
/**
 * @swagger
 * /api/activities/cleanup:
 *   delete:
 *     summary: Clean up old activities (Admin only)
 *     tags: [Activities]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 90
 *         description: Delete activities older than this many days
 *     responses:
 *       200:
 *         description: Success message with number of activities deleted
 */
defineRoute('delete', '/cleanup', authorize('admin'), activityController.cleanupOldActivities);

module.exports = router;
