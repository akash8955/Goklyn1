import { useState, useEffect, useCallback, useRef } from 'react';
import { message } from 'antd';
import galleryService from '../services/galleryService';

export default function useDashboardAlbums(limit = 5) {
  const [albums, setAlbums] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchAlbums = useCallback(async () => {
    if (abortControllerRef.current) {
      console.log('[useDashboardAlbums] Aborting previous request.');
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      setLoading(true);
      setError(null);
      console.log('[useDashboardAlbums] Fetching albums...');
      
      const response = await galleryService.getAlbums({ 
        page: 1, 
        limit,
        sort: '-createdAt'
      }, { signal });
      
      console.log('[useDashboardAlbums] Albums response received.');
      
      // The galleryService.getAlbums method standardizes the response for us.
      const items = response.data || [];
      const totalItems = response.total || 0;
      
      setAlbums(items);
      setTotal(totalItems);
      
    } catch (err) {
      if (signal.aborted) {
        console.log('[useDashboardAlbums] Request was aborted.');
        return;
      }
      console.error('[useDashboardAlbums] Error fetching albums:', {
        message: err.message,
        name: err.name,
        status: err.status,
      });
      const errorMessage = err.message || 'Failed to fetch albums.';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchAlbums();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchAlbums]);

  // Function to manually refresh the albums
  const refreshAlbums = useCallback(() => {
    console.log('[useDashboardAlbums] Manually refreshing albums...');
    return fetchAlbums();
  }, [fetchAlbums]);

  const isEmpty = !loading && !error && albums.length === 0;

  return { 
    albums, 
    total, 
    loading, 
    error, 
    isEmpty,
    refreshAlbums 
  };
}
