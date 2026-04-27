import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { decodeJwtPayload } from '../../utils/authToken';
import { customerApiFetch } from '../../apis/apiHelper';

export default function ScanPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();

  const startAttemptedRef = useRef(false);

  const tokenFromUrl = (() => {
    const queryParams = new URLSearchParams(location.search);
    return (
      params.qrToken ||
      queryParams.get('qr_token') ||
      queryParams.get('token') ||
      ''
    ).trim();
  })();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const toValidNumber = (value) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
  };

  useEffect(() => {
    if (startAttemptedRef.current) {
      return;
    }

    if (!tokenFromUrl) {
      setError('Missing QR token. Please scan the table QR again.');
      setIsLoading(false);
      return;
    }

    startAttemptedRef.current = true;

    const startSession = async () => {
      try {
        const res = await customerApiFetch('/api/v1/qr-sessions/start', {
          method: 'POST',
          body: JSON.stringify({ qr_token: tokenFromUrl }),
        });

        const payload = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(payload?.message || 'Unable to start QR session.');
        }

        const data = payload.data;
        if (!data?.session_token) {
          throw new Error('QR session response is missing session token.');
        }

        const claims = decodeJwtPayload(data.session_token) || {};
        const sessionId = toValidNumber(claims.session_id);
        const branchId = toValidNumber(claims.branch_id);
        const tableId = toValidNumber(claims.table_id);

        if (!sessionId || !branchId || !tableId) {
          throw new Error('QR session token is missing required claims.');
        }

        // Wipe old auth when starting QR session
        localStorage.removeItem('customer_jwt');
        localStorage.removeItem('customer_user_id');
        localStorage.removeItem('customer_name');

        // Store ONLY the token, never store decoded IDs
        localStorage.setItem('qr_session_token', data.session_token);
        // Remove legacy keys if they exist
        localStorage.removeItem('qr_session');
        localStorage.removeItem('qr_branch_id');
        localStorage.removeItem('qr_table_id');

        navigate('/menu', { replace: true });
      } catch (err) {
        setError(err.message || 'Unable to start QR session.');
        setIsLoading(false);
      }
    };

    startSession();
  }, [navigate, tokenFromUrl]);

  return (
    <div className="min-h-screen bg-[#f3f1ee] px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-[420px] rounded-3xl bg-white px-6 py-10 text-center shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg shadow-orange-500/25">
          <Loader2 size={28} className={isLoading ? 'animate-spin' : ''} />
        </div>

        <h1 className="mt-5 text-2xl font-bold text-slate-900">
          {error ? 'Session unavailable' : 'Starting your table session'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {error || 'Please wait while we open your menu.'}
        </p>
      </div>
    </div>
  );
}