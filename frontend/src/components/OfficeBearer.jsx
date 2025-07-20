import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ChevronDown, ChevronUp, Printer, X, UserPlus, FileSignature, Info, ArrowRightCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import SkeletonLoader from './SkeletonLoader';
import Modal from './Modal';

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

    // State for Transfer Modal
    const [isTransferModalOpen, setTransferModalOpen] = useState(false);
    const [transferFormData, setTransferFormData] = useState({ ticketId: '', newDepartmentId: '' });

    // Other modal states
    const [isAssignModalOpen, setAssignModalOpen] = useState(false);
    const [isAddWorkerModalOpen, setAddWorkerModalOpen] = useState(false);
    const [isInfoModalOpen, setInfoModalOpen] = useState(false);
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [selectedWorker, setSelectedWorker] = useState('');
    const [newWorker, setNewWorker] = useState({ name: '', email: '', phone_number: '' });

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
            fetch(`/api/grievances/department/${departmentId}`).then(res => res.json()),
            fetch(`/api/grievances/workers/${departmentId}`).then(res => res.json()),
            fetch('/api/grievances/departments').then(res => res.json())
        ]).then(([grievanceData, workerData, deptData]) => {
            setGrievances(grievanceData);
            setWorkers(workerData);
            setDepartments(deptData);
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
            const res = await fetch('/api/grievances/transfer', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ticketId: ticketId,
                    newDepartmentId: newDepartmentId
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to transfer grievance.");

            const refreshedGrievances = await fetch(`/api/grievances/department/${departmentId}`).then(res => res.json());
            setGrievances(refreshedGrievances);

            setTransferModalOpen(false);
            toast.success("Grievance transferred successfully!", { id: toastId });
        } catch (err) {
            toast.error(err.message, { id: toastId });
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

            const res = await fetch(`/api/grievances/${encodedTicketId}/assign`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    workerId: selectedWorker,
                    officeBearerEmail: officeBearerEmail
                }),
            });
            if (!res.ok) throw new Error("Failed to assign grievance.");

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
        printWindow.document.write(`...`); // Print content
        printWindow.document.close();
        printWindow.print();
    };

    if (isLoading) return (
        <div className="min-h-screen bg-gradient-to-br from-red-300 to-blue-300 py-12 px-6">
            <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
                <SkeletonLoader />
            </div>
        </div>
    );
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">Error: {error}</div>;

    return (
        <>
            <div className="min-h-screen bg-gradient-to-br from-red-300 to-blue-300 py-12 px-6">
                <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
                    <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                        <h1 className="text-3xl font-bold text-gray-800">Office Bearer Dashboard</h1>
                        <div className="flex items-center gap-4">
                            <button onClick={() => setAddWorkerModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition flex items-center gap-2">
                                <Plus size={20} /> Add Worker
                            </button>
                            <button onClick={openTransferModal} className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition flex items-center gap-2">
                                <ArrowRightCircle size={20} /> Transfer Grievance
                            </button>
                            <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition">Logout</button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mb-4 p-4 bg-gray-50 rounded-lg">
                        <input
                            type="text"
                            placeholder="Search by Ticket ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="p-2 border rounded-lg w-full md:w-auto flex-grow"
                        />
                        <select name="urgency" value={filters.urgency} onChange={handleFilterChange} className="p-2 border rounded-lg w-full md:w-auto">
                            <option value="">All Urgencies</option>
                            <option value="Normal">Normal</option>
                            <option value="High">High</option>
                            <option value="Emergency">Emergency</option>
                        </select>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="p-2 border rounded-lg w-full md:w-auto">
                            <option value="">All Statuses</option>
                            <option value="Submitted">Submitted</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Escalated">Escalated</option>
                        </select>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="p-2 border rounded-lg w-full md:w-auto" />
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="p-2 border rounded-lg w-full md:w-auto" />
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
                    </div>
                )}
            </Modal>
        </>
    );
}