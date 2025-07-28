/* eslint-env node */
'use strict';

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate a nonce for CSP
 */
const generateNonce = () => `'nonce-${crypto.randomBytes(16).toString('base64')}'`;

/**
 * Set security headers middleware
 */
const setSecurityHeaders = (req, res, next) => {
  // Generate a new nonce for each request
  const nonce = generateNonce();
  
  // Set nonce in res.locals for use in views
  res.locals.nonce = nonce;

  // Content Security Policy
  // Note: Update these directives based on your application's requirements
  const csp = [
    "default-src 'self'",
    `script-src 'self' ${nonce} 'unsafe-inline' 'unsafe-eval'`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://res.cloudinary.com",
    "connect-src 'self' https://*.cloudinary.com",
    "frame-src 'self' https://www.youtube.com https://www.google.com",
    "media-src 'self' blob: https://res.cloudinary.com",
  ].join('; ');

  // Security Headers
  res.setHeader('Content-Security-Policy', csp);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Feature-Policy', "geolocation 'self'; microphone 'none'; camera 'none'");
  
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  next();
};

/**
 * XSS Filter middleware
 */
const xssFilter = (req, res, next) => {
  // Sanitize request body, query, and params
  const sanitize = (data) => {
    if (!data) return data;
    
    if (typeof data === 'string') {
      // Remove any script tags and event handlers
      return data
        .replace(/<\/?(script|iframe|object|embed|applet|frame|frameset|ilayer|layer|bgsound|base|link).*?>/gi, '')
        .replace(/on\w+=\s*"[^"]*"/g, '')
        .replace(/on\w+=\s*'[^']*'/g, '')
        .replace(/on\w+=\s*[^\s>]+/g, '');
    }
    
    if (Array.isArray(data)) {
      return data.map(item => sanitize(item));
    }
    
    if (typeof data === 'object') {
      const sanitized = {};
      Object.keys(data).forEach(key => {
        sanitized[key] = sanitize(data[key]);
      });
      return sanitized;
    }
    
    return data;
  };

  // Sanitize request body, query, and params
  if (req.body) req.body = sanitize(req.body);
  if (req.query) req.query = sanitize(req.query);
  if (req.params) req.params = sanitize(req.params);
  
  next();
};

// Request ID middleware for tracking requests
const requestId = (req, res, next) => {
  req.requestId = uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Rate limiting middleware
const rateLimiter = (windowMs = 15 * 60 * 1000, max = 100) => {
  const rateLimit = require('express-rate-limit');
  return rateLimit({
    windowMs,
    max,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// CSRF protection middleware
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET, HEAD, and OPTIONS requests
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // Get token from headers or body
  const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
  
  // Verify token
  if (!csrfToken || csrfToken !== req.cookies._csrf) {
    return res.status(403).json({
      status: 'error',
      message: 'Invalid CSRF token',
    });
  }
  
  next();
};

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.CLIENT_URL 
    : 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
  ],
};

module.exports = {
  setSecurityHeaders,
  xssFilter,
  requestId,
  rateLimiter,
  csrfProtection,
  corsOptions,
};
