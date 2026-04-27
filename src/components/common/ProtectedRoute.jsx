import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPathByRole } from "../../utils/authToken";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
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

  /*
    First-time password users should only access change-password page.

    This depends on passwordChanged being returned after login
    or included in JWT.
  */
  if (
    user?.passwordChanged === false &&
    location.pathname !== "/staff/change-password"
  ) {
    return <Navigate to="/staff/change-password" replace />;
  }

  /*
    Frontend route-level authorization.

    This is not the main security layer.
    Backend still must protect every endpoint.
  */
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.roleName)) {
    return <Navigate to={getDashboardPathByRole(user?.roleName)} replace />;
  }

  return children;
}