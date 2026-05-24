import React, { useState, useEffect, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import NavigationBar from "../components/navigationbar/NavigationBar";
import { useAuth } from "../context/AuthContext";
import { getCourse, getLiveSessions, getModules } from "../services/api";
import { getSessionStatus } from "../utils/sessionUtils";
import {
  Video,
  Calendar,
  Clock,
  ExternalLink,
  Play,
  Monitor,
  ShieldCheck,
  ChevronRight,
  Circle,
  FileText,
  Download,
  LayoutDashboard,
  Layout
} from "lucide-react";

export default function StudentCourseDetail() {
  const { user } = useAuth();
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [liveSessions, setLiveSessions] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const [activeTab, setActiveTab] = useState("live");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courseData, liveData, moduleData] = await Promise.all([
          getCourse(courseId),
          getLiveSessions({ student: true, course_id: courseId }),
          getModules(courseId)
        ]);

        setCourse(courseData);
        setLiveSessions(liveData || []);

        // Sort modules by order or date
        const sortedModules = (moduleData || []).sort((a, b) => a.order - b.order);
        setModules(sortedModules);

        // Set first module as active video if available
        if (sortedModules.length > 0) {
          setActiveVideo(sortedModules[0]);
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    // Poll every 60 seconds to keep live/upcoming status in sync
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [courseId]);

  const categorizedLive = useMemo(() => {
    return {
      live: liveSessions.filter(s => getSessionStatus(s) === "LIVE"),
      upcoming: liveSessions.filter(s => getSessionStatus(s) === "UPCOMING"),
      completed: liveSessions.filter(s => getSessionStatus(s) === "COMPLETED")
    };
  }, [liveSessions]);

  const getEmbedUrl = (url) => {
    if (!url) return "";
    if (url.includes("youtube.com/watch?v=")) {
      return url.replace("watch?v=", "embed/");
    }
    if (url.includes("youtu.be/")) {
      return url.replace("youtu.be/", "youtube.com/embed/");
    }
    if (url.includes("vimeo.com/")) {
      const id = url.split("/").pop();
      return `https://player.vimeo.com/video/${id}`;
    }
    return url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="relative text-center">
          <div className="w-16 h-16 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-blue-600 font-black text-[10px] uppercase tracking-widest">Loading Recordings</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <NavigationBar activeLink="courses" />

      {/* Simplified Header - Design 2 Style */}
      <header className="bg-white border-b border-slate-100 px-8 py-4 sticky top-16 z-40">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Course</h1>
            <div className="h-6 w-px bg-slate-200 mx-2" />
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-200">
                <Monitor size={18} />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">{course?.title}</h2>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Instructor: {course?.trainer_name || course?.instructor_name || "Expert"}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total Modules</p>
              <p className="text-sm font-black text-slate-900">{modules.length}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Live Sessions</p>
              <p className="text-sm font-black text-slate-900">{liveSessions.length}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          {/* Left: Recordings Sidebar (Exactly like Design 2) */}
          <aside className="lg:col-span-3 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-[750px] sticky top-36">
            <div className="p-6 border-b border-slate-50 bg-slate-50/50">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tighter">Recordings</h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                {modules.filter(m => m.video_url).length} sessions - Select one to watch
              </p>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1">
              {modules.filter(m => m.video_url).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setActiveVideo(m)}
                  className={`w-full text-left px-7 py-6 transition-all relative border-b border-slate-100/50 last:border-0 ${activeVideo?.id === m.id
                    ? "bg-blue-50/30"
                    : "bg-white hover:bg-slate-50"
                    }`}
                >
                  {activeVideo?.id === m.id && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                  )}
                  <h4 className={`text-[11px] font-black tracking-tight uppercase leading-snug ${activeVideo?.id === m.id ? "text-blue-600" : "text-slate-600"
                    }`}>
                    {m.title}
                  </h4>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1.5 flex items-center gap-1">
                    {new Date(m.created_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          </aside>

          {/* Right: Main Content (Exactly like Design 2) */}
          <section className="lg:col-span-9 space-y-8 animate-in fade-in duration-700">
            {activeVideo ? (
              <>
                {/* Video Player */}
                <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-900/10 border-[6px] border-white aspect-video relative">
                  {activeVideo.video_url ? (
                    <iframe
                      key={activeVideo.id}
                      src={getEmbedUrl(activeVideo.video_url)}
                      title={activeVideo.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 bg-slate-950">
                      <Play size={48} className="mb-4 opacity-20" />
                      <p className="font-bold text-sm tracking-tight opacity-40 uppercase">No Video URL Provided</p>
                    </div>
                  )}
                </div>

                {/* Session Title/Info */}
                <div className="px-2">
                  <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase">{activeVideo.title}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase">
                      <Calendar size={12} /> {new Date(activeVideo.created_at).toLocaleDateString()}
                    </span>
                    <span className="text-blue-500 text-[10px] font-black uppercase tracking-widest border-l border-slate-200 pl-4">
                      Video Recording
                    </span>
                  </div>
                </div>

                {/* Class Notes Section (Refined to match Screenshot 2) */}
                <div className="space-y-6 pt-2 pb-12">
                  <div className="flex items-center gap-3 px-2">
                    <div className="w-1 h-6 bg-blue-600 rounded-full" />
                    <h4 className="text-sm font-black text-slate-900 tracking-tight uppercase">Class Notes</h4>
                  </div>

                  <div className="space-y-4">
                    {(activeVideo.notes_file || activeVideo.notes_url) ? (
                      <div className="bg-white rounded-3xl p-6 border border-slate-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-5">
                          <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shrink-0">
                            <FileText size={20} />
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-tight">
                              {activeVideo.notes_file ?
                                activeVideo.notes_file.split('/').pop() :
                                "Class Notes (PDF)"}
                            </h5>
                            <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{new Date(activeVideo.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <a
                          href={activeVideo.notes_file ? (activeVideo.notes_file.startsWith('http') ? activeVideo.notes_file : activeVideo.notes_file.startsWith('/') ? activeVideo.notes_file : `/${activeVideo.notes_file}`) : activeVideo.notes_url}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-900 text-white px-6 py-3 rounded-lg font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95"
                        >
                          <Download size={14} className="mr-1 inline" /> Download
                        </a>
                      </div>
                    ) : (
                      <div className="bg-slate-50/50 rounded-3xl p-10 text-center border border-dashed border-slate-200">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">No notes available for this session</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center text-slate-200 bg-white border-2 border-dashed border-slate-50 rounded-[4rem]">
                <Play size={64} className="opacity-10 mb-6" />
                <p className="font-black text-sm uppercase tracking-widest opacity-20 text-center">Select a session from the sidebar<br />to start watching</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

// End of component

