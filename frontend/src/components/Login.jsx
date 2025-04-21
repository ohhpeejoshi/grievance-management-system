import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/Logo_LNMIIT2.png";
import background from "../assets/background.jpg";
import Loader from "./Loader";

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate login process delay
        setTimeout(() => {
            navigate("/home");
        }, 2000); // Adjust delay as needed
    };

    return isLoading ? (
        <Loader />
    ) : (
        <div className="relative min-h-screen flex items-center justify-center px-6 py-12 overflow-hidden">
            {/* Subtle full-page background image */}
            <img
                src={background}
                alt="LNMIIT Campus"
                className="absolute inset-0 w-full h-full object-cover z-0"
            />

            {/* Login Card */}
            <div className="relative z-10 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="mb-6 text-center">
                    <img
                        src={logo}
                        alt="LNMIIT Logo"
                        className="mx-auto h-10 w-auto object-contain hover:scale-105 transition-transform duration-200"
                    />
                    <h2 className="text-2xl font-semibold text-gray-800 mt-2">Login</h2>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
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

                    {/* Login Button */}
                    <button
                        type="submit"
                        className="w-full !bg-blue-600 text-white py-2 rounded-xl hover:!bg-blue-700 transition"
                    >
                        Login
                    </button>
                </form>

                {/* Register Link */}
                <div className="mt-4 text-center">
                    <p className="text-xl text-white">
                        Don’t have an account?
                    </p>
                    <Link
                        to="/register"
                        className="text-blue-600 hover:text-blue-700 font-medium text-xl"
                    >
                        Register here
                    </Link>
                </div>

            </div>
        </div>
    );
}
