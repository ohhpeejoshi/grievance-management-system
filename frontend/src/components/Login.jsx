import { Link, useNavigate } from "react-router-dom";
import logo from '../assets/Logo_LNMIIT2.png';
import background from '../assets/background.jpg';

export default function Login() {
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        navigate("/home");
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-6 py-12 overflow-hidden">

            {/* Full Page Transparent Background */}
            <img
                src={background}
                alt="LNMIIT Campus"
                className="absolute inset-0 w-full h-full object-cover  z-0"
            />

        
            

            {/* Login Card */}
            <div className="relative z-10 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="mb-6 text-center">
                    <img
                        src={logo}
                        alt="LNMIIT Logo"
                        className="mx-auto h-10 w-auto object-contain hover:scale-105 transition-transform duration-200"
                    />
                    <span className="block mt-2 text-lg font-medium">Login</span>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-2 border rounded-xl"
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="w-full px-4 py-2 border rounded-xl"
                        required
                    />
                    <button
                        type="submit"
                        className="w-full !bg-blue-600 text-white py-2 rounded-xl hover:!bg-blue-700 transition"
                    >
                        Login
                    </button>
                </form>
                <p className="text-center text-gray-600 mt-4">
                    Don’t have an account?{" "}
                    <Link to="/register" className="text-blue-600 underline">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}
