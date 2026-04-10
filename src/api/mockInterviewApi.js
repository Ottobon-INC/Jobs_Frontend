/**
 * mockInterviewApi.js
 * HTTP client for mock interview endpoints.
 * Base URL is read from VITE_MOCK_API_URL env var — no hardcoding.
 */
import axios from 'axios';
// SECURITY: Use the same cached-token strategy as the main API client
// to ensure auth is consistently applied (OWASP A07)
import { supabase } from './client';

const MOCK_BASE = import.meta.env.VITE_MOCK_API_URL || 'http://localhost:8001/mock';

const mockClient = axios.create({
    baseURL: MOCK_BASE,
    timeout: 30000,
});

// SECURITY: Use cached Supabase session token instead of localStorage
let _mockCachedToken = null;
supabase.auth.getSession().then(({ data }) => {
    _mockCachedToken = data?.session?.access_token || null;
});
supabase.auth.onAuthStateChange((_event, session) => {
    _mockCachedToken = session?.access_token || null;
});

mockClient.interceptors.request.use((config) => {
    if (_mockCachedToken) {
        config.headers.Authorization = `Bearer ${_mockCachedToken}`;
    }
    return config;
});

export const uploadMockResume = async (file, sessionId = 'default_session') => {
    const formData = new FormData();
    formData.append('file', file);
    // SECURITY: Use Axios params to prevent URL injection
    const res = await mockClient.post('/upload_resume', formData, {
        params: { session_id: sessionId },
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};

export const setMockJobContext = async (companyName, jobDescription, sessionId = 'default_session') => {
    const res = await mockClient.post('/update_job_context', {
        company_name: companyName,
        job_description: jobDescription,
        session_id: sessionId,
    });
    return res.data;
};

export const setMockMode = async (mode, sessionId = 'default_session') => {
    const res = await mockClient.post('/set_mode', { mode, session_id: sessionId });
    return res.data;
};

export const analyzeMockResume = async (sessionId = 'default_session') => {
    // SECURITY: Use Axios params to prevent URL injection
    const res = await mockClient.post('/analyze_resume', null, {
        params: { session_id: sessionId },
    });
    return res.data;
};

export const getMockEvaluation = async (sessionId = 'default_session') => {
    // SECURITY: Use Axios params to prevent URL injection
    const res = await mockClient.get('/evaluate', {
        params: { session_id: sessionId },
    });
    return res.data;
};
