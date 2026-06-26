import { useEffect, useState } from "react";
import { Link, useLocation, useOutletContext } from "react-router-dom";
import {
  RiTeamLine,
  RiAddLine,
  RiMailSendLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiFileCopyLine,
} from "@remixicon/react";

import {
  getAllStaffAPI,
  activateStaffAPI,
  deactivateStaffAPI,
  resendStaffInviteAPI,
} from "../../apis/staff/staff";

import { useAuth } from "../../context/AuthContext";
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../../utils/toast";

/*
  StaffListPage

  - Shows all staff accounts.
  - Keeps View, Edit, Invite, Activate/Deactivate actions.
  - Uses toast notifications for action feedback.
  - Keeps actions aligned horizontally.
*/
export default function StaffListPage() {
  const location = useLocation();
  const { setHeaderInfo } = useOutletContext();

  const staffBasePath = location.pathname.startsWith("/admin")
    ? "/admin/staff"
    : "/staff/staff";

  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [noticeMessage, setNoticeMessage] = useState("");

  const { user: authUser } = useAuth();

  const normalizeRole = (role) => {
    return String(role || "")
      .trim()
      .replace(/\s+/g, "_")
      .toUpperCase();
  };

  const loggedInRole = normalizeRole(authUser?.roleName || authUser?.role);
  const isSuperAdmin = loggedInRole === "SUPER_ADMIN";
  const isAdmin = loggedInRole === "ADMIN";

  const LOWER_ROLES_FOR_ADMIN = ["MANAGER", "CHEF", "RECEPTIONIST", "DELIVERY"];

  const canManageStaffStatus = (staff) => {
    const targetRole = normalizeRole(staff.roleName || staff.role);

    if (isSuperAdmin) {
      return true;
    }

    if (isAdmin) {
      return LOWER_ROLES_FOR_ADMIN.includes(targetRole);
    }

    return false;
  };

  useEffect(() => {
    if (location.state?.successMessage) {
      setNoticeMessage(location.state.successMessage);
    }
  }, [location.state]);

  useEffect(() => {
    setHeaderInfo({
      title: "Staff Management",
      description: "View, activate, deactivate, and manage internal staff accounts.",
      Icon: RiTeamLine,
    });

    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  const loadStaff = async () => {
    setLoading(true);
    setLoadError("");

    const { data, error } = await getAllStaffAPI();

    if (error) {
      setLoadError(error);
      setStaffList([]);
      showErrorToast(error);
    } else {
      setStaffList(Array.isArray(data) ? data : []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const getStaffId = (staff) => {
    return staff.id || staff.userId || staff.staffId;
  };

  const getActiveStatus = (staff) => {
    if (typeof staff.active === "boolean") return staff.active;
    if (typeof staff.isActive === "boolean") return staff.isActive;
    return false;
  };

  const getRoleName = (staff) => {
    return staff.roleName || staff.role || "N/A";
  };

  const getBranchName = (staff) => {
    return staff.branchName || staff.branch?.name || "Global";
  };

  const handleToggleStatus = async (staff) => {
    const staffId = getStaffId(staff);
    const isActive = getActiveStatus(staff);

    if (!staffId) {
      showErrorToast("Staff ID not found in response.");
      return;
    }

    setActionLoadingId(staffId);
    setNoticeMessage("");

    const result = isActive
      ? await deactivateStaffAPI(staffId)
      : await activateStaffAPI(staffId);

    if (result.error) {
      showErrorToast(result.error);
    } else {
      showSuccessToast(
        isActive
          ? "Staff deactivated successfully."
          : "Staff activated successfully."
      );

      await loadStaff();
    }

    setActionLoadingId(null);
  };

  const handleResendInvite = async (staff) => {
    const staffId = getStaffId(staff);

    if (!staffId) {
      showErrorToast("Staff ID not found in response.");
      return;
    }

    setActionLoadingId(staffId);
    setNoticeMessage("");

    const { data, error } = await resendStaffInviteAPI(staffId);

    if (error) {
      showErrorToast(error);
      setActionLoadingId(null);
      return;
    }

    const staffName = staff.fullName || staff.name || "Selected staff";
    const staffUsername = staff.username || "no-username";
    const staffEmail = staff.email || "No email";
    const staffRole = getRoleName(staff);
    const staffBranch = getBranchName(staff);

    if (data?.emailSent === true) {
      setNoticeMessage(
        `Invite email resent successfully.

Staff: ${staffName}
Username: @${staffUsername}
Email: ${staffEmail}
Role: ${staffRole}
Branch: ${staffBranch}`
      );

      showSuccessToast("Invite email resent successfully.");
    } else {
      setNoticeMessage(
        `Invite email failed.

Staff: ${staffName}
Username: @${staffUsername}
Email: ${staffEmail}
Role: ${staffRole}
Branch: ${staffBranch}
Temporary password: ${data?.temporaryPassword || "Not returned"}

Please manually share this temporary password with the staff member.`
      );

      showWarningToast(
        "Invite email failed. Temporary password is shown on this page."
      );
    }

    setActionLoadingId(null);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Staff Accounts</h3>

            <p className="mt-1 text-sm text-gray-500">
              Manage staff users created for branches and internal operations.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Total staff:{" "}
              <span className="font-semibold text-gray-800">
                {staffList.length}
              </span>
            </p>
          </div>

          <Link
            to={`${staffBasePath}/create`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600"
          >
            <RiAddLine size={18} />
            Create Staff
          </Link>
        </div>

        {loadError && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {loadError}
          </div>
        )}

        {noticeMessage && (
          <StaffNoticeCard
            message={noticeMessage}
            onClose={() => setNoticeMessage("")}
          />
        )}
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        {loading ? (
          <div className="p-8 text-sm text-gray-500">Loading staff...</div>
        ) : staffList.length === 0 ? (
          <div className="p-8 text-sm text-gray-500">
            No staff members found.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full min-w-[1220px] text-left">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="w-[260px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Staff
                  </th>

                  <th className="w-[280px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Contact
                  </th>

                  <th className="w-[160px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Role
                  </th>

                  <th className="w-[190px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Branch
                  </th>

                  <th className="w-[120px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="w-[340px] px-5 py-3.5 pr-6 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {staffList.map((staff) => {
                  const staffId = getStaffId(staff);
                  const isActive = getActiveStatus(staff);
                  const isActionLoading = actionLoadingId === staffId;
                  const canToggleStatus = canManageStaffStatus(staff);

                  return (
                    <tr
                      key={staffId || staff.email}
                      className="hover:bg-gray-50/70"
                    >
                      <td className="px-5 py-4 align-middle">
                        <div className="font-semibold text-gray-900">
                          {staff.fullName || staff.name || "No name"}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          @{staff.username || "no-username"}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <div className="text-sm text-gray-800">
                          {staff.email}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {staff.phone || "No phone"}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                          {getRoleName(staff)}
                        </span>
                      </td>

                      <td className="px-5 py-4 align-middle text-sm text-gray-700">
                        {getBranchName(staff)}
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                            }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 pr-6 align-middle text-right">
                        <div className="inline-flex items-center justify-end gap-2 whitespace-nowrap">
                          <Link
                            to={`${staffBasePath}/${staffId}`}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            View
                          </Link>

                          <Link
                            to={`${staffBasePath}/${staffId}/edit`}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleResendInvite(staff)}
                            className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <RiMailSendLine size={15} />
                            {isActionLoading ? "Sending..." : "Invite"}
                          </button>

                          {canToggleStatus ? (
                            <button
                              type="button"
                              disabled={isActionLoading}
                              onClick={() => handleToggleStatus(staff)}
                              className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${isActive
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                                }`}
                            >
                              {isActionLoading
                                ? "Updating..."
                                : isActive
                                  ? "Deactivate"
                                  : "Activate"}
                            </button>
                          ) : (
                            <span className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-400">
                              No access
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StaffNoticeCard({ message, onClose }) {
  const isWarning =
    message.toLowerCase().includes("failed") ||
    message.toLowerCase().includes("temporary password");

  const temporaryPassword = getTemporaryPasswordFromMessage(message);

  const handleCopyPassword = async () => {
    if (!temporaryPassword) {
      showWarningToast("No temporary password found to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(temporaryPassword);
      showSuccessToast("Temporary password copied.");
    } catch {
      showErrorToast("Could not copy temporary password.");
    }
  };

  return (
    <div
      className={`mt-5 rounded-2xl border px-4 py-4 ${isWarning
        ? "border-amber-100 bg-amber-50 text-amber-800"
        : "border-emerald-100 bg-emerald-50 text-emerald-800"
        }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isWarning
            ? "bg-amber-100 text-amber-700"
            : "bg-emerald-100 text-emerald-700"
            }`}
        >
          {isWarning ? (
            <RiErrorWarningLine size={19} />
          ) : (
            <RiCheckboxCircleLine size={19} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h4 className="text-sm font-bold">
                {isWarning ? "Action completed with warning" : "Action completed"}
              </h4>

              <p className="mt-2 whitespace-pre-line text-sm font-medium leading-6">
                {message}
              </p>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {temporaryPassword && (
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-white px-3 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
                >
                  <RiFileCopyLine size={15} />
                  Copy Password
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className={`rounded-xl px-3 py-2 text-xs font-bold ${isWarning
                  ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                  : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                  }`}
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTemporaryPasswordFromMessage(message) {
  const match = message.match(/Temporary password:\s*(.+)/i);
  return match?.[1]?.trim() || "";
}