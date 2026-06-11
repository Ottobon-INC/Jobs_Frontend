/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActiveSessions, getUserStats, getUsers } from '../../api/adminApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { Ear, AlertTriangle, RefreshCw, Zap, Shield, Users, UserCheck, Briefcase, TrendingUp, Search, X, Mail, Phone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const ControlTowerPage = () => {

    const navigate = useNavigate();
    const [sessionId, setSessionId] = useState('');
    const [sessions, setSessions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Member Directory State variables
    const [selectedRole, setSelectedRole] = useState(null);
    const [membersList, setMembersList] = useState([]);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchMembers = async (role) => {
        setLoadingMembers(true);
        try {
            const data = await getUsers(role === 'all' ? null : role);
            setMembersList(data || []);
        } catch (err) {
            console.error("Failed to fetch members:", err);
        } finally {
            setLoadingMembers(false);
        }
    };

    const handleCardClick = (roleType) => {
        setSearchQuery('');
        if (selectedRole === roleType) {
            setSelectedRole(null);
            setMembersList([]);
        } else {
            setSelectedRole(roleType);
            fetchMembers(roleType);
        }
    };

    const fetchData = useCallback(async (isSilent = false) => {
        if (!isSilent) {
            setLoading(true);
        } else {
            setRefreshing(true);
        }

        try {
            const [sessionsData, statsData] = await Promise.all([
                getActiveSessions(),
                getUserStats()
            ]);
            setSessions(sessionsData || []);
            setStats(statsData || null);
            
            if (selectedRole) {
                const membersData = await getUsers(selectedRole === 'all' ? null : selectedRole);
                setMembersList(membersData || []);
            }
        } catch (err) {
            console.error("Failed to fetch admin dashboard data:", err);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedRole]);

    useEffect(() => {
        fetchData(false);
        const interval = setInterval(() => {
            fetchData(true);
        }, 15000);
        return () => clearInterval(interval);
    }, [fetchData]);




    const handleConnect = (e) => {
        e.preventDefault();
        if (!sessionId) return;
        navigate('/admin/helpdesk', { state: { sessionId } });
    };

    const activeAiCount = sessions.filter(s => s.status !== 'active_human').length;
    const humanCount = sessions.filter(s => s.status === 'active_human').length;

    const filteredMembers = membersList.filter(m => {
        const query = searchQuery.toLowerCase();
        const fullName = (m.full_name || '').toLowerCase();
        const email = (m.email || '').toLowerCase();
        return fullName.includes(query) || email.includes(query);
    });

    if (loading) return <Loader fullScreen />;


    return (
        <div className="max-w-[1600px] mx-auto pt-6 pb-12 px-4 sm:px-6 md:px-10 bg-[#FBFBFB] min-h-screen">
            <header className="mb-10 sm:mb-20 border-b border-zinc-100 pb-8 sm:pb-12 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
                <div className="w-full sm:w-auto">
                    <h1 className="text-3xl sm:text-4xl font-sans font-bold text-zinc-900 tracking-tight flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                        <div className="w-16 h-16 bg-zinc-900 card grid place-items-center shadow-lg shadow-zinc-900/20 shrink-0">
                            <Ear size={32} className="text-white" />
                        </div>
                        System Administration
                    </h1>
                    <p className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em] sm:tracking-[0.4em] mt-4 sm:mt-6 ml-1 leading-relaxed">Session Monitoring & Administrative Control</p>
                </div>
                <button
                    onClick={() => fetchData(true)}
                    disabled={refreshing}
                    className="p-4 sm:p-5 bg-white border border-zinc-100 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 rounded-2xl transition-all shadow-sm disabled:opacity-30 self-end sm:self-auto"
                >
                    <RefreshCw size={20} className={refreshing ? 'animate-spin' : ''} />
                </button>
            </header>

            <div className="grid md:grid-cols-2 gap-6 sm:gap-8 mb-10 sm:mb-20">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="bg-white border border-zinc-100 card p-6 sm:p-8 shadow-xl shadow-zinc-900/5 h-full">
                        <h2 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mb-6 sm:mb-10 flex items-center gap-3">
                            <Shield size={16} className="text-zinc-900" /> Connect to Session
                        </h2>
                        <form onSubmit={handleConnect} className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                            <input
                                type="text"
                                placeholder="UUID / SIGNAL_ID"
                                value={sessionId}
                                onChange={(e) => setSessionId(e.target.value)}
                                className="w-full sm:flex-1 bg-zinc-50 border border-zinc-100 rounded-2xl p-4 sm:p-5 text-zinc-900 font-semibold text-sm placeholder:text-zinc-300 focus:outline-none focus:ring-4 focus:ring-zinc-900/5 transition-all tracking-widest"
                            />
                            <button type="submit" className="w-full sm:w-auto bg-zinc-900 text-white px-6 sm:px-10 py-4 sm:py-5 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 shadow-lg shadow-zinc-900/10 transition-all">
                                Connect
                            </button>
                        </form>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div className="bg-zinc-900 card p-6 sm:p-8 shadow-2xl shadow-zinc-900/20 h-full flex items-center justify-between text-white relative overflow-hidden gap-4">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <div className="relative z-10">
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em] mb-3">Active Sessions</p>
                            <p className="text-5xl sm:text-6xl font-sans font-bold tracking-tighter">{activeAiCount}</p>
                        </div>
                        <div className="text-right relative z-10">
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-[0.3em] mb-3 italic">Active Support</p>
                            <p className="text-5xl sm:text-6xl font-sans font-bold tracking-tighter opacity-100">{humanCount}</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* User Statistics Overview */}
            {stats && (
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.15 }}
                    className="mb-10 sm:mb-20 space-y-8"
                >
                    <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5em] ml-2 flex items-center gap-4">
                        <div className="w-1.5 h-6 bg-zinc-900 rounded-full" /> User Metrics & Analytics
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div 
                            onClick={() => handleCardClick('all')}
                            className={`bg-white border p-6 card shadow-xl shadow-zinc-900/5 flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] ${selectedRole === 'all' ? 'ring-2 ring-zinc-900 border-zinc-900 bg-zinc-50/50' : 'border-zinc-100'}`}
                        >
                            <div>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Registered</p>
                                <p className="text-3xl font-extrabold text-zinc-900 mt-2">{stats.total_users}</p>
                            </div>
                            <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-xl grid place-items-center text-zinc-900 shadow-sm">
                                <Users size={20} />
                            </div>
                        </div>

                        <div 
                            onClick={() => handleCardClick('seeker')}
                            className={`bg-white border p-6 card shadow-xl shadow-zinc-900/5 flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] ${selectedRole === 'seeker' ? 'ring-2 ring-zinc-900 border-zinc-900 bg-zinc-50/50' : 'border-zinc-100'}`}
                        >
                            <div>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Seekers</p>
                                <p className="text-3xl font-extrabold text-zinc-900 mt-2">{stats.total_seekers}</p>
                            </div>
                            <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-xl grid place-items-center text-zinc-900 shadow-sm">
                                <UserCheck size={20} />
                            </div>
                        </div>

                        <div 
                            onClick={() => handleCardClick('provider')}
                            className={`bg-white border p-6 card shadow-xl shadow-zinc-900/5 flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] ${selectedRole === 'provider' ? 'ring-2 ring-zinc-900 border-zinc-900 bg-zinc-50/50' : 'border-zinc-100'}`}
                        >
                            <div>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Providers</p>
                                <p className="text-3xl font-extrabold text-zinc-900 mt-2">{stats.total_providers}</p>
                            </div>
                            <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-xl grid place-items-center text-zinc-900 shadow-sm">
                                <Briefcase size={20} />
                            </div>
                        </div>

                        <div 
                            onClick={() => handleCardClick('admin')}
                            className={`bg-white border p-6 card shadow-xl shadow-zinc-900/5 flex items-center justify-between cursor-pointer transition-all duration-300 hover:scale-[1.02] ${selectedRole === 'admin' ? 'ring-2 ring-zinc-900 border-zinc-900 bg-zinc-50/50' : 'border-zinc-100'}`}
                        >
                            <div>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Admins</p>
                                <p className="text-3xl font-extrabold text-zinc-900 mt-2">{stats.total_admins}</p>
                            </div>
                            <div className="w-12 h-12 bg-zinc-50 border border-zinc-100 rounded-xl grid place-items-center text-zinc-900 shadow-sm">
                                <Shield size={20} />
                            </div>
                        </div>
                    </div>

                    {/* Collapsible Member Directory list */}
                    <AnimatePresence>
                        {selectedRole && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3, ease: 'easeInOut' }}
                                className="bg-white border border-zinc-100 card p-6 sm:p-8 shadow-xl shadow-zinc-900/5 overflow-hidden"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-zinc-100 pb-6">
                                    <div>
                                        <h3 className="text-lg font-bold text-zinc-900 capitalize flex items-center gap-2">
                                            {selectedRole === 'all' ? 'All System' : selectedRole} Members 
                                            <span className="text-xs bg-zinc-100 text-zinc-600 px-2.5 py-0.5 rounded-full font-semibold">
                                                {loadingMembers ? '...' : filteredMembers.length}
                                            </span>
                                        </h3>
                                        <p className="text-xs text-zinc-400 mt-1">Detailed database records and accounts</p>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <div className="relative flex-1 sm:flex-initial">
                                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                                            <input
                                                type="text"
                                                placeholder="Search by name or email..."
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                className="w-full sm:w-64 bg-zinc-50 border border-zinc-100 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-900 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:bg-white transition-all"
                                            />
                                            {searchQuery && (
                                                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-900">
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => { setSelectedRole(null); setMembersList([]); }}
                                            className="p-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-950 rounded-xl transition-colors border border-zinc-100"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>

                                {loadingMembers ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                                        <Loader />
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest animate-pulse">Loading Member Records...</p>
                                    </div>
                                ) : filteredMembers.length === 0 ? (
                                    <div className="text-center py-16 bg-zinc-50/50 border border-zinc-100/50 rounded-2xl border-dashed">
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No Members Found</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <div className="max-h-[420px] overflow-y-auto pr-1">
                                            <table className="w-full text-left border-collapse text-zinc-900">
                                                <thead>
                                                    <tr className="border-b border-zinc-100 text-[9px] font-bold text-zinc-400 uppercase tracking-wider">
                                                        <th className="pb-4 font-black">Member</th>
                                                        <th className="pb-4 font-black">Role</th>
                                                        <th className="pb-4 font-black">Status</th>
                                                        <th className="pb-4 font-black">Joined Date</th>
                                                        <th className="pb-4 font-black">Contact Info</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-zinc-50">
                                                    {filteredMembers.map((member) => (
                                                        <tr key={member.id} className="text-xs group hover:bg-zinc-50/50 transition-colors">
                                                            <td className="py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-9 h-9 rounded-full bg-zinc-900/5 border border-zinc-100 flex items-center justify-center font-bold text-zinc-800 text-xs shrink-0 uppercase">
                                                                        {member.avatar_url ? (
                                                                            <img src={member.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                                                        ) : (
                                                                            (member.full_name || member.email || '?').slice(0, 2)
                                                                        )}
                                                                    </div>
                                                                    <div>
                                                                        <p className="font-bold text-zinc-900 group-hover:text-zinc-600 transition-colors">
                                                                            {member.full_name || 'Anonymous Member'}
                                                                        </p>
                                                                        <p className="text-[10px] text-zinc-400 font-medium font-mono tracking-tight">{member.id}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="py-4">
                                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                                                    member.role === 'admin' 
                                                                        ? 'bg-zinc-900 text-white border-zinc-900' 
                                                                        : member.role === 'provider'
                                                                            ? 'bg-slate-50 text-slate-700 border-slate-200'
                                                                            : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                                                                }`}>
                                                                    {member.role}
                                                                </span>
                                                            </td>
                                                            <td className="py-4">
                                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold ${member.privacy_policy_accepted ? 'text-zinc-900' : 'text-zinc-400'}`}>
                                                                    <span className={`w-1.5 h-1.5 rounded-full ${member.privacy_policy_accepted ? 'bg-zinc-900' : 'bg-zinc-300'}`} />
                                                                    {member.privacy_policy_accepted ? 'Active Account' : 'Pending Verification'}
                                                                </span>
                                                            </td>
                                                            <td className="py-4 text-zinc-500 tabular-nums">
                                                                {member.created_at ? new Date(member.created_at).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                                            </td>
                                                            <td className="py-4">
                                                                <div className="space-y-1 text-[10px] text-zinc-400">
                                                                    <div className="flex items-center gap-1.5 font-medium">
                                                                        <Mail size={12} className="text-zinc-300" />
                                                                        <a href={`mailto:${member.email}`} className="hover:text-zinc-900 transition-colors">{member.email}</a>
                                                                    </div>
                                                                    {member.phone && (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <Phone size={12} className="text-zinc-300" />
                                                                            <span>{member.phone}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>


                    <div className="bg-white border border-zinc-100 card p-6 sm:p-8 shadow-xl shadow-zinc-900/5">
                        <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                            <TrendingUp size={16} className="text-zinc-900" /> Daily Registration Rate (Last 30 Days)
                        </h3>
                        <div className="h-64 sm:h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.daily_registration_rates} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="userRegGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#18181b" stopOpacity={0.15}/>
                                            <stop offset="95%" stopColor="#18181b" stopOpacity={0.01}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis 
                                        dataKey="date" 
                                        tickLine={false} 
                                        axisLine={false} 
                                        tickFormatter={(str) => {
                                            try {
                                                const d = new Date(str);
                                                return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
                                            } catch (e) {
                                                return str;
                                            }
                                        }}
                                        tick={{ fontSize: 10, fill: '#71717a', fontWeight: 500 }} 
                                    />
                                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#71717a', fontWeight: 500 }} />
                                    <Tooltip 
                                        contentStyle={{ background: '#18181b', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px', fontWeight: 'bold' }} 
                                        labelStyle={{ color: '#a1a1aa', fontSize: '9px', textTransform: 'uppercase', tracking: '0.1em' }}
                                    />
                                    <Area type="monotone" dataKey="count" name="Registrations" stroke="#18181b" strokeWidth={2} fillOpacity={1} fill="url(#userRegGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </motion.div>
            )}

            <h2 className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.5em] mb-6 sm:mb-10 ml-2 flex items-center gap-4">
                <div className="w-1.5 h-6 bg-zinc-900 rounded-full" /> Live Sessions
            </h2>


            <div className="space-y-6">
                {sessions.length === 0 && (
                    <div className="text-center py-20 bg-zinc-50 border border-zinc-100 card border-dashed">
                        <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.4em]">No Live Sessions Found</p>
                    </div>
                )}

                {sessions.map((session, idx) => (
                    <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <div className="bg-white border border-zinc-100 card p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 hover:shadow-2xl hover:shadow-zinc-900/5 transition-all duration-500 group">
                            <div className="flex gap-4 sm:gap-8 items-center flex-1 w-full min-w-0">
                                <div className="relative shrink-0">
                                    <div className={`w-3 h-3 rounded-full ${session.status === 'active_human' ? 'bg-zinc-900' : 'bg-zinc-100'}`} />
                                    {session.status === 'active_human' && (
                                        <div className="absolute inset-0 bg-zinc-900 rounded-full animate-ping opacity-20" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xl sm:text-2xl font-sans font-bold text-zinc-900 tracking-tight group-hover:text-zinc-600 transition-colors truncate break-words">
                                        {session.user?.full_name || session.user?.email || session.users_jobs?.full_name || 'Anonymous Guest'}
                                    </p>
                                    <p className="text-[10px] text-zinc-300 font-bold mt-2 uppercase tracking-[0.2em] truncate">{session.id.slice(0, 18)}...</p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-6 sm:gap-8 w-full md:w-auto pt-4 md:pt-0 border-t border-zinc-100 md:border-none">
                                <div className="text-left md:text-right">
                                    <p className="text-[8px] font-bold text-zinc-300 uppercase tracking-[0.2em] mb-1">Time Started</p>
                                    <span className="text-xs font-bold text-zinc-900 tabular-nums">
                                        {new Date(session.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                                <button
                                    onClick={() => navigate('/admin/helpdesk', { state: { sessionId: session.id } })}
                                    className="px-8 sm:px-12 py-3.5 sm:py-4 bg-zinc-900 text-white rounded-2xl font-bold text-[10px] uppercase tracking-[0.3em] hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-900/10 shrink-0"
                                >
                                    Monitor
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ControlTowerPage;
