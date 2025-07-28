const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Import the Project model
const Project = require('./models/Project');

// Project ID to delete (from previous test output)
const PROJECT_ID = '6885ced018d9ccf442c02084';

async function testDirectDelete() {
  try {
    console.log('Starting direct delete test...');
    
    // 1. Verify project exists
    console.log('\n1. Verifying project exists...');
    const project = await Project.findById(PROJECT_ID);
    if (!project) {
      console.error('❌ Project not found');
      return;
    }
    console.log(`✅ Project found: ${project.title}`);
    
    // 2. Delete the project directly
    console.log('\n2. Deleting project...');
    const result = await Project.deleteOne({ _id: PROJECT_ID });
    
    if (result.deletedCount === 1) {
      console.log('✅ Project deleted successfully');
      
      // 3. Verify deletion
      console.log('\n3. Verifying deletion...');
      const deletedProject = await Project.findById(PROJECT_ID);
      if (!deletedProject) {
        console.log('✅ Verification passed: Project no longer exists in database');
      } else {
        console.error('❌ Verification failed: Project still exists in database');
      }
    } else {
      console.error('❌ Failed to delete project');
    }
  } catch (error) {
    console.error('❌ Error during direct delete test:', error);
  } finally {
    // Close the connection
    mongoose.connection.close();
  }
}

// Run the test
testDirectDelete();
