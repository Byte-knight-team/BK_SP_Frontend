import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { changeStaffPassword } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

function getDashboardPathByRole(roleName) {
  switch (roleName) {
    case "SUPER_ADMIN":
      return "/staff";
    case "ADMIN":
      return "/staff";
    case "RECEPTIONIST":
      return "/receptionist";
    case "CHEF":
      return "/kitchen";
    case "MANAGER":
      return "/staff";
    case "DELIVERY":
      return "/staff";
    default:
      return "/staff";
  }
}

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setUser, logout } = useAuth();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isFirstTimeSetup =
    user?.passwordChanged === false || location.state?.mode === "first-time";

  const pageTitle = isFirstTimeSetup ? "Set Your Password" : "Change Password";
  const pageDescription = isFirstTimeSetup
    ? "Before entering your workspace, you must set your own password."
    : "Update your current password from your profile.";
  const submitLabel = isFirstTimeSetup ? "Set Password" : "Update Password";

  const handleUseAnotherAccount = () => {
    logout();
    navigate("/staff/login", { replace: true });
  };

  const handleBackToProfile = () => {
    navigate("/staff/profile", { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await changeStaffPassword(formData);

      const updatedUser = { ...user, passwordChanged: true };
      localStorage.setItem("authUser", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setMessage(
        isFirstTimeSetup
          ? "Password set successfully."
          : "Password changed successfully."
      );

      setTimeout(() => {
        if (isFirstTimeSetup) {
          navigate(getDashboardPathByRole(updatedUser?.roleName), {
            replace: true,
          });
        } else {
          navigate("/staff/profile", { replace: true });
        }
      }, 800);
    } catch (err) {
      setError(err.message || "Password change failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
        <p className="text-sm text-gray-500 mt-2">{pageDescription}</p>

        {isFirstTimeSetup ? (
          <button
            type="button"
            onClick={handleUseAnotherAccount}
            className="mt-4 mb-6 w-full py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            Use Another Account
          </button>
        ) : (
          <button
            type="button"
            onClick={handleBackToProfile}
            className="mt-4 mb-6 w-full py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            Back to Profile
          </button>
        )}

        {message && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-70"
          >
            {submitting ? "Updating..." : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}