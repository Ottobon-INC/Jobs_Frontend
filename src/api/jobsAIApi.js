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
