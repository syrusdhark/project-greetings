import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface AdminProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const AdminProtectedRoute = ({ children, requireAdmin = false }: AdminProtectedRouteProps) => {
  const { isAuthenticated, isLoading, profile } = useAdminAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/signin?returnTo=${location.pathname}`} replace />;
  }

  // If profile is not loaded yet, show loading
  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  // Check if user has admin privileges (school_partner or passholder)
  const hasAdminAccess = profile.role === 'school_partner' || profile.role === 'passholder';
  
  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  // For requireAdmin, check if user is passholder only
  if (requireAdmin && profile?.role !== 'passholder') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Passholder Access Required</h1>
          <p className="text-muted-foreground">You need passholder privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminProtectedRoute;