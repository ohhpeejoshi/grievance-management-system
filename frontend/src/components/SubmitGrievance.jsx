import { useState, useEffect, useRef } from "react"; // Import useRef
import toast from 'react-hot-toast';
import SkeletonLoader from './SkeletonLoader';

export default function SubmitGrievance() {
    const [locationsList, setLocationsList] = useState([]);
    const [userData, setUserData] = useState({ name: "", email: "", mobileNumber: "" });
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileError, setProfileError] = useState("");

    const [departmentsList, setDepartmentsList] = useState([]);
    const [categoriesList, setCategoriesList] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        location: "",
        department: "",
        category: "",
        urgency: "Normal",
        attachment: null,
        mobileNumber: "",
        complainantName: "",
    });
    const [previewUrl, setPreviewUrl] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRef = useRef(null); // Create a ref for the file input

    useEffect(() => {
        const emailFromAuth = localStorage.getItem("userEmail");
        if (!emailFromAuth) {
            setProfileError("No user logged in.");
            setProfileLoading(false);
            return;
        }

        fetch(`http://localhost:3000/api/auth/profile?email=${emailFromAuth}`)
            .then(res => {
                if (!res.ok) throw new Error("Failed to load profile");
                return res.json();
            })
            .then(data => {
                setUserData({
                    name: data.name,
                    email: data.email,
                    mobileNumber: data.mobileNumber,
                });
                setFormData(p => ({
                    ...p,
                    complainantName: data.name,
                    mobileNumber: data.mobileNumber,
                }));
            })
            .catch(err => {
                console.error("Profile fetch failed:", err);
                setProfileError(err.message);
                toast.error(err.message);
            })
            .finally(() => setProfileLoading(false));
    }, []);

    useEffect(() => {
        Promise.all([
            fetch("http://localhost:3000/api/grievances/departments").then(res => res.json()),
            fetch("http://localhost:3000/api/grievances/locations").then(res => res.json())
        ]).then(([depts, locs]) => {
            setDepartmentsList(depts);
            setLocationsList(locs);
        }).catch(err => {
            console.error("Failed to fetch initial data:", err);
            toast.error("Failed to fetch initial data.");
        });
    }, []);

    const handleChange = e => {
        const { name, value } = e.target;

        if (name === "department") {
            setFormData(p => ({ ...p, department: value, category: "", urgency: "Normal" }));
            fetch(`http://localhost:3000/api/grievances/categories/${value}`)
                .then(res => res.json())
                .then(setCategoriesList)
                .catch(err => {
                    console.error("Cat fetch failed:", err);
                    toast.error("Failed to fetch categories.");
                });
        }
        else if (name === "category") {
            const catId = parseInt(value, 10);
            const sel = categoriesList.find(c => c.id === catId);
            const urg = sel?.urgency
                ? sel.urgency.charAt(0).toUpperCase() + sel.urgency.slice(1)
                : "Normal";

            setFormData(p => ({
                ...p,
                category: value,
                urgency: urg
            }));
        }
        else {
            setFormData(p => ({ ...p, [name]: value }));
        }
    };

    const handleFileChange = e => {
        const file = e.target.files[0];
        if (!file) {
            setPreviewUrl(null);
            setFormData(p => ({ ...p, attachment: null }));
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("File too large. Max size is 2MB.");
            setFormData(p => ({ ...p, attachment: null }));
            setPreviewUrl(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
            return;
        }

        setFormData(p => ({ ...p, attachment: file }));
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setSubmitting(true);
        const toastId = toast.loading('Submitting grievance...');
        try {
            const data = new FormData();
            data.append("title", formData.title);
            data.append("description", formData.description);
            data.append("location", formData.location);
            data.append("department", formData.department);
            data.append("category", formData.category);
            data.append("urgency", formData.urgency);
            data.append("mobileNumber", formData.mobileNumber);
            data.append("complainantName", formData.complainantName);
            data.append("email", userData.email);
            if (formData.attachment) data.append("attachment", formData.attachment);

            const res = await fetch("http://localhost:3000/api/grievances/submit", {
                method: "POST",
                body: data,
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Submission failed");

            toast.success(
                (t) => (
                    <div>
                        Grievance submitted successfully.
                        <br />
                        Ticket ID: <strong>{json.ticket_id}</strong>
                    </div>
                ),
                { id: toastId, duration: 6000 }
            );

            setFormData({
                title: "",
                description: "",
                location: "",
                department: "",
                category: "",
                urgency: "Normal",
                attachment: null,
                mobileNumber: userData.mobileNumber,
                complainantName: userData.name,
            });
            setCategoriesList([]);
            setPreviewUrl(null);
            // --- THE FIX ---
            if (fileInputRef.current) {
                fileInputRef.current.value = ""; // Reset the file input
            }
            // ---------------
        } catch (err) {
            console.error(err);
            toast.error(err.message, { id: toastId });
        } finally {
            setSubmitting(false);
        }
    };

    if (profileLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-300 to-blue-300 flex justify-center px-4 py-10">
                <div className="max-w-4xl w-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
                    <SkeletonLoader />
                </div>
            </div>
        );
    }

    if (profileError) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p className="text-red-600">{profileError}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-300 to-blue-300 flex justify-center px-4 py-10">
            <div className="max-w-4xl w-full bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
                    Submit a Grievance
                </h2>

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
                                readOnly
                            />
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
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 border border-r-0 rounded-l-lg">
                                    +91
                                </span>
                                <input
                                    type="tel"
                                    name="mobileNumber"
                                    className="w-full p-3 border border-gray-300 rounded-r-lg bg-gray-100"
                                    value={formData.mobileNumber}
                                    readOnly
                                />
                            </div>
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
                            placeholder="Describe your grievance with room/office number"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Department of Complaint</label>
                        <select
                            name="department"
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            value={formData.department}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Department</option>
                            {departmentsList.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
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
                            {locationsList.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
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
                            disabled={!categoriesList.length}
                        >
                            <option value="">Select Category</option>
                            {categoriesList.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Urgency Level</label>
                        <select
                            name="urgency"
                            className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100"
                            value={formData.urgency}
                            disabled
                        >
                            <option value={formData.urgency}>{formData.urgency}</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Attach Supporting Document (if any)</label>
                        <input
                            type="file"
                            name="attachment"
                            ref={fileInputRef} // Attach the ref to the input
                            className="w-full p-3 border border-gray-300 rounded-lg"
                            onChange={handleFileChange}
                        />
                        {previewUrl && (
                            <div className="mt-2">
                                <p className="text-xs text-gray-500">Preview:</p>
                                <img src={previewUrl} alt="preview" className="w-32 h-32 object-cover border rounded-lg" />
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-600 transition-all"
                    >
                        {submitting ? "Submitting..." : "Submit"}
                    </button>
                </form>
            </div>
        </div>
    );
}