const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './.env' });

const MONGODB_URI = process.env.MONGO_URI;

async function checkProjects() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(c => console.log(`- ${c.name}`));
    
    // Check projects collection directly
    const projectsCollection = db.collection('projects');
    const projectCount = await projectsCollection.countDocuments();
    console.log(`\nTotal projects in 'projects' collection: ${projectCount}`);
    
    if (projectCount > 0) {
      console.log('\nSample project documents:');
      const projects = await projectsCollection.find({}).limit(5).toArray();
      projects.forEach((doc, index) => {
        console.log(`\nProject #${index + 1}:`);
        console.log(JSON.stringify(doc, null, 2));
      });
    }
    
    // Check if there are any documents in other collections that might be related to projects
    const relatedCollections = ['albums', 'galleryitems'];
    
    for (const collName of relatedCollections) {
      const coll = db.collection(collName);
      const count = await coll.countDocuments();
      console.log(`\nTotal documents in '${collName}': ${count}`);
      
      if (count > 0) {
        const sample = await coll.findOne();
        console.log(`Sample document from '${collName}':`);
        console.log(JSON.stringify(sample, null, 2));
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('\nMongoDB connection closed');
  }
}

checkProjects();
