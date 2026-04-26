import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AppSidebar from "../common/AppSidebar";
import { deliveryNav } from "../../config/nav/deliveryNav";

export default function DeliverySidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/staff/login", { replace: true });
  };

  return (
    <AppSidebar
      navItems={deliveryNav}
      branchName={user?.branchName || "Assigned Branch"}
      userName={user?.fullName || user?.username || user?.email || "Delivery Staff"}
      roleLabel={user?.roleName || "DELIVERY"}
      profilePath="/staff/profile"
      onLogout={handleLogout}
    />
  );
}