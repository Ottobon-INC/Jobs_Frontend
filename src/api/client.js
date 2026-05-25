import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { API_BASE_URL, SUPABASE_URL, SUPABASE_KEY } from '../utils/constants';

// Singleton Supabase instance to prevent multiple GoTrueClient warnings
let _supabaseInstance = null;
const getSupabaseClient = () => {
    if (!_supabaseInstance) {
        _supabaseInstance = createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return _supabaseInstance;
};

export const supabase = getSupabaseClient();

// ── Cached auth token ────────────────────────────────────────
// Instead of calling getSession() on every request (slow!),
// we cache the token and update it via the auth state listener.
let _cachedToken = localStorage.getItem('ottobon_custom_token') || null;

export const setToken = (token) => {
    _cachedToken = token;
    if (token) {
        localStorage.setItem('ottobon_custom_token', token);
        // Sync to supabase client so direct DB calls work immediately
        supabase.auth.setSession({ access_token: token, refresh_token: '' });
    } else {
        localStorage.removeItem('ottobon_custom_token');
    }
};

// Prime the cache from the current session
supabase.auth.getSession().then(({ data }) => {
    const sessionToken = data?.session?.access_token;
    const customToken = localStorage.getItem('ottobon_custom_token');
    
    _cachedToken = customToken || sessionToken || null;

    // If we have a custom token but Supabase doesn't know about it, set it
    if (!sessionToken && customToken && customToken !== 'demo_token') {
        supabase.auth.setSession({ access_token: customToken, refresh_token: '' });
    }
});

// Keep cache in sync when user logs in/out/refreshes token
supabase.auth.onAuthStateChange((_event, session) => {
    const customToken = localStorage.getItem('ottobon_custom_token');
    if (session?.access_token) {
        // Only let the session update the token if there isn't a custom token active
        if (!customToken || customToken === 'demo_token') {
            setToken(session.access_token);
        }
    }
});

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

        // --- 401: Token Expired — attempt silent refresh then retry once ---
        if (error.response?.status === 401 && !config._isRetryAfterRefresh) {
            config._isRetryAfterRefresh = true;
            try {
                const { data: refreshData } = await supabase.auth.refreshSession();
                const newToken = refreshData?.session?.access_token;
                if (newToken) {
                    setToken(newToken);
                    config.headers.Authorization = `Bearer ${newToken}`;
                    return api(config); // Retry original request with new token
                }
            } catch (refreshErr) {
                console.warn('API 401 — token refresh failed:', refreshErr);
            }
            // If refresh failed, clear the stale cached token
            setToken(null);
        }

        const isSavedCheck = error.config?.url?.includes('/is-saved');
        
        // Log error except for expected noise like network errors during mass is-saved checks
        if (!isSavedCheck || error.response) {
            console.error('API Error:', error.response?.data?.detail || error.message);
        }
        return Promise.reject(error);
    }
);

export default api;
