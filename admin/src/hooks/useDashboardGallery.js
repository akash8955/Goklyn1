import { useState, useEffect, useCallback, useRef } from 'react';
import galleryService from '../services/galleryService';
import { message } from 'antd';

export default function useDashboardGallery(limit = 5) {
  const [gallery, setGallery] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchGallery = useCallback(async () => {
    if (abortControllerRef.current) {
      console.log('[useDashboardGallery] Aborting previous request.');
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      console.log('[useDashboardGallery] Starting gallery fetch...');
      setLoading(true);
      setError(null);
      
      // Corrected to call the existing getGalleryItems function
      const response = await galleryService.getGalleryItems({ 
        page: 1, 
        limit,
        sort: '-createdAt',
        // Using 'select' is more conventional for field selection.
        select: 'title,thumbnailUrl,mediaUrl'
      }, { signal });
      
      console.log('[useDashboardGallery] Gallery API response received.');
      
      // galleryService should guarantee a consistent response shape
      const galleryData = response.data || [];
      const paginationData = response.pagination || { total: 0 };
      
      setGallery(galleryData);
      setTotal(paginationData.total);
      
      if (galleryData.length === 0) {
        console.log('[useDashboardGallery] No gallery items found');
      }
    } catch (err) {
      if (signal.aborted) {
        console.log('[useDashboardGallery] Request was aborted');
        return;
      }
      
      console.error('[useDashboardGallery] Error fetching gallery:', {
        name: err.name,
        message: err.message,
        status: err.status,
      });
      
      const errorMessage = err.message || 'Failed to fetch gallery. Please try again later.';
      setError(errorMessage);
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchGallery();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchGallery]);

  const refreshGallery = useCallback(() => {
    console.log('[useDashboardGallery] Manually refreshing gallery...');
    return fetchGallery();
  }, [fetchGallery]);

  const isEmpty = !loading && !error && gallery.length === 0;

  return { 
    gallery, 
    total,
    loading, 
    error, 
    isEmpty,
    refreshGallery
  };
}