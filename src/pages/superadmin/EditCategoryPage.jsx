import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation, useOutletContext, useParams } from "react-router-dom";
import {
  RiLayoutGridLine,
  RiArrowLeftLine,
  RiSaveLine,
  RiShieldUserLine,
  RiCloseLine,
  RiErrorWarningLine,
} from "@remixicon/react";

import { useAuth } from "../../context/AuthContext";
import { getMenuCategoryByIdAPI, updateMenuCategoryAPI } from "../../apis/staff/category";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

export default function EditCategoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const context = useOutletContext();
  const setHeaderInfo = context?.setHeaderInfo;

  const categoryBasePath = location.pathname.startsWith("/admin")
    ? "/admin/categories"
    : "/staff/categories";

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [originalData, setOriginalData] = useState(null);

  const isDirty = originalData && (formData.name !== originalData.name || formData.description !== originalData.description);
  
  const [showModal, setShowModal] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState("");

  const { user } = useAuth();
  const loggedInRole = String(user?.roleName || user?.role || "").trim().replace(/^ROLE_/, "").toUpperCase();
  const canEdit = loggedInRole === "SUPER_ADMIN" || loggedInRole === "ADMIN";

  useEffect(() => {
    if (setHeaderInfo) {
      setHeaderInfo({
        title: "Edit Category",
        description: "Update the details of an existing menu category.",
        Icon: RiLayoutGridLine,
      });
    }
    return () => {
      if (setHeaderInfo) setHeaderInfo(null);
    };
  }, [setHeaderInfo]);

  useEffect(() => {
    const loadCategory = async () => {
      if (!canEdit) return;
      
      setLoading(true);
      setLoadError("");
      try {
        const data = await getMenuCategoryByIdAPI(id);
        const initial = {
          name: data?.name || data?.categoryName || "",
          description: data?.description || "",
        };
        setFormData(initial);
        setOriginalData(initial);
      } catch (error) {
        setLoadError(error.message || "Failed to load category details.");
        showErrorToast(error.message || "Failed to load category details.");
      } finally {
        setLoading(false);
      }
    };
    
    loadCategory();
  }, [id, canEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      return "Category name is required.";
    }
    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      showErrorToast(validationError);
      return;
    }

    setSaving(true);

    let normalizedName = formData.name.trim();
    if (normalizedName) {
      normalizedName = normalizedName.charAt(0).toUpperCase() + normalizedName.slice(1);
    }

    const payload = {
      name: normalizedName,
      description: formData.description.trim(),
    };

    try {
      await updateMenuCategoryAPI(id, payload);
      setOriginalData(formData);
      showSuccessToast("Category updated successfully.");
      navigate(categoryBasePath);
    } catch (error) {
      showErrorToast(error.message || "Failed to update category.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };

    const handleClick = (e) => {
      const target = e.target.closest("a");
      if (target && target.href) {
        const isInternal = target.href.startsWith(window.location.origin);
        const targetPath = target.pathname + target.search + target.hash;
        const currentPath = window.location.pathname + window.location.search + window.location.hash;
        
        if (isInternal && targetPath !== currentPath) {
          e.preventDefault();
          e.stopPropagation();
          setPendingPath(targetPath);
          setShowModal(true);
        }
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("click", handleClick, { capture: true });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, { capture: true });
    };
  }, [isDirty, navigate]);

  const handleConfirmLeave = () => {
    setShowModal(false);
    if (pendingPath) {
      navigate(pendingPath);
    }
  };

  const handleCancelLeave = () => {
    setShowModal(false);
    setPendingPath(null);
  };

  if (!canEdit) {
    return (
      <div className="max-w-5xl">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
          <EditCategoryState
            Icon={RiShieldUserLine}
            title="No Access"
            description="You do not have permission to edit categories."
            iconClassName="bg-red-50 text-red-600"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
        {/* Back link */}
        <div className="mb-6">
          <Link
            to={categoryBasePath}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-orange-600"
          >
            <RiArrowLeftLine size={18} />
            Back to categories
          </Link>
        </div>

        <div className="mb-6 border-b border-gray-100 pb-5">
          <h3 className="text-lg font-bold text-gray-900">Category Details</h3>
          <p className="mt-1 text-sm text-gray-500">
            Update the information for this menu category.
          </p>
        </div>
        
        {loading ? (
           <div className="py-12">
             <EditCategoryState
               Icon={RiLayoutGridLine}
               title="Loading category details"
               description="Please wait while we fetch the category information."
               iconClassName="bg-gray-100 text-gray-600"
               loading
             />
           </div>
        ) : loadError ? (
           <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
             {loadError}
           </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Category Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={saving}
                placeholder="Example: Beverages"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Description (Optional)
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={saving}
                placeholder="Example: Hot and cold drinks."
                rows="3"
                className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50 disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-700">
              Changes to this category will instantly reflect across all branches where it is visible.
            </div>

            <div className="flex items-center justify-end gap-3 pt-3">
              <Link
                to={categoryBasePath}
                className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <Spinner className="h-4 w-4 border-orange-200 border-t-white" />
                ) : (
                  <RiSaveLine size={18} />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>

      {showModal && (
        <UnsavedChangesModal
          onClose={handleCancelLeave}
          onConfirm={handleConfirmLeave}
        />
      )}
    </div>
  );
}

function UnsavedChangesModal({ onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm transition-all">
      <div
        className="w-full max-w-md animate-[scale-in_0.2s_ease-out] rounded-[1.5rem] bg-white p-6 shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <RiErrorWarningLine size={24} />
            </div>

            <div>
              <h3 className="text-base font-bold text-gray-900">
                Unsaved Changes
              </h3>
              <p className="mt-1 text-sm leading-6 text-gray-500">
                You have unsaved changes. Are you sure you want to leave this page without saving?
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <RiCloseLine size={18} />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-red-100 hover:bg-red-600"
          >
            Leave without saving
          </button>
        </div>
      </div>
    </div>
  );
}

function EditCategoryState({ Icon, title, description, iconClassName, loading = false }) {
  return (
    <div className="text-center">
      <div className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${iconClassName}`}>
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
    <span className={`inline-flex animate-spin rounded-full border-2 ${className}`} />
  );
}
