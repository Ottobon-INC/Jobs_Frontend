import api from './client';

export const fetchPlaybooks = async (hiringZone = null) => {
    const params = hiringZone ? { hiring_zone: hiringZone } : {};
    const response = await api.get('/playbooks/', { params });
    return response.data;
};

export const fetchPlaybookById = async (id) => {
    const response = await api.get(`/playbooks/${id}`);
    return response.data;
};

export const fetchPlaybookBySlug = async (slug) => {
    const response = await api.get(`/playbooks/slug/${slug}`);
    return response.data;
};

export const createPlaybook = async (playbookData) => {
    const response = await api.post('/playbooks/', playbookData);
    return response.data;
};

export const updatePlaybook = async (id, playbookData) => {
    const response = await api.patch(`/playbooks/${id}`, playbookData);
    return response.data;
};

export const deletePlaybook = async (id) => {
    const response = await api.delete(`/playbooks/${id}`);
    return response.data;
};
