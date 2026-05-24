import React, { useState, useEffect } from "react";
import { X, Video, FileText, Hash } from "lucide-react";
import { createModule, updateModule } from "../../services/api";

export default function ModuleModal({ isOpen, onClose, onSuccess, courseId, moduleToEdit, selectedBatch }) {
    const [formData, setFormData] = useState({
        title: "",
        video_url: "",
        notes_url: "",
        order: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (moduleToEdit) {
            setFormData({
                title: moduleToEdit.title || "",
                video_url: moduleToEdit.video_url || "",
                notes_url: moduleToEdit.notes_url || "",
                order: moduleToEdit.order || 0,
            });
        } else {
            setFormData({
                title: "",
                video_url: "",
                notes_url: "",
                order: 0,
            });
        }
    }, [moduleToEdit, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "order" ? parseInt(value) || 0 : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const payload = {
            ...formData,
            course: courseId,
            batch: selectedBatch || "Batch 1",
        };

        try {
            if (moduleToEdit) {
                await updateModule(moduleToEdit.id, payload);
            } else {
                await createModule(payload);
            }
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Failed to save module", err);
            setError(err.response?.data?.detail || "Failed to save module. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200 overflow-hidden">
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600 z-10 bg-white/80 backdrop-blur-sm"
                >
                    <X size={18} />
                </button>

                <div className="p-8">
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">
                        {moduleToEdit ? "Edit Module" : "Add Module"}
                    </h2>
                    <p className="text-slate-500 text-sm mb-6 font-medium">
                        {moduleToEdit ? "Update module details." : "Add a new video or resource to this course."}
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Module Title</label>
                            <div className="relative">
                                <input
                                    required
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Introduction to React"
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 text-sm"
                                />
                                <Edit3 className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Video URL (YouTube/Vimeo)</label>
                            <div className="relative">
                                <input
                                    type="url"
                                    name="video_url"
                                    value={formData.video_url}
                                    onChange={handleChange}
                                    placeholder="https://youtube.com/..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 text-sm"
                                />
                                <Video className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Notes URL (PDF/Doc)</label>
                            <div className="relative">
                                <input
                                    type="url"
                                    name="notes_url"
                                    value={formData.notes_url}
                                    onChange={handleChange}
                                    placeholder="https://drive.google.com/..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 text-sm"
                                />
                                <FileText className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Display Order</label>
                            <div className="relative w-32">
                                <input
                                    type="number"
                                    name="order"
                                    value={formData.order}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 text-sm"
                                />
                                <Hash className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                                <p className="text-red-500 text-xs font-bold text-center">{error}</p>
                            </div>
                        )}

                        <div className="pt-4">
                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 uppercase text-xs tracking-widest"
                            >
                                {loading ? "Saving..." : (moduleToEdit ? "Update Module" : "Add Module")}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

// Internal Edit icon for the input
function Edit3({ className, size }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
    )
}
