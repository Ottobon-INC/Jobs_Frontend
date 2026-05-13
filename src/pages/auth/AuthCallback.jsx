import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { setToken } from '../../api/client';
import { getMyProfile } from '../../api/usersApi';
import { ROLES } from '../../utils/constants';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { refreshSession } = useAuth();

    useEffect(() => {
        const handleCallback = async () => {
            const searchParams = new URLSearchParams(location.search);
            const hashParams = new URLSearchParams(location.hash.replace('#', '?'));
            
            const accessToken = searchParams.get('access_token') || hashParams.get('access_token');
            
            if (accessToken) {
                try {
                    setToken(accessToken);
                    
                    // Force the AuthContext to recognize the new session
                    await refreshSession();
                    
                    const profile = await getMyProfile();
                    
                    if (profile.role === ROLES.ADMIN) {
                        navigate('/admin/tower');
                    } else if (profile.role === ROLES.PROVIDER) {
                        navigate('/provider/listings');
                    } else {
                        // Redirect to profile page so user can fill in additional details
                        navigate('/profile');
                    }
                } catch (error) {
                    console.error("Failed to set session or fetch profile:", error);
                    navigate('/login');
                }
            } else {
                console.error("No access token found in URL");
                navigate('/login');
            }
        };

        handleCallback();
    }, [location, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#FBFBFB]">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Authenticating...</h2>
                <p className="text-sm font-medium text-zinc-400 mt-2">Please wait while we log you in.</p>
            </div>
        </div>
    );
};

export default AuthCallback;
