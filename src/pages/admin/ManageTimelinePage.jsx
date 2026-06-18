import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    Edit2, 
    Trash2, 
    Save, 
    X, 
    Calendar, 
    Briefcase, 
    PlusCircle, 
    MapPin,
    AlertCircle,
    Check,
    HelpCircle,
    ArrowUp,
    ArrowDown,
    ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import { fetchTimeline, createTimeline, updateTimeline, deleteTimeline } from '../../api/timelineApi';

const EVENT_TYPES = ['Application', 'Assessment', 'Screening', 'Interview', 'Offer'];
const MONTHS_LIST = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
];

const ManageTimelinePage = () => {
    const navigate = useNavigate();
    const [timeline, setTimeline] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingMonth, setEditingMonth] = useState(null); // When not null, represents the month form being edited/added
    const [isNewMonth, setIsNewMonth] = useState(false);

    useEffect(() => {
        loadTimeline();
    }, []);

    const loadTimeline = async () => {
        try {
            setLoading(true);
            const data = await fetchTimeline();
            const sanitized = (data || []).map(item => ({
                ...item,
                events: item.events && Array.isArray(item.events) ? item.events : []
            }));
            setTimeline(sanitized);
        } catch (error) {
            console.error('Failed to fetch timeline:', error);
            toast.error('Failed to load hiring timeline');
        } finally {
            setLoading(false);
        }
    };

    const handleStartAdd = () => {
        const nextOrder = timeline.length > 0 ? Math.max(...timeline.map(t => t.order_index)) + 1 : 1;
        setEditingMonth({
            id: '',
            month: 'January',
            title: '',
            description: '',
            order_index: nextOrder,
            events: []
        });
        setIsNewMonth(true);
    };

    const handleStartEdit = (monthBlock) => {
        // Deep copy the month block to avoid mutating original state before save
        const copy = JSON.parse(JSON.stringify(monthBlock));
        if (!copy.events || !Array.isArray(copy.events)) {
            copy.events = [];
        }
        setEditingMonth(copy);
        setIsNewMonth(false);
    };

    const handleCancel = () => {
        setEditingMonth(null);
        setIsNewMonth(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        if (!editingMonth.id || editingMonth.id.trim() === '') {
            toast.error('Month abbreviation ID is required (e.g. "jul")');
            return;
        }
        if (!editingMonth.title || editingMonth.title.trim() === '') {
            toast.error('Month title is required');
            return;
        }

        // Validate nested events
        for (let i = 0; i < editingMonth.events.length; i++) {
            const ev = editingMonth.events[i];
            if (!ev.company || ev.company.trim() === '') {
                toast.error(`Event #${i + 1} must specify a company name`);
                return;
            }
            if (!ev.title || ev.title.trim() === '') {
                toast.error(`Event #${i + 1} must specify an event title`);
                return;
            }
        }

        try {
            if (isNewMonth) {
                // Ensure id doesn't duplicate
                if (timeline.some(t => t.id.toLowerCase() === editingMonth.id.toLowerCase())) {
                    toast.error(`A month with ID "${editingMonth.id}" already exists`);
                    return;
                }
                await createTimeline(editingMonth);
                toast.success('Hiring timeline month added successfully');
            } else {
                await updateTimeline(editingMonth.id, editingMonth);
                toast.success('Hiring timeline month updated successfully');
            }
            setEditingMonth(null);
            loadTimeline();
        } catch (error) {
            console.error('Failed to save timeline month:', error);
            toast.error(error.response?.data?.detail || 'Failed to save hiring timeline month');
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete ${name} from the timeline?`)) {
            try {
                await deleteTimeline(id);
                toast.success('Hiring timeline month deleted successfully');
                loadTimeline();
            } catch (error) {
                console.error('Failed to delete timeline month:', error);
                toast.error('Failed to delete hiring timeline month');
            }
        }
    };

    const handleAddEvent = () => {
        const updatedEvents = [
            ...editingMonth.events,
            { company: '', title: '', type: 'Application', zone: 'off-campus', logo: '' }
        ];
        setEditingMonth({ ...editingMonth, events: updatedEvents });
    };

    const handleRemoveEvent = (index) => {
        const updatedEvents = editingMonth.events.filter((_, i) => i !== index);
        setEditingMonth({ ...editingMonth, events: updatedEvents });
    };

    const handleEventChange = (index, field, value) => {
        const updatedEvents = [...editingMonth.events];
        updatedEvents[index] = { ...updatedEvents[index], [field]: value };
        
        // Auto-generate Hunter.io logo URL if company domain is entered
        if (field === 'company' && value && value.includes('.')) {
            updatedEvents[index].logo = `https://logos.hunter.io/${value.toLowerCase().trim()}`;
        } else if (field === 'company' && value && !updatedEvents[index].logo) {
            // Suggest standard domain mapping for known companies
            const commonDomains = {
                'tcs': 'tcs.com',
                'infosys': 'infosys.com',
                'wipro': 'wipro.com',
                'cognizant': 'cognizant.com',
                'accenture': 'accenture.com',
                'capgemini': 'capgemini.com',
                'epam': 'epam.com',
                'amazon': 'amazon.com',
                'oracle': 'oracle.com',
                'microsoft': 'microsoft.com',
                'swiggy': 'swiggy.com',
                'flipkart': 'flipkart.com',
                'google': 'google.com',
                'meta': 'meta.com',
                'phonepe': 'phonepe.com',
                'salesforce': 'salesforce.com',
                'apple': 'apple.com'
            };
            const mappedDomain = commonDomains[value.toLowerCase().trim()];
            if (mappedDomain) {
                updatedEvents[index].logo = `https://logos.hunter.io/${mappedDomain}`;
            }
        }
        
        setEditingMonth({ ...editingMonth, events: updatedEvents });
    };

    const handleMoveOrder = async (index, direction) => {
        const newTimeline = [...timeline];
        if (direction === 'up' && index > 0) {
            // Swap order_index values
            const temp = newTimeline[index].order_index;
            newTimeline[index].order_index = newTimeline[index - 1].order_index;
            newTimeline[index - 1].order_index = temp;
        } else if (direction === 'down' && index < newTimeline.length - 1) {
            // Swap order_index values
            const temp = newTimeline[index].order_index;
            newTimeline[index].order_index = newTimeline[index + 1].order_index;
            newTimeline[index + 1].order_index = temp;
        } else {
            return;
        }

        try {
            setLoading(true);
            // Save both updated orders to backend
            await updateTimeline(newTimeline[index].id, { order_index: newTimeline[index].order_index });
            const siblingIndex = direction === 'up' ? index - 1 : index + 1;
            await updateTimeline(newTimeline[siblingIndex].id, { order_index: newTimeline[siblingIndex].order_index });
            
            toast.success('Display order updated');
            loadTimeline();
        } catch (error) {
            console.error('Failed to swap month order:', error);
            toast.error('Failed to change month order');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F3ED] p-8">
            <div className="max-w-6xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="inline-flex items-center gap-2 text-[#313851]/60 hover:text-[#313851] transition-colors text-xs font-black uppercase tracking-wider mb-6 bg-white border border-[#313851]/10 px-4 py-2 rounded-xl shadow-sm hover:scale-105 active:scale-95 duration-200 cursor-pointer"
                >
                    <ArrowLeft size={14} strokeWidth={3} /> Back
                </button>

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#313851] tracking-tight flex items-center gap-3">
                            <Calendar className="text-[#313851] w-8 h-8" strokeWidth={2.5} />
                            Hiring Timeline Manager
                        </h1>
                        <p className="text-[#313851]/60 mt-1">Configure chronological recruitment months and campus/off-campus events</p>
                    </div>

                    {!editingMonth && (
                        <button
                            onClick={handleStartAdd}
                            className="flex items-center justify-center gap-2 bg-[#313851] text-[#F6F3ED] px-6 py-3.5 rounded-xl font-bold hover:scale-105 transition-all shadow-lg active:scale-95 text-sm"
                        >
                            <Plus size={18} strokeWidth={3} />
                            Add Timeline Month
                        </button>
                    )}
                </div>

                {/* Main Content Area */}
                {loading && !editingMonth ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white h-32 rounded-3xl animate-pulse shadow-sm" />
                        ))}
                    </div>
                ) : editingMonth ? (
                    /* Interactive Form Block (Edit/Add) */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-3xl p-8 shadow-sm border border-[#313851]/5"
                    >
                        <div className="flex items-center justify-between border-b border-[#313851]/10 pb-4 mb-6">
                            <h2 className="text-xl font-black text-[#313851]">
                                {isNewMonth ? 'Add New Timeline Month' : `Edit Timeline Block: ${editingMonth.month}`}
                            </h2>
                            <button
                                onClick={handleCancel}
                                className="p-2 hover:bg-[#313851]/5 text-[#313851]/60 hover:text-[#313851] rounded-lg transition-colors"
                            >
                                <X size={20} strokeWidth={2.5} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="space-y-6">
                            {/* General Month Meta */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-[#313851]/50 mb-2">
                                        Month Abbreviation / Unique ID
                                    </label>
                                    <input
                                        type="text"
                                        disabled={!isNewMonth}
                                        placeholder="e.g. jul, aug, dec"
                                        value={editingMonth.id || ''}
                                        onChange={(e) => setEditingMonth({ ...editingMonth, id: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                                        className="w-full bg-[#F6F3ED]/40 border border-[#313851]/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#313851]/10 text-[#313851] font-bold placeholder-[#313851]/30 disabled:opacity-50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-[#313851]/50 mb-2">
                                        Select Calendar Month
                                     </label>
                                    <select
                                        value={editingMonth.month || 'January'}
                                        onChange={(e) => setEditingMonth({ ...editingMonth, month: e.target.value })}
                                        className="w-full bg-[#F6F3ED]/40 border border-[#313851]/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#313851]/10 text-[#313851] font-bold cursor-pointer"
                                    >
                                        {MONTHS_LIST.map(m => (
                                            <option key={m} value={m}>{m}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-[#313851]/50 mb-2">
                                        Display Sort Order Index
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={editingMonth.order_index || 0}
                                        onChange={(e) => setEditingMonth({ ...editingMonth, order_index: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-[#F6F3ED]/40 border border-[#313851]/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#313851]/10 text-[#313851] font-bold text-center"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-[#313851]/50 mb-2">
                                        Timeline Card Title
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. The Warm-Up, The OA Avalanche"
                                        value={editingMonth.title || ''}
                                        onChange={(e) => setEditingMonth({ ...editingMonth, title: e.target.value })}
                                        className="w-full bg-[#F6F3ED]/40 border border-[#313851]/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#313851]/10 text-[#313851] font-bold placeholder-[#313851]/30"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-wider text-[#313851]/50 mb-2">
                                        Brief Description / Stage Context
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Peak season for technical deep-dives..."
                                        value={editingMonth.description || ''}
                                        onChange={(e) => setEditingMonth({ ...editingMonth, description: e.target.value })}
                                        className="w-full bg-[#F6F3ED]/40 border border-[#313851]/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#313851]/10 text-[#313851] font-medium placeholder-[#313851]/30"
                                    />
                                </div>
                            </div>

                            {/* Nested Event List Manager */}
                            <div className="border-t border-[#313851]/10 pt-6 mt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h3 className="text-lg font-black text-[#313851]">Recruitment Events</h3>
                                        <p className="text-xs text-[#313851]/50 mt-0.5">Manage specific company milestones mapped inside this month</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleAddEvent}
                                        className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-[#313851]/5 hover:bg-[#313851]/15 text-[#313851] py-2 px-3 rounded-lg transition-colors"
                                    >
                                        <PlusCircle size={14} /> Add Event Row
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {editingMonth.events.length === 0 ? (
                                        <div className="bg-[#F6F3ED]/30 rounded-2xl p-6 text-center border border-dashed border-[#313851]/10 text-xs font-bold text-[#313851]/40">
                                            No events configured for this month yet. Click "Add Event Row" to start.
                                        </div>
                                    ) : (
                                        editingMonth.events.map((ev, index) => (
                                            <div 
                                                key={index}
                                                className="bg-[#F6F3ED]/20 border border-[#313851]/5 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-end relative group hover:border-[#313851]/15 transition-colors"
                                            >
                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 w-full">
                                                    <div>
                                                        <label className="block text-[9px] font-black uppercase tracking-wider text-[#313851]/40 mb-1">Company</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. Google"
                                                            value={ev.company || ''}
                                                            onChange={(e) => handleEventChange(index, 'company', e.target.value)}
                                                            className="w-full bg-white border border-[#313851]/10 rounded-lg py-2 px-3 text-xs text-[#313851] font-bold focus:outline-none focus:ring-1 focus:ring-[#313851]/10"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-[9px] font-black uppercase tracking-wider text-[#313851]/40 mb-1">Event Title</label>
                                                        <input
                                                            type="text"
                                                            placeholder="e.g. Virtual Onsites"
                                                            value={ev.title || ''}
                                                            onChange={(e) => handleEventChange(index, 'title', e.target.value)}
                                                            className="w-full bg-white border border-[#313851]/10 rounded-lg py-2 px-3 text-xs text-[#313851] focus:outline-none focus:ring-1 focus:ring-[#313851]/10"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-[9px] font-black uppercase tracking-wider text-[#313851]/40 mb-1">Event Type</label>
                                                        <select
                                                            value={ev.type || 'Application'}
                                                            onChange={(e) => handleEventChange(index, 'type', e.target.value)}
                                                            className="w-full bg-white border border-[#313851]/10 rounded-lg py-2 px-2 text-xs text-[#313851] font-medium focus:outline-none cursor-pointer"
                                                        >
                                                            {EVENT_TYPES.map(t => (
                                                                <option key={t} value={t}>{t}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-[9px] font-black uppercase tracking-wider text-[#313851]/40 mb-1">Hiring Zone</label>
                                                        <select
                                                            value={ev.zone || 'off-campus'}
                                                            onChange={(e) => handleEventChange(index, 'zone', e.target.value)}
                                                            className="w-full bg-white border border-[#313851]/10 rounded-lg py-2 px-2 text-xs text-[#313851] font-medium focus:outline-none cursor-pointer"
                                                        >
                                                            <option value="on-campus">On-Campus</option>
                                                            <option value="off-campus">Off-Campus</option>
                                                        </select>
                                                    </div>

                                                    <div>
                                                        <label className="block text-[9px] font-black uppercase tracking-wider text-[#313851]/40 mb-1">Logo URL (Auto-filled)</label>
                                                        <input
                                                            type="text"
                                                            placeholder="https://..."
                                                            value={ev.logo || ''}
                                                            onChange={(e) => handleEventChange(index, 'logo', e.target.value)}
                                                            className="w-full bg-white border border-[#313851]/10 rounded-lg py-2 px-3 text-xs text-[#313851]/60 focus:outline-none focus:ring-1 focus:ring-[#313851]/10"
                                                        />
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveEvent(index)}
                                                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors md:mb-0.5"
                                                    title="Remove Event Row"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Form Submit Actions */}
                            <div className="flex items-center justify-end gap-3 border-t border-[#313851]/10 pt-6 mt-8">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="px-5 py-3 rounded-xl border border-[#313851]/20 text-[#313851] hover:bg-[#313851]/5 transition-colors font-bold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex items-center gap-2 bg-[#313851] text-white px-7 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-md text-sm"
                                >
                                    <Save size={16} />
                                    Save Month Block
                                </button>
                            </div>
                        </form>
                    </motion.div>
                ) : timeline.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
                        <Calendar size={48} className="mx-auto text-[#313851]/20 mb-4" />
                        <h3 className="text-xl font-bold text-[#313851]">Hiring Timeline Empty</h3>
                        <p className="text-[#313851]/60 mt-2">Initialize your timeline by creating your first monthly stage card.</p>
                        <button
                            onClick={handleStartAdd}
                            className="mt-6 inline-flex items-center gap-2 bg-[#313851] text-white px-6 py-3 rounded-xl font-bold shadow-md hover:scale-105 transition-all text-sm"
                        >
                            <Plus size={16} /> Add First Month
                        </button>
                    </div>
                ) : (
                    /* Timeline Month Cards Grid */
                    <div className="space-y-4">
                        {timeline.map((monthBlock, idx) => (
                            <motion.div
                                key={monthBlock.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[#313851]/5"
                            >
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-3">
                                        <div className="bg-[#313851]/5 text-[#313851] px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider">
                                            {monthBlock.month} ({monthBlock.id})
                                        </div>
                                        <h3 className="text-xl font-black text-[#313851] leading-tight">{monthBlock.title}</h3>
                                        <span className="text-[10px] bg-[#F6F3ED] text-[#313851]/60 px-2 py-0.5 rounded font-black uppercase tracking-wider border border-[#313851]/10">
                                            Order: {monthBlock.order_index}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[#313851]/60 mt-2 font-medium max-w-2xl">{monthBlock.description || 'No stage details configured.'}</p>
                                    
                                    {/* Events Preview Pill Indicators */}
                                    <div className="flex flex-wrap items-center gap-2 mt-4">
                                        <span className="text-[10px] font-black uppercase tracking-wider text-[#313851]/40 mr-1">Events:</span>
                                        {monthBlock.events.length === 0 ? (
                                            <span className="text-xs font-bold text-[#313851]/30">None</span>
                                        ) : (
                                            monthBlock.events.map((ev, i) => (
                                                <span 
                                                    key={i} 
                                                    className="inline-flex items-center gap-1.5 bg-[#F6F3ED]/60 border border-[#313851]/10 text-[#313851]/80 rounded-lg px-2.5 py-1 text-xs font-bold"
                                                >
                                                    {ev.logo && (
                                                        <img 
                                                            src={ev.logo} 
                                                            alt="" 
                                                            className="w-3.5 h-3.5 object-contain rounded-sm"
                                                            onError={(e) => { e.target.style.display = 'none'; }}
                                                        />
                                                    )}
                                                    {ev.company} <span className="text-[9px] text-[#313851]/40">• {ev.title}</span>
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Order & Editing Controls */}
                                <div className="flex items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-[#313851]/5">
                                    <div className="flex flex-col gap-1 mr-2">
                                        <button
                                            disabled={idx === 0}
                                            onClick={() => handleMoveOrder(idx, 'up')}
                                            className="p-1 hover:bg-[#313851]/5 disabled:opacity-30 rounded text-[#313851] transition-colors"
                                            title="Move Month Up"
                                        >
                                            <ArrowUp size={16} strokeWidth={2.5} />
                                        </button>
                                        <button
                                            disabled={idx === timeline.length - 1}
                                            onClick={() => handleMoveOrder(idx, 'down')}
                                            className="p-1 hover:bg-[#313851]/5 disabled:opacity-30 rounded text-[#313851] transition-colors"
                                            title="Move Month Down"
                                        >
                                            <ArrowDown size={16} strokeWidth={2.5} />
                                        </button>
                                    </div>

                                    <button
                                        onClick={() => handleStartEdit(monthBlock)}
                                        className="flex items-center justify-center gap-1.5 bg-[#313851]/5 hover:bg-[#313851]/10 text-[#313851] px-4.5 py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-colors"
                                    >
                                        <Edit2 size={13} strokeWidth={2.5} /> Edit Month
                                    </button>
                                    <button
                                        onClick={() => handleDelete(monthBlock.id, monthBlock.month)}
                                        className="p-3 text-red-500 hover:text-white bg-red-50 hover:bg-red-500 rounded-xl transition-all"
                                        title="Delete Month Card"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageTimelinePage;
