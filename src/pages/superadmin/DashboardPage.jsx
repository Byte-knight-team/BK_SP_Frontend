// src/pages/superadmin/DashboardPage.jsx

import { Link } from "react-router-dom";
import { useMemo } from "react";
import {
  RiDashboardLine,
  RiTeamLine,
  RiShieldUserLine,
  RiStore2Line,
  RiSettings3Line,
  RiFileList3Line,
  RiLockPasswordLine,
  RiArrowRightLine,
  RiCheckboxCircleLine,
  RiUserSettingsLine,
  RiAlertLine,
} from "@remixicon/react";

import { useAuth } from "../../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();

  // Some login responses may use roleName, while older code may use role.
  const roleName = user?.roleName || user?.role || "UNKNOWN";

  // SUPER_ADMIN usually has global access. Branch staff usually have a branch.
  const branchLabel = user?.branchName || "All Branches";

  // Build initials for the logged-in staff profile badge.
  const userInitials = useMemo(() => {
    const sourceName = user?.fullName || user?.name || user?.email || "SA";

    return sourceName
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [user]);

  /*
    Quick links for the staff/admin system.
    If any route is different in App.jsx, only update the path value.
  */
  const quickActions = [
    {
      title: "Staff Management",
      description: "Create staff, update staff details, and manage staff account status.",
      path: "/staff/staff",
      icon: RiTeamLine,
    },
    {
      title: "Branch Management",
      description: "Manage restaurant branches, branch details, and active/inactive status.",
      path: "/staff/branches",
      icon: RiStore2Line,
    },
    {
      title: "Roles & Permissions",
      description: "Control which staff roles can access each system feature.",
      path: "/staff/roles",
      icon: RiShieldUserLine,
    },
    {
      title: "System Configuration",
      description: "Manage tax, service charge, delivery fee, and branch configuration.",
      path: "/staff/system-config",
      icon: RiSettings3Line,
    },
  ];

  /*
    These cards describe the main staff-side admin modules.
    They are static status cards, so this dashboard does not depend on extra API calls.
  */
  const systemCards = [
    {
      title: "Staff Accounts",
      value: "Manage",
      description: "Admin users can create and maintain staff accounts for restaurant operations.",
      icon: RiTeamLine,
    },
    {
      title: "Access Control",
      value: "Protected",
      description: "Roles and privileges control access to staff-side features.",
      icon: RiShieldUserLine,
    },
    {
      title: "Branches",
      value: branchLabel,
      description: "Branch records define where staff and restaurant operations are managed.",
      icon: RiStore2Line,
    },
    {
      title: "Configuration",
      value: "Available",
      description: "Business rules such as tax, service charge, and delivery fee are configurable.",
      icon: RiSettings3Line,
    },
  ];

  const operationChecklist = [
    "Check newly created staff accounts",
    "Review inactive or blocked staff users",
    "Confirm branch details are up to date",
    "Review recent audit log activity",
    "Confirm system configuration values before operations",
  ];

  return (
    <div className="space-y-6">
      {/* Main dashboard header */}
      <section className="overflow-hidden rounded-[1.5rem] border border-gray-100 bg-white shadow-sm">
        <div className="relative p-6 sm:p-8">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-full bg-orange-50" />
          <div className="absolute bottom-0 right-20 h-20 w-20 rounded-t-full bg-gray-50" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700">
                <RiDashboardLine size={16} />
                Restaurant Staff Control Center
              </div>

              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                Staff Administration Dashboard
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-500">
                Manage staff accounts, restaurant branches, role permissions,
                system configuration, and audit monitoring from one central
                staff-side dashboard.
              </p>
            </div>

            {/* Logged-in staff summary */}
            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 sm:min-w-[280px]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-sm font-bold text-white">
                  {userInitials}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {user?.fullName || user?.name || "Staff User"}
                  </p>
                  <p className="truncate text-xs text-gray-500">
                    {user?.email || "No email found"}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-white p-3">
                  <p className="text-gray-400">Role</p>
                  <p className="mt-1 font-semibold text-gray-900">{roleName}</p>
                </div>

                <div className="rounded-xl bg-white p-3">
                  <p className="text-gray-400">Branch Access</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {branchLabel}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-3">
                  <p className="text-gray-400">Account Status</p>
                  <p className="mt-1 font-semibold text-gray-900">Active</p>
                </div>

                <div className="rounded-xl bg-white p-3">
                  <p className="text-gray-400">Password</p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {user?.passwordChanged ? "Updated" : "Change Required"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* System overview cards */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {systemCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                  <Icon size={22} />
                </div>

                <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                  Live
                </span>
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {card.title}
              </p>

              <h2 className="mt-2 text-xl font-bold text-gray-900">
                {card.value}
              </h2>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                {card.description}
              </p>
            </div>
          );
        })}
      </section>

      {/* Quick actions */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-500">
            Common staff administration tasks.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.title}
                to={action.path}
                className="group rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-50 text-gray-700">
                    <Icon size={22} />
                  </div>

                  <RiArrowRightLine
                    size={20}
                    className="text-gray-300 transition-colors group-hover:text-orange-500"
                  />
                </div>

                <h3 className="mt-4 text-sm font-bold text-gray-900">
                  {action.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Bottom dashboard area */}
      <section className="grid gap-4 lg:grid-cols-3">
        {/* Operational checklist */}
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-700">
              <RiCheckboxCircleLine size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Daily Admin Checklist
              </h2>
              <p className="text-sm text-gray-500">
                Recommended checks for restaurant staff system maintenance.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {operationChecklist.map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-2xl bg-gray-50 p-4"
              >
                <RiCheckboxCircleLine
                  size={18}
                  className="mt-0.5 shrink-0 text-green-600"
                />
                <p className="text-sm font-medium text-gray-700">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Security and audit notice */}
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
            <RiLockPasswordLine size={22} />
          </div>

          <h2 className="mt-4 text-lg font-bold text-gray-900">
            Security Notice
          </h2>

          <p className="mt-2 text-sm leading-6 text-gray-500">
            Staff-side pages should only be used by authorized restaurant
            employees. Role permissions and backend security rules decide what
            each staff member can access.
          </p>

          <Link
            to="/staff/audit-logs"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800"
          >
            <RiFileList3Line size={18} />
            View Audit Logs
          </Link>

          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-yellow-50 p-3 text-sm text-yellow-800">
            <RiAlertLine size={18} className="mt-0.5 shrink-0" />
            <p>
              Any staff, branch, role, or configuration change should be checked
              through audit logs when reviewing system activity.
            </p>
          </div>
        </div>
      </section>

      {/* System areas */}
      <section className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gray-50 text-gray-700">
            <RiUserSettingsLine size={22} />
          </div>

          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Staff System Areas
            </h2>
            <p className="text-sm text-gray-500">
              Main administration areas connected to restaurant operations.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm font-bold text-gray-900">Super Admin</p>
            <p className="mt-1 text-sm text-gray-500">
              Full system access across branches and governance settings.
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm font-bold text-gray-900">Branch Admin</p>
            <p className="mt-1 text-sm text-gray-500">
              Handles staff and operational control inside assigned branch.
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm font-bold text-gray-900">Kitchen & Reception</p>
            <p className="mt-1 text-sm text-gray-500">
              Uses staff access for order and restaurant service workflows.
            </p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4">
            <p className="text-sm font-bold text-gray-900">Delivery & Manager</p>
            <p className="mt-1 text-sm text-gray-500">
              Uses role-based access for delivery, inventory, and branch tasks.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}