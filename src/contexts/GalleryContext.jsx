import React, { createContext, useContext, useReducer, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  getGalleryItems, 
  getGalleryItem, 
  createGalleryItem, 
  updateGalleryItem, 
  deleteGalleryItem, 
  toggleFeatured,
  getGalleryCategories
} from '../services/galleryService';

const GalleryContext = createContext();

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};

const initialState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
  categories: [],
  filters: {
    category: '',
    featured: false,
    search: '',
    page: 1,
    limit: 12,
  },
  pagination: {
    total: 0,
    totalPages: 1,
    currentPage: 1,
  },
};

const galleryReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_ITEMS':
      return { 
        ...state, 
        items: action.payload.items,
        loading: false,
        pagination: {
          ...state.pagination,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.currentPage,
        }
      };
    
    case 'SET_CURRENT_ITEM':
      return { ...state, currentItem: action.payload, loading: false };
    
    case 'ADD_ITEM':
      return { ...state, items: [action.payload, ...state.items] };
    
    case 'UPDATE_ITEM':
      return {
        ...state,
        items: state.items.map(item => 
          item._id === action.payload._id ? action.payload : item
        ),
        currentItem: action.payload,
      };
    
    case 'DELETE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item._id !== action.payload),
        currentItem: state.currentItem?._id === action.payload ? null : state.currentItem,
      };
    
    case 'TOGGLE_FEATURED':
      return {
        ...state,
        items: state.items.map(item => 
          item._id === action.payload._id 
            ? { ...item, isFeatured: action.payload.isFeatured } 
            : item
        ),
        currentItem: state.currentItem?._id === action.payload._id 
          ? { ...state.currentItem, isFeatured: action.payload.isFeatured }
          : state.currentItem,
      };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    
    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };
    
    default:
      return state;
  }
};

export const GalleryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(galleryReducer, initialState);

  // Fetch gallery items when filters change
  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const { data } = await getGalleryItems(state.filters);
        dispatch({ 
          type: 'SET_ITEMS', 
          payload: {
            items: data.data,
            total: data.total,
            totalPages: data.totalPages,
            currentPage: data.currentPage,
          }
        });
      } catch (error) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: error.response?.data?.message || 'Failed to fetch gallery items' 
        });
      }
    };

    fetchGalleryItems();
  }, [state.filters]);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categories = await getGalleryCategories();
        dispatch({ type: 'SET_CATEGORIES', payload: categories });
      } catch (error) {
        console.error('Failed to fetch gallery categories:', error);
      }
    };

    fetchCategories();
  }, []);

  // Set filters
  const setFilters = (filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  // Get a single gallery item
  const getItem = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data } = await getGalleryItem(id);
      dispatch({ type: 'SET_CURRENT_ITEM', payload: data });
      return data;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to fetch gallery item' 
      });
      throw error;
    }
  };

  // Add a new gallery item
  const addItem = async (itemData, imageFile) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data } = await createGalleryItem(itemData, imageFile);
      dispatch({ type: 'ADD_ITEM', payload: data });
      return data;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to add gallery item' 
      });
      throw error;
    }
  };

  // Update an existing gallery item
  const updateItem = async (id, updates, newImage = null) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data } = await updateGalleryItem(id, updates, newImage);
      dispatch({ type: 'UPDATE_ITEM', payload: data });
      return data;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to update gallery item' 
      });
      throw error;
    }
  };

  // Delete a gallery item
  const removeItem = async (id) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await deleteGalleryItem(id);
      dispatch({ type: 'DELETE_ITEM', payload: id });
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to delete gallery item' 
      });
      throw error;
    }
  };

  // Toggle featured status of a gallery item
  const toggleItemFeatured = async (id) => {
    try {
      const { data } = await toggleFeatured(id);
      dispatch({ 
        type: 'TOGGLE_FEATURED', 
        payload: { _id: id, isFeatured: data.isFeatured } 
      });
      return data;
    } catch (error) {
      dispatch({ 
        type: 'SET_ERROR', 
        payload: error.response?.data?.message || 'Failed to toggle featured status' 
      });
      throw error;
    }
  };

  // Clear current item
  const clearCurrentItem = () => {
    dispatch({ type: 'SET_CURRENT_ITEM', payload: null });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  return (
    <GalleryContext.Provider
      value={{
        ...state,
        getItem,
        addItem,
        updateItem,
        removeItem,
        toggleItemFeatured,
        setFilters,
        clearCurrentItem,
        clearError,
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
};

GalleryProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { GalleryContext };
