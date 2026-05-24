import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Video,
    Calendar,
    Users,
    Clock,
    CheckCircle,
    ExternalLink,
    Play,
    Upload,
    X,
    MessageCircle
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { TrainerNav } from "./TrainerCourses";
import { getLiveSessions, updateLiveSession } from "../../services/api";
import { getSessionStatus } from "../../utils/sessionUtils";

// Custom hook to calculate time left for a session
const useTimeLeft = (date, time) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const calculate = () => {
            const now = new Date();

            try {
                const [year, month, day] = date.split('-').map(Number);
                const timeParts = time.split(':').map(Number);

                const sessionDate = new Date(
                    year,
                    month - 1,
                    day,
                    timeParts[0] || 0,
                    timeParts[1] || 0,
                    timeParts[2] || 0
                );

                const diff = sessionDate - now;

                if (diff <= 0) {
                    setTimeLeft("Session Live!");
                    return;
                }

                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

                if (hours > 24) {
                    setTimeLeft(`Starts in ${Math.floor(hours / 24)}d`);
                } else if (hours > 0) {
                    setTimeLeft(`Starts in ${hours}h ${minutes}m`);
                } else {
                    setTimeLeft(`Starts in ${minutes}m`);
                }
            } catch (err) {
                console.error("Error calculating time left:", err);
                setTimeLeft("Upcoming");
            }
        };

        calculate();
        const timer = setInterval(calculate, 60000); // Update every minute
        return () => clearInterval(timer);
    }, [date, time]);

    return timeLeft;
};

export default function TrainerLiveSessions() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState(null);
    const [recordingUrl, setRecordingUrl] = useState("");
    const [updating, setUpdating] = useState(false);

    const initials = user?.full_name ? user.full_name.slice(0, 1).toUpperCase() : (user?.username ? user.username.slice(0, 1).toUpperCase() : "T");
    const handleLogout = () => { logout(); navigate("/login"); };

    const loadSessions = async () => {
        try {
            setLoading(true);
            const data = await getLiveSessions({ trainer: true });
            setSessions(data || []);
        } catch (err) {
            console.error("Failed to load sessions", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSessions();
        // Polling interval to auto-update session statuses every 60 seconds
        const interval = setInterval(loadSessions, 60000);
        return () => clearInterval(interval);
    }, []);

    const categorizedSessions = useMemo(() => {
        return {
            live: sessions.filter(s => getSessionStatus(s) === "LIVE"),
            upcoming: sessions.filter(s => getSessionStatus(s) === "UPCOMING"),
            past: sessions.filter(s => getSessionStatus(s) === "COMPLETED")
        };
    }, [sessions]);

    const openUploadModal = (session) => {
        setSelectedSession(session);
        setRecordingUrl(session.recording_url || "");
        setIsModalOpen(true);
    };

    const handleUploadRecording = async () => {
        if (!selectedSession || !recordingUrl) return;
        setUpdating(true);
        try {
            await updateLiveSession(selectedSession.id, {
                recording_url: recordingUrl,
            });
            setIsModalOpen(false);
            loadSessions();
        } catch (err) {
            console.error("Failed to update session content", err);
            // Handle specific 400 error message from backend if available
            const errorMsg = err.response?.data?.detail || err.response?.data?.recording_url || "Failed to update recording";
            alert(errorMsg);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <TrainerNav active="live" initials={initials} onLogout={handleLogout} />

            <main className="max-w-6xl mx-auto px-6 py-8 space-y-12">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Trainer Live Portal</h1>
                        <p className="text-gray-500 mt-1 font-medium text-sm">Schedule, start, and manage your course sessions.</p>
                    </div>
                </div>

                {/* Currently Live */}
                <Section
                    title="Currently Live"
                    icon={
                        <span className={`w-2 h-2 rounded-full ${categorizedSessions.live.length > 0 ? "bg-red-500 animate-ping" : "bg-gray-300"}`} />
                    }
                >

                    {categorizedSessions.live.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {categorizedSessions.live.map(s => (
                                <LiveSessionCard key={s.id} session={s} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="No sessions are currently live." />
                    )}
                </Section>

                {/* Upcoming Sessions */}
                <Section title="Upcoming Sessions" icon={<Calendar size={18} className="text-blue-500" />}>
                    {categorizedSessions.upcoming.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {categorizedSessions.upcoming.map(s => (
                                <UpcomingSessionCard key={s.id} session={s} />
                            ))}
                        </div>
                    ) : (
                        <EmptyState message="You have no upcoming sessions scheduled." />
                    )}
                </Section>

                {/* Past Sessions List */}
                <Section title="Completed Sessions" icon={<CheckCircle size={18} className="text-emerald-500" />}>
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/40 overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50/50 text-[10px] text-gray-400 font-bold uppercase tracking-widest border-b border-gray-50">
                                <tr>
                                    <th className="text-left px-8 py-6">Session Details</th>
                                    <th className="text-left px-8 py-6">Course</th>
                                    <th className="text-left px-8 py-6">Date & Time</th>
                                    <th className="text-right px-8 py-6">Recording</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {categorizedSessions.past.length > 0 ? (
                                    categorizedSessions.past.map((s) => (
                                        <tr key={s.id} className="hover:bg-gray-50/50 transition-all duration-300 group">
                                            <td className="px-8 py-6">
                                                <p className="font-bold text-gray-900 text-base">{s.title}</p>
                                                <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{s.description}</p>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                                                    {s.course_title || "LMS Course"}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <p className="text-gray-700 font-bold">{new Date(s.scheduled_date).toLocaleDateString()}</p>
                                                <p className="text-xs text-gray-400 font-medium">{s.start_time} - {s.end_time}</p>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <div className="flex flex-col items-end gap-2">
                                                    {s.recording_url ? (
                                                        <a
                                                            href={s.recording_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-xl text-[11px] font-black hover:bg-blue-600 hover:text-white transition-all shadow-sm w-fit"
                                                        >
                                                            <Play size={12} fill="currentColor" /> Watch
                                                        </a>
                                                    ) : null}
                                                    {!s.recording_url && (
                                                        <button
                                                            onClick={() => openUploadModal(s)}
                                                            className="inline-flex items-center gap-2 text-gray-600 bg-gray-100 px-4 py-2 rounded-xl text-[11px] font-black hover:bg-gray-900 hover:text-white transition-all shadow-sm"
                                                        >
                                                            <Upload size={12} /> Upload Recording
                                                        </button>
                                                    )}
                                                    {s.recording_url && (
                                                        <button
                                                            onClick={() => openUploadModal(s)}
                                                            className="text-[10px] text-gray-400 hover:text-gray-900 font-bold underline"
                                                        >
                                                            Update Video Link
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-10 text-center text-gray-400 font-medium italic">No past sessions found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Section>
            </main>

            {/* Recording Upload Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-300">
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-blue-200">
                                    <Upload size={24} />
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-800 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>

                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Upload Recording</h2>
                            <p className="text-gray-500 mt-2 font-medium">Link the session recording for <span className="text-blue-600">"{selectedSession?.title}"</span></p>

                            <div className="mt-8 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Recording URL</label>
                                    <input
                                        type="url"
                                        placeholder="https://zoom.us/rec/..."
                                        value={recordingUrl}
                                        onChange={(e) => setRecordingUrl(e.target.value)}
                                        className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all font-medium text-blue-600 placeholder-gray-300"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={handleUploadRecording}
                                disabled={updating || !recordingUrl}
                                className="mt-8 w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-gray-200/50 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {updating ? "Updating..." : "Save Recording Link"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Section({ title, icon, children }) {
    return (
        <section className="space-y-6">
            <h2 className="font-black text-[11px] text-gray-400 uppercase tracking-[0.2em] flex items-center gap-3 ml-2">
                {icon}
                {title}
            </h2>
            {children}
        </section>
    );
}

function LiveSessionCard({ session }) {
    return (
        <div className="bg-white rounded-2xl border border-blue-100 p-5 flex flex-col md:flex-row items-center justify-between shadow-xl shadow-blue-500/5 group hover:border-blue-400 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>

            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 w-full md:w-auto">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center text-white shadow-xl shadow-blue-200 transform group-hover:rotate-6 transition-transform shrink-0">
                    <Video size={20} />
                </div>
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base text-gray-900 tracking-tight">{session.title}</h3>
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center gap-1.5 shadow-md shadow-red-500/20">
                            <span className="w-1 h-1 bg-white rounded-full animate-ping" />
                            LIVE
                        </span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1 font-bold tracking-tight uppercase">{session.course_title}</p>
                </div>
            </div>

            <div className="flex items-center gap-6 mt-6 md:mt-0 relative z-10">
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                    <Clock size={14} className="text-blue-500" />
                    <span className="text-xs font-black text-gray-700">{session.start_time} - {session.end_time}</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                    <Users size={14} className="text-indigo-500" />
                    <span className="text-xs font-black text-gray-700">Student Portal Active</span>
                </div>
            </div>

            <button
                onClick={() => navigate(`/trainer/live-room/${session.id}`)}
                className="w-full md:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-lg active:scale-95 mt-4 md:mt-0 relative z-10"
            >
                Launch <ExternalLink size={14} />
            </button>
        </div>
    );
}

function UpcomingSessionCard({ session }) {
    const timeLeft = useTimeLeft(session.scheduled_date, session.start_time);

    return (
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/5 transition-colors"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${timeLeft === "Session Live!" ? "bg-red-50 lg:bg-red-500 text-red-500 lg:text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"}`}>
                    <Calendar size={18} />
                </div>
                <div className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.1em]">{timeLeft}</span>
                </div>
            </div>

            <h3 className="font-bold text-base text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">{session.title}</h3>
            <p className="text-xs text-gray-400 mt-2 font-bold tracking-tight uppercase">{session.course_title}</p>

            <div className="mt-8 flex items-center justify-between p-5 bg-gray-50 rounded-3xl border border-gray-100">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Scheduled For</span>
                    <span className="text-xs text-gray-900 font-black flex items-center gap-2">
                        <Calendar size={13} className="text-blue-500" />
                        {new Date(session.scheduled_date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
                <div className="h-8 w-[1px] bg-gray-200" />
                <div className="flex flex-col gap-1 text-right">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Starts At</span>
                    <span className="text-xs text-gray-900 font-black flex items-center gap-2 justify-end">
                        <Clock size={13} className="text-blue-500" /> {session.start_time}
                    </span>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-50 flex items-center justify-between">
                <button className="text-[11px] font-black text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest flex items-center gap-2">
                    <MessageCircle size={14} /> Room Chat
                </button>
                <button
                    onClick={() => window.open(session.meeting_link, '_blank')}
                    className="p-3 bg-gray-100 rounded-2xl text-gray-600 hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 shadow-sm"
                >
                    <ExternalLink size={18} />
                </button>
            </div>
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="bg-white rounded-[2rem] border-2 border-dashed border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video size={32} className="text-gray-200" />
            </div>
            <p className="text-gray-400 font-bold tracking-tight">{message}</p>
        </div>
    );
}
