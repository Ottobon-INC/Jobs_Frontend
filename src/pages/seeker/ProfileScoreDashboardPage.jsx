import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfileScore } from '../../hooks/useProfileScore';
import { getRewardsState } from '../../api/rewardsApi';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, 
    Award, 
    CheckCircle2, 
    ChevronRight, 
    RefreshCw, 
    Trophy, 
    Zap, 
    Target, 
    BookOpen, 
    Star, 
    ArrowUpRight, 
    HelpCircle,
    User,
    Activity,
    FileText,
    Share2,
    Briefcase,
    Flame
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProfileScoreDashboardPage = () => {
    const navigate = useNavigate();
    const { 
        score, 
        roadmap, 
        leaderboard, 
        loading, 
        recomputing, 
        error, 
        recomputeScore 
    } = useProfileScore();

    const [showHelpModal, setShowHelpModal] = useState(false);
    const [rewardsState, setRewardsState] = useState(null);
    const [rewardsLoading, setRewardsLoading] = useState(true);

    const fetchRewards = useCallback(async () => {
        try {
            const data = await getRewardsState();
            setRewardsState(data);
        } catch (err) {
            console.error("Failed to load rewards state for dashboard:", err);
        } finally {
            setRewardsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRewards();
    }, [fetchRewards]);

    const handleSync = async () => {
        try {
            await toast.promise(
                Promise.all([
                    recomputeScore(),
                    fetchRewards()
                ]),
                {
                    loading: 'Re-aggregating profile data...',
                    success: 'Profile score synchronized successfully!',
                    error: 'Synchronization failed. Please try again.'
                }
            );
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FBFBFA] flex flex-col items-center justify-center">
                <RefreshCw className="animate-spin text-zinc-900 mb-4" size={36} />
                <p className="text-xs font-black uppercase tracking-[0.3em] text-zinc-400">Loading Profile Engine...</p>
            </div>
        );
    }

    const totalScore = score?.total_score || 0;
    const tier = score?.score_tier || "Starter";

    // Tier configurations
    const getTierConfig = (scoreTier) => {
        switch (scoreTier) {
            case 'Elite':
                return {
                    color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
                    gradient: 'from-indigo-600 to-violet-700',
                    glow: 'shadow-indigo-500/20',
                    badge: 'bg-indigo-900 text-white',
                    desc: 'Top 5% of candidate pool. Highly sought after by elite tech teams.'
                };
            case 'Pro':
                return {
                    color: 'text-purple-600 bg-purple-50 border-purple-200',
                    gradient: 'from-purple-600 to-indigo-600',
                    glow: 'shadow-purple-500/20',
                    badge: 'bg-purple-900 text-white',
                    desc: 'Strong candidate profile showing solid skill checks and interview readiness.'
                };
            case 'Rising':
                return {
                    color: 'text-blue-600 bg-blue-50 border-blue-200',
                    gradient: 'from-blue-500 to-indigo-500',
                    glow: 'shadow-blue-500/20',
                    badge: 'bg-blue-900 text-white',
                    desc: 'Active builder with good foundations. Complete more mock rounds to rank up.'
                };
            default:
                return {
                    color: 'text-zinc-600 bg-zinc-50 border-zinc-200',
                    gradient: 'from-zinc-600 to-zinc-700',
                    glow: 'shadow-zinc-500/10',
                    badge: 'bg-zinc-900 text-white',
                    desc: 'Initial tier. Complete questionnaire and upload resume to raise your score.'
                };
        }
    };

    const tierConfig = getTierConfig(tier);

    // Categories mapping for icons/colors
    const getCategoryStyles = (category) => {
        const cat = category.toLowerCase();
        if (cat.includes('resume') || cat.includes('profile')) {
            return { icon: <FileText size={16} />, color: 'bg-emerald-500 text-white', light: 'bg-emerald-50 text-emerald-700' };
        }
        if (cat.includes('interview') || cat.includes('screen')) {
            return { icon: <Zap size={16} />, color: 'bg-purple-500 text-white', light: 'bg-purple-50 text-purple-700' };
        }
        if (cat.includes('job') || cat.includes('search')) {
            return { icon: <Briefcase size={16} />, color: 'bg-blue-500 text-white', light: 'bg-blue-50 text-blue-700' };
        }
        if (cat.includes('community') || cat.includes('share')) {
            return { icon: <Share2 size={16} />, color: 'bg-pink-500 text-white', light: 'bg-pink-50 text-pink-700' };
        }
        return { icon: <Activity size={16} />, color: 'bg-zinc-900 text-white', light: 'bg-zinc-50 text-zinc-700' };
    };

    return (
        <div className="max-w-[1400px] mx-auto pt-4 md:pt-8 pb-16 px-4 md:px-12 min-h-screen bg-[#FBFBFA]">
            {/* Header */}
            <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight leading-none">Profile Rating</h1>
                    <div className="text-[10px] font-black text-zinc-400 mt-4 uppercase tracking-[0.4em] flex items-center gap-3">
                        <div className="w-10 h-[1px] bg-zinc-200" /> Career Optimization Engine
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowHelpModal(true)}
                        className="p-2.5 rounded-full bg-white border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 transition-all shadow-sm"
                        title="How is this calculated?"
                    >
                        <HelpCircle size={18} />
                    </button>
                    
                    <button
                        onClick={handleSync}
                        disabled={recomputing}
                        className="px-4 py-2.5 bg-zinc-900 text-white rounded-full font-bold text-xs hover:bg-zinc-800 transition-all flex items-center gap-2.5 shadow-xl shadow-zinc-900/10 disabled:opacity-75"
                    >
                        <RefreshCw size={14} className={recomputing ? 'animate-spin' : ''} />
                        {recomputing ? 'Synchronizing...' : 'Sync & Recalculate'}
                    </button>
                </div>
            </header>

            {/* Score Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                
                {/* Main Gauge Card */}
                <div className="lg:col-span-1 bg-white border border-zinc-100 rounded-2xl p-6 shadow-xl shadow-zinc-900/5 relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-zinc-50 rounded-full -mr-16 -mt-16 opacity-30" />
                    
                    <div className="relative z-10">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tierConfig.badge}`}>
                            <Award size={12} /> {tier} Tier
                        </span>
                        
                        <div className="my-8 flex justify-center items-center relative">
                            {/* Radial SVG Progress */}
                            <svg className="w-40 h-40 transform -rotate-90">
                                <circle 
                                    cx="80" 
                                    cy="80" 
                                    r="70" 
                                    className="stroke-zinc-100" 
                                    strokeWidth="10" 
                                    fill="transparent" 
                                />
                                <motion.circle 
                                    cx="80" 
                                    cy="80" 
                                    r="70" 
                                    className="stroke-zinc-900" 
                                    strokeWidth="10" 
                                    fill="transparent" 
                                    strokeDasharray={440}
                                    initial={{ strokeDashoffset: 440 }}
                                    animate={{ strokeDashoffset: 440 - (440 * totalScore) / 100 }}
                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-4xl font-black tracking-tighter text-zinc-900">{Math.round(totalScore)}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">out of 100</span>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 border-t border-zinc-100 pt-5 mt-4">
                        <h3 className="text-sm font-bold text-zinc-800 mb-1">Rank Outlook</h3>
                        <p className="text-xs text-zinc-500 leading-relaxed">{tierConfig.desc}</p>
                    </div>
                </div>

                {/* Subscores breakdown card */}
                <div className="lg:col-span-2 bg-white border border-zinc-100 rounded-2xl p-6 shadow-xl shadow-zinc-900/5 flex flex-col justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900 mb-1">Scoring Pillars</h2>
                        <p className="text-xs text-zinc-400 mb-6">Real-time metrics compiled from platform logs.</p>

                        <div className="space-y-4">
                            {[
                                { name: 'Resume & Profile', current: score?.resume_score || 0, max: 25, color: 'bg-emerald-500' },
                                { name: 'Mock Interviews', current: score?.interview_score || 0, max: 20, color: 'bg-purple-500' },
                                { name: 'Skill Competency', current: score?.skill_score || 0, max: 20, color: 'bg-amber-500' },
                                { name: 'Daily Engagement', current: score?.activity_score || 0, max: 15, color: 'bg-indigo-500' },
                                { name: 'Saved Opportunities', current: score?.application_score || 0, max: 10, color: 'bg-blue-500' },
                                { name: 'Community Sharing', current: score?.community_score || 0, max: 10, color: 'bg-pink-500' }
                            ].map((sub, idx) => {
                                const pct = (sub.current / sub.max) * 100;
                                return (
                                    <div key={idx} className="group">
                                        <div className="flex justify-between items-end mb-1.5">
                                            <span className="text-xs font-bold text-zinc-700 group-hover:text-zinc-900 transition-colors">{sub.name}</span>
                                            <span className="text-[10px] font-black text-zinc-400 tracking-wider">
                                                <span className="text-zinc-900 font-bold">{sub.current}</span> / {sub.max} pts
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-zinc-50 rounded-full overflow-hidden border border-zinc-100">
                                            <motion.div 
                                                className={`h-full ${sub.color} rounded-full`}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${pct}%` }}
                                                transition={{ duration: 0.8, delay: idx * 0.05 }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

            </div>

            {/* Bottom Row Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Roadmap Column */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2.5 px-1">
                        <Target className="text-zinc-400" size={20} />
                        Personalized Improvement Roadmap
                    </h2>
                    
                    <div className="space-y-3">
                        {roadmap.length > 0 ? (
                            roadmap.map((item, idx) => {
                                const style = getCategoryStyles(item.category);
                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="bg-white border border-zinc-100 rounded-xl p-5 hover:border-zinc-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm group"
                                    >
                                        <div className="flex gap-4 items-start">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${style.light}`}>
                                                {style.icon}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{item.category}</span>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-200" />
                                                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        +{item.points} Potential Points
                                                    </span>
                                                </div>
                                                <h4 className="text-sm font-bold text-zinc-900 mt-1">{item.title}</h4>
                                                <p className="text-xs text-zinc-500 leading-relaxed mt-1">{item.description}</p>
                                            </div>
                                        </div>
                                        
                                        <button
                                            onClick={() => navigate(item.action_url)}
                                            className="px-4 py-2 border border-zinc-200 rounded-full text-xs font-bold text-zinc-700 hover:bg-zinc-950 hover:text-white hover:border-zinc-950 transition-all flex items-center gap-1.5 self-end md:self-center"
                                        >
                                            Take Action
                                            <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </button>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="bg-white border border-zinc-100 border-dashed rounded-xl py-12 flex flex-col items-center justify-center text-center p-6 shadow-sm">
                                <CheckCircle2 className="text-emerald-500 mb-3" size={36} />
                                <h4 className="text-sm font-bold text-zinc-900">Your profile is fully optimized!</h4>
                                <p className="text-xs text-zinc-400 leading-relaxed mt-1 max-w-sm">
                                    You have checked off all priority action points. Maintain activity and continue practicing.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Leaderboard Column */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Activity Streak Widget */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2.5 px-1">
                            <Flame className="text-amber-500" size={20} />
                            Activity Streak
                        </h2>

                        <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-xl shadow-zinc-900/5 text-zinc-900 space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3.5">
                                    <span className="block text-3xl font-black text-zinc-900 leading-tight tracking-tight">
                                        {rewardsState?.current_streak || 0}
                                    </span>
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1 flex items-center gap-1">
                                        Day streak <Flame size={12} className="text-amber-500 fill-amber-500" />
                                    </span>
                                </div>

                                <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-3.5">
                                    <span className="block text-3xl font-black text-zinc-900 leading-tight tracking-tight">
                                        {rewardsState?.days_active || 0}
                                    </span>
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-1">
                                        Days active
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-2 pt-1">
                                <span className="block text-[9px] font-black tracking-widest text-zinc-400 uppercase">
                                    This Week
                                </span>
                                <div className="flex justify-between gap-1">
                                    {rewardsState?.streak_data?.map((day, idx) => {
                                        const isCompleted = day.status === 'completed';
                                        const isToday = day.isToday;
                                        const isMissed = day.status === 'missed';
                                        const isClaimable = day.status === 'claimable';
                                        
                                        let circleStyle = "bg-zinc-100 text-zinc-400 border border-zinc-200/50";
                                        if (isCompleted) {
                                            if (isToday) {
                                                circleStyle = "bg-indigo-600 text-white font-bold border border-indigo-500 shadow-md shadow-indigo-600/30";
                                            } else {
                                                circleStyle = "bg-[#e8f5e9] text-[#2e7d32] font-bold border border-[#c8e6c9]/30";
                                            }
                                        } else if (isClaimable) {
                                            circleStyle = "bg-indigo-50 text-indigo-600 border border-indigo-200 font-bold animate-pulse";
                                        } else if (isMissed) {
                                            circleStyle = "bg-rose-50 text-rose-600 border border-rose-100";
                                        }

                                        return (
                                            <div 
                                                key={idx} 
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${circleStyle}`}
                                                title={day.dayLabel}
                                            >
                                                {day.dayLabel.charAt(0)}
                                            </div>
                                        );
                                    }) || (
                                        [...Array(7)].map((_, idx) => (
                                            <div key={idx} className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold bg-zinc-100 text-zinc-400 border border-zinc-200/50">
                                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][idx]}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Leaderboard Column */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-zinc-900 flex items-center gap-2.5 px-1">
                            <Trophy className="text-amber-500" size={20} />
                            Seeker Leaderboard
                        </h2>

                        <div className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-xl shadow-zinc-900/5 space-y-4">
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-wider pb-2 border-b border-zinc-50">
                            Community Rankings
                        </div>

                        <div className="divide-y divide-zinc-50 max-h-[460px] overflow-y-auto pr-1">
                            {leaderboard.length > 0 ? (
                                leaderboard.map((entry, idx) => {
                                    const userDetails = entry.user || {};
                                    const rank = idx + 1;
                                    
                                    // Highlights for top ranks
                                    const getRankStyles = (r) => {
                                        if (r === 1) return 'bg-amber-50 text-amber-600 border-amber-200';
                                        if (r === 2) return 'bg-zinc-100 text-zinc-600 border-zinc-300';
                                        if (r === 3) return 'bg-orange-50 text-orange-600 border-orange-200';
                                        return 'text-zinc-400 bg-zinc-50';
                                    };

                                    return (
                                        <div key={idx} className="flex items-center justify-between py-3 group hover:bg-zinc-50/50 rounded-lg px-2 -mx-2 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-6 h-6 rounded-full border text-[10px] font-black flex items-center justify-center shrink-0 ${getRankStyles(rank)}`}>
                                                    {rank}
                                                </div>
                                                
                                                <div className="w-8 h-8 rounded-full bg-zinc-950 overflow-hidden relative border border-zinc-200 shadow-sm shrink-0">
                                                    {userDetails.avatar_url ? (
                                                        <img 
                                                            src={userDetails.avatar_url} 
                                                            alt={userDetails.full_name} 
                                                            className="w-full h-full object-cover" 
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full grid place-items-center text-xs font-bold text-white uppercase">
                                                            {(userDetails.full_name || userDetails.email || '?').charAt(0)}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="truncate max-w-[120px] md:max-w-[160px]">
                                                    <p className="text-xs font-bold text-zinc-900 truncate">{userDetails.full_name || 'Anonymous Seeker'}</p>
                                                    <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1.5 flex-wrap">
                                                        <span>{entry.score_tier}</span>
                                                        {userDetails.email && (
                                                            <>
                                                                <span className="text-zinc-300">•</span>
                                                                <span className="text-[9px] text-zinc-400 font-normal lowercase">
                                                                    {(() => {
                                                                        const [local, domain] = userDetails.email.split('@');
                                                                        const maskedLocal = local.length > 3 ? `${local.slice(0, 3)}***` : `${local}***`;
                                                                        return `${maskedLocal}@${domain}`;
                                                                    })()}
                                                                </span>
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-xs font-black text-zinc-900">{Math.round(entry.total_score)}</p>
                                                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-300">points</p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-xs font-medium text-zinc-400">No active scores recorded.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                </div>

            </div>

            {/* Help / Explainer Modal */}
            <AnimatePresence>
                {showHelpModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div 
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowHelpModal(false)}
                        />
                        
                        <motion.div 
                            className="bg-white border border-zinc-100 rounded-2xl p-6 shadow-2xl relative max-w-md w-full z-10"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        >
                            <h3 className="text-lg font-bold text-zinc-900 mb-3">Scoring Framework</h3>
                            <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                                Your Profile Score is a comprehensive metric used by recruiters and matching bots to find top-tier candidates. It is calculated across 6 key pillars:
                            </p>

                            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-800">1. Resume & Profile (Max 25 pts)</h4>
                                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">Score based on uploading a parsed resume, listing 3+ skills, and completing key bio fields (Name, Location, DOB).</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-800">2. Mock Interviews (Max 20 pts)</h4>
                                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">Score based on submitting completed bot mock sessions and scheduling human expert mocks.</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-800">3. Skill Competency (Max 20 pts)</h4>
                                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">Points rewarded for the volume of verified and specified skills on your profile.</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-800">4. Daily Engagement (Max 15 pts)</h4>
                                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">Integrates directly with the rewards system. Earn points for streak logs and daily claims.</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-800">5. Saved Opportunities (Max 10 pts)</h4>
                                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">Shows job-seeking activity by saving jobs and checking active listings.</p>
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold text-zinc-800">6. Community Sharing (Max 10 pts)</h4>
                                    <p className="text-[11px] text-zinc-400 mt-0.5 leading-relaxed">Rewards candidates who share external referrals or post job openings to the community board.</p>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowHelpModal(false)}
                                className="w-full mt-6 py-2.5 bg-zinc-950 text-white rounded-full font-bold text-xs hover:bg-zinc-850 transition-colors"
                            >
                                Got it
                            </button>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProfileScoreDashboardPage;
