import React, { useState } from "react";
import {
    LayoutDashboard,
    BookOpen,
    Users,
    UserRound,
    ClipboardCheck,
    ChevronDown,
    Plus,
    Trash2,
    Download,
    Video,
    UserPlus,
    Edit3,
    Search,
    X,
    UploadCloud,
    ExternalLink,
    FileText,
    History,
    FileDown,
    ArrowLeft,
    Settings
} from "lucide-react";
import { Link, useParams, NavLink as RouterNavLink } from "react-router-dom";
import logo from "../../assets/logo.png";
import { getCourse, enrollStudent, deleteModule, assignTrainer, unassignTrainer, toggleTrainerActivation, createCourseBatch } from "../../services/api";
import ModuleModal from "./ModuleModal";
import EditCourseModal from "./EditCourseModal";

export default function AdminCourseDetail() {
    const { courseId } = useParams();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Details");
    const [enrolledEmail, setEnrolledEmail] = useState("");
    const [batchEnrollText, setBatchEnrollText] = useState("");
    const [trainerEmail, setTrainerEmail] = useState("");
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [moduleToEdit, setModuleToEdit] = useState(null);
    const [assigning, setAssigning] = useState(false);
    const [trainerNameInput, setTrainerNameInput] = useState("");
    const [selectedBatch, setSelectedBatch] = useState("Batch 1");
    const [isCreateBatchOpen, setIsCreateBatchOpen] = useState(false);
    const [newBatchName, setNewBatchName] = useState("");
    const [batches, setBatches] = useState([]);

    // Derive batches from loaded course data
    const BATCHES = course?.batches?.length > 0 ? course.batches.map(b => b.name) : ["Batch 1"];

    const handleCreateBatch = async () => {
        const trimmed = newBatchName.trim();
        if (!trimmed) return;
        try {
            await createCourseBatch(courseId, trimmed);
            setSelectedBatch(trimmed);
            setNewBatchName("");
            setIsCreateBatchOpen(false);
            loadCourse();
        } catch (err) {
            console.error("Failed to create batch", err);
            alert(err.response?.data?.error || "Failed to create batch");
        }
    };


    const loadCourse = async () => {
        try {
            const data = await getCourse(courseId);
            setCourse(data);
        } catch (err) {
            console.error("Failed to load course details", err);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadCourse();
    }, [courseId]);

    const handleModuleSuccess = () => {
        loadCourse();
    };

    const handleDeleteModule = async (moduleId) => {
        if (window.confirm("Are you sure you want to delete this module?")) {
            try {
                await deleteModule(moduleId);
                loadCourse();
            } catch (err) {
                console.error("Failed to delete module", err);
                alert("Failed to delete module. Please try again.");
            }
        }
    };

    const openCreateModuleModal = () => {
        setModuleToEdit(null);
        setIsModuleModalOpen(true);
    };

    const openEditModuleModal = (module) => {
        setModuleToEdit(module);
        setIsModuleModalOpen(true);
    };

    const handleBatchEnroll = async () => {
        if (!batchEnrollText.trim()) return;

        const lines = batchEnrollText.split('\n').filter(line => line.trim() !== "");
        let successCount = 0;
        let failCount = 0;

        for (const line of lines) {
            const parts = line.split(',');
            const email = (parts.length > 1 ? parts[1] : parts[0]).trim();

            if (!email) continue;

            try {
                await enrollStudent({
                    course: courseId,
                    email: email,
                    batch: selectedBatch
                });
                successCount++;
            } catch (err) {
                console.error(`Failed to enroll ${email}:`, err);
                failCount++;
            }
        }

        if (successCount > 0 || failCount > 0) {
            alert(`Enrollment processing complete.\nSuccess: ${successCount}\nFailed: ${failCount}`);
            setBatchEnrollText("");
            loadCourse();
        }
    };

    const handleAssignTrainer = async () => {
        if (!trainerEmail.trim()) return;
        setAssigning(true);
        try {
            await assignTrainer(courseId, trainerEmail, trainerNameInput, selectedBatch);
            setTrainerEmail("");
            setTrainerNameInput("");
            loadCourse();
        } catch (err) {
            console.error("Failed to assign trainer", err);
            alert(err.response?.data?.error || "Failed to assign trainer");
        } finally {
            setAssigning(false);
        }
    };


    const handleUnassignTrainer = async (userId) => {
        if (window.confirm("Are you sure you want to remove this trainer from this batch?")) {
            try {
                await unassignTrainer(courseId, userId, selectedBatch);
                loadCourse();
            } catch (err) {
                console.error("Failed to unassign trainer", err);
                alert("Failed to remove trainer");
            }
        }
    };

    const handleToggleActive = async (userId, currentStatus) => {
        try {
            await toggleTrainerActivation(courseId, userId, !currentStatus, selectedBatch);
            loadCourse();
        } catch (err) {
            console.error("Failed to toggle trainer status", err);
            alert("Failed to update status");
        }
    };

    if (loading) return <div className="p-10 text-center text-slate-500 font-medium">Loading course details...</div>;
    if (!course) return <div className="p-10 text-center text-red-500 font-bold">Course not found.</div>;

    const displayTitle = course?.title || "Course Detail";

    // Filter data based on selected batch
    const allEnrolledUsers = course?.enrolled_students || [];
    const enrolledUsers = allEnrolledUsers.filter(u => u.batch === selectedBatch);

    const allVideos = course?.modules || [];
    const videos = allVideos.filter(v => v.batch === selectedBatch);

    const allTrainers = course?.trainers || [];
    const trainers = allTrainers.filter(t => t.batch === selectedBatch);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navigation */}
            <nav className="bg-[#2563EB] text-white px-6 py-2 shadow-sm sticky top-0 z-50">
                <div className="max-w-5xl mx-auto grid grid-cols-3 items-center">
                    {/* Left: Logo */}
                    <div className="flex items-center">
                        <img
                            src={logo}
                            alt="AIDEAS"
                            className="h-10 w-auto filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all hover:drop-shadow-[0_0_15px_rgba(255,255,255,1)]"
                        />
                    </div>

                    {/* Center: Nav Links */}
                    <div className="hidden lg:flex items-center justify-center space-x-6">
                        <NavLink to="/admin-dashboard" icon={<LayoutDashboard size={14} />} label="Dashboard" />
                        <NavLink to="/admin-courses" icon={<BookOpen size={14} />} label="Courses" active />
                        <NavLink to="/admin-users" icon={<Users size={14} />} label="Users" />
                        <NavItem icon={<UserRound size={14} />} label="Instructors" />
                        <NavItem icon={<ClipboardCheck size={14} />} label="Enrollments" />
                        <NavItem icon={<ClipboardCheck size={14} />} label="Assessments" />
                    </div>

                    {/* Right: User Profile */}
                    <div className="flex items-center justify-end">
                        <div className="flex items-center space-x-3 bg-white/10 px-3 py-1.5 rounded-full border border-white/20 hover:bg-white/20 transition-all cursor-pointer">
                            <div className="w-6 h-6 rounded-full bg-orange-400 flex items-center justify-center font-bold text-[10px]">A</div>
                            <span className="font-semibold text-xs tracking-tight">aideas</span>
                            <ChevronDown size={14} />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-5xl mx-auto px-6 py-6">
                {/* Header Section */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-slate-800">{displayTitle}</h1>
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-bold text-slate-600">Select Batch:</label>
                        <select
                            value={selectedBatch}
                            onChange={(e) => setSelectedBatch(e.target.value)}
                            className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block px-4 py-2 font-semibold shadow-sm outline-none"
                        >
                            {BATCHES.map(b => (
                                <option key={b} value={b}>{b}</option>
                            ))}
                        </select>
                        <button
                            onClick={() => setIsCreateBatchOpen(true)}
                            className="flex items-center gap-1.5 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm whitespace-nowrap"
                        >
                            <Plus size={14} /> Create Batch
                        </button>
                    </div>
                </div>

                {/* Two Column Layout: Sidebar + Content */}
                <div className="grid grid-cols-[240px_1fr] gap-6">
                    {/* Left Sidebar Navigation */}
                    <div className="space-y-2">
                        {/* Back Button */}
                        <Link
                            to="/admin-courses"
                            className="flex items-center gap-2 px-4 py-3 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all font-medium text-sm group"
                        >
                            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Back</span>
                        </Link>

                        {/* Divider */}
                        <div className="border-t border-slate-200 my-4"></div>

                        {/* Navigation Items */}
                        <nav className="space-y-1">
                            {[
                                { name: "Details", icon: <FileText size={18} /> },
                                { name: "Videos", icon: <Video size={18} /> },
                                { name: "Enrolled By", icon: <Users size={18} /> },
                                { name: "Assign Trainers", icon: <Settings size={18} /> },


                            ].map((item) => (
                                <button
                                    key={item.name}
                                    onClick={() => setActiveTab(item.name)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-all ${activeTab === item.name
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-800"
                                        }`}
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Right Content Area */}
                    <div className="animate-in fade-in duration-300">
                        {activeTab === "Details" && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-blue-50/50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
                                    <h2 className="font-bold text-slate-700">Course Information</h2>
                                    <button
                                        onClick={() => setIsEditModalOpen(true)}
                                        className="flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
                                    >
                                        <Edit3 size={14} /> Edit
                                    </button>
                                </div>
                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title</label>
                                        <p className="text-slate-700 font-semibold text-sm">{course.title}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                                        <p className="text-slate-700 font-semibold text-sm">{course.description || "No description provided."}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Enrolled</label>
                                        <p className="text-slate-700 font-bold">{enrolledUsers.length} students</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Sessions</label>
                                        <p className="text-slate-700 font-bold">{videos.length} videos</p>
                                    </div>
                                    <div className="col-span-full space-y-2">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Thumbnail</label>
                                        <div className="w-56 h-32 rounded-xl overflow-hidden shadow-md border border-slate-200 bg-slate-50">
                                            {course.image ? (
                                                <img
                                                    src={(course.image && !course.image.startsWith('http'))
                                                        ? `${course.image.startsWith('/') ? '' : '/media/'}${course.image}`
                                                        : course.image}
                                                    alt="Thumbnail"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <BookOpen size={24} className="text-slate-300" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "Videos" && (
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-blue-50/50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
                                    <h2 className="font-bold text-slate-700">Course Videos</h2>
                                    <button
                                        onClick={openCreateModuleModal}
                                        className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                                    >
                                        <UploadCloud size={16} /> Add New Module
                                    </button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100">
                                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title</th>
                                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Video URL</th>
                                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notes</th>
                                                <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {videos.length > 0 ? videos.map((v) => (
                                                <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                                                    <td className="px-6 py-3 text-sm font-semibold text-slate-700">{v.title}</td>
                                                    <td className="px-6 py-3 text-sm text-slate-500">
                                                        {v.created_at ? new Date(v.created_at).toLocaleDateString() : "2/12/2026"}
                                                    </td>
                                                    <td className="px-6 py-3 text-sm text-blue-600 font-medium">
                                                        {v.video_url ? (
                                                            <a href={v.video_url} target="_blank" rel="noreferrer" className="hover:underline flex items-center gap-1.5 truncate max-w-[200px]">
                                                                {v.video_url} <ExternalLink size={10} />
                                                            </a>
                                                        ) : "—"}
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex items-center gap-2">
                                                            {v.notes_url ? (
                                                                <a href={v.notes_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 transition-colors" title="View External Notes">
                                                                    <ExternalLink size={16} />
                                                                </a>
                                                            ) : null}
                                                            {v.notes_file ? (
                                                                <a
                                                                    href={v.notes_file.startsWith('http') ? v.notes_file : v.notes_file.startsWith('/') ? v.notes_file : `/${v.notes_file}`}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="text-emerald-600 hover:text-emerald-800 transition-colors"
                                                                    title="Download Notes File"
                                                                >
                                                                    <Download size={16} />
                                                                </a>
                                                            ) : null}
                                                            {!v.notes_url && !v.notes_file && (
                                                                <FileText size={16} className="text-slate-200" title="No notes" />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex items-center gap-2.5">
                                                            <button
                                                                onClick={() => openEditModuleModal(v)}
                                                                className="text-slate-400 hover:text-blue-600 transition-colors"
                                                                title="Edit Module"
                                                            >
                                                                <Edit3 size={14} />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteModule(v.id)}
                                                                className="text-slate-400 hover:text-red-500 transition-colors"
                                                                title="Delete Module"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-400 font-medium italic">No videos uploaded yet.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {activeTab === "Enrolled By" && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="bg-blue-50/50 px-6 py-4 border-b border-blue-100 flex items-center justify-between">
                                        <h2 className="font-bold text-slate-700">Enrolled By</h2>
                                        <div className="flex gap-2">
                                            <button className="flex items-center gap-2 bg-[#2563EB] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">
                                                <FileDown size={14} /> Export
                                            </button>
                                            <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm">
                                                <History size={14} /> Access Activity History
                                            </button>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-100">
                                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Unenroll</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {enrolledUsers.length > 0 ? enrolledUsers.map((u) => (
                                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-3 text-sm font-semibold text-slate-700">{u.username}</td>
                                                        <td className="px-6 py-3 text-sm text-blue-600 font-medium">{u.email}</td>
                                                        <td className="px-6 py-3 text-[10px]">
                                                            <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">✓ Active</span>
                                                        </td>
                                                        <td className="px-6 py-3 text-right">
                                                            <button className="text-slate-300 hover:text-red-500 transition-colors"><X size={16} /></button>
                                                        </td>
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan="4" className="px-6 py-10 text-center text-slate-400 font-medium italic">No students enrolled yet.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Batch Enrollment Section */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                                    <h3 className="text-sm font-bold text-slate-700 mb-1">Name & Email</h3>
                                    <p className="text-xs text-slate-400 font-medium mb-4">One per line: <span className="text-slate-500">Name, email@example.com (or just email)</span>. Click DONE to add to the list above.</p>
                                    <textarea
                                        value={batchEnrollText}
                                        onChange={(e) => setBatchEnrollText(e.target.value)}
                                        placeholder="John Doe, john@example.com&#10;Jane Smith, jane@example.com&#10;student@lms.com"
                                        rows={5}
                                        className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm placeholder:text-slate-300"
                                    />
                                    <div className="flex justify-end mt-4">
                                        <button
                                            onClick={handleBatchEnroll}
                                            className="bg-[#2563EB] text-white px-8 py-2.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 uppercase tracking-wider"
                                        >
                                            Done
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === "Assign Trainers" && (

                            <div className="space-y-6">
                                {/* Assign Trainer Section */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                        <h2 className="font-bold text-slate-700 text-sm">Assign Trainers</h2>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100">Course Management</span>
                                    </div>
                                    <div className="p-8">
                                        <div className="max-w-2xl mx-auto space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Trainer Name</label>
                                                    <input
                                                        type="text"
                                                        value={trainerNameInput || ""}
                                                        onChange={(e) => setTrainerNameInput(e.target.value)}
                                                        placeholder="e.g. John Doe"
                                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-600 placeholder:text-slate-300"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Trainer Email</label>
                                                    <input
                                                        type="email"
                                                        value={trainerEmail}
                                                        onChange={(e) => setTrainerEmail(e.target.value)}
                                                        placeholder="trainer@example.com"
                                                        className="w-full px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-slate-600 placeholder:text-slate-300"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex justify-end pt-4">
                                                <button
                                                    onClick={handleAssignTrainer}
                                                    disabled={assigning || !trainerEmail}
                                                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-100 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                                                >
                                                    {assigning ? "ASSIGNING..." : "DONE"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Assigned Trainers List */}
                                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100">
                                        <h2 className="font-bold text-slate-700 text-sm">Assigned Trainers List</h2>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-slate-100">
                                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</th>
                                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</th>
                                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Course Assigned</th>
                                                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {trainers.length > 0 ? (
                                                    trainers.map((t) => (
                                                        <tr key={t.id} className="hover:bg-slate-50/50 transition-colors group">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className={`w-8 h-8 ${t.is_active ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'} rounded-lg flex items-center justify-center font-bold text-xs uppercase transition-colors`}>
                                                                        {t.trainer_details?.full_name ? t.trainer_details.full_name.charAt(0) : (t.trainer_details?.username ? t.trainer_details.username.charAt(0) : "T")}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className={`font-bold text-sm ${t.is_active ? 'text-slate-700' : 'text-slate-400'}`}>{t.trainer_details?.full_name || t.trainer_details?.username}</span>
                                                                        {!t.is_active && <span className="text-[10px] text-slate-400 font-medium italic">Inactive</span>}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className={`px-6 py-4 text-sm font-medium ${t.is_active ? 'text-slate-500' : 'text-slate-400'}`}>{t.trainer_details?.email}</td>
                                                            <td className="px-6 py-4">
                                                                <span className={`px-2.5 py-1 ${t.is_active ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'} rounded-md text-[10px] font-bold uppercase tracking-tight transition-colors`}>
                                                                    {course.title}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className={`text-[10px] font-bold uppercase ${t.is_active ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                                            {t.is_active ? 'Active' : 'Inactive'}
                                                                        </span>
                                                                        <button
                                                                            onClick={() => handleToggleActive(t.trainer, t.is_active)}
                                                                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${t.is_active ? 'bg-blue-600' : 'bg-slate-200'}`}
                                                                        >
                                                                            <span
                                                                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${t.is_active ? 'translate-x-5' : 'translate-x-1'}`}
                                                                            />
                                                                        </button>
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleUnassignTrainer(t.trainer)}
                                                                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                        title="Remove Trainer"
                                                                    >
                                                                        <Trash2 size={14} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-medium italic">No trainers assigned to this course yet.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <ModuleModal

                    isOpen={isModuleModalOpen}
                    onClose={() => setIsModuleModalOpen(false)}
                    onSuccess={handleModuleSuccess}
                    courseId={courseId}
                    moduleToEdit={moduleToEdit}
                    selectedBatch={selectedBatch}
                />

                <EditCourseModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onSuccess={loadCourse}
                    course={course}
                />
            </main>

            {/* Create Batch Modal */}
            {isCreateBatchOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    onClick={() => setIsCreateBatchOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm mx-4 border border-slate-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-lg font-bold text-slate-800 mb-1">Create New Batch</h2>
                        <p className="text-xs text-slate-400 mb-6">Enter a name for the new batch. It will be added to the batch list.</p>
                        <div className="space-y-2 mb-6">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Batch Name</label>
                            <input
                                type="text"
                                value={newBatchName}
                                onChange={(e) => setNewBatchName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleCreateBatch()}
                                placeholder="e.g. Batch 6"
                                autoFocus
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm font-medium text-slate-700 placeholder:text-slate-300"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => { setIsCreateBatchOpen(false); setNewBatchName(""); }}
                                className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateBatch}
                                disabled={!newBatchName.trim()}
                                className="bg-[#2563EB] text-white px-8 py-2.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-md active:scale-95 disabled:opacity-40 uppercase tracking-wider"
                            >
                                Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function NavLink({ to, icon, label, active = false }) {
    return (
        <RouterNavLink
            to={to}
            className={`flex items-center space-x-2 py-1.5 px-3 rounded-lg transition-all ${active
                ? "bg-white/15 text-white shadow-sm"
                : "text-white/70 hover:text-white hover:bg-white/5"
                }`}
        >
            {icon}
            <span className="text-xs font-bold tracking-tight">{label}</span>
        </RouterNavLink>
    );
}

function NavItem({ icon, label }) {
    return (
        <button className="flex items-center space-x-2 py-1.5 px-3 rounded-lg text-white/70 hover:text-white hover:bg-white/5 transition-all">
            {icon}
            <span className="text-xs font-bold tracking-tight">{label}</span>
        </button>
    );
}
