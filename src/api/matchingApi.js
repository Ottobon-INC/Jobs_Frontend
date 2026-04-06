import api from './client';

export const matchUserToJob = async (jobId) => {
    const response = await api.get(`/jobs/${jobId}/match`, { timeout: 60000 });
    return response.data;
};
export const tailorResume = async (jobId) => {
    const response = await api.post(`/jobs/${jobId}/tailor-resume`);
    return response.data;
};
