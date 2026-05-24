import React, { useState } from "react";

import { Menu, Eye, EyeOff } from "lucide-react";

// Using the local logo if available, otherwise falling back strictly to prevent crash

// The user's original code had: import logo from "./assets/logo.png";

import logo from "../../assets/logo.png";

export default function Login() {

const [showPassword, setShowPassword] = useState(false);



return (

    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">

        {/* Header Section */}

        <header className="bg-[#1a1a1a] text-white p-4 flex items-center shadow-md">

            <button className="p-2 mr-4 hover:bg-white/10 rounded-md transition-colors">

                <Menu className="w-6 h-6" />

            </button>

            <div className="flex-1 flex justify-center mr-12"> {/* mr-12 to balance the menu icon space approximately */}

                <h1 className="text-xl tracking-wide font-normal">AIDEAS LMS DASBOARD</h1>

            </div>

        </header>



        {/* Main Content */}

        <div className="flex-1 flex items-center justify-center p-4">



            <div className="bg-white rounded-[2rem] shadow-xl w-full max-w-5xl flex overflow-hidden min-h-[500px]">



                {/* Left Panel - Purple Gradient with Logo */}

                {/* Left Panel - Deep Cool Slate Gradient for Low Temp feel */}

                {/* Left Panel - Deep Purple/Violet Gradient */}

                <div className="hidden md:flex w-1/2 bg-gradient-to-br from-violet-900 to-purple-900 p-12 flex-col items-center justify-center relative text-white">

                    {/* Geometric Shapes Overlay */}

                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">

                        {/* Shapes adapted to purple theme */}

                        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-fuchsia-600 rounded-full blur-[100px] mix-blend-overlay"></div>

                        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-600 rounded-full blur-[80px] mix-blend-overlay"></div>

                        {/* Angular beam cue */}

                        <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/5 to-transparent"></div>

                    </div>



                    <div className="relative z-10 flex flex-col items-center text-center">

                        {/* Logo Area - Increased size for dominance */}

                        <div className="mb-8 flex flex-col items-center justify-center">

                            {/* Logo Reconstruction: Icon + Text (Restored as per user request) */}

                            <div className="flex items-center gap-3">

                                {/* Icon Container - Cropped */}

                                <div className="h-20 w-16 overflow-hidden relative flex-shrink-0">

                                    <img

                                        src={logo}

                                        alt="AIDEAS Icon"

                                        className="h-[120%] w-auto max-w-none object-left absolute left-0 top-[-10%]"

                                        // Screen blends black background away.

                                        style={{ mixBlendMode: 'screen', filter: 'contrast(1.2)' }}

                                    />

                                </div>



                                <div className="flex flex-col items-start justify-center h-full">

                                    <h1 className="text-5xl font-bold text-white tracking-wide leading-none">AIDEAS</h1>

                                    <p className="text-white/90 text-[0.65rem] tracking-[0.25em] font-medium uppercase mt-1">

                                        IDEATE _ INNOVATE _ INSPIRE

                                    </p>

                                </div>

                            </div>

                        </div>



                        <p className="text-sm leading-relaxed max-w-sm font-light">

                            Transform your career with industry-leading software training programs.

                            Join thousands of successful professionals who started their journey with Aideas Academy.

                        </p>

                    </div>

                </div>



                {/* Right Panel - Login Form */}

                <div className="w-full md:w-1/2 p-10 md:p-16 flex flex-col justify-center">



                    <div className="w-full max-w-md mx-auto">

                        <h2 className="text-3xl font-bold mb-8 text-black">Welcome Back !</h2>



                        <p className="text-sm text-gray-500 mb-6 font-medium">Please enter your login details</p>



                        <form className="space-y-5">



                            {/* Email Input */}

                            <div className="space-y-1">

                                <input

                                    type="email"

                                    placeholder="Enter your email address"

                                    className="w-full bg-gray-50 border-b border-gray-200 p-3 text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-400"

                                />

                            </div>



                            {/* Password Input */}

                            <div className="space-y-1 relative">

                                <input

                                    type={showPassword ? "text" : "password"}

                                    placeholder="password"

                                    className="w-full bg-gray-50 border-b border-gray-200 p-3 text-sm focus:outline-none focus:border-purple-500 transition-colors placeholder-gray-400"

                                />

                                <button

                                    type="button"

                                    onClick={() => setShowPassword(!showPassword)}

                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"

                                >

                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}

                                </button>

                            </div>



                            {/* Options Row */}

                            <div className="flex justify-between items-center text-xs mt-2">

                                <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600">

                                    <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />

                                    <span className="font-medium">Keep me logged in</span>

                                </label>

                                <a href="#" className="text-purple-600 font-medium hover:underline">Forgot password ?</a>

                            </div>



                            {/* Submit Button */}

                            <button className="w-full bg-[#7B4AFF] hover:bg-[#6a3ee3] text-white font-bold py-3 rounded-md shadow-lg shadow-purple-200 transition-all mt-6">

                                SIGN IN

                            </button>



                        </form>

                    </div>



                </div>



            </div>

        </div>

    </div>

);

}