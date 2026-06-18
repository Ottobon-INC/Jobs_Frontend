import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    ChevronLeft, Save, Plus, Trash2, Building2, 
    Layers, ClipboardList, Zap, DollarSign, Info, Code,
    Eye, EyeOff
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchPlaybookById, createPlaybook, updatePlaybook } from '../../api/playbooksApi';
import toast from 'react-hot-toast';

const EditPlaybookPage = () => {
    const { id } = useParams();
    const isEdit = !!id;
    const navigate = useNavigate();
    const [loading, setLoading] = useState(isEdit);
    const [activeTab, setActiveTab] = useState('basic');
    const [jsonInput, setJsonInput] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        industry: '',
        logo: '',
        hq: '',
        locations: [],
        category: '',
        hiring_zone: 'on-campus',
        is_published: true,
        hiring_seasons: '',
        hiring_type: '',
        roles: [],
        difficulty: 'Medium',
        difficulty_level: 3,
        rounds_count: 3,
        eligibility: { academic: '', qualification: '', backlogs: '', gapInEducation: '' },
        selection_process: [],
        test_pattern: [],
        syllabus: [],
        registration_process: [],
        compensation: { base: '', bonus: '', stock: '', relocation: '', totalYear1: '' },
        prep_focus: '',
        insider_scoop: '',
        jobs_link: '',
        cover_image: '',
        exam_date: ''
    });

    useEffect(() => {
        if (isEdit) {
            loadPlaybook();
        }
    }, [id]);

    const loadPlaybook = async () => {
        try {
            const data = await fetchPlaybookById(id);
            setFormData(data);
        } catch (error) {
            toast.error('Failed to load playbook');
            navigate('/admin/playbooks');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (category, field, value) => {
        setFormData(prev => ({
            ...prev,
            [category]: { ...prev[category], [field]: value }
        }));
    };

    const handleListChange = (field, index, value) => {
        const newList = [...formData[field]];
        newList[index] = value;
        setFormData(prev => ({ ...prev, [field]: newList }));
    };

    const addItem = (field, defaultValue) => {
        setFormData(prev => ({
            ...prev,
            [field]: [...prev[field], defaultValue]
        }));
    };

    const removeItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    const handleArrayItemChange = (field, index, subfield, value) => {
        const newList = [...formData[field]];
        newList[index] = { ...newList[index], [subfield]: value };
        setFormData(prev => ({ ...prev, [field]: newList }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await updatePlaybook(id, formData);
                toast.success('Playbook updated successfully');
            } else {
                await createPlaybook(formData);
                toast.success('Playbook created successfully');
            }
            navigate('/admin/playbooks');
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to save playbook');
        }
    };

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: Building2 },
        { id: 'hiring', label: 'Hiring & Roles', icon: Layers },
        { id: 'process', label: 'Selection Process', icon: ClipboardList },
        { id: 'syllabus', label: 'Syllabus & Test Pattern', icon: ClipboardList },
        { id: 'prep', label: 'Prep & Benefits', icon: Zap },
        { id: 'json', label: 'Raw JSON', icon: Code },
    ];

    if (loading) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#F6F3ED] p-8">
            <div className="max-w-4xl mx-auto">
                <button 
                    onClick={() => navigate('/admin/playbooks')}
                    className="flex items-center gap-2 text-[#313851]/60 hover:text-[#313851] font-bold mb-6 transition-colors"
                >
                    <ChevronLeft size={20} />
                    Back to Playbooks
                </button>

                <div className="bg-white rounded-[32px] shadow-xl overflow-hidden border border-[#313851]/5">
                    {/* Header */}
                    <div className="bg-[#313851] p-8 text-white">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-black tracking-tight">
                                    {isEdit ? 'Edit Playbook' : 'Create Playbook'}
                                </h1>
                                <p className="text-white/60 mt-1">
                                    {isEdit ? `Modifying ${formData.name}` : 'Enter company details below'}
                                </p>
                            </div>
                            <button 
                                onClick={handleSubmit}
                                className="flex items-center gap-2 bg-white text-[#313851] px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg active:scale-95"
                            >
                                <Save size={20} />
                                Save Playbook
                            </button>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-[#313851]/5 px-4 overflow-x-auto no-scrollbar">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 font-bold text-sm transition-all relative ${activeTab === tab.id ? 'text-[#313851]' : 'text-[#313851]/40'}`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                                {activeTab === tab.id && (
                                    <motion.div 
                                        layoutId="activeTab"
                                        className="absolute bottom-0 left-0 right-0 h-1 bg-[#313851] rounded-t-full"
                                    />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Form Content */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {activeTab === 'json' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-[#313851]/40 mb-2">Import from JSON</label>
                                    <p className="text-sm text-zinc-500 mb-4">
                                        Paste a complete JSON object here to automatically fill out all form fields. 
                                        Make sure the keys match the database schema (e.g., <code className="bg-zinc-100 px-1 rounded">selection_process</code>, <code className="bg-zinc-100 px-1 rounded">exam_date</code>).
                                    </p>
                                    <textarea 
                                        value={jsonInput}
                                        onChange={(e) => setJsonInput(e.target.value)}
                                        className="w-full h-96 bg-[#F6F3ED]/50 border-2 border-transparent focus:border-[#313851]/10 rounded-xl p-4 font-mono text-xs text-[#313851] outline-none transition-all resize-y shadow-inner"
                                        placeholder={'{\n  "name": "Google",\n  "slug": "google",\n  "industry": "Technology",\n  ...\n}'}
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            try {
                                                const parsed = JSON.parse(jsonInput);
                                                setFormData(prev => ({ ...prev, ...parsed }));
                                                toast.success('JSON imported successfully. Check the other tabs to verify.');
                                            } catch(e) {
                                                toast.error('Invalid JSON. Please check syntax.');
                                            }
                                        }}
                                        className="w-full mt-6 py-4 bg-[#313851] text-white rounded-xl font-bold hover:scale-[1.02] transition-transform shadow-lg"
                                    >
                                        Parse and Apply JSON
                                    </button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'basic' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-[#313851]/40 mb-2">Company Name</label>
                                        <input 
                                            type="text" name="name" value={formData.name} onChange={handleChange} required
                                            className="w-full bg-[#F6F3ED]/50 border-2 border-transparent focus:border-[#313851]/10 rounded-xl p-3 font-bold text-[#313851] outline-none transition-all"
                                            placeholder="e.g. Google"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-[#313851]/40 mb-2">Slug</label>
                                        <input 
                                            type="text" name="slug" value={formData.slug} onChange={handleChange} required
                                            className="w-full bg-[#F6F3ED]/50 border-2 border-transparent focus:border-[#313851]/10 rounded-xl p-3 font-bold text-[#313851] outline-none transition-all"
                                            placeholder="e.g. google"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-[#313851]/40 mb-2">Industry</label>
                                        <input 
                                            type="text" name="industry" value={formData.industry} onChange={handleChange}
                                            className="w-full bg-[#F6F3ED]/50 border-2 border-transparent focus:border-[#313851]/10 rounded-xl p-3 font-bold text-[#313851] outline-none transition-all"
                                            placeholder="e.g. Technology"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-[#313851]/40 mb-2">Category</label>
                                        <input 
                                            type="text" name="category" value={formData.category} onChange={handleChange}
                                            className="w-full bg-[#F6F3ED]/50 border-2 border-transparent focus:border-[#313851]/10 rounded-xl p-3 font-bold text-[#313851] outline-none transition-all"
                                            placeholder="e.g. Big Tech"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-[#313851]/40 mb-2">Logo URL</label>
                                        <input 
                                            type="text" name="logo" value={formData.logo} onChange={handleChange}
                                            className="w-full bg-[#F6F3ED]/50 border-2 border-transparent focus:border-[#313851]/10 rounded-xl p-3 font-bold text-[#313851] outline-none transition-all"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-[#313851]/40 mb-2">HQ Location</label>
                                        <input 
                                            type="text" name="hq" value={formData.hq} onChange={handleChange}
                                            className="w-full bg-[#F6F3ED]/50 border-2 border-transparent focus:border-[#313851]/10 rounded-xl p-3 font-bold text-[#313851] outline-none transition-all"
                                            placeholder="e.g. Mountain View, CA"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-[#313851]/40 mb-2">Exam Date</label>
                                        <input 
                                            type="text" name="exam_date" value={formData.exam_date || ''} onChange={handleChange}
                                            className="w-full bg-[#F6F3ED]/50 border-2 border-transparent focus:border-[#313851]/10 rounded-xl p-3 font-bold text-[#313851] outline-none transition-all"
                                            placeholder="e.g. August 2026 or TBA"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-[#313851]/40 mb-2">Hiring Zone</label>
                                        <div className="flex gap-4">
                                            {['on-campus', 'off-campus'].map(zone => (
                                                <button
                                                    key={zone} type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, hiring_zone: zone }))}
                                                    className={`px-6 py-3 rounded-xl font-bold capitalize transition-all ${formData.hiring_zone === zone ? 'bg-[#313851] text-white shadow-lg' : 'bg-[#F6F3ED] text-[#313851]/40'}`}
                                                >
                                                    {zone}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-[#313851]/40 mb-2">Publish Status</label>
                                        <div className="flex gap-4">
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, is_published: true }))}
                                                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${formData.is_published !== false ? 'bg-emerald-600 text-white shadow-md' : 'bg-[#F6F3ED] text-[#313851]/40'}`}
                                            >
                                                <Eye size={16} /> Published
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, is_published: false }))}
                                                className={`px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${formData.is_published === false ? 'bg-amber-600 text-white shadow-md' : 'bg-[#F6F3ED] text-[#313851]/40'}`}
                                            >
                                                <EyeOff size={16} /> Draft
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'hiring' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-[#313851]/40 mb-2">Hiring Seasons</label>
                                        <input 
                                            type="text" name="hiring_seasons" value={formData.hiring_seasons} onChange={handleChange}
                                            className="w-full bg-[#F6F3ED]/50 border-2 border-transparent focus:border-[#313851]/10 rounded-xl p-3 font-bold text-[#313851] outline-none transition-all"
                                            placeholder="e.g. Aug - Oct"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-[#313851]/40 mb-2">Hiring Type</label>
                                        <input 
                                            type="text" name="hiring_type" value={formData.hiring_type} onChange={handleChange}
                                            className="w-full bg-[#F6F3ED]/50 border-2 border-transparent focus:border-[#313851]/10 rounded-xl p-3 font-bold text-[#313851] outline-none transition-all"
                                            placeholder="e.g. FTE & Internships"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-[#313851]/40 mb-2">Difficulty</label>
                                        <select 
                                            name="difficulty" value={formData.difficulty} onChange={handleChange}
                                            className="w-full bg-[#F6F3ED]/50 border-2 border-transparent focus:border-[#313851]/10 rounded-xl p-3 font-bold text-[#313851] outline-none transition-all appearance-none"
                                        >
                                            <option>Easy</option>
                                            <option>Medium</option>
                                            <option>Hard</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-[#313851]/40 mb-2">Rounds Count</label>
                                        <input 
                                            type="number" name="rounds_count" value={formData.rounds_count} onChange={handleChange}
                                            className="w-full bg-[#F6F3ED]/50 border-2 border-transparent focus:border-[#313851]/10 rounded-xl p-3 font-bold text-[#313851] outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-[#313851]/40 mb-2">Difficulty Level (1-5)</label>
                                        <input 
                                            type="number" name="difficulty_level" value={formData.difficulty_level} onChange={handleChange} min="1" max="5"
                                            className="w-full bg-[#F6F3ED]/50 border-2 border-transparent focus:border-[#313851]/10 rounded-xl p-3 font-bold text-[#313851] outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-[#313851]/40 mb-2">Key Roles (one per line)</label>
                                    <textarea 
                                        value={formData.roles.join('\n')}
                                        onChange={(e) => setFormData(prev => ({ ...prev, roles: e.target.value.split('\n').filter(r => r.trim()) }))}
                                        className="w-full bg-[#F6F3ED]/50 border-2 border-transparent focus:border-[#313851]/10 rounded-xl p-4 font-bold text-[#313851] outline-none transition-all h-32"
                                        placeholder="Software Engineer&#10;Data Scientist"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'process' && (
                            <div className="space-y-8">
                                <div className="p-6 bg-[#F6F3ED]/30 rounded-3xl space-y-4">
                                    <h4 className="font-black text-[#313851] flex items-center gap-2">
                                        <Info size={18} /> Eligibility Criteria
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['academic', 'qualification', 'backlogs', 'gapInEducation'].map(f => (
                                            <div key={f}>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#313851]/30 mb-1">{f}</label>
                                                <input 
                                                    type="text" value={formData.eligibility[f]} 
                                                    onChange={(e) => handleNestedChange('eligibility', f, e.target.value)}
                                                    className="w-full bg-white border-none rounded-lg p-2.5 font-bold text-sm text-[#313851]"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-black text-[#313851]">Selection Process Steps</h4>
                                        <button type="button" onClick={() => addItem('selection_process', { name: '', details: '' })} className="text-xs font-black text-[#313851] flex items-center gap-1 hover:underline">
                                            <Plus size={14} /> Add Step
                                        </button>
                                    </div>
                                    {formData.selection_process.map((step, idx) => (
                                        <div key={idx} className="flex gap-4 items-start bg-[#F6F3ED]/30 p-4 rounded-2xl relative group">
                                            <div className="flex-1 space-y-2">
                                                <input 
                                                    placeholder="Step Name (e.g. Coding Round)"
                                                    value={step.name} onChange={(e) => handleArrayItemChange('selection_process', idx, 'name', e.target.value)}
                                                    className="w-full bg-white border-none rounded-lg p-2 font-bold text-[#313851]"
                                                />
                                                <textarea 
                                                    placeholder="Step Details"
                                                    value={step.details} onChange={(e) => handleArrayItemChange('selection_process', idx, 'details', e.target.value)}
                                                    className="w-full bg-white border-none rounded-lg p-2 font-medium text-sm text-[#313851]/70 h-20"
                                                />
                                            </div>
                                            <button type="button" onClick={() => removeItem('selection_process', idx)} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'syllabus' && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-black text-[#313851] text-lg">Test Pattern Sections</h4>
                                        <button 
                                            type="button" 
                                            onClick={() => addItem('test_pattern', { section: '', questions: '', duration: '' })} 
                                            className="text-xs font-black text-[#313851] flex items-center gap-1 hover:underline"
                                        >
                                            <Plus size={14} /> Add Section
                                        </button>
                                    </div>
                                    {formData.test_pattern.map((item, idx) => (
                                        <div key={idx} className="flex gap-4 items-center bg-[#F6F3ED]/30 p-4 rounded-2xl relative group">
                                            <div className="grid grid-cols-3 gap-4 flex-1">
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#313851]/30 mb-1">Section Name</label>
                                                    <input 
                                                        placeholder="e.g. Coding"
                                                        value={item.section} onChange={(e) => handleArrayItemChange('test_pattern', idx, 'section', e.target.value)}
                                                        className="w-full bg-white border-none rounded-lg p-2.5 font-bold text-sm text-[#313851]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#313851]/30 mb-1">No. of Questions</label>
                                                    <input 
                                                        placeholder="e.g. 2 Questions"
                                                        value={item.questions} onChange={(e) => handleArrayItemChange('test_pattern', idx, 'questions', e.target.value)}
                                                        className="w-full bg-white border-none rounded-lg p-2.5 font-medium text-sm text-[#313851]"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-black uppercase tracking-widest text-[#313851]/30 mb-1">Duration</label>
                                                    <input 
                                                        placeholder="e.g. 45 Mins"
                                                        value={item.duration} onChange={(e) => handleArrayItemChange('test_pattern', idx, 'duration', e.target.value)}
                                                        className="w-full bg-white border-none rounded-lg p-2.5 font-medium text-sm text-[#313851]"
                                                    />
                                                </div>
                                            </div>
                                            <button type="button" onClick={() => removeItem('test_pattern', idx)} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-6 pt-6 border-t border-[#313851]/10">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-black text-[#313851] text-lg">Syllabus Rounds</h4>
                                        <button 
                                            type="button" 
                                            onClick={() => addItem('syllabus', { round: '', topics: [] })} 
                                            className="text-xs font-black text-[#313851] flex items-center gap-1 hover:underline"
                                        >
                                            <Plus size={14} /> Add Syllabus Round
                                        </button>
                                    </div>
                                    
                                    {formData.syllabus.map((round, rIdx) => {
                                        const isTabular = round.topics && round.topics.length > 0 && typeof round.topics[0] === 'object';
                                        
                                        return (
                                            <div key={rIdx} className="bg-[#F6F3ED]/30 p-6 rounded-3xl space-y-4 border border-[#313851]/5 relative group">
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeItem('syllabus', rIdx)} 
                                                    className="absolute top-4 right-4 p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 size={18} />
                                                </button>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#313851]/30 mb-1">Round Name</label>
                                                        <input 
                                                            placeholder="e.g. Cognitive Assessment"
                                                            value={round.round || ''} 
                                                            onChange={(e) => handleArrayItemChange('syllabus', rIdx, 'round', e.target.value)}
                                                            className="w-full bg-white border-none rounded-lg p-2.5 font-bold text-sm text-[#313851]"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#313851]/30 mb-1">Display Mode</label>
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newTopics = round.topics.map(t => typeof t === 'object' ? t.name : t).filter(Boolean);
                                                                    handleArrayItemChange('syllabus', rIdx, 'topics', newTopics);
                                                                }}
                                                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${!isTabular ? 'bg-[#313851] text-white' : 'bg-white text-[#313851]/60'}`}
                                                            >
                                                                Checklist
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newTopics = round.topics.map(t => typeof t === 'string' ? { name: t, questions: '', time: '', difficulty: 'Medium' } : t);
                                                                    handleArrayItemChange('syllabus', rIdx, 'topics', newTopics);
                                                                }}
                                                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${isTabular ? 'bg-[#313851] text-white' : 'bg-white text-[#313851]/60'}`}
                                                            >
                                                                Tabular (4-Column)
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Topics Editor */}
                                                {!isTabular ? (
                                                    <div>
                                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#313851]/30 mb-1">Topics List (one topic per line)</label>
                                                        <textarea 
                                                            value={Array.isArray(round.topics) ? round.topics.join('\n') : ''}
                                                            onChange={(e) => {
                                                                const lines = e.target.value.split('\n').filter(line => line.trim());
                                                                handleArrayItemChange('syllabus', rIdx, 'topics', lines);
                                                            }}
                                                            className="w-full bg-white border-none rounded-lg p-3 font-semibold text-sm text-[#313851] h-32"
                                                            placeholder="Topic 1&#10;Topic 2&#10;Topic 3"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#313851]/30">Tabular Topics</label>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => {
                                                                    const newTopics = [...(round.topics || []), { name: '', questions: '', time: '', difficulty: 'Medium' }];
                                                                    handleArrayItemChange('syllabus', rIdx, 'topics', newTopics);
                                                                }}
                                                                className="text-[11px] font-bold text-[#313851] flex items-center gap-0.5 hover:underline"
                                                            >
                                                                <Plus size={12} /> Add Topic Row
                                                            </button>
                                                        </div>
                                                        <div className="overflow-x-auto border border-zinc-100 rounded-xl bg-white">
                                                            <table className="w-full border-collapse text-left text-xs">
                                                                <thead>
                                                                    <tr className="bg-zinc-50 border-b border-zinc-100 text-[#313851]/40 uppercase font-black tracking-wider">
                                                                        <th className="p-3">Topic Name</th>
                                                                        <th className="p-3 w-[120px]">Questions</th>
                                                                        <th className="p-3 w-[120px]">Time</th>
                                                                        <th className="p-3 w-[120px]">Difficulty</th>
                                                                        <th className="p-3 w-[50px]"></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {(round.topics || []).map((topic, tIdx) => (
                                                                        <tr key={tIdx} className="border-b border-zinc-50">
                                                                            <td className="p-2">
                                                                                <input 
                                                                                    value={topic.name || ''} 
                                                                                    onChange={(e) => {
                                                                                        const newTopics = [...round.topics];
                                                                                        newTopics[tIdx] = { ...topic, name: e.target.value };
                                                                                        handleArrayItemChange('syllabus', rIdx, 'topics', newTopics);
                                                                                    }}
                                                                                    className="w-full bg-zinc-50 border-none rounded p-1.5 font-bold"
                                                                                    placeholder="Topic Name"
                                                                                />
                                                                            </td>
                                                                            <td className="p-2">
                                                                                <input 
                                                                                    value={topic.questions || ''} 
                                                                                    onChange={(e) => {
                                                                                        const newTopics = [...round.topics];
                                                                                        newTopics[tIdx] = { ...topic, questions: e.target.value };
                                                                                        handleArrayItemChange('syllabus', rIdx, 'topics', newTopics);
                                                                                    }}
                                                                                    className="w-full bg-zinc-50 border-none rounded p-1.5 font-semibold"
                                                                                    placeholder="e.g. 5"
                                                                                />
                                                                            </td>
                                                                            <td className="p-2">
                                                                                <input 
                                                                                    value={topic.time || topic.duration || ''} 
                                                                                    onChange={(e) => {
                                                                                        const newTopics = [...round.topics];
                                                                                        newTopics[tIdx] = { ...topic, time: e.target.value, duration: e.target.value };
                                                                                        handleArrayItemChange('syllabus', rIdx, 'topics', newTopics);
                                                                                    }}
                                                                                    className="w-full bg-zinc-50 border-none rounded p-1.5 font-semibold"
                                                                                    placeholder="e.g. 10m"
                                                                                />
                                                                            </td>
                                                                            <td className="p-2">
                                                                                <select 
                                                                                    value={topic.difficulty || 'Medium'} 
                                                                                    onChange={(e) => {
                                                                                        const newTopics = [...round.topics];
                                                                                        newTopics[tIdx] = { ...topic, difficulty: e.target.value };
                                                                                        handleArrayItemChange('syllabus', rIdx, 'topics', newTopics);
                                                                                    }}
                                                                                    className="w-full bg-zinc-50 border-none rounded p-1.5 font-bold appearance-none"
                                                                                >
                                                                                    <option>Low</option>
                                                                                    <option>Medium</option>
                                                                                    <option>High</option>
                                                                                </select>
                                                                            </td>
                                                                            <td className="p-2 text-center">
                                                                                <button 
                                                                                    type="button" 
                                                                                    onClick={() => {
                                                                                        const newTopics = round.topics.filter((_, i) => i !== tIdx);
                                                                                        handleArrayItemChange('syllabus', rIdx, 'topics', newTopics);
                                                                                    }}
                                                                                    className="text-red-500 hover:text-red-700"
                                                                                >
                                                                                    <Trash2 size={14} />
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {activeTab === 'prep' && (
                            <div className="space-y-8">
                                <div className="p-6 bg-[#313851]/5 rounded-3xl space-y-4">
                                    <h4 className="font-black text-[#313851] flex items-center gap-2">
                                        <DollarSign size={18} /> Compensation Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['base', 'bonus', 'stock', 'relocation', 'totalYear1'].map(f => (
                                            <div key={f}>
                                                <label className="block text-[10px] font-black uppercase tracking-widest text-[#313851]/30 mb-1">{f}</label>
                                                <input 
                                                    type="text" value={formData.compensation[f]} 
                                                    onChange={(e) => handleNestedChange('compensation', f, e.target.value)}
                                                    className="w-full bg-white border-none rounded-lg p-2.5 font-bold text-sm text-[#313851]"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-[#313851]/40 mb-2">Preparation Focus</label>
                                        <textarea 
                                            name="prep_focus" value={formData.prep_focus} onChange={handleChange}
                                            className="w-full bg-[#F6F3ED]/50 border-2 border-transparent focus:border-[#313851]/10 rounded-xl p-4 font-bold text-[#313851] outline-none transition-all h-32"
                                            placeholder="What should candidates focus on?"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-[#313851]/40 mb-2">Insider Scoop</label>
                                        <textarea 
                                            name="insider_scoop" value={formData.insider_scoop} onChange={handleChange}
                                            className="w-full bg-[#F6F3ED]/50 border-2 border-transparent focus:border-[#313851]/10 rounded-xl p-4 font-bold text-[#313851] outline-none transition-all h-32"
                                            placeholder="Expert tips or internal insights..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest text-[#313851]/40 mb-2">External Jobs Link</label>
                                        <input 
                                            type="text" name="jobs_link" value={formData.jobs_link} onChange={handleChange}
                                            className="w-full bg-[#F6F3ED]/50 border-2 border-transparent focus:border-[#313851]/10 rounded-xl p-3 font-bold text-[#313851] outline-none transition-all"
                                            placeholder="https://..."
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditPlaybookPage;
