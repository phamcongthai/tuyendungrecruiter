import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL;
if (!apiBaseUrl) {
  throw new Error('VITE_API_URL is not defined. Please set it in your environment.');
}

const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
});

// Add request interceptor to include token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tokenRecruiter');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      localStorage.removeItem('tokenRecruiter');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { apiClient };
