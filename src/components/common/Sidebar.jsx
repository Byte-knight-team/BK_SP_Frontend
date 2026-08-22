import { useNavigate } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import { useAuth } from "../../context/AuthContext";
import { showSignOutToast } from "../../utils/toast";

/*
  Common Sidebar wrapper.

  Purpose:
  - Used by role-specific sidebars.
  - Sends navigation links to AppSidebar.
  - Handles logout.
  - Builds the correct profile path based on logged-in role.

  Important:
  We no longer remove authUser from localStorage because authUser is no longer stored.
  AuthContext/logout handles clearing the JWT token.
*/

function getProfilePathByRole(roleName) {
  switch (roleName) {
    case "SUPER_ADMIN":
      return "/staff/profile";

    case "ADMIN":
      return "/admin/profile";

    case "MANAGER":
      return "/manager/profile";

    case "CHEF":
      return "/kitchen/profile";

    case "RECEPTIONIST":
      return "/receptionist/profile";

    case "DELIVERY":
      return "/delivery/profile";

    default:
      return "/staff/profile";
  }
}

export default function Sidebar({
  topLinks = [],
  bottomLinks = [],
  panelTitle,
  user = {},
}) {
  const navigate = useNavigate();

  /*
    Get logged-in user from AuthContext.

    Some role sidebars may pass user as prop.
    If not, we use authUser from AuthContext.
  */
  const { user: authUser, logout } = useAuth();

  const currentUser = Object.keys(user || {}).length > 0 ? user : authUser || {};

  const roleName = currentUser?.roleName || currentUser?.role || "STAFF";

  const profilePath = getProfilePathByRole(roleName);

  const navItems = [...topLinks, ...bottomLinks];

  const handleLogout = () => {
    logout();
    showSignOutToast();
    navigate("/staff/login", { replace: true });
  };

  return (
    <AppSidebar
      navItems={navItems}
      branchName={currentUser?.branchName || panelTitle || "Global Access"}
      userName={
        currentUser?.fullName ||
        currentUser?.name ||
        currentUser?.username ||
        currentUser?.email ||
        currentUser?.sub ||
        "User"
      }
      roleLabel={roleName}
      profilePath={profilePath}
      onLogout={handleLogout}
    />
  );
}