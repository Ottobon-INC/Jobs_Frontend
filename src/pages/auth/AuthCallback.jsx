import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase, setToken } from '../../api/client';
import { getMyProfile } from '../../api/usersApi';
import { ROLES } from '../../utils/constants';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const handleCallback = async () => {
            const params = new URLSearchParams(location.search);
            const accessToken = params.get('access_token');
            
            if (accessToken) {
                try {
                    // Manually set token to ensure our API interceptor works
                    // We DO NOT call supabase.auth.setSession here because GoTrue will 
                    // reject our custom FastAPI JWT and log a 403 Forbidden error.
                    setToken(accessToken);

                    // Fetch profile to determine routing
                    const profile = await getMyProfile();
                    
                    if (profile.role === ROLES.ADMIN) {
                        navigate('/admin/tower');
                    } else if (profile.role === ROLES.PROVIDER) {
                        navigate('/provider/listings');
                    } else {
                        navigate('/jobs');
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
