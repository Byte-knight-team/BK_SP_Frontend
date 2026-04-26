import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AppSidebar from "../common/AppSidebar";
import { receptionistNav } from "../../config/nav/receptionistNav";

export default function ReceptionistSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/staff/login", { replace: true });
  };

  return (
    <AppSidebar
      navItems={receptionistNav}
      branchName={user?.branchName || "Assigned Branch"}
      userName={user?.fullName || user?.username || user?.email || "Receptionist"}
      roleLabel={user?.roleName || "RECEPTIONIST"}
      profilePath="/staff/profile"
      onLogout={handleLogout}
    />
  );
}