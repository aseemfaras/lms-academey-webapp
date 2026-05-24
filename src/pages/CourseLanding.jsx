import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import NavigationBar from "../components/navigationbar/NavigationBar";
import CourseCard from "../components/coursecard/CourseCard";
import { getCourse } from "../services/api";

export default function CourseLanding() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCourse = async () => {
            try {
                const data = await getCourse(courseId);
                setCourse(data);
            } catch (err) {
                console.error("Failed to fetch course details", err);
            } finally {
                setLoading(false);
            }
        };
        loadCourse();
    }, [courseId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl font-semibold text-gray-500">Course not found.</div>
            </div>
        );
    }

    const handleWatchVideos = () => {
        navigate(`/courses/${courseId}/watch`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <NavigationBar activeLink="courses" />

            <main className="max-w-6xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left: Course Card */}
                    <div>
                        <CourseCard
                            course={{
                                ...course,
                                instructor: course.trainer_name || "Expert Instructor",
                                category: course.category || "Development",
                                image: (course.image && !course.image.startsWith('http'))
                                    ? `${course.image.startsWith('/') ? '' : '/media/'}${course.image}`
                                    : course.image
                            }}
                            enrolled={true}
                            onViewWatchPage={handleWatchVideos}
                        />
                    </div>

                    {/* Right: Course Info */}
                    <div className="space-y-6">
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
                            <p className="text-gray-600 leading-relaxed">{course.description || "Comprehensive course to master the subject."}</p>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-md">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Course Details</h3>
                            <div className="space-y-3">
                                <div>
                                    <span className="text-sm font-semibold text-gray-500">Instructor:</span>
                                    <p className="text-base text-gray-900">{course.trainer_name || "Expert Instructor"}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-gray-500">Category:</span>
                                    <p className="text-base text-gray-900">{course.category || "Development"}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-gray-500">Sessions:</span>
                                    <p className="text-base text-gray-900">{course.modules?.length || 0} video  sessions</p>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleWatchVideos}
                            className="w-full bg-gradient-to-r from-violet-900 via-purple-800 to-indigo-900 text-white py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 font-bold text-lg"
                        >
                            📺 Watch Videos
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
