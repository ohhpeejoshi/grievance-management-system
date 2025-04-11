import { useState } from "react";

export default function TrackGrievance() {
    const [grievanceId, setGrievanceId] = useState("");
    const [status, setStatus] = useState(null);

    const handleTrack = () => {
        // Placeholder logic: Replace with API call
        if (grievanceId === "LNMIIT/2025/April/12345") {
            setStatus("In Progress");
        } else {
            setStatus("Not Found");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-300 to-blue-300 flex items-center justify-center px-4">
            <div className="container max-w-2xl mx-auto p-8 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl text-center">
                <h1 className="text-4xl font-bold text-gray-800">Track Your Grievance</h1>
                <p className="text-lg text-gray-600 mt-4">
                    Enter your grievance ID below to check the real-time status of your complaint.
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
                        className="!bg-blue-500 text-white px-6 py-3 rounded-lg text-base font-medium shadow-md hover:bg-blue-600 transition-all"
                    >
                        Track
                    </button>
                </div>

                {status && (
                    <div className="mt-10 mx-auto max-w-md bg-white/80 backdrop-blur-md shadow-md rounded-xl p-6">
                        <h3 className="text-xl font-semibold text-gray-800">
                            Status: <span className="font-normal">{status}</span>
                        </h3>
                    </div>
                )}
            </div>
        </div>
    );
}
