import api from './client';

export const searchJobsAI = async (formData) => {
    // formData could be FormData object if uploading a file, or regular JSON if using profile
    const isFormData = formData instanceof FormData;
    const config = {
        timeout: 60000, // 60 seconds
        headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {}
    };

    const response = await api.post('/jobs-ai/search', formData, config);
    return response.data;
};

export const scrapeJobAI = async (url) => {
    const config = {
        timeout: 60000 // 60 seconds as Tavily + AI extraction can be slow
    };
    const response = await api.get(`/jobs-ai/scrape?url=${encodeURIComponent(url)}`, config);
    return response.data;
};

export const submitCommunityJob = async (jobData) => {
    const response = await api.post('/jobs-ai/submit', jobData);
    return response.data;
};

export const getCommunityFeed = async () => {
    const response = await api.get('/jobs-ai/community-feed');
    return response.data;
};

export const enrichJob = async (jobId) => {
    const response = await api.post(`/admin/jobs/${jobId}/enrich`);
    return response.data;
};
