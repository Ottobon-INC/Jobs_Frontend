import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn, initiateGoogleLogin } from '../../api/authApi';
import { getMyProfile } from '../../api/usersApi';
import { ROLES } from '../../utils/constants';
import { Briefcase, Eye, EyeOff, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../api/client';

const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleGoogleLogin = () => {
        initiateGoogleLogin();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await signIn(email, password);
            const profile = await getMyProfile();
            
            if (profile.role === ROLES.ADMIN) {
                navigate('/admin/tower');
            } else if (profile.role === ROLES.PROVIDER) {
                navigate('/provider/listings');
            } else {
                navigate('/jobs');
            }
        } catch (err) {
            setError(err.message || 'Authentication failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#FBFBFB]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md bg-white card border border-zinc-100 p-8 shadow-xl shadow-zinc-900/5"
            >
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-zinc-50 border border-zinc-100 card grid place-items-center mx-auto mb-4 shadow-sm">
                        <Briefcase size={28} className="text-zinc-400" />
                    </div>
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-zinc-50 text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-4 border border-zinc-100">
                        <Sparkles size={12} className="text-zinc-400" />
                        Network Access
                    </div>
                    <h1 className="text-3xl font-sans font-bold text-zinc-900 tracking-tight">Sign In</h1>
                    <p className="text-sm font-medium text-zinc-400 mt-2 tracking-wide leading-relaxed">Continue to Ottobon Market</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Email Node</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-5 py-3 bg-zinc-50/50 border border-zinc-100 rounded-2xl text-zinc-900 font-semibold text-sm placeholder:text-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all duration-300"
                            placeholder="you@example.com"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 ml-1">Password Access</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-5 py-3 pr-14 bg-zinc-50/50 border border-zinc-100 rounded-2xl text-zinc-900 font-semibold text-sm placeholder:text-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all duration-300"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-300 hover:text-zinc-900 transition-colors p-1"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-xs font-bold text-rose-500 bg-rose-50/50 border border-rose-100 px-5 py-3 rounded-xl text-center"
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-zinc-900 text-white py-3.5 rounded-2xl font-bold text-sm tracking-wide hover:bg-zinc-800 active:scale-[0.98] transition-all duration-300 disabled:opacity-30 shadow-lg shadow-zinc-900/10 mt-2"
                    >
                        {loading ? 'Authenticating...' : 'Establish Connection'}
                    </button>
                </form>

                <div className="flex items-center gap-4 mt-6">
                    <div className="flex-1 border-t border-zinc-100"></div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">OR</span>
                    <div className="flex-1 border-t border-zinc-100"></div>
                </div>

                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full mt-6 bg-zinc-50 border border-zinc-200 text-zinc-700 py-3.5 rounded-2xl font-bold text-[13px] tracking-wide hover:bg-zinc-100 hover:border-zinc-300 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Continue with Google
                </button>

                <div className="flex flex-col items-center gap-3 mt-8 pb-2">
                    <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                        NEW HERE ?
                    </p>
                    <Link to="/register" className="text-base font-bold text-zinc-900 border-b-2 border-zinc-900 hover:pb-1 transition-all tracking-widest uppercase">
                        Sign Up
                    </Link>
                </div>

                <div className="mt-4 pt-4 border-t border-zinc-50 flex justify-center">
                    <Link to="/admin/login" className="text-[9px] font-bold text-zinc-200 hover:text-zinc-400 transition-colors uppercase tracking-[0.2em]">
                        Administrative Portal
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;

