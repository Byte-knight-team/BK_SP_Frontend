import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AppSidebar from "../common/AppSidebar";
import { adminNav } from "../../config/nav/adminNav";

export default function AdminSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/staff/login", { replace: true });
  };

  return (
    <AppSidebar
      navItems={adminNav}
      branchName={user?.branchName || "Assigned Branch"}
      userName={user?.fullName || user?.username || user?.email || "Admin"}
      roleLabel={user?.roleName || "ADMIN"}
      profilePath="/staff/profile"
      onLogout={handleLogout}
    />
  );
}