import api from './api';

const GALLERY_API_BASE = '/api/gallery';

/**
 * Get all gallery items with optional filters
 * @param {Object} filters - Filter options (category, featured, status, search, page, limit)
 * @returns {Promise<Array>} - Array of gallery items
 */
export const getGalleryItems = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await api.get(`${GALLERY_API_BASE}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching gallery items:', error);
    throw error;
  }
};

/**
 * Get a single gallery item by ID
 * @param {string} id - Gallery item ID
 * @returns {Promise<Object>} - Gallery item details
 */
export const getGalleryItem = async (id) => {
  try {
    const response = await api.get(`${GALLERY_API_BASE}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching gallery item ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new gallery item
 * @param {Object} galleryData - Gallery item data
 * @param {File} image - Image file to upload
 * @returns {Promise<Object>} - Created gallery item
 */
export const createGalleryItem = async (galleryData, image) => {
  try {
    const formData = new FormData();
    
    // Append all gallery data fields
    Object.entries(galleryData).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Handle array fields like tags
        value.forEach(item => formData.append(key, item));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    
    // Append the image file if provided
    if (image) {
      formData.append('image', image);
    }
    
    const response = await api.post(GALLERY_API_BASE, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error creating gallery item:', error);
    throw error;
  }
};

/**
 * Update an existing gallery item
 * @param {string} id - Gallery item ID
 * @param {Object} updates - Fields to update
 * @param {File} [newImage] - Optional new image file
 * @returns {Promise<Object>} - Updated gallery item
 */
export const updateGalleryItem = async (id, updates, newImage = null) => {
  try {
    const formData = new FormData();
    
    // Append all update fields
    Object.entries(updates).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(item => formData.append(key, item));
      } else if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    
    // Append new image if provided
    if (newImage) {
      formData.append('image', newImage);
    }
    
    const response = await api.put(`${GALLERY_API_BASE}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error updating gallery item ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a gallery item
 * @param {string} id - Gallery item ID
 * @returns {Promise<void>}
 */
export const deleteGalleryItem = async (id) => {
  try {
    await api.delete(`${GALLERY_API_BASE}/${id}`);
  } catch (error) {
    console.error(`Error deleting gallery item ${id}:`, error);
    throw error;
  }
};

/**
 * Toggle featured status of a gallery item
 * @param {string} id - Gallery item ID
 * @returns {Promise<Object>} - Updated gallery item
 */
export const toggleFeatured = async (id) => {
  try {
    const response = await api.patch(`${GALLERY_API_BASE}/${id}/featured`);
    return response.data;
  } catch (error) {
    console.error(`Error toggling featured status for gallery item ${id}:`, error);
    throw error;
  }
};

/**
 * Get all available gallery categories
 * @returns {Array} - Array of category names
 */
export const getGalleryCategories = () => {
  // This would typically come from an API endpoint
  // For now, we'll return the same categories defined in the model
  return ['nature', 'architecture', 'people', 'events', 'other'];
};
