import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  RiEyeLine,
  RiEyeOffLine,
  RiArrowLeftLine,
  RiLockPasswordLine,
} from "@remixicon/react";

import { changeStaffPassword } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPathByRole } from "../../utils/authToken";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

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

  const isFirstTimeSetup =
    user?.passwordChanged === false || location.state?.mode === "first-time";

  const roleName = user?.roleName || user?.role || "";
  const profilePath = location.state?.returnTo || getProfilePathByRole(roleName);

  const pageTitle = isFirstTimeSetup ? "Set Your Password" : "Change Password";

  const pageDescription = isFirstTimeSetup
    ? "Before entering your workspace, you must set your own password."
    : "Update your current password from your profile.";

  const submitLabel = isFirstTimeSetup ? "Set Password" : "Update Password";

  const backLabel = isFirstTimeSetup ? "Use another account" : "Back to profile";

  const handleBack = () => {
    if (isFirstTimeSetup) {
      logout();
      navigate("/staff/login", { replace: true });
      return;
    }

    navigate(profilePath, { replace: true });
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword.trim() || !formData.newPassword.trim()) {
      return "Please fill both password fields.";
    }

    if (formData.newPassword.length < 8) {
      return "New password must be at least 8 characters.";
    }

    if (formData.currentPassword === formData.newPassword) {
      return "New password must be different from current password.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      showErrorToast(validationError);
      return;
    }

    setSubmitting(true);

    try {
      await changeStaffPassword(formData);

      const updatedUser = {
        ...user,
        passwordChanged: true,
      };

      setUser(updatedUser);

      showSuccessToast(
        isFirstTimeSetup
          ? "Password set successfully."
          : "Password changed successfully."
      );

      setTimeout(() => {
        if (isFirstTimeSetup) {
          navigate(
            getDashboardPathByRole(updatedUser?.roleName || updatedUser?.role),
            { replace: true }
          );
        } else {
          navigate(profilePath, { replace: true });
        }
      }, 700);
    } catch (error) {
      showErrorToast(error.message || "Password change failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-orange-600"
        >
          <RiArrowLeftLine size={18} />
          {backLabel}
        </button>

        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            <RiLockPasswordLine size={22} />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>

            <p className="mt-1.5 text-sm leading-6 text-gray-500">
              {pageDescription}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Current Password
            </label>

            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleInputChange}
                autoComplete="current-password"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
              />

              <button
                type="button"
                onClick={() => setShowCurrentPassword((previous) => !previous)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
              >
                {showCurrentPassword ? (
                  <RiEyeOffLine size={18} />
                ) : (
                  <RiEyeLine size={18} />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              New Password
            </label>

            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleInputChange}
                autoComplete="new-password"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50"
              />

              <button
                type="button"
                onClick={() => setShowNewPassword((previous) => !previous)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
              >
                {showNewPassword ? (
                  <RiEyeOffLine size={18} />
                ) : (
                  <RiEyeLine size={18} />
                )}
              </button>
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Password must be at least 8 characters.
            </p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Updating..." : submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}