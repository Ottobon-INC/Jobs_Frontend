import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Check, 
    X, 
    User, 
    Clock, 
    ShieldAlert, 
    CheckCircle2, 
    AlertCircle,
    ArrowUpRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';
import { getPendingCommunityJobs, approveCommunityJob, rejectCommunityJob } from '../../api/adminApi';
import { useEffect } from 'react';

// Removed mock data in favor of API calls

const CommunityModerationPage = () => {
    const [pendingJobs, setPendingJobs] = useState([]);
    const [actionedIds, setActionedIds] = useState(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        setLoading(true);
        try {
            const response = await getPendingCommunityJobs();
            if (response.status === 'success') {
                setPendingJobs(response.jobs);
            }
        } catch (error) {
            console.error('Failed to fetch pending jobs:', error);
            toast.error('Failed to load moderation queue');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            const response = await approveCommunityJob(id);
            if (response.status === 'success') {
                setActionedIds(prev => new Set(prev).add(id));
                toast.success('Post approved successfully!');
                
                setTimeout(() => {
                    setPendingJobs(prev => prev.filter(job => job.id !== id));
                }, 800);
            } else {
                throw new Error('Approval failed');
            }
        } catch (error) {
            console.error('Approve error:', error);
            toast.error('Failed to approve post');
        }
    };

    const handleReject = async (id) => {
        try {
            const response = await rejectCommunityJob(id);
            if (response.status === 'success') {
                toast.error('Post rejected.');
                setPendingJobs(prev => prev.filter(job => job.id !== id));
            } else {
                throw new Error('Rejection failed');
            }
        } catch (error) {
            console.error('Reject error:', error);
            toast.error('Failed to reject post');
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F3ED] text-[#313851] p-6 md:p-12 font-sans">
            <div className="max-w-4xl mx-auto space-y-10">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-4">
                            Moderate Posts
                            <span className="bg-[#313851]/10 text-[#313851] text-xs px-4 py-1.5 rounded-full border border-[#313851]/20">
                                {pendingJobs.length} Pending
                            </span>
                        </h1>
                        <p className="text-[#313851]/60 mt-3 font-medium text-lg">Review and verify community-submitted job listings.</p>
                    </div>
                    <div className="p-4 bg-white border border-[#313851]/10 rounded-2xl shadow-sm">
                        <ShieldAlert className="text-[#313851]/40" size={40} />
                    </div>
                </div>

                <div className="space-y-4">
                    <AnimatePresence>
                        {pendingJobs.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-32 bg-white border border-dashed border-[#313851]/20 rounded-3xl space-y-6"
                            >
                                <CheckCircle2 className="text-green-500/20" size={64} />
                                <p className="text-[#313851]/40 font-black uppercase tracking-[0.3em] text-sm">All caught up!</p>
                            </motion.div>
                        ) : (
                            pendingJobs.map((job) => (
                                <motion.div 
                                    key={job.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className={`relative bg-white border border-[#313851]/10 p-8 rounded-3xl shadow-sm transition-all ${
                                        actionedIds.has(job.id) ? 'border-green-500/50' : ''
                                    }`}
                                >
                                    {/* Success Flash Overlay */}
                                    {actionedIds.has(job.id) && (
                                        <motion.div 
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute inset-0 bg-green-500/5 flex items-center justify-center z-10 rounded-3xl"
                                        >
                                            <div className="flex items-center gap-3 bg-green-600 text-white px-8 py-3 rounded-full font-black text-sm uppercase tracking-tighter shadow-xl">
                                                <Check size={20} strokeWidth={4} />
                                                Approved
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                                        <div className="space-y-5 flex-1">
                                            <div className="space-y-1">
                                                <h3 className="text-2xl font-bold text-[#313851] flex items-center gap-3">
                                                    {job.title}
                                                    <a href="#" className="text-[#313851]/40 hover:text-[#313851] transition-colors">
                                                        <ArrowUpRight size={20} />
                                                    </a>
                                                </h3>
                                                <p className="text-[#313851]/60 font-bold text-lg">{job.company_name}</p>
                                            </div>

                                            {job.external_url && (
                                                <a 
                                                    href={job.external_url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-[#313851]/40 hover:text-[#313851] text-xs font-bold uppercase tracking-widest transition-colors"
                                                >
                                                    View Original Listing
                                                    <ArrowUpRight size={14} />
                                                </a>
                                            )}

                                            <div className="flex flex-wrap items-center gap-5">
                                                <div className="flex items-center gap-2 bg-[#F6F3ED] px-4 py-2 rounded-xl border border-[#313851]/5">
                                                    <User size={16} className="text-[#313851]/40" />
                                                    <span className="text-xs text-[#313851]/70 font-black uppercase tracking-widest">
                                                        By {job.submitted_by ? 'Community Member' : 'Anonymous'}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-[#F6F3ED] px-4 py-2 rounded-xl border border-[#313851]/5">
                                                    <Clock size={16} className="text-[#313851]/40" />
                                                    <span className="text-xs text-[#313851]/70 font-black uppercase tracking-widest">
                                                        {new Date(job.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>

                                            <p className="text-[#313851]/50 text-sm leading-relaxed italic border-l-4 border-[#313851]/10 pl-4">"{job.description_raw}"</p>
                                        </div>

                                        <div className="flex items-center gap-4 shrink-0">
                                            <button 
                                                onClick={() => handleReject(job.id)}
                                                className="p-5 bg-[#313851]/5 border border-[#313851]/10 text-[#313851]/40 hover:text-red-500 hover:border-red-500/50 hover:bg-red-500/5 rounded-2xl transition-all group"
                                                title="Reject"
                                            >
                                                <X size={24} className="group-hover:scale-110 transition-transform" />
                                            </button>
                                            <Button 
                                                onClick={() => handleApprove(job.id)}
                                                className="bg-[#313851] hover:bg-[#313851]/90 text-white font-black px-10 py-5 rounded-2xl flex items-center gap-3 shadow-xl transition-all group"
                                            >
                                                <Check size={24} strokeWidth={3} className="group-hover:scale-110 transition-transform" />
                                                Approve
                                            </Button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Guidelines */}
                <div className="p-8 bg-white border border-[#313851]/10 rounded-[2rem] space-y-6 shadow-sm">
                    <div className="flex items-center gap-3 text-[#313851] font-black text-xs uppercase tracking-[0.2em]">
                        <AlertCircle size={20} className="text-[#313851]/40" />
                        Moderation Guidelines
                    </div>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            'Verify the job link is active and legitimate.',
                            'Check for appropriate role categorization.',
                            'Ensure the description is clear and helpful.',
                            'Report any suspicious or spam submissions.'
                        ].map((tip, i) => (
                            <li key={i} className="flex items-start gap-4 text-[#313851]/60 text-sm font-medium">
                                <div className="w-2 h-2 rounded-full bg-[#313851]/20 mt-1.5 shrink-0" />
                                {tip}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CommunityModerationPage;
