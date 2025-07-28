import axios from 'axios';

// Define the base URL for the API. It uses an environment variable for production
// and falls back to a local development URL.
const API_BASE_URL = (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api';

// Create a new Axios instance with a custom configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Required for cookies, authorization headers with HTTPS
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  },
  timeout: 30000, // Increased timeout to 30 seconds
  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',
  // Don't send credentials with preflight requests
  withCredentials: true,
  // Handle CORS preflight requests
  crossdomain: true,
  // Transform request data based on content type
  transformRequest: [
    (data, headers) => {
      // Don't modify FormData requests (file uploads)
      if (data instanceof FormData) {
        // Remove Content-Type to let the browser set it with the correct boundary
        if (headers && headers['Content-Type']) {
          delete headers['Content-Type'];
        }
        return data;
      }
      
      // For JSON data, set the content type and stringify
      if (headers && headers.common) {
        headers.common['Content-Type'] = 'application/json';
        // Remove any headers that might cause CORS issues
        delete headers.common['X-Requested-With'];
      }
      
      return data ? JSON.stringify(data) : null;
    }
  ],
  validateStatus: function (status) {
    // Resolve only if the status code is less than 500
    return status < 500;
  }
});

// Use an interceptor to handle all outgoing requests
api.interceptors.request.use(
  (config) => {
    // Get the token from both localStorage and sessionStorage
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    
    // If token exists, add it to the request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add cache-busting for GET requests
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(), // Add timestamp to prevent caching
      };
    }
    
    // Log the request in development for easier debugging
    if (process.env.NODE_ENV === 'development') {
      console.groupCollapsed(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
      console.log('Headers:', config.headers);
      console.log('Data:', config.data);
      console.log('Params:', config.params);
      console.groupEnd();
    }
    
    return config;
  },
  (error) => {
    // Handle any errors that occur during request setup
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Use an interceptor to handle all incoming responses
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.groupCollapsed(`[API Response] ${response.config.method?.toUpperCase()} ${response.config.url} (${response.status})`);
      console.log('Response:', response.data);
      console.log('Headers:', response.headers);
      console.groupEnd();
    }
    
    // Return the full response object so we can access status, headers, etc.
    return response;
  },
  (error) => {
    // Any status codes that fall outside the range of 2xx will cause this function to trigger
    const originalRequest = error.config;
    
    // Enhanced error logging
    if (process.env.NODE_ENV === 'development') {
      console.groupCollapsed(`[API Error] ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url}`);
      
      if (error.response) {
        // The request was made and the server responded with a status code
        console.error('Status:', error.response.status);
        console.error('Data:', error.response.data);
        console.error('Headers:', error.response.headers);
        
        // Handle specific status codes
        if (error.response.status === 401) {
          console.error('Authentication error - Invalid or expired token');
        } else if (error.response.status === 403) {
          console.error('Authorization error - Insufficient permissions');
        } else if (error.response.status === 404) {
          console.error('Resource not found');
        } else if (error.response.status >= 500) {
          console.error('Server error - Please try again later');
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('No response received:', error.request);
        error.message = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', error.message);
      }
      
      console.groupEnd();
    }
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Clear any stored tokens
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      // If we're not already on the login page, redirect to login
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?sessionExpired=true';
      }
    }

    // Create a user-friendly error object to be passed to the UI
    const customError = {
      message: 'An unexpected error occurred.',
      status: 500,
      data: error.response?.data,
      errors: error.response?.data?.errors,
    };

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx.
      customError.message = error.response.data?.message || 'An error occurred on the server.';
      customError.status = error.response.status;
      
      // Include validation errors if available
      if (error.response.data?.errors) {
        customError.errors = error.response.data.errors;
      }
    } else if (error.request) {
      // The request was made but no response was received (e.g., network error)
      customError.message = 'Network error. Please check your connection and try again.';
    } else {
      // Something happened in setting up the request that triggered an Error
      customError.message = error.message;
    }

    // Reject the promise with the custom error object so the UI can handle it
    return Promise.reject(customError);
  }
);

export default api;

