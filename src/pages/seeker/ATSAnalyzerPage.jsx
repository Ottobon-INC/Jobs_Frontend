import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ShieldCheck, 
    ArrowLeft, 
    Upload, 
    FileText, 
    Sparkles, 
    CheckCircle, 
    AlertTriangle, 
    Terminal, 
    Copy, 
    Check, 
    RefreshCw, 
    HelpCircle, 
    ListTodo, 
    Trash2 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { analyzeResumeATS, parseResumeStructured } from '../../api/resumeAnalyzerApi';
import { getMyProfile } from '../../api/usersApi';
import HowItWorksWidget from '../../components/ui/HowItWorksWidget';
import ResumeDesignerWorkspace from '../../components/resume/ResumeDesignerWorkspace';


// Refined Neu-Minimalist Card styling
const Card = ({ children, className = "", delay = 0 }) => (
    <motion.div
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
        className={`bg-white border border-zinc-100 rounded-2xl p-6 md:p-8 flex flex-col shadow-xl shadow-zinc-900/5 relative overflow-hidden transition-all duration-300 ${className}`}
    >
        {children}
    </motion.div>
);

const ATSAnalyzerPage = () => {
    const location = useLocation();
    const howItWorksSteps = [
        {
            title: "Add Your Resume",
            description: "Upload your resume as a PDF or text file, or paste your resume text directly into the box.",
            icon: Upload
        },
        {
            title: "Add the Job Description",
            description: "Paste the description of the job you want to apply for so we can compare it to your resume.",
            icon: Terminal
        },
        {
            title: "Get Helpful Tips",
            description: "See a compatibility score, list of matching skills, missing keywords, and custom copy-paste prompts you can use with ChatGPT, Claude, or Gemini to quickly rewrite and improve your resume.",
            icon: Sparkles
        }
    ];

    // Input state
    const [file, setFile] = useState(null);
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState(() => {
        return sessionStorage.getItem('ats_jobDescription') || '';
    });
    const [showTextPaste, setShowTextPaste] = useState(() => {
        return sessionStorage.getItem('ats_showTextPaste') === 'true';
    });

    // Profile resume states
    const [profileResumeText, setProfileResumeText] = useState('');
    const [profileResumeFileName, setProfileResumeFileName] = useState('');
    const [useProfileResume, setUseProfileResume] = useState(false);
    const [fetchingProfile, setFetchingProfile] = useState(false);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setFetchingProfile(true);
                const data = await getMyProfile();
                if (data?.resume_text) {
                    setProfileResumeText(data.resume_text);
                    setProfileResumeFileName(data.resume_file_name || 'profile_resume.pdf');
                    setUseProfileResume(true);
                }
            } catch (err) {
                console.error("Failed to fetch user profile for ATS scanner", err);
            } finally {
                setFetchingProfile(false);
            }
        };

        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (location.state?.jobDescription) {
            setJobDescription(location.state.jobDescription);
        }
    }, [location.state]);

    // Flow & loading states
    const [loading, setLoading] = useState(false);
    const [loadingStage, setLoadingStage] = useState(0);
    const [error, setError] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(() => {
        const stored = sessionStorage.getItem('ats_analysisResult');
        return stored ? JSON.parse(stored) : null;
    });

    // Interactivity
    const [activePromptTab, setActivePromptTab] = useState('chatgpt');
    const [copied, setCopied] = useState(false);
    const [completedTips, setCompletedTips] = useState(() => {
        const stored = sessionStorage.getItem('ats_completedTips');
        return stored ? JSON.parse(stored) : {};
    });

    // Structured Resume Designer States
    const [showDesigner, setShowDesigner] = useState(() => {
        return sessionStorage.getItem('ats_showDesigner') === 'true';
    });
    const [parsingStructured, setParsingStructured] = useState(false);
    const [structuredResume, setStructuredResume] = useState(() => {
        const stored = sessionStorage.getItem('ats_structuredResume');
        return stored ? JSON.parse(stored) : null;
    });
    const parsingPromiseRef = useRef(null);

    // Sync state changes to sessionStorage to handle page refreshes seamlessly
    useEffect(() => {
        if (analysisResult) {
            sessionStorage.setItem('ats_analysisResult', JSON.stringify(analysisResult));
        } else {
            sessionStorage.removeItem('ats_analysisResult');
        }
    }, [analysisResult]);

    useEffect(() => {
        if (structuredResume) {
            sessionStorage.setItem('ats_structuredResume', JSON.stringify(structuredResume));
        } else {
            sessionStorage.removeItem('ats_structuredResume');
        }
    }, [structuredResume]);

    useEffect(() => {
        sessionStorage.setItem('ats_showDesigner', showDesigner.toString());
    }, [showDesigner]);

    useEffect(() => {
        sessionStorage.setItem('ats_jobDescription', jobDescription);
    }, [jobDescription]);

    useEffect(() => {
        sessionStorage.setItem('ats_showTextPaste', showTextPaste.toString());
    }, [showTextPaste]);

    useEffect(() => {
        sessionStorage.setItem('ats_completedTips', JSON.stringify(completedTips));
    }, [completedTips]);

    const handleOpenDesigner = async () => {
        if (structuredResume) {
            setShowDesigner(true);
            return;
        }

        setParsingStructured(true);
        const toastId = toast.loading("Structuring resume details...");

        try {
            let data;
            if (parsingPromiseRef.current) {
                // Reuse the background parsing request that was initiated when the ATS scan finished
                data = await parsingPromiseRef.current;
            } else {
                const payload = {
                    resume_text: analysisResult?.extracted_resume_text || resumeText || profileResumeText || ""
                };
                data = await parseResumeStructured(payload);
            }
            if (data) {
                setStructuredResume(data);
                setShowDesigner(true);
                toast.success("Structured layout ready!", { id: toastId });
            } else {
                throw new Error("No structured data returned.");
            }
        } catch (err) {
            console.error("Structured parse failed", err);
            toast.error(err.response?.data?.detail || "Failed to extract structured sections. Please try again.", { id: toastId });
        } finally {
            setParsingStructured(false);
        }
    };

    if (showDesigner && structuredResume) {
        return (
            <ResumeDesignerWorkspace 
                resumeData={structuredResume}
                setResumeData={setStructuredResume}
                analysisResult={analysisResult}
                onClose={() => setShowDesigner(false)}
            />
        );
    }


    // Stages messaging for clean visual transition
    const stages = [
        "Ingesting resume documents...",
        "Extracting core competencies...",
        "Evaluating against job description...",
        "Calculating ATS compatibility score...",
        "Generating multi-model prompt suites...",
        "Polishing and rendering dashboard..."
    ];

    const triggerLoadingStages = (callback) => {
        setLoadingStage(0);
        let stage = 0;
        const interval = setInterval(() => {
            stage += 1;
            if (stage < stages.length) {
                setLoadingStage(stage);
            } else {
                clearInterval(interval);
            }
        }, 1800);
        return interval;
    };

    const handleFileDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && (droppedFile.type === "application/pdf" || droppedFile.type === "text/plain" || droppedFile.name.endsWith(".txt") || droppedFile.name.endsWith(".pdf"))) {
            setFile(droppedFile);
            setResumeText('');
            setError(null);
        } else {
            setError("Invalid file type. Please upload a PDF or TXT file.");
        }
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResumeText('');
            setError(null);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (useProfileResume) {
            if (!profileResumeText.trim()) {
                setError("Profile resume is empty or invalid. Please upload a file instead.");
                return;
            }
        } else {
            if (!file && !resumeText.trim()) {
                setError("Please upload a resume file or paste your resume text first.");
                return;
            }
        }
        if (!jobDescription.trim()) {
            setError("Please enter the job description manually to perform matching.");
            return;
        }

        setStructuredResume(null);
        parsingPromiseRef.current = null;
        setLoading(true);
        const stageInterval = triggerLoadingStages();

        try {
            const formData = new FormData();
            if (useProfileResume) {
                formData.append('resume_text', profileResumeText);
            } else if (file) {
                formData.append('file', file);
            } else {
                formData.append('resume_text', resumeText);
            }
            formData.append('job_description', jobDescription);

            const result = await analyzeResumeATS(formData);

            // Initiate background pre-fetch immediately after scan finishes to eliminate Format & Customize latency
            const payload = {
                resume_text: result?.extracted_resume_text || resumeText || profileResumeText || ""
            };
            const promise = parseResumeStructured(payload)
                .then(data => {
                    setStructuredResume(data);
                    return data;
                })
                .catch(err => {
                    console.error("Background structured parse failed", err);
                    return null;
                });
            parsingPromiseRef.current = promise;
            
            setTimeout(() => {
                setAnalysisResult(result);
                setLoading(false);
                clearInterval(stageInterval);
            }, 1000);

        } catch (err) {
            console.error("ATS analysis error", err);
            setError(err.response?.data?.detail || "An unexpected error occurred during ATS analysis. Please try again.");
            setLoading(false);
            clearInterval(stageInterval);
        }
    };

    const handleCopyPrompt = (promptText) => {
        if (!promptText) return;
        navigator.clipboard.writeText(promptText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleTipCompleted = (index) => {
        setCompletedTips(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    const handleReset = () => {
        setAnalysisResult(null);
        setFile(null);
        setResumeText('');
        setJobDescription('');
        setCompletedTips({});
        setError(null);
        if (profileResumeText) {
            setUseProfileResume(true);
        } else {
            setUseProfileResume(false);
        }
        setStructuredResume(null);
        parsingPromiseRef.current = null;
    };

    // Score evaluation graphics variables
    const score = analysisResult?.ats_score || 0;
    let scoreColor = "text-rose-500";
    let scoreStroke = "#f43f5e";
    let scoreBg = "bg-rose-50";
    let scoreBorder = "border-rose-100";
    let scoreBadgeColor = "bg-rose-50 text-rose-600 border-rose-200/50";
    let scoreBadge = "Action Required";
    
    if (score >= 80) {
        scoreColor = "text-emerald-500";
        scoreStroke = "#10b981";
        scoreBg = "bg-emerald-50";
        scoreBorder = "border-emerald-100";
        scoreBadgeColor = "bg-emerald-50 text-emerald-600 border-emerald-200/50";
        scoreBadge = "Strong Alignment";
    } else if (score >= 50) {
        scoreColor = "text-amber-500";
        scoreStroke = "#f59e0b";
        scoreBg = "bg-amber-50";
        scoreBorder = "border-amber-100";
        scoreBadgeColor = "bg-amber-50 text-amber-600 border-amber-200/50";
        scoreBadge = "Competitive Match";
    }

    return (
        <div className="min-h-screen pt-8 pb-16 px-6 md:px-10 max-w-[1600px] mx-auto bg-[#FBFBFB] font-sans relative">
            {/* Ambient light glow backdrop */}
            <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-zinc-50 to-transparent pointer-events-none opacity-40" />

            {/* Header section */}
            <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10"
            >
                <div>
                    <Link to="/jobs" className="inline-flex items-center gap-2 text-zinc-400 font-bold uppercase text-[10px] tracking-[0.3em] hover:text-zinc-600 transition-colors mb-3">
                        <ArrowLeft size={14} /> Back to Job Board
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight flex items-center gap-3">
                        <ShieldCheck size={32} className="text-zinc-900" />
                        Resume ATS Scanner
                    </h1>
                    <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.4em] mt-5 flex items-center gap-3">
                        <div className="w-8 h-[1px] bg-zinc-200" />
                        AI matching diagnostics and optimized model rewrites.
                    </div>
                </div>

                {analysisResult && (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleOpenDesigner}
                            disabled={parsingStructured}
                            className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 shadow-md flex items-center gap-2"
                        >
                            {parsingStructured ? (
                                <RefreshCw size={14} className="animate-spin" />
                            ) : (
                                <Sparkles size={14} className="text-zinc-200 animate-pulse" />
                            )}
                            {parsingStructured ? "Structuring..." : "Format & Customize"}
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-6 py-3 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-900 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 shadow-sm"
                        >
                            Scan New Resume
                        </button>
                    </div>
                )}
            </motion.div>

            <HowItWorksWidget
                pageKey="ats-scanner"
                title="How Resume ATS Scanner Works"
                icon={ShieldCheck}
                steps={howItWorksSteps}
                theme="neutral"
            />

            {/* Error Banner */}
            {error && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-8 bg-rose-50/50 border border-rose-100 text-zinc-950 p-5 rounded-2xl flex items-start gap-4 shadow-sm"
                >
                    <AlertTriangle className="text-rose-500 shrink-0" size={20} />
                    <div>
                        <h4 className="font-bold text-xs tracking-tight text-rose-600 mb-0.5">Analysis Issue</h4>
                        <p className="text-xs font-medium text-zinc-500 leading-relaxed">{error}</p>
                    </div>
                </motion.div>
            )}

            {/* Main Content Area */}
            <AnimatePresence mode="wait">
                {loading ? (
                    /* Elegant loading screen with status window */
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="min-h-[500px] flex items-center justify-center relative z-10"
                    >
                        <Card className="max-w-md w-full text-center items-center py-12 px-8 border border-zinc-100 shadow-2xl shadow-zinc-900/5">
                            <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                                <RefreshCw size={44} className="text-zinc-900 animate-spin" />
                                <Sparkles size={18} className="absolute text-zinc-900 animate-pulse" />
                            </div>
                            <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-1">Analyzing Target Compatibility</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-8">System matching models online</p>
                            
                            {/* Visual system logging block */}
                            <div className="bg-zinc-950 text-zinc-300 w-full py-4 px-5 rounded-xl font-mono text-left text-xs border border-zinc-800 flex flex-col gap-2 relative overflow-hidden shadow-inner">
                                <div className="absolute top-0 right-0 p-2 text-[8px] font-bold text-zinc-600 tracking-widest uppercase">system_log</div>
                                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span>[OK] analysis_port_active</span>
                                </div>
                                <div className="text-zinc-400 font-medium flex items-center gap-2">
                                    <span className="text-zinc-600">&gt;</span>
                                    <span>{stages[loadingStage]}</span>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ) : !analysisResult ? (
                    /* Inputs view matched perfectly to search box layout */
                    <motion.div
                        key="input"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10"
                    >
                        {/* Column 1: Resume File/Text Input */}
                        <div className="lg:col-span-6 flex flex-col">
                            <Card className="flex-1 min-h-[460px] flex flex-col">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100">
                                    <div className="w-8 h-8 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900">
                                        <FileText size={16} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold tracking-tight text-zinc-900 font-sans">Upload Resume</h2>
                                        <p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Document upload or text pasting</p>
                                    </div>
                                </div>

                                {/* Modern Selector Tabs */}
                                <div className="flex gap-2 mb-6 p-1 bg-zinc-50 rounded-xl border border-zinc-100">
                                    {profileResumeText && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setUseProfileResume(true);
                                                setShowTextPaste(false);
                                            }}
                                            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${useProfileResume ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50' : 'text-zinc-400 hover:text-zinc-600'}`}
                                        >
                                            Profile Resume
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setUseProfileResume(false);
                                            setShowTextPaste(false);
                                        }}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${(!useProfileResume && !showTextPaste) ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50' : 'text-zinc-400 hover:text-zinc-600'}`}
                                    >
                                        Upload File
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setUseProfileResume(false);
                                            setShowTextPaste(true);
                                        }}
                                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${(!useProfileResume && showTextPaste) ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50' : 'text-zinc-400 hover:text-zinc-600'}`}
                                    >
                                        Paste Text
                                    </button>
                                </div>

                                {useProfileResume ? (
                                    /* Profile Resume Info Card */
                                    <div className="flex-1 flex flex-col items-center justify-center p-8 border border-dashed border-zinc-200 bg-zinc-50/20 rounded-2xl gap-4 text-center">
                                        <div className="p-4 bg-zinc-900 text-white rounded-2xl shadow-xl shadow-zinc-900/10">
                                            <FileText size={32} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-sm text-zinc-800 font-sans">Using Profile Resume</h3>
                                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
                                                {profileResumeFileName}
                                            </p>
                                        </div>
                                        <div className="mt-2 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                                            <CheckCircle size={12} /> Ready to Scan
                                        </div>
                                    </div>
                                ) : !showTextPaste ? (
                                    /* Modern Minimalist Dropzone */
                                    <div className="flex-1 flex flex-col">
                                        <div
                                            onDragOver={(e) => e.preventDefault()}
                                            onDragLeave={(e) => e.preventDefault()}
                                            onDrop={handleFileDrop}
                                            className="flex-1 border border-dashed border-zinc-200 bg-zinc-50/20 hover:bg-zinc-50/50 hover:border-zinc-300 rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center gap-4 relative overflow-hidden group cursor-pointer"
                                        >
                                            <input
                                                type="file"
                                                accept=".pdf,.txt"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                onChange={handleFileSelect}
                                            />
                                            {file ? (
                                                <div className="flex flex-col items-center gap-3 relative z-10">
                                                    <div className="p-3 bg-zinc-900 text-white rounded-xl shadow-lg shadow-zinc-900/10">
                                                        <FileText size={30} />
                                                    </div>
                                                    <span className="font-bold text-sm text-zinc-800 line-clamp-1">{file.name}</span>
                                                    <span className="text-[9px] font-bold text-zinc-400 tracking-wider">
                                                        {(file.size / (1024 * 1024)).toFixed(2)} MB • PDF / TXT
                                                    </span>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveFile();
                                                        }}
                                                        className="mt-3 px-3 py-1.5 border border-rose-200 text-rose-500 bg-rose-50/30 hover:bg-rose-50 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
                                                    >
                                                        <Trash2 size={11} /> Remove
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center gap-2">
                                                    <Upload size={32} className="text-zinc-400 group-hover:-translate-y-0.5 transition-transform" />
                                                    <span className="font-bold text-sm text-zinc-800 font-sans">Drag & drop your resume file</span>
                                                    <span className="text-[9px] font-bold text-zinc-400 tracking-widest uppercase">or click to browse local folders</span>
                                                    <div className="mt-4 px-2.5 py-1 bg-zinc-100/50 text-[8px] font-bold uppercase text-zinc-400 tracking-widest rounded-md border border-zinc-200/20">
                                                        PDF / TXT (MAX 5MB)
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    /* Modern Minimalist Textarea */
                                    <div className="flex-1 flex flex-col">
                                        <textarea
                                            placeholder="Paste the raw copy/paste text of your resume..."
                                            value={resumeText}
                                            onChange={(e) => setResumeText(e.target.value)}
                                            className="flex-1 w-full min-h-[250px] border border-zinc-200 p-4 rounded-xl font-mono text-xs focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all bg-white text-zinc-800 shadow-inner placeholder:text-zinc-300"
                                        />
                                        
                                        <div className="mt-3 flex items-center justify-between">
                                            <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest font-mono">
                                                Words: {resumeText.split(/\s+/).filter(Boolean).length}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>

                        {/* Column 2: Job Description Input */}
                        <div className="lg:col-span-6 flex flex-col">
                            <Card className="flex-1 min-h-[460px] flex flex-col">
                                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-zinc-100">
                                    <div className="w-8 h-8 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900">
                                        <Terminal size={16} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold tracking-tight text-zinc-900">Job Description</h2>
                                        <p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Manually copy and paste the description of your job</p>
                                    </div>
                                </div>

                                <div className="flex-1 flex flex-col">
                                    <textarea
                                        placeholder="Paste the target job description manually (key responsibilities, technical requirements, stack, credentials, etc.) to calculate matching diagnostic metrics..."
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                        className="flex-1 w-full min-h-[250px] border border-zinc-200 p-4 rounded-xl font-mono text-xs focus:outline-none focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all bg-white text-zinc-800 shadow-inner placeholder:text-zinc-300"
                                    />
                                    
                                    <div className="mt-3 flex items-center justify-between">
                                        <span className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest font-mono">
                                            Words: {jobDescription.split(/\s+/).filter(Boolean).length}
                                        </span>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        {/* Action submission button - matches flagship theme buttons */}
                        <div className="lg:col-span-12 mt-6">
                            <button
                                onClick={handleSubmit}
                                className="group w-full py-4.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-xl shadow-zinc-900/10 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                            >
                                <Sparkles size={15} className="text-white/80 group-hover:rotate-12 transition-transform" />
                                Run Compatibility Scanner
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    /* Diagnostics Dashboard Results */
                    <motion.div
                        key="results"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10"
                    >
                        {/* Left Dashboard Column */}
                        <div className="lg:col-span-4 flex flex-col gap-8">
                            {/* Evaluation Score Card */}
                            <Card delay={0.05} className="border-t-4 border-t-zinc-900/80">
                                <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                    <div className="w-1.5 h-3 bg-zinc-950 rounded-sm" />
                                    ATS Match Diagnostics
                                </h2>

                                <div className="flex flex-col items-center">
                                    <div className="relative w-44 h-44 mb-6 flex items-center justify-center">
                                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                            <circle cx="50" cy="50" r="42" fill="none" stroke="#f4f4f5" strokeWidth="8" />
                                            <motion.circle 
                                                cx="50" 
                                                cy="50" 
                                                r="42" 
                                                fill="none" 
                                                stroke={scoreStroke} 
                                                strokeWidth="8"
                                                strokeDasharray="264"
                                                initial={{ strokeDashoffset: 264 }}
                                                animate={{ strokeDashoffset: 264 - (264 * score) / 100 }}
                                                transition={{ duration: 1, ease: "easeOut" }}
                                            />
                                        </svg>
                                        <div className="absolute flex flex-col items-center justify-center text-center">
                                            <motion.span 
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                className="text-4xl font-bold tracking-tight text-zinc-900 font-sans"
                                            >
                                                {score}%
                                            </motion.span>
                                            <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">Match</span>
                                        </div>
                                    </div>

                                    <div className={`px-4 py-1.5 rounded-full border text-[9px] font-bold uppercase tracking-widest ${scoreBadgeColor} mb-6`}>
                                        {scoreBadge}
                                    </div>

                                    <div className="w-full bg-zinc-50 border border-zinc-100 p-5 rounded-xl">
                                        <h3 className="text-[9px] font-bold uppercase tracking-widest mb-2 text-zinc-400">Analysis Summary</h3>
                                        <p className="text-xs font-semibold text-zinc-500 leading-relaxed">
                                            {analysisResult.feedback_summary || "We found moderate compatibility between your resume's experience indicators and the parameters requested in the job description."}
                                        </p>
                                    </div>
                                </div>
                            </Card>

                            {/* Checklist Card */}
                            <Card delay={0.1}>
                                <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                                    <ListTodo size={15} className="text-zinc-500" />
                                    Improvement Actions
                                </h2>

                                <div className="space-y-3">
                                    {analysisResult.improvement_tips?.map((tip, idx) => (
                                        <div 
                                            key={idx}
                                            onClick={() => toggleTipCompleted(idx)}
                                            className={`p-3 border rounded-xl cursor-pointer select-none transition-all flex items-start gap-2.5 
                                                ${completedTips[idx] 
                                                    ? 'bg-zinc-50 border-zinc-200/50 opacity-50' 
                                                    : 'bg-white border-zinc-100 hover:border-zinc-200/80 hover:bg-zinc-50/30'
                                                }
                                            `}
                                        >
                                            <div className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors
                                                ${completedTips[idx] ? 'bg-zinc-900 border-zinc-900 text-white' : 'bg-white border-zinc-300'}
                                            `}>
                                                {completedTips[idx] && <Check size={10} strokeWidth={3} />}
                                            </div>
                                            <span className={`text-xs font-semibold leading-relaxed text-zinc-600
                                                ${completedTips[idx] ? 'line-through text-zinc-400 font-medium' : ''}
                                            `}>
                                                {tip}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </div>

                        {/* Right Dashboard Column */}
                        <div className="lg:col-span-8 flex flex-col gap-8">
                            {/* Strengths & Weaknesses */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <Card delay={0.12} className="!p-6">
                                    <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Keyword Alignment
                                    </h2>
                                    <ul className="space-y-3">
                                        {analysisResult.strengths?.map((strength, idx) => (
                                            <li key={idx} className="flex gap-2 text-xs font-semibold leading-relaxed text-zinc-600 items-start">
                                                <div className="w-1 h-1 rounded-full bg-zinc-300 shrink-0 mt-2" />
                                                <span>{strength}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Card>

                                <Card delay={0.15} className="!p-6">
                                    <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                        Gaps & Keywords Missing
                                    </h2>
                                    <ul className="space-y-3">
                                        {analysisResult.weaknesses?.map((weakness, idx) => (
                                            <li key={idx} className="flex gap-2 text-xs font-semibold leading-relaxed text-zinc-600 items-start">
                                                <div className="w-1 h-1 rounded-full bg-zinc-300 shrink-0 mt-2" />
                                                <span>{weakness}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            </div>

                            {/* Copyable Prompts Card */}
                            <Card delay={0.18} className="flex-1 flex flex-col">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-zinc-100">
                                    <div>
                                        <h2 className="text-sm font-bold tracking-tight text-zinc-900 flex items-center gap-2">
                                            <Sparkles size={16} className="text-zinc-800" />
                                            Rewrite Instructions Generator
                                        </h2>
                                        <p className="text-[9px] font-bold uppercase text-zinc-400 tracking-widest">Select targets and copy optimization prompts</p>
                                    </div>

                                    <button
                                        onClick={() => handleCopyPrompt(analysisResult.prompts?.[activePromptTab])}
                                        className="w-full sm:w-auto px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm"
                                    >
                                        {copied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />}
                                        {copied ? "Copied!" : "Copy Instructions"}
                                    </button>
                                </div>

                                {/* Clean Toggle Tabs */}
                                <div className="flex gap-2 mb-5">
                                    {['chatgpt', 'claude', 'gemini'].map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => {
                                                setActivePromptTab(tab);
                                                setCopied(false);
                                            }}
                                            className={`px-5 py-2.5 rounded-lg text-xs font-bold border transition-all
                                                ${activePromptTab === tab 
                                                    ? 'bg-zinc-900 border-zinc-900 text-white shadow-sm' 
                                                    : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                                                }
                                            `}
                                        >
                                            {tab === 'chatgpt' ? 'ChatGPT' : tab === 'claude' ? 'Claude' : 'Gemini'}
                                        </button>
                                    ))}
                                </div>

                                {/* Custom dark prompt pre block */}
                                <div className="flex-1 bg-zinc-900 text-zinc-100 p-5 rounded-xl border border-zinc-800 relative font-mono text-xs overflow-auto max-h-[350px] shadow-inner select-text">
                                    <div className="absolute top-0 right-0 p-2 text-[8px] font-bold text-zinc-700 tracking-wider uppercase font-mono select-none">
                                        {activePromptTab}_schema
                                    </div>
                                    <pre className="whitespace-pre-wrap leading-relaxed text-zinc-300 font-medium font-mono">
                                        {analysisResult.prompts?.[activePromptTab] || "Formatting optimization sequence..."}
                                    </pre>
                                </div>

                                <div className="mt-5 p-4 bg-zinc-50 border border-zinc-100 rounded-xl flex items-start gap-3">
                                    <HelpCircle className="text-zinc-400 shrink-0 mt-0.5" size={14} />
                                    <p className="text-[10px] font-semibold text-zinc-500 leading-relaxed uppercase tracking-wider">
                                        <strong className="text-zinc-800">Directives:</strong> Copy the text block above, switch to the {activePromptTab === 'chatgpt' ? 'ChatGPT' : activePromptTab === 'claude' ? 'Claude' : 'Gemini'} console interface, paste the raw prompt directly, and hit enter. The targeted LLM will rephrase your metrics to resolve gaps.
                                    </p>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ATSAnalyzerPage;
