import React from "react";
import { Link } from "react-router-dom"; // Import if using React Router
import logo from "../assets/Logo_LNMIIT2.png";
import background from "../assets/background.jpg";

export default function Register() {
    return (
        <div className="relative min-h-screen flex items-center justify-center px-6 py-12 overflow-hidden">
            {/* Subtle full-page background image */}
            <img
                src={background}
                alt="LNMIIT Campus"
                className="absolute inset-0 w-full h-full object-cover z-0"
            />

            {/* Registration Card */}
            <div className="relative z-10 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-2xl p-8">
                <div className="mb-6 text-center">
                    <img
                        src={logo}
                        alt="LNMIIT Logo"
                        className="mx-auto h-10 w-auto object-contain hover:scale-105 transition-transform duration-200"
                    />
                    <h2 className="text-2xl font-semibold text-gray-800 mt-2">Register</h2>
                </div>

                <form className="space-y-4">
                    {/* User Type */}
                    <div>
                        <label className="block mb-1 font-medium">User Type</label>
                        <select className="w-full border px-4 py-2 rounded-xl" required>
                            <option value="">Select User Type</option>
                            <option value="admin">Admin</option>
                            <option value="office-bearer">Office Bearer</option>
                            <option value="student-resident">Student / Resident / Faculty</option>
                        </select>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block mb-1 font-medium">Name</label>
                        <input
                            type="text"
                            placeholder="Ansh Gupta"
                            className="w-full border px-4 py-2 rounded-xl"
                            required
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block mb-1 font-medium">Email</label>
                        <input
                            type="email"
                            placeholder="Enter your LNMIIT email id"
                            className="w-full border px-4 py-2 rounded-xl"
                            required
                        />
                    </div>
                    {/* Password */}
                    <div>
                        <label className="block mb-1 font-medium">Password</label>
                        <input
                            type="password"
                            placeholder="Password"
                            className="w-full border px-4 py-2 rounded-xl"
                            required
                        />
                    </div>
                    {/* Mobile Number */}
                    <div>
                        <label className="block mb-1 font-medium">Mobile Number</label>
                        <input
                            type="tel"
                            placeholder="7906XX6971"
                            className="w-full border px-4 py-2 rounded-xl"
                            required
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full !bg-blue-600 text-white py-2 rounded-xl hover:!bg-blue-700 transition"
                    >
                        Register
                    </button>
                </form>

                {/* Login Link */}
                <div className="mt-4 text-center">
                    <p className="text-xl text-white">
                        Already have an account?{" "}
                    </p>
                    <Link
                        to="/login" // Update the path as needed
                        className=" text-xl text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Login here
                    </Link>

                </div>
            </div>
        </div>
    );
}
