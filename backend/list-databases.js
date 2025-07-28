const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './.env' });

async function listDatabases() {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
    const client = new MongoClient(mongoURI);

    try {
        await client.connect();
        console.log('Connected to MongoDB');
        
        const adminDb = client.db('admin');
        const result = await adminDb.admin().listDatabases();
        
        console.log('Available databases:');
        result.databases.forEach(db => {
            console.log(`- ${db.name}`);
        });
        
        // Check if our database exists
        const dbName = 'goklyndb';
        const dbExists = result.databases.some(db => db.name === dbName);
        console.log(`\nDatabase '${dbName}' ${dbExists ? 'exists' : 'does not exist'}`);
        
        if (dbExists) {
            const db = client.db(dbName);
            const collections = await db.listCollections().toArray();
            console.log(`\nCollections in ${dbName}:`);
            collections.forEach(collection => {
                console.log(`- ${collection.name}`);
            });
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
        process.exit(0);
    }
}

listDatabases();
