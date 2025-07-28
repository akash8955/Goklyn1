const axios = require('axios');
require('dotenv').config({ path: './.env' });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function testProjectsAPI() {
  try {
    console.log('Testing projects API...');
    
    // Test public endpoint (should only show published projects)
    console.log('\n1. Testing public projects endpoint (should show only published projects):');
    const publicResponse = await axios.get(`${API_BASE_URL}/projects`);
    console.log(`Status: ${publicResponse.status}`);
    console.log(`Found ${publicResponse.data.data.projects.length} projects`);
    console.log('Sample project:', publicResponse.data.data.projects[0]?.title || 'No projects found');
    
    // Test with admin token (if available)
    const adminToken = process.env.ADMIN_TOKEN;
    if (adminToken) {
      console.log('\n2. Testing projects endpoint with admin token (should show all non-archived projects):');
      const adminResponse = await axios.get(`${API_BASE_URL}/projects`, {
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });
      console.log(`Status: ${adminResponse.status}`);
      console.log(`Found ${adminResponse.data.data.projects.length} projects`);
      console.log('Sample project:', adminResponse.data.data.projects[0]?.title || 'No projects found');
    } else {
      console.log('\n2. Skipping admin test: ADMIN_TOKEN not provided in .env');
    }
    
    // Test getting a specific project
    if (publicResponse.data.data.projects.length > 0) {
      const projectId = publicResponse.data.data.projects[0]._id;
      console.log(`\n3. Testing get project by ID (${projectId}):`);
      const singleResponse = await axios.get(`${API_BASE_URL}/projects/${projectId}`);
      console.log(`Status: ${singleResponse.status}`);
      console.log('Project details:', {
        id: singleResponse.data.data.project._id,
        title: singleResponse.data.data.project.title,
        status: singleResponse.data.data.project.status,
        featured: singleResponse.data.data.project.featured
      });
    } else {
      console.log('\n3. Skipping single project test: No projects found');
    }
    
  } catch (error) {
    console.error('\nError testing projects API:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
  }
}

testProjectsAPI();
