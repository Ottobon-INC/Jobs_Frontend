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
            <div className="relative h-full overflow-hidden bg-white rounded-2xl border-2 border-black shadow-[0_8px_30px_rgb(0,0,0,0.04),_inset_0_1px_0_rgba(255,255,255,1)] transition-all duration-500 ease-in-out hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.12)] hover:-translate-y-2 flex flex-col">

                {/* 1. Radial Spotlight (Background Volume) */}
                <div className="absolute -top-16 -right-16 w-64 h-64 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black/5 via-transparent to-transparent opacity-50 blur-3xl pointer-events-none z-0" />

                {/* 2. Top Zone (Pure White Surface) */}
                <div className="p-6 relative z-10 flex-1">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                            {/* Company Avatar / Initial */}
                            <div className="w-12 h-12 rounded-xl bg-black text-white flex items-center justify-center font-display font-bold text-lg shadow-xl shadow-black/10 ring-1 ring-black/5">
                                {(job.company_name || 'O').charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-display font-semibold text-gray-900 tracking-tight leading-loose text-lg group-hover:text-black transition-colors line-clamp-2">
                                    {cleanTitle}
                                </h3>
                                <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                                    <Building2 size={12} className="opacity-40" />
                                    <span>{job.company_name}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-center shrink-0 h-fit gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full border border-black/[0.03] text-[10px] font-bold text-gray-400 uppercase tracking-widest shadow-sm">
                            <Calendar size={10} />
                            {displayTime}
                        </div>
                    </div>

                    <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2.5 text-sm font-medium text-gray-500">
                            <MapPin size={14} className="opacity-40" />
                            <span className="truncate">{displayLocation}</span>
                        </div>
                        {job.salary_range && (
                            <div className="flex items-center gap-2.5 text-sm font-semibold text-black">
                                <DollarSign size={14} className="opacity-60" />
                                <span>{job.salary_range}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Bottom Zone (Subtle Gray Zone) */}
                <div className="bg-gray-50/50 border-t border-black/[0.03] p-6 backdrop-blur-sm relative z-10">
                    <div className="flex flex-wrap gap-2 mb-6">
                        {job.skills_required?.slice(0, 3).map((skill, idx) => (
                            <span
                                key={idx}
                                className="text-[10px] font-bold px-3 py-1 bg-white text-gray-600 border border-black/[0.04] rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.02)] uppercase tracking-wider"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>

                    <Link to={`/jobs/${job.id}`} state={{ displayLocation }} className="block">
                        <button className="w-full relative group/btn overflow-hidden bg-black text-white font-display font-bold text-xs py-3.5 rounded-xl transition-all duration-300 hover:shadow-2xl hover:shadow-black/20 flex justify-center items-center gap-2 active:scale-[0.98]">
                            <span className="relative z-10 flex items-center gap-2">
                                View Details <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                            </span>
                        </button>
                    </Link>
                </div>
            </div>
        </motion.div>
    );
};

export default JobCard;
