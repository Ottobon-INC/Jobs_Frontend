import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Download, Loader2, AlertCircle, FileText, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchInterviewMaterialById } from '../../api/interviewMaterialsApi';
import { CompanyLogo } from '../../components/new-grad/CompanyLogo';
import toast from 'react-hot-toast';

const MaterialViewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    const [material, setMaterial] = useState(location.state?.material || null);
    const [loading, setLoading] = useState(!location.state?.material);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!material) {
            loadMaterial();
        }
    }, [id]);

    const loadMaterial = async () => {
        try {
            setLoading(true);
            const data = await fetchInterviewMaterialById(id);
            setMaterial(data);
        } catch (err) {
            console.error('Failed to fetch material:', err);
            setError('We couldn\'t load this document. It might have been moved or deleted.');
            toast.error('Failed to load document');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (material?.file_url) {
            window.open(material.file_url, '_blank');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0F1117] flex flex-col items-center justify-center">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-6"
                >
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-indigo-500/20 rounded-full animate-pulse" />
                        <Loader2 className="absolute top-0 left-0 animate-spin text-indigo-500" size={80} strokeWidth={1} />
                    </div>
                    <p className="text-zinc-400 font-medium tracking-wide">Retrieving Document...</p>
                </motion.div>
            </div>
        );
    }

    if (error || !material) {
        return (
            <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center p-6">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-white rounded-[2.5rem] p-10 text-center shadow-2xl border border-zinc-100"
                >
                    <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <AlertCircle size={40} className="text-red-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-zinc-900 mb-2">Oops! Something went wrong</h3>
                    <p className="text-zinc-500 mb-8 leading-relaxed">{error || 'The requested document could not be found.'}</p>
                    <button 
                        onClick={() => navigate('/materials')}
                        className="w-full py-4 bg-[#313851] text-white rounded-2xl font-bold hover:bg-[#313851]/90 transition-colors"
                    >
                        Return to Hub
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col bg-[#0F1117] overflow-hidden">
            {/* Premium Header */}
            <header className="h-20 flex items-center justify-between px-6 bg-[#161922] border-b border-white/5 relative z-30">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={() => navigate('/materials')}
                        className="p-2.5 hover:bg-white/5 rounded-xl text-zinc-400 hover:text-white transition-all group"
                    >
                        <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="h-10 w-px bg-white/10 mx-2" />
                    <div className="flex items-center gap-4">
                        <CompanyLogo 
                            company={{ 
                                name: material.company_name,
                                slug: material.company_name?.toLowerCase().replace(/\s+/g, '-')
                            }} 
                            className="w-10 h-10 rounded-xl"
                        />
                        <div>
                            <h1 className="text-white font-bold text-lg leading-none mb-1 line-clamp-1 max-w-md">
                                {material.title}
                            </h1>
                            <p className="text-zinc-500 text-xs font-medium uppercase tracking-widest">
                                {material.company_name} Preparation Kit
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => toast.success('Link copied to clipboard')}
                        className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-xl font-bold text-sm transition-all"
                    >
                        <Share2 size={16} /> Share
                    </button>
                    <button 
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all"
                    >
                        <Download size={16} /> Download
                    </button>
                </div>
            </header>

            {/* Viewer Section */}
            <main className="flex-1 relative bg-[#0F1117]">
                <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none opacity-20">
                    <FileText size={120} className="text-white/10" />
                </div>
                
                {/* PDF iframe */}
                <iframe 
                    src={`${material.file_url}#toolbar=1`}
                    className="w-full h-full border-none relative z-20"
                    title={material.title}
                />
            </main>
        </div>
    );
};

export default MaterialViewPage;
