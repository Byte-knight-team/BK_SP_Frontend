import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';
import BrandLogo from '../../components/customer/BrandLogo';
import GlassBackground from '../../components/customer/GlassBackground';
import { forgotPasswordCustomer } from '../../apis/customer/auth';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const redirectParam = searchParams.get('redirect');
  const redirectTo = redirectParam && !['/login', '/signup', '/signup/address', '/forgot-password', '/reset-password'].includes(redirectParam)
    ? redirectParam
    : '/menu';

  const handleBack = () => {
    navigate(redirectTo ? `/login?redirect=${encodeURIComponent(redirectTo)}` : '/login', { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await forgotPasswordCustomer(email.trim());
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || 'Unable to send password reset link.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Unable to send password reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f3f1ee] px-4 py-10 overflow-hidden">
      {/* Interactive glassmorphism background */}
      <GlassBackground />

      <div className="relative z-10 mx-auto w-full max-w-[380px]">
        <button
          type="button"
          onClick={handleBack}
          className="mb-5 inline-flex items-center gap-2 text-sm text-slate-700 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Login
        </button>

        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 px-6 py-8 text-center text-white flex flex-col justify-center items-center">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-xl pointer-events-none" />
            <div className="absolute -left-6 -bottom-6 h-24 w-24 rounded-full bg-black/10 blur-xl pointer-events-none" />
            <div className="relative z-10 mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xs shrink-0">
              <BrandLogo />
            </div>
            <h1 className="relative z-10 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Reset Password</h1>
            <p className="relative z-10 mt-1.5 text-xs sm:text-sm text-orange-50/90 font-medium">Enter your email to receive a reset link</p>
          </div>

          <div className="px-6 py-8">
            {success ? (
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <div className="rounded-full bg-green-100 p-3">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">Check Your Email</h3>
                <p className="text-sm text-slate-600">
                  If an account exists for <span className="font-medium text-slate-900">{email}</span>, 
                  you will receive a password reset link shortly.
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="mt-4 w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit}>
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

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-xl bg-orange-500 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Sending Link...' : 'Send Reset Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
