import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "client";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle role-based access
  if (requiredRole) {
    if (role === null) {
      // Role is still being fetched after auth, show spinner instead of kicking to 403
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }

    // Redirect to login if role doesn't match (not just 403 page)
    if (role !== requiredRole) {
      return <Navigate to="/login" state={{ from: location, reason: "role_mismatch" }} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
