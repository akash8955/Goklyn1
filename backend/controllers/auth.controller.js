const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/user.model');
const { AppError } = require('../utils/appError');
const emailService = require('../services/email.service');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id }, 
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Set JWT token in HTTP-only cookie
const setTokenCookie = (res, token) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined
  };

  res.cookie('jwt', token, cookieOptions);
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(
        new AppError('User with this email or username already exists', 400)
      );
    }

    // Check if this is the first user (set as admin)
    const isFirstUser = (await User.countDocuments({})) === 0;
    const role = isFirstUser ? 'admin' : 'sub-admin';

    // Create user
    const user = await User.create({
      username,
      email,
      password,
      role
    });

    // Create token
    const token = generateToken(user._id);
    
    // Set JWT in HTTP-only cookie
    setTokenCookie(res, token);

    // Remove sensitive data from output
    user.password = undefined;
    user.active = undefined;
    user.passwordChangedAt = undefined;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    res.status(200).json({
      status: 'success',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res,next) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing credentials');
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide both email and password' 
      });
    }

    // Check for user
    // 1) Check if email and password exist
    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    // 2) Check if user exists && password is correct
    const user = await User.findOne({ email })
      .select('+password +failedLoginAttempts +accountLockedUntil +isActive');
    
    // Check if account is locked
    if (user?.isAccountLocked()) {
      const timeLeft = Math.ceil((user.accountLockedUntil - Date.now()) / 60000);
      return next(
        new AppError(
          `Account temporarily locked. Try again in ${timeLeft} minutes or reset your password.`,
          429
        )
      );
    }

    if (!user || !(await user.correctPassword(password, user.password))) {
      // Increment failed login attempts
      if (user) {
        await user.incrementLoginAttempts();
      }
      
      return next(new AppError('Incorrect email or password', 401));
    }

    // 3) If everything ok, reset login attempts and generate token
    await user.resetLoginAttempts();
    
    // 4) Update last login time
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });

    // 5) Generate token
    const token = generateToken(user._id);

    // 6) Set JWT in HTTP-only cookie
    setTokenCookie(res, token);

    // 8) Remove sensitive data from output
    user.password = undefined;
    user.failedLoginAttempts = undefined;
    user.accountLockedUntil = undefined;

    // 9) Send response
    res.status(200).json({
      status: 'success',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PATCH /api/auth/update-me
// @access  Private
exports.updateMe = async (req, res, next) => {
  try {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return next(
        new AppError(
          'This route is not for password updates. Please use /change-password.',
          400
        )
      );
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = { 
        username: req.body.username, 
        email: req.body.email 
    };

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    console.log('[/auth/me] Request received. User ID from token:', req.user?.id);
    
    if (!req.user?.id) {
      console.error('[/auth/me] No user ID in request');
      return next(new AppError('Authentication required', 401));
    }
    
    console.log('[/auth/me] Fetching user from database...');
    const user = await User.findById(req.user.id).select('-password -failedLoginAttempts -accountLockedUntil');
    
    if (!user) {
      console.error('[/auth/me] User not found in database');
      return next(new AppError('User not found', 404));
    }
    
    console.log('[/auth/me] User found:', { id: user._id, email: user.email, role: user.role });
    
    // Generate a new token to extend the session
    const token = generateToken(user._id);
    
    // Set JWT in HTTP-only cookie
    setTokenCookie(res, token);
    
    console.log('[/auth/me] Sending response with user data');
    res.status(200).json({
      status: 'success',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('[/auth/me] Error:', error);
    next(error);
  }
};

// @desc    Change password
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if POSTed current password is correct
    if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
      return next(new AppError('Your current password is wrong.', 401));
    }

    // 3) If so, update password
    user.password = req.body.newPassword;
    user.passwordConfirm = req.body.confirmPassword;
    await user.save();

    // 4) Log user in, send JWT
    const token = generateToken(user._id);
    setTokenCookie(res, token);

    res.status(200).json({
      status: 'success',
      token,
    });
  } catch (error) {
    console.error('Error in changePassword:', {
      message: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    next(error);
  }
};

// @desc    Forgot password - Send OTP
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  console.log('Forgot password request received:', req.body);
  try {
    console.log('Forgot password request received for email:', req.body.email);
    const { email } = req.body;

    if (!email) {
      console.log('No email provided in request');
      return next(new AppError('Please provide an email address', 400));
    }

    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Don't reveal if user doesn't exist (security)
    if (!user) {
      console.log('No user found with email:', email);
      return res.status(200).json({
        status: 'success',
        message: 'If an account exists with this email, an OTP has been sent.'
      });
    }

    console.log('User found, generating OTP for:', user.email);
    
    // 2) Generate the random reset OTP
    const otp = user.generateOTP();
    console.log('Generated OTP (plain):', otp);
    
    // Save the user with the new OTP
    await user.save({ validateBeforeSave: false });
    
    // Verify the OTP was saved correctly
    const updatedUser = await User.findById(user._id);
    console.log('OTP saved in database (hashed):', updatedUser.otp);
    console.log('OTP expires at:', new Date(updatedUser.otpExpires).toISOString());
    console.log('Current time:', new Date().toISOString());
    
    console.log('OTP generated and saved for user:', user.email);

    try {
      // 3) Send OTP to user's email
      console.log('Attempting to send OTP email...');
      await emailService.sendPasswordResetOTP(user, otp);
      console.log('OTP email sent successfully to:', user.email);

      res.status(200).json({
        status: 'success',
        message: 'OTP sent to email!',
        data: {
          email: user.email
        }
      });
    } catch (err) {
      console.error('Error sending OTP email:', {
        message: err.message,
        stack: err.stack,
        userEmail: user.email,
        error: err
      });
      
      // Clear the OTP since sending failed
      user.passwordResetOTP = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new AppError(`There was an error sending the email: ${err.message}`),
        500
      );
    }
  } catch (error) {
    console.error('Unexpected error in forgotPassword:', {
      message: error.message,
      stack: error.stack,
      requestBody: req.body
    });
    next(error);
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
exports.verifyOTP = async (req, res, next) => {
  try {
    console.log('OTP verification request received:', { 
      email: req.body.email,
      hasOTP: !!req.body.otp,
      headers: req.headers,
      body: req.body
    });
    
    const { email, otp } = req.body;

    // 1) Check if email and OTP are provided
    if (!email || !otp) {
      console.log('Missing email or OTP');
      return res.status(400).json({
        status: 'error',
        message: 'Please provide email and OTP'
      });
    }

    // 2) Get user based on email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('No user found with email:', email);
      return res.status(400).json({
        status: 'error',
        message: 'Invalid OTP or OTP has expired'
      });
    }

    console.log('User found, verifying OTP...');
    
    // 3) Verify OTP
    console.log('Verifying OTP for user:', email);
    const isOTPValid = user.verifyOTP(otp);
    
    // Debug: Check user document before verification
    const userBeforeVerification = await User.findById(user._id);
    console.log('User document before verification:', {
      otp: userBeforeVerification.otp,
      otpExpires: userBeforeVerification.otpExpires,
      currentTime: new Date()
    });
    
    if (!isOTPValid) {
      console.log('Invalid or expired OTP for user:', email);
      // Check if OTP exists and is expired
      if (user.otpExpires && Date.now() > user.otpExpires) {
        console.log('OTP has expired');
        return res.status(400).json({
          status: 'error',
          message: 'OTP has expired. Please request a new one.'
        });
      }
      return res.status(400).json({
        status: 'error',
        message: 'Invalid OTP. Please try again.'
      });
    }

    console.log('OTP verified, generating reset token...');
    
    // 4) Generate a temporary token for password reset
    const tempToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(tempToken)
      .digest('hex');
    
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    console.log('Reset token generated for user:', email);
    
    // 5) Send the token to the client in the expected format
    const responseData = {
      status: 'success',
      message: 'OTP verified successfully. You can now reset your password.',
      data: {
        email: user.email,
        token: tempToken
      }
    };
    
    console.log('Sending response:', JSON.stringify(responseData, null, 2));
    res.status(200).json(responseData);
    
  } catch (error) {
    console.error('Error in verifyOTP:', {
      message: error.message,
      stack: error.stack,
      request: { 
        body: req.body,
        headers: req.headers,
        method: req.method,
        url: req.originalUrl
      }
    });
    
    res.status(500).json({
      status: 'error',
      message: 'An error occurred while verifying OTP. Please try again.'
    });
  }
};

// @desc    Reset password with token from OTP verification
// @route   PATCH /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, password, passwordConfirm } = req.body;

    // 1) Check if token, password, and passwordConfirm are provided
    if (!token || !password || !passwordConfirm) {
      return next(
        new AppError('Please provide token, password, and password confirmation', 400)
      );
    }

    // 2) Hash the token
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // 3) Find user by hashed token and check if token is not expired
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return next(new AppError('Token is invalid or has expired', 400));
    }

    // 4) Update user's password
    user.password = password;
    user.passwordConfirm = passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.otp = undefined;
    user.otpExpires = undefined;
    user.passwordChangedAt = Date.now() - 1000; // Ensure token issued after password change
    
    // 5) Save the user (this will run the validators and hash the password)
    await user.save();

    // 6) Log the user in, send JWT
    const authToken = generateToken(user._id);

    // 7) Set JWT in HTTP-only cookie
    setTokenCookie(res, authToken);

    // 8) Remove sensitive data from output
    user.password = undefined;
    user.failedLoginAttempts = undefined;
    user.accountLockedUntil = undefined;

    // 9) Send response
    res.status(200).json({
      status: 'success',
      data: {
        user,
        token: authToken
      },
      message: 'Password reset successful. You are now logged in.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
exports.logout = (req, res) => {
  try {
    const cookieOptions = {
      expires: new Date(Date.now() + 10 * 1000), // Expire in 10 seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
      domain: process.env.NODE_ENV === 'production' ? '.yourdomain.com' : undefined
    };
    
    // Clear the JWT cookie
    res.cookie('jwt', 'loggedout', cookieOptions);
    
    // Optionally, you can also clear the token from the Authorization header
    res.removeHeader('Authorization');
    
    res.status(200).json({ 
      status: 'success',
      message: 'Successfully logged out' 
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred during logout'
    });
  }
};
