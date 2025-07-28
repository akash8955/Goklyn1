const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user.model');

dotenv.config({ path: '../.env' });

const activateUser = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/portfolioDB', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const user = await User.findOneAndUpdate(
      { email },
      { isActive: true },
      { new: true }
    );

    if (!user) {
      console.error('User not found');
      process.exit(1);
    }

    console.log(`User ${user.email} has been activated`);
    process.exit(0);
  } catch (error) {
    console.error('Error activating user:', error);
    process.exit(1);
  }
};

// Get email from command line argument
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address');
  process.exit(1);
}

activateUser(email);
