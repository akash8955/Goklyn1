const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Import all models
require('../models');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    
    // Check if MONGO_URI is set
    if (!process.env.MONGO_URI) {
      console.error('Error: MONGO_URI is not set in environment variables');
      process.exit(1);
    }
    
    // Connect to MongoDB
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ MongoDB Connected:', conn.connection.host);
    
    // List all registered models
    console.log('\n📋 Registered Models:');
    console.log(Array.from(mongoose.modelNames()));
    
    // Test Album model
    if (mongoose.modelNames().includes('Album')) {
      console.log('\n🔍 Testing Album model...');
      const count = await mongoose.model('Album').countDocuments();
      console.log(`✅ Found ${count} albums`);
    } else {
      console.log('❌ Album model not registered');
    }
    
    // Test GalleryItem model
    if (mongoose.modelNames().includes('GalleryItem')) {
      console.log('\n🔍 Testing GalleryItem model...');
      const count = await mongoose.model('GalleryItem').countDocuments();
      console.log(`✅ Found ${count} gallery items`);
    } else {
      console.log('❌ GalleryItem model not registered');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.name === 'MongooseServerSelectionError') {
      console.log('\n💡 Make sure MongoDB is running and the connection string is correct.');
      console.log('Current MONGO_URI:', process.env.MONGO_URI ? '***' : 'Not set');
    }
    process.exit(1);
  }
}

testConnection();
