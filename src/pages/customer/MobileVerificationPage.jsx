import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Loader2 } from 'lucide-react';
import BrandLogo from '../../components/customer/BrandLogo';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export default function MobileVerificationPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!phone) {
      setError('Please enter a phone number.');
      return;
    }

    // --- STRICT FRONTEND VALIDATION ---
    const phoneRegex = /^07\d{8}$/;
    if (!phoneRegex.test(phone.trim())) {
      setError('Phone number must be exactly 10 digits and start with 07 (e.g., 0712345678).');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/customer/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || 'Failed to send OTP.');
      }

      navigate('/verify-otp', { state: { phone: phone.trim() } });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f3f1ee] px-4 py-10">
      <div className="mx-auto w-full max-w-[360px]">
        <div className="overflow-hidden rounded-3xl bg-white shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
          <div className="bg-orange-500 px-6 py-9 text-center text-white flex flex-col justify-center items-center">
            <BrandLogo />
            <h1 className="mt-3 text-2xl font-bold">Mobile Verification</h1>
            <p className="mt-2 text-sm text-orange-100 px-2">
              Enter your mobile number to get a verification code
            </p>
          </div>

          <form className="space-y-6 px-6 pb-10 pt-8" onSubmit={handleSendOTP}>
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07XXXXXXXX"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-orange-600 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Send OTP Code'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}