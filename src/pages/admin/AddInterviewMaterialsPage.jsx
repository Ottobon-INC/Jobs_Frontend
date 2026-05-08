import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
    uploadInterviewMaterial, 
    fetchInterviewMaterials, 
    deleteInterviewMaterial,
    fetchFolders,
    createFolder,
    deleteFolder,
    updateFolder
} from '../../api/interviewMaterialsApi';
import { Upload, FileText, CheckCircle, AlertCircle, Trash2, Loader2, FolderPlus, Folder, Plus, X, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddInterviewMaterialsPage = () => {
    const { role } = useAuth();
    
    // Form state
    const [companyName, setCompanyName] = useState('');
    const [title, setTitle] = useState('');
    const [selectedFolderId, setSelectedFolderId] = useState('');
    const [files, setFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [editingFolderId, setEditingFolderId] = useState(null);
    const [renameValue, setRenameValue] = useState('');
    
    // UI state
    const [status, setStatus] = useState(null); // 'success' | 'error' | null
    const [errorMessage, setErrorMessage] = useState('');
    const [showNewFolderModal, setShowNewFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    
    // Data state
    const [materials, setMaterials] = useState([]);
    const [folders, setFolders] = useState([]);
    const [isLoadingMaterials, setIsLoadingMaterials] = useState(true);
    const [isLoadingFolders, setIsLoadingFolders] = useState(true);

    useEffect(() => {
        if (role === 'admin') {
            loadMaterials();
            loadFolders();
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

    const loadFolders = async () => {
        try {
            setIsLoadingFolders(true);
            const data = await fetchFolders();
            setFolders(data);
        } catch (error) {
            console.error('Failed to fetch folders:', error);
        } finally {
            setIsLoadingFolders(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 0) {
            setFiles(selectedFiles);
        }
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        setIsCreatingFolder(true);
        try {
            const folder = await createFolder(newFolderName);
            setFolders([...folders, folder].sort((a, b) => a.name.localeCompare(b.name)));
            setNewFolderName('');
            setShowNewFolderModal(false);
            setSelectedFolderId(folder.id);
        } catch (error) {
            alert(error.response?.data?.detail || 'Failed to create folder');
        } finally {
            setIsCreatingFolder(false);
        }
    };

    const handleDeleteFolder = async (e, id, name) => {
        e.stopPropagation();
        if (!window.confirm(`Are you sure you want to delete the folder "${name}"? This will NOT delete the files, but they will become unorganized.`)) return;

        try {
            await deleteFolder(id);
            setFolders(folders.filter(f => f.id !== id));
            if (selectedFolderId === id) setSelectedFolderId('');
            loadMaterials(); // Reload to see updated folder associations
        } catch (error) {
            alert('Failed to delete folder. It might still contain materials or an error occurred.');
        }
    };

    const handleRenameFolder = async (id) => {
        if (!renameValue.trim()) return;
        try {
            await updateFolder(id, renameValue.trim());
            setFolders(folders.map(f => f.id === id ? { ...f, name: renameValue.trim() } : f));
            setEditingFolderId(null);
            setRenameValue('');
        } catch (error) {
            alert('Failed to rename folder');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (files.length === 0) {
            setStatus('error');
            setErrorMessage('Please select at least one file.');
            return;
        }

        setIsUploading(true);
        setStatus(null);
        
        const formData = new FormData();
        const finalCompanyName = companyName.trim() || (selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : 'General');
        formData.append('company_name', finalCompanyName);
        formData.append('title', title);
        
        files.forEach(file => {
            formData.append('files', file);
        });

        if (selectedFolderId) {
            formData.append('folder_id', selectedFolderId);
        }

        try {
            await uploadInterviewMaterial(formData);
            setStatus('success');
            // Reset form
            setCompanyName('');
            setTitle('');
            setFiles([]);
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
            <div className="max-w-6xl mx-auto space-y-8">
                
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Materials Management</h1>
                        <p className="text-zinc-500">Organize and upload company-specific training materials.</p>
                    </div>
                    <button 
                        onClick={() => setShowNewFolderModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all shadow-sm"
                    >
                        <FolderPlus size={18} />
                        New Folder
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* Folders Sidebar */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm">
                            <h2 className="text-lg font-bold text-zinc-900 mb-4 flex items-center gap-2">
                                <Folder size={20} className="text-indigo-500" />
                                Folders
                            </h2>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                <button 
                                    onClick={() => setSelectedFolderId('')}
                                    className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between group ${
                                        selectedFolderId === '' ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-600 hover:bg-zinc-100'
                                    }`}
                                >
                                    <span>All Materials</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedFolderId === '' ? 'bg-white/20' : 'bg-zinc-100'}`}>
                                        {materials.length}
                                    </span>
                                </button>
                                {isLoadingFolders ? (
                                    <div className="py-4 flex justify-center">
                                        <Loader2 size={16} className="animate-spin text-zinc-400" />
                                    </div>
                                ) : (
                                    folders.map(folder => (
                                        <button 
                                            key={folder.id}
                                            onClick={() => setSelectedFolderId(folder.id)}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center justify-between group ${
                                                selectedFolderId === folder.id ? 'bg-indigo-600 text-white font-semibold' : 'text-zinc-600 hover:bg-zinc-100'
                                            }`}
                                        >
                                            {editingFolderId === folder.id ? (
                                                <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                    <input 
                                                        type="text"
                                                        value={renameValue}
                                                        onChange={(e) => setRenameValue(e.target.value)}
                                                        className="flex-1 px-2 py-1 bg-white border border-zinc-300 rounded text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleRenameFolder(folder.id);
                                                            if (e.key === 'Escape') setEditingFolderId(null);
                                                        }}
                                                    />
                                                    <Check 
                                                        size={14} 
                                                        className="text-green-600 cursor-pointer" 
                                                        onClick={() => handleRenameFolder(folder.id)} 
                                                    />
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="truncate mr-2">{folder.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${selectedFolderId === folder.id ? 'bg-white/20' : 'bg-zinc-100'}`}>
                                                            {materials.filter(m => m.folder_id === folder.id).length}
                                                        </span>
                                                        <Edit2 
                                                            size={12} 
                                                            className="opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity cursor-pointer" 
                                                            onClick={(e) => { 
                                                                e.stopPropagation(); 
                                                                setEditingFolderId(folder.id); 
                                                                setRenameValue(folder.name); 
                                                            }} 
                                                        />
                                                        <X 
                                                            size={14} 
                                                            className="opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity cursor-pointer" 
                                                            onClick={(e) => handleDeleteFolder(e, folder.id, folder.name)}
                                                        />
                                                    </div>
                                                </>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Upload Form */}
                    <div className="lg:col-span-4">
                        <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-sm h-fit sticky top-8">
                            <h2 className="text-xl font-bold text-zinc-900 mb-6">Upload Material</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                
                                <AnimatePresence>
                                    {status && (
                                        <motion.div 
                                            initial={{ opacity: 0, height: 0 }} 
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className={`border p-4 rounded-2xl flex items-start gap-3 ${
                                                status === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                                            }`}
                                        >
                                            {status === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                                            <div>
                                                <p className="font-semibold text-sm">{status === 'success' ? 'Upload Successful!' : 'Upload Failed'}</p>
                                                {errorMessage && <p className="text-xs opacity-90 mt-1">{errorMessage}</p>}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-zinc-700">Folder</label>
                                        <select 
                                            value={selectedFolderId}
                                            onChange={(e) => setSelectedFolderId(e.target.value)}
                                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        >
                                            <option value="">No Folder (Unorganized)</option>
                                            {folders.map(f => (
                                                <option key={f.id} value={f.id}>{f.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-sm font-semibold text-zinc-700">Company Name</label>
                                            <span className="text-[10px] text-zinc-400 font-bold uppercase">Optional</span>
                                        </div>
                                        <input 
                                            type="text" 
                                            value={companyName}
                                            onChange={(e) => setCompanyName(e.target.value)}
                                            placeholder={selectedFolderId ? `Defaults to "${folders.find(f => f.id === selectedFolderId)?.name}"` : "e.g. Google"}
                                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <label className="block text-sm font-semibold text-zinc-700">Document Title</label>
                                            <span className="text-[10px] text-zinc-400 font-bold uppercase">Optional</span>
                                        </div>
                                        <input 
                                            type="text" 
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Defaults to filename if empty"
                                            className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-zinc-700">Upload File</label>
                                        <label 
                                            htmlFor="file-upload" 
                                            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all ${
                                                files.length > 0 ? 'border-indigo-500 bg-indigo-50' : 'border-zinc-300 hover:border-zinc-400 bg-zinc-50'
                                            }`}
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                {files.length > 0 ? (
                                                    <>
                                                        <FileText className="text-indigo-600 mb-2" size={24} />
                                                        <p className="text-sm font-semibold text-indigo-600">
                                                            {files.length} file{files.length > 1 ? 's' : ''} selected
                                                        </p>
                                                        <p className="text-[10px] text-indigo-400 truncate max-w-[200px]">
                                                            {files.map(f => f.name).join(', ')}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Upload className="text-zinc-400 mb-2" size={24} />
                                                        <p className="text-sm text-zinc-500">Click to upload (PDF/Docx)</p>
                                                        <p className="text-[10px] text-zinc-400 mt-1">You can select multiple files</p>
                                                    </>
                                                )}
                                            </div>
                                            <input id="file-upload" type="file" className="hidden" accept=".pdf,.docx" multiple onChange={handleFileChange} />
                                        </label>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isUploading || files.length === 0}
                                    className="w-full py-3 bg-zinc-900 text-white rounded-2xl font-semibold text-sm hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                                >
                                    {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                                    {isUploading ? 'Uploading...' : 'Upload Material'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Materials List */}
                    <div className="lg:col-span-5">
                        <div className="bg-white border border-zinc-200 rounded-[2rem] p-8 shadow-sm flex flex-col h-[750px]">
                            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center justify-between">
                                {selectedFolderId ? folders.find(f => f.id === selectedFolderId)?.name : 'All Materials'}
                                <span className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-xs font-semibold">
                                    {materials.filter(m => !selectedFolderId || m.folder_id === selectedFolderId).length} files
                                </span>
                            </h2>
                            
                            <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                                {isLoadingMaterials ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="animate-spin text-zinc-400" size={24} />
                                    </div>
                                ) : materials.filter(m => !selectedFolderId || m.folder_id === selectedFolderId).length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                                        <FileText size={32} className="mb-2 opacity-50" />
                                        <p className="text-sm">No materials in this folder.</p>
                                    </div>
                                ) : (
                                    materials
                                        .filter(m => !selectedFolderId || m.folder_id === selectedFolderId)
                                        .map((material) => (
                                            <div key={material.id} className="flex items-center justify-between p-4 rounded-2xl border border-zinc-100 bg-zinc-50 hover:bg-white hover:shadow-sm transition-all group">
                                                <div className="flex items-start gap-3 overflow-hidden">
                                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-zinc-100 flex items-center justify-center text-indigo-500 shrink-0">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-sm text-zinc-900 truncate">{material.title}</h3>
                                                        <p className="text-xs text-zinc-500 truncate">
                                                            {material.company_name} • {new Date(material.created_at).toLocaleDateString()}
                                                            {!selectedFolderId && material.folder_id && (
                                                                <span className="ml-2 text-indigo-500 font-medium">
                                                                    in {folders.find(f => f.id === material.folder_id)?.name}
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleDelete(material.id)}
                                                    className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100 shrink-0"
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

            {/* New Folder Modal */}
            <AnimatePresence>
                {showNewFolderModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-zinc-900/40 backdrop-blur-sm">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[2rem] p-8 shadow-xl border border-zinc-200 w-full max-w-md"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-zinc-900">Create New Folder</h3>
                                <button onClick={() => setShowNewFolderModal(false)} className="text-zinc-400 hover:text-zinc-600">
                                    <X size={24} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateFolder} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-zinc-700">Folder Name</label>
                                    <input 
                                        autoFocus
                                        type="text" 
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        placeholder="e.g. Google Interview Prep"
                                        className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        required
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setShowNewFolderModal(false)}
                                        className="flex-1 py-3 bg-zinc-100 text-zinc-600 rounded-2xl font-semibold text-sm hover:bg-zinc-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        disabled={isCreatingFolder || !newFolderName.trim()}
                                        className="flex-[2] py-3 bg-indigo-600 text-white rounded-2xl font-semibold text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        {isCreatingFolder ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                        Create Folder
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AddInterviewMaterialsPage;
