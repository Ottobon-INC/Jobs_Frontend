import { createContext, useState, useEffect, useRef, useMemo, useContext, useCallback } from 'react';
import { supabase } from '../api/client';
import { getMyProfile } from '../api/usersApi';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [session, setSession] = useState(null);
    const [profile, setProfile] = useState(null);
    const [role, setRole] = useState(null);
    const [savedJobIds, setSavedJobIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const initialised = useRef(false);

    const fetchSavedJobs = useCallback(async () => {
        try {
            const { getSavedJobs } = await import('../api/jobsApi');
            const saved = await getSavedJobs();
            setSavedJobIds(new Set(saved.map(j => j.id)));
        } catch (error) {
            console.error('Failed to fetch saved job IDs:', error);
        }
    }, []);

    const fetchProfile = useCallback(async (retries = 3) => {
        try {
            const data = await getMyProfile();
            setProfile(data);
            setRole(data.role);
            setUser({ id: data.id, email: data.email });
        } catch (error) {
            const status = error?.response?.status;
            if (retries > 0 && (status === 503 || status === 404)) {
                const delay = status === 404 ? 1500 : 1000;
                await new Promise(r => setTimeout(r, delay));
                return fetchProfile(retries - 1);
            }
            console.error('Failed to fetch user profile:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const checkSession = useCallback(async () => {
        try {
            const token = localStorage.getItem('ottobon_custom_token');
            if (token) {
                setSession({ access_token: token });
                await Promise.all([
                    fetchProfile(),
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
        }
    }, [fetchProfile, fetchSavedJobs]);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const toggleJobSavedLocal = (jobId, isSaved) => {
        setSavedJobIds(prev => {
            const next = new Set(prev);
            if (isSaved) next.add(jobId);
            else next.delete(jobId);
            return next;
        });
    };

    const logout = async () => {
        const { signOut } = await import('../api/authApi');
        await signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
        setRole(null);
    };

    const value = useMemo(() => ({
        session,
        user,
        profile,
        role,
        savedJobIds,
        fetchSavedJobs,
        toggleJobSavedLocal,
        loading,
        logout,
        refreshSession: checkSession,
        isAuthenticated: !!session?.access_token,
    }), [session, user, profile, role, savedJobIds, loading, checkSession, fetchSavedJobs]);

    return (
        <AuthContext.Provider value={value}>
            {loading && (
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: '100vh', fontSize: '1.2rem', color: '#86868b'
                }}>
                    Loading...
                </div>
            )}
            {!loading && children}
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
