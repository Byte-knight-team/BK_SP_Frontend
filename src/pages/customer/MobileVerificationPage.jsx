import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Phone, Loader2 } from 'lucide-react';
import BrandLogo from '../../components/customer/BrandLogo';
import CustomerPageShell from '../../components/customer/CustomerPageShell';
import { sendCustomerOtp } from '../../apis/customer/auth';
import { mobileVerificationSchema } from '../../lib/validations/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function MobileVerificationPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(mobileVerificationSchema),
    defaultValues: {
      phone: '',
    },
  });
  
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirectTo = searchParams.get('redirect') || '/checkout'; // Default QR to checkout

  const onSubmit = async (data) => {
    setError('');

    try {
      const res = await sendCustomerOtp(data.phone.trim());

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || 'Failed to send OTP.');
      }

      navigate("/verify-otp", {
        state: {
          phone: data.phone.trim(),
          redirect: redirectTo, // Pass the baton!
        },
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <CustomerPageShell maxWidth="max-w-4xl" hasGlassBackground>
      <div className="mx-auto w-full max-w-[420px]">
        <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.10)] border border-slate-100">
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 px-6 py-8 text-center text-white flex flex-col justify-center items-center">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-xl pointer-events-none" />
            <div className="absolute -left-6 -bottom-6 h-24 w-24 rounded-full bg-black/10 blur-xl pointer-events-none" />
            <div className="relative z-10 mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xs shrink-0">
              <BrandLogo />
            </div>
            <h1 className="relative z-10 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Mobile Verification</h1>
            <p className="relative z-10 mt-1.5 text-xs sm:text-sm text-orange-50/90 font-medium px-2">
              Enter your mobile number to get a verification code
            </p>
          </div>

          <form className="space-y-6 px-6 pb-10 pt-8" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[0.85rem] text-red-700 text-center leading-snug">
                {error}
              </div>
            )}
            
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  {...register('phone')}
                  placeholder="07XXXXXXXX"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400"
                />
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Send OTP Code'}
            </button>
          </form>
        </div>
      </div>
    </CustomerPageShell>
  );
}