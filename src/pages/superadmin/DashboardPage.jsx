// src/pages/superadmin/DashboardPage.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  RiTeamLine,
  RiStore2Line,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiRefreshLine,
  RiArrowRightLine,
} from "@remixicon/react";

import { getAllStaffAPI } from "../../apis/staff/staff";
import { getAllBranchesAPI } from "../../apis/staff/branches";

/*
  Super Admin Dashboard
*/
export default function DashboardPage() {
  /*
    staffList stores all staff loaded from backend.
    branchList stores all branches loaded from backend.
    loading controls dashboard loading state.
    error stores API errors.
  */
  const [staffList, setStaffList] = useState([]);
  const [branchList, setBranchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /*
    Normalizes backend response into an array.

    This protects the dashboard if backend returns:
    - direct array
    - { data: [...] }
    - { content: [...] }
  */
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

  /*
    Staff active status helper.
    Backend may return:
    - active: true / false
    - isActive: true / false
  */
  const isStaffActive = (staff) => {
    if (typeof staff.active === "boolean") {
      return staff.active;
    }

    if (typeof staff.isActive === "boolean") {
      return staff.isActive;
    }

    return false;
  };

  /*
    Branch active status helper.
  */
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

  /*
    Load dashboard data using already-created APIs.
  */
  const loadDashboardData = async () => {
    setLoading(true);
    setError("");

    const staffResult = await getAllStaffAPI();
    const branchResult = await getAllBranchesAPI();

    if (staffResult.error || branchResult.error) {
      setError(
        staffResult.error ||
          branchResult.error ||
          "Failed to load dashboard data."
      );
    }

    setStaffList(normalizeList(staffResult.data));
    setBranchList(normalizeList(branchResult.data));

    setLoading(false);
  };

  /*
    Load data when dashboard opens.
  */
  useEffect(() => {
    loadDashboardData();
  }, []);

  /*
    Dashboard calculated values.
  */
  const totalStaff = staffList.length;
  const activeStaff = staffList.filter(isStaffActive).length;
  const inactiveStaff = totalStaff - activeStaff;

  const totalBranches = branchList.length;
  const activeBranches = branchList.filter(isBranchActive).length;
  const inactiveBranches = totalBranches - activeBranches;

  /*
    Summary cards shown at the top.
  */
  const summaryCards = [
    {
      title: "Total Staff",
      value: totalStaff,
      description: "All staff accounts in the system",
      icon: RiTeamLine,
    },
    {
      title: "Active Staff",
      value: activeStaff,
      description: "Staff accounts currently active",
      icon: RiCheckboxCircleLine,
    },
    {
      title: "Inactive Staff",
      value: inactiveStaff,
      description: "Staff accounts currently inactive",
      icon: RiCloseCircleLine,
    },
    {
      title: "Total Branches",
      value: totalBranches,
      description: "All restaurant branches",
      icon: RiStore2Line,
    },
    {
      title: "Active Branches",
      value: activeBranches,
      description: "Branches currently operating",
      icon: RiCheckboxCircleLine,
    },
    {
      title: "Inactive Branches",
      value: inactiveBranches,
      description: "Branches currently disabled",
      icon: RiCloseCircleLine,
    },
    // new cards
  ];

  /*
    Simple quick links to your own pages.
  */
  const quickLinks = [
    {
      title: "Staff Management",
      description: "View and manage staff accounts.",
      path: "/staff/staff",
      icon: RiTeamLine,
    },
    {
      title: "Branch Management",
      description: "View and manage branches.",
      path: "/staff/branches",
      icon: RiStore2Line,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Small dashboard title */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500">
            Simple summary of staff and branch records.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboardData}
          disabled={loading}
          className="inline-flex w-fit items-center gap-2 rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          <RiRefreshLine size={20} />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {error}
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

                  <h2 className="mt-3 text-3xl font-bold text-gray-900">
                    {loading ? "-" : card.value}
                  </h2>

                  <p className="mt-2 text-sm text-gray-500">
                    {card.description}
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
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
          Go directly to the main management pages.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {quickLinks.map((link) => {
            const Icon = link.icon;

            return (
              <Link
                key={link.title}
                to={link.path}
                className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-orange-200 hover:bg-orange-50"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-orange-600">
                    <Icon size={24} />
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
                  className="text-gray-300 group-hover:text-orange-500"
                />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}