import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, ArrowRight, Building2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const JobCard = ({ job, isAuthenticated = true }) => {
    // Utility for date formatting
    const formattedDate = new Date(job.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
    });

    // Advanced parser for scraped titles containing locations and timestamps
    const parseJobData = (raw) => {
        if (!raw) return { title: 'Untitled', loc: null, time: null };
        let t = raw;
        let time = null;
        let loc = null;
        
        // Extract "Posted X hours ago"
        const postedMatch = t.match(/POSTED\s*(.*)$/i);
        if (postedMatch) {
            time = postedMatch[1].trim();
            t = t.replace(/POSTED.*$/i, '').trim();
        }

        // Extract apparent locations
        const cities = ['BANGALORE', 'BENGALURU', 'HYDERABAD', 'PUNE', 'MUMBAI', 'DELHI', 'INDIA', 'NEW YORK', 'KARNATAKA'];
        for (const city of cities) {
            const idx = t.toUpperCase().indexOf(city);
            if (idx > 10) { 
                let extracted = t.substring(idx).trim();
                extracted = extracted.replace(/India.*/i, 'India');
                extracted = extracted.replace(/Karnataka.*/i, 'Karnataka');
                loc = extracted;
                t = t.substring(0, idx).trim();
                break;
            }
        }

        // Clean slug formatting
        t = t.replace(/^[A-Z]{2}_/, '');
        t = t.replace(/_/g, ' ');
        t = t.replace(/\b\w+/g, w =>
            ['&', 'AND', 'OF', 'THE', 'IN', 'AT', 'FOR'].includes(w.toUpperCase())
                ? w.toLowerCase()
                : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        );

        return { title: t, loc, time };
    };

    const { title: cleanTitle, loc: parsedLoc, time: parsedTime } = parseJobData(job.title);
    const displayLocation = parsedLoc || job.location || 'Remote';
    const displayTime = parsedTime ? `Posted ${parsedTime}` : formattedDate;

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="group relative h-full"
        >
            <div className="relative h-full overflow-hidden bg-white rounded-[32px] border border-zinc-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-500 ease-in-out hover:shadow-[0_24px_48px_-12px_rgba(0,0,0,0.08)] hover:-translate-y-2 flex flex-col">

                {/* 1. Subtle Background Accent */}
                <div className="absolute -top-16 -right-16 w-64 h-64 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-100/50 via-transparent to-transparent opacity-50 blur-3xl pointer-events-none z-0" />

                {/* 2. Top Zone - Content */}
                <div className="p-8 relative z-10 flex-1">
                    <div className="flex justify-between items-start mb-6 gap-4 w-full">
                        <div className="flex items-start gap-4 min-w-0 flex-1">
                            {/* Company Avatar - Neu-Minimalist */}
                            <div className="shrink-0 w-14 h-14 rounded-[20px] bg-zinc-900 shadow-lg shadow-zinc-900/10 flex items-center justify-center font-sans font-bold text-xl text-white">
                                {(job.company_name || 'O').charAt(0)}
                            </div>
                            <div className="min-w-0 flex-1">
                                <h3 className="font-sans font-bold text-zinc-900 tracking-tight leading-tight text-lg group-hover:text-zinc-600 transition-colors line-clamp-2">
                                    {cleanTitle}
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium mt-1.5">
                                    <Building2 size={13} className="shrink-0" />
                                    <span className="truncate uppercase tracking-wider">{job.company_name}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-6">
                        <div className="flex items-center gap-2.5 text-xs font-semibold text-zinc-500 bg-zinc-50 py-2 px-3 rounded-xl border border-zinc-100/50">
                            <MapPin size={14} className="text-zinc-400" />
                            <span className="truncate">{displayLocation}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs font-semibold text-zinc-500 bg-zinc-50 py-2 px-3 rounded-xl border border-zinc-100/50">
                            <Calendar size={14} className="text-zinc-400" />
                            <span className="truncate">{displayTime}</span>
                        </div>
                    </div>

                    {job.salary_range && (
                        <div className="mt-4 flex items-center gap-2.5 text-sm font-bold text-zinc-900 px-1">
                            <DollarSign size={16} className="text-zinc-400" />
                            <span>{job.salary_range}</span>
                        </div>
                    )}
                </div>

                {/* 3. Bottom Zone - Action */}
                <div className="p-8 pt-0 relative z-10">
                    <div className="flex flex-wrap gap-2 mb-8">
                        {job.skills_required?.slice(0, 3).map((skill, idx) => (
                            <span
                                key={idx}
                                className="text-[9px] font-bold px-3 py-1.5 bg-zinc-50 text-zinc-500 border border-zinc-200/40 rounded-full uppercase tracking-wider"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>

                    <Link to={`/jobs/${job.id}`} state={{ displayLocation }} className="block">
                        <button className="w-full bg-zinc-900 text-white font-sans font-bold text-xs py-4 rounded-2xl transition-all duration-300 hover:bg-zinc-800 hover:shadow-xl hover:shadow-zinc-900/10 flex justify-center items-center gap-2 active:scale-[0.98]">
                            View Report <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default JobCard;
