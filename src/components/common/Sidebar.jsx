import { useNavigate } from "react-router-dom";
import AppSidebar from "./AppSidebar";

export default function Sidebar({
  topLinks = [],
  bottomLinks = [],
  panelTitle,
  user = {},
}) {
  const navigate = useNavigate();

  const navItems = [...topLinks, ...bottomLinks];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("authUser");
    navigate("/staff/login", { replace: true });
  };

  return (
    <AppSidebar
      navItems={navItems}
      branchName={user?.branchName || panelTitle || "Global Access"}
      userName={user?.name || user?.username || user?.email || "User"}
      roleLabel={user?.role || user?.roleName || "STAFF"}
      profilePath="/staff/profile"
      onLogout={handleLogout}
    />
  );
}
