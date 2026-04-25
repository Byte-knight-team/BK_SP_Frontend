import { authFetch } from "../apiHelper";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const STATS_ENDPOINTS = [
  `${API_BASE}/api/admin/dashboard/stats`,
  `${API_BASE}/api/admin/dashboard`,
  `${API_BASE}/api/admin/stats`,
];

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeStats = (payload = {}) => {
  const body = payload?.data ?? payload ?? {};

  return {
    totalRevenue: toNumber(body?.totalRevenue ?? body?.revenue ?? body?.total_revenue),
    totalOrders: toNumber(body?.totalOrders ?? body?.orders ?? body?.total_orders),
    activeUsers: toNumber(body?.activeUsers ?? body?.users ?? body?.active_users),
    activeOrderCount: toNumber(
      body?.activeOrderCount ?? body?.activeOrders ?? body?.active_order_count,
    ),
  };
};

export const getAdminDashboardStatsAPI = async () => {
  let lastError = null;

  for (const endpoint of STATS_ENDPOINTS) {
    try {
      const response = await authFetch(endpoint);

      if (!response.ok) {
        lastError = new Error(`Request failed with status ${response.status}`);
        continue;
      }

      const payload = await response.json().catch(() => ({}));
      return { data: normalizeStats(payload), error: null };
    } catch (error) {
      lastError = error;
    }
  }

  return { data: null, error: lastError || new Error("Unable to load admin dashboard stats") };
};
