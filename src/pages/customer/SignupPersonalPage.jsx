import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import BrandLogo from '../../components/customer/BrandLogo';
import GlassBackground from '../../components/customer/GlassBackground';
import { signupPersonalSchema } from '../../lib/validations/auth';

export default function SignupPersonalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = new URLSearchParams(location.search);
  const redirectParam = searchParams.get('redirect');
  const redirectTo = redirectParam && !['/login', '/signup', '/signup/address', '/forgot-password', '/reset-password'].includes(redirectParam)
    ? redirectParam
    : '/menu';

  const handleBack = () => {
    navigate(redirectTo);
  };
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupPersonalSchema),
    defaultValues: location.state?.personal || {
      fullName: '',
      email: '',
      phone: '',
      password: '',
    },
  });

  const onSubmit = (data) => {
    navigate(`/signup/address?redirect=${encodeURIComponent(redirectTo)}`, {
      state: {
        personal: data,
        address: location.state?.address,
      },
    });
  };

  return (
    <div className="relative min-h-screen bg-[#f3f1ee] px-4 py-10 overflow-hidden">
      {/* Interactive glassmorphism background */}
      <GlassBackground />

      <div className="relative z-10 mx-auto w-full max-w-[360px]">
        <button
          type="button"
          onClick={handleBack}
          className="mb-5 inline-flex items-center gap-2 text-sm text-slate-700 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 px-6 py-8 text-center text-white flex flex-col justify-center items-center">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-xl pointer-events-none" />
            <div className="absolute -left-6 -bottom-6 h-24 w-24 rounded-full bg-black/10 blur-xl pointer-events-none" />
            <div className="relative z-10 mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xs shrink-0">
              <BrandLogo />
            </div>
            <h1 className="relative z-10 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Create Account</h1>
            <p className="relative z-10 mt-1.5 text-xs sm:text-sm text-orange-50/90 font-medium">Step 1 of 2: Personal Details</p>
          </div>

          <form className="space-y-4 px-6 pb-10 pt-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
              <div className="relative">
                <User size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  {...register('fullName')}
                  placeholder="John Doe"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400"
                />
              </div>
              {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
              <div className="relative">
                <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  {...register('email')}
                  placeholder="your.email@example.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400"
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="07X XXX XXXX"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400"
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="Create a password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-11 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400 focus:bg-white"
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
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-orange-500 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-orange-600"
            >
              Next: Address Details
            </button>

            <p className="pt-2 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link
                to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
                replace
                className="font-semibold text-orange-500 hover:text-orange-600"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}