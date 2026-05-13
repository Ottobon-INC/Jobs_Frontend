import { motion } from 'framer-motion';
import { MapPin, IndianRupee, ArrowRight, Building2, Bookmark, GraduationCap, Clock, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { saveJob, unsaveJob } from '../../api/jobsApi';
import { useAuth } from '../../context/AuthContext';
import { CompanyLogo } from '../new-grad/CompanyLogo';
import { getKeySkills, getOverviewPreview } from '../../utils/jobOverview';

const JobCard = ({ job, isAuthenticated = true }) => {
    const { savedJobIds, toggleJobSavedLocal } = useAuth();
    const [loading, setLoading] = useState(false);

    // Check saved status from global state
    const saved = savedJobIds.has(job.id);

    // Utility for date formatting
    const formattedDate = new Date(job.created_at).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric'
    });

    // Clean title — strip "POSTED" suffix and embedded locations
    const cleanTitle = (() => {
        let t = job.title || 'Untitled';
        t = t.replace(/POSTED.*$/i, '').trim();
        // Clean slug formatting
        t = t.replace(/^[A-Z]{2}_/, '');
        t = t.replace(/_/g, ' ');
        t = t.replace(/\b\w+/g, w =>
            ['&', 'AND', 'OF', 'THE', 'IN', 'AT', 'FOR'].includes(w.toUpperCase())
                ? w.toLowerCase()
                : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
        );
        return t;
    })();

    // Prefer backend fields, fallback to client-side computation
    const displayLocation = job.location || job.cleanLocation || 'Remote';
    const displayExperience = (job.experience && !['not specified', '0', 0].includes(String(job.experience).toLowerCase()))
        ? job.experience
        : (job.experience_range && job.experience_range !== 'Not specified' 
            ? job.experience_range 
            : (job.experience === 0 || String(job.experience).toLowerCase() === '0' ? 'Fresher' : 'Not specified')
        );
    const displayQualification = job.qualification || null;
    const displaySalary = job.salary_range && job.salary_range !== 'Not specified' ? job.salary_range : null;

    // Short description: prefer backend, fallback to overview preview
    const shortDescription = job.short_description || getOverviewPreview({ ...job, cleanTitle, cleanLocation: displayLocation }, 2);

    // Skills: prefer backend key_skills, fallback to client extraction, cap at 8
    const keySkills = (job.key_skills && job.key_skills.length > 0)
        ? job.key_skills.slice(0, 8)
        : getKeySkills(job, 8);

    const getWorkMode = () => {
        const titleLoc = `${cleanTitle} ${displayLocation}`.toLowerCase();
        if (titleLoc.includes('remote')) return 'Remote';
        if (titleLoc.includes('hybrid')) return 'Hybrid';
        const descText = `${job.short_description || ''} ${Array.isArray(job.role_overview) ? job.role_overview.join(' ') : ''}`.toLowerCase();
        if (/\bhybrid\b/.test(descText)) return 'Hybrid';
        if (/\bremote\b/.test(descText)) return 'Remote';
        return 'Onsite';
    };
    const workMode = job.work_mode || getWorkMode();

    // Match score from job data (if available from matchAllJobs)
    const rawScore = job.match_score ?? job.similarity_score;
    const matchScore = rawScore != null
        ? Math.round(rawScore <= 1 && rawScore > 0 ? rawScore * 100 : rawScore)
        : null;

    const handleToggleSave = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) return;
        
        setLoading(true);
        try {
            if (saved) {
                await unsaveJob(job.id);
                toggleJobSavedLocal(job.id, false);
            } else {
                await saveJob(job.id);
                toggleJobSavedLocal(job.id, true);
            }
        } catch (err) {
            console.error('Failed to toggle save status', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            className="group/job relative"
        >
            <div className="relative bg-white border border-zinc-100 rounded-[2.5rem] p-8 shadow-xl shadow-zinc-900/5 transition-all hover:shadow-2xl hover:shadow-[#313851]/10 flex flex-col overflow-hidden">
                
                {/* 1. Top Row: Logo & Badges */}
                <div className="flex items-start justify-between mb-8">
                    <CompanyLogo 
                        company={{ 
                            name: job.company_name, 
                            logo: job.company_logo,
                            slug: job.company_name?.toLowerCase().replace(/\s+/g, '-')
                        }} 
                        className="w-16 h-16 group-hover/job:scale-110 transition-transform duration-500" 
                    />
                    
                    <div className="flex flex-col items-end gap-2">
                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                            workMode === 'Remote' ? 'bg-sky-100 text-sky-700' :
                            workMode === 'Hybrid' ? 'bg-purple-100 text-purple-700' :
                            'bg-emerald-100 text-emerald-700'
                        }`}>
                            {workMode}
                        </div>
                        <div className="px-3 py-1 bg-zinc-50 text-zinc-400 rounded-full text-[9px] font-bold uppercase tracking-widest border border-zinc-100">
                            {formattedDate}
                        </div>
                    </div>
                </div>

                {/* 2. Job Title & Company */}
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-[#313851] leading-tight mb-2 line-clamp-2">
                        {cleanTitle}
                    </h3>
                    <p className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em]">
                        {job.company_name || 'Ottobon Partner'}
                    </p>
                </div>

                {/* 3. Dynamic Content Area: Summary Boxes + Expandable Skills */}
                <div className="flex-1 mb-8">
                    {/* Always visible: Summary Boxes */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Experience</p>
                            <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-xs">
                                <Clock size={12} className="text-[#313851]" />
                                {displayExperience}
                            </div>
                        </div>
                        <div className="p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm">
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Location</p>
                            <div className="flex items-center gap-1.5 text-zinc-900 font-bold text-xs">
                                <MapPin size={12} className="text-[#313851]" />
                                <span className="truncate">{displayLocation}</span>
                            </div>
                        </div>
                    </div>

                    {/* Expandable Section: Skills required */}
                    <div className="overflow-hidden transition-all duration-500 max-h-0 group-hover/job:max-h-[180px] opacity-0 group-hover/job:opacity-100 group-hover/job:mt-6">
                        <p className="text-[9px] font-black text-[#313851] uppercase tracking-widest mb-3">Required Skills</p>
                        <div className="flex flex-wrap gap-2 overflow-y-auto max-h-[130px] custom-scrollbar pr-2">
                            {keySkills.map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="text-[10px] font-bold px-3 py-1.5 bg-zinc-900 text-white rounded-lg capitalize tracking-wide shadow-sm"
                                >
                                    {skill}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. Action Bar */}
                <div className="flex items-center gap-3">
                    <Link to={`/jobs/${job.id}`} state={{ displayLocation }} className="flex-1">
                        <button className="w-full py-4 bg-[#313851] text-white rounded-2xl font-bold text-xs uppercase tracking-[0.2em] flex items-center justify-center transition-all hover:bg-black group-active/job:scale-[0.98] shadow-lg shadow-zinc-900/10">
                            View details
                        </button>
                    </Link>
                    <button
                        onClick={handleToggleSave}
                        disabled={loading || !isAuthenticated}
                        className={`p-4 rounded-2xl transition-all duration-300 border ${
                            saved
                                ? 'bg-amber-50 border-amber-200 text-amber-600'
                                : 'bg-zinc-50 border-zinc-100 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'
                        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Bookmark size={20} className={saved ? 'fill-amber-600' : ''} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default JobCard;
