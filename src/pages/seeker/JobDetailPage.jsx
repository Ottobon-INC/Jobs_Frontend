import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { getJobDetails, getJobMatchScore, matchAllJobs, applyToJob, getMyApplications } from '../../api/jobsApi';
import { submitContactInfo, createHumanMockInterviewRequest } from '../../api/humanMockInterviewApi';
import { MOCK_JOBS } from '../../data/mockJobs';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';
import { sanitizeHTML } from '../../utils/sanitize';
import Loader from '../../components/ui/Loader';
import MatchIQModal from '../../components/ui/MatchIQModal';
import MatchedJobsSection from '../../components/ui/MatchedJobsSection';
import JobOverviewCard from '../../components/ui/JobOverviewCard';
import { getKeySkills, getRoleOverview } from '../../utils/jobOverview';
import { MapPin, ExternalLink, CheckCircle, FileText, ArrowLeft, Building2, RefreshCw, Lock, ChevronUp, ChevronDown, Sparkles, AlertCircle, CalendarRange } from 'lucide-react';
import { motion } from 'framer-motion';
import useDocumentMetadata from '../../hooks/useDocumentMetadata';
import toast from 'react-hot-toast';

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
    const { user, role, profile } = useAuth();
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
    const [application, setApplication] = useState(null);
    const [applying, setApplying] = useState(false);
    const [contactSubmitted, setContactSubmitted] = useState(false);
    const [submittingContact, setSubmittingContact] = useState(false);
    const [contactForm, setContactForm] = useState({ full_name: '', email: '', phone: '', additional_notes: '' });

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

    const fetchApplication = async () => {
        if (!user || role !== ROLES.SEEKER) return;
        try {
            const apps = await getMyApplications();
            const found = apps.find(a => String(a.job_id) === String(id));
            setApplication(found || null);
        } catch (err) {
            console.error("Failed to fetch applications", err);
        }
    };

    const handleApply = async () => {
        setApplying(true);
        try {
            const result = await applyToJob(id);
            setApplication(result);
            if (result.status === 'screening_rejected') {
                toast.error("AI Match Screening score fell below threshold.");
            } else {
                toast.success("AI Screening Passed! Proceed to Technical Mock Interview.");
            }
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.detail || "Application failed. Make sure you have a resume uploaded.");
        } finally {
            setApplying(false);
        }
    };

    useEffect(() => { 
        fetchJob(); 
        fetchApplication();
    }, [id, user]);

    // Pre-fill contact form when profile loads
    useEffect(() => {
        if (profile) {
            setContactForm(prev => ({
                ...prev,
                full_name: prev.full_name || profile.full_name || '',
                email: prev.email || profile.email || '',
            }));
        }
    }, [profile]);

    // Check if contact info was already submitted (phone is a reliable signal)
    useEffect(() => {
        if (application?.status === 'human_interview_pending') {
            // We'll treat a previously submitted phone as "already submitted"
            // The user can always resubmit to update
            setContactSubmitted(false);
        }
    }, [application?.status]);

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        if (!contactForm.full_name || !contactForm.email) {
            toast.error('Name and email are required.');
            return;
        }
        setSubmittingContact(true);
        try {
            if (application?.human_interview_id) {
                // Record already exists — just patch contact fields
                await submitContactInfo(application.human_interview_id, contactForm);
            } else {
                // No record yet (provider just approved, seeker hasn't submitted before)
                // Create a new human_mock_interviews record linked to this job.
                // The service will auto-link it to the application via job_id.
                await createHumanMockInterviewRequest({
                    ...contactForm,
                    job_id: id,
                    status: 'PENDING_APPROVAL',
                });
            }
            setContactSubmitted(true);
            toast.success('Contact details submitted! The provider will be in touch shortly.');
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.detail || 'Submission failed. Please try again.');
        } finally {
            setSubmittingContact(false);
        }
    };

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
                {/* External job notice — shown to seekers when external_apply_url is set */}
                {user && role === ROLES.SEEKER && job.external_apply_url && (() => {
                    const src = (() => {
                        const u = job.external_apply_url;
                        if (u.includes('linkedin'))    return 'LinkedIn';
                        if (u.includes('naukri'))      return 'Naukri';
                        if (u.includes('shine'))       return 'Shine';
                        if (u.includes('internshala')) return 'Internshala';
                        if (u.includes('indeed'))      return 'Indeed';
                        if (u.includes('timesjobs'))   return 'TimesJobs';
                        if (u.includes('apna'))        return 'Apna';
                        if (u.includes('freshers'))    return 'FreshersWorld';
                        try { return new URL(u).hostname.replace('www.', ''); } catch { return 'External Site'; }
                    })();
                    return (
                        <div className="lg:col-span-12">
                            <BentoCard className="border border-zinc-100 shadow-xl">
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-zinc-100 flex items-center justify-center shrink-0">
                                            <ExternalLink className="w-5 h-5 text-zinc-500" />
                                        </div>
                                        <div>
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-500 text-[9px] font-black uppercase tracking-widest rounded-full mb-2">
                                                External Opportunity
                                            </span>
                                            <h3 className="text-sm font-bold text-zinc-900 mb-1">This job is hosted on {src}</h3>
                                            <p className="text-xs text-zinc-500 font-medium leading-relaxed max-w-xl">
                                                This listing was sourced from an external job board. To apply, you'll be redirected to {src}. Our AI screening and multi-round hiring pipeline are not available for external jobs.
                                            </p>
                                        </div>
                                    </div>
                                    <a
                                        href={job.external_apply_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-8 py-3.5 bg-[#D45B34] hover:bg-[#B84A27] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 whitespace-nowrap shrink-0"
                                    >
                                        <ExternalLink size={14} /> Apply on {src}
                                    </a>
                                </div>
                            </BentoCard>
                        </div>
                    );
                })()}

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
                                {!user && !job.external_apply_url && (
                                    <Link to="/login" className="w-full sm:w-auto">
                                        <button className="w-full bg-[#D45B34] text-white px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#B84A27] transition-all flex items-center justify-center gap-2 shadow-xl active:scale-95">
                                            Apply Now
                                        </button>
                                    </Link>
                                )}
                                {/* External job — show redirect button for everyone */}
                                {(job.external_apply_url || job.external_url) && (() => {
                                    const src = (() => {
                                        const u = job.external_apply_url || job.external_url;
                                        if (u.includes('linkedin'))    return 'LinkedIn';
                                        if (u.includes('naukri'))      return 'Naukri';
                                        if (u.includes('shine'))       return 'Shine';
                                        if (u.includes('internshala')) return 'Internshala';
                                        if (u.includes('indeed'))      return 'Indeed';
                                        if (u.includes('timesjobs'))   return 'TimesJobs';
                                        if (u.includes('apna'))        return 'Apna';
                                        if (u.includes('freshers'))    return 'FreshersWorld';
                                        try { return new URL(u).hostname.replace('www.', ''); } catch { return 'External Site'; }
                                    })();
                                    return (
                                        <a
                                            href={job.external_apply_url || job.external_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="w-full sm:w-auto bg-[var(--color-primary)] text-white px-8 py-3.5 rounded-xl font-bold text-sm uppercase tracking-widest hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-xl shadow-zinc-900/10 active:scale-95 border border-white/10"
                                        >
                                            <ExternalLink size={18} className="text-white" />
                                            Apply on {src}
                                        </a>
                                    );
                                })()}
                            </div>
                        </div>
                    </BentoCard>
                </div>

                {user && role === ROLES.SEEKER && !job.external_apply_url && (
                    <div className="lg:col-span-12">
                        <BentoCard className="border border-zinc-100 shadow-xl">
                            <div className="flex items-center gap-2 mb-6">
                                <Sparkles className="w-5 h-5 text-[#D45B34]" />
                                <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-zinc-400">
                                    Hiring Progress & Application Control Panel
                                </h2>
                            </div>

                            {/* Stepper Timeline UI */}
                            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 border-b border-zinc-100 pb-10">
                                {[
                                    {
                                        round: 1,
                                        label: "Round 1: Profile Screening",
                                        status: !application ? "pending" : (application.status === "screening_rejected" ? "failed" : "passed"),
                                        desc: !application ? "Awaiting Submission" : (application.status === "screening_rejected" ? "Failed AI Screen" : `Score: ${application.screening_score}%`)
                                    },
                                    {
                                        round: 2,
                                        label: "Round 2: AI Mock Interview",
                                        status: !application || application.status === "screening_rejected" ? "locked" :
                                                application.status === "mock_interview_pending" ? "current" :
                                                application.status === "mock_interview_completed" ? "review" : "passed",
                                        desc: !application || application.status === "screening_rejected" ? "Locked" :
                                                application.status === "mock_interview_pending" ? "In Progress" :
                                                application.status === "mock_interview_completed" ? "Awaiting Provider Review" :
                                                `Score: ${application.mock_interview_score || 0}%`
                                    },
                                    {
                                        round: 3,
                                        label: "Round 3: Human Panel Interview",
                                        status: !application || ["screening_rejected", "mock_interview_pending", "mock_interview_completed"].includes(application.status) ? "locked" :
                                                application.status === "human_interview_pending" ? "current" : "passed",
                                        desc: !application || ["screening_rejected", "mock_interview_pending", "mock_interview_completed"].includes(application.status) ? "Locked" :
                                                application.status === "human_interview_pending" ? "Awaiting Schedule" : "Scheduled"
                                    }
                                ].map((step, idx) => (
                                    <div key={idx} className="flex-1 flex flex-col items-start text-left relative w-full border border-zinc-100 p-4 bg-zinc-50/50 rounded-2xl">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all duration-300 ${
                                                step.status === "passed" ? "bg-emerald-500 text-white" :
                                                step.status === "current" ? "bg-[#D45B34] text-white animate-pulse" :
                                                step.status === "review" ? "bg-amber-400 text-white animate-pulse" :
                                                step.status === "failed" ? "bg-red-500 text-white" :
                                                step.status === "locked" ? "bg-zinc-100 text-zinc-400 border border-zinc-200" :
                                                "bg-zinc-100 text-zinc-600 border"
                                            }`}>
                                                {step.round}
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-zinc-800">{step.label}</h4>
                                                <p className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider mt-0.5">{step.desc}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Stepper Details / Controls */}
                            <div className="w-full">
                                {!application && (
                                    <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 rounded-2xl border border-zinc-200/50 text-center">
                                        <h3 className="text-base font-bold text-zinc-800 mb-2">Apply to this position</h3>
                                        <p className="text-xs text-zinc-400 max-w-md mb-6 leading-relaxed">
                                            Apply today. The network will automatically perform a semantic profile screening using OpenAI. Ensure your resume is uploaded in profile page.
                                        </p>
                                        <button
                                            onClick={handleApply}
                                            disabled={applying}
                                            className="px-10 py-3.5 bg-[#D45B34] hover:bg-[#B84A27] text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50"
                                        >
                                            {applying ? "Screening Profile..." : "Submit Profile & Apply"}
                                        </button>
                                    </div>
                                )}

                                {application && application.status === "screening_rejected" && (
                                    <div className="p-6 bg-red-50/50 border border-red-200 rounded-2xl">
                                        <div className="flex items-start gap-4">
                                            <AlertCircle className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                                            <div>
                                                <h3 className="text-sm font-bold text-red-800">Application Screen Rejected</h3>
                                                <p className="text-xs text-red-600 font-semibold mt-1">
                                                    Match Score: {application.screening_score}% (Threshold: {job.screening_threshold || 60}%)
                                                </p>
                                                <div className="mt-4 p-4 bg-white rounded-xl border border-red-100 text-xs text-zinc-600 leading-relaxed font-medium">
                                                    <span className="font-bold text-zinc-800 uppercase tracking-widest text-[9px] block mb-2">AI Gap Analysis Feedback</span>
                                                    {application.screening_feedback || "No feedback generated."}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {application && application.status !== "screening_rejected" && (
                                    <div className="space-y-6">
                                        {/* Display screening pass scorecard */}
                                        <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                            <div>
                                                <h3 className="text-sm font-bold text-emerald-800 flex items-center gap-2">
                                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                                    Round 1 Passed! Match Screening Score: {application.screening_score}%
                                                </h3>
                                                <p className="text-xs text-zinc-500 mt-1">
                                                    Your resume and skills were evaluated and passed the provider's threshold.
                                                </p>
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    setMatchDetails({
                                                        score: application.screening_score,
                                                        gap_analysis: application.screening_feedback
                                                    });
                                                    setIsMatchModalOpen(true);
                                                }}
                                                className="px-4 py-2 bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors"
                                            >
                                                View Gap Analysis
                                            </button>
                                        </div>

                                        {/* Round 2 control panel */}
                                        {application.status === "mock_interview_pending" && (
                                            <div className="p-6 bg-amber-50/50 border border-amber-200 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                                <div className="space-y-2">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                        Round 2 Active
                                                    </div>
                                                    <h3 className="text-base font-bold text-zinc-800">AI Technical Mock Interview</h3>
                                                    <p className="text-xs text-zinc-500 max-w-xl leading-relaxed">
                                                        Practice your technical knowledge and code structure. The AI coach evaluates accuracy, confidence, and communication clarity to automatically grade your performance.
                                                    </p>
                                                </div>
                                                <Link 
                                                    to={`/jobs/${id}/mock-interview`}
                                                    className="w-full md:w-auto px-8 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 text-center"
                                                >
                                                    Start AI Mock Interview
                                                </Link>
                                            </div>
                                        )}

                                        {["human_interview_pending", "human_interview_scheduled"].includes(application.status) && (
                                            <div className="p-5 bg-emerald-50/50 border border-emerald-200 rounded-2xl">
                                                <h3 className="text-sm font-bold text-zinc-800 flex items-center gap-2 mb-2">
                                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                                    Round 2 Passed! AI Mock Interview Score: {application.mock_interview_score || 0}%
                                                </h3>
                                                <p className="text-xs text-zinc-500 leading-relaxed">
                                                    Your performance was reviewed and approved by the provider. You've been advanced to Round 3.
                                                </p>
                                            </div>
                                        )}


                                        {/* Round 2 completed – awaiting provider decision */}
                                        {application.status === "mock_interview_completed" && (
                                            <div className="p-6 bg-amber-50/60 border border-amber-200 rounded-2xl flex flex-col md:flex-row items-start md:items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                                                    <span className="text-xl">⏳</span>
                                                </div>
                                                <div>
                                                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[9px] font-black uppercase tracking-widest mb-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                        Awaiting Provider Review
                                                    </div>
                                                    <h3 className="text-sm font-bold text-zinc-800">Your AI Interview is Under Review</h3>
                                                    <p className="text-xs text-zinc-500 mt-1 leading-relaxed max-w-lg">
                                                        Great work! Your AI mock interview transcript and score have been sent to the provider. Once they review and approve your performance, Round 3 will unlock automatically.
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {application.status === "human_interview_pending" && (
                                            <div className="p-6 bg-[#D45B34]/5 border border-[#D45B34]/20 rounded-2xl flex flex-col gap-6">
                                                <div className="space-y-2">
                                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D45B34]/10 text-[#D45B34] rounded-full text-[9px] font-black uppercase tracking-widest">
                                                        🎉 Round 3 Unlocked
                                                    </div>
                                                    <h3 className="text-base font-bold text-zinc-800">Provider Approved You for the Human Panel Interview</h3>
                                                    <p className="text-xs text-zinc-500 max-w-xl leading-relaxed">
                                                        Congratulations! Please confirm your contact details so the provider can reach you to schedule the live panel session.
                                                    </p>
                                                </div>

                                                {contactSubmitted ? (
                                                    <div className="flex items-start gap-4 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                                            <CheckCircle className="w-5 h-5 text-emerald-600" />
                                                        </div>
                                                        <div>
                                                            <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest block mb-0.5">Contact Details Submitted</span>
                                                            <p className="text-xs text-zinc-600 font-medium">Your details have been sent to the provider. You'll receive a meeting invite once they schedule the panel interview.</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <form onSubmit={handleContactSubmit} className="space-y-4 bg-white border border-zinc-100 rounded-2xl p-5 shadow-sm">
                                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Your Contact Information</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Full Name *</label>
                                                                <input
                                                                    type="text"
                                                                    required
                                                                    value={contactForm.full_name}
                                                                    onChange={e => setContactForm(p => ({ ...p, full_name: e.target.value }))}
                                                                    placeholder="Jane Smith"
                                                                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#D45B34]/30 focus:border-[#D45B34] transition-all"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Email Address *</label>
                                                                <input
                                                                    type="email"
                                                                    required
                                                                    value={contactForm.email}
                                                                    onChange={e => setContactForm(p => ({ ...p, email: e.target.value }))}
                                                                    placeholder="jane@example.com"
                                                                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#D45B34]/30 focus:border-[#D45B34] transition-all"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Phone Number</label>
                                                                <input
                                                                    type="tel"
                                                                    value={contactForm.phone}
                                                                    onChange={e => setContactForm(p => ({ ...p, phone: e.target.value }))}
                                                                    placeholder="+91 98765 43210"
                                                                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#D45B34]/30 focus:border-[#D45B34] transition-all"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Additional Notes</label>
                                                                <input
                                                                    type="text"
                                                                    value={contactForm.additional_notes}
                                                                    onChange={e => setContactForm(p => ({ ...p, additional_notes: e.target.value }))}
                                                                    placeholder="Any scheduling preferences..."
                                                                    className="w-full px-4 py-2.5 border border-zinc-200 rounded-xl text-sm font-medium text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#D45B34]/30 focus:border-[#D45B34] transition-all"
                                                                />
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="submit"
                                                            disabled={submittingContact}
                                                            className="w-full md:w-auto px-10 py-3.5 bg-[#D45B34] hover:bg-[#B84A27] disabled:opacity-50 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-2"
                                                        >
                                                            {submittingContact ? (
                                                                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</>
                                                            ) : (
                                                                <>Confirm My Details</>
                                                            )}
                                                        </button>
                                                    </form>
                                                )}
                                            </div>
                                        )}


                                        {application.status === "human_interview_scheduled" && (
                                            <div className="p-6 bg-zinc-900 text-white rounded-2xl relative overflow-hidden border border-zinc-800 shadow-xl">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D45B34]/10 rounded-full blur-2xl" />
                                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                                    <div className="space-y-3">
                                                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#D45B34] text-white rounded-full text-[9px] font-black uppercase tracking-widest">
                                                            Human panel Interview Scheduled
                                                        </div>
                                                        <h3 className="text-base font-bold">Your Live Round is Confirmed!</h3>
                                                        
                                                        {/* Details */}
                                                        <div className="flex flex-col gap-2 text-xs text-zinc-300">
                                                            <div className="flex items-center gap-2">
                                                                <CalendarRange className="w-4 h-4 text-[#D45B34]" />
                                                                <span>Preparation & Live Meeting Details will be sent to email.</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Link 
                                                        to="/my-human-mock-interviews"
                                                        className="px-6 py-3 bg-white text-zinc-950 hover:bg-[#D45B34] hover:text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all text-center"
                                                    >
                                                        Manage Bookings
                                                    </Link>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </BentoCard>
                    </div>
                )}

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
                                            <li key={idx} className="flex gap-4 items-start justify-start p-5 bg-white rounded-2xl border border-zinc-200/80 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all">
                                                <div className="w-6 h-6 rounded-full bg-[#D45B34] flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-[#D45B34]/20">
                                                    <CheckCircle size={14} className="text-white" />
                                                </div>
                                                <span className="text-zinc-800 text-sm font-semibold leading-relaxed">{point}</span>
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
                                className="mt-6 w-full py-3 bg-[#D45B34] hover:bg-[#B84A27] text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-md"
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
