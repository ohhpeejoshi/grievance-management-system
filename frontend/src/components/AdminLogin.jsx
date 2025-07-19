import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo_LNMIIT2.png";
import background from "../assets/background.jpg";
import OtpLoader from "./OtpLoader";
import toast from 'react-hot-toast';

export default function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mobile, setMobile] = useState("");
    const [otpRequested, setOtpRequested] = useState(false);
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const requestOtp = async (e) => {
        e.preventDefault();
        if (!email || !password || !mobile) {
            toast.error("Please fill all fields");
            return;
        }
        setIsLoading(true);
        const toastId = toast.loading('Requesting OTP...');
        try {
            const res = await fetch("/api/auth/admin-login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, mobile_number: mobile }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Login failed");
            setOtpRequested(true);
            toast.success("OTP sent to your registered email", { id: toastId });
        } catch (err) {
            toast.error("Error: " + err.message, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const resendOtp = requestOtp;

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
        const toastId = toast.loading('Verifying OTP...');
        try {
            const res = await fetch("/api/auth/admin-verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "OTP verification failed");
            localStorage.setItem("adminEmail", email);
            toast.success("Login successful!", { id: toastId });
            navigate("/admin");
        } catch (err) {
            toast.error("Error: " + err.message, { id: toastId });
        } finally {
            setIsLoading(false);
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
                    onClick={() => navigate("/")}
                >
                    ← Back to Main Page
                </button>
                <div className="mb-6 text-center">
                    <img src={logo} alt="LNMIIT Logo" className="mx-auto h-10 w-auto" />
                    <h2 className="text-2xl font-semibold text-gray-800 mt-2">Admin Login</h2>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
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
                            onChange={e => setPassword(e.target.value)}
                            placeholder="Password"
                            className="w-full border px-4 py-2 rounded-xl"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Mobile Number</label>
                        <input
                            type="tel"
                            value={mobile}
                            onChange={e => setMobile(e.target.value)}
                            placeholder="7906XX6971"
                            className="w-full border px-4 py-2 rounded-xl"
                            required
                        />
                    </div>
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={requestOtp}
                            className="flex-1 bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700"
                        >
                            Request OTP
                        </button>
                        <button
                            type="button"
                            onClick={resendOtp}
                            disabled={!otpRequested}
                            className="flex-1 bg-gray-600 text-white py-2 rounded-xl hover:bg-gray-700"
                        >
                            Resend OTP
                        </button>
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">OTP</label>
                        <input
                            type="text"
                            value={otp}
                            onChange={e => setOtp(e.target.value)}
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
            </div>
            {isLoading && <OtpLoader />}
        </div>
    );
}