import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('🔑 Adding token to request:', config.url);
      console.log('Token preview:', token.substring(0, 20) + '...');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ No token found in localStorage for request:', config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - token might be expired
      console.error('❌ 401 Unauthorized - Invalid or expired token');
      console.error('Error details:', error.response?.data);

      // Clear invalid token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default api;
