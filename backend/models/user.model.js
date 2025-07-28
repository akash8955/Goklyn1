const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Password hashing middleware
const SALT_WORK_FACTOR = Number(process.env.SALT_WORK_FACTOR) || 12;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot be more than 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't return password by default
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'sub-admin'],
      message: 'Role is either: admin or sub-admin'
    },
    default: 'sub-admin',
    required: [true, 'Please provide a role']
  },
  isActive: {
    type: Boolean,
    default: true,
    select: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  otp: String,
  otpExpires: Date,
  failedLoginAttempts: {
    type: Number,
    default: 0,
    select: false
  },
  accountLockedUntil: {
    type: Date,
    select: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * Hash password before saving
 */
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();
  
  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    // Hash the password using the salt
    this.password = await bcrypt.hash(this.password, salt);
    
    // If this is a new user or the password is being set for the first time
    if (this.isNew || this.isModified('password')) {
      // Set passwordChangedAt to now
      this.passwordChangedAt = Date.now() - 1000; // Subtract 1 second to ensure token is created after password change
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Only find active users
 */
userSchema.pre(/^find/, function(next) {
  // This points to the current query
  this.find({ isActive: { $ne: false } });
  next();
});

/**
 * Compare candidate password with user's hashed password
 * @param {string} candidatePassword - The password to compare
 * @param {string} userPassword - The hashed password from the database
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
userSchema.methods.comparePassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

/**
 * Alias for comparePassword for backward compatibility
 */
userSchema.methods.correctPassword = userSchema.methods.comparePassword;

/**
 * Check if password was changed after token was issued
 * @param {number} JWTTimestamp - Timestamp of the JWT token
 * @returns {boolean} - True if password was changed after token was issued, false otherwise
 */
userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false; // Not changed
};

// Create password reset token
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return resetToken;
};

// Generate OTP for password reset
userSchema.methods.generateOTP = function() {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Hash the OTP and save to database
  this.otp = crypto
    .createHash('sha256')
    .update(otp)
    .digest('hex');
    
  // OTP expires in 10 minutes
  this.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = function(candidateOTP) {
  console.log('Verifying OTP for user:', this.email);
  console.log('Stored OTP hash:', this.otp);
  console.log('OTP expires at:', new Date(this.otpExpires).toISOString());
  console.log('Current time:', new Date().toISOString());
  
  if (!this.otp || !this.otpExpires) {
    console.log('No OTP or OTP expiration found');
    return false;
  }
  
  // Check if OTP has expired
  if (Date.now() > this.otpExpires) {
    console.log('OTP has expired');
    return false;
  }
  
  console.log('Hashing candidate OTP:', candidateOTP);
  // Hash the candidate OTP and compare with stored hash
  const hashedOTP = crypto
    .createHash('sha256')
    .update(candidateOTP)
    .digest('hex');
    
  console.log('Hashed candidate OTP:', hashedOTP);
  console.log('Stored OTP hash:', this.otp);
  console.log('OTP match:', this.otp === hashedOTP);
    
  return this.otp === hashedOTP;
};

// Handle account lockout after failed login attempts
userSchema.methods.incrementLoginAttempts = async function() {
  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_TIME = 15 * 60 * 1000; // 15 minutes
  
  if (this.failedLoginAttempts >= MAX_LOGIN_ATTEMPTS) {
    this.accountLockedUntil = new Date(Date.now() + LOCK_TIME);
  } else {
    this.failedLoginAttempts += 1;
  }
  
  await this.save({ validateBeforeSave: false });
};

// Reset login attempts on successful login
userSchema.methods.resetLoginAttempts = async function() {
  if (this.failedLoginAttempts > 0 || this.accountLockedUntil) {
    this.failedLoginAttempts = 0;
    this.accountLockedUntil = undefined;
    await this.save({ validateBeforeSave: false });
  }
};

// Check if account is locked
userSchema.methods.isAccountLocked = function() {
  return this.accountLockedUntil && this.accountLockedUntil > new Date();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
