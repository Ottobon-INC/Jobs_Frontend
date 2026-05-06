import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { uploadInterviewMaterial, fetchInterviewMaterials, deleteInterviewMaterial } from '../../api/interviewMaterialsApi';
import { Upload, FileText, CheckCircle, AlertCircle, Trash2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AddInterviewMaterialsPage = () => {
    const { role } = useAuth();
    const [companyName, setCompanyName] = useState('');
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState(null); // 'success' | 'error' | null
    const [errorMessage, setErrorMessage] = useState('');
    
    const [materials, setMaterials] = useState([]);
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);

    useEffect(() => {
        if (role === 'admin') {
            loadMaterials();
        }
    }, [role]);

    const loadMaterials = async () => {
        try {
            setIsLoadingMaterials(true);
            const data = await fetchInterviewMaterials();
            setMaterials(data);
        } catch (error) {
            console.error('Failed to fetch materials:', error);
        } finally {
            setIsLoadingMaterials(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file || !companyName || !title) {
            setStatus('error');
            setErrorMessage('Please fill out all fields and select a file.');
            return;
        }

        setIsUploading(true);
        setStatus(null);
        
        const formData = new FormData();
        formData.append('company_name', companyName);
        formData.append('title', title);
        formData.append('file', file);

        try {
            await uploadInterviewMaterial(formData);
            setStatus('success');
            // Reset form
            setCompanyName('');
            setTitle('');
            setFile(null);
            const fileInput = document.getElementById('file-upload');
            if (fileInput) fileInput.value = '';
            
            // Reload list
            loadMaterials();
        } catch (error) {
            setStatus('error');
            setErrorMessage(error.response?.data?.detail || 'An error occurred during upload. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this material?')) return;
        
        try {
            await deleteInterviewMaterial(id);
            setMaterials(materials.filter(m => m.id !== id));
        } catch (error) {
            console.error('Failed to delete material:', error);
            alert('Failed to delete material. Please try again.');
        }
    };

    if (role !== 'admin') {
        return (
            <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
                <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-zinc-200">
                    <h2 className="text-2xl font-bold text-zinc-900 mb-2">Access Denied</h2>
                    <p className="text-zinc-500">You need administrator privileges to access this page.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 py-12 px-6">
            <div className="max-w-4xl mx-auto space-y-8">
                
                <header className="space-y-2">
                    <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Data Management</h1>
                    <p className="text-zinc-500">Upload and manage interview materials across all companies.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column: Upload Form */}
                    <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-sm h-fit">
                        <h2 className="text-xl font-bold text-zinc-900 mb-6">Upload Material</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            
                            {status === 'success' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-2xl flex items-start gap-3"
                                >
                                    <CheckCircle className="shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="font-semibold text-sm">Upload Successful!</p>
                                    </div>
                                </motion.div>
                            )}

                            {status === 'error' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }} 
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-start gap-3"
                                >
                                    <AlertCircle className="shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <p className="font-semibold text-sm">Upload Failed</p>
                                        <p className="text-sm opacity-90 mt-1">{errorMessage}</p>
                                    </div>
                                </motion.div>
                            )}

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-zinc-700">Company Name</label>
                                    <input 
                                        type="text" 
                                        value={companyName}
                                        onChange={(e) => setCompanyName(e.target.value)}
                                        placeholder="e.g. Google"
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-zinc-700">Document Title</label>
                                    <input 
                                        type="text" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="e.g. 2024 SDE Questions"
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-zinc-700">Upload File</label>
                                    
                                    <label 
                                        htmlFor="file-upload" 
                                        className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all ${
                                            file ? 'border-indigo-500 bg-indigo-50' : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50 hover:bg-zinc-100'
                                        }`}
                                    >
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {file ? (
                                                <>
                                                    <FileText className="text-indigo-600 mb-2" size={24} />
                                                    <p className="text-sm font-semibold text-indigo-600">{file.name}</p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="text-zinc-400 mb-2" size={24} />
                                                    <p className="text-sm text-zinc-500">Click to upload (Max 3MB)</p>
                                                </>
                                            )}
                                        </div>
                                        <input 
                                            id="file-upload" 
                                            type="file" 
                                            className="hidden" 
                                            accept=".pdf,.docx"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                </div>
                            </div>

                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isUploading || !file || !companyName || !title}
                                    className="w-full py-3 bg-zinc-900 text-white rounded-2xl font-semibold text-sm hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload size={18} />
                                            Upload Material
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>

                    {/* Right Column: Existing Materials */}
                    <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-sm flex flex-col h-[600px]">
                        <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center justify-between">
                            Uploaded Materials
                            <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-xs font-semibold">
                                {materials.length} files
                            </span>
                        </h2>
                        
                        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                            {isLoadingMaterials ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="animate-spin text-zinc-400" size={24} />
                                </div>
                            ) : materials.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                                    <FileText size={32} className="mb-2 opacity-50" />
                                    <p className="text-sm">No materials uploaded yet.</p>
                                </div>
                            ) : (
                                materials.map((material) => (
                                    <div key={material.id} className="flex items-center justify-between p-4 rounded-2xl border border-zinc-100 bg-zinc-50 hover:bg-white hover:shadow-sm transition-all group">
                                        <div className="flex items-start gap-3 overflow-hidden">
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center text-indigo-500 shrink-0">
                                                <FileText size={18} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-sm text-zinc-900 truncate">{material.title}</h3>
                                                <p className="text-xs text-zinc-500 truncate">{material.company_name} • {new Date(material.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(material.id)}
                                            className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 focus:opacity-100 shrink-0 ml-2"
                                            title="Delete Material"
                                        >
                                            <Trash2 size={16} />
                                        </button>
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

export default AddInterviewMaterialsPage;
