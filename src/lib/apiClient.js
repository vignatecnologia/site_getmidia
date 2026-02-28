import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request Interceptor
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('getmidia_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('getmidia_token');
            localStorage.removeItem('getmidia_user');
            // Optional: window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
