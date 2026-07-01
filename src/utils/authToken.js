const TOKEN_KEY = "token";
const LEGACY_USER_KEY = "authUser";

/*
  Safely decode a JWT payload.

  This does NOT verify the token signature.
  Frontend decoding is only for UI/route decisions.
  Real security is still enforced by the backend.
*/
export function decodeJwtPayload(token) {
  if (!token || !token.includes(".")) {
    return null;
  }

  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT payload:", error);
    return null;
  }
}

/*
  Check JWT expiry using the exp claim.
*/
export function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 < Date.now();
}

/*
  Store only JWT token.

  We also remove old authUser if it exists from previous versions.
*/
export function saveAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.removeItem(LEGACY_USER_KEY);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
}

/*
  Convert JWT claims into the small current-user object needed by frontend.

  The backend JWT should ideally include:
  - roleName or role
  - branchId for ADMIN/staff branch logic
  - branchName optional
  - passwordChanged optional
*/
export function getCurrentUserFromToken(token = getAuthToken()) {
  const payload = decodeJwtPayload(token);

  if (!payload) {
    return null;
  }

  const roleName =
    payload.roleName ||
    payload.role ||
    payload.authority ||
    payload.authorities?.[0]?.replace("ROLE_", "") ||
    "";

  return {
    id: payload.id || payload.userId || payload.staffId || null,
    email: payload.email || payload.sub || "",
    username: payload.username || payload.sub || "",
    fullName: payload.fullName || payload.name || "",
    roleName,
    branchId: payload.branchId || null,
    branchName: payload.branchName || "",
    passwordChanged: payload.passwordChanged,
    exp: payload.exp,
  };
}

/*
  Decode QR session claims from the session token.
  Returns the claim values, NOT storing them anywhere.
  Use this at point-of-use (e.g., API calls, UI display).
*/
export function getQrSessionClaims(sessionToken) {
  if (!sessionToken) {
    return null;
  }

  const payload = decodeJwtPayload(sessionToken);
  if (!payload) {
    return null;
  }

  return {
    session_id: payload.session_id || null,
    branch_id: payload.branch_id || null,
    table_id: payload.table_id || null,
    qr_id: payload.qr_id || null,
    status: payload.status || null,
    exp: payload.exp || null,
  };
}

/*
  SECURE: Validate customer JWT by checking claims, not just existence.
  
  Returns decoded claims if valid:
  - Token not expired
  - Has 'CUSTOMER' role in roles array
  - Has valid customer ID (sub)
  
  Returns null if invalid, expired, or missing required claims.
  Frontend only—signature verification is backend responsibility.
*/
export function validateCustomerJwt(token) {
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null; // Malformed
  }

  // Check expiry
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    return null; // Expired
  }

  // Check CUSTOMER role exists
  const roles = Array.isArray(payload.roles) ? payload.roles : [];
  if (!roles.includes('CUSTOMER')) {
    return null; // Not a customer token
  }

  // Check customer ID (sub)
  if (!payload.sub) {
    return null; // No customer ID
  }

  return payload; // Valid
}

/*
  SECURE: Validate QR session token by checking claims, not just existence.
  
  Returns decoded claims if valid:
  - Token not expired
  - Has 'session_id' claim
  
  Returns null if invalid, expired, or missing session_id.
  Frontend only—signature verification is backend responsibility.
*/
export function validateQrSessionToken(token) {
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return null; // Malformed
  }

  // Check expiry
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    return null; // Expired
  }

  // Check session_id exists
  if (!payload.session_id) {
    return null; // No session ID
  }

  return payload; // Valid
}

/*
  Central dashboard redirect logic.
*/
export function getDashboardPathByRole(roleName) {
  switch (roleName) {
    case "SUPER_ADMIN":
      return "/staff";

    case "ADMIN":
      return "/admin";

    case "MANAGER":
      return "/manager";

    case "RECEPTIONIST":
      return "/receptionist";

    case "CHEF":
      return "/kitchen";

    case "LINE_CHEF":
      return "/line-chef";

    case "DELIVERY":
      return "/delivery";

    default:
      return "/staff/login";
  }
}