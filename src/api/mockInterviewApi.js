/**
 * mockInterviewApi.js
 * HTTP client for mock interview endpoints.
 * Base URL is read from VITE_MOCK_API_URL env var — no hardcoding.
 */
import axios from 'axios';
import api, { supabase } from './client';

const MOCK_BASE = import.meta.env.VITE_MOCK_API_URL || `http://${window.location.hostname}:8200/mock`;

/**
 * mockClient is used for real-time interaction with the AI interview engine (Port 8200).
 * Persistence is handled by the main 'api' client (FastAPI).
 */
const mockClient = axios.create({
    baseURL: MOCK_BASE,
    timeout: 30000,
});

// SECURITY: Sync mockClient auth with the main client's cached token
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

// --- AI Engine Interactions (Port 8200) ---

export const uploadMockResume = async (file, sessionId = 'default_session') => {
    const formData = new FormData();
    formData.append('file', file);
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
    const res = await mockClient.post('/analyze_resume', null, {
        params: { session_id: sessionId },
    });
    return res.data;
};

export const getMockEvaluation = async (sessionId = 'default_session') => {
    const res = await mockClient.get('/evaluate', {
        params: { session_id: sessionId },
    });
    return res.data;
};

// --- DB Persistence (FastAPI Backend) ---

export const startMockInterview = async (jobId = null) => {
    const res = await api.post('/mock-interviews/start', { job_id: jobId });
    return res.data;
};

export const createMockInterviewReview = async ({
    id, // interview_id
    interviewType,
    durationMinutes,
    transcript = [],
    userTranscript = [],
    aiTranscript = [],
}) => {
    // Matches MockInterviewSubmit model in backend
    const payload = {
        transcript,
        ai_scorecard: {
            interview_type: interviewType,
            duration_minutes: durationMinutes,
            user_transcript: userTranscript,
            ai_transcript: aiTranscript,
            combined_transcript: transcript,
            submitted_at: new Date().toISOString(),
        },
    };

    const res = await api.post(`/mock-interviews/${id}/submit`, payload);
    return res.data;
};

export const getAdminMockInterviewReviews = async ({ status = 'all', search = '' } = {}) => {
    const res = await api.get('/admin/mock-interviews', {
        params: { status, search }
    });
    return res.data;
};

export const getAdminMockInterviewReview = async (reviewId) => {
    const res = await api.get(`/admin/mock-interviews/${reviewId}`);
    return res.data;
};

export const submitAdminMockInterviewReview = async (reviewId, adminReview) => {
    const res = await api.post(`/admin/mock-interviews/${reviewId}/review`, adminReview);
    return res.data;
};

export const getMyMockInterviews = async () => {
    const res = await api.get('/mock-interviews/my');
    return res.data;
};

export const getMockInterviewDetails = async (id) => {
    const res = await api.get(`/mock-interviews/${id}`);
    return res.data;
};

export const markMockInterviewAsViewed = async (id) => {
    const res = await api.post(`/mock-interviews/${id}/view`);
    return res.data;
};

export const requestExpertReview = async (id) => {
    const res = await api.post(`/mock-interviews/${id}/request-review`);
    return res.data;
};
