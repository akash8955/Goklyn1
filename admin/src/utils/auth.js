/**
 * Authentication utility functions
 */

import { jwtDecode } from 'jwt-decode';

/**
 * Extracts the JWT token from cookies
 * @param {string} cookieString - The document.cookie string
 * @param {string} cookieName - The name of the cookie to extract
 * @returns {string|null} The JWT token or null if not found
 */
export const getTokenFromCookies = (cookieString, cookieName = 'token') => {
  if (!cookieString) return null;
  
  const cookies = cookieString.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    acc[name] = value;
    return acc;
  }, {});
  
  return cookies[cookieName] || null;
};

/**
 * Decodes a JWT token and returns the payload
 * @param {string} token - The JWT token to decode
 * @returns {Object|null} The decoded token payload or null if invalid
 */
export const decodeToken = (token) => {
  if (!token) return null;
  
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Validates a JWT token
 * @param {string} token - The JWT token to validate
 * @returns {{isValid: boolean, error: Error|null}} Validation result
 */
export const validateToken = (token) => {
  if (!token) {
    return {
      isValid: false,
      error: new Error('No token provided')
    };
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime) {
      return {
        isValid: false,
        error: new Error('Token has expired')
      };
    }
    
    return { isValid: true, error: null };
  } catch (error) {
    return {
      isValid: false,
      error: new Error('Invalid token format')
    };
  }
};

/**
 * Check if user has the required role
 * @param {Object} user - User object
 * @param {string|Array} requiredRole - Required role(s)
 * @returns {boolean}
 */
export const hasRole = (user, requiredRole) => {
  if (!user?.role) return false;
  if (Array.isArray(requiredRole)) {
    return requiredRole.includes(user.role);
  }
  return user.role === requiredRole;
};

/**
 * Check if user has any of the required permissions
 * @param {Object} user - User object
 * @param {string|Array} requiredPermissions - Required permission(s)
 * @returns {boolean}
 */
export const hasPermission = (user, requiredPermissions) => {
  if (!user?.permissions?.length) return false;
  
  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];
    
  return permissions.some(permission => 
    user.permissions.includes(permission)
  );
};

/**
 * Format authentication error message
 * @param {Error} error - Error object
 * @returns {string} - User-friendly error message
 */
export const formatAuthError = (error) => {
  if (!error) return 'An unknown error occurred';
  
  if (error.response) {
    // Server responded with an error status code
    const { status, data } = error.response;
    
    if (status === 401) {
      return data?.message || 'Invalid email or password';
    }
    
    if (status === 403) {
      return data?.message || 'You do not have permission to perform this action';
    }
    
    if (status === 429) {
      return 'Too many attempts. Please try again later.';
    }
    
    return data?.message || `Error: ${status}`;
  }
  
  if (error.request) {
    // Request was made but no response received
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  // Something happened in setting up the request
  return error.message || 'An error occurred';
};

/**
 * Creates an authentication header with the JWT token
 * @param {string} token - The JWT token
 * @returns {Object} Headers object with Authorization header
 */
export const getAuthHeader = (token) => {
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

/**
 * Handles unauthorized responses from the API
 * @param {Object} error - The error object from the API call
 * @param {Object} options - Options object
 * @param {Function} [options.logout] - The logout function from the auth context
 * @param {Function} [options.navigate] - The navigate function from react-router-dom
 * @param {string} [options.redirectPath='/login'] - The path to redirect to after logout
 * @returns {boolean} True if unauthorized was handled, false otherwise
 */
export const handleUnauthorized = (error, { logout, navigate, redirectPath = '/login' } = {}) => {
  if (error?.response?.status === 401) {
    // Call logout if provided
    if (typeof logout === 'function') {
      logout();
    }
    
    // Redirect to login page if navigate function is provided
    if (typeof navigate === 'function') {
      navigate(redirectPath, { 
        replace: true,
        state: { 
          from: window.location.pathname,
          message: 'Your session has expired. Please log in again.'
        }
      });
    }
    
    return true;
  }
  
  return false;
};

// Default export for backward compatibility
export default {
  getTokenFromCookies,
  decodeToken,
  validateToken,
  hasRole,
  hasPermission,
  formatAuthError,
  getAuthHeader,
  handleUnauthorized,
};
