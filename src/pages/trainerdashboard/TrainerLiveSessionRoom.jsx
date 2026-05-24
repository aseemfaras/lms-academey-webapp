import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Video,
    VideoOff,
    Mic,
    MicOff,
    Monitor,
    Square,
    Play,
    Pause,
    ChevronLeft,
    Loader2,
    CheckCircle2,
    Clock
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getLiveSessions, uploadRecording } from "../../services/api";

export default function TrainerLiveSessionRoom() {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [session, setSession] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    const mediaRecorderRef = useRef(null);
    const chunksRef = useRef([]);
    const streamRef = useRef(null);
    const timerRef = useRef(null);

    useEffect(() => {
        const loadSession = async () => {
            try {
                const data = await getLiveSessions({ id: sessionId });
                if (data && data.length > 0) {
                    setSession(data[0]);
                }
            } catch (err) {
                console.error("Failed to load session", err);
            } finally {
                setLoading(false);
            }
        };
        loadSession();
    }, [sessionId]);

    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        } else {
            clearInterval(timerRef.current);
        }
        return () => clearInterval(timerRef.current);
    }, [isRecording]);

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h > 0 ? h + ':' : ''}${m < 10 ? '0' + m : m}:${s < 10 ? '0' + s : s}`;
    };

    const startRecording = async () => {
        try {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true
            });

            const audioStream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            // Combine audio tracks
            const tracks = [...screenStream.getVideoTracks(), ...audioStream.getAudioTracks()];
            const combinedStream = new MediaStream(tracks);

            streamRef.current = combinedStream;
            chunksRef.current = [];

            const recorder = new MediaRecorder(combinedStream, {
                mimeType: 'video/webm;codecs=vp9,opus'
            });

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            recorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: 'video/webm' });
                await handleUpload(blob);

                // Stop all tracks
                combinedStream.getTracks().forEach(track => track.stop());
                screenStream.getTracks().forEach(track => track.stop());
                audioStream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current = recorder;
            recorder.start();
            setIsRecording(true);
            setRecordingTime(0);

        } catch (err) {
            console.error("Error starting recording:", err);
            alert("Could not start recording. Please ensure you gave permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleUpload = async (blob) => {
        setUploading(true);
        try {
            const file = new File([blob], `recording_${sessionId}.webm`, { type: 'video/webm' });
            await uploadRecording(sessionId, file);
            setUploadSuccess(true);
            setTimeout(() => navigate('/trainer-live'), 3000);
        } catch (err) {
            console.error("Upload failed", err);
            alert("Recording upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-950 flex items-center justify-center text-white">Loading Room...</div>;

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-white flex flex-col font-sans">
            {/* Header */}
            <header className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-[#0F0F11]">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => navigate('/trainer-live')}
                        className="p-3 hover:bg-white/5 rounded-2xl transition-colors text-gray-400 hover:text-white"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-xl font-black tracking-tight">{session?.title || "Live Session"}</h1>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Live Technical Workshop · {user?.full_name}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {isRecording && (
                        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-xl">
                            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-xs font-black font-mono text-red-500">{formatTime(recordingTime)}</span>
                        </div>
                    )}
                    <button className="bg-white/5 hover:bg-white/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                        Invite Students
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 p-8 flex gap-8">
                {/* Visualizer Area */}
                <div className="flex-1 bg-[#0F0F11] rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group shadow-2xl shadow-black">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-50" />

                    <div className="relative z-10 text-center space-y-8 max-w-md">
                        <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-white/10 group-hover:scale-110 transition-transform duration-500">
                            {isRecording ? <Monitor size={40} className="text-blue-500" /> : <VideoOff size={40} className="text-gray-600" />}
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black tracking-tight uppercase">
                                {isRecording ? "Streaming Active" : "Ready to Start"}
                            </h2>
                            <p className="text-gray-500 font-medium text-sm leading-relaxed">
                                {isRecording
                                    ? "Your screen and audio are being captured. Don't forget to stop when you're finished."
                                    : "Launch your workshop. Start recording to automatically save this session as a course module."}
                            </p>
                        </div>
                    </div>

                    {/* Active Overlay for recording */}
                    {isRecording && (
                        <div className="absolute top-8 right-8 flex items-center gap-2 bg-blue-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-4 duration-500">
                            <CheckCircle2 size={12} /> Encrypting Link
                        </div>
                    )}
                </div>

                {/* Sidebar Controls */}
                <aside className="w-80 space-y-6">
                    <div className="bg-[#0F0F11] rounded-[2.5rem] border border-white/5 p-8 flex flex-col gap-6">
                        <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Control Panel</h3>

                        <div className="space-y-4">
                            <ControlButton icon={<Mic size={20} />} label="Microphone" active={true} />
                            <ControlButton icon={<Video size={20} />} label="Camera Feed" active={true} />
                            <ControlButton icon={<Monitor size={20} />} label="Screen Share" active={isRecording} />
                        </div>

                        <div className="pt-6 border-t border-white/5">
                            {!isRecording ? (
                                <button
                                    onClick={startRecording}
                                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.15em] transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <Play size={16} fill="white" /> Start Recording
                                </button>
                            ) : (
                                <button
                                    onClick={stopRecording}
                                    className="w-full bg-red-500 hover:bg-red-400 text-white py-5 rounded-[1.5rem] font-black text-[11px] uppercase tracking-[0.15em] transition-all shadow-xl shadow-red-500/20 active:scale-95 flex items-center justify-center gap-3"
                                >
                                    <Square size={16} fill="white" /> Stop Recording
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Stats Card */}
                    <div className="bg-[#0F0F11] rounded-[2.5rem] border border-white/5 p-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Stability</span>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">99.9% Perfect</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full w-full bg-emerald-500 opacity-20" />
                        </div>
                    </div>
                </aside>
            </main>

            {/* Uploading Overlay */}
            {uploading && (
                <div className="fixed inset-0 z-[200] bg-[#0A0A0B]/90 backdrop-blur-xl flex items-center justify-center p-8">
                    <div className="max-w-md w-full text-center space-y-8">
                        <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/40">
                            <Loader2 size={40} className="animate-spin" />
                        </div>
                        <div className="space-y-3">
                            <h2 className="text-3xl font-black tracking-tight uppercase leading-tight">Processing Master</h2>
                            <p className="text-gray-500 font-medium">Compressing your workshop and deploying to the course curriculum. Please hold tight.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Success Overlay */}
            {uploadSuccess && (
                <div className="fixed inset-0 z-[200] bg-emerald-600 flex items-center justify-center p-8 animate-in fade-in duration-700">
                    <div className="max-w-md w-full text-center space-y-8">
                        <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-white/20">
                            <CheckCircle2 size={40} className="text-emerald-600" />
                        </div>
                        <div className="space-y-3 text-white">
                            <h2 className="text-3xl font-black tracking-tight uppercase leading-tight">Session Deployed</h2>
                            <p className="text-emerald-100 font-medium">Your recording has been successfully processed and added as a module to the course curriculum.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ControlButton({ icon, label, active }) {
    return (
        <button className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${active ? 'bg-white/5 border border-white/10 text-white' : 'text-gray-500 hover:bg-white/5'}`}>
            <div className="flex items-center gap-4">
                <span className={active ? 'text-blue-500' : ''}>{icon}</span>
                <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>
            </div>
            {active ? (
                <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            ) : (
                <div className="w-2 h-2 bg-white/5 rounded-full" />
            )}
        </button>
    );
}
