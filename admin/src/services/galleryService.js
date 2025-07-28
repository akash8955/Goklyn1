import api from '../api';

const GALLERY_ENDPOINT = '/gallery';
const ALBUMS_ENDPOINT = '/gallery/albums';

/**
 * A centralized API error handler for the gallery service.
 * @param {Error} error - The error object from Axios.
 * @param {string} context - A string describing the action that failed (e.g., "fetching gallery items").
 * @throws {Error} - Throws a new, user-friendly error.
 */
const handleApiError = (error, context) => {
  console.error(`[GalleryService] Error ${context}:`, {
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
    // This is a controlled request cancellation, not a true failure.
    // Re-throw the original error so the calling hook's `signal.aborted`
    // check can handle it gracefully without showing a user-facing error.
    throw error;
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
    throw new Error('The requested resource was not found.');
  }
  if (error.response?.status >= 500) {
    throw new Error('A server error occurred. Please try again later.');
  }

  // Default error message
  const message = error.response?.data?.message || error.message || `An unexpected error occurred while ${context}.`;
  throw new Error(message);
};

const galleryService = {
  /**
   * Uploads an image. Note: The endpoint seems generic.
   * Consider moving to a dedicated upload service if used outside the gallery.
   * @param {File} file - The image file to upload.
   * @returns {Promise<Object>} - The upload result from the server.
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
      return response.data;
    } catch (error) {
      handleApiError(error, 'uploading image');
    }
  },

  /**
   * Fetches all gallery items
   * @param {Object} filters - Optional filters for querying
   * @returns {Promise<Array>} - Array of gallery items
   */
  async getGalleryItems(filters = {}, options = {}) {
    try {
      const response = await api.get(GALLERY_ENDPOINT, {
        params: filters,
        signal: options.signal,
        timeout: 15000, // 15-second timeout
      });
      return response.data;
    } catch (error) {
      handleApiError(error, 'fetching gallery items');
    }
  },

  /**
   * Fetches a single gallery item by ID
   * @param {string} id - Gallery item ID
   * @returns {Promise<Object>} - Gallery item details
   */
  async getGalleryItem(id) {
    try {
      const response = await api.get(`${GALLERY_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `fetching gallery item ${id}`);
    }
  },

  /**
   * Creates a new gallery item
   * @param {FormData} formData - Gallery item data including files
   * @returns {Promise<Object>} - Created gallery item
   */
  async createGalleryItem(formData) {
    try {
      console.log('[GalleryService] Creating gallery item with form data:', formData);
      const response = await api.post(GALLERY_ENDPOINT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // Increase timeout for file uploads
      });
      console.log('[GalleryService] Gallery item created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('[GalleryService] Error creating gallery item:', error);
      handleApiError(error, 'creating gallery item');
    }
  },

  /**
   * Updates an existing gallery item
   * @param {string} id - Gallery item ID
   * @param {Object} data - Updated gallery item data
   * @returns {Promise<Object>} - Updated gallery item
   */
  async updateGalleryItem(id, data) {
    try {
      const response = await api.put(`${GALLERY_ENDPOINT}/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error, `updating gallery item ${id}`);
    }
  },

  /**
   * Deletes a gallery item
   * @param {string} id - Gallery item ID
   * @returns {Promise<Object>} - Deletion confirmation
   */
  async deleteGalleryItem(id) {
    try {
      const response = await api.delete(`${GALLERY_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error, `deleting gallery item ${id}`);
    }
  },

  /**
   * Deletes multiple gallery items by their IDs.
   * @param {string[]} ids - An array of gallery item IDs to delete.
   * @returns {Promise<Object>} - A confirmation from the server.
   */
  async deleteMultipleGalleryItems(ids) {
    try {
      // For DELETE requests, axios expects the body payload in a `data` property.
      const response = await api.delete(GALLERY_ENDPOINT, { data: { ids } });
      return response.data;
    } catch (error) {
      handleApiError(error, 'deleting multiple gallery items');
    }
  },
  /**
   * Gets all albums
   * @param {Object} params - Query parameters (page, limit, isPublic, etc.)
   * @returns {Promise<Object>} - Paginated response with albums and pagination info
   */
  async getAlbums(params = {}, options = {}) {
    try {
      console.log('[GalleryService] Fetching albums with params:', params);
      const response = await api.get(ALBUMS_ENDPOINT, { 
        params,
        signal: options.signal,
        timeout: 10000 // 10-second timeout
      });
      
      console.log('[GalleryService] Albums response received', {
        status: response.status,
        count: response.data?.data?.length,
        total: response.data?.total,
        page: response.data?.currentPage,
        totalPages: response.data?.totalPages
      });
      
      // Standardize the response format for the UI
      return {
        success: response.data?.success,
        data: response.data?.data || [],
        total: response.data?.total || 0,
        page: response.data?.currentPage || 1,
        pages: response.data?.totalPages || 1,
        limit: response.data?.limit || 10
      };
    } catch (error) {
      handleApiError(error, 'fetching albums');
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
      console.log(`[GalleryService] Fetching items for album ${albumId} with params:`, params);
      const response = await api.get(`${ALBUMS_ENDPOINT}/${albumId}/items`, { 
        params,
        timeout: 10000 // 10-second timeout
      });
      console.log(`[GalleryService] Album ${albumId} items response received`);
      
      // The backend now returns a flat, standardized response.
      return {
        success: response.data?.success,
        album: response.data?.album,
        data: response.data?.data || [],
        total: response.data?.total || 0,
        page: response.data?.currentPage || 1,
        pages: response.data?.totalPages || 1,
        limit: response.data?.limit || 12
      };

    } catch (error) {
      handleApiError(error, `fetching items for album ${albumId}`);
    }
  },
};

export default galleryService;
