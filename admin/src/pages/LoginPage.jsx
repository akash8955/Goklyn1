import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/auth/LoginForm';
import styles from './LoginPage.module.css';
import { FiLogIn, FiUserPlus } from 'react-icons/fi';

const LoginPage = () => {
  const [error, setError] = useState('');
  const [showError, setShowError] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();

  // Check for registration success in location state
  useEffect(() => {
    if (location.state?.registrationSuccess) {
      setSuccessMessage(
        location.state.email 
          ? `Registration successful! Please log in with your email: ${location.state.email}`
          : 'Registration successful! Please log in with your credentials.'
      );
      setShowSuccess(true);
      
      // Clear the success message after 8 seconds
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setSuccessMessage('');
        // Clear the location state to prevent showing the message again on refresh
        navigate(location.pathname, { replace: true, state: {} });
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleLoginSuccess = (result) => {
    // Show success message if needed
    console.log('Login successful', result);
    // Navigation is handled by the useEffect hook
  };

  const handleLoginError = (err) => {
    console.error('Login error:', err);
    let errorMessage = 'Login failed. Please try again.';
    
    // Handle different error types
    if (err.response) {
      // Server responded with error status
      errorMessage = err.response.data?.message || errorMessage;
    } else if (err.request) {
      // Request was made but no response received
      errorMessage = 'Unable to connect to the server. Please check your connection.';
    } else {
      // Other errors
      errorMessage = err.message || errorMessage;
    }
    
    setError(errorMessage);
    setShowError(true);
    
    // Auto-hide error after 8 seconds
    const timer = setTimeout(() => {
      setShowError(false);
    }, 8000);
    
    // Clear timeout on component unmount
    return () => clearTimeout(timer);
  };

  // Removed demo login functionality

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.loginHeader}>
          <h1>Welcome Back</h1>
          <p>Please sign in to your account</p>
        </div>

        {showSuccess && (
          <div className={styles.successMessage}>
            <p>{successMessage}</p>
          </div>
        )}
        
        {showError && !showSuccess && (
          <div className={styles.errorMessage}>
            <p>{error}</p>
            <button 
              type="button" 
              className={styles.dismissButton}
              onClick={() => setShowError(false)}
              aria-label="Dismiss error message"
            >
              &times;
            </button>
          </div>
        )}
        
        <LoginForm 
          onSuccess={handleLoginSuccess}
          onError={handleLoginError}
          isLoading={isLoading}
        />
        
        <div className={styles.footer}>
          <div className={styles.version}>v{process.env.REACT_APP_VERSION || '1.0.0'}</div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
