import { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  RiBuildingLine,
  RiCalendarLine,
  RiDownload2Line,
  RiErrorWarningLine,
  RiFileChartLine,
  RiFilePdf2Line,
  RiLoader4Line,
} from "@remixicon/react";

import { getAllBranchesAPI } from "../../apis/staff/branches";
import {
  getReportAnalyticsAPI,
  getReportPdfAPI,
} from "../../apis/staff/reports";
import { useAuth } from "../../context/AuthContext";
import { showErrorToast, showSuccessToast } from "../../utils/toast";

const REPORT_TYPES = [
  { value: "sales", label: "Sales Report" },
  { value: "revenue-trend", label: "Revenue Trend" },
  { value: "top-selling-items", label: "Top Selling Items" },
  { value: "order-summary", label: "Order Summary" },
  { value: "delivery-performance", label: "Delivery Performance" },
  { value: "reservations", label: "Reservations" },
  { value: "inventory-status", label: "Inventory Status" },
  { value: "procurement", label: "Procurement" },
  { value: "staff-details", label: "Staff Details" },
  { value: "customer-reviews", label: "Customer Reviews" },
];

const today = toDateInputValue(new Date());
const thirtyDaysAgo = toDateInputValue(
  new Date(new Date().setDate(new Date().getDate() - 30))
);

export default function ReportsPage() {
  const outletContext = useOutletContext();
  const setHeaderInfo = outletContext?.setHeaderInfo;
  const { user } = useAuth();

  const [branches, setBranches] = useState([]);
  const [branchId, setBranchId] = useState("");
  const [reportType, setReportType] = useState("sales");
  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [branchesLoading, setBranchesLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsError, setAnalyticsError] = useState("");
  const [error, setError] = useState("");
  const [generatedReport, setGeneratedReport] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const isStaffDetails = reportType === "staff-details";
  const currentUserId = user?.id;

  const sortedBranches = useMemo(
    () =>
      [...branches].sort((first, second) =>
        getBranchName(first).localeCompare(getBranchName(second))
      ),
    [branches]
  );

  const selectedBranch = useMemo(
    () =>
      sortedBranches.find(
        (branch) => String(getBranchId(branch)) === String(branchId)
      ) || null,
    [branchId, sortedBranches]
  );

  const canGenerate =
    !branchesLoading &&
    !generating &&
    Boolean(branchId) &&
    Boolean(currentUserId) &&
    (isStaffDetails ||
      (Boolean(startDate) && Boolean(endDate) && startDate <= endDate));

  useEffect(() => {
    if (setHeaderInfo) {
      setHeaderInfo({
        title: "Reports",
        description:
          "Generate and download branch-level operational reports.",
        Icon: RiFileChartLine,
      });
    }

    return () => {
      if (setHeaderInfo) setHeaderInfo(null);
    };
  }, [setHeaderInfo]);

  useEffect(() => {
    let active = true;

    const loadBranches = async () => {
      try {
        setBranchesLoading(true);
        setError("");

        const response = await getAllBranchesAPI();

        if (response?.error) {
          throw new Error(response.error);
        }

        const branchList = normalizeBranchList(response);

        if (active) {
          setBranches(branchList);
        }
      } catch (loadError) {
        const message = loadError?.message || "Failed to load branches.";

        if (active) {
          setBranches([]);
          setError(message);
          showErrorToast(message);
        }
      } finally {
        if (active) setBranchesLoading(false);
      }
    };

    loadBranches();

    return () => {
      active = false;
    };
  }, []);

  const handleGenerate = async (event) => {
    event.preventDefault();

    const validationError = validateForm({
      branchId,
      currentUserId,
      isStaffDetails,
      startDate,
      endDate,
    });

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setGenerating(true);
      setAnalyticsLoading(true);
      setAnalyticsError("");
      setError("");
      setAnalytics(null);
      setGeneratedReport(null);

      const reportAnalytics = await getReportAnalyticsAPI({
        branchId,
        userId: currentUserId,
        startDate: isStaffDetails ? undefined : startDate,
        endDate: isStaffDetails ? undefined : endDate,
      });
      const filename = buildFilename({
        reportType,
        branchId,
        startDate,
        endDate,
      });

      setAnalytics(reportAnalytics);
      setGeneratedReport({
        reportType,
        branchId,
        userId: currentUserId,
        startDate,
        endDate,
        filename,
        branchName: getBranchName(selectedBranch),
        periodLabel: isStaffDetails
          ? "Last 30 days"
          : `${startDate} to ${endDate}`,
      });

      showSuccessToast("Report generated successfully.");
    } catch (generateError) {
      const message =
        generateError?.message || "Failed to generate the selected report.";

      setAnalytics(null);
      setGeneratedReport(null);
      setAnalyticsError(message);
      setError(message);
      showErrorToast(message);
    } finally {
      setGenerating(false);
      setAnalyticsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedReport) return;

    try {
      setDownloading(true);
      setError("");

      const blob = await getReportPdfAPI(generatedReport);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = generatedReport.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      showSuccessToast("Report download started.");
    } catch (downloadError) {
      const message = downloadError?.message || "Failed to download the report.";

      setError(message);
      showErrorToast(message);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-6 flex items-start gap-3">
          <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
            <RiFileChartLine size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Generate report</h2>
            <p className="mt-1 text-sm text-gray-500">
              Select the report options to view its totals, then download the PDF if needed.
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <FormField
              label="Branch"
              htmlFor="report-branch"
              icon={<RiBuildingLine size={17} className="text-gray-400" />}
            >
              <select
                id="report-branch"
                value={branchId}
                onChange={(event) => setBranchId(event.target.value)}
                disabled={branchesLoading}
                className={inputClassName}
              >
                <option value="">
                  {branchesLoading ? "Loading branches..." : "Select a branch"}
                </option>
                {sortedBranches.map((branch) => (
                  <option key={getBranchId(branch)} value={getBranchId(branch)}>
                    {getBranchName(branch)}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField
              label="Report type"
              htmlFor="report-type"
              icon={<RiFilePdf2Line size={17} className="text-gray-400" />}
            >
              <select
                id="report-type"
                value={reportType}
                onChange={(event) => setReportType(event.target.value)}
                className={inputClassName}
              >
                {REPORT_TYPES.map((report) => (
                  <option key={report.value} value={report.value}>
                    {report.label}
                  </option>
                ))}
              </select>
            </FormField>

            {!isStaffDetails && (
              <>
                <FormField
                  label="Start date"
                  htmlFor="report-start-date"
                  icon={<RiCalendarLine size={17} className="text-gray-400" />}
                >
                  <input
                    id="report-start-date"
                    type="date"
                    value={startDate}
                    max={endDate || today}
                    onChange={(event) => setStartDate(event.target.value)}
                    className={inputClassName}
                  />
                </FormField>

                <FormField
                  label="End date"
                  htmlFor="report-end-date"
                  icon={<RiCalendarLine size={17} className="text-gray-400" />}
                >
                  <input
                    id="report-end-date"
                    type="date"
                    value={endDate}
                    min={startDate || undefined}
                    max={today}
                    onChange={(event) => setEndDate(event.target.value)}
                    className={inputClassName}
                  />
                </FormField>
              </>
            )}
          </div>

          {isStaffDetails && (
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Staff Details is a current branch snapshot and does not require a date range.
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <RiErrorWarningLine className="mt-0.5 shrink-0" size={18} />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!canGenerate}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {generating ? (
                <RiLoader4Line className="animate-spin" size={18} />
              ) : (
                <RiFilePdf2Line size={18} />
              )}
              {generating ? "Generating..." : "Generate Report"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold text-gray-900">Report Summary</h2>
          <p className="mt-1 text-sm text-gray-500">
            {generatedReport
              ? `${generatedReport.branchName} - ${generatedReport.periodLabel}`
              : "Generate a report to view key metrics for the selected branch."}
          </p>
        </div>

        {analyticsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Loading report totals">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-28 animate-pulse rounded-2xl bg-gray-100" />
            ))}
          </div>
        ) : analytics ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <TotalCard
              label="Net Revenue"
              value={formatCurrency(analytics.netRevenue)}
              description="Paid revenue in the selected period"
              accentClass="bg-orange-50 text-orange-700"
            />
            <TotalCard
              label="Total Orders"
              value={formatNumber(analytics.orderCount)}
              description="Completed orders in the selected period"
              accentClass="bg-blue-50 text-blue-700"
            />
            <TotalCard
              label="Average Preparation"
              value={`${Number(analytics.avgPrepTimeMinutes || 0).toFixed(1)} min`}
              description="Average kitchen preparation time"
              accentClass="bg-emerald-50 text-emerald-700"
            />
            <TotalCard
              label="Inventory Value"
              value={formatCurrency(analytics.totalInventoryValue)}
              description="Current total stock value"
              accentClass="bg-amber-50 text-amber-700"
            />
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-5 py-8 text-center text-sm text-gray-500">
            {analyticsError || "No totals loaded yet."}
          </div>
        )}
        {generatedReport && (
          <div className="mt-5 flex justify-end border-t border-gray-100 pt-5">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              {downloading ? (
                <RiLoader4Line className="animate-spin" size={18} />
              ) : (
                <RiDownload2Line size={18} />
              )}
              {downloading ? "Preparing download..." : "Download Report"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

const inputClassName =
  "h-11 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 text-sm text-gray-800 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400";

function FormField({ label, htmlFor, icon, children }) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"
      >
        {icon}
        {label}
      </label>
      {children}
    </div>
  );
}

function TotalCard({ label, value, description, accentClass }) {
  return (
    <article className={`rounded-2xl px-5 py-4 ${accentClass}`}>
      <p className="text-xs font-bold uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs opacity-70">{description}</p>
    </article>
  );
}

function validateForm({
  branchId,
  currentUserId,
  isStaffDetails,
  startDate,
  endDate,
}) {
  if (!branchId) return "Please select a branch.";
  if (!currentUserId) return "The logged-in Super Admin user ID is unavailable.";

  if (!isStaffDetails) {
    if (!startDate || !endDate) return "Please select both report dates.";
    if (startDate > endDate) return "Start date cannot be after end date.";
  }

  return "";
}

function normalizeBranchList(response) {
  const value = response?.data ?? response;

  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.branches)) return value.branches;
  if (Array.isArray(value?.content)) return value.content;

  return [];
}

function getBranchId(branch) {
  return branch?.id ?? branch?.branchId ?? "";
}

function getBranchName(branch) {
  return branch?.name || branch?.branchName || "Unnamed branch";
}

function buildFilename({ reportType, branchId, startDate, endDate }) {
  if (reportType === "staff-details") {
    return `staff-details-branch-${branchId}.pdf`;
  }

  return `${reportType}-report-branch-${branchId}-${startDate}-to-${endDate}.pdf`;
}

function formatCurrency(value) {
  return `Rs. ${Number(value || 0).toLocaleString("en-LK", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-LK");
}

function toDateInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}
