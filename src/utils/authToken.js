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
  Central dashboard redirect logic.
*/
export function getDashboardPathByRole(roleName) {
  switch (roleName) {
    case "SUPER_ADMIN":
      return "/staff";

    case "ADMIN":
      return "/admin-panel";

    case "MANAGER":
      return "/manager";

    case "RECEPTIONIST":
      return "/receptionist";

    case "CHEF":
      return "/kitchen";

    case "DELIVERY":
      return "/delivery";

    default:
      return "/staff/login";
  }
}