import api, { supabase } from './client';

export const getMyProfile = async () => {
    const response = await api.get('/users/me', {
        requestTimeout: 7000 // Ensure we fail fast for the initial profile sync
    });
    return response.data;
};

export const updateProfile = async (data) => {
    const response = await api.patch('/users/me', data);
    return response.data;
};

export const uploadAvatar = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/users/avatar', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.avatar_url;
};

export const uploadResume = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/users/resume', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const reuploadResume = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.put('/users/resume', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const getResumeDownloadUrl = async () => {
    const response = await api.get('/users/me/resume');
    return response.data;
};

export const extractSkills = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/users/extract-skills', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};
