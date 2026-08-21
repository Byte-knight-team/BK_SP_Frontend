import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import BrandLogo from '../../components/customer/BrandLogo';
import CustomerPageShell from '../../components/customer/CustomerPageShell';
import { getQrSessionClaims } from '../../utils/authToken';
import { toast } from 'react-toastify';
import { verifyCustomerOtp, sendCustomerOtp } from '../../apis/customer/auth';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function OtpVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || '';
  const redirectTo = location.state?.redirect || '/checkout';

  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);

  // If someone lands here without a phone number, send them back
  useEffect(() => {
    if (!phone) {
      navigate('/signup/qr', { replace: true });
    }
  }, [phone, navigate]);

  // Countdown timer for 60s cooldown
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Auto-focus first input on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, e) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    setError('');

    try {
      const res = await sendCustomerOtp(phone);
      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || 'Failed to resend verification code.');
      }

      toast.success('New verification code sent!');
      setCountdown(60);
      setOtp(['', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsResending(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');

    if (code.length !== 4) return;

    setIsLoading(true);
    setError('');

    try {
      // Decode the current QR session token on-demand.
      const qrSessionToken = localStorage.getItem('qr_session_token');
      const qrClaims = qrSessionToken ? getQrSessionClaims(qrSessionToken) : null;
      const sessionId = qrClaims?.session_id || null;

      const res = await verifyCustomerOtp({ phone, code, sessionId });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || 'Invalid verification code.');
      }

      // Success! Save the JWT token
      const data = payload.data;
      localStorage.setItem('customer_jwt', data.token);
      if (data.username) localStorage.setItem('customer_name', data.username);
      if (data.profilePictureUrl) localStorage.setItem('customer_profile_pic', data.profilePictureUrl);

      toast('Verified successfully!', {
        className: 'toast-orange-auth font-semibold shadow-lg',
        icon: '✅',
      });
      // Redirect directly to checkout to complete their meal!
      navigate(redirectTo, { replace: true });

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CustomerPageShell maxWidth="max-w-4xl" hasGlassBackground>
      <div className="mx-auto w-full max-w-[420px]">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-5 inline-flex items-center gap-2 text-sm text-slate-700 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="overflow-hidden rounded-[2rem] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.10)] border border-slate-100">
          <div className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-orange-500 to-orange-600 px-6 py-8 text-center text-white flex flex-col justify-center items-center">
            <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/15 blur-xl pointer-events-none" />
            <div className="absolute -left-6 -bottom-6 h-24 w-24 rounded-full bg-black/10 blur-xl pointer-events-none" />
            <div className="relative z-10 mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xs shrink-0">
              <BrandLogo />
            </div>
            <h1 className="relative z-10 text-2xl sm:text-3xl font-extrabold tracking-tight text-white">Verify OTP</h1>
            <p className="relative z-10 mt-1.5 text-xs sm:text-sm text-orange-50/90 font-medium px-2">
              We've sent a verification code to
              <br />
              <span className="font-bold text-white tracking-wide">{phone}</span>
            </p>
          </div>

          <form className="space-y-8 px-6 pb-10 pt-8" onSubmit={handleVerify}>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-center leading-snug">
                {error}
              </div>
            )}

            <div className="flex justify-center gap-3">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  ref={(el) => (inputRefs.current[index] = el)}
                  value={data}
                  onChange={(e) => handleChange(index, e)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-14 rounded-xl border border-slate-200 bg-slate-50 text-center text-xl font-bold text-slate-800 outline-none transition-colors focus:border-orange-400 focus:bg-white focus:shadow-[0_0_0_3px_rgba(255,107,53,0.1)]"
                />
              ))}
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-500">
                Didn't receive the code?{' '}
                {countdown > 0 ? (
                  <span className="font-semibold text-slate-400">
                    Resend in <span className="font-mono font-bold text-orange-500">{countdown}s</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResending}
                    className="font-bold text-orange-500 hover:text-orange-600 hover:underline underline-offset-4 decoration-orange-400 px-2 py-0.5 rounded-lg hover:bg-orange-50 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 inline-flex items-center gap-1.5"
                  >
                    {isResending ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <span>Resend Code</span>
                    )}
                  </button>
                )}
              </p>
            </div>

            <button
              type="submit"
              disabled={otp.join('').length < 4 || isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Proceed'}
            </button>
          </form>
        </div>
      </div>
    </CustomerPageShell>
  );
}