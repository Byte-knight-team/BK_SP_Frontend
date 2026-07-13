import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useOutletContext } from "react-router-dom";
import {
  RiLayoutGridLine,
  RiAddLine,
  RiSearchLine,
  RiErrorWarningLine,
  RiCloseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiEditLine,
  RiEyeLine,
  RiRefreshLine,
} from "@remixicon/react";
import { getMenuCategoriesAPI, toggleMenuCategoryStatusAPI } from "../../apis/staff/category";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

export default function CategoryManagementPage() {
  const location = useLocation();
  const categoryBasePath = location.pathname.startsWith("/admin")
    ? "/admin/categories"
    : "/staff/categories";

  const context = useOutletContext();
  const setHeaderInfo = context?.setHeaderInfo;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [loadError, setLoadError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [categoryToConfirm, setCategoryToConfirm] = useState(null);

  const filteredCategories = useMemo(() => {
    const cleanSearch = searchTerm.trim().toLowerCase();

    return categories.filter((category) => {
      const isIdMatch = String(category.id).toLowerCase() === cleanSearch;

      const searchableText = [
        category.name,
        category.description,
      ].filter(Boolean).join(" ").toLowerCase();

      const matchesSearch = !cleanSearch || isIdMatch || searchableText.includes(cleanSearch);

      const matchesStatus =
        !statusFilter ||
        (statusFilter === "ACTIVE" && category.isActive) ||
        (statusFilter === "INACTIVE" && !category.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  const totalPages =
    filteredCategories.length === 0
      ? 0
      : Math.ceil(filteredCategories.length / pageSize);

  const safeCurrentPage =
    totalPages === 0 ? 1 : Math.min(currentPage, totalPages);

  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const paginatedCategories = useMemo(() => {
    return filteredCategories.slice(startIndex, endIndex);
  }, [filteredCategories, startIndex, endIndex]);

  const firstVisibleCategoryNumber =
    filteredCategories.length === 0 ? 0 : startIndex + 1;

  const lastVisibleCategoryNumber = Math.min(
    endIndex,
    filteredCategories.length
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

  useEffect(() => {
    if (setHeaderInfo) {
      setHeaderInfo({
        title: "Category Management",
        description: "Manage all menu categories. Categories are global and available in all branches.",
        Icon: RiLayoutGridLine,
      });
    }
    return () => {
      if (setHeaderInfo) setHeaderInfo(null);
    };
  }, [setHeaderInfo]);

  const loadCategories = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const data = await getMenuCategoriesAPI();
      setCategories(Array.isArray(data) ? data : []);
      setLoading(false);
      return true;
    } catch (error) {
      const msg = error.message || "Failed to load categories.";
      setLoadError(msg);
      setCategories([]);
      showErrorToast(msg);
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleRefreshCategories = async () => {
    const success = await loadCategories();
    if (success) {
      showSuccessToast("Categories refreshed successfully.");
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("");
  };

  const openStatusConfirmModal = (category) => {
    setCategoryToConfirm(category);
  };

  const closeStatusConfirmModal = () => {
    if (actionLoadingId) return;
    setCategoryToConfirm(null);
  };

  const goToPreviousPage = () => {
    setCurrentPage((page) => Math.max(page - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage((page) => Math.min(page + 1, totalPages));
  };

  const handleToggleStatus = async (category) => {
    const categoryId = category.id;
    const active = category.isActive;

    if (!categoryId) {
      showErrorToast("Category ID not found.");
      return;
    }

    setActionLoadingId(categoryId);

    try {
      await toggleMenuCategoryStatusAPI(categoryId, !active);
      setCategories((prevCategories) =>
        prevCategories.map((c) =>
          c.id === categoryId ? { ...c, isActive: !active } : c
        )
      );
      showSuccessToast(
        active
          ? "Category deactivated successfully."
          : "Category activated successfully."
      );
    } catch (error) {
      showErrorToast(error.message || "Failed to update category status.");
    } finally {
      setActionLoadingId(null);
      setCategoryToConfirm(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top card */}
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Menu Categories
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Manage all menu categories available in the system.
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Total categories:{" "}
              <span className="font-semibold text-gray-800">
                {categories.length}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleRefreshCategories}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Spinner className="h-4 w-4 border-gray-300 border-t-orange-500" />
              ) : (
                <RiRefreshLine size={18} />
              )}

              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <Link
              to={`${categoryBasePath}/create`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600"
            >
              <RiAddLine size={18} />
              Create Category
            </Link>
          </div>
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
                placeholder="Search categories by name,ID or description..."
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
                {filteredCategories.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-gray-800">
                {categories.length}
              </span>{" "}
              categories
            </p>

            {hasActiveFilters && (
              <p className="text-xs font-medium text-orange-600">
                Filters are applied to the loaded category list.
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

      {/* Category table card */}
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-3 shadow-sm">
        {loading ? (
          <CategoryTableState
            Icon={RiLayoutGridLine}
            title="Loading categories"
            description="Please wait while menu categories are loaded."
            iconClassName="bg-gray-100 text-gray-600"
            loading
          />
        ) : categories.length === 0 ? (
          <CategoryTableState
            Icon={RiLayoutGridLine}
            title="No categories found"
            description="Create your first category to start managing your menu."
            iconClassName="bg-gray-100 text-gray-600"
          />
        ) : filteredCategories.length === 0 ? (
          <CategoryTableState
            Icon={RiSearchLine}
            title="No matching categories found"
            description="Try changing the search text or filters to find the category you need."
            iconClassName="bg-orange-50 text-orange-600"
          />
        ) : (
          <div className="overflow-x-auto rounded-xl">
            <table className="w-full min-w-[800px] text-left">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="w-[120px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    ID
                  </th>

                  <th className="w-[200px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Category Name
                  </th>

                  <th className="w-[300px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Description
                  </th>

                  <th className="w-[120px] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Status
                  </th>

                  <th className="w-[180px] px-5 py-3.5 pr-6 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {paginatedCategories.map((category) => {
                  const categoryId = category.id;
                  const active = category.isActive;
                  const isActionLoading = String(actionLoadingId) === String(categoryId);
                  const anyActionLoading = Boolean(actionLoadingId);

                  return (
                    <tr
                      key={categoryId}
                      className="hover:bg-gray-50/70"
                    >
                      <td className="px-5 py-4 align-middle">
                        <div className="font-semibold text-gray-900 transition-colors hover:text-orange-600">
                          <Link to={`${categoryBasePath}/${categoryId}`}>#{categoryId}</Link>
                        </div>
                      </td>

                      <td className="px-5 py-4 align-middle">
                        <div className="font-semibold text-gray-900 transition-colors hover:text-orange-600">
                          <Link to={`${categoryBasePath}/${categoryId}`}>{category.name}</Link>
                        </div>
                      </td>

                      <td className="px-5 py-4 align-middle text-sm text-gray-700">
                        <div className="max-w-[280px] truncate">
                          {category.description || "-"}
                        </div>
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
                          <Link
                            to={`${categoryBasePath}/${categoryId}`}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                          >
                            <RiEyeLine size={15} />
                            View
                          </Link>

                          <Link
                            to={`${categoryBasePath}/${categoryId}/edit`}
                            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                          >
                            <RiEditLine size={15} />
                            Edit
                          </Link>

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
                            onClick={() => openStatusConfirmModal(category)}
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

        {!loading && filteredCategories.length > 0 && (
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
                  {firstVisibleCategoryNumber}
                </span>
                -
                <span className="font-semibold text-gray-800">
                  {lastVisibleCategoryNumber}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-800">
                  {filteredCategories.length}
                </span>{" "}
                categories
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

      {categoryToConfirm && (
        <CategoryStatusConfirmModal
          category={categoryToConfirm}
          isLoading={String(actionLoadingId) === String(categoryToConfirm.id)}
          onClose={closeStatusConfirmModal}
          onConfirm={() => handleToggleStatus(categoryToConfirm)}
        />
      )}
    </div>
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

function CategoryTableState({
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

function CategoryStatusConfirmModal({ category, isLoading, onClose, onConfirm }) {
  const categoryId = category.id;
  const categoryName = category.name || "this category";
  const active = category.isActive;

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
                {actionLabel} Category?
              </h3>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Please confirm before you {actionText} this category.
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
          <div className="text-sm font-bold text-gray-900">{categoryName}</div>

          <div className="mt-1 text-xs text-gray-500">
            ID: #{categoryId}
          </div>

          <div className="mt-3 text-xs text-gray-600">
            <span className="font-semibold text-gray-800">Description:</span>{" "}
            {category.description || "No description"}
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm leading-6 text-orange-800">
          {active
            ? "Deactivating this category will hide it from active menus. Menu items under this category might also be affected."
            : "Activating this category will make it visible again in active menus."}
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
            {actionLabel}
          </button>
        </div>
      </div>
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

function getVisiblePageNumbers(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, 4, 5];
  if (current >= total - 2) return [total - 4, total - 3, total - 2, total - 1, total];
  return [current - 2, current - 1, current, current + 1, current + 2];
}
