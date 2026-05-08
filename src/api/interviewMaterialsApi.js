import api from './client';

export const uploadInterviewMaterial = async (formData) => {
    // formData should contain 'file' (File), 'company_name' (string), and 'title' (string)
    const response = await api.post('/interview-materials', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

export const fetchInterviewMaterials = async (companyName = null, folderId = null) => {
    let url = '/interview-materials';
    const params = new URLSearchParams();
    if (companyName) params.append('company_name', companyName);
    if (folderId) params.append('folder_id', folderId);
    
    const queryString = params.toString();
    if (queryString) url += `?${queryString}`;
    
    const response = await api.get(url);
    return response.data;
};

export const fetchInterviewMaterialById = async (id) => {
    const response = await api.get(`/interview-materials/${id}`);
    return response.data;
};

export const deleteInterviewMaterial = async (id) => {
    const response = await api.delete(`/interview-materials/${id}`);
    return response.data;
};

// Folders API
export const fetchFolders = async () => {
    const response = await api.get('/material-folders');
    return response.data;
};

export const createFolder = async (name) => {
    const response = await api.post('/material-folders', { name });
    return response.data;
};

export const deleteFolder = async (id) => {
    const response = await api.delete(`/material-folders/${id}`);
    return response.data;
};

export const updateFolder = async (id, name) => {
    const response = await api.patch(`/material-folders/${id}`, { name });
    return response.data;
};
