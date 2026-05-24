import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        // Redirect to login but save the current location they were trying to go to
        console.warn("ProtectedRoute: No user found, redirecting to login from", location.pathname);
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const userRole = user.role?.toLowerCase();
    const isAllowed = !allowedRoles || allowedRoles.some(role => role.toLowerCase() === userRole);

    if (!isAllowed) {
        // User is logged in but doesn't have the correct role
        console.warn(`ProtectedRoute: Role "${userRole}" not allowed for ${location.pathname}. Allowed:`, allowedRoles);
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
