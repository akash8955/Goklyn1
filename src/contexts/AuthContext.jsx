import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import api, { handleApiError } from '../api';
// Note: validateToken and getTokenFromCookies are imported for potential future use
import { validateToken, getTokenFromCookies } from '../utils/auth'; // eslint-disable-line no-unused-vars

const AuthContext = createContext();

// Default user object structure
const defaultUser = {
  _id: null,
  name: '',
  email: '',
  role: 'user',
  avatar: '',
  isVerified: false,
  createdAt: null,
  updatedAt: null
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const [csrfToken, setCsrfToken] = useState(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize user from session storage if available
  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (e) {
        console.error('Failed to parse user from session storage', e);
        sessionStorage.removeItem('user');
      }
    }
  }, []);

  // Check if user is logged in and validate token
  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('AuthContext: Checking authentication status');
      setLoading(true);
      setError(null);
      
      // Check if we have a user in session storage
      const storedUser = sessionStorage.getItem('user');
      console.log('AuthContext: Stored user from session', storedUser);
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('AuthContext: Parsed user from session', parsedUser);
          
          // Validate the token with the server
          console.log('AuthContext: Validating token with server');
          const response = await api.get('/auth/verify-token');
          console.log('AuthContext: Token validation response', response.data);
          
          if (response.data?.valid) {
            // Token is valid, update user state
            console.log('AuthContext: Token is valid, updating user state');
            setUser(parsedUser);
            setIsAuthenticated(true);
            console.log('AuthContext: User authenticated', { user: parsedUser, isAuthenticated: true });
            return { isAuthenticated: true, user: parsedUser };
          } else {
            console.log('AuthContext: Token validation failed');
            throw new Error('Invalid token');
          }
        } catch (error) {
          console.error('AuthContext: Token validation failed:', error);
          // Token is invalid or expired, clear session
          console.log('AuthContext: Clearing invalid session');
          sessionStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
          return { isAuthenticated: false, user: null };
        }
      }
      
      // No valid session found
      console.log('AuthContext: No valid session found');
      setUser(null);
      setIsAuthenticated(false);
      return { isAuthenticated: false, user: null };
      
    } catch (error) {
      console.error('AuthContext: Error checking auth status:', error);
      setError('Failed to verify authentication status');
      setUser(null);
      setIsAuthenticated(false);
      return { isAuthenticated: false, user: null };
    } finally {
      setLoading(false);
    }
  }, []);

  // Check auth status on initial load
  useEffect(() => {
    const initAuth = async () => {
      await checkAuthStatus();
      setInitialCheckDone(true);
    };
    
    initAuth();
  }, [checkAuthStatus]);

  // Register user
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/register', userData);
      
      if (response.data?.data?.user) {
        setUser(response.data.data.user);
        setIsAuthenticated(true);
        
        // Redirect to dashboard or intended URL
        const redirectTo = location.state?.from?.pathname || '/dashboard';
        navigate(redirectTo, { replace: true });
        
        return { success: true, data: response.data.data };
      }
      
      throw new Error('Invalid response format');
    } catch (error) {
      const errorInfo = handleApiError(error);
      setError(errorInfo.message);
      return { 
        success: false, 
        ...errorInfo 
      };
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      console.log('AuthContext: Starting login process');
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/login', credentials);
      console.log('AuthContext: Login response', response.data);
      
      if (response.data?.data?.user) {
        const userData = response.data.data.user;
        console.log('AuthContext: User data received', userData);
        
        // Store CSRF token if available
        if (response.headers['x-csrf-token']) {
          console.log('AuthContext: Setting CSRF token');
          setCsrfToken(response.headers['x-csrf-token']);
        }
        
        // Update user state
        console.log('AuthContext: Updating user state');
        const updatedUser = { ...defaultUser, ...userData };
        setUser(updatedUser);
        setIsAuthenticated(true);
        
        // Store user data in session storage
        console.log('AuthContext: Storing user in session storage');
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        
        console.log('AuthContext: Login successful', { user: updatedUser, isAuthenticated: true });
        
        // Return success with user data
        return { 
          success: true, 
          data: response.data.data,
          user: updatedUser
        };
      }
      
      const errorMsg = 'Invalid response format from server';
      console.error('AuthContext:', errorMsg);
      throw new Error(errorMsg);
      
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      const errorInfo = handleApiError(error);
      setError(errorInfo.message);
      
      // Return a more detailed error object
      return { 
        success: false, 
        message: errorInfo.message,
        status: error.response?.status,
        data: error.response?.data,
        isNetworkError: !error.response
      };
      
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = async (options = {}) => {
    const { redirectTo = '/login', redirect = true } = options;
    
    try {
      // Try to call the logout endpoint with CSRF protection
      await api.post('/auth/logout', {}, {
        headers: csrfToken ? { 'X-CSRF-Token': csrfToken } : {}
      });
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with logout even if API call fails
    } finally {
      // Clear all auth state
      setUser(null);
      setIsAuthenticated(false);
      setCsrfToken(null);
      
      // Clear storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear cookies
      document.cookie = 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      document.cookie = 'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
      
      // Redirect if needed
      if (redirect) {
        navigate(redirectTo, { 
          replace: true,
          state: { 
            from: location,
            message: 'You have been logged out successfully.'
          } 
        });
      }
    }
  };

  // Request password reset email
  const requestPasswordReset = async (email) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post('/auth/forgot-password', { email });
      
      return { 
        success: true, 
        message: response.data?.message || 'Password reset instructions have been sent to your email.'
      };
      
    } catch (error) {
      console.error('Password reset request error:', error);
      const errorInfo = handleApiError(error);
      setError(errorInfo.message);
      
      return {
        success: false,
        ...errorInfo
      };
      
    } finally {
      setLoading(false);
    }
  };

  // Reset password with token
  const resetPasswordWithToken = async (token, newPassword) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.post(
        '/auth/reset-password',
        { token, newPassword }
      );
      
      return { 
        success: true, 
        message: response.data?.message || 'Your password has been reset successfully.'
      };
      
    } catch (error) {
      console.error('Password reset error:', error);
      const errorInfo = handleApiError(error);
      setError(errorInfo.message);
      
      return {
        success: false,
        ...errorInfo
      };
      
    } finally {
      setLoading(false);
    }
  };
  
  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.put('/auth/me', userData);
      
      if (response.data?.data) {
        const updatedUser = { ...user, ...response.data.data };
        setUser(updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        
        return { 
          success: true, 
          user: updatedUser,
          message: 'Profile updated successfully.'
        };
      }
      
      throw new Error('Failed to update profile');
      
    } catch (error) {
      console.error('Update profile error:', error);
      const errorInfo = handleApiError(error);
      setError(errorInfo.message);
      
      return {
        success: false,
        ...errorInfo
      };
      
    } finally {
      setLoading(false);
    }
  };

  // Only render children after initial auth check is complete
  if (!initialCheckDone) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        bgcolor="background.default"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        // State
        user,
        loading,
        error,
        isAuthenticated,
        csrfToken,
        
        // Actions
        login,
        logout,
        register,
        checkAuthStatus,
        requestPasswordReset,
        resetPasswordWithToken,
        updateProfile,
        
        // Utils
        setError: (error) => setError(error),
        clearError: () => setError(null),
        
        // Helpers
        hasRole: (role) => {
          if (!user?.role) return false;
          return Array.isArray(role) 
            ? role.includes(user.role)
            : user.role === role;
        },
        
        hasPermission: (permission) => {
          if (!user?.permissions) return false;
          return Array.isArray(permission)
            ? permission.every(p => user.permissions.includes(p))
            : user.permissions.includes(permission);
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};

// Add prop types for AuthProvider
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default AuthContext;
