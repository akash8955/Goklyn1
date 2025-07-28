const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middleware/auth');
const userController = require('../controllers/user.controller'); // Fixed the import path

// Apply protection to all routes
router.use(protect);

// Admin only routes
router.use(isAdmin);

// @route   POST /api/users/make-admin
// @desc    Make a user an admin (temporary endpoint)
// @access  Private/Admin
router.post('/make-admin', userController.makeAdmin);

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', userController.getAllUsers);

module.exports = router;
