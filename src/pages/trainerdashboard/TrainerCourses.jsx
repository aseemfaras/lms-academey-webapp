import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    BookOpen,
    Upload,
    Video,
    Users,
    LogOut,
    FileText,
    Download,
    Play,
    ChevronDown,
    ChevronRight,
    Clock,
    CheckCircle,
    Lock
} from "lucide-react";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import { getCourses } from "../../services/api";

const COURSE_COLORS = [
    { bg: "bg-blue-500", light: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
    { bg: "bg-emerald-500", light: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
    { bg: "bg-amber-500", light: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
    { bg: "bg-rose-500", light: "bg-rose-50", text: "text-rose-600", border: "border-rose-200" },
    { bg: "bg-indigo-500", light: "bg-indigo-50", text: "text-indigo-600", border: "border-indigo-200" },
];

export default function TrainerCourses() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const initials = user?.full_name ? user.full_name.slice(0, 1).toUpperCase() : (user?.username ? user.username.slice(0, 1).toUpperCase() : "T");
    const handleLogout = () => { logout(); navigate("/login"); };

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCourse, setExpandedCourse] = useState(null);
    const [expandedSession, setExpandedSession] = useState(null);
    const [activeVideo, setActiveVideo] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await getCourses();
                // Map API data to UI structure and add colors
                const mappedData = data.map((c, index) => ({
                    ...c,
                    ...COURSE_COLORS[index % COURSE_COLORS.length],
                    totalSessions: c.modules?.length || 0,
                    completedSessions: c.modules?.filter(m => m.video_url).length || 0,
                    students: c.enrollment_count || 0,
                    sessions: (c.modules || []).sort((a, b) => a.order - b.order).map(m => ({
                        id: m.id,
                        title: m.title,
                        duration: "Varying",
                        date: new Date(m.created_at).toLocaleDateString(),
                        status: m.video_url ? "completed" : "upcoming",
                        video: m.video_url ? { label: m.title, duration: "Video Lesson" } : null,
                        video_url: m.video_url,
                        notes_file: m.notes_file,
                        notes_url: m.notes_url,
                    }))
                }));
                setCourses(mappedData);
                if (mappedData.length > 0) setExpandedCourse(mappedData[0].id);
            } catch (err) {
                console.error("Failed to fetch courses", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const toggleCourse = (id) => {
        setExpandedCourse(expandedCourse === id ? null : id);
        setExpandedSession(null);
        setActiveVideo(null);
    };

    const toggleSession = (sid) => {
        setExpandedSession(expandedSession === sid ? null : sid);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Assigned Courses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <TrainerNav active="courses" initials={initials} onLogout={handleLogout} />

            <main className="max-w-6xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="mb-10">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">My Assigned Courses</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="h-1 w-12 bg-blue-600 rounded-full"></span>
                        <p className="text-sm text-slate-400 font-medium">Manage sessions, videos and notes for your assigned curriculum.</p>
                    </div>
                </div>

                {/* Course List */}
                <div className="space-y-6">
                    {courses.length > 0 ? (
                        courses.map((course) => (
                            <div
                                key={course.id}
                                className={`bg-white rounded-3xl border-2 shadow-sm overflow-hidden transition-all duration-300 ${expandedCourse === course.id ? `${course.border} shadow-xl shadow-slate-200/50` : "border-slate-100"}`}
                            >
                                {/* Course Header */}
                                <button
                                    onClick={() => toggleCourse(course.id)}
                                    className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/50 transition-colors text-left"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`w-10 h-10 ${course.bg} rounded-xl flex items-center justify-center`}>
                                            <BookOpen size={18} className="text-white" />
                                        </div>
                                        <div>
                                            <h2 className="font-bold text-base text-slate-800 tracking-tight leading-none">{course.title}</h2>
                                            <div className="flex items-center gap-3 mt-1.5">
                                                <span className="text-[9px] bg-slate-50 text-slate-500 px-2 py-0.5 rounded font-bold uppercase tracking-widest">{course.category}</span>
                                                <div className="flex items-center gap-2 text-slate-400">
                                                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest"><Users size={10} /> {course.students}</span>
                                                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest"><Video size={10} /> {course.totalSessions}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${expandedCourse === course.id ? `${course.light} ${course.text}` : "bg-slate-50 text-slate-300"}`}>
                                            {expandedCourse === course.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                        </div>
                                    </div>
                                </button>

                                {/* Sessions */}
                                {expandedCourse === course.id && (
                                    <div className={`border-t-2 ${course.border} bg-slate-50/30 px-4 py-4`}>
                                        <div className="space-y-3">
                                            {course.sessions.length > 0 ? (
                                                course.sessions.map((session) => {
                                                    const isOpen = expandedSession === `${course.id}-${session.id}`;
                                                    const isVideoPlaying = activeVideo?.courseId === course.id && activeVideo?.sessionId === session.id;

                                                    return (
                                                        <div key={session.id} className={`bg-white rounded-2xl border-2 transition-all ${isOpen ? `${course.border} shadow-md` : "border-slate-100 hover:border-slate-200"}`}>
                                                            {/* Session Row */}
                                                            <button
                                                                onClick={() => toggleSession(`${course.id}-${session.id}`)}
                                                                className="w-full flex items-center justify-between px-6 py-4 transition-colors text-left"
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${session.status === "completed" ? `${course.light} ${course.text}` : "bg-slate-50 text-slate-300"}`}>
                                                                        {session.status === "completed" ? <CheckCircle size={18} /> : <Lock size={16} />}
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-sm font-black text-slate-700 uppercase tracking-tight leading-none">
                                                                            {session.title}
                                                                        </span>
                                                                        <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                                            <span className="flex items-center gap-1"><Clock size={11} /> {session.duration}</span>
                                                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                                            <span>{session.date}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${session.status === "completed" ? `${course.light} ${course.text}` : "bg-amber-50 text-amber-600"}`}>
                                                                        {session.status}
                                                                    </span>
                                                                    <ChevronRight size={16} className={`text-slate-300 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                                                                </div>
                                                            </button>

                                                            {/* Session Detail */}
                                                            {isOpen && (
                                                                <div className="px-6 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                                                                        {/* Video Panel */}
                                                                        <div className="lg:col-span-3">
                                                                            <p className="text-[10px] font-black text-slate-400 mb-3 flex items-center gap-2">
                                                                                <Video size={13} /> Recorded Content
                                                                            </p>
                                                                            {session.video_url ? (
                                                                                isVideoPlaying ? (
                                                                                    <div className="bg-slate-900 rounded-2xl overflow-hidden aspect-video flex flex-col items-center justify-center relative shadow-inner">
                                                                                        <video
                                                                                            src={session.video_url}
                                                                                            controls
                                                                                            className="w-full h-full"
                                                                                            autoPlay
                                                                                        />
                                                                                        <button
                                                                                            onClick={() => setActiveVideo(null)}
                                                                                            className="absolute top-4 right-4 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-all"
                                                                                        >
                                                                                            <X size={20} />
                                                                                        </button>
                                                                                    </div>
                                                                                ) : (
                                                                                    <div
                                                                                        onClick={() => setActiveVideo({ courseId: course.id, sessionId: session.id })}
                                                                                        className="bg-slate-900 rounded-2xl overflow-hidden aspect-video flex items-center justify-center cursor-pointer group/vid relative shadow-lg hover:shadow-xl transition-all"
                                                                                    >
                                                                                        <div className={`w-16 h-16 ${course.bg} rounded-full flex items-center justify-center shadow-2xl group-hover/vid:scale-110 transition-transform duration-500`}>
                                                                                            <Play size={28} className="text-white ml-1 fill-white" />
                                                                                        </div>
                                                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/vid:opacity-100 transition-opacity" />
                                                                                        <div className="absolute bottom-6 left-6 text-white transform translate-y-4 group-hover/vid:translate-y-0 transition-transform duration-500">
                                                                                            <p className="text-sm font-black uppercase tracking-tight">{session.video.label}</p>
                                                                                            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest flex items-center gap-1.5 mt-1"><Clock size={11} /> {session.video.duration}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                )
                                                                            ) : (
                                                                                <div className="bg-slate-50 rounded-2xl aspect-video flex flex-col items-center justify-center text-slate-300 gap-4 border-2 border-dashed border-slate-200">
                                                                                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
                                                                                        <Lock size={28} />
                                                                                    </div>
                                                                                    <div className="text-center">
                                                                                        <p className="text-sm font-bold text-slate-400 tracking-tight">Content Locked</p>
                                                                                        <p className="text-[10px] font-medium text-slate-300 mt-1">Recording not yet uploaded</p>
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>

                                                                        {/* Notes Panel */}
                                                                        <div className="lg:col-span-2 flex flex-col gap-4">
                                                                            <p className="text-[10px] font-black text-slate-400 mb-2 flex items-center gap-2">
                                                                                <FileText size={13} /> Curriculum Resources
                                                                            </p>

                                                                            <div className="space-y-3 flex-1">
                                                                                {(session.notes_file || session.notes_url) ? (
                                                                                    <div className="flex items-center justify-between bg-white rounded-2xl border-2 border-slate-100 p-4 hover:border-blue-200 transition-all group/note">
                                                                                        <div className="flex items-center gap-4">
                                                                                            <div className={`w-12 h-12 ${course.light} rounded-xl flex items-center justify-center`}>
                                                                                                <FileText size={20} className={course.text} />
                                                                                            </div>
                                                                                            <div>
                                                                                                <p className="text-xs font-black text-slate-700 uppercase tracking-tight leading-tight">
                                                                                                    {session.notes_file ? session.notes_file.split('/').pop() : "Session Resources"}
                                                                                                </p>
                                                                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                                                                                    {session.notes_file ? "FILE ASSET" : "URL RESOURCE"}
                                                                                                </p>
                                                                                            </div>
                                                                                        </div>
                                                                                        <a
                                                                                            href={session.notes_file || session.notes_url}
                                                                                            target="_blank"
                                                                                            rel="noreferrer"
                                                                                            download={!!session.notes_file}
                                                                                            className={`w-10 h-10 rounded-xl ${course.light} flex items-center justify-center ${course.text} hover:scale-105 transition-all`}
                                                                                        >
                                                                                            <Download size={18} />
                                                                                        </a>
                                                                                    </div>
                                                                                ) : (

                                                                                    <div className="h-full flex flex-col items-center justify-center gap-4 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 p-6 min-h-[200px]">
                                                                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-200">
                                                                                            <FileText size={24} />
                                                                                        </div>
                                                                                        <div className="text-center">
                                                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No resources found</p>
                                                                                            <Link
                                                                                                to="/trainer-upload"
                                                                                                className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest mt-2 block"
                                                                                            >
                                                                                                + Upload Resources
                                                                                            </Link>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                                <Link
                                                                                    to="/trainer-upload"
                                                                                    className={`flex items-center justify-center gap-2 border-2 border-dashed ${course.border} rounded-2xl py-4 text-[10px] font-black ${course.text} hover:bg-white transition-all uppercase tracking-widest mt-4`}
                                                                                >
                                                                                    <Upload size={14} /> Add More Materials
                                                                                </Link>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })
                                            ) : (
                                                <div className="py-12 text-center">
                                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-4 text-slate-200">
                                                        <Video size={32} />
                                                    </div>
                                                    <p className="text-sm font-black text-slate-400 uppercase tracking-tight">No sessions found</p>
                                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">This course currently has no curriculum content</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
                            <div className="w-20 h-20 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-200">
                                <BookOpen size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-700 uppercase tracking-tight">No Courses Assigned</h3>
                            <p className="text-slate-400 text-sm mt-2 max-w-sm mx-auto">You haven't been assigned to any courses yet. Please contact the administrator for course access.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}


// ── Shared TrainerNav (exported for use in other trainer pages) ─────────────────
export function TrainerNav({ active, initials, onLogout }) {
    return (
        <nav className="bg-[#2563EB] text-white px-6 py-2 shadow-lg sticky top-0 z-50">
            <div className="max-w-6xl mx-auto grid grid-cols-3 items-center">
                <div className="flex items-center">
                    <Link to="/trainer-dashboard">
                        <img src={logo} alt="AIDEAS" className="h-10 w-auto filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                    </Link>
                </div>
                <div className="hidden lg:flex items-center justify-center space-x-6">
                    <NavLink to="/trainer-dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" active={active === "dashboard"} />
                    <NavLink to="/trainer-courses" icon={<BookOpen size={16} />} label="My Assigned Courses" active={active === "courses"} />
                    <NavLink to="/trainer-upload" icon={<Upload size={16} />} label="Upload Notes" active={active === "upload"} />
                    <NavLink to="/trainer-live" icon={<Video size={16} />} label="Live Sessions" active={active === "live"} />
                </div>
                <div className="flex items-center justify-end">
                    <button
                        onClick={onLogout}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full border border-white/20 transition-all"
                    >
                        <div className="w-7 h-7 rounded-full bg-emerald-400 flex items-center justify-center font-bold text-xs text-white">
                            {initials}
                        </div>
                        <span className="font-semibold text-xs text-white">Trainer</span>
                        <LogOut size={13} className="text-white/60" />
                    </button>
                </div>
            </div>
        </nav>
    );
}

function NavLink({ to, icon, label, active }) {
    return (
        <Link
            to={to}
            className={`flex items-center space-x-1.5 py-1 px-1 transition-all border-b-2 ${active
                ? "text-white border-white font-bold opacity-100"
                : "text-white/70 border-transparent hover:text-white hover:opacity-100 opacity-80"
                }`}
        >
            {icon}
            <span className="text-[13px] font-medium tracking-tight whitespace-nowrap">{label}</span>
        </Link>
    );
}

function PlayIcon({ size, className }) {
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="currentColor"
            className={className}
        >
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
    );
}
