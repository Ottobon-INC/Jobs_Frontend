import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signUp } from '../../api/authApi';
import { Briefcase } from 'lucide-react';
import { ROLES } from '../../utils/constants';
import { motion } from 'framer-motion';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState(ROLES.SEEKER);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        if (password !== confirmPassword) {
            setError('PASSWORDS_MATCH_FAILURE');
            setLoading(false);
            return;
        }

        try {
            await signUp(email, password, role, fullName, phone, location);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.detail || 'REGISTRATION_FAILURE');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-white">
            <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-xl bg-white rounded-[40px] border-4 border-black p-14 shadow-[20px_20px_0px_#000]"
            >
                <div className="text-center mb-14">
                    <div className="w-20 h-20 bg-black rounded-3xl grid place-items-center mx-auto mb-8 shadow-2xl">
                        <Briefcase size={32} className="text-white" />
                    </div>
                    <h1 className="font-display text-4xl font-black text-black uppercase tracking-tighter">Create Account</h1>
                    <p className="text-[10px] font-black text-black/40 mt-3 uppercase tracking-[0.4em]">Join the Ottobon Network</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Role Selector - High Contrast Monochrome */}
                    <div>
                        <label className="block text-[10px] font-black text-black uppercase tracking-[0.2em] mb-4 ml-1">I am a</label>
                        <div className="grid grid-cols-2 gap-3 bg-gray-50 border-2 border-black p-2 rounded-2xl">
                            {[ROLES.SEEKER, ROLES.PROVIDER].map(r => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r)}
                                    className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${role === r
                                        ? 'bg-black text-white shadow-xl translate-y-[-2px]'
                                        : 'text-black hover:bg-black/5'
                                        }`}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-black uppercase tracking-[0.2em] mb-3 ml-1">Full Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                                className="w-full px-6 py-4 bg-white border-2 border-black rounded-2xl text-black font-bold text-sm placeholder:text-gray-300 focus:outline-none focus:ring-8 focus:ring-black/5 transition-all duration-300"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-black uppercase tracking-[0.2em] mb-3 ml-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-6 py-4 bg-white border-2 border-black rounded-2xl text-black font-bold text-sm placeholder:text-gray-300 focus:outline-none focus:ring-8 focus:ring-black/5 transition-all duration-300"
                                placeholder="you@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-black uppercase tracking-[0.2em] mb-3 ml-1">Phone Number</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                className="w-full px-6 py-4 bg-white border-2 border-black rounded-2xl text-black font-bold text-sm placeholder:text-gray-300 focus:outline-none focus:ring-8 focus:ring-black/5 transition-all duration-300"
                                placeholder="+1 234 567 890"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-black uppercase tracking-[0.2em] mb-3 ml-1">Location</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                required
                                className="w-full px-6 py-4 bg-white border-2 border-black rounded-2xl text-black font-bold text-sm placeholder:text-gray-300 focus:outline-none focus:ring-8 focus:ring-black/5 transition-all duration-300"
                                placeholder="City, Country"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-black uppercase tracking-[0.2em] mb-3 ml-1">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full px-6 py-4 bg-white border-2 border-black rounded-2xl text-black font-bold text-sm placeholder:text-gray-300 focus:outline-none focus:ring-8 focus:ring-black/5 transition-all duration-300"
                                placeholder="8+ characters"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-black uppercase tracking-[0.2em] mb-3 ml-1">Confirm Password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                className="w-full px-6 py-4 bg-white border-2 border-black rounded-2xl text-black font-bold text-sm placeholder:text-gray-300 focus:outline-none focus:ring-8 focus:ring-black/5 transition-all duration-300"
                                placeholder="Repeat password"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-[10px] font-black text-black bg-white border-4 border-black p-5 rounded-2xl shadow-lg uppercase tracking-widest text-center italic">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-gray-800 active:scale-[0.98] transition-all duration-500 disabled:opacity-30 shadow-2xl mt-4"
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>

                <div className="flex flex-col items-center gap-4 mt-14 pb-2">
                    <p className="text-[9px] font-black text-black/30 uppercase tracking-[0.2em]">
                        Already have an account?
                    </p>
                    <Link to="/login" className="text-[10px] font-black text-black uppercase tracking-widest border-b-2 border-black hover:pb-1 transition-all">
                        Sign In
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
