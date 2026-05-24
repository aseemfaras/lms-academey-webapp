import React, { useState, useEffect } from "react";
import {
    Video,
    Calendar,
    Clock,
    Link as LinkIcon,
    Type,
    AlignLeft,
    ArrowLeft,
    CheckCircle2
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getCourses, createLiveSession } from "../../services/api";
import logo from "../../assets/logo.png";

export default function AdminLiveSessionCreate() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        course: "",
        title: "",
        description: "",
        scheduled_date: "",
        start_time: "",
        end_time: "",
        meeting_link: "",
        batch: "Batch 1"
    });
    const [toast, setToast] = useState({ show: false, message: "" });

    const selectedCourseData = courses.find(c => c.id.toString() === formData.course);
    const availableBatches = (selectedCourseData && selectedCourseData.batches && selectedCourseData.batches.length > 0)
        ? selectedCourseData.batches.map(b => b.name)
        : ["Batch 1"];

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await getCourses();
                setCourses(data);
            } catch (err) {
                console.error("Failed to fetch courses", err);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "course") {
            const courseData = courses.find(c => c.id.toString() === value);
            const defaultBatch = (courseData && courseData.batches && courseData.batches.length > 0) ? courseData.batches[0].name : "Batch 1";
            setFormData(prev => ({ ...prev, course: value, batch: defaultBatch }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: "" }), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createLiveSession(formData);
            showToast("Session Created Successfully");
            setTimeout(() => {
                navigate("/admin-live-sessions");
            }, 1000);
        } catch (err) {
            console.error("Failed to create live session", err);
            alert("Error: " + (err.response?.data?.error || "Failed to create session"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Top Navigation */}
            <nav className="bg-[#2563EB] text-white px-6 py-2 shadow-lg sticky top-0 z-50">
                <div className="max-w-5xl mx-auto grid grid-cols-3 items-center">
                    <div className="flex items-center">
                        <img src={logo} alt="AIDEAS" className="h-10 w-auto" />
                    </div>
                    <div className="hidden lg:flex items-center justify-center space-x-6">
                        <span className="text-white font-bold">Create Live Session</span>
                    </div>
                    <div className="flex items-center justify-end">
                        <Link to="/admin-dashboard" className="text-white/80 hover:text-white flex items-center gap-1 transition-all">
                            <ArrowLeft size={16} /> <span className="text-sm">Back to Dashboard</span>
                        </Link>
                    </div>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto px-4 py-10">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Schedule New Session</h1>
                    <p className="text-slate-500 mt-2 font-medium">Create a live interactive session for students.</p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">

                        {/* Course Selection */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2.5 uppercase tracking-wider flex items-center gap-2">
                                <Video size={16} className="text-blue-600" /> Select Course
                            </label>
                            <select
                                name="course"
                                value={formData.course}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium appearance-none"
                            >
                                <option value="">Choose a course...</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.title}</option>
                                ))}
                            </select>
                        </div>

                        {/* Batch Selection */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2.5 uppercase tracking-wider flex items-center gap-2">
                                <AlignLeft size={16} className="text-blue-600" /> Select Batch
                            </label>
                            <select
                                name="batch"
                                value={formData.batch}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all font-medium appearance-none"
                            >
                                {availableBatches.map(b => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </div>

                        {/* Title */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2.5 uppercase tracking-wider flex items-center gap-2">
                                <Type size={16} className="text-blue-600" /> Session Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                placeholder="e.g. Advanced Python Patterns"
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2.5 uppercase tracking-wider flex items-center gap-2">
                                <AlignLeft size={16} className="text-blue-600" /> Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="What will be covered in this session?"
                                rows="3"
                                className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
                            />
                        </div>

                        {/* Date & Time Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2.5 uppercase tracking-wider flex items-center gap-2">
                                    <Calendar size={16} className="text-blue-600" /> Date
                                </label>
                                <input
                                    type="date"
                                    name="scheduled_date"
                                    value={formData.scheduled_date}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2.5 uppercase tracking-wider flex items-center gap-2">
                                    <Clock size={16} className="text-blue-600" /> Start Time
                                </label>
                                <input
                                    type="time"
                                    name="start_time"
                                    value={formData.start_time}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-600"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2.5 uppercase tracking-wider flex items-center gap-2">
                                    <Clock size={16} className="text-blue-600" /> End Time
                                </label>
                                <input
                                    type="time"
                                    name="end_time"
                                    value={formData.end_time}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-slate-600"
                                />
                            </div>
                        </div>

                        {/* Meeting Link */}
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2.5 uppercase tracking-wider flex items-center gap-2">
                                <LinkIcon size={16} className="text-blue-600" /> Meeting Link
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                                    <LinkIcon size={18} />
                                </div>
                                <input
                                    type="url"
                                    name="meeting_link"
                                    value={formData.meeting_link}
                                    onChange={handleChange}
                                    required
                                    placeholder="https://zoom.us/j/..."
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium text-blue-600 placeholder:text-slate-400"
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                            <Link to="/admin-live-sessions" className="text-slate-500 font-bold hover:text-slate-800 transition-colors">
                                Cancel
                            </Link>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-200 transform transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
                            >
                                {submitting ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    "Schedule Session"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>

            {/* Custom Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-bottom-5 duration-300">
                    <div className="bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-3 border border-white/10">
                        <CheckCircle2 size={24} className="text-green-400" />
                        <span className="font-bold tracking-tight">{toast.message}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
