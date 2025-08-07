import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../assets/Logo_LNMIIT2.png";
import background from "../assets/background.jpg";
import OtpLoader from "./OtpLoader";
import toast from 'react-hot-toast';
import axios from '../api/axiosConfig'; // Use the configured axios instance
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

export default function ForgotPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [identifier, setIdentifier] = useState("");
    const [otpRequested, setOtpRequested] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, label: '', color: 'bg-gray-200' });
    const navigate = useNavigate();

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

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setNewPassword(password);
        setPasswordStrength(checkPasswordStrength(password));
    };

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!identifier) {
            toast.error("Please enter your email.");
            return;
        }

        const toastId = toast.loading('Requesting OTP...');
        try {
            const res = await axios.post("/api/auth/forgot-password", { identifier });

            toast.success(res.data.message, { id: toastId });
            setOtpRequested(true);
            startCountdown();
        } catch (err) {
            const message = err.response?.data?.error || "Failed to request OTP.";
            toast.error(message, { id: toastId });
        }
    };

    const handleResendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const toastId = toast.loading('Resending OTP...');
        try {
            await axios.post("/api/auth/forgot-password", { identifier });

            toast.success("OTP resent successfully", { id: toastId });
            startCountdown();
        } catch (err) {
            const message = err.response?.data?.error || "Resend failed";
            toast.error("Error: " + message, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        if (!otp) {
            toast.error("Please enter the OTP you received.");
            return;
        }
        if (!newPassword) {
            toast.error("Please enter a new password.");
            return;
        }
        if (passwordStrength.score < 2) {
            toast.error("Password is too weak.");
            return;
        }

        setIsLoading(true);
        const toastId = toast.loading('Resetting password...');
        try {
            const res = await axios.post("/api/auth/reset-password", { identifier, otp, newPassword });

            toast.success(res.data.message, { id: toastId });
            navigate("/login");
        } catch (err) {
            const message = err.response?.data?.error || "Failed to reset password.";
            toast.error(message, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center px-6 py-12 overflow-hidden">
            <img
                src={background}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover z-0"
            />

            <div className="relative z-10 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="mb-6 text-center">
                    <img src={logo} alt="LNMIIT Logo" className="mx-auto h-10 w-auto" />
                    <h2 className="text-2xl font-semibold text-gray-800 mt-2">
                        Forgot Password
                    </h2>
                </div>

                <form
                    onSubmit={otpRequested ? handleReset : handleRequestOtp}
                    className="space-y-4"
                >
                    <div>
                        <label className="block mb-1 font-medium">
                            Email
                        </label>
                        <input
                            type="email"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="Enter your registered email"
                            className="w-full border px-4 py-2 rounded-xl"
                            required
                            disabled={otpRequested}
                        />
                    </div>

                    {otpRequested && (
                        <>
                            <div>
                                <label className="block mb-1 font-medium">OTP</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="Enter OTP"
                                    className="w-full border px-4 py-2 rounded-xl"
                                    required
                                />
                                {countdown > 0 && (
                                    <p className="text-xs text-center text-gray-500 mt-1">
                                        OTP expires in {countdown}s
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block mb-1 font-medium">New Password</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={handlePasswordChange}
                                        placeholder="Enter new password"
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
                                {newPassword && (
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div className={`${passwordStrength.color} h-1.5 rounded-full transition-all`} style={{ width: `${passwordStrength.score * 25}%` }}></div>
                                        </div>
                                        <p className="text-xs text-right mt-1" style={{ color: passwordStrength.color.replace('bg-', '') }}>{passwordStrength.label}</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <div className="flex space-x-2">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
                        >
                            {otpRequested ? "Reset Password" : "Request OTP"}
                        </button>
                        {otpRequested && (
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                className="flex-1 bg-gray-600 text-white py-2 rounded-xl hover:bg-gray-700 disabled:bg-gray-400"
                                disabled={isResendDisabled}
                            >
                                {isResendDisabled ? `Resend in ${countdown}s` : "Resend OTP"}
                            </button>
                        )}
                    </div>

                </form>

                <div className="mt-4 text-center">
                    <Link
                        to="/login"
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>

            {isLoading && <OtpLoader />}
        </div>
    );
}