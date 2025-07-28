import api from './api';

const ALBUMS_ENDPOINT = '/gallery/albums';

/**
 * A centralized API error handler for the album service.
 * @param {Error} error - The error object from Axios.
 * @param {string} context - A string describing the action that failed.
 * @throws {Error} - Throws a new, user-friendly error.
 */
const handleApiError = (error, context) => {
  console.error(`[AlbumService] Error ${context}:`, {
    message: error.message,
    name: error.name,
    code: error.code,
    request: {
      url: error.config?.url,
      method: error.config?.method,
    },
    response: error.response ? {
      status: error.response.status,
      data: error.response.data
    } : 'No response object',
  });

  if (error.name === 'AbortError' || error.message === 'canceled') {
    throw error; // Re-throw cancellation errors for the calling code to handle
  }

  if (error.response?.status === 429) {
    throw new Error('You are making requests too quickly. Please wait and try again.');
  }
  if (error.code === 'ECONNABORTED') {
    throw new Error('Request timed out. Please check your connection and try again.');
  }
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    throw new Error('You are offline. Please check your internet connection.');
  }
  if (error.response?.status === 401) {
    throw new Error('Your session has expired. Please log in again.');
  }
  if (error.response?.status === 403) {
    throw new Error('You do not have permission to perform this action.');
  }
  if (error.response?.status === 404) {
    throw new Error('The requested album was not found.');
  }

  // Default error message
  const message = error.response?.data?.message || error.message || `An unexpected error occurred while ${context}.`;
  throw new Error(message);
};

const albumService = {
  /**
   * Fetches all albums with pagination and filtering
   * @param {Object} params - Query parameters (page, limit, sort, etc.)
   * @param {Object} options - Additional options (signal for aborting requests)
   * @returns {Promise<Object>} - Paginated response with albums and metadata
   */
  async getAlbums(params = {}, options = {}) {
    try {
      const response = await api.get(ALBUMS_ENDPOINT, {
        params: {
          page: 1,
          limit: 100, // Get more albums by default
          sort: '-createdAt',
          ...params,
        },
        signal: options.signal,
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'fetching albums');
    }
  },

  /**
   * Fetches a single album by ID
   * @param {string} albumId - The ID of the album to fetch
   * @returns {Promise<Object>} - The album data
   */
  async getAlbum(albumId) {
    try {
      const response = await api.get(`${ALBUMS_ENDPOINT}/${albumId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `fetching album ${albumId}`);
    }
  },

  /**
   * Creates a new album
   * @param {Object} albumData - Album data (title, description, etc.)
   * @returns {Promise<Object>} - Created album data
   */
  async createAlbum(albumData) {
    try {
      console.log('Sending album data:', albumData);
      const response = await api.post(ALBUMS_ENDPOINT, albumData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response || !response.data) {
        throw new Error('Invalid response from server');
      }
      
      console.log('Album created successfully:', response.data);
      return response;
    } catch (error) {
      console.error('Error in createAlbum:', error);
      handleApiError(error, 'creating album');
      throw error; // Re-throw to allow the calling component to handle it
    }
  },

  /**
   * Updates an existing album
   * @param {string} albumId - Album ID to update
   * @param {Object} albumData - Updated album data
   * @returns {Promise<Object>} - Updated album data
   */
  async updateAlbum(albumId, albumData) {
    try {
      const response = await api.put(`${ALBUMS_ENDPOINT}/${albumId}`, albumData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, `updating album ${albumId}`);
    }
  },

  /**
   * Deletes an album
   * @param {string} albumId - Album ID to delete
   * @returns {Promise<Object>} - Deletion confirmation
   */
  async deleteAlbum(albumId) {
    try {
      const response = await api.delete(`${ALBUMS_ENDPOINT}/${albumId}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `deleting album ${albumId}`);
    }
  },

  /**
   * Gets items from a specific album
   * @param {string} albumId - Album ID
   * @param {Object} params - Query parameters (page, limit, etc.)
   * @returns {Promise<Object>} - Paginated response with album items and pagination info
   */
  async getAlbumItems(albumId, params = {}) {
    try {
      const response = await api.get(`${ALBUMS_ENDPOINT}/${albumId}/items`, {
        params: {
          page: 1,
          limit: 50,
          sort: '-createdAt',
          ...params,
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, `fetching items for album ${albumId}`);
    }
  },
};

export default albumService;
