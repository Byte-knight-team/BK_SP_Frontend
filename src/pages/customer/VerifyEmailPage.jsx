import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { verifyEmailToken } from '../../apis/customer/profile';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const hasAttemptedVerification = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Verification token is missing from the URL.');
      return;
    }

    // Prevent React 18 strict mode double-firing
    if (hasAttemptedVerification.current) return;
    hasAttemptedVerification.current = true;

    const verifyToken = async () => {
      try {
        const res = await verifyEmailToken(token);
        const payload = await res.json().catch(() => ({}));
        
        if (res.ok) {
          setStatus('success');
          // Automatically redirect after 3 seconds
          setTimeout(() => {
            navigate('/account', { replace: true });
          }, 3000);
        } else {
          setStatus('error');
          setErrorMessage(payload?.message || 'Verification failed. The token may be expired or invalid.');
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage('A network error occurred while verifying your email.');
      }
    };

    verifyToken();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md w-full text-center">
        {status === 'verifying' && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-16 w-16 text-orange-500 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Verifying Email...</h2>
            <p className="text-slate-500">Please wait while we verify your email address.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="h-20 w-20 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Email Verified!</h2>
            <p className="text-slate-500 mb-6">Your email address has been successfully verified.</p>
            <p className="text-sm text-slate-400">Redirecting to your account...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <XCircle className="h-20 w-20 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Verification Failed</h2>
            <p className="text-slate-500 mb-6">{errorMessage}</p>
            <button
              onClick={() => navigate('/account')}
              className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl font-bold transition-all hover:bg-slate-800"
            >
              Return to Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
