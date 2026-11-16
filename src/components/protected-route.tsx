import { Navigate, Outlet } from "react-router-dom";

import { useSession } from "@/hooks/use-auth";
import type { UserRole } from "@/shared/types/auth.types";

interface ProtectedRouteProps {
  /** When set, the signed-in user must hold this role. */
  requiredRole?: UserRole;
}

export const ProtectedRoute = ({ requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, role } = useSession();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole !== undefined && role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
