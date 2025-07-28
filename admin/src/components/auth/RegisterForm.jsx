import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useForm from '../../hooks/useForm';
import * as Yup from 'yup';
import styles from './LoginForm.module.css';
import api from '../../api';
import { FiEye, FiEyeOff } from 'react-icons/fi';

// Define validation schema using Yup that matches backend requirements
const validationSchema = Yup.object({
  username: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username cannot be more than 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: Yup.string()
    .required('Email is required')
    .email('Please provide a valid email')
    .matches(
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      'Please provide a valid email address'
    ),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number"),
  // Password confirmation (matches backend field name)
  passwordConfirm: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
  role: Yup.string()
    .oneOf(['admin', 'sub-admin'], 'Role must be either admin or sub-admin')
    .required('Role is required'),
  agreeTerms: Yup.boolean()
    .oneOf([true], "You must accept the terms and conditions")
    .required('You must accept the terms and conditions')
});

const RegisterForm = ({
  onSuccess,
  onError,
  isLoading: externalIsLoading,
  setIsLoading: setExternalIsLoading
}) => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formInitialized, setFormInitialized] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Sync external loading state if provided
  useEffect(() => {
    if (setExternalIsLoading) {
      setExternalIsLoading(isLoading);
    }
  }, [isLoading, setExternalIsLoading]);

  // Ensure all form fields have initial values to prevent uncontrolled to controlled warning
  const initialValues = {
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    role: 'sub-admin',
    agreeTerms: false
  };

  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    setFieldError,
    setSubmitting
  } = useForm({
    initialValues,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        console.log('Starting form submission');
        setIsLoading(true);
        if (onError) onError(null);

        // Prepare registration data
        const registrationData = {
          username: values.username.trim(),
          email: values.email.trim().toLowerCase(),
          password: values.password,
          passwordConfirm: values.passwordConfirm,
          role: values.role
        };

        console.log('Sending registration data:', registrationData);
        
        const response = await api.post('/auth/register', registrationData);
        console.log('Registration successful, response:', response);
        
        // Reset the form
        resetForm();
        
        // Call onSuccess with the response data
        if (onSuccess) {
          console.log('Registration successful, calling onSuccess');
          onSuccess(response.data);
          return;
        }
      } catch (error) {
        console.error('Error in form submission:', error);
        
        // Only proceed with error handling if the error wasn't already handled
        if (!error.handled) {
          console.error('Registration API error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
          });
          
          // Handle different types of errors
          if (error.response) {
            // Server responded with an error status
            const { data, status } = error.response;
            let errorMessage = 'Registration failed. Please try again.';
            
            if (status === 400) {
              console.error('Validation error details:', data);
              
              if (data?.errors) {
                // Handle server validation errors
                if (Array.isArray(data.errors)) {
                  data.errors.forEach(err => {
                    if (err.field && err.message) {
                      setFieldError(err.field, err.message);
                    }
                  });
                } else if (typeof data.errors === 'object') {
                  // Handle object-style errors from the server
                  Object.entries(data.errors).forEach(([field, messages]) => {
                    const message = Array.isArray(messages) ? messages[0] : messages;
                    if (field !== 'passwordConfirm') { // Skip client-side only field
                      setFieldError(field, message);
                    }
                  });
                }
                errorMessage = data.message || 'Please correct the errors in the form.';
              } else {
                errorMessage = data?.message || 'Invalid registration data. Please check your input.';
              }
            } else if (status === 409) {
              // Conflict - user already exists
              errorMessage = data?.message || 'A user with this email or username already exists.';
            } else if (status >= 500) {
              errorMessage = 'Server error. Please try again later.';
            }
            
            console.log('Calling onError with message:', errorMessage);
            if (onError) onError({ message: errorMessage });
          } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received. Request details:', {
              method: error.config?.method,
              url: error.config?.url,
              data: error.config?.data
            });
            const errorMsg = 'Unable to connect to the server. Please check your connection.';
            console.log('Calling onError with message:', errorMsg);
            if (onError) onError({ message: errorMsg });
          } else {
            // Something happened in setting up the request
            const errorMsg = error.message || 'An error occurred during registration.';
            console.error('Request setup error:', errorMsg);
            console.log('Calling onError with message:', errorMsg);
            if (onError) onError({ message: errorMsg });
          }
        }
      } finally {
        setIsLoading(false);
        setSubmitting(false);
      }
    },
  });

  // Ensure form is initialized before rendering to prevent controlled input warning
  useEffect(() => {
    // Set a small timeout to ensure form is properly initialized
    const timer = setTimeout(() => {
      if (!formInitialized) {
        setFormInitialized(true);
      }
    }, 50);
    
    return () => clearTimeout(timer);
  }, [formInitialized]);

  // Show loading state until form is initialized
  if (!formInitialized) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.formGroup}>
      <div className={styles.formGroup}>
        <label htmlFor="username" className={styles.formLabel}>Username</label>
        <div className={styles.inputGroup}>
          <input
            id="username"
            name="username"
            type="text"
            value={values.username || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${styles.formInput} ${
              touched.username && errors.username ? styles.inputError : ''
            }`}
            disabled={isLoading}
          />
        </div>
        {touched.username && errors.username && (
          <div className={styles.errorMessage}>{errors.username}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="email" className={styles.formLabel}>Email Address</label>
        <div className={styles.inputGroup}>
          <input
            id="email"
            name="email"
            type="email"
            value={values.email || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${styles.formInput} ${
              touched.email && errors.email ? styles.inputError : ''
            }`}
            disabled={isLoading}
          />
        </div>
        {touched.email && errors.email && (
          <div className={styles.errorMessage}>{errors.email}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="password" className={styles.formLabel}>Password</label>
        <div className={styles.inputGroup}>
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={values.password || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${styles.formInput} ${
              touched.password && errors.password ? styles.inputError : ''
            }`}
            disabled={isLoading}
            autoComplete="new-password"
          />
          <button 
            type="button" 
            className={`${styles.passwordToggle} ${styles.noAnimation}`}
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            aria-label={showPassword ? "Hide password" : "Show password"}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#a0aec0',
              padding: '4px',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        {touched.password && errors.password && (
          <div className={styles.errorMessage}>{errors.password}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="passwordConfirm" className={styles.formLabel}>Confirm Password</label>
        <div className={styles.inputGroup}>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            id="passwordConfirm"
            name="passwordConfirm"
            value={values.passwordConfirm || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${styles.formInput} ${
              touched.passwordConfirm && errors.passwordConfirm ? styles.inputError : ''
            }`}
            disabled={isLoading}
            autoComplete="new-password"
          />
          <button 
            type="button" 
            className={`${styles.passwordToggle} ${styles.noAnimation}`}
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            disabled={isLoading}
            aria-label={showConfirmPassword ? "Hide password confirmation" : "Show password confirmation"}
            style={{
              position: 'absolute',
              right: '10px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              color: '#a0aec0',
              padding: '4px',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>
        {touched.passwordConfirm && errors.passwordConfirm && (
          <div className={styles.errorMessage}>{errors.passwordConfirm}</div>
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="role" className={styles.formLabel}>Role</label>
        <select
          id="role"
          name="role"
          value={values.role || 'sub-admin'}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${styles.formInput} ${
            touched.role && errors.role ? styles.inputError : ''
          }`}
          disabled={isLoading}
        >
          <option value="sub-admin">Sub-Admin</option>
          <option value="admin">Admin</option>
        </select>
        {touched.role && errors.role && (
          <div className={styles.errorMessage}>{errors.role}</div>
        )}
      </div>

      <div className={styles.formCheckboxContainer}>
        <label className={styles.formCheckboxLabel}>
          <input
            type="checkbox"
            id="agreeTerms"
            name="agreeTerms"
            checked={values.agreeTerms || false}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`${styles.formCheckbox} ${
              touched.agreeTerms && errors.agreeTerms ? styles.inputError : ''
            }`}
            disabled={isLoading}
          />
          I agree to the{' '}
          <a href="/terms" className={styles.link} target="_blank" rel="noopener noreferrer">Terms of Service</a> and{' '}
          <a href="/privacy" className={styles.link} target="_blank" rel="noopener noreferrer">Privacy Policy</a>
        </label>
        {touched.agreeTerms && errors.agreeTerms && (
          <div className={styles.errorMessage}>{errors.agreeTerms}</div>
        )}
      </div>

      <button 
        type="submit" 
        className={`${styles.submitButton} ${isLoading ? styles.loading : ''}`}
        disabled={isLoading}
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
};

export default RegisterForm;
