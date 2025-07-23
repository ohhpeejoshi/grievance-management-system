import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Paperclip, Printer, Info, ArrowRightCircle, FileSignature, UserPlus, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import SkeletonLoader from './SkeletonLoader';
import Modal from './Modal';
import axios from 'axios';

export default function OfficeBearer() {
    const [grievances, setGrievances] = useState([]);
    const [workers, setWorkers] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });
    const [filters, setFilters] = useState({
        status: '',
        urgency: '',
        startDate: '',
        endDate: ''
    });

    const [isTransferModalOpen, setTransferModalOpen] = useState(false);
    const [transferFormData, setTransferFormData] = useState({ ticketId: '', newDepartmentId: '' });
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isAddWorkerModalOpen, setAddWorkerModalOpen] = useState(false);
    const [isInfoModalOpen, setInfoModalOpen] = useState(false);
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [selectedWorker, setSelectedWorker] = useState('');
    const [newWorker, setNewWorker] = useState({ name: '', email: '', phone_number: '' });
    const [showFilters, setShowFilters] = useState(false);

    const navigate = useNavigate();
    const departmentId = localStorage.getItem("departmentId");

    const handleLogout = () => {
        toast((t) => (
            <span className="flex flex-col items-center gap-2">
                Are you sure you want to logout?
                <div className="flex gap-4">
                    <button
                        onClick={() => {
                            toast.dismiss(t.id);
                            localStorage.clear();
                            navigate("/login");
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
            duration: 6000,
        });
    };

    useEffect(() => {
        if (!departmentId) {
            setError("Could not find Department ID. Please log in again.");
            setIsLoading(false);
            return;
        }

        Promise.all([
            axios.get(`/api/grievances/department/${departmentId}`),
            axios.get(`/api/grievances/workers/${departmentId}`),
            axios.get('/api/grievances/departments')
        ]).then(([grievanceRes, workerRes, deptRes]) => {
            setGrievances(grievanceRes.data);
            setWorkers(workerRes.data);
            setDepartments(deptRes.data);
            setIsLoading(false);
        }).catch(err => {
            console.error("Fetch error:", err);
            setError("Failed to fetch data from the server.");
            toast.error("Failed to fetch data from the server.");
            setIsLoading(false);
        });
    }, [departmentId, navigate]);


    const sortedAndFilteredGrievances = useMemo(() => {
        if (!Array.isArray(grievances)) return [];
        let sortableItems = [...grievances];
        sortableItems = sortableItems.filter(g => {
            const grievanceDate = new Date(g.created_at);
            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            const endDate = filters.endDate ? new Date(filters.endDate) : null;

            if (startDate) {
                startDate.setHours(0, 0, 0, 0);
                if (grievanceDate < startDate) return false;
            }
            if (endDate) {
                endDate.setHours(23, 59, 59, 999);
                if (grievanceDate > endDate) return false;
            }

            if (filters.status) {
                if (filters.status === 'Escalated') {
                    if (g.escalation_level === 0) return false;
                } else if (g.status !== filters.status) {
                    return false;
                }
            }

            if (filters.urgency && g.urgency !== filters.urgency) return false;
            if (searchTerm && !g.ticket_id.toLowerCase().includes(searchTerm.toLowerCase())) return false;

            return true;
        });
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return sortableItems;
    }, [grievances, searchTerm, sortConfig, filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (key) => (sortConfig.key === key ? (sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />) : null);

    const openTransferModal = () => {
        setTransferFormData({ ticketId: '', newDepartmentId: '' });
        setTransferModalOpen(true);
    };

    const handleTransferFormChange = (e) => setTransferFormData({ ...transferFormData, [e.target.name]: e.target.value });

    const handleTransferSubmit = async (e) => {
        e.preventDefault();
        const { ticketId, newDepartmentId } = transferFormData;
        if (!ticketId || !newDepartmentId) {
            toast.error("Please fill out all fields for the transfer.");
            return;
        }

        const toastId = toast.loading("Transferring grievance...");
        try {
            await axios.put('/api/grievances/transfer', { ticketId, newDepartmentId });

            const refreshedRes = await axios.get(`/api/grievances/department/${departmentId}`);
            setGrievances(refreshedRes.data);

            setTransferModalOpen(false);
            toast.success("Grievance transferred successfully!", { id: toastId });
        } catch (err) {
            const message = err.response?.data?.error || "Failed to transfer grievance.";
            toast.error(message, { id: toastId });
        }
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

            await axios.put(`/api/grievances/${encodedTicketId}/assign`, {
                workerId: selectedWorker,
                officeBearerEmail: officeBearerEmail
            });

            const refreshedRes = await axios.get(`/api/grievances/department/${departmentId}`);
            setGrievances(refreshedRes.data);

            setAssignModalOpen(false);
            toast.success("Grievance assigned successfully!", { id: toastId });
        } catch (err) {
            const message = err.response?.data?.error || "Failed to assign grievance.";
            toast.error(message, { id: toastId });
        }
    };

    const resolveGrievance = async (ticketId) => {
        const toastId = toast.loading('Resolving grievance...');
        try {
            const encodedTicketId = encodeURIComponent(ticketId);
            await axios.put(`/api/grievances/${encodedTicketId}/resolve`);
            const refreshedRes = await axios.get(`/api/grievances/department/${departmentId}`);
            setGrievances(refreshedRes.data);
            toast.success("Grievance resolved successfully!", { id: toastId });
        } catch (err) {
            const message = err.response?.data?.error || "Failed to resolve grievance.";
            toast.error(message, { id: toastId });
        }
    }

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


    const handleAddWorker = async (e) => {
        e.preventDefault();
        const toastId = toast.loading('Adding worker...');
        try {
            const res = await axios.post('/api/grievances/workers', { ...newWorker, department_id: departmentId });
            setWorkers([...workers, { id: res.data.workerId, ...newWorker, department_id: departmentId }]);
            setNewWorker({ name: '', email: '', phone_number: '' });
            toast.success("Worker added successfully!", { id: toastId });
        } catch (err) {
            const message = err.response?.data?.error || "Failed to add worker.";
            toast.error(message, { id: toastId });
        } finally {
            // --- FIX APPLIED ---
            // The modal is now closed in the 'finally' block, ensuring it
            // closes whether the request succeeds or fails.
            setAddWorkerModalOpen(false);
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

    if (isLoading) return (
        <div className="min-h-screen bg-gray-100 py-12 px-6">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                <SkeletonLoader />
            </div>
        </div>
    );
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">Error: {error}</div>;

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-red-300 to-blue-300 py-10 px-4">
                <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-8">
                    {/* Header */}
                    <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                        <h1 className="text-3xl font-bold text-gray-800">Office Bearer Dashboard</h1>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setAddWorkerModalOpen(true)} className="btn btn-primary flex items-center gap-2">
                                <UserPlus size={20} /> Add Worker
                            </button>
                            <button onClick={openTransferModal} className="btn bg-green-600 text-white hover:bg-green-700 flex items-center gap-2">
                                <ArrowRightCircle size={20} /> Transfer
                            </button>
                            <button onClick={handleLogout} className="btn btn-danger">Logout</button>
                        </div>
                    </div>

                    {/* Collapsible Filter Section */}
                    <div className="mb-4">
                        <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 text-blue-600 font-semibold mb-2">
                            <Filter size={18} />
                            {showFilters ? 'Hide Filters' : 'Show Filters'}
                            {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg border">
                                <input type="text" placeholder="Search by Ticket ID..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="p-2 border rounded-lg w-full" />
                                <select name="urgency" value={filters.urgency} onChange={handleFilterChange} className="p-2 border rounded-lg w-full">
                                    <option value="">All Urgencies</option>
                                    <option value="Normal">Normal</option>
                                    <option value="High">High</option>
                                    <option value="Emergency">Emergency</option>
                                </select>
                                <select name="status" value={filters.status} onChange={handleFilterChange} className="p-2 border rounded-lg w-full">
                                    <option value="">All Statuses</option>
                                    <option value="Submitted">Submitted</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Escalated">Escalated</option>
                                </select>
                                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="p-2 border rounded-lg w-full" />
                                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="p-2 border rounded-lg w-full" />
                            </div>
                        )}
                    </div>


                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-xl shadow text-left">
                            <thead className="bg-gray-200 text-gray-700">
                                <tr>
                                    {['ticket_id', 'title', 'urgency', 'status', 'created_at'].map(key => (
                                        <th key={key} className="py-3 px-4 cursor-pointer" onClick={() => requestSort(key)}>
                                            <div className="flex items-center gap-1">{key.replace(/_/g, ' ').toUpperCase()}{getSortIcon(key)}</div>
                                        </th>
                                    ))}
                                    <th className="py-3 px-4 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedAndFilteredGrievances.map((g) => (
                                    <tr key={g.ticket_id} className="border-t hover:bg-gray-50">
                                        <td className="py-3 px-4 font-mono text-sm">{g.ticket_id}</td>
                                        <td className="py-3 px-4">{g.title}</td>
                                        <td className="py-3 px-4"><span className={`font-bold ${g.urgency === 'Emergency' ? 'text-red-600' : g.urgency === 'High' ? 'text-yellow-600' : 'text-green-600'}`}>{g.urgency}</span></td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${g.escalation_level > 0 ? 'bg-red-200 text-red-800' : g.status === "Submitted" ? "bg-yellow-200 text-yellow-800" : g.status === "In Progress" ? "bg-blue-200 text-blue-800" : "bg-green-200 text-green-800"}`}>
                                                {g.escalation_level > 0 ? 'Escalated' : g.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">{new Date(g.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })}</td>
                                        <td className="py-3 px-4 flex gap-2 items-center justify-center">
                                            {g.escalation_level > 0 ? (
                                                <span className="text-red-500 font-bold px-3 py-1">Locked</span>
                                            ) : (
                                                <>
                                                    {g.status === 'Submitted' && (<button onClick={() => openAssignModal(g)} className="btn btn-primary text-sm py-1">Assign</button>)}
                                                    {g.status === 'In Progress' && (
                                                        <>
                                                            <button onClick={() => handleResolveGrievance(g.ticket_id)} className="btn bg-green-500 hover:bg-green-600 text-white text-sm py-1">Resolve</button>
                                                            <button onClick={() => openInfoModal(g)} className="btn btn-secondary p-2"><Info size={14} /></button>
                                                        </>
                                                    )}
                                                    {g.status === 'Resolved' && (
                                                        <button onClick={() => openInfoModal(g)} className="btn btn-secondary p-2"><Info size={14} /></button>
                                                    )}
                                                </>
                                            )}
                                            {g.attachment && (
                                                <a href={g.attachment} target="_blank" rel="noopener noreferrer" className="btn bg-purple-500 hover:bg-purple-600 text-white p-2">
                                                    <Paperclip size={16} />
                                                </a>
                                            )}
                                            <button onClick={() => handlePrint(g)} className="btn btn-secondary p-2"><Printer size={16} /></button>
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
                isOpen={isTransferModalOpen}
                onClose={() => setTransferModalOpen(false)}
                title="Transfer Grievance"
                icon={<ArrowRightCircle size={24} className="text-green-600" />}
            >
                <form onSubmit={handleTransferSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Ticket ID</label>
                        <input type="text" name="ticketId" placeholder="e.g., lnm/2025/07/0100" value={transferFormData.ticketId}
                            onChange={handleTransferFormChange} className="w-full p-2 border rounded-lg mt-1" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">New Department</label>
                        <select name="newDepartmentId" value={transferFormData.newDepartmentId}
                            onChange={handleTransferFormChange} className="w-full p-2 border rounded-lg mt-1" required>
                            <option value="">Select a Department</option>
                            {departments
                                .filter(d => d.id.toString() !== departmentId)
                                .map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                        </select>
                    </div>
                    <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold">
                        Confirm Transfer
                    </button>
                </form>
            </Modal>

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
                        {selectedGrievance.attachment && (
                            <p>
                                <strong>Attachment:</strong>{' '}
                                <a href={selectedGrievance.attachment} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                    View Attachment
                                </a>
                            </p>
                        )}
                    </div>
                )}
            </Modal>
        </>
    );
}