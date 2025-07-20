import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp } from 'lucide-react';

export default function ApprovingAuthority() {
    const [allGrievances, setAllGrievances] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isAddBearerFormVisible, setAddBearerFormVisible] = useState(false);
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });
    const [departmentFilter, setDepartmentFilter] = useState('');
    const navigate = useNavigate();

    const [newOfficeBearer, setNewOfficeBearer] = useState({
        name: '',
        email: '',
        password: '',
        mobile_number: '',
        role: 'Office Bearer',
        department: ''
    });

    useEffect(() => {
        // The user's local storage key might be different, ensure it is correct
        const email = localStorage.getItem("userEmail");
        if (!email || localStorage.getItem("userRole") !== 'approving-authority') {
            navigate("/login");
        }

        Promise.all([
            fetch('/api/grievances/escalated').then(res => res.json()),
            fetch('/api/grievances/departments').then(res => res.json())
        ]).then(([grievanceData, departmentData]) => {
            setAllGrievances(grievanceData);
            setDepartments(departmentData);
            setIsLoading(false);
        }).catch(err => {
            console.error("Fetch error:", err);
            setError("Failed to fetch dashboard data.");
            setIsLoading(false);
        });
    }, [navigate]);

    const filteredAndSortedGrievances = useMemo(() => {
        let filteredItems = [...allGrievances];

        if (departmentFilter) {
            filteredItems = filteredItems.filter(g => g.department_name === departmentFilter);
        }

        if (sortConfig.key !== null) {
            filteredItems.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filteredItems;
    }, [allGrievances, departmentFilter, sortConfig]);

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

    const handleRevert = async (ticketId, newDays) => {
        if (!newDays || newDays <= 0) {
            alert("Please provide a valid number of days for the new deadline.");
            return;
        }
        try {
            const res = await fetch(`/api/grievances/revert/${encodeURIComponent(ticketId)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ new_resolution_days: newDays })
            });
            if (!res.ok) throw new Error("Failed to revert grievance.");
            setAllGrievances(allGrievances.filter(g => g.ticket_id !== ticketId));
            alert("Grievance reverted successfully!");
        } catch (err) {
            alert(err.message);
        }
    };

    const handleAddOfficeBearerChange = (e) => {
        setNewOfficeBearer({ ...newOfficeBearer, [e.target.name]: e.target.value });
    };

    const handleAddOfficeBearerSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/grievances/add-office-bearer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOfficeBearer)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to add office bearer.");
            alert("Office bearer added successfully!");
            setNewOfficeBearer({ name: '', email: '', password: '', mobile_number: '', role: 'Office Bearer', department: '' });
            setAddBearerFormVisible(false);
        } catch (err) {
            alert(err.message);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userRole");
        navigate("/login");
    };


    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-300 to-blue-300 py-12 px-6">
            <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Approving Authority Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>

                <div className="mb-8 text-center">
                    <button
                        onClick={() => setAddBearerFormVisible(!isAddBearerFormVisible)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold inline-flex items-center justify-center gap-2"
                    >
                        {isAddBearerFormVisible ? 'Hide Form' : 'Add New Office Bearer'}
                        {isAddBearerFormVisible ? <ChevronUp /> : <ChevronDown />}
                    </button>
                    {isAddBearerFormVisible && (
                        <form onSubmit={handleAddOfficeBearerSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow mt-4 text-left">
                            <h2 className="text-xl font-semibold text-gray-800 text-center">New Office Bearer Details</h2>
                            <input type="text" name="name" placeholder="Name" value={newOfficeBearer.name} onChange={handleAddOfficeBearerChange} className="w-full p-2 border rounded" required />
                            <input type="email" name="email" placeholder="Email" value={newOfficeBearer.email} onChange={handleAddOfficeBearerChange} className="w-full p-2 border rounded" required />
                            <input type="password" name="password" placeholder="Password" value={newOfficeBearer.password} onChange={handleAddOfficeBearerChange} className="w-full p-2 border rounded" required />
                            <input type="tel" name="mobile_number" placeholder="Mobile Number" value={newOfficeBearer.mobile_number} onChange={handleAddOfficeBearerChange} className="w-full p-2 border rounded" required />
                            <select name="department" value={newOfficeBearer.department} onChange={handleAddOfficeBearerChange} className="w-full p-2 border rounded" required>
                                <option value="">Select Department</option>
                                {departments.map((dept) => (<option key={dept.id} value={dept.name}>{dept.name}</option>))}
                            </select>
                            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">Add Office Bearer</button>
                        </form>
                    )}
                </div>

                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Escalated Grievances (Level 1)</h2>
                    <select
                        value={departmentFilter}
                        onChange={(e) => setDepartmentFilter(e.target.value)}
                        className="p-2 border rounded-lg"
                    >
                        <option value="">Filter by Department</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white rounded-xl shadow text-left">
                        <thead className="bg-gray-200 text-gray-700">
                            <tr>
                                {['ticket_id', 'title', 'department_name', 'escalation_level', 'created_at'].map(key => (
                                    <th key={key} className="py-3 px-4 cursor-pointer" onClick={() => requestSort(key)}>
                                        <div className="flex items-center gap-1">{key.replace(/_/g, ' ').toUpperCase()}{getSortIcon(key)}</div>
                                    </th>
                                ))}
                                <th className="py-3 px-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredAndSortedGrievances.map((g) => (
                                <tr key={g.ticket_id} className="border-t hover:bg-gray-50">
                                    <td className="py-3 px-4 font-mono text-sm">{g.ticket_id}</td>
                                    <td className="py-3 px-4">{g.title}</td>
                                    <td className="py-3 px-4">{g.department_name}</td>
                                    <td className="py-3 px-4 text-center font-bold text-red-600">{g.escalation_level}</td>
                                    <td className="py-3 px-4">{new Date(g.created_at).toLocaleDateString()}</td>
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <input type="number" placeholder="New Days" id={`new-days-${g.ticket_id}`} className="p-1 border rounded w-24" />
                                            <button onClick={() => handleRevert(g.ticket_id, document.getElementById(`new-days-${g.ticket_id}`).value)} className="bg-blue-500 text-white px-3 py-1 rounded shadow hover:bg-blue-600">Revert</button>
                                        </div>
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