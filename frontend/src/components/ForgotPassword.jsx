import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import logo from "../assets/Logo_LNMIIT2.png";
import background from "../assets/background.jpg";
import OtpLoader from "./OtpLoader";
import toast from 'react-hot-toast';
import axios from '../api/axiosConfig'; // Use the configured axios instance

export default function ForgotPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [identifier, setIdentifier] = useState("");
    const [otpRequested, setOtpRequested] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [countdown, setCountdown] = useState(0);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
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
                            </div>

                            <div>
                                <label className="block mb-1 font-medium">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    className="w-full border px-4 py-2 rounded-xl"
                                    required
                                />
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