import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="container mt-20 p-6 text-center">
            <h1 className="text-4xl font-bold text-gray-800">Welcome to the Grievance Management System</h1>
            <p className="text-lg text-gray-600 mt-4 max-w-2xl mx-auto">
                A streamlined platform for students and faculty to submit, track, and resolve grievances efficiently.
            </p>

            {/* Action Buttons */}
            <div className="mt-6 space-x-4">
                <Link to="/submit-grievance" className=" bg-blue-200 text-white px-6 py-3 rounded-md text-lg shadow-md hover:bg-blue-300">
                    Submit a Grievance
                </Link>
                <Link to="/track-grievance" className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md text-lg shadow-md hover:bg-gray-300">
                    Track Grievance
                </Link>
            </div>

            {/* Features Section */}
            <div className="mt-12 grid md:grid-cols-3 gap-8">
                <div className="p-6 bg-white shadow-md rounded-md">
                    <h3 className="text-xl font-semibold text-gray-800">Easy Submission</h3>
                    <p className="text-gray-600 mt-2">Quickly lodge grievances with a user-friendly form.</p>
                </div>
                <div className="p-6 bg-white shadow-md rounded-md">
                    <h3 className="text-xl font-semibold text-gray-800">Real-time Tracking</h3>
                    <p className="text-gray-600 mt-2">Monitor the status of your complaints at any time.</p>
                </div>
                <div className="p-6 bg-white shadow-md rounded-md">
                    <h3 className="text-xl font-semibold text-gray-800">Transparent Resolution</h3>
                    <p className="text-gray-600 mt-2">Stay informed about how your grievance is being handled.</p>
                </div>
            </div>
        </div>
    );
}
