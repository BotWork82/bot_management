import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, checkTokenExpiry } = useAuth();
  const location = useLocation();

  // Check token expiry on mount and when location changes
  useEffect(() => {
    checkTokenExpiry();
  }, [location, checkTokenExpiry]);

  if (!isAuthenticated) {
    // Redirect to login with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

