const Activity = require('../models/activity.model');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

/**
 * Create a new activity log
 * @param {Object} req - Express request object
 * @param {String} type - Type of activity (login, create, update, delete, etc.)
 * @param {String} entityType - Type of entity (user, project, etc.)
 * @param {String} entityId - ID of the entity
 * @param {String} title - Activity title
 * @param {String} description - Activity description
 * @param {Object} metadata - Additional metadata for the activity
 * @returns {Promise<Object>} Created activity document
 */
exports.createActivity = catchAsync(async (req, type, entityType, entityId, title, description, metadata = {}) => {
  try {
    // Skip logging for system or automated activities
    if (req.user && req.user.role === 'system') return null;

    const activityData = {
      user: req.user?._id,
      type,
      entityType,
      entityId,
      title,
      description,
      metadata: {
        ...metadata,
        method: req.method,
        url: req.originalUrl
      },
      ipAddress: req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress,
      userAgent: req.get('user-agent') || 'unknown'
    };

    // Create activity log
    const activity = await Activity.create(activityData);
    
    // Populate user data
    return Activity.populate(activity, { path: 'user', select: 'name email role' });
  } catch (error) {
    console.error('Error creating activity log:', error);
    return null; // Don't fail the request if activity logging fails
  }
});

/**
 * Get recent activities with filtering and pagination
 */
exports.getRecentActivities = catchAsync(async (req, res, next) => {
  try {
    const { 
      limit = 10, 
      page = 1,
      type, 
      entityType,
      entityId,
      userId,
      startDate,
      endDate
    } = req.query;
    
    // Build query
    const query = {};
    
    // Apply filters
    if (type) query.type = type;
    if (entityType) query.entityType = entityType;
    if (entityId) query.entityId = entityId;
    if (userId) query.user = userId;
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const [activities, total] = await Promise.all([
      Activity.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'name email role'),
      Activity.countDocuments(query)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.status(200).json({
      status: 'success',
      results: activities.length,
      data: {
        activities,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    next(new AppError('Error fetching activities', 500));
  }
});

/**
 * Get activities for a specific entity
 */
exports.getEntityActivities = catchAsync(async (req, res, next) => {
  try {
    const { entityType, entityId } = req.params;
    const { 
      limit = 10, 
      page = 1,
      type,
      startDate,
      endDate
    } = req.query;

    // Build query
    const query = { entityType, entityId };
    
    // Apply additional filters
    if (type) query.type = type;
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const [activities, total] = await Promise.all([
      Activity.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'name email role'),
      Activity.countDocuments(query)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      status: 'success',
      results: activities.length,
      data: {
        activities,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching entity activities:', error);
    next(new AppError('Error fetching entity activities', 500));
  }
});

/**
 * Get activities for a specific user or current user if no userId is provided
 */
exports.getUserActivities = catchAsync(async (req, res, next) => {
  try {
    const userId = req.params.userId || req.user._id;
    const { 
      limit = 10, 
      page = 1,
      type,
      entityType,
      startDate,
      endDate
    } = req.query;

    // Build query
    const query = { user: userId };
    
    // Apply additional filters
    if (type) query.type = type;
    if (entityType) query.entityType = entityType;
    
    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Execute query with pagination
    const [activities, total] = await Promise.all([
      Activity.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'name email role')
        .populate('entityId', 'title name'),
      Activity.countDocuments(query)
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / parseInt(limit));

    res.status(200).json({
      status: 'success',
      results: activities.length,
      data: {
        activities,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user activities:', error);
    next(new AppError('Error fetching user activities', 500));
  }
});

/**
 * Delete old activities (for cleanup purposes)
 * Can be called via cron job or admin endpoint
 */
exports.cleanupOldActivities = catchAsync(async (req, res, next) => {
  try {
    const { days = 90 } = req.query;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - parseInt(days));
    
    const result = await Activity.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
    
    res.status(200).json({
      status: 'success',
      message: `Deleted ${result.deletedCount} activities older than ${days} days`
    });
  } catch (error) {
    console.error('Error cleaning up old activities:', error);
    next(new AppError('Error cleaning up old activities', 500));
  }
});
