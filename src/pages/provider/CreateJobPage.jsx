import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../../api/jobsApi';
import { 
    Briefcase, Building2, MapPin, Clock, FileText, Code, 
    Settings2, Link2, AlertCircle, Loader2, Sparkles, Brain, CheckCircle2 
} from 'lucide-react';
import { motion } from 'framer-motion';

const BentoCard = ({ children, className = "", delay = 0 }) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
        className={`bg-white rounded-3xl border border-zinc-200 p-6 md:p-8 shadow-xl shadow-zinc-900/5 ${className}`}
    >
        {children}
    </motion.div>
);

const InputWrapper = ({ label, icon: Icon, children }) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
            {Icon && <Icon size={14} className="text-zinc-400" />}
            {label}
        </label>
        {children}
    </div>
);

const CreateJobPage = () => {
    const navigate = useNavigate();
    
    // Basic Details
    const [title, setTitle] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [workMode, setWorkMode] = useState('Onsite');
    const [locationInput, setLocationInput] = useState('');
    const [experienceInput, setExperienceInput] = useState('');
    
    // Role Details
    const [description, setDescription] = useState('');
    const [skillsInput, setSkillsInput] = useState('');
    
    // Pipeline Settings
    const [applyLink, setApplyLink] = useState('');
    const [screeningThreshold, setScreeningThreshold] = useState(60);
    const [mockInterviewInputMode, setMockInterviewInputMode] = useState('text');
    const [mockInterviewQuestionCount, setMockInterviewQuestionCount] = useState(4);
    const [isFeatured, setIsFeatured] = useState(false);

    // State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const skillsRequired = skillsInput.split(',').map(s => s.trim()).filter(Boolean);

        try {
            await createJob({
                title,
                description_raw: description,
                skills_required: skillsRequired,
                company_name: companyName,
                external_apply_url: applyLink,
                work_mode: workMode,
                location: locationInput,
                experience: experienceInput,
                screening_threshold: screeningThreshold,
                is_featured: isFeatured,
                mock_interview_config: {
                    input_mode: mockInterviewInputMode,
                    question_count: mockInterviewQuestionCount
                }
            });
            navigate('/provider/listings');
        } catch (err) {
            console.error(err);
            const detail = err.response?.data?.detail;
            setError(Array.isArray(detail) ? detail[0]?.msg : (typeof detail === 'string' ? detail : 'Failed to post job. Please check your inputs.'));
        } finally {
            setLoading(false);
        }
    };

    const inputClasses = "w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#D45B34]/20 focus:border-[#D45B34] transition-all placeholder:text-zinc-400";

    return (
        <div className="min-h-screen bg-[#F4F1EA] py-12 px-4 sm:px-6">
            <div className="max-w-4xl mx-auto">
                <header className="mb-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-sans font-black text-zinc-900 tracking-tight mb-4">
                        Post a Job
                    </h1>
                    <p className="text-zinc-500 text-sm font-medium">
                        Publish a new role to the network and leverage our AI pipeline to find top-tier talent.
                    </p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex items-start gap-3">
                            <AlertCircle size={20} className="shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold">Error Posting Job</h4>
                                <p className="text-xs font-medium mt-1">{error}</p>
                            </div>
                        </motion.div>
                    )}

                    {/* Basic Information */}
                    <BentoCard delay={0.1}>
                        <h2 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                            <Briefcase size={20} className="text-[#D45B34]" /> Basic Details
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <InputWrapper label="Job Title" icon={Briefcase}>
                                    <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} className={inputClasses} placeholder="e.g. Senior Frontend Engineer" />
                                </InputWrapper>
                            </div>
                            <InputWrapper label="Company Name" icon={Building2}>
                                <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClasses} placeholder="e.g. Acme Corp" />
                            </InputWrapper>
                            <InputWrapper label="Work Mode" icon={MapPin}>
                                <select value={workMode} onChange={(e) => setWorkMode(e.target.value)} className={inputClasses}>
                                    <option value="Onsite">Onsite</option>
                                    <option value="Remote">Remote</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                            </InputWrapper>
                            <InputWrapper label="Location" icon={MapPin}>
                                <input type="text" value={locationInput} onChange={(e) => setLocationInput(e.target.value)} className={inputClasses} placeholder="e.g. San Francisco, CA" />
                            </InputWrapper>
                            <InputWrapper label="Experience Level" icon={Clock}>
                                <input type="text" value={experienceInput} onChange={(e) => setExperienceInput(e.target.value)} className={inputClasses} placeholder="e.g. 3-5 Years" />
                            </InputWrapper>
                        </div>
                    </BentoCard>

                    {/* Role Details */}
                    <BentoCard delay={0.2}>
                        <h2 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                            <FileText size={20} className="text-[#D45B34]" /> Role Details
                        </h2>
                        <div className="grid grid-cols-1 gap-6">
                            <InputWrapper label="Job Description" icon={FileText}>
                                <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={8} className={`${inputClasses} resize-y min-h-[150px]`} placeholder="Describe the responsibilities, requirements, and mission of the role..." />
                            </InputWrapper>
                            <InputWrapper label="Required Skills" icon={Code}>
                                <input type="text" value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} className={inputClasses} placeholder="e.g. React, Node.js, TypeScript (comma separated)" />
                            </InputWrapper>
                        </div>
                    </BentoCard>

                    {/* Pipeline Settings */}
                    <BentoCard delay={0.3}>
                        <h2 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
                            <Settings2 size={20} className="text-[#D45B34]" /> AI Pipeline Settings
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <InputWrapper label="AI Screening Threshold (%)" icon={CheckCircle2}>
                                    <div className="flex items-center gap-4">
                                        <input type="range" min="0" max="100" value={screeningThreshold} onChange={(e) => setScreeningThreshold(Number(e.target.value))} className="flex-1 accent-[#D45B34]" />
                                        <span className="w-12 text-center font-bold text-zinc-900 bg-zinc-100 py-1.5 rounded-lg text-sm">{screeningThreshold}%</span>
                                    </div>
                                    <p className="text-[10px] text-zinc-500 font-medium">Applicants must score above this match percentage to pass Round 1.</p>
                                </InputWrapper>

                                <InputWrapper label="External Apply Link (Optional)" icon={Link2}>
                                    <input type="url" value={applyLink} onChange={(e) => setApplyLink(e.target.value)} className={inputClasses} placeholder="https://careers.company.com/job" />
                                    <p className="text-[10px] text-zinc-500 font-medium">If provided, applicants will be redirected here instead of using the AI pipeline.</p>
                                </InputWrapper>
                            </div>

                            <div className="p-5 bg-zinc-50 border border-zinc-200 rounded-2xl space-y-5">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-900 flex items-center gap-2 mb-2">
                                    <Brain size={14} className="text-[#D45B34]" /> Mock Interview Config
                                </h3>
                                <InputWrapper label="Input Mode">
                                    <select value={mockInterviewInputMode} onChange={(e) => setMockInterviewInputMode(e.target.value)} className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D45B34]/20">
                                        <option value="text">Text / Chat</option>
                                        <option value="voice">Voice / Speech</option>
                                    </select>
                                </InputWrapper>
                                <InputWrapper label="Number of Questions">
                                    <select value={mockInterviewQuestionCount} onChange={(e) => setMockInterviewQuestionCount(Number(e.target.value))} className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D45B34]/20">
                                        {[2,3,4,5,6].map(num => (
                                            <option key={num} value={num}>{num} Questions</option>
                                        ))}
                                    </select>
                                </InputWrapper>
                            </div>
                        </div>
                    </BentoCard>

                    {/* Submit Area */}
                    <div className="pt-6 pb-12 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full md:w-auto px-12 py-4 bg-[#D45B34] text-white rounded-xl font-bold text-sm uppercase tracking-widest hover:bg-[#B84A27] transition-all shadow-xl shadow-[#D45B34]/20 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <><Loader2 size={18} className="animate-spin" /> Publishing...</>
                            ) : (
                                <><Briefcase size={18} /> Publish Job to Network</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateJobPage;
