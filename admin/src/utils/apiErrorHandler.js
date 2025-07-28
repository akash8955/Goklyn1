/**
 * Handles API errors consistently across the application
 * @param {Error} error - The error object from the API call
 * @param {Object} options - Configuration options
 * @param {Function} [options.onUnauthorized] - Callback for 401 Unauthorized errors
 * @param {Function} [options.onForbidden] - Callback for 403 Forbidden errors
 * @param {Function} [options.onNotFound] - Callback for 404 Not Found errors
 * @param {Function} [options.onServerError] - Callback for 500+ Server errors
 * @param {Function} [options.onNetworkError] - Callback for network errors
 * @param {Function} [options.onOtherError] - Callback for all other errors
 * @returns {Object} Object containing error details
 */
export const handleApiError = (error, {
  onUnauthorized,
  onForbidden,
  onNotFound,
  onServerError,
  onNetworkError,
  onOtherError,
} = {}) => {
  // Default error object
  const errorInfo = {
    message: 'An unexpected error occurred',
    status: null,
    code: null,
    details: null,
    originalError: error,
  };

  // Handle Axios errors
  if (error.isAxiosError) {
    const { response, request, code, message } = error;
    
    // Server responded with an error status (4xx, 5xx)
    if (response) {
      const { status, data } = response;
      
      errorInfo.status = status;
      errorInfo.message = data?.message || message;
      errorInfo.code = data?.code || code;
      errorInfo.details = data?.errors || data?.details;
      
      // Handle specific status codes
      switch (status) {
        case 401: // Unauthorized
          errorInfo.message = errorInfo.message || 'Your session has expired. Please log in again.';
          if (typeof onUnauthorized === 'function') {
            onUnauthorized(errorInfo);
          }
          break;
          
        case 403: // Forbidden
          errorInfo.message = errorInfo.message || 'You do not have permission to perform this action.';
          if (typeof onForbidden === 'function') {
            onForbidden(errorInfo);
          }
          break;
          
        case 404: // Not Found
          errorInfo.message = errorInfo.message || 'The requested resource was not found.';
          if (typeof onNotFound === 'function') {
            onNotFound(errorInfo);
          }
          break;
          
        case 429: // Too Many Requests
          errorInfo.message = 'Too many requests. Please try again later.';
          break;
          
        case 500: // Internal Server Error
        case 502: // Bad Gateway
        case 503: // Service Unavailable
        case 504: // Gateway Timeout
          errorInfo.message = errorInfo.message || 'A server error occurred. Please try again later.';
          if (typeof onServerError === 'function') {
            onServerError(errorInfo);
          }
          break;
          
        default:
          if (status >= 500) {
            errorInfo.message = 'A server error occurred. Please try again later.';
            if (typeof onServerError === 'function') {
              onServerError(errorInfo);
            }
          } else if (typeof onOtherError === 'function') {
            onOtherError(errorInfo);
          }
      }
    } 
    // Request was made but no response received
    else if (request) {
      errorInfo.message = 'No response received from the server. Please check your connection.';
      if (typeof onNetworkError === 'function') {
        onNetworkError(errorInfo);
      }
    } 
    // Other Axios errors (e.g., config issues)
    else {
      errorInfo.message = message || 'An error occurred while setting up the request.';
      if (typeof onOtherError === 'function') {
        onOtherError(errorInfo);
      }
    }
  } 
  // Handle non-Axios errors
  else {
    errorInfo.message = error.message || 'An unexpected error occurred';
    
    // Handle network errors
    if (error.message === 'Network Error' || !window.navigator.onLine) {
      errorInfo.message = 'Network error. Please check your internet connection.';
      if (typeof onNetworkError === 'function') {
        onNetworkError(errorInfo);
      }
    } else if (typeof onOtherError === 'function') {
      onOtherError(errorInfo);
    }
  }

  // Log the error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('API Error:', errorInfo);
  }

  return errorInfo;
};

/**
 * Creates a standardized error object from an API response
 * @param {string} message - Error message
 * @param {Object} options - Additional error details
 * @returns {Object} Standardized error object
 */
export const createApiError = (message, options = {}) => ({
  message,
  status: options.status || 400,
  code: options.code || 'API_ERROR',
  details: options.details || null,
  ...options,
});

/**
 * Checks if an error is an API error (has status code)
 * @param {*} error - The error to check
 * @returns {boolean} True if the error is an API error
 */
export const isApiError = (error) => {
  return error && 
    (error.status || 
     (error.response && error.response.status) || 
     error.isAxiosError);
};

export default {
  handleApiError,
  createApiError,
  isApiError,
};
