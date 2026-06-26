import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { getJobDetails, getJobMatchScore, matchAllJobs } from '../../api/jobsApi';
import { MOCK_JOBS } from '../../data/mockJobs';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import { sanitizeHTML } from '../../utils/sanitize';
import Loader from '../../components/ui/Loader';
import MatchIQModal from '../../components/ui/MatchIQModal';
import MatchedJobsSection from '../../components/ui/MatchedJobsSection';
import JobOverviewCard from '../../components/ui/JobOverviewCard';
import { getKeySkills, getRoleOverview } from '../../utils/jobOverview';
import { MapPin, ExternalLink, CheckCircle, FileText, ArrowLeft, Building2, RefreshCw, Lock, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';

const BentoCard = ({ children, className = "", delay = 0 }) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
        className={`bg-white rounded-xl border p-5 md:p-5 flex flex-col shadow-xl shadow-zinc-900/5 overflow-hidden min-w-0 ${className}`}
        style={{ borderColor: 'var(--border-main)' }}
    >
        {children}
    </motion.div>
);

const JobDetailPage = () => {
    const { id } = useParams();
    const locationState = useLocation();
    const navigate = useNavigate();
    const passedLocation = locationState.state?.displayLocation;
    const { user, role } = useAuth();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [isMatching, setIsMatching] = useState(false);
    const [matchDetails, setMatchDetails] = useState(null);
    const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [genZSummary, setGenZSummary] = useState(null);
    const [isSpecExpanded, setIsSpecExpanded] = useState(false);

    useDocumentMetadata(job ? {
        title: `${job.cleanTitle} at ${job.company_name || 'Company'} | Ottobon Jobs`,
        description: job.description_raw || job.role_overview || `Apply for ${job.cleanTitle} at ${job.company_name} on Ottobon Jobs.`,
        openGraph: {
            title: `${job.cleanTitle} at ${job.company_name || 'Company'} | Ottobon Jobs`,
            description: job.description_raw || job.role_overview || `Apply for ${job.cleanTitle} at ${job.company_name} on Ottobon Jobs.`,
            type: "website",
            url: typeof window !== 'undefined' ? window.location.href : '',
            image: typeof window !== 'undefined' ? `${window.location.origin}/og-image-jobs.png` : ''
        },
        twitter: {
            card: "summary_large_image",
            title: `${job.cleanTitle} at ${job.company_name || 'Company'} | Ottobon Jobs`,
            description: job.description_raw || job.role_overview || `Apply for ${job.cleanTitle} at ${job.company_name} on Ottobon Jobs.`,
            image: typeof window !== 'undefined' ? `${window.location.origin}/og-image-jobs.png` : ''
        },
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "JobPosting",
            "title": job.cleanTitle,
            "description": job.description || job.role_overview || job.description_raw,
            "datePosted": job.posted_at || job.created_at || new Date().toISOString(),
            "hiringOrganization": {
                "@type": "Organization",
                "name": job.company_name || 'Company',
                "sameAs": job.company_website || ''
            },
            "jobLocation": {
                "@type": "Place",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": job.cleanLocation || 'Remote',
                    "addressCountry": "IN"
                }
            },
            "employmentType": job.work_mode === "remote" ? "TELECOMMUTE" : "FULL_TIME"
        }
    } : {});

    const fetchJob = async (isRefresh = false) => {
        try {
            if (isRefresh) setRefreshing(true);
            else setLoading(true);
            const data = await getJobDetails(id);

            // Replicate JobCard Location Extractor OR use passed state from the Card Link directly
            let loc = passedLocation || data.location || 'REMOTE';
            let t = data.title || '';
            t = t.replace(/POSTED.*$/i, '').trim();
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
            data.cleanLocation = data.location || passedLocation || loc;
            data.cleanTitle = t;
            data.role_overview = data.role_overview || getRoleOverview(data);
            data.key_skills = data.key_skills || getKeySkills(data, 8);
            setGenZSummary(data.gen_z_summary || null);
            setJob(data);
        } catch (error) {
            console.error('Failed to fetch job, using fallback data:', error);
            const fallbackJob = MOCK_JOBS.find(j => j.id === id);
            if (fallbackJob) {
                fallbackJob.cleanLocation = fallbackJob.location;
                fallbackJob.cleanTitle = fallbackJob.title;
                setJob(fallbackJob);
                setGenZSummary(null);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchJob(); }, [id]);

    const handleRunMatchIQ = async () => {
        setIsMatching(true);
        try {
            let matchData = {};
            try {
                const response = await getJobMatchScore(id);
                const score = response.match_score || Math.round((response.similarity_score || 0) * 100) || 82;
                matchData = {
                    score,
                    skills_score: response.skills_score,
                    experience_score: response.experience_score,
                    interests_score: response.interests_score,
                    aspirations_score: response.aspirations_score,
                    work_preference_score: response.work_preference_score,
                    missing_skills: response.missing_skills || [],
                    gap_analysis: response.gap_analysis || "Analysis Stream Complete."
                };
            } catch (err) {
                const score = 75;
                const breakdown = { skills_score: 80, interests_score: 70, aspirations_score: 65 };
                matchData = {
                    score,
                    ...breakdown,
                    missing_skills: [],
                    gap_analysis: "Analysis Stream complete (fallback)."
                };
            }
            setMatchDetails(matchData);
            setIsMatchModalOpen(true);

            try {
                const allMatches = await matchAllJobs();
                if (Array.isArray(allMatches)) {
                    const recommended = allMatches.filter(j => j.id !== id).slice(0, 3);
                    setRecommendedJobs(recommended);
                }
            } catch (err) {
                console.error("Failed fetching recommended", err);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setIsMatching(false);
        }
    };

    if (loading) return <Loader fullScreen variant="logo" />;
    if (!job) return <div className="min-h-screen grid place-items-center text-zinc-900 font-bold uppercase tracking-widest">Protocol Null / Object Not Found</div>;

    const displayExperience = (job.experience && !['not specified', '0', 0].includes(String(job.experience).toLowerCase()))
        ? job.experience
        : (job.experience_range && job.experience_range !== 'Not specified'
            ? job.experience_range
            : (job.experience === 0 || String(job.experience).toLowerCase() === '0' ? 'Fresher' : 'Not Specified')
        );
    const displayQualification = job.qualification || null;
    const displaySalary = job.salary_range || null;
    const overviewSentences = job.role_overview || getRoleOverview(job);
    const keySkills = job.key_skills || getKeySkills(job, 8);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };

    return (
        <div className="min-h-screen pt-4 md:pt-8 pb-12 px-4 md:px-12 max-w-[1400px] mx-auto bg-[#F4F1EA] overflow-x-hidden">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6">
                <Link to="/jobs" className="inline-flex items-center gap-2 text-zinc-400 font-bold uppercase text-[10px] tracking-widest hover:text-zinc-900 transition-all">
                    <ArrowLeft size={14} /> Back to Job Board
                </Link>
            </motion.div>

            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Header Card - Elite Minimalist */}
                <div className="lg:col-span-12">
                    <BentoCard className="relative overflow-hidden !py-8 !px-8 border border-zinc-100 shadow-2xl shadow-zinc-900/5">
                        <div className="relative z-10 flex flex-col items-start gap-5 w-full">
                            <div className="max-w-4xl min-w-0 w-full flex flex-col items-start">
                                <h1 className="text-2xl md:text-3xl font-sans font-bold text-zinc-900 tracking-tight mb-4 leading-[1.1] break-words text-left">
                                    {job.cleanTitle}
                                </h1>
                                <div className="flex flex-wrap justify-start gap-4 text-zinc-400 font-bold uppercase text-[10px] tracking-[0.2em]">
                                    <span className="flex items-center gap-2">
                                        <Building2 size={16} className="text-zinc-300" />
                                        {job.company_name || 'Company'}
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <MapPin size={16} className="text-zinc-300" />
                                        {job.cleanLocation}
                                    </span>
                                    <span className="flex items-center gap-2 px-3 py-1 bg-zinc-50 border border-zinc-100 rounded-lg text-zinc-600 font-bold">
                                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 animate-pulse mr-1" />
                                        ACTIVE
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-wrap justify-start gap-3 shrink-0 w-full">
                                {user && (
                                    <>
                                        <button
                                            onClick={handleRunMatchIQ}
                                            disabled={isMatching}
                                            className={`w-full sm:w-auto px-8 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl ${matchDetails && !isMatching
                                                ? 'bg-white border border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white'
                                                : 'bg-zinc-900 text-white hover:bg-zinc-800 shadow-zinc-900/10'
                                                } disabled:opacity-50 active:scale-95`}
                                        >
                                            {isMatching ? (
                                                <><RefreshCw size={14} className="animate-spin" /> Analyzing...</>
                                            ) : matchDetails ? (
                                                <><RefreshCw size={14} /> Re-run Match Analysis</>
                                            ) : (
                                                <>Analyze Job Fit</>
                                            )}
                                        </button>
                                    </>
                                )}
                                {!user && (
                                    <Link to="/login" className="w-full sm:w-auto">
                                        <button className="w-full bg-zinc-900 text-white px-8 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95">
                                            Analyze Job Fit <Lock size={12} className="opacity-40" />
                                        </button>
                                    </Link>
                                )}
                                {(job.external_apply_url || job.external_url) && (
                                    <a
                                        href={job.external_apply_url || job.external_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full sm:w-auto bg-[var(--color-primary)] text-white px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-xl shadow-zinc-900/10 active:scale-95 border border-white/10"
                                    >
                                        <ExternalLink size={18} className="text-white" />
                                        Apply Now
                                    </a>
                                )}
                            </div>
                        </div>
                    </BentoCard>
                </div>

                {/* Left Column */}
                <div className="lg:col-span-8 flex flex-col gap-8 min-w-0">

                    {/* MatchedIQModal Integration */}
                    <MatchIQModal
                        isOpen={isMatchModalOpen}
                        onClose={() => setIsMatchModalOpen(false)}
                        matchData={matchDetails}
                        job={job}
                        jobId={id}
                    />

                    <BentoCard className="overflow-hidden min-w-0 flex flex-col items-start relative border border-zinc-100">
                        <JobOverviewCard
                            overviewSentences={overviewSentences}
                            skills={keySkills}
                            location={job.cleanLocation}
                            experience={displayExperience}
                            qualification={displayQualification}
                            salary={displaySalary}
                            workMode={job.work_mode}
                        />

                    </BentoCard>

                    <BentoCard delay={0.2} className="border border-zinc-100">
                        <h2 className="text-[10px] font-bold text-zinc-400 mb-8 pb-3 border-b border-zinc-100 flex items-center gap-3 uppercase tracking-[0.3em]">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                            Interview Preparation
                        </h2>
                        <div className={`relative ${!user ? 'min-h-[250px]' : ''}`}>
                            <div className={!user ? "blur-2xl select-none pointer-events-none opacity-40 transition-all duration-700" : "transition-all duration-500"}>
                                {job.prep_guide_generated?.length > 0 ? (
                                    <div className="grid gap-6">
                                        {job.prep_guide_generated.map((item, idx) => {
                                            const question = typeof item === 'string' ? item : item.question;
                                            const strategy = typeof item === 'string' ? "DEPLOY STAR METHOD" : item.answer_strategy;
                                            return (
                                                <div key={idx} className="p-6 md:p-8 bg-white rounded-3xl border border-[#1C1A17]/10 hover:border-[#1C1A17]/25 hover:shadow-md transition-all flex flex-col items-start text-left shadow-sm w-full">
                                                    <div className="px-3.5 py-1 bg-[#D45B34]/10 text-[#D45B34] rounded-full text-[10px] font-black uppercase tracking-[0.15em] mb-4">
                                                        Question {idx + 1}
                                                    </div>
                                                    <p className="font-bold text-[#1C1A17] mb-6 text-base md:text-lg leading-relaxed">{question}</p>
                                                    <div className="text-xs md:text-sm text-[#1C1A17]/70 font-medium p-5 bg-[#F4F1EA]/40 rounded-2xl border border-[#1C1A17]/5 leading-relaxed w-full">
                                                        <div className="flex flex-col md:flex-row md:items-start gap-2">
                                                            <span className="text-[#D45B34] font-black uppercase tracking-[0.2em] text-[10px] shrink-0 mt-0.5">Strategy</span>
                                                            <span className="text-zinc-600 font-medium">{strategy}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center p-20 text-center bg-zinc-50/50 card border border-dashed border-zinc-200">
                                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-sm mb-10">
                                            <Sparkles className="text-zinc-200" size={32} />
                                        </div>
                                        <p className="mb-10 font-bold uppercase text-xs tracking-widest text-zinc-300">Preparation data pending</p>
                                        <button
                                            onClick={() => fetchJob(true)}
                                            disabled={refreshing}
                                            className="flex items-center gap-3 text-[10px] font-bold text-zinc-600 px-8 py-3.5 border border-zinc-200 rounded-full hover:bg-zinc-900 hover:text-white transition-all uppercase tracking-widest disabled:opacity-30"
                                        >
                                            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                                            {refreshing ? 'Syncing...' : 'Force Refresh'}
                                        </button>
                                    </div>
                                )}
                            </div>
                            {!user && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center backdrop-blur-3xl bg-white/10 card">
                                    <div className="w-20 h-20 bg-zinc-900 text-white card flex items-center justify-center mb-10 shadow-2xl shadow-zinc-900/30">
                                        <Lock size={32} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-zinc-900 tracking-tight mb-3">Protocol Locked</h3>
                                    <p className="text-sm font-medium text-zinc-500 max-w-[280px] leading-relaxed mb-12">
                                        Interview questions require a valid authentication session to decrypt.
                                    </p>
                                    <Link to="/login">
                                        <button className="px-12 py-5 bg-zinc-900 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl shadow-zinc-900/10 active:scale-95">
                                            Authorize Access
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </BentoCard>

                    {/* Recommended Jobs */}
                    {recommendedJobs.length > 0 && (
                        <div className="w-full">
                            <h2 className="text-sm font-black text-black mb-6 flex items-center justify-start gap-3 uppercase tracking-[0.3em] w-full">
                                <Sparkles size={16} /> Recommended Opportunities
                            </h2>
                            <MatchedJobsSection matchedJobs={recommendedJobs} isAuthenticated={!!user} />
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-4 flex flex-col gap-8 min-w-0">
                    <BentoCard delay={0.1} className="flex flex-col items-start border border-zinc-100">
                        <h2 className="text-xs font-bold text-zinc-400 mb-10 pb-4 border-b border-zinc-100 flex items-center justify-start gap-3 uppercase tracking-[0.3em] w-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                            Required Skills
                        </h2>
                        {keySkills.length > 0 ? (
                            <div className="flex flex-wrap justify-start gap-2.5">
                                {keySkills.map((skill, idx) => (
                                    <span key={idx} className="px-5 py-2 bg-zinc-900 text-white rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-zinc-900/10 hover:scale-105 transition-transform cursor-default">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center justify-center py-10 bg-zinc-50/50 rounded-[24px] border border-dashed border-zinc-200 text-center w-full">
                                <p className="font-bold uppercase text-[10px] tracking-widest text-zinc-300">Null metadata extracted</p>
                            </div>
                        )}
                    </BentoCard>

                    <BentoCard delay={0.3} className="flex flex-col items-start border border-zinc-100">
                        <h2 className="text-xs font-bold text-zinc-400 mb-10 pb-4 border-b border-zinc-100 flex items-center justify-start gap-3 uppercase tracking-[0.3em] w-full">
                            <div className="w-1.5 h-1.5 rounded-full bg-zinc-900" />
                            Resume Optimization
                        </h2>
                        <div className={`relative w-full ${!user ? 'min-h-[250px]' : ''}`}>
                            <div className={!user ? "blur-2xl select-none pointer-events-none opacity-40 transition-all duration-700" : "transition-all duration-500"}>
                                {job.resume_guide_generated?.length > 0 ? (
                                    <ul className="space-y-4 w-full">
                                        {job.resume_guide_generated.map((point, idx) => (
                                            <li key={idx} className="flex gap-3 items-start justify-start p-3.5 bg-zinc-50 rounded-xl border border-zinc-100/50 hover:bg-zinc-100 transition-colors">
                                                <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5">
                                                    <CheckCircle size={10} className="text-white" />
                                                </div>
                                                <span className="text-zinc-600 text-[11px] font-medium leading-relaxed">{point}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="flex flex-col items-center text-center py-12 bg-zinc-50/50 rounded-[24px] border border-dashed border-zinc-200 w-full">
                                        <p className="mb-8 font-bold uppercase text-[10px] tracking-widest text-zinc-300">Guidance stream offline</p>
                                        <button
                                            onClick={() => fetchJob(true)}
                                            disabled={refreshing}
                                            className="px-8 py-3.5 border border-zinc-200 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-widest hover:bg-zinc-900 hover:text-white transition-all disabled:opacity-20 flex items-center gap-2"
                                        >
                                            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
                                            Try Sync
                                        </button>
                                    </div>
                                )}
                            </div>
                            {!user && (
                                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-8 text-center bg-white/10 backdrop-blur-2xl rounded-[24px]">
                                    <div className="w-16 h-16 bg-zinc-900 text-white rounded-[20px] flex items-center justify-center mb-6 shadow-xl shadow-zinc-900/20">
                                        <FileText size={24} />
                                    </div>
                                    <h3 className="text-lg font-bold text-zinc-900 tracking-tight mb-2">Protocol Redacted</h3>
                                    <p className="text-xs font-medium text-zinc-500 mb-8 opacity-80 leading-relaxed">
                                        Login to access optimization heuristics.
                                    </p>
                                    <Link to="/login" className="w-full">
                                        <button className="w-full py-4 bg-zinc-900 text-white rounded-full font-bold text-[10px] uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg active:scale-95">
                                            Authorize
                                        </button>
                                    </Link>
                                </div>
                            )}
                        </div>
                        {user && (
                            <button
                                onClick={() => navigate('/ats-analyzer', { state: { jobDescription: job.description_raw } })}
                                className="mt-6 w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md"
                            >
                                Compare with ATS Scanner
                            </button>
                        )}
                    </BentoCard>
                </div>
            </motion.div>
        </div>
    );
};

export default JobDetailPage;
