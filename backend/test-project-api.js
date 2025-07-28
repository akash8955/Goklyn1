const axios = require('axios');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: './.env' });

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const MONGODB_URI = process.env.MONGO_URI;

// Test data
const TEST_PROJECT = {
  title: 'Test Project ' + Date.now(),
  description: 'This is a test project',
  techStack: 'JavaScript, Node.js, React',
  demoUrl: 'https://example.com/demo',
  githubUrl: 'https://github.com/example/test',
  status: 'published',
  featured: false
};

let testProjectId;
let client;

describe('Project API Tests', () => {
  beforeAll(async () => {
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  });

  afterAll(async () => {
    // Clean up test data
    if (testProjectId) {
      const db = client.db();
      await db.collection('projects').deleteOne({ _id: testProjectId });
    }
    await client.close();
  });

  describe('GET /api/projects', () => {
    it('should return an array of projects', async () => {
      const response = await axios.get(`${API_BASE_URL}/projects`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'success');
      expect(response.data.data).toHaveProperty('projects');
      expect(Array.isArray(response.data.data.projects)).toBe(true);
      
      // Log the first project for debugging
      if (response.data.data.projects.length > 0) {
        console.log('First project:', {
          id: response.data.data.projects[0]._id,
          title: response.data.data.projects[0].title,
          status: response.data.data.projects[0].status
        });
      }
    });

    it('should filter projects by status', async () => {
      const response = await axios.get(`${API_BASE_URL}/projects?status=published`);
      
      expect(response.status).toBe(200);
      expect(response.data.data.projects.every(p => p.status === 'published')).toBe(true);
    });
  });

  describe('GET /api/projects/:id', () => {
    it('should return a single project', async () => {
      // First get a project ID to test with
      const projectsResponse = await axios.get(`${API_BASE_URL}/projects`);
      
      if (projectsResponse.data.data.projects.length === 0) {
        console.log('No projects found to test single project endpoint');
        return;
      }
      
      const projectId = projectsResponse.data.data.projects[0]._id;
      const response = await axios.get(`${API_BASE_URL}/projects/${projectId}`);
      
      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('status', 'success');
      expect(response.data.data).toHaveProperty('project');
      expect(response.data.data.project).toHaveProperty('_id', projectId);
    });

    it('should return 404 for non-existent project', async () => {
      try {
        await axios.get(`${API_BASE_URL}/projects/000000000000000000000000`);
        fail('Expected 404 error');
      } catch (error) {
        expect(error.response.status).toBe(404);
        expect(error.response.data).toHaveProperty('status', 'error');
      }
    });
  });

  // Note: The following tests require authentication
  describe('Protected Endpoints', () => {
    let authToken;
    
    beforeAll(async () => {
      // You would need to implement login or use a test token
      // authToken = await getAuthToken();
    });
    
    // These tests are skipped as they require authentication
    // Uncomment and implement authentication to run them
    
    it.skip('should create a new project', async () => {
      const response = await axios.post(
        `${API_BASE_URL}/projects`,
        TEST_PROJECT,
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      testProjectId = response.data.data.project._id;
      
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('status', 'success');
      expect(response.data.data.project).toMatchObject({
        title: TEST_PROJECT.title,
        description: TEST_PROJECT.description,
        status: TEST_PROJECT.status
      });
    });
    
    // Add more tests for update and delete operations
  });
});

// Run the tests
(async () => {
  try {
    // Run tests
    console.log('Starting project API tests...');
    
    // Test GET /api/projects
    console.log('\nTesting GET /api/projects');
    const listResponse = await axios.get(`${API_BASE_URL}/projects`);
    console.log(`Found ${listResponse.data.data.projects.length} projects`);
    
    if (listResponse.data.data.projects.length > 0) {
      // Test GET /api/projects/:id with the first project
      const projectId = listResponse.data.data.projects[0]._id;
      console.log(`\nTesting GET /api/projects/${projectId}`);
      const singleResponse = await axios.get(`${API_BASE_URL}/projects/${projectId}`);
      console.log('Project details:', {
        id: singleResponse.data.data.project._id,
        title: singleResponse.data.data.project.title,
        status: singleResponse.data.data.project.status,
        featured: singleResponse.data.data.project.featured
      });
    }
    
    console.log('\nProject API tests completed successfully');
  } catch (error) {
    console.error('\nError running project API tests:');
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
})();
