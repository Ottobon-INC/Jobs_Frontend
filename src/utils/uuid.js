/**
 * Safe UUID generator that works in both secure (HTTPS) and non-secure (HTTP) contexts.
 * crypto.randomUUID is only available in secure contexts.
 */
export const generateUUID = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        try {
            return crypto.randomUUID();
        } catch (e) {
            console.warn('crypto.randomUUID failed, falling back to manual generation', e);
        }
    }

    // Fallback for non-secure contexts or older browsers
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};
