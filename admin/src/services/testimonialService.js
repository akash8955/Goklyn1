import api from '../api';

const TESTIMONIAL_ENDPOINT = '/testimonials';

/**
 * A service object for handling testimonial-related API requests.
 */
const testimonialService = {
  /**
   * Fetches all testimonials from the server for the admin view.
   * @returns {Promise<Array>} A promise that resolves to an array of testimonials.
   */
  async getTestimonials() {
    try {
      // The admin view needs all testimonials, not just approved ones.
      const response = await api.get(`${TESTIMONIAL_ENDPOINT}/all`);
      // The response now contains the full response object
      const data = response.data?.data || response.data;
      
      if (Array.isArray(data)) {
        return data;
      } else if (data && Array.isArray(data.testimonials)) {
        return data.testimonials;
      }
      
      console.warn('API did not return an array for testimonials. Response:', response.data);
      return [];
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error?.response?.data?.message || error?.message || JSON.stringify(error);
    }
  },

  /**
   * Creates a new testimonial.
   * @param {Object} testimonialData - The data for the new testimonial.
   * @returns {Promise<Object>} A promise that resolves to the newly created testimonial.
   */
  async createTestimonial(testimonialData) {
    try {
      const response = await api.post(`${TESTIMONIAL_ENDPOINT}/add`, testimonialData);
      // Return the data property from the response
      return response.data;
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error?.response?.data?.message || error?.message || JSON.stringify(error);
    }
  },

  /**
   * Updates an existing testimonial.
   * @param {string} id - The ID of the testimonial to update.
   * @param {Object} testimonialData - The data containing the updates.
   * @returns {Promise<Object>} A promise that resolves to the updated testimonial.
   */
  async updateTestimonial(id, testimonialData) {
    try {
      const response = await api.put(`${TESTIMONIAL_ENDPOINT}/${id}`, testimonialData);
      // Return the data property from the response
      return response.data;
    } catch (error) {
      console.error(`Error updating testimonial ${id}:`, error);
      throw error?.response?.data?.message || error?.message || JSON.stringify(error);
    }
  },

  /**
   * Deletes a testimonial.
   * @param {string} id - The ID of the testimonial to delete.
   * @returns {Promise<Object>} A promise that resolves to the deletion confirmation message.
   */
  async deleteTestimonial(id) {
    try {
      const response = await api.delete(`${TESTIMONIAL_ENDPOINT}/${id}`);
      // Return the data property from the response
      return response.data;
    } catch (error) {
      console.error(`Error deleting testimonial ${id}:`, error);
      throw error?.response?.data?.message || error?.message || JSON.stringify(error);
    }
  },
};

export default testimonialService;
