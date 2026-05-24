import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, CheckCircle, X, AlertCircle, Info } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { TrainerNav } from "./TrainerCourses";
import { getCourses, updateModule } from "../../services/api";

export default function TrainerUploadNotes() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const initials = user?.username ? user.username.slice(0, 1).toUpperCase() : "T";
    const handleLogout = () => { logout(); navigate("/login"); };

    const [courses, setCourses] = useState([]);
    const [modules, setModules] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedModuleId, setSelectedModuleId] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadedStatus, setUploadedStatus] = useState(null); // 'success' or 'error'
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await getCourses();
            setCourses(data);
            if (data.length > 0) {
                // Keep selection if it exists, otherwise select first
                if (!selectedCourseId) setSelectedCourseId(data[0].id.toString());
            }
        } catch (err) {
            console.error("Failed to fetch courses", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (!selectedCourseId) {
            setModules([]);
            return;
        }
        const course = courses.find(c => c.id.toString() === selectedCourseId);
        if (course && course.modules) {
            setModules(course.modules);
            // Default to first module if none selected or if selection not in new list
            if (!selectedModuleId || !course.modules.find(m => m.id.toString() === selectedModuleId)) {
                if (course.modules.length > 0) setSelectedModuleId(course.modules[0].id.toString());
                else setSelectedModuleId("");
            }
        } else {
            setModules([]);
            setSelectedModuleId("");
        }
    }, [selectedCourseId, courses]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 20 * 1024 * 1024) {
            alert("File is too large. Max 20MB allowed.");
            return;
        }
        setSelectedFile(file || null);
        setUploadedStatus(null);
        setErrorMessage("");
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedModuleId || !selectedFile) {
            setUploadedStatus('error');
            setErrorMessage("Please select a module and a file.");
            return;
        }

        setUploading(true);
        setUploadedStatus(null);
        setErrorMessage("");

        try {
            const formData = new FormData();
            formData.append('notes_file', selectedFile);

            await updateModule(selectedModuleId, formData);

            setUploadedStatus('success');
            setSelectedFile(null);
            // Reload all data to refresh "Recently Uploaded" list
            await loadData();
        } catch (err) {
            console.error("Upload failed", err);
            setUploadedStatus('error');
            setErrorMessage(err.response?.data?.detail || "Notes upload failed. Access Restricted (403).");
        } finally {
            setUploading(false);
        }
    };

    // Derived list for "Previously Uploaded"
    const uploadedFiles = courses.flatMap(c =>
        (c.modules || [])
            .filter(m => m.notes_file)
            .map(m => ({
                id: m.id,
                name: m.notes_file.split('/').pop(),
                courseTitle: c.title,
                moduleTitle: m.title,
                date: new Date(m.created_at || Date.now()).toLocaleDateString(),
                url: m.notes_file
            }))
    ).sort((a, b) => new Date(b.date) - new Date(a.date));

    if (loading && courses.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Synchronizing materials...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            <TrainerNav active="upload" initials={initials} onLogout={handleLogout} />

            <main className="max-w-6xl mx-auto px-6 py-10 space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">Upload Learning Materials</h1>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="h-1/2 w-0.5 bg-blue-600 rounded-full"></span>
                            <p className="text-xs text-slate-400 font-medium">Equip your students with PDFs, slides, and documentation.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-[1.5rem] border-2 border-slate-100 shadow-sm self-start">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <Info size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Enrollments</p>
                            <p className="text-xl font-black text-slate-800">
                                {courses.reduce((acc, c) => acc + (c.enrollment_count || 0), 0)} Students
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                    {/* Upload Form Container */}
                    <div className="lg:col-span-2 space-y-5">
                        <form onSubmit={handleUpload} className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-5 space-y-5">
                            <div className="flex items-center justify-between mb-1">
                                <h2 className="font-bold text-sm text-slate-800 tracking-tight uppercase">Material Deployment</h2>
                                {uploading && <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />}
                            </div>

                            {/* Status Messages */}
                            {uploadedStatus === 'success' && (
                                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
                                    <CheckCircle size={18} /> Asset deployed successfully
                                </div>
                            )}

                            {uploadedStatus === 'error' && (
                                <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl px-5 py-4 text-[11px] font-black uppercase tracking-widest animate-in shake">
                                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                                    <span>{errorMessage}</span>
                                </div>
                            )}

                            {/* Selectors */}
                            <div className="space-y-4">
                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">Select Course</label>
                                    <select
                                        value={selectedCourseId}
                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                        className="w-full border-2 border-slate-50 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer group-hover:bg-white"
                                        required
                                    >
                                        <option value="">-- Select target course --</option>
                                        {courses.map((c) => (
                                            <option key={c.id} value={c.id}>{c.title}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="group">
                                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1 group-focus-within:text-blue-600 transition-colors">Select target Module</label>
                                    <select
                                        value={selectedModuleId}
                                        onChange={(e) => setSelectedModuleId(e.target.value)}
                                        className="w-full border-2 border-slate-50 rounded-2xl px-5 py-4 text-sm font-bold text-slate-700 bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer group-hover:bg-white disabled:opacity-50"
                                        required
                                        disabled={!selectedCourseId || modules.length === 0}
                                    >
                                        {modules.length === 0 ? (
                                            <option value="">No modules available</option>
                                        ) : (
                                            <>
                                                <option value="">-- Select target module --</option>
                                                {modules.map((m) => (
                                                    <option key={m.id} value={m.id}>{m.title}</option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>

                            {/* Dropzone */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest ml-1">Upload Source</label>
                                <label className={`w-full border-2 border-dashed ${selectedFile ? 'border-blue-400 bg-blue-50/30' : 'border-slate-100'} rounded-3xl flex flex-col items-center justify-center py-12 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group/drop`}>
                                    <div className={`w-12 h-12 ${selectedFile ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-300'} rounded-xl flex items-center justify-center mb-4 group-hover/drop:scale-110 group-hover/drop:rotate-6 transition-all shadow-lg shadow-blue-500/10`}>
                                        <Upload size={22} />
                                    </div>
                                    {selectedFile ? (
                                        <div className="text-center">
                                            <p className="text-sm font-black text-slate-800 uppercase tracking-tight line-clamp-1 px-4">{selectedFile.name}</p>
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <p className="text-sm text-slate-400 font-bold tracking-tight">Click to browse material</p>
                                            <p className="text-[10px] font-black text-slate-300 mt-2 uppercase tracking-widest">Supports PDFs, DOCX, PPTs</p>
                                        </div>
                                    )}
                                    <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" className="hidden" onChange={handleFileChange} />
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={uploading || !selectedFile || !selectedModuleId}
                                className={`w-full bg-slate-900 text-white py-6 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl shadow-slate-200/50 active:scale-95 disabled:opacity-50 disabled:grayscale disabled:hover:bg-slate-900 flex items-center justify-center gap-3`}
                            >
                                {uploading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Uploading...
                                    </>
                                ) : 'Initialize Upload'}
                            </button>
                        </form>
                    </div>

                    {/* Repository List */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 p-6 min-h-full">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                                        <FileText size={16} />
                                    </div>
                                    <h2 className="font-bold text-sm text-slate-800 tracking-tight uppercase">Learning Repository</h2>
                                </div>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                                    {uploadedFiles.length} Live Files
                                </span>
                            </div>

                            <div className="space-y-4">
                                {uploadedFiles.length > 0 ? (
                                    uploadedFiles.map((file, i) => (
                                        <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[1.8rem] border-2 border-transparent hover:border-blue-100 hover:bg-blue-50/20 transition-all group">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-blue-500 group-hover:scale-110 group-hover:rotate-3 transition-all">
                                                    <FileText size={24} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-base text-slate-800 uppercase tracking-tight leading-tight group-hover:text-blue-700 transition-colors">{file.name}</p>
                                                    <div className="flex items-center gap-3 mt-1.5">
                                                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">{file.courseTitle}</span>
                                                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{file.moduleTitle}</span>
                                                        <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{file.date}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-200 hover:text-rose-500 hover:border-rose-100 transition-all shadow-sm">
                                                    <X size={16} />
                                                </button>
                                            </div>

                                        </div>
                                    ))
                                ) : (
                                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem] bg-slate-50/20">
                                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                            <FileText size={32} className="text-slate-100" />
                                        </div>
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-tight">No materials in repository</p>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">Upload notes to distribute to your students</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
