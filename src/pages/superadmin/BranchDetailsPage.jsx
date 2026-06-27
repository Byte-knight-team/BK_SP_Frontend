import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import {
  RiBuilding2Line,
  RiArrowLeftLine,
  RiEditLine,
  RiErrorWarningLine,
  RiShieldUserLine,
  RiMoneyDollarCircleLine,
  RiTimerFlashLine,
  RiShoppingBag3Line,
  RiBarChartBoxLine,
  RiMapPinLine,
  RiMailLine,
  RiPhoneLine,
  RiCalendarLine,
  RiRefreshLine,
} from "@remixicon/react";

import {
  getBranchByIdAPI,
  activateBranchAPI,
  deactivateBranchAPI,
} from "../../apis/staff/branches";

import { getBranchConfigAPI } from "../../apis/staff/systemConfig";
import { getSuperAdminBranchRevenueAPI } from "../../apis/staff/dashboard";

import { useAuth } from "../../context/AuthContext";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

const DEFAULT_BRANCH_CONFIG = {
  deliveryFee: "",
  deliveryEnabled: false,
  pickupEnabled: false,
  dineInEnabled: false,
  branchActiveForOrders: false,
};

const DEFAULT_BRANCH_REVENUE = {
  periodRevenue: 0,
  periodOrderCount: 0,
  todayRevenue: 0,
  todayOrderCount: 0,
  averageOrderValue: 0,
};

export default function BranchDetailsPage() {
  const { id } = useParams();
  const { setHeaderInfo } = useOutletContext();

  const [branch, setBranch] = useState(null);
  const [branchConfig, setBranchConfig] = useState(DEFAULT_BRANCH_CONFIG);
  const [branchRevenue, setBranchRevenue] = useState(DEFAULT_BRANCH_REVENUE);

  const [loading, setLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(false);
  const [revenueLoading, setRevenueLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [pageError, setPageError] = useState("");
  const [configError, setConfigError] = useState("");
  const [revenueError, setRevenueError] = useState("");

  const { user } = useAuth();

  const loggedInRole = user?.roleName || user?.role || "";
  const isSuperAdmin = loggedInRole === "SUPER_ADMIN";

  useEffect(() => {
    setHeaderInfo({
      title: "Branch Details",
      description: "View branch information, revenue, and order configuration.",
      Icon: RiBuilding2Line,
    });

    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  const loadBranchConfig = useCallback(async () => {
    setConfigLoading(true);
    setConfigError("");

    try {
      const configResponse = await getBranchConfigAPI(id);
      setBranchConfig(normalizeBranchConfig(configResponse));
    } catch (error) {
      const message =
        error.message || "Failed to load branch order configuration.";

      setConfigError(message);
      setBranchConfig(DEFAULT_BRANCH_CONFIG);
      showErrorToast(message);
    } finally {
      setConfigLoading(false);
    }
  }, [id]);

  const loadBranchRevenue = useCallback(async () => {
    setRevenueLoading(true);
    setRevenueError("");

    try {
      const response = await getSuperAdminBranchRevenueAPI(7);

      if (response?.error) {
        throw new Error(response.error);
      }

      const revenueList = normalizeList(response);
      const selectedBranchRevenue = revenueList.find(
        (item) => String(item?.branchId) === String(id)
      );

      setBranchRevenue(selectedBranchRevenue || DEFAULT_BRANCH_REVENUE);
    } catch (error) {
      const message = error.message || "Failed to load branch revenue details.";
      setRevenueError(message);
      setBranchRevenue(DEFAULT_BRANCH_REVENUE);
    } finally {
      setRevenueLoading(false);
    }
  }, [id]);

  const loadBranch = useCallback(async () => {
    setLoading(true);
    setPageError("");

    const { data, error } = await getBranchByIdAPI(id);

    if (error) {
      setPageError(error);
      setBranch(null);
      showErrorToast(error);
      setLoading(false);
      return;
    }

    setBranch(data);
    setLoading(false);

    await Promise.allSettled([loadBranchConfig(), loadBranchRevenue()]);
  }, [id, loadBranchConfig, loadBranchRevenue]);

  useEffect(() => {
    if (isSuperAdmin) {
      loadBranch();
    } else {
      setLoading(false);
    }
  }, [id, isSuperAdmin, loadBranch]);

  const getBranchStatus = (branchData) => {
    if (!branchData) return "UNKNOWN";

    if (branchData.status) return branchData.status;

    if (typeof branchData.active === "boolean") {
      return branchData.active ? "ACTIVE" : "INACTIVE";
    }

    if (typeof branchData.isActive === "boolean") {
      return branchData.isActive ? "ACTIVE" : "INACTIVE";
    }

    return "UNKNOWN";
  };

  const isBranchActive = (branchData) => {
    return getBranchStatus(branchData) === "ACTIVE";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString();
  };

  const handleToggleStatus = async () => {
    if (!branch) return;

    const active = isBranchActive(branch);

    setActionLoading(true);

    const result = active
      ? await deactivateBranchAPI(id)
      : await activateBranchAPI(id);

    if (result.error) {
      showErrorToast(result.error);
      setActionLoading(false);
      return;
    }

    showSuccessToast(
      active
        ? "Branch deactivated successfully."
        : "Branch activated successfully."
    );

    await loadBranch();
    setActionLoading(false);
  };

  if (!isSuperAdmin) {
    return (
      <div className="w-full">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
          <BranchDetailsState
            Icon={RiShieldUserLine}
            title="No Access"
            description="Branch details are only available for SUPER_ADMIN users."
            iconClassName="bg-red-50 text-red-600"
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
          <BranchDetailsState
            Icon={RiBuilding2Line}
            title="Loading branch details"
            description="Please wait while the selected branch information is loaded."
            iconClassName="bg-gray-100 text-gray-600"
            loading
          />
        </div>
      </div>
    );
  }

  if (pageError && !branch) {
    return (
      <div className="w-full">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
          <BackToBranchesLink />

          <BranchDetailsState
            Icon={RiErrorWarningLine}
            title="Unable to load branch details"
            description={pageError || "Branch not found."}
            iconClassName="bg-red-50 text-red-600"
          />
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="w-full">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
          <BackToBranchesLink />

          <BranchDetailsState
            Icon={RiBuilding2Line}
            title="Branch not found"
            description="The selected branch could not be found. It may have been removed or the ID may be incorrect."
            iconClassName="bg-gray-100 text-gray-600"
          />
        </div>
      </div>
    );
  }

  const active = isBranchActive(branch);
  const branchId = branch?.id || branch?.branchId || id;

  return (
    <div className="w-full space-y-5">
      <section className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
        <BackToBranchesLink />

        <div className="flex flex-col gap-5 border-b border-gray-100 pb-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="break-words text-2xl font-bold text-gray-900">
                {branch?.name || "No branch name"}
              </h3>

              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                  active
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {active ? "Active" : "Inactive"}
              </span>
            </div>

            <p className="mt-1 text-sm text-gray-500">Branch ID: {branchId}</p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
              View operational information, revenue summary, contact details,
              and order configuration for this branch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                loadBranchRevenue();
                loadBranchConfig();
              }}
              disabled={revenueLoading || configLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RiRefreshLine size={18} />
              Refresh Details
            </button>

            <Link
              to={`/staff/branches/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
            >
              <RiEditLine size={18} />
              Edit Branch
            </Link>

            <button
              type="button"
              disabled={actionLoading}
              onClick={handleToggleStatus}
              className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
                active
                  ? "bg-red-50 text-red-600 hover:bg-red-100"
                  : "bg-green-50 text-green-700 hover:bg-green-100"
              }`}
            >
              {actionLoading && (
                <span
                  className={`h-4 w-4 animate-spin rounded-full border-2 ${
                    active
                      ? "border-red-200 border-t-red-600"
                      : "border-green-200 border-t-green-700"
                  }`}
                />
              )}

              {actionLoading
                ? "Updating..."
                : active
                  ? "Deactivate Branch"
                  : "Activate Branch"}
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <BranchQuickInfoCard
            Icon={RiMapPinLine}
            label="Address"
            value={branch?.address || "N/A"}
          />

          <BranchQuickInfoCard
            Icon={RiPhoneLine}
            label="Contact Number"
            value={branch?.contactNumber || branch?.phone || "N/A"}
          />

          <BranchQuickInfoCard
            Icon={RiMailLine}
            label="Email"
            value={branch?.email || "N/A"}
          />

          <BranchQuickInfoCard
            Icon={RiCalendarLine}
            label="Created Date"
            value={formatDate(branch?.createdAt || branch?.createdDate)}
          />
        </div>
      </section>

      <BranchRevenueSummaryCard
        branchRevenue={branchRevenue}
        revenueLoading={revenueLoading}
        revenueError={revenueError}
        onReload={loadBranchRevenue}
      />

      <section className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-1">
          <BranchBasicDetailsCard branch={branch} branchId={branchId} />
        </div>

        <div className="xl:col-span-2">
          <BranchOrderConfigurationCard
            branchConfig={branchConfig}
            configLoading={configLoading}
            configError={configError}
            onReload={loadBranchConfig}
          />
        </div>
      </section>
    </div>
  );
}

function BranchRevenueSummaryCard({
  branchRevenue,
  revenueLoading,
  revenueError,
  onReload,
}) {
  return (
    <section className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Branch Revenue Summary
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Revenue and paid order performance for this branch.
          </p>
        </div>

        {revenueLoading ? (
          <div className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-200 border-t-orange-600" />
            Loading revenue
          </div>
        ) : (
          <button
            type="button"
            onClick={onReload}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
          >
            <RiRefreshLine size={17} />
            Reload Revenue
          </button>
        )}
      </div>

      {revenueError && (
        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">{revenueError}</p>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <RevenueMetricCard
          Icon={RiMoneyDollarCircleLine}
          label="7-Day Revenue"
          value={formatMoney(branchRevenue?.periodRevenue)}
          description="Paid revenue in selected period"
        />

        <RevenueMetricCard
          Icon={RiTimerFlashLine}
          label="Today Revenue"
          value={formatMoney(branchRevenue?.todayRevenue)}
          description="Paid revenue today"
        />

        <RevenueMetricCard
          Icon={RiShoppingBag3Line}
          label="7-Day Orders"
          value={Number(branchRevenue?.periodOrderCount || 0).toLocaleString()}
          description="Paid orders in selected period"
        />

        <RevenueMetricCard
          Icon={RiShoppingBag3Line}
          label="Today Orders"
          value={Number(branchRevenue?.todayOrderCount || 0).toLocaleString()}
          description="Paid orders today"
        />

        <RevenueMetricCard
          Icon={RiBarChartBoxLine}
          label="Average Order"
          value={formatMoney(branchRevenue?.averageOrderValue)}
          description="Average paid order value"
        />
      </div>
    </section>
  );
}

function BranchBasicDetailsCard({ branch, branchId }) {
  return (
    <section className="h-full rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-lg font-bold text-gray-900">Branch Information</h3>

      <p className="mt-1 text-sm text-gray-500">
        Main registered details for this branch.
      </p>

      <div className="mt-5 space-y-4">
        <BranchInfoRow label="Branch ID" value={branchId} />
        <BranchInfoRow label="Branch Name" value={branch?.name || "N/A"} />
        <BranchInfoRow label="Email" value={branch?.email || "N/A"} />
        <BranchInfoRow
          label="Contact Number"
          value={branch?.contactNumber || branch?.phone || "N/A"}
        />
        <BranchInfoRow
          label="Created Date"
          value={formatSafeDate(branch?.createdAt || branch?.createdDate)}
        />
        <BranchInfoRow label="Address" value={branch?.address || "N/A"} />
      </div>
    </section>
  );
}

function BranchOrderConfigurationCard({
  branchConfig,
  configLoading,
  configError,
  onReload,
}) {
  return (
    <div className="h-full rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Branch Order Configuration
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            View delivery fee and available order methods for this branch.
          </p>
        </div>

        {configLoading ? (
          <div className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-200 border-t-orange-600" />
            Loading configuration
          </div>
        ) : (
          <button
            type="button"
            onClick={onReload}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
          >
            <RiRefreshLine size={17} />
            Reload Config
          </button>
        )}
      </div>

      {configError && (
        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">{configError}</p>
        </div>
      )}

      {configLoading ? (
        <div className="mt-6">
          <BranchDetailsState
            Icon={RiBuilding2Line}
            title="Loading branch order configuration"
            description="Please wait while delivery and order method settings are loaded."
            iconClassName="bg-gray-100 text-gray-600"
            loading
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Delivery Fee
            </p>

            <div className="mt-3 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900">
              {branchConfig.deliveryFee || "0"}
            </div>

            <p className="mt-2 text-xs text-gray-400">
              Delivery fee is used only when delivery is enabled.
            </p>
          </div>

          <ConfigStatusCard
            label="Active for Orders"
            description="Allow this branch to receive customer orders."
            enabled={branchConfig.branchActiveForOrders}
          />

          <ConfigStatusCard
            label="Delivery"
            description="Enable delivery orders for this branch."
            enabled={branchConfig.deliveryEnabled}
          />

          <ConfigStatusCard
            label="Pickup"
            description="Enable pickup orders for this branch."
            enabled={branchConfig.pickupEnabled}
          />

          <div className="lg:col-span-2">
            <ConfigStatusCard
              label="Dine-In"
              description="Enable dine-in orders for this branch."
              enabled={branchConfig.dineInEnabled}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function RevenueMetricCard({ Icon, label, value, description }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {label}
          </p>

          <h4 className="mt-3 text-2xl font-bold text-gray-900">{value}</h4>

          <p className="mt-2 text-xs text-gray-400">{description}</p>
        </div>

        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function BranchQuickInfoCard({ Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600">
          <Icon size={20} />
        </div>

        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            {label}
          </p>

          <p className="mt-2 break-words text-sm font-semibold text-gray-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function BranchInfoRow({ label, value }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-gray-900">
        {value}
      </p>
    </div>
  );
}

function ConfigStatusCard({ label, description, enabled }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {label}
        </p>

        <p className="mt-2 text-sm font-semibold text-gray-900">
          {description}
        </p>
      </div>

      <div
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          enabled ? "bg-orange-500" : "bg-gray-300"
        }`}
      >
        <div
          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
            enabled ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </div>
    </div>
  );
}

function BackToBranchesLink() {
  return (
    <div className="mb-6">
      <Link
        to="/staff/branches"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-orange-600"
      >
        <RiArrowLeftLine size={18} />
        Back to branches
      </Link>
    </div>
  );
}

function BranchDetailsState({
  Icon,
  title,
  description,
  iconClassName,
  loading = false,
}) {
  return (
    <div className="text-center">
      <div
        className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${iconClassName}`}
      >
        {loading ? (
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-orange-500" />
        ) : (
          <Icon size={24} />
        )}
      </div>

      <h3 className="font-semibold text-gray-900">{title}</h3>

      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}

function normalizeBranchConfig(response) {
  const config = response?.data || response || {};

  return {
    ...config,
    deliveryFee:
      config.deliveryFee === null || config.deliveryFee === undefined
        ? ""
        : String(config.deliveryFee),
    deliveryEnabled: Boolean(config.deliveryEnabled),
    pickupEnabled: Boolean(config.pickupEnabled),
    dineInEnabled: Boolean(config.dineInEnabled),
    branchActiveForOrders: Boolean(config.branchActiveForOrders),
  };
}

function normalizeList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.content)) return response.content;
  return [];
}

function formatSafeDate(dateValue) {
  if (!dateValue) return "N/A";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString();
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "LKR 0";
  }

  return `LKR ${Number(value).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}