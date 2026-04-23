import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../../api/jobsApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Briefcase, Info, Sparkles, Building2, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const CreateJobPage = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [skillsInput, setSkillsInput] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [applyLink, setApplyLink] = useState('');
    const [workMode, setWorkMode] = useState('Onsite');
    const [locationInput, setLocationInput] = useState('');
    const [experienceInput, setExperienceInput] = useState('');
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
                experience: experienceInput
            });
            navigate('/provider/listings');
        } catch (err) {
            console.error(err);
            const detail = err.response?.data?.detail;
            setError(Array.isArray(detail) ? detail[0]?.msg : (typeof detail === 'string' ? detail : 'OBJECT_CREATION_FAILED'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto pt-8 pb-12 px-6 md:px-10 bg-[#FBFBFB] min-h-screen">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16 relative">
                <div className="w-full">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-transparent text-zinc-500 text-[10px] font-bold uppercase tracking-[0.15em] mb-8 border border-zinc-200">
                        <span className="text-zinc-400 text-xs">#</span> PUBLISH REQUIREMENT
                    </div>
                    <h1 className="text-5xl md:text-6xl font-sans font-bold mb-4 tracking-tight text-[#1a1a1a]">
                        Signal Injection
                    </h1>
                    <p className="text-zinc-500 max-w-xl text-lg leading-relaxed font-medium">
                        Transmit new job parameters to the network and attract top-tier talent.
                    </p>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card premium-shadow-lg p-8 md:p-12"
                style={{ backgroundColor: 'var(--color-job-card)', borderColor: 'rgba(49, 56, 81, 0.45)' }}
            >
                <form onSubmit={handleSubmit} className="space-y-12">
                    {error && (
                        <div className="bg-rose-50 text-rose-600 p-6 rounded-[24px] border border-rose-100 text-[10px] font-bold uppercase tracking-widest text-center">
                            Exception Detected: {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-4" style={{ color: 'var(--color-primary)' }}>
                                Requirement Title
                            </label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-transparent border rounded-2xl px-8 py-6 font-bold text-sm focus:outline-none transition-all"
                                style={{ borderColor: 'rgba(49, 56, 81, 0.45)', color: 'var(--color-primary)' }}
                                placeholder="Systems Architect / Product Lead"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-4" style={{ color: 'var(--color-primary)' }}>
                                Strategic Description
                            </label>
                            <textarea
                                required
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={10}
                                className="w-full bg-transparent border rounded-2xl px-8 py-8 font-medium text-sm focus:outline-none transition-all leading-relaxed"
                                style={{ borderColor: 'rgba(49, 56, 81, 0.45)', color: 'var(--color-primary)' }}
                                placeholder="Define the primary mission and technical scope..."
                            />
                            <div className="flex justify-between items-center mt-4 px-4">
                                <p className="text-[10px] font-bold flex items-center gap-2 uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>
                                    <Info size={14} /> Min_Char: 20
                                </p>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-4" style={{ color: 'var(--color-primary)' }}>
                                Required Scalars (Skills)
                            </label>
                            <input
                                type="text"
                                value={skillsInput}
                                onChange={(e) => setSkillsInput(e.target.value)}
                                className="w-full bg-transparent border rounded-2xl px-8 py-6 font-bold text-sm focus:outline-none transition-all"
                                style={{ borderColor: 'rgba(49, 56, 81, 0.45)', color: 'var(--color-primary)' }}
                                placeholder="Node.js, React, Strategy (Comma Separated)"
                            />
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-4" style={{ color: 'var(--color-primary)' }}>
                                Company Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
                                    <Building2 size={18} className="text-zinc-400" />
                                </div>
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full bg-transparent border rounded-2xl pl-16 pr-8 py-6 font-bold text-sm focus:outline-none transition-all"
                                    style={{ borderColor: 'rgba(49, 56, 81, 0.45)', color: 'var(--color-primary)' }}
                                    placeholder="Ottobon AI"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-4" style={{ color: 'var(--color-primary)' }}>
                                External Apply Link
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
                                    <Globe size={18} className="text-zinc-400" />
                                </div>
                                <input
                                    type="url"
                                    value={applyLink}
                                    onChange={(e) => setApplyLink(e.target.value)}
                                    className="w-full bg-transparent border rounded-2xl pl-16 pr-8 py-6 font-bold text-sm focus:outline-none transition-all"
                                    style={{ borderColor: 'rgba(49, 56, 81, 0.45)', color: 'var(--color-primary)' }}
                                    placeholder="https://careers.ottobon.cloud/job/123"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-4" style={{ color: 'var(--color-primary)' }}>
                                Work Mode
                            </label>
                            <div className="relative">
                                <select
                                    value={workMode}
                                    onChange={(e) => setWorkMode(e.target.value)}
                                    className="w-full bg-transparent border rounded-2xl px-8 py-6 font-bold text-sm focus:outline-none transition-all appearance-none cursor-pointer"
                                    style={{ borderColor: 'rgba(49, 56, 81, 0.45)', color: 'var(--color-primary)' }}
                                >
                                    <option value="Onsite">Onsite</option>
                                    <option value="Remote">Remote</option>
                                    <option value="Hybrid">Hybrid</option>
                                </select>
                                <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none text-zinc-400">
                                    <Info size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-4" style={{ color: 'var(--color-primary)' }}>
                                Specific Location
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
                                    <Globe size={18} className="text-zinc-400" />
                                </div>
                                <input
                                    type="text"
                                    value={locationInput}
                                    onChange={(e) => setLocationInput(e.target.value)}
                                    className="w-full bg-transparent border rounded-2xl pl-16 pr-8 py-6 font-bold text-sm focus:outline-none transition-all"
                                    style={{ borderColor: 'rgba(49, 56, 81, 0.45)', color: 'var(--color-primary)' }}
                                    placeholder="Bangalore, Karnataka / Remote"
                                />
                            </div>
                        </div>

                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-4 ml-4" style={{ color: 'var(--color-primary)' }}>
                                Required Experience
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-8 flex items-center pointer-events-none">
                                    <Info size={18} className="text-zinc-400" />
                                </div>
                                <input
                                    type="text"
                                    value={experienceInput}
                                    onChange={(e) => setExperienceInput(e.target.value)}
                                    className="w-full bg-transparent border rounded-2xl pl-16 pr-8 py-6 font-bold text-sm focus:outline-none transition-all"
                                    style={{ borderColor: 'rgba(49, 56, 81, 0.45)', color: 'var(--color-primary)' }}
                                    placeholder="2-4 Years / Freshers"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 flex justify-center">
                        <motion.button
                            type="submit"
                            disabled={loading}
                            className="hero-cta hero-cta-primary w-full md:w-auto px-16 py-6 font-bold text-[11px] uppercase tracking-[0.3em] disabled:opacity-50"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin mr-3" />
                                    Transmitting...
                                </>
                            ) : (
                                <>
                                    <Briefcase size={20} className="mr-3" />
                                    Publish Requirement
                                </>
                            )}
                        </motion.button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default CreateJobPage;
