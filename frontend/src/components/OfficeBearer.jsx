import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, ChevronUp, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800">&times;</button>
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
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [selectedWorker, setSelectedWorker] = useState('');
    const [newWorker, setNewWorker] = useState({ name: '', email: '', phone_number: '' });

    const navigate = useNavigate();
    const departmentId = localStorage.getItem("departmentId");

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
    }, [departmentId]);

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
            const officeBearerEmail = localStorage.getItem("officeBearerEmail");

            const res = await fetch(`/api/grievances/${encodedTicketId}/assign`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workerId: selectedWorker,
                    officeBearerEmail: officeBearerEmail
                }),
            });
            if (!res.ok) throw new Error("Failed to assign grievance.");
            const updatedGrievances = grievances.map(g => g.ticket_id === selectedGrievance.ticket_id ? { ...g, status: 'In Progress' } : g);
            setGrievances(updatedGrievances);
            setAssignModalOpen(false);
            toast.success("Grievance assigned successfully!", { id: toastId });
        } catch (err) {
            toast.error(err.message, { id: toastId });
        }
    };

    const handleResolveGrievance = async (ticketId) => {
        toast((t) => (
            <span>
                Are you sure you want to mark this as resolved?
                <button onClick={() => {
                    toast.dismiss(t.id);
                    resolveGrievance(ticketId);
                }} className="ml-2 bg-green-500 text-white px-2 py-1 rounded">
                    Yes
                </button>
                <button onClick={() => toast.dismiss(t.id)} className="ml-2 bg-red-500 text-white px-2 py-1 rounded">
                    No
                </button>
            </span>
        ));
    };

    const resolveGrievance = async (ticketId) => {
        const toastId = toast.loading('Resolving grievance...');
        try {
            const encodedTicketId = encodeURIComponent(ticketId);
            const res = await fetch(`/api/grievances/${encodedTicketId}/resolve`, { method: 'PUT' });
            if (!res.ok) throw new Error("Failed to resolve grievance.");
            const updatedGrievances = grievances.map(g => g.ticket_id === ticketId ? { ...g, status: 'Resolved' } : g);
            setGrievances(updatedGrievances);
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
        setAssignModalOpen(true);
    };

    const handleLogout = () => {
        localStorage.removeItem("officeBearerEmail");
        localStorage.removeItem("departmentId");
        navigate("/office-bearer-login");
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
                            <button onClick={() => setAddWorkerModalOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600">Add Worker</button>
                            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600">Logout</button>
                        </div>
                    </div>
                    <div className="mb-6 relative">
                        <input type="text" placeholder="Search by Ticket ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full p-3 pl-10 border border-gray-300 rounded-lg shadow-sm" />
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
                                        <td className="py-3 px-4"><span className={`px-3 py-1 rounded-full text-xs font-medium ${g.is_escalated ? 'bg-red-200 text-red-800' : g.status === "Pending" || g.status === "Submitted" ? "bg-yellow-200 text-yellow-800" : g.status === "In Progress" ? "bg-blue-200 text-blue-800" : "bg-green-200 text-green-800"}`}>{g.is_escalated ? 'Escalated' : g.status}</span></td>
                                        <td className="py-3 px-4">{new Date(g.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                                        <td className="py-3 px-4 flex gap-2">
                                            {g.is_escalated ? (
                                                <span className="text-red-500 font-bold">Locked</span>
                                            ) : (
                                                <>
                                                    {g.status === 'Submitted' && (<button onClick={() => openAssignModal(g)} className="bg-blue-500 text-white px-3 py-1 rounded shadow hover:bg-blue-600">Assign</button>)}
                                                    {g.status === 'In Progress' && (<button onClick={() => handleResolveGrievance(g.ticket_id)} className="bg-green-500 text-white px-3 py-1 rounded shadow hover:bg-green-600">Resolve</button>)}
                                                </>
                                            )}
                                            <button onClick={() => handlePrint(g)} className="bg-gray-500 text-white p-2 rounded shadow hover:bg-gray-600"><Printer size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {sortedAndFilteredGrievances.length === 0 && <p className="text-center text-gray-500 mt-8">No matching grievances found.</p>}
                    </div>
                </div>
            </div>
            <Modal isOpen={isAssignModalOpen} onClose={() => setAssignModalOpen(false)} title="Assign Grievance">
                <p className="mb-4">Assign ticket <strong>{selectedGrievance?.ticket_id}</strong> to a worker:</p>
                <select value={selectedWorker} onChange={(e) => setSelectedWorker(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg mb-4">
                    <option value="">Select a worker</option>
                    {workers.map(w => <option key={w.id} value={w.id}>{w.name} ({w.email})</option>)}
                </select>
                <button onClick={handleAssignGrievance} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Confirm Assignment</button>
            </Modal>
            <Modal isOpen={isAddWorkerModalOpen} onClose={() => setAddWorkerModalOpen(false)} title="Add New Worker">
                <form onSubmit={handleAddWorker} className="space-y-4">
                    <input type="text" placeholder="Worker Name" value={newWorker.name} onChange={e => setNewWorker({ ...newWorker, name: e.target.value })} className="w-full p-2 border rounded" required />
                    <input type="email" placeholder="Worker Email" value={newWorker.email} onChange={e => setNewWorker({ ...newWorker, email: e.target.value })} className="w-full p-2 border rounded" required />
                    <input type="tel" placeholder="Worker Phone Number" value={newWorker.phone_number} onChange={e => setNewWorker({ ...newWorker, phone_number: e.target.value })} className="w-full p-2 border rounded" required />
                    <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Add Worker</button>
                </form>
            </Modal>
        </>
    );
}