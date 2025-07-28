/* eslint-env node */
'use strict';

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const compression = require('compression');
const morgan = require('morgan');
const { setSecurityHeaders, xssFilter } = require('./middleware/security');
const { AppError } = require('./utils/appError');
const { globalErrorHandler } = require('./controllers/errorController');
const corsOptions = require('./config/corsOptions');
const { getRateLimiter } = require('./middleware/rateLimiter');

// Initialize express app
const app = express();

// 1) GLOBAL MIDDLEWARES

// Set security HTTP headers
app.use(helmet());
app.use(setSecurityHeaders);

// Development logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Apply rate limiting based on route and environment
app.use((req, res, next) => {
  const limiter = getRateLimiter(req);
  return limiter(req, res, next);
});

// Trust first proxy (important for rate limiting and secure cookies in production)
app.set('trust proxy', 1);

// Apply CORS middleware
app.use(cors(corsOptions));

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());
app.use(xssFilter);

// Prevent parameter pollution (must be after body parsers)
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

// Compress all responses
app.use(compression());

// 2) ROUTES
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the API',
    version: '1.0.0',
    documentation: '/api-docs'
  });
});

// API routes
const apiRouter = require('./routes/api');

// Mount routes without versioning
app.use('/api', apiRouter);

// 3) ERROR HANDLING
app.all('*', (req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Global error handling middleware
app.use(globalErrorHandler);

module.exports = app;
