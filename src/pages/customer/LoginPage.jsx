import { useState } from 'react';
import { Link, useNavigate, useLocation} from 'react-router-dom';
import { ArrowLeft, Mail, Lock} from 'lucide-react';
import BrandLogo from '../../components/customer/BrandLogo';
import { loginCustomer } from '../../apis/customer/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await loginCustomer({
        email: email.trim(),
        password,
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || 'Unable to login.');
      }

      const data = payload.data;

      localStorage.setItem('customer_jwt', data.token);
      if (data.username) localStorage.setItem('customer_name', data.username);
      if (data.profilePictureUrl) localStorage.setItem('customer_profile_pic', data.profilePictureUrl);

      localStorage.removeItem('qr_session');
      localStorage.removeItem('qr_session_token');
      localStorage.removeItem('qr_branch_id');
      localStorage.removeItem('qr_table_id');

      const searchParams = new URLSearchParams(location.search);
      const redirectTo = searchParams.get('redirect') || '/menu';

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f1ee] px-4 py-10">
      <div className="mx-auto w-full max-w-[360px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-sm text-slate-700 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
          <div className="bg-orange-500 px-6 py-9 text-center text-white flex flex-col justify-center items-center">
              <BrandLogo />
            <h1 className="text-3xl font-bold">Welcome Back!</h1>
            <p className="mt-2 text-sm text-orange-100">Sign in to continue ordering</p>
          </div>

          <form className="space-y-5 px-6 pb-10 pt-6" onSubmit={handleLogin}>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-10 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400"
                />
              </div>
            </div>

          {/*<div className="flex items-center justify-between text-sm">
              <button type="button" className="font-medium text-orange-500 hover:text-orange-600">
                Forgot password?
              </button>
            </div>
            */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-orange-500 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Signing In...' : 'Sign In'}
            </button>

            <p className="pt-1 text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold text-orange-500 hover:text-orange-600">
                Create Account
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
