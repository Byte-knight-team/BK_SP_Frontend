import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
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
      setError(err.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl overflow-hidden grid lg:grid-cols-[360px_1fr]">
        <div className="bg-gray-900 text-white p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="w-11 h-11 rounded-xl bg-orange-500 flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 className="font-bold text-white leading-tight">Crave House</h2>
                <p className="text-gray-400 text-xs">Staff Portal</p>
              </div>
            </div>

            <h1 className="text-3xl font-bold mb-3">Staff Login</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Sign in with your staff account to continue to your assigned workspace.
            </p>
          </div>

          <div className="space-y-4 mt-10 text-sm text-gray-400">
            <div>• JWT-protected admin access</div>
            <div>• Branch-aware staff visibility</div>
            <div>• Role and privilege management</div>
          </div>
        </div>

        <div className="p-10 lg:p-12 flex items-center">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome back</h2>
            <p className="text-sm text-gray-500 mb-8">
              Use your staff email and password to continue.
            </p>

            {error && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="you@cravehouse.com"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/25 disabled:opacity-70"
              >
                {submitting ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}