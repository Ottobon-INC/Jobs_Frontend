/**
 * mockInterviewApi.js
 * HTTP client for mock interview endpoints.
 * Base URL is read from VITE_MOCK_API_URL env var — no hardcoding.
 */
import axios from 'axios';
// SECURITY: Use the same cached-token strategy as the main API client
// to ensure auth is consistently applied (OWASP A07)
import { supabase } from './client';

const MOCK_BASE = import.meta.env.VITE_MOCK_API_URL || `http://${window.location.hostname}:8200/mock`;

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

export const setMockMode = async (mode, sessionId = 'default_session', options = {}) => {
    const res = await mockClient.post('/set_mode', { 
        mode, 
        session_id: sessionId,
        duration_minutes: options.durationMinutes || 15,
        interviewer_persona: options.interviewerPersona || 'Neutral',
        whiteboard_mode: options.whiteboardMode || false
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
    // ── Round fields (v2) — safe defaults for backward compat ──
    roundNumber = 1,
    roundLabel = 'General Interview',
    roundType = 'technical',
    roundsConfig = [],
    roundsCompleted = 0,
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
            updated_at,
            user:users_jobs!user_id(id, full_name, email),
            job:jobs_jobs!job_id(id, title, company_name)
        `)
        .order('created_at', { ascending: false });

    if (status !== 'all') {
        query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Supabase Query Error (List):', error);
        throw error;
    }
    console.log('Available IDs in List:', data?.map(item => item.id));
    if (data?.length > 0) {
        console.log('Sample Item (List):', {
            id: data[0].id,
            userFound: !!data[0].user,
            jobFound: !!data[0].job,
            userRole: data[0].user?.role
        });
    }

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
            updated_at,
            user:users_jobs!user_id(id, full_name, email),
            job:jobs_jobs!job_id(id, title, company_name)
        `)
        .eq('id', reviewId)
        .maybeSingle();

    console.log('Single Review Result:', { id: reviewId, hasData: !!data, error: error?.message });

    if (error) {
        console.error('Supabase Query Error (Single):', error);
        throw error;
    }
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
            updated_at
        `)
        .single();

    if (error) {
        console.error('Supabase Update Error:', error);
        throw error;
    }
    return data;
};

export const getMyMockInterviews = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('mock_interviews_jobs')
        .select(`
            id,
            status,
            created_at,
            updated_at,
            reviewed_at,
            viewed_at,
            job:jobs_jobs!job_id(title, company_name),
            expert_feedback
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
};

export const getMockInterviewDetails = async (id) => {
    const { data: { user } } = await supabase.auth.getUser();
    
    let query = supabase
        .from('mock_interviews_jobs')
        .select(`
            id,
            status,
            created_at,
            updated_at,
            reviewed_at,
            viewed_at,
            transcript,
            ai_scorecard,
            expert_feedback,
            job:jobs_jobs!job_id(title, company_name)
        `)
        .eq('id', id);

    // If seeker, double protect by user_id check
    // If admin is doing it via a seeker route, we might need flexibility, 
    // but usually getMockInterviewDetails is seeker-side only.
    if (user?.user_metadata?.role !== 'admin') {
        query = query.eq('user_id', user?.id);
    }

    const { data, error } = await query.single();

    if (error) throw error;
    return data;
};

export const markMockInterviewAsViewed = async (id) => {
    const { data, error } = await supabase
        .from('mock_interviews_jobs')
        .update({ viewed_at: new Date().toISOString() })
        .eq('id', id)
        .is('viewed_at', null)
        .select('id, viewed_at')
        .single();

    // If already viewed, nothing was updated (single() errors on empty), so we ignore the "not found" error
    if (error && error.code !== 'PGRST116') {
        console.error('Failed to mark mock interview as viewed:', error);
        // We don't necessarily want to break the UI for this
    }
    return data;
};
