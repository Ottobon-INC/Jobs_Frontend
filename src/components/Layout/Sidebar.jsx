import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Briefcase, User, MessageSquare, LayoutDashboard, PlusCircle, Search, Upload, Newspaper, TrendingUp, BookOpen, Radio, Bookmark } from 'lucide-react';
import { ROLES } from '../../utils/constants';
import { motion } from 'framer-motion';

const Sidebar = () => {
    const { role } = useAuth();
    if (!role) return null;

    const links = [
        { to: '/jobs', label: 'Job Board', icon: Search, roles: [ROLES.SEEKER, ROLES.PROVIDER, ROLES.ADMIN], category: 'Jobs' },
        { to: '/saved', label: 'Saved Jobs', icon: Bookmark, roles: [ROLES.SEEKER], category: 'Jobs' },
        { to: '/profile', label: 'My Profile', icon: User, roles: [ROLES.SEEKER], category: 'Jobs' },
        { to: '/courses', label: 'Skills & Courses', icon: BookOpen, roles: [ROLES.SEEKER], category: 'Resources' },
        { to: '/mock-interview', label: 'Interview Prep', icon: Radio, roles: [ROLES.SEEKER], category: 'Resources' },
        { to: '/chat', label: 'Messages', icon: MessageSquare, roles: [ROLES.SEEKER], category: 'Resources' },
        { to: '/provider/create', label: 'Post a Job', icon: PlusCircle, roles: [ROLES.PROVIDER], category: 'Recruitment' },
        { to: '/provider/listings', label: 'My Listings', icon: Briefcase, roles: [ROLES.PROVIDER], category: 'Recruitment' },
        { to: '/market-intelligence', label: 'Market Analytics', icon: TrendingUp, roles: [ROLES.PROVIDER, ROLES.SEEKER], category: 'Insights' },
        { to: '/blogs', label: 'Career Blog', icon: Newspaper, roles: [ROLES.SEEKER, ROLES.PROVIDER, ROLES.ADMIN], category: 'Insights' },
        { to: '/admin/tower', label: 'Admin Dashboard', icon: LayoutDashboard, roles: [ROLES.ADMIN], category: 'Administrative' },
        { to: '/admin/ingest', label: 'Data Management', icon: Upload, roles: [ROLES.ADMIN], category: 'Administrative' },
    ];

    const filteredLinks = links.filter(link => link.roles.includes(role));
    if (filteredLinks.length === 0) return null;

    // Dynamically group links by their category
    const groupedLinks = filteredLinks.reduce((acc, link) => {
        if (!acc[link.category]) acc[link.category] = [];
        acc[link.category].push(link);
        return acc;
    }, {});

    return (
        <aside
            className="fixed left-8 top-32 bottom-8 w-64 z-40 overflow-y-auto p-8 hidden md:flex flex-col gap-10 rounded-[32px] border-none shadow-2xl shadow-black/5"
            style={{ backgroundColor: 'var(--color-primary)' }}
        >


            <div className="flex flex-col gap-6">
                {Object.entries(groupedLinks).map(([category, items], cIdx) => (
                    <div key={category} className="flex flex-col gap-1">
                        <h4 className="text-[9px] font-black tracking-[0.2em] uppercase px-4 mb-2" style={{ color: 'var(--color-accent)' }}>
                            {category}
                        </h4>
                        <div className="flex flex-col gap-1">
                            {items.map((link, i) => (
                                <motion.div
                                    key={link.to}
                                    initial={{ x: -10, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{
                                        duration: 0.5,
                                        ease: [0.16, 1, 0.3, 1],
                                        delay: (cIdx * 0.1) + (i * 0.03)
                                    }}
                                >
                                    <NavLink
                                        to={link.to}
                                        className={({ isActive }) => `
                                            sidebar-nav-link flex items-center justify-between px-5 py-4 rounded-2xl transition-all duration-500 text-[10px] font-black uppercase tracking-widest
                                            ${isActive
                                                ? 'is-active shadow-2xl shadow-black/20'
                                                : ''
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
                    </div>
                ))}
            </div>

            <div className="mt-auto">
                <div className="p-6 rounded-[32px] border flex items-center justify-between group cursor-default" style={{ backgroundColor: 'transparent', borderColor: 'var(--color-accent)' }}>
                    <div className="flex items-center gap-4">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }}></div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--color-background-soft)' }}>Active</span>
                    </div>
                    <div className="text-[8px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ color: 'var(--color-accent)' }}>SIG_INT_04</div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
