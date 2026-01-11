import axios from 'axios';

// Store Access Token in RAM (Closure variable)
let accessToken = null;

// Function to set Access Token
export const setAccessToken = (token) => {
    accessToken = token;
};

// Function to get Access Token
export const getAccessToken = () => accessToken;

// Create axios instance
const api = axios.create({
    baseURL: import.meta.env.VITE_APP_BASE_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Add a request interceptor
api.interceptors.request.use(
    (config) => {
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Prevent infinite loop
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Call refresh token endpoint (sends cookie automatically)
                const response = await api.post('/auth/refresh');
                const { accessToken: newAccessToken } = response.data;

                // Update access token in RAM
                setAccessToken(newAccessToken);

                // Retry original request with new token
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
