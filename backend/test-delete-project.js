const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

// Configuration
const API_URL = 'http://localhost:5000/api'; // Ensure this matches your server's base URL

// We'll use an existing project ID for testing deletion
const EXISTING_PROJECT_ID = '6885ced018d9ccf442c02084'; // Using the project ID from the test response

// Create Axios instance with default headers and timeout
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for logging
api.interceptors.request.use(
  config => {
    console.log(`Sending ${config.method.toUpperCase()} request to ${config.url}`);
    console.log('Request config:', {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
api.interceptors.response.use(
  response => {
    console.log(`Received response from ${response.config.url} (${response.status})`);
    return response;
  },
  error => {
    if (error.response) {
      // The request was made and the server responded with a status code
      console.error('Response error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers,
        config: {
          url: error.config.url,
          method: error.config.method,
          data: error.config.data
        }
      });
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', {
        message: error.message,
        code: error.code,
        config: {
          url: error.config.url,
          method: error.config.method,
          timeout: error.config.timeout
        }
      });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);

// Helper function to create a test project
async function createTestProject() {
  try {
    console.log('Creating test project...');
    console.log('Sending POST request to /projects with data:', JSON.stringify(TEST_PROJECT, null, 2));
    
    const response = await api.post('/projects', TEST_PROJECT)
      .catch(error => {
        console.error('Error in POST /projects request:', {
          message: error.message,
          response: error.response ? {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data
          } : 'No response',
          stack: error.stack
        });
        throw error;
      });
      
    console.log('Test project created successfully');
    console.log('Response data:', JSON.stringify(response.data, null, 2));
    return response.data.data.project._id;
  } catch (error) {
    console.error('Error creating test project:', error.response?.data || error.message);
    throw error;
  }
}

// Test project deletion
async function testProjectDeletion() {
  const projectId = EXISTING_PROJECT_ID;
  
  try {
    // Step 1: Verify the project exists
    console.log('Verifying project exists...');
    const getResponse = await api.get(`/projects/${projectId}`);
    console.log('Project exists:', getResponse.data.data.project.title);
    
    // Ask for confirmation before deletion
    console.log('\nWARNING: This will delete the project with ID:', projectId);
    console.log('Project title:', getResponse.data.data.project.title);
    console.log('Are you sure you want to proceed? (y/n)');
    
    // Wait for user input
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.once('data', async (key) => {
      if (key.toString().toLowerCase() === 'y') {
        try {
          // Step 2: Delete the project
          console.log('\nDeleting project...');
          const deleteResponse = await api.delete(`/projects/${projectId}`);
          console.log('Delete response status:', deleteResponse.status);
          
          // Step 3: Verify the project is deleted
          try {
            await api.get(`/projects/${projectId}`);
            console.error('❌ Test failed: Project still exists after deletion');
          } catch (error) {
            if (error.response.status === 404) {
              console.log('✅ Test passed: Project successfully deleted');
            } else {
              console.error('❌ Test failed with error:', error.response?.data || error.message);
            }
          }
        } catch (error) {
          console.error('❌ Error during deletion:', error.response?.data || error.message);
        } finally {
          process.exit();
        }
      } else {
        console.log('\nOperation cancelled by user');
        process.exit();
      }
    });
  } catch (error) {
    console.error('❌ Test failed with error:', error.response?.data || error.message);
  } finally {
    // Cleanup: Make sure the test project is deleted even if test fails
    if (projectId) {
      try {
        await api.delete(`/projects/${projectId}`).catch(() => {});
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }
}

// Run the test
testProjectDeletion();
