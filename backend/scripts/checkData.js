const mongoose = require('mongoose');
const config = require('../config');

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongo.uri, config.mongo.options);
    console.log('Connected to MongoDB');

    // Get database stats
    const db = mongoose.connection.db;
    const stats = await db.stats();
    console.log('Database stats:', stats);

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    // Check news categories
    const newsCategories = await db.collection('newscategories').find({}).toArray();
    console.log('News categories count:', newsCategories.length);
    if (newsCategories.length > 0) {
      console.log('Sample category:', {
        _id: newsCategories[0]._id,
        name: newsCategories[0].name,
        slug: newsCategories[0].slug,
        status: newsCategories[0].status
      });
    }

    // Check news articles
    const newsArticles = await db.collection('news').find({}).toArray();
    console.log('News articles count:', newsArticles.length);
    if (newsArticles.length > 0) {
      console.log('Sample article:', {
        _id: newsArticles[0]._id,
        title: newsArticles[0].title,
        status: newsArticles[0].status,
        category: newsArticles[0].category
      });
    }

    mongoose.connection.close();
  } catch (error) {
    console.error('Error checking database:', error);
    process.exit(1);
  }
}

checkDatabase();
