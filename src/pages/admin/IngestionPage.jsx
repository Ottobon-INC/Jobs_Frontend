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
        { id: 'deloitte', name: 'Deloitte', pattern: 'bg-black text-white' },
        { id: 'pwc', name: 'PwC', pattern: 'bg-white border-4 border-black text-black' },
        { id: 'kpmg', name: 'KPMG', pattern: 'bg-gray-100 text-black' },
        { id: 'ey', name: 'EY', pattern: 'bg-black text-white italic' },
        { id: 'generic', name: 'Generic GCC', pattern: 'bg-gradient-to-br from-black to-gray-700 text-white' }
    ];

    return (
        <div className="max-w-5xl mx-auto py-16 px-8 bg-white min-h-screen">
            <header className="mb-16 border-b-4 border-black pb-10">
                <h1 className="text-5xl font-display font-black text-black uppercase tracking-tighter flex items-center gap-5">
                    <Database size={48} className="text-black" />
                    Ingestion Layer
                </h1>
                <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.4em] mt-4">
                    Manual Scraper Trigger / Enterprise Data Injection
                </p>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-10"
            >
                <div className="md:col-span-2 lg:col-span-3 bg-white border-4 border-black rounded-[40px] p-12 shadow-[20px_20px_0px_#000] flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-black rounded-3xl grid place-items-center shadow-2xl">
                            <Power size={32} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-display font-black text-black uppercase tracking-tighter">Global Sync</h3>
                            <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em] mt-1">Execute Sequential Signal Sweep</p>
                        </div>
                    </div>
                    <button
                        disabled={loading !== null}
                        onClick={() => handleIngest('all')}
                        className="bg-black text-white px-12 py-6 rounded-2xl font-display font-black text-[11px] uppercase tracking-[0.3em] hover:bg-gray-800 transition-all flex items-center gap-4 shadow-2xl disabled:opacity-30 active:scale-95"
                    >
                        <RefreshCw size={24} className={loading === 'all' ? 'animate-spin' : ''} />
                        {loading === 'all' ? "Syncing_All..." : "Initialize All"}
                    </button>
                </div>

                {sources.map(source => (
                    <div key={source.id} className="bg-white border-2 border-black rounded-[32px] p-10 flex flex-col items-center text-center hover:shadow-[12px_12px_0px_rgba(0,0,0,0.05)] transition-all duration-300">
                        <div className={`w-16 h-16 rounded-2xl mx-auto mb-8 grid place-items-center font-black text-xl shadow-xl transition-all group-hover:scale-110 ${source.pattern}`}>
                            {source.name.charAt(0)}
                        </div>
                        <h3 className="text-xl font-display font-black text-black uppercase tracking-tighter mb-8">{source.name}</h3>
                        <button
                            disabled={loading !== null}
                            onClick={() => handleIngest(source.id)}
                            className="w-full bg-white border-2 border-black text-black py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-black hover:text-white shadow-lg transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                        >
                            {loading === source.id ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                            Fetch Signal
                        </button>
                    </div>
                ))}
            </motion.div>

            <AnimatePresence>
                {results && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-16 bg-white border-4 border-black rounded-[40px] p-12 overflow-hidden shadow-[24px_24px_0px_rgba(0,0,0,0.03)]"
                    >
                        <h3 className="text-2xl font-display font-black text-black mb-8 flex items-center gap-4 uppercase tracking-tighter">
                            <CheckCircle size={32} /> Sync_Success
                        </h3>
                        <div className="bg-gray-50 border-2 border-black/5 p-8 rounded-3xl overflow-x-auto">
                            <pre className="text-[10px] font-mono font-black text-black/60 leading-relaxed uppercase">
                                {JSON.stringify(results, null, 2)}
                            </pre>
                        </div>
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-16 bg-black text-white border-4 border-black rounded-[40px] p-12 overflow-hidden shadow-[24px_24px_0px_rgba(0,0,0,0.03)]"
                    >
                        <h3 className="text-2xl font-display font-black text-white mb-6 flex items-center gap-4 uppercase tracking-tighter">
                            <AlertOctagon size={32} /> Injection_Null
                        </h3>
                        <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40 italic">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default IngestionPage;
