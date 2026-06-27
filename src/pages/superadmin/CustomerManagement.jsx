import { useEffect, useMemo, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  RiUserHeartLine,
  RiSearchLine,
  RiCloseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiEyeLine,
  RiErrorWarningLine,
  RiCheckboxCircleLine,
} from "@remixicon/react";

import {
  getAllCustomersAPI,
  activateCustomerAPI,
  deactivateCustomerAPI,
} from "../../apis/staff/customers";

import { useAuth } from "../../context/AuthContext";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function CustomerManagement() {
  const { setHeaderInfo } = useOutletContext();
  const { user: authUser } = useAuth();

  const loggedInRole = normalizeRole(authUser?.roleName || authUser?.role);
  const isSuperAdmin = loggedInRole === "SUPER_ADMIN";

  const [customerList, setCustomerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [loadError, setLoadError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [customerToConfirm, setCustomerToConfirm] = useState(null);

  useEffect(() => {
    setHeaderInfo({
      title: "Customer Management",
      description:
        "View customer accounts and control customer account access.",
      Icon: RiUserHeartLine,
    });

    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  const loadCustomers = async () => {
    setLoading(true);
    setLoadError("");

    const { data, error } = await getAllCustomersAPI();

    if (error) {
      setLoadError(error);
      setCustomerList([]);
      showErrorToast(error);
    } else {
      setCustomerList(Array.isArray(data) ? data : []);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomerList = useMemo(() => {
    const cleanSearch = normalizeForSearch(searchTerm);

    return customerList.filter((customer) => {
      const customerId = getCustomerId(customer);
      const active = isCustomerActive(customer);

      const searchableText = normalizeForSearch(
        [
          customerId,
          customer.userId,
          customer.fullName,
          customer.username,
          customer.email,
          customer.phone,
          customer.address,
        ].join(" ")
      );

      const matchesSearch =
        !cleanSearch || searchableText.includes(cleanSearch);

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "ACTIVE" && active) ||
        (statusFilter === "INACTIVE" && !active);

      const emailVerified = Boolean(customer.emailVerified);
      const phoneVerified = Boolean(customer.phoneVerified);

      const matchesVerified =
        !verifiedFilter ||
        (verifiedFilter === "EMAIL_VERIFIED" && emailVerified) ||
        (verifiedFilter === "PHONE_VERIFIED" && phoneVerified) ||
        (verifiedFilter === "BOTH_VERIFIED" && emailVerified && phoneVerified) ||
        (verifiedFilter === "NOT_VERIFIED" && !emailVerified && !phoneVerified);

      return matchesSearch && matchesStatus && matchesVerified;
    });
  }, [customerList, searchTerm, statusFilter, verifiedFilter]);

  const totalPages =
    filteredCustomerList.length === 0
      ? 0
      : Math.ceil(filteredCustomerList.length / pageSize);

  const safeCurrentPage =
    totalPages === 0 ? 1 : Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedCustomerList = useMemo(() => {
    return filteredCustomerList.slice(startIndex, endIndex);
  }, [filteredCustomerList, startIndex, endIndex]);

  const firstVisibleCustomerNumber =
    filteredCustomerList.length === 0 ? 0 : startIndex + 1;

  const lastVisibleCustomerNumber = Math.min(
    endIndex,
    filteredCustomerList.length
  );

  const visiblePageNumbers = getVisiblePageNumbers(
    safeCurrentPage,
    totalPages
  );

  const hasActiveFilters =
    searchTerm.trim() !== "" || statusFilter || verifiedFilter;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, verifiedFilter, pageSize]);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }

    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
    setVerifiedFilter("");
  };

  const openStatusConfirmModal = (customer) => {
    setCustomerToConfirm(customer);
  };

  const closeStatusConfirmModal = () => {
    if (actionLoading) return;
    setCustomerToConfirm(null);
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  const handleToggleStatus = async (customer) => {
    const customerId = getCustomerId(customer);
    const isActive = isCustomerActive(customer);

    if (!customerId) {
      showErrorToast("Customer ID not found in response.");
      return;
    }

    setActionLoading({ id: customerId, type: "status" });

    const result = isActive
      ? await deactivateCustomerAPI(customerId)
      : await activateCustomerAPI(customerId);

    if (result.error) {
      showErrorToast(result.error);
    } else {
      showSuccessToast(
        isActive
          ? "Customer deactivated successfully."
          : "Customer activated successfully."
      );

      await loadCustomers();
    }

    setActionLoading(null);
    setCustomerToConfirm(null);
  };

  if (!isSuperAdmin) {
    return (
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
        <CustomerTableState
          Icon={RiErrorWarningLine}
          title="No Access"
          description="Only Super Admin can manage customer accounts."
          iconClassName="bg-red-50 text-red-600"
        />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Customer Accounts
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              View customer account details and control active/inactive access.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Total customers:{" "}
              <span className="font-semibold text-gray-800">
                {customerList.length}
              </span>
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50/70 p-4">
          <div className="grid gap-3 xl:grid-cols-[1.5fr_0.8fr_0.9fr_auto]">
            <div className="relative">
              <RiSearchLine
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search name, username, email, phone, address, or ID..."
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

            <select
              value={verifiedFilter}
              onChange={(event) => setVerifiedFilter(event.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-50"
            >
              <option value="">All Verification</option>
              <option value="EMAIL_VERIFIED">Email verified</option>
              <option value="PHONE_VERIFIED">Phone verified</option>
              <option value="BOTH_VERIFIED">Both verified</option>
              <option value="NOT_VERIFIED">Not verified</option>
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
                {filteredCustomerList.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-800">
                {customerList.length}
              </span>{" "}
              customers
            </p>

            {hasActiveFilters && (
              <p className="text-xs font-medium text-orange-600">
                Filters are applied to the loaded customer list.
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

      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-3 shadow-sm">
        {loading ? (
          <CustomerTableState
            Icon={RiUserHeartLine}
            title="Loading customers"
            description="Please wait while customer accounts are loaded."
            iconClassName="bg-gray-100 text-gray-600"
            loading
          />
        ) : customerList.length === 0 ? (
          <CustomerTableState
            Icon={RiUserHeartLine}
            title="No customers found"
            description="Customer accounts will appear here after customers register or use the QR flow."
            iconClassName="bg-gray-100 text-gray-600"
          />
        ) : filteredCustomerList.length === 0 ? (
          <CustomerTableState
            Icon={RiSearchLine}
            title="No matching customers found"
            description="Try changing the search text or filters to find the customer you need."
            iconClassName="bg-orange-50 text-orange-600"
          />
        ) : (
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full min-w-[1120px] text-left">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="w-[260px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Customer
                  </th>

                  <th className="w-[280px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Contact
                  </th>

                  <th className="w-[170px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Loyalty
                  </th>

                  <th className="w-[170px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Verification
                  </th>

                  <th className="w-[120px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="w-[230px] px-5 py-3.5 pr-6 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginatedCustomerList.map((customer) => {
                  const customerId = getCustomerId(customer);
                  const isActive = isCustomerActive(customer);

                  const isStatusLoading =
                    String(actionLoading?.id) === String(customerId) &&
                    actionLoading?.type === "status";

                  const anyActionLoading = Boolean(actionLoading);

                  return (
                    <tr
                      key={customerId || customer.email || customer.phone}
                      className="hover:bg-gray-50/70"
                    >
                      <td className="px-5 py-4 align-middle">
                        <div className="font-semibold text-gray-900">
                          {customer.fullName ||
                            customer.username ||
                            "No customer name"}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          @{customer.username || "no-username"} • ID #
                          {customerId || "N/A"}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <div className="text-sm text-gray-800">
                          {customer.email || "No email"}
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {customer.phone || "No phone"}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <div className="text-sm font-semibold text-gray-800">
                          {customer.loyaltyPoints ?? 0} points
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          {formatMoney(customer.totalSpent)}
                        </div>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <div className="flex flex-wrap gap-2">
                          <VerificationBadge
                            label="Email"
                            verified={customer.emailVerified}
                          />

                          <VerificationBadge
                            label="Phone"
                            verified={customer.phoneVerified}
                          />
                        </div>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                            isActive
                              ? "bg-green-50 text-green-700"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-5 py-4 pr-6 align-middle text-right">
                        <div className="inline-flex items-center justify-end gap-2 whitespace-nowrap">
                          <ActionLink
                            to={`/staff/customers/${customerId}`}
                            Icon={RiEyeLine}
                            label="View"
                          />

                          <ActionButton
                            label={
                              isStatusLoading
                                ? "Updating..."
                                : isActive
                                  ? "Deactivate"
                                  : "Activate"
                            }
                            loading={isStatusLoading}
                            disabled={anyActionLoading}
                            onClick={() => openStatusConfirmModal(customer)}
                            variant={isActive ? "danger" : "success"}
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

        {!loading && filteredCustomerList.length > 0 && (
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
                  {firstVisibleCustomerNumber}
                </span>
                -
                <span className="font-semibold text-gray-800">
                  {lastVisibleCustomerNumber}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800">
                  {filteredCustomerList.length}
                </span>{" "}
                customers
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

      {customerToConfirm && (
        <CustomerStatusConfirmModal
          customer={customerToConfirm}
          isLoading={
            String(actionLoading?.id) ===
              String(getCustomerId(customerToConfirm)) &&
            actionLoading?.type === "status"
          }
          onClose={closeStatusConfirmModal}
          onConfirm={() => handleToggleStatus(customerToConfirm)}
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

function ActionButton({ label, loading, disabled, onClick, variant = "neutral" }) {
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

function CustomerTableState({
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

function CustomerStatusConfirmModal({ customer, isLoading, onClose, onConfirm }) {
  const customerName =
    customer.fullName || customer.username || "this customer account";
  const customerEmail = customer.email || "No email";
  const customerPhone = customer.phone || "No phone";
  const active = isCustomerActive(customer);

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
                {actionLabel} Customer Account?
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Please confirm before you {actionText} this customer account.
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
          <div className="text-sm font-bold text-gray-900">{customerName}</div>

          <div className="mt-1 text-xs text-gray-500">{customerEmail}</div>

          <div className="mt-1 text-xs text-gray-500">{customerPhone}</div>
        </div>

        <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm leading-6 text-orange-800">
          {active
            ? "Deactivating this account will prevent the customer from logging in, using OTP login, resetting password, and accessing protected customer features."
            : "Activating this account will allow the customer to use their account again."}
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

function VerificationBadge({ label, verified }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
        verified ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
      }`}
    >
      {label}: {verified ? "Yes" : "No"}
    </span>
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

function getCustomerId(customer) {
  return customer?.customerId || customer?.id;
}

function isCustomerActive(customer) {
  if (typeof customer?.active === "boolean") return customer.active;
  if (typeof customer?.isActive === "boolean") return customer.isActive;
  if (typeof customer?.enabled === "boolean") return customer.enabled;

  const status = String(customer?.status || customer?.accountStatus || "")
    .trim()
    .toUpperCase();

  if (status === "ACTIVE") return true;
  if (status === "INACTIVE") return false;

  return false;
}

function formatMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "LKR 0";
  }

  return `LKR ${Number(value).toLocaleString()}`;
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