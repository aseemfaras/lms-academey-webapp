import React, { useState } from "react";
import {
    LayoutDashboard,
    BookOpen,
    Users,
    UserRound,
    ClipboardCheck,
    ChevronDown,
    Search,
    LayoutGrid,
    List,
    Filter,
    Trash2,
    Play,
    Video
} from "lucide-react";

import { Link } from "react-router-dom";
import logo from "../../assets/logo.png";


import { getCourses } from "../../services/api";
// import { coursesData } from "../../data/course/courseData"; // Removed mock data import

import CreateCourseModal from "./CreateCourseModal";

export default function AdminCourses() {
    const [courses, setCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [layout, setLayout] = useState("group"); // "group" = grid, "lines" = list
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [error, setError] = useState(null);

    const loadCourses = async () => {
        try {
            const data = await getCourses();
            // Map backend data to frontend structure
            const mappedVals = (data || []).map((c) => {
                let finalImage = c.image;
                if (finalImage && !finalImage.startsWith('http')) {
                    // Ensure the URL includes the backend base and /media/ prefix if needed
                    finalImage = `${finalImage.startsWith('/') ? '' : '/media/'}${finalImage}`;
                }

                return {
                    id: c.id,
                    title: c.title,
                    category: c.description || "Software Development",
                    instructor: c.trainer_name || "Expert Trainer",
                    image: finalImage,
                    date: c.created_at ? new Date(c.created_at).toLocaleDateString() : "—",
                    status: "Active",
                    icon: "📚",
                };
            });
            setCourses(mappedVals);
        } catch (err) {
            console.error("Failed to load courses - FULL ERROR:", err);
            if (err.response) {
                console.error("Error Response Data:", err.response.data);
                console.error("Error Response Status:", err.response.status);
                console.error("Error Response Headers:", err.response.headers);
            }
            setError("Failed to load courses. Please check if the backend is running.");
        }
    };

    const handleDeleteCourse = async (id, e) => {
        e.preventDefault();
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this course?")) {
            try {
                const { deleteCourse } = await import("../../services/api");
                await deleteCourse(id);
                loadCourses();
            } catch (err) {
                console.error("Failed to delete course", err);
                alert("Failed to delete course.");
            }
        }
    };

    React.useEffect(() => {
        loadCourses();
    }, []);

    const filteredCourses = courses.filter((course) => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus =
            statusFilter === "All Status" || course.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Blue Navigation Bar - same as Admin Dashboard */}
            <nav className="bg-[#2563EB] text-white px-6 py-2 shadow-lg sticky top-0 z-50">
                <div className="max-w-5xl mx-auto grid grid-cols-3 items-center">
                    {/* Left: Logo */}
                    <div className="flex items-center">
                        <Link to="/admin-dashboard">
                            <img
                                src={logo}
                                alt="AIDEAS"
                                className="h-10 w-auto filter drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-all hover:drop-shadow-[0_0_15px_rgba(255,255,255,1)]"
                            />
                        </Link>
                    </div>

                    {/* Center: Nav Links */}
                    <div className="hidden lg:flex items-center justify-center space-x-6">
                        <NavLink to="/admin-dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" />
                        <NavLink to="/admin-courses" icon={<BookOpen size={16} />} label="Courses" active />
                        <NavLink to="/admin-users" icon={<Users size={16} />} label="Users" />
                        <NavLink to="/admin-live-sessions" icon={<Video size={16} />} label="Live Sessions" />
                        <NavItem icon={<UserRound size={16} />} label="Instructors" />
                        <NavItem icon={<ClipboardCheck size={16} />} label="Enrollments" />
                        <NavItem icon={<ClipboardCheck size={16} />} label="Assessments" />
                    </div>

                    {/* Right: User Profile */}
                    <div className="flex items-center justify-end">
                        <div className="flex items-center space-x-3 bg-white/10 px-2.5 py-1 rounded-full border border-white/20 cursor-pointer hover:bg-white/20 transition-all">
                            <div className="w-7 h-7 rounded-full bg-orange-400 flex items-center justify-center font-bold text-xs text-white shadow-inner">K</div>
                            <span className="font-semibold text-xs text-white">Anitha</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content - All Courses */}
            <main className="max-w-5xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-slate-800">All Courses</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-slate-800 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-slate-900 transition-all shadow-md"
                    >
                        Add Course
                    </button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                        {error}
                    </div>
                )}

                {/* Search, Filter, Layout Toggle */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="search courses.."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-800 placeholder-slate-400"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                            <Filter size={18} className="text-slate-500" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent text-slate-700 font-medium focus:outline-none cursor-pointer text-sm"
                            >
                                <option value="All Status">All Status</option>
                                <option value="Active">Active</option>
                                <option value="Completed">Completed</option>
                                <option value="In Progress">In Progress</option>
                            </select>
                        </div>
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden">
                            <button
                                onClick={() => setLayout("group")}
                                className={`p-2.5 transition-colors ${layout === "group" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}
                                title="Group layout"
                            >
                                <LayoutGrid size={20} />
                            </button>
                            <button
                                onClick={() => setLayout("lines")}
                                className={`p-2.5 transition-colors ${layout === "lines" ? "bg-blue-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}
                                title="Lines layout"
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Course list: Group (grid) or Lines (list) */}
                {layout === "group" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map((course) => (
                                <Link key={course.id} to={`/admin-courses/${course.id}`}>
                                    <AdminCourseCard course={course} variant="card" onDelete={(e) => handleDeleteCourse(course.id, e)} />
                                </Link>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-500 font-medium">
                                    {searchTerm || statusFilter !== "All Status"
                                        ? "No courses match your search or filters."
                                        : "No courses found in the database. Please check your backend."}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredCourses.length > 0 ? (
                            filteredCourses.map((course) => (
                                <Link key={course.id} to={`/admin-courses/${course.id}`}>
                                    <AdminCourseCard course={course} variant="row" onDelete={(e) => handleDeleteCourse(course.id, e)} />
                                </Link>
                            ))
                        ) : (
                            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                                <p className="text-slate-500 font-medium">No courses match your search or filters.</p>
                            </div>
                        )}
                    </div>
                )}

                <CreateCourseModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={loadCourses}
                />
            </main>
        </div>
    );
}

function NavLink({ to, icon, label, active = false }) {
    return (
        <Link
            to={to}
            className={`flex items-center space-x-1.5 py-1 px-1 transition-all border-b-2 ${active ? "text-white border-white font-bold opacity-100" : "text-white/70 border-transparent hover:text-white hover:opacity-100 opacity-80"}`}
        >
            {icon}
            <span className="text-[13px] font-medium tracking-tight whitespace-nowrap">{label}</span>
        </Link>
    );
}

function NavItem({ icon, label, active = false }) {
    return (
        <a
            href="#"
            className={`flex items-center space-x-1.5 py-1 px-1 transition-all border-b-2 ${active ? "text-white border-white font-bold opacity-100" : "text-white/70 border-transparent hover:text-white hover:opacity-100 opacity-80"}`}
        >
            {icon}
            <span className="text-[13px] font-medium tracking-tight whitespace-nowrap">{label}</span>
        </a>
    );
}

function AdminCourseCard({ course, variant, onDelete }) {
    const lastUpdate = `Last Update by ${course.instructor}`;
    const dateStr = course.date || "—";

    if (variant === "row") {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex items-center gap-4 hover:shadow-md transition-shadow relative group">
                <div className="w-24 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 flex items-center justify-center">
                    {course.image ? (
                        <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-2xl">{course.icon || "📚"}</span>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{course.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{course.category}</p>
                    <p className="text-xs text-slate-400 mt-1">{lastUpdate} · {dateStr}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all relative group">
            <div className="h-36 overflow-hidden flex items-center justify-center bg-slate-100">
                {course.image ? (
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 via-indigo-500 to-blue-500 flex items-center justify-center">
                        <span className="text-4xl">{course.icon || "📚"}</span>
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="font-bold text-slate-800 mb-1">{course.title}</h3>
                <p className="text-sm text-slate-500 mb-2">{course.category}</p>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
                    <p className="text-[10px] text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">Last Update by {course.instructor}</p>
                    <p className="text-[10px] text-slate-400 font-medium ml-2">{dateStr}</p>
                </div>
            </div>
        </div>
    );
}
