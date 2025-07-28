import { useState, useEffect, useCallback, useRef } from 'react';
import newsService from '../services/newsService';
import { message } from 'antd';

export default function useDashboardNews(limit = 5) {
  const [news, setNews] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const fetchNews = useCallback(async () => {
    // Abort any existing requests
    if (abortControllerRef.current) {
      console.log('[useDashboardNews] Aborting previous request.');
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    try {
      console.log('[useDashboardNews] Starting news fetch...');
      setLoading(true);
      setError(null);
      
      const response = await newsService.getNews({ 
        page: 1, 
        limit,
        status: 'published',
        sort: '-publishedAt',
        fields: 'title,excerpt,image,publishedAt,slug,author'
      }, { signal });
      
      console.log('[useDashboardNews] News API response received.');
      
      // newsService guarantees a consistent response shape
      const newsData = response.data || [];
      const paginationData = response.pagination || { total: 0 };
      
      setNews(newsData);
      setTotal(paginationData.total);
      
      if (newsData.length === 0) {
        console.log('[useDashboardNews] No news articles found');
        setError('No news articles found. Create your first article to get started!');
      }
    } catch (err) {
      if (signal.aborted) {
        console.log('[useDashboardNews] Request was aborted');
        return;
      }
      
      console.error('[useDashboardNews] Error fetching news:', {
        name: err.name,
        message: err.message,
        status: err.status,
      });
      
      setError(err.message || 'Failed to fetch news. Please try again later.');
      // The service layer now throws a user-friendly error, so we can just display it.
      // The service also handles specific cases like timeouts.
      if (err.message) {
        message.error(err.message);
      }
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchNews();
    
    // The cleanup function for this effect will run when the component unmounts
    // or when the `fetchNews` dependency changes.
    return () => {
      if (abortControllerRef.current) {
        console.log('[useDashboardNews] Cleanup: Aborting request.');
        abortControllerRef.current.abort();
      }
    };
  }, [fetchNews]);

  // Function to manually refresh news
  const refreshNews = useCallback(() => {
    console.log('[useDashboardNews] Manually refreshing news...');
    return fetchNews();
  }, [fetchNews]);

  // Derive isEmpty state from other state variables
  const isEmpty = !loading && !error && news.length === 0;

  return { 
    news, 
    total,
    loading, 
    error, 
    isEmpty,
    refreshNews
  };
}
