import api from './client';

export const fetchTimeline = async () => {
    const response = await api.get('/hiring-timeline');
    return response.data;
};

export const fetchTimelineById = async (id) => {
    const response = await api.get(`/hiring-timeline/${id}`);
    return response.data;
};

export const createTimeline = async (timelineData) => {
    const response = await api.post('/hiring-timeline', timelineData);
    return response.data;
};

export const updateTimeline = async (id, timelineData) => {
    const response = await api.patch(`/hiring-timeline/${id}`, timelineData);
    return response.data;
};

export const deleteTimeline = async (id) => {
    const response = await api.delete(`/hiring-timeline/${id}`);
    return response.data;
};
