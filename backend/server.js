/* eslint-env node */
'use strict';

const app = require('./app');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Import all models to ensure they're registered before any queries
require('./models');


// Load environment variables first
dotenv.config({ path: './.env' });

// Set default values for optional environment variables
const envDefaults = {
  NODE_ENV: 'development',
  PORT: 5000,
  JWT_SECRET: process.env.JWT_SECRET || 'default-jwt-secret-please-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRE || '90d',
  JWT_COOKIE_EXPIRES_IN: process.env.JWT_COOKIE_EXPIRE || 90,
  EMAIL_SERVICE: 'gmail',
  EMAIL_PORT: 587,
  EMAIL_SECURE: false
};

// Apply defaults for missing environment variables
Object.entries(envDefaults).forEach(([key, value]) => {
  if (process.env[key] === undefined) {
    process.env[key] = value;
    if (key !== 'NODE_ENV' && key !== 'PORT') {
      console.warn(`Using default value for ${key}. This should be set in production.`);
    }
  }
});

// Validate required environment variables
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'JWT_SECRET',
  'MONGO_URI'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars.join(', '));
  process.exit(1);
}

// Handle uncaught exceptions (synchronous errors)
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error:', err.name, err.message);
  console.error(err.stack);
  process.exit(1);
});

// Connect to MongoDB with retry logic
const connectWithRetry = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('MONGO_URI not provided. Skipping database connection.');
      return;
    }

    const mongooseOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    await mongoose.connect(process.env.MONGO_URI, mongooseOptions);
    console.log('MongoDB connection successful!');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectWithRetry, 5000);
  }
};

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB if MONGO_URI is provided
    if (process.env.MONGO_URI) {
      await connectWithRetry();
    } else {
      console.log('No database connection configured. Running in API-only mode.');
    }
    
    // Initialize email service if Brevo credentials are provided
    if (process.env.BREVO_SENDER_EMAIL && process.env.BREVO_API_KEY) {
      try {
        // The Email class is already set up to use Brevo SMTP
        console.log('Email service configured with Brevo SMTP');
      } catch (emailError) {
        console.error('Error initializing email service:', emailError.message);
      }
    } else {
      console.log('Email service not configured. Set BREVO_SENDER_EMAIL and BREVO_API_KEY to enable email functionality.');
    }

    const port = process.env.PORT || 3000;
    const server = app.listen(port, () => {
      console.log(`App running on port ${port} in ${process.env.NODE_ENV} mode...`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error('UNHANDLED REJECTION! Shutting down...');
      console.error('Error:', err.name, err.message);
      
      // Gracefully close the server
      server.close(() => {
        console.log('Process terminated!');
        process.exit(1);
      });
    });

    // Graceful shutdown handler
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Shutting down gracefully...`);
      
      try {
        // Close the server first to stop new connections
        await new Promise((resolve) => server.close(resolve));
        
        // Close database connection
        await mongoose.connection.close(false);
        console.log('MongoDB connection closed');
        
        console.log('Graceful shutdown complete');
        process.exit(0);
      } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
      }
    };

    // Handle different termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // For nodemon restarts
    process.once('SIGUSR2', async () => {
      await gracefulShutdown('SIGUSR2');
      process.kill(process.pid, 'SIGUSR2');
    });

    // Export for testing
    return server;
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
const server = startServer();

// Export for testing
module.exports = server;
