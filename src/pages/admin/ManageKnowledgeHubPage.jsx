import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    BookOpen,
    Brain,
    Radio,
    FileText,
    Plus,
    Trash2,
    Save,
    RefreshCw,
    Search,
    FileUp,
    Layers,
    Eye,
    HelpCircle,
    CheckCircle,
    ArrowLeft,
    AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchKnowledgeEntries, createKnowledgeEntry, deleteKnowledgeEntry } from '../../api/knowledgeApi';

const ManageKnowledgeHubPage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('global'); // 'global' | 'company'
    const [loading, setLoading] = useState(false);
    
    // Global Prompt State
    const [globalEntries, setGlobalEntries] = useState([]);
    const [globalPrompt, setGlobalPrompt] = useState('');
    const [originalGlobalPrompt, setOriginalGlobalPrompt] = useState('');
    
    // Company Guidelines State
    const [companyEntries, setCompanyEntries] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Form State for New Guideline
    const [newTitle, setNewTitle] = useState('');
    const [newCompany, setNewCompany] = useState('');
    const [newRole, setNewRole] = useState('');
    const [sourceType, setSourceType] = useState('text'); // 'text' | 'file'
    const [textContent, setTextContent] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [formSubmitting, setFormSubmitting] = useState(false);
    
    // Preview Modal State
    const [previewEntry, setPreviewEntry] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await fetchKnowledgeEntries();
            const globals = data.filter(entry => entry.is_global);
            const companies = data.filter(entry => !entry.is_global);
            
            setGlobalEntries(globals);
            setCompanyEntries(companies);
            
            if (globals.length > 0) {
                setGlobalPrompt(globals[0].content);
                setOriginalGlobalPrompt(globals[0].content);
            } else {
                setGlobalPrompt('');
                setOriginalGlobalPrompt('');
            }
        } catch (error) {
            console.error('Failed to load brain data:', error);
            toast.error('Failed to load Brain details');
        } finally {
            setLoading(false);
        }
    };

    // Global Prompt Operations
    const handleSaveGlobalPrompt = async () => {
        if (!globalPrompt.trim()) {
            toast.error('Global prompt cannot be empty. If you want to use the default, click Reset to Default.');
            return;
        }

        setLoading(true);
        try {
            // Delete existing global prompts first to ensure only one is active
            for (const entry of globalEntries) {
                await deleteKnowledgeEntry(entry.id);
            }

            // Create new global prompt
            const formData = new FormData();
            formData.append('title', 'Global Mock Interview Prompt');
            formData.append('is_global', 'true');
            formData.append('content', globalPrompt);
            
            await createKnowledgeEntry(formData);
            toast.success('Global prompt overrides saved successfully!');
            await loadData();
        } catch (error) {
            console.error('Failed to save global prompt:', error);
            toast.error('Failed to save global prompt overrides');
        } finally {
            setLoading(false);
        }
    };

    const handleResetGlobalPrompt = async () => {
        if (globalEntries.length === 0) {
            toast.error('No custom override is active. Already using defaults.');
            return;
        }

        if (window.confirm('Are you sure you want to delete custom overrides and fall back to the built-in system prompt?')) {
            setLoading(true);
            try {
                for (const entry of globalEntries) {
                    await deleteKnowledgeEntry(entry.id);
                }
                toast.success('Successfully reverted to default system prompt.');
                await loadData();
            } catch (error) {
                console.error('Failed to reset global prompt:', error);
                toast.error('Failed to reset global prompt');
            } finally {
                setLoading(false);
            }
        }
    };

    // Company Guideline Operations
    const handleCreateGuideline = async (e) => {
        e.preventDefault();
        
        if (!newTitle.trim()) {
            toast.error('Title is required');
            return;
        }
        if (!newCompany.trim()) {
            toast.error('Company Name is required');
            return;
        }
        if (sourceType === 'text' && !textContent.trim()) {
            toast.error('Guideline text content cannot be empty');
            return;
        }
        if (sourceType === 'file' && !selectedFile) {
            toast.error('Please select a PDF/TXT document to upload');
            return;
        }

        setFormSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('title', newTitle);
            formData.append('is_global', 'false');
            formData.append('company_name', newCompany);
            if (newRole.trim()) {
                formData.append('role_name', newRole);
            }
            
            if (sourceType === 'text') {
                formData.append('content', textContent);
            } else {
                formData.append('file', selectedFile);
            }

            await createKnowledgeEntry(formData);
            if (sourceType === 'file') {
                toast.success('Document uploaded and parsed successfully!');
            } else {
                toast.success('Guidelines note added successfully!');
            }
            
            // Reset fields
            setNewTitle('');
            setNewCompany('');
            setNewRole('');
            setTextContent('');
            setSelectedFile(null);
            
            // Reload list
            await loadData();
        } catch (error) {
            console.error('Failed to add company guidelines:', error);
            toast.error(error.response?.data?.detail || 'Failed to add company guidelines');
        } finally {
            setFormSubmitting(false);
        }
    };

    const handleDeleteGuideline = async (id, title) => {
        if (window.confirm(`Are you sure you want to delete the guidelines: "${title}"?`)) {
            setLoading(true);
            try {
                await deleteKnowledgeEntry(id);
                toast.success('Guidelines deleted successfully');
                await loadData();
            } catch (error) {
                console.error('Failed to delete guidelines:', error);
                toast.error('Failed to delete guidelines');
            } finally {
                setLoading(false);
            }
        }
    };

    // Filters company guidelines by search query
    const filteredCompanyEntries = companyEntries.filter(entry => {
        const query = searchQuery.toLowerCase();
        return (
            entry.title.toLowerCase().includes(query) ||
            (entry.company_name && entry.company_name.toLowerCase().includes(query)) ||
            (entry.role_name && entry.role_name.toLowerCase().includes(query))
        );
    });

    const isGlobalModified = globalPrompt !== originalGlobalPrompt;

    return (
        <div className="min-h-screen bg-[#F4F1EA] p-8 text-[#1C1A17]">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="inline-flex items-center gap-2 text-[#1C1A17]/60 hover:text-[#1C1A17] transition-all text-xs font-black uppercase tracking-wider mb-6 bg-white border border-[#1C1A17]/10 px-4 py-2 rounded-xl shadow-sm hover:scale-105 active:scale-95 duration-200 cursor-pointer"
                >
                    <ArrowLeft size={14} strokeWidth={3} /> Dashboard
                </button>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                            <Brain className="w-8 h-8 text-[#1C1A17]" strokeWidth={2.5} />
                            Brain
                        </h1>
                        <p className="text-[#1C1A17]/60 mt-1">Configure simulator-wide prompts and target company guidebooks</p>
                    </div>

                    {/* Tab Switcher */}
                    <div className="bg-[#1C1A17]/5 p-1 rounded-xl flex gap-1 self-start">
                        <button
                            onClick={() => setActiveTab('global')}
                            className={`px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                                activeTab === 'global' 
                                    ? 'bg-[#1C1A17] text-white shadow-md' 
                                    : 'text-[#1C1A17]/75 hover:bg-[#1C1A17]/5'
                            }`}
                        >
                            <span className="flex items-center gap-1.5">
                                <Radio size={14} /> Global Instructions
                            </span>
                        </button>
                        <button
                            onClick={() => setActiveTab('company')}
                            className={`px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                                activeTab === 'company' 
                                    ? 'bg-[#1C1A17] text-white shadow-md' 
                                    : 'text-[#1C1A17]/75 hover:bg-[#1C1A17]/5'
                            }`}
                        >
                            <span className="flex items-center gap-1.5">
                                <Layers size={14} /> Company Guidelines
                            </span>
                        </button>
                    </div>
                </div>

                {/* Main Content Areas */}
                <AnimatePresence mode="wait">
                    {activeTab === 'global' ? (
                        <motion.div
                            key="global"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.2 }}
                            className="bg-white rounded-3xl p-8 shadow-sm border border-[#1C1A17]/10"
                        >
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#1C1A17]/10 pb-4 mb-6">
                                <div>
                                    <h2 className="text-xl font-black">Global Simulator Behavior Prompt</h2>
                                    <p className="text-sm text-[#1C1A17]/60 mt-1">Configure the core AI interviewer instructions, turn discipline rules, and standard protocols.</p>
                                </div>
                                
                                {/* Status Indicator */}
                                <div className="flex items-center gap-2">
                                    {globalEntries.length > 0 ? (
                                        <div className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200/50 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
                                            <CheckCircle size={14} className="text-green-600" />
                                            Active Database Override
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200/50 px-3.5 py-1.5 rounded-full text-xs font-bold shadow-sm">
                                            <HelpCircle size={14} className="text-amber-600" />
                                            Default System Fallback
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Prompt Editing Area */}
                            <div className="space-y-6">
                                <div className="bg-[#1C1A17]/5 rounded-2xl p-5 border border-[#1C1A17]/10">
                                    <h3 className="text-xs font-black uppercase tracking-wider text-[#1C1A17]/60 mb-2 flex items-center gap-1.5">
                                        <AlertCircle size={14} /> Quick Guide
                                    </h3>
                                    <ul className="text-xs text-[#1C1A17]/75 space-y-1.5 list-disc list-inside">
                                        <li>Define the phases, response style, evaluations, and deflection rules.</li>
                                        <li>You must instruct the AI to use classification tags `[MAIN_QUESTION]` and `[FOLLOW_UP]` at the start of responses so the UI parses rounds correctly.</li>
                                        <li>To fallback to the hardcoded default prompt, click the "Reset to Default" button.</li>
                                    </ul>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-[#1C1A17]/55 mb-2.5">
                                        Prompt Instructions Content
                                    </label>
                                    <textarea
                                        value={globalPrompt}
                                        onChange={(e) => setGlobalPrompt(e.target.value)}
                                        placeholder="Paste your system prompt instructions here..."
                                        rows={16}
                                        className="w-full bg-[#F4F1EA]/30 border border-[#1C1A17]/15 rounded-2xl p-5 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#1C1A17]/10 text-[#1C1A17] placeholder-[#1C1A17]/35 leading-relaxed shadow-inner"
                                    />
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#1C1A17]/10 pt-6 mt-6">
                                    <button
                                        onClick={handleResetGlobalPrompt}
                                        disabled={loading || globalEntries.length === 0}
                                        className="flex items-center gap-2 px-5 py-3 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-40 transition-all font-bold text-sm cursor-pointer"
                                    >
                                        <RefreshCw size={15} />
                                        Reset to Default
                                    </button>

                                    <button
                                        onClick={handleSaveGlobalPrompt}
                                        disabled={loading || !isGlobalModified}
                                        className={`flex items-center gap-2 px-7 py-3 rounded-xl font-bold transition-all shadow-md text-sm cursor-pointer ${
                                            isGlobalModified 
                                                ? 'bg-[#1C1A17] text-white hover:scale-105 active:scale-95' 
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                                        }`}
                                    >
                                        <Save size={16} />
                                        Save Custom Prompt overrides
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="company"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.2 }}
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                            {/* Left Column: Form to Add Guide */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#1C1A17]/10 self-start">
                                <h2 className="text-lg font-black border-b border-[#1C1A17]/10 pb-3 mb-5">
                                    Add Company Guidelines
                                </h2>
                                
                                <form onSubmit={handleCreateGuideline} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-wider text-[#1C1A17]/55 mb-1.5">
                                            Guidelines Title
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Google Android Engineer Specs"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            className="w-full bg-[#F4F1EA]/40 border border-[#1C1A17]/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1C1A17]/10 text-sm text-[#1C1A17] font-bold placeholder-[#1C1A17]/35"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-wider text-[#1C1A17]/55 mb-1.5">
                                                Company Name
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Google"
                                                value={newCompany}
                                                onChange={(e) => setNewCompany(e.target.value)}
                                                className="w-full bg-[#F4F1EA]/40 border border-[#1C1A17]/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1C1A17]/10 text-sm text-[#1C1A17] font-bold placeholder-[#1C1A17]/35"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-wider text-[#1C1A17]/55 mb-1.5">
                                                Target Role (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Android Engineer"
                                                value={newRole}
                                                onChange={(e) => setNewRole(e.target.value)}
                                                className="w-full bg-[#F4F1EA]/40 border border-[#1C1A17]/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1C1A17]/10 text-sm text-[#1C1A17] font-bold placeholder-[#1C1A17]/35"
                                            />
                                        </div>
                                    </div>

                                    {/* Source Type Selector */}
                                    <div className="border-t border-[#1C1A17]/10 pt-4 mt-2">
                                        <label className="block text-xs font-black uppercase tracking-wider text-[#1C1A17]/55 mb-2">
                                            Content Source Type
                                        </label>
                                        <div className="bg-[#1C1A17]/5 p-1 rounded-xl flex gap-1 w-full">
                                            <button
                                                type="button"
                                                onClick={() => setSourceType('text')}
                                                className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                                                    sourceType === 'text' 
                                                        ? 'bg-[#1C1A17] text-white shadow' 
                                                        : 'text-[#1C1A17]/75 hover:bg-[#1C1A17]/5'
                                                }`}
                                            >
                                                Write Note
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSourceType('file')}
                                                className={`flex-1 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-all duration-200 ${
                                                    sourceType === 'file' 
                                                        ? 'bg-[#1C1A17] text-white shadow' 
                                                        : 'text-[#1C1A17]/75 hover:bg-[#1C1A17]/5'
                                                }`}
                                            >
                                                Upload Doc (PDF/TXT)
                                            </button>
                                        </div>
                                    </div>

                                    {/* Conditional Form Source Fields */}
                                    {sourceType === 'text' ? (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                        >
                                            <label className="block text-xs font-black uppercase tracking-wider text-[#1C1A17]/55 mb-1.5">
                                                Guideline Text Note
                                            </label>
                                            <textarea
                                                rows={8}
                                                placeholder="Write specific guidelines, topics to target, or culture questions to ask..."
                                                value={textContent}
                                                onChange={(e) => setTextContent(e.target.value)}
                                                className="w-full bg-[#F4F1EA]/40 border border-[#1C1A17]/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#1C1A17]/10 text-xs text-[#1C1A17] placeholder-[#1C1A17]/35 leading-relaxed"
                                                required={sourceType === 'text'}
                                            />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            className="space-y-2"
                                        >
                                            <label className="block text-xs font-black uppercase tracking-wider text-[#1C1A17]/55 mb-1">
                                                Upload Guide File
                                            </label>
                                            <div className={`border border-dashed transition-colors rounded-2xl p-6 text-center cursor-pointer relative ${
                                                 selectedFile 
                                                     ? 'border-green-500 bg-green-50/20' 
                                                     : 'border-[#1C1A17]/20 hover:border-[#1C1A17]/50 bg-[#F4F1EA]/20'
                                             }`}>
                                                <input
                                                    type="file"
                                                    accept=".pdf,.txt"
                                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                {selectedFile ? (
                                                     <CheckCircle className="mx-auto text-green-500 mb-2 w-8 h-8" />
                                                 ) : (
                                                     <FileUp className="mx-auto text-[#1C1A17]/45 mb-2 w-8 h-8" />
                                                 )}
                                                 <span className={`block text-xs font-bold ${selectedFile ? 'text-green-700' : 'text-[#1C1A17]/80'}`}>
                                                     {selectedFile ? `File Selected: ${selectedFile.name}` : 'Select PDF or TXT Document'}
                                                 </span>
                                                 <span className={`block text-[10px] mt-1 ${selectedFile ? 'text-green-600/70' : 'text-[#1C1A17]/45'}`}>
                                                     {selectedFile ? 'Ready to upload guidelines' : 'PDF / TXT up to 10MB'}
                                                 </span>
                                            </div>
                                        </motion.div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={formSubmitting}
                                        className="w-full flex items-center justify-center gap-2 bg-[#1C1A17] text-white py-3.5 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-md mt-4 text-xs uppercase tracking-wider cursor-pointer"
                                    >
                                        {formSubmitting ? (
                                            <>
                                                <RefreshCw size={14} className="animate-spin" />
                                                Adding and Parsing...
                                            </>
                                        ) : (
                                            <>
                                                <Plus size={16} strokeWidth={2.5} />
                                                Add Guidelines
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>

                            {/* Right Column: Existing Guidelines List */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#1C1A17]/10 flex flex-col min-h-[500px]">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1C1A17]/10 pb-3 mb-5">
                                    <h2 className="text-lg font-black">
                                        Company Guidelines Directory
                                    </h2>
                                    
                                    {/* Search Filter */}
                                    <div className="relative max-w-xs w-full">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1C1A17]/40 w-4 h-4" />
                                        <input
                                            type="text"
                                            placeholder="Search company or title..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-[#F4F1EA]/50 border border-[#1C1A17]/10 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-[#1C1A17]/10 text-xs text-[#1C1A17] placeholder-[#1C1A17]/35 font-medium"
                                        />
                                    </div>
                                </div>

                                {/* List grid */}
                                {loading ? (
                                    <div className="space-y-3 flex-1 flex flex-col justify-center py-12">
                                        <RefreshCw size={32} className="animate-spin text-[#1C1A17]/20 mx-auto" />
                                        <span className="text-xs font-bold text-[#1C1A17]/40 text-center block mt-2">Loading Directory...</span>
                                    </div>
                                ) : filteredCompanyEntries.length === 0 ? (
                                    <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#1C1A17]/10 rounded-2xl p-12 bg-[#F4F1EA]/10 text-center">
                                        <FileText size={42} className="text-[#1C1A17]/20 mb-3" />
                                        <h3 className="text-sm font-black">No Guidelines Found</h3>
                                        <p className="text-xs text-[#1C1A17]/55 mt-1 max-w-xs">
                                            {searchQuery ? 'No guidelines match your search query.' : 'Add your first company guidelines using the left panel form.'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[520px] pr-1">
                                        {filteredCompanyEntries.map((entry) => (
                                            <div 
                                                key={entry.id}
                                                className="bg-[#F4F1EA]/30 hover:bg-[#F4F1EA]/60 border border-[#1C1A17]/10 hover:border-[#1C1A17]/15 rounded-2xl p-4 flex items-center justify-between gap-4 transition-all duration-200"
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span className="bg-[#1C1A17] text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                                                            {entry.company_name}
                                                        </span>
                                                        {entry.role_name && (
                                                            <span className="bg-[#1C1A17]/5 text-[#1C1A17] border border-[#1C1A17]/15 px-2 py-0.5 rounded text-[10px] font-bold">
                                                                {entry.role_name}
                                                            </span>
                                                        )}
                                                        {entry.file_url && (
                                                            <span className="bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded text-[9px] font-bold uppercase flex items-center gap-1">
                                                                <FileText size={10} /> Document
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="text-sm font-black text-[#1C1A17] mt-2 truncate leading-tight">
                                                        {entry.title}
                                                    </h3>
                                                    <p className="text-[10px] text-[#1C1A17]/45 mt-1 font-medium">
                                                        Added: {new Date(entry.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    <button
                                                        onClick={() => setPreviewEntry(entry)}
                                                        className="flex items-center gap-1 bg-[#1C1A17]/5 hover:bg-[#1C1A17]/10 text-[#1C1A17] p-2.5 rounded-lg transition-colors font-bold text-xs uppercase"
                                                        title="Preview Content"
                                                    >
                                                        <Eye size={14} />
                                                    </button>
                                                    
                                                    {entry.file_url && (
                                                        <a
                                                            href={entry.file_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 bg-[#1C1A17]/5 hover:bg-[#1C1A17]/10 text-[#1C1A17] p-2.5 rounded-lg transition-colors font-bold text-xs uppercase"
                                                            title="Download File"
                                                        >
                                                            <FileUp size={14} className="rotate-180" />
                                                        </a>
                                                    )}

                                                    <button
                                                        onClick={() => handleDeleteGuideline(entry.id, entry.title)}
                                                        className="p-2.5 text-red-500 hover:text-white bg-red-50 hover:bg-red-500 rounded-lg transition-all"
                                                        title="Delete Guidelines"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Preview Modal Overlay */}
                <AnimatePresence>
                    {previewEntry && (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-[#1C1A17]/50 z-[2000] flex items-center justify-center p-4 backdrop-blur-xs"
                            onClick={() => setPreviewEntry(null)}
                        >
                            <motion.div 
                                initial={{ scale: 0.95, y: 15 }}
                                animate={{ scale: 1, y: 0 }}
                                exit={{ scale: 0.95, y: 15 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                                className="bg-white rounded-3xl max-w-2xl w-full flex flex-col shadow-2xl overflow-hidden border border-[#1C1A17]/10"
                                style={{ maxHeight: '80vh' }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                {/* Modal Header */}
                                <div className="p-6 border-b border-[#1C1A17]/10 bg-[#1C1A17]/5">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <span className="bg-[#1C1A17] text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                                            {previewEntry.company_name}
                                        </span>
                                        {previewEntry.role_name && (
                                            <span className="bg-[#1C1A17]/10 text-[#1C1A17] px-2 py-0.5 rounded text-[10px] font-bold">
                                                {previewEntry.role_name}
                                            </span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-black text-[#1C1A17]">
                                        {previewEntry.title}
                                    </h3>
                                </div>

                                {/* Modal Body (Parsed Content View) */}
                                <div 
                                    className="p-6 flex-1 font-sans text-sm text-[#1C1A17]/85 leading-relaxed bg-[#F4F1EA]/20 whitespace-pre-wrap"
                                    style={{ maxHeight: 'calc(80vh - 180px)', overflowY: 'auto' }}
                                >
                                    {previewEntry.content || 'No text content available.'}
                                </div>

                                {/* Modal Footer */}
                                <div className="p-4 border-t border-[#1C1A17]/10 flex justify-end bg-white">
                                    <button
                                        onClick={() => setPreviewEntry(null)}
                                        className="bg-[#1C1A17] text-white px-6 py-2.5 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all text-xs uppercase tracking-wider cursor-pointer"
                                    >
                                        Close Preview
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default ManageKnowledgeHubPage;
