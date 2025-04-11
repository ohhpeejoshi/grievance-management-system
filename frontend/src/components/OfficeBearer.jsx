import { useState } from "react";

export default function OfficeBearer() {
    // dummy data for grievances
    const [grievances] = useState([
        {
            id: "LNMIIT/2025/April/12345",
            title: "Water not coming from tap",
            submittedBy: "22ucc072",
            status: "Pending",
            date: "2025-04-06",
        },
        {
            id: "LNMIIT/2025/April/12346",
            title: "Wi-Fi not working in Room 203",
            submittedBy: "22ucc017",
            status: "In Progress",
            date: "2025-04-05",
        },
    ]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-300 to-blue-300 py-12 px-6">
            <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 text-center">
                    Office Bearer Dashboard
                </h1>
                <p className="text-center text-gray-700 mb-8">
                    You can view and respond to assigned grievances here.
                </p>

                {/* Action buttons (not functional yet) */}
                <div className="flex justify-center gap-4 mb-8 flex-wrap">
                    <button className="!bg-blue-600 text-white px-5 py-2 rounded-xl shadow hover:!bg-blue-700 transition">
                        View Assigned Grievances
                    </button>
                    <button className="!bg-green-600 text-white px-5 py-2 rounded-xl shadow hover:!bg-green-700 transition">
                        Respond to Grievances
                    </button>
                </div>

                {/* Grievance Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-xl shadow text-left">
                        <thead className="bg-gray-200 text-gray-700">
                            <tr>
                                <th className="py-3 px-4">Grievance ID</th>
                                <th className="py-3 px-4">Title</th>
                                <th className="py-3 px-4">Submitted By</th>
                                <th className="py-3 px-4">Date</th>
                                <th className="py-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grievances.map((g) => (
                                <tr key={g.id} className="border-t">
                                    <td className="py-3 px-4">{g.id}</td>
                                    <td className="py-3 px-4">{g.title}</td>
                                    <td className="py-3 px-4">{g.submittedBy}</td>
                                    <td className="py-3 px-4">{g.date}</td>
                                    <td className="py-3 px-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                g.status === "Pending"
                                                    ? "bg-yellow-200 text-yellow-800"
                                                    : g.status === "In Progress"
                                                    ? "bg-blue-200 text-blue-800"
                                                    : "bg-green-200 text-green-800"
                                            }`}
                                        >
                                            {g.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
