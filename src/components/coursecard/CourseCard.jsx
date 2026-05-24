import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";

export default function CourseCard({ course, onEnroll, enrolled = false, hideVideoButton = false, onViewWatchPage }) {
    const navigate = useNavigate();

    const handleView = () => {
        console.log("Navigating to course:", course.id);
        // alert(`Debug: Navigating to /courses/${course.id}`);
        navigate(`/courses/${course.id}`);
    };

    return (
        <div
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer relative group h-full flex flex-col"
            onClick={handleView}
        >

            {/* Course Image */}
            <div className="h-36 overflow-hidden flex items-center justify-center relative">
                {course.image ? (
                    <img
                        src={course.image}
                        alt={course.title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-400 via-indigo-500 to-blue-500 flex items-center justify-center">
                        <div className="text-center text-white p-6">
                            <div className="text-4xl mb-2">{course.icon || "📚"}</div>
                            <h3 className="text-lg font-bold">{course.category || course.title?.split('-')[0] || "Course"}</h3>
                        </div>
                    </div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                        className="bg-white/90 text-slate-800 px-4 py-2 rounded-full font-bold text-sm shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                        onClick={(e) => {
                            e.stopPropagation();
                            if (enrolled) handleView();
                            else if (onEnroll) onEnroll(course);
                        }}
                    >
                        {enrolled ? "View Recordings" : "Enroll Now"}
                    </button>
                </div>
            </div>

            {/* Course Info */}
            <div className="p-4">
                <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-base text-gray-800 truncate">{course.title}</h3>
                    <p className="text-sm text-gray-500 truncate">Instructor: {course.instructor}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-0.5 rounded">
                            {course.category || "Development"}
                        </span>

                        {enrolled ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleView();
                                }}
                                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition-all font-black text-[10px] uppercase tracking-wider"
                                title="Watch Videos"
                            >
                                <Play size={12} fill="currentColor" />
                                Video
                            </button>
                        ) : (
                            onEnroll && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEnroll(course);
                                    }}
                                    className="text-[10px] text-blue-600 font-black uppercase tracking-widest hover:text-blue-800 transition-colors"
                                >
                                    Enroll Now
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
