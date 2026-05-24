import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
    LayoutDashboard,
    BookOpen,
    Users,
    UserRound,
    ClipboardCheck,
    Video,
    Calendar,
    ArrowUpRight,
    Loader2
} from "lucide-react";
import logo from "../../assets/logo.png";
import { getUsers, getCourses, getLiveSessions } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

// Use backend-provided status field (LIVE / UPCOMING / COMPLETED)

function formatTime(timeStr) {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(":");
    const dt = new Date();
    dt.setHours(parseInt(h), parseInt(m), 0);
    return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AdminDashboard() {
    const { user } = useAuth();

    const [stats, setStats] = useState({
        courses: 0,
        students: 0,
        trainers: 0,
        liveCount: 0,
    });
    const [liveSessions, setLiveSessions] = useState([]);
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const [users, courses, sessions] = await Promise.all([
                    getUsers(),
                    getCourses(),
                    getLiveSessions(),
                ]);

                const students = users.filter(u => u.role === "STUDENT").length;
                const trainers = users.filter(u => u.role === "TRAINER").length;

                const live = sessions.filter(s => s.status === "LIVE");
                const upcoming = sessions
                    .filter(s => s.status === "UPCOMING")
                    .sort((a, b) => {
                        const aTime = new Date(`${a.scheduled_date}T${a.start_time}`);
                        const bTime = new Date(`${b.scheduled_date}T${b.start_time}`);
                        return aTime - bTime;
                    });

                setStats({
                    courses: courses.length,
                    students,
                    trainers,
                    liveCount: live.length,
                });
                setLiveSessions(live);
                setUpcomingSessions(upcoming.slice(0, 3));
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, []);

    const adminInitial = user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || "A";
    const adminName = user?.full_name || user?.email?.split("@")[0] || "Admin";

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Blue Navigation Bar */}
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
                        <NavLink to="/admin-dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" active />
                        <NavLink to="/admin-courses" icon={<BookOpen size={16} />} label="Courses" />
                        <NavLink to="/admin-users" icon={<Users size={16} />} label="Users" />
                        <NavLink to="/admin-live-sessions" icon={<Video size={16} />} label="Live Sessions" />
                        <NavItem icon={<UserRound size={16} />} label="Instructors" />
                        <NavItem icon={<ClipboardCheck size={16} />} label="Enrollments" />
                        <NavItem icon={<ClipboardCheck size={16} />} label="Assessments" />
                    </div>

                    {/* Right: User Profile */}
                    <div className="flex items-center justify-end">
                        <div className="flex items-center space-x-3 bg-white/10 px-2.5 py-1 rounded-full border border-white/20 transition-all hover:bg-white/20 cursor-pointer">
                            <div className="w-7 h-7 rounded-full bg-orange-400 flex items-center justify-center font-bold text-xs text-white shadow-inner">
                                {adminInitial}
                            </div>
                            <span className="font-semibold text-xs text-white">{adminName}</span>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <main className="max-w-5xl mx-auto px-4 py-5 space-y-5">

                {/* Stats Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Courses"
                        value={loading ? null : stats.courses}
                        change="All active courses"
                        icon={<BookOpen className="text-purple-600" />}
                        bgColor="bg-purple-50"
                        loading={loading}
                    />
                    <StatCard
                        title="Total Students"
                        value={loading ? null : stats.students}
                        change="Enrolled students"
                        icon={<Users className="text-blue-600" />}
                        bgColor="bg-blue-50"
                        loading={loading}
                    />
                    <StatCard
                        title="Live Classes"
                        value={loading ? null : stats.liveCount}
                        change={stats.liveCount > 0 ? "Ongoing now" : "No live sessions"}
                        icon={<Video className="text-orange-600" />}
                        bgColor="bg-orange-50"
                        loading={loading}
                    />
                    <StatCard
                        title="Total Trainers"
                        value={loading ? null : stats.trainers}
                        change="Active trainers"
                        icon={<UserRound className="text-green-600" />}
                        bgColor="bg-green-50"
                        loading={loading}
                    />
                </div>

                {/* Middle Content: Live Sessions & Schedule Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Live Sessions Section */}
                    <Section title="Live Sessions" action="View all" to="/admin-live-sessions">
                        {loading ? (
                            <SkeletonCard />
                        ) : liveSessions.length === 0 ? (
                            <EmptyState icon={<Video size={28} className="text-slate-300" />} message="No live sessions right now" />
                        ) : (
                            <div className="space-y-3">
                                {liveSessions.slice(0, 2).map(session => (
                                    <LiveSessionCard key={session.id} session={session} />
                                ))}
                            </div>
                        )}
                    </Section>

                    {/* Upcoming Schedule Section */}
                    <Section title="Upcoming Schedule" action="View all" to="/admin-live-sessions">
                        {loading ? (
                            <div className="space-y-3">
                                <SkeletonCard slim />
                                <SkeletonCard slim />
                            </div>
                        ) : upcomingSessions.length === 0 ? (
                            <EmptyState icon={<Calendar size={28} className="text-slate-300" />} message="No upcoming sessions scheduled" />
                        ) : (
                            <div className="space-y-3">
                                {upcomingSessions.map(session => (
                                    <ScheduleItem
                                        key={session.id}
                                        title={session.title}
                                        sub={session.course_title || session.batch || ""}
                                        time={formatTime(session.start_time)}
                                        date={session.scheduled_date}
                                    />
                                ))}
                            </div>
                        )}
                    </Section>
                </div>

                {/* Lower Content: Analytics Graphs */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">

                    {/* Bar Chart: Assessments */}
                    <div className="lg:col-span-2 bg-white p-5 rounded-[1.25rem] shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="font-bold text-base text-slate-800">Assessments Graph</h2>
                                <p className="text-[10px] text-slate-400 mt-1">Student performance trends</p>
                            </div>
                            <div className="flex gap-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                                <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-blue-600 rounded-sm"></div> New</span>
                                <span className="flex items-center gap-1.5"><div className="w-2 h-2 bg-slate-200 rounded-sm"></div> Old</span>
                            </div>
                        </div>

                        <div className="h-64 flex items-end justify-between px-6 border-b border-slate-50">
                            {[45, 62, 55, 70, 85, 95, 40, 75].map((v, i) => (
                                <div key={i} className="flex flex-col items-center gap-3 group">
                                    <div className="w-8 bg-slate-50 rounded-t-lg relative flex items-end overflow-hidden h-40 transition-colors group-hover:bg-slate-100">
                                        <div className="absolute inset-x-0 bottom-0 bg-slate-200 rounded-t-lg opacity-40" style={{ height: `${v + (Math.random() * 20 - 10)}%` }}></div>
                                        <div
                                            className="relative w-full bg-blue-600 rounded-t-lg transition-all duration-700 ease-out shadow-sm group-hover:bg-blue-500"
                                            style={{ height: `${v}%` }}
                                        >
                                            <div className="absolute top-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[7px] py-0.5 px-1 rounded mb-1">
                                                {v}%
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 group-hover:text-blue-600 transition-colors tracking-tighter uppercase whitespace-nowrap">
                                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][i]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Donut Chart: LSRW Metrics */}
                    <div className="bg-white p-5 rounded-[1.25rem] shadow-sm border border-gray-100 flex flex-col items-center">
                        <div className="w-full mb-6">
                            <h2 className="font-bold text-base text-slate-800">LSRW</h2>
                            <p className="text-[10px] text-slate-400 mt-1">Core skill distribution</p>
                        </div>

                        <div className="relative w-40 h-40 mb-6">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 filter drop-shadow-sm">
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F8FAFC" strokeWidth="18" />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#8B5CF6" strokeWidth="18" strokeDasharray="125.6 251.2" />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3B82F6" strokeWidth="18" strokeDasharray="25.1 251.2" strokeDashoffset="-125.6" />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F59E0B" strokeWidth="18" strokeDasharray="50.2 251.2" strokeDashoffset="-150.7" />
                                <circle cx="50" cy="50" r="40" fill="transparent" stroke="#EC4899" strokeWidth="18" strokeDasharray="50.2 251.2" strokeDashoffset="-200.9" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-xl font-black text-slate-800">100%</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Total</span>
                            </div>
                        </div>

                        <div className="space-y-3.5 w-full bg-slate-50/50 p-4 rounded-2xl">
                            <LegendItem color="bg-purple-500" label="Listening" value="50%" />
                            <LegendItem color="bg-blue-500" label="Spacing" value="10%" />
                            <LegendItem color="bg-orange-500" label="Reading" value="20%" />
                            <LegendItem color="bg-pink-500" label="Writing" value="20%" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function NavItem({ icon, label }) {
    return (
        <a
            href="#"
            className="flex items-center space-x-1.5 py-1 px-1 transition-all border-b-2 text-white/70 border-transparent hover:text-white hover:opacity-100 opacity-80"
        >
            {icon}
            <span className="text-[13px] font-medium tracking-tight whitespace-nowrap">{label}</span>
        </a>
    );
}

function StatCard({ title, value, change, icon, bgColor, loading }) {
    return (
        <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-start justify-between">
                <div className={`p-3.5 rounded-2xl ${bgColor} shadow-inner`}>
                    {React.cloneElement(icon, { size: 24, strokeWidth: 2.5 })}
                </div>
                <div className="bg-slate-50 px-3 py-1.5 rounded-full">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{change}</span>
                </div>
            </div>
            <div className="mt-4">
                <p className="text-slate-500 text-xs font-bold tracking-tight">{title}</p>
                {loading ? (
                    <div className="h-9 w-16 bg-slate-100 rounded-lg mt-1 animate-pulse" />
                ) : (
                    <h3 className="text-3xl font-black text-slate-800 mt-1 leading-none">
                        {String(value).padStart(2, "0")}
                    </h3>
                )}
            </div>
        </div>
    );
}

function Section({ title, action, to, children }) {
    return (
        <div className="space-y-5 flex flex-col">
            <div className="flex items-center justify-between px-2">
                <h2 className="font-black text-lg text-slate-800 tracking-tight">{title}</h2>
                <Link to={to || "#"} className="text-blue-600 font-extrabold text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1">
                    {action} <ArrowUpRight size={12} />
                </Link>
            </div>
            {children}
        </div>
    );
}

function LiveSessionCard({ session }) {
    return (
        <div className="bg-white p-4 rounded-[1.25rem] shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-all group">
            <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
                    <Video size={28} />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-base text-slate-800 tracking-tight">{session.title}</h3>
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center gap-1">
                            <span className="w-1 h-1 bg-white rounded-full animate-ping"></span>
                            LIVE
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">{session.course_title || session.batch || ""}</p>
                    <p className="text-[10px] text-slate-400">By {session.trainer_name || ""}</p>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-slate-300" />
                            {formatTime(session.start_time)}
                        </span>
                    </div>
                </div>
            </div>
            <Link
                to="/admin-live-sessions"
                className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 transform active:scale-95 text-sm"
            >
                <span className="text-[10px]">▶</span> Join
            </Link>
        </div>
    );
}

function ScheduleItem({ title, sub, time, date }) {
    const today = new Date().toDateString();
    const sessionDay = new Date(date).toDateString();
    const dayLabel = sessionDay === today ? "Today" : new Date(date).toLocaleDateString([], { month: "short", day: "numeric" });

    return (
        <div className="bg-white p-4 rounded-[1.25rem] shadow-sm border border-gray-100 flex items-center justify-between group hover:border-blue-300 transition-all cursor-pointer">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-inner">
                    <BookOpen size={20} />
                </div>
                <div>
                    <h4 className="font-extrabold text-sm text-slate-800 leading-tight">{title}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{sub} · {dayLabel}</p>
                </div>
            </div>
            <div className="text-blue-600 font-black text-[10px] bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 tracking-tighter group-hover:bg-blue-600 group-hover:text-white transition-all">
                {time}
            </div>
        </div>
    );
}

function EmptyState({ icon, message }) {
    return (
        <div className="bg-white p-8 rounded-[1.25rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-3">
            {icon}
            <p className="text-slate-400 text-xs font-semibold">{message}</p>
        </div>
    );
}

function SkeletonCard({ slim = false }) {
    return (
        <div className={`bg-white rounded-[1.25rem] shadow-sm border border-gray-100 animate-pulse ${slim ? "p-4" : "p-5"}`}>
            <div className="flex items-center gap-4">
                <div className={`${slim ? "w-10 h-10" : "w-14 h-14"} bg-slate-100 rounded-xl`} />
                <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                </div>
            </div>
        </div>
    );
}

function LegendItem({ color, label, value }) {
    return (
        <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
                <div className={`w-3.5 h-3.5 rounded-md ${color} shadow-sm shadow-black/10`}></div>
                <span className="text-[11px] font-bold text-slate-500">{label}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-12 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className={`${color} h-full`} style={{ width: value }}></div>
                </div>
                <span className="font-black text-slate-800 text-[10px] min-w-[32px] text-right">{value}</span>
            </div>
        </div>
    );
}
