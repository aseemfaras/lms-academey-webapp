import React, { useState, useRef, useEffect } from "react";
import { X, Upload } from "lucide-react";
import { updateCourse } from "../../services/api";
import { getMediaUrl } from "../../config/env";

export default function EditCourseModal({ isOpen, onClose, onSuccess, course }) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        category: "General",
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (course) {
            setFormData({
                title: course.title || "",
                description: course.description || "",
                category: course.category || "General",
            });
            // Handle image preview correctly for both absolute and relative paths
            if (course.image) {
                const previewUrl = course.image.startsWith('http')
                    ? course.image
                    : getMediaUrl(course.image);
                setImagePreview(previewUrl);
            }
        }
    }, [course, isOpen]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const data = new FormData();
        data.append("title", formData.title);
        data.append("description", formData.description);
        data.append("category", formData.category);
        if (imageFile) {
            data.append("image", imageFile);
        }

        try {
            await updateCourse(course.id, data);
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Failed to update course:", err);
            setError("Failed to update course. Please try again.");
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
                    <h2 className="text-2xl font-bold text-slate-800 mb-1">Edit Course</h2>
                    <p className="text-slate-500 text-sm mb-6 font-medium">Update the course details below.</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Course Title</label>
                            <input
                                required
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 text-sm"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Description</label>
                            <textarea
                                required
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 text-sm resize-none"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest text-card">Course Thumbnail</label>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative h-32 w-full rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden ${imagePreview ? "border-blue-200 bg-blue-50/10" : "border-slate-200 bg-slate-50 hover:bg-slate-100/50"}`}
                            >
                                {imagePreview ? (
                                    <>
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                                            Change Image
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400">
                                            <Upload size={20} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Upload Image</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                                <p className="text-red-500 text-xs font-bold text-center">{error}</p>
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                disabled={loading}
                                type="submit"
                                className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:bg-blue-300 text-white py-3 rounded-xl font-bold transition-all shadow-md active:scale-95 uppercase text-xs tracking-widest"
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
