import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, ArrowRight, Building2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const JobCard = ({ job, isAuthenticated = true }) => {
    // Utility for date formatting
    const formattedDate = new Date(job.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
    });

    // Clean ugly slug-format titles (e.g. "IN_ASSOCIATE_JAVA_DEVELOPER_KOLKATA")
    const formatTitle = (raw) => {
        if (!raw) return 'Untitled';
        let t = raw;
        // Strip leading 2-letter country code prefix (e.g. "IN_", "US_")
        t = t.replace(/^[A-Z]{2}_/, '');
        // If still has underscores, it's a slug — clean it
        if (t.includes('_')) {
            t = t.replace(/_/g, ' ');
            // Title case
            t = t.replace(/\b\w+/g, w =>
                ['&', 'AND', 'OF', 'THE', 'IN', 'AT', 'FOR'].includes(w.toUpperCase())
                    ? w.toLowerCase()
                    : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
            );
        }
        return t;
    };

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
                                <h3 className="font-display font-semibold text-gray-900 tracking-tight leading-loose text-lg group-hover:text-black transition-colors">
                                    {formatTitle(job.title)}
                                </h3>
                                <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
                                    <Building2 size={12} className="opacity-40" />
                                    <span>{job.company_name}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 rounded-full border border-black/[0.03] text-[10px] font-bold text-gray-400 uppercase tracking-widest shadow-sm">
                            <Calendar size={10} />
                            {formattedDate}
                        </div>
                    </div>

                    <div className="space-y-3 mb-4">
                        <div className="flex items-center gap-2.5 text-sm font-medium text-gray-500">
                            <MapPin size={14} className="opacity-40" />
                            <span>{job.location || 'Remote'}</span>
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

                    <Link to={`/jobs/${job.id}`} className="block">
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
