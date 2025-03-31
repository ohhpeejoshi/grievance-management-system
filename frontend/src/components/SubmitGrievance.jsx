import { useState } from "react";

export default function SubmitGrievance() {
    const locations = [
        "Library", "Hostel Block A", "Hostel Block B", "Cafeteria", "Academic Block",
        "Sports Complex", "Administration Office", "Parking Area", "Computer Lab"
    ];

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        category: "",
        urgency: "Normal",
        attachment: null,
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
        <div className="container mt-10 p-6 bg-white shadow-md rounded-md">
            <h2 className="text-2xl font-semibold mb-4">Submit a Grievance</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-700">Title</label>
                    <input type="text" name="title" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Enter grievance title" value={formData.title} onChange={handleChange} required />
                </div>

                <div>
                    <label className="block text-gray-700">Description</label>
                    <textarea name="description" className="w-full p-2 border border-gray-300 rounded-md" rows="4" placeholder="Describe your grievance" value={formData.description} onChange={handleChange} required></textarea>
                </div>

                <div>
                    <label className="block text-gray-700">Location of Complaint</label>
                    <select name="location" className="w-full p-2 border border-gray-300 rounded-md" value={formData.location} onChange={handleChange} required>
                        <option value="">Select Location</option>
                        {locations.map((loc, index) => (
                            <option key={index} value={loc}>{loc}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700">Category</label>
                    <input type="text" name="category" className="w-full p-2 border border-gray-300 rounded-md" placeholder="Eg. Maintenance, Misconduct" value={formData.category} onChange={handleChange} required />
                </div>

                <div>
                    <label className="block text-gray-700">Urgency Level</label>
                    <select name="urgency" className="w-full p-2 border border-gray-300 rounded-md" value={formData.urgency} onChange={handleChange}>
                        <option value="Normal">Normal</option>
                        <option value="High">High</option>
                        <option value="Critical">Critical</option>
                    </select>
                </div>

                <div>
                    <label className="block text-gray-700">Attach Supporting Document (if any)</label>
                    <input type="file" name="attachment" className="w-full p-2 border border-gray-300 rounded-md" onChange={handleFileChange} />
                </div>

                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">Submit</button>
            </form>
        </div>
    );
}