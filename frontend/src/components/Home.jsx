import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-red-300 to-blue-300 flex flex-col justify-center items-center px-6 py-12">
            <div className="max-w-5xl w-full text-center">
                {/* Heading */}
                <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
                    Grievance Management System
                </h1>
                <p className="text-lg text-gray-700 mt-4 max-w-3xl mx-auto">
                    A streamlined platform for students and faculty to submit, track, and resolve grievances efficiently.
                </p>

                {/* Action Buttons */}
                <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                    <Link
                        to="/submit-grievance"
                        className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-xl text-lg shadow hover:bg-blue-50 transition"
                    >
                        Submit a Grievance
                    </Link>
                    <Link
                        to="/track-grievance"
                        className="bg-white text-blue-600 border border-blue-600 px-6 py-3 rounded-xl text-lg shadow hover:bg-blue-50 transition"
                    >
                        Track Grievance
                    </Link>
                </div>

                {/* Features Section */}
                <div className="mt-16 grid gap-8 sm:grid-cols-2 md:grid-cols-3">
                    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-transform transform hover:scale-105">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">📝 Easy Submission</h3>
                        <p className="text-gray-600">
                            Quickly lodge grievances with a user-friendly and intuitive form.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-transform transform hover:scale-105">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">📊 Real-time Tracking</h3>
                        <p className="text-gray-600">
                            Monitor the status of your complaints at any time with live updates.
                        </p>
                    </div>
                    <div className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition-transform transform hover:scale-105">
                        <h3 className="text-xl font-semibold text-gray-800 mb-2">🔍 Transparent Resolution</h3>
                        <p className="text-gray-600">
                            Stay informed with clear communication on the resolution process.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
