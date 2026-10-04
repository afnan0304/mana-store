import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Centralized Error & Auth Handling
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized (Expired or invalid token)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // Avoid redirecting if already on login/auth page
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }

    // Standardize error message presentation
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      'An unexpected network or server error occurred.';

    return Promise.reject({
      ...error,
      customMessage: errorMessage,
      statusCode: error.response?.status,
      errors: error.response?.data?.errors,
    });
  }
);

export default api;
