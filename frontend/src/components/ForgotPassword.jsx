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
    const navigate = useNavigate();

    const handleRequestOtp = (e) => {
        e.preventDefault();
        if (!identifier) {
            alert("Please enter your email or mobile number.");
            return;
        }
        // TODO: API call to send OTP to identifier
        setOtpRequested(true);
        alert("OTP has been sent to your email or mobile.");
    };

    const handleReset = (e) => {
        e.preventDefault();
        if (!otp) {
            alert("Please enter the OTP you received.");
            return;
        }
        if (!newPassword) {
            alert("Please enter a new password.");
            return;
        }
        setIsLoading(true);
        // TODO: API call to verify OTP and reset password
        setTimeout(() => {
            setIsLoading(false);
            alert("Your password has been reset successfully.");
            navigate("/login");
        }, 2000);
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

                <div className="mt-4 text-center">
                    <Link
                        to="/login"
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
