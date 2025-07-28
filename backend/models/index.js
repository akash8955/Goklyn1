// Import all models
require('./newsCategory.model'); // Import first since News depends on it
require('./news.model');
const GalleryItem = require('./gallery.model');
const Album = require('./Album'); // Import Album model

// Re-export all models
module.exports = {
  News: require('./news.model'),
  NewsCategory: require('./newsCategory.model'),
  GalleryItem, // Directly use the imported GalleryItem
  Album // Directly use the imported Album
};
