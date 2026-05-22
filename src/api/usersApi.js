import api, { supabase } from './client';

export const getMyProfile = async () => {
    // Demo bypass for mobile testing
    const token = localStorage.getItem('ottobon_custom_token');
    if (token === 'demo_token') {
        return {
            id: 'demo_user_id',
            email: 'demo@ottobon.com',
            role: 'seeker',
            full_name: 'Demo User',
            location: 'Bangalore'
        };
    }

    const response = await api.get('/users/me', {
        requestTimeout: 15000 // Increased to 15s to handle slower DB/cold starts
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
