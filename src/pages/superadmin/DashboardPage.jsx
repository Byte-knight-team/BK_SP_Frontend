// src/pages/superadmin/DashboardPage.jsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  RiTeamLine,
  RiStore2Line,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiShieldCheckLine,
  RiSettings3Line,
  RiFileList3Line,
  RiUserHeartLine,
  RiRefreshLine,
  RiPercentLine,
  RiGiftLine,
} from "@remixicon/react";

import { getAllStaffAPI } from "../../apis/staff/staff";
import { getAllBranchesAPI } from "../../apis/staff/branches";
import { getAllCustomersAPI } from "../../apis/staff/customers";
import { getGlobalConfigAPI } from "../../apis/staff/systemConfig";

import { showSuccessToast, showErrorToast } from "../../utils/toast";

/*
  Super Admin Dashboard

  Purpose:
  - Shows useful system-wide summary data.
  - Shows staff, branch, customer, and global config status.
  - Adds manual refresh support.
  - Removes quick action shortcut cards.
*/
export default function DashboardPage() {
  const { setHeaderInfo } = useOutletContext();

  const [staffList, setStaffList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [customerList, setCustomerList] = useState([]);
  const [globalConfig, setGlobalConfig] = useState(null);

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
    if (Array.isArray(response)) {
      return response;
    }

    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.content)) {
      return response.content;
    }

    if (Array.isArray(response?.branches)) {
      return response.branches;
    }

    if (Array.isArray(response?.staff)) {
      return response.staff;
    }

    if (Array.isArray(response?.customers)) {
      return response.customers;
    }

    return [];
  };

  const isStaffActive = (staff) => {
    if (typeof staff?.active === "boolean") {
      return staff.active;
    }

    if (typeof staff?.isActive === "boolean") {
      return staff.isActive;
    }

    if (typeof staff?.enabled === "boolean") {
      return staff.enabled;
    }

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

    if (typeof branch?.active === "boolean") {
      return branch.active;
    }

    if (typeof branch?.isActive === "boolean") {
      return branch.isActive;
    }

    return false;
  };

  const isCustomerActive = (customer) => {
    if (typeof customer?.active === "boolean") {
      return customer.active;
    }

    if (typeof customer?.isActive === "boolean") {
      return customer.isActive;
    }

    if (typeof customer?.enabled === "boolean") {
      return customer.enabled;
    }

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
        const [staffResult, branchResult, customerResult, configResult] =
          await Promise.allSettled([
            getAllStaffAPI(),
            getAllBranchesAPI(),
            getAllCustomersAPI(),
            getGlobalConfigAPI(),
          ]);

        if (staffResult.status === "fulfilled") {
          if (staffResult.value?.error) {
            showErrorToast(staffResult.value.error);
            setStaffList([]);
          } else {
            setStaffList(normalizeList(staffResult.value?.data));
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
            setBranchList(normalizeList(branchResult.value?.data));
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
            setCustomerList(normalizeList(customerResult.value?.data));
          }
        } else {
          setCustomerList([]);
          showErrorToast("Failed to load customer summary.");
        }

        if (configResult.status === "fulfilled") {
          setGlobalConfig(configResult.value || null);
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

  const summaryCards = useMemo(
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

  const getIconToneClass = (tone) => {
    if (tone === "green") {
      return "bg-green-50 text-green-600";
    }

    if (tone === "gray") {
      return "bg-gray-100 text-gray-600";
    }

    return "bg-orange-50 text-orange-600";
  };

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
      {/* Dashboard toolbar */}
      <section className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              System Overview
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Monitor staff, branches, customers, and global business rules
              across the whole restaurant system.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Total system records:{" "}
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

      {/* Summary cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    {card.title}
                  </p>

                  <h2 className="mt-3 text-3xl font-bold text-gray-900">
                    {card.value}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    {card.description}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${getIconToneClass(
                    card.tone
                  )}`}
                >
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Operational status */}
      <section className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-600">
            <RiFileList3Line size={22} />
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Operational Status
            </h3>

            <p className="text-sm text-gray-500">
              Active and inactive breakdown across main system areas.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {statusRows.map((row) => (
            <StatusRow key={row.label} {...row} />
          ))}
        </div>
      </section>

      {/* Customer and configuration insight */}
      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-600">
              <RiUserHeartLine size={22} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Customer Insights
              </h3>

              <p className="text-sm text-gray-500">
                Loyalty and verification summary.
              </p>
            </div>
          </div>

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
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-orange-50 text-orange-600">
              <RiSettings3Line size={22} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Global Rules
              </h3>

              <p className="text-sm text-gray-500">
                Current tax, service charge, and loyalty configuration.
              </p>
            </div>
          </div>

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

function formatMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "LKR 0";
  }

  return `LKR ${Number(value).toLocaleString()}`;
}