// src/pages/superadmin/DashboardPage.jsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  RiTeamLine,
  RiStore2Line,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiRefreshLine,
  RiArrowRightLine,
  RiShieldCheckLine,
  RiSettings3Line,
  RiFileList3Line,
} from "@remixicon/react";

import { getAllStaffAPI } from "../../apis/staff/staff";
import { getAllBranchesAPI } from "../../apis/staff/branches";
import { showErrorToast } from "../../utils/toast";

/*
  Super Admin Dashboard
*/
export default function DashboardPage() {
  const { setHeaderInfo } = useOutletContext();

  const [staffList, setStaffList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [loading, setLoading] = useState(true);

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

    return [];
  };

  const isStaffActive = (staff) => {
    if (typeof staff.active === "boolean") {
      return staff.active;
    }

    if (typeof staff.isActive === "boolean") {
      return staff.isActive;
    }

    return false;
  };

  const isBranchActive = (branch) => {
    if (branch.status) {
      return branch.status === "ACTIVE";
    }

    if (typeof branch.active === "boolean") {
      return branch.active;
    }

    if (typeof branch.isActive === "boolean") {
      return branch.isActive;
    }

    return false;
  };

  const loadDashboardData = useCallback(async () => {
    setLoading(true);

    const staffResult = await getAllStaffAPI();
    const branchResult = await getAllBranchesAPI();

    if (staffResult.error || branchResult.error) {
      showErrorToast(
        staffResult.error ||
          branchResult.error ||
          "Failed to load dashboard data."
      );
    }

    setStaffList(normalizeList(staffResult.data));
    setBranchList(normalizeList(branchResult.data));

    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const totalStaff = staffList.length;
  const activeStaff = staffList.filter(isStaffActive).length;
  const inactiveStaff = totalStaff - activeStaff;

  const totalBranches = branchList.length;
  const activeBranches = branchList.filter(isBranchActive).length;
  const inactiveBranches = totalBranches - activeBranches;

  const summaryCards = useMemo(
    () => [
      {
        title: "Total Staff",
        value: totalStaff,
        description: "All staff accounts in the system",
        icon: RiTeamLine,
        tone: "orange",
      },
      {
        title: "Active Staff",
        value: activeStaff,
        description: "Staff accounts currently active",
        icon: RiCheckboxCircleLine,
        tone: "green",
      },
      {
        title: "Inactive Staff",
        value: inactiveStaff,
        description: "Staff accounts currently inactive",
        icon: RiCloseCircleLine,
        tone: "gray",
      },
      {
        title: "Total Branches",
        value: totalBranches,
        description: "All restaurant branches",
        icon: RiStore2Line,
        tone: "orange",
      },
      {
        title: "Active Branches",
        value: activeBranches,
        description: "Branches currently operating",
        icon: RiCheckboxCircleLine,
        tone: "green",
      },
      {
        title: "Inactive Branches",
        value: inactiveBranches,
        description: "Branches currently disabled",
        icon: RiCloseCircleLine,
        tone: "gray",
      },
    ],
    [
      totalStaff,
      activeStaff,
      inactiveStaff,
      totalBranches,
      activeBranches,
      inactiveBranches,
    ]
  );

  const quickLinks = [
    {
      title: "Staff Management",
      description: "View, create, edit, activate, and deactivate staff.",
      path: "/staff/staff",
      icon: RiTeamLine,
    },
    {
      title: "Branch Management",
      description: "View and manage restaurant branches.",
      path: "/staff/branches",
      icon: RiStore2Line,
    },
    {
      title: "Roles & Permissions",
      description: "Manage role salaries and access permissions.",
      path: "/staff/roles",
      icon: RiShieldCheckLine,
    },
    {
      title: "System Configuration",
      description: "Manage tax, service charge, and loyalty rules.",
      path: "/staff/system-config",
      icon: RiSettings3Line,
    },
    {
      title: "Audit Logs",
      description: "Review important system activity records.",
      path: "/staff/audit-logs",
      icon: RiFileList3Line,
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

  return (
    <div className="space-y-5">
      {/* Overview card */}
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Dashboard Overview
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Quick summary of staff accounts and restaurant branches.
            </p>
          </div>

          <button
            type="button"
            onClick={loadDashboardData}
            disabled={loading}
            className="inline-flex w-fit items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-orange-500" />
            ) : (
              <RiRefreshLine size={18} />
            )}

            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-orange-500" />
            </div>

            <div>
              <h4 className="text-sm font-bold text-orange-900">
                Loading dashboard data
              </h4>

              <p className="mt-0.5 text-sm text-orange-700">
                Please wait while staff and branch summary details are loaded.
              </p>
            </div>
          </div>
        </div>
      )}

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

                  <div className="mt-3 flex min-h-10 items-center">
                    {loading ? (
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-gray-300 border-t-orange-500" />
                    ) : (
                      <h2 className="text-3xl font-bold text-gray-900">
                        {card.value}
                      </h2>
                    )}
                  </div>

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

      {/* Quick links */}
      <section className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>

        <p className="mt-1 text-sm text-gray-500">
          Go directly to the main super admin management pages.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {quickLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.title}
                to={link.path}
                className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-orange-200 hover:bg-orange-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-orange-600">
                    <Icon size={22} />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {link.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {link.description}
                    </p>
                  </div>
                </div>

                <RiArrowRightLine
                  size={20}
                  className="shrink-0 text-gray-300 group-hover:text-orange-500"
                />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}