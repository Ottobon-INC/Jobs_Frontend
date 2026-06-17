import api from './client';

export const fetchKnowledgeEntries = async (params = {}) => {
    const response = await api.get('/admin/knowledge', { params });
    return response.data;
};

export const createKnowledgeEntry = async (formData) => {
    const response = await api.post('/admin/knowledge', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const deleteKnowledgeEntry = async (id) => {
    await api.delete(`/admin/knowledge/${id}`);
};
