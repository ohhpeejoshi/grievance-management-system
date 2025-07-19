import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChevronDown, ChevronUp } from 'lucide-react';


// Helper for downloading CSV
const downloadCSV = (data, filename = 'report.csv') => {
    if (!data || data.length === 0) {
        alert("No data to download.");
        return;
    }
    const csvRows = [];
    const headers = Object.keys(data[0]);
    csvRows.push(headers.join(','));

    for (const row of data) {
        const values = headers.map(header => {
            const escaped = ('' + row[header]).replace(/"/g, '\\"');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

export default function Admin() {
    const navigate = useNavigate();
    const [grievances, setGrievances] = useState([]);
    const [level2Grievances, setLevel2Grievances] = useState([]);
    const [stats, setStats] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // Form States
    const [activeForm, setActiveForm] = useState(null); // To control which form is visible
    const [newAuthority, setNewAuthority] = useState({ name: '', email: '', password: '', mobile_number: '' });
    const [newLocation, setNewLocation] = useState('');
    const [newDepartment, setNewDepartment] = useState('');
    const [newCategory, setNewCategory] = useState({ name: '', department_id: '', urgency: 'Normal' });

    // Filter and Sort States
    const [filters, setFilters] = useState({
        department: '',
        status: '',
        escalation: '',
        startDate: '',
        endDate: ''
    });
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });


    useEffect(() => {
        const email = localStorage.getItem("adminEmail");
        if (!email) navigate("/admin-login");

        Promise.all([
            fetch('/api/grievances/admin/all').then(res => res.json()),
            fetch('/api/grievances/admin/stats').then(res => res.json()),
            fetch('/api/grievances/departments').then(res => res.json()),
            fetch('/api/grievances/admin/escalated-level2').then(res => res.json())
        ]).then(([grievanceData, statsData, deptData, level2Data]) => {
            setGrievances(grievanceData);
            setStats(statsData);
            setDepartments(deptData);
            setLevel2Grievances(level2Data);
            setIsLoading(false);
        }).catch(err => {
            console.error("Fetch error:", err);
            setError("Failed to load admin data.");
            setIsLoading(false);
        });
    }, [navigate]);

    const filteredAndSortedGrievances = useMemo(() => {
        let items = [...grievances];

        // Filtering logic
        items = items.filter(g => {
            const grievanceDate = new Date(g.created_at);
            const startDate = filters.startDate ? new Date(filters.startDate) : null;
            const endDate = filters.endDate ? new Date(filters.endDate) : null;

            if (startDate && grievanceDate < startDate) return false;
            if (endDate && grievanceDate > endDate) return false;
            if (filters.department && g.department_name !== filters.department) return false;
            if (filters.status && g.status !== filters.status) return false;
            if (filters.escalation && g.escalation_level < parseInt(filters.escalation)) return false;

            return true;
        });

        // Sorting logic
        if (sortConfig.key !== null) {
            items.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        return items;
    }, [grievances, filters, sortConfig]);

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

    const getSortIcon = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
    };

    const handleFormSubmit = async (e, endpoint, body, successCallback) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/grievances/admin/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Operation failed');
            }
            alert('Success!');
            successCallback();
            setActiveForm(null); // Hide form on success
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const toggleForm = (formName) => {
        setActiveForm(activeForm === formName ? null : formName);
    };

    const handleRevertToLevel1 = async (ticketId) => {
        const comment = prompt("Please enter a comment for reverting this grievance:");
        if (!comment) return;
        const newDays = prompt("Enter new resolution deadline in days:");
        if (!newDays || isNaN(newDays) || newDays <= 0) {
            alert("Please enter a valid number of days.");
            return;
        }

        try {
            const res = await fetch(`/api/grievances/admin/revert-to-level-1/${encodeURIComponent(ticketId)}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    new_resolution_days: newDays,
                    comment: comment,
                    adminEmail: localStorage.getItem("adminEmail")
                })
            });
            if (!res.ok) throw new Error("Failed to revert grievance.");
            alert("Grievance reverted to Level 1 and Approving Authority notified.");
            setLevel2Grievances(level2Grievances.filter(g => g.ticket_id !== ticketId));
        } catch (err) {
            alert(`Error: ${err.message}`);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading Admin Dashboard...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-300 to-blue-300 py-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
                    <button onClick={() => navigate('/landing-home')} className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600">Logout</button>
                </div>

                {/* Charts Section */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4 text-center">Grievances by Department</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie data={stats.byDepartment} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                        {stats.byDepartment.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4 text-center">Grievances by Status</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats.byStatus}>
                                    <XAxis dataKey="status" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#82ca9d" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-semibold mb-4 text-center">Escalation Levels</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={stats.byEscalation}>
                                    <XAxis dataKey="escalation_level" name="Level" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="count" fill="#ffc658" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}


                {/* Level 2 Escalations */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="text-2xl font-semibold mb-4 text-red-600">Level 2+ Escalated Grievances</h2>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-red-200">
                                <tr>
                                    <th className="p-3">Ticket ID</th>
                                    <th className="p-3">Title</th>
                                    <th className="p-3">Department</th>
                                    <th className="p-3">Level</th>
                                    <th className="p-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {level2Grievances.map(g => (
                                    <tr key={g.ticket_id} className="border-t">
                                        <td className="p-3 font-mono text-sm">{g.ticket_id}</td>
                                        <td className="p-3">{g.title}</td>
                                        <td className="p-3">{g.department_name}</td>
                                        <td className="p-3 font-bold text-center text-red-700">{g.escalation_level}</td>
                                        <td className="p-3">
                                            <button onClick={() => handleRevertToLevel1(g.ticket_id)} className="bg-yellow-500 text-white px-3 py-1 rounded shadow hover:bg-yellow-600">Revert to Level 1</button>
                                        </td>
                                    </tr>
                                ))}
                                {level2Grievances.length === 0 && <tr><td colSpan="5" className="p-3 text-center text-gray-500">No grievances at Level 2 or higher.</td></tr>}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Admin Actions Section */}
                <div className="bg-white p-6 rounded-lg shadow mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Management Actions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <button onClick={() => toggleForm('authority')} className="bg-blue-500 text-white py-2 rounded-lg w-full">Add Authority</button>
                        <button onClick={() => toggleForm('location')} className="bg-blue-500 text-white py-2 rounded-lg w-full">Add Location</button>
                        <button onClick={() => toggleForm('department')} className="bg-blue-500 text-white py-2 rounded-lg w-full">Add Department</button>
                        <button onClick={() => toggleForm('category')} className="bg-blue-500 text-white py-2 rounded-lg w-full">Add Category</button>
                    </div>

                    {activeForm === 'authority' && (
                        <form onSubmit={(e) => handleFormSubmit(e, 'add-authority', newAuthority, () => setNewAuthority({ name: '', email: '', password: '', mobile_number: '' }))} className="space-y-2 mt-4 p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">Add Approving Authority</h3>
                            <input type="text" placeholder="Name" value={newAuthority.name} onChange={e => setNewAuthority({ ...newAuthority, name: e.target.value })} className="w-full p-2 border rounded" required />
                            <input type="email" placeholder="Email" value={newAuthority.email} onChange={e => setNewAuthority({ ...newAuthority, email: e.target.value })} className="w-full p-2 border rounded" required />
                            <input type="password" placeholder="Password" value={newAuthority.password} onChange={e => setNewAuthority({ ...newAuthority, password: e.target.value })} className="w-full p-2 border rounded" required />
                            <input type="tel" placeholder="Mobile Number" value={newAuthority.mobile_number} onChange={e => setNewAuthority({ ...newAuthority, mobile_number: e.target.value })} className="w-full p-2 border rounded" required />
                            <button type="submit" className="w-full bg-green-500 text-white py-2 rounded">Submit</button>
                        </form>
                    )}
                    {activeForm === 'location' && (
                        <form onSubmit={(e) => handleFormSubmit(e, 'add-location', { name: newLocation }, () => setNewLocation(''))} className="space-y-2 mt-4 p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">Add Location</h3>
                            <input type="text" placeholder="Location Name" value={newLocation} onChange={e => setNewLocation(e.target.value)} className="w-full p-2 border rounded" required />
                            <button type="submit" className="w-full bg-green-500 text-white py-2 rounded">Submit</button>
                        </form>
                    )}
                    {activeForm === 'department' && (
                        <form onSubmit={(e) => handleFormSubmit(e, 'add-department', { name: newDepartment }, () => setNewDepartment(''))} className="space-y-2 mt-4 p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">Add Department</h3>
                            <input type="text" placeholder="Department Name" value={newDepartment} onChange={e => setNewDepartment(e.target.value)} className="w-full p-2 border rounded" required />
                            <button type="submit" className="w-full bg-green-500 text-white py-2 rounded">Submit</button>
                        </form>
                    )}
                    {activeForm === 'category' && (
                        <form onSubmit={(e) => handleFormSubmit(e, 'add-category', newCategory, () => setNewCategory({ name: '', department_id: '', urgency: 'Normal' }))} className="space-y-2 mt-4 p-4 border rounded-lg">
                            <h3 className="font-semibold text-lg mb-2">Add Category</h3>
                            <select value={newCategory.department_id} onChange={e => setNewCategory({ ...newCategory, department_id: e.target.value })} className="w-full p-2 border rounded" required>
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                            <input type="text" placeholder="Category Name" value={newCategory.name} onChange={e => setNewCategory({ ...newCategory, name: e.target.value })} className="w-full p-2 border rounded" required />
                            <select value={newCategory.urgency} onChange={e => setNewCategory({ ...newCategory, urgency: e.target.value })} className="w-full p-2 border rounded" required>
                                <option value="Normal">Normal</option>
                                <option value="High">High</option>
                                <option value="Emergency">Emergency</option>
                            </select>
                            <button type="submit" className="w-full bg-green-500 text-white py-2 rounded">Submit</button>
                        </form>
                    )}
                </div>

                {/* Detailed Report */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold">Detailed Grievance Report</h2>
                        <button onClick={() => downloadCSV(filteredAndSortedGrievances)} className="bg-green-500 text-white px-4 py-2 rounded-lg shadow hover:bg-green-600">Download CSV</button>
                    </div>
                    {/* Filters */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="p-2 border rounded" />
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="p-2 border rounded" />
                        <select name="department" value={filters.department} onChange={handleFilterChange} className="p-2 border rounded">
                            <option value="">All Departments</option>
                            {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="p-2 border rounded">
                            <option value="">All Statuses</option>
                            <option value="Submitted">Submitted</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                        </select>
                        <select name="escalation" value={filters.escalation} onChange={handleFilterChange} className="p-2 border rounded">
                            <option value="">Any Escalation</option>
                            <option value="1">Level 1+</option>
                            <option value="2">Level 2+</option>
                        </select>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left">
                            <thead className="bg-gray-200">
                                <tr>
                                    {['ticket_id', 'title', 'department_name', 'status', 'escalation_level', 'created_at'].map(key => (
                                        <th key={key} className="p-3 cursor-pointer" onClick={() => requestSort(key)}>
                                            <div className="flex items-center gap-1">
                                                {key.replace(/_/g, ' ').toUpperCase()}
                                                {getSortIcon(key)}
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAndSortedGrievances.map(g => (
                                    <tr key={g.ticket_id} className="border-t hover:bg-gray-50">
                                        <td className="p-3 font-mono text-sm">{g.ticket_id}</td>
                                        <td className="p-3">{g.title}</td>
                                        <td className="p-3">{g.department_name}</td>
                                        <td className="p-3">{g.status}</td>
                                        <td className="p-3 font-bold text-center">{g.escalation_level}</td>
                                        <td className="p-3">{new Date(g.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
