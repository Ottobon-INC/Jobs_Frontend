import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Briefcase, User, MessageSquare, LayoutDashboard, PlusCircle, Search, Upload, Newspaper, TrendingUp, BookOpen, Radio } from 'lucide-react';
import { ROLES } from '../../utils/constants';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const { role } = useAuth();
    if (!role) return null;

    const links = [
        { to: '/jobs', label: 'Feed', icon: Search, roles: [ROLES.SEEKER, ROLES.PROVIDER, ROLES.ADMIN] },
        { to: '/profile', label: 'Identity', icon: User, roles: [ROLES.SEEKER] },
        { to: '/courses', label: 'Courses', icon: BookOpen, roles: [ROLES.SEEKER] },
        { to: '/mock-interview', label: 'Mock Interview', icon: Radio, roles: [ROLES.SEEKER] },
        { to: '/chat', label: 'Direct', icon: MessageSquare, roles: [ROLES.SEEKER] },
        { to: '/provider/create', label: 'Publish', icon: PlusCircle, roles: [ROLES.PROVIDER] },
        { to: '/provider/listings', label: 'Registry', icon: Briefcase, roles: [ROLES.PROVIDER] },
        { to: '/market-intelligence', label: 'Analytics', icon: TrendingUp, roles: [ROLES.PROVIDER, ROLES.SEEKER] },
        { to: '/blogs', label: 'Intelligence', icon: Newspaper, roles: [ROLES.SEEKER, ROLES.PROVIDER, ROLES.ADMIN] },
        { to: '/admin/tower', label: 'Command', icon: LayoutDashboard, roles: [ROLES.ADMIN] },
        { to: '/admin/ingest', label: 'Ingestion', icon: Upload, roles: [ROLES.ADMIN] },
    ];

    const filteredLinks = links.filter(link => link.roles.includes(role));
    if (filteredLinks.length === 0) return null;

    return (
        <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r-2 border-black z-40 overflow-y-auto p-6 hidden md:flex flex-col gap-6">
            <div className="pb-4 border-b-2 border-black mb-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-black animate-pulse" />
                <p className="text-[10px] font-black text-black tracking-[0.3em] uppercase">
                    Terminal
                </p>
            </div>

            <div className="flex flex-col gap-1.5">
                {filteredLinks.map((link, i) => (
                    <motion.div
                        key={link.to}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                            duration: 0.4,
                            ease: [0.16, 1, 0.3, 1],
                            delay: i * 0.04
                        }}
                    >
                        <NavLink
                            to={link.to}
                            className={({ isActive }) => `
                                flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-500 text-[10px] font-black uppercase tracking-[0.15em]
                                ${isActive
                                    ? 'bg-black text-white shadow-xl shadow-black/20 translate-x-1'
                                    : 'text-black border-2 border-transparent hover:border-black hover:bg-gray-50'
                                }
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <div className="flex items-center gap-3">
                                        <link.icon size={14} />
                                        <span>{link.label}</span>
                                    </div>
                                    {/* Minimal Indicator */}
                                    <div className={`w-1 h-4 bg-white opacity-20 rounded-full transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                                </>
                            )}
                        </NavLink>
                    </motion.div>
                ))}
            </div>

            <div className="mt-auto pt-6 border-t-2 border-black">
                <div className="bg-white p-5 border-2 border-black rounded-2xl shadow-[6px_6px_0px_#000]">
                    <p className="text-[9px] font-black text-black mb-2 uppercase tracking-[0.2em] opacity-40">
                        Signal
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-black rounded-full animate-ping opacity-20 absolute"></div>
                        <div className="w-3 h-3 bg-black rounded-full relative"></div>
                        <span className="text-[11px] font-black text-black uppercase tracking-widest">Active</span>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
