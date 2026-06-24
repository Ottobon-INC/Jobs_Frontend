import api, { supabase } from './client';

export const createJob = async (jobData) => {
    // jobData: { title, description_raw, skills_required }
    const response = await api.post('/jobs', jobData);
    return response.data;
};

export const getProviderJobs = async () => {
    const response = await api.get('/jobs/provider');
    return response.data;
};

export const deleteJob = async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}`);
    return response.data;
};

export const getJobFeed = async (skip = 0, limit = 10000) => {
    const response = await api.get('/jobs/feed', {
        params: { skip, limit },
    });
    return response.data;
};

export const getJobDetails = async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/details`);
    return response.data;
};

export const getJobMatchScore = async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/match`, { timeout: 60000 });
    return response.data;
};

export const tailorResume = async (jobId) => {
    // Tailoring can take a long time via AI, give it 60s
    const response = await api.post(`/resume-builder/${jobId}/tailor`, null, { timeout: 60000 });
    return response.data;
};

export const downloadTailoredResume = async (jobTitle, tailoredResume) => {
    const response = await api.post('/resume-builder/download', {
        job_title: jobTitle,
        tailored_resume: tailoredResume
    }, {
        responseType: 'blob'
    });
    return response.data;
};

export const matchAllJobs = async () => {
    const response = await api.post('/jobs/match', {}, { timeout: 60000 });
    return response.data;
};

// --- Saved Jobs (Backend Proxied) ---

/** Helper: get the current Supabase auth user ID */
export const getSavedJobs = async () => {
    const response = await api.get('/jobs/saved');
    return response.data;
};

export const saveJob = async (jobId) => {
    const response = await api.post(`/jobs/saved/${jobId}`);
    return response.data;
};

export const unsaveJob = async (jobId) => {
    const response = await api.delete(`/jobs/saved/${jobId}`);
    return response.data;
};

export const isJobSaved = async (jobId) => {
    const response = await api.get(`/jobs/saved/${jobId}/check`);
    return response.data.saved;
};

// --- Job Applications (v2 Multi-Round Workflow) ---

export const applyToJob = async (jobId) => {
    const response = await api.post(`/jobs/${jobId}/apply`, {}, { timeout: 60000 });
    return response.data;
};

export const getMyApplications = async () => {
    const response = await api.get('/jobs/applications/my');
    return response.data;
};

export const getJobApplicants = async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/applications`);
    return response.data;
};

export const promoteApplicant = async (applicationId) => {
    const response = await api.post(`/jobs/applications/${applicationId}/promote`);
    return response.data;
};

export const rejectApplicant = async (applicationId) => {
    const response = await api.post(`/jobs/applications/${applicationId}/reject`);
    return response.data;
};

export const getMockInterviewDetails = async (interviewId) => {
    const response = await api.get(`/mock-interviews/${interviewId}`);
    return response.data;
};

export const getJobMockInterviewConfig = async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/mock-interview-config`);
    return response.data;
};

export const updateJobMockInterviewConfig = async (jobId, config) => {
    const response = await api.patch(`/jobs/${jobId}/mock-interview-config`, config);
    return response.data;
};


