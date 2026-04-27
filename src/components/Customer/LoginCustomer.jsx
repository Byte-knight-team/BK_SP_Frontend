import { Link } from 'react-router-dom';

export default function LoginCustomer() {
    return (
      <Link to="/login" className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50">
        Login
      </Link>
    );
}