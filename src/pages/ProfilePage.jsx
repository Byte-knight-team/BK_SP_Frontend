import { useEffect } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { RiLockPasswordLine, RiLogoutBoxRLine } from "@remixicon/react";
import { useAuth } from "../context/AuthContext";

/*
  Common Staff Profile Page
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

/*
  Converts email-like values into display names.
*/
function getNameBeforeAt(value) {
    if (!value) {
        return "-";
    }

    if (value.includes("@")) {
        return value.split("@")[0];
    }

    return value;
}

function ProfileInfoCard({ label, value }) {
    return (
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div className="mb-1 text-[12px] font-medium text-gray-400">
                {label}
            </div>

            <div className="break-words text-[14px] font-semibold text-gray-900">
                {value}
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const navigate = useNavigate();
    const outletContext = useOutletContext();
    const { user, logout } = useAuth();

    /*
      Remove stale page section title from previous pages.
      Example: prevents "System Configuration" showing above Profile page.
    */
    useEffect(() => {
        outletContext?.setHeaderInfo?.(null);

        return () => {
            outletContext?.setHeaderInfo?.(null);
        };
    }, [outletContext]);

    /*
      Role can come as role or roleName depending on AuthContext or JWT mapping.
    */
    const roleName = user?.roleName || user?.role || "STAFF";

    /*
      Email should only be shown in the Email field.
    */
    const email = user?.email || user?.sub || "-";

    /*
      User ID can come as id or userId.
    */
    const userId = user?.id || user?.userId || "-";

    /*
      Username should not show full email.
    */
    const username = getNameBeforeAt(user?.username || email);

    /*
      Full Name should not show full email.
    */
    const fullName = getNameBeforeAt(user?.fullName || user?.name || username);

    /*
      SUPER_ADMIN usually has no branch, so show Global Access.
    */
    const branchName = user?.branchName || "Global Access";

    /*
      Used by Change Password page to know where to return after update.
    */
    const profilePath = getProfilePathByRole(roleName);

    const formattedRoleName = roleName.replace(/_/g, " ");

    const handleLogout = () => {
        logout();
        navigate("/staff/login", { replace: true });
    };

    return (
        <div className="space-y-4">
            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-5">
                    <h1 className="text-xl font-bold text-gray-900">My Profile</h1>

                    <p className="mt-1 text-[13px] text-gray-500">
                        View your account details and access information.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <ProfileInfoCard label="Full Name" value={fullName} />
                    <ProfileInfoCard label="Username" value={username} />
                    <ProfileInfoCard label="Email" value={email} />
                    <ProfileInfoCard label="Role" value={formattedRoleName} />
                    <ProfileInfoCard label="User ID" value={userId} />
                    <ProfileInfoCard label="Branch" value={branchName} />
                </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="mb-4">
                    <h2 className="text-lg font-bold text-gray-900">Account Actions</h2>

                    <p className="mt-1 text-[13px] text-gray-500">
                        Manage your password and account session.
                    </p>
                </div>

                <div className="flex flex-wrap gap-3">
                    <Link
                        to="/staff/change-password"
                        state={{
                            mode: "profile",
                            returnTo: profilePath,
                        }}
                        className="inline-flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50 px-4 py-2.5 text-[13px] font-semibold text-orange-600 transition-colors hover:border-orange-200 hover:bg-orange-100"
                    >
                        <RiLockPasswordLine size={17} />
                        Change Password
                    </Link>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-[13px] font-semibold text-red-600 transition-colors hover:border-red-200 hover:bg-red-100"
                    >
                        <RiLogoutBoxRLine size={17} />
                        Logout
                    </button>
                </div>
            </section>
        </div>
    );
}