import { authFetch, buildApiUrl } from "../apiHelper";

const REPORT_TYPES = new Set([
  "sales",
  "revenue-trend",
  "top-selling-items",
  "order-summary",
  "delivery-performance",
  "reservations",
  "inventory-status",
  "procurement",
  "staff-details",
  "customer-reviews",
]);

/**
 * Fetches an existing backend-generated report without altering the PDF.
 */
export const getReportPdfAPI = async ({
  reportType,
  branchId,
  userId,
  startDate,
  endDate,
}) => {
  if (!REPORT_TYPES.has(reportType)) {
    throw new Error("Please select a valid report type.");
  }

  const searchParams = new URLSearchParams({
    branchId: String(branchId),
    userId: String(userId),
  });

  if (reportType !== "staff-details") {
    if (startDate) searchParams.set("startDate", startDate);
    if (endDate) searchParams.set("endDate", endDate);
  }

  const response = await authFetch(
    buildApiUrl(
      `/api/manager/reports/${reportType}?${searchParams.toString()}`
    ),
    {
      method: "GET",
      headers: {
        Accept: "application/pdf",
      },
    }
  );

  const blob = await response.blob();

  if (!blob.size) {
    throw new Error("The report was generated without PDF content.");
  }

  return blob;
};

/**
 * Fetches the backend's JSON aggregate totals for the selected branch and
 * period. This is separate from the PDF endpoint, which returns binary data.
 */
export const getReportAnalyticsAPI = async ({
  branchId,
  userId,
  startDate,
  endDate,
}) => {
  const searchParams = new URLSearchParams({
    branchId: String(branchId),
    userId: String(userId),
  });

  if (startDate) searchParams.set("startDate", startDate);
  if (endDate) searchParams.set("endDate", endDate);

  const response = await authFetch(
    buildApiUrl(
      `/api/manager/analytics/summary?${searchParams.toString()}`
    ),
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    }
  );

  const result = await response.json();
  return result?.data ?? result;
};
