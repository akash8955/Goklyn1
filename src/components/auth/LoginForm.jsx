import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useForm from '../../hooks/useForm';
import * as Yup from 'yup';
import { TextField, Button, Box, Typography, CircularProgress, Checkbox, FormControlLabel } from '@mui/material';
import { LockOutlined, EmailOutlined } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { styled } from '@mui/material/styles';

// Validation schema using Yup
const validationSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .required('Password is required'),
});

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    color: 'white',
  },
  '& .MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    '&:hover fieldset': {
      borderColor: 'white',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'white',
    },
  },
}));

const LoginForm = ({ onSuccess, onError }) => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form with useForm hook
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    getFieldProps,
    isSubmitting,
    setSubmitting,
    setFieldError,
  } = useForm({
    initialValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);
        setSubmitting(true);
        
        const { email, password, rememberMe } = values;
        
        // Call the login function from AuthContext with the credentials
        const result = await login({ email, password });
        
        if (result.success) {
          // Call the onSuccess callback if provided
          if (onSuccess) {
            onSuccess(result);
          }
        } else {
          // Handle login error
          const errorMessage = result.error || 'Login failed. Please check your credentials.';
          if (onError) {
            onError(errorMessage);
          }
          setFieldError('email', ' '); // Add empty error to trigger error state
          setFieldError('password', errorMessage);
        }
      } catch (error) {
        console.error('Login error:', error);
        const errorMessage = error.response?.data?.message || 'An unexpected error occurred. Please try again.';
        if (onError) {
          onError(errorMessage);
        }
        setFieldError('email', ' '); // Add empty error to trigger error state
        setFieldError('password', errorMessage);
      } finally {
        setIsLoading(false);
        setSubmitting(false);
      }
    },
  });

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        maxWidth: 400,
        mx: 'auto',
        p: 3,
        
      }}
      noValidate
    >
      {/* Server error is now handled by the parent component */}
      
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
        <StyledTextField
          {...getFieldProps('email')}
          label="Email Address"
          type="email"
          autoComplete="email"
          margin="normal"
          fullWidth
          InputProps={{
            startAdornment: <EmailOutlined sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />,
          }}
          error={touched.email && Boolean(errors.email)}
          helperText={touched.email && errors.email}
        />
      </motion.div>
      
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7, duration: 0.5 }}>
        <StyledTextField
          {...getFieldProps('password')}
          label="Password"
          type="password"
          autoComplete="current-password"
          margin="normal"
          fullWidth
          InputProps={{
            startAdornment: <LockOutlined sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />,
          }}
          error={touched.password && Boolean(errors.password)}
          helperText={touched.password && errors.password}
        />
      </motion.div>
      
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8, duration: 0.5 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 1,
            mb: 2,
          }}
        >
          <FormControlLabel
            control={
              <Checkbox
                name="rememberMe"
                checked={values.rememberMe}
                onChange={handleChange}
                sx={{ color: 'rgba(255, 255, 255, 0.7)', '&.Mui-checked': { color: 'white' } }}
              />
            }
            label="Remember me"
          />
          
          <Typography
            component={Link}
            to="/forgot-password"
            variant="body2"
            sx={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              textDecoration: 'none', 
              '&:hover': { textDecoration: 'underline', color: 'white' } 
            }}
          >
            Forgot password?
          </Typography>
        </Box>
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 0.5 }}>
        <Button
          type="submit"
          fullWidth
          variant="contained"
          size="large"
          disabled={isSubmitting || isLoading}
          sx={{
            mt: 2,
            mb: 2,
            py: 1.5,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            color: '#764ba2',
            fontWeight: 'bold',
            '&:hover': {
              bgcolor: 'white',
            },
          }}
        >
          {isSubmitting || isLoading ? (
            <CircularProgress size={24} sx={{ color: '#764ba2' }} />
          ) : (
            'Sign In'
          )}
        </Button>
      </motion.div>
      
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 0.5 }}>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{ 
                textDecoration: 'none', 
                color: 'white', 
                fontWeight: 'bold',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </motion.div>
    </Box>
  );
};

export default LoginForm;
