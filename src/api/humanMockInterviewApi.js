import api from './client';

export const createHumanMockInterviewRequest = async (data) => {
    const response = await api.post('/human-mock-interviews', data);
    return response.data;
};

export const uploadInterviewResume = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/human-mock-interviews/upload-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data; // { resume_url, resume_filename }
};

export const getMyHumanMockInterviews = async () => {
    const response = await api.get('/human-mock-interviews/my-requests');
    return response.data;
};

// Admin endpoints
export const getAdminHumanMockInterviews = async (status = 'all') => {
    const response = await api.get(`/human-mock-interviews/admin?status_filter=${status}`);
    return response.data;
};

export const approveHumanMockInterview = async (id, data) => {
    const response = await api.patch(`/human-mock-interviews/admin/${id}/approve`, data);
    return response.data;
};

export const rejectHumanMockInterview = async (id, data) => {
    const response = await api.patch(`/human-mock-interviews/admin/${id}/reject`, data);
    return response.data;
};

export const completeHumanMockInterview = async (id) => {
    const response = await api.patch(`/human-mock-interviews/admin/${id}/complete`);
    return response.data;
};
