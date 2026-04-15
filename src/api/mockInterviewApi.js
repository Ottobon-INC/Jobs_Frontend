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

export const createMockInterviewReview = async ({
    id,
    userId,
    jobId = null,
    interviewType,
    durationMinutes,
    transcript = [],
    userTranscript = [],
    aiTranscript = [],
}) => {
    const payload = {
        id,
        user_id: userId,
        job_id: jobId || null,
        transcript,
        status: 'pending_review',
        expert_feedback: null,
        ai_scorecard: {
            interview_type: interviewType,
            duration_minutes: durationMinutes,
            user_transcript: userTranscript,
            ai_transcript: aiTranscript,
            combined_transcript: transcript,
            review_state: 'pending_admin_review',
            submitted_at: new Date().toISOString(),
        },
    };

    const { data, error } = await supabase
        .from('mock_interviews_jobs')
        .insert(payload)
        .select('id, status')
        .single();

    if (error) throw error;
    return data;
};

export const getAdminMockInterviewReviews = async ({ status = 'all', search = '' } = {}) => {
    let query = supabase
        .from('mock_interviews_jobs')
        .select(`
            id,
            user_id,
            job_id,
            transcript,
            ai_scorecard,
            expert_feedback,
            status,
            created_at,
            user:users_jobs(id, full_name, email),
            job:jobs_jobs(id, title, company_name)
        `)
        .order('created_at', { ascending: false });

    if (status !== 'all') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) throw error;
    console.log('Raw Admin Data from Supabase:', data);

    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return data || [];

    return (data || []).filter((item) => {
        const haystacks = [
            item.user?.full_name,
            item.user?.email,
            item.job?.title,
            item.job?.company_name,
        ].filter(Boolean);

        return haystacks.some((value) => value.toLowerCase().includes(normalizedSearch));
    });
};

export const getAdminMockInterviewReview = async (reviewId) => {
    const { data, error } = await supabase
        .from('mock_interviews_jobs')
        .select(`
            id,
            user_id,
            job_id,
            transcript,
            ai_scorecard,
            expert_feedback,
            status,
            created_at,
            user:users_jobs(id, full_name, email),
            job:jobs_jobs(id, title, company_name)
        `)
        .eq('id', reviewId)
        .single();

    if (error) throw error;
    return data;
};

export const submitAdminMockInterviewReview = async (reviewId, adminReview) => {
    const existing = await getAdminMockInterviewReview(reviewId);

    const mergedScorecard = {
        ...(existing.ai_scorecard || {}),
        admin_review: adminReview,
        review_state: 'reviewed',
        reviewed_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from('mock_interviews_jobs')
        .update({
            status: 'reviewed',
            expert_feedback: adminReview.feedback_markdown,
            ai_scorecard: mergedScorecard,
        })
        .eq('id', reviewId)
        .select(`
            id,
            user_id,
            job_id,
            transcript,
            ai_scorecard,
            expert_feedback,
            status,
            created_at,
            user:users_jobs(id, full_name, email),
            job:jobs_jobs(id, title, company_name)
        `)
        .single();

    if (error) throw error;
    return data;
};
