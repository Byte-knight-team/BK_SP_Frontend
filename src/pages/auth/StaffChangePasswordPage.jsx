import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  RiEyeLine,
  RiEyeOffLine,
  RiArrowLeftLine,
  RiLockPasswordLine,
  RiShieldCheckLine,
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
    ? "Before entering your workspace, set a secure password for your account."
    : "Update your current password from your profile.";

  const submitLabel = isFirstTimeSetup ? "Set Password" : "Update Password";

  const backLabel = isFirstTimeSetup ? "Use another account" : "Back to profile";

  const newPasswordHasMinimumLength = formData.newPassword.length >= 8;
  const passwordsAreDifferent =
    formData.newPassword &&
    formData.currentPassword &&
    formData.newPassword !== formData.currentPassword;

  const handleBack = () => {
    if (submitting) {
      return;
    }

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
      <div className="w-full max-w-md overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gradient-to-r from-orange-50 to-white p-6">
          <button
            type="button"
            onClick={handleBack}
            disabled={submitting}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RiArrowLeftLine size={18} />
            {backLabel}
          </button>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-md shadow-orange-200">
              <RiLockPasswordLine size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>

              <p className="mt-1.5 text-sm leading-6 text-gray-500">
                {pageDescription}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <PasswordField
              label="Current Password"
              name="currentPassword"
              value={formData.currentPassword}
              visible={showCurrentPassword}
              disabled={submitting}
              autoComplete="current-password"
              onChange={handleInputChange}
              onToggleVisibility={() =>
                setShowCurrentPassword((previous) => !previous)
              }
            />

            <div>
              <PasswordField
                label="New Password"
                name="newPassword"
                value={formData.newPassword}
                visible={showNewPassword}
                disabled={submitting}
                autoComplete="new-password"
                onChange={handleInputChange}
                onToggleVisibility={() =>
                  setShowNewPassword((previous) => !previous)
                }
              />

              <div className="mt-3 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold text-gray-700">
                  Password requirements
                </p>

                <div className="mt-2 space-y-1.5">
                  <RequirementItem
                    complete={newPasswordHasMinimumLength}
                    text="At least 8 characters"
                  />

                  <RequirementItem
                    complete={passwordsAreDifferent}
                    text="Different from current password"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting && (
                <Spinner className="h-4 w-4 border-orange-200 border-t-white" />
              )}

              {submitting ? "Updating..." : submitLabel}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function PasswordField({
  label,
  name,
  value,
  visible,
  disabled,
  autoComplete,
  onChange,
  onToggleVisibility,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-gray-700">
        {label}
      </label>

      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          autoComplete={autoComplete}
          className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-sm outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50 disabled:bg-gray-100 disabled:text-gray-400"
        />

        <button
          type="button"
          onClick={onToggleVisibility}
          disabled={disabled}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {visible ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
        </button>
      </div>
    </div>
  );
}

function RequirementItem({ complete, text }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`h-2 w-2 rounded-full ${
          complete ? "bg-green-500" : "bg-gray-300"
        }`}
      />

      <span className={complete ? "text-gray-700" : "text-gray-400"}>
        {text}
      </span>
    </div>
  );
}

function Spinner({ className }) {
  return (
    <span
      className={`inline-flex animate-spin rounded-full border-2 ${className}`}
    />
  );
}