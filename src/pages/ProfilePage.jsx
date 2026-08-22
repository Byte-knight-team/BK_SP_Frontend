import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import {
  RiAtLine,
  RiIdCardLine,
  RiLockPasswordLine,
  RiLogoutBoxRLine,
  RiMailLine,
  RiStore2Line,
  RiUser3Line,
  RiUserSettingsLine,
} from "@remixicon/react";

import { useAuth } from "../context/AuthContext";
import LogoutConfirmModal from "../components/common/LogoutConfirmModal";
import { showSignOutToast } from "../utils/toast";

export default function ProfilePage() {
  const navigate = useNavigate();
  const outletContext = useOutletContext();
  const setHeaderInfo = outletContext?.setHeaderInfo;

  const auth = useAuth();
  const user = auth?.user;
  const logout =
    auth?.logout || auth?.signOut || auth?.handleLogout || auth?.clearAuth;

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (setHeaderInfo) {
      setHeaderInfo({
        title: "My Profile",
        description: "View your account details and manage account actions.",
        Icon: RiUserSettingsLine,
      });
    }

    return () => {
      if (setHeaderInfo) {
        setHeaderInfo(null);
      }
    };
  }, [setHeaderInfo]);

  const roleName = user?.roleName || user?.role || "";

  const displayName =
    user?.fullName ||
    user?.name ||
    user?.username ||
    getNameBeforeAt(user?.email) ||
    "User";

  const displayUsername =
    user?.username || getNameBeforeAt(user?.email) || "Not available";

  const displayEmail = user?.email || "Not available";

  const displayBranch =
    user?.branchName ||
    user?.branch?.name ||
    (normalizeRole(roleName) === "SUPER_ADMIN"
      ? "Global Access"
      : "Not assigned");

  const displayUserId = user?.id || user?.userId || "Not available";

  const handleLogout = () => {
    if (typeof logout === "function") {
      logout();
    } else {
      localStorage.removeItem("token");
      localStorage.removeItem("jwt");
      localStorage.removeItem("staff_jwt");
      localStorage.removeItem("staff_token");
      localStorage.removeItem("role");
      localStorage.removeItem("staff_role");
      localStorage.removeItem("user");
      localStorage.removeItem("authUser");
      localStorage.removeItem("user_id");
      localStorage.removeItem("staff_user_id");
    }

    setShowLogoutConfirm(false);
    showSignOutToast();
    navigate("/staff/login", { replace: true });
  };

  if (!user) {
    return (
      <div className="max-w-5xl">
        <ProfileState
          Icon={RiUser3Line}
          title="Profile not available"
          description="We could not find your profile details. Please login again to continue."
        />

        <div className="mt-4">
          <Link
            to="/staff/login"
            className="inline-flex items-center justify-center rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-orange-100 hover:bg-orange-600"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-6xl space-y-5">
        {/* Profile information */}
        <section className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-900">My Profile</h3>

            <p className="mt-1 text-sm text-gray-500">
              These details are connected to your staff account and access role.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <ProfileInfoCard
              Icon={RiUser3Line}
              label="Full Name"
              value={displayName}
            />

            <ProfileInfoCard
              Icon={RiAtLine}
              label="Username"
              value={displayUsername}
            />

            <ProfileInfoCard
              Icon={RiMailLine}
              label="Email"
              value={displayEmail}
            />

            <ProfileInfoCard
              Icon={RiUserSettingsLine}
              label="Role"
              value={formatRoleName(roleName)}
            />

            <ProfileInfoCard
              Icon={RiIdCardLine}
              label="User ID"
              value={displayUserId}
            />

            <ProfileInfoCard
              Icon={RiStore2Line}
              label="Branch"
              value={displayBranch}
            />
          </div>
        </section>

        {/* Account actions */}
        <section className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-lg font-bold text-gray-900">
              Account Actions
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Manage your password or safely end your current session.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/staff/change-password"
              className="group flex flex-1 items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 transition hover:border-orange-200 hover:bg-orange-50"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600 shadow-sm">
                <RiLockPasswordLine size={20} />
              </div>

              <div className="min-w-0">
                <h4 className="text-sm font-bold text-gray-900 group-hover:text-orange-700">
                  Change Password
                </h4>

                <p className="mt-0.5 truncate text-sm text-gray-500">
                  Update your account password.
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="group flex flex-1 items-center gap-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-left transition hover:border-red-200 hover:bg-red-100"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-600 shadow-sm">
                <RiLogoutBoxRLine size={20} />
              </div>

              <div className="min-w-0">
                <h4 className="text-sm font-bold text-red-700">Logout</h4>

                <p className="mt-0.5 truncate text-sm text-red-600">
                  End your current session.
                </p>
              </div>
            </button>
          </div>
        </section>
      </div>

      {showLogoutConfirm && (
        <LogoutConfirmModal
          onCancel={() => setShowLogoutConfirm(false)}
          onConfirm={handleLogout}
        />
      )}
    </>
  );
}

function ProfileInfoCard({ Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-600 shadow-sm">
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-400">
            {label}
          </p>

          <p className="mt-1 break-words text-sm font-semibold text-gray-900">
            {value || "Not available"}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileState({ Icon, title, description }) {
  return (
    <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 text-center shadow-sm">
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

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .replace(/\s+/g, "_")
    .toUpperCase();
}

function formatRoleName(role) {
  if (!role) return "Not available";

  return String(role)
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getNameBeforeAt(email) {
  if (!email || !String(email).includes("@")) {
    return "";
  }

  return String(email).split("@")[0];
}