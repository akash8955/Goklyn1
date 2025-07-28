const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function checkProjects() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected\n');

    // Get the database instance
    const db = mongoose.connection.db;

    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:');
    collections.forEach(c => console.log(`- ${c.name}`));

    // Check projects collection
    console.log('\nChecking projects collection...');
    const projects = await db.collection('projects').find({}).toArray();
    
    console.log(`\nFound ${projects.length} projects in the database:`);
    projects.forEach((project, index) => {
      console.log(`\nProject ${index + 1}:`);
      console.log(`ID: ${project._id}`);
      console.log(`Title: ${project.title}`);
      console.log(`Status: ${project.status}`);
      console.log(`Created: ${project.createdAt}`);
      console.log('---');
    });

    // Check Project model with Mongoose
    console.log('\nChecking with Mongoose Project model...');
    const Project = require('./models/Project');
    
    // Test with admin context
    console.log('\nQuerying with admin context (should show all non-archived projects):');
    const adminProjects = await Project.find({}, null, { isAdmin: true }).lean();
    console.log(`Found ${adminProjects.length} projects with admin context`);
    
    // Test with non-admin context
    console.log('\nQuerying with non-admin context (should show only published projects):');
    const publicProjects = await Project.find().lean();
    console.log(`Found ${publicProjects.length} projects with non-admin context`);
    
    // Show the status of projects found
    if (publicProjects.length > 0) {
      console.log('\nProject statuses in non-admin query:');
      publicProjects.forEach(p => console.log(`- ${p.title}: ${p.status}`));
    }

    // Check if there are any projects with status other than 'published'
    const nonPublished = await Project.find({ status: { $ne: 'published' } }).lean();
    console.log(`\nFound ${nonPublished.length} projects that are not published`);
    nonPublished.forEach(p => {
      console.log(`- ${p.title}: ${p.status}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB Disconnected');
  }
}

// Run the check
checkProjects();
