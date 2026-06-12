import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Search, PlusCircle, Briefcase, Bookmark, User, Menu, X, LayoutDashboard, ShieldCheck, BarChart3, BookOpen, Trophy } from 'lucide-react';
import { ROLES } from '../../utils/constants';

const MobileBottomNav = ({ onMenuClick }) => {
    const { role } = useAuth();
    if (!role) return null;

    const navItems = role === ROLES.PROVIDER ? [
        { to: '/provider/listings', label: 'Listings', icon: Briefcase },
        { to: '/provider/create', label: 'Post', icon: PlusCircle },
        { to: '/market-intelligence', label: 'Market', icon: Search },
        { to: '/profile', label: 'Profile', icon: User }
    ] : role === ROLES.ADMIN ? [
        { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { to: '/admin/feedback', label: 'Feedback', icon: BarChart3 },
        { to: '/admin/playbooks', label: 'Playbooks', icon: BookOpen }
    ] : [
        { to: '/jobs', label: 'Jobs', icon: Search },
        { to: '/saved', label: 'Saved', icon: Bookmark },
        { to: '/rewards', label: 'Rewards', icon: Trophy },
        { to: '/profile', label: 'Profile', icon: User }
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-[#313851] text-[#F6F3ED] z-[999] rounded-t-2xl shadow-[0_-10px_40px_rgba(49,56,81,0.2)] pb-[env(safe-area-inset-bottom,0px)] md:hidden">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) => `
                            flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors
                            ${isActive ? 'text-[#FFD700]' : 'text-[#F6F3ED]/40 hover:text-[#F6F3ED]'}
                        `}
                    >
                        <item.icon size={20} />
                        <span className="text-[10px] font-bold">{item.label}</span>
                    </NavLink>
                ))}
                <button
                    onClick={onMenuClick}
                    className="flex flex-col items-center justify-center w-full h-full space-y-1 text-[#F6F3ED]/40 hover:text-[#F6F3ED] transition-colors"
                >
                    <Menu size={20} />
                    <span className="text-[10px] font-bold">Menu</span>
                </button>
            </div>
        </nav>
    );
};

export default MobileBottomNav;
