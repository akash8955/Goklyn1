import api from '../api';

const INTERNSHIP_ENDPOINT = '/internships';

/**
 * A service object for handling internship-related API requests.
 */
const internshipService = {
  /**
   * Fetches all internships from the server.
   * @returns {Promise<Array>} A promise that resolves to an array of internships.
   */
  async getInternships() {
    try {
      const response = await api.get(INTERNSHIP_ENDPOINT);
      // The response now contains the full response object
      const data = response.data?.data || response.data;
      
      // Handle different response formats
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.internships)) {
        return data.internships;
      }
      
      console.warn('API did not return an array for internships. Response:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching internships:', error);
      throw error?.response?.data?.message || error?.message || JSON.stringify(error);
    }
  },

  /**
   * Creates a new internship.
   * @param {FormData} formData - The form data for the new internship, including photo.
   * @returns {Promise<Object>} A promise that resolves to the newly created internship.
   */
  async createInternship(formData) {
    try {
      const response = await api.post(`${INTERNSHIP_ENDPOINT}/add`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Return the data property from the response
      return response.data;
    } catch (error) {
      console.error('Error creating internship:', error);
      throw error?.response?.data?.message || error?.message || JSON.stringify(error);
    }
  },

  /**
   * Updates an existing internship.
   * @param {string} id - The ID of the internship to update.
   * @param {FormData} formData - The form data containing the updates.
   * @returns {Promise<Object>} A promise that resolves to the updated internship.
   */
  async updateInternship(id, formData) {
    try {
      const response = await api.put(`${INTERNSHIP_ENDPOINT}/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Return the data property from the response
      return response.data;
    } catch (error) {
      console.error(`Error updating internship ${id}:`, error);
      throw error?.response?.data?.message || error?.message || JSON.stringify(error);
    }
  },

  /**
   * Deletes an internship.
   * @param {string} id - The ID of the internship to delete.
   * @returns {Promise<Object>} A promise that resolves to the deletion confirmation message.
   */
  async deleteInternship(id) {
    try {
      const response = await api.delete(`${INTERNSHIP_ENDPOINT}/${id}`);
      // Return the data property from the response
      return response.data;
    } catch (error) {
      console.error(`Error deleting internship ${id}:`, error);
      throw error?.response?.data?.message || error?.message || JSON.stringify(error);
    }
  },
};

export default internshipService;
