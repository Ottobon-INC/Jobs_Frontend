/**
 * mockInterviewApi.js
 * HTTP client for mock interview endpoints.
 * Base URL is read from VITE_MOCK_API_URL env var — no hardcoding.
 */
import axios from 'axios';

const MOCK_BASE = import.meta.env.VITE_MOCK_API_URL || 'http://localhost:8001/mock';

const mockClient = axios.create({
    baseURL: MOCK_BASE,
    timeout: 30000,
});

// Attach auth token if available (mirrors the main api client pattern)
mockClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const uploadMockResume = async (file, sessionId = 'default_session') => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await mockClient.post(`/upload_resume?session_id=${sessionId}`, formData, {
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
    const res = await mockClient.post(`/analyze_resume?session_id=${sessionId}`);
    return res.data;
};

export const getMockEvaluation = async (sessionId = 'default_session') => {
    const res = await mockClient.get(`/evaluate?session_id=${sessionId}`);
    return res.data;
};
