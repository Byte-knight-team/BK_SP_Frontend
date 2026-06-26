import { Navigate, useLocation } from 'react-router-dom';
import { validateCustomerJwt, validateQrSessionToken } from '../../utils/authToken';

/**
 * SECURE CUSTOMER ROUTE PROTECTION
 * 
 * Decodes and validates JWT claims.
 * 
 * Security checks:
 * - For customer_jwt: Verifies 'CUSTOMER' role in claims, token not expired
 * - For qr_session_token: Verifies 'session_id' claim exists, token not expired
 * - Rejects manually-inserted fake tokens (missing required claims)
 * 
 * Props:
 *   requireCustomerJwt: if true, requires valid customer JWT (full login)
 *   allowQrSession: if true, allows QR session as alternative
 *   unauthenticatedRedirect: redirect URL if no valid token
 *   qrOnlyRedirect: redirect if only QR session but full login required
 */
export default function CustomerProtectedRoute({
  children,
  requireCustomerJwt = false,
  allowQrSession = false,
  unauthenticatedRedirect = '/menu',
  qrOnlyRedirect,
}) {
  const location = useLocation();

  const customerJwtRaw = localStorage.getItem('customer_jwt');
  const qrSessionTokenRaw = localStorage.getItem('qr_session_token');

  // SECURE: Validate tokens by decoding and checking claims
  const customerJwtValid = validateCustomerJwt(customerJwtRaw);
  const qrSessionValid = validateQrSessionToken(qrSessionTokenRaw);

  // Customer-only pages like Account, Payment, Order Confirmation.
  if (requireCustomerJwt) {
    if (customerJwtValid) {
      return children;
    }

    // Special case: user is in QR session but not linked/logged in yet.
    if (qrSessionValid && qrOnlyRedirect) {
      return <Navigate to={qrOnlyRedirect} replace />;
    }

    return <Navigate to={unauthenticatedRedirect} replace state={{ from: location }} />;
  }

  // Pages that can be accessed by either a logged-in customer OR active QR session.
  if (allowQrSession) {
    if (customerJwtValid || qrSessionValid) {
      return children;
    }

    return <Navigate to={unauthenticatedRedirect} replace state={{ from: location }} />;
  }

  return children;
}
