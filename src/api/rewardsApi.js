import api from './client';

/**
 * Rewards API — Daily login, Coin Shop, Leaderboard
 */

// ── User Rewards State ──────────────────────────────────────

/** Get the user's full rewards state (balance, streak, claim eligibility). */
export const getRewardsState = async () => {
    const response = await api.get('/rewards/state');
    return response.data;
};

/** Claim today's daily login reward. */
export const claimDailyReward = async () => {
    const response = await api.post('/rewards/claim');
    return response.data;
};

// ── Shop Items ──────────────────────────────────────────────

/** List all active reward items. */
export const getRewardItems = async () => {
    const response = await api.get('/rewards/items');
    return response.data;
};

/** Redeem a reward item. */
export const redeemReward = async (rewardItemId, quantity = 1) => {
    const response = await api.post('/rewards/redeem', {
        reward_item_id: rewardItemId,
        quantity,
    });
    return response.data;
};

// ── Redemption History ──────────────────────────────────────

/** Get the user's redemption history. */
export const getMyRedemptions = async () => {
    const response = await api.get('/rewards/redemptions');
    return response.data;
};

// ── Leaderboard ─────────────────────────────────────────────

/** Get the rewards leaderboard. */
export const getLeaderboard = async (limit = 20, sortBy = 'total_coins_earned') => {
    const response = await api.get('/rewards/leaderboard', {
        params: { limit, sort_by: sortBy },
    });
    return response.data;
};

// ══════════════════════════════════════════════════════════════
//  ADMIN ENDPOINTS
// ══════════════════════════════════════════════════════════════

/** Admin: Get rewards stats. */
export const adminGetRewardsStats = async () => {
    const response = await api.get('/admin/rewards/stats');
    return response.data;
};

/** Admin: List all items (including inactive). */
export const adminListRewardItems = async (activeOnly = false) => {
    const response = await api.get('/admin/rewards/items', {
        params: { active_only: activeOnly },
    });
    return response.data;
};

/** Admin: Create a new reward item. */
export const adminCreateRewardItem = async (data) => {
    const response = await api.post('/admin/rewards/items', data);
    return response.data;
};

/** Admin: Update a reward item. */
export const adminUpdateRewardItem = async (itemId, data) => {
    const response = await api.patch(`/admin/rewards/items/${itemId}`, data);
    return response.data;
};

/** Admin: Delete (deactivate) a reward item. */
export const adminDeleteRewardItem = async (itemId) => {
    const response = await api.delete(`/admin/rewards/items/${itemId}`);
    return response.data;
};

/** Admin: List all redemptions. */
export const adminListRedemptions = async (limit = 100, offset = 0, status = null) => {
    const response = await api.get('/admin/rewards/redemptions', {
        params: { limit, offset, ...(status ? { status } : {}) },
    });
    return response.data;
};

/** Admin: Update a redemption status. */
export const adminUpdateRedemption = async (redemptionId, newStatus) => {
    const response = await api.patch(`/admin/rewards/redemptions/${redemptionId}`, null, {
        params: { new_status: newStatus },
    });
    return response.data;
};

/** Admin: Adjust a user's coin balance. */
export const adminAdjustBalance = async (userId, amount, reason = '') => {
    const response = await api.post('/admin/rewards/adjust-balance', null, {
        params: { user_id: userId, amount, reason },
    });
    return response.data;
};

/** Admin: Get leaderboard with higher limit. */
export const adminGetLeaderboard = async (limit = 50, sortBy = 'total_coins_earned') => {
    const response = await api.get('/admin/rewards/leaderboard', {
        params: { limit, sort_by: sortBy },
    });
    return response.data;
};
