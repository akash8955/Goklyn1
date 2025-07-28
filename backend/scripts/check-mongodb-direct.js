const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '../.env' });

async function checkMongoDB() {
  const client = new MongoClient(process.env.MONGO_URI);
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db();
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:');
    console.log(collections.map(c => `- ${c.name}`).join('\n'));
    
    // Check projects collection
    const projectsCollection = db.collection('projects');
    const projectsCount = await projectsCollection.countDocuments();
    console.log(`\nFound ${projectsCount} projects in the projects collection`);
    
    if (projectsCount > 0) {
      console.log('\nSample project document:');
      const sampleProject = await projectsCollection.findOne();
      console.log(JSON.stringify(sampleProject, null, 2));
    }
    
    // Check if we can find the projects we saw earlier
    const projectIds = [
      '686a71b3778845714c1caf35', // chatting Application
      '6885ced018d9ccf442c02084'  // E commerce
    ];
    
    console.log('\nLooking for specific projects by ID:');
    for (const id of projectIds) {
      const project = await projectsCollection.findOne({ _id: id });
      console.log(`\nProject ${id}:`, project ? 'Found' : 'Not found');
      if (project) {
        console.log({
          title: project.title,
          status: project.status,
          createdAt: project.createdAt,
          _id: project._id.toString()
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
    console.log('\n✅ MongoDB connection closed');
  }
}

// Run the check
checkMongoDB();
