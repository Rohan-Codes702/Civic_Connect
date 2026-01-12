import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, requireAdmin = false, blockAdmin = false }) {
    const { isAuthenticated, user } = useAuth();
    const location = useLocation();
    if (!isAuthenticated) return <Navigate to="/auth" state={{ from: location }} replace />;
    if (requireAdmin && user?.role !== "admin") return <Navigate to="/" replace />;
    if (blockAdmin && user?.role === "admin") return <Navigate to="/admin/complaints" replace />;
    return children;
}


