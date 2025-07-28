import api from './api';

// Helper function to handle successful responses
const handleResponse = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  const error = new Error(response.statusText);
  error.response = response;
  throw error;
};

// Helper function to handle errors
const handleError = (error, defaultMessage = 'An error occurred') => {
  console.error(error);
  const errorMessage = error.response?.data?.message || error.message || defaultMessage;
  const errorToThrow = new Error(errorMessage);
  errorToThrow.status = error.response?.status;
  throw errorToThrow;
};

const NEWS_ENDPOINT = '/news';

const newsService = {
  /**
   * Get all news articles with optional filters
   * @param {Object} params - Query parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=10] - Items per page
   * @param {string} [params.status] - Filter by status (published/draft/archived)
   * @param {string} [params.category] - Filter by category ID
   * @param {string} [params.search] - Search query
   * @param {string} [params.tag] - Filter by tag
   * @param {boolean} [params.featured] - Filter featured articles
   * @returns {Promise<Array>} Array of news articles
   */
  async getNews(params = {}, options = {}) {
    try {
      console.log('[newsService] Fetching news with params:', params);
      const response = await api.get(NEWS_ENDPOINT, {
        params,
        signal: options.signal,
        timeout: 15000, // 15 second timeout
      });

      console.log('[newsService] News API response received:', response.data);
      const { data, total, totalPages, currentPage, limit } = response.data;

      // Standardize the response format for the UI
      return {
        data: data || [],
        pagination: {
          total: total || 0,
          page: currentPage || 1,
          limit: limit || 10,
          totalPages: totalPages || 0,
        },
      };
    } catch (error) {
      if (error.name === 'AbortError' || error.message === 'canceled') {
        // This is a controlled request cancellation.
        // Re-throw the original error so the calling hook's `signal.aborted`
        // check can handle it gracefully without showing a user-facing error.
        throw error;
      }

      if (error.code === 'ECONNABORTED') {
        console.error('[newsService] Request timed out.');
        throw new Error('The request to the server timed out. Please try again.');
      }

      console.error('[newsService] Error fetching news:', {
        message: error.message,
        status: error.response?.status,
        response: error.response?.data,
      });

      // Re-throw a formatted error so the UI layer can handle it
      const enhancedError = new Error(error.response?.data?.message || error.message || 'Failed to fetch news');
      enhancedError.status = error.response?.status;
      throw enhancedError;
    }
  },

  /**
   * Get a single news article by ID or slug
   * @param {string} idOrSlug - Article ID or slug
   * @returns {Promise<Object>} News article data
   */
  async getNewsItem(idOrSlug) {
    try {
      const response = await api.get(`${NEWS_ENDPOINT}/${idOrSlug}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'Failed to fetch article');
    }
  },

  /**
   * Create a new news article
   * @param {Object} articleData - Article data
   * @returns {Promise<Object>} Created article data
   */
  async createNews(articleData) {
    try {
      const response = await api.post(NEWS_ENDPOINT, articleData);
      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'Failed to create article');
    }
  },

  /**
   * Update an existing news article
   * @param {string} id - Article ID
   * @param {Object} articleData - Updated article data
   * @returns {Promise<Object>} Updated article data
   */
  async updateNews(id, articleData) {
    try {
      const response = await api.patch(`${NEWS_ENDPOINT}/${id}`, articleData);
      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'Failed to update article');
    }
  },

  /**
   * Delete a news article
   * @param {string} id - Article ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteNews(id) {
    try {
      const response = await api.delete(`${NEWS_ENDPOINT}/${id}`);
      return handleResponse(response);
    } catch (error) {
      return handleError(error, 'Failed to delete article');
    }
  },

  /**
   * Get news categories
   * @returns {Promise<Array>} Array of categories
   */
  async getCategories() {
    try {
      console.log('[newsService] Fetching categories...');
      const response = await api.get(`${NEWS_ENDPOINT}/categories`);

      console.log('[newsService] Categories API response:', response);

      // The backend now returns a consistent { success, count, data } object.
      // We just need to return the data array, or an empty array if it's missing.
      return response.data?.data || [];
    } catch (error) {
      console.error('[newsService] Error fetching categories:', {
        message: error.message,
        status: error.response?.status,
      });

      // Re-throw a formatted error so the UI layer can handle it
      return handleError(error, 'Failed to fetch categories');
    }
  },

  /**
   * Upload featured image
   * @param {File} file - Image file to upload
   * @returns {Promise<Object>} Upload result with URL
   */
  async uploadImage(file) {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Handle different response formats
      if (response.data?.url) {
        return { url: response.data.url };
      } else if (response.data?.secure_url) {
        return { url: response.data.secure_url };
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // For demo purposes, return a placeholder URL
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Using placeholder image due to upload error');
        return { 
          url: `https://via.placeholder.com/800x500?text=${encodeURIComponent(file.name)}` 
        };
      }
      
      throw this.formatError(error, 'Failed to upload image');
    }
  },

  /**
   * Format error message from API response
   * @private
   */
  formatError(error, defaultMessage = 'An error occurred') {
    if (error?.response?.data?.message) {
      return new Error(error.response.data.message);
    }
    if (error?.message) {
      return new Error(error.message);
    }
    return new Error(defaultMessage);
  },
};

export default newsService;
