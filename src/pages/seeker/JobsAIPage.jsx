import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Briefcase, FileText, Upload, Search, ChevronRight, CheckCircle2, ArrowUpRight, Cpu, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { searchJobsAI } from '../../api/jobsAIApi';
import { useAuth } from '../../hooks/useAuth';

const JobsAIPage = () => {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [preferences, setPreferences] = useState({
        location: '',
        jobType: 'remote' // remote, hybrid, onsite
    });
    const [resumeOption, setResumeOption] = useState('profile'); // profile, upload
    const [experienceLevel, setExperienceLevel] = useState('profile'); // 'fresher', '1-3', '3-5', '5+', 'profile'
    const [file, setFile] = useState(null);
    const [isSearching, setIsSearching] = useState(false);
    const [results, setResults] = useState([]);

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

    return (
        <div className="min-h-screen bg-[#F6F3ED] text-[#313851] p-6 lg:p-10 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <header className="mb-10 text-center">
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-[#C2CBD3]/20 text-[#313851] shadow-sm"
                    >
                        <Sparkles size={32} />
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                        className="text-4xl lg:text-5xl font-black tracking-tight mb-4"
                    >
                        Jobs <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#313851] to-[#C2CBD3]">AI</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="text-lg text-[#313851]/70 max-w-2xl mx-auto"
                    >
                        Let our intelligent agent scour the web to find the perfect roles tailored precisely to your resume and preferences.
                    </motion.p>
                </header>

                <AnimatePresence mode="wait">
                    {/* Step 1 & 2: Form */}
                    {step < 3 && (
                        <motion.div 
                            key="form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(49,56,81,0.04)] border border-[#C2CBD3]/20"
                        >
                            {/* Progress Indicator */}
                            <div className="flex items-center mb-8 pb-8 border-b border-[#F6F3ED]">
                                <div className={`flex flex-col items-center flex-1 ${step >= 1 ? 'text-[#313851]' : 'text-[#C2CBD3]'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${step >= 1 ? 'bg-[#313851] text-[#F6F3ED]' : 'bg-[#F6F3ED] text-[#C2CBD3]'}`}>1</div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Preferences</span>
                                </div>
                                <div className="flex-1 h-1 bg-[#F6F3ED] rounded-full overflow-hidden mx-2">
                                    <div className="h-full bg-[#313851] transition-all duration-500" style={{ width: step > 1 ? '100%' : '0%' }}></div>
                                </div>
                                <div className={`flex flex-col items-center flex-1 ${step >= 2 ? 'text-[#313851]' : 'text-[#C2CBD3]'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${step >= 2 ? 'bg-[#313851] text-[#F6F3ED]' : 'bg-[#F6F3ED] text-[#C2CBD3]'}`}>2</div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Resume Info</span>
                                </div>
                            </div>

                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h2 className="text-2xl font-black tracking-tight mb-6 flex items-center gap-2 uppercase text-[14px]">
                                        <Briefcase className="text-[#313851]" /> What are you looking for?
                                    </h2>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] font-black text-[#313851] uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                                                <MapPin size={14} /> Preferred Location
                                            </label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. New York, London, Worldwide"
                                                value={preferences.location}
                                                onChange={(e) => setPreferences({ ...preferences, location: e.target.value })}
                                                className="w-full p-4 bg-[#F6F3ED]/30 border border-[#C2CBD3]/30 rounded-xl focus:ring-2 focus:ring-[#313851]/10 focus:border-[#313851] transition-all font-semibold text-sm"
                                            />
                                        </div>

                                        <div className="mb-6">
                                            <label className="block text-[10px] font-black text-[#313851] uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                                                <Briefcase size={14} className="text-[#313851]" />
                                                Experience Level
                                            </label>
                                            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                                {[
                                                    { id: 'fresher', label: 'Fresher' },
                                                    { id: '1-3', label: '1-3 Yrs' },
                                                    { id: '3-5', label: '3-5 Yrs' },
                                                    { id: '5+', label: '5+ Yrs' },
                                                    { id: 'profile', label: 'Use Profile' }
                                                ].map((level) => (
                                                    <button
                                                        key={level.id}
                                                        type="button"
                                                        onClick={() => setExperienceLevel(level.id)}
                                                        className={`px-3 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border ${
                                                            experienceLevel === level.id
                                                                ? 'border-[#313851] bg-[#313851] text-[#F6F3ED] shadow-lg shadow-[#313851]/10'
                                                                : 'border-[#C2CBD3]/30 bg-white text-[#C2CBD3] hover:border-[#313851]/30 hover:text-[#313851]'
                                                        }`}
                                                    >
                                                        {level.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-[#313851] uppercase tracking-widest mb-3 ml-1">Work Model</label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {['remote', 'hybrid', 'onsite'].map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => setPreferences({ ...preferences, jobType: type })}
                                                        className={`p-4 rounded-xl border font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                                                            preferences.jobType === type 
                                                            ? 'border-[#313851] bg-[#313851] text-[#F6F3ED] shadow-lg shadow-[#313851]/10' 
                                                            : 'border-[#C2CBD3]/30 hover:border-[#313851]/30 text-[#C2CBD3] hover:text-[#313851]'
                                                        }`}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 flex justify-end">
                                        <button 
                                            onClick={() => {
                                                if(!preferences.location) toast.error("Please enter a location");
                                                else setStep(2);
                                            }}
                                            className="px-10 py-4 bg-[#313851] text-[#F6F3ED] rounded-xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#313851]/20"
                                        >
                                            Next Phase <ChevronRight size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h2 className="text-2xl font-black tracking-tight mb-6 flex items-center gap-2 uppercase text-[14px]">
                                        <FileText className="text-[#313851]" /> Choose Your Resume
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div 
                                            onClick={() => setResumeOption('profile')}
                                            className={`cursor-pointer p-6 rounded-2xl border transition-all relative overflow-hidden ${
                                                resumeOption === 'profile' 
                                                ? 'border-[#313851] bg-[#313851]/5' 
                                                : 'border-[#C2CBD3]/30 hover:border-[#313851]/30'
                                            }`}
                                        >
                                            {resumeOption === 'profile' && (
                                                <div className="absolute top-4 right-4 text-[#313851]">
                                                    <CheckCircle2 size={24} />
                                                </div>
                                            )}
                                            <User className="text-[#313851] mb-4" size={32} />
                                            <h3 className="text-[14px] font-black uppercase tracking-widest mb-2">Use Profile Data</h3>
                                            <p className="text-[10px] font-bold text-[#C2CBD3] uppercase tracking-wide">We'll use the resume details already saved in your profile.</p>
                                        </div>

                                        <div 
                                            onClick={() => setResumeOption('upload')}
                                            className={`cursor-pointer p-6 rounded-2xl border transition-all relative overflow-hidden ${
                                                resumeOption === 'upload' 
                                                ? 'border-[#313851] bg-[#313851]/5' 
                                                : 'border-[#C2CBD3]/30 hover:border-[#313851]/30'
                                            }`}
                                        >
                                            {resumeOption === 'upload' && (
                                                <div className="absolute top-4 right-4 text-[#313851]">
                                                    <CheckCircle2 size={24} />
                                                </div>
                                            )}
                                            <Upload className="text-[#C2CBD3] mb-4" size={32} />
                                            <h3 className="text-[14px] font-black uppercase tracking-widest mb-2">Upload New Resume</h3>
                                            <p className="text-[10px] font-bold text-[#C2CBD3] uppercase tracking-wide">Upload a specific PDF or DOCX file for this search.</p>
                                        </div>
                                    </div>

                                    {resumeOption === 'upload' && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }} 
                                            animate={{ opacity: 1, height: 'auto' }} 
                                            className="mb-8"
                                        >
                                            <div className="border-2 border-dashed border-[#C2CBD3]/30 rounded-2xl p-8 text-center hover:border-[#313851]/50 transition-colors bg-[#F6F3ED]/30">
                                                <input 
                                                    type="file" 
                                                    accept=".pdf,.docx,.doc" 
                                                    onChange={(e) => setFile(e.target.files[0])}
                                                    className="hidden" 
                                                    id="resume-upload" 
                                                />
                                                <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                                                    <FileText size={40} className="text-[#C2CBD3] mb-3" />
                                                    <span className="text-[11px] font-black text-[#313851] uppercase tracking-[0.2em] block mb-1">
                                                        {file ? file.name : "Click to browse or drag file here"}
                                                    </span>
                                                    <span className="text-[9px] font-bold text-[#C2CBD3] uppercase tracking-widest">PDF or Word docs up to 5MB</span>
                                                </label>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="mt-8 flex justify-between">
                                        <button 
                                            onClick={() => setStep(1)}
                                            className="px-8 py-4 text-[#C2CBD3] font-black text-[11px] uppercase tracking-[0.3em] hover:text-[#313851] transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button 
                                            onClick={handleSearch}
                                            className="px-10 py-4 bg-[#313851] text-[#F6F3ED] rounded-xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#313851]/20"
                                        >
                                            <Search size={18} /> Establish AI Link
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* Step 3: Loading */}
                    {step === 3 && (
                        <motion.div 
                            key="loading"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20"
                        >
                            <div className="relative mb-8">
                                <div className="absolute inset-0 bg-[#313851] blur-2xl opacity-10 rounded-full animate-pulse"></div>
                                <div className="relative bg-white p-6 rounded-full shadow-2xl">
                                    <Cpu size={48} className="text-[#313851] animate-bounce" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Deep Scan Active</h2>
                            <p className="text-lg text-gray-500 max-w-md text-center mb-8">
                                Navigating to company career portals, analyzing full job descriptions, and evaluating technical alignment...
                            </p>
                            
                            <div className="w-64 bg-[#F6F3ED] rounded-full h-1.5 mb-4 overflow-hidden">
                                <div className="bg-[#313851] h-full rounded-full w-full animate-[progress_2s_ease-in-out_infinite] origin-left"></div>
                            </div>
                            <style>{`
                                @keyframes progress {
                                    0% { transform: scaleX(0); opacity: 1; }
                                    50% { transform: scaleX(1); opacity: 1; }
                                    100% { transform: scaleX(1); opacity: 0; }
                                }
                            `}</style>
                        </motion.div>
                    )}

                    {/* Step 4: Results */}
                    {step === 4 && (
                        <motion.div 
                            key="results"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex justify-between items-end mb-8">
                                <div>
                                    <h2 className="text-3xl font-black uppercase tracking-tighter">Your Top Matches</h2>
                                    <p className="text-[10px] font-bold text-[#C2CBD3] uppercase tracking-widest mt-2">Curated exclusively for you based on your resume.</p>
                                </div>
                                <button 
                                    onClick={() => { setStep(1); setResults([]); }}
                                    className="px-6 py-2.5 bg-white border border-[#C2CBD3]/30 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#F6F3ED] transition-all shadow-sm"
                                >
                                    New Node
                                </button>
                            </div>

                            {results.length === 0 ? (
                                <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
                                    <Search size={48} className="mx-auto text-gray-300 mb-4" />
                                    <h3 className="text-xl font-bold mb-2">No Matches Found</h3>
                                    <p className="text-gray-500">We couldn't find high-quality matches right now. Try adjusting your preferences.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {results.map((job, index) => (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            key={index}
                                            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group"
                                        >
                                            <div className="absolute top-0 left-0 w-2 h-full bg-[#313851] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            
                                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                                {/* Score */}
                                                <div className="flex flex-col items-center justify-center p-4 bg-[#C2CBD3]/10 rounded-xl min-w-[100px] border border-[#C2CBD3]/20">
                                                    <span className="text-3xl font-black text-[#313851]">{job.match_score}%</span>
                                                    <span className="text-[10px] uppercase tracking-[0.2em] font-black text-[#C2CBD3]">Match</span>
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-black tracking-tight mb-1">{job.title}</h3>
                                                    <p className="text-[10px] font-black text-[#C2CBD3] uppercase tracking-[0.3em] mb-4">{job.company}</p>
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                         <span className="px-3 py-1.5 bg-[#F6F3ED] text-[#313851] text-[10px] font-black rounded-full uppercase tracking-widest">
                                                             {job.location}
                                                         </span>
                                                         <span className="px-3 py-1.5 bg-[#313851] text-[#F6F3ED] text-[10px] font-black rounded-full uppercase tracking-widest">
                                                             {job.type || 'Full Time'}
                                                         </span>
                                                         {job.details && (
                                                             <>
                                                                 <span className={`px-3 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest border ${job.details.skills ? 'bg-white border-[#313851] text-[#313851]' : 'bg-white border-[#C2CBD3]/30 text-[#C2CBD3]'}`}>
                                                                     {job.details.skills ? '✓ Skills Match' : '⨯ Skills Gap'}
                                                                 </span>
                                                                 <span className={`px-3 py-1.5 text-[9px] font-black rounded-full uppercase tracking-widest border ${job.details.experience ? 'bg-white border-[#313851] text-[#313851]' : 'bg-white border-[#C2CBD3]/30 text-[#C2CBD3]'}`}>
                                                                     {job.details.experience ? '✓ Exp. Fit' : '⨯ Exp. Gap'}
                                                                 </span>
                                                             </>
                                                         )}
                                                     </div>
                                                     <p className="text-sm text-[#313851]/70 line-clamp-3">
                                                         <span className="font-black text-[#313851] uppercase text-[10px] tracking-widest">AI Deep Insight:</span> {job.ai_insight}
                                                     </p>
                                                </div>

                                                {/* Action */}
                                                <div className="w-full md:w-auto">
                                                    <a 
                                                        href={job.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-3 bg-[#313851] text-[#F6F3ED] rounded-xl font-black text-[11px] uppercase tracking-[0.2em] hover:scale-[1.05] transition-all shadow-xl shadow-[#313851]/20"
                                                    >
                                                        Secure Role <ArrowUpRight size={16} />
                                                    </a>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default JobsAIPage;
