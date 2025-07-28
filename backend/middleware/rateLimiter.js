const rateLimit = require('express-rate-limit');
const { TOO_MANY_REQUESTS } = require('http-status-codes');

// Development-friendly rate limiting
const isProduction = process.env.NODE_ENV === 'production';

// Rate limiting middleware with higher limits for development
const apiLimiter = rateLimit({
  windowMs: isProduction ? 15 * 60 * 1000 : 5 * 60 * 1000, // 15 min in prod, 5 min in dev
  max: isProduction ? 200 : 1000, // Higher limit in development
  message: {
    status: 'error',
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: TOO_MANY_REQUESTS,
  skip: (req) => {
    // Skip rate limiting for certain paths in development
    if (!isProduction) {
      return ['/api/v1/news', '/api/v1/gallery', '/api/v1/activities', '/api/v1/events']
        .some(path => req.path.startsWith(path));
    }
    return false;
  }
});

// More aggressive rate limiting for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 20 : 50, // Higher limit in development
  message: {
    status: 'error',
    message: 'Too many login attempts from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: TOO_MANY_REQUESTS,
  // Allow more failed login attempts in development
  skipFailedRequests: !isProduction
});

// Special limiter for public API endpoints
const publicApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isProduction ? 60 : 300, // 1 request per second in prod, 5 in dev
  message: {
    status: 'error',
    message: 'Too many requests, please slow down.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  statusCode: TOO_MANY_REQUESTS
});

// Apply different limiters based on environment
const getRateLimiter = (req) => {
  // Skip rate limiting for certain paths in development
  if (!isProduction) {
    const publicPaths = ['/api/v1/news', '/api/v1/gallery', '/api/v1/activities', '/api/v1/events'];
    if (publicPaths.some(path => req.path.startsWith(path))) {
      return publicApiLimiter;
    }
  }
  
  // Default to standard API limiter
  return apiLimiter;
};

module.exports = {
  apiLimiter,
  authLimiter,
  publicApiLimiter,
  getRateLimiter
};
