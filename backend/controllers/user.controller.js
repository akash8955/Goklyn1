const User = require('../models/user.model');
const { AppError } = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// @desc    Make a user an admin
// @route   POST /api/users/make-admin
// @access  Private/Admin
exports.makeAdmin = catchAsync(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new AppError('User ID is required', 400));
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { role: 'admin' },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select('-__v -passwordChangedAt');

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});
