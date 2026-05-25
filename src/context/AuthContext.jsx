import { createContext, useState, useEffect, useRef, useMemo, useContext, useCallback } from 'react';
import { supabase, setToken as setApiToken } from '../api/client';
import { getMyProfile } from '../api/usersApi';

// Robust JWT decoding for custom standalone tokens
const decodeJWT = (token) => {
    if (!token || token === 'demo_token') return null;
    try {
        const base64Url = token.split('.')[1];
        if (!base64Url) return null;
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (e) {
        console.warn("Failed to decode JWT:", e);
        return null;
    }
};

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [role, setRole] = useState(null);
    const [savedJobIds, setSavedJobIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const initialised = useRef(false);
    const userRef = useRef(user);

    useEffect(() => {
        userRef.current = user;
    }, [user]);
    
    const fetchSavedJobs = useCallback(async () => {
        try {
            const { getSavedJobs } = await import('../api/jobsApi');
            const saved = await getSavedJobs();
            setSavedJobIds(new Set(saved.map(j => j.id)));
        } catch (error) {
            console.error('Failed to fetch saved job IDs:', error);
        }
    }, []);

    const fetchProfile = useCallback(async (retries = 3, cachedUser = null) => {
        try {
            const data = await getMyProfile();
            setProfile(data);
            setRole(data.role);
            setUser({ id: data.id, email: data.email });
        } catch (error) {
            const status = error?.response?.status;
            const isTimeout = error.code === 'ECONNABORTED' || error.message?.includes('timeout');

            // --- CRITICAL FIX: Handle expired/invalid tokens (401) ---
            if (status === 401) {
                console.warn('fetchProfile: 401 Unauthorized. Attempting token refresh...');
                try {
                    const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
                    if (refreshData?.session?.access_token && !refreshError) {
                        setApiToken(refreshData.session.access_token);
                        console.info('fetchProfile: Token refreshed, retrying...');
                        const retryData = await getMyProfile();
                        setProfile(retryData);
                        setRole(retryData.role);
                        return;
                    }
                } catch (refreshErr) {
                    console.warn('fetchProfile: Token refresh failed.', refreshErr);
                }
                console.warn('fetchProfile: Clearing stale auth state due to 401.');
                setSession(null);
                setUser(null);
                setRole(null);
                setProfile(null);
                setApiToken(null);
                await supabase.auth.signOut();
                setLoading(false);
                return;
            }

            if (isTimeout) {
                console.warn('fetchProfile: Request timed out. Skipping retries and using fallback.');
            }

            if (!isTimeout && retries > 0 && (status === 503 || status === 404)) {
                const delay = status === 404 ? 1500 : 1000;
                await new Promise(r => setTimeout(r, delay));
                return fetchProfile(retries - 1, cachedUser);
            }
            console.error('Failed to fetch user profile:', error);

            // Fallback: use cached user or Supabase metadata
            const activeUser = cachedUser || userRef.current;
            if (activeUser) {
                console.warn('fetchProfile: Falling back to cached user metadata');
                const metaRole = activeUser.user_metadata?.role || 'seeker';
                setRole(metaRole);
                setProfile({
                    role: metaRole,
                    email: activeUser.email,
                    full_name: activeUser.user_metadata?.full_name || activeUser.email?.split('@')[0] || 'User'
                });
            } else {
                try {
                    const { data } = await supabase.auth.getUser();
                    const metaRole = data?.user?.user_metadata?.role;
                    if (metaRole) {
                        setRole(metaRole);
                        setProfile({ role: metaRole });
                    }
                } catch (fallbackErr) {
                    console.error('Fallback profile fetch also failed:', fallbackErr);
                }
            }
        } finally {
            setLoading(false);
        }
    }, []);

    const checkSession = useCallback(async () => {
        setLoading(true);
        try {
            // Try custom standalone token first
            const customToken = localStorage.getItem('ottobon_custom_token');
            let activeSession = null;
            let userObj = null;

            if (customToken) {
                const payload = decodeJWT(customToken);
                if (payload) {
                    const userId = payload.sub || payload.user_id;
                    activeSession = { access_token: customToken };
                    userObj = { 
                        id: userId,
                        email: payload.email,
                        user_metadata: payload.user_metadata || {}
                    };
                    setApiToken(customToken);
                } else if (customToken === 'demo_token') {
                    activeSession = { access_token: 'demo_token' };
                    userObj = { id: 'demo-user', email: 'demo@ottobon.com' };
                    setApiToken('demo_token');
                }
            }

            // Only check Supabase session if no custom token exists
            if (!activeSession) {
                const { data: { session } } = await supabase.auth.getSession();
                activeSession = session;
                userObj = session?.user;
                if (session?.access_token) {
                    setApiToken(session.access_token);
                }
            }

            setSession(activeSession);
            if (userObj) {
                setUser(userObj);
                await Promise.all([
                    fetchProfile(3, userObj),
                    fetchSavedJobs()
                ]);
            } else {
                setLoading(false);
            }
        } catch (err) {
            console.error("Auth session check failed:", err);
            setLoading(false);
        } finally {
            initialised.current = true;
            setLoading(false);
        }
    }, [fetchProfile, fetchSavedJobs]);

    useEffect(() => {
        checkSession();

        // Listen for auth changes (login/logout after initial load)
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setLoading(true);

            // Prioritize custom standalone token first
            const customToken = localStorage.getItem('ottobon_custom_token');
            let activeSession = null;
            let userObj = null;

            if (customToken) {
                const payload = decodeJWT(customToken);
                if (payload) {
                    const userId = payload.sub || payload.user_id;
                    activeSession = { access_token: customToken };
                    userObj = { 
                        id: userId,
                        email: payload.email,
                        user_metadata: payload.user_metadata || {}
                    };
                    setApiToken(customToken);
                } else if (customToken === 'demo_token') {
                    activeSession = { access_token: 'demo_token' };
                    userObj = { id: 'demo-user', email: 'demo@ottobon.com' };
                    setApiToken('demo_token');
                }
            }

            if (!activeSession) {
                activeSession = session;
                userObj = session?.user;
                if (session?.access_token) {
                    setApiToken(session.access_token);
                }
            }

            setSession(activeSession);
            setUser(userObj);

            if (userObj) {
                try {
                    await Promise.all([
                        fetchProfile(3, userObj),
                        fetchSavedJobs()
                    ]);
                } finally {
                    setLoading(false);
                }
            } else {
                // User logged out — clear chat sessions from localStorage
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith('ottobon_chat_session_')) {
                        localStorage.removeItem(key);
                    }
                });
                setRole(null);
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, [checkSession, fetchProfile, fetchSavedJobs]);

    const toggleJobSavedLocal = useCallback((jobId, isSaved) => {
        setSavedJobIds(prev => {
            const next = new Set(prev);
            if (isSaved) next.add(jobId);
            else next.delete(jobId);
            return next;
        });
    }, []);

    const handleAuthSuccess = useCallback(async (token) => {
        const payload = decodeJWT(token);
        const userObj = payload ? { 
            id: payload.sub || payload.user_id,
            email: payload.email,
            user_metadata: payload.user_metadata || {}
        } : (token === 'demo_token' ? { id: 'demo-user', email: 'demo@ottobon.com' } : null);

        setSession({ access_token: token });
        setUser(userObj);

        // Fetch full identity details
        const profileData = await getMyProfile();
        setProfile(profileData);
        setRole(profileData.role);
        await fetchSavedJobs();
        
        return profileData;
    }, [fetchSavedJobs]);

    const login = useCallback(async (email, password) => {
        setLoading(true);
        try {
            const { signIn } = await import('../api/authApi');
            const data = await signIn(email, password);
            
            if (data.access_token) {
                return await handleAuthSuccess(data.access_token);
            }
            throw new Error('Invalid credentials or no token returned');
        } catch (error) {
            console.error('AuthContext Login Error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [handleAuthSuccess]);

    const setAuthToken = useCallback(async (token) => {
        setLoading(true);
        try {
            setApiToken(token);
            return await handleAuthSuccess(token);
        } catch (error) {
            console.error('AuthContext setAuthToken Error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [handleAuthSuccess]);

    const logout = useCallback(async () => {
        await supabase.auth.signOut();
        setApiToken(null);
        localStorage.removeItem('ottobon_custom_token');
        // Clear chat sessions
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('ottobon_chat_session_')) {
                localStorage.removeItem(key);
            }
        });
        setSession(null);
        setUser(null);
        setRole(null);
        setProfile(null);
        setSavedJobIds(new Set());
    }, []);

    const value = useMemo(() => ({
        session,
        user,
        profile,
        role,
        savedJobIds,
        fetchSavedJobs,
        toggleJobSavedLocal,
        login,
        setAuthToken,
        logout,
        loading,
        refreshSession: checkSession,
        isAuthenticated: !!user || !!session?.access_token,
    }), [session, user, profile, role, savedJobIds, loading, checkSession, fetchSavedJobs, toggleJobSavedLocal, login, setAuthToken, logout]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
