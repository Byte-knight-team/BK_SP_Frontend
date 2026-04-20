import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, MapPin, Hash, Home } from 'lucide-react';
import BrandLogo from '../../components/customer/BrandLogo';

export default function SignupAddressPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [address, setAddress] = useState({
    line1: '',
    city: '',
    postalCode: '',
  });

  const personal = location.state?.personal;

  const handleChange = (field) => (e) => {
    setAddress((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f3f1ee] px-4 py-10">
      <div className="mx-auto w-full max-w-[380px]">
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
            <h1 className="mt-3 text-3xl font-bold">Address Details</h1>
            <p className="mt-2 text-sm text-orange-100">Step 2 of 2 - Complete Registration</p>
          </div>

          <form className="space-y-4 px-6 pb-8 pt-6" onSubmit={handleConfirm}>
            {personal?.fullName && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                Registering as <span className="font-semibold text-slate-800">{personal.fullName}</span>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Address Line</label>
              <div className="relative">
                <Home size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={address.line1}
                  onChange={handleChange('line1')}
                  placeholder="House no, street name"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
              <div className="relative">
                <Building2 size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={address.city}
                  onChange={handleChange('city')}
                  placeholder="Enter your city"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Postal Code</label>
              <div className="relative">
                <Hash size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={address.postalCode}
                  onChange={handleChange('postalCode')}
                  placeholder="e.g. 10100"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400"
                  required
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 flex items-center gap-2">
              <MapPin size={15} className="text-slate-400" />
              We use this address for deliveries and account profile.
            </div>

            <button
              type="submit"
              className="mt-2 w-full rounded-xl bg-orange-500 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-orange-600"
            >
              Confirm Address
            </button>

            <p className="pt-1 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-orange-500 hover:text-orange-600">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
