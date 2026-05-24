import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";

export default function NavigationBar({ activeLink = "" }) {
    const { user, logout } = useAuth();
    const displayName = user?.full_name || user?.username || "Friend";
    const initials = displayName.charAt(0).toUpperCase();


    return (
        <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-4 py-3">
                <div className="flex items-center justify-between">

                    {/* Left: Logo */}
                    <div className="flex items-center">
                        <Link to="/dashboard">
                            <img
                                src={logo}
                                alt="AIDEAS Logo"
                                className="h-12 w-auto cursor-pointer"
                            />
                        </Link>
                    </div>

                    {/* Middle: Navigation Links */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link
                            to="/dashboard"
                            className={`font-medium transition-colors ${activeLink === "dashboard"
                                ? "text-purple-300 border-b-2 border-purple-300"
                                : "text-gray-700 hover:text-purple-300"
                                }`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/courses"
                            className={`font-medium transition-colors ${activeLink === "courses"
                                ? "text-purple-300 border-b-2 border-purple-300"
                                : "text-gray-700 hover:text-purple-300"
                                }`}
                        >
                            Courses
                        </Link>
                        <a
                            href="#assignments"
                            className={`font-medium transition-colors ${activeLink === "assignments"
                                ? "text-purple-300 border-b-2 border-purple-300"
                                : "text-gray-700 hover:text-purple-300"
                                }`}
                        >
                            Assignments
                        </a>
                        <a
                            href="#practice"
                            className={`font-medium transition-colors ${activeLink === "practice"
                                ? "text-purple-300 border-b-2 border-purple-300"
                                : "text-gray-700 hover:text-purple-300"
                                }`}
                        >
                            Practice
                        </a>
                        <a
                            href="#blogs"
                            className={`font-medium transition-colors ${activeLink === "blogs"
                                ? "text-purple-300 border-b-2 border-purple-300"
                                : "text-gray-700 hover:text-purple-300"
                                }`}
                        >
                            Blogs
                        </a>
                    </div>

                    {/* Right: User Profile - same button style as admin nav */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2.5 bg-purple-50 px-3 py-1.5 rounded-full border border-purple-200 transition-all hover:bg-purple-100 cursor-pointer">
                            <div className="w-8 h-8 rounded-full bg-purple-300 flex items-center justify-center font-bold text-sm text-white shadow-inner">
                                {initials}
                            </div>
                            <span className="font-semibold text-sm text-gray-800">
                                {displayName}
                            </span>
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
