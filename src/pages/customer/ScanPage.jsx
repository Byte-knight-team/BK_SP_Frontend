import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { decodeJwtPayload } from '../../utils/authToken';
import CustomerPageShell from '../../components/customer/CustomerPageShell';
import CustomerStateCard from '../../components/customer/CustomerStateCard';
import { startQrSession } from '../../apis/customer/qrSessions';

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
        const res = await startQrSession({ qr_token: tokenFromUrl });

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

        // Store ONLY the token
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
    <CustomerPageShell maxWidth="max-w-4xl">
      <div className="flex min-h-[70vh] items-center justify-center">
        <CustomerStateCard
          variant={error ? 'error' : 'loading'}
          icon={error ? AlertCircle : undefined}
          title={error ? 'Session unavailable' : 'Starting your table session'}
          description={error || 'Please wait while we open your menu.'}
          className="mx-auto max-w-xl"
        />
      </div>
    </CustomerPageShell>
  );
}