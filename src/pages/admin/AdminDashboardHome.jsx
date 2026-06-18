import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getUserStats, getActiveSessions, getScrapingLogs } from '../../api/adminApi';
import { getAdminMockInterviewReviews } from '../../api/mockInterviewApi';
import Loader from '../../components/ui/Loader';
import { 
    Users, Radio, Database, ShieldAlert, ChevronRight, 
    RefreshCw, LayoutDashboard, CheckCircle2, XCircle, AlertTriangle, ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminDashboardHome = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [activeSessions, setActiveSessions] = useState([]);
    const [mockInterviews, setMockInterviews] = useState([]);
    const [scrapingLogs, setScraperLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        else setRefreshing(true);

        try {
            const [statsData, sessionsData, mockData, logsData] = await Promise.all([
                getUserStats(),
                getActiveSessions(),
                getAdminMockInterviewReviews({ status: 'pending_review' }),
                getScrapingLogs(10)
            ]);

            setStats(statsData);
            setActiveSessions(sessionsData || []);
            setMockInterviews(mockData || []);
            setScraperLogs(logsData || []);
        } catch (err) {
            console.error("Failed to load dashboard home stats:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <Loader fullScreen variant="logo" />;

    return (
        <div className="max-w-[1600px] mx-auto pt-6 pb-12 px-4 sm:px-6 md:px-10 bg-transparent min-h-screen">
            {/* Header */}
            <header className="mb-10 border-b border-zinc-100 pb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div>
                    <h1 className="text-3xl sm:text-4xl font-sans font-bold text-zinc-900 tracking-tight flex items-center gap-4">
                        <div className="w-14 h-14 bg-zinc-900 rounded-2xl grid place-items-center shadow-lg shadow-zinc-900/20 shrink-0">
                            <LayoutDashboard size={28} className="text-white" />
                        </div>
                        Admin Command Center
                    </h1>
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mt-4 ml-1">
                        Global System Overview & Operations Hub
                    </p>
                </div>
                <button
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                    className="p-4 bg-white border border-zinc-100 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-2xl transition-all shadow-sm disabled:opacity-30 self-end sm:self-auto"
                >
                    <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
                </button>
            </header>

            {/* Quick KPI Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Link to="/admin/tower" className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm hover:scale-[1.02] transition-all duration-300 flex items-center justify-between group">
                    <div>
                        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Total Registered</p>
                        <h3 className="text-3xl font-extrabold text-zinc-900 mt-2">{stats?.total_users || 0}</h3>
                    </div>
                    <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-xl grid place-items-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
                        <Users size={20} />
                    </div>
                </Link>

                <Link to="/admin/tower" className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm hover:scale-[1.02] transition-all duration-300 flex items-center justify-between group">
                    <div>
                        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Registered Seekers</p>
                        <h3 className="text-3xl font-extrabold text-zinc-900 mt-2">{stats?.total_seekers || 0}</h3>
                    </div>
                    <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-xl grid place-items-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
                        <Users size={20} className="opacity-75" />
                    </div>
                </Link>

                <Link to="/admin/tower" className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm hover:scale-[1.02] transition-all duration-300 flex items-center justify-between group">
                    <div>
                        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Active Chat Sessions</p>
                        <h3 className="text-3xl font-extrabold text-zinc-900 mt-2">{activeSessions.length || 0}</h3>
                    </div>
                    <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-xl grid place-items-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
                        <Radio size={20} className="animate-pulse" />
                    </div>
                </Link>

                <Link to="/admin/interview-reviews" className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm hover:scale-[1.02] transition-all duration-300 flex items-center justify-between group">
                    <div>
                        <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">Pending Reviews</p>
                        <h3 className="text-3xl font-extrabold text-zinc-900 mt-2">{mockInterviews.length || 0}</h3>
                    </div>
                    <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-xl grid place-items-center text-zinc-900 group-hover:bg-zinc-900 group-hover:text-white transition-all duration-300">
                        <ShieldAlert size={20} />
                    </div>
                </Link>
            </div>

            {/* Split Operations Grid */}
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Active Mock Interviews (2 Cols) */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border border-zinc-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6 border-b border-zinc-50 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900">Pending Mock Interviews</h3>
                                <p className="text-xs text-zinc-400 mt-1">Interviews awaiting expert evaluation</p>
                            </div>
                            <Link to="/admin/interview-reviews" className="text-xs font-bold text-zinc-900 hover:underline flex items-center gap-1">
                                View All <ChevronRight size={14} />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {mockInterviews.length === 0 ? (
                                <div className="text-center py-16 bg-zinc-50/50 border border-dashed border-zinc-200 rounded-2xl">
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">No mock interviews pending review</p>
                                </div>
                            ) : (
                                mockInterviews.slice(0, 5).map((interview) => (
                                    <div key={interview.interview_id || interview.id} className="p-4 border border-zinc-100 rounded-2xl flex justify-between items-center hover:bg-zinc-50/50 transition-colors duration-300">
                                        <div>
                                            <p className="font-bold text-zinc-900 text-sm">{interview.user_full_name || interview.user_name || 'Anonymous Seeker'}</p>
                                            <p className="text-xs text-zinc-400 mt-1">
                                                {interview.job_title || 'General Round'} {interview.company_name ? `at ${interview.company_name}` : ''}
                                            </p>
                                            <p className="text-[10px] text-zinc-300 font-mono mt-1">
                                                Submitted: {interview.created_at ? new Date(interview.created_at).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/admin/interview-reviews`)}
                                            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                                        >
                                            Review <ArrowRight size={12} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Scraping Log Hub (1 Col) */}
                <div className="space-y-6">
                    <div className="bg-white border border-zinc-100 rounded-3xl p-6 sm:p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6 border-b border-zinc-50 pb-4">
                            <div>
                                <h3 className="text-lg font-bold text-zinc-900">Scraper Status</h3>
                                <p className="text-xs text-zinc-400 mt-1">Live data extraction logs</p>
                            </div>
                            <Link to="/admin/ingest" className="text-xs font-bold text-zinc-900 hover:underline flex items-center gap-1">
                                Trigger <ChevronRight size={14} />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {scrapingLogs.length === 0 ? (
                                <div className="text-center py-16 bg-zinc-50/50 border border-dashed border-zinc-200 rounded-2xl">
                                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">No scraping history logged</p>
                                </div>
                            ) : (
                                scrapingLogs.slice(0, 5).map((log) => (
                                    <div key={log.id} className="p-4 border border-zinc-100 rounded-2xl flex flex-col gap-2 hover:bg-zinc-50/50 transition-colors duration-300">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold text-zinc-900 text-xs uppercase tracking-wider">{log.source_name}</span>
                                            <span className={`inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                                                log.status === 'success' ? 'bg-green-50 text-green-700' :
                                                log.status === 'failed' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                                            }`}>
                                                {log.status === 'success' ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
                                                {log.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-[10px] text-zinc-400 font-medium">
                                            <span>New: <b className="text-zinc-700 font-bold">{log.jobs_new}</b></span>
                                            <span>Skipped: <b className="text-zinc-500">{log.jobs_skipped}</b></span>
                                            <span>Found: <b className="text-zinc-600">{log.jobs_found}</b></span>
                                        </div>
                                        <div className="text-[9px] text-zinc-300 font-mono flex items-center justify-between border-t border-zinc-50 pt-2 mt-1">
                                            <span>{new Date(log.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            {log.finished_at && (
                                                <span>Duration: {Math.max(0, Math.round((new Date(log.finished_at) - new Date(log.started_at)) / 1000))}s</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardHome;
