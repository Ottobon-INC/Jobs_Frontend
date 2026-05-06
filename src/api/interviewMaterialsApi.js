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

export const fetchInterviewMaterials = async (companyName = null) => {
    let url = '/interview-materials';
    if (companyName) {
        url += `?company_name=${encodeURIComponent(companyName)}`;
    }
    const response = await api.get(url);
    return response.data;
};

export const deleteInterviewMaterial = async (id) => {
    const response = await api.delete(`/interview-materials/${id}`);
    return response.data;
};
