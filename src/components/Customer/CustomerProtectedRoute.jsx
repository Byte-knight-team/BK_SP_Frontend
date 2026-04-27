import { Navigate, useLocation } from 'react-router-dom';
import { isTokenExpired } from '../../utils/authToken';

export default function CustomerProtectedRoute({
  children,
  requireCustomerJwt = false,
  allowQrSession = false,
  unauthenticatedRedirect = '/menu',
  qrOnlyRedirect,
}) {
  const location = useLocation();

  const customerJwt = localStorage.getItem('customer_jwt');
  const qrSessionToken = localStorage.getItem('qr_session_token');

  const hasCustomerJwt = Boolean(customerJwt) && !isTokenExpired(customerJwt);
  const hasQrSession = Boolean(qrSessionToken) && !isTokenExpired(qrSessionToken);

  // Customer-only pages like Account, Payment, Order Confirmation.
  if (requireCustomerJwt) {
    if (hasCustomerJwt) {
      return children;
    }

    // Special case: user is in QR session but not linked/logged in yet.
    if (hasQrSession && qrOnlyRedirect) {
      return <Navigate to={qrOnlyRedirect} replace />;
    }

    return <Navigate to={unauthenticatedRedirect} replace state={{ from: location }} />;
  }

  // Pages that can be accessed by either a logged-in customer OR active QR session.
  if (allowQrSession) {
    if (hasCustomerJwt || hasQrSession) {
      return children;
    }

    return <Navigate to={unauthenticatedRedirect} replace state={{ from: location }} />;
  }

  return children;
}
