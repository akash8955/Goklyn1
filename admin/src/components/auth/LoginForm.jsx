import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import styles from './LoginForm.module.css';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';

// Validation schema using Yup
const validationSchema = yup.object({
  email: yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const LoginForm = ({ onSuccess, onError, isLoading: externalIsLoading }) => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  
  // Sync with parent loading state if provided
  useEffect(() => {
    if (externalIsLoading !== undefined) {
      setIsFormSubmitting(externalIsLoading);
    }
  }, [externalIsLoading]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Initialize form with useForm hook
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid }
  } = useForm({
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: ''
    }
  });

  // Track form submission state separately from form validation state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    try {
      console.log('Form submission started');
      setFormError('');
      setFieldErrors({});
      setIsFormSubmitting(true);
      
      // Validate form data using Yup schema
      await validationSchema.validate(data, { abortEarly: false });
      
      console.log('Validation passed, calling login function');
      // Call the login function from AuthContext
      const result = await login(data.email, data.password, rememberMe);
      
      if (result && result.success) {
        console.log('Login successful, calling onSuccess with result:', result);
        onSuccess?.(result);
      } else {
        console.error('Login failed, calling onError with result:', result);
        setFormError(result?.message || 'Login failed. Please try again.');
        onError?.(result);
      }
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.name === 'ValidationError' && error.inner) {
        // Handle Yup validation errors
        const errors = {};
        error.inner.forEach(err => {
          errors[err.path] = err.message;
        });
        setFieldErrors(errors);
        setFormError('Please fix the errors in the form.');
      } else if (error.response) {
        // Handle API response errors (from Axios)
        const response = error.response;
        let errorMessage = 'Failed to log in. Please check your credentials and try again.';
        
        // Handle different HTTP status codes
        switch (response.status) {
          case 400:
            errorMessage = 'Invalid email or password format.';
            break;
          case 401:
            errorMessage = 'Invalid email or password. Please try again.';
            break;
          case 403:
            errorMessage = 'Your account is not authorized to access this resource.';
            break;
          case 404:
            errorMessage = 'Account not found. Please check your email or register.';
            break;
          case 429:
            errorMessage = 'Too many login attempts. Please try again later.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = response.data?.message || errorMessage;
        }
        
        setFormError(errorMessage);
      } else if (error.request) {
        // The request was made but no response was received
        setFormError('Unable to connect to the server. Please check your internet connection.');
      } else {
        // Other errors
        setFormError(error.message || 'An unexpected error occurred. Please try again.');
      }
      
      // Call the onError callback if provided
      onError?.(error);
    } finally {
      setIsFormSubmitting(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.loginForm} noValidate id="login-form">
        {/* Form Error Message */}
        {formError && (
          <div className={styles.formError} role="alert" aria-live="assertive">
            <FiAlertCircle className={styles.errorIcon} />
            <span>{formError}</span>
          </div>
        )}
        
        <div className={styles.formGroup}>
          <label htmlFor="email" className={styles.formLabel}>
            Email Address
          </label>
          <div className={styles.inputGroup}>
            <span className={styles.inputIcon}>
              <FiMail size={18} />
            </span>
            <input
              type="email"
              id="email"
              {...register('email')}
              className={`${styles.formInput} ${errors.email || fieldErrors.email ? styles.inputError : ''}`}
              placeholder="Enter your email"
              disabled={isFormSubmitting}
              autoComplete="username"
              aria-describedby={errors.email || fieldErrors.email ? 'email-error' : undefined}
              aria-invalid={!!(errors.email || fieldErrors.email)}
              aria-busy={isFormSubmitting}
              aria-required="true"
            />
          </div>
          {(errors.email || fieldErrors.email) && (
            <div id="email-error" className={styles.fieldError}>
              <FiAlertCircle className={styles.errorIcon} />
              <span>{errors.email?.message || fieldErrors.email}</span>
            </div>
          )}
        </div>

        <div className={styles.formGroup}>
          <div className={styles.labelContainer}>
            <label htmlFor="password" className={styles.formLabel}>
              Password
            </label>
            <Link 
              to="/forgot-password" 
              className={styles.forgotPasswordLink}
              tabIndex={isFormSubmitting ? -1 : 0}
            >
              Forgot password?
            </Link>
          </div>
          <div className={styles.inputGroup}>
            <FiLock className={styles.inputIcon} />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className={`${styles.formInput} ${errors.password || fieldErrors.password ? styles.inputError : ''}`}
              placeholder="Enter your password"
              {...register('password')}
              disabled={isFormSubmitting}
              autoComplete="current-password"
              aria-describedby={errors.password || fieldErrors.password ? 'password-error' : undefined}
              aria-invalid={!!(errors.password || fieldErrors.password)}
              aria-required="true"
            />
            <button 
              type="button" 
              className={styles.passwordToggle}
              onClick={() => setShowPassword(!showPassword)}
              disabled={isFormSubmitting}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              tabIndex={isFormSubmitting ? -1 : 0}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {(errors.password || fieldErrors.password) && (
            <div id="password-error" className={styles.fieldError}>
              <FiAlertCircle className={styles.errorIcon} />
              <span>{errors.password?.message || fieldErrors.password}</span>
            </div>
          )}
        </div>

        <div className={`${styles.formGroup} ${styles.rememberMeGroup}`}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className={styles.checkbox}
              disabled={isFormSubmitting}
              aria-label="Remember me on this device"
              tabIndex={isFormSubmitting ? -1 : 0}
            />
            <span>Remember me</span>
          </label>
        </div>

        <div className={styles.buttonContainer}>
          <button
            type="submit"
            className={`${styles.loginButton} ${isFormSubmitting ? styles.buttonLoading : ''}`}
            disabled={isFormSubmitting}
            aria-live="polite"
            aria-busy={isFormSubmitting}
            aria-disabled={isFormSubmitting}
          >
            {isFormSubmitting ? (
              <>
                <span className={styles.buttonSpinner} aria-hidden="true" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
          
          <div className={styles.signupContainer}>
            Don't have an account?{' '}
            <Link to="/register" className={styles.signupLink}>
              Sign up <FiArrowRight className={styles.linkIcon} />
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
