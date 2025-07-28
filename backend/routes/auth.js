const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  getMe, 
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
  updateMe,
  verifyOTP
} = require('../controllers/auth.controller'); // Fixed filename case
const { protect, authLimiter } = require('../middleware/auth');
const { 
  validateRegister, 
  validateLogin, 
  validateForgotPassword, 
  validateResetPassword,
  validateVerifyOTP 
} = require('../middleware/validation');

// Apply rate limiting to authentication routes
router.use(authLimiter);

// Debug: Log all handler functions
console.log('Auth route handlers:');
console.log('- register:', typeof register);
console.log('- login:', typeof login);
console.log('- forgotPassword:', typeof forgotPassword);
console.log('- verifyOTP:', typeof verifyOTP);
console.log('- resetPassword:', typeof resetPassword);
console.log('- getMe:', typeof getMe);
console.log('- logout:', typeof logout);
console.log('- changePassword:', typeof changePassword);
console.log('- updateMe:', typeof updateMe);

// Public routes
router.post('/register', (req, res, next) => {
  console.log('Register route handler called');
  try {
    validateRegister(req, res, (err) => {
      if (err) return next(err);
      register(req, res, next);
    });
  } catch (error) {
    console.error('Error in register route:', error);
    next(error);
  }
});

router.post('/login', (req, res, next) => {
  console.log('Login route handler called');
  try {
    validateLogin(req, res, (err) => {
      if (err) return next(err);
      login(req, res, next);
    });
  } catch (error) {
    console.error('Error in login route:', error);
    next(error);
  }
});

router.post('/forgot-password', (req, res, next) => {
  console.log('Forgot password route handler called');
  try {
    validateForgotPassword(req, res, (err) => {
      if (err) return next(err);
      forgotPassword(req, res, next);
    });
  } catch (error) {
    console.error('Error in forgot-password route:', error);
    next(error);
  }
});

router.post('/verify-otp', (req, res, next) => {
  console.log('Verify OTP route handler called');
  try {
    validateVerifyOTP(req, res, (err) => {
      if (err) return next(err);
      verifyOTP(req, res, next);
    });
  } catch (error) {
    console.error('Error in verify-otp route:', error);
    next(error);
  }
});

router.post('/reset-password', (req, res, next) => {
  console.log('Reset password route handler called');
  try {
    validateResetPassword(req, res, (err) => {
      if (err) return next(err);
      resetPassword(req, res, next);
    });
  } catch (error) {
    console.error('Error in reset-password route:', error);
    next(error);
  }
});

// Protected routes - require authentication
console.log('Setting up protected routes...');

// Apply protect middleware to all routes below this point
router.use(protect);

// Protected routes
router.get('/me', (req, res, next) => {
  console.log('Get me route handler called');
  getMe(req, res, next);
});

router.post('/logout', (req, res, next) => {
  console.log('Logout route handler called');
  logout(req, res, next);
});

router.post('/change-password', (req, res, next) => {
  console.log('Change password route handler called');
  changePassword(req, res, next);
});

router.patch('/update-me', (req, res, next) => {
  console.log('Update me route handler called');
  updateMe(req, res, next);
});

// Admin only routes
// router.use(authorize('admin'));
// Add admin-specific routes here

module.exports = router;
