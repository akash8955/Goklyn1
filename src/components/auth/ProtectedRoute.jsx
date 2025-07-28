import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import { Box } from '@mui/material';

/**
 * ProtectedRoute component that handles authentication and authorization
 * @param {Object} props - Component props
 * @param {Array} [props.requiredRoles=[]] - Array of roles that are allowed to access the route
 * @param {React.ReactNode} [props.children] - Child components to render if authenticated and authorized
 * @returns {JSX.Element} Rendered component
 */
const ProtectedRoute = ({ 
  requiredRoles = [], 
  children 
}) => {
  const { 
    user, 
    isAuthenticated, 
    loading, 
    checkAuthStatus 
  } = useAuth();
  
  const location = useLocation();
  const [authChecked, setAuthChecked] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check authentication status on mount and when location changes
  useEffect(() => {
    let isMounted = true;
    
    const verifyAuth = async () => {
      try {
        console.log('ProtectedRoute: Verifying authentication...');
        await checkAuthStatus();
        console.log('ProtectedRoute: Auth check completed', { isAuthenticated, user });
      } catch (error) {
        console.error('ProtectedRoute: Error verifying auth status', error);
      } finally {
        if (isMounted) {
          setAuthChecked(true);
          setIsCheckingAuth(false);
        }
      }
    };
    
    // Only check auth if we don't have a user or if we're not authenticated
    if (!user || !isAuthenticated) {
      verifyAuth();
    } else {
      setAuthChecked(true);
      setIsCheckingAuth(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, checkAuthStatus, location]);

  // Show loading spinner while checking auth status
  if (loading || isCheckingAuth) {
    return (
      <Box 
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          backgroundColor: 'background.default'
        }}
      >
        <LoadingSpinner size="lg" />
      </Box>
    );
  }

  console.log('ProtectedRoute: Render', { isAuthenticated, authChecked, user });

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to login');
    return (
      <Navigate 
        to="/login" 
        state={{ 
          from: location,
          message: 'Please log in to access this page'
        }} 
        replace 
      />
    );
  }

  // Check if user has required role if specified
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    console.log('ProtectedRoute: Unauthorized role', { userRole: user.role, requiredRoles });
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ 
          from: location,
          message: 'You do not have permission to access this page'
        }} 
        replace 
      />
    );
  }

  console.log('ProtectedRoute: Rendering protected content');
  
  // Render children if authenticated and authorized
  // Render children or outlet for nested routes
  return children || <Outlet />;
};

export default ProtectedRoute;
