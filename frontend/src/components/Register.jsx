import React, { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/Logo_LNMIIT2.png";
import background from "../assets/background.jpg";

export default function Register() {
    const [formData, setFormData] = useState({
        roll_number: "",
        name: "",
        email: "",
        password: "",
        mobile_number: "",
    });

    const [message, setMessage] = useState("");

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("http://localhost:3000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (res.ok) {
                setMessage("Registration successful ✅");
                setFormData({
                    roll_number: "",
                    name: "",
                    email: "",
                    password: "",
                    mobile_number: "",
                });
            } else {
                setMessage(data.error || "Registration failed");
            }
        } catch (err) {
            console.error(err);
            setMessage("Server error");
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-6 py-12 overflow-hidden">
            {/* Subtle full-page background image */}
            <img
                src={background}
                alt="LNMIIT Campus"
                className="absolute inset-0 w-full h-full object-cover z-0"
            />

            {/* Registration Card */}
            <div className="relative z-10 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="mb-6 text-center">
                    <img
                        src={logo}
                        alt="LNMIIT Logo"
                        className="mx-auto h-10 w-auto object-contain hover:scale-105 transition-transform duration-200"
                    />
                    <h2 className="text-2xl font-semibold text-gray-800 mt-2">Register</h2>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    {/* Roll No */}
                    <div>
                        <label className="block mb-1 font-medium">Roll Number</label>
                        <input
                            type="text"
                            name="roll_number"
                            value={formData.roll_number}
                            onChange={handleChange}
                            placeholder="Roll Number"
                            className="w-full border px-4 py-2 rounded-xl"
                            required
                        />
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block mb-1 font-medium">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
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
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
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
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
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
                            name="mobile_number"
                            value={formData.mobile_number}
                            onChange={handleChange}
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

                {/* Feedback Message */}
                {message && (
                    <p className="mt-4 text-center text-red-600 font-medium">{message}</p>
                )}

                {/* Login Link */}
                <div className="mt-4 text-center">
                    <p className="text-sm">
                        Already have an account?{" "}
                    </p>
                    <Link
                        to="/login"
                        className=" text-sm text-blue-600"
                    >
                        Login here
                    </Link>
                </div>
            </div>
        </div>
    );
}