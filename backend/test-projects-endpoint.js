const axios = require('axios');

async function testProjectsEndpoint() {
  try {
    console.log('Testing GET /api/projects...');
    const response = await axios.get('http://localhost:5000/api/projects', { timeout: 10000 });
    console.log('Projects endpoint response status:', response.status);
    console.log('Projects found:', response.data.data.projects.length);
    console.log('First project (if any):', response.data.data.projects[0] || 'No projects found');
  } catch (error) {
    console.error('Error testing projects endpoint:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Server might be down or not responding.');
      console.error('Error message:', error.message);
    } else {
      console.error('Error setting up request:', error.message);
    }
  }
}

testProjectsEndpoint();
