import api from './client';

export const feedbackApi = {
  submit: (data) => api.post('/feedback', data),
  getMyHistory: () => api.get('/feedback/me'),
  getAllForAdmin: (params) => api.get('/feedback/admin', { params }),
};
