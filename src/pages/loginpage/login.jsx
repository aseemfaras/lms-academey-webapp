import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../assets/logo.png";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("shalu@gmail.com");
    const [password, setPassword] = useState("password123");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            console.log("Login Page: Attempting login with", email);
            const user = await login({ email, password });
            console.log("Login Page: Login success, user data:", user);

            if (!user || !user.role) {
                throw new Error("Invalid user data received");
            }

            const role = user.role.toLowerCase();
            console.log("Login Page: Redirecting based on role:", role);

            // Redirect based on role
            if (role === "admin") {
                navigate("/admin-dashboard");
            } else if (role === "student") {
                navigate("/dashboard");
            } else if (role === "trainer") {
                navigate("/trainer-dashboard");
            } else {
                console.warn("Login Page: Unknown role detected:", role);
                setError("You do not have permission to access this application.");
            }
        } catch (err) {
            console.error("Login Page: Login flow failed", err);
            setError(err.response?.data?.error || "Invalid credentials");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6">

            {/* Main Card */}
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl flex overflow-hidden">

                {/* LEFT PANEL - Enhanced attractive gradient */}
                <div className="hidden md:flex w-1/2 bg-gradient-to-br from-violet-900 via-purple-800 to-indigo-900 p-12 flex-col items-center justify-center text-white relative overflow-hidden">

                    {/* Decorative background elements */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-20">
                        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-fuchsia-500 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400 rounded-full blur-3xl"></div>
                    </div>

                    {/* Logo Section with Highlight */}
                    <div className="relative z-10 mb-8">
                        {/* Highlighted container */}
                        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl border border-white/20">
                            {/* Logo Image */}
                            <div className="mb-4 flex justify-center">
                                <img
                                    src={logo}
                                    alt="AIDEAS Logo"
                                    className="w-40 h-auto drop-shadow-2xl"
                                    style={{ filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.3))' }}
                                />
                            </div>

                            {/* White Logo Text with Highlight */}
                            <div className="text-center">
                                {/* Optional text here */}
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="relative z-10 text-sm text-center max-w-xs leading-relaxed text-white/90">
                        Transform your career with industry-leading software training programs.
                        Join thousands of successful professionals who started their journey
                        with Aideas Academy.
                    </p>

                </div>

                {/* RIGHT PANEL */}
                <form onSubmit={handleLogin} className="w-full md:w-1/2 p-10 md:p-14">

                    <h2 className="text-3xl font-bold mb-2">Welcome Back !</h2>
                    <p className="text-gray-500 mb-3">Please enter your login details</p>

                    {error && (
                        <p className="text-red-500 text-sm mb-4">
                            {error}
                        </p>
                    )}

                    {/* Email */}
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter email"
                        className="w-full bg-gray-100 rounded-md p-3 mb-5 outline-purple-500"
                    />

                    {/* Password */}
                    <div className="relative mb-5">
                        <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full bg-gray-100 rounded-md p-3 outline-purple-500"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3 text-gray-500"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Options */}
                    <div className="flex justify-between text-sm mb-6">

                        <label className="flex items-center gap-2">
                            <input type="checkbox" />
                            Keep me logged in
                        </label>

                        <a href="#" className="text-purple-600">
                            Forgot password ?
                        </a>

                    </div>

                    {/* Button - Matching left background gradient */}
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-violet-900 via-purple-800 to-indigo-900 text-white py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                    >
                        SIGN IN
                    </button>

                </form>

            </div>
        </div>
    );
}