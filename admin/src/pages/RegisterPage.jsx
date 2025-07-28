import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AuthLayout from "../components/auth/AuthLayout";
import RegisterForm from "../components/auth/RegisterForm";
import api from '../api';
import '../styles/animations.css';

const RegisterPage = () => {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const errorTimeoutRef = useRef(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleRegisterSuccess = (responseData) => {
    console.log('Registration success in RegisterPage:', responseData);
    setIsLoading(false);
    // Clear any existing errors
    setError('');
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
      errorTimeoutRef.current = null;
    }
    
    // Redirect to login page with success state
    navigate('/login', { 
      state: { 
        from: location.state?.from || '/',
        registrationSuccess: true,
        email: responseData?.user?.email || ''
      },
      replace: true
    });
  };

  const handleRegisterError = (error) => {
    // Don't show error if it's just an auto-login failure
    if (error?.message?.includes('Auto-login failed')) {
      console.log('Auto-login failed, but registration was successful');
      return;
    }

    console.error('Registration error in RegisterPage:', error);
    setIsLoading(false);
    
    // Don't show error if we already have a success state
    if (!error) {
      console.log('Received null error, assuming success');
      return;
    }
    
    const errorMessage = error?.message || "Registration failed. Please try again.";
    console.log('Setting error message:', errorMessage);
    setError(errorMessage);
    
    // Auto-dismiss error after 5 seconds
    if (errorTimeoutRef.current) {
      clearTimeout(errorTimeoutRef.current);
    }
    errorTimeoutRef.current = setTimeout(() => {
      console.log('Clearing error message');
      setError("");
      errorTimeoutRef.current = null;
    }, 5000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, []);

  return (
    <AuthLayout title="Create an Account">
      <div className="space-y-6">
        {error && (
          <div className="error-message bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md shadow-sm flex justify-between items-center animate-fade-in">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
            <button 
              onClick={() => setError('')} 
              className="text-red-500 hover:text-red-700 focus:outline-none transition-colors duration-200"
              aria-label="Dismiss error"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        <div className="animate-slide-up">
          <RegisterForm
            onSuccess={handleRegisterSuccess}
            onError={handleRegisterError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
          />
        </div>

        <div className="text-center text-sm mt-8 animate-fade-in delay-300">
          <span className="text-gray-600">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 ease-in-out hover:underline"
            >
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
