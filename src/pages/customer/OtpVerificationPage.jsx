import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import BrandLogo from '../../components/customer/BrandLogo';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function OtpVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || '';
  const redirectTo = location.state?.redirect || '/checkout';

  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // If someone lands here without a phone number, send them back
  useEffect(() => {
    if (!phone) {
      navigate('/signup/qr', { replace: true });
    }
  }, [phone, navigate]);

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

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    
    if (code.length !== 4) return;

    setIsLoading(true);
    setError('');

    try {
      // 1. Grab the Session ID from localStorage (Saved by ScanPage)
      const qrSessionData = JSON.parse(localStorage.getItem('qr_session') || '{}');
      const sessionId = qrSessionData.sessionId || null;
      
      const res = await fetch(`${API_BASE}/api/v1/auth/customer/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, sessionId}),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || 'Invalid verification code.');
      }

      // Success! Save the JWT token
      const data = payload.data;
      localStorage.setItem('customer_jwt', data.token);

      // Redirect directly to checkout to complete their meal!
      navigate(redirectTo, { replace: true });
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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
            <h1 className="mt-3 text-2xl font-bold">Verify OTP</h1>
            <p className="mt-2 text-sm text-orange-100 px-2 opacity-90">
              We've sent a verification code to
              <br />
              <span className="font-semibold text-white tracking-wide">{phone}</span>
            </p>
          </div>

          <form className="space-y-8 px-6 pb-10 pt-8" onSubmit={handleVerify}>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 text-center">
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
                <button type="button" onClick={() => navigate(-1)} className="font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                  Resend Code
                </button>
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
    </div>
  );
}