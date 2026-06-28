import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  RiEyeLine,
  RiEyeOffLine,
  RiShieldUserLine,
  RiStore2Line,
  RiRestaurantLine,
  RiHeartLine,
} from "@remixicon/react";
import { useAuth } from "../../context/AuthContext";
import { getDashboardPathByRole } from "../../utils/authToken";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, hydrated, user } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getDashboardPathByRole(user?.roleName)} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const data = await login(formData);

      if (data.passwordChanged === false) {
        navigate("/staff/change-password", {
          replace: true,
          state: { mode: "first-time" },
        });
        return;
      }

      const targetPath = getDashboardPathByRole(data.roleName);
      navigate(targetPath, { replace: true });
    } catch (err) {
      setError(err.message || "Unable to sign in. Please check your details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-xl lg:grid-cols-[360px_1fr]">
        {/* Left brand panel */}
        <div className="flex flex-col justify-between bg-gray-900 p-10 text-white">
          <div>
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500">
                <RiShieldUserLine size={22} />
              </div>

              <div>
                <h2 className="font-bold leading-tight text-white">
                  Crave House
                </h2>
                <p className="text-xs text-gray-400">Staff Portal</p>
              </div>
            </div>

            <h1 className="mb-3 text-3xl font-bold">
              Welcome to Crave House
            </h1>

            <p className="text-sm leading-relaxed text-gray-400">
              Sign in to continue supporting our restaurant team and delivering
              a smooth dining experience for every guest.
            </p>
          </div>

          <div className="mt-10 space-y-4 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-orange-400">
                <RiStore2Line size={17} />
              </span>

              <div>
                <p className="font-semibold text-white">
                  Premium Dining Experience
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-400">
                  Serving guests with quality food, warm service, and a
                  comfortable atmosphere.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-orange-400">
                <RiRestaurantLine size={17} />
              </span>

              <div>
                <p className="font-semibold text-white">
                  Fresh Food, Made Daily
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-400">
                  Our teams work together to prepare fresh meals and maintain
                  consistent taste.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-orange-400">
                <RiHeartLine size={17} />
              </span>

              <div>
                <p className="font-semibold text-white">Guest-First Service</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-400">
                  Every staff member helps create a smooth and welcoming
                  restaurant experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Login form panel */}
        <div className="flex items-center p-10 lg:p-12">
          <div className="mx-auto w-full max-w-md">
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Sign in to your account
            </h2>

            <p className="mb-8 text-sm text-gray-500">
              Use your staff email and password to continue.
            </p>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email Address
                </label>

                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="you@cravehouse.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    placeholder="Enter your password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <RiEyeOffLine size={18} />
                    ) : (
                      <RiEyeLine size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-orange-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-500/25 transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-gray-400">
              Authorized Crave House staff access only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}