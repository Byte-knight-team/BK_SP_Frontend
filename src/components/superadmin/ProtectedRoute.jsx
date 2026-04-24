import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { hydrated, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/staff/login" replace state={{ from: location }} />;
  }

  if (user?.passwordChanged === false) {
    return <Navigate to="/staff/change-password" replace />;
  }

  return children;
}