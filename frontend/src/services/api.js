import axios from 'axios';
import { API_URL } from '../config/runtimeEnv';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT from localStorage on every request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eventsync_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize errors and handle 401 globally.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token invalid/expired — clear it. AuthContext will react on next load.
      const isAuthRoute = error.config && /\/auth\/(login|register)/.test(error.config.url || '');
      if (!isAuthRoute) {
        localStorage.removeItem('eventsync_token');
      }
    }
    return Promise.reject(error);
  }
);

/* Extract a friendly message from an Axios error. */
export function getErrorMessage(error, fallback = 'Something went wrong.') {
  if (error && error.response && error.response.data) {
    return error.response.data.message || fallback;
  }
  if (error && error.message === 'Network Error') {
    return 'Network error. Please check your connection.';
  }
  return fallback;
}

export default api;
