import { useState } from "react";
import axios from "axios";

export default function TrackGrievance() {
    const [grievanceId, setGrievanceId] = useState("");
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    const handleTrack = async () => {
        setError("");
        setData(null);
        try {
            const res = await axios.get(
                `http://localhost:3000/api/grievances/track/${encodeURIComponent(
                    grievanceId
                )}`
            );
            setData(res.data);
        } catch (err) {
            setError(
                err.response?.status === 404
                    ? "Grievance not found"
                    : "Server error"
            );
        }
    };

    const steps = ["Submitted", "In Progress", "Resolved"];

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-300 to-blue-300 flex items-center justify-center px-4">
            <div className="container max-w-2xl mx-auto p-8 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl text-center">
                <h1 className="text-4xl font-bold text-gray-800">Track Your Grievance</h1>
                <p className="text-lg text-gray-600 mt-4">
                    Enter your grievance ID below to check the real-time status.
                </p>

                <div className="mt-8 flex justify-center items-center gap-4 flex-wrap">
                    <input
                        type="text"
                        value={grievanceId}
                        onChange={(e) => setGrievanceId(e.target.value)}
                        className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="Enter Grievance ID"
                    />
                    <button
                        onClick={handleTrack}
                        className="!bg-blue-500 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:bg-blue-600 transition-all"
                    >
                        Track
                    </button>
                </div>

                {error && (
                    <p className="mt-6 text-red-600 font-semibold">{error}</p>
                )}

                {data && (
                    <div className="mt-10 text-left">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Status: <span className="font-normal">{data.status}</span>
                        </h3>

                        <div className="flex justify-between items-center mb-6">
                            {steps.map((step, idx) => {
                                const isActive = steps.indexOf(data.status) >= idx;
                                return (
                                    <div key={step} className="flex-1 text-center">
                                        <div
                                            className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center
                        ${isActive
                                                    ? "bg-blue-500 text-white"
                                                    : "bg-gray-200 text-gray-600"
                                                }`}
                                        >
                                            {idx + 1}
                                        </div>
                                        <p className="mt-2 text-sm">{step}</p>
                                    </div>
                                );
                            })}
                        </div>

                        <p className="text-sm text-gray-600">
                            Submitted on: {new Date(data.created_at).toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-600">
                            Last updated: {new Date(data.updated_at).toLocaleString()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
