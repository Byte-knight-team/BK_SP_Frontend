import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff, X } from "lucide-react";

import { changeStaffPassword } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPathByRole } from "../../utils/authToken";

function getProfilePathByRole(roleName) {
  switch (roleName) {
    case "SUPER_ADMIN":
      return "/staff/profile";

    case "ADMIN":
      return "/admin-panel/profile";

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
  StaffChangePasswordPage

  Purpose:
  - Used for normal password changing from profile.
  - Also used for first-time password setup after staff logs in with temporary password.

  Two scenarios:
  1. First-time setup:
     - Newly created staff logs in using temporary password.
     - They must set their own password before entering the system.
     - They cannot skip this page.
     - "Use Another Account" logs them out and sends them back to login.

  2. Normal password change:
     - Existing logged-in staff changes password from profile.
     - They can go back to profile if they do not want to continue.
*/
export default function ChangePasswordPage() {
  /*
    useNavigate lets us redirect the user to another route after actions.
    Example:
    - after successful password change
    - when clicking back/close button
  */
  const navigate = useNavigate();

  /*
    useLocation gives access to route state.
    Login page sends state like:
    { mode: "first-time" }

    We use that to identify first-time password setup.
  */
  const location = useLocation();

  /*
    useAuth gives access to current logged-in user data and auth actions.

    user- decoded JWT user data from AuthContext
    setUser- updates user only in React memory
    
    logout:
    - clears token and logs user out
  */
  const { user, setUser, logout } = useAuth();

  /*
    formData stores the two password input values.
  */
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  /*
    These states control whether each password input is visible or hidden.
  */
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  /*
    submitting:
    - disables the button while backend request is running.

    message:
    - stores success message.

    error:
    - stores validation or backend error message.
  */
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  /*
    Detect whether this page is being used for first-time password setup.

    First-time setup can be detected in two ways:
    1. user.passwordChanged === false
    2. location.state.mode === "first-time"

    We support both to make the page safer.
  */
  const isFirstTimeSetup =
    user?.passwordChanged === false || location.state?.mode === "first-time";

  /*
    Page text changes depending on the scenario.

    First-time setup:
    - "Set Your Password"

    Normal change:
    - "Change Password"
  */
  const pageTitle = isFirstTimeSetup ? "Set Your Password" : "Change Password";

  const pageDescription = isFirstTimeSetup
    ? "Before entering your workspace, you must set your own password."
    : "Update your current password from your profile.";

  const submitLabel = isFirstTimeSetup ? "Set Password" : "Update Password";

  const roleName = user?.roleName || user?.role || "";
const profilePath = location.state?.returnTo || getProfilePathByRole(roleName);

  /*
    Close/back button logic.

    First-time setup:
    - Staff cannot skip password setup.
    - So clicking close logs them out and sends them to login.
    - This is why the button says "Use Another Account".

    Normal password change:
    - User can safely go back to profile.
  */
  const handleCloseOrBack = () => {
    if (isFirstTimeSetup) {
      logout();
      navigate("/staff/login", { replace: true });
      return;
    }

    navigate(profilePath, { replace: true });
  };

  /*
    Handles form submission.

    Steps:
    1. Stop default browser form refresh.
    2. Clear old messages.
    3. Run simple frontend validation.
    4. Call backend change password API.
    5. Update React user memory.
    6. Redirect user to correct dashboard/profile.
  */
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);
    setError("");
    setMessage("");

    /*
      Simple frontend validation.

      We are not adding complicated backend validation here.
      This only prevents sending obviously invalid data to backend.
    */
    if (!formData.currentPassword || !formData.newPassword) {
      setError("Please fill both password fields.");
      setSubmitting(false);
      return;
    }

    /*
      Simple minimum password length rule.

      This is frontend-only.
      Backend still handles the actual password update.
    */
    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      setSubmitting(false);
      return;
    }

    try {
      /*
        Call backend API.

        Expected backend endpoint:
        PUT /api/auth/staff/change-password
      */
      await changeStaffPassword(formData);

      /*
        Update only React memory.

        Important:
        We do not store full user details in localStorage.
        This follows the JWT/localStorage security cleanup.
      */
      const updatedUser = { ...user, passwordChanged: true };
      setUser(updatedUser);

      /*
        Show success message before redirecting.
      */
      setMessage(
        isFirstTimeSetup
          ? "Password set successfully."
          : "Password changed successfully."
      );

      /*
        Small delay so user can see the success message.
      */
      setTimeout(() => {
        if (isFirstTimeSetup) {
          /*
            First-time setup completed.
            Send user to their correct dashboard based on role.
          */
          navigate(
            getDashboardPathByRole(updatedUser?.roleName || updatedUser?.role),
            { replace: true }
          );
        } else {
          /*
            Normal password change completed.
            Send user back to profile.
          */
            navigate(profilePath, { replace: true });
        }
      }, 800);
    } catch (err) {
      /*
        Show backend/API error if password change fails.
      */
      setError(err.message || "Password change failed");
    } finally {
      /*
        Always stop loading state after API call finishes.
      */
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-xl p-8">
        {/* Small close/back button in the top-right corner */}
        <button
          type="button"
          onClick={handleCloseOrBack}
          className="absolute right-5 top-5 rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          aria-label={isFirstTimeSetup ? "Use another account" : "Back to profile"}
        >
          <X size={20} />
        </button>

        {/* Page title and description */}
        <h1 className="text-2xl font-bold text-gray-900 pr-8">{pageTitle}</h1>
        <p className="text-sm text-gray-500 mt-2">{pageDescription}</p>

        {/* Main back/action button */}
        <button
          type="button"
          onClick={handleCloseOrBack}
          className="mt-4 mb-6 w-full py-3 border border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50"
        >
          {isFirstTimeSetup ? "Use Another Account" : "Back to Profile"}
        </button>

        {/* Success message */}
        {message && (
          <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Password change form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current password field */}
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

              {/* Show/hide current password */}
              <button
                type="button"
                onClick={() => setShowCurrentPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* New password field */}
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

              {/* Show/hide new password */}
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Simple password rule shown to user */}
            <p className="mt-1 text-xs text-gray-400">
              Password must be at least 8 characters.
            </p>
          </div>

          {/* Submit button */}
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