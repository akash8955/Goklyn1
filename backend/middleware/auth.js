const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('../models/user.model');
const { AppError } = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Security configuration
const MAX_LOGIN_ATTEMPTS = parseInt(process.env.MAX_LOGIN_ATTEMPTS) || 5;
const ACCOUNT_LOCK_TIME = parseInt(process.env.ACCOUNT_LOCK_TIME) || 30; // minutes

// Rate limiting for authentication routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: 'Too many login attempts from this IP, please try again after 15 minutes',
  skipSuccessfulRequests: true, // Only count failed requests
  handler: (req, res, next) => {
    next(new AppError('Too many requests, please try again later', 429));
  }
});

// Security headers middleware
exports.setSecurityHeaders = (req, res, next) => {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Enable XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Set Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:;"
  );
  
  // Set HSTS header (only in production)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  next();
};

// Middleware to protect routes - requires authentication
exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // 1) Get token and check if it exists
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies?.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      return next(
        new AppError('You are not logged in! Please log in to get access.', 401)
      );
    }

    // 2) Verify token
    let decoded;
    try {
      console.log('Verifying token...');
      decoded = await jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified successfully. User ID:', decoded.id);
    } catch (error) {
      console.error('Token verification failed:', error.message);
      if (error.name === 'TokenExpiredError') {
        return next(new AppError('Your token has expired! Please log in again.', 401));
      }
      if (error.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token. Please log in again!', 401));
      }
      return next(new AppError('Authentication failed. Please log in again!', 401));
    }

    // 3) Check if user still exists and include isActive field
    console.log('Fetching user with ID:', decoded.id);
    const currentUser = await User.findById(decoded.id).select('+passwordChangedAt +isActive +failedLoginAttempts +accountLockedUntil');
    
    if (!currentUser) {
      console.error('No user found with ID:', decoded.id);
      return next(
        new AppError('The user belonging to this token no longer exists.', 401)
      );
    }

    // 4) Check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError('User recently changed password! Please log in again.', 401)
      );
    }

    // 5) Check if account is active
    if (!currentUser.isActive) {
      return next(
        new AppError('Your account has been deactivated. Please contact support.', 403)
      );
    }

    // 6) Check if account is locked due to too many failed login attempts
    if (currentUser.isAccountLocked()) {
      const timeLeft = Math.ceil((currentUser.accountLockedUntil - Date.now()) / 60000);
      return next(
        new AppError(
          `Account temporarily locked. Try again in ${timeLeft} minutes or reset your password.`,
          429
        )
      );
    }

    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    // Clear the invalid token from cookies
    res.clearCookie('jwt');
    
    let errorMessage = 'Not authorized, token failed';
    
    if (error.name === 'TokenExpiredError') {
      errorMessage = 'Your session has expired. Please log in again.';
    } else if (error.name === 'JsonWebTokenError') {
      errorMessage = 'Invalid token. Please log in again.';
    }
    
    return res.status(401).json({ 
      success: false, 
      message: errorMessage 
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return next(new AppError('You need to be logged in to access this route', 401));
    }
    
    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `Role '${req.user.role}' is not authorized to access this route`,
          403
        )
      );
    }
    
    next();
  };
};

// Middleware to check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return next(new AppError('Admin access required', 403));
};

// Middleware to check if user is admin or sub-admin
exports.isAdminOrSubAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'sub-admin')) {
    return next();
  }
  return next(new AppError('Admin or sub-admin access required', 403));
};

// Middleware to check if user is the owner of the resource or admin
exports.isOwnerOrAdmin = (model, paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const doc = await model.findById(req.params[paramName]);
      
      if (!doc) {
        return next(new AppError('No document found with that ID', 404));
      }
      
      // Check if user is admin or the owner of the document
      if (doc.user && doc.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(
          new AppError('You do not have permission to perform this action', 403)
        );
      }
      
      // If the document doesn't have a user field, only admin can access
      if (!doc.user && req.user.role !== 'admin') {
        return next(
          new AppError('Admin access required for this action', 403)
        );
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

// Export the rate limiter
exports.authLimiter = authLimiter;
