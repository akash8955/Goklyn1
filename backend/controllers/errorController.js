/* eslint-disable no-unused-vars */
'use strict';

const AppError = require('../utils/appError');
const { NODE_ENV } = require('../config');

/**
 * Handle MongoDB cast errors (invalid ID format)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB duplicate field errors
 */
const handleDuplicateFieldsDB = (err) => {
  const value = err.errmsg.match(/(["'])(\\.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB validation errors
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Send error details in development environment
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Send error details in production environment
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // 1) Log error
    console.error('ERROR ', err);

    // 2) Send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

/**
 * Global error handling middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

    sendErrorProd(error, res);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  // Close server and exit process
  if (typeof server !== 'undefined') {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
};

/**
 * Async error handler wrapper (catchAsync)
 * Wraps async functions to automatically catch errors and pass them to next()
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => next(err));
};

/**
 * Custom error handler for API routes
 */
const apiErrorHandler = (err, req, res, next) => {
  console.error('API Error:', err);
  
  // Default error response
  const statusCode = err.statusCode || 500;
  const response = {
    status: 'error',
    message: err.message || 'Internal Server Error',
  };

  // Include stack trace in development
  if (NODE_ENV === 'development') {
    response.stack = err.stack;
    response.error = {
      name: err.name,
      code: err.code,
      details: err.errors,
    };
  }

  // Handle specific error types
  if (err.name === 'ValidationError') {
    response.status = 'fail';
    response.message = 'Validation Error';
    response.errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    response.status = 'fail';
    response.message = 'Authentication failed';
  }

  // Send the response
  res.status(statusCode).json(response);
};

module.exports = {
  globalErrorHandler,
  notFound,
  catchAsync,
  apiErrorHandler,
};
