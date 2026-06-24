import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MapPin, Briefcase, FileText, Upload, Calendar, Clock, Globe, Target, ChevronRight, CheckCircle2, User, UserPlus, Users, ArrowLeft } from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';
// We will assume an api client exists or we just create a mock one. Let's create an api client file next.
import { createHumanMockInterviewRequest, uploadInterviewResume } from '../../api/humanMockInterviewApi';
import { useInterviewCreditsContext } from '../../context/InterviewCreditsContext';
import { CreditBalance } from '../../components/rewards/CreditBalance';
import { CreditCheckPanel, CreditCheckModal } from '../../components/rewards/CreditCheckModal';
import HowItWorksWidget from '../../components/ui/HowItWorksWidget';

const HumanMockInterviewPage = () => {
    const location = useLocation();
    const queryJobId = new URLSearchParams(location.search).get('job_id') || location.state?.job_id || null;

    const howItWorksSteps = [
        {
            title: "Share Your Goals",
            description: "Provide your job goals, experience level, and the specific company you're preparing for.",
            icon: Target
        },
        {
            title: "Pick a Time & Upload Resume",
            description: "Upload your resume and select a convenient date and time for your mock interview session.",
            icon: Calendar
        },
        {
            title: "Meet with an Expert",
            description: "Get matched with a real industry professional for a 1-on-1 practice interview, and receive a complete scorecard to help you improve.",
            icon: UserPlus
        }
    ];

    const { user, profile } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    
    // Form State
    const [formData, setFormData] = useState({
        full_name: profile?.full_name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        current_role: '',
        years_of_experience: '',
        preferred_job_role: '',
        preferred_industry: '',
        resume_url: profile?.resume_file_url || '',
        linkedin_url: '',
        portfolio_url: '',
        interview_type: 'technical',
        interview_language: 'english',
        preferred_date: '',
        preferred_time: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        difficulty_level: 'intermediate',
        duration: 60,
        focus_skills: '',
        weak_areas: '',
        target_company: '',
        additional_notes: '',
        
        // New Candidate Background Fields
        experience_level: 'Fresher',
        employment_status: '',
        attended_real_interviews: null,
        interview_goal: '',
        preferred_company_type: [],
        preparing_company: '',
        interview_urgency: '',
        resume_filename: '',
        job_id: queryJobId,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);

    // Credit Gating State
    const { purchasedHumanCreditsRemaining, useCredit } = useInterviewCreditsContext();
    const [showCreditModal, setShowCreditModal] = useState(false);
    const [modalType, setModalType] = useState('paywall');
    const [showCreditPanel, setShowCreditPanel] = useState(false);

    const updateForm = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (step === 1 && (!formData.full_name || !formData.email)) {
            toast.error("Please fill in your basic contact information.");
            return;
        }
        if (step === 2 && formData.experience_level === 'Experienced' && !formData.years_of_experience) {
            toast.error("Please provide your years of experience.");
            return;
        }
        if (step === 3 && (!formData.preferred_date || !formData.preferred_time)) {
            toast.error("Please select a preferred date and time.");
            return;
        }
        setStep(prev => prev + 1);
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const ext = file.name.split('.').pop().toLowerCase();
        if (!['pdf', 'doc', 'docx'].includes(ext)) {
            toast.error("Only PDF, DOC, and DOCX files are allowed.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be under 5MB.");
            return;
        }

        setUploadingResume(true);
        try {
            const result = await uploadInterviewResume(file);
            updateForm('resume_url', result.resume_url);
            updateForm('resume_filename', result.resume_filename);
            toast.success("Resume uploaded successfully!");
        } catch (err) {
            console.error("Resume upload failed:", err);
            toast.error(err.response?.data?.detail || "Resume upload failed. Please try again.");
        } finally {
            setUploadingResume(false);
        }
    };

    const toggleCompanyType = (type) => {
        setFormData(prev => {
            const types = prev.preferred_company_type;
            if (types.includes(type)) {
                return { ...prev, preferred_company_type: types.filter(t => t !== type) };
            } else {
                return { ...prev, preferred_company_type: [...types, type] };
            }
        });
    };

    const handleStartClick = () => {
        if (formData.job_id) {
            // Bypass credit panel entirely for job applications
            performSubmit();
            return;
        }

        if (!purchasedHumanCreditsRemaining || purchasedHumanCreditsRemaining === 0) {
            setModalType('paywall');
            setShowCreditModal(true);
            return;
        }

        setShowCreditPanel(true);
    };

    const handleConfirmStart = async () => {
        setShowCreditPanel(false);
        setShowCreditModal(false);

        // Pass false for allowFree, true for isHuman to use human-specific credits
        const res = useCredit('Human Mock Interview', false, true);
        if (res.success) {
            await performSubmit();
        } else {
            setModalType('paywall');
            setShowCreditModal(true);
        }
    };

    const performSubmit = async () => {
        setIsSubmitting(true);
        try {
            const payload = { ...formData };
            if (payload.years_of_experience === '') {
                payload.years_of_experience = null;
            } else if (payload.years_of_experience !== null) {
                payload.years_of_experience = parseInt(payload.years_of_experience, 10);
            }
            // Array to string for DB if needed, but Pydantic will accept it if we updated it, or we join it
            if (Array.isArray(payload.preferred_company_type)) {
                payload.preferred_company_type = payload.preferred_company_type.join(", ");
            }
            
            await createHumanMockInterviewRequest(payload);
            setStep(5); // Success Step is now 5
        } catch (error) {
            console.error("Submission failed:", error);
            toast.error(error.response?.data?.detail || error.message || "Failed to submit request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F4F1EA] text-[#1C1A17] p-6 lg:p-10 font-sans">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <div className="mb-8">
                    <Link 
                        to="/mock-interview"
                        className="inline-flex items-center gap-2 text-[#1C1A17]/65 hover:text-[#D45B34] transition-all text-xs font-black uppercase tracking-wider bg-white border border-[#1C1A17]/10 hover:bg-[#D45B34]/10 px-4 py-2 rounded-xl shadow-sm hover:scale-105 active:scale-95 duration-200 text-decoration-none"
                    >
                        <ArrowLeft size={14} strokeWidth={3} /> Back to Hub
                    </Link>
                </div>

                {/* Header */}
                <header className="mb-10 text-center relative">
                    <div className="absolute right-0 top-0 hidden md:block">
                        <CreditBalance mode="purchased_human_only" />
                    </div>
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center justify-center p-3 mb-4 rounded-full bg-[#D45B34]/10 text-[#D45B34] shadow-sm"
                    >
                        <UserPlus size={32} />
                    </motion.div>
                    <motion.h1 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
                        className="text-3xl lg:text-4xl font-black tracking-tight mb-4 uppercase"
                    >
                        Human Mock <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1C1A17] to-[#D45B34]">Interview</span>
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                        className="text-sm font-bold text-[#1C1A17]/70 max-w-2xl mx-auto uppercase tracking-widest"
                    >
                        Schedule a 1-on-1 session with an industry professional
                    </motion.p>
                </header>

                {step < 5 && (
                    <HowItWorksWidget
                        pageKey="human-sessions"
                        title="How 1-on-1 Professional Sessions Work"
                        icon={Users}
                        steps={howItWorksSteps}
                        creditsInfo="Each 1-on-1 mock interview request consumes 1 human session credit. Earned regular coins can be redeemed for human mock interview session tokens in the Reward Shop!"
                        theme="warm"
                    />
                )}

                <AnimatePresence mode="wait">
                    {step < 5 && (
                        <motion.div 
                            key="form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2rem] p-8 md:p-12 shadow-[0_8px_30px_rgba(28,26,23,0.04)] border border-[#1C1A17]/10 relative overflow-hidden"
                        >
                            {/* Progress Indicator */}
                            <div className="flex items-center mb-10 pb-10 border-b border-[#F4F1EA] relative z-10">
                                {[
                                    { num: 1, label: 'Profile' },
                                    { num: 2, label: 'Background' },
                                    { num: 3, label: 'Scheduling' },
                                    { num: 4, label: 'Focus' }
                                ].map((item, index) => (
                                    <React.Fragment key={item.num}>
                                        <div className={`flex flex-col items-center flex-1 ${step >= item.num ? 'text-[#1C1A17]' : 'text-[#1C1A17]/40'}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-3 transition-colors ${step >= item.num ? 'bg-[#D45B34] text-white shadow-lg shadow-[#D45B34]/20' : 'bg-[#F4F1EA] text-[#1C1A17]/40'}`}>
                                                {item.num}
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest">{item.label}</span>
                                        </div>
                                        {index < 3 && (
                                            <div className="flex-1 h-1 bg-[#F4F1EA] rounded-full overflow-hidden mx-2 mt-[-24px]">
                                                <div className="h-full bg-[#D45B34] transition-all duration-500" style={{ width: step > item.num ? '100%' : '0%' }}></div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            <div className="relative z-10">
                                {step === 1 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                        <h2 className="text-xl font-black tracking-tight mb-8 flex items-center gap-3 uppercase">
                                            <User className="text-[#1C1A17]" /> Basic Information
                                        </h2>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                            <div>
                                                <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">Full Name</label>
                                                <input 
                                                    type="text" 
                                                    value={formData.full_name}
                                                    onChange={(e) => updateForm('full_name', e.target.value)}
                                                    className="w-full p-4 bg-[#F4F1EA]/30 border border-[#1C1A17]/15 rounded-xl focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all font-semibold text-sm outline-none"
                                                    placeholder="John Doe"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">Email</label>
                                                <input 
                                                    type="email" 
                                                    value={formData.email}
                                                    onChange={(e) => updateForm('email', e.target.value)}
                                                    className="w-full p-4 bg-[#F4F1EA]/30 border border-[#1C1A17]/15 rounded-xl focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all font-semibold text-sm outline-none"
                                                    placeholder="john@example.com"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">Phone (Optional)</label>
                                                <input 
                                                    type="tel" 
                                                    value={formData.phone}
                                                    onChange={(e) => updateForm('phone', e.target.value)}
                                                    className="w-full p-4 bg-[#F4F1EA]/30 border border-[#1C1A17]/15 rounded-xl focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all font-semibold text-sm outline-none"
                                                    placeholder="+1 234 567 8900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">Current Role</label>
                                                <input 
                                                    type="text" 
                                                    value={formData.current_role}
                                                    onChange={(e) => updateForm('current_role', e.target.value)}
                                                    className="w-full p-4 bg-[#F4F1EA]/30 border border-[#1C1A17]/15 rounded-xl focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all font-semibold text-sm outline-none"
                                                    placeholder="Frontend Developer"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">Target Role</label>
                                                <input 
                                                    type="text" 
                                                    value={formData.preferred_job_role}
                                                    onChange={(e) => updateForm('preferred_job_role', e.target.value)}
                                                    className="w-full p-4 bg-[#F4F1EA]/30 border border-[#1C1A17]/15 rounded-xl focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all font-semibold text-sm outline-none"
                                                    placeholder="Senior Frontend Developer"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">LinkedIn Profile</label>
                                                <input 
                                                    type="url" 
                                                    value={formData.linkedin_url}
                                                    onChange={(e) => updateForm('linkedin_url', e.target.value)}
                                                    className="w-full p-4 bg-[#F4F1EA]/30 border border-[#1C1A17]/15 rounded-xl focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all font-semibold text-sm outline-none"
                                                    placeholder="https://linkedin.com/in/johndoe"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-10 flex justify-end">
                                            <button 
                                                onClick={handleNext}
                                                className="px-10 py-4 bg-[#D45B34] text-white rounded-xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#D45B34]/20"
                                            >
                                                Continue <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 2 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                        <h2 className="text-xl font-black tracking-tight mb-8 flex items-center gap-3 uppercase">
                                            <Briefcase className="text-[#1C1A17]" /> Candidate Background
                                        </h2>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                            {/* Experience Level */}
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">Experience Level</label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {['Fresher', 'Experienced'].map((level) => (
                                                        <button
                                                            key={level}
                                                            onClick={() => updateForm('experience_level', level)}
                                                            className={`p-4 rounded-xl border font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                                                                formData.experience_level === level
                                                                    ? 'border-[#D45B34] bg-[#D45B34] text-white shadow-lg shadow-[#D45B34]/10'
                                                                    : 'border-[#1C1A17]/15 hover:border-[#D45B34]/30 text-[#1C1A17]/40 hover:text-[#D45B34]'
                                                            }`}
                                                        >
                                                            {level}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Conditionally show Years of Experience */}
                                            {formData.experience_level === 'Experienced' && (
                                                <div>
                                                    <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">Total Years of Experience</label>
                                                    <select
                                                        value={formData.years_of_experience || ''}
                                                        onChange={(e) => updateForm('years_of_experience', e.target.value)}
                                                        className="w-full p-4 bg-[#F4F1EA]/30 border border-[#1C1A17]/15 rounded-xl focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all font-semibold text-sm outline-none"
                                                    >
                                                        <option value="" disabled>Select Years</option>
                                                        <option value="1">1 Year</option>
                                                        <option value="2">2 Years</option>
                                                        <option value="3">3 Years</option>
                                                        <option value="4">4 Years</option>
                                                        <option value="5">5+ Years</option>
                                                    </select>
                                                </div>
                                            )}

                                            {/* Employment Status */}
                                            <div>
                                                <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">Employment Status</label>
                                                <select
                                                    value={formData.employment_status || ''}
                                                    onChange={(e) => updateForm('employment_status', e.target.value)}
                                                    className="w-full p-4 bg-[#F4F1EA]/30 border border-[#1C1A17]/15 rounded-xl focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all font-semibold text-sm outline-none"
                                                >
                                                    <option value="" disabled>Select Status</option>
                                                    <option value="Student">Student</option>
                                                    <option value="Unemployed">Unemployed</option>
                                                    <option value="Intern">Intern</option>
                                                    <option value="Working Full-Time">Working Full-Time</option>
                                                    <option value="Working Part-Time">Working Part-Time</option>
                                                    <option value="Freelancer">Freelancer</option>
                                                </select>
                                            </div>

                                            {/* Attended Real Interviews */}
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">Have you attended real interviews before?</label>
                                                <div className="flex gap-4">
                                                    {[true, false].map((val) => (
                                                        <button
                                                            key={String(val)}
                                                            onClick={() => updateForm('attended_real_interviews', val)}
                                                            className={`flex-1 p-4 rounded-xl border font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                                                                formData.attended_real_interviews === val
                                                                    ? 'border-[#D45B34] bg-[#D45B34] text-white shadow-lg shadow-[#D45B34]/10'
                                                                    : 'border-[#1C1A17]/15 hover:border-[#D45B34]/30 text-[#1C1A17]/40 hover:text-[#D45B34]'
                                                            }`}
                                                        >
                                                            {val ? 'Yes' : 'No'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Preferred Company Type */}
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">Preferred Company Type (Multi-Select)</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {['Startup', 'Product-Based Company', 'Service-Based Company', 'MNC', 'Remote Company'].map((type) => (
                                                        <button
                                                            key={type}
                                                            onClick={() => toggleCompanyType(type)}
                                                            className={`px-4 py-2 rounded-full border font-bold text-[10px] uppercase tracking-widest transition-all ${
                                                                formData.preferred_company_type.includes(type)
                                                                    ? 'border-[#D45B34] bg-[#D45B34] text-white shadow-md'
                                                                    : 'border-[#1C1A17]/15 bg-[#F4F1EA]/50 text-[#1C1A17]/70 hover:border-[#D45B34]/50'
                                                            }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Specific Company */}
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">Preparing for a Specific Company?</label>
                                                <input
                                                    type="text"
                                                    value={formData.preparing_company || ''}
                                                    onChange={(e) => updateForm('preparing_company', e.target.value)}
                                                    className="w-full p-4 bg-[#F4F1EA]/30 border border-[#1C1A17]/15 rounded-xl focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all font-semibold text-sm outline-none"
                                                    placeholder="Example: Google, Amazon, Microsoft, TCS, Infosys, other"
                                                />
                                            </div>

                                            {/* Interview Goal */}
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">Main Goal for this Mock Interview</label>
                                                <textarea
                                                    value={formData.interview_goal || ''}
                                                    onChange={(e) => updateForm('interview_goal', e.target.value)}
                                                    rows={3}
                                                    className="w-full p-4 bg-[#F4F1EA]/30 border border-[#1C1A17]/15 rounded-xl focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all font-semibold text-sm outline-none resize-none"
                                                    placeholder="Improve confidence, crack product-based companies, improve communication..."
                                                />
                                            </div>

                                            {/* Resume Upload section */}
                                            <div className="md:col-span-2 mt-4">
                                                <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">Upload Resume (PDF/DOC/DOCX)</label>
                                                
                                                {!formData.resume_filename ? (
                                                    <div className="relative group">
                                                        <div className="absolute -inset-0.5 bg-gradient-to-r from-[#D45B34]/20 to-[#1C1A17]/10 rounded-[1.5rem] blur opacity-50 group-hover:opacity-100 transition duration-500"></div>
                                                        <div className="relative bg-white border-2 border-dashed border-[#1C1A17]/20 hover:border-[#D45B34] rounded-2xl p-8 transition-colors flex flex-col items-center justify-center text-center">
                                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-colors ${uploadingResume ? 'bg-[#F4F1EA] text-[#D45B34]' : 'bg-[#F4F1EA] text-[#1C1A17]/40 group-hover:bg-[#D45B34] group-hover:text-white'}`}>
                                                                {uploadingResume ? <Sparkles className="animate-pulse" size={24} /> : <Upload size={24} />}
                                                            </div>
                                                            <p className="font-bold text-sm text-[#1C1A17] mb-2">{uploadingResume ? 'Uploading...' : 'Drag and drop your resume here'}</p>
                                                            <p className="text-[10px] font-semibold text-[#1C1A17]/40 uppercase tracking-widest mb-6">Max File Size: 5MB</p>
                                                            <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-[#D45B34] text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-[1.02] transition-transform">
                                                                Browse Files
                                                                <input type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={handleResumeUpload} disabled={uploadingResume} />
                                                            </label>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-5 bg-green-50/50 border border-green-200 rounded-2xl flex items-center justify-between">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                                                                <FileText size={20} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-[#1C1A17]">{formData.resume_filename}</p>
                                                                <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Successfully Uploaded</p>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={() => { updateForm('resume_filename', ''); updateForm('resume_url', ''); }}
                                                            className="px-4 py-2 text-[10px] font-black text-red-500 hover:bg-red-50 rounded-lg uppercase tracking-widest transition-colors"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-10 flex justify-between">
                                            <button 
                                                onClick={() => setStep(1)}
                                                className="px-8 py-4 text-[#1C1A17]/40 font-black text-[11px] uppercase tracking-[0.3em] hover:text-[#D45B34] transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button 
                                                onClick={handleNext}
                                                className="px-10 py-4 bg-[#D45B34] text-white rounded-xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#D45B34]/20"
                                            >
                                                Continue <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                        <h2 className="text-xl font-black tracking-tight mb-8 flex items-center gap-3 uppercase">
                                            <Calendar className="text-[#1C1A17]" /> Scheduling & Preferences
                                        </h2>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">Interview Type</label>
                                                <div className="grid grid-cols-2 gap-4">
                                                    {['technical', 'behavioral'].map((type) => (
                                                        <button
                                                            key={type}
                                                            onClick={() => updateForm('interview_type', type)}
                                                            className={`p-4 rounded-xl border font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                                                                formData.interview_type === type 
                                                                ? 'border-[#D45B34] bg-[#D45B34] text-white shadow-lg shadow-[#D45B34]/10' 
                                                                : 'border-[#1C1A17]/15 hover:border-[#D45B34]/30 text-[#1C1A17]/40 hover:text-[#D45B34]'
                                                            }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            <div>
                                                <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">Preferred Date</label>
                                                <input 
                                                    type="date" 
                                                    value={formData.preferred_date}
                                                    onChange={(e) => updateForm('preferred_date', e.target.value)}
                                                    className="w-full p-4 bg-[#F4F1EA]/30 border border-[#1C1A17]/15 rounded-xl focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all font-semibold text-sm outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">Preferred Time</label>
                                                <input 
                                                    type="time" 
                                                    value={formData.preferred_time}
                                                    onChange={(e) => updateForm('preferred_time', e.target.value)}
                                                    className="w-full p-4 bg-[#F4F1EA]/30 border border-[#1C1A17]/15 rounded-xl focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all font-semibold text-sm outline-none"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">Difficulty Level</label>
                                                <div className="grid grid-cols-3 gap-4">
                                                    {['beginner', 'intermediate', 'advanced'].map((level) => (
                                                        <button
                                                            key={level}
                                                            onClick={() => updateForm('difficulty_level', level)}
                                                            className={`p-4 rounded-xl border font-black text-[10px] uppercase tracking-[0.2em] transition-all ${
                                                                formData.difficulty_level === level 
                                                                ? 'border-[#D45B34] bg-[#D45B34] text-white shadow-lg shadow-[#D45B34]/10' 
                                                                : 'border-[#1C1A17]/15 hover:border-[#D45B34]/30 text-[#1C1A17]/40 hover:text-[#D45B34]'
                                                            }`}
                                                        >
                                                            {level}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-10 flex justify-between">
                                            <button 
                                                onClick={() => setStep(2)}
                                                className="px-8 py-4 text-[#1C1A17]/40 font-black text-[11px] uppercase tracking-[0.3em] hover:text-[#D45B34] transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button 
                                                onClick={handleNext}
                                                className="px-10 py-4 bg-[#D45B34] text-white rounded-xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#D45B34]/20"
                                            >
                                                Continue <ChevronRight size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                                        <h2 className="text-xl font-black tracking-tight mb-8 flex items-center gap-3 uppercase">
                                            <Target className="text-[#1C1A17]" /> Focus Areas
                                        </h2>
                                        
                                        <div className="space-y-6 mb-8">
                                            <div>
                                                <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">Target Company (Optional)</label>
                                                <input 
                                                    type="text" 
                                                    value={formData.target_company}
                                                    onChange={(e) => updateForm('target_company', e.target.value)}
                                                    className="w-full p-4 bg-[#F4F1EA]/30 border border-[#1C1A17]/15 rounded-xl focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all font-semibold text-sm outline-none"
                                                    placeholder="e.g. Google, Stripe, Notion"
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">Specific Skills to Focus On</label>
                                                <textarea 
                                                    value={formData.focus_skills}
                                                    onChange={(e) => updateForm('focus_skills', e.target.value)}
                                                    rows={3}
                                                    className="w-full p-4 bg-[#F4F1EA]/30 border border-[#1C1A17]/15 rounded-xl focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all font-semibold text-sm outline-none resize-none"
                                                    placeholder="React, System Design, Algorithms..."
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-black text-[#1C1A17] uppercase tracking-widest mb-3 ml-1">Additional Notes for the Interviewer</label>
                                                <textarea 
                                                    value={formData.additional_notes}
                                                    onChange={(e) => updateForm('additional_notes', e.target.value)}
                                                    rows={4}
                                                    className="w-full p-4 bg-[#F4F1EA]/30 border border-[#1C1A17]/15 rounded-xl focus:ring-2 focus:ring-[#D45B34]/10 focus:border-[#D45B34] transition-all font-semibold text-sm outline-none resize-none"
                                                    placeholder="I get nervous during whiteboard sessions..."
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-10 flex justify-between">
                                            <button 
                                                onClick={() => setStep(3)}
                                                className="px-8 py-4 text-[#1C1A17]/40 font-black text-[11px] uppercase tracking-[0.3em] hover:text-[#D45B34] transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button 
                                                onClick={handleStartClick}
                                                disabled={isSubmitting}
                                                className="px-10 py-4 bg-[#D45B34] text-white rounded-xl font-black text-[11px] uppercase tracking-[0.3em] flex items-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl shadow-[#D45B34]/20 disabled:opacity-50"
                                            >
                                                {isSubmitting ? 'Submitting...' : 'Submit Request'}
                                            </button>
                                        </div>

                                        {showCreditPanel && (
                                            <div className="mt-8 border-t border-[#1C1A17]/10 pt-8">
                                                <CreditCheckPanel
                                                    onConfirm={handleConfirmStart}
                                                    onCancel={() => setShowCreditPanel(false)}
                                                    isStarting={isSubmitting}
                                                    mode="purchased_human_only"
                                                />
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {step === 5 && (
                        <motion.div 
                            key="success"
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-[2rem] p-12 text-center shadow-[0_8px_30px_rgba(28,26,23,0.04)] border border-[#1C1A17]/10"
                        >
                            <div className="w-24 h-24 bg-[#D45B34]/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                <CheckCircle2 size={48} className="text-[#1C1A17]" />
                            </div>
                            <h2 className="text-3xl font-black uppercase tracking-tight mb-4">Request Submitted</h2>
                            <p className="text-lg text-[#1C1A17]/70 max-w-md mx-auto mb-10 font-medium">
                                Our team will review your request and pair you with an expert interviewer. You'll receive a confirmation email shortly.
                            </p>
                            
                            <div className="flex justify-center gap-4">
                                <button 
                                    onClick={() => navigate('/my-human-mock-interviews')}
                                    className="px-8 py-4 bg-[#D45B34] text-[#F4F1EA] rounded-xl font-black text-[11px] uppercase tracking-[0.3em] hover:scale-[1.02] transition-all shadow-xl shadow-[#D45B34]/20"
                                >
                                    View My Requests
                                </button>
                                <button 
                                    onClick={() => navigate('/mock-interview')}
                                    className="px-8 py-4 border border-[#1C1A17]/15 text-[#1C1A17] rounded-xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-[#F4F1EA] transition-all"
                                >
                                    Back to Prep
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            <CreditCheckModal
                isOpen={showCreditModal}
                viewState={modalType}
                onClose={() => setShowCreditModal(false)}
                onConfirm={handleConfirmStart}
                isStarting={isSubmitting}
                mode="purchased_human_only"
            />
        </div>
    );
};

export default HumanMockInterviewPage;
