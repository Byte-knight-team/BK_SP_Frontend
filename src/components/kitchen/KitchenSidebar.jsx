import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AppSidebar from "../common/AppSidebar";
import { kitchenNav } from "../../config/nav/kitchenNav";

export default function KitchenSidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/staff/login", { replace: true });
  };

  return (
    <AppSidebar
      navItems={kitchenNav}
      branchName={user?.branchName || "Assigned Branch"}
      userName={user?.fullName || user?.username || user?.email || "Chef"}
      roleLabel={user?.roleName || "CHEF"}
      profilePath="/staff/profile"
      onLogout={handleLogout}
    />
  );
}