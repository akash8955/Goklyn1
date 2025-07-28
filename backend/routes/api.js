const express = require('express');
const router = express.Router();

// Import route handlers
const authRoutes = require('./auth');
const galleryRoutes = require('./gallery');
const newsRoutes = require('./news');
const userRoutes = require('./users');
const projectRoutes = require('./projects');
const testimonialRoutes = require('./testimonials');
const eventRoutes = require('./events');
const internshipRoutes = require('./internships');
const activityRoutes = require('./activityRoutes');

// Debug log all route modules
console.log('[api.js] Route modules loaded:');
console.log('- authRoutes:', typeof authRoutes === 'function' ? '✓ Loaded' : '✗ Not loaded');
console.log('- galleryRoutes:', typeof galleryRoutes === 'object' ? '✓ Loaded' : '✗ Not loaded');
console.log('- newsRoutes:', typeof newsRoutes === 'object' ? '✓ Loaded' : '✗ Not loaded');
console.log('- userRoutes:', typeof userRoutes === 'object' ? '✓ Loaded' : '✗ Not loaded');
console.log('- projectRoutes:', typeof projectRoutes === 'object' ? '✓ Loaded' : '✗ Not loaded');
console.log('- testimonialRoutes:', typeof testimonialRoutes === 'object' ? '✓ Loaded' : '✗ Not loaded');
console.log('- eventRoutes:', typeof eventRoutes === 'object' ? '✓ Loaded' : '✗ Not loaded');
console.log('- internshipRoutes:', typeof internshipRoutes === 'object' ? '✓ Loaded' : '✗ Not loaded');
console.log('- activityRoutes:', typeof activityRoutes === 'object' ? '✓ Loaded' : '✗ Not loaded');

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Helper function to safely mount routes with error handling
const mountRoute = (path, routeModule) => {
  if (!routeModule) {
    console.warn(`⚠️  Skipping mount for ${path}: route module is undefined`);
    return false;
  }
  
  try {
    router.use(path, routeModule);
    console.log(`✅ Mounted route: ${path}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to mount route ${path}:`, error.message);
    console.error('Error details:', error);
    return false;
  }
};

// Mount all routes with detailed logging
const mountRoutes = () => {
  console.log('\n=== STARTING ROUTE MOUNTING PROCESS ===\n');
  
  // Mount health check endpoint first
  console.log('Mounting health check route...');
  router.get('/health', (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'API is running',
      timestamp: new Date().toISOString()
    });
  });
  console.log('✅ Health check route mounted successfully');
  
  // Mount auth routes
  try {
    console.log('\n=== MOUNTING AUTH ROUTES ===');
    router.use('/auth', authRoutes);
    console.log('✅ Auth routes mounted successfully');
  } catch (error) {
    console.error('❌ Error mounting auth routes:', error.message);
    console.error('Error details:', error);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
  
  // Mount all other routes with better error handling
  const routeConfigs = [
    { name: 'gallery', path: '/gallery', module: galleryRoutes },
    { name: 'news', path: '/news', module: newsRoutes },
    { name: 'users', path: '/users', module: userRoutes },
    { name: 'projects', path: '/projects', module: projectRoutes },
    { name: 'testimonials', path: '/testimonials', module: testimonialRoutes },
    { name: 'events', path: '/events', module: eventRoutes },
    { name: 'internships', path: '/internships', module: internshipRoutes },
    { name: 'activities', path: '/activities', module: activityRoutes }
  ];

  let successCount = 0;
  
  for (const config of routeConfigs) {
    console.log(`\n=== MOUNTING ${config.name.toUpperCase()} ROUTES ===`);
    const success = mountRoute(config.path, config.module);
    if (success) successCount++;
  }
  
  console.log(`\n=== ROUTE MOUNTING SUMMARY ===`);
  console.log(`✅ Successfully mounted: ${successCount} of ${routeConfigs.length} routes`);
  console.log(`⚠️  Skipped: ${routeConfigs.length - successCount} routes`);
  
  console.log('\n=== ROUTE MOUNTING COMPLETED ===\n');
};

try {
  console.log('Starting to mount all routes...');
  mountRoutes();
  console.log('All routes mounted successfully!');
} catch (error) {
  console.error('\n\nFATAL ERROR MOUNTING ROUTES:');
  console.error('Error:', error.message);
  console.error('Stack:', error.stack);
  console.error('\n\n');
  process.exit(1);
}

// 404 handler for /api/*
router.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'API endpoint not found'
  });
});

module.exports = router;
