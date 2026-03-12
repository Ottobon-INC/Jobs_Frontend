import api from './client';

export const createJob = async (jobData) => {
    // jobData: { title, description_raw, skills_required }
    const response = await api.post('/jobs', jobData);
    return response.data;
};

export const getProviderJobs = async () => {
    const response = await api.get('/jobs/provider');
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
