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
        { to: '/blogs', label: 'Blogs', icon: Newspaper, roles: [ROLES.SEEKER, ROLES.PROVIDER, ROLES.ADMIN] },
        { to: '/admin/tower', label: 'Command', icon: LayoutDashboard, roles: [ROLES.ADMIN] },
        { to: '/admin/ingest', label: 'Ingestion', icon: Upload, roles: [ROLES.ADMIN] },
    ];

    const filteredLinks = links.filter(link => link.roles.includes(role));
    if (filteredLinks.length === 0) return null;

    return (
        <aside className="fixed left-6 top-24 bottom-6 w-56 bg-white/80 backdrop-blur-xl border border-white/40 z-40 overflow-y-auto p-4 hidden md:flex flex-col gap-6 rounded-[32px] shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <div className="pb-4 border-b border-zinc-100 mb-2 flex items-center justify-between px-2">
                <p className="text-[10px] font-bold text-zinc-400 tracking-[0.2em] uppercase">
                    Network
                </p>
                <div className="w-1.5 h-1.5 bg-zinc-900 rounded-full animate-pulse" />
            </div>

            <div className="flex flex-col gap-1">
                {filteredLinks.map((link, i) => (
                    <motion.div
                        key={link.to}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{
                            duration: 0.5,
                            ease: [0.16, 1, 0.3, 1],
                            delay: i * 0.03
                        }}
                    >
                        <NavLink
                            to={link.to}
                            className={({ isActive }) => `
                                flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 text-[11px] font-medium tracking-tight
                                ${isActive
                                    ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/10'
                                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                                }
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <div className="flex items-center gap-3">
                                        <link.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                        <span className={isActive ? 'font-semibold' : ''}>{link.label}</span>
                                    </div>
                                </>
                            )}
                        </NavLink>
                    </motion.div>
                ))}
            </div>

            <div className="mt-auto">
                <div className="bg-zinc-50 p-4 rounded-3xl border border-zinc-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                        <span className="text-[10px] font-semibold text-zinc-900 uppercase tracking-wider">Live</span>
                    </div>
                    <div className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">SIG_INT_04</div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
