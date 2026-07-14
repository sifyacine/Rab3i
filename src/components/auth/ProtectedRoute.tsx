import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import type { AuthUserRole } from "@/lib/authSession";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AuthUserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, role, loading, sessionValid } = useAuth();
  const location = useLocation();

  // A signed-in account with no staff role (legacy client account or auth
  // desync) can never use the app — end its session so it doesn't linger
  // and re-trigger role resolution on every auth event.
  const denyAndEndSession =
    !loading && sessionValid && !!user && !!allowedRoles?.length && role === null;

  useEffect(() => {
    if (denyAndEndSession) {
      supabase?.auth.signOut().catch(() => {});
    }
  }, [denyAndEndSession]);

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
  if (allowedRoles && allowedRoles.length > 0) {
    if (denyAndEndSession) {
      console.warn("ProtectedRoute: no staff role after auth init - ending session and redirecting to login");
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Staff member without sufficient role (e.g. worker on a manager-only
    // section) goes back to the dashboard home
    if (role !== null && !allowedRoles.includes(role)) {
      return <Navigate to="/admin" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
