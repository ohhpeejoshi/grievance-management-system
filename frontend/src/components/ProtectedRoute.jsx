import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const userRole = localStorage.getItem('userRole');
    const userEmail = localStorage.getItem('userEmail');
    const location = useLocation();

    const handleUnauthorized = () => {
        // Clear all session-related storage to ensure a clean logout
        localStorage.clear();
        return <Navigate to="/login" state={{ from: location }} replace />;
    };

    if (!userEmail) {
        // If the user is not logged in, handle unauthorized access
        return handleUnauthorized();
    }

    if (!allowedRoles.includes(userRole)) {
        // If the user's role is not allowed, handle unauthorized access
        return handleUnauthorized();
    }

    return children;
};

export default ProtectedRoute;