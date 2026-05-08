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

export const getJobFeed = async (skip = 0, limit = 500) => {
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

// --- Saved Jobs (Supabase Persistent) ---

/** Helper: get the current Supabase auth user ID */
export const getSavedJobs = async () => {
    const response = await api.get('/jobs/saved');
    return response.data;
};

export const saveJob = async (jobId) => {
    const response = await api.post(`/jobs/${jobId}/save`);
    return response.data;
};

export const unsaveJob = async (jobId) => {
    const response = await api.delete(`/jobs/${jobId}/save`);
    return response.data;
};

export const isJobSaved = async (jobId) => {
    try {
        const response = await api.get(`/jobs/${jobId}/is-saved`);
        return response.data.is_saved;
    } catch (err) {
        // If 401 or other error, assume not saved
        return false;
    }
};
