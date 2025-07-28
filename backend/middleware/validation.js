const { check, validationResult } = require('express-validator');
const { AppError } = require('../utils/appError');

// Custom validation middleware
const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMessages = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));

    return next(new AppError('Validation failed', 400, errorMessages));
  };
};

// Validation rules
const registerRules = [
  check('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  check('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
    
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter'),
    
  check('passwordConfirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
];

const loginRules = [
  check('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
    
  check('password')
    .exists()
    .withMessage('Password is required')
];

const forgotPasswordRules = [
  check('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
];

const resetPasswordRules = [
  check('token')
    .notEmpty()
    .withMessage('Token is required'),
    
  check('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one number')
    .matches(/[a-z]/)
    .withMessage('Password must contain at least one lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter'),
    
  check('passwordConfirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Password confirmation does not match password');
      }
      return true;
    })
];

const verifyOTPRules = [
  check('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
    
  check('otp')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers')
];

// Export validation middleware
module.exports = {
  validateRegister: validate(registerRules),
  validateLogin: validate(loginRules),
  validateForgotPassword: validate(forgotPasswordRules),
  validateResetPassword: validate(resetPasswordRules),
  validateVerifyOTP: validate(verifyOTPRules)
};
