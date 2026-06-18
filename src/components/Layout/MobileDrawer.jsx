import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../context/NotificationContext';
import { 
    Search, Bookmark, User, BookOpen, Radio, MessageSquare, TrendingUp, Newspaper, 
    LayoutDashboard, LogOut, Briefcase, PlusCircle, ClipboardList, Upload, BarChart3, 
    Heart, Calendar, FileText, Target, ShieldCheck, X, Trophy, Users, Award
} from 'lucide-react';
import { ROLES } from '../../utils/constants';

const MobileDrawer = ({ isOpen, onClose }) => {
    const { role, logout } = useAuth();
    const { unreadCount } = useNotifications();
    const navigate = useNavigate();

    if (!role) return null;

    const handleLogout = async () => {
        await logout();
        onClose();
        navigate('/login');
    };

    const links = [
        { to: '/jobs', label: 'Job Board', icon: Search, roles: [ROLES.SEEKER, ROLES.PROVIDER, ROLES.ADMIN], category: 'Jobs' },
        { to: '/jobs-ai', label: 'Jobs AI', icon: Target, roles: [ROLES.SEEKER], category: 'Jobs' },
        { to: '/saved', label: 'Saved Jobs', icon: Bookmark, roles: [ROLES.SEEKER], category: 'Jobs' },
        { to: '/profile-score', label: 'Profile Rating', icon: Award, roles: [ROLES.SEEKER], category: 'Jobs' },
        { to: '/profile', label: 'My Profile', icon: User, roles: [ROLES.SEEKER], category: 'Jobs' },
        { to: '/courses', label: 'Skills & Courses', icon: BookOpen, roles: [ROLES.SEEKER], category: 'Resources' },
        { to: '/new-grad/timeline', label: 'Hiring Timeline', icon: Calendar, roles: [ROLES.SEEKER], category: 'Resources' },
        { to: '/mock-interview', label: 'Interview Prep', icon: Radio, roles: [ROLES.SEEKER], category: 'Resources' },
        { to: '/materials', label: 'Interview Materials', icon: FileText, roles: [ROLES.SEEKER], category: 'Resources' },
        { to: '/interview-reviews', label: 'Interview Reviews', icon: ClipboardList, roles: [ROLES.SEEKER], category: 'Resources' },
        { to: '/my-human-mock-interviews', label: '1-on-1 Sessions', icon: Users, roles: [ROLES.SEEKER], category: 'Resources' },
        { to: '/chat', label: 'Messages', icon: MessageSquare, roles: [ROLES.SEEKER], category: 'Resources' },
        { to: '/rewards', label: 'Rewards', icon: Trophy, roles: [ROLES.SEEKER], category: 'Resources' },
        { to: '/feedback', label: 'Share Feedback', icon: Heart, roles: [ROLES.SEEKER], category: 'Resources' },
        { to: '/provider/create', label: 'Post a Job', icon: PlusCircle, roles: [ROLES.PROVIDER], category: 'Recruitment' },
        { to: '/provider/listings', label: 'My Listings', icon: Briefcase, roles: [ROLES.PROVIDER], category: 'Recruitment' },
        { to: '/market-intelligence', label: 'Market Analytics', icon: TrendingUp, roles: [ROLES.PROVIDER, ROLES.SEEKER], category: 'Insights' },
        { to: '/blogs', label: 'Career Blog', icon: Newspaper, roles: [ROLES.SEEKER, ROLES.PROVIDER, ROLES.ADMIN], category: 'Insights' },
        { to: '/admin/dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, roles: [ROLES.ADMIN], category: 'Administrative' },
        { to: '/admin/tower', label: 'Control Tower', icon: Radio, roles: [ROLES.ADMIN], category: 'Administrative' },
        { to: '/admin/interview-reviews', label: 'Interview Reviews', icon: ClipboardList, roles: [ROLES.ADMIN], category: 'Administrative' },
        { to: '/admin/feedback', label: 'User Feedback', icon: BarChart3, roles: [ROLES.ADMIN], category: 'Administrative' },
        { to: '/admin/ingest', label: 'Data Management', icon: Upload, roles: [ROLES.ADMIN], category: 'Administrative' },
        { to: '/admin/playbooks', label: 'Manage Playbooks', icon: BookOpen, roles: [ROLES.ADMIN], category: 'Administrative' },
        { to: '/admin/add-data', label: 'Add Data', icon: PlusCircle, roles: [ROLES.ADMIN], category: 'Administrative' },
        { to: '/admin/human-mock-interviews', label: 'Human Mock Intv', icon: Users, roles: [ROLES.ADMIN], category: 'Administrative' },
    ];

    const normalizedRole = role?.toLowerCase();
    const filteredLinks = links.filter(link => {
        if (!link.roles) return true;
        return link.roles.map(r => r.toLowerCase()).includes(normalizedRole);
    });
    
    const groupedLinks = filteredLinks.reduce((acc, link) => {
        if (!acc[link.category]) acc[link.category] = [];
        acc[link.category].push(link);
        return acc;
    }, {});

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[1000] md:hidden">
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            
            {/* Drawer */}
            <div className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-[#222222] text-[#F4F1EA] shadow-2xl flex flex-col pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] rounded-l-2xl animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between p-4 border-b border-[#1C1A17]/10">
                    <span className="font-bold text-lg tracking-tight flex items-center text-[#F4F1EA]">
                        Ottobon<span className="text-zinc-500 font-light mx-1">|</span>Menu
                    </span>
                    <button onClick={onClose} className="p-2 bg-zinc-800 rounded-full text-zinc-300 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                    {Object.entries(groupedLinks).map(([category, items]) => (
                        <div key={category}>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#F4F1EA]/40 mb-3 ml-1">{category}</h3>
                            <div className="space-y-1">
                                {items.map((link) => (
                                    <NavLink
                                        key={link.to}
                                        to={link.to}
                                        onClick={onClose}
                                        className={({ isActive }) => `
                                            flex items-center gap-3 p-3 rounded-xl transition-all
                                            ${isActive ? 'bg-[#D45B34] text-white font-bold' : 'text-[#1C1A17]/70 hover:bg-[#D45B34]/10 hover:text-white'}
                                        `}
                                    >
                                        <link.icon size={20} />
                                        <span className="text-sm">{link.label}</span>
                                        {link.to.includes('interview-reviews') && unreadCount > 0 && (
                                            <span className="ml-auto px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full font-bold shadow-md shadow-red-500/20">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-zinc-700">
                    <button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 p-3 w-full bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30 transition-colors"
                    >
                        <LogOut size={20} />
                        <span className="font-bold text-sm">Logout</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MobileDrawer;
