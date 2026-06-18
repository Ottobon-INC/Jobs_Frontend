import api from './client';

/**
 * Fetch the current user's profile score.
 */
export const getMyProfileScore = async () => {
    const response = await api.get('/profile-score/me');
    return response.data;
};

/**
 * Force a recomputation of the current user's profile score.
 */
export const recomputeMyProfileScore = async () => {
    const response = await api.post('/profile-score/recompute');
    return response.data;
};

/**
 * Retrieve the current user's personalized roadmap recommendations.
 */
export const getMyRoadmap = async () => {
    const response = await api.get('/profile-score/roadmap');
    return response.data;
};

/**
 * Fetch the community leaderboard scores.
 * @param {number} limit Number of leaderboard entries to fetch.
 */
export const getLeaderboard = async (limit = 10) => {
    const response = await api.get('/profile-score/leaderboard', { params: { limit } });
    return response.data;
};

/**
 * Force recomputation of scores for all active users (Admin only).
 */
export const adminRecomputeAllScores = async () => {
    const response = await api.post('/profile-score/admin/recompute-all');
    return response.data;
};
