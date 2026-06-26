import { useEffect } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import {
  RiLockPasswordLine,
  RiLogoutBoxRLine,
  RiUser3Line,
  RiMailLine,
  RiAtLine,
  RiIdCardLine,
  RiStore2Line,
  RiUserSettingsLine,
} from "@remixicon/react";

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

function formatRoleName(roleName) {
  return String(roleName || "STAFF").replace(/_/g, " ");
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const setHeaderInfo = outletContext?.setHeaderInfo;

  const { user, logout } = useAuth();

  /*
    Remove stale page section title from previous pages.
    Example: prevents "System Configuration" showing above Profile page.
  */
  useEffect(() => {
    setHeaderInfo?.(null);

    return () => {
      setHeaderInfo?.(null);
    };
  }, [setHeaderInfo]);

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

  const formattedRoleName = formatRoleName(roleName);

  const handleLogout = () => {
    logout();
    navigate("/staff/login", { replace: true });
  };

  if (!user) {
    return (
      <div className="max-w-5xl">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
          <ProfileState
            Icon={RiUser3Line}
            title="Profile unavailable"
            description="Your profile details could not be loaded. Please log in again to continue."
          />

          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition-colors hover:border-red-200 hover:bg-red-100"
            >
              <RiLogoutBoxRLine size={18} />
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl space-y-5">
      <section className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6 border-b border-gray-100 pb-5">
          <h1 className="text-xl font-bold text-gray-900">My Profile</h1>

          <p className="mt-1 text-sm text-gray-500">
            View your account identity, assigned role, and branch access.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ProfileInfoCard
            Icon={RiUser3Line}
            label="Full Name"
            value={fullName}
          />

          <ProfileInfoCard
            Icon={RiAtLine}
            label="Username"
            value={username}
          />

          <ProfileInfoCard
            Icon={RiMailLine}
            label="Email"
            value={email}
          />

          <ProfileInfoCard
            Icon={RiUserSettingsLine}
            label="Role"
            value={formattedRoleName}
          />

          <ProfileInfoCard
            Icon={RiIdCardLine}
            label="User ID"
            value={userId}
          />

          <ProfileInfoCard
            Icon={RiStore2Line}
            label="Branch"
            value={branchName}
          />
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Account Actions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage your password separately from your login session.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/staff/change-password"
              state={{
                mode: "profile",
                returnTo: profilePath,
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-orange-50 px-5 py-3 text-sm font-semibold text-orange-600 transition-colors hover:border-orange-200 hover:bg-orange-100"
            >
              <RiLockPasswordLine size={18} />
              Change Password
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-red-100 bg-red-50 px-5 py-3 text-sm font-semibold text-red-600 transition-colors hover:border-red-200 hover:bg-red-100"
            >
              <RiLogoutBoxRLine size={18} />
              Logout
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function ProfileInfoCard({ Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
          <Icon size={18} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-gray-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileState({ Icon, title, description }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
        <Icon size={24} />
      </div>

      <h3 className="font-semibold text-gray-900">{title}</h3>

      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}