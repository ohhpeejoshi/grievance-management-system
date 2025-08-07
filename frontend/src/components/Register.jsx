import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/Logo_LNMIIT2.png";
import background from "../assets/background.jpg";
import toast from 'react-hot-toast';
import axios from '../api/axiosConfig';
import { Eye, EyeOff } from 'lucide-react';

const checkPasswordStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^a-zA-Z0-9]/)) score++;

    switch (score) {
        case 1:
            return { score, label: 'Weak', color: 'bg-red-500' };
        case 2:
            return { score, label: 'Medium', color: 'bg-yellow-500' };
        case 3:
            return { score, label: 'Good', color: 'bg-blue-500' };
        case 4:
            return { score, label: 'Strong', color: 'bg-green-500' };
        default:
            return { score: 0, label: 'Too short', color: 'bg-gray-200' };
    }
};

export default function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        roll_number: "",
        name: "",
        email: "",
        password: "",
        mobile_number: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: 'bg-gray-200' });


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === "password") {
            setPasswordStrength(checkPasswordStrength(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Registering...');
        try {
            await axios.post("/api/auth/register", formData);

            toast.success("Registration successful ✅", { id: toastId });
            setFormData({
                roll_number: "",
                name: "",
                email: "",
                password: "",
                mobile_number: "",
            });
            navigate('/login'); // Redirect to login after successful registration
        } catch (err) {
            console.error(err);
            const message = err.response?.data?.error || "Registration failed";
            toast.error(message, { id: toastId });
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-6 py-12 overflow-hidden">
            <img
                src={background}
                alt="LNMIIT Campus"
                className="absolute inset-0 w-full h-full object-cover z-0"
            />
            <div className="relative z-10 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-8">
                <button
                    className="mb-4 text-blue-600 hover:underline text-sm"
                    type="button"
                    onClick={() => navigate("/login")}
                >
                    ← Back to Login
                </button>
                <div className="mb-6 text-center">
                    <img
                        src={logo}
                        alt="LNMIIT Logo"
                        className="mx-auto h-10 w-auto object-contain hover:scale-105 transition-transform duration-200"
                    />
                    <h2 className="text-2xl font-semibold text-gray-800 mt-2">Register</h2>
                </div>

                <form className="space-y-4" onSubmit={handleSubmit}>
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
                    <div>
                        <label className="block mb-1 font-medium">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                className="w-full border px-4 py-2 rounded-xl"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        {formData.password && (
                            <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div className={`${passwordStrength.color} h-1.5 rounded-full transition-all`} style={{ width: `${passwordStrength.score * 25}%` }}></div>
                                </div>
                                <p className="text-xs text-right mt-1" style={{ color: passwordStrength.color.replace('bg-', '') }}>{passwordStrength.label}</p>
                            </div>
                        )}
                    </div>
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
                    <button
                        type="submit"
                        className="w-full !bg-blue-600 text-white py-2 rounded-xl hover:!bg-blue-700 transition"
                    >
                        Register
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-sm">Already have an account?</p>
                    <Link to="/login" className="text-blue-600 font-medium">
                        Login here
                    </Link>
                </div>
            </div>
        </div>
    );
}