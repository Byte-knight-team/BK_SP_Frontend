import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import AppSidebar from "../common/AppSidebar";
import { receptionistNav } from "../../config/nav/receptionistNav";

/*
  ReceptionistSidebar

  Purpose:
  - Shows sidebar for RECEPTIONIST users.
  - Uses common AppSidebar component.
  - Sends the correct profile route: /receptionist/profile
  - Gets logged-in user details from AuthContext/JWT.
*/
export default function ReceptionistSidebar() {
  const navigate = useNavigate();

  /*
    user comes from AuthContext.

    AuthContext gets this from decoded JWT.
    Do not use localStorage.authUser.
  */
  const { user, logout } = useAuth();

  /*
    Logout clears token through AuthContext,
    then sends user back to common staff login page.
  */
  const handleLogout = () => {
    logout();
    navigate("/staff/login", { replace: true });
  };

  /*
    Prepare display values for sidebar bottom profile card.

    JWT may have:
    - branchName
    - email/sub
    - role/roleName
  */
  const branchName = user?.branchName || "Branch Access";

  const userName =
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.email ||
    user?.sub ||
    "Receptionist";

  const roleLabel = user?.roleName || user?.role || "RECEPTIONIST";

  return (
    <AppSidebar
      navItems={receptionistNav}
      branchName={branchName}
      userName={userName}
      roleLabel={roleLabel}
      profilePath="/receptionist/profile"
      onLogout={handleLogout}
    />
  );
}