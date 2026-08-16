import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AppSidebar from "../common/AppSidebar";
import { superAdminNav } from "../../config/nav/superAdminNav";

export default function SuperAdminSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/staff/login", { replace: true });
  };

  return (
    <AppSidebar
      navItems={superAdminNav}
      branchName={user?.branchName || "Global Access"}
      userName={
        user?.fullName ||
        user?.name ||
        user?.username ||
        user?.email ||
        "User"
      }
      roleLabel={user?.roleName || "STAFF"}
      profilePath="/staff/profile"
      onLogout={handleLogout}
    />
  );
}
