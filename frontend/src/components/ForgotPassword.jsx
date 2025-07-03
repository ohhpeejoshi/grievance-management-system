// frontend/src/components/ForgotPassword.jsx
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/Logo_LNMIIT2.png";
import background from "../assets/background.jpg";
import Loader from "./Loader";

export default function ForgotPassword() {
    const [isLoading, setIsLoading] = useState(false);
    const [identifier, setIdentifier] = useState("");
    const [otpRequested, setOtpRequested] = useState(false);
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        if (!identifier) {
            setErrorMessage("Please enter your email or mobile number.");
            return;
        }

        try {
            const res = await fetch("http://localhost:3000/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier }),
            });
            const data = await res.json();

            if (!res.ok) {
                // check for registration error
                if (data.error && data.error.toLowerCase().includes("not found")) {
                    setErrorMessage("User not registered. Please register below.");
                } else {
                    setErrorMessage(data.error || "Failed to request OTP.");
                }
                return;
            }

            alert(data.message);
            setOtpRequested(true);
        } catch (err) {
            setErrorMessage(err.message);
        }
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        if (!otp) {
            setErrorMessage("Please enter the OTP you received.");
            return;
        }
        if (!newPassword) {
            setErrorMessage("Please enter a new password.");
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("http://localhost:3000/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ identifier, otp, newPassword }),
            });
            const data = await res.json();

            if (!res.ok) {
                setErrorMessage(data.error || "Failed to reset password.");
                return;
            }

            alert(data.message);
            navigate("/login");
        } catch (err) {
            setErrorMessage(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return isLoading ? (
        <Loader />
    ) : (
        <div className="relative min-h-screen flex items-center justify-center px-6 py-12 overflow-hidden">
            <img
                src={background}
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover z-0"
            />
            <div className="relative z-10 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="mb-6 text-center">
                    <img src={logo} alt="LNMIIT Logo" className="mx-auto h-10 w-auto" />
                    <h2 className="text-2xl font-semibold text-gray-800 mt-2">Forgot Password</h2>
                </div>

                {errorMessage && (
                    <div className="mb-4 text-center text-red-600">
                        {errorMessage}
                    </div>
                )}

                <form onSubmit={otpRequested ? handleReset : handleRequestOtp} className="space-y-4">
                    {/* Email or Mobile */}
                    <div>
                        <label className="block mb-1 font-medium">Email or Mobile Number</label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            placeholder="Enter your registered email or mobile"
                            className="w-full border px-4 py-2 rounded-xl"
                            required
                            disabled={otpRequested}
                        />
                    </div>

                    {/* OTP Field */}
                    {otpRequested && (
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
                    )}

                    {/* New Password Field */}
                    {otpRequested && (
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
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition"
                    >
                        {otpRequested ? "Reset Password" : "Request OTP"}
                    </button>
                </form>

                {/* show register link if user not found */}
                {errorMessage.toLowerCase().includes("register") && (
                    <div className="mt-4 text-center">
                        <p className="text-sm">Don’t have an account?</p>
                        <Link to="/register" className="text-blue-600 font-medium">
                            Register here
                        </Link>
                    </div>
                )}

                {/* always show back to login */}
                {!errorMessage.toLowerCase().includes("register") && (
                    <div className="mt-4 text-center">
                        <Link
                            to="/login"
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                        >
                            Back to Login
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
