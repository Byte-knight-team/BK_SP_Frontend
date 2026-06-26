import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ArrowRight, ShieldCheck, CheckCircle, ArrowLeft } from 'lucide-react';
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
    setError('');

    try {
      const res = await resetPasswordCustomer(token, data.password);
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || 'Unable to reset password.');
      }

      setSuccess(true);
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
      
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
          <div className="bg-orange-500 px-6 py-8 text-center text-white flex flex-col justify-center items-center">
            <BrandLogo />
            <h1 className="text-2xl font-bold mt-2">New Password</h1>
            <p className="mt-2 text-sm text-orange-100">Secure your account with a new password</p>
          </div>

          <div className="px-6 py-8">
            {success ? (
              <div className="flex flex-col items-center justify-center text-center space-y-4 py-4">
                <div className="rounded-full bg-green-100 p-4">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Password Reset!</h3>
                <p className="text-sm text-slate-600">
                  Your password has been successfully updated. Redirecting you to the login page...
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
                      type="password"
                      {...register('password')}
                      placeholder="At least 8 characters"
                      className={`w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors ${
                        errors.password ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-orange-400'
                      }`}
                    />
                  </div>
                  {errors.password && <p className="mt-1.5 text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Confirm Password</label>
                  <div className="relative">
                    <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      {...register('confirmPassword')}
                      placeholder="Repeat your password"
                      className={`w-full rounded-xl border bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors ${
                        errors.confirmPassword ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-orange-400'
                      }`}
                    />
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
