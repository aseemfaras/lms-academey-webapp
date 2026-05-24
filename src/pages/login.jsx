import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

export default function Login() {
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const handleSignIn = (e) => {
        e.preventDefault();
        // Here you would typically validate credentials
        // For now, we'll just navigate to the dashboard
        navigate("/dashboard");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-6">

            {/* Main Card */}
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl flex overflow-hidden">

                {/* LEFT PANEL - Solid color background */}
                <div className="hidden md:flex w-1/2 bg-purple-300 p-12 flex-col items-center justify-center relative overflow-hidden">


                    {/* Logo and Content - No separate container */}
                    <div className="relative z-10 flex flex-col items-center text-center">

                        {/* Logo Image */}
                        <div className="mb-6">
                            <img
                                src={logo}
                                alt="AIDEAS Logo"
                                className="w-48 h-auto drop-shadow-2xl"
                                style={{ filter: 'brightness(1.1) drop-shadow(0 0 15px rgba(255,255,255,0.5))' }}
                            />
                        </div>

                        {/* White Logo Text */}
                        <div className="mb-8">

                        </div>

                        {/* Description */}
                        <p className="text-sm leading-relaxed max-w-xs text-gray-700 font-medium">
                            Transform your career with industry-leading software training programs.
                            Join thousands of successful professionals who started their journey
                            with Aideas Academy.
                        </p>
                    </div>

                </div>

                {/* RIGHT PANEL */}
                <div className="w-full md:w-1/2 p-10 md:p-14">

                    <h2 className="text-3xl font-bold mb-2">Welcome Back !</h2>
                    <p className="text-gray-500 mb-6">Please enter your login details</p>

                    {/* Email */}
                    <input
                        type="email"
                        placeholder="Enter your email address"
                        className="w-full bg-gray-100 rounded-md p-3 mb-5 outline-purple-500"
                    />

                    {/* Password */}
                    <div className="relative mb-5">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full bg-gray-100 rounded-md p-3 outline-purple-500"
                        />

                        <button
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

                    {/* Button - Matching solid color theme */}
                    <button
                        onClick={handleSignIn}
                        className="w-full bg-purple-300 text-white py-3 rounded-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 font-semibold"
                    >
                        SIGN IN
                    </button>

                </div>

            </div>
        </div>
    );
}
