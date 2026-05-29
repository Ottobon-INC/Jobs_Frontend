import api from './client';

/**
 * Sign up via Backend Proxy.
 */
export const signUp = async (email, password, role, fullName, phone, location, skills, interests, dob, aspirations, avatarUrl, workPreference, experience, position, description) => {
    const res = await api.post('/auth/register', {
        email,
        password,
        metadata: {
            role,
            full_name: fullName,
            phone,
            location,
            skills,
            interests,
            dob,
            aspirations,
            avatar_url: avatarUrl,
            work_preference: workPreference,
            experience,
            position,
            description,
            privacy_policy_accepted: true
        }
    });

    const data = res.data;
    if (data.access_token) {
        const { setToken } = await import('./client');
        setToken(data.access_token, data.refresh_token);
    }
    
    return data;
};

/**
 * Sign in via Backend Proxy.
 */
export const signIn = async (email, password) => {
    // Demo bypass for mobile testing
    if (email === 'demo@ottobon.com') {
        const { setToken } = await import('./client');
        setToken('demo_token');
        return { access_token: 'demo_token' };
    }

    const res = await api.post('/auth/login', { email, password });
    const data = res.data;
    
    if (data.access_token) {
        const { setToken } = await import('./client');
        setToken(data.access_token, data.refresh_token);
    }
    
    return data;
};

export const signOut = async () => {
    const { setToken } = await import('./client');
    setToken(null);
    // User logged out — clear chat sessions from localStorage
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('ottobon_chat_session_')) {
            localStorage.removeItem(key);
        }
    });
};

export const getSession = async () => {
    const token = localStorage.getItem('ottobon_custom_token');
    if (!token) return null;
    return { access_token: token };
};

export const getUser = async () => {
    const session = await getSession();
    if (!session) return null;
    return { id: 'session-user' };
};

export const initiateGoogleLogin = (role = 'seeker') => {
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8001';
    window.location.href = `${backendUrl}/auth/google/login?role=${role}`;
};
