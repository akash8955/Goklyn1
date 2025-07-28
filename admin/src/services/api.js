import axios from 'axios';

const api = axios.create({
  baseURL: (process.env.REACT_APP_API_URL || 'http://localhost:5000') + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add a request interceptor to always attach the latest auth token if available
api.interceptors.request.use(
  (config) => {
    // Always check both storages for the latest token
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
