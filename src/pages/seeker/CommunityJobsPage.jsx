import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Plus, 
    Link as LinkIcon, 
    Sparkles, 
    Share2, 
    CheckCircle2, 
    Clock, 
    AlertCircle,
    ArrowRight,
    ChevronLeft,
    Filter,
    ShieldCheck,
    Trophy,
    ArrowUpRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { scrapeJobAI, submitCommunityJob, getCommunityFeed, enrichJob } from '../../api/jobsAIApi';
import { getJobMatchScore } from '../../api/jobsApi';

// Removed mock data in favor of API calls

const CommunityJobsPage = () => {
    const [view, setView] = useState('feed'); // feed, add, loading, scraped, matched, submitted
    const [jobLink, setJobLink] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [pendingJob, setPendingJob] = useState(null);
    const [scrapedData, setScrapedData] = useState(null);
    const [matchScore, setMatchScore] = useState(0);
    const [showShareToggle, setShowShareToggle] = useState(false);
    const [communityJobs, setCommunityJobs] = useState([]);
    const [loadingFeed, setLoadingFeed] = useState(false);
    
    // Detail View State
    const [selectedJob, setSelectedJob] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailMatchScore, setDetailMatchScore] = useState(null);
    const [detailMatchData, setDetailMatchData] = useState(null);
    const [isDetailMatching, setIsDetailMatching] = useState(false);
    const [missingAI, setMissingAI] = useState(false);
    const [isInitializingAI, setIsInitializingAI] = useState(false);
    
    // Auth context (simulated or real)
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isAdmin = currentUser.role === 'admin';

    useEffect(() => {
        if (view === 'feed') {
            fetchFeed();
        }
    }, [view]);

    const fetchFeed = async () => {
        setLoadingFeed(true);
        try {
            const response = await getCommunityFeed();
            if (response.status === 'success') {
                setCommunityJobs(response.jobs);
            }
        } catch (error) {
            console.error('Failed to fetch community feed:', error);
        } finally {
            setLoadingFeed(false);
        }
    };

    // Filtered Jobs
    const filteredJobs = communityJobs.filter(job => {
        const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             job.company_name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'All' || (job.key_skills && job.key_skills.some(s => s.toLowerCase().includes(roleFilter.toLowerCase())));
        return matchesSearch && matchesRole;
    });

    const handleScrape = async () => {
        if (!jobLink) return toast.error('Please paste a job link');
        setView('loading');
        
        try {
            const response = await scrapeJobAI(jobLink);
            if (response.status === 'success') {
                setScrapedData(response.job);
                // Set the match score immediately if returned, or reset it
                if (response.job.match_score) {
                    setMatchScore(0); // Reset for animation
                }
                setView('scraped');
            } else {
                throw new Error('Failed to scrape job data');
            }
        } catch (error) {
            console.error('Scraping error:', error);
            toast.error('Could not extract job data. Please check the URL or try again.');
            setView('add');
        }
    };

    const handleMatchIQ = () => {
        setView('matching');
        
        // Use the score from backend if available, fallback to 75
        const targetScore = scrapedData?.match_score || 75;
        
        let score = 0;
        const interval = setInterval(() => {
            score += 2;
            if (score >= targetScore) {
                clearInterval(interval);
                setMatchScore(targetScore);
                setView('matched');
            }
        }, 30);
    };

    const handleSubmit = async () => {
        try {
            await submitCommunityJob({
                ...scrapedData,
                url: jobLink
            });
            
            toast.success(
                <div className="flex flex-col">
                    <span className="font-bold">Submitted for review!</span>
                    <span className="text-sm opacity-90">An admin will check it soon.</span>
                </div>,
                { icon: '🏆' }
            );
            setView('feed');
        } catch (error) {
            console.error('Submission error:', error);
            toast.error('Failed to submit job. Please try again.');
        }
    };

    const handleCardClick = (job) => {
        setSelectedJob(job);
        setIsDetailOpen(true);
        setDetailMatchScore(null);
        setDetailMatchData(null);
    };

    const runDetailMatchIQ = async () => {
        if (!selectedJob) return;
        setIsDetailMatching(true);
        setMissingAI(false);
        try {
            const result = await getJobMatchScore(selectedJob.id);
            setDetailMatchScore(result.match_score);
            setDetailMatchData(result);
        } catch (error) {
            console.error('Match IQ Error:', error);
            const detail = error.response?.data?.detail;
            
            if (error.response?.status === 422) {
                if (detail?.includes('Job has no embedding')) {
                    setMissingAI(true);
                } else if (detail?.includes('User has no resume embedding')) {
                    toast.error('Your resume data is outdated. Please re-upload your resume in your Profile to enable Match IQ.');
                } else {
                    toast.error('Could not complete Match IQ analysis. Ensure your resume is uploaded.');
                }
            } else {
                toast.error('Could not complete Match IQ analysis. Ensure your resume is uploaded.');
            }
        } finally {
            setIsDetailMatching(false);
        }
    };

    const handleInitializeAI = async () => {
        if (!selectedJob) return;
        setIsInitializingAI(true);
        try {
            await enrichJob(selectedJob.id);
            toast.success('AI Analysis complete! You can now run Match IQ.');
            setMissingAI(false);
            // Auto-run match after enrichment
            runDetailMatchIQ();
        } catch (error) {
            console.error('Enrichment Error:', error);
            toast.error('Failed to initialize AI. Please try again later.');
        } finally {
            setIsInitializingAI(false);
        }
    };

    const handleApply = () => {
        if (!selectedJob?.external_url && !selectedJob?.external_apply_url) {
            return toast.error('No application URL found for this job.');
        }
        window.open(selectedJob.external_url || selectedJob.external_apply_url, '_blank');
    };

    // View Components
    const FeedView = () => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
        >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-8 rounded-3xl border border-[#313851]/10 shadow-xl">
                <div>
                    <h1 className="text-4xl font-black text-[#313851] tracking-tight">Community Job Board</h1>
                    <p className="text-[#313851]/60 mt-2 font-medium text-lg">Discover External Opportunities with AI-Powered Fit Scores</p>
                </div>
                <Button 
                    onClick={() => setView('add')}
                    className="bg-[#313851] hover:bg-[#313851]/90 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-2 shadow-lg transition-all"
                >
                    <Plus size={20} strokeWidth={3} />
                    Add External Job
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#313851]/30" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search roles or companies..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-[#313851]/10 rounded-2xl py-4 pl-12 pr-4 text-[#313851] focus:outline-none focus:ring-2 focus:ring-[#313851]/10 transition-all placeholder:text-[#313851]/20"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    {['All', 'Frontend', 'Backend', 'Fullstack', 'QA'].map(role => (
                        <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                                roleFilter === role 
                                ? 'bg-[#313851] text-white shadow-md' 
                                : 'bg-white text-[#313851]/60 border border-[#313851]/10 hover:bg-[#313851]/5'
                            }`}
                        >
                            {role}
                        </button>
                    ))}
                </div>
            </div>

            {/* Job Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Pending Job (Current User) */}
                {pendingJob && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative group bg-white border border-yellow-500/30 p-8 rounded-3xl overflow-hidden opacity-90 cursor-not-allowed shadow-md"
                    >
                        <div className="absolute top-4 right-4">
                            <span className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-yellow-500/20">
                                <Clock size={12} />
                                Pending Approval
                            </span>
                        </div>
                        <div className="space-y-4 pt-4">
                            <div>
                                <h3 className="text-2xl font-bold text-[#313851]/50">{pendingJob.title}</h3>
                                <p className="text-[#313851]/40 font-medium">{pendingJob.company}</p>
                            </div>
                            <p className="text-[#313851]/30 text-sm line-clamp-3">{pendingJob.description}</p>
                            <div className="pt-4 border-t border-[#313851]/5 flex items-center justify-between">
                                <span className="text-[10px] text-[#313851]/30 uppercase font-black tracking-widest">Submitted by You</span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Approved Jobs */}
                {filteredJobs.map((job) => (
                    <motion.div 
                        key={job.id}
                        whileHover={{ y: -5 }}
                        onClick={() => handleCardClick(job)}
                        className="group relative bg-white border border-[#313851]/5 hover:border-[#313851]/30 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all cursor-pointer"
                    >
                        <div className="absolute top-4 right-4">
                            <span className="flex items-center gap-1 bg-[#313851]/5 text-[#313851]/60 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-[#313851]/10">
                                <ShieldCheck size={12} />
                                Community
                            </span>
                        </div>
                        <div className="space-y-4 pt-4">
                            <div>
                                <h3 className="text-2xl font-bold text-[#313851] group-hover:text-[#313851]/80 transition-colors">{job.title}</h3>
                                <p className="text-[#313851]/60 font-semibold">{job.company} • <span className="text-[#313851]/40">{job.location}</span></p>
                            </div>
                            <p className="text-[#313851]/70 text-sm line-clamp-3 leading-relaxed">{job.description}</p>
                            
                            <div className="pt-4 border-t border-[#313851]/5 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#313851]/10 flex items-center justify-center text-xs text-[#313851] font-bold border border-[#313851]/20">
                                        {(job.postedBy || 'Community')[0]}
                                    </div>
                                    <span className="text-[10px] text-[#313851]/40 uppercase font-black tracking-widest">Posted by {job.postedBy || 'Community Member'}</span>
                                </div>
                                <span className="text-[10px] text-[#313851]/20 uppercase font-black tracking-widest">{job.postedAt || (job.created_at ? new Date(job.created_at).toLocaleDateString() : 'Recent')}</span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );

    const AddJobView = () => (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-2xl mx-auto space-y-8 py-12"
        >
            <button onClick={() => setView('feed')} className="flex items-center gap-2 text-[#313851]/40 hover:text-[#313851] transition-colors group">
                <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                Back to Community Board
            </button>

            <div className="bg-white border border-[#313851]/10 p-12 rounded-[2rem] shadow-2xl space-y-10 relative overflow-hidden">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-[#313851]/5 rounded-[1.5rem] flex items-center justify-center mx-auto border border-[#313851]/10">
                        <LinkIcon className="text-[#313851]" size={36} />
                    </div>
                    <h2 className="text-4xl font-black text-[#313851]">Add External Job</h2>
                    <p className="text-[#313851]/60 max-w-md mx-auto text-lg font-medium">Paste a job link from LinkedIn, Indeed, or any career portal. We'll handle the rest.</p>
                </div>

                <div className="space-y-6">
                    <div className="relative">
                        <input 
                            type="text" 
                            placeholder="https://www.linkedin.com/jobs/view/..." 
                            value={jobLink}
                            onChange={(e) => setJobLink(e.target.value)}
                            className="w-full bg-[#F6F3ED]/50 border border-[#313851]/15 rounded-2xl py-6 px-8 text-[#313851] text-xl focus:outline-none focus:ring-4 focus:ring-[#313851]/5 transition-all placeholder:text-[#313851]/20"
                        />
                    </div>
                    <Button 
                        onClick={handleScrape}
                        className="w-full bg-[#313851] text-white font-black py-6 rounded-2xl text-xl hover:bg-[#313851]/90 transition-all shadow-xl"
                    >
                        Scrape & Analyze
                    </Button>
                </div>
            </div>
        </motion.div>
    );

    const LoadingView = () => (
        <div className="max-w-2xl mx-auto py-24 flex flex-col items-center justify-center space-y-8">
            <div className="relative">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 border-t-4 border-r-4 border-cyan-500 rounded-full"
                />
                <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-2 border-b-4 border-l-4 border-purple-500 rounded-full"
                />
                <motion.div 
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Search className="text-[#313851]" size={32} />
                </motion.div>
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-[#313851] animate-pulse">Extracting Job Data...</h3>
                <p className="text-[#313851]/40 font-medium">Analyzing URL and fetching descriptions</p>
            </div>
            
            {/* Skeleton Card */}
            <div className="w-full bg-[#313851]/5 border border-[#313851]/10 p-8 rounded-3xl space-y-4 blur-[2px]">
                <div className="h-8 bg-[#313851]/10 rounded-lg w-2/3 animate-pulse" />
                <div className="h-4 bg-[#313851]/10 rounded-lg w-1/3 animate-pulse" />
                <div className="space-y-2 pt-4">
                    <div className="h-4 bg-[#313851]/10 rounded-lg w-full animate-pulse" />
                    <div className="h-4 bg-[#313851]/10 rounded-lg w-full animate-pulse" />
                    <div className="h-4 bg-[#313851]/10 rounded-lg w-3/4 animate-pulse" />
                </div>
            </div>
        </div>
    );

    const ScrapedView = () => (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-8 py-12"
        >
            <div className="bg-white border border-[#313851]/10 p-10 rounded-[2rem] shadow-2xl space-y-8">
                <div className="flex items-start justify-between">
                    <div className="space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#313851]/40">Extraction Success</span>
                        <h2 className="text-4xl font-black text-[#313851] leading-tight">{scrapedData.title}</h2>
                        <p className="text-2xl text-[#313851]/60 font-bold">{scrapedData.company} • <span className="text-[#313851]/30 font-semibold">{scrapedData.location}</span></p>
                    </div>
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/20 shadow-inner">
                        <CheckCircle2 className="text-green-600" size={32} />
                    </div>
                </div>

                <div className="bg-[#F6F3ED] p-8 rounded-2xl border border-[#313851]/5">
                    <p className="text-[#313851]/70 leading-relaxed text-lg font-medium italic">"{scrapedData.description}"</p>
                </div>

                <Button 
                    onClick={handleMatchIQ}
                    className="w-full bg-[#313851] text-white font-black py-6 rounded-2xl text-xl flex items-center justify-center gap-3 hover:bg-[#313851]/90 transition-all shadow-xl"
                >
                    <Sparkles size={28} />
                    Run Match IQ Analysis
                </Button>
            </div>
        </motion.div>
    );

    const MatchedView = () => (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto space-y-8 py-12"
        >
            <div className="bg-white border border-[#313851]/10 p-12 rounded-[2.5rem] shadow-2xl space-y-10 relative overflow-hidden">
                <div className="text-center space-y-2">
                    <h2 className="text-4xl font-black text-[#313851]">Match IQ Analysis</h2>
                    <p className="text-[#313851]/40 uppercase text-xs font-black tracking-[0.3em]">AI-Powered Competency Insights</p>
                </div>

                <div className="flex flex-col items-center justify-center gap-8">
                    <div className="relative w-56 h-56 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle 
                                cx="112" cy="112" r="100" 
                                className="stroke-[#313851]/5 fill-none" 
                                strokeWidth="16" 
                            />
                            <motion.circle 
                                cx="112" cy="112" r="100" 
                                className="stroke-[#313851] fill-none" 
                                strokeWidth="16" 
                                strokeLinecap="round"
                                initial={{ strokeDasharray: "0, 628" }}
                                animate={{ strokeDasharray: `${(matchScore / 100) * 628}, 628` }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-6xl font-black text-[#313851]">{matchScore}%</span>
                            <span className="text-xs font-black text-[#313851]/40 uppercase tracking-widest mt-1">Match Score</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 w-full">
                        <div className="bg-green-500/5 border border-green-500/10 p-6 rounded-2xl space-y-4 shadow-sm">
                            <span className="text-xs font-black text-green-600 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                Matched Skills
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {scrapedData?.matched_skills?.length > 0 ? (
                                    scrapedData.matched_skills.map(skill => (
                                        <span key={skill} className="px-3 py-1.5 bg-green-500/10 text-green-700 text-xs font-bold rounded-lg border border-green-500/10">{skill}</span>
                                    ))
                                ) : (
                                    <span className="text-[#313851]/40 text-xs italic">No direct matches found.</span>
                                )}
                            </div>
                        </div>
                        <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl space-y-4 shadow-sm">
                            <span className="text-xs font-black text-red-600 uppercase tracking-widest flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                Missing Skills
                            </span>
                            <div className="flex flex-wrap gap-2">
                                {scrapedData?.missing_skills?.length > 0 ? (
                                    scrapedData.missing_skills.map(skill => (
                                        <span key={skill} className="px-3 py-1.5 bg-red-500/10 text-red-700 text-xs font-bold rounded-lg border border-red-500/10">{skill}</span>
                                    ))
                                ) : (
                                    <span className="text-[#313851]/40 text-xs italic">All required skills matched!</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-[#F6F3ED] p-8 rounded-[1.5rem] border border-[#313851]/10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#313851]/5 rounded-xl flex items-center justify-center border border-[#313851]/10">
                                <Share2 className="text-[#313851]" size={24} />
                            </div>
                            <div>
                                <p className="text-[#313851] font-black text-lg leading-tight">Share with Community?</p>
                                <p className="text-[#313851]/40 text-sm font-medium">Help others find this opportunity</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={showShareToggle} 
                                onChange={() => setShowShareToggle(!showShareToggle)}
                                className="sr-only peer"
                            />
                            <div className="w-14 h-8 bg-[#313851]/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#313851]"></div>
                        </label>
                    </div>

                    <AnimatePresence>
                        {showShareToggle && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-5 bg-[#313851]/5 border border-[#313851]/10 rounded-2xl flex gap-4 mb-6">
                                    <AlertCircle className="text-[#313851]/60 shrink-0 mt-0.5" size={20} />
                                    <p className="text-[#313851]/60 text-sm font-medium leading-relaxed">
                                        An admin will review this posting for legitimacy before it goes live. You'll earn community points if it's approved.
                                    </p>
                                </div>
                                <Button 
                                    onClick={handleSubmit}
                                    className="w-full bg-[#313851] text-white font-black py-5 rounded-2xl text-lg flex items-center justify-center gap-2 hover:bg-[#313851]/90 transition-all shadow-xl"
                                >
                                    Submit to Community
                                    <ArrowRight size={20} />
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                
                {!showShareToggle && (
                    <Button 
                        onClick={() => setView('feed')}
                        className="w-full bg-[#313851]/5 border border-[#313851]/10 text-[#313851] font-bold py-5 rounded-2xl hover:bg-[#313851]/10 transition-all"
                    >
                        Return to Dashboard
                    </Button>
                )}
            </div>
        </motion.div>
    );

    return (
        <div className="min-h-screen bg-[#F6F3ED] text-[#313851] p-6 md:p-12 overflow-x-hidden font-sans">
            <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    {view === 'feed' && <FeedView key="feed" />}
                    {view === 'add' && <AddJobView key="add" />}
                    {view === 'loading' && <LoadingView key="loading" />}
                    {(view === 'scraped' || view === 'matching') && <ScrapedView key="scraped" />}
                    {view === 'matched' && <MatchedView key="matched" />}
                </AnimatePresence>
            </div>

            {/* Job Detail Modal */}
            <AnimatePresence>
                {isDetailOpen && selectedJob && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#313851]/40 backdrop-blur-sm"
                        onClick={() => setIsDetailOpen(false)}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-8 md:p-12 overflow-y-auto flex-1 custom-scrollbar">
                                <div className="space-y-8">
                                    <div className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-2">
                                                <h2 className="text-3xl font-black text-[#313851] leading-tight">{selectedJob.title}</h2>
                                                <p className="text-xl text-[#313851]/60 font-bold">{selectedJob.company_name || selectedJob.company} • <span className="text-[#313851]/30 font-semibold">{selectedJob.location}</span></p>
                                            </div>
                                            <button 
                                                onClick={() => setIsDetailOpen(false)}
                                                className="p-2 hover:bg-[#313851]/5 rounded-xl transition-colors"
                                            >
                                                <X size={24} className="text-[#313851]/40" />
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {selectedJob.key_skills?.map(skill => (
                                                <Badge key={skill} variant="neutral" className="bg-[#313851]/5 border-[#313851]/10 text-[#313851]/60">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-[#313851]/40">Role Overview</h3>
                                        <div className="space-y-3">
                                            {(selectedJob.role_overview || [selectedJob.description]).map((sentence, i) => (
                                                <p key={i} className="text-[#313851]/70 leading-relaxed font-medium">
                                                    {sentence}
                                                </p>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Match IQ Section */}
                                    <div className="bg-[#F6F3ED] p-8 rounded-3xl border border-[#313851]/10 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-[#313851] rounded-xl flex items-center justify-center shadow-lg">
                                                    <Sparkles className="text-white" size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-[#313851] font-black text-lg leading-tight">Personal Match IQ</p>
                                                    <p className="text-[#313851]/40 text-sm font-medium">How well does your resume fit?</p>
                                                </div>
                                            </div>
                                            {detailMatchScore !== null ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-3xl font-black text-[#313851]">{detailMatchScore}%</span>
                                                    <span className="text-[10px] font-black text-[#313851]/40 uppercase tracking-widest">Score</span>
                                                </div>
                                            ) : missingAI ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="text-[10px] font-bold text-red-500 uppercase">AI Data Missing</span>
                                                    <Button 
                                                        onClick={handleInitializeAI}
                                                        isLoading={isInitializingAI}
                                                        size="sm"
                                                        className="bg-[#313851] text-white px-4 py-2 rounded-lg font-bold text-xs"
                                                    >
                                                        Initialize AI
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button 
                                                    onClick={runDetailMatchIQ}
                                                    isLoading={isDetailMatching}
                                                    className="bg-[#313851] text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md"
                                                >
                                                    Calculate Fit
                                                </Button>
                                            )}
                                        </div>

                                        {detailMatchData && (
                                            <div className="space-y-6 pt-6 border-t border-[#313851]/10">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Strengths</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {detailMatchData.matched_skills && detailMatchData.matched_skills.length > 0 ? (
                                                                detailMatchData.matched_skills.slice(0, 5).map(s => (
                                                                    <span key={s} className="text-[10px] bg-green-500/10 text-green-700 px-2 py-0.5 rounded-md font-bold border border-green-500/20">{s}</span>
                                                                ))
                                                            ) : (
                                                                <span className="text-[10px] text-[#313851]/40 italic">No specific matches</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Gaps Detected</p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {detailMatchData.missing_skills && detailMatchData.missing_skills.length > 0 ? (
                                                                detailMatchData.missing_skills.slice(0, 5).map(s => (
                                                                    <span key={s} className="text-[10px] bg-red-500/10 text-red-700 px-2 py-0.5 rounded-md font-bold border border-red-500/20">{s}</span>
                                                                ))
                                                            ) : (
                                                                <span className="text-[10px] text-[#313851]/40 italic">None identified</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {detailMatchData.gap_analysis && (
                                                    <div className="bg-[#313851]/5 p-4 rounded-2xl border border-[#313851]/5">
                                                        <p className="text-[10px] font-black text-[#313851]/40 uppercase tracking-widest mb-2">AI Fit Analysis</p>
                                                        <p className="text-xs text-[#313851]/70 font-medium leading-relaxed italic">
                                                            "{detailMatchData.gap_analysis}"
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 bg-[#313851] flex items-center justify-between">
                                <p className="text-white/40 text-sm font-medium">External Community Listing</p>
                                <button 
                                    onClick={handleApply}
                                    className="bg-white text-[#313851] font-black px-10 py-4 rounded-2xl flex items-center gap-2 hover:bg-[#F6F3ED] transition-all shadow-xl active:scale-95"
                                >
                                    Apply Now
                                    <ArrowUpRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const X = ({ size, className }) => (
    <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

export default CommunityJobsPage;
