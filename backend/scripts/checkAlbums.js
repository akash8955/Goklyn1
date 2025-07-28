const mongoose = require('mongoose');
const { Album } = require('../models/gallery.model');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolioDB';

async function checkAlbums() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Check if albums collection exists
    const collections = await mongoose.connection.db.listCollections({ name: 'albums' }).toArray();
    if (collections.length === 0) {
      console.log('Albums collection does not exist');
      return;
    }

    // Count albums
    const count = await Album.countDocuments();
    console.log(`Found ${count} albums in the database`);

    // Get first few albums
    if (count > 0) {
      const albums = await Album.find().limit(5);
      console.log('Sample albums:', JSON.stringify(albums, null, 2));
    }

  } catch (error) {
    console.error('Error checking albums:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
checkAlbums();
