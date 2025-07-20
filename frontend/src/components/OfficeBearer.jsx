import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, ChevronUp, Printer, X, UserPlus, FileSignature, Info } from 'lucide-react';
import toast from 'react-hot-toast';

// This updated Modal component provides the semi-transparent, blurred backdrop
const Modal = ({ isOpen, onClose, title, icon, children }) => {
    if (!isOpen) return null;
    return (
        <div
            className="fixed inset-0 bg-red-blue bg-opacity-25 backdrop-blur-sm flex justify-center items-center"
            style={{ zIndex: 1000 }} // Ensure modal is on top
        >
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-200 animate-enter">
                <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                        {icon} {/* Render the passed icon */}
                        {title}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition">
                        <X size={24} />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};


export default function OfficeBearer() {
    const [grievances, setGrievances] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isAddWorkerModalOpen, setAddWorkerModalOpen] = useState(false);
    const [isInfoModalOpen, setInfoModalOpen] = useState(false); // New state for info modal
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [selectedWorker, setSelectedWorker] = useState('');
    const [newWorker, setNewWorker] = useState({ name: '', email: '', phone_number: '' });

    const navigate = useNavigate();
    const departmentId = localStorage.getItem("departmentId");

    const handleLogout = () => {
        // Display a toast notification for logout confirmation
        toast((t) => (
            <span className="flex flex-col items-center gap-2">
                Are you sure you want to logout?
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id); // Dismiss the toast
                            localStorage.clear(); // Clear session data
                            navigate("/login"); // Redirect to login
                        }}
                        className="bg-red-500 text-white px-3 py-1 rounded-md text-sm"
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="bg-gray-300 text-black px-3 py-1 rounded-md text-sm"
                    >
                        No
                    </button>
                </div>
            </span>
        ), {
            duration: 6000, // Keep the toast open for a bit longer
        });
    };



    useEffect(() => {
        if (!departmentId) {
            setError("Could not find Department ID. Please log in again.");
            setIsLoading(false);
            return;
        }

        Promise.all([
            fetch(`/api/grievances/department/${departmentId}`).then(res => res.json()),
            fetch(`/api/grievances/workers/${departmentId}`).then(res => res.json())
        ]).then(([grievanceData, workerData]) => {
            setGrievances(grievanceData);
            setWorkers(workerData);
            setIsLoading(false);
        }).catch(err => {
            console.error("Fetch error:", err);
            setError("Failed to fetch data from the server.");
            toast.error("Failed to fetch data from the server.");
            setIsLoading(false);
        });
    }, [departmentId, navigate]);

    const sortedAndFilteredGrievances = useMemo(() => {
        let sortableItems = [...grievances];
        if (searchTerm) {
            sortableItems = sortableItems.filter(g => g.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [grievances, searchTerm, sortConfig]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
    };

    const handleAssignGrievance = async () => {
        if (!selectedWorker) {
            toast.error("Please select a worker.");
            return;
        }
        const toastId = toast.loading('Assigning grievance...');
        try {
            const encodedTicketId = encodeURIComponent(selectedGrievance.ticket_id);
            const officeBearerEmail = localStorage.getItem("userEmail");

            const res = await fetch(`/api/grievances/${encodedTicketId}/assign`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workerId: selectedWorker,
                    officeBearerEmail: officeBearerEmail
                }),
            });
            if (!res.ok) throw new Error("Failed to assign grievance.");

            // To update the UI instantly with the worker's name, we refetch the data
            const refreshedGrievances = await fetch(`/api/grievances/department/${departmentId}`).then(res => res.json());
            setGrievances(refreshedGrievances);

            setAssignModalOpen(false);
            toast.success("Grievance assigned successfully!", { id: toastId });
        } catch (err) {
            toast.error(err.message, { id: toastId });
        }
    };

    const handleResolveGrievance = async (ticketId) => {
        toast((t) => (
            <span className="flex flex-col items-center gap-2">
                Are you sure you want to mark this as resolved?
                <div className="flex gap-4 mt-2">
                    <button onClick={() => {
                        toast.dismiss(t.id);
                        resolveGrievance(ticketId);
                    }} className="bg-green-500 text-white px-3 py-1 rounded">
                        Yes
                    </button>
                    <button onClick={() => toast.dismiss(t.id)} className="bg-red-500 text-white px-3 py-1 rounded">
                        No
                    </button>
                </div>
            </span>
        ));
    };

    const resolveGrievance = async (ticketId) => {
        const toastId = toast.loading('Resolving grievance...');
        try {
            const encodedTicketId = encodeURIComponent(ticketId);
            const res = await fetch(`/api/grievances/${encodedTicketId}/resolve`, { method: 'PUT' });
            if (!res.ok) throw new Error("Failed to resolve grievance.");
            // Refetch data to ensure UI consistency
            const refreshedGrievances = await fetch(`/api/grievances/department/${departmentId}`).then(res => res.json());
            setGrievances(refreshedGrievances);
            toast.success("Grievance resolved successfully!", { id: toastId });
        } catch (err) {
            toast.error(err.message, { id: toastId });
        }
    }

    const handleAddWorker = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Adding worker...');
        try {
            const res = await fetch('/api/grievances/workers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newWorker, department_id: departmentId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to add worker.");
            setWorkers([...workers, { id: data.workerId, ...newWorker, department_id: departmentId }]);
            setNewWorker({ name: '', email: '', phone_number: '' });
            setAddWorkerModalOpen(false);
            toast.success("Worker added successfully!", { id: toastId });
        } catch (err) {
            toast.error(err.message, { id: toastId });
        }
    };

    const openAssignModal = (grievance) => {
        setSelectedGrievance(grievance);
        setSelectedWorker('');
        setAssignModalOpen(true);
    };

    const openInfoModal = (grievance) => {
        setSelectedGrievance(grievance);
        setInfoModalOpen(true);
    };

    const handlePrint = (grievance) => {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head><title>Grievance Details - ${grievance.ticket_id}</title><style>body{font-family:sans-serif;padding:20px}h1,h2{color:#333;border-bottom:2px solid #eee;padding-bottom:5px}p{line-height:1.6}strong{color:#555}.grievance-details{margin-top:20px}.attachment-link{display:block;margin-top:15px}.signature-box{float:right;text-align:center;width:250px;margin-top:80px;border-top:1px solid #000;padding-top:5px}</style></head>
                <body>
                    <h1>Grievance Report</h1><h2>Ticket ID: ${grievance.ticket_id}</h2>
                    <div class="grievance-details">
                        <p><strong>Title:</strong> ${grievance.title}</p><p><strong>Status:</strong> ${grievance.status}</p><p><strong>Urgency:</strong> ${grievance.urgency}</p>
                        <p><strong>Submitted On:</strong> ${new Date(grievance.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
                        <p><strong>Category:</strong> ${grievance.category_name}</p><p><strong>Location:</strong> ${grievance.location}</p><hr>
                        <p><strong>Complainant:</strong> ${grievance.complainant_name}</p>
                        <p><strong>Roll Number:</strong> ${grievance.roll_number || 'N/A'}</p>
                        <p><strong>Email:</strong> ${grievance.email}</p><p><strong>Mobile:</strong> ${grievance.mobile_number}</p><hr>
                        <h3>Description</h3><p>${grievance.description}</p>
                        ${grievance.attachment ? `<a href="${grievance.attachment}" target="_blank" class="attachment-link">View Attachment</a>` : '<p>No attachment provided.</p>'}
                        <div class="signature-box">Signature (if satisfied)</div>
                    </div>
                </body>
            </html>`);
        printWindow.document.close();
        printWindow.print();
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">Error: {error}</div>;

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-red-300 to-blue-300 py-12 px-6">
                <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
                    <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                        <h1 className="text-3xl font-bold text-gray-800">Office Bearer Dashboard</h1>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setAddWorkerModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition">Add Worker</button>
                            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition">Logout</button>
                        </div>
                    </div>
                    <div className="mb-6 relative">
                        <input type="text" placeholder="Search by Ticket ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-xl shadow text-left">
                            <thead className="bg-gray-200 text-gray-700">
                                <tr>
                                    {['ticket_id', 'title', 'urgency', 'status', 'created_at'].map(key => (
                                        <th key={key} className="py-3 px-4 cursor-pointer" onClick={() => requestSort(key)}>
                                            <div className="flex items-center gap-1">{key.replace('_', ' ').toUpperCase()}{getSortIcon(key)}</div>
                                        </th>
                                    ))}
                                    <th className="py-3 px-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedAndFilteredGrievances.map((g) => (
                                    <tr key={g.ticket_id} className="border-t hover:bg-gray-50">
                                        <td className="py-3 px-4 font-mono text-sm">{g.ticket_id}</td>
                                        <td className="py-3 px-4">{g.title}</td>
                                        <td className="py-3 px-4"><span className={`font-bold ${g.urgency === 'Emergency' ? 'text-red-600' : g.urgency === 'High' ? 'text-yellow-600' : 'text-green-600'}`}>{g.urgency}</span></td>
                                        <td className="py-3 px-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${g.escalation_level > 0 ? 'bg-red-200 text-red-800' : g.status === "Submitted" ? "bg-yellow-200 text-yellow-800" : g.status === "In Progress" ? "bg-blue-200 text-blue-800" : "bg-green-200 text-green-800"}`}>{g.escalation_level > 0 ? 'Escalated' : g.status}</span></td>
                                        <td className="py-3 px-4">{new Date(g.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                                        <td className="py-3 px-4 flex gap-2">
                                            {g.escalation_level > 0 ? (
                                                <span className="text-red-500 font-bold px-3 py-1">Locked</span>
                                            ) : (
                                                <>
                                                    {g.status === 'Submitted' && (<button onClick={() => openAssignModal(g)} className="bg-blue-500 text-white px-3 py-1 rounded shadow hover:bg-blue-600 transition">Assign</button>)}
                                                    {g.status === 'In Progress' && (
                                                        <>
                                                            <button onClick={() => handleResolveGrievance(g.ticket_id)} className="bg-green-500 text-white px-3 py-1 rounded shadow hover:bg-green-600 transition">Resolve</button>
                                                            <button onClick={() => openInfoModal(g)} className="bg-gray-400 text-white p-2 rounded-full shadow hover:bg-gray-500 transition"><Info size={14} /></button>
                                                        </>
                                                    )}
                                                    {g.status === 'Resolved' && (
                                                        <button onClick={() => openInfoModal(g)} className="bg-gray-400 text-white p-2 rounded-full shadow hover:bg-gray-500 transition"><Info size={14} /></button>
                                                    )}
                                                </>
                                            )}
                                            <button onClick={() => handlePrint(g)} className="bg-gray-500 text-white p-2 rounded shadow hover:bg-gray-600 transition"><Printer size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {sortedAndFilteredGrievances.length === 0 && <p className="text-center text-gray-500 mt-8">No matching grievances found.</p>}
                    </div>
                </div>
            </div>
            <Modal
                isOpen={isAssignModalOpen}
                onClose={() => setAssignModalOpen(false)}
                title="Assign Grievance"
                icon={<FileSignature size={24} className="text-blue-600" />}
            >
                <div className="space-y-4">
                    <p>Assign ticket <strong>{selectedGrievance?.ticket_id}</strong> to a worker:</p>
                    <select value={selectedWorker} onChange={(e) => setSelectedWorker(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                        <option value="">Select a worker</option>
                        {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.email})</option>)}
                    </select>
                    <button onClick={handleAssignGrievance} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold transition">Confirm Assignment</button>
                </div>
            </Modal>
            <Modal
                isOpen={isAddWorkerModalOpen}
                onClose={() => setAddWorkerModalOpen(false)}
                title="Add New Worker"
                icon={<UserPlus size={24} className="text-blue-600" />}
            >
                <form onSubmit={handleAddWorker} className="space-y-4">
                    <input type="text" placeholder="Worker Name" value={newWorker.name} onChange={e => setNewWorker({ ...newWorker, name: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                    <input type="email" placeholder="Worker Email" value={newWorker.email} onChange={e => setNewWorker({ ...newWorker, email: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                    <input type="tel" placeholder="Worker Phone Number" value={newWorker.phone_number} onChange={e => setNewWorker({ ...newWorker, phone_number: e.target.value })} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" required />
                    <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-semibold transition">Add Worker</button>
                </form>
            </Modal>
            <Modal
                isOpen={isInfoModalOpen}
                onClose={() => setInfoModalOpen(false)}
                title="Assignment Information"
                icon={<Info size={24} className="text-blue-600" />}
            >
                {selectedGrievance && (
                    <div className="space-y-3 text-gray-700">
                        <p><strong>Ticket ID:</strong> {selectedGrievance.ticket_id}</p>
                        <p><strong>Assigned To:</strong> {selectedGrievance.worker_name || 'N/A'}</p>
                        <p><strong>Worker Contact:</strong> {selectedGrievance.worker_phone_number || 'N/A'}</p>
                        <p>
                            <strong>Last Update:</strong>
                            {new Date(selectedGrievance.updated_at).toLocaleString('en-IN', {
                                year: 'numeric', month: 'long', day: 'numeric',
                                hour: 'numeric', minute: 'numeric', hour12: true
                            })}
                        </p>
                    </div>
                )}
            </Modal>
        </>
    );
}