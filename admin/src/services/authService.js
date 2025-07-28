import api from '../api';

// Send OTP to user's email for password reset
const forgotPassword = async (email) => {
  try {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to send OTP. Please try again.';
    throw new Error(errorMessage);
  }
};

// Verify the OTP entered by the user
const verifyOTP = async (email, otp) => {
  try {
    console.log('Sending OTP verification request for:', email);
    const response = await api.post('/auth/verify-otp', { 
      email: email.trim().toLowerCase(), 
      otp: otp.trim() 
    });
    
    // Log the full response for debugging
    console.log('Full OTP verification response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    
    // If we don't have a successful response, throw an error
    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.data?.message || 'Failed to verify OTP');
    }

    // Extract the response data
    const responseData = response.data;
    
    // Handle different response formats
    let token, responseEmail;
    
    // Case 1: Response has data object with token and email
    if (responseData.data) {
      token = responseData.data.token;
      responseEmail = responseData.data.email || email;
    }
    // Case 2: Response has token and email directly in the response
    else if (responseData.token) {
      token = responseData.token;
      responseEmail = responseData.email || email;
    }
    // Case 3: Response is just the token (unlikely but possible)
    else if (typeof responseData === 'string') {
      token = responseData;
      responseEmail = email;
    }
    
    if (!token) {
      console.error('No token found in response:', responseData);
      throw new Error('Invalid response from server: Missing token');
    }
    
    console.log('OTP verification successful');
    return {
      token,
      email: responseEmail
    };
    
  } catch (error) {
    console.error('OTP verification error details:', {
      message: error.message,
      response: error.response?.data || 'No response data',
      status: error.response?.status || 'No status code'
    });
    
    let errorMessage = 'Invalid or expired OTP. Please try again.';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorMessage = error.response.data?.message || 
                   error.response.data?.error || 
                   `Server responded with status ${error.response.status}`;
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'No response from server. Please check your connection.';
    }
    
    throw new Error(errorMessage);
  }
};

// Reset password with the verified token from OTP verification
const resetPassword = async (token, password, passwordConfirm) => {
  try {
    console.log('Resetting password with token:', token);
    
    const response = await api.post('/auth/reset-password', {
      token,
      password,
      passwordConfirm
    });
    
    console.log('Reset password response:', {
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    
    // Check if the response is successful
    if (response.status < 200 || response.status >= 300) {
      throw new Error(response.data?.message || 'Failed to reset password');
    }
    
    // The response should contain the user data and auth token
    if (response.data.token) {
      // Store the token in localStorage or cookie if needed
      localStorage.setItem('token', response.data.token);
      console.log('Token stored in localStorage');
    } else {
      console.warn('No token found in reset password response');
    }
    
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
    throw new Error(errorMessage);
  }
};

// Change password when user is already logged in
const changePassword = async (passwordData) => {
  try {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  } catch (error) {
    console.error('Change password error details:', error.message, error.response?.data);
    throw error.response?.data?.message || error.message || JSON.stringify(error);
  }
};

// Update user profile
const updateMe = async (userData) => {
  try {
    const response = await api.patch('/auth/update-me', userData);
    return response.data;
  } catch (error) {
    console.error('Update profile error details:', error.message, error.response?.data);
    throw error.response?.data?.message || error.message || JSON.stringify(error);
  }
};

export default {
  forgotPassword,
  verifyOTP,
  resetPassword,
  updateMe,
  changePassword,
};
