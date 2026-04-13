import { Link } from 'react-router-dom';

export default function SignupCustomer (){
    return (
      <Link to="/signup" className="inline-flex items-center rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600">
        Sign Up
      </Link>
    );
}