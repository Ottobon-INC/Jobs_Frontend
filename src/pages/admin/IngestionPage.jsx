import { useState } from 'react';
import { triggerIngestion } from '../../api/adminApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Download, RefreshCw, CheckCircle, AlertOctagon, Database, Power, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const IngestionPage = () => {
    const [loading, setLoading] = useState(null);
    const [results, setResults] = useState(null);
    const [error, setError] = useState(null);

    const handleIngest = async (source) => {
        setLoading(source);
        setResults(null);
        setError(null);

        try {
            const data = await triggerIngestion(source);
            setResults(data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'INGESTION_FAILURE');
        } finally {
            setLoading(null);
        }
    };

    const sources = [
        { id: 'deloitte', name: 'Deloitte', pattern: 'bg-zinc-900 text-white' },
        { id: 'pwc', name: 'PwC', pattern: 'bg-white border border-zinc-200 text-zinc-900' },
        { id: 'kpmg', name: 'KPMG', pattern: 'bg-zinc-50 text-zinc-600' },
        { id: 'ey', name: 'EY', pattern: 'bg-zinc-900 text-white font-medium' },
        { id: 'generic', name: 'Generic GCC', pattern: 'bg-zinc-800 text-white' }
    ];

    return (
        <div className="max-w-6xl mx-auto py-10 sm:py-20 px-4 sm:px-8 bg-[#F5F3EE] min-h-screen">
            <header className="mb-10 sm:mb-20 border-b border-[#E2DDD6] pb-8 sm:pb-12">
                <h1 className="text-3xl sm:text-4xl font-sans font-bold text-[#1C1F2E] tracking-tight flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div className="w-16 h-16 bg-[#1C1F2E] rounded-2xl grid place-items-center shadow-lg shadow-[#1C1F2E]/20 shrink-0">
                        <Database size={32} className="text-white" />
                    </div>
                    Data Management
                </h1>
                <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] sm:tracking-[0.4em] mt-4 sm:mt-6 ml-1 leading-relaxed">
                    System Data Import & External Scrapers
                </p>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                <div className="md:col-span-2 lg:col-span-3 bg-white border border-[#E2DDD6] rounded-3xl p-6 sm:p-8 shadow-xl shadow-zinc-900/5 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 text-center sm:text-left w-full sm:w-auto">
                        <div className="w-16 h-16 bg-[#F5F3EE] border border-[#E2DDD6] rounded-2xl grid place-items-center shrink-0">
                            <Power size={32} className="text-[#1C1F2E]/60" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-sans font-bold text-[#1C1F2E] tracking-tight">Global System Update</h3>
                            <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-2 leading-relaxed">Synchronize all configured sources</p>
                        </div>
                    </div>
                    <button
                        disabled={loading !== null}
                        onClick={() => handleIngest('all')}
                        className="w-full md:w-auto bg-[#1C1F2E] text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-bold text-[11px] uppercase tracking-[0.3em] hover:bg-[#1C1F2E]/90 transition-all flex items-center justify-center gap-4 shadow-xl shadow-[#1C1F2E]/10 disabled:opacity-30 active:scale-95"
                    >
                        <RefreshCw size={20} className={loading === 'all' ? 'animate-spin' : ''} />
                        {loading === 'all' ? "Processing..." : "Start Global Update"}
                    </button>
                </div>

                {sources.map(source => (
                    <div key={source.id} className="bg-white border border-[#E2DDD6] rounded-3xl p-8 flex flex-col items-center text-center hover:shadow-2xl hover:shadow-[#1C1F2E]/5 transition-all duration-500 group">
                        <div className={`w-16 h-16 rounded-2xl mx-auto mb-8 grid place-items-center font-bold text-xl shadow-sm transition-all group-hover:scale-110 ${source.id === 'deloitte' || source.id === 'ey' ? 'bg-[#1C1F2E] text-white' : 'bg-white border border-[#E2DDD6] text-[#1C1F2E]'}`}>
                            {source.name.charAt(0)}
                        </div>
                        <h3 className="text-xl font-sans font-bold text-[#1C1F2E] tracking-tight mb-8 uppercase">{source.name}</h3>
                        <button
                            disabled={loading !== null}
                            onClick={() => handleIngest(source.id)}
                            className="w-full bg-[#F5F3EE] border border-[#E2DDD6] text-[#1C1F2E]/60 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#1C1F2E] hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                        >
                            {loading === source.id ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                            Scrape Jobs
                        </button>
                    </div>
                ))}
            </motion.div>

            <AnimatePresence>
                {results && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                        className="mt-16 bg-white border border-[#E2DDD6] rounded-3xl p-10 shadow-xl shadow-zinc-900/5 flex flex-col items-center text-center relative overflow-hidden"
                    >
                        {/* Elegant dot overlay for subtle texture */}
                        <div 
                            className="absolute inset-0 opacity-[0.03] pointer-events-none"
                            style={{
                                backgroundImage: `radial-gradient(#1C1F2E 1px, transparent 1px)`,
                                backgroundSize: '16px 16px'
                            }}
                        />

                        {/* Large, animated Checkmark Circle */}
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
                            className="w-20 h-20 rounded-full bg-[#1C1F2E] flex items-center justify-center text-white mb-8 shadow-xl shadow-[#1C1F2E]/15 relative z-10"
                        >
                            <CheckCircle size={40} className="stroke-[2.5]" />
                        </motion.div>

                        <div className="relative z-10 max-w-lg">
                            <h3 className="text-3xl font-sans font-bold text-[#1C1F2E] tracking-tight mb-4">
                                Ingestion Started Successfully
                            </h3>
                            <p className="text-zinc-500 font-medium text-sm leading-relaxed mb-8">
                                The scraper was successfully triggered in the backend. System update processes are running asynchronously. All configured job sources are now syncing live.
                            </p>
                        </div>

                        {/* Meta status details */}
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="w-full max-w-md bg-[#F5F3EE] border border-[#E2DDD6] p-6 rounded-2xl flex flex-col items-center gap-3 relative z-10"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Job Engine Status</span>
                                <span className="text-[9px] font-bold text-white bg-[#1C1F2E] px-3 py-1 rounded-full uppercase tracking-wider">
                                    {results.status || "RUNNING"}
                                </span>
                            </div>
                            <div className="w-full h-px bg-[#E2DDD6]" />
                            <p className="text-xs font-semibold text-[#1C1F2E] text-center">
                                {results.message || "Manual scraping trigger initiated."}
                            </p>
                            
                            {/* Animated heartbeat/scanning line */}
                            <div className="w-2/3 h-1.5 bg-[#E2DDD6] rounded-full overflow-hidden relative mt-1">
                                <motion.div 
                                    className="absolute inset-y-0 left-0 bg-[#1C1F2E] rounded-full w-1/3"
                                    animate={{ 
                                        left: ["-30%", "110%"],
                                    }}
                                    transition={{
                                        repeat: Infinity,
                                        duration: 1.8,
                                        ease: "easeInOut"
                                    }}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-16 bg-[#1C1F2E] text-white border border-[#E2DDD6] rounded-3xl p-8 overflow-hidden shadow-2xl"
                    >
                        <h3 className="text-2xl font-sans font-bold text-white mb-6 flex items-center gap-4 uppercase tracking-tighter">
                            <AlertOctagon size={32} className="text-red-400" /> Import Error
                        </h3>
                        <p className="text-[11px] font-mono font-bold uppercase tracking-[0.3em] opacity-80">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default IngestionPage;
