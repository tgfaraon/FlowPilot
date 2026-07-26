import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
    requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role"); // store role at login

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole === "platformAdmin" && role !== "platformAdmin" && role !== "admin") {
        return <Navigate to="/user/dashboard" />;
    }

    return <>{children}</>;
}