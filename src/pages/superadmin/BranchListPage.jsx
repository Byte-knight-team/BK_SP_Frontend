import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useOutletContext } from "react-router-dom";
import {
  RiBuilding2Line,
  RiAddLine,
  RiSearchLine,
  RiErrorWarningLine,
  RiCloseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiEyeLine,
  RiEditLine,
  RiShieldUserLine,
} from "@remixicon/react";

import {
  getAllBranchesAPI,
  activateBranchAPI,
  deactivateBranchAPI,
} from "../../apis/staff/branches";

import { useAuth } from "../../context/AuthContext";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function BranchListPage() {
  const location = useLocation();
  const { setHeaderInfo } = useOutletContext();

  const branchBasePath = location.pathname.startsWith("/admin")
    ? "/admin/branches"
    : "/staff/branches";

  const [branchList, setBranchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [loadError, setLoadError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [branchToConfirm, setBranchToConfirm] = useState(null);

  const { user } = useAuth();

  const loggedInRole = normalizeRole(user?.roleName || user?.role);
  const isSuperAdmin = loggedInRole === "SUPER_ADMIN";

  const filteredBranchList = useMemo(() => {
    const cleanSearch = normalizeForSearch(searchTerm);

    return branchList.filter((branch) => {
      const branchId = getBranchId(branch);
      const branchStatus = getBranchStatus(branch);

      const searchableText = normalizeForSearch(
        [
          branchId,
          branch.name,
          branch.email,
          branch.contactNumber,
          branch.phone,
          branch.address,
        ].join(" ")
      );

      const matchesSearch =
        !cleanSearch || searchableText.includes(cleanSearch);

      const matchesStatus = !statusFilter || branchStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [branchList, searchTerm, statusFilter]);

  const totalPages =
    filteredBranchList.length === 0
      ? 0
      : Math.ceil(filteredBranchList.length / pageSize);

  const safeCurrentPage =
    totalPages === 0 ? 1 : Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedBranchList = useMemo(() => {
    return filteredBranchList.slice(startIndex, endIndex);
  }, [filteredBranchList, startIndex, endIndex]);

  const firstVisibleBranchNumber =
    filteredBranchList.length === 0 ? 0 : startIndex + 1;

  const lastVisibleBranchNumber = Math.min(
    endIndex,
    filteredBranchList.length
  );

  const visiblePageNumbers = getVisiblePageNumbers(
    safeCurrentPage,
    totalPages
  );

  const hasActiveFilters = searchTerm.trim() !== "" || statusFilter;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, pageSize]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }

    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  /*
    If another page redirects here with a success message,
    show it as a toast instead of an inline green box.
  */
  useEffect(() => {
    if (location.state?.successMessage) {
      showSuccessToast(location.state.successMessage);
    }
  }, [location.state]);

  /*
    Set the header information for this page.
  */
  useEffect(() => {
    setHeaderInfo({
      title: "Branch Management",
      description:
        "Create, view, activate, deactivate, and manage restaurant branches.",
      Icon: RiBuilding2Line,
    });

    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  /*
    Load all branches from the backend.
  */
  const loadBranches = async () => {
    setLoading(true);
    setLoadError("");

    const { data, error } = await getAllBranchesAPI();

    if (error) {
      setLoadError(error);
      setBranchList([]);
      showErrorToast(error);
    } else {
      setBranchList(Array.isArray(data) ? data : []);
    }

    setLoading(false);
  };

  /*
    Load branches when the page opens.
  */
  useEffect(() => {
    if (isSuperAdmin) {
      loadBranches();
    } else {
      setLoading(false);
    }
  }, [isSuperAdmin]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  const openStatusConfirmModal = (branch) => {
    setBranchToConfirm(branch);
  };

  const closeStatusConfirmModal = () => {
    if (actionLoadingId) return;
    setBranchToConfirm(null);
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  /*
    Activate or deactivate a branch.
  */
  const handleToggleStatus = async (branch) => {
    const branchId = getBranchId(branch);
    const active = isBranchActive(branch);

    if (!branchId) {
      showErrorToast("Branch ID not found in response.");
      return;
    }

    setActionLoadingId(branchId);

    const result = active
      ? await deactivateBranchAPI(branchId)
      : await activateBranchAPI(branchId);

    if (result.error) {
      showErrorToast(result.error);
    } else {
      showSuccessToast(
        active
          ? "Branch deactivated successfully."
          : "Branch activated successfully."
      );

      await loadBranches();
    }

    setActionLoadingId(null);
    setBranchToConfirm(null);
  };

  if (!isSuperAdmin) {
    return (
      <div className="max-w-5xl">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
          <BranchTableState
            Icon={RiShieldUserLine}
            title="No Access"
            description="Branch Management is only available for SUPER_ADMIN users."
            iconClassName="bg-red-50 text-red-600"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Top card */}
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Restaurant Branches
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Manage restaurant branches used by staff and branch-level
              operations.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Total branches:{" "}
              <span className="font-semibold text-gray-800">
                {branchList.length}
              </span>
            </p>
          </div>

          <Link
            to={`${branchBasePath}/create`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600"
          >
            <RiAddLine size={18} />
            Create Branch
          </Link>
        </div>

        <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
            <div className="relative">
              <RiSearchLine
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search branch name, email, contact number, address, or ID..."
                className="w-full rounded-2xl border border-gray-200 bg-white py-2.5 pl-11 pr-4 text-sm text-gray-800 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
              />
            </div>

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
                {filteredBranchList.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-800">
                {branchList.length}
              </span>{" "}
              branches
            </p>

            {hasActiveFilters && (
              <p className="text-xs font-medium text-orange-600">
                Filters are applied to the loaded branch list.
              </p>
            )}
          </div>
        </div>

        {loadError && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {loadError}
          </div>
        )}
      </div>

      {/* Branch table card */}
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-3 shadow-sm">
        {loading ? (
          <BranchTableState
            Icon={RiBuilding2Line}
            title="Loading branches"
            description="Please wait while restaurant branches are loaded."
            iconClassName="bg-gray-100 text-gray-600"
            loading
          />
        ) : branchList.length === 0 ? (
          <BranchTableState
            Icon={RiBuilding2Line}
            title="No branches found"
            description="Create your first branch to start managing restaurant locations."
            iconClassName="bg-gray-100 text-gray-600"
          />
        ) : filteredBranchList.length === 0 ? (
          <BranchTableState
            Icon={RiSearchLine}
            title="No matching branches found"
            description="Try changing the search text or filters to find the branch you need."
            iconClassName="bg-orange-50 text-orange-600"
          />
        ) : (
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full min-w-[1180px] text-left">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="w-[220px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Branch
                  </th>

                  <th className="w-[250px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Contact
                  </th>

                  <th className="w-[320px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Address
                  </th>

                  <th className="w-[140px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Created
                  </th>

                  <th className="w-[120px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="w-[280px] px-5 py-3.5 pr-6 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginatedBranchList.map((branch) => {
                  const branchId = getBranchId(branch);
                  const active = isBranchActive(branch);
                  const isActionLoading =
                    String(actionLoadingId) === String(branchId);
                  const anyActionLoading = Boolean(actionLoadingId);

                  return (
                    <tr
                      key={branchId || branch.email}
                      className="hover:bg-gray-50/70"
                    >
                      <td className="px-5 py-4 align-middle">
                        <div className="font-semibold text-gray-900">
                          {branch.name || "No branch name"}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          ID: {branchId || "N/A"}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <div className="text-sm text-gray-800">
                          {branch.email || "No email"}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {branch.contactNumber ||
                            branch.phone ||
                            "No contact number"}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-middle text-sm text-gray-700">
                        <div className="max-w-[300px]">
                          {branch.address || "No address"}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-middle text-sm text-gray-700">
                        {formatDate(branch.createdAt || branch.createdDate)}
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            active
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 pr-6 align-middle text-right">
                        <div className="inline-flex items-center justify-end gap-2 whitespace-nowrap">
                          <ActionLink
                            to={`${branchBasePath}/${branchId}`}
                            Icon={RiEyeLine}
                            label="View"
                          />

                          <ActionLink
                            to={`${branchBasePath}/${branchId}/edit`}
                            Icon={RiEditLine}
                            label="Edit"
                          />

                          <ActionButton
                            label={
                              isActionLoading
                                ? "Updating..."
                                : active
                                  ? "Deactivate"
                                  : "Activate"
                            }
                            loading={isActionLoading}
                            disabled={anyActionLoading}
                            onClick={() => openStatusConfirmModal(branch)}
                            variant={active ? "danger" : "success"}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredBranchList.length > 0 && (
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
                  {firstVisibleBranchNumber}
                </span>
                -
                <span className="font-semibold text-gray-800">
                  {lastVisibleBranchNumber}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800">
                  {filteredBranchList.length}
                </span>{" "}
                branches
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
                  className={`h-9 min-w-9 rounded-xl px-3 text-sm font-bold transition-colors ${
                    pageNumber === safeCurrentPage
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

      {branchToConfirm && (
        <BranchStatusConfirmModal
          branch={branchToConfirm}
          isLoading={
            String(actionLoadingId) === String(getBranchId(branchToConfirm))
          }
          onClose={closeStatusConfirmModal}
          onConfirm={() => handleToggleStatus(branchToConfirm)}
        />
      )}
    </div>
  );
}

function ActionLink({ to, Icon, label }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
    >
      <Icon size={15} />
      {label}
    </Link>
  );
}

function ActionButton({
  label,
  loading,
  disabled,
  onClick,
  variant = "neutral",
}) {
  const variantClassNames = {
    neutral:
      "border border-gray-200 bg-white text-gray-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    success: "bg-green-50 text-green-700 hover:bg-green-100",
  };

  const spinnerClassNames = {
    neutral: "border-gray-300 border-t-orange-500",
    danger: "border-red-200 border-t-red-600",
    success: "border-green-200 border-t-green-700",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClassNames[variant]}`}
    >
      {loading && (
        <Spinner className={`h-3.5 w-3.5 ${spinnerClassNames[variant]}`} />
      )}

      {label}
    </button>
  );
}

function BranchTableState({
  Icon,
  title,
  description,
  iconClassName,
  loading = false,
}) {
  return (
    <div className="p-8 text-center">
      <div
        className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${iconClassName}`}
      >
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

function BranchStatusConfirmModal({ branch, isLoading, onClose, onConfirm }) {
  const branchId = getBranchId(branch);
  const branchName = branch.name || "this branch";
  const branchEmail = branch.email || "No email";
  const branchContact =
    branch.contactNumber || branch.phone || "No contact number";
  const branchAddress = branch.address || "No address";
  const active = isBranchActive(branch);

  const actionLabel = active ? "Deactivate" : "Activate";
  const actionText = active ? "deactivate" : "activate";

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-900/40 px-4">
      <div className="w-full max-w-lg rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
                active ? "bg-red-50 text-red-600" : "bg-green-50 text-green-700"
              }`}
            >
              <RiErrorWarningLine size={22} />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">
                {actionLabel} Branch?
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Please confirm before you {actionText} this restaurant branch.
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
          <div className="text-sm font-bold text-gray-900">{branchName}</div>

          <div className="mt-1 text-xs text-gray-500">
            ID: {branchId || "N/A"}
          </div>

          <div className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
            <div>
              <span className="font-semibold text-gray-800">Email:</span>{" "}
              {branchEmail}
            </div>

            <div>
              <span className="font-semibold text-gray-800">Contact:</span>{" "}
              {branchContact}
            </div>
          </div>

          <div className="mt-3 text-xs text-gray-600">
            <span className="font-semibold text-gray-800">Address:</span>{" "}
            {branchAddress}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm leading-6 text-orange-800">
          {active
            ? "Deactivating this branch will mark it as inactive. Staff and branch-related operations may be affected."
            : "Activating this branch will make it available again for branch-level operations."}
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
            className={`inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-50 ${
              active
                ? "bg-red-500 shadow-red-100 hover:bg-red-600"
                : "bg-green-600 shadow-green-100 hover:bg-green-700"
            }`}
          >
            {isLoading && (
              <Spinner
                className={`h-4 w-4 ${
                  active
                    ? "border-red-200 border-t-white"
                    : "border-green-200 border-t-white"
                }`}
              />
            )}

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

function getBranchId(branch) {
  return branch?.id || branch?.branchId;
}

function getBranchStatus(branch) {
  if (branch?.status) {
    return String(branch.status).trim().toUpperCase();
  }

  if (typeof branch?.active === "boolean") {
    return branch.active ? "ACTIVE" : "INACTIVE";
  }

  if (typeof branch?.isActive === "boolean") {
    return branch.isActive ? "ACTIVE" : "INACTIVE";
  }

  return "UNKNOWN";
}

function isBranchActive(branch) {
  return getBranchStatus(branch) === "ACTIVE";
}

function formatDate(dateValue) {
  if (!dateValue) return "N/A";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString();
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

function Spinner({ className }) {
  return (
    <span
      className={`inline-flex animate-spin rounded-full border-2 ${className}`}
    />
  );
}