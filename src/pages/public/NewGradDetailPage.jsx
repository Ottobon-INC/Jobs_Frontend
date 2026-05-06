import React, { useMemo, useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
    ArrowLeft, 
    ShieldCheck, 
    Info, 
    UserCheck, 
    Zap, 
    Table as TableIcon, 
    BookOpen, 
    ClipboardCheck, 
    Lightbulb,
    DollarSign,
    Briefcase,
    Calendar,
    MapPin,
    Star,
    FileText
} from 'lucide-react';
import { COMPANIES } from '../../data/newGradData';
import { CompanyDetailContent } from '../../components/new-grad/CompanyDetailContent';
import { CompanyLogo } from '../../components/new-grad/CompanyLogo';
import CompanyDashboardSidebar from '../../components/new-grad/CompanyDashboardSidebar';
import NotFoundPage from '../NotFoundPage';

const NewGradDetailPage = () => {
    const { slug } = useParams();
    const [activeSection, setActiveSection] = useState('overview');

    const company = useMemo(() => {
        return COMPANIES.find(c => c.slug === slug);
    }, [slug]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [slug]);

    const dashboardSections = [
        { id: 'overview', label: 'Overview', icon: <Info size={16} /> },
        { id: 'eligibility', label: 'Eligibility', icon: <UserCheck size={16} /> },
        { id: 'process', label: 'Selection Process', icon: <Zap size={16} /> },
        { id: 'test-pattern', label: 'Test Pattern', icon: <TableIcon size={16} /> },
        { id: 'syllabus', label: 'Syllabus', icon: <BookOpen size={16} /> },
        { id: 'registration', label: 'How to Apply', icon: <ClipboardCheck size={16} /> },
        { id: 'money', label: 'Compensation', icon: <DollarSign size={16} /> },
        { id: 'tips', label: 'Insider Tips', icon: <Lightbulb size={16} /> },
        { id: 'materials', label: 'Interview Materials', icon: <FileText size={16} />, isNav: true },
    ];

    if (!company) {
        return <NotFoundPage />;
    }

    return (
        <div className="min-h-screen bg-[#F6F3ED]">
            {/* Header Navigation */}
            <div className="bg-[#313851] py-4 px-6 flex items-center justify-between border-b border-white/5 sticky top-0 z-50">
                <Link 
                    to="/new-grad" 
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors text-[10px] font-black uppercase tracking-[0.2em]"
                >
                    <ArrowLeft size={14} strokeWidth={3} /> Back to Playbooks
                </Link>
                <div className="flex items-center gap-2 text-white/90">
                    <ShieldCheck size={14} className="text-green-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">Verified Playbook</span>
                </div>
            </div>

            {/* Hero Section */}
            <header className="bg-[#313851] pt-20 pb-28 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-8 relative z-10">
                    <CompanyLogo company={company} className="w-32 h-32" iconSize={48} />
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                            <span className="px-4 py-1.5 bg-white/10 text-white rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10">
                                {company.category}
                            </span>
                            <div className="flex items-center gap-1 text-amber-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} size={12} fill={i < company.difficultyLevel ? 'currentColor' : 'none'} className={i < company.difficultyLevel ? 'text-amber-400' : 'text-white/20'} />
                                ))}
                            </div>
                        </div>
                        <p className="text-sm md:text-base text-white/80 mb-3 font-semibold tracking-wide uppercase">
                            Candidate Insights • {new Date().getFullYear()} Playbook
                        </p>
                        <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight mb-6">{company.name}</h1>
                        <p className="text-xl text-white/90 font-medium max-w-3xl leading-relaxed">
                            Interview rounds, real compensation, and prep strategies—directly from candidates who’ve successfully secured campus placements at {company.name}.
                        </p>
                    </div>
                </div>
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] -mr-48 -mt-48" />
            </header>

            <main className="max-w-7xl mx-auto px-6 -mt-10 pb-24 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sticky Sidebar */}
                    <CompanyDashboardSidebar 
                        activeSection={activeSection} 
                        setActiveSection={setActiveSection}
                        sections={dashboardSections}
                    />

                    {/* Main Content Area */}
                    <div className="lg:col-span-3 space-y-8">
                        <CompanyDetailContent 
                            company={company} 
                            activeSection={activeSection} 
                        />
                        
                        {/* Quick Insight Bar */}
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-100 flex flex-wrap items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400">
                                    <Briefcase size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Target Roles</p>
                                    <p className="text-xs font-bold text-[#313851]">{company?.roles?.slice(0, 3)?.join(' • ')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 border-l border-zinc-50 pl-6">
                                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400">
                                    <Calendar size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Hiring Cycle</p>
                                    <p className="text-xs font-bold text-[#313851]">{company.hiringSeasons}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 border-l border-zinc-50 pl-6">
                                <div className="w-10 h-10 bg-zinc-50 rounded-xl flex items-center justify-center text-zinc-400">
                                    <MapPin size={18} />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-0.5">Offices</p>
                                    <p className="text-xs font-bold text-[#313851]">{company?.locations?.[0]} & {(company?.locations?.length || 1) - 1} more</p>
                                </div>
                            </div>
                            <Link 
                                to={company.jobsLink}
                                className="px-6 py-3 bg-[#313851] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-lg shadow-[#313851]/20"
                            >
                                View Jobs
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NewGradDetailPage;

