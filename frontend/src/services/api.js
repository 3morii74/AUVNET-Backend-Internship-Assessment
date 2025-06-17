import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:4000/api',
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
    (config) => {
        console.log('Making request to:', config.url);
        console.log('Request config:', {
            method: config.method,
            headers: config.headers,
            data: config.data
        });

        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Don't modify Content-Type if it's already set (e.g., for multipart/form-data)
        if (!config.headers['Content-Type']) {
            config.headers['Content-Type'] = 'application/json';
        }

        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
    (response) => {
        console.log('Response from:', response.config.url);
        console.log('Response data:', response.data);
        return response;
    },
    (error) => {
        console.error('Response error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data
        });

        // Handle unauthorized errors (401)
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api; 