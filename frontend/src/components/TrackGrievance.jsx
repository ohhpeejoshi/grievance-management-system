import { useState } from "react";

export default function TrackGrievance() {
    const [grievanceId, setGrievanceId] = useState("");
    const [status, setStatus] = useState(null);

    const handleTrack = () => {
        // Placeholder logic: Replace with API call
        if (grievanceId === "12345") {
            setStatus("In Progress");
        } else {
            setStatus("Not Found");
        }
    };

    return (
        <div className="container mt-20 p-6 text-center">
            <h1 className="text-3xl font-bold text-gray-800">Track Your Grievance</h1>
            <p className="text-lg text-gray-600 mt-4">Enter your grievance ID to check the status.</p>

            <div className="mt-6 flex justify-center">
                <input
                    type="text"
                    value={grievanceId}
                    onChange={(e) => setGrievanceId(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md w-64"
                    placeholder="Enter Grievance ID"
                />
                <button
                    onClick={handleTrack}
                    className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                    Track
                </button>
            </div>

            {status && (
                <div className="mt-6 p-4 bg-gray-100 rounded-md">
                    <h3 className="text-xl font-semibold">Status: {status}</h3>
                </div>
            )}
        </div>
    );
}
