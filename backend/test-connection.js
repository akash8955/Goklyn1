const axios = require('axios');

async function testConnection() {
  try {
    console.log('Testing connection to server...');
    const response = await axios.get('http://localhost:5000', { timeout: 5000 });
    console.log('Server responded with status:', response.status);
    console.log('Response data:', response.data);
  } catch (error) {
    console.error('Error connecting to server:');
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

testConnection();
