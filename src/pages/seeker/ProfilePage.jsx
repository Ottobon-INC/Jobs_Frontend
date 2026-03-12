import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { uploadResume, getMyProfile } from '../../api/usersApi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const ProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getMyProfile();
            setProfile(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        setMessage(null);
        setError(null);

        try {
            const res = await uploadResume(file);
            setMessage(`Protocol Success: ${res.characters_extracted} units extracted.`);
            await fetchProfile();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.detail || 'Protocol Exception / Injection Fail');
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <Loader fullScreen />;

    return (
        <div className="max-w-2xl mx-auto py-16 px-6 bg-white">
            <header className="mb-16 border-b-4 border-black pb-8">
                <h1 className="text-4xl font-display font-black text-black uppercase tracking-tighter">Identity Management</h1>
                <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.4em] mt-2">Personal Object Structure</p>
            </header>

            <div className="space-y-12">
                {/* User Info - Monochrome Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border-2 border-black rounded-3xl p-8 shadow-[8px_8px_0px_#000]"
                >
                    <div className="flex items-center gap-8">
                        <div className="w-24 h-24 rounded-2xl bg-black border-4 border-black grid place-items-center text-4xl font-black text-white shadow-xl">
                            {user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-black uppercase tracking-tight">{profile?.full_name || user.email?.split('@')[0]}</h2>
                            <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mt-1">{profile?.role || 'UNAUTHORIZED_ACCESS'}</p>
                            <div className="flex flex-wrap gap-3 mt-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg italic">
                                    STATUS: ONLINE
                                </div>
                                {profile?.location && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 border border-black/10 text-black text-[9px] font-black uppercase tracking-widest rounded-lg">
                                        LOCATION: {profile.location}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Contact Statistics - Mini Bento */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.05 }}
                        className="bg-white border-2 border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000]"
                    >
                        <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2">Primary Email</p>
                        <p className="text-sm font-black text-black break-all">{user.email}</p>
                    </motion.div>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white border-2 border-black rounded-3xl p-6 shadow-[6px_6px_0px_#000]"
                    >
                        <p className="text-[10px] font-black text-black/40 uppercase tracking-[0.2em] mb-2">Phone Number</p>
                        <p className="text-sm font-black text-black">{profile?.phone || 'NOT_LINKED'}</p>
                    </motion.div>
                </div>

                {/* Resume Section - High Contrast */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white border-2 border-black rounded-3xl p-10 shadow-[10px_10px_0px_rgba(0,0,0,0.05)]"
                >
                    <h2 className="text-xs font-black text-black mb-10 flex items-center gap-3 uppercase tracking-[0.4em]">
                        <FileText className="text-black" size={16} /> Data Payload / Resume
                    </h2>

                    <div className="mb-10 p-12 border-4 border-dashed border-black rounded-3xl text-center hover:bg-black group transition-all duration-500 cursor-pointer relative overflow-hidden">
                        <input
                            type="file"
                            id="resume-upload"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept=".pdf,.docx"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                        <div className="flex flex-col items-center gap-4 group-hover:text-white transition-colors">
                            <Upload size={48} className="text-black group-hover:text-white transition-colors" />
                            <span className="font-display font-black text-xl uppercase tracking-tighter">Inject Payload</span>
                            <span className="text-[9px] font-bold text-black/40 group-hover:text-white/40 uppercase tracking-[0.3em]">PDF / DOCX (MAX 5MB)</span>
                        </div>
                    </div>

                    {uploading && (
                        <div className="flex items-center gap-3 text-black font-black uppercase tracking-widest text-[10px] justify-center mb-8 animate-pulse">
                            <RefreshCw className="animate-spin" size={16} /> Syncing Stream...
                        </div>
                    )}

                    {message && (
                        <div className="bg-black text-white p-5 rounded-2xl flex items-center justify-center gap-3 mb-8 border-2 border-black text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle size={18} /> {message}
                        </div>
                    )}

                    {error && (
                        <div className="bg-white text-black p-5 rounded-2xl flex items-center justify-center gap-3 mb-8 border-2 border-black text-[10px] font-black uppercase tracking-widest">
                            <AlertCircle size={18} /> {error}
                        </div>
                    )}

                    {profile?.resume_text ? (
                        <div className="bg-white p-6 rounded-2xl flex justify-between items-center border-4 border-black shadow-[6px_6px_0px_#000]">
                            <div className="flex items-center gap-5">
                                <div className="w-12 h-12 bg-black rounded-xl grid place-items-center">
                                    <CheckCircle className="text-white" size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-black uppercase tracking-widest">Payload Active</p>
                                    <p className="text-[9px] font-bold text-black/40 uppercase tracking-[0.2em] mt-1">LOGS: {new Date(profile.created_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div className="h-6 w-2 bg-black animate-pulse rounded-full" />
                        </div>
                    ) : (
                        <div className="text-center py-6 px-4 bg-gray-50 rounded-2xl border-2 border-black border-dotted">
                            <p className="text-[9px] font-black text-black/20 uppercase tracking-[0.3em]">No Object Detected</p>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default ProfilePage;
