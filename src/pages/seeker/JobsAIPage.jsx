import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Sparkles, 
    MapPin, 
    Briefcase, 
    FileText, 
    Upload, 
    Search, 
    ChevronRight, 
    CheckCircle2, 
    ArrowUpRight, 
    Cpu, 
    User,
    Link as LinkIcon,
    Globe,
    Zap,
    ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { searchJobsAI, scrapeJobAI } from '../../api/jobsAIApi';
import { useAuth } from '../../hooks/useAuth';

const JobsAIPage = () => {
    const { user } = useAuth();
    const [mode, setMode] = useState(null); // null, 'search', 'link'
    const [step, setStep] = useState(1);
    const [preferences, setPreferences] = useState({
        location: '',
        jobType: 'remote' // remote, hybrid, onsite
    });
    const [resumeOption, setResumeOption] = useState('profile'); // profile, upload
    const [experienceLevel, setExperienceLevel] = useState('profile'); // 'fresher', '1-3', '3-5', '5+', 'profile'
    const [file, setFile] = useState(null);
    const [externalUrl, setExternalUrl] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState([]);
    const [singleJobResult, setSingleJobResult] = useState(null);

    const handleSearch = async () => {
        if (!preferences.location) {
            toast.error("Please enter a preferred location.");
            return;
        }

        if (resumeOption === 'upload' && !file) {
            toast.error("Please upload a resume.");
            return;
        }

        setIsSearching(true);
        setStep(3); // Loading step

        try {
            const formData = new FormData();
            formData.append('location', preferences.location);
            formData.append('jobType', preferences.jobType);
            formData.append('experienceLevel', experienceLevel);
            
            if (resumeOption === 'upload') {
                formData.append('file', file);
                formData.append('useProfileResume', 'false');
            } else {
                formData.append('useProfileResume', 'true');
            }

            const data = await searchJobsAI(formData);
            setResults(data.jobs || []);
            setStep(4); // Results step
        } catch (error) {
            console.error(error);
            toast.error("Failed to perform AI search. Please try again.");
            setStep(2); // Go back
        } finally {
            setIsSearching(false);
        }
    };

    const handleLinkMatch = async () => {
        if (!externalUrl) {
            toast.error("Please enter a job URL.");
            return;
        }

        setIsSearching(true);
        setStep(3); // Reuse loading step

        try {
            const data = await scrapeJobAI(externalUrl);
            setSingleJobResult(data.job);
            setStep(5); // New result step for single job
        } catch (error) {
            console.error(error);
            toast.error("Failed to analyze the link. Make sure it's a valid job posting URL.");
            setStep(1);
        } finally {
            setIsSearching(false);
        }
    };

    const reset = () => {
        setMode(null);
        setStep(1);
        setResults([]);
        setSingleJobResult(null);
        setExternalUrl('');
    };

    const renderLanding = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10">
            {/* Option 1: Deep Search */}
            <motion.div 
                whileHover={{ y: -8 }}
                onClick={() => setMode('search')}
                className="bg-white rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(49,56,81,0.05)] border border-[#C2CBD3]/20 cursor-pointer group relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#313851]/5 to-transparent rounded-bl-full transition-all group-hover:scale-110"></div>
                
                <div className="w-16 h-16 bg-[#313851] rounded-2xl flex items-center justify-center text-white mb-8 shadow-xl shadow-[#313851]/20">
                    <Globe size={32} />
                </div>
                
                <h3 className="text-2xl font-black uppercase tracking-tight mb-4 text-[#313851]">Scrape the Web</h3>
                <p className="text-[#313851]/60 font-medium leading-relaxed mb-8">
                    Let our intelligent agent scour company portals and job boards to find perfect roles tailored to your profile.
                </p>
                
                <div className="flex items-center gap-3 text-[#313851] font-black uppercase text-[11px] tracking-[0.2em]">
                    Launch Search <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
            </motion.div>

            {/* Option 2: Link Match */}
            <motion.div 
                whileHover={{ y: -8 }}
                onClick={() => setMode('link')}
                className="bg-[#313851] rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(49,56,81,0.15)] border border-white/10 cursor-pointer group relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent rounded-bl-full transition-all group-hover:scale-110"></div>
                
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#313851] mb-8 shadow-xl">
                    <Zap size={32} />
                </div>
                
                <h3 className="text-2xl font-black uppercase tracking-tight mb-4 text-white">Bring Your Job</h3>
                <p className="text-white/60 font-medium leading-relaxed mb-8">
                    Paste an external job link from any career site to instantly calculate your match score and analyze technical fit.
                </p>
                
                <div className="flex items-center gap-3 text-white font-black uppercase text-[11px] tracking-[0.2em]">
                    Check Match <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
            </motion.div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F6F3ED] text-[#313851] p-6 lg:p-10 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="mb-10 text-center">
                    <div className="flex justify-between items-center mb-10">
                        {mode && (
                            <button 
                                onClick={reset}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#313851]/40 hover:text-[#313851] transition-colors"
                            >
                                <ArrowLeft size={16} /> Back to selection
                            </button>
                        )}
                        <div className="flex-1"></div>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-[#313851] text-white shadow-lg"
                    >
                        <Sparkles size={32} />
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="text-4xl lg:text-5xl font-black tracking-tight mb-4 uppercase"
                    >
                        Check Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#313851] to-[#C2CBD3]">Match</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="text-lg text-[#313851]/70 max-w-2xl mx-auto font-medium"
                    >
                        AI-powered alignment engine for external job opportunities.
                    </motion.p>
                </header>

                <AnimatePresence mode="wait">
                    {!mode && renderLanding()}

                    {/* Mode: Search - Steps */}
                    {mode === 'search' && step < 3 && (
                        <motion.div 
                            key="search-form"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-[2.5rem] p-10 shadow-[0_8px_30px_rgb(49,56,81,0.04)] border border-[#C2CBD3]/20"
                        >
                            {/* Progress Indicator */}
                            <div className="flex items-center mb-12">
                                <div className={`flex flex-col items-center flex-1 ${step >= 1 ? 'text-[#313851]' : 'text-[#C2CBD3]'}`}>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black mb-2 transition-all ${step >= 1 ? 'bg-[#313851] text-[#F6F3ED] shadow-lg shadow-[#313851]/20' : 'bg-[#F6F3ED] text-[#C2CBD3]'}`}>1</div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Preferences</span>
                                </div>
                                <div className="flex-1 h-1 bg-[#F6F3ED] rounded-full overflow-hidden mx-4">
                                    <div className="h-full bg-[#313851] transition-all duration-500" style={{ width: step > 1 ? '100%' : '0%' }}></div>
                                </div>
                                <div className={`flex flex-col items-center flex-1 ${step >= 2 ? 'text-[#313851]' : 'text-[#C2CBD3]'}`}>
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black mb-2 transition-all ${step >= 2 ? 'bg-[#313851] text-[#F6F3ED] shadow-lg shadow-[#313851]/20' : 'bg-[#F6F3ED] text-[#C2CBD3]'}`}>2</div>
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em]">Profile Data</span>
                                </div>
                            </div>

                            {step === 1 ? (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div>
                                            <label className="block text-[10px] font-black text-[#313851] uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                                                <MapPin size={14} /> Location Target
                                            </label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. London, San Francisco, Remote"
                                                value={preferences.location}
                                                onChange={(e) => setPreferences({ ...preferences, location: e.target.value })}
                                                className="w-full p-5 bg-[#F6F3ED]/30 border border-[#C2CBD3]/30 rounded-2xl focus:ring-2 focus:ring-[#313851]/10 focus:border-[#313851] transition-all font-bold text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-black text-[#313851] uppercase tracking-[0.25em] mb-4">Work Structure</label>
                                            <div className="flex gap-3">
                                                {['remote', 'hybrid', 'onsite'].map((t) => (
                                                    <button
                                                        key={t}
                                                        onClick={() => setPreferences({ ...preferences, jobType: t })}
                                                        className={`flex-1 p-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${
                                                            preferences.jobType === t 
                                                            ? 'border-[#313851] bg-[#313851] text-white shadow-lg shadow-[#313851]/20' 
                                                            : 'border-[#C2CBD3]/30 text-[#C2CBD3] hover:border-[#313851]/30 hover:text-[#313851]'
                                                        }`}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-[10px] font-black text-[#313851] uppercase tracking-[0.25em] mb-4">Experience Horizon</label>
                                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                            {['fresher', '1-3', '3-5', '5+', 'profile'].map((l) => (
                                                <button
                                                    key={l}
                                                    onClick={() => setExperienceLevel(l)}
                                                    className={`p-4 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all ${
                                                        experienceLevel === l
                                                        ? 'border-[#313851] bg-[#313851] text-white shadow-lg shadow-[#313851]/20'
                                                        : 'border-[#C2CBD3]/30 text-[#C2CBD3] hover:border-[#313851]/30'
                                                    }`}
                                                >
                                                    {l === 'profile' ? 'Use Profile' : l + (l.includes('+') || l === 'fresher' ? '' : ' Yrs')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 flex justify-end">
                                        <button 
                                            onClick={() => preferences.location ? setStep(2) : toast.error("Enter location")}
                                            className="px-12 py-5 bg-[#313851] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#313851]/30"
                                        >
                                            Configure Profile <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div 
                                            onClick={() => setResumeOption('profile')}
                                            className={`p-8 rounded-3xl border-2 cursor-pointer transition-all ${
                                                resumeOption === 'profile' ? 'border-[#313851] bg-[#313851]/5' : 'border-[#F6F3ED] hover:border-[#C2CBD3]'
                                            }`}
                                        >
                                            <User className="mb-4 text-[#313851]" size={32} />
                                            <h4 className="text-sm font-black uppercase tracking-widest mb-1">Standard Profile</h4>
                                            <p className="text-[10px] text-[#C2CBD3] font-bold uppercase">Use the resume saved in your account settings.</p>
                                        </div>
                                        <div 
                                            onClick={() => setResumeOption('upload')}
                                            className={`p-8 rounded-3xl border-2 cursor-pointer transition-all ${
                                                resumeOption === 'upload' ? 'border-[#313851] bg-[#313851]/5' : 'border-[#F6F3ED] hover:border-[#C2CBD3]'
                                            }`}
                                        >
                                            <Upload className="mb-4 text-[#313851]" size={32} />
                                            <h4 className="text-sm font-black uppercase tracking-widest mb-1">Upload Override</h4>
                                            <p className="text-[10px] text-[#C2CBD3] font-bold uppercase">Target this specific search with a new PDF/Doc.</p>
                                        </div>
                                    </div>

                                    {resumeOption === 'upload' && (
                                        <div className="border-2 border-dashed border-[#C2CBD3]/40 rounded-[2rem] p-10 text-center bg-[#F6F3ED]/20">
                                            <input type="file" id="up" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                                            <label htmlFor="up" className="cursor-pointer flex flex-col items-center">
                                                <FileText size={48} className="text-[#C2CBD3] mb-4" />
                                                <span className="text-xs font-black uppercase tracking-widest text-[#313851]">
                                                    {file ? file.name : "Select Resume File"}
                                                </span>
                                            </label>
                                        </div>
                                    )}

                                    <div className="pt-6 flex justify-between items-center">
                                        <button onClick={() => setStep(1)} className="text-[10px] font-black uppercase tracking-widest text-[#C2CBD3]">Back</button>
                                        <button 
                                            onClick={handleSearch}
                                            className="px-12 py-5 bg-[#313851] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-[#313851]/30"
                                        >
                                            Initialize Search <Sparkles size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Mode: Link - Step 1 */}
                    {mode === 'link' && step === 1 && (
                        <motion.div 
                            key="link-form"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                            className="bg-white rounded-[2.5rem] p-12 shadow-[0_8px_30px_rgb(49,56,81,0.04)] border border-[#C2CBD3]/20"
                        >
                            <div className="text-center mb-10">
                                <div className="w-20 h-20 bg-[#F6F3ED] rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-[#313851]">
                                    <LinkIcon size={36} />
                                </div>
                                <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Instant Analysis</h2>
                                <p className="text-[#313851]/50 font-medium max-w-md mx-auto">
                                    Paste a job link from LinkedIn, Greenhouse, or any site. We'll extract the details and compare them to your profile.
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-[#313851] uppercase tracking-[0.3em] mb-4 ml-1">External Job URL</label>
                                    <div className="relative">
                                        <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-[#C2CBD3]" size={20} />
                                        <input 
                                            type="url"
                                            placeholder="https://www.linkedin.com/jobs/view/..."
                                            value={externalUrl}
                                            onChange={(e) => setExternalUrl(e.target.value)}
                                            className="w-full pl-14 pr-6 py-6 bg-[#F6F3ED]/50 border-2 border-transparent focus:border-[#313851] rounded-[1.5rem] font-bold text-sm transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={handleLinkMatch}
                                    className="w-full py-6 bg-[#313851] text-white rounded-[1.5rem] font-black text-[12px] uppercase tracking-[0.4em] flex items-center justify-center gap-4 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#313851]/30"
                                >
                                    Check Match Intensity <Zap size={20} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Common Loading Step */}
                    {step === 3 && (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-24"
                        >
                            <div className="relative mb-10">
                                <div className="absolute inset-0 bg-[#313851] blur-3xl opacity-10 rounded-full animate-pulse"></div>
                                <div className="relative bg-white p-8 rounded-[2.5rem] shadow-2xl">
                                    <Cpu size={64} className="text-[#313851] animate-spin [animation-duration:3s]" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Neural Scan Active</h2>
                            <p className="text-lg text-[#313851]/50 max-w-md text-center mb-10 font-medium">
                                {mode === 'search' 
                                    ? "Traversing company career endpoints and mapping your technical stack to live openings..."
                                    : "Extracting semantic data from the job posting and calculating alignment vectors..."}
                            </p>
                            <div className="w-72 bg-[#C2CBD3]/20 rounded-full h-2 overflow-hidden">
                                <motion.div 
                                    className="bg-[#313851] h-full"
                                    animate={{ x: [-288, 288] }}
                                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Mode: Search - Results */}
                    {step === 4 && (
                        <motion.div key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="flex justify-between items-end mb-10">
                                <div>
                                    <h2 className="text-4xl font-black uppercase tracking-tighter">Matches Found</h2>
                                    <p className="text-[10px] font-black text-[#C2CBD3] uppercase tracking-[0.4em] mt-3">Precision Search Results</p>
                                </div>
                                <button onClick={reset} className="px-8 py-3 bg-white border border-[#C2CBD3]/30 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#313851] hover:text-white transition-all shadow-sm">New Scan</button>
                            </div>

                            {results.length === 0 ? (
                                <div className="bg-white rounded-[3rem] p-20 text-center border border-[#C2CBD3]/20 shadow-sm">
                                    <Search size={64} className="mx-auto text-[#C2CBD3] mb-6 opacity-30" />
                                    <h3 className="text-2xl font-black uppercase mb-2">No High Intensity Matches</h3>
                                    <p className="text-[#313851]/50 font-medium">Try broadening your location or experience requirements.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {results.map((job, idx) => (
                                        <motion.div 
                                            key={idx}
                                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}
                                            className="bg-white rounded-[2rem] p-8 shadow-sm border border-[#C2CBD3]/10 hover:shadow-xl hover:shadow-[#313851]/5 transition-all group relative overflow-hidden"
                                        >
                                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                                <div className="w-24 h-24 bg-[#F6F3ED] rounded-[1.5rem] flex flex-col items-center justify-center border border-[#C2CBD3]/20">
                                                    <span className="text-3xl font-black text-[#313851]">{job.match_score}%</span>
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-[#C2CBD3]">Match</span>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-black tracking-tight mb-1">{job.title}</h3>
                                                    <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[#C2CBD3] mb-4">
                                                        <span>{job.company}</span>
                                                        <span className="w-1.5 h-1.5 bg-[#C2CBD3] rounded-full"></span>
                                                        <span>{job.location}</span>
                                                    </div>
                                                    <p className="text-sm text-[#313851]/70 line-clamp-2 italic">
                                                        "{job.ai_insight}"
                                                    </p>
                                                </div>
                                                <a href={job.url} target="_blank" rel="noreferrer" className="px-10 py-4 bg-[#313851] text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center gap-3 hover:scale-110 transition-all">
                                                    View Role <ArrowUpRight size={16} />
                                                </a>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Mode: Link - Result */}
                    {step === 5 && singleJobResult && (
                        <motion.div key="single-result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                            <div className="bg-white rounded-[3rem] p-12 shadow-2xl shadow-[#313851]/5 border border-[#C2CBD3]/20 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-10">
                                    <div className={`w-32 h-32 rounded-full border-8 flex items-center justify-center ${
                                        (singleJobResult.match_score || 0) > 70 ? 'border-green-500/20 text-green-600' : 'border-yellow-500/20 text-yellow-600'
                                    }`}>
                                        <div className="text-center">
                                            <div className="text-4xl font-black">{singleJobResult.match_score || '??'}%</div>
                                            <div className="text-[8px] font-black uppercase tracking-widest">Match</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="max-w-2xl">
                                    <h2 className="text-4xl font-black tracking-tighter mb-2">{singleJobResult.title}</h2>
                                    <div className="flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em] text-[#C2CBD3] mb-10">
                                        <span>{singleJobResult.company}</span>
                                        <span className="w-2 h-2 bg-[#C2CBD3] rounded-full"></span>
                                        <span>{singleJobResult.location}</span>
                                    </div>

                                    <div className="space-y-10">
                                        <div>
                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#313851] mb-4">Match Analysis</h4>
                                            <p className="text-lg text-[#313851]/80 leading-relaxed font-medium italic">
                                                "{singleJobResult.match_insight || singleJobResult.description}"
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="bg-[#F6F3ED]/50 p-6 rounded-3xl">
                                                <h5 className="text-[9px] font-black uppercase tracking-widest text-green-600 mb-4 flex items-center gap-2">
                                                    <CheckCircle2 size={14} /> Strength Overlap
                                                </h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {(singleJobResult.matched_skills || []).map(s => (
                                                        <span key={s} className="px-3 py-1 bg-white border border-green-500/20 text-[#313851] text-[9px] font-black rounded-full uppercase">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="bg-[#F6F3ED]/50 p-6 rounded-3xl">
                                                <h5 className="text-[9px] font-black uppercase tracking-widest text-red-400 mb-4 flex items-center gap-2">
                                                    <Zap size={14} /> Gap Identified
                                                </h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {(singleJobResult.missing_skills || []).map(s => (
                                                        <span key={s} className="px-3 py-1 bg-white border border-red-500/20 text-[#313851] text-[9px] font-black rounded-full uppercase">{s}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-12 flex gap-4">
                                        <a href={externalUrl} target="_blank" rel="noreferrer" className="flex-1 py-5 bg-[#313851] text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl">
                                            Go to Official Posting <ArrowUpRight size={18} />
                                        </a>
                                        <button onClick={reset} className="px-10 py-5 bg-[#F6F3ED] text-[#313851] rounded-2xl font-black text-[12px] uppercase tracking-[0.3em] border border-[#C2CBD3]/30">
                                            New Analysis
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default JobsAIPage;
