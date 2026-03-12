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
        <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-white/90 backdrop-blur-xl border-b border-black">
            <div className="h-full px-8 flex items-center justify-between">
                {/* Logo - Strictly Black/White */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-8 h-8 bg-black rounded-lg grid place-items-center group-hover:scale-110 transition-transform duration-500">
                        <Briefcase size={16} className="text-white" />
                    </div>
                    <span className="font-display font-black text-xl tracking-tighter text-black uppercase">
                        Ottobon<span className="opacity-40">/</span>Jobs
                    </span>
                </Link>

                {/* Center Search - High Contrast Focus */}
                {user && (
                    <div className="hidden md:flex items-center">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                <Search size={14} className="text-black opacity-40 group-focus-within:opacity-100 transition-opacity" />
                            </div>
                            <input
                                type="text"
                                placeholder="QUICK ACTION..."
                                className="pl-10 pr-6 py-2 bg-white border-2 border-transparent border-b-black rounded-none text-[10px] font-black text-black placeholder:text-gray-300 focus:outline-none focus:border-black transition-all duration-500 w-72 uppercase tracking-widest"
                            />
                        </div>
                    </div>
                )}

                {/* User Actions */}
                <div className="flex items-center gap-4">
                    {user ? (
                        <>
                            <Link 
                                to="/profile"
                                className="flex items-center gap-3 bg-white border-2 border-black px-4 py-1.5 rounded-xl shadow-[4px_4px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_#000] transition-all duration-300"
                            >
                                <div className="w-6 h-6 bg-black rounded-full grid place-items-center">
                                    <User size={12} className="text-white" />
                                </div>
                                <div className="hidden md:flex flex-col">
                                    <span className="text-[10px] font-black text-black leading-none uppercase tracking-wider">{user.email?.split('@')[0]}</span>
                                    <span className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">
                                        {role || 'User'}
                                    </span>
                                </div>
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="p-2 text-black hover:bg-black hover:text-white border-2 border-transparent hover:border-black rounded-xl transition-all duration-300"
                                title="Logout"
                            >
                                <LogOut size={16} />
                            </button>
                        </>
                    ) : (
                        <div className="flex gap-4 items-center">
                            <Link to="/login" className="text-[10px] font-black text-black hover:underline uppercase tracking-[0.2em]">
                                Access
                            </Link>
                            <Link to="/register" className="bg-black text-white px-6 py-2 text-[10px] font-black rounded-xl border-2 border-black hover:bg-white hover:text-black transition-all duration-500 uppercase tracking-widest">
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
