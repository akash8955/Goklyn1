const mongoose = require('mongoose');
require('dotenv').config({ path: './.env' });

const testConnection = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goklyndb';
        console.log('Connecting to MongoDB...');
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ MongoDB connected successfully');
        
        // Test projects collection
        const Project = require('./models/project.model');
        const projects = await Project.find({});
        console.log(`📊 Found ${projects.length} projects in the database`);
        
        // Test testimonials collection
        const Testimonial = require('./models/testimonial.model');
        const testimonials = await Testimonial.find({});
        console.log(`💬 Found ${testimonials.length} testimonials in the database`);
        
        // Test internships collection
        const Internship = require('./models/internship.model');
        const internships = await Internship.find({});
        console.log(`🎓 Found ${internships.length} internships in the database`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
};

testConnection();
