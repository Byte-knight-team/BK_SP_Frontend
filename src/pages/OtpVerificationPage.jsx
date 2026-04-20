import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import BrandLogo from '../components/Customer/BrandLogo';

export default function OtpVerificationPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || 'your number';

  const [otp, setOtp] = useState(['', '', '', '']);
  const inputRefs = useRef([]);

  // Auto-focus first input on load
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, e) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    // Keep only the last character (if they paste or type fast)
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    // Auto-focus next input if a digit was entered
    if (value && index < 3 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Auto-focus previous input on backspace if current field is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length === 4) {
      // In reality, you'd send this to the server to verify.
      // For now, simulate success and navigate to menu.
      navigate('/menu');
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
                <button type="button" className="font-semibold text-orange-500 hover:text-orange-600 transition-colors">
                  Resend Code
                </button>
              </p>
            </div>

            <button
              type="submit"
              disabled={otp.join('').length < 4}
              className="w-full rounded-xl bg-orange-500 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Verify & Proceed
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
