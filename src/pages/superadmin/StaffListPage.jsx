import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useOutletContext } from "react-router-dom";
import {
  RiTeamLine,
  RiAddLine,
  RiMailSendLine,
  RiCheckboxCircleLine,
  RiErrorWarningLine,
  RiFileCopyLine,
  RiSearchLine,
  RiCloseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
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

const PAGE_SIZE_OPTIONS = [10, 25, 50];

/*
  StaffListPage

  - Shows all staff accounts.
  - Keeps View, Edit, Invite, Activate/Deactivate actions.
  - Uses toast notifications for action feedback.
  - Adds frontend-only search and filters using loaded staff data.
  - Adds frontend-only pagination after search/filter.
  - Adds confirmation modal before activate/deactivate actions.
  - Uses visual loading, empty, and no-match table states.
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

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [staffToConfirm, setStaffToConfirm] = useState(null);

  const { user: authUser } = useAuth();

  const loggedInRole = normalizeRole(authUser?.roleName || authUser?.role);
  const isSuperAdmin = loggedInRole === "SUPER_ADMIN";
  const isAdmin = loggedInRole === "ADMIN";

  const LOWER_ROLES_FOR_ADMIN = ["MANAGER", "CHEF", "RECEPTIONIST", "DELIVERY"];

  const canManageStaffStatus = (staff) => {
    const targetRole = normalizeRole(getStaffRole(staff));

    if (isSuperAdmin) {
      return true;
    }

    if (isAdmin) {
      return LOWER_ROLES_FOR_ADMIN.includes(targetRole);
    }

    return false;
  };

  const availableRoles = useMemo(() => {
    return getUniqueSortedValues(staffList.map((staff) => getStaffRole(staff)));
  }, [staffList]);

  const availableBranches = useMemo(() => {
    return getUniqueSortedValues(
      staffList.map((staff) => getStaffBranchName(staff))
    );
  }, [staffList]);

  const filteredStaffList = useMemo(() => {
    const cleanSearch = normalizeForSearch(searchTerm);

    return staffList.filter((staff) => {
      const staffId = getStaffId(staff);
      const roleName = getStaffRole(staff);
      const branchName = getStaffBranchName(staff);
      const active = isStaffActive(staff);

      const searchableText = normalizeForSearch(
        [
          staffId,
          staff.fullName,
          staff.name,
          staff.username,
          staff.email,
          staff.phone,
          roleName,
          branchName,
        ].join(" ")
      );

      const matchesSearch =
        !cleanSearch || searchableText.includes(cleanSearch);

      const matchesRole = !roleFilter || roleName === roleFilter;

      const matchesBranch = !branchFilter || branchName === branchFilter;

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "ACTIVE" && active) ||
        (statusFilter === "INACTIVE" && !active);

      return matchesSearch && matchesRole && matchesBranch && matchesStatus;
    });
  }, [staffList, searchTerm, roleFilter, branchFilter, statusFilter]);

  const totalPages =
    filteredStaffList.length === 0
      ? 0
      : Math.ceil(filteredStaffList.length / pageSize);

  const safeCurrentPage =
    totalPages === 0 ? 1 : Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedStaffList = useMemo(() => {
    return filteredStaffList.slice(startIndex, endIndex);
  }, [filteredStaffList, startIndex, endIndex]);

  const firstVisibleStaffNumber =
    filteredStaffList.length === 0 ? 0 : startIndex + 1;

  const lastVisibleStaffNumber = Math.min(
    endIndex,
    filteredStaffList.length
  );

  const visiblePageNumbers = getVisiblePageNumbers(
    safeCurrentPage,
    totalPages
  );

  const hasActiveFilters =
    searchTerm.trim() !== "" || roleFilter || branchFilter || statusFilter;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter, branchFilter, statusFilter, pageSize]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }

    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

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

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("");
    setBranchFilter("");
    setStatusFilter("");
  };

  const openStatusConfirmModal = (staff) => {
    setNoticeMessage("");
    setStaffToConfirm(staff);
  };

  const closeStatusConfirmModal = () => {
    if (actionLoadingId) return;
    setStaffToConfirm(null);
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  const handleToggleStatus = async (staff) => {
    const staffId = getStaffId(staff);
    const isActive = isStaffActive(staff);

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
    setStaffToConfirm(null);
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
    const staffRole = getStaffRole(staff);
    const staffBranch = getStaffBranchName(staff);

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

        <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
          <div className="grid gap-3 xl:grid-cols-[1.4fr_0.8fr_0.9fr_0.7fr_auto]">
            <div className="relative">
              <RiSearchLine
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search name, username, email, phone, role, branch, or ID..."
                className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
            >
              <option value="">All Roles</option>
              {availableRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>

            <select
              value={branchFilter}
              onChange={(event) => setBranchFilter(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
            >
              <option value="">All Branches</option>
              {availableBranches.map((branch) => (
                <option key={branch} value={branch}>
                  {branch}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-white disabled:hover:text-gray-700"
            >
              Clear filters
            </button>
          </div>

          <div className="mt-3 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Matching{" "}
              <span className="font-bold text-gray-800">
                {filteredStaffList.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-800">
                {staffList.length}
              </span>{" "}
              staff
            </p>

            {hasActiveFilters && (
              <p className="text-xs font-medium text-orange-600">
                Filters are applied to the loaded staff list.
              </p>
            )}
          </div>
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
          <StaffTableState
            Icon={RiTeamLine}
            title="Loading staff"
            description="Please wait while staff accounts are loaded."
            iconClassName="bg-gray-100 text-gray-600"
            pulse
          />
        ) : staffList.length === 0 ? (
          <StaffTableState
            Icon={RiTeamLine}
            title="No staff members found"
            description="Create your first staff account to start managing internal users."
            iconClassName="bg-gray-100 text-gray-600"
          />
        ) : filteredStaffList.length === 0 ? (
          <StaffTableState
            Icon={RiSearchLine}
            title="No matching staff found"
            description="Try changing the search text or filters to find the staff member you need."
            iconClassName="bg-orange-50 text-orange-600"
          />
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
                {paginatedStaffList.map((staff) => {
                  const staffId = getStaffId(staff);
                  const isActive = isStaffActive(staff);
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
                          {getStaffRole(staff)}
                        </span>
                      </td>

                      <td className="px-5 py-4 align-middle text-sm text-gray-700">
                        {getStaffBranchName(staff)}
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
                              onClick={() => openStatusConfirmModal(staff)}
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

        {!loading && filteredStaffList.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <p className="text-sm text-gray-500">
                Page{" "}
                <span className="font-semibold text-gray-800">
                  {totalPages === 0 ? 0 : safeCurrentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800">
                  {totalPages}
                </span>{" "}
                • Showing{" "}
                <span className="font-semibold text-gray-800">
                  {firstVisibleStaffNumber}
                </span>
                -
                <span className="font-semibold text-gray-800">
                  {lastVisibleStaffNumber}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800">
                  {filteredStaffList.length}
                </span>{" "}
                staff
              </p>

              <label className="flex items-center gap-2 text-sm text-gray-500">
                Rows:
                <select
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                  className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={goToPreviousPage}
                disabled={safeCurrentPage <= 1}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RiArrowLeftSLine size={18} />
                Previous
              </button>

              {visiblePageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`h-9 min-w-9 rounded-xl px-3 text-sm font-bold transition-colors ${pageNumber === safeCurrentPage
                      ? "bg-orange-500 text-white shadow-sm shadow-orange-100"
                      : "border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                onClick={goToNextPage}
                disabled={safeCurrentPage >= totalPages}
                className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <RiArrowRightSLine size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {staffToConfirm && (
        <StaffStatusConfirmModal
          staff={staffToConfirm}
          isLoading={actionLoadingId === getStaffId(staffToConfirm)}
          onClose={closeStatusConfirmModal}
          onConfirm={() => handleToggleStatus(staffToConfirm)}
        />
      )}
    </div>
  );
}

function StaffTableState({
  Icon,
  title,
  description,
  iconClassName,
  pulse = false,
}) {
  return (
    <div className="p-8 text-center">
      <div
        className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${iconClassName}`}
      >
        {pulse ? (
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

function StaffStatusConfirmModal({ staff, isLoading, onClose, onConfirm }) {
  const staffName = staff.fullName || staff.name || "this staff member";
  const staffEmail = staff.email || "No email";
  const staffRole = getStaffRole(staff);
  const staffBranch = getStaffBranchName(staff);
  const active = isStaffActive(staff);

  const actionLabel = active ? "Deactivate" : "Activate";
  const actionText = active ? "deactivate" : "activate";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-900/40 px-4">
      <div className="w-full max-w-lg rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${active
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-700"
                }`}
            >
              <RiErrorWarningLine size={22} />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">
                {actionLabel} Staff Account?
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Please confirm before you {actionText} this staff account.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RiCloseLine size={18} />
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="text-sm font-bold text-gray-900">{staffName}</div>

          <div className="mt-1 text-xs text-gray-500">{staffEmail}</div>

          <div className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
            <div>
              <span className="font-semibold text-gray-800">Role:</span>{" "}
              {staffRole}
            </div>

            <div>
              <span className="font-semibold text-gray-800">Branch:</span>{" "}
              {staffBranch}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm leading-6 text-orange-800">
          {active
            ? "Deactivating this account will prevent the staff member from using their account until it is activated again."
            : "Activating this account will allow the staff member to use their account again."}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 ${active
                ? "bg-red-500 shadow-red-100 hover:bg-red-600"
                : "bg-green-600 shadow-green-100 hover:bg-green-700"
              }`}
          >
            {isLoading ? "Updating..." : `Yes, ${actionLabel}`}
          </button>
        </div>
      </div>
    </div>
  );
}

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .replace(/\s+/g, "_")
    .toUpperCase();
}

function normalizeForSearch(value) {
  return String(value || "").trim().toLowerCase();
}

function getStaffId(staff) {
  return staff?.id || staff?.userId || staff?.staffId;
}

function getStaffRole(staff) {
  return staff?.roleName || staff?.role || "N/A";
}

function getStaffBranchName(staff) {
  const branchName = staff?.branchName || staff?.branch?.name;

  if (branchName) {
    return branchName;
  }

  if (staff?.branchId) {
    return `Branch #${staff.branchId}`;
  }

  return "Global Access";
}

function isStaffActive(staff) {
  if (typeof staff?.active === "boolean") return staff.active;
  if (typeof staff?.isActive === "boolean") return staff.isActive;
  if (typeof staff?.enabled === "boolean") return staff.enabled;

  const status = String(staff?.status || staff?.accountStatus || "")
    .trim()
    .toUpperCase();

  if (status === "ACTIVE") return true;
  if (status === "INACTIVE") return false;

  return false;
}

function getUniqueSortedValues(values) {
  return Array.from(
    new Set(
      values
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    )
  ).sort((firstValue, secondValue) =>
    firstValue.localeCompare(secondValue, undefined, { sensitivity: "base" })
  );
}

function getVisiblePageNumbers(currentPage, totalPages) {
  if (totalPages <= 0) {
    return [];
  }

  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  let startPage = Math.max(currentPage - 2, 1);
  let endPage = Math.min(startPage + 4, totalPages);

  if (endPage - startPage < 4) {
    startPage = Math.max(endPage - 4, 1);
  }

  return Array.from(
    { length: endPage - startPage + 1 },
    (_, index) => startPage + index
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