/* eslint-disable no-console */
'use strict';

// Load environment variables first
require('dotenv').config({ path: '.env' });

const express = require('express');
const app = express();

// Set up environment variables for email service
process.env.EMAIL_USERNAME = process.env.EMAIL_USERNAME || 'akashsinghshekhawat9@gmail.com';
process.env.EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || 'jiocolloiifjjsdb';
process.env.EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';
process.env.EMAIL_PORT = process.env.EMAIL_PORT || 587;

// Log environment variables for debugging
console.log('Environment Variables:');
console.log(`- EMAIL_USERNAME: ${process.env.EMAIL_USERNAME ? '***' : 'Not set'}`);
console.log(`- EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? '***' : 'Not set'}`);
console.log(`- EMAIL_SERVICE: ${process.env.EMAIL_SERVICE}`);
console.log(`- EMAIL_PORT: ${process.env.EMAIL_PORT}`);

// Middleware to parse JSON
app.use(express.json());

// Minimal test route
app.get('/test', (req, res) => {
  res.json({ 
    status: 'success',
    message: 'Test route is working!',
    env: {
      emailService: process.env.EMAIL_SERVICE,
      emailUser: process.env.EMAIL_USERNAME ? '***' : 'Not set',
      nodeEnv: process.env.NODE_ENV
    }
  });
});

// Import and test auth routes
console.log('\n=== Testing auth routes ===');
try {
  // Load the auth router
  console.log('Loading auth router...');
  const authRouter = require('./routes/auth');
  
  // Log all routes in the auth router
  console.log('\nAuth router stack:');
  if (!authRouter || !authRouter.stack) {
    console.error('❌ Auth router or its stack is undefined');
    process.exit(1);
  }

  authRouter.stack.forEach((layer, i) => {
    if (layer.route) {
      // This is a route
      const methods = Object.keys(layer.route.methods).map(method => method.toUpperCase()).join(', ');
      console.log(`- ${methods} ${layer.route.path} (${layer.name || 'anonymous'})`);
    } else if (layer.name === 'router') {
      // This is a router
      console.log(`\nSub-router at ${layer.regexp}:`);
      if (!layer.handle || !layer.handle.stack) {
        console.error(`  ❌ Sub-router at index ${i} has no valid stack`);
        return;
      }
      layer.handle.stack.forEach((sublayer, subIndex) => {
        if (sublayer.route) {
          const methods = Object.keys(sublayer.route.methods).map(method => method.toUpperCase()).join(', ');
          console.log(`  - ${methods} ${sublayer.route.path} (${sublayer.name || 'anonymous'})`);
        } else {
          console.log(`  - Middleware: ${sublayer.name || 'anonymous'}`);
        }
      });
    } else {
      console.log(`- Middleware: ${layer.name || 'anonymous'}`);
    }
  });
  
  // Mount the auth router
  console.log('\nMounting auth router...');
  app.use('/auth', authRouter);
  console.log('✅ Auth routes mounted successfully');
} catch (error) {
  console.error('❌ Error mounting auth routes:');
  console.error(error);
  if (error.stack) {
    console.error('\nStack trace:');
    console.error(error.stack);
  }
  process.exit(1);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start the server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`\nTest server running on port ${PORT}`);
  console.log(`Test endpoint: http://localhost:${PORT}/test`);
  console.log(`Auth test endpoint: http://localhost:${PORT}/auth/health`);
});
