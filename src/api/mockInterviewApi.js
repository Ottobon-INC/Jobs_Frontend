/**
 * mockInterviewApi.js
 * HTTP client for mock interview endpoints.
 * Base URL is read from VITE_MOCK_API_URL env var — no hardcoding.
 */
import axios from 'axios';
import api, { supabase } from './client';

const proto = window.location.protocol === 'https:' ? 'https:' : 'http:';
const MOCK_BASE = import.meta.env.VITE_MOCK_API_URL || `${proto}//${window.location.hostname}:8200/mock`;

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

export const setMockMode = async (mode, sessionId = 'default_session', options = {}) => {
    const res = await mockClient.post('/set_mode', { 
        mode, 
        session_id: sessionId,
        duration_minutes: options.durationMinutes || 15,
        interviewer_persona: options.interviewerPersona || 'Neutral',
        whiteboard_mode: options.whiteboardMode || false,
        interview_input_mode: options.interviewInputMode || 'voice',
    });
    return res.data;
};


/**
 * Push a multi-round interview structure to the backend for this session.
 * @param {Array<{round_name: string, focus_description: string, question_limit: number}>} rounds
 * @param {string} sessionId
 */
export const setMockInterviewStructure = async (rounds, sessionId = 'default_session') => {
    // Client-side guard: never send empty or invalid rounds (prevents 422)
    if (!rounds || !Array.isArray(rounds) || rounds.length === 0) {
        console.warn('[mockInterviewApi] setMockInterviewStructure skipped: rounds is empty or invalid');
        return { message: 'No rounds to set' };
    }

    // Validate each round has required fields with correct types
    const validRounds = rounds.filter(r =>
        r &&
        typeof r.round_name === 'string' &&
        r.round_name.trim() !== ''
    );

    if (validRounds.length === 0) {
        console.warn('[mockInterviewApi] setMockInterviewStructure skipped: no valid rounds after filtering');
        return { message: 'No valid rounds to set' };
    }

    const res = await mockClient.post('/set_interview_structure', {
        rounds: validRounds,
        session_id: sessionId,
    });
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
    // ── Round fields (v2) — safe defaults for backward compat ──
    roundNumber = 1,
    roundLabel = 'General Interview',
    roundType = 'technical',
    roundsConfig = [],
    roundsCompleted = 0,
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
            // Round metadata stored inside scorecard JSONB
            round_number: roundNumber,
            round_label: roundLabel,
            round_type: roundType,
            rounds_config: roundsConfig,
            rounds_completed: roundsCompleted,
        },
        // Also written as top-level DB columns (schema v2)
        round_number: roundNumber,
        round_label: roundLabel,
        round_type: roundType,
        rounds_config: roundsConfig.length > 0 ? roundsConfig : null,
        rounds_completed: roundsCompleted,
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

export const uploadProfileResumeToSession = async (resumeText, sessionId) => {
    // Convert profile resume text to a blob and upload it
    const blob = new Blob([resumeText], { type: 'text/plain' });
    const file = new File([blob], 'profile_resume.txt', { type: 'text/plain' });
    const formData = new FormData();
    formData.append('file', file);
    const res = await mockClient.post('/upload_resume', formData, {
        params: { session_id: sessionId },
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};

export const updateIntermediateTranscript = async (id, { transcript = [], userTranscript = [], aiTranscript = [] }) => {
    const res = await api.patch(`/mock-interviews/${id}/transcript`, {
        transcript,
        user_transcript: userTranscript,
        ai_transcript: aiTranscript,
    });
    return res.data;
};

