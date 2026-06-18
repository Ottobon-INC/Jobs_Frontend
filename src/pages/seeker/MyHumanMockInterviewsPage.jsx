import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Search, Plus, ExternalLink, ArrowRight, UserPlus, CheckCircle2, XCircle, Clock4, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMyHumanMockInterviews } from '../../api/humanMockInterviewApi';

const MyHumanMockInterviewsPage = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const data = await getMyHumanMockInterviews();
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch requests:", error);
            toast.error("Could not load your interview requests.");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'PENDING_APPROVAL':
                return { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]', icon: <Clock4 size={14} />, label: 'Reviewing' };
            case 'APPROVED':
                return { bg: 'bg-[#22C55E]/10', text: 'text-[#22C55E]', icon: <CheckCircle2 size={14} />, label: 'Scheduled' };
            case 'REJECTED':
                return { bg: 'bg-red-500/10', text: 'text-red-500', icon: <XCircle size={14} />, label: 'Declined' };
            case 'COMPLETED':
                return { bg: 'bg-[#1C1A17]/10', text: 'text-[#1C1A17]', icon: <CheckCircle size={14} />, label: 'Completed' };
            default:
                return { bg: 'bg-gray-100', text: 'text-gray-500', icon: <Clock4 size={14} />, label: status };
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#F4F1EA] text-[#1C1A17] p-6 lg:p-10 flex items-center justify-center">
                <div className="animate-pulse text-[#D45B34]">Loading your requests...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F1EA] text-[#1C1A17] p-6 lg:p-10 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl lg:text-4xl font-black tracking-tight uppercase">My Interview Requests</h1>
                        <p className="text-[10px] font-bold text-[#1C1A17]/50 uppercase tracking-widest mt-2">Manage your 1-on-1 sessions</p>
                    </div>
                    <Link 
                        to="/human-mock-interview"
                        className="px-6 py-3 bg-[#D45B34] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.3em] hover:scale-[1.02] transition-all shadow-xl shadow-[#D45B34]/20 flex items-center gap-2"
                    >
                        <Plus size={16} /> New Request
                    </Link>
                </div>

                {requests.length === 0 ? (
                    <div className="bg-white rounded-[2rem] p-12 text-center shadow-[0_8px_30px_rgba(28,26,23,0.04)] border border-[#1C1A17]/10">
                        <UserPlus size={48} className="mx-auto text-[#D45B34] mb-4" />
                        <h3 className="text-xl font-bold mb-2">No Requests Yet</h3>
                        <p className="text-[#1C1A17]/70 mb-8 max-w-sm mx-auto">You haven't scheduled any human mock interviews yet. Start your preparation with an industry expert.</p>
                        <Link 
                            to="/human-mock-interview"
                            className="inline-flex items-center gap-2 px-8 py-3 border border-[#D45B34] text-[#D45B34] rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-[#D45B34] hover:text-white transition-all"
                        >
                            Schedule Now <ArrowRight size={14} />
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {requests.map((request, index) => {
                            const statusStyle = getStatusStyle(request.status);
                            
                            return (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    key={request.id}
                                    className="bg-white text-[#1C1A17] rounded-2xl p-6 md:p-8 shadow-sm border border-[#1C1A17]/10 hover:shadow-md transition-shadow relative overflow-hidden group"
                                >
                                    <div className={`absolute top-0 left-0 w-1.5 h-full transition-opacity ${statusStyle.bg.replace('/10', '')}`}></div>
                                    
                                    <div className="flex flex-col md:flex-row gap-6 md:items-center justify-between">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-black tracking-tight">{request.preferred_job_role || 'General Interview'}</h3>
                                                <span className={`flex items-center gap-1.5 px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-full ${statusStyle.bg} ${statusStyle.text}`}>
                                                    {statusStyle.icon} {statusStyle.label}
                                                </span>
                                            </div>
                                            
                                            <p className="text-[10px] font-bold text-[#1C1A17]/50 uppercase tracking-[0.2em]">
                                                {request.interview_type} • {request.difficulty_level} • {request.duration} Mins
                                            </p>
                                            
                                            <div className="flex items-center gap-4 text-sm font-medium text-[#1C1A17]/70">
                                                {request.scheduled_at ? (
                                                    <div className="flex items-center gap-2 text-[#22C55E]">
                                                        <Calendar size={16} />
                                                        {new Date(request.scheduled_at).toLocaleDateString()} at {new Date(request.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <Clock size={16} />
                                                        Requested: {request.preferred_date} {request.preferred_time}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[200px]">
                                            {request.status === 'APPROVED' && request.meeting_link && (
                                                <a 
                                                    href={request.meeting_link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D45B34] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-[#B84A27] transition-all shadow-md"
                                                >
                                                    <ExternalLink size={14} /> Join Meeting
                                                </a>
                                            )}
                                            
                                            {request.admin_notes && (
                                                <div className="p-4 bg-[#F4F1EA] rounded-xl border border-[#1C1A17]/10">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-[#1C1A17] mb-1">Feedback / Notes</p>
                                                    <p className="text-xs text-[#1C1A17]/80">{request.admin_notes}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyHumanMockInterviewsPage;
