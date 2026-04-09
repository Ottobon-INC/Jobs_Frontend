import api from './client';

/**
 * Admin API calls for the Control Tower.
 */

export const getActiveSessions = async () => {
    const response = await api.get('/admin/sessions');
    return response.data;
};

export const getSessionDetails = async (sessionId) => {
    const response = await api.get(`/admin/sessions/${sessionId}`);
    return response.data;
};

export const triggerIngestion = async (scraperName = null) => {
    const url = scraperName
        ? `/admin/ingest/trigger?scraper_name=${scraperName}`
        : `/admin/ingest/trigger`;
    const response = await api.post(url);
    return response.data;
};

export const sendAdminMessage = async (sessionId, content) => {
    const response = await api.post(`/admin/sessions/${sessionId}/message`, { content });
    return response.data;
};

export const releaseSession = async (sessionId) => {
    const response = await api.post(`/admin/sessions/${sessionId}/release`);
    return response.data;
};
