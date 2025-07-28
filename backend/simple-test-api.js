const axios = require('axios');
require('dotenv').config({ path: './.env' });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

async function testProjectAPI() {
  try {
    console.log('Testing Project API Endpoints\n');

    // Test 1: Get all projects
    console.log('1. Testing GET /api/projects');
    const listResponse = await axios.get(`${API_BASE_URL}/projects`);
    console.log(`✅ Status: ${listResponse.status}`);
    console.log(`✅ Found ${listResponse.data.data.projects.length} projects`);
    
    if (listResponse.data.data.projects.length > 0) {
      const firstProject = listResponse.data.data.projects[0];
      console.log('\nFirst project sample:');
      console.log({
        id: firstProject._id,
        title: firstProject.title,
        status: firstProject.status,
        featured: firstProject.featured,
        createdAt: firstProject.createdAt
      });

      // Test 2: Get single project by ID
      console.log('\n2. Testing GET /api/projects/:id');
      const singleResponse = await axios.get(`${API_BASE_URL}/projects/${firstProject._id}`);
      console.log(`✅ Status: ${singleResponse.status}`);
      console.log(`✅ Project found: ${singleResponse.data.data.project.title}`);
      
      // Test 3: Filter projects by status
      console.log('\n3. Testing filter by status');
      const filteredResponse = await axios.get(`${API_BASE_URL}/projects?status=${firstProject.status}`);
      console.log(`✅ Found ${filteredResponse.data.data.projects.length} projects with status '${firstProject.status}'`);
      
      if (filteredResponse.data.data.projects.length > 0) {
        console.log('Sample filtered project:', filteredResponse.data.data.projects[0].title);
      }
    } else {
      console.log('⚠️ No projects found to test single project endpoint');
    }

    // Test 4: Test non-existent project
    console.log('\n4. Testing non-existent project');
    try {
      await axios.get(`${API_BASE_URL}/projects/000000000000000000000000`);
    } catch (error) {
      console.log(`✅ Expected error received: ${error.response.status} - ${error.response.data.message}`);
    }

    console.log('\n✅ All tests completed successfully');
  } catch (error) {
    console.error('\n❌ Error running tests:');
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.message);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

// Run the tests
testProjectAPI();
