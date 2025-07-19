import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Logo_LNMIIT2.png";
import background from "../assets/background.jpg";
import OtpLoader from "./OtpLoader";
import toast from 'react-hot-toast';

export default function OfficeBearerLogin() {
    const [departments, setDepartments] = useState([]);
    const [department, setDepartment] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mobile, setMobile] = useState("");
    const [otpRequested, setOtpRequested] = useState(false);
    const [otp, setOtp] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("/api/grievances/departments")
            .then(res => res.json())
            .then(setDepartments)
            .catch(err => console.error("Dept fetch failed:", err));
    }, []);

    const sendLoginRequest = async () => {
        const selectedDepartment = departments.find(d => d.id === parseInt(department));
        const departmentName = selectedDepartment ? selectedDepartment.name : '';

        if (!departmentName) {
            toast.error("Could not find the department name. Please select a department.");
            throw new Error("Department name not found");
        }

        const response = await fetch("/api/auth/office-bearer-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ department: departmentName, email, password, mobile_number: mobile }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Login request failed");
        return data;
    }

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        if (!department || !email || !password || !mobile) {
            toast.error("Please fill all fields");
            return;
        }
        setIsLoading(true);
        const toastId = toast.loading('Requesting OTP...');
        try {
            await sendLoginRequest();
            setOtpRequested(true);
            toast.success("OTP sent to your registered email id", { id: toastId });
        } catch (err) {
            toast.error("Error: " + err.message, { id: toastId });
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const toastId = toast.loading('Resending OTP...');
        try {
            await sendLoginRequest();
            toast.success("OTP resent successfully", { id: toastId });
        } catch (err) {
            toast.error("Error: " + err.message, { id: toastId });
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
            const response = await fetch("/api/auth/office-bearer-verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || "OTP verification failed");

            localStorage.setItem("departmentId", department);
            localStorage.setItem("officeBearerEmail", email);
            toast.success("Login successful!", { id: toastId });
            navigate("/office-bearer");
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
                    type="button"
                    onClick={() => navigate("/")}
                >
                    ← Back to Main Page
                </button>
                <div className="mb-6 text-center">
                    <img src={logo} alt="LNMIIT Logo" className="mx-auto h-10 w-auto" />
                    <h2 className="text-2xl font-semibold text-gray-800 mt-2">Office Bearer Login</h2>
                </div>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Department</label>
                        <select
                            value={department}
                            onChange={e => setDepartment(e.target.value)}
                            className="w-full border px-4 py-2 rounded-xl"
                            required
                        >
                            <option value="">Select Department</option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
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