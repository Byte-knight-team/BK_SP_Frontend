import { useEffect, useState } from "react";
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
import {
  getDashboardPathByRole,
  normalizeStaffRole,
} from "../../utils/authToken";

export default function LoginPage() {
  const navigate = useNavigate();

  const {
    login,
    logout,
    isAuthenticated,
    hydrated,
    user,
  } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const currentRole = normalizeStaffRole(user?.roleName);

  /*
    If a DELIVERY session was previously stored in the browser,
    remove it because DELIVERY does not use the web staff portal.
  */
  useEffect(() => {
    if (
      hydrated &&
      isAuthenticated &&
      currentRole === "DELIVERY"
    ) {
      logout();

      setError(
        "Delivery personnel must use the Crave House Delivery mobile app to access their account."
      );
    }
  }, [
    hydrated,
    isAuthenticated,
    currentRole,
    logout,
  ]);

  /*
    Wait until AuthContext has restored/checked saved session.
  */
  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="text-sm text-gray-600">
          Loading...
        </div>
      </div>
    );
  }

  /*
    Existing authenticated WEB staff users return to their dashboard.

    DELIVERY is excluded because it is handled by the effect above.
  */
  if (
    isAuthenticated &&
    currentRole !== "DELIVERY"
  ) {
    return (
      <Navigate
        to={getDashboardPathByRole(currentRole)}
        replace
      />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSubmitting(true);

    try {
      const data = await login({
        email: formData.email.trim(),
        password: formData.password,
      });

      const loggedInRole =
        normalizeStaffRole(data.roleName);

      /*
        DELIVERY personnel use the mobile application only.

        The login API may authenticate successfully, but we do not
        keep a DELIVERY JWT session inside the web frontend.
      */
      if (loggedInRole === "DELIVERY") {
        logout();

        setError(
          "Delivery personnel must use the Crave House Delivery mobile app to access their account."
        );

        return;
      }

      /*
        Newly created web staff using a temporary password
        must change their password before entering the dashboard.
      */
      if (data.passwordChanged === false) {
        navigate("/staff/change-password", {
          replace: true,
          state: {
            mode: "first-time",
          },
        });

        return;
      }

      /*
        Redirect normal web staff to their own dashboard.
      */
      const targetPath =
        getDashboardPathByRole(loggedInRole);

      navigate(targetPath, {
        replace: true,
      });
    } catch (err) {
      setError(
        err?.message ||
          "Unable to sign in. Please check your details."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#f7f4ef] px-4 py-8 sm:p-6">
      {/* Background gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-30"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 16%, rgba(249, 115, 22, 0.22), transparent 29%), radial-gradient(circle at 88% 84%, rgba(15, 23, 42, 0.16), transparent 31%), linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(255, 247, 237, 0.72))",
        }}
      />

      {/* Background grid */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 opacity-45"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.12) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />

      <div
        aria-hidden="true"
        className="absolute -left-24 top-1/3 -z-10 h-72 w-72 rounded-full bg-orange-300/30 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute -right-20 bottom-1/4 -z-10 h-80 w-80 rounded-full bg-slate-700/15 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="absolute left-[5%] top-[17%] -z-10 hidden h-28 w-28 rotate-[-8deg] items-center justify-center rounded-[2rem] border border-orange-200/70 bg-white/45 text-orange-500/55 shadow-lg shadow-orange-100/40 backdrop-blur-sm xl:flex"
      >
        <RiStore2Line size={48} />
      </div>

      <div
        aria-hidden="true"
        className="absolute bottom-[10%] right-[5%] -z-10 hidden h-44 w-44 items-center justify-center rounded-full border border-slate-300/60 bg-white/35 shadow-xl shadow-slate-300/20 backdrop-blur-sm xl:flex"
      >
        <div className="flex h-32 w-32 items-center justify-center rounded-full border border-orange-200/70 bg-orange-50/50 text-orange-500/45">
          <RiRestaurantLine size={58} />
        </div>
      </div>

      {/* Main login card */}
      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white/95 shadow-2xl shadow-slate-900/15 ring-1 ring-white/80 backdrop-blur-sm lg:grid-cols-[360px_1fr]">
        {/* Left brand panel */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-slate-800 p-10 text-white">
          <RiRestaurantLine
            aria-hidden="true"
            size={220}
            className="pointer-events-none absolute -bottom-14 -right-16 rotate-[-12deg] text-white/[0.045]"
          />

          <div className="relative z-10">
            <div className="mb-12 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500">
                <RiShieldUserLine size={22} />
              </div>

              <div>
                <h2 className="font-bold leading-tight text-white">
                  Crave House
                </h2>

                <p className="text-xs text-gray-400">
                  Staff Portal
                </p>
              </div>
            </div>

            <h1 className="mb-3 text-3xl font-bold">
              Welcome to Crave House
            </h1>

            <p className="text-sm leading-relaxed text-gray-400">
              Sign in to continue supporting our restaurant team
              and delivering a smooth dining experience for every
              guest.
            </p>
          </div>

          <div className="relative z-10 mt-10 space-y-4 text-sm text-gray-300">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-orange-400">
                <RiStore2Line size={17} />
              </span>

              <div>
                <p className="font-semibold text-white">
                  Premium Dining Experience
                </p>

                <p className="mt-0.5 text-xs leading-relaxed text-gray-400">
                  Serving guests with quality food, warm service,
                  and a comfortable atmosphere.
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
                  Our teams work together to prepare fresh meals
                  and maintain consistent taste.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-orange-400">
                <RiHeartLine size={17} />
              </span>

              <div>
                <p className="font-semibold text-white">
                  Guest-First Service
                </p>

                <p className="mt-0.5 text-xs leading-relaxed text-gray-400">
                  Every staff member helps create a smooth and
                  welcoming restaurant experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Login form */}
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

            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
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
                  autoComplete="email"
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
                    autoComplete="current-password"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-gray-600"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
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
                {submitting
                  ? "Signing in..."
                  : "Sign In"}
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