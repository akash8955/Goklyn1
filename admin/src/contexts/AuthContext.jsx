import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Check authentication status on mount and when path changes
  useEffect(() => {
    let isMounted = true;
    
    const checkAuth = async () => {
      try {
        // Get token from storage
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        
        if (!token) {
          if (isMounted) {
            setIsAuthenticated(false);
            setUser(null);
            setLoading(false);
            
            // Only redirect if not already on the login page and not on a public route
            const publicRoutes = ['/login', '/forgot-password', '/reset-password'];
            if (!publicRoutes.includes(location.pathname)) {
              navigate('/login', { 
                replace: true,
                state: { from: location } 
              });
            }
          }
          return;
        }
        
        // Set the authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Verify the token with the server
        const response = await api.get('/auth/me');
        
        if (isMounted) {
          // Check if we have user data in the response
          if (response?.data?.data?.user || response?.data?.user) {
            const userData = response.data.data?.user || response.data.user;
            console.log('Auth check successful, user:', userData);
            setUser(userData);
            setIsAuthenticated(true);
            
            // If we're on the login page, redirect to dashboard or intended URL
            if (location.pathname === '/login') {
              const from = location.state?.from?.pathname || '/dashboard';
              console.log('Redirecting from login to:', from);
              navigate(from, { replace: true });
            }
          } else {
            console.warn('Auth check failed, clearing tokens');
            // Clear tokens if the response is not successful
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            setIsAuthenticated(false);
            
            // Only redirect if not already on the login page
            if (location.pathname !== '/login') {
              navigate('/login', { 
                replace: true,
                state: { from: location } 
              });
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (isMounted) {
          // Clear invalid tokens
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          
          // Only redirect if we're not already on the login page
          if (location.pathname !== '/login') {
            navigate('/login', { 
              replace: true,
              state: { from: location } 
            });
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    // Add a small delay to prevent race conditions
    const timer = setTimeout(() => {
      checkAuth();
    }, 100);
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [navigate, location.pathname]);

  // Login function
  const login = useCallback(async (email, password, rememberMe = false) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Attempting login with:', { email });
      
      // Clear any existing tokens and headers first
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      
      // Call the login API
      const response = await api.post('/auth/login', {
        email,
        password,
        remember: rememberMe
      });
      
      console.log('Login response:', response);
      
      // Handle the response format from the API
      const responseData = response.data || {};
      
      // Check if the response indicates success
      if (response.status >= 200 && response.status < 300) {
        // Check for token in different possible locations in the response
        const token = responseData.token || 
                     responseData.data?.token || 
                     (responseData.data?.tokens ? responseData.data.tokens.accessToken : null);
        
        // Get user data from response
        const userData = responseData.user || responseData.data?.user || responseData.data;
        
        if (!token) {
          console.error('No token received in response:', responseData);
          throw new Error('No authentication token received from server');
        }
        
        if (!userData) {
          console.warn('No user data received in login response');
        }
        
        console.log('Login successful, storing token');
        
        // Store token in appropriate storage based on rememberMe
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('token', token);
        
        // Set the default authorization header
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Update state
        const userToSet = userData && typeof userData === 'object' ? userData : { email };
        setUser(userToSet);
        setIsAuthenticated(true);
        
        // Redirect to dashboard or intended URL
        const from = location.state?.from?.pathname || '/dashboard';
        console.log('Login successful, redirecting to:', from);
        
        // Use setTimeout to ensure state updates before navigation
        setTimeout(() => {
          navigate(from, { 
            replace: true,
            state: { from: location }
          });
        }, 0);
        
        return { success: true, user: userToSet };
      } else {
        // Handle error response from server
        const errorMessage = responseData.message || 
                           responseData.error || 
                           responseData.data?.message || 
                           'Login failed. Please check your credentials.';
        
        console.error('Login failed:', errorMessage, 'Response:', responseData);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Unable to connect to the server. Please check your connection.';
      } else {
        // Other errors
        errorMessage = error.message || errorMessage;
      }
      
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [navigate, location.state]);
  
  // Logout function
  const logout = useCallback(() => {
    // Clear tokens
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    
    // Remove auth header
    delete api.defaults.headers.common['Authorization'];
    
    // Reset state
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to login
    navigate('/login');
  }, [navigate]);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Register function
  const register = useCallback(async (username, email, password, role = 'sub-admin') => {
    try {
      setLoading(true);
      setError(null);
      
      // Call the register API
      const response = await api.post('/auth/register', {
        username,
        email,
        password,
        role
      });
      
      if (response && response.success) {
        // Auto-login after successful registration
        return await login(email, password, false);
      } else {
        throw new Error(response?.message || 'Registration failed. Please try again.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || errorMessage;
        
        // Handle validation errors
        if (error.response.data?.errors) {
          const validationErrors = Object.values(error.response.data.errors).flat();
          errorMessage = validationErrors.join(' ');
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Unable to connect to the server. Please check your connection.';
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [login]);

  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    register,
    clearError
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
