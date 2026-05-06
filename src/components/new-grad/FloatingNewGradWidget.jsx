import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

/**
 * FloatingNewGradWidget - A quick-access FAB for the New Grad Playbook.
 * @param {boolean} isAuthenticated - Render gate based on auth status.
 */
export const FloatingNewGradWidget = ({ isAuthenticated }) => {
    const navigate = useNavigate();

    // 1. Authentication Gate
    if (!isAuthenticated) return null;

    const handleClick = () => {
        // 5. Placeholder onClick
        console.log("Widget clicked");
        navigate('/new-grad');
    };

    return (
        /* 2. Layout & Positioning */
        <div className="fixed right-6 bottom-24 z-50 flex items-center justify-end">
            <div className="relative group flex items-center">
                
                {/* 4. Hover Interaction: Revealed Text Label */}
                <div className="absolute right-full mr-4 pointer-events-none">
                    <div className="
                        bg-[#313851] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10
                        flex items-center gap-2.5 whitespace-nowrap
                        opacity-0 scale-90 translate-x-4
                        group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0
                        transition-all duration-300 ease-out
                    ">
                        <Sparkles className="text-amber-400" size={16} />
                        <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-tight">New Grad</span>
                            <span className="text-xs font-bold text-white/90">Insider Playbook</span>
                        </div>
                    </div>
                </div>

                {/* 3. Visual Design: Main Action Button */}
                <motion.button
                    onClick={handleClick}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Open New Grad Insider Playbook"
                    className="
                        relative w-14 h-14 md:w-16 md:h-16 
                        bg-gradient-to-br from-indigo-500 to-purple-600 
                        rounded-full flex items-center justify-center 
                        text-white shadow-[0_12px_24px_-8px_rgba(79,70,229,0.6)]
                        border border-white/20
                        z-10
                    "
                >
                    {/* Pulsing Outer Glow */}
                    <div className="absolute inset-0 rounded-full bg-indigo-400 blur-md opacity-20 group-hover:opacity-40 transition-opacity animate-pulse" />
                    
                    <GraduationCap className="w-7 h-7 md:w-8 md:h-8 relative z-20" />
                </motion.button>

                {/* Extra modern touch: rotating border on hover */}
                <div className="absolute inset-0 rounded-full border-2 border-white/10 group-hover:scale-125 group-hover:opacity-0 transition-all duration-500 pointer-events-none" />
            </div>
        </div>
    );
};
