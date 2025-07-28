import React, { createContext, useContext, useState, useEffect } from 'react';
import galleryService from '../services/galleryService';
import { useAuth } from './AuthContext'; // adjust path if needed

const GalleryContext = createContext();

export const GalleryProvider = ({ children }) => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      console.log('[GalleryContext] Fetching albums...');
      const response = await galleryService.getAlbums();
      
      // Handle the updated response format from backend:
      // { success: true, count, total, totalPages, currentPage, data: [...] }
      const albumsData = Array.isArray(response?.data) ? response.data : [];
      console.log(`[GalleryContext] Fetched ${albumsData.length} of ${response?.total || 0} albums`);
      
      setAlbums(albumsData);
      return albumsData;
    } catch (error) {
      console.error('[GalleryContext] Error fetching albums:', {
        message: error.message,
        response: error.response?.data
      });
      setAlbums([]);
      throw error; // Re-throw to allow error handling in components
    } finally {
      setLoading(false);
    }
  };

  const createAlbum = async (albumData) => {
    const response = await galleryService.createAlbum(albumData);
    await fetchAlbums();
    return response;
  };

  const updateAlbum = async (id, albumData) => {
    const response = await galleryService.updateAlbum(id, albumData);
    await fetchAlbums();
    return response;
  };

  const deleteAlbum = async (id) => {
    await galleryService.deleteAlbum(id);
    await fetchAlbums();
  };

  const { isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchAlbums();
    }
  }, [isAuthenticated, authLoading]);

  return (
    <GalleryContext.Provider
      value={{
        albums,
        loading,

        fetchAlbums,
        createAlbum,
        updateAlbum,
        deleteAlbum,
      }}
    >
      {children}
    </GalleryContext.Provider>
  );
};

export const useGallery = () => {
  const context = useContext(GalleryContext);
  if (!context) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
};

export default GalleryContext;
