import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Video,
    Plus,
    Calendar,
    Clock,
    ExternalLink,
    LayoutDashboard,
    CheckCircle,
    ArrowUpRight,
    Play,
    AlertCircle,
    Users,
    MessageCircle,
    Upload
} from "lucide-react";
import { getLiveSessions } from "../../services/api";
import { getSessionStatus } from "../../utils/sessionUtils";
import logo from "../../assets/logo.png";

// Custom hook to calculate time left for a session (Synced with Trainer portal)
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

export default function AdminLiveSessions() {
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSessions = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getLiveSessions();
            setSessions(data || []);
        } catch (err) {
            console.error("Failed to fetch sessions", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
        // Poll every 60 seconds so status auto-updates are reflected
        const interval = setInterval(fetchSessions, 60000);
        return () => clearInterval(interval);
    }, [fetchSessions]);

    const categorized = useMemo(() => ({
        live: sessions.filter(s => getSessionStatus(s) === "LIVE"),
        upcoming: sessions.filter(s => getSessionStatus(s) === "UPCOMING"),
        completed: sessions.filter(s => getSessionStatus(s) === "COMPLETED"),
    }), [sessions]);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Nav */}
            <nav className="bg-[#2563EB] text-white px-6 py-2 shadow-lg sticky top-0 z-50">
                <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
                    <div className="flex items-center">
                        <Link to="/admin-dashboard">
                            <img src={logo} alt="AIDEAS" className="h-10 w-auto" />
                        </Link>
                    </div>
                    <div className="hidden lg:flex items-center justify-center space-x-6">
                        <Link to="/admin-dashboard" className="text-white/70 hover:text-white flex items-center gap-1.5 py-1 px-1 transition-all border-b-2 border-transparent">
                            <LayoutDashboard size={16} /> <span className="text-sm font-medium">Dashboard</span>
                        </Link>
                        <div className="text-white border-b-2 border-white font-bold opacity-100 flex items-center gap-1.5 py-1 px-1">
                            <Video size={16} /> <span className="text-sm font-medium">Live Sessions</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-end">
                        <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center font-bold text-xs text-white">A</div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Live Session Management</h1>
                        <p className="text-sm text-slate-500 mt-1 font-medium">Monitor, schedule, and review live classes across all batches.</p>
                    </div>
                    <Link
                        to="/admin-live-sessions/create"
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg flex items-center gap-2"
                    >
                        <Plus size={20} /> Create New Session
                    </Link>
                </div>

                {loading ? (
                    <div className="py-20 text-center">
                        <div className="inline-block w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <p className="mt-4 text-slate-500 font-bold">Retrieving session data...</p>
                    </div>
                ) : (
                    <>
                        {/* ── CURRENTLY LIVE ─────────────────────────── */}
                        <Section
                            title="Currently Live"
                            icon={
                                <span className={`w-2 h-2 rounded-full ${categorized.live.length > 0 ? "bg-red-500 animate-ping" : "bg-gray-300"}`} />
                            }
                        >
                            {categorized.live.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6">
                                    {categorized.live.map(s => (
                                        <AdminLiveCard key={s.id} session={s} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="No sessions are currently live." />
                            )}
                        </Section>

                        {/* ── UPCOMING ────────────────────────────────── */}
                        <Section title="Upcoming Sessions" icon={<Calendar size={18} className="text-blue-500" />}>
                            {categorized.upcoming.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {categorized.upcoming.map(s => (
                                        <UpcomingCard key={s.id} session={s} />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState message="No upcoming sessions scheduled." />
                            )}
                        </Section>

                        {/* ── COMPLETED ────────────────────────────────── */}
                        <Section title="Completed Sessions" icon={<CheckCircle size={18} className="text-emerald-500" />}>
                            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50/50 text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-100">
                                        <tr>
                                            <th className="text-left px-8 py-6">Session Details</th>
                                            <th className="text-left px-8 py-6">Course & Batch</th>
                                            <th className="text-left px-8 py-6">Date & Time</th>
                                            <th className="text-right px-8 py-6">Recording</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {categorized.completed.length > 0 ? (
                                            categorized.completed.map(s => (
                                                <tr key={s.id} className="hover:bg-slate-50/50 transition-all duration-300 group">
                                                    <td className="px-8 py-6">
                                                        <p className="font-bold text-slate-900 text-base">{s.title}</p>
                                                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{s.description}</p>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider w-fit">
                                                                {s.course_title || "General"}
                                                            </span>
                                                            <span className="text-[10px] font-bold text-slate-400 ml-1">{s.batch}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-8 py-6">
                                                        <p className="text-slate-700 font-bold">{new Date(s.scheduled_date).toLocaleDateString()}</p>
                                                        <p className="text-xs text-slate-400 font-medium">{s.start_time} – {s.end_time}</p>
                                                    </td>
                                                    <td className="px-8 py-6 text-right">
                                                        {s.recording_url ? (
                                                            <a href={s.recording_url} target="_blank" rel="noopener noreferrer"
                                                                className="inline-flex items-center gap-2 text-blue-600 bg-blue-50 px-4 py-2 rounded-xl text-[11px] font-black hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                                                                <Play size={12} fill="currentColor" /> Watch
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-400 text-[11px] font-bold italic bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Pending Upload</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-10 text-center text-slate-400 font-medium italic">No completed sessions found.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Section>
                    </>
                )}
            </main>
        </div>
    );
}

function Section({ title, icon, children }) {
    return (
        <section className="space-y-6">
            <h2 className="font-black text-[11px] text-slate-400 uppercase tracking-[0.2em] flex items-center gap-3 ml-2">
                {icon}
                {title}
            </h2>
            {children}
        </section>
    );
}

function AdminLiveCard({ session }) {
    return (
        <div className="bg-white rounded-2xl border border-red-100 p-5 flex flex-col md:flex-row items-center justify-between shadow-xl shadow-red-500/5 group hover:border-red-400 transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/5 rounded-full -mr-24 -mt-24 blur-3xl group-hover:bg-red-500/10 transition-colors"></div>

            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10 w-full md:w-auto">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-red-200 transform group-hover:rotate-6 transition-transform shrink-0">
                    <Video size={20} />
                </div>
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base text-slate-900 tracking-tight">{session.title}</h3>
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center gap-1.5 shadow-md shadow-red-500/20">
                            <span className="w-1 h-1 bg-white rounded-full animate-ping" />
                            LIVE
                        </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-bold tracking-tight uppercase">{session.course_title} • {session.batch}</p>
                </div>
            </div>

            <div className="flex items-center gap-6 mt-6 md:mt-0 relative z-10">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <Clock size={14} className="text-red-500" />
                    <span className="text-xs font-black text-slate-700">{session.start_time} - {session.end_time}</span>
                </div>
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <Users size={14} className="text-indigo-500" />
                    <span className="text-xs font-black text-slate-700">Admin Monitor Active</span>
                </div>
            </div>

            <a
                href={session.meeting_link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full md:w-auto bg-slate-900 text-white px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-600 transition-all shadow-lg active:scale-95 mt-4 md:mt-0 relative z-10"
            >
                Join & Monitor <ArrowUpRight size={14} />
            </a>
        </div>
    );
}

function UpcomingCard({ session }) {
    const timeLeft = useTimeLeft(session.scheduled_date, session.start_time);

    return (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all duration-500 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-blue-500/5 transition-colors"></div>

            <div className="flex items-center justify-between mb-6 relative z-10">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${timeLeft === "Session Live!" ? "bg-red-50 lg:bg-red-500 text-red-500 lg:text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"}`}>
                    <Calendar size={18} />
                </div>
                <div className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.1em]">{timeLeft}</span>
                </div>
            </div>

            <h3 className="font-bold text-base text-slate-900 leading-tight group-hover:text-blue-600 transition-colors">{session.title}</h3>
            <p className="text-xs text-slate-400 mt-2 font-bold tracking-tight uppercase">{session.course_title} • {session.batch}</p>

            <div className="mt-8 flex items-center justify-between p-5 bg-slate-50 rounded-3xl border border-slate-100">
                <div className="flex flex-col gap-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scheduled For</span>
                    <span className="text-xs text-slate-900 font-black flex items-center gap-2">
                        <Calendar size={13} className="text-blue-500" />
                        {new Date(session.scheduled_date).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                </div>
                <div className="h-8 w-[1px] bg-slate-200" />
                <div className="flex flex-col gap-1 text-right">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Starts At</span>
                    <span className="text-xs text-slate-900 font-black flex items-center gap-2 justify-end">
                        <Clock size={13} className="text-blue-500" /> {session.start_time}
                    </span>
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    <Users size={14} className="text-blue-500" /> {session.trainer_name || "Trainer"}
                </div>
                <button
                    onClick={() => window.open(session.meeting_link, '_blank')}
                    className="p-3 bg-slate-100 rounded-2xl text-slate-600 hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 shadow-sm"
                >
                    <ExternalLink size={18} />
                </button>
            </div>
        </div>
    );
}

function EmptyState({ message }) {
    return (
        <div className="bg-white rounded-[2rem] border-2 border-dashed border-slate-100 p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Video size={32} className="text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold tracking-tight">{message}</p>
        </div>
    );
}
