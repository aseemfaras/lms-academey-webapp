import React, { useState, useEffect, useMemo } from "react";
import { Search, Play } from "lucide-react";
import NavigationBar from "../components/navigationbar/NavigationBar";
import CourseCard from "../components/coursecard/CourseCard";
import { getCourses, enrollStudent, getEnrollments } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Courses() {
    const [courses, setCourses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    const fetchData = async () => {
        try {
            setLoading(true);
            if (!user) {
                setLoading(false);
                return;
            }

            // Fetch all courses and student's enrollments in parallel
            const [allCourses, enrollmentsData] = await Promise.all([
                getCourses(),
                getEnrollments({ student: user.id })
            ]);

            setCourses(allCourses || []);
            setEnrollments(enrollmentsData || []);
        } catch (err) {
            console.error("Failed to fetch courses or enrollments", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleEnroll = async (course) => {
        if (!user) {
            alert("Please login to enroll in courses.");
            return;
        }
        try {
            await enrollStudent({ course: course.id });
            alert("Successfully enrolled!");
            fetchData(); // Refresh to show 'Enrolled' status
        } catch (err) {
            console.error("Enrollment failed", err);
            alert("Enrollment failed. You might already be enrolled.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <NavigationBar activeLink="courses" />

            {/* Generic Hero Section */}
            <div className="max-w-5xl mx-auto px-6 pt-8">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full -ml-32 -mb-32 blur-2xl group-hover:bg-blue-400/20 transition-all duration-700"></div>

                    <div className="px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-10 relative z-10">
                        {/* Left: Content */}
                        <div className="flex-1 space-y-6 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                                <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                                <span className="text-[10px] font-black uppercase tracking-widest text-blue-100">Unlock Your Potential</span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                                Your Premium <br />
                                <span className="text-blue-200">Learning Platform</span>
                            </h1>
                            <p className="text-blue-100 text-lg font-medium leading-relaxed max-w-lg">
                                Master new skills with expert-led courses designed to accelerate your career and personal growth.
                            </p>
                            <div className="flex flex-wrap items-center gap-6 pt-4 justify-center md:justify-start">
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-white">20+</span>
                                    <span className="text-[10px] font-bold uppercase text-blue-200 tracking-widest">Expert Courses</span>
                                </div>
                                <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-white">500+</span>
                                    <span className="text-[10px] font-bold uppercase text-blue-200 tracking-widest">Active Students</span>
                                </div>
                                <div className="w-px h-8 bg-white/20 hidden sm:block"></div>
                                <div className="flex flex-col">
                                    <span className="text-2xl font-black text-white">24/7</span>
                                    <span className="text-[10px] font-bold uppercase text-blue-200 tracking-widest">Mentor Support</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Premium Illustration Container */}
                        <div className="relative shrink-0 hidden lg:block">
                            <div className="absolute inset-0 bg-blue-400/20 rounded-[2.5rem] blur-2xl -rotate-6 scale-110"></div>
                            <div className="relative bg-white/10 backdrop-blur-md p-4 rounded-[2.5rem] border border-white/20 shadow-2xl">
                                <img
                                    src="/src/assets/learning-platform-hero.png"
                                    alt="Learning Platform"
                                    className="w-80 h-auto rounded-[2rem] shadow-lg transform hover:scale-[1.02] transition-transform duration-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="max-w-5xl mx-auto px-6 py-10">

                {/* Course Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {loading ? (
                        <div className="col-span-full text-center py-20">
                            <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-500 font-medium">Loading courses...</p>
                        </div>
                    ) : courses.length > 0 ? (
                        courses.map((course) => {
                            const isEnrolled = enrollments.some(e => e.course.id === course.id);
                            return (
                                <CourseCard
                                    key={course.id}
                                    course={{
                                        ...course,
                                        instructor: course.trainer_name || "Expert Instructor",
                                        category: course.category || "Development",
                                        image: (course.image && !course.image.startsWith('http'))
                                            ? `${course.image.startsWith('/') ? '' : '/media/'}${course.image}`
                                            : course.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800"
                                    }}
                                    onEnroll={handleEnroll}
                                    enrolled={isEnrolled}
                                />
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200 shadow-sm">
                            <div className="text-5xl mb-4">📚</div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No courses available</h3>
                            <p className="text-gray-500">Check back later for new learning opportunities.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
