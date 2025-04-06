import { useState } from "react";

export default function SubmitGrievance() {
    const locations = [
        "BH1", "BH2", "BH3", "BH4-tower1", "BH4-tower2", "GH", "Faculty Quarters",
        "Guest House", "Lecture Hall Complex", "Academic Block", "Main Gate 1",
        "Main Gate 2", "Sports Complex Area", "Medical Unit", "Mess A", "Mess B",
        "Mess C", "Canteen Area", "Sports Ground", "MME Workshop", "MME Building",
        "Balji Vihar Apartments", "Central Library", "Maintenance Store",
        "Material Synthesis Lab", "Sub Station", "Admission Cell", "Faculty Offices"
    ];

    const categories = [
        "Civil and Infrastructure Related",
        "Plumbing Issues",
        "Water Leakages",
        "Electricity Related",
        "Air Conditioner Repair",
        "Air Ducts Related Repairs",
        "RO Water Purifier Repair",
        "Water Cooler Maintenance",
    ];

    const userData = {
        name: "Parth Ramdeo",
        email: "22ucc072@lnmiit.ac.in"
    };

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        category: "",
        urgency: "Normal",
        attachment: null,
        mobileNumber: "",
        complainantName: userData.name,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData((prev) => ({ ...prev, attachment: e.target.files[0] }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-300 to-blue-300 flex justify-center px-4 py-10">
            <div className="max-w-4xl w-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Submit a Grievance</h2>

                {/* Complainant Info */}
                <div className="mb-8 p-6 bg-white rounded-xl shadow">
                    <h3 className="font-semibold text-lg mb-4">Complainant Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input
                                type="text"
                                name="complainantName"
                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                                value={formData.complainantName}
                                onChange={handleChange}
                                readOnly
                            />
                            <p className="text-xs text-gray-500 mt-1">Will be auto-filled from user account data</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input
                                type="email"
                                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                                value={userData.email}
                                readOnly
                            />
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Title</label>
                        <input
                            type="text"
                            name="title"
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            placeholder="Enter grievance title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Description</label>
                        <textarea
                            name="description"
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            rows="4"
                            placeholder="Describe your grievance"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                        <div className="flex">
                            <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg">
                                +91
                            </span>
                            <input
                                type="tel"
                                name="mobileNumber"
                                className="w-full p-3 border border-gray-300 rounded-r-lg"
                                placeholder="Enter your mobile number"
                                value={formData.mobileNumber}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Location of Complaint</label>
                        <select
                            name="location"
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Location</option>
                            {locations.map((loc, index) => (
                                <option key={index} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Category</label>
                        <select
                            name="category"
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            value={formData.category}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Category</option>
                            {categories.map((cat, index) => (
                                <option key={index} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Urgency Level</label>
                        <select
                            name="urgency"
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                            value={formData.urgency}
                            disabled
                        >
                            <option value="Normal">Normal</option>
                        </select>
                    </div>

                    <div>
                        <label className="!block text-sm font-medium text-gray-700">
                            Attach Supporting Document (if any)
                        </label>
                        <input
                            type="file"
                            name="attachment"
                            className="!w-full p-3 border border-gray-300 rounded-lg"
                            onChange={handleFileChange}
                        />
                    </div>

                    <button
                        type="submit"
                        className="!bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-600 transition-all"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
}