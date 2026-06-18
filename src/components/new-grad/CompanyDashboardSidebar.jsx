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
        <aside className="sticky top-[52px] lg:top-24 z-30 lg:h-[calc(100vh-8rem)] mb-6 lg:mb-0">
            <div className="bg-white rounded-[2rem] lg:rounded-[2.5rem] p-4 lg:p-6 shadow-xl shadow-zinc-900/5 border border-zinc-100 flex lg:flex-col lg:h-full overflow-x-auto lg:overflow-y-auto no-scrollbar lg:custom-scrollbar gap-4 lg:gap-0">
                <p className="hidden lg:block text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-8 px-4">Navigation</p>
                <nav className="flex lg:flex-col items-center lg:items-stretch gap-2 lg:gap-2 min-w-max lg:min-w-0">
                    {sections.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => handleSectionClick(section)}
                            className={`flex lg:w-full items-center gap-4 px-5 lg:px-4 py-4 lg:py-3.5 rounded-[1.25rem] lg:rounded-2xl transition-all duration-300 group whitespace-nowrap ${
                                activeSection === section.id
                                    ? 'bg-[#D45B34] text-white shadow-xl shadow-[#D45B34]/20'
                                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-[#D45B34]'
                            }`}
                        >
                            <div className={`p-2.5 rounded-[1rem] transition-colors ${
                                activeSection === section.id
                                    ? 'bg-white/10'
                                    : 'bg-zinc-50 group-hover:bg-white shadow-sm'
                            }`}>
                                {section.icon}
                            </div>
                            <div className="flex flex-col items-start pr-2">
                                <span className="text-sm lg:text-xs font-bold tracking-tight">{section.label}</span>
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

                <div className="hidden lg:block mt-12 pt-8 border-t border-zinc-50 px-4">
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
