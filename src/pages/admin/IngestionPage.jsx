import { useState, useEffect, useRef } from 'react';
import { triggerIngestion, getScrapingLogs } from '../../api/adminApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { Download, RefreshCw, AlertOctagon, Database, Power, Play, Terminal, XCircle, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Live Terminal Console Component ───────────────────────────────────────────
const TerminalConsole = ({ source, triggerTime, onClose }) => {
    const [logs, setLogs] = useState([]);
    const [scraperStates, setScraperStates] = useState({});
    const [isPolling, setIsPolling] = useState(true);
    const terminalEndRef = useRef(null);
    const pollIntervalRef = useRef(null);

    const targetScrapers = source === 'all' 
        ? ['deloitte', 'pwc', 'kpmg', 'ey', 'generic']
        : [source];

    // Initialize console and states
    useEffect(() => {
        const initialStates = {};
        targetScrapers.forEach(s => {
            initialStates[s] = { status: 'pending', found: 0, new: 0, skipped: 0, error: null };
        });
        setScraperStates(initialStates);

        const timestamp = new Date().toLocaleTimeString();
        setLogs([
            `[${timestamp}] ⚙️ SYSTEM: Bootstrapping scraping engine...`,
            `[${timestamp}] ⚙️ SYSTEM: Connection established to background task worker.`,
            `[${timestamp}] ⚙️ SYSTEM: Targeting source(s): ${targetScrapers.map(s => s.toUpperCase()).join(', ')}`,
            `[${timestamp}] 🚀 EXEC: python -m scraper.engine --source=${source}`
        ]);

        // Start polling
        startPolling();

        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, [source, triggerTime]);

    // Auto scroll terminal to bottom
    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs, scraperStates]);

    const startPolling = () => {
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

        pollIntervalRef.current = setInterval(async () => {
            try {
                // Fetch the last 20 logs
                const recentLogs = await getScrapingLogs(20);
                
                setScraperStates(prev => {
                    const next = { ...prev };
                    let allFinished = true;

                    targetScrapers.forEach(scraper => {
                        // Find the log entry for this scraper started after triggerTime
                        const match = recentLogs.find(log => 
                            log.source_name.toLowerCase() === scraper.toLowerCase() &&
                            new Date(log.started_at).getTime() >= triggerTime - 10000 // 10s window to handle skew
                        );

                        const current = next[scraper];

                        if (match) {
                            const matchTime = new Date().toLocaleTimeString();
                            
                            // Check for status transition to print log lines
                            if (current.status !== match.status) {
                                if (match.status === 'running') {
                                    addLogLine(`[${matchTime}] 🔄 SCRAPER: ${scraper.toUpperCase()} is now running.`);
                                } else if (match.status === 'success') {
                                    addLogLine(`[${matchTime}] ✅ SUCCESS: ${scraper.toUpperCase()} completed. Found: ${match.jobs_found}, New: ${match.jobs_new}, Skipped: ${match.jobs_skipped}`);
                                } else if (match.status === 'failed' || match.status === 'partial') {
                                    addLogLine(`[${matchTime}] ❌ ERROR: ${scraper.toUpperCase()} finished with status: ${match.status.toUpperCase()}. Message: ${match.error_message || 'None'}`);
                                }
                            }

                            next[scraper] = {
                                status: match.status,
                                found: match.jobs_found || 0,
                                new: match.jobs_new || 0,
                                skipped: match.jobs_skipped || 0,
                                error: match.error_message
                            };
                        } else {
                            // If still not in logs, simulate starting delay
                            if (current.status === 'pending') {
                                next[scraper] = { ...current, status: 'initializing' };
                                addLogLine(`[${new Date().toLocaleTimeString()}] ⚙️ SYSTEM: Initializing job stream for ${scraper.toUpperCase()}...`);
                            }
                        }

                        // Determine if we keep polling
                        const s = next[scraper].status;
                        if (s === 'pending' || s === 'initializing' || s === 'running') {
                            allFinished = false;
                        }
                    });

                    if (allFinished) {
                        setIsPolling(false);
                        clearInterval(pollIntervalRef.current);
                        addLogLine(`[${new Date().toLocaleTimeString()}] ⚙️ SYSTEM: Ingestion task completed. Connection closed.`);
                    }

                    return next;
                });
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 1500);
    };

    const addLogLine = (line) => {
        setLogs(prev => [...prev, line]);
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-[#131520] text-[#F5F3EE]/40 border border-[#313851]/40';
            case 'initializing': return 'bg-amber-950/80 text-amber-300 border border-amber-900/30 animate-pulse';
            case 'running': return 'bg-sky-950/80 text-sky-300 border border-sky-900/30 animate-pulse';
            case 'success': return 'bg-emerald-950/80 text-emerald-300 border border-emerald-900/30';
            case 'failed': return 'bg-rose-950/80 text-rose-300 border border-rose-900/30';
            case 'partial': return 'bg-amber-950/80 text-amber-300 border border-amber-900/30';
            default: return 'bg-[#131520] text-[#F5F3EE]/30';
        }
    };

    return (
        <div className="mt-12 bg-[#1C1A17] rounded-2xl border border-[#313851] shadow-2xl p-6 font-mono text-[11px] text-[#F5F3EE]/80 flex flex-col min-h-[450px]">
            {/* macOS Style Window Chrome */}
            <div className="flex items-center justify-between border-b border-[#313851] pb-4 mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80 cursor-pointer" onClick={onClose} />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <div className="text-[10px] text-[#F5F3EE]/40 flex items-center gap-2 font-bold uppercase tracking-wider">
                    <Terminal size={12} className="text-[#F5F3EE]/30" />
                    root@ottobon-scraper:~
                </div>
                <button onClick={onClose} className="text-[#F5F3EE]/40 hover:text-white transition-colors">
                    <XCircle size={16} />
                </button>
            </div>

            {/* Dashboard / Status Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 p-4 bg-[#131520]/60 border border-[#313851]/30 rounded-xl">
                {Object.entries(scraperStates).map(([scraper, details]) => (
                    <div key={scraper} className="flex flex-col gap-1.5 p-2.5 rounded-lg bg-[#1C1A17]/60 border border-[#313851]/20">
                        <span className="font-bold text-[#F5F3EE] uppercase text-[9px] tracking-wider">{scraper}</span>
                        <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded text-center w-max ${getStatusBadgeColor(details.status)}`}>
                            {details.status}
                        </span>
                        <div className="text-[9px] text-[#F5F3EE]/45 mt-1 flex flex-col gap-0.5">
                            <span>Found: <strong className="text-[#F5F3EE]/80">{details.found}</strong></span>
                            <span>New: <strong className="text-[#4ADE80]">{details.new}</strong></span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Output log */}
            <div className="flex-1 overflow-y-auto max-h-60 mb-4 pr-2 space-y-1.5 scrollbar-thin scrollbar-thumb-[#313851] scrollbar-track-transparent">
                {logs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed break-all whitespace-pre-wrap">
                        {log.includes('✅') && <span className="text-emerald-400">{log}</span>}
                        {log.includes('❌') && <span className="text-rose-400">{log}</span>}
                        {log.includes('🔄') && <span className="text-[#60A5FA]">{log}</span>}
                        {log.includes('🚀') && <span className="text-amber-400">{log}</span>}
                        {!log.includes('✅') && !log.includes('❌') && !log.includes('🔄') && !log.includes('🚀') && log}
                    </div>
                ))}
                <div ref={terminalEndRef} />
            </div>

            {/* Terminal Footer Info */}
            <div className="border-t border-[#313851] pt-4 flex justify-between items-center text-[10px] text-[#F5F3EE]/40">
                <div className="flex items-center gap-2">
                    {isPolling ? (
                        <>
                            <RefreshCw size={12} className="animate-spin text-[#60A5FA]" />
                            <span>Tailing engine logs...</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle size={12} className="text-emerald-400" />
                            <span>Logs terminated.</span>
                        </>
                    )}
                </div>
                <div>
                    Type: <span className="text-[#F5F3EE]/60">{source.toUpperCase()}</span>
                </div>
            </div>
        </div>
    );
};

const IngestionPage = () => {
    const [loading, setLoading] = useState(null);
    const [activeSession, setActiveSession] = useState(null);
    const [error, setError] = useState(null);

    const handleIngest = async (source) => {
        setLoading(source);
        setError(null);
        setActiveSession(null);

        try {
            const data = await triggerIngestion(source);
            // Trigger was accepted. Now launch live terminal logging.
            setActiveSession({
                source,
                triggerTime: Date.now()
            });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'INGESTION_FAILURE');
        } finally {
            setLoading(null);
        }
    };

    const sources = [
        { id: 'deloitte', name: 'Deloitte', pattern: 'bg-[#1C1A17] text-white' },
        { id: 'pwc', name: 'PwC', pattern: 'bg-white border border-zinc-200 text-zinc-900' },
        { id: 'kpmg', name: 'KPMG', pattern: 'bg-zinc-50 text-zinc-600' },
        { id: 'ey', name: 'EY', pattern: 'bg-[#1C1A17] text-white font-medium' },
        { id: 'generic', name: 'Generic GCC', pattern: 'bg-zinc-800 text-white' }
    ];

    return (
        <div className="max-w-6xl mx-auto py-10 sm:py-20 px-4 sm:px-8 bg-[#F5F3EE] min-h-screen">
            <header className="mb-10 sm:mb-20 border-b border-[#E2DDD6] pb-8 sm:pb-12">
                <h1 className="text-3xl sm:text-4xl font-sans font-bold text-[#1C1A17] tracking-tight flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                    <div className="w-16 h-16 bg-[#1C1A17] rounded-2xl grid place-items-center shadow-lg shadow-[#1C1A17]/20 shrink-0">
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
                            <Power size={32} className="text-[#1C1A17]/60" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-sans font-bold text-[#1C1A17] tracking-tight">Global System Update</h3>
                            <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-2 leading-relaxed">Synchronize all configured sources</p>
                        </div>
                    </div>
                    <button
                        disabled={loading !== null}
                        onClick={() => handleIngest('all')}
                        className="w-full md:w-auto bg-[#1C1A17] text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl font-bold text-[11px] uppercase tracking-[0.3em] hover:bg-[#1C1A17]/90 transition-all flex items-center justify-center gap-4 shadow-xl shadow-[#1C1A17]/10 disabled:opacity-30 active:scale-95"
                    >
                        <RefreshCw size={20} className={loading === 'all' ? 'animate-spin' : ''} />
                        {loading === 'all' ? "Processing..." : "Start Global Update"}
                    </button>
                </div>

                {sources.map(source => (
                    <div key={source.id} className="bg-white border border-[#E2DDD6] rounded-3xl p-8 flex flex-col items-center text-center hover:shadow-2xl hover:shadow-[#1C1A17]/5 transition-all duration-500 group">
                        <div className={`w-16 h-16 rounded-2xl mx-auto mb-8 grid place-items-center font-bold text-xl shadow-sm transition-all group-hover:scale-110 ${source.id === 'deloitte' || source.id === 'ey' ? 'bg-[#1C1A17] text-white' : 'bg-white border border-[#E2DDD6] text-[#1C1A17]'}`}>
                            {source.name.charAt(0)}
                        </div>
                        <h3 className="text-xl font-sans font-bold text-[#1C1A17] tracking-tight mb-8 uppercase">{source.name}</h3>
                        <button
                            disabled={loading !== null}
                            onClick={() => handleIngest(source.id)}
                            className="w-full bg-[#F5F3EE] border border-[#E2DDD6] text-[#1C1A17]/60 py-4 rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[#1C1A17] hover:text-white transition-all flex items-center justify-center gap-3 disabled:opacity-30"
                        >
                            {loading === source.id ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                            Scrape Jobs
                        </button>
                    </div>
                ))}
            </motion.div>

            <AnimatePresence>
                {activeSession && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    >
                        <TerminalConsole 
                            source={activeSession.source}
                            triggerTime={activeSession.triggerTime}
                            onClose={() => setActiveSession(null)}
                        />
                    </motion.div>
                )}

                {error && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-16 bg-[#1C1A17] text-white border border-[#E2DDD6] rounded-3xl p-8 overflow-hidden shadow-2xl"
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
