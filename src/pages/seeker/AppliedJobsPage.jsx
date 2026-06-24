import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyApplications } from '../../api/jobsApi';
import { useAuth } from '../../hooks/useAuth';
import Loader from '../../components/ui/Loader';
import { motion } from 'framer-motion';
import {
    Briefcase, CheckCircle, Clock, XCircle, ChevronRight,
    Brain, Users, Calendar, Search, AlertTriangle
} from 'lucide-react';

const PIPELINE_STAGES = [
    { key: 'applied',   label: 'Applied' },
    { key: 'screening', label: 'Screening' },
    { key: 'round2',    label: 'AI Interview' },
    { key: 'round3',    label: 'Panel' },
    { key: 'outcome',   label: 'Outcome' },
];

const STATUS_META = {
    applied:                   { stage: 0, color: 'zinc',    label: 'Applied',              icon: Clock },
    screening_rejected:        { stage: 1, color: 'red',     label: 'Not Selected',         icon: XCircle,    rejected: true },
    mock_interview_pending:    { stage: 2, color: 'blue',    label: 'Round 2 Unlocked',     icon: Brain },
    mock_interview_completed:  { stage: 2, color: 'violet',  label: 'AI Interview Done',    icon: Brain },
    human_interview_pending:   { stage: 3, color: 'orange',  label: 'Round 3 — Contact',    icon: Users },
    human_interview_scheduled: { stage: 3, color: 'emerald', label: 'Panel Scheduled',      icon: Calendar },
    rejected:                  { stage: 4, color: 'red',     label: 'Not Selected',         icon: XCircle,    rejected: true },
    hired:                     { stage: 4, color: 'emerald', label: 'Hired 🎉',             icon: CheckCircle },
};

const colorMap = {
    zinc:    { bg: 'bg-zinc-100',    text: 'text-zinc-600',    border: 'border-zinc-200',    dot: 'bg-zinc-400',    bar: 'bg-zinc-400' },
    blue:    { bg: 'bg-blue-50',     text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500',    bar: 'bg-blue-500' },
    violet:  { bg: 'bg-violet-50',   text: 'text-violet-700',  border: 'border-violet-200',  dot: 'bg-violet-500',  bar: 'bg-violet-500' },
    orange:  { bg: 'bg-orange-50',   text: 'text-orange-700',  border: 'border-orange-200',  dot: 'bg-orange-500',  bar: 'bg-[#D45B34]' },
    emerald: { bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', bar: 'bg-emerald-500' },
    red:     { bg: 'bg-red-50',      text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-400',     bar: 'bg-red-400' },
};

const topBarColor = {
    zinc:    'bg-zinc-300',
    blue:    'bg-blue-400',
    violet:  'bg-violet-400',
    orange:  'bg-[#D45B34]',
    emerald: 'bg-emerald-400',
    red:     'bg-red-400',
};

// ── Score bar ────────────────────────────────────────────
const ScorePill = ({ label, score, hexColor }) => {
    if (score == null) return null;
    const pct = Math.min(100, Math.max(0, score));
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{label}</span>
            <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: hexColor }} />
                </div>
                <span className="text-[10px] font-black text-zinc-700 w-7 text-right">{pct}%</span>
            </div>
        </div>
    );
};

// ── Pipeline stepper ─────────────────────────────────────
const PipelineStepper = ({ status }) => {
    const meta = STATUS_META[status] || STATUS_META['applied'];
    const activeStage = meta.stage;
    const isRejected = meta.rejected;

    return (
        <div className="flex items-center">
            {PIPELINE_STAGES.map((stage, idx) => {
                const isDone    = idx < activeStage;
                const isActive  = idx === activeStage && !isRejected;
                const isFailed  = idx === activeStage && isRejected;
                const isLast    = idx === PIPELINE_STAGES.length - 1;

                return (
                    <div key={stage.key} className="flex items-center">
                        <div className="flex flex-col items-center gap-1">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all
                                ${isFailed  ? 'bg-red-100 border-red-400' :
                                  isActive  ? 'bg-[#D45B34] border-[#D45B34]' :
                                  isDone    ? 'bg-zinc-800 border-zinc-800' :
                                              'bg-white border-zinc-200'}`}>
                                {isFailed   ? <XCircle className="w-3 h-3 text-red-500" /> :
                                 isDone     ? <CheckCircle className="w-3 h-3 text-white" /> :
                                 isActive   ? <div className="w-2 h-2 rounded-full bg-white" /> :
                                              <div className="w-2 h-2 rounded-full bg-zinc-200" />}
                            </div>
                            <span className={`text-[8px] font-bold tracking-wide whitespace-nowrap
                                ${isFailed ? 'text-red-500' : isActive ? 'text-[#D45B34]' : isDone ? 'text-zinc-700' : 'text-zinc-300'}`}>
                                {stage.label}
                            </span>
                        </div>
                        {!isLast && (
                            <div className={`h-[2px] w-8 mb-4 ${isDone ? 'bg-zinc-800' : 'bg-zinc-100'}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// ── Contextual CTA button ────────────────────────────────
const CTA = ({ app }) => {
    switch (app.status) {
        case 'mock_interview_pending':
            return (
                <Link to={`/jobs/${app.job_id}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95">
                    <Brain className="w-3.5 h-3.5" /> Start AI Interview
                </Link>
            );
        case 'mock_interview_completed':
            return (
                <Link to={`/jobs/${app.job_id}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95">
                    <CheckCircle className="w-3.5 h-3.5" /> View Results
                </Link>
            );
        case 'human_interview_pending':
            return (
                <Link to={`/jobs/${app.job_id}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#D45B34] hover:bg-[#B84A27] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95">
                    <Users className="w-3.5 h-3.5" /> Confirm Details
                </Link>
            );
        case 'human_interview_scheduled':
            return (
                <Link to={`/jobs/${app.job_id}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm active:scale-95">
                    <Calendar className="w-3.5 h-3.5" /> View Booking
                </Link>
            );
        default:
            return (
                <Link to={`/jobs/${app.job_id}`}
                    className="flex items-center gap-1.5 px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95">
                    View Job <ChevronRight className="w-3 h-3" />
                </Link>
            );
    }
};

// ── Application card ─────────────────────────────────────
const ApplicationCard = ({ app, index }) => {
    const meta   = STATUS_META[app.status] || STATUS_META['applied'];
    const colors = colorMap[meta.color] || colorMap.zinc;
    const barCls = topBarColor[meta.color] || 'bg-zinc-200';
    const initials = (app.company_name || '?').slice(0, 2).toUpperCase();

    return (
        <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.055 }}
            className="bg-white border border-zinc-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        >
            {/* Accent bar */}
            <div className={`h-1 w-full ${barCls}`} />

            <div className="p-5 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-zinc-900 flex items-center justify-center shrink-0">
                            <span className="text-white text-xs font-black">{initials}</span>
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-zinc-900 leading-tight line-clamp-1">
                                {app.job_title || 'Job Position'}
                            </h3>
                            <p className="text-xs text-zinc-500 font-medium mt-0.5">{app.company_name || 'Company'}</p>
                            <p className="text-[9px] text-zinc-400 mt-0.5">
                                Applied {new Date(app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                    </div>

                    {/* Status badge */}
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider shrink-0 ${colors.bg} ${colors.text} ${colors.border}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                        {meta.label}
                    </div>
                </div>

                {/* Pipeline stepper */}
                <div className="overflow-x-auto -mx-1 px-1">
                    <PipelineStepper status={app.status} />
                </div>

                {/* Scores */}
                {(app.screening_score != null || app.mock_interview_score != null) && (
                    <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50 rounded-xl">
                        <ScorePill label="Screening" score={app.screening_score}      hexColor="#3b82f6" />
                        <ScorePill label="AI Interview" score={app.mock_interview_score} hexColor="#10b981" />
                    </div>
                )}

                {/* Rejection notice */}
                {meta.rejected && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-red-700 font-medium leading-relaxed">
                            {app.status === 'screening_rejected'
                                ? "Profile score didn't meet the threshold. Keep improving and try other roles!"
                                : "This application wasn't taken forward. Don't give up — the right role is out there!"}
                        </p>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-50">
                    <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                        Updated {new Date(app.updated_at || app.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <CTA app={app} />
                </div>
            </div>
        </motion.div>
    );
};

// ── Page ─────────────────────────────────────────────────
const AppliedJobsPage = () => {
    const { isAuthenticated } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading]           = useState(true);
    const [filter, setFilter]             = useState('all');

    useEffect(() => {
        if (!isAuthenticated) return;
        (async () => {
            setLoading(true);
            try {
                const data = await getMyApplications();
                setApplications(data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, [isAuthenticated]);

    const FILTERS = [
        { key: 'all',      label: 'All' },
        { key: 'active',   label: 'Active',        statuses: ['mock_interview_pending', 'mock_interview_completed', 'human_interview_pending', 'human_interview_scheduled'] },
        { key: 'pending',  label: 'Action Needed', statuses: ['mock_interview_pending', 'human_interview_pending'] },
        { key: 'rejected', label: 'Not Selected',  statuses: ['screening_rejected', 'rejected'] },
    ];

    const filtered     = filter === 'all' ? applications : applications.filter(a => FILTERS.find(x => x.key === filter)?.statuses?.includes(a.status));
    const activeCount  = applications.filter(a => ['mock_interview_pending','mock_interview_completed','human_interview_pending','human_interview_scheduled'].includes(a.status)).length;
    const actionCount  = applications.filter(a => ['mock_interview_pending','human_interview_pending'].includes(a.status)).length;

    if (loading) return <Loader fullScreen variant="logo" />;

    return (
        <div className="min-h-screen bg-[#FBFBFB]">
            <main className="max-w-[1400px] mx-auto pt-8 pb-16 px-4 sm:px-6 md:px-10">

                {/* Page header */}
                <div className="flex flex-col gap-1 mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white text-zinc-400 text-[10px] font-bold uppercase tracking-[0.2em] w-fit border border-zinc-100 shadow-sm mb-4">
                        <Briefcase size={12} />
                        Application Tracker
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-sans font-bold text-zinc-900 tracking-tight">My Applications</h1>
                    <p className="text-zinc-500 text-base font-medium max-w-2xl mt-2">
                        Track every application through the hiring pipeline — from screening to your live panel interview.
                    </p>

                    {/* Stat pills */}
                    {applications.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-5">
                            {[
                                { label: 'Total Applied',  value: applications.length, highlight: false },
                                { label: 'Active',         value: activeCount,          highlight: false },
                                { label: 'Action Needed',  value: actionCount,          highlight: actionCount > 0 },
                            ].map(s => (
                                <div key={s.label}
                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border bg-white shadow-sm ${s.highlight ? 'border-[#D45B34]/30' : 'border-zinc-100'}`}>
                                    <span className={`text-xl font-black ${s.highlight ? 'text-[#D45B34]' : 'text-zinc-900'}`}>{s.value}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">{s.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Empty state */}
                {applications.length === 0 ? (
                    <div className="text-center py-20 bg-white border border-zinc-100 rounded-3xl shadow-sm max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-zinc-50 rounded-2xl grid place-items-center mx-auto mb-6">
                            <Briefcase size={28} className="text-zinc-300" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-900 mb-2">No applications yet</h3>
                        <p className="text-zinc-400 text-sm font-medium mb-7 max-w-xs mx-auto">
                            Browse the job board and hit Apply to start tracking your pipeline.
                        </p>
                        <Link to="/jobs">
                            <button className="px-7 py-3 bg-zinc-900 text-white rounded-full text-[11px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2 mx-auto active:scale-[0.98]">
                                <Search size={14} /> Browse Jobs
                            </button>
                        </Link>
                    </div>
                ) : (
                    <>
                        {/* Filter tabs */}
                        <div className="flex items-center gap-2 mb-7 overflow-x-auto pb-1">
                            {FILTERS.map(f => (
                                <button key={f.key} onClick={() => setFilter(f.key)}
                                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                                        ${filter === f.key
                                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                                            : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'}`}>
                                    {f.label}
                                    {f.key === 'pending' && actionCount > 0 && (
                                        <span className="px-1.5 py-0.5 bg-[#D45B34] text-white rounded-full text-[8px] font-black">{actionCount}</span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {filtered.length === 0 ? (
                            <div className="text-center py-12 text-zinc-400 text-sm font-medium">
                                No applications in this category.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filtered.map((app, i) => (
                                    <ApplicationCard key={app.id} app={app} index={i} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
};

export default AppliedJobsPage;
