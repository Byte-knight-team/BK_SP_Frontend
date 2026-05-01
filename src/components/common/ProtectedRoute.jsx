import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPathByRole } from "../../utils/authToken";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { hydrated, isAuthenticated, user } = useAuth();
  const location = useLocation();

  /* Hydration check = Load the page only when the user data is loaded from the database */
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    );
  }

  /* Login route protection*/
  if (!isAuthenticated) {
    return <Navigate to="/staff/login" replace state={{ from: location }} />;
  }

  /*
    First-time password users should only access change-password page.
  */
  if (
    user?.passwordChanged === false &&
    location.pathname !== "/staff/change-password"
  ) {
    return <Navigate to="/staff/change-password" replace />;
  }

  /*
    Frontend route-level authorization.
  */
  const currentRole = user?.roleName || user?.role;

  if (allowedRoles.length > 0 && !allowedRoles.includes(currentRole)) {
    return <Navigate to={getDashboardPathByRole(currentRole)} replace />;
  }

  return children;
}