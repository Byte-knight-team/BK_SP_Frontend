// src/pages/superadmin/DashboardPage.jsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  RiTeamLine,
  RiStore2Line,
  RiCheckboxCircleLine,
  RiShieldCheckLine,
  RiSettings3Line,
  RiFileList3Line,
  RiUserHeartLine,
  RiRefreshLine,
  RiPercentLine,
  RiGiftLine,
  RiMoneyDollarCircleLine,
  RiTimerFlashLine,
  RiBarChartBoxLine,
} from "@remixicon/react";

import { getAllStaffAPI } from "../../apis/staff/staff";
import { getAllBranchesAPI } from "../../apis/staff/branches";
import { getAllCustomersAPI } from "../../apis/staff/customers";
import { getGlobalConfigAPI } from "../../apis/staff/systemConfig";

import {
  getAdminDashboardSummaryAPI,
  getSuperAdminBranchRevenueAPI,
} from "../../apis/staff/dashboard";

import { showSuccessToast, showErrorToast } from "../../utils/toast";

/*
  Super Admin Dashboard

  Purpose:
  - Keeps system governance summary from the previous dashboard.
  - Adds Super Admin revenue and branch performance overview.
  - Removes Total Orders / Active Orders / Order Flow.
  - Removes 7-Day Revenue Trend section.
*/
export default function DashboardPage() {
  const { setHeaderInfo } = useOutletContext();

  const [staffList, setStaffList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [globalConfig, setGlobalConfig] = useState(null);

  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [branchRevenue, setBranchRevenue] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    setHeaderInfo({
      title: "Dashboard",
      description: "System governance and branch-wide administration.",
      Icon: RiStore2Line,
    });

    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  const normalizeList = (response) => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.content)) return response.content;
    if (Array.isArray(response?.branches)) return response.branches;
    if (Array.isArray(response?.staff)) return response.staff;
    if (Array.isArray(response?.customers)) return response.customers;
    return [];
  };

  const normalizeObject = (response) => {
    if (response?.data && typeof response.data === "object") {
      return response.data;
    }

    if (response && typeof response === "object") {
      return response;
    }

    return null;
  };

  const isStaffActive = (staff) => {
    if (typeof staff?.active === "boolean") return staff.active;
    if (typeof staff?.isActive === "boolean") return staff.isActive;
    if (typeof staff?.enabled === "boolean") return staff.enabled;

    const status = String(staff?.status || staff?.accountStatus || "")
      .trim()
      .toUpperCase();

    if (status === "ACTIVE") return true;
    if (status === "INACTIVE") return false;

    return false;
  };

  const isBranchActive = (branch) => {
    if (branch?.status) {
      return String(branch.status).trim().toUpperCase() === "ACTIVE";
    }

    if (typeof branch?.active === "boolean") return branch.active;
    if (typeof branch?.isActive === "boolean") return branch.isActive;

    return false;
  };

  const isCustomerActive = (customer) => {
    if (typeof customer?.active === "boolean") return customer.active;
    if (typeof customer?.isActive === "boolean") return customer.isActive;
    if (typeof customer?.enabled === "boolean") return customer.enabled;

    const status = String(customer?.status || customer?.accountStatus || "")
      .trim()
      .toUpperCase();

    if (status === "ACTIVE") return true;
    if (status === "INACTIVE") return false;

    return false;
  };

  const loadDashboardData = useCallback(
    async ({ showFullLoading = true } = {}) => {
      if (showFullLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const [
          summaryResult,
          branchRevenueResult,
          staffResult,
          branchResult,
          customerResult,
          configResult,
        ] = await Promise.allSettled([
          getAdminDashboardSummaryAPI(),
          getSuperAdminBranchRevenueAPI(7),
          getAllStaffAPI(),
          getAllBranchesAPI(),
          getAllCustomersAPI(),
          getGlobalConfigAPI(),
        ]);

        if (summaryResult.status === "fulfilled") {
          if (summaryResult.value?.error) {
            setDashboardSummary(null);
          } else {
            setDashboardSummary(normalizeObject(summaryResult.value));
          }
        } else {
          setDashboardSummary(null);
        }

        if (branchRevenueResult.status === "fulfilled") {
          if (branchRevenueResult.value?.error) {
            setBranchRevenue([]);
          } else {
            setBranchRevenue(normalizeList(branchRevenueResult.value));
          }
        } else {
          setBranchRevenue([]);
        }

        if (staffResult.status === "fulfilled") {
          if (staffResult.value?.error) {
            showErrorToast(staffResult.value.error);
            setStaffList([]);
          } else {
            setStaffList(
              normalizeList(staffResult.value?.data || staffResult.value)
            );
          }
        } else {
          setStaffList([]);
          showErrorToast("Failed to load staff summary.");
        }

        if (branchResult.status === "fulfilled") {
          if (branchResult.value?.error) {
            showErrorToast(branchResult.value.error);
            setBranchList([]);
          } else {
            setBranchList(
              normalizeList(branchResult.value?.data || branchResult.value)
            );
          }
        } else {
          setBranchList([]);
          showErrorToast("Failed to load branch summary.");
        }

        if (customerResult.status === "fulfilled") {
          if (customerResult.value?.error) {
            showErrorToast(customerResult.value.error);
            setCustomerList([]);
          } else {
            setCustomerList(
              normalizeList(customerResult.value?.data || customerResult.value)
            );
          }
        } else {
          setCustomerList([]);
          showErrorToast("Failed to load customer summary.");
        }

        if (configResult.status === "fulfilled") {
          if (configResult.value?.error) {
            setGlobalConfig(null);
            showErrorToast(configResult.value.error);
          } else {
            setGlobalConfig(normalizeObject(configResult.value));
          }
        } else {
          setGlobalConfig(null);
          showErrorToast("Failed to load system configuration summary.");
        }

        return true;
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadDashboardData({ showFullLoading: true });
  }, [loadDashboardData]);

  const handleRefreshDashboard = async () => {
    const success = await loadDashboardData({ showFullLoading: false });

    if (success) {
      showSuccessToast("Dashboard refreshed successfully.");
    }
  };

  const totalStaff = staffList.length;
  const activeStaff = staffList.filter(isStaffActive).length;
  const inactiveStaff = totalStaff - activeStaff;

  const totalBranches = branchList.length;
  const activeBranches = branchList.filter(isBranchActive).length;
  const inactiveBranches = totalBranches - activeBranches;

  const totalCustomers = customerList.length;
  const activeCustomers = customerList.filter(isCustomerActive).length;
  const inactiveCustomers = totalCustomers - activeCustomers;

  const emailVerifiedCustomers = customerList.filter(
    (customer) => customer?.emailVerified === true
  ).length;

  const phoneVerifiedCustomers = customerList.filter(
    (customer) => customer?.phoneVerified === true
  ).length;

  const totalCustomerLoyaltyPoints = customerList.reduce((total, customer) => {
    return total + Number(customer?.loyaltyPoints || 0);
  }, 0);

  const totalCustomerSpend = customerList.reduce((total, customer) => {
    return total + Number(customer?.totalSpent || 0);
  }, 0);

  const staffActiveRate = calculateRate(activeStaff, totalStaff);
  const branchActiveRate = calculateRate(activeBranches, totalBranches);
  const customerActiveRate = calculateRate(activeCustomers, totalCustomers);

  const totalRevenue = Number(dashboardSummary?.totalRevenue || 0);

  const totalBranchPeriodRevenue = branchRevenue.reduce((total, branch) => {
    return total + Number(branch?.periodRevenue || 0);
  }, 0);

  const totalBranchTodayRevenue = branchRevenue.reduce((total, branch) => {
    return total + Number(branch?.todayRevenue || 0);
  }, 0);

  const totalBranchPeriodOrders = branchRevenue.reduce((total, branch) => {
    return total + Number(branch?.periodOrderCount || 0);
  }, 0);

  const topBranch = useMemo(() => {
    if (!branchRevenue.length) return null;

    return branchRevenue.reduce((currentTop, branch) => {
      const currentRevenue = Number(currentTop?.periodRevenue || 0);
      const branchRevenueValue = Number(branch?.periodRevenue || 0);

      return branchRevenueValue > currentRevenue ? branch : currentTop;
    }, branchRevenue[0]);
  }, [branchRevenue]);

  const businessCards = [
    {
      title: "Total Revenue",
      value: formatMoney(totalRevenue),
      description: "Successful paid revenue across the system",
      icon: RiMoneyDollarCircleLine,
      tone: "green",
    },
    {
      title: "Today Branch Revenue",
      value: formatMoney(totalBranchTodayRevenue),
      description: "Revenue across all branches today",
      icon: RiTimerFlashLine,
      tone: "green",
    },
    {
      title: "7-Day Branch Revenue",
      value: formatMoney(totalBranchPeriodRevenue),
      description: `${totalBranchPeriodOrders} paid orders in the period`,
      icon: RiBarChartBoxLine,
      tone: "green",
    },
    {
      title: "Top Branch",
      value: topBranch?.branchName || "No revenue yet",
      description: topBranch
        ? `${formatMoney(topBranch.periodRevenue)} in last 7 days`
        : "No paid branch revenue found",
      icon: RiStore2Line,
      tone: "orange",
    },
  ];

  const governanceCards = useMemo(
    () => [
      {
        title: "Total Staff",
        value: totalStaff,
        description: `${activeStaff} active / ${inactiveStaff} inactive`,
        icon: RiTeamLine,
        tone: "orange",
      },
      {
        title: "Total Branches",
        value: totalBranches,
        description: `${activeBranches} active / ${inactiveBranches} inactive`,
        icon: RiStore2Line,
        tone: "orange",
      },
      {
        title: "Total Customers",
        value: totalCustomers,
        description: `${activeCustomers} active / ${inactiveCustomers} inactive`,
        icon: RiUserHeartLine,
        tone: "orange",
      },
      {
        title: "Staff Active Rate",
        value: `${staffActiveRate}%`,
        description: "Active staff account percentage",
        icon: RiCheckboxCircleLine,
        tone: "green",
      },
      {
        title: "Branch Active Rate",
        value: `${branchActiveRate}%`,
        description: "Operational branch percentage",
        icon: RiShieldCheckLine,
        tone: "green",
      },
      {
        title: "Customer Active Rate",
        value: `${customerActiveRate}%`,
        description: "Active customer account percentage",
        icon: RiCheckboxCircleLine,
        tone: "green",
      },
    ],
    [
      totalStaff,
      activeStaff,
      inactiveStaff,
      totalBranches,
      activeBranches,
      inactiveBranches,
      totalCustomers,
      activeCustomers,
      inactiveCustomers,
      staffActiveRate,
      branchActiveRate,
      customerActiveRate,
    ]
  );

  const statusRows = [
    {
      label: "Staff Accounts",
      total: totalStaff,
      active: activeStaff,
      inactive: inactiveStaff,
      rate: staffActiveRate,
      Icon: RiTeamLine,
    },
    {
      label: "Restaurant Branches",
      total: totalBranches,
      active: activeBranches,
      inactive: inactiveBranches,
      rate: branchActiveRate,
      Icon: RiStore2Line,
    },
    {
      label: "Customer Accounts",
      total: totalCustomers,
      active: activeCustomers,
      inactive: inactiveCustomers,
      rate: customerActiveRate,
      Icon: RiUserHeartLine,
    },
  ];

  const configItems = [
    {
      label: "Tax",
      enabled: Boolean(globalConfig?.taxEnabled),
      value: `${Number(globalConfig?.taxPercentage || 0)}%`,
      Icon: RiPercentLine,
    },
    {
      label: "Service Charge",
      enabled: Boolean(globalConfig?.serviceChargeEnabled),
      value: `${Number(globalConfig?.serviceChargePercentage || 0)}%`,
      Icon: RiPercentLine,
    },
    {
      label: "Loyalty",
      enabled: Boolean(globalConfig?.loyaltyEnabled),
      value: `${Number(globalConfig?.pointsPerAmount || 0)} pts / ${Number(
        globalConfig?.amountPerPoint || 0
      )} amount`,
      Icon: RiGiftLine,
    },
  ];

  if (loading) {
    return (
      <div className="w-full">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
          <DashboardState
            Icon={RiStore2Line}
            title="Loading dashboard"
            description="Please wait while system-wide summary details are loaded."
            loading
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Super Admin Overview
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Monitor branch revenue, system governance, customer activity, and
              global business rules.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Total governance records:{" "}
              <span className="font-semibold text-gray-800">
                {totalStaff + totalBranches + totalCustomers}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={handleRefreshDashboard}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {refreshing ? (
              <Spinner className="h-4 w-4 border-gray-300 border-t-orange-500" />
            ) : (
              <RiRefreshLine size={18} />
            )}

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {businessCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </section>

      <section className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
        <SectionHeader
          Icon={RiStore2Line}
          title="Branch Revenue Overview"
          description="Super Admin view of branch-wise paid revenue for the last 7 days."
        />

        <div className="mt-5 overflow-x-auto">
          {branchRevenue.length ? (
            <table className="min-w-full divide-y divide-gray-100 text-left text-sm">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  <th className="px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">7-Day Revenue</th>
                  <th className="px-4 py-3 text-right">7-Day Orders</th>
                  <th className="px-4 py-3 text-right">Today Revenue</th>
                  <th className="px-4 py-3 text-right">Today Orders</th>
                  <th className="px-4 py-3 text-right">Average Order</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {branchRevenue.map((branch) => (
                  <BranchRevenueRow key={branch.branchId} branch={branch} />
                ))}
              </tbody>
            </table>
          ) : (
            <EmptyState text="No branch revenue data available." />
          )}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {governanceCards.map((card) => (
          <SummaryCard key={card.title} {...card} />
        ))}
      </section>

      <section className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
        <SectionHeader
          Icon={RiFileList3Line}
          title="Operational Status"
          description="Active and inactive breakdown across main system areas."
        />

        <div className="mt-5 space-y-4">
          {statusRows.map((row) => (
            <StatusRow key={row.label} {...row} />
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
          <SectionHeader
            Icon={RiUserHeartLine}
            title="Customer Insights"
            description="Loyalty and verification summary."
          />

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <InsightTile
              label="Email Verified"
              value={emailVerifiedCustomers}
              description={`of ${totalCustomers} customers`}
            />

            <InsightTile
              label="Phone Verified"
              value={phoneVerifiedCustomers}
              description={`of ${totalCustomers} customers`}
            />

            <InsightTile
              label="Total Loyalty Points"
              value={totalCustomerLoyaltyPoints.toLocaleString()}
              description="points held by customers"
            />

            <InsightTile
              label="Total Customer Spend"
              value={formatMoney(totalCustomerSpend)}
              description="recorded customer spending"
            />
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
          <SectionHeader
            Icon={RiSettings3Line}
            title="Global Rules"
            description="Current tax, service charge, and loyalty configuration."
          />

          <div className="mt-5 space-y-3">
            {configItems.map((item) => (
              <ConfigStatusItem key={item.label} {...item} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ title, value, description, icon: Icon, tone }) {
  return (
    <div className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-500">{title}</p>

          <h2 className="mt-3 text-3xl font-bold text-gray-900">{value}</h2>

          <p className="mt-2 text-sm text-gray-500">{description}</p>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${getIconToneClass(
            tone
          )}`}
        >
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ Icon, title, description }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-600">
        <Icon size={22} />
      </div>

      <div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>

        <p className="text-sm text-gray-500">{description}</p>
      </div>
    </div>
  );
}

function BranchRevenueRow({ branch }) {
  const active =
    String(branch?.branchStatus || "").trim().toUpperCase() === "ACTIVE";

  return (
    <tr className="text-gray-700">
      <td className="px-4 py-4">
        <div>
          <p className="font-semibold text-gray-900">{branch.branchName}</p>
          <p className="text-xs text-gray-400">ID: {branch.branchId}</p>
        </div>
      </td>

      <td className="px-4 py-4">
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
            active ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
          }`}
        >
          {branch.branchStatus || "UNKNOWN"}
        </span>
      </td>

      <td className="px-4 py-4 text-right font-semibold text-gray-900">
        {formatMoney(branch.periodRevenue)}
      </td>

      <td className="px-4 py-4 text-right">
        {Number(branch.periodOrderCount || 0).toLocaleString()}
      </td>

      <td className="px-4 py-4 text-right font-semibold text-gray-900">
        {formatMoney(branch.todayRevenue)}
      </td>

      <td className="px-4 py-4 text-right">
        {Number(branch.todayOrderCount || 0).toLocaleString()}
      </td>

      <td className="px-4 py-4 text-right">
        {formatMoney(branch.averageOrderValue)}
      </td>
    </tr>
  );
}

function StatusRow({ label, total, active, inactive, rate, Icon }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600">
            <Icon size={20} />
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900">{label}</h4>

            <p className="text-xs text-gray-500">
              {active} active / {inactive} inactive / {total} total
            </p>
          </div>
        </div>

        <div className="text-sm font-bold text-gray-700">{rate}% active</div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-orange-500"
          style={{ width: `${Math.min(rate, 100)}%` }}
        />
      </div>
    </div>
  );
}

function InsightTile({ label, value, description }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>

      <h4 className="mt-2 text-2xl font-bold text-gray-900">{value}</h4>

      <p className="mt-1 text-sm text-gray-500">{description}</p>
    </div>
  );
}

function ConfigStatusItem({ label, enabled, value, Icon }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-orange-600">
          <Icon size={20} />
        </div>

        <div>
          <h4 className="text-sm font-bold text-gray-900">{label}</h4>

          <p className="text-xs text-gray-500">{value}</p>
        </div>
      </div>

      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
          enabled ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
        }`}
      >
        {enabled ? "Enabled" : "Disabled"}
      </span>
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 p-6 text-center text-sm text-gray-500">
      {text}
    </div>
  );
}

function DashboardState({ Icon, title, description, loading = false }) {
  return (
    <div className="text-center">
      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-600">
        {loading ? (
          <Spinner className="h-6 w-6 border-gray-300 border-t-orange-500" />
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

function Spinner({ className }) {
  return (
    <span
      className={`inline-flex animate-spin rounded-full border-2 ${className}`}
    />
  );
}

function calculateRate(active, total) {
  if (!total) {
    return 0;
  }

  return Math.round((active / total) * 100);
}

function getIconToneClass(tone) {
  if (tone === "green") {
    return "bg-green-50 text-green-600";
  }

  if (tone === "gray") {
    return "bg-gray-100 text-gray-600";
  }

  return "bg-orange-50 text-orange-600";
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