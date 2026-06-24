import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Loader from '../../components/ui/Loader';
import {
    Trash2, AlertCircle, Briefcase, Eye, PlusCircle, Clock, Sparkles,
    Building2, X, ChevronRight, CheckCircle2, User, FileText, ExternalLink,
    Calendar, Video, ArrowUpRight, CheckCircle, XCircle, AlertTriangle,
    ChevronDown, MessageSquare, Star
} from 'lucide-react';
import {
    deleteJob,
    getProviderJobs,
    getJobApplicants,
    promoteApplicant,
    rejectApplicant,
    getMockInterviewDetails
} from '../../api/jobsApi';
import {
    approveHumanMockInterview,
    rejectHumanMockInterview,
    getHumanMockInterviewById
} from '../../api/humanMockInterviewApi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// ─── Pipeline configuration ───────────────────────────────────────────────────
const PIPELINE_STAGES = [
    { key: 'applied',                   label: 'Applied',          short: 'R1' },
    { key: 'mock_interview_pending',    label: 'AI Mock Pending',  short: 'R2' },
    { key: 'mock_interview_completed',  label: 'Awaiting Review',  short: 'Rev' },
    { key: 'human_interview_pending',   label: 'Human Interview',  short: 'R3' },
    { key: 'human_interview_scheduled', label: 'Scheduled',        short: '✓' },
];

const STATUS_META = {
    applied:                   { label: 'Applied',               color: 'zinc',   bg: 'bg-zinc-100',    text: 'text-zinc-600',   pulse: false },
    screening_rejected:        { label: 'Screening Rejected',    color: 'red',    bg: 'bg-red-100',     text: 'text-red-600',    pulse: false },
    mock_interview_pending:    { label: 'AI Mock Pending',       color: 'amber',  bg: 'bg-amber-100',   text: 'text-amber-700',  pulse: true  },
    mock_interview_completed:  { label: 'Awaiting Your Review',  color: 'orange', bg: 'bg-orange-100',  text: 'text-orange-700', pulse: true  },
    human_interview_pending:   { label: 'Human Round Unlocked',  color: 'purple', bg: 'bg-purple-100',  text: 'text-purple-700', pulse: false },
    human_interview_scheduled: { label: 'Interview Scheduled',   color: 'emerald',bg: 'bg-emerald-100', text: 'text-emerald-700',pulse: false },
    rejected:                  { label: 'Rejected',              color: 'rose',   bg: 'bg-rose-100',    text: 'text-rose-700',   pulse: false },
    hired:                     { label: 'Hired',                 color: 'green',  bg: 'bg-green-100',   text: 'text-green-700',  pulse: false },
};

const NEXT_ACTION_DESC = {
    applied:                   'Candidate has applied. Waiting for AI screening result.',
    screening_rejected:        'Candidate did not pass the AI screening threshold.',
    mock_interview_pending:    'Candidate is scheduled to complete the AI mock interview.',
    mock_interview_completed:  'AI mock interview done. Review the summary below and approve or reject.',
    human_interview_pending:   'You approved this candidate. Schedule the live panel interview.',
    human_interview_scheduled: 'Live panel interview is booked. Awaiting completion.',
    rejected:                  'Candidate has been rejected from this pipeline.',
    hired:                     'Candidate was successfully hired.',
};

// ─── Stage index helper ────────────────────────────────────────────────────────
const getStageIndex = (status) => {
    if (status === 'screening_rejected' || status === 'rejected') return -1;
    return PIPELINE_STAGES.findIndex(s => s.key === status);
};

// ─── Pipeline Stepper ─────────────────────────────────────────────────────────
const PipelineStepper = ({ status }) => {
    const isRejected = status === 'screening_rejected' || status === 'rejected';
    const currentIdx = getStageIndex(status);
    return (
        <div className="flex items-center gap-0 w-full mt-3">
            {PIPELINE_STAGES.map((stage, idx) => {
                const done = !isRejected && idx < currentIdx;
                const active = !isRejected && idx === currentIdx;
                return (
                    <div key={stage.key} className="flex items-center flex-1 min-w-0">
                        <div className="flex flex-col items-center flex-shrink-0">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black border-2 transition-all ${
                                isRejected ? 'bg-zinc-100 border-zinc-200 text-zinc-400' :
                                done        ? 'bg-emerald-500 border-emerald-500 text-white' :
                                active      ? 'bg-zinc-900 border-zinc-900 text-white ring-2 ring-zinc-300 ring-offset-1' :
                                              'bg-white border-zinc-200 text-zinc-400'
                            }`}>
                                {done ? <CheckCircle2 className="w-3 h-3" /> : stage.short}
                            </div>
                            <span className={`text-[8px] font-bold mt-1 text-center leading-tight max-w-[40px] ${
                                active ? 'text-zinc-900' : done ? 'text-emerald-600' : 'text-zinc-400'
                            }`}>{stage.label}</span>
                        </div>
                        {idx < PIPELINE_STAGES.length - 1 && (
                            <div className={`flex-1 h-0.5 mb-4 mx-1 rounded-full ${
                                done ? 'bg-emerald-400' : 'bg-zinc-200'
                            }`} />
                        )}
                    </div>
                );
            })}
            {isRejected && (
                <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-rose-100 rounded-full">
                    <XCircle className="w-3 h-3 text-rose-500" />
                    <span className="text-[8px] font-black text-rose-600 uppercase tracking-wider">Rejected</span>
                </div>
            )}
        </div>
    );
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const meta = STATUS_META[status] || STATUS_META['applied'];
    return (
        <span className={`inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${meta.bg} ${meta.text}`}>
            {meta.pulse && (
                <span className={`w-1.5 h-1.5 rounded-full bg-current animate-pulse`} />
            )}
            {meta.label}
        </span>
    );
};

// ─── Main Component ────────────────────────────────────────────────────────────
const MyListingsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Applicant Tracking states
    const [selectedJob, setSelectedJob] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loadingApplicants, setLoadingApplicants] = useState(false);
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [applicantMockDetails, setApplicantMockDetails] = useState(null);
    const [loadingMockDetails, setLoadingMockDetails] = useState(false);
    const [schedulingApplicant, setSchedulingApplicant] = useState(null);
    const [approvingId, setApprovingId] = useState(null);
    const [rejectingId, setRejectingId] = useState(null);
    const [humanInterviewDetails, setHumanInterviewDetails] = useState(null);
    const [loadingHumanDetails, setLoadingHumanDetails] = useState(false);

    // Scheduling Fields
    const [scheduledAt, setScheduledAt] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [adminNotes, setAdminNotes] = useState('');

    const handleViewApplicants = async (job) => {
        setSelectedJob(job);
        setLoadingApplicants(true);
        try {
            const data = await getJobApplicants(job.id);
            setApplicants(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load applicants");
        } finally {
            setLoadingApplicants(false);
        }
    };

    const handleApproveToRound3 = async (appId) => {
        setApprovingId(appId);
        const toastId = toast.loading("Approving candidate for Round 3...");
        try {
            const updated = await promoteApplicant(appId);
            setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: updated.status } : a));
            if (selectedApplicant?.id === appId) setSelectedApplicant(prev => ({ ...prev, status: updated.status }));
            toast.success("Candidate approved! They can now schedule their Human Interview.", { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error(err?.response?.data?.detail || "Approval failed.", { id: toastId });
        } finally {
            setApprovingId(null);
        }
    };

    const handleReject = async (appId) => {
        if (!window.confirm("Are you sure you want to reject this candidate? This cannot be undone.")) return;
        setRejectingId(appId);
        const toastId = toast.loading("Rejecting applicant...");
        try {
            const updated = await rejectApplicant(appId);
            setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: updated.status } : a));
            if (selectedApplicant?.id === appId) setSelectedApplicant(prev => ({ ...prev, status: updated.status }));
            toast.success("Candidate marked as rejected.", { id: toastId });
        } catch (err) {
            console.error(err);
            toast.error("Rejection failed.", { id: toastId });
        } finally {
            setRejectingId(null);
        }
    };

    const handleOpenDetails = async (applicant) => {
        setSelectedApplicant(applicant);
        setApplicantMockDetails(null);
        setHumanInterviewDetails(null);
        if (applicant.mock_interview_id) {
            setLoadingMockDetails(true);
            try {
                const details = await getMockInterviewDetails(applicant.mock_interview_id);
                setApplicantMockDetails(details);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingMockDetails(false);
            }
        }
        if (applicant.human_interview_id && applicant.status === 'human_interview_pending') {
            setLoadingHumanDetails(true);
            try {
                const details = await getHumanMockInterviewById(applicant.human_interview_id);
                setHumanInterviewDetails(details);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingHumanDetails(false);
            }
        }
    };

    const handleScheduleInit = (app) => {
        setSchedulingApplicant(app);
        setScheduledAt('');
        setMeetingLink('');
        setAdminNotes('');
    };

    const handleScheduleConfirm = async (e) => {
        e.preventDefault();
        if (!scheduledAt || !meetingLink) {
            toast.error("Please fill in Date/Time and Meeting Link");
            return;
        }
        const toastId = toast.loading("Scheduling live panel interview...");
        try {
            const data = {
                scheduled_at: new Date(scheduledAt).toISOString(),
                meeting_link: meetingLink,
                admin_notes: adminNotes
            };
            await approveHumanMockInterview(schedulingApplicant.human_interview_id, data);
            const updatedApplicants = await getJobApplicants(selectedJob.id);
            setApplicants(updatedApplicants);
            toast.success("Interview scheduled and candidate notified!", { id: toastId });
            setSchedulingApplicant(null);
        } catch (err) {
            console.error(err);
            toast.error("Scheduling failed. Please try again.", { id: toastId });
        }
    };

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                setLoading(true);
                const data = await getProviderJobs();
                setJobs(data);
            } catch (error) {
                console.error('Failed to fetch jobs:', error);
                setError('Failed to load listings');
            } finally {
                setLoading(false);
            }
        };
        fetchJobs();
    }, []);

    const handleDelete = async (jobId) => {
        if (!window.confirm('Are you sure you want to permanently delete this job requirement? This action cannot be undone.')) return;
        const originalJobs = [...jobs];
        try {
            setJobs(jobs.filter(job => job.id !== jobId));
            await deleteJob(jobId);
        } catch (error) {
            console.error('Deletion failed:', error);
            alert('Failed to delete job. Please try again.');
            setJobs(originalJobs);
        }
    };

    if (loading) return <Loader fullScreen />;

    return (
        <div className="max-w-[1600px] mx-auto pt-8 pb-12 px-6 md:px-10 bg-[#FBFBFB] min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 relative">
                <div className="w-full">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-transparent text-zinc-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-8 border border-zinc-200">
                        <span className="text-zinc-400 text-xs">#</span> EMPLOYER DASHBOARD
                    </div>
                    <h1 className="text-5xl md:text-6xl font-sans font-bold mb-4 tracking-tight text-[#1a1a1a]">
                        Job Listings
                    </h1>
                    <p className="text-zinc-500 max-w-xl text-lg leading-relaxed font-medium">
                        Manage your job postings and monitor applicant engagement in real-time.
                    </p>
                </div>
                <Link to="/provider/create" className="md:absolute md:right-0 md:bottom-2 shrink-0">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-[#09090b] text-white px-8 py-3.5 rounded-full font-bold text-[11px] uppercase tracking-[0.15em] hover:bg-black transition-all flex items-center gap-3 shadow-xl"
                    >
                        <PlusCircle size={16} /> INJECT NEW SIGNAL
                    </motion.button>
                </Link>
            </header>

            {error && (
                <div className="mb-10 p-6 bg-rose-50 text-rose-600 card border border-rose-100 flex items-center gap-4 text-xs font-bold uppercase tracking-widest">
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}

            {jobs.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 glass-card premium-shadow"
                >
                    <div className="w-24 h-24 bg-white/50 rounded-2xl grid place-items-center mx-auto mb-8 shadow-sm">
                        <Briefcase size={40} className="text-[#313851]" />
                    </div>
                    <h3 className="text-2xl font-bold text-[#313851] mb-2 font-display tracking-tight">Zero Active Signals</h3>
                    <span className="text-[11px] font-bold text-[#313851] uppercase tracking-[0.2em] bg-white/50 px-3 py-1.5 rounded-lg border border-[#C2CBD3] block mb-10 w-max mx-auto">
                        System: Online
                    </span>
                    <Link to="/provider/create">
                        <button className="premium-button text-white shadow-xl max-w-xs mx-auto" style={{ backgroundColor: '#313851' }}>
                            Initialize First Signal
                        </button>
                    </Link>
                </motion.div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    <AnimatePresence mode="popLayout">
                        {jobs.map((job, idx) => (
                            <motion.div
                                key={job.id}
                                layout
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                                transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1], delay: idx * 0.05 }}
                                className="group relative h-full"
                            >
                                <div
                                    className="relative h-full overflow-hidden glass-card premium-shadow premium-hover flex flex-col pt-0"
                                    style={{ backgroundColor: 'var(--color-job-card)', borderColor: 'rgba(49, 56, 81, 0.45)' }}
                                >
                                    {/* Status Bar */}
                                    <div className="px-8 pt-8 pb-3 relative z-10 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'rgba(49, 56, 81, 0.65)' }}>
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'rgba(49, 56, 81, 0.65)' }} />
                                                <span>{job.status === 'active' ? 'Active' : 'Archived'}</span>
                                            </div>
                                            {job.is_featured && (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-700 border border-amber-200/60 shadow-sm">
                                                    <Sparkles className="w-2.5 h-2.5 text-amber-600" /> Featured
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[11px] font-semibold" style={{ color: 'rgba(49, 56, 81, 0.65)' }}>
                                            {job.created_at ? new Date(job.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'N/A'}
                                        </span>
                                    </div>

                                    {/* Company Name */}
                                    {job.company_name && (
                                        <div className="px-8 pb-1 relative z-10 flex items-center gap-2">
                                            <Building2 size={12} className="text-zinc-400" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                                                {job.company_name}
                                            </span>
                                        </div>
                                    )}

                                    {/* Job Title */}
                                    <div className="px-8 pb-4 relative z-10">
                                        <h3 className="font-display font-extrabold tracking-tight leading-snug text-[22px] transition-colors line-clamp-2" style={{ color: 'var(--color-primary)' }}>
                                            {job.title}
                                        </h3>
                                    </div>

                                    {/* Skills Pills */}
                                    <div className="px-8 pt-1 pb-6 relative z-10 flex-1">
                                        <div className="flex flex-wrap gap-2">
                                            {(job.skills_required || []).slice(0, 3).map((skill, sIdx) => (
                                                <span
                                                    key={sIdx}
                                                    className="text-[10px] font-medium px-4 py-2 border rounded-full capitalize tracking-wide"
                                                    style={{ backgroundColor: 'var(--color-job-card)', color: 'rgba(49, 56, 81, 0.85)', borderColor: 'rgba(49, 56, 81, 0.45)' }}
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Bottom Action Bar */}
                                    <div className="px-8 pb-8 relative z-10 flex flex-col gap-2 w-full">
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleViewApplicants(job)}
                                                className="flex-1 bg-[#D45B34] text-white rounded-xl py-3.5 font-bold text-xs uppercase tracking-wider hover:bg-[#B84A27] transition-all shadow-sm active:scale-95 text-center"
                                            >
                                                Applicants
                                            </button>
                                            <Link to={`/jobs/${job.id}`} className="flex-1">
                                                <button className="w-full rounded-xl border py-3.5 font-bold text-xs uppercase tracking-wider hover:bg-zinc-150 transition-all active:scale-95 text-center" style={{ borderColor: 'rgba(49, 56, 81, 0.45)', color: 'var(--color-primary)' }}>
                                                    View Job
                                                </button>
                                            </Link>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(job.id)}
                                            className="w-full py-2.5 rounded-xl font-sans font-bold text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] border hover:bg-rose-50"
                                            style={{
                                                backgroundColor: 'transparent',
                                                borderColor: '#fecdd3',
                                                color: '#e11d48'
                                            }}
                                        >
                                            <Trash2 size={12} /> Delete Listing
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* ── 1. Applicants Drawer ── */}
            <AnimatePresence>
                {selectedJob && (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedJob(null)}
                            className="fixed inset-0 bg-black"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-2xl bg-white border-l h-full shadow-2xl flex flex-col z-10"
                        >
                            {/* Drawer Header */}
                            <div className="p-6 sm:p-8 border-b flex justify-between items-start">
                                <div>
                                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Applicant Tracking</span>
                                    <h2 className="text-xl font-bold text-zinc-900 leading-tight">{selectedJob.title}</h2>
                                    <p className="text-xs text-zinc-500 mt-1">Total {applicants.length} Candidates</p>
                                </div>
                                <button
                                    onClick={() => setSelectedJob(null)}
                                    className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-400 hover:text-zinc-600 transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Drawer Content */}
                            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-4">
                                {loadingApplicants ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
                                        <div className="w-8 h-8 border-2 border-[#D45B34] border-t-transparent rounded-full animate-spin mb-4" />
                                        <p className="text-xs font-bold uppercase tracking-wider">Loading Applicants...</p>
                                    </div>
                                ) : applicants.length === 0 ? (
                                    <div className="text-center py-20 bg-zinc-50 rounded-2xl border border-dashed p-8">
                                        <User className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                                        <h4 className="font-bold text-zinc-700">No applicants yet</h4>
                                        <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">This job listing hasn't received any signals. Ensure the match threshold isn't set too high!</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {applicants.map((app) => {
                                            const meta = STATUS_META[app.status] || STATUS_META['applied'];
                                            const needsReview = app.status === 'mock_interview_completed';
                                            return (
                                                <motion.div
                                                    key={app.id}
                                                    layout
                                                    className={`p-5 bg-white border rounded-2xl transition-all cursor-pointer flex flex-col gap-3 relative ${
                                                        needsReview
                                                            ? 'border-orange-300 shadow-md shadow-orange-50 hover:shadow-orange-100'
                                                            : 'border-zinc-200/80 hover:border-[#D45B34] hover:shadow-md'
                                                    }`}
                                                    onClick={() => handleOpenDetails(app)}
                                                >
                                                    {/* Needs Review Banner */}
                                                    {needsReview && (
                                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-amber-400 rounded-t-2xl" />
                                                    )}

                                                    <div className="flex justify-between items-start pt-1">
                                                        <div>
                                                            <h4 className="font-bold text-zinc-900">{app.seeker_name || "Anonymous Seeker"}</h4>
                                                            <p className="text-xs text-zinc-400">{app.seeker_email}</p>
                                                        </div>
                                                        <StatusBadge status={app.status} />
                                                    </div>

                                                    {/* Scores */}
                                                    <div className="flex gap-4 text-xs font-semibold text-zinc-500">
                                                        <span>Screening: <strong className="text-zinc-800">{app.screening_score}%</strong></span>
                                                        {app.mock_interview_score != null && (
                                                            <span>Mock: <strong className="text-[#D45B34]">{app.mock_interview_score}%</strong></span>
                                                        )}
                                                    </div>

                                                    {/* Pipeline Stepper */}
                                                    <PipelineStepper status={app.status} />

                                                    {/* CTA hint */}
                                                    <div className="flex items-center justify-between border-t pt-3 mt-1">
                                                        {needsReview ? (
                                                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-wider flex items-center gap-1">
                                                                <AlertTriangle className="w-3 h-3" /> Action Required
                                                            </span>
                                                        ) : (
                                                            <span className="text-[10px] text-zinc-400 font-semibold">{NEXT_ACTION_DESC[app.status] || ''}</span>
                                                        )}
                                                        <div className="flex items-center gap-1 text-[#D45B34] text-xs font-semibold">
                                                            <span>View Details</span>
                                                            <ChevronRight className="w-3.5 h-3.5" />
                                                        </div>
                                                    </div>

                                                    {/* Inline schedule form for human_interview_pending */}
                                                    {app.status === 'human_interview_pending' && app.human_interview_id && (
                                                        <div className="mt-1 pt-3 border-t border-dashed" onClick={(e) => e.stopPropagation()}>
                                                            {schedulingApplicant?.id === app.id ? (
                                                                <form onSubmit={handleScheduleConfirm} className="space-y-4 bg-zinc-50 p-4 rounded-xl border">
                                                                    <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Schedule Panel Interview</h5>
                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div>
                                                                            <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-1">Date & Time</label>
                                                                            <input
                                                                                type="datetime-local"
                                                                                required
                                                                                value={scheduledAt}
                                                                                onChange={(e) => setScheduledAt(e.target.value)}
                                                                                className="w-full p-2 bg-white border rounded text-xs"
                                                                            />
                                                                        </div>
                                                                        <div>
                                                                            <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-1">Meeting Link</label>
                                                                            <input
                                                                                type="url"
                                                                                required
                                                                                value={meetingLink}
                                                                                placeholder="https://zoom.us/j/..."
                                                                                onChange={(e) => setMeetingLink(e.target.value)}
                                                                                className="w-full p-2 bg-white border rounded text-xs"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-1">Interviewer Notes</label>
                                                                        <textarea
                                                                            value={adminNotes}
                                                                            rows={2}
                                                                            placeholder="Panel details, notes, etc."
                                                                            onChange={(e) => setAdminNotes(e.target.value)}
                                                                            className="w-full p-2 bg-white border rounded text-xs resize-none"
                                                                        />
                                                                    </div>
                                                                    <div className="flex gap-2">
                                                                        <button type="submit" className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-black uppercase tracking-wider">
                                                                            Confirm Schedule
                                                                        </button>
                                                                        <button type="button" onClick={() => setSchedulingApplicant(null)} className="px-4 py-2 border rounded text-[10px] font-black uppercase tracking-wider">
                                                                            Cancel
                                                                        </button>
                                                                    </div>
                                                                </form>
                                                            ) : (
                                                                <button
                                                                    onClick={() => handleScheduleInit(app)}
                                                                    className="w-full py-2 bg-[#D45B34] text-white rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-[#B84A27] transition-colors"
                                                                >
                                                                    Confirm & Schedule Interview
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ── 2. Applicant Detail Modal ── */}
            <AnimatePresence>
                {selectedApplicant && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedApplicant(null)}
                            className="fixed inset-0 bg-black"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2rem] border shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col z-10 relative text-left"
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white rounded-t-[2rem] z-20 border-b">
                                {/* Status Banner */}
                                {(() => {
                                    const meta = STATUS_META[selectedApplicant.status] || STATUS_META['applied'];
                                    const desc = NEXT_ACTION_DESC[selectedApplicant.status] || '';
                                    return (
                                        <div className={`${meta.bg} px-8 pt-6 pb-4 rounded-t-[2rem]`}>
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest ${meta.text} flex items-center gap-1.5`}>
                                                        {meta.pulse && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
                                                        Current Stage
                                                    </span>
                                                    <p className={`text-base font-bold mt-0.5 ${meta.text}`}>{meta.label}</p>
                                                    <p className="text-xs text-zinc-600 mt-1 max-w-md">{desc}</p>
                                                </div>
                                                <button
                                                    onClick={() => setSelectedApplicant(null)}
                                                    className="p-2 hover:bg-white/50 rounded-lg text-zinc-500 transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                            {/* Pipeline stepper in modal */}
                                            <div className="mt-4">
                                                <PipelineStepper status={selectedApplicant.status} />
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Candidate Identity */}
                                <div className="px-8 py-5 flex items-center justify-between">
                                    <div>
                                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Candidate Profile</span>
                                        <h3 className="text-2xl font-bold text-zinc-900">{selectedApplicant.seeker_name || "Anonymous Seeker"}</h3>
                                        <p className="text-xs text-zinc-500 font-semibold">{selectedApplicant.seeker_email}</p>
                                    </div>
                                    <div className="flex gap-2 flex-wrap justify-end">
                                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-zinc-100 text-zinc-700 rounded-full">
                                            Match: {selectedApplicant.screening_score}%
                                        </span>
                                        {selectedApplicant.mock_interview_score != null && (
                                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 bg-amber-100 text-amber-800 rounded-full">
                                                AI Mock: {selectedApplicant.mock_interview_score}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-8 space-y-8">

                                {/* Round 1 — Screening */}
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        Round 1 — AI Screening Analysis
                                    </h4>
                                    <div className="p-4 bg-zinc-50 rounded-2xl border text-xs text-zinc-600 leading-relaxed font-medium">
                                        <span className="font-bold text-zinc-800 uppercase tracking-widest text-[9px] block mb-2">AI Gap Analysis</span>
                                        {selectedApplicant.screening_feedback || "No screening feedback available."}
                                    </div>
                                </div>

                                {/* Round 2 — AI Mock Interview */}
                                {selectedApplicant.mock_interview_id && (
                                    <div>
                                        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-3 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-[#D45B34]" />
                                            Round 2 — AI Mock Interview Summary
                                        </h4>

                                        {loadingMockDetails ? (
                                            <div className="flex items-center justify-center p-10 text-zinc-400 text-xs font-bold uppercase tracking-wider gap-3">
                                                <div className="w-5 h-5 border-2 border-[#D45B34] border-t-transparent rounded-full animate-spin" />
                                                Loading AI Analysis...
                                            </div>
                                        ) : applicantMockDetails ? (
                                            <div className="space-y-5">
                                                {/* Overall Summary */}
                                                {(applicantMockDetails.admin_review || applicantMockDetails.expert_feedback) && (
                                                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-4">
                                                        <div>
                                                            <span className="text-[9px] font-black text-amber-800 uppercase tracking-widest block mb-2">AI Evaluator — Overall Summary</span>
                                                            <p className="text-xs text-zinc-700 leading-relaxed font-medium">
                                                                {applicantMockDetails.admin_review?.overall_summary || applicantMockDetails.expert_feedback}
                                                            </p>
                                                        </div>
                                                        {applicantMockDetails.admin_review && (
                                                            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-amber-200">
                                                                <div>
                                                                    <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest block mb-2 flex items-center gap-1">
                                                                        <Star className="w-3 h-3" /> Candidate Strengths
                                                                    </span>
                                                                    <ul className="text-[11px] text-zinc-700 space-y-1.5 list-disc list-inside font-medium">
                                                                        {(applicantMockDetails.admin_review.strengths || []).map((s, i) => <li key={i}>{s}</li>)}
                                                                    </ul>
                                                                </div>
                                                                <div>
                                                                    <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest block mb-2 flex items-center gap-1">
                                                                        <AlertTriangle className="w-3 h-3" /> Areas to Improve
                                                                    </span>
                                                                    <ul className="text-[11px] text-rose-700 space-y-1.5 list-disc list-inside font-medium">
                                                                        {(applicantMockDetails.admin_review.improvements || []).map((s, i) => <li key={i}>{s}</li>)}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Transcript */}
                                                {applicantMockDetails.transcript?.length > 0 && (
                                                    <div>
                                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-3 flex items-center gap-2">
                                                            <MessageSquare className="w-3.5 h-3.5" /> Interview Transcript
                                                        </span>
                                                        <div className="max-h-64 overflow-y-auto border rounded-2xl bg-zinc-50 p-4 space-y-3">
                                                            {applicantMockDetails.transcript.map((t, idx) => (
                                                                <div key={idx} className={`p-3 rounded-xl max-w-[85%] text-xs ${
                                                                    t.role === 'user'
                                                                        ? 'bg-zinc-900 text-white ml-auto'
                                                                        : 'bg-white text-zinc-800 border mr-auto'
                                                                }`}>
                                                                    <span className="font-bold text-[9px] uppercase tracking-widest block opacity-60 mb-1">
                                                                        {t.role === 'user' ? 'Candidate' : 'AI Coach'}
                                                                    </span>
                                                                    <p className="leading-relaxed font-medium">{t.content}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="p-6 bg-zinc-50 rounded-2xl border text-center text-xs text-zinc-400">
                                                Mock interview data could not be retrieved.
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Provider Decision: Approve / Reject ── */}
                                {selectedApplicant.status === 'mock_interview_completed' && (
                                    <div className="border-t pt-6">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Your Decision</h4>
                                        <div className="p-5 bg-orange-50 border border-orange-200 rounded-2xl space-y-4">
                                            <p className="text-xs text-zinc-700 font-medium leading-relaxed">
                                                Based on the AI mock interview analysis above, decide whether to advance this candidate to <strong>Round 3: Human Panel Interview</strong>, or reject them from the pipeline.
                                            </p>
                                            <div className="flex gap-3">
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleApproveToRound3(selectedApplicant.id)}
                                                    disabled={approvingId === selectedApplicant.id}
                                                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 transition-colors shadow-md"
                                                >
                                                    {approvingId === selectedApplicant.id ? (
                                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="w-4 h-4" />
                                                    )}
                                                    Approve — Send to Round 3
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleReject(selectedApplicant.id)}
                                                    disabled={rejectingId === selectedApplicant.id}
                                                    className="px-6 py-3 border-2 border-rose-300 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                                                >
                                                    {rejectingId === selectedApplicant.id ? (
                                                        <div className="w-4 h-4 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <XCircle className="w-4 h-4" />
                                                    )}
                                                    Reject
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedApplicant.status === 'human_interview_pending' && selectedApplicant.human_interview_id && (
                                    <div className="border-t pt-6">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-purple-500" />
                                            Round 3 — Schedule Live Panel Interview
                                        </h4>

                                        {/* Candidate Contact Info Card */}
                                        {loadingHumanDetails ? (
                                            <div className="flex items-center gap-3 p-4 bg-zinc-50 rounded-2xl border mb-4 text-xs text-zinc-400 font-bold uppercase tracking-wider">
                                                <div className="w-4 h-4 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin" />
                                                Loading candidate contact info...
                                            </div>
                                        ) : humanInterviewDetails?.phone || humanInterviewDetails?.email ? (
                                            <div className="mb-5 p-5 bg-purple-50 border border-purple-200 rounded-2xl space-y-3">
                                                <span className="text-[9px] font-black text-purple-700 uppercase tracking-widest block">Candidate Contact Details</span>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Name</span>
                                                        <p className="text-xs font-bold text-zinc-800">{humanInterviewDetails.full_name || '—'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Email</span>
                                                        <p className="text-xs font-bold text-zinc-800">{humanInterviewDetails.email || '—'}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Phone</span>
                                                        <p className="text-xs font-bold text-zinc-800">{humanInterviewDetails.phone || '—'}</p>
                                                    </div>
                                                    {humanInterviewDetails.additional_notes && (
                                                        <div>
                                                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block mb-0.5">Notes</span>
                                                            <p className="text-xs text-zinc-600 font-medium">{humanInterviewDetails.additional_notes}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3">
                                                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                                <p className="text-xs text-amber-800 font-medium">Candidate hasn't submitted their contact details yet. They'll appear here once confirmed.</p>
                                            </div>
                                        )}

                                        <div className="p-5 bg-purple-50 border border-purple-200 rounded-2xl">
                                            <p className="text-xs text-zinc-600 font-medium mb-4">
                                                You approved this candidate! Set a date, time, and meeting link for their live panel interview.
                                            </p>
                                            {schedulingApplicant?.id === selectedApplicant.id ? (
                                                <form onSubmit={handleScheduleConfirm} className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div>
                                                            <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-1">Date & Time</label>
                                                            <input
                                                                type="datetime-local"
                                                                required
                                                                value={scheduledAt}
                                                                onChange={(e) => setScheduledAt(e.target.value)}
                                                                className="w-full p-2 bg-white border rounded-lg text-xs"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-1">Meeting Link (Zoom/Meet)</label>
                                                            <input
                                                                type="url"
                                                                required
                                                                value={meetingLink}
                                                                placeholder="https://zoom.us/j/..."
                                                                onChange={(e) => setMeetingLink(e.target.value)}
                                                                className="w-full p-2 bg-white border rounded-lg text-xs"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[8px] font-bold text-zinc-400 uppercase mb-1">Interviewer Notes</label>
                                                        <textarea
                                                            value={adminNotes}
                                                            rows={2}
                                                            placeholder="Panel details, notes for candidate, etc."
                                                            onChange={(e) => setAdminNotes(e.target.value)}
                                                            className="w-full p-2 bg-white border rounded-lg text-xs resize-none"
                                                        />
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <button type="submit" className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2">
                                                            <CheckCircle className="w-4 h-4" /> Confirm Schedule
                                                        </button>
                                                        <button type="button" onClick={() => setSchedulingApplicant(null)} className="px-5 py-2.5 border rounded-xl text-[10px] font-black uppercase tracking-wider">
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </form>
                                            ) : (
                                                <button
                                                    onClick={() => handleScheduleInit(selectedApplicant)}
                                                    className="w-full py-3 bg-[#D45B34] hover:bg-[#B84A27] text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                                                >
                                                    <Calendar className="w-4 h-4" /> Set Interview Schedule
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* ── Scheduled confirmation ── */}
                                {selectedApplicant.status === 'human_interview_scheduled' && (
                                    <div className="border-t pt-6">
                                        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                                                <CheckCircle className="w-5 h-5 text-emerald-600" />
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest block mb-0.5">Interview Confirmed</span>
                                                <p className="text-xs text-zinc-600 font-medium">The panel interview has been scheduled and the candidate has been notified.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* ── Rejected state ── */}
                                {selectedApplicant.status === 'rejected' && (
                                    <div className="border-t pt-6">
                                        <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                                                <XCircle className="w-5 h-5 text-rose-500" />
                                            </div>
                                            <div>
                                                <span className="text-[9px] font-black text-rose-700 uppercase tracking-widest block mb-0.5">Candidate Rejected</span>
                                                <p className="text-xs text-zinc-500 font-medium">This candidate has been removed from the pipeline.</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MyListingsPage;
