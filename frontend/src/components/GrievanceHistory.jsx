import React, { useState, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp } from 'lucide-react';
import SkeletonLoader from './SkeletonLoader';
import axios from '../api/axiosConfig'; // Use the configured axios instance

const GrievanceHistory = () => {
    const [history, setHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'descending' });
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        department: ''
    });
    const [departments, setDepartments] = useState([]);
    const userEmail = localStorage.getItem('userEmail');

    useEffect(() => {
        if (!userEmail) {
            setError('User email not found. Please log in again.');
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Use Promise.all to fetch both history and departments
                const [historyRes, deptsRes] = await Promise.all([
                    axios.get(`/api/grievances/history/${userEmail}`),
                    axios.get('/api/grievances/departments')
                ]);

                setHistory(historyRes.data);
                setDepartments(deptsRes.data);

            } catch (err) {
                const message = err.response?.data?.error || 'Failed to fetch page data.';
                setError(message);
                toast.error(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userEmail]);

    const sortedAndFilteredHistory = useMemo(() => {
        let filteredItems = [...history];

        if (searchTerm) {
            filteredItems = filteredItems.filter(item =>
                item.ticket_id.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filters.status) {
            filteredItems = filteredItems.filter(item => item.status === filters.status);
        }

        if (filters.department) {
            filteredItems = filteredItems.filter(item => item.department_name === filters.department);
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
    }, [history, sortConfig, searchTerm, filters]);

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIcon = (name) => {
        if (sortConfig.key !== name) {
            return null;
        }
        return sortConfig.direction === 'ascending' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
    };

    const formatTimestamp = (ts) => {
        if (!ts) return 'N/A';
        return new Date(ts).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: true,
        });
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-300 to-blue-300 py-12 px-6">
                <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Grievance History</h1>
                    <SkeletonLoader />
                </div>
            </div>
        );
    }

    if (error) {
        return <div className="text-center p-10 text-red-600">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-red-300 to-blue-300 py-12 px-6">
            <div className="max-w-7xl mx-auto bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Grievance History</h1>
                <div className="flex flex-wrap items-center gap-2 mb-4 p-4 bg-gray-50 rounded-lg">
                    <input
                        type="text"
                        placeholder="Search by Ticket ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="p-2 border rounded-lg w-full md:w-auto flex-grow"
                    />
                    <select name="status" value={filters.status} onChange={handleFilterChange} className="p-2 border rounded-lg w-full md:w-auto">
                        <option value="">All Statuses</option>
                        <option value="Submitted">Submitted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Escalated">Escalated</option>
                    </select>
                    <select name="department" value={filters.department} onChange={handleFilterChange} className="p-2 border rounded-lg w-full md:w-auto">
                        <option value="">All Departments</option>
                        {departments.map(dept => (
                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                        ))}
                    </select>
                </div>
                {history.length === 0 ? (
                    <p className="text-center text-gray-600">You have not submitted any grievances yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-xl shadow text-left">
                            <thead className="bg-gray-200 text-gray-700">
                                <tr>
                                    <th className="py-3 px-4 cursor-pointer" onClick={() => requestSort('ticket_id')}>
                                        <div className="flex items-center gap-1">Ticket ID {getSortIcon('ticket_id')}</div>
                                    </th>
                                    <th className="py-3 px-4">Title</th>
                                    <th className="py-3 px-4">Department</th>
                                    <th className="py-3 px-4 cursor-pointer" onClick={() => requestSort('status')}>
                                        <div className="flex items-center gap-1">Status {getSortIcon('status')}</div>
                                    </th>
                                    <th className="py-3 px-4 cursor-pointer" onClick={() => requestSort('created_at')}>
                                        <div className="flex items-center gap-1">Submitted On {getSortIcon('created_at')}</div>
                                    </th>
                                    <th className="py-3 px-4 cursor-pointer" onClick={() => requestSort('updated_at')}>
                                        <div className="flex items-center gap-1">Last Updated {getSortIcon('updated_at')}</div>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedAndFilteredHistory.map((grievance) => (
                                    <tr key={grievance.ticket_id} className="border-t hover:bg-gray-50">
                                        <td className="py-3 px-4 font-mono text-sm">{grievance.ticket_id}</td>
                                        <td className="py-3 px-4">{grievance.title}</td>
                                        <td className="py-3 px-4">{grievance.department_name}</td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${grievance.status === "Resolved" ? "bg-green-200 text-green-800" :
                                                grievance.status === "In Progress" ? "bg-blue-200 text-blue-800" :
                                                    "bg-yellow-200 text-yellow-800"
                                                }`}>
                                                {grievance.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">{formatTimestamp(grievance.created_at)}</td>
                                        <td className="py-3 px-4">{formatTimestamp(grievance.updated_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GrievanceHistory;