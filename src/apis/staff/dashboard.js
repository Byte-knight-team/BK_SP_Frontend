// src/apis/staff/dashboard.js

import { authFetch } from "../apiHelper";

const BASE_URL = "http://localhost:8080";

async function parseDashboardResponse(response) {
  if (!response) {
    return null;
  }

  // If authFetch already returns parsed JSON, return it directly.
  if (typeof response.json !== "function") {
    return response;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      error: data?.message || data?.error || "Dashboard request failed.",
      status: response.status,
    };
  }

  return data;
}

export async function getAdminDashboardSummaryAPI() {
  const response = await authFetch(`${BASE_URL}/api/admin/dashboard/summary`);
  return parseDashboardResponse(response);
}

export async function getAdminDashboardRevenueTrendAPI(days = 7) {
  const response = await authFetch(
    `${BASE_URL}/api/admin/dashboard/revenue-trend?days=${days}`
  );
  return parseDashboardResponse(response);
}

export async function getSuperAdminBranchRevenueAPI(days = 7) {
  const response = await authFetch(
    `${BASE_URL}/api/admin/dashboard/superadmin/branch-revenue?days=${days}`
  );
  return parseDashboardResponse(response);
}