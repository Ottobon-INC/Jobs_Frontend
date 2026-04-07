import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User, Briefcase, Search } from 'lucide-react';
import { supabase } from '../../api/client';

const Navbar = () => {
    const { user, role } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <nav className="fixed top-4 left-6 right-6 z-50 h-16 bg-white/80 backdrop-blur-xl border border-white/40 rounded-[28px] shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <div className="h-full px-6 flex items-center justify-between">
                {/* Logo - Refined Branding */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 bg-zinc-900 rounded-xl grid place-items-center group-hover:scale-105 transition-transform duration-500 shadow-lg shadow-zinc-900/10">
                        <Briefcase size={18} className="text-white" />
                    </div>
                    <span className="font-sans font-bold text-lg tracking-tight text-zinc-900">
                        Ottobon<span className="text-zinc-300 font-light mx-1">|</span>Jobs
                    </span>
                </Link>

                {/* Center Search - Minimalist Pill */}
                {user && (
                    <div className="hidden md:flex items-center">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search size={14} className="text-zinc-400 group-focus-within:text-zinc-900 transition-colors" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search the network..."
                                className="pl-11 pr-6 py-2.5 bg-zinc-50 border border-zinc-100 rounded-full text-xs font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:bg-white transition-all duration-300 w-80"
                            />
                        </div>
                    </div>
                )}

                {/* User Actions */}
                <div className="flex items-center gap-2">
                    {user ? (
                        <>
                            <Link 
                                to="/profile"
                                className="flex items-center gap-3 bg-white border border-zinc-100 pl-1.5 pr-4 py-1.5 rounded-full hover:bg-zinc-50 transition-all duration-300 shadow-sm hover:shadow-md"
                            >
                                <div className="w-7 h-7 bg-zinc-100 rounded-full grid place-items-center">
                                    <User size={14} className="text-zinc-900" />
                                </div>
                                <div className="hidden lg:flex flex-col">
                                    <span className="text-[11px] font-bold text-zinc-900 leading-none">
                                        {user.email?.split('@')[0]}
                                    </span>
                                    <span className="text-[9px] text-zinc-400 font-medium uppercase tracking-wider">
                                        {role || 'User'}
                                    </span>
                                </div>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="w-10 h-10 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-full transition-all duration-300"
                                title="Logout"
                            >
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-2 items-center">
                            <Link to="/login" className="px-5 py-2.5 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors">
                                Access
                            </Link>
                            <Link to="/register" className="bg-zinc-900 text-white px-6 py-2.5 text-xs font-bold rounded-full hover:bg-zinc-800 transition-all duration-300 shadow-lg shadow-zinc-900/10">
                                Join Network
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
