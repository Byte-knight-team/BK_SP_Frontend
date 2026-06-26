import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import {
  RiBuilding2Line,
  RiArrowLeftLine,
  RiEditLine,
} from "@remixicon/react";

import {
  getBranchByIdAPI,
  activateBranchAPI,
  deactivateBranchAPI,
} from "../../apis/staff/branches";

import { useAuth } from "../../context/AuthContext";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

export default function BranchDetailsPage() {
  const { id } = useParams();
  const { setHeaderInfo } = useOutletContext();

  const [branch, setBranch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [pageError, setPageError] = useState("");

  const { user } = useAuth();

  const loggedInRole = user?.roleName || user?.role || "";
  const isSuperAdmin = loggedInRole === "SUPER_ADMIN";

  useEffect(() => {
    setHeaderInfo({
      title: "Branch Details",
      description: "View branch information and status.",
      Icon: RiBuilding2Line,
    });

    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  const loadBranch = useCallback(async () => {
    setLoading(true);
    setPageError("");

    const { data, error } = await getBranchByIdAPI(id);

    if (error) {
      setPageError(error);
      setBranch(null);
      showErrorToast(error);
    } else {
      setBranch(data);
    }

    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (isSuperAdmin) {
      loadBranch();
    } else {
      setLoading(false);
    }
  }, [id, isSuperAdmin, loadBranch]);

  const getBranchStatus = (branchData) => {
    if (!branchData) return "UNKNOWN";

    if (branchData.status) return branchData.status;

    if (typeof branchData.active === "boolean") {
      return branchData.active ? "ACTIVE" : "INACTIVE";
    }

    if (typeof branchData.isActive === "boolean") {
      return branchData.isActive ? "ACTIVE" : "INACTIVE";
    }

    return "UNKNOWN";
  };

  const isBranchActive = (branchData) => {
    return getBranchStatus(branchData) === "ACTIVE";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString();
  };

  const handleToggleStatus = async () => {
    if (!branch) return;

    const active = isBranchActive(branch);

    setActionLoading(true);

    const result = active
      ? await deactivateBranchAPI(id)
      : await activateBranchAPI(id);

    if (result.error) {
      showErrorToast(result.error);
      setActionLoading(false);
      return;
    }

    showSuccessToast(
      active
        ? "Branch deactivated successfully."
        : "Branch activated successfully."
    );

    await loadBranch();
    setActionLoading(false);
  };

  if (!isSuperAdmin) {
    return (
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900">No Access</h3>

        <p className="mt-2 text-sm text-gray-500">
          Branch details are only available for SUPER_ADMIN users.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
        <p className="text-sm text-gray-500">Loading branch details...</p>
      </div>
    );
  }

  if (pageError && !branch) {
    return (
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <Link
            to="/staff/branches"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-orange-600"
          >
            <RiArrowLeftLine size={18} />
            Back to branches
          </Link>
        </div>

        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          {pageError || "Branch not found."}
        </div>
      </div>
    );
  }

  const active = isBranchActive(branch);
  const branchId = branch?.id || branch?.branchId || id;

  return (
    <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <Link
          to="/staff/branches"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-orange-600"
        >
          <RiArrowLeftLine size={18} />
          Back to branches
        </Link>
      </div>

      <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-xl font-bold text-gray-900">
              {branch?.name || "No branch name"}
            </h3>

            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                active
                  ? "bg-green-50 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              {active ? "Active" : "Inactive"}
            </span>
          </div>

          <p className="mt-1 text-sm text-gray-500">Branch ID: {branchId}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to={`/staff/branches/${id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
          >
            <RiEditLine size={18} />
            Edit Branch
          </Link>

          <button
            type="button"
            disabled={actionLoading}
            onClick={handleToggleStatus}
            className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
              active
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-green-50 text-green-700 hover:bg-green-100"
            }`}
          >
            {actionLoading
              ? "Updating..."
              : active
                ? "Deactivate Branch"
                : "Activate Branch"}
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Branch Name
          </p>

          <p className="mt-2 text-sm font-semibold text-gray-900">
            {branch?.name || "N/A"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Email
          </p>

          <p className="mt-2 text-sm font-semibold text-gray-900">
            {branch?.email || "N/A"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Contact Number
          </p>

          <p className="mt-2 text-sm font-semibold text-gray-900">
            {branch?.contactNumber || branch?.phone || "N/A"}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Created Date
          </p>

          <p className="mt-2 text-sm font-semibold text-gray-900">
            {formatDate(branch?.createdAt || branch?.createdDate)}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 md:col-span-2">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Address
          </p>

          <p className="mt-2 text-sm font-semibold text-gray-900">
            {branch?.address || "N/A"}
          </p>
        </div>
      </div>
    </div>
  );
}