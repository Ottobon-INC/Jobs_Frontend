import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { API_BASE_URL, SUPABASE_URL, SUPABASE_KEY } from '../utils/constants';

// Initialize Supabase client for auth
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Cached auth token ────────────────────────────────────────
let _cachedToken = localStorage.getItem('ottobon_custom_token') || null;

export const setToken = (token) => {
    _cachedToken = token;
    if (token) {
        localStorage.setItem('ottobon_custom_token', token);
    } else {
        localStorage.removeItem('ottobon_custom_token');
    }
};

// Axios instance for backend API
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor — uses cached token (sync) and merges config overrides
api.interceptors.request.use((config) => {
    if (_cachedToken) {
        config.headers.Authorization = `Bearer ${_cachedToken}`;
    }
    // Allow overriding timeout via config.requestTimeout
    if (config.requestTimeout) {
        config.timeout = config.requestTimeout;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor with automatic retry for 503 (Service Unavailable)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const config = error.config;

        // Retry logic for 503 errors (server overloaded / temporarily unavailable)
        if (error.response?.status === 503 && !config._retryCount) {
            config._retryCount = 0;
        }

        if (error.response?.status === 503 && config._retryCount < 3) {
            config._retryCount += 1;
            const delay = config._retryCount * 1000; // 1s, 2s, 3s backoff
            console.warn(`API 503 — retrying in ${delay}ms (attempt ${config._retryCount}/3)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return api(config);
        }

        console.error('API Error:', error.response?.data?.detail || error.message);
        return Promise.reject(error);
    }
);

export default api;
