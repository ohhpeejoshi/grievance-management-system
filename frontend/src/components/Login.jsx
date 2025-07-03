import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import logo from "../assets/Logo_LNMIIT2.png";
import background from "../assets/background.jpg";
import Loader from "./Loader";

export default function Login() {
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mobile, setMobile] = useState("");
    const [otpRequested, setOtpRequested] = useState(false);
    const [otp, setOtp] = useState("");
    const navigate = useNavigate();

    const handleRequestOtp = (e) => {
        e.preventDefault();
        // TODO: call OTP API
        setOtpRequested(true);
        alert("OTP sent to your mobile number.");
    };

    const handleResendOtp = (e) => {
        e.preventDefault();
        // TODO: call resend OTP API
        alert("OTP resent to your mobile number.");
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (otpRequested && !otp) {
            alert("Please enter OTP");
            return;
        }
        setIsLoading(true);
        // TODO: verify credentials and OTP via API
        setTimeout(() => {
            navigate("/home");
        }, 2000);
    };

    return isLoading ? (
        <Loader />
    ) : (
        <div className="relative min-h-screen flex items-center justify-center px-6 py-12 overflow-hidden">
            <img
                src={background}
                alt="LNMIIT Campus"
                className="absolute inset-0 w-full h-full object-cover z-0"
            />
            <div className="relative z-10 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl w-full max-w-md p-8">
                <div className="mb-6 text-center">
                    <img src={logo} alt="LNMIIT Logo" className="mx-auto h-10 w-auto" />
                    <h2 className="text-2xl font-semibold text-gray-800 mt-2">Login</h2>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your LNMIIT email id"
                            className="w-full border px-4 py-2 rounded-xl"
                            required
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full border px-4 py-2 rounded-xl"
                            required
                        />
                        <div className="mt-1 text-right">
                            <Link to="/forgot-password" className="text-blue-600 text-sm">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Mobile Number</label>
                        <input
                            type="tel"
                            value={mobile}
                            onChange={(e) => setMobile(e.target.value)}
                            placeholder="7906XX6971"
                            className="w-full border px-4 py-2 rounded-xl"
                            required
                        />
                    </div>

                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={handleRequestOtp}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
                        >
                            Request OTP
                        </button>
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            className="flex-1 bg-gray-600 text-white py-2 rounded-xl hover:bg-gray-700"
                            disabled={!otpRequested}
                        >
                            Resend OTP
                        </button>
                    </div>

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
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
                    >
                        Login
                    </button>
                </form>

                <div className="mt-4 text-center">
                    <p className="text-sm">Don’t have an account?</p>
                    <Link to="/register" className="text-blue-600 font-medium">
                        Register here
                    </Link>
                </div>
            </div>
        </div>
    );
}