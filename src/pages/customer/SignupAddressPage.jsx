import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Building2, MapPin, Hash, Home } from 'lucide-react';
import BrandLogo from '../../components/customer/BrandLogo';
import { registerCustomer } from '../../apis/customer/auth';
import GlassBackground from '../../components/customer/GlassBackground';
import { signupAddressSchema } from '../../lib/validations/auth';

export default function SignupAddressPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(signupAddressSchema),
    defaultValues: {
      line1: '',
      city: '',
      postalCode: '',
    },
  });
  
  const [error, setError] = useState('');

  const redirectTo = location.state?.redirect || '/menu';
  const personal = location.state?.personal;

  const onSubmit = async (data) => {
    if (!personal?.fullName || !personal?.email || !personal?.phone || !personal?.password) {
      setError('Please complete the personal details step first.');
      return;
    }

    const fullAddress = [data.line1, data.city, data.postalCode]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(', ');

    setError('');

    try {
      const res = await registerCustomer({
        username: personal.fullName.trim(),
        email: personal.email.trim(),
        phone: personal.phone.trim(),
        password: personal.password,
        address: fullAddress,
      });

      const payload = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(payload?.message || 'Unable to register.');
      }

      const data = payload.data;

      localStorage.setItem('customer_jwt', data.token);
      localStorage.setItem('customer_name', personal.fullName.trim());

      localStorage.removeItem('qr_session');
      localStorage.removeItem('qr_session_token');
      localStorage.removeItem('qr_branch_id');
      localStorage.removeItem('qr_table_id');

      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Unable to register.');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#f3f1ee] px-4 py-10 overflow-hidden">
      <GlassBackground />
      <div className="relative z-10 mx-auto w-full max-w-[380px]">
        <button
          type="button"
          onClick={() => navigate('/signup', { state: { personal } })}
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

          <form className="space-y-4 px-6 pb-8 pt-6" onSubmit={handleSubmit(onSubmit)}>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
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
                  {...register('line1')}
                  placeholder="House no, street name"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400"
                />
              </div>
              {errors.line1 && <p className="mt-1 text-xs text-red-600">{errors.line1.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">City</label>
              <div className="relative">
                <Building2 size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  {...register('city')}
                  placeholder="Enter your city"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400"
                />
              </div>
              {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Postal Code</label>
              <div className="relative">
                <Hash size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  {...register('postalCode')}
                  placeholder="e.g. 10100"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors focus:border-orange-400"
                />
              </div>
              {errors.postalCode && <p className="mt-1 text-xs text-red-600">{errors.postalCode.message}</p>}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 flex items-center gap-2">
              <MapPin size={15} className="text-slate-400" />
              We use this address for deliveries and account profile.
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full rounded-xl bg-orange-500 py-3 text-base font-bold text-white shadow-md transition-colors hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? 'Registering...' : 'Confirm Address'}
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
