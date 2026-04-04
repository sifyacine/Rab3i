import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "client";
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, role, loading, sessionValid } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth is initializing
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  // If session isn't valid or no user, redirect to login
  if (!sessionValid || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Handle role-based access
  if (requiredRole) {
    // If loading is false but role is still null, something went wrong
    // This shouldn't happen with our fix, but keep as safety net
    if (role === null) {
      console.warn("ProtectedRoute: Role is null but loading is false - this shouldn't happen");
      return (
        <div className="flex justify-center items-center h-screen">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      );
    }

    // Check if user has the required role
    if (role !== requiredRole) {
      // Redirect based on their actual role
      const redirectPath = role === "admin" ? "/admin" : role === "client" ? "/portal" : "/";
      return <Navigate to={redirectPath} replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
