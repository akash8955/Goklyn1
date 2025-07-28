const mongoose = require('mongoose');
const { Album } = require('../models/gallery.model');
require('dotenv').config();


async function createTestAlbum() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Create a test album
    const testAlbum = new Album({
      title: 'My First Album',
      description: 'This is a test album created automatically',
      coverImage: 'https://via.placeholder.com/300',
      isPublic: true,
      createdBy: '65c5ceeed25f5e001b60c406' // Replace with a valid user ID from your database
    });

    // Save the album
    const savedAlbum = await testAlbum.save();
    console.log('Test album created successfully:');
    console.log(JSON.stringify(savedAlbum, null, 2));

  } catch (error) {
    console.error('Error creating test album:', error);
  } finally {
    // Close the connection
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the function
createTestAlbum();
