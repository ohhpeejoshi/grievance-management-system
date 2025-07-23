import { useState } from "react";
import axios from "axios";
import { CheckCircle, Clock, Send } from 'lucide-react';

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

    const steps = [
        { name: "Submitted", icon: <Send /> },
        { name: "In Progress", icon: <Clock /> },
        { name: "Resolved", icon: <CheckCircle /> }
    ];
    const currentStepIndex = data ? steps.findIndex(step => step.name === data.status) : -1;

    return (
        // --- UPDATED BACKGROUND COLOR ---
        // Changed to the theme's gradient for a consistent look
        <div className="min-h-screen bg-gradient-to-br from-red-300 to-blue-300 flex items-center justify-center px-4">
            <div className="container max-w-2xl mx-auto p-8 bg-white/70 backdrop-blur-md rounded-2xl shadow-xl text-center">
                <h1 className="text-4xl font-bold text-gray-800">Track Your Grievance</h1>
                <p className="text-lg text-gray-600 mt-4">
                    Enter your grievance ID below to check the real-time status.
                </p>

                {/* Input and Button */}
                <div className="mt-8 flex justify-center items-center gap-4 flex-wrap">
                    <input
                        type="text"
                        value={grievanceId}
                        onChange={(e) => setGrievanceId(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleTrack()}
                        className="px-4 py-3 border border-gray-300 rounded-lg shadow-sm w-full sm:w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., lnm/2025/07/0001"
                    />
                    <button onClick={handleTrack} disabled={isLoading} className="btn btn-primary">
                        {isLoading ? "Tracking..." : "Track"}
                    </button>
                </div>

                {error && <p className="mt-6 text-red-600 font-semibold">{error}</p>}

                {/* Vertical Timeline */}
                {data && (
                    <div className="mt-10 text-left p-6 bg-white/50 rounded-lg">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
                            Ticket: <span className="font-mono text-blue-600">{data.ticket_id}</span>
                        </h3>

                        <div className="space-y-8">
                            {steps.map((step, index) => (
                                <div key={step.name} className="flex">
                                    <div className="flex flex-col items-center mr-4">
                                        <div className={`flex items-center justify-center w-12 h-12 rounded-full ${index <= currentStepIndex ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'}`}>
                                            {step.icon}
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className={`w-0.5 h-full ${index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                                        )}
                                    </div>
                                    <div className="pt-2">
                                        <h4 className={`font-semibold text-lg ${index <= currentStepIndex ? 'text-gray-800' : 'text-gray-500'}`}>{step.name}</h4>
                                        {index === 0 && <p className="text-sm text-gray-600">Submitted on: {formatIST(data.created_at)}</p>}
                                        {index === currentStepIndex && index > 0 && (
                                            <p className="text-sm text-gray-600">Last updated: {formatIST(data.updated_at)}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}