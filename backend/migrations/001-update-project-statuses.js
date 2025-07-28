const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

async function updateProjectStatuses() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected\n');

    const Project = require('../models/Project');
    
    // First, find all projects to check their statuses
    const allProjects = await Project.find({});
    console.log(`Found ${allProjects.length} total projects in the database`);
    
    // Log the status of all projects
    console.log('\nCurrent project statuses:');
    allProjects.forEach(p => {
      console.log(`- ${p.title} (${p._id}): ${p.status || 'undefined'}`);
    });
    
    // Find all projects that need status updates
    const projectsToUpdate = allProjects.filter(project => {
      return !project.status || 
             !['pending', 'published', 'archived'].includes(project.status);
    });

    console.log(`Found ${projectsToUpdate.length} projects that need status updates`);
    
    if (projectsToUpdate.length > 0) {
      const updatePromises = projectsToUpdate.map(project => {
      // Use the raw MongoDB collection to bypass Mongoose validation if needed
      const collection = mongoose.connection.collection('projects');
        console.log(`Updating project: ${project.title} (${project._id})`);
        console.log(`Current status: ${project.status || 'undefined'}`);
        
        // Set default status based on some condition if needed
        // For now, we'll set all to 'published' to make them visible
        const newStatus = 'published';
        
        console.log(`New status: ${newStatus}`);
        console.log('---');
        
        // Update using the raw collection to bypass any middleware
        return collection.updateOne(
          { _id: project._id },
          { $set: { status: newStatus } }
        );
      });
      
      const results = await Promise.all(updatePromises);
      console.log(`\n✅ Successfully updated ${results.length} projects`);
    } else {
      console.log('No projects need status updates');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ MongoDB Disconnected');
  }
}

// Run the migration
updateProjectStatuses();
