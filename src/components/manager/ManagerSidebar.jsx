import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AppSidebar from "../common/AppSidebar";
import { managerNav } from "../../config/nav/managerNav";

export default function ManagerSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/staff/login", { replace: true });
  };

  return (
    <AppSidebar
      navItems={managerNav}
      branchName={user?.branchName || "Assigned Branch"}
      userName={user?.fullName || user?.username || user?.email || "Manager"}
      roleLabel={user?.roleName || "MANAGER"}
      profilePath="/manager/profile"
      onLogout={handleLogout}
    />
  );
}