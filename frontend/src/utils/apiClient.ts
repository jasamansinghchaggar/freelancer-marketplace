import axios from 'axios';
import { config } from '../config/config';

const axiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Don't set Content-Type for FormData - let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          console.warn('Unauthorized access - user may need to login');
          break;
        case 403:
          console.warn('Access forbidden');
          break;
        case 404:
          console.warn('Resource not found');
          break;
        case 500:
          console.error('Internal server error');
          break;
        default:
          console.error('Unexpected error:', error.response.status);
      }
    } else if (error.request) {
      console.error('Network error:', error.request);
    } else {
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
