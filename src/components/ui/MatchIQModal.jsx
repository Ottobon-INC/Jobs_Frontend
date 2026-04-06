import { motion, AnimatePresence } from 'framer-motion';
import { X, Target, Sparkles, MessageSquare, Radio, ExternalLink, Briefcase, Star, Trophy, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createChatSession } from '../../api/chatApi';
import { useState } from 'react';

const MatchIQModal = ({ isOpen, onClose, matchData, job, jobId }) => {
    const navigate = useNavigate();
    const [isCreatingChat, setIsCreatingChat] = useState(false);

    if (!isOpen || !matchData) return null;

    const { score, skills_score, interests_score, missing_skills = [], gap_analysis } = matchData;

    // Handle "Chat with Coach"
    const handleStartChat = async () => {
        try {
            setIsCreatingChat(true);
            const session = await createChatSession(jobId);
            navigate('/chat', { state: { sessionId: session.id } });
        } catch (err) { 
            console.error(err); 
        } finally {
            setIsCreatingChat(false);
        }
    };

    // Color logic for gauge
    // Dynamic color logic for premium aesthetic
    const getScoreColors = (val) => {
        if (val > 75) return { primary: '#00bf63', secondary: '#008e4a', glow: 'rgba(0, 191, 99, 0.4)' }; // Green
        if (val >= 25) return { primary: '#ffde59', secondary: '#c9a800', glow: 'rgba(255, 222, 89, 0.4)' }; // Yellow
        return { primary: '#ff3131', secondary: '#b30000', glow: 'rgba(255, 49, 49, 0.4)' }; // Red
    };

    const colors = getScoreColors(score);
    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (score / 100) * circumference;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-black/60 backdrop-blur-md" onClick={onClose}>
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] border-4 border-black shadow-[32px_32px_0px_rgba(0,0,0,0.15)] flex flex-col relative overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header: Locked at top */}
                    <div className="px-8 py-6 border-b-4 border-black flex justify-between items-center bg-white z-50 shrink-0">
                        <div className="flex items-center gap-6">
                            <button 
                                onClick={onClose}
                                className="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-xl text-[10px] font-black text-black uppercase tracking-[0.3em] hover:bg-black hover:text-white transition-all group"
                            >
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Signal
                            </button>
                            <div className="w-[1px] h-6 bg-black/10 mx-2 hidden md:block" />
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white">
                                    <Sparkles size={16} />
                                </div>
                                <h3 className="font-display text-lg font-black text-black uppercase tracking-[0.1em]">Match IQ Analysis</h3>
                            </div>
                        </div>
                        <button 
                            onClick={onClose} 
                            className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center transition-all group hover:bg-black hover:text-white"
                        >
                            <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            
                            {/* Left Column: Score & Alignment */}
                            <div className="space-y-8">
                                <div className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-[2rem] border-2 border-black/5 relative overflow-hidden group">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-black/5" />
                                    <div className="relative w-56 h-56 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90 scale-110" viewBox="0 0 200 200">
                                            <defs>
                                                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                                    <stop offset="0%" stopColor={colors.primary} />
                                                    <stop offset="100%" stopColor={colors.secondary} />
                                                </linearGradient>
                                            </defs>
                                            
                                            {/* Track 1: Outer subtle track */}
                                            <circle cx="100" cy="100" r={radius + 4} stroke="#f3f4f6" strokeWidth="0.5" fill="transparent" />
                                            
                                            {/* Track 2: Main track */}
                                            <circle cx="100" cy="100" r={radius} stroke="#f3f4f6" strokeWidth="12" fill="transparent" />
                                            
                                            <motion.circle
                                                cx="100" cy="100" r={radius}
                                                stroke="url(#scoreGradient)" strokeWidth="12" fill="transparent"
                                                strokeDasharray={circumference}
                                                initial={{ strokeDashoffset: circumference }}
                                                animate={{ strokeDashoffset }}
                                                transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <div className="flex flex-col items-center -mt-2">
                                                <span className="text-5xl font-display font-black text-black tracking-tighter leading-tight">{score}%</span>
                                                <span className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mt-2 italic">Match score</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    {/* Skills Align */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Skills Align</span>
                                            <span className="text-xs font-black">{skills_score}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-gray-100 rounded-full border border-black/5 overflow-hidden p-0.5">
                                            <motion.div 
                                                className="h-full bg-black rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${skills_score}%` }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                            />
                                        </div>
                                    </div>

                                    {/* Interests Align */}
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-end">
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black">Interests Align</span>
                                            <span className="text-xs font-black">{interests_score}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-gray-100 rounded-full border border-black/5 overflow-hidden p-0.5">
                                            <motion.div 
                                                className="h-full bg-black/60 rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${interests_score}%` }}
                                                transition={{ duration: 1, delay: 0.7 }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Skill Gaps & Upskill */}
                            <div className="flex flex-col h-full gap-8">
                                <div className="flex-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-black opacity-30 flex items-center gap-2">
                                        <Trophy size={14} /> Skill Gaps Identified
                                    </h4>
                                    {missing_skills.length > 0 ? (
                                        <div className="flex flex-wrap gap-3">
                                            {missing_skills.map((skill, idx) => (
                                                <span key={idx} className="px-4 py-2 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-black/10">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm font-bold text-gray-400 italic">No significant gaps detected. Optimal alignment reached.</p>
                                    )}

                                    <div className="mt-10 p-6 bg-yellow-50 rounded-2xl border-2 border-black/5 relative overflow-hidden group">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-4 text-black opacity-40">Upskill Links</h4>
                                        <div className="space-y-3">
                                            {missing_skills.slice(0, 3).map((skill, idx) => (
                                                <a 
                                                    key={idx}
                                                    href={`https://www.youtube.com/results?search_query=learn+${encodeURIComponent(skill)}+fast`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-between p-3 bg-white border border-black/5 rounded-xl hover:border-black transition-all group/link shadow-sm"
                                                >
                                                    <span className="text-[11px] font-black text-black uppercase tracking-widest">{skill} Crash Course</span>
                                                    <ExternalLink size={14} className="text-gray-300 group-hover/link:text-black transition-colors" />
                                                </a>
                                            ))}
                                            {missing_skills.length === 0 && (
                                                <p className="text-[10px] font-bold text-gray-400 italic">You're already optimized for this Signal.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Premium Action Footer */}
                    <div className="px-8 py-6 border-t-4 border-black bg-white flex flex-col items-center gap-4">
                        <div className="flex flex-col items-center">
                            <h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-black/30 mb-1">Immediate Logic Streams Available</h4>
                            <div className="w-10 h-0.5 bg-black/10 rounded-full" />
                        </div>
                        
                        <div className="w-full max-w-xl grid grid-cols-1 md:grid-cols-2 gap-4">
                            <motion.button 
                                whileHover={{ y: -3, scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleStartChat}
                                disabled={isCreatingChat}
                                className="group relative flex items-center justify-center gap-3 bg-black text-white py-3.5 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-[8px_8px_0px_rgba(0,0,0,0.1)] overflow-hidden"
                            >
                                <motion.div 
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_2s_infinite]" 
                                    style={{ backgroundSize: '200% 100%' }}
                                />
                                <MessageSquare size={18} className="transition-transform group-hover:rotate-12" /> 
                                {isCreatingChat ? 'Initializing...' : 'Chat with Coach'}
                            </motion.button>

                            <Link
                                to={`/jobs/${jobId}/mock-interview`}
                                state={{ jobTitle: job.cleanTitle, companyName: job.company_name }}
                                className="w-full"
                            >
                                <motion.button 
                                    whileHover={{ y: -3, scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}
                                    whileTap={{ scale: 0.98 }}
                                    className="group w-full h-full bg-white border-2 border-black text-black py-3.5 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-[8px_8px_0px_rgba(0,0,0,0.05)] flex items-center justify-center gap-3"
                                >
                                    <Radio size={18} className="group-hover:animate-pulse" /> Mock Interview
                                </motion.button>
                            </Link>
                        </div>

                        <button 
                            onClick={onClose}
                            className="mt-2 text-[8px] font-black text-black/20 uppercase tracking-[0.4em] hover:text-black transition-colors"
                        >
                            [ Acknowledge & Close Node ]
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default MatchIQModal;
