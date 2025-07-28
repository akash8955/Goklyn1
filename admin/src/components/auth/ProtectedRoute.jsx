import React, { useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styles from './ProtectedRoute.module.css';

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
    loading 
  } = useAuth();
  
  const location = useLocation();
  const [isInitialCheck, setIsInitialCheck] = useState(true);

  // Check authentication status on mount and when location changes
  useEffect(() => {
    // No need to manually check auth status as it's handled by AuthContext
    // Just update the initial check flag
    if (isInitialCheck) {
      console.log('ProtectedRoute: Initial auth check completed', { isAuthenticated, user });
      setIsInitialCheck(false);
    }
  }, [isAuthenticated, user, isInitialCheck]);

  // Show loading spinner while checking auth status
  if (loading || isInitialCheck) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  console.log('ProtectedRoute: Render', { 
    isAuthenticated, 
    user: user ? { ...user, password: undefined } : null, 
    path: location.pathname 
  });

  // Only check authentication if we're not already on the login page
  if (location.pathname !== '/login' && !isAuthenticated) {
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

  // If we're on the login page but already authenticated, redirect to dashboard
  if (location.pathname === '/login' && isAuthenticated) {
    console.log('ProtectedRoute: Already authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Check if user has required role if specified
  if (requiredRoles.length > 0 && user?.role && !requiredRoles.includes(user.role)) {
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
