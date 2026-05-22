import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Calendar, ChevronRight, Briefcase, Code, FileText, CheckCircle2, Edit2 } from 'lucide-react';
import { HIRING_TIMELINE as STATIC_TIMELINE } from '../../data/newGradData';
import { CompanyLogo } from './CompanyLogo';
import { fetchTimeline } from '../../api/timelineApi';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

const getEventIcon = (type) => {
    switch(type) {
        case 'Application': return <Briefcase size={12} />;
        case 'Assessment': return <Code size={12} />;
        case 'Screening': return <FileText size={12} />;
        case 'Interview': return <Calendar size={12} />;
        case 'Offer': return <CheckCircle2 size={12} />;
        default: return <ChevronRight size={12} />;
    }
};

const getEventColor = (type) => {
    switch(type) {
        case 'Application': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'Assessment': return 'bg-amber-100 text-amber-700 border-amber-200';
        case 'Screening': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'Interview': return 'bg-rose-100 text-rose-700 border-rose-200';
        case 'Offer': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
};

export const HiringTimeline = () => {
    const scrollRef = useRef(null);
    const [hiringZone, setHiringZone] = useState('on-campus');
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const { role } = useAuth();

    useEffect(() => {
        const getTimelineData = async () => {
            try {
                const data = await fetchTimeline();
                if (data && data.length > 0) {
                    setTimeline(data);
                } else {
                    setTimeline(STATIC_TIMELINE);
                }
            } catch (error) {
                console.error('Failed to load dynamic timeline, falling back to static:', error);
                setTimeline(STATIC_TIMELINE);
            } finally {
                setLoading(false);
            }
        };
        getTimelineData();
    }, []);

    return (
        <section className="py-20 bg-[#313851] text-white overflow-hidden relative border-y border-white/10">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 mb-12 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-4 flex-wrap">
                        <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            <Calendar className="text-amber-400" size={28} />
                            Hiring Timeline
                        </h2>
                        {role === ROLES.ADMIN && (
                            <Link 
                                to="/admin/timeline"
                                className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-[#313851] text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 duration-200"
                            >
                                <Edit2 size={12} strokeWidth={2.5} /> Edit Timeline
                            </Link>
                        )}
                    </div>
                    <p className="text-sm font-medium text-[rgba(255,255,255,0.7)] mt-2 max-w-xl">
                        Don't miss the wave. Track when top companies drop their Online Assessments and open their portals. Scroll horizontally to explore the timeline.
                    </p>
                </div>

                <div className="flex items-center gap-1 bg-white/5 border border-white/10 p-1.5 rounded-[20px] w-fit backdrop-blur-md shadow-2xl">
                    <button 
                        onClick={() => setHiringZone('on-campus')}
                        className={`px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${hiringZone === 'on-campus' ? 'bg-white text-[#313851] shadow-lg' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
                    >
                        On-Campus
                    </button>
                    <button 
                        onClick={() => setHiringZone('off-campus')}
                        className={`px-8 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 ${hiringZone === 'off-campus' ? 'bg-white text-[#313851] shadow-lg' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
                    >
                        Off-Campus
                    </button>
                </div>
            </div>

            <div 
                ref={scrollRef}
                className="flex gap-6 overflow-x-auto pb-16 px-6 max-w-7xl mx-auto snap-x snap-mandatory relative z-10 [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {loading ? (
                    [1, 2, 3].map((i) => (
                        <div key={i} className="flex-none w-[320px] sm:w-[380px] snap-center animate-pulse">
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 h-40" />
                        </div>
                    ))
                ) : (
                    timeline.map((monthData, index) => {
                        const filteredEvents = monthData.events ? monthData.events.filter(event => event.zone === hiringZone) : [];
                        
                        if (filteredEvents.length === 0) return null;

                        return (
                            <motion.div 
                                key={monthData.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-50px" }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="flex-none w-[320px] sm:w-[380px] snap-center relative"
                            >
                                {/* Month Header Card */}
                                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8 backdrop-blur-md relative z-10 shadow-2xl">
                                    <div className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em] mb-2">{monthData.month}</div>
                                    <h3 className="text-xl font-bold text-white mb-2">{monthData.title}</h3>
                                    <p className="text-sm text-[rgba(255,255,255,0.7)] leading-relaxed">{monthData.description}</p>
                                </div>

                                {/* Connector Line Background */}
                                <div className="absolute top-[180px] bottom-0 left-10 w-0.5 bg-gradient-to-b from-white/20 via-white/10 to-transparent z-0" />

                                {/* Events List */}
                                <div className="space-y-6 relative z-10 pl-4 pr-2">
                                    {filteredEvents.map((event, i) => (
                                        <motion.div 
                                            key={i}
                                            whileHover={{ scale: 1.02, x: 5 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                            className="relative flex items-center bg-white rounded-xl p-4 shadow-xl border border-zinc-100 group cursor-default"
                                        >
                                            {/* Timeline dot connecting to the background line */}
                                            <div className="absolute -left-5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white border-2 border-[#313851] shadow-sm z-20" />
                                            
                                            <div className="flex-shrink-0 mr-4 drop-shadow-sm">
                                                <CompanyLogo 
                                                    company={{ name: event.company, logo: event.logo }} 
                                                    className="w-12 h-12 !rounded-full" 
                                                    iconSize={18} 
                                                />
                                            </div>
                                            <div className="flex-grow min-w-0">
                                                <div className="text-xs font-bold text-[#71717a] uppercase tracking-wider mb-1 truncate">{event.company}</div>
                                                <div className="text-sm font-bold text-[#313851] leading-tight pr-2">{event.title}</div>
                                            </div>
                                            <div className={`absolute -top-3 -right-2 border px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm ${getEventColor(event.type)}`}>
                                                {getEventIcon(event.type)}
                                                {event.type}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        );
                    })
                )}
                
                {/* Spacer at the end for smooth scrolling */}
                <div className="flex-none w-6" />
            </div>
        </section>
    );
};
