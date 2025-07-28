const winston = require('winston');
const path = require('path');
const { createLogger, format, transports } = winston;
const { combine, timestamp, printf, colorize, json } = format;

// Ensure logs directory exists
const fs = require('fs');
const logDir = 'logs';

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Custom format for console output
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
  let log = `${timestamp} [${level.toUpperCase()}] ${message}`;
  
  // Add metadata if it exists
  if (Object.keys(meta).length > 0) {
    // Remove stack trace from meta if it exists
    const { stack, ...restMeta } = meta;
    log += ` ${JSON.stringify(restMeta, null, 2)}`;
    
    // Add stack trace if it exists
    if (stack) {
      log += `\n${stack}`;
    }
  }
  
  return log;
});

// Create logger instance
const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug', 
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'backend' },
  transports: [
    // Write all logs with level 'error' and below to 'error.log'
    new transports.File({ 
      filename: path.join(logDir, 'error.log'), 
      level: 'error',
      maxsize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    // Write all logs with level 'info' and below to 'combined.log'
    new transports.File({ 
      filename: path.join(logDir, 'combined.log'),
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
      tailable: true
    })
  ],
  exitOnError: false
});

// If we're not in production, also log to the console with colors
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: combine(
      colorize(),
      timestamp({ format: 'HH:mm:ss' }),
      consoleFormat
    ),
    level: 'debug'
  }));
}

// Create a stream for morgan
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  // Don't exit in development to allow for debugging
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = logger;
