const TOKEN_KEY = "token";
const USER_KEY = "authUser";

/*
  Safely decode a JWT payload.

  Frontend decoding is only used for UI and routing.
  Real JWT validation/security is performed by the backend.
*/
export function decodeJwtPayload(token) {
  if (!token || !token.includes(".")) {
    return null;
  }

  try {
    const base64Url = token.split(".")[1];

    const base64 = base64Url
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(
          (char) =>
            `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`
        )
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Failed to decode JWT payload:", error);
    return null;
  }
}

/*
  Normalize backend role values.

  Examples:
  SUPER_ADMIN      -> SUPER_ADMIN
  ROLE_SUPER_ADMIN -> SUPER_ADMIN
  line_chef        -> LINE_CHEF
*/
export function normalizeStaffRole(roleName) {
  const normalized = String(roleName || "")
    .trim()
    .toUpperCase();

  if (normalized.startsWith("ROLE_")) {
    return normalized.substring(5);
  }

  return normalized;
}

/*
  Check JWT expiry.
*/
export function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);

  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 < Date.now();
}

/*
  Store staff JWT.
*/
export function saveAuthToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/*
  Store lightweight user information used by the frontend UI.
*/
export function saveAuthUser(user) {
  if (!user) {
    localStorage.removeItem(USER_KEY);
    return;
  }

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(user)
  );
}

/*
  Restore lightweight authenticated user.
*/
export function getSavedAuthUser() {
  try {
    const saved = localStorage.getItem(USER_KEY);

    return saved
      ? JSON.parse(saved)
      : null;
  } catch (error) {
    console.error(
      "Failed to restore saved auth user:",
      error
    );

    return null;
  }
}

/*
  Clear complete staff authentication state.
*/
export function clearAuthStorage() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/*
  Convert JWT claims into the small user object
  required by the frontend.
*/
export function getCurrentUserFromToken(
  token = getAuthToken()
) {
  const payload = decodeJwtPayload(token);

  if (!payload) {
    return null;
  }

  const rawRole =
    payload.roleName ||
    payload.role ||
    payload.authority ||
    payload.authorities?.[0] ||
    "";

  const roleName = normalizeStaffRole(rawRole);

  return {
    id:
      payload.id ||
      payload.userId ||
      payload.staffId ||
      null,

    email:
      payload.email ||
      payload.sub ||
      "",

    username:
      payload.username ||
      payload.preferred_username ||
      "",

    fullName:
      payload.fullName ||
      payload.name ||
      "",

    roleName,

    branchId:
      payload.branchId ||
      null,

    branchName:
      payload.branchName ||
      "",

    passwordChanged:
      payload.passwordChanged,

    exp:
      payload.exp,
  };
}

/*
  Decode QR session claims.
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
    table_number: payload.table_number || null,
    qr_id: payload.qr_id || null,
    status: payload.status || null,
    exp: payload.exp || null,
  };
}

/*
  Validate customer JWT claims.
*/
export function validateCustomerJwt(token) {
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);

  if (!payload) {
    return null;
  }

  if (
    payload.exp &&
    payload.exp * 1000 < Date.now()
  ) {
    return null;
  }

  const roles =
    Array.isArray(payload.roles)
      ? payload.roles
      : [];

  if (!roles.includes("CUSTOMER")) {
    return null;
  }

  if (!payload.sub) {
    return null;
  }

  return payload;
}

/*
  Validate QR session token.
*/
export function validateQrSessionToken(token) {
  if (!token) {
    return null;
  }

  const payload = decodeJwtPayload(token);

  if (!payload) {
    return null;
  }

  if (
    payload.exp &&
    payload.exp * 1000 < Date.now()
  ) {
    return null;
  }

  if (!payload.session_id) {
    return null;
  }

  return payload;
}

/*
  Central WEB staff dashboard redirect logic.

  DELIVERY is intentionally not included because
  delivery personnel use the Delivery mobile application,
  not the web staff dashboard.
*/
export function getDashboardPathByRole(roleName) {
  const role = normalizeStaffRole(roleName);

  switch (role) {
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

    default:
      return "/staff/login";
  }
}