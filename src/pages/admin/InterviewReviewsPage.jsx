import { useEffect, useMemo, useState } from 'react';
import { 
    Activity, Bot, CheckCircle, ClipboardList, Search, Send, User, 
    Clock, Award, MessageSquare, Sparkles, ChevronRight, Check, 
    BookOpen, Target, ListTodo, HelpCircle, ArrowRight, CornerDownRight, XCircle,
    LayoutGrid, MessageSquareQuote, CheckSquare, AlertTriangle, AlertCircle
} from 'lucide-react';
import {
    getAdminMockInterviewReview,
    getAdminMockInterviewReviews,
    submitAdminMockInterviewReview,
} from '../../api/mockInterviewApi';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const emptyTemplate = {
    overallSummary: '',
    strengths: '',
    improvements: '',
    topics: '',
    nextSteps: '',
};

const splitLines = (value) =>
    value
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);

const getAvatarStyle = (name) => {
    if (!name) return { bg: 'bg-zinc-100 border-zinc-200 text-zinc-600', text: 'text-zinc-600', initials: '?' };
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || name.substring(0, 2).toUpperCase();
    const hash = name.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
    const colors = [
        { bg: 'bg-indigo-50 border-indigo-100 text-indigo-600', text: 'text-indigo-600', initials },
        { bg: 'bg-emerald-50 border-emerald-100 text-emerald-600', text: 'text-emerald-600', initials },
        { bg: 'bg-amber-50 border-amber-100 text-amber-600', text: 'text-amber-600', initials },
        { bg: 'bg-rose-50 border-rose-100 text-rose-600', text: 'text-rose-600', initials },
        { bg: 'bg-violet-50 border-violet-100 text-violet-600', text: 'text-violet-600', initials },
        { bg: 'bg-cyan-50 border-cyan-100 text-cyan-600', text: 'text-cyan-600', initials },
    ];
    return colors[Math.abs(hash) % colors.length];
};

const StatusBadge = ({ status }) => {
    let bg = 'bg-zinc-50 text-zinc-700 border-zinc-200';
    let label = 'Unknown';
    if (status === 'reviewed') {
        bg = 'bg-emerald-50 text-emerald-700 border-emerald-100/80';
        label = 'Reviewed';
    } else if (status === 'pending_review') {
        bg = 'bg-indigo-50 text-indigo-700 border-indigo-100/80';
        label = 'Pending Review';
    } else if (status === 'in_progress') {
        bg = 'bg-amber-50 text-amber-700 border-amber-100/80';
        label = 'In Progress';
    }
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'pending_review' ? 'bg-indigo-600 animate-ping' : 'bg-current'}`} />
            {label}
        </span>
    );
};

const buildFeedbackMarkdown = ({ overallSummary, strengths, improvements, topics, nextSteps }) => {
    const sections = [
        '# Interview Review',
        '',
        '## Overall Summary',
        overallSummary || 'Summary to be added by admin.',
        '',
        '## Skills You Are Good At',
        ...splitLines(strengths).map((item) => `- ${item}`),
        '',
        '## Skills That Need Improvement',
        ...splitLines(improvements).map((item) => `- ${item}`),
        '',
        '## Topics To Work On',
        ...splitLines(topics).map((item) => `- ${item}`),
        '',
        '## Suggested Next Steps',
        nextSteps || 'Next steps to be added by admin.',
    ];

    return sections.join('\n');
};

const InterviewReviewsPage = () => {
    const { profile, user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [selectedReviewId, setSelectedReviewId] = useState(null);
    const [selectedReview, setSelectedReview] = useState(null);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [form, setForm] = useState(emptyTemplate);
    const [loading, setLoading] = useState(true);
    const [detailLoading, setDetailLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [isSuccess, setIsSuccess] = useState(false);
    const [viewMode, setViewMode] = useState('chat'); // 'chat' | 'split'

    const loadReviews = async () => {
        setLoading(true);
        try {
            const data = await getAdminMockInterviewReviews({ status: statusFilter, search });
            setReviews(data || []);
            if (!selectedReviewId && data?.length) {
                setSelectedReviewId(data[0].id);
            }
            if (selectedReviewId && data && !data.some((item) => item.id === selectedReviewId)) {
                setSelectedReviewId(data[0]?.id || null);
            }
        } catch (err) {
            console.error('Failed to load interview reviews:', err);
            if (err.message) console.log('Supabase Error Message:', err.message);
            if (err.details) console.log('Supabase Error Details:', err.details);
            setMessage('Unable to load interview reviews right now.');
            setIsSuccess(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadReviews();
    }, [statusFilter]);

    useEffect(() => {
        const timer = setTimeout(() => {
            loadReviews();
        }, 250);

        return () => clearTimeout(timer);
    }, [search]);

    useEffect(() => {
        if (!selectedReviewId) {
            setSelectedReview(null);
            setForm(emptyTemplate);
            return;
        }

        const loadDetail = async () => {
            setDetailLoading(true);
            try {
                const data = await getAdminMockInterviewReview(selectedReviewId);
                setSelectedReview(data);
                const adminReview = data?.ai_scorecard?.admin_review;
                setForm(adminReview ? {
                    overallSummary: adminReview.overall_summary || '',
                    strengths: (adminReview.strengths || []).join('\n'),
                    improvements: (adminReview.improvements || []).join('\n'),
                    topics: (adminReview.topics_to_work_on || []).join('\n'),
                    nextSteps: adminReview.next_steps || '',
                } : emptyTemplate);
            } catch (err) {
                console.error('Failed to load interview review detail:', err);
                setMessage('Unable to load the selected interview.');
                setIsSuccess(false);
            } finally {
                setDetailLoading(false);
            }
        };

        loadDetail();
    }, [selectedReviewId]);

    const reviewerName = profile?.full_name || user?.email || 'Admin Reviewer';
    const userTranscript = useMemo(() => selectedReview?.ai_scorecard?.user_transcript || [], [selectedReview]);
    const aiTranscript = useMemo(() => selectedReview?.ai_scorecard?.ai_transcript || [], [selectedReview]);

    const selectNextPending = () => {
        const nextPending = reviews.find(review => review.status === 'pending_review' && review.id !== selectedReviewId);
        if (nextPending) {
            setSelectedReviewId(nextPending.id);
            setMessage('');
            setIsSuccess(false);
            toast.success('Loaded next pending ticket!');
        } else {
            toast.success('All pending reviews completed! 🎉');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedReviewId || saving) return;

        setSaving(true);
        setMessage('');
        setIsSuccess(false);

        const payload = {
            overall_summary: form.overallSummary.trim(),
            strengths: splitLines(form.strengths),
            improvements: splitLines(form.improvements),
            topics_to_work_on: splitLines(form.topics),
            next_steps: form.nextSteps.trim(),
            reviewer_name: reviewerName,
            reviewer_id: user?.id || null,
            feedback_markdown: buildFeedbackMarkdown(form),
        };

        try {
            const updated = await submitAdminMockInterviewReview(selectedReviewId, payload);
            setSelectedReview(updated);
            setReviews((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            setMessage('Your expert feedback and scorecard analysis have been sent to the applicant.');
            setIsSuccess(true);
            toast.success('Feedback submitted successfully!');
        } catch (err) {
            console.error('Failed to submit interview review:', err);
            setMessage('Could not send the analysis. Please try again.');
            setIsSuccess(false);
            toast.error('Failed to submit review.');
        } finally {
            setSaving(false);
        }
    };

    const displayedReviews = useMemo(() => {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return reviews.filter(review => {
            if (review.status !== 'reviewed') return true;
            const completedAt = new Date(review.updated_at || review.created_at);
            return completedAt > oneDayAgo;
        });
    }, [reviews]);

    return (
        <div className="max-w-7xl mx-auto py-12 px-6 lg:px-8 font-sans text-[#1C1A17]">
            {/* Header section with modern pill and sleek typography */}
            <div className="mb-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-[#1C1A17]/15 pb-8">
                <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D45B34]/5 border border-[#1C1A17]/10 text-[#1C1A17] text-[9px] font-black uppercase tracking-[0.2em] mb-4">
                        <Sparkles size={10} className="animate-spin-slow text-[#1C1A17]" />
                        Admin Workspace
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-[#1C1A17] flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[#D45B34] flex items-center justify-center shadow-lg shadow-[#D45B34]/20 shrink-0">
                            <ClipboardList size={22} className="text-white" />
                        </div>
                        Interview Reviews
                    </h1>
                    <p className="text-xs text-[#1C1A17]/60 font-medium mt-2 leading-relaxed">
                        Evaluate seeker responses, review AI insights, and issue expert reviews for mock interviews.
                    </p>
                </div>

                {/* Filter and search with premium styled inputs */}
                <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 sm:flex-initial">
                        <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1C1A17]/50" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search user, email, or role..."
                            className="w-full sm:w-72 pl-11 pr-4 py-3 rounded-2xl border border-[#1C1A17]/15 bg-[#ffffff] text-sm font-medium text-[#1C1A17] placeholder:text-[#1C1A17]/40 focus:outline-none focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 rounded-2xl border border-[#1C1A17]/15 bg-[#ffffff] text-sm font-semibold text-[#1C1A17] focus:outline-none focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all cursor-pointer shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                    >
                        <option value="all">All Reviews</option>
                        <option value="pending_review">Pending Review</option>
                        <option value="reviewed">Reviewed</option>
                    </select>
                </div>
            </div>

            {/* Alert banner for submit state feedback */}
            {message && (
                <div className={`mb-8 rounded-3xl border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 transform translate-y-0 animate-in fade-in slide-in-from-top-4 shadow-[0_12px_30px_rgba(0,0,0,0.02)] ${
                    isSuccess 
                    ? 'bg-emerald-50/40 border-emerald-100 text-emerald-900' 
                    : 'bg-rose-50/40 border-rose-100 text-rose-900'
                }`}>
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                            isSuccess ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                        }`}>
                            {isSuccess ? <CheckCircle size={20} className="animate-pulse" /> : <Activity size={20} />}
                        </div>
                        <div>
                            <p className="text-sm font-extrabold leading-tight">
                                {isSuccess ? 'Review Submitted Successfully!' : 'Review Submission Failed'}
                            </p>
                            <p className="text-xs mt-1 font-semibold opacity-80">
                                {message}
                            </p>
                        </div>
                    </div>
                    {isSuccess && reviews.some(r => r.status === 'pending_review' && r.id !== selectedReviewId) && (
                        <button
                            type="button"
                            onClick={selectNextPending}
                            className="shrink-0 self-start md:self-auto rounded-full bg-[#D45B34] hover:bg-[#B84A27] px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:scale-[1.02] active:scale-95 shadow-md shadow-[#D45B34]/20 cursor-pointer"
                        >
                            Review Next Ticket →
                        </button>
                    )}
                </div>
            )}

            {/* Queue & Details Layout Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-[380px_minmax(0,1fr)] gap-8 items-start">
                {/* Left Queue Panel */}
                <div className="bg-[#ffffff] border border-[#1C1A17]/25 rounded-[32px] p-5 shadow-lg shadow-[#1C1A17]/5 lg:sticky lg:top-24">
                    <div className="px-3 pb-4 mb-4 border-b border-[#1C1A17]/15 flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#1C1A17]/60">
                            Interview Queue
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#F4F1EA] border border-[#1C1A17]/15 text-[9px] font-bold text-[#1C1A17]">
                            {displayedReviews.length} item{displayedReviews.length !== 1 && 's'}
                        </span>
                    </div>

                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
                        {loading && (
                            <div className="flex flex-col items-center justify-center py-16 gap-3 text-[#1C1A17]/60">
                                <Activity size={22} className="animate-spin text-[#1C1A17]/40" />
                                <p className="text-xs font-semibold">Loading reviews...</p>
                            </div>
                        )}
                        {!loading && displayedReviews.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center gap-4 text-[#1C1A17]/40">
                                <div className="w-12 h-12 rounded-full bg-[#F4F1EA] border border-[#1C1A17]/15 flex items-center justify-center">
                                    <ClipboardList size={18} className="text-[#1C1A17]/30" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#1C1A17]">Queue is empty</p>
                                    <p className="text-xs mt-1">No reviews match the current filters.</p>
                                </div>
                            </div>
                        )}
                        {displayedReviews.map((review) => {
                            const isSelected = selectedReviewId === review.id;
                            const name = review.user?.full_name || review.user_name || review.user_email || `ID: ${review.user_id?.substring(0, 8)}...`;
                            const avatar = getAvatarStyle(name);
                            return (
                                <button
                                    key={review.id}
                                    onClick={() => setSelectedReviewId(review.id)}
                                    className={`group relative w-full text-left rounded-2xl border p-4.5 transition-all duration-300 ${
                                        isSelected 
                                        ? 'bg-[#D45B34] text-white border-[#D45B34] shadow-xl shadow-[#D45B34]/20' 
                                        : 'bg-[#ffffff] border-[#1C1A17]/20 hover:border-[#D45B34]/60 hover:shadow-[0_8px_20px_rgba(49,56,81,0.04)]'
                                    }`}
                                >
                                    <div className="flex items-start gap-3.5">
                                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-xs font-black shrink-0 ${isSelected ? 'bg-white/10 border-white/10 text-white' : avatar.bg}`}>
                                            {avatar.initials}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={`text-sm font-extrabold tracking-tight truncate transition-colors duration-200 ${
                                                    isSelected ? 'text-white' : 'text-[#1C1A17] group-hover:text-[#1C1A17]'
                                                }`}>
                                                    {name}
                                                </p>
                                                <span className={`shrink-0 w-2 h-2 rounded-full ${
                                                    review.status === 'reviewed' ? 'bg-emerald-500' : 'bg-indigo-500 animate-pulse'
                                                }`} />
                                            </div>
                                            <p className={`text-[10px] font-medium truncate mt-0.5 ${isSelected ? 'text-white/60' : 'text-[#1C1A17]/60'}`}>
                                                {review.user?.email || review.user_email || 'No email associated'}
                                            </p>
                                            
                                            <div className={`flex flex-wrap gap-2 mt-3 pt-3 border-t ${isSelected ? 'border-white/10' : 'border-[#1C1A17]/15'}`}>
                                                <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider ${
                                                    isSelected ? 'bg-white/10 text-white/80' : 'bg-[#F4F1EA] text-[#1C1A17] border border-[#1C1A17]/15'
                                                }`}>
                                                    {review.job?.company_name || 'General'}
                                                </span>
                                                {review.job?.title && (
                                                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider truncate max-w-[150px] ${
                                                        isSelected ? 'bg-white/10 text-white/80' : 'bg-[#F4F1EA] text-[#1C1A17] border border-[#1C1A17]/15'
                                                    }`}>
                                                        {review.job.title}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Right Details & Review Panel */}
                <div className="space-y-8">
                    {/* Selected Interview Details */}
                    <div className="bg-[#ffffff] border border-[#1C1A17]/25 rounded-[32px] p-6 lg:p-8 shadow-lg shadow-[#1C1A17]/5 min-h-[40vh] flex flex-col justify-between">
                        {detailLoading && (
                            <div className="flex flex-col items-center justify-center py-32 gap-3 text-[#1C1A17]/60">
                                <Activity size={24} className="animate-spin text-[#1C1A17]/40" />
                                <p className="text-xs font-semibold">Loading session details...</p>
                            </div>
                        )}
                        {!detailLoading && !selectedReview && (
                            <div className="flex flex-col items-center justify-center py-36 text-center gap-4 text-[#1C1A17]/60">
                                <div className="w-16 h-16 rounded-[24px] bg-[#F4F1EA] border border-[#1C1A17]/15 flex items-center justify-center">
                                    <Sparkles size={24} className="text-[#1C1A17]/40" />
                                </div>
                                <div>
                                    <p className="text-base font-bold text-[#1C1A17]">Select an Interview</p>
                                    <p className="text-xs mt-1.5 max-w-sm text-[#1C1A17]/60 leading-relaxed">
                                        Choose an applicant profile from the queue to start assessing their transcript, viewing AI scorecards, and submitting final reviews.
                                    </p>
                                </div>
                            </div>
                        )}

                        {selectedReview && !detailLoading && (
                            <div className="space-y-8">
                                {/* Details Header */}
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-[#1C1A17]/15">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-lg font-black shrink-0 ${getAvatarStyle(selectedReview.user?.full_name || selectedReview.user_name || selectedReview.user?.email).bg}`}>
                                            {getAvatarStyle(selectedReview.user?.full_name || selectedReview.user_name || selectedReview.user?.email).initials}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black text-[#1C1A17] tracking-tight">
                                                {selectedReview.user?.full_name || selectedReview.user_name || selectedReview.user?.email || selectedReview.user_email || 'Unnamed Candidate'}
                                            </h2>
                                            <p className="text-sm font-semibold text-[#1C1A17]/60 mt-1 flex items-center gap-1.5">
                                                {selectedReview.user?.email || selectedReview.user_email || 'No email registered'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="shrink-0">
                                        <StatusBadge status={selectedReview.status} />
                                    </div>
                                </div>

                                {/* Performance Grid Dashboard */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-5 rounded-2xl bg-[#F4F1EA]/40 border border-[#1C1A17]/20 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-[#1C1A17]/15 flex items-center justify-center text-[#1C1A17]/80 shadow-sm shrink-0">
                                            <Clock size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-[#1C1A17]/55 uppercase tracking-widest leading-none mb-1">Duration</p>
                                            <p className="text-base font-extrabold text-[#1C1A17]">{selectedReview.ai_scorecard?.duration_minutes || '0'} Mins</p>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-[#F4F1EA]/40 border border-[#1C1A17]/20 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-[#1C1A17]/15 flex items-center justify-center text-[#1C1A17]/80 shadow-sm shrink-0">
                                            <Award size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-[#1C1A17]/55 uppercase tracking-widest leading-none mb-1">Round Type</p>
                                            <p className="text-base font-extrabold text-[#1C1A17] capitalize">{selectedReview.ai_scorecard?.interview_type || 'General'}</p>
                                        </div>
                                    </div>

                                    <div className="p-5 rounded-2xl bg-[#F4F1EA]/40 border border-[#1C1A17]/20 flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white border border-[#1C1A17]/15 flex items-center justify-center text-[#1C1A17]/80 shadow-sm shrink-0">
                                            <MessageSquare size={16} />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-[#1C1A17]/55 uppercase tracking-widest leading-none mb-1">Depth</p>
                                            <p className="text-base font-extrabold text-[#1C1A17]">
                                                {selectedReview.ai_scorecard?.combined_transcript?.length || (userTranscript.length + aiTranscript.length) || '0'} Turns
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* System Insights Context */}
                                <div className="p-5 rounded-2xl bg-[#D45B34]/5 border border-[#1C1A17]/15 flex items-start gap-3.5">
                                    <Bot size={18} className="text-[#1C1A17] mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-1.5 leading-none">System Context</p>
                                        <p className="text-xs text-[#1C1A17]/90 font-medium leading-relaxed">
                                            {selectedReview.ai_scorecard?.combined_transcript?.length > 10
                                                ? "Active conversation session. Review the unified timeline below to evaluate the candidate's communication and technical skills."
                                                : "Limited engagement session. The user may have abandoned the interview mid-way or exited shortly after starting."}
                                        </p>
                                    </div>
                                </div>

                                {/* Transcripts View Mode Selector */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between border-b border-[#1C1A17]/15 pb-3">
                                        <h3 className="text-sm font-extrabold text-[#1C1A17] flex items-center gap-2">
                                            <MessageSquareQuote size={16} className="text-[#1C1A17]/50" />
                                            Interview Conversation Transcript
                                        </h3>
                                        
                                        {/* Toggle button */}
                                        <div className="flex rounded-xl bg-[#F4F1EA]/80 border border-[#1C1A17]/15 p-0.5">
                                            <button
                                                type="button"
                                                onClick={() => setViewMode('chat')}
                                                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                                    viewMode === 'chat' ? 'bg-[#D45B34] text-white shadow-sm' : 'text-[#1C1A17]/60 hover:text-[#1C1A17]'
                                                }`}
                                            >
                                                <LayoutGrid size={11} /> Unified
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setViewMode('split')}
                                                className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                                                    viewMode === 'split' ? 'bg-[#D45B34] text-white shadow-sm' : 'text-[#1C1A17]/60 hover:text-[#1C1A17]'
                                                }`}
                                            >
                                                <Clock size={11} /> Split View
                                            </button>
                                        </div>
                                    </div>

                                    {/* Transcript container */}
                                    {viewMode === 'chat' && selectedReview.ai_scorecard?.combined_transcript?.length > 0 ? (
                                        /* Chronological Unified Chat Feed */
                                        <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 bg-[#F4F1EA]/30 border border-[#1C1A17]/20 rounded-2xl p-5 custom-scrollbar">
                                            {selectedReview.ai_scorecard.combined_transcript.map((msg, index) => {
                                                const isAI = msg.role === 'assistant' || msg.role === 'system';
                                                return (
                                                    <div key={index} className={`flex items-start gap-3.5 ${isAI ? 'justify-start' : 'justify-end'}`}>
                                                        {isAI && (
                                                            <div className="w-8 h-8 rounded-lg bg-[#D45B34] border border-[#D45B34] flex items-center justify-center text-white shrink-0">
                                                                <Bot size={13} />
                                                            </div>
                                                        )}
                                                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed border shadow-[0_2px_4px_rgba(0,0,0,0.01)] ${
                                                            isAI 
                                                            ? 'bg-[#D45B34]/5 border-[#1C1A17]/15 text-[#1C1A17]' 
                                                            : 'bg-[#ffffff] border-[#1C1A17]/15 text-[#1C1A17]'
                                                        }`}>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                 <span className={`text-[9px] font-black uppercase tracking-wider ${isAI ? 'text-[#1C1A17]/60' : 'text-[#1C1A17]/60'}`}>
                                                                    {isAI ? 'AI Interviewer' : 'Candidate'}
                                                                </span>
                                                            </div>
                                                            <p className="font-semibold">{msg.content}</p>
                                                        </div>
                                                        {!isAI && (
                                                            <div className="w-8 h-8 rounded-lg bg-[#1C1A17]/15 border border-[#1C1A17]/15 flex items-center justify-center text-[#1C1A17] shrink-0">
                                                                <User size={13} />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        /* Columns Split View Fallback */
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                                            <div className="rounded-2xl border border-[#1C1A17]/20 bg-[#F4F1EA]/30 p-5">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#1C1A17]/60 flex items-center gap-2 mb-4">
                                                    <User size={14} /> Candidate Responses
                                                </h4>
                                                <div className="space-y-3 max-h-72 overflow-y-auto pr-1.5 custom-scrollbar">
                                                    {userTranscript.length === 0 && (
                                                        <p className="text-xs text-[#1C1A17]/50 italic">No candidate responses captured.</p>
                                                    )}
                                                    {userTranscript.map((entry, index) => (
                                                        <div key={index} className="p-3.5 rounded-xl bg-[#ffffff] border border-[#1C1A17]/15 text-xs font-semibold leading-relaxed text-[#1C1A17] shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                                                            {entry}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="rounded-2xl border border-[#1C1A17]/20 bg-[#F4F1EA]/30 p-5">
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.25em] text-[#1C1A17]/60 flex items-center gap-2 mb-4">
                                                    <Bot size={14} /> AI Questions
                                                </h4>
                                                <div className="space-y-3 max-h-72 overflow-y-auto pr-1.5 custom-scrollbar">
                                                    {aiTranscript.length === 0 && (
                                                        <p className="text-xs text-[#1C1A17]/50 italic">No AI questions captured.</p>
                                                    )}
                                                    {aiTranscript.map((entry, index) => (
                                                        <div key={index} className="p-3.5 rounded-xl bg-[#D45B34]/5 border border-[#1C1A17]/15 text-xs font-semibold leading-relaxed text-[#1C1A17] shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                                                            {entry}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Feedback Form Card */}
                    {selectedReview && (
                        <form onSubmit={handleSubmit} className="bg-[#ffffff] border border-[#1C1A17]/25 rounded-[32px] p-6 lg:p-8 shadow-lg shadow-[#1C1A17]/5 space-y-6">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D45B34]/5 text-[#1C1A17] text-[9px] font-black uppercase tracking-[0.2em] mb-3 border border-[#1C1A17]/10">
                                    <BookOpen size={10} />
                                    Review Form
                                </div>
                                <h3 className="text-2xl font-black tracking-tight text-[#1C1A17]">Send Expert Feedback</h3>
                                <p className="text-xs text-[#1C1A17]/60 font-medium mt-1">Provide helpful feedback, recommendations, and next steps to the candidate.</p>
                            </div>

                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#1C1A17]/60 uppercase tracking-widest flex items-center gap-2">
                                        <BookOpen size={12} className="text-[#1C1A17]/40" />
                                        Overall Summary
                                    </label>
                                    <textarea
                                        value={form.overallSummary}
                                        onChange={(e) => setForm((prev) => ({ ...prev, overallSummary: e.target.value }))}
                                        placeholder="Summarize their general performance and communication..."
                                        rows={4}
                                        className="w-full rounded-2xl border border-[#1C1A17]/15 bg-[#ffffff] px-4 py-3 text-sm font-semibold text-[#1C1A17] placeholder:text-[#1C1A17]/30 focus:outline-none focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#1C1A17]/60 uppercase tracking-widest flex items-center gap-2">
                                        <CheckSquare size={12} className="text-emerald-600" />
                                        Key Strengths (One per line)
                                    </label>
                                    <textarea
                                        value={form.strengths}
                                        onChange={(e) => setForm((prev) => ({ ...prev, strengths: e.target.value }))}
                                        placeholder={"Excellent database querying knowledge\nSolid architectural understanding"}
                                        rows={3}
                                        className="w-full rounded-2xl border border-[#1C1A17]/15 bg-[#ffffff] px-4 py-3 text-sm font-semibold text-[#1C1A17] placeholder:text-[#1C1A17]/30 focus:outline-none focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#1C1A17]/60 uppercase tracking-widest flex items-center gap-2">
                                        <AlertTriangle size={12} className="text-rose-600" />
                                        Areas for Improvement (One per line)
                                    </label>
                                    <textarea
                                        value={form.improvements}
                                        onChange={(e) => setForm((prev) => ({ ...prev, improvements: e.target.value }))}
                                        placeholder={"Explain time complexity before writing code\nFalter under pressure"}
                                        rows={3}
                                        className="w-full rounded-2xl border border-[#1C1A17]/15 bg-[#ffffff] px-4 py-3 text-sm font-semibold text-[#1C1A17] placeholder:text-[#1C1A17]/30 focus:outline-none focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#1C1A17]/60 uppercase tracking-widest flex items-center gap-2">
                                        <Target size={12} className="text-amber-600" />
                                        Topics to Practice (One per line)
                                    </label>
                                    <textarea
                                        value={form.topics}
                                        onChange={(e) => setForm((prev) => ({ ...prev, topics: e.target.value }))}
                                        placeholder={"Big-O Notation\nSystem Design Scaling Patterns"}
                                        rows={3}
                                        className="w-full rounded-2xl border border-[#1C1A17]/15 bg-[#ffffff] px-4 py-3 text-sm font-semibold text-[#1C1A17] placeholder:text-[#1C1A17]/30 focus:outline-none focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#1C1A17]/60 uppercase tracking-widest flex items-center gap-2">
                                        <ListTodo size={12} className="text-indigo-600" />
                                        Suggested Next Steps
                                    </label>
                                    <textarea
                                        value={form.nextSteps}
                                        onChange={(e) => setForm((prev) => ({ ...prev, nextSteps: e.target.value }))}
                                        placeholder="Review playbooks on system architecture, and schedule a mock session next week..."
                                        rows={3}
                                        className="w-full rounded-2xl border border-[#1C1A17]/15 bg-[#ffffff] px-4 py-3 text-sm font-semibold text-[#1C1A17] placeholder:text-[#1C1A17]/30 focus:outline-none focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.01)]"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={!selectedReviewId || saving}
                                className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-[#D45B34] hover:bg-[#B84A27] py-4.5 text-[11px] font-bold uppercase tracking-[0.3em] text-white disabled:opacity-40 active:scale-[0.99] transition-all shadow-lg shadow-[#D45B34]/20 cursor-pointer"
                            >
                                {saving ? <Activity size={16} className="animate-spin" /> : <Send size={15} />}
                                {saving ? 'Submitting Analysis...' : 'Send Review Analysis'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InterviewReviewsPage;
