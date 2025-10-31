import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated, getUserRole } from '../js/auth';

const PublicRoute = ({ children }) => {
    if (isAuthenticated()) {
        const role = getUserRole();
        switch (role) {
            case 'student':
                return <Navigate to="/home" replace />;
            case 'teacher':
                return <Navigate to="/teacher/dashboard" replace />;
            case 'admin':
                return <Navigate to="/teacher/dashboard" replace />;
            default:
                return <Navigate to="/" replace />;
        }
    }
    return children;
};

export default PublicRoute;
