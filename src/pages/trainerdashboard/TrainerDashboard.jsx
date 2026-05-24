import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    BookOpen,
    Upload,
    Video,
    Users,
    Calendar,
    LogOut,
    Activity,
    Clock,
    ChevronRight,
    Search,
    X,
    Play
} from "lucide-react";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import { TrainerNav } from "./TrainerCourses";
import { getCourses, getLiveSessions, getTrainerActivities } from "../../services/api";
import { getSessionStatus } from "../../utils/sessionUtils";

export default function TrainerDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const trainerName = user?.full_name || user?.username || "Trainer";
    const initials = trainerName.slice(0, 1).toUpperCase();

    const [stats, setStats] = useState({
        courses: 0,
        students: 0,
        sessions: 0,
        pending: 0
    });
    const [upcomingSessions, setUpcomingSessions] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [coursesData, sessionsData, activitiesData] = await Promise.all([
                    getCourses(),
                    getLiveSessions({ trainer: true }),
                    getTrainerActivities()
                ]);

                const totalStudents = coursesData.reduce((acc, c) => acc + (c.enrollment_count || 0), 0);

                // Filter sessions that are either LIVE or UPCOMING
                const upcoming = (sessionsData || []).filter(s => {
                    const status = getSessionStatus(s);
                    return status === "LIVE" || status === "UPCOMING";
                });

                setStats({
                    courses: coursesData.length,
                    students: totalStudents,
                    sessions: upcoming.length,
                    pending: 0 // Placeholder for now
                });

                setUpcomingSessions(upcoming.slice(0, 3));
                setActivities(activitiesData || []);

            } catch (err) {
                console.error("Error fetching dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        // Note: Polling can be added here if desired via setInterval inside useEffect.
        fetchDashboardData();

        // Polling every 30 seconds for real-time insights
        const intervalId = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(intervalId);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">Loading Dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Nav Bar from Shared Component */}
            <TrainerNav active="dashboard" initials={initials} onLogout={handleLogout} />

            {/* Page Content */}
            <main className="max-w-6xl mx-auto px-6 py-10">

                {/* Search Bar - Aesthetic Only */}
                <div className="flex items-center bg-white rounded-full px-5 py-3 shadow-sm border border-slate-100 w-80 mb-10 transition-all focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-200">
                    <Search size={16} className="text-slate-400 mr-3 shrink-0" />
                    <input
                        type="text"
                        placeholder="Search courses, students..."
                        className="bg-transparent text-sm text-slate-500 outline-none w-full font-medium placeholder:text-slate-300"
                    />
                </div>

                {/* Page Header */}
                <div className="mb-10">
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Welcome back, {trainerName}!</h1>
                    <div className="flex items-center gap-3 mt-3">
                        <span className="h-1 w-12 bg-blue-600 rounded-full"></span>
                        <p className="text-sm text-slate-400 font-medium">Keep tracking your teaching growth and session schedules.</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
                    <StatCard
                        label="Assigned Courses"
                        value={stats.courses}
                        sub="Currently teaching"
                        icon={<BookOpen size={18} className="text-blue-600" />}
                        iconBg="bg-blue-100/50"
                        cardGradient="from-white to-blue-50/30"
                        valueColor="text-blue-600"
                    />
                    <StatCard
                        label="Total Students"
                        value={stats.students}
                        sub="Enrolled in your courses"
                        icon={<Users size={18} className="text-rose-600" />}
                        iconBg="bg-rose-100/50"
                        cardGradient="from-white to-rose-50/30"
                        valueColor="text-rose-600"
                    />
                    <StatCard
                        label="Upcoming Live"
                        value={stats.sessions}
                        sub="Scheduled sessions"
                        icon={<Video size={18} className="text-emerald-600" />}
                        iconBg="bg-emerald-100/50"
                        cardGradient="from-white to-emerald-50/30"
                        valueColor="text-emerald-600"
                    />
                </div>

                {/* Two Column Section */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

                    {/* Recent Activity */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border-2 border-slate-100 shadow-sm p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all group">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Activity size={18} className="text-blue-600" />
                                <h2 className="font-bold text-base text-slate-800 tracking-tight">Recent Insights</h2>
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1 rounded-full">Real-time</span>
                        </div>
                        <div className="space-y-8">
                            {activities.length > 0 ? activities.map((item, i) => {
                                // Default color mapping
                                const colors = {
                                    'ENROLLMENT': 'bg-emerald-500',
                                    'SESSION_SCHEDULED': 'bg-rose-500',
                                    'MATERIAL_UPLOADED': 'bg-blue-500',
                                    'TRAINER_ASSIGNED': 'bg-amber-500',
                                    'SYSTEM_UPDATE': 'bg-slate-500'
                                };
                                const color = colors[item.activity_type] || 'bg-blue-500';

                                return (
                                    <div key={i} className="flex items-start gap-5 group/item">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full ${color} shrink-0 ring-4 ring-slate-50 group-hover/item:scale-125 transition-transform`} />
                                        <div>
                                            <p className="text-sm text-slate-600 font-bold leading-tight group-hover/item:text-slate-900 transition-colors uppercase tracking-tight">{item.message}</p>
                                            <p className="text-[10px] text-slate-400 mt-1 font-black uppercase tracking-widest">{timeAgo(item.created_at)}</p>
                                        </div>
                                    </div>
                                )
                            }) : (
                                <div className="text-center py-6">
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">No recent activity</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Upcoming Live Sessions */}
                    <div className="lg:col-span-3 bg-white rounded-3xl border-2 border-slate-100 shadow-sm p-8 hover:shadow-xl hover:shadow-slate-200/50 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <Video size={18} className="text-blue-600" />
                                <h2 className="font-bold text-base text-slate-800 tracking-tight">Upcoming Live Sessions</h2>
                            </div>
                            <Link to="/trainer-live" className="text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center gap-1">
                                Full Schedule <ChevronRight size={12} />
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {upcomingSessions.length > 0 ? (
                                upcomingSessions.map((session, i) => (
                                    <div key={i} className="flex items-center justify-between p-5 border-2 border-slate-50 bg-slate-50/20 rounded-[1.5rem] group cursor-pointer hover:bg-blue-50/50 hover:border-blue-100 transition-all">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">{session.title}</p>
                                                <p className="text-[10px] text-slate-400 mt-1 font-black uppercase tracking-widest flex items-center gap-2">
                                                    <span>{new Date(session.scheduled_date).toLocaleDateString()}</span>
                                                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                    <span>{session.start_time} - {session.end_time}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-300 group-hover:text-blue-600 shadow-sm transition-all">
                                            <ChevronRight size={18} />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center bg-slate-50/30 rounded-3xl border-2 border-dashed border-slate-100">
                                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                                        <Video size={32} />
                                    </div>
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-tight">No live sessions soon</p>
                                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">Check back later for updates</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
}

function StatCard({ label, value, sub, icon, iconBg, cardGradient = "", valueColor = "text-slate-800" }) {
    return (
        <div className={`bg-gradient-to-br ${cardGradient} rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-lg hover:shadow-blue-500/5 transition-all group relative overflow-hidden`}>
            <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                    <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center transition-transform group-hover:scale-110`}>
                        {icon}
                    </div>
                </div>
                <div>
                    <p className={`text-2xl font-black ${valueColor} tracking-tight`}>{value}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{sub}</p>
                </div>
            </div>
            {/* Background Aesthetic Blur */}
            <div className={`absolute -bottom-6 -right-6 w-24 h-24 ${iconBg} rounded-full blur-3xl opacity-20`}></div>
        </div>
    );
}

// Utility function to format relative time
function timeAgo(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}
