import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useLocation, useOutletContext, useParams } from "react-router-dom";
import {
  RiLayoutGridLine,
  RiArrowLeftLine,
  RiEditLine,
  RiErrorWarningLine,
} from "@remixicon/react";

import { useAuth } from "../../context/AuthContext";
import { getMenuCategoryByIdAPI } from "../../apis/staff/category";
import { showErrorToast } from "../../utils/toast";

export default function CategoryDetailsPage() {
  const { id } = useParams();
  const location = useLocation();
  const context = useOutletContext();
  const setHeaderInfo = context?.setHeaderInfo;

  const categoryBasePath = location.pathname.startsWith("/admin")
    ? "/admin/categories"
    : "/staff/categories";

  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const { user } = useAuth();
  const loggedInRole = String(user?.roleName || user?.role || "").trim().replace(/^ROLE_/, "").toUpperCase();
  const canEdit = loggedInRole === "SUPER_ADMIN" || loggedInRole === "ADMIN";

  useEffect(() => {
    if (setHeaderInfo) {
      setHeaderInfo({
        title: "Category Details",
        description: "View information about this menu category.",
        Icon: RiLayoutGridLine,
      });
    }
    return () => {
      if (setHeaderInfo) setHeaderInfo(null);
    };
  }, [setHeaderInfo]);

  const loadCategory = useCallback(async () => {
    setLoading(true);
    setPageError("");
    try {
      const data = await getMenuCategoryByIdAPI(id);
      setCategory(data);
    } catch (error) {
      setPageError(error.message || "Failed to load category details.");
      showErrorToast(error.message || "Failed to load category details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCategory();
  }, [loadCategory]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex min-h-[clamp(24rem,calc(100vh-15rem),44rem)] items-center justify-center rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
          <CategoryDetailsState
            Icon={RiLayoutGridLine}
            title="Loading category details"
            description="Please wait while the category information is loaded."
            iconClassName="bg-gray-100 text-gray-600"
            loading
          />
        </div>
      </div>
    );
  }

  if (pageError && !category) {
    return (
      <div className="w-full">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <Link
              to={categoryBasePath}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-orange-600"
            >
              <RiArrowLeftLine size={18} />
              Back to categories
            </Link>
          </div>
          <CategoryDetailsState
            Icon={RiErrorWarningLine}
            title="Unable to load category details"
            description={pageError || "Category not found."}
            iconClassName="bg-red-50 text-red-600"
          />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="w-full">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <Link
              to={categoryBasePath}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-orange-600"
            >
              <RiArrowLeftLine size={18} />
              Back to categories
            </Link>
          </div>
          <CategoryDetailsState
            Icon={RiLayoutGridLine}
            title="Category not found"
            description="The selected category could not be found."
            iconClassName="bg-gray-100 text-gray-600"
          />
        </div>
      </div>
    );
  }

  const active = category.status === "ACTIVE";

  return (
    <div className="w-full max-w-5xl">
      <section className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <Link
            to={categoryBasePath}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-orange-600"
          >
            <RiArrowLeftLine size={18} />
            Back to categories
          </Link>
        </div>

        <div className="flex flex-col gap-5 border-b border-gray-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="break-words text-2xl font-bold text-gray-900">
                {category.name || "No category name"}
              </h3>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${active
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
                  }`}
              >
                {active ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Category ID: {category.id || id}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canEdit && (
              <Link
                to={`${categoryBasePath}/${category.id || id}/edit`}
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
              >
                <RiEditLine size={18} />
                Edit Category
              </Link>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <InfoRow label="Category ID" value={category.id || id} />
          <InfoRow label="Category Name" value={category.name || "N/A"} />
          <InfoRow label="Description" value={category.description || "N/A"} />
          <InfoRow label="Created At" value={formatDate(category.createdAt)} />
          <InfoRow label="Status" value={category.status || "N/A"} />
        </div>
      </section>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-50 pb-3 sm:flex-row sm:items-center sm:gap-4 sm:border-0 sm:pb-0">
      <p className="w-40 shrink-0 text-sm font-semibold text-gray-500">{label}</p>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  );
}

function CategoryDetailsState({ Icon, title, description, iconClassName, loading = false }) {
  return (
    <div className="text-center py-12">
      <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${iconClassName}`}>
        {loading ? (
          <Spinner className="h-6 w-6 border-gray-300 border-t-orange-500" />
        ) : (
          <Icon size={24} />
        )}
      </div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500">{description}</p>
    </div>
  );
}

function Spinner({ className }) {
  return (
    <span className={`inline-flex animate-spin rounded-full border-2 ${className}`} />
  );
}
