import { Link, useNavigate } from "react-router-dom";
import { RiLockPasswordLine, RiLogoutBoxRLine } from "@remixicon/react";
import { useAuth } from "../../context/AuthContext";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/staff/login", { replace: true });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-2">
          View your account details here.
        </p>

        <div className="mt-8 grid md:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
            <div className="text-gray-400 mb-1 text-sm">Full Name</div>
            <div className="font-semibold text-gray-900">
              {user?.fullName || user?.username || user?.email || "-"}
            </div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
            <div className="text-gray-400 mb-1 text-sm">Username</div>
            <div className="font-semibold text-gray-900">{user?.username || "-"}</div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
            <div className="text-gray-400 mb-1 text-sm">Email</div>
            <div className="font-semibold text-gray-900">{user?.email || "-"}</div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
            <div className="text-gray-400 mb-1 text-sm">Role</div>
            <div className="font-semibold text-gray-900">{user?.roleName || "-"}</div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
            <div className="text-gray-400 mb-1 text-sm">User ID</div>
            <div className="font-semibold text-gray-900">{user?.id || "-"}</div>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
            <div className="text-gray-400 mb-1 text-sm">Branch</div>
            <div className="font-semibold text-gray-900">
              {user?.branchName || "Global Access"}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Account Actions</h2>
        <p className="text-sm text-gray-500 mt-2">
          Manage your own account from here.
        </p>

        <div className="mt-6 flex gap-3">
                  <Link
                      to="/staff/change-password"
                      state={{ mode: "profile" }}
                      className="inline-flex items-center gap-2 px-5 py-3 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors"
                  >
                      <RiLockPasswordLine size={18} />
                      Change Password
                  </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-5 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
          >
            <RiLogoutBoxRLine size={18} />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}