import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ArrowRight, ShieldCheck, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { resetPasswordSchema } from '../../lib/validations/auth';
import { resetPasswordCustomer } from '../../apis/customer/auth';
import BrandLogo from '../../components/customer/BrandLogo';
import GlassBackground from '../../components/customer/GlassBackground';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setError('Invalid or missing password reset token.');
    }
  }, [token]);

  const onSubmit = async (data) => {
    if (!token) {
      setError('Missing reset token.');
      return;
    }

    try {
      setError('');
      const res = await resetPasswordCustomer(token, data.password);
      
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload?.message || 'Failed to reset password. Token might be expired.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Unable to reset password.');
    }
  };

  if (!token) {
    return (
      <div className="relative min-h-screen bg-[#f3f1ee] px-4 py-10 flex items-center justify-center">
        <GlassBackground />
        <div className="relative z-10 w-full max-w-[380px] bg-white p-8 rounded-3xl shadow-xl text-center">
          <div className="rounded-full bg-red-100 p-4 inline-block mb-4">
            <Lock className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Invalid Link</h2>
          <p className="text-slate-600 mb-6">The password reset link is invalid or missing the token parameter.</p>
          <button
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-orange-500 hover:text-orange-600"
          >
            <ArrowLeft size={16} /> Return to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#f3f1ee] px-4 py-10 overflow-hidden">
      <GlassBackground />

      <div className="relative z-10 mx-auto w-full max-w-[380px]">
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 px-6 py-8 text-center text-white flex flex-col justify-center items-center">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-xl pointer-events-none" />
            <div className="absolute -left-6 -bottom-6 h-24 w-24 rounded-full bg-black/10 blur-xl pointer-events-none" />
            <div className="relative z-10 mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xs shrink-0">
              <BrandLogo />
            </div>
            <h1 className="relative z-10 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">New Password</h1>
            <p className="relative z-10 mt-1.5 text-xs sm:text-sm text-orange-50/90 font-medium">Secure your account with a new password</p>
          </div>

          <div className="px-6 py-8">
            {success ? (
              <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
                <div className="rounded-full bg-green-100 p-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Password Reset!</h3>
                <p className="text-sm text-slate-600">
                  Your password has been successfully updated.
                </p>
                <button
                  onClick={() => navigate('/login', { replace: true })}
                  className="mt-4 text-orange-500 font-semibold hover:text-orange-600"
                >
                  Go to Login Now
                </button>
              </div>
            ) : (
              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">New Password</label>
                  <div className="relative">
                    <ShieldCheck size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      placeholder="At least 8 characters"
                      className={`w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-11 text-sm text-slate-700 outline-none transition-colors ${
                        errors.password ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-orange-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none p-0.5"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
                  <div className="relative">
                    <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      {...register('confirmPassword')}
                      placeholder="Repeat your password"
                      className={`w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-11 text-sm text-slate-700 outline-none transition-colors ${
                        errors.confirmPassword ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-orange-400'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none p-0.5"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs text-red-500">{errors.confirmPassword.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70 mt-2"
                >
                  {isSubmitting ? 'Updating...' : 'Update Password'}
                  {!isSubmitting && <ArrowRight size={18} />}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
