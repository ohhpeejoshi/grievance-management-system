import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');
    const location = useLocation();

    const handleUnauthorized = () => {
        localStorage.clear();
        return <Navigate to="/login" state={{ from: location }} replace />;
    };

    if (!token) {
        return handleUnauthorized();
    }

    if (!allowedRoles.includes(userRole)) {
        return handleUnauthorized();
    }

    return children;
};

export default ProtectedRoute;