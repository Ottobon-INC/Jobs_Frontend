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
    // SECURITY: Use Axios params to prevent URL injection
    const response = await api.post('/admin/ingest/trigger', null, {
        params: scraperName ? { scraper_name: scraperName } : {},
    });
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
