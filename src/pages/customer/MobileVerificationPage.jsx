import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone } from 'lucide-react';
import BrandLogo from '../../components/customer/BrandLogo';

export default function MobileVerificationPage() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');

  const handleSendOTP = (e) => {
    e.preventDefault();
    if (phone) {
      // For now, pass the phone number to the next screen for display context.
      navigate('/verify-otp', { state: { phone } });
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
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Phone Number</label>
              <div className="relative">
                <Phone size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="07X XXX XXXX"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400"
                  required
                />
              </div>
              <p className="mt-2 text-xs text-slate-500">
                You will receive an SMS with a 4-digit code. Message and data rates may apply.
              </p>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-orange-500 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-orange-600"
            >
              Send OTP Code
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
