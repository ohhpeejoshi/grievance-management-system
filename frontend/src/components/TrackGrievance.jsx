import { useState } from "react";
import axios from "axios";

export default function TrackGrievance() {
    const [grievanceId, setGrievanceId] = useState("");
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleTrack = async () => {
        if (!grievanceId) {
            setError("Please enter a Grievance ID.");
            return;
        }
        setError("");
        setData(null);
        setIsLoading(true);
        try {
            const encodedId = encodeURIComponent(grievanceId);
            const res = await axios.get(
                `/api/grievances/track/${encodedId}`
            );
            setData(res.data);
        } catch (err) {
            setError(
                err.response?.status === 404
                    ? "Grievance not found. Please check the ID and try again."
                    : "A server error occurred. Please try again later."
            );
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * THE FIX: This function now simply formats the date string it receives from the API.
     * No timezone logic is needed here because the backend provides the correct IST time.
     */
    const formatIST = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return "Invalid Date";
        }
        return date.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true,
        });
    };

    const steps = ["Submitted", "In Progress", "Resolved"];
    const currentStepIndex = data ? steps.indexOf(data.status) : -1;

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
                        onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                        className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="e.g., lnm/2025/07/0001"
                    />
                    <button
                        onClick={handleTrack}
                        disabled={isLoading}
                        className="!bg-blue-500 text-white px-6 py-3 rounded-lg font-medium shadow-md hover:bg-blue-600 transition-all disabled:bg-gray-400"
                    >
                        {isLoading ? "Tracking..." : "Track"}
                    </button>
                </div>

                {error && (
                    <p className="mt-6 text-red-600 font-semibold">{error}</p>
                )}

                {data && (
                    <div className="mt-10 text-left p-6 bg-white/50 rounded-lg">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                            Status: <span className="text-blue-600">{data.status}</span>
                        </h3>

                        <div className="flex justify-between items-center mb-2 px-2">
                            {steps.map((step) => (
                                <span key={step} className="text-xs sm:text-sm font-medium text-gray-600">{step}</span>
                            ))}
                        </div>
                        <div className="relative w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                                style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
                            ></div>
                        </div>

                        <div className="mt-6 border-t pt-4 text-sm text-gray-700 space-y-2">
                            <p>
                                <strong>Submitted On:</strong> {formatIST(data.created_at)}
                            </p>
                            <p>
                                <strong>Last Updated:</strong> {formatIST(data.updated_at)}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
