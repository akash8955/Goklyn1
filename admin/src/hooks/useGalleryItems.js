import { useState, useCallback } from 'react';
import { message } from 'antd';
import galleryService from '../services/galleryService';

export const useGalleryItems = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 12,
    total: 0,
  });
  const [filters, setFilters] = useState({});
  const [searchText, setSearchText] = useState('');

  const fetchGalleryItems = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const { current, pageSize } = pagination;
      const query = {
        page: params.pagination?.current || current,
        limit: params.pagination?.pageSize || pageSize,
        search: searchText,
        ...filters,
        ...params,
      };

      // Remove null/undefined filters
      Object.keys(query).forEach(key => {
        if (query[key] === null || query[key] === undefined) {
          delete query[key];
        }
      });

      const response = await galleryService.getGalleryItems(query);
      setGalleryItems(response.data || []);
      setPagination({
        ...pagination,
        current: query.page,
        pageSize: query.limit,
        total: response.pagination?.total || 0,
      });
      return response;
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      message.error('Failed to load gallery items');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [filters, pagination, searchText]);

  const createGalleryItem = async (data) => {
    try {
      const response = await galleryService.createGalleryItem(data);
      message.success('Gallery item created successfully');
      await fetchGalleryItems();
      return response;
    } catch (error) {
      console.error('Error creating gallery item:', error);
      message.error('Failed to create gallery item');
      throw error;
    }
  };

  const updateGalleryItem = async (id, data) => {
    try {
      const response = await galleryService.updateGalleryItem(id, data);
      message.success('Gallery item updated successfully');
      await fetchGalleryItems();
      return response;
    } catch (error) {
      console.error('Error updating gallery item:', error);
      message.error('Failed to update gallery item');
      throw error;
    }
  };

  const deleteGalleryItem = async (id) => {
    try {
      await galleryService.deleteGalleryItem(id);
      message.success('Gallery item deleted successfully');
      await fetchGalleryItems({
        pagination: {
          ...pagination,
          total: Math.max(0, pagination.total - 1),
        },
      });
    } catch (error) {
      console.error('Error deleting gallery item:', error);
      message.error('Failed to delete gallery item');
      throw error;
    }
  };

  const toggleFeatured = async (id, isFeatured) => {
    try {
      await galleryService.updateGalleryItem(id, { isFeatured: !isFeatured });
      message.success(`Item ${!isFeatured ? 'marked as featured' : 'removed from featured'}`);
      await fetchGalleryItems();
    } catch (error) {
      console.error('Error toggling featured status:', error);
      message.error('Failed to update featured status');
      throw error;
    }
  };

  return {
    galleryItems,
    loading,
    pagination,
    filters,
    searchText,
    setSearchText,
    setFilters,
    setPagination,
    fetchGalleryItems,
    createGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    toggleFeatured,
  };
};

export default useGalleryItems;
