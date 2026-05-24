import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../context/AuthContext";
import NavigationBar from "../components/navigationbar/NavigationBar";
import { getEnrollments, getLiveSessions } from "../services/api";
import { getSessionStatus } from "../utils/sessionUtils";
import { Video, Calendar, Clock, Monitor } from "lucide-react";

export default function Dashboard() {
    const [courses, setCourses] = useState([]);
    const [liveSessions, setLiveSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            try {
                setLoading(true);
                const [enrollmentsData, sessionsData] = await Promise.all([
                    getEnrollments({ student: user.id }),
                    getLiveSessions({ student: true })
                ]);

                setCourses(enrollmentsData || []);
                setLiveSessions(sessionsData || []);
            } catch (err) {
                console.error("Failed to fetch dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();

        // Poll for session updates every 60 seconds
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [user]);

    const categorizedSessions = useMemo(() => {
        return {
            live: liveSessions.filter(s => getSessionStatus(s) === "LIVE"),
            upcoming: liveSessions.filter(s => getSessionStatus(s) === "UPCOMING")
        };
    }, [liveSessions]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <NavigationBar activeLink="dashboard" />

            <main className="max-w-7xl mx-auto p-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-300">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">My Courses</h3>
                        <p className="text-3xl font-bold text-purple-300">{courses.length}</p>
                        <p className="text-sm text-gray-500 mt-2">Active enrollments</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-300">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Live Sessions</h3>
                        <p className="text-3xl font-bold text-indigo-300">
                            {categorizedSessions.live.length}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">Current active sessions</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-violet-300">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">Upcoming Sessions</h3>
                        <p className="text-3xl font-bold text-violet-300">
                            {categorizedSessions.upcoming.length}
                        </p>
                        <p className="text-sm text-gray-500 mt-2">Scheduled for later</p>
                    </div>
                </div>

                {/* Live Sessions Section */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Live Sessions Now</h2>
                        {categorizedSessions.live.length > 0 && (
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}
                    </div>

                    {categorizedSessions.live.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {categorizedSessions.live.map(session => (
                                <LiveSessionCard key={session.id} session={session} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <Video size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-500 text-lg">No sessions are currently live.</p>
                        </div>
                    )}
                </div>

                {/* Upcoming Sessions Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Upcoming Sessions</h2>
                    {categorizedSessions.upcoming.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categorizedSessions.upcoming.map(session => (
                                <UpcomingCard key={session.id} session={session} />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                            <Calendar size={48} className="mx-auto text-gray-200 mb-4" />
                            <p className="text-gray-500 text-lg">No upcoming sessions scheduled.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

function LiveSessionCard({ session }) {
    return (
        <div className="bg-white rounded-2xl border-2 border-red-100 p-6 flex items-center justify-between shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className="flex items-center gap-6 relative z-10">
                <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
                    <Video size={28} />
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">{session.title}</h3>
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">LIVE</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Course: <span className="font-semibold text-blue-600">{session.course_title}</span> • Instructor: <span className="font-semibold text-gray-700">{session.trainer_name}</span>
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-gray-600">
                        <Clock size={14} className="text-red-500" />
                        {session.start_time} - {session.end_time}
                    </div>
                </div>
            </div>
            <a
                href={session.meeting_link}
                target="_blank"
                rel="noreferrer"
                className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-blue-600 transition-all ml-4 text-center shrink-0"
            >
                Join Now
            </a>
        </div>
    );
}

function UpcomingCard({ session }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Calendar size={20} />
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Scheduled Date</p>
                    <p className="text-sm font-bold text-gray-900">{new Date(session.scheduled_date).toLocaleDateString()}</p>
                </div>
            </div>
            <h3 className="font-bold text-lg text-gray-900 leading-tight line-clamp-2 pr-2">{session.title}</h3>
            <p className="text-xs text-gray-500 mt-2 uppercase tracking-wide">
                <span className="text-blue-600 font-bold">{session.course_title}</span> • {session.trainer_name}
            </p>
            <div className="mt-6 flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Starts At</span>
                    <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                        <Clock size={12} className="text-blue-500" /> {session.start_time}
                    </span>
                </div>
                <div className="h-6 w-px bg-gray-200" />
                <div className="flex flex-col gap-0.5 text-right">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Batch</span>
                    <span className="text-xs font-bold text-gray-900">{session.batch_name || "General"}</span>
                </div>
            </div>
        </div>
    );
}
