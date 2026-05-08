import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, ExternalLink, Building2, MapPin, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchPlaybooks, deletePlaybook } from '../../api/playbooksApi';
import { CompanyLogo } from '../../components/new-grad/CompanyLogo';
import toast from 'react-hot-toast';

const ManagePlaybooksPage = () => {
    const [playbooks, setPlaybooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadPlaybooks();
    }, []);

    const loadPlaybooks = async () => {
        try {
            setLoading(true);
            const data = await fetchPlaybooks();
            setPlaybooks(data);
        } catch (error) {
            console.error('Failed to fetch playbooks:', error);
            toast.error('Failed to load playbooks');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, name) => {
        if (window.confirm(`Are you sure you want to delete the playbook for ${name}?`)) {
            try {
                await deletePlaybook(id);
                toast.success('Playbook deleted successfully');
                loadPlaybooks();
            } catch (error) {
                toast.error('Failed to delete playbook');
            }
        }
    };

    const filteredPlaybooks = playbooks.filter(pb => 
        pb.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pb.industry?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pb.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F6F3ED] p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-[#313851] tracking-tight">Manage Playbooks</h1>
                        <p className="text-[#313851]/60 mt-1">Create and edit New Grad recruitment guides</p>
                    </div>
                    
                    <button 
                        onClick={() => navigate('/admin/playbooks/create')}
                        className="flex items-center gap-2 bg-[#313851] text-white px-6 py-3 rounded-xl font-bold hover:scale-105 transition-all shadow-lg active:scale-95"
                    >
                        <Plus size={20} />
                        Add New Playbook
                    </button>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#313851]/40" size={20} />
                    <input 
                        type="text"
                        placeholder="Search by company name, industry, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border-none rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:ring-2 focus:ring-[#313851]/10 text-[#313851] font-medium"
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-white h-48 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredPlaybooks.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
                        <Building2 size={48} className="mx-auto text-[#313851]/20 mb-4" />
                        <h3 className="text-xl font-bold text-[#313851]">No playbooks found</h3>
                        <p className="text-[#313851]/60 mt-2">Try adjusting your search or create a new one.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredPlaybooks.map((pb, idx) => (
                            <motion.div 
                                key={pb.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                            >
                                {/* Background Accent */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#313851]/5 rounded-bl-[100px] -mr-8 -mt-8 transition-transform group-hover:scale-110 duration-500" />

                                <div className="flex items-start justify-between relative z-10">
                                    <div className="flex-shrink-0 mr-4">
                                        <CompanyLogo company={{ name: pb.name, slug: pb.slug }} className="w-16 h-16 shadow-inner" iconSize={24} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => navigate(`/admin/playbooks/edit/${pb.id}`)}
                                            className="p-2.5 bg-[#313851]/5 text-[#313851] rounded-xl hover:bg-[#313851] hover:text-white transition-all shadow-sm"
                                            title="Edit Playbook"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(pb.id, pb.name)}
                                            className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                            title="Delete Playbook"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-6 relative z-10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-xl font-black text-[#313851] leading-tight">{pb.name}</h3>
                                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${pb.hiring_zone === 'on-campus' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {pb.hiring_zone}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[#313851]/50 text-xs font-bold uppercase tracking-widest mb-4">
                                        <Briefcase size={12} />
                                        {pb.industry || 'General'}
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-[#313851]/5">
                                        <div className="flex items-center gap-2 text-[#313851]/60 text-xs font-medium">
                                            <MapPin size={12} />
                                            {pb.hq || 'Global'}
                                        </div>
                                        <button 
                                            onClick={() => navigate(`/new-grad/${pb.slug}`)}
                                            className="flex items-center gap-1.5 text-[#313851] text-xs font-bold hover:underline"
                                        >
                                            View Public <ExternalLink size={12} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagePlaybooksPage;
