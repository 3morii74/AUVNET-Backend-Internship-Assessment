import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = ['user', 'admin'] }) => {
    const { user, token } = useContext(AuthContext);
    const location = useLocation();

    if (!token) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // If user is super_admin and route requires admin access, allow it
    if (user?.type === 'super_admin' && allowedRoles.includes('admin')) {
        return children;
    }

    if (allowedRoles && !allowedRoles.includes(user?.type)) {
        // Redirect to products page if user doesn't have required role
        return <Navigate to="/products" replace />;
    }

    return children;
};

export default ProtectedRoute; 