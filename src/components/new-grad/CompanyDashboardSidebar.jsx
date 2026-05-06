import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
    Info, 
    UserCheck, 
    Zap, 
    Table as TableIcon, 
    BookOpen, 
    ClipboardCheck, 
    Lightbulb,
    DollarSign,
    FileText
} from 'lucide-react';

const CompanyDashboardSidebar = ({ activeSection, setActiveSection, sections }) => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleSectionClick = (section) => {
        if (section.isNav) {
            if (section.id === 'materials') {
                if (isAuthenticated) {
                    navigate('/materials');
                } else {
                    navigate('/register');
                }
            }
            return;
        }
        setActiveSection(section.id);
    };

    return (
        <aside className="hidden lg:block sticky top-24 h-[calc(100vh-8rem)]">
            <div className="bg-white rounded-[2.5rem] p-6 shadow-xl shadow-zinc-900/5 border border-zinc-100 h-full overflow-y-auto custom-scrollbar">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-8 px-4">Navigation</p>
                <nav className="space-y-2">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => handleSectionClick(section)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                                activeSection === section.id
                                    ? 'bg-[#313851] text-white shadow-lg shadow-[#313851]/20'
                                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-[#313851]'
                            }`}
                        >
                            <div className={`p-2 rounded-xl transition-colors ${
                                activeSection === section.id
                                    ? 'bg-white/10'
                                    : 'bg-zinc-50 group-hover:bg-white shadow-sm'
                            }`}>
                                {section.icon}
                            </div>
                            <div className="flex flex-col items-start">
                                <span className="text-xs font-bold tracking-tight">{section.label}</span>
                                {section.id === 'materials' && (
                                    <span className="text-[8px] font-medium opacity-60">Check for materials</span>
                                )}
                            </div>
                            {activeSection === section.id && (
                                <motion.div
                                    layoutId="active-indicator"
                                    className="ml-auto w-1.5 h-1.5 bg-green-400 rounded-full"
                                />
                            )}
                        </button>
                    ))}
                </nav>

                <div className="mt-12 pt-8 border-t border-zinc-50 px-4">
                    <div className="p-4 bg-zinc-900 rounded-2xl">
                        <p className="text-[9px] font-black text-white/40 uppercase tracking-widest mb-2">Pro Tip</p>
                        <p className="text-[10px] text-white/80 leading-relaxed font-medium">
                            Complete all prep modules for a 40% higher success rate.
                        </p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default CompanyDashboardSidebar;
