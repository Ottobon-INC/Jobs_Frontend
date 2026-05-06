import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Layers, 
    DollarSign, 
    BookOpen, 
    Sparkles, 
    ChevronRight, 
    CheckCircle2, 
    AlertCircle,
    Calendar,
    ArrowRight,
    TrendingUp,
    CalendarDays,
    MapPin,
    ShieldCheck,
    Play
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const CompanyDetailContent = ({ company, activeSection }) => {
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

    const handleMockInterviewClick = () => {
        if (isAuthenticated) {
            navigate('/mock-interview');
        } else {
            navigate('/register');
        }
    };
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'overview': {
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-12">
                        {/* Featured About Card */}
                        <div className="bg-white rounded-[2.5rem] border border-zinc-100 p-4 md:p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                            <div className="w-full md:w-1/2 aspect-video rounded-[2rem] overflow-hidden relative group">
                                <img 
                                    src={company.coverImage || "/tech_corp_office.png"} 
                                    alt={company.name} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute bottom-6 left-6 bg-zinc-900 text-white p-4 rounded-3xl flex items-center gap-4 shadow-2xl">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                                        <CalendarDays size={20} className="text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Exam Date</p>
                                        <p className="text-xs font-bold tracking-tight">TBA *</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex-1 space-y-4">
                                <h3 className="text-3xl font-bold text-[#313851]">About {company.name} {new Date().getFullYear()}</h3>
                                <p className="text-lg text-zinc-500 leading-relaxed font-medium">
                                    Generally, {company.name} conducts the {company.roles?.[0] || 'recruitment'} process once a year. 
                                    {company.name} is a global leader in {company.industry}. Headquartered in {company.hq}, they have a significant presence in {company?.locations?.slice(0, 3)?.join(', ')} and other major hubs.
                                </p>
                                <div className="flex items-center gap-2 text-zinc-400 text-xs font-bold uppercase tracking-widest">
                                    <ShieldCheck size={14} className="text-green-500" />
                                    Verified Selection Strategy
                                </div>
                                <div className="pt-4 border-t border-zinc-100">
                                    <p className="text-xs text-zinc-400 font-semibold italic">
                                        Insights on interview rounds, compensation, and prep strategies are sourced directly from candidates who’ve successfully secured campus placements at {company.name}.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                            <div className="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 flex items-center gap-6 group hover:bg-white transition-all shadow-sm">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#313851] shadow-sm group-hover:bg-[#313851] group-hover:text-white transition-colors">
                                    <MapPin size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">HQ & Locations</p>
                                    <p className="text-sm font-bold text-[#313851]">{company.hq} • {company?.locations?.length} Cities</p>
                                </div>
                            </div>
                            <div className="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100 flex items-center gap-6 group hover:bg-white transition-all shadow-sm">
                                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-[#313851] shadow-sm group-hover:bg-[#313851] group-hover:text-white transition-colors">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Hiring Frequency</p>
                                    <p className="text-sm font-bold text-[#313851]">{company.hiringSeasons}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            }

            case 'eligibility': {
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
                        <h3 className="text-3xl font-bold text-[#313851] mb-6">Eligibility Criteria</h3>
                        {company.eligibility ? (
                            <div className="grid grid-cols-1 gap-6">
                                <div className="bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-zinc-50 border-b border-zinc-100">
                                                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Requirement</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-50">
                                            {Object.entries(company.eligibility).map(([key, value]) => (
                                                <tr key={key} className="hover:bg-zinc-50/50 transition-colors">
                                                    <td className="px-8 py-6 text-sm font-bold text-[#313851] capitalize">{key.replace(/([A-Z])/g, ' $1')}</td>
                                                    <td className="px-8 py-6 text-sm text-zinc-500 font-medium">{value}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100">
                                    <AlertCircle size={18} className="text-amber-600 shrink-0" />
                                    <p className="text-xs text-amber-900 font-medium">Criteria may vary based on specific roles and campus policies.</p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-zinc-500 font-medium italic">Detailed eligibility data not available for this company yet.</p>
                        )}
                    </motion.div>
                );
            }

            case 'process': {
                const processSteps = company.selectionProcess || company.process || [];
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                            <h3 className="text-3xl font-bold text-[#313851]">Selection Process</h3>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleMockInterviewClick}
                                className="flex items-center gap-2 px-8 py-4 bg-[#313851] text-white rounded-2xl font-bold text-sm shadow-xl shadow-zinc-200 hover:bg-[#404a6b] transition-all group"
                            >
                                <Play size={18} fill="currentColor" className="group-hover:translate-x-0.5 transition-transform" />
                                Try Mock Interview
                            </motion.button>
                        </div>
                        <div className="relative space-y-12 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-px before:bg-zinc-100">
                            {processSteps.map((step, idx) => (
                                <div key={idx} className="relative pl-16">
                                    <div className="absolute left-0 top-0 w-12 h-12 bg-white border-2 border-[#313851] rounded-2xl flex items-center justify-center text-sm font-black text-[#313851] z-10 shadow-md">
                                        {idx + 1}
                                    </div>
                                    <div className="bg-white p-6 rounded-[2rem] border border-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                                        <h4 className="text-lg font-bold text-[#313851] mb-2">{step.name}</h4>
                                        <p className="text-zinc-500 font-medium leading-relaxed">{step.details}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
            }

            case 'test-pattern': {
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
                        <h3 className="text-3xl font-bold text-[#313851] mb-6">Test Pattern</h3>
                        {company.testPattern ? (
                            <div className="grid grid-cols-1 gap-6">
                                <div className="bg-white rounded-3xl border border-zinc-100 overflow-hidden shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-zinc-50 border-b border-zinc-100">
                                                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Section</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Questions</th>
                                                <th className="px-8 py-4 text-[10px] font-black text-zinc-400 uppercase tracking-widest">Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-zinc-50">
                                            {company.testPattern.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                                                    <td className="px-8 py-6 text-sm font-bold text-[#313851]">{item.section}</td>
                                                    <td className="px-8 py-6 text-sm text-zinc-500 font-medium">{item.questions}</td>
                                                    <td className="px-8 py-6 text-sm font-bold text-emerald-600">{item.duration}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <p className="text-zinc-500 font-medium italic">Test pattern details not yet listed.</p>
                        )}
                    </motion.div>
                );
            }

            case 'syllabus': {
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
                        <h3 className="text-3xl font-bold text-[#313851] mb-6">Syllabus Details</h3>
                        {company.syllabus ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {company.syllabus.map((round, idx) => (
                                    <div key={idx} className="p-8 bg-zinc-50 rounded-[2.5rem] border border-zinc-100">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-8 h-8 bg-[#313851] rounded-xl flex items-center justify-center text-white text-[10px] font-black">
                                                {idx + 1}
                                            </div>
                                            <h4 className="text-lg font-bold text-[#313851]">{round.round}</h4>
                                        </div>
                                        <ul className="space-y-3">
                                            {round.topics.map((topic, tIdx) => (
                                                <li key={tIdx} className="flex items-center gap-3 text-zinc-600 font-bold text-xs">
                                                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                                                    {topic}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-zinc-500 font-medium italic">Detailed syllabus not yet available.</p>
                        )}
                    </motion.div>
                );
            }

            case 'registration': {
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
                        <h3 className="text-3xl font-bold text-[#313851] mb-6">Registration Process</h3>
                        {company.registrationProcess ? (
                            <div className="space-y-6">
                                {company.registrationProcess.map((step, idx) => (
                                    <div key={idx} className="flex items-start gap-6 p-6 bg-white border border-zinc-100 rounded-3xl shadow-sm">
                                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-sm shrink-0">
                                            {idx + 1}
                                        </div>
                                        <p className="text-sm font-bold text-[#313851] pt-2">{step}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-zinc-500 font-medium italic">Registration steps not yet provided.</p>
                        )}
                    </motion.div>
                );
            }

            case 'money': {
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-10">
                        <h3 className="text-3xl font-bold text-[#313851] mb-6">Compensation Details</h3>
                        {company.compensation ? (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { label: 'Base Salary', value: company.compensation.base, icon: <DollarSign className="text-emerald-500" /> },
                                        { label: 'Signing Bonus', value: company.compensation.bonus, icon: <Sparkles className="text-amber-500" /> },
                                        { label: 'Stock / RSUs', value: company.compensation.stock, icon: <TrendingUp className="text-indigo-500" /> },
                                        { label: 'Relocation', value: company.compensation.relocation, icon: <ArrowRight className="text-zinc-400" /> }
                                    ].map((item, idx) => (
                                        <div key={idx} className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 group hover:bg-white hover:shadow-xl transition-all">
                                            <div className="flex items-center gap-3 mb-3">
                                                {item.icon}
                                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{item.label}</span>
                                            </div>
                                            <p className="text-xl font-bold text-[#313851]">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-10 bg-[#313851] rounded-[2.5rem] text-center text-white relative overflow-hidden">
                                    <div className="relative z-10">
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-60">Total Year 1 Package</p>
                                        <p className="text-5xl font-bold tracking-tight">{company.compensation.totalYear1}</p>
                                    </div>
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />
                                </div>
                            </>
                        ) : (
                            <p className="text-zinc-500 font-medium italic">Compensation data not available.</p>
                        )}
                    </motion.div>
                );
            }

            case 'tips': {
                return (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-500 shadow-sm">
                                <Sparkles size={32} />
                            </div>
                            <div>
                                <h3 className="text-3xl font-bold text-[#313851]">The Insider Scoop</h3>
                                <p className="text-sm text-zinc-400 font-medium">Tips from recent hires and mentors.</p>
                            </div>
                        </div>
                        <div className="relative p-10 bg-zinc-50 rounded-[3rem] border border-zinc-100">
                            <div className="absolute top-8 left-8 text-6xl text-zinc-200 font-serif leading-none">“</div>
                            <p className="text-2xl text-zinc-600 font-medium leading-relaxed italic relative z-10 px-8">
                                {company.insiderScoop}
                            </p>
                            <div className="absolute bottom-8 right-8 text-6xl text-zinc-200 font-serif leading-none rotate-180">“</div>
                        </div>
                        <div className="p-8 bg-amber-50 rounded-[2rem] border border-amber-100">
                            <h4 className="text-sm font-black text-amber-700 uppercase tracking-widest mb-4">Core Focus Areas</h4>
                            <p className="text-lg text-amber-900 font-medium leading-relaxed">{company.prepFocus}</p>
                        </div>
                    </motion.div>
                );
            }

            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-zinc-900/5 border border-zinc-100 min-h-[600px]">
            <AnimatePresence mode="wait">
                {renderSection()}
            </AnimatePresence>
        </div>
    );
};


