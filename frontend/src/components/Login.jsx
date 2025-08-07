import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../assets/Logo_LNMIIT2.png";
import background from "../assets/background.jpg";
import OtpLoader from "./OtpLoader";
import toast from 'react-hot-toast';
import axios from '../api/axiosConfig'; // Use the configured axios instance
import { Eye, EyeOff } from 'lucide-react'; // Import icons

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [otpRequested, setOtpRequested] = useState(false);
    const [otp, setOtp] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State for password visibility
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');

        if (token && userRole) {
            switch (userRole) {
                case 'user': navigate('/home'); break;
                case 'office-bearer': navigate('/office-bearer'); break;
                case 'approving-authority': navigate('/approving-authority'); break;
                case 'admin': navigate('/admin'); break;
                default: localStorage.clear(); break;
            }
        }
    }, [navigate]);


    useEffect(() => {
        let timer;
        if (countdown > 0) {
            timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        } else {
            setIsResendDisabled(false);
        }
        return () => clearTimeout(timer);
    }, [countdown]);

    const startCountdown = () => {
        setCountdown(60);
        setIsResendDisabled(true);
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Please fill all fields");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading('Requesting OTP...');
        try {
            await axios.post("/api/auth/login", { email, password });
            setOtpRequested(true);
            toast.success("OTP sent to your registered email id", { id: toastId });
            startCountdown();
        } catch (err) {
            const message = err.response?.data?.error || "Login failed";
            toast.error("Error: " + message, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const toastId = toast.loading('Resending OTP...');
        try {
            await axios.post("/api/auth/login", { email, password });
            toast.success("OTP resent successfully", { id: toastId });
            startCountdown();
        } catch (err) {
            const message = err.response?.data?.error || "Resend failed";
            toast.error("Error: " + message, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!otpRequested) {
            toast.error("Please request OTP first");
            return;
        }
        if (!otp) {
            toast.error("Please enter OTP");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading('Logging in...');
        try {
            const response = await axios.post("/api/auth/verify-otp", { email, otp });
            const data = response.data;

            // Store the token
            localStorage.setItem("token", data.token);
            localStorage.setItem("userRole", data.role);
            localStorage.setItem("userEmail", email);
            if (data.role === 'office-bearer') {
                localStorage.setItem("departmentId", data.departmentId)
            }
            toast.success("Login successful!", { id: toastId });

            // Redirect based on role
            switch (data.role) {
                case 'user': navigate("/home"); break;
                case 'office-bearer': navigate("/office-bearer"); break;
                case 'approving-authority': navigate("/approving-authority"); break;
                case 'admin': navigate("/admin"); break;
                default: navigate("/login"); break;
            }

        } catch (err) {
            const message = err.response?.data?.error || "OTP verification failed";
            toast.error("Error: " + message, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-6 py-12 overflow-hidden">
            <img src={background} alt="LNMIIT Campus" className="absolute inset-0 w-full h-full object-cover z-0" />
            <div className="relative z-10 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="mb-6 text-center">
                    <img src={logo} alt="LNMIIT Logo" className="mx-auto h-10 w-auto" />
                    <h2 className="text-2xl font-semibold text-gray-800 mt-2">Login</h2>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your LNMIIT email id" className="w-full border px-4 py-2 rounded-xl" required />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                        <div className="mt-1 text-right">
                            <Link to="/forgot-password" className="text-blue-600 text-sm">Forgot Password?</Link>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button type="button" onClick={handleRequestOtp} className="flex-1 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700">Request OTP</button>
                        <button type="button" onClick={handleResendOtp} className="flex-1 bg-gray-600 text-white py-2 rounded-xl hover:bg-gray-700 disabled:bg-gray-400" disabled={!otpRequested || isResendDisabled}>
                            {isResendDisabled ? `Resend in ${countdown}s` : "Resend OTP"}
                        </button>
                    </div>
                    {otpRequested && (
                        <div>
                            <label className="block mb-1 font-medium">OTP</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                placeholder="Enter OTP"
                                className="w-full border px-4 py-2 rounded-xl"
                                required={otpRequested}
                                disabled={!otpRequested}
                            />
                            {countdown > 0 && (
                                <p className="text-xs text-center text-gray-500 mt-1">
                                    OTP expires in {countdown}s
                                </p>
                            )}
                        </div>
                    )}
                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700">Login</button>
                </form>
                <div className="mt-4 text-center">
                    <p className="text-sm">Don’t have an account?</p>
                    <Link to="/register" className="text-blue-600 font-medium">Register here</Link>
                </div>
            </div>
            {isLoading && <OtpLoader />}
        </div>
    );
}