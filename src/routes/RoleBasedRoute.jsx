import React from "react";
import { Navigate } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../js/auth";

const RoleBasedRoute = ({ allowedRoles, children }) => {
    if (!isAuthenticated()) return <Navigate to="/login" replace />;
    const role = getUserRole();
    if (!allowedRoles.includes(role)) return <Navigate to="/" replace />;
    return children;
};

export default RoleBasedRoute;
