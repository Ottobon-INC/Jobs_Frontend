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
                        className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-indigo-100 text-indigo-600 shadow-sm"
                    >
                        <Sparkles size={32} />
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                        className="text-4xl lg:text-5xl font-black tracking-tight mb-4"
                    >
                        Jobs <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">AI</span>
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
                            className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-indigo-50"
                        >
                            {/* Progress Indicator */}
                            <div className="flex items-center mb-8 pb-8 border-b border-gray-100">
                                <div className={`flex flex-col items-center flex-1 ${step >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${step >= 1 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>1</div>
                                    <span className="text-sm font-semibold">Preferences</span>
                                </div>
                                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden mx-2">
                                    <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: step > 1 ? '100%' : '0%' }}></div>
                                </div>
                                <div className={`flex flex-col items-center flex-1 ${step >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${step >= 2 ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400'}`}>2</div>
                                    <span className="text-sm font-semibold">Resume Info</span>
                                </div>
                            </div>

                            {step === 1 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <Briefcase className="text-indigo-600" /> What are you looking for?
                                    </h2>
                                    
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                                                <MapPin size={16} /> Preferred Location
                                            </label>
                                            <input 
                                                type="text" 
                                                placeholder="e.g. New York, London, Worldwide"
                                                value={preferences.location}
                                                onChange={(e) => setPreferences({ ...preferences, location: e.target.value })}
                                                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium"
                                            />
                                        </div>

                                        <div className="mb-6">
                                            <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                                <Briefcase size={16} className="text-indigo-600" />
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
                                                        className={`px-3 py-3 rounded-xl font-bold text-xs transition-all border-2 ${
                                                            experienceLevel === level.id
                                                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm'
                                                                : 'border-gray-100 bg-white text-gray-400 hover:border-gray-200'
                                                        }`}
                                                    >
                                                        {level.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-3">Work Model</label>
                                            <div className="grid grid-cols-3 gap-4">
                                                {['remote', 'hybrid', 'onsite'].map((type) => (
                                                    <button
                                                        key={type}
                                                        onClick={() => setPreferences({ ...preferences, jobType: type })}
                                                        className={`p-4 rounded-xl border-2 font-bold capitalize transition-all ${
                                                            preferences.jobType === type 
                                                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700' 
                                                            : 'border-gray-200 hover:border-indigo-300 text-gray-600'
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
                                            className="px-8 py-4 bg-[#313851] text-[#F6F3ED] rounded-xl font-bold flex items-center gap-2 hover:bg-black transition-colors"
                                        >
                                            Next Step <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                        <FileText className="text-indigo-600" /> Choose Your Resume
                                    </h2>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div 
                                            onClick={() => setResumeOption('profile')}
                                            className={`cursor-pointer p-6 rounded-2xl border-2 transition-all relative overflow-hidden ${
                                                resumeOption === 'profile' 
                                                ? 'border-indigo-600 bg-indigo-50/50' 
                                                : 'border-gray-200 hover:border-indigo-300'
                                            }`}
                                        >
                                            {resumeOption === 'profile' && (
                                                <div className="absolute top-4 right-4 text-indigo-600">
                                                    <CheckCircle2 size={24} />
                                                </div>
                                            )}
                                            <User className="text-indigo-500 mb-4" size={32} />
                                            <h3 className="text-lg font-bold mb-2">Use Profile Data</h3>
                                            <p className="text-sm text-gray-600">We'll use the resume details already saved in your profile.</p>
                                        </div>

                                        <div 
                                            onClick={() => setResumeOption('upload')}
                                            className={`cursor-pointer p-6 rounded-2xl border-2 transition-all relative overflow-hidden ${
                                                resumeOption === 'upload' 
                                                ? 'border-indigo-600 bg-indigo-50/50' 
                                                : 'border-gray-200 hover:border-indigo-300'
                                            }`}
                                        >
                                            {resumeOption === 'upload' && (
                                                <div className="absolute top-4 right-4 text-indigo-600">
                                                    <CheckCircle2 size={24} />
                                                </div>
                                            )}
                                            <Upload className="text-purple-500 mb-4" size={32} />
                                            <h3 className="text-lg font-bold mb-2">Upload New Resume</h3>
                                            <p className="text-sm text-gray-600">Upload a specific PDF or DOCX file for this search.</p>
                                        </div>
                                    </div>

                                    {resumeOption === 'upload' && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }} 
                                            animate={{ opacity: 1, height: 'auto' }} 
                                            className="mb-8"
                                        >
                                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:border-indigo-400 transition-colors bg-gray-50">
                                                <input 
                                                    type="file" 
                                                    accept=".pdf,.docx,.doc" 
                                                    onChange={(e) => setFile(e.target.files[0])}
                                                    className="hidden" 
                                                    id="resume-upload" 
                                                />
                                                <label htmlFor="resume-upload" className="cursor-pointer flex flex-col items-center">
                                                    <FileText size={40} className="text-gray-400 mb-3" />
                                                    <span className="font-bold text-gray-700 block mb-1">
                                                        {file ? file.name : "Click to browse or drag file here"}
                                                    </span>
                                                    <span className="text-sm text-gray-500">PDF or Word docs up to 5MB</span>
                                                </label>
                                            </div>
                                        </motion.div>
                                    )}

                                    <div className="mt-8 flex justify-between">
                                        <button 
                                            onClick={() => setStep(1)}
                                            className="px-6 py-4 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors"
                                        >
                                            Back
                                        </button>
                                        <button 
                                            onClick={handleSearch}
                                            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/30"
                                        >
                                            <Search size={20} /> Initialize AI Search
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
                                <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
                                <div className="relative bg-white p-6 rounded-full shadow-2xl">
                                    <Cpu size={48} className="text-indigo-600 animate-bounce" />
                                </div>
                            </div>
                            <h2 className="text-3xl font-black mb-4">Deep Scan Active</h2>
                            <p className="text-lg text-gray-500 max-w-md text-center mb-8">
                                Navigating to company career portals, analyzing full job descriptions, and evaluating technical alignment...
                            </p>
                            
                            <div className="w-64 bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
                                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 h-2 rounded-full w-full animate-[progress_2s_ease-in-out_infinite] origin-left"></div>
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
                                    <h2 className="text-3xl font-black">Your Top Matches</h2>
                                    <p className="text-gray-600">Curated exclusively for you based on your resume.</p>
                                </div>
                                <button 
                                    onClick={() => { setStep(1); setResults([]); }}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    New Search
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
                                            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            
                                            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                                                {/* Score */}
                                                <div className="flex flex-col items-center justify-center p-4 bg-indigo-50 rounded-xl min-w-[100px]">
                                                    <span className="text-3xl font-black text-indigo-700">{job.match_score}%</span>
                                                    <span className="text-[10px] uppercase tracking-wider font-bold text-indigo-400">Match</span>
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                                                    <p className="text-gray-600 font-medium mb-3">{job.company}</p>
                                                    <div className="flex flex-wrap gap-2 mb-4">
                                                         <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wide">
                                                             {job.location}
                                                         </span>
                                                         <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full uppercase tracking-wide">
                                                             {job.type || 'Full Time'}
                                                         </span>
                                                         {job.details && (
                                                             <>
                                                                 <span className={`px-2 py-1 text-[10px] font-black rounded-md uppercase tracking-tighter ${job.details.skills ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400'}`}>
                                                                     {job.details.skills ? '✓ Skills Match' : '⨯ Skills Gap'}
                                                                 </span>
                                                                 <span className={`px-2 py-1 text-[10px] font-black rounded-md uppercase tracking-tighter ${job.details.experience ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400'}`}>
                                                                     {job.details.experience ? '✓ Exp. Fit' : '⨯ Exp. Gap'}
                                                                 </span>
                                                             </>
                                                         )}
                                                     </div>
                                                     <p className="text-sm text-gray-500 line-clamp-3">
                                                         <span className="font-bold text-gray-700">AI Deep Insight:</span> {job.ai_insight}
                                                     </p>
                                                </div>

                                                {/* Action */}
                                                <div className="w-full md:w-auto">
                                                    <a 
                                                        href={job.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#313851] text-[#F6F3ED] rounded-xl font-bold hover:bg-black transition-colors"
                                                    >
                                                        Apply Now <ArrowUpRight size={18} />
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
