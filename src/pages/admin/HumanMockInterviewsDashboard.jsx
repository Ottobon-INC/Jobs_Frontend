import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Filter, Search, ChevronRight, X, User, Briefcase, Calendar, Link as LinkIcon, FileText, CheckCircle2, XCircle, MoreVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAdminHumanMockInterviews, approveHumanMockInterview, rejectHumanMockInterview, completeHumanMockInterview } from '../../api/humanMockInterviewApi';

const HumanMockInterviewsDashboard = () => {
    const [interviews, setInterviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Form state for drawer actions
    const [actionNotes, setActionNotes] = useState('');
    const [scheduledAt, setScheduledAt] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        fetchInterviews();
    }, [filter]);

    const fetchInterviews = async () => {
        setIsLoading(true);
        try {
            const data = await getAdminHumanMockInterviews(filter);
            setInterviews(data);
        } catch (error) {
            console.error("Failed to fetch mock interviews:", error);
            toast.error("Failed to load interview requests.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApprove = async () => {
        setIsActionLoading(true);
        try {
            await approveHumanMockInterview(selectedRequest.id, {
                scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
                meeting_link: meetingLink || null,
                admin_notes: actionNotes || null
            });
            toast.success("Request approved and scheduled.");
            setIsDrawerOpen(false);
            fetchInterviews();
        } catch (error) {
            toast.error("Failed to approve request.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReject = async () => {
        setIsActionLoading(true);
        try {
            await rejectHumanMockInterview(selectedRequest.id, {
                admin_notes: actionNotes || null
            });
            toast.success("Request rejected.");
            setIsDrawerOpen(false);
            fetchInterviews();
        } catch (error) {
            toast.error("Failed to reject request.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleComplete = async () => {
        setIsActionLoading(true);
        try {
            await completeHumanMockInterview(selectedRequest.id);
            toast.success("Interview marked as completed.");
            setIsDrawerOpen(false);
            fetchInterviews();
        } catch (error) {
            toast.error("Failed to complete interview.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const formatForDateTimeLocal = (isoString) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    };

    const openDrawer = (req) => {
        setSelectedRequest(req);
        setActionNotes(req.admin_notes || '');
        setScheduledAt(req.scheduled_at ? formatForDateTimeLocal(req.scheduled_at) : '');
        setMeetingLink(req.meeting_link || '');
        setIsDrawerOpen(true);
    };

    const getStatusStyle = (status) => {
        switch(status) {
            case 'PENDING_APPROVAL': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200';
            case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
            case 'COMPLETED': return 'bg-zinc-100 text-zinc-700 border-zinc-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-zinc-900 uppercase tracking-tight">Human Mock Interviews</h1>
                    <p className="text-zinc-500 text-sm font-medium mt-1">Manage and schedule 1-on-1 interview requests.</p>
                </div>
                
                <div className="flex gap-2">
                    {['all', 'PENDING_APPROVAL', 'APPROVED', 'COMPLETED'].map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                                filter === f ? 'bg-[#1C1A17] text-white' : 'bg-white text-zinc-500 border border-zinc-200 hover:bg-zinc-50'
                            }`}
                        >
                            {f.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-xs uppercase tracking-wider text-zinc-500">
                            <tr>
                                <th className="px-6 py-4 font-bold">Candidate</th>
                                <th className="px-6 py-4 font-bold">Target Role</th>
                                <th className="px-6 py-4 font-bold">Pref. Date</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                                <th className="px-6 py-4 font-bold">Requested</th>
                                <th className="px-6 py-4 font-bold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">Loading requests...</td>
                                </tr>
                            ) : interviews.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-zinc-500">No requests found matching this filter.</td>
                                </tr>
                            ) : (
                                interviews.map((req) => (
                                    <tr key={req.id} className="hover:bg-zinc-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-zinc-900">{req.full_name}</div>
                                            <div className="text-xs text-zinc-500">{req.email}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-zinc-900">{req.preferred_job_role || 'General'}</div>
                                            <div className="text-xs text-zinc-500">{req.interview_type}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-zinc-900">{req.preferred_date}</div>
                                            <div className="text-xs text-zinc-500">{req.preferred_time} {req.timezone}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getStatusStyle(req.status)}`}>
                                                {req.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-zinc-500 text-xs">
                                            {new Date(req.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => openDrawer(req)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-bold transition-colors"
                                            >
                                                Review <ChevronRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Side Drawer */}
            <AnimatePresence>
                {isDrawerOpen && selectedRequest && (
                    <>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDrawerOpen(false)}
                            className="fixed inset-0 bg-[#1C1A17]/40 backdrop-blur-sm z-40"
                        />
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col border-l border-zinc-200"
                        >
                            <div className="flex justify-between items-center px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
                                <h2 className="text-lg font-black uppercase tracking-tight text-zinc-900">Request Details</h2>
                                <button onClick={() => setIsDrawerOpen(false)} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
                                    <X size={20} className="text-zinc-500" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                {/* Candidate Info */}
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Candidate Profile</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center">
                                                <User size={18} className="text-zinc-600" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-zinc-900">{selectedRequest.full_name}</div>
                                                <div className="text-xs text-zinc-500">{selectedRequest.email} {selectedRequest.phone && `• ${selectedRequest.phone}`}</div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                                            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                                                <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Current Role</div>
                                                <div className="font-medium text-zinc-900">{selectedRequest.current_role || '-'}</div>
                                            </div>
                                            <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                                                <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Target Role</div>
                                                <div className="font-medium text-zinc-900">{selectedRequest.preferred_job_role || '-'}</div>
                                            </div>
                                        </div>
                                            {selectedRequest.linkedin_url && (
                                                <a href={selectedRequest.linkedin_url} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-100">
                                                    <LinkIcon size={14} /> LinkedIn
                                                </a>
                                            )}
                                    </div>
                                </div>

                                {/* Background & Screening */}
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Background & Screening</h3>
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Experience Level</div>
                                                <div className="font-bold text-sm text-zinc-900">
                                                    {selectedRequest.experience_level || 'Fresher'}
                                                    {selectedRequest.years_of_experience && ` (${selectedRequest.years_of_experience} Yrs)`}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Employment Status</div>
                                                <div className="font-bold text-sm text-zinc-900">{selectedRequest.employment_status || '-'}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Prior Real Interviews</div>
                                                <div className="font-bold text-sm text-zinc-900">
                                                    {selectedRequest.attended_real_interviews === true ? 'Yes' : selectedRequest.attended_real_interviews === false ? 'No' : '-'}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Preferred Companies</div>
                                                <div className="font-bold text-sm text-zinc-900">{selectedRequest.preferred_company_type || '-'}</div>
                                            </div>
                                        </div>

                                        {(selectedRequest.preparing_company || selectedRequest.interview_goal) && (
                                            <div className="space-y-3 mt-2">
                                                {selectedRequest.preparing_company && (
                                                    <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                                                        <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Specific Target Companies</div>
                                                        <div className="text-sm font-medium text-zinc-900">{selectedRequest.preparing_company}</div>
                                                    </div>
                                                )}
                                                {selectedRequest.interview_goal && (
                                                    <div className="p-3 bg-zinc-50 rounded-lg border border-zinc-100">
                                                        <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Mock Interview Goal</div>
                                                        <div className="text-sm font-medium text-zinc-900">{selectedRequest.interview_goal}</div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* Resume Preview & Download area if resume_url exists */}
                                        {selectedRequest.resume_url && (
                                            <div className="p-4 bg-[#1C1A17] rounded-xl flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-white max-w-[160px] truncate">{selectedRequest.resume_filename || 'Applicant_Resume'}</p>
                                                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Candidate Resume</p>
                                                    </div>
                                                </div>
                                                <a 
                                                    href={selectedRequest.resume_url} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="px-4 py-2 bg-white text-zinc-900 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-zinc-100 transition-colors"
                                                >
                                                    View / DL
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Preferences */}
                                <div>
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Interview Setup</h3>
                                    <div className="space-y-4">
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Type</div>
                                                <div className="font-bold text-sm text-zinc-900 capitalize">{selectedRequest.interview_type}</div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Duration</div>
                                                <div className="font-bold text-sm text-zinc-900">{selectedRequest.duration} mins</div>
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Difficulty</div>
                                                <div className="font-bold text-sm text-zinc-900 capitalize">{selectedRequest.difficulty_level}</div>
                                            </div>
                                        </div>
                                        <div className="p-3 border border-zinc-200 rounded-lg bg-white">
                                            <div className="text-[10px] uppercase text-zinc-500 font-bold mb-2">Requested Time</div>
                                            <div className="font-bold text-zinc-900">{selectedRequest.preferred_date} at {selectedRequest.preferred_time}</div>
                                            <div className="text-xs text-zinc-500 mt-1">{selectedRequest.timezone}</div>
                                        </div>
                                        {selectedRequest.focus_skills && (
                                            <div>
                                                <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Focus Skills</div>
                                                <p className="text-sm text-zinc-800">{selectedRequest.focus_skills}</p>
                                            </div>
                                        )}
                                        {selectedRequest.additional_notes && (
                                            <div>
                                                <div className="text-[10px] uppercase text-zinc-500 font-bold mb-1">Notes</div>
                                                <p className="text-sm text-zinc-800 italic">{selectedRequest.additional_notes}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Area */}
                                <div className="border-t border-zinc-200 pt-6">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-900 mb-4">Admin Actions</h3>
                                    
                                    <div className="space-y-4 mb-6">
                                        {selectedRequest.status !== 'COMPLETED' && (
                                            <>
                                                <div>
                                                    <label className="block text-xs font-bold text-zinc-700 mb-1">Schedule Date & Time</label>
                                                    <input 
                                                        type="datetime-local" 
                                                        value={scheduledAt}
                                                        onChange={(e) => setScheduledAt(e.target.value)}
                                                        className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-zinc-700 mb-1">Meeting Link (Zoom/Meet)</label>
                                                    <input 
                                                        type="url" 
                                                        value={meetingLink}
                                                        onChange={(e) => setMeetingLink(e.target.value)}
                                                        placeholder="https://meet.google.com/..."
                                                        className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none"
                                                    />
                                                </div>
                                            </>
                                        )}
                                        <div>
                                            <label className="block text-xs font-bold text-zinc-700 mb-1">Feedback / Notes (Visible to seeker)</label>
                                            <textarea 
                                                value={actionNotes}
                                                onChange={(e) => setActionNotes(e.target.value)}
                                                rows={3}
                                                placeholder="Provide feedback or instructions..."
                                                className="w-full p-2.5 border border-zinc-300 rounded-lg text-sm focus:ring-2 focus:ring-zinc-900 outline-none resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        {selectedRequest.status === 'PENDING_APPROVAL' && (
                                            <div className="flex gap-3">
                                                <button 
                                                    onClick={handleApprove}
                                                    disabled={isActionLoading}
                                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                                                >
                                                    Approve & Schedule
                                                </button>
                                                <button 
                                                    onClick={handleReject}
                                                    disabled={isActionLoading}
                                                    className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                        {selectedRequest.status === 'APPROVED' && (
                                            <button 
                                                onClick={handleComplete}
                                                disabled={isActionLoading}
                                                className="w-full bg-[#1C1A17] hover:bg-[#1C1A17]/90 text-white py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                            >
                                                <CheckCircle2 size={16} /> Mark as Completed
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HumanMockInterviewsDashboard;
