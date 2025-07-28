const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });
const News = require('../models/news.model');
const NewsCategory = require('../models/newsCategory.model');
const User = require('../models/user.model');

// Use MONGO_URI from environment variables or fallback to default
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/portfolioDB';

// Mongoose connection options are no longer needed for modern versions.
const mongooseOptions = {};

// Sample categories with createdBy field (will be set to admin user's ID)
const getSampleCategories = (adminId) => [
  { 
    name: 'Technology', 
    description: 'Latest in technology and innovation',
    slug: 'technology',
    status: 'active',
    featured: true,
    createdBy: adminId
  },
  { 
    name: 'Science', 
    description: 'Scientific discoveries and research',
    slug: 'science',
    status: 'active',
    createdBy: adminId
  },
  { 
    name: 'Health', 
    description: 'Health and wellness news',
    slug: 'health',
    status: 'active',
    featured: true,
    createdBy: adminId
  },
  { 
    name: 'Business', 
    description: 'Business and finance updates',
    slug: 'business',
    status: 'active',
    createdBy: adminId
  }
];

// Generate unique slug from title
const generateSlug = (title, index = 0) => {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  return index > 0 ? `${baseSlug}-${index}` : baseSlug;
};

// Sample news articles with unique slugs
const getSampleArticles = (categoryId, adminId) => {
  const baseArticles = [
    {
      title: 'The Future of Artificial Intelligence',
      excerpt: 'Exploring the latest advancements in AI and machine learning',
      content: 'Artificial Intelligence is transforming industries across the globe...',
      featuredImage: 'https://via.placeholder.com/800x400?text=AI+Future',
      status: 'published',
      featured: true,
      tags: ['ai', 'machine learning', 'technology'],
      author: adminId,
      category: categoryId,
      publishedAt: new Date()
    },
    {
      title: 'Breakthrough in Renewable Energy',
      excerpt: 'New solar technology promises to double efficiency',
      content: 'Scientists have developed a new type of solar panel that...',
      featuredImage: 'https://via.placeholder.com/800x400?text=Renewable+Energy',
      status: 'published',
      tags: ['energy', 'sustainability', 'science'],
      author: adminId,
      category: categoryId,
      publishedAt: new Date()
    }
  ];

  // Add unique slugs to each article
  return baseArticles.map((article, index) => ({
    ...article,
    slug: generateSlug(article.title, index)
  }));
};

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, mongooseOptions);
    console.log('Connected to MongoDB:', MONGODB_URI);

    // Get admin user (or create one if none exists)
    let admin = await User.findOne({ email: 'admin@example.com' });
    
    if (!admin) {
      console.log('No admin user found. Creating one...');
      admin = await User.create({
        name: 'Admin User',
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123', // NOTE: Hardcoded password for seeding.
        role: 'admin',
        isEmailVerified: true
      });
      console.log('Created admin user:', admin.email);
    }

    // Check if categories already exist
    const existingCategories = await NewsCategory.find({});
    
    if (existingCategories.length === 0) {
      console.log('No categories found. Seeding sample categories...');
      const categoriesToCreate = getSampleCategories(admin._id);
      const createdCategories = await NewsCategory.insertMany(categoriesToCreate);
      console.log(`Created ${createdCategories.length} categories`);
    } else {
      console.log(`Found ${existingCategories.length} existing categories`);
    }

    // Get all categories
    const categories = await NewsCategory.find({});
    
    // Check if news articles exist
    const existingArticles = await News.find({});
    
    if (existingArticles.length === 0) {
      console.log('No articles found. Seeding sample articles...');
      
      // Add sample articles for each category
      for (const category of categories) {
        const articlesForCategory = getSampleArticles(category._id, admin._id);
        
        // Insert articles one by one to handle potential slug conflicts
        for (const article of articlesForCategory) {
          try {
            await News.create(article);
            console.log(`Added article: ${article.title}`);
          } catch (error) {
            if (error.code === 11000) {
              console.warn(`Article with slug '${article.slug}' already exists, skipping...`);
            } else {
              throw error;
            }
          }
        }
        console.log(`Finished adding articles to ${category.name} category`);
      }
    } else {
      console.log(`Found ${existingArticles.length} existing articles`);
    }

    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
