const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Check projects in database
const checkProjects = async () => {
  try {
    // Import the Project model
    const Project = require('./models/Project');
    
    // Get database stats
    const db = mongoose.connection.db;
    const stats = await db.command({ dbStats: 1 });
    console.log('Database stats:', {
      collections: stats.collections,
      objects: stats.objects,
      dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`
    });
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(c => console.log(`- ${c.name}`));
    
    // Count total projects
    const count = await Project.countDocuments();
    console.log('\nTotal projects in database:', count);
    
    // If there are projects, show them all with details
    if (count > 0) {
      console.log('\nFetching project details...');
      try {
        // Try with lean first
        const projects = await Project.find({}).lean();
        console.log(`Found ${projects.length} projects using lean()`);
        
        if (projects.length > 0) {
          console.log('\nProject details (lean):');
          projects.forEach((project, index) => {
            console.log(`\nProject #${index + 1}:`);
            console.log('ID:', project._id);
            console.log('Title:', project.title || 'N/A');
            console.log('Status:', project.status || 'N/A');
            console.log('Featured:', project.featured || false);
            console.log('Created At:', project.createdAt || 'N/A');
            console.log('Photo:', project.photo || 'N/A');
            console.log('Tech Stack:', project.techStack?.join(', ') || 'N/A');
            console.log('Raw document:', JSON.stringify(project, null, 2));
          });
        } else {
          console.log('No projects found with lean()');
        }
        
        // Try without lean as fallback
        const projectsFull = await Project.find({});
        console.log(`\nFound ${projectsFull.length} projects without lean()`);
        
        if (projectsFull.length > 0) {
          console.log('\nProject details (full documents):');
          projectsFull.forEach((project, index) => {
            console.log(`\nProject #${index + 1}:`);
            console.log('ID:', project._id);
            console.log('Title:', project.title || 'N/A');
            console.log('Status:', project.status || 'N/A');
            console.log('Featured:', project.featured || false);
            console.log('Created At:', project.createdAt || 'N/A');
            console.log('Photo:', project.photo || 'N/A');
            console.log('Tech Stack:', project.techStack?.join(', ') || 'N/A');
            console.log('Document methods:', Object.keys(Project.schema.methods));
          });
        } else {
          console.log('No projects found without lean()');
        }
        
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    } else {
      console.log('No projects found in the database.');
      
      // Check if the projects collection exists but is empty
      const projectsCollectionExists = collections.some(c => c.name === 'projects');
      
      if (projectsCollectionExists) {
        console.log('The projects collection exists but is empty.');
      } else {
        console.log('The projects collection does not exist in the database.');
      }
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error checking projects:', err);
    process.exit(1);
  }
};

// Run the check
(async () => {
  await connectDB();
  await checkProjects();
})();
