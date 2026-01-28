import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles, children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>; // TODO: Replace with better loading spinner
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // User role not authorized
        return <Navigate to="/" replace />; // Or unauthorized page
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
