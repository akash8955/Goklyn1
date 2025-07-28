const Project = require('../models/project.model');
const Application = require('../models/application.model');
const User = require('../models/user.model');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    // Get total projects count
    const totalProjects = await Project.countDocuments();
    
    // Get total internship applications count
    const internshipSubmissions = await Application.countDocuments();
    
    // Get active users count (users who logged in within last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo }
    });

    // Get view count (this would come from your analytics service)
    // For now, we'll use a placeholder
    const totalViews = 0; // Replace with actual analytics query

    // Get recent activities
    const recentActivities = await Application.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('internship', 'title')
      .select('name email createdAt internship');

    // Format activities
    const activities = recentActivities.map(app => ({
      id: app._id,
      type: 'submission',
      title: 'New application submitted',
      description: `${app.name} applied for ${app.internship?.title || 'an internship'}`,
      time: app.createdAt,
      icon: 'submission'
    }));

    res.json({
      success: true,
      data: {
        stats: {
          totalViews,
          internshipSubmissions,
          totalProjects,
          activeUsers
        },
        activities
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard statistics',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get analytics data for charts
exports.getAnalyticsData = async (req, res) => {
  try {
    // Get last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get daily submissions for the last 30 days
    const submissionsData = await Application.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format the data for the chart
    const dates = [];
    const submissions = [];
    const views = []; // This would come from your analytics service
    
    // Initialize all dates with 0
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      const dateStr = date.toISOString().split('T')[0];
      dates.push(dateStr);
      
      // Find matching data point or use 0
      const dataPoint = submissionsData.find(d => d._id === dateStr);
      submissions.push(dataPoint ? dataPoint.count : 0);
      
      // For demo, generate some random view data
      views.push(Math.floor(Math.random() * 50) + 10);
    }

    res.json({
      success: true,
      data: {
        dates,
        submissions,
        views
      }
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
