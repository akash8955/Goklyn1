import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import newsService from '../services/newsService';
import { useAuth } from './AuthContext';

const NewsContext = createContext();

export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};

export const NewsProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: undefined,
    category: undefined,
    featured: undefined,
    search: '',
  });
  const [categories, setCategories] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedNews, setSelectedNews] = useState(null);
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reset news when logging out
  useEffect(() => {
    if (!isAuthenticated) {
      setNews([]);
      setCategories([]);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch news with filters and pagination
  const fetchNews = useCallback(async (params = {}) => {
    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      console.log('[NewsContext] Not authenticated, skipping news fetch');
      return { data: [], pagination: { ...pagination, total: 0, page: 1 } };
    }

    try {
      console.log('[NewsContext] Starting news fetch with params:', params);
      setLoading(true);
      
      // Merge default params with provided params
      const queryParams = {
        page: params.page || pagination.current,
        limit: params.limit || pagination.pageSize,
        ...filters,
        ...params,
      };

      console.log('[NewsContext] Fetching news with combined params:', queryParams);
      
      let response;
      try {
        response = await newsService.getNews(queryParams);
        console.log('[NewsContext] News fetch successful, processing response');
      } catch (error) {
        console.error('[NewsContext] Error fetching news:', {
          message: error.message,
          status: error.status,
          response: error.response
        });
        message.error('Failed to load news. Please try again.');
        throw error;
      } finally {
        if (!isMounted.current) {
          console.log('[NewsContext] Component unmounted, aborting state updates');
          return { data: [], pagination };
        }
      }
      
      // Handle the standardized response format from newsService
      const newsList = Array.isArray(response.data) ? response.data : [];
      const paginationData = response.pagination || {
        total: 0,
        page: queryParams.page,
        limit: queryParams.limit,
        totalPages: 0
      };
      
      console.log('[NewsContext] Processed news data:', {
        itemsCount: newsList.length,
        pagination: paginationData
      });
      
      // Only update state if the component is still mounted
      if (isMounted.current) {
        setNews(newsList);
        setPagination({
          current: paginationData.page,
          pageSize: paginationData.limit,
          total: paginationData.total,
          totalPages: paginationData.totalPages
        });
      }

      return {
        data: newsList,
        pagination: {
          total: paginationData.total,
          page: paginationData.page,
          limit: paginationData.limit,
          totalPages: paginationData.totalPages
        }
      };
    } catch (error) {
      console.error('Error in fetchNews:', error);
      
      if (!isMounted.current) return { data: [], pagination };
      
      // Only show error message if it's not a 404 (not found is handled gracefully)
      if (error?.response?.status !== 404) {
        message.error(error.response?.data?.message || 'Failed to load news');
      }
      
      // Reset to empty state on error
      if (isMounted.current) {
        setNews([]);
        setPagination(prev => ({
          ...prev,
          total: 0,
          current: 1
        }));
      }
      
      return {
        data: [],
        pagination: {
          total: 0,
          page: 1,
          limit: pagination.pageSize,
          totalPages: 0
        }
      };
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    // Don't fetch if not authenticated (same as fetchNews)
    if (!isAuthenticated) {
      console.log('Not authenticated, skipping categories fetch');
      return [];
    }

    try {
      console.log('Fetching categories...');
      const categoriesData = await newsService.getCategories();
      
      // Ensure we always have an array, even if empty
      const safeCategories = Array.isArray(categoriesData) ? categoriesData : [];
      
      // Only update state if we have valid data
      if (safeCategories.length > 0) {
        setCategories(safeCategories);
      } else {
        console.warn('No categories found or empty response');
        setCategories([]);
      }
      
      return safeCategories;
    } catch (error) {
      console.error('Error in fetchCategories:', error);
      
      // Only show error message if it's not a 404 (not found is handled gracefully)
      if (error?.response?.status !== 404) {
        message.error(error.response?.data?.message || 'Failed to load categories');
      }
      
      // Set empty categories on error
      setCategories([]);
      return [];
    }
  }, []);

  // Create news article
  const createNews = async (data) => {
    try {
      const response = await newsService.createNews(data);
      message.success('Article created successfully');
      await fetchNews();
      return response.data;
    } catch (error) {
      console.error('Error creating news:', error);
      message.error('Failed to create article');
      throw error;
    }
  };

  // Update news article
  const updateNews = async (id, data) => {
    try {
      const response = await newsService.updateNews(id, data);
      message.success('Article updated successfully');
      await fetchNews();
      return response.data;
    } catch (error) {
      console.error('Error updating news:', error);
      message.error('Failed to update article');
      throw error;
    }
  };

  // Delete news article
  const deleteNews = async (id) => {
    try {
      await newsService.deleteNews(id);
      message.success('Article deleted successfully');
      await fetchNews();
      return true;
    } catch (error) {
      console.error('Error deleting news:', error);
      message.error('Failed to delete article');
      throw error;
    }
  };

  // Bulk delete news articles
  const bulkDeleteNews = async (ids) => {
    try {
      await Promise.all(ids.map(id => newsService.deleteNews(id)));
      message.success(`Successfully deleted ${ids.length} articles`);
      await fetchNews();
      setSelectedRows([]);
      return true;
    } catch (error) {
      console.error('Error bulk deleting news:', error);
      message.error('Failed to delete selected articles');
      throw error;
    }
  };

  // Update filters
  const updateFilters = (newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
    setPagination(prev => ({
      ...prev,
      current: 1, // Reset to first page when filters change
    }));
  };

  // Handle table change (pagination, filters, sorter)
  const handleTableChange = (pagination, filters, sorter) => {
    setPagination({
      ...pagination,
      current: pagination.current,
      pageSize: pagination.pageSize,
    });

    // Handle sorting
    if (sorter.field) {
      updateFilters({
        sortBy: sorter.field,
        sortOrder: sorter.order === 'descend' ? 'desc' : 'asc',
      });
    }
  };

  // Effect to handle initial data loading and authentication changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchNews();
      fetchCategories();
    } else {
      // Clear data when not authenticated
      setNews([]);
      setCategories([]);
    }
  }, [isAuthenticated, fetchNews, fetchCategories]);

  // Update news list when filters or pagination changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchNews();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.current, pagination.pageSize, isAuthenticated]);
  
  // No need for the separate initial fetch effect as it's handled by the first effect
  // This prevents duplicate API calls

  const value = {
    news,
    loading,
    pagination,
    filters,
    categories,
    selectedRows,
    selectedNews,
    setSelectedNews,
    setSelectedRows,
    fetchNews,
    createNews,
    updateNews,
    deleteNews,
    bulkDeleteNews,
    updateFilters,
    handleTableChange,
  };

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  );
};

export default NewsContext;
