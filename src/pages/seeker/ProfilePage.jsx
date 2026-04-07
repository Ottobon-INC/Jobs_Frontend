import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { uploadResume, getMyProfile, updateProfile, extractSkills } from '../../api/usersApi';
import Loader from '../../components/ui/Loader';
import { 
    Upload, 
    FileText, 
    CheckCircle, 
    AlertCircle, 
    RefreshCw, 
    Activity, 
    Sparkles, 
    Plus, 
    X, 
    Save, 
    Edit2,
    MapPin,
    Phone,
    User,
    ChevronRight,
    Calendar,
    Target
} from 'lucide-react';
import { DESIRED_JOB_ROLES } from '../../utils/constants';
import { motion, AnimatePresence } from 'framer-motion';

const ProfilePage = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [extracting, setExtracting] = useState(false);
    
    // Editable State
    const [editMode, setEditMode] = useState(false);
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [location, setLocation] = useState('');
    const [dob, setDob] = useState('');
    const [skills, setSkills] = useState([]);
    const [interests, setInterests] = useState('');
    const [aspirations, setAspirations] = useState([]);
    const [newSkill, setNewSkill] = useState('');

    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const data = await getMyProfile();
            setProfile(data);
            
            // Sync local editable state
            setFullName(data.full_name || '');
            setPhone(data.phone || '');
            setLocation(data.location || '');
            setDob(data.dob || '');
            setSkills(data.skills || []);
            setInterests(data.interests || '');
            setAspirations(data.aspirations || []);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch profile details.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleAddSkill = (e) => {
        if (e) e.preventDefault();
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setSkills(skills.filter(s => s !== skillToRemove));
    };

    const handleScanResume = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setExtracting(true);
        setError(null);
        try {
            const data = await extractSkills(file);
            if (data.skills && data.skills.length > 0) {
                const merged = [...new Set([...skills, ...data.skills])];
                setSkills(merged);
                setMessage(`AI Scan Complete: ${data.skills.length} skills identified.`);
            }
        } catch (err) {
            setError("AI Skill Extraction failed. Manual input required.");
        } finally {
            setExtracting(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setMessage(null);

        try {
            await updateProfile({
                full_name: fullName,
                phone: phone,
                location: location,
                dob: dob,
                skills: skills,
                interests: interests,
                aspirations: aspirations
            });
            setMessage("Profile updated successfully.");
            setEditMode(false);
            fetchProfile(); // Refresh underlying profile data
        } catch (err) {
            setError(err.response?.data?.detail || "Update failed. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSaving(true);
        setMessage(null);
        setError(null);

        try {
            const res = await uploadResume(file);
            setMessage(`Protocol Success: ${res.characters_extracted} units extracted.`);
            await fetchProfile();
        } catch (err) {
            setError(err.response?.data?.detail || 'Resume injection failed.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Loader fullScreen variant="logo" />;

    return (
        <div className="max-w-6xl mx-auto py-20 px-6 min-h-screen">
            <header className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-6xl font-sans font-bold text-zinc-900 tracking-tight">Identity</h1>
                    <p className="text-sm font-medium text-zinc-400 mt-3 flex items-center gap-2">
                        <Activity size={14} className="text-zinc-300" /> Professional Intelligence Dashboard
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => editMode ? handleSave() : setEditMode(true)}
                        disabled={saving}
                        className={`px-8 py-4 rounded-full font-bold text-xs transition-all flex items-center gap-3 shadow-xl shadow-zinc-900/10 ${
                            editMode 
                            ? 'bg-zinc-900 text-white hover:bg-zinc-800' 
                            : 'bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50'
                        }`}
                    >
                        {saving ? <RefreshCw size={16} className="animate-spin" /> : (editMode ? <Save size={16} /> : <Edit2 size={16} />)}
                        {editMode ? 'Save Changes' : 'Edit Profile'}
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Left Column: Basic Info */}
                <div className="lg:col-span-1 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white border border-zinc-100 rounded-[40px] p-10 shadow-xl shadow-zinc-900/5 relative overflow-hidden"
                    >
                        <div className="w-28 h-28 rounded-[38px] bg-zinc-900 grid place-items-center text-5xl font-bold text-white shadow-2xl shadow-zinc-900/20 mb-10">
                            {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        
                        <div className="space-y-8">
                            <div>
                                <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5 ml-1">Identity</label>
                                {editMode ? (
                                    <input 
                                        type="text" 
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 font-semibold text-sm focus:bg-white focus:ring-4 focus:ring-zinc-900/5 transition-all outline-none"
                                        placeholder="Full Name"
                                    />
                                ) : (
                                    <h2 className="text-2xl font-bold text-zinc-900 tracking-tight break-words">{profile?.full_name || 'Anonymous User'}</h2>
                                )}
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5 ml-1">Location</label>
                                    {editMode ? (
                                        <input 
                                            type="text" 
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 font-semibold text-sm focus:bg-white focus:ring-4 focus:ring-zinc-900/5 transition-all outline-none"
                                            placeholder="City, Country"
                                        />
                                    ) : (
                                        <p className="font-semibold flex items-center gap-2.5 text-zinc-600 text-sm">
                                            <MapPin size={16} className="text-zinc-300" /> {profile?.location || 'Not Specified'}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1.5 ml-1">Date of Birth</label>
                                    {editMode ? (
                                        <input 
                                            type="date" 
                                            value={dob}
                                            onChange={(e) => setDob(e.target.value)}
                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-2xl px-5 py-4 font-semibold text-sm text-zinc-900 focus:bg-white focus:ring-4 focus:ring-zinc-900/5 transition-all outline-none"
                                        />
                                    ) : (
                                        <p className="font-semibold flex items-center gap-2.5 text-zinc-600 text-sm">
                                            <Calendar size={16} className="text-zinc-300" /> {profile?.dob ? new Date(profile.dob).toLocaleDateString() : 'Not set'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Stats - Low Contrast Tiles */}
                    <div className="space-y-4">
                        <div className="p-8 bg-zinc-900 text-white rounded-[32px] shadow-xl shadow-zinc-900/10">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Network ID</p>
                            <p className="text-sm font-medium break-all">{user?.email}</p>
                        </div>
                        <div className="p-8 bg-white border border-zinc-100 rounded-[32px] shadow-sm">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-2">Linked Contact</p>
                            {editMode ? (
                                <input 
                                    type="tel" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-transparent border-0 border-b border-zinc-200 focus:border-zinc-900 focus:ring-0 p-0 font-bold text-zinc-900 placeholder:text-zinc-200"
                                    placeholder="+1 (555) 000-0000"
                                />
                            ) : (
                                <p className="text-base font-bold text-zinc-900">{profile?.phone || 'No Phone Linked'}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Questionnaire (Skills & Interests) */}
                <div className="lg:col-span-2 space-y-10">
                    <AnimatePresence mode="wait">
                        {message && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-black text-white p-5 rounded-2xl flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest shadow-2xl border-2 border-white"
                            >
                                <CheckCircle size={18} /> {message}
                            </motion.div>
                        )}
                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white text-black p-5 rounded-2xl flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest shadow-2xl border-4 border-black"
                            >
                                <AlertCircle size={18} /> {error}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Skills Selection */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white border border-zinc-100 rounded-[40px] p-10 shadow-sm"
                    >
                        <header className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">Competencies</h3>
                                <p className="text-xs font-medium text-zinc-400 mt-1">Refine your technical expertise matrix</p>
                            </div>
                            <label className="cursor-pointer">
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    onChange={handleScanResume}
                                    accept=".pdf,.docx"
                                    disabled={extracting}
                                />
                                <div className={`flex items-center gap-2.5 px-5 py-2.5 bg-zinc-50 border border-zinc-100 rounded-full text-[11px] font-bold text-zinc-600 hover:bg-zinc-900 hover:text-white transition-all shadow-sm ${extracting ? 'bg-zinc-900 text-white' : ''}`}>
                                    {extracting ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                    {extracting ? 'Synthesizing...' : 'AI Auto-Scan'}
                                </div>
                            </label>
                        </header>

                        {editMode && (
                            <div className="flex gap-3 mb-10">
                                <input
                                    type="text"
                                    value={newSkill}
                                    onChange={(e) => setNewSkill(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                                    className="flex-1 bg-zinc-50 border border-zinc-100 rounded-2xl px-6 py-4 font-semibold text-sm focus:bg-white focus:ring-4 focus:ring-zinc-900/5 transition-all outline-none"
                                    placeholder="Add a new competency (e.g. React, Docker)"
                                />
                                <button
                                    onClick={handleAddSkill}
                                    className="w-14 h-14 bg-zinc-900 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-zinc-900/10 hover:bg-zinc-800 transition-all active:scale-95"
                                >
                                    <Plus size={24} />
                                </button>
                            </div>
                        )}

                        <div className="flex flex-wrap gap-2.5">
                            {skills.length > 0 ? (
                                skills.map(skill => (
                                    <span 
                                        key={skill} 
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-50 border border-zinc-100 rounded-full text-xs font-semibold text-zinc-600 hover:bg-zinc-100 transition-colors"
                                    >
                                        {skill}
                                        {editMode && (
                                            <button onClick={() => handleRemoveSkill(skill)} className="text-zinc-300 hover:text-rose-500 transition-colors">
                                                <X size={14} />
                                            </button>
                                        )}
                                    </span>
                                ))
                            ) : (
                                <div className="w-full py-8 border border-dashed border-zinc-200 rounded-2xl flex flex-col items-center justify-center bg-zinc-50/50">
                                    <p className="text-xs font-medium text-zinc-400">No competency data detected.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Trajectory / Ambitions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white border border-zinc-100 rounded-[40px] p-10 shadow-sm"
                    >
                        <h3 className="text-2xl font-bold text-zinc-900 tracking-tight mb-1">Trajectory</h3>
                        <p className="text-xs font-medium text-zinc-400 mb-10">Define your ideal professional evolution</p>
                        
                        {editMode ? (
                            <textarea
                                value={interests}
                                onChange={(e) => setInterests(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-100 rounded-[32px] p-8 font-semibold text-sm focus:bg-white focus:ring-4 focus:ring-zinc-900/5 transition-all outline-none min-h-[180px] resize-none"
                                placeholder="Where do you see your career heading?"
                            />
                        ) : (
                            <div className="bg-zinc-50/30 rounded-[32px] p-10 border border-dashed border-zinc-200">
                                {interests ? (
                                    <p className="text-slate-600 text-base leading-relaxed font-medium">{interests}</p>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-4">
                                        <p className="text-xs font-medium text-zinc-300">Null Trajectory Defined.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {/* Aspirations Questionnaire */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-white border border-zinc-100 rounded-[40px] p-10 shadow-sm"
                    >
                        <h3 className="text-2xl font-bold text-zinc-900 tracking-tight mb-1">Aspirations</h3>
                        <p className="text-xs font-medium text-zinc-400 mb-10">Select your desired professional roles</p>
                        
                        {editMode ? (
                            <div>
                                <div className="flex flex-wrap gap-2.5">
                                    {DESIRED_JOB_ROLES.map(roleName => {
                                        const isSelected = aspirations.includes(roleName);
                                        return (
                                            <button
                                                key={roleName}
                                                type="button"
                                                onClick={() => {
                                                    if (isSelected) {
                                                        setAspirations(aspirations.filter(a => a !== roleName));
                                                    } else if (aspirations.length < 5) {
                                                        setAspirations([...aspirations, roleName]);
                                                    }
                                                }}
                                                className={`px-5 py-3 border rounded-full text-[11px] font-bold transition-all ${
                                                    isSelected 
                                                    ? 'bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-900/10' 
                                                    : 'bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200'
                                                } ${(aspirations.length >= 5 && !isSelected) ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                disabled={aspirations.length >= 5 && !isSelected}
                                            >
                                                {roleName}
                                            </button>
                                        );
                                    })}
                                </div>
                                {aspirations.length >= 5 && (
                                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mt-6 bg-rose-50 px-4 py-2 rounded-full inline-block">Maximum 5 roles selected</p>
                                )}
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2.5">
                                {aspirations.length > 0 ? (
                                    aspirations.map(aspiration => (
                                        <span 
                                            key={aspiration} 
                                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-full text-xs font-bold shadow-lg shadow-zinc-900/10"
                                        >
                                            <Target size={14} className="opacity-50" />
                                            {aspiration}
                                        </span>
                                    ))
                                ) : (
                                    <div className="w-full py-6 border border-dashed border-zinc-200 rounded-2xl flex items-center justify-center bg-zinc-50/50">
                                        <p className="text-xs font-medium text-zinc-300">No Aspirations Selected.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>

                    {/* Data Payload (Resume) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-zinc-900 text-white rounded-[40px] p-12 shadow-2xl shadow-zinc-900/20 overflow-hidden relative"
                    >
                        {/* Subtle background decoration */}
                        <div className="absolute -right-10 -bottom-10 opacity-[0.03]">
                            <FileText size={320} />
                        </div>
                        
                        <div className="relative z-10">
                            <h3 className="text-2xl font-bold tracking-tight mb-10 flex items-center gap-3">
                                <FileText size={24} className="text-zinc-500" /> Data Payload
                            </h3>
                            
                            <div className="flex flex-col md:flex-row items-center gap-10">
                                <div className={`w-24 h-24 rounded-[32px] flex items-center justify-center border transition-all duration-500 ${profile?.resume_text ? 'bg-green-500/10 border-green-500/20' : 'bg-white/5 border-white/10'}`}>
                                    <CheckCircle size={40} className={profile?.resume_text ? "text-green-400" : "text-zinc-700"} />
                                </div>
                                <div className="text-center md:text-left flex-1">
                                    <p className="font-bold text-xl tracking-tight mb-2">
                                        {profile?.resume_text ? "Resume Synchronized" : "Buffer Empty"}
                                    </p>
                                    <p className="text-xs font-medium text-zinc-400 leading-relaxed max-w-sm">
                                        {profile?.resume_text 
                                            ? `Last synchronized on ${new Date(profile.created_at).toLocaleDateString()}. Your data is actively used for AI tailoring.` 
                                            : "Upload your resume to initialize AI matching protocols and tailor your profile."}
                                    </p>
                                </div>
                                <label className="cursor-pointer bg-white text-zinc-900 px-8 py-5 rounded-full font-bold text-xs transition-all flex items-center gap-2.5 group shadow-xl hover:bg-zinc-100 active:scale-95">
                                    <input 
                                        type="file" 
                                        className="hidden" 
                                        onChange={handleResumeUpload}
                                        accept=".pdf,.docx"
                                    />
                                    <Upload size={18} className="group-hover:-translate-y-1 transition-transform" /> 
                                    Update Payload
                                </label>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
