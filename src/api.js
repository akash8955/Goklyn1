import axios from 'axios';

// Get the API base URL from environment variables
const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api';

// Function to get CSRF token from cookies
const getCsrfToken = () => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; csrf_token=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

// Create an Axios instance with the base URL configured
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This is required for cookies to be sent with requests
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest'
  },
  timeout: 10000, // 10 seconds
  xsrfCookieName: 'csrf_token',
  xsrfHeaderName: 'X-CSRF-Token',
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add timestamp to prevent caching for GET requests
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: new Date().getTime(),
      };
    }

    // Add CSRF token for non-GET requests
    if (config.method !== 'get' && config.method !== 'head') {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
      }
    }
    
    // Ensure Content-Type is set for POST/PUT/PATCH requests
    if (['post', 'put', 'patch'].includes(config.method) && !config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        headers: config.headers,
        params: config.params,
        data: config.data,
      });
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Update CSRF token if provided in the response
    const csrfToken = response.headers['x-csrf-token'];
    if (csrfToken) {
      document.cookie = `csrf_token=${csrfToken}; path=/; SameSite=Strict`;
    }
    
    // Log successful response in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[API] ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data
      });
    }
    
    return response;
  },
  async (error) => {
    // Check if this is a network error (no response)
    if (!error.response) {
      console.error('Network Error - Please check your internet connection');
      return Promise.reject({
        message: 'Network Error - Please check your internet connection',
        isNetworkError: true,
      });
    }

    const originalRequest = error.config;
    if (!originalRequest) {
      return Promise.reject(handleApiError(error));
    }

    // Log the error for debugging
    console.error('API Error:', {
      url: originalRequest.url,
      status: error.response.status,
      data: error.response.data,
      config: {
        method: originalRequest.method,
        params: originalRequest.params,
        data: originalRequest.data
      }
    });

    // Only handle 401 for non-authentication endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/');
    
    // Handle 401 Unauthorized
    if (error.response.status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      // If we have a refresh token, try to refresh the session
      if (getCsrfToken()) {
        originalRequest._retry = true;
        try {
          const refreshResponse = await api.post('/auth/refresh');
          if (refreshResponse.data.csrfToken) {
            document.cookie = `csrf_token=${refreshResponse.data.csrfToken}; path=/; SameSite=Strict`;
            originalRequest.headers['X-CSRF-Token'] = refreshResponse.data.csrfToken;
          }
          return api(originalRequest);
        } catch (refreshError) {
          console.warn('Session refresh failed:', refreshError);
          // Don't redirect to login, just continue with the error
          return Promise.reject(handleApiError(error));
        }
      }
    }

    // For all other errors, pass them through the error handler
    return Promise.reject(handleApiError(error));
  }
);

// Helper function to handle API errors
const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const { status, data } = error.response;
    const message = data?.message || 'An error occurred';
    
    return {
      status,
      message,
      errors: data?.errors,
      isApiError: true,
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      status: 0,
      message: 'No response received from server',
      isNetworkError: true,
    };
  } else {
    // Something happened in setting up the request
    return {
      status: -1,
      message: error.message || 'Error setting up request',
      isRequestError: true,
    };
  }
};

export { api as default, handleApiError };
