import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchInterviewMaterials, fetchFolders } from '../../api/interviewMaterialsApi';
import { FileText, Download, Loader2, Search, BookOpen, Folder, ChevronRight, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CompanyLogo } from '../../components/new-grad/CompanyLogo';

const InterviewMaterialsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    // Data State
    const [materials, setMaterials] = useState([]);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Navigation/Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFolderId, setActiveFolderId] = useState(null); // null = Folder selection view

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [materialsData, foldersData] = await Promise.all([
                fetchInterviewMaterials(),
                fetchFolders()
            ]);
            setMaterials(materialsData);
            setFolders(foldersData);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter logic
    const filteredMaterials = materials.filter(m => {
        const matchesSearch = searchQuery === '' || 
            m.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.title.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesFolder = searchQuery !== '' || activeFolderId === null || m.folder_id === activeFolderId;
        
        return matchesSearch && matchesFolder;
    });

    // If searching, we skip folder view and show all matching materials
    const isSearching = searchQuery.trim() !== '';
    const currentFolder = activeFolderId ? folders.find(f => f.id === activeFolderId) : null;

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-indigo-600" size={40} />
                    <p className="text-zinc-500 font-medium animate-pulse">Loading Materials Hub...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FB]">
            {/* Hero Section */}
            <header className="relative bg-[#313851] pt-24 pb-32 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20 text-white/80 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-md"
                    >
                        <BookOpen size={14} />
                        Exclusive Resources
                    </motion.div>
                    
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-black text-white tracking-tight mb-2"
                    >
                        Preparation Hub
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-indigo-300/60 text-[10px] font-black uppercase tracking-[0.5em] mb-8 block"
                    >
                        Materials you won't find anywhere else
                    </motion.p>
                    
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg text-zinc-400 max-w-2xl mx-auto mb-12 font-medium"
                    >
                        Access technical guides, preparation materials, and proven strategies for top tech companies.
                    </motion.p>
                    
                    {/* Search Bar */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-2xl mx-auto relative group"
                    >
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-zinc-400 group-focus-within:text-white transition-colors">
                            <Search size={20} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search by company, topic, or role..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-14 pr-6 py-5 bg-white/10 border border-white/20 rounded-3xl shadow-2xl text-white placeholder-white/40 focus:ring-4 focus:ring-white/10 focus:outline-none transition-all text-lg font-medium backdrop-blur-md"
                        />
                    </motion.div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[120px] -mr-96 -mt-96" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[100px] -ml-48 -mb-48" />
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 -mt-16 pb-24 relative z-20">
                
                {/* Navigation / Breadcrumbs */}
                <div className="flex items-center gap-4 mb-8">
                    {!isSearching && activeFolderId && (
                        <button 
                            onClick={() => setActiveFolderId(null)}
                            className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-zinc-100 shadow-sm text-[#313851] font-bold text-sm hover:bg-zinc-50 transition-all"
                        >
                            <ArrowLeft size={16} />
                            Back to Hub
                        </button>
                    )}
                    <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md border border-white/20 shadow-sm">
                        <Folder size={12} className="text-indigo-400" />
                        Materials Hub
                        {currentFolder && (
                            <>
                                <ChevronRight size={12} />
                                <span className="text-white">{currentFolder.name}</span>
                            </>
                        )}
                        {isSearching && (
                            <>
                                <ChevronRight size={12} />
                                <span className="text-white">Search Results</span>
                            </>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {!isSearching && activeFolderId === null ? (
                        /* FOLDERS GRID */
                        <motion.div 
                            key="folders-grid"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                        >
                            {folders.length === 0 ? (
                                <div className="col-span-full bg-white rounded-[2rem] p-20 text-center border border-zinc-100 shadow-sm">
                                    <Folder size={48} className="text-zinc-200 mx-auto mb-4" />
                                    <h3 className="text-xl font-bold text-zinc-900">No Folders Created</h3>
                                    <p className="text-zinc-500">Contact an admin to add company-specific training folders.</p>
                                </div>
                            ) : (
                                folders.map((folder, idx) => {
                                    const materialCount = materials.filter(m => m.folder_id === folder.id).length;
                                    return (
                                        <motion.div 
                                            key={folder.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            onClick={() => setActiveFolderId(folder.id)}
                                            className="group relative bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-xl shadow-zinc-200/40 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
                                        >
                                            <div className="relative z-10">
                                                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300 shadow-inner">
                                                    <Folder size={28} />
                                                </div>
                                                <h3 className="text-xl font-bold text-[#313851] mb-2">{folder.name}</h3>
                                                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                                                    {materialCount} Resources available
                                                </p>
                                            </div>
                                            {/* Decorative Folder Tab */}
                                            <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-bl-[3rem] -mr-4 -mt-4 transition-all group-hover:bg-indigo-500/10 group-hover:w-20 group-hover:h-20" />
                                        </motion.div>
                                    );
                                })
                            )}
                            
                            {/* "All Materials" or "Unorganized" card if there are files not in folders */}
                            {materials.filter(m => !m.folder_id).length > 0 && (
                                <motion.div 
                                    onClick={() => setActiveFolderId('')}
                                    className="bg-[#313851]/5 border-2 border-dashed border-[#313851]/10 p-8 rounded-[2rem] flex flex-col items-center justify-center text-center hover:bg-[#313851]/10 transition-all cursor-pointer"
                                >
                                    <FileText size={32} className="text-[#313851] mb-4 opacity-40" />
                                    <h3 className="text-lg font-bold text-[#313851]">General Materials</h3>
                                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">
                                        {materials.filter(m => !m.folder_id).length} Documents
                                    </p>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        /* MATERIALS LIST */
                        <motion.div 
                            key="materials-list"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                        >
                            {filteredMaterials.length === 0 ? (
                                <div className="col-span-full bg-white rounded-[2rem] p-20 text-center border border-zinc-100 shadow-xl">
                                    <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                        <Search size={40} className="text-zinc-300" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-zinc-900">No results found</h3>
                                    <p className="text-zinc-500 mt-2 text-lg">We couldn't find any materials in this section.</p>
                                    <button 
                                        onClick={() => { setActiveFolderId(null); setSearchQuery(''); }}
                                        className="mt-8 text-indigo-600 font-bold hover:underline"
                                    >
                                        Go back to folders
                                    </button>
                                </div>
                            ) : (
                                filteredMaterials.map((doc, idx) => (
                                    <motion.div 
                                        key={doc.id}
                                        onClick={() => navigate(`/materials/view/${doc.id}`, { state: { material: doc } })}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group relative flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-zinc-100 shadow-xl shadow-zinc-200/50 hover:shadow-2xl hover:shadow-[#313851]/10 hover:-translate-y-2 transition-all duration-300 cursor-pointer"
                                    >
                                        {/* Card Header */}
                                        <div className="p-8 pb-4 flex items-start justify-between">
                                            <CompanyLogo 
                                                company={{ 
                                                    name: doc.company_name,
                                                    slug: doc.company_name?.toLowerCase().replace(/\s+/g, '-')
                                                }} 
                                                className="w-14 h-14 group-hover:scale-110 transition-transform duration-500" 
                                            />
                                            <div className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-zinc-200">
                                                {doc.file_url.endsWith('.pdf') ? 'PDF Guide' : 'Document'}
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="p-8 pt-4 flex-1">
                                            <div className="text-[10px] font-black text-[#313851] uppercase tracking-widest mb-2 opacity-60">
                                                {doc.company_name} Preparation
                                            </div>
                                            <h3 className="text-xl font-bold text-[#313851] leading-tight mb-4 line-clamp-2">
                                                {doc.title}
                                            </h3>
                                            
                                            <div className="flex items-center gap-4 mt-auto">
                                                <div className="p-3 bg-zinc-50 rounded-2xl text-zinc-400 group-hover:bg-[#313851] group-hover:text-white transition-colors">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">Resource Type</p>
                                                    <p className="text-xs font-bold text-zinc-900">Preparation Kit</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Card Footer */}
                                        <div className="px-8 py-6 bg-zinc-50/50 border-t border-zinc-50 flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                                                {new Date(doc.created_at).toLocaleDateString()}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-[#313851] font-bold text-xs group-hover:gap-2 transition-all">
                                                View Guide <ChevronRight size={14} />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default InterviewMaterialsPage;
