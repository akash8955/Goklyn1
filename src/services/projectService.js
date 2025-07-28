import api from '../api';

const PROJECT_ENDPOINT = '/projects'; // This is relative to the base URL set in api.js

const projectService = {
  // Get all projects from backend
  async getProjects(params = {}) {
    try {
      console.log('Fetching projects from:', PROJECT_ENDPOINT);
      console.log('With params:', params);
      
      const response = await api.get(PROJECT_ENDPOINT, { params });
      
      console.log('API Response:', {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers
      });
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      const data = Array.isArray(response.data) ? response.data : [];
      console.log(`Found ${data.length} projects`);
      return data;
      
    } catch (error) {
      console.error('Error in getProjects:', {
        message: error.message,
        response: error.response ? {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        } : 'No response',
        request: error.request ? 'Request was made but no response received' : 'No request was made',
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      });
      throw error;
    }
  },

  // Get a single project by ID from backend
  async getProjectById(id) {
    try {
      const response = await api.get(`${PROJECT_ENDPOINT}/${id}`);
      if (!response.data) {
        throw new Error('Project not found');
      }
      return response.data;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      throw error; // Re-throw to be handled by the component
    }
  },

  // Create a new project (Admin only)
  async createProject(projectData) {
    try {
      const response = await api.post(PROJECT_ENDPOINT, projectData);
      return response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error; // Re-throw to be handled by the component
    }
  },

  // Update an existing project (Admin only)
  async updateProject(id, projectData) {
    try {
      const response = await api.put(`${PROJECT_ENDPOINT}/${id}`, projectData);
      return response.data;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      throw error; // Re-throw to be handled by the component
    }
  },

  // Delete a project (Admin only)
  async deleteProject(id) {
    try {
      console.log(`Attempting to delete project ${id}`);
      const response = await api.delete(`${PROJECT_ENDPOINT}/${id}`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log('Delete successful, response:', response.status, response.data);
      return response.data;
      
    } catch (error) {
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
        config: {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers
        }
      };
      
      console.error('Error deleting project:', errorDetails);
      
      // Handle specific error cases
      if (error.response) {
        if (error.response.status === 403) {
          throw new Error('You do not have permission to delete this project');
        } else if (error.response.status === 404) {
          throw new Error('Project not found or already deleted');
        } else if (error.response.data?.message) {
          throw new Error(error.response.data.message);
        }
      }
      
      throw new Error('Failed to delete project. Please try again later.');
    }
  }
};

export default projectService;
