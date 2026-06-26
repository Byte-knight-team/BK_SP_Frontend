import { useEffect, useState } from "react";
import { Link, useLocation, useOutletContext } from "react-router-dom";
import { RiBuilding2Line, RiAddLine } from "@remixicon/react";

import {
  getAllBranchesAPI,
  activateBranchAPI,
  deactivateBranchAPI,
} from "../../apis/staff/branches";

import { useAuth } from "../../context/AuthContext";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

export default function BranchListPage() {
  const location = useLocation();
  const { setHeaderInfo } = useOutletContext();

  const [branchList, setBranchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [loadError, setLoadError] = useState("");

  const { user } = useAuth();

  const loggedInRole = user?.roleName || user?.role || "";
  const isSuperAdmin = loggedInRole === "SUPER_ADMIN";

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

  const getBranchId = (branch) => {
    return branch.id || branch.branchId;
  };

  const getBranchStatus = (branch) => {
    if (branch.status) return branch.status;

    if (typeof branch.active === "boolean") {
      return branch.active ? "ACTIVE" : "INACTIVE";
    }

    if (typeof branch.isActive === "boolean") {
      return branch.isActive ? "ACTIVE" : "INACTIVE";
    }

    return "UNKNOWN";
  };

  const isBranchActive = (branch) => {
    return getBranchStatus(branch) === "ACTIVE";
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString();
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
  };

  if (!isSuperAdmin) {
    return (
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900">No Access</h3>

        <p className="mt-2 text-sm text-gray-500">
          Branch Management is only available for SUPER_ADMIN users.
        </p>
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
            to="/staff/branches/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600"
          >
            <RiAddLine size={18} />
            Create Branch
          </Link>
        </div>

        {loadError && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            {loadError}
          </div>
        )}
      </div>

      {/* Branch table card */}
      <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
        {loading ? (
          <div className="p-8 text-sm text-gray-500">Loading branches...</div>
        ) : branchList.length === 0 ? (
          <div className="p-8 text-sm text-gray-500">No branches found.</div>
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

                  <th className="w-[250px] px-5 py-3.5 pr-6 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {branchList.map((branch) => {
                  const branchId = getBranchId(branch);
                  const active = isBranchActive(branch);
                  const isActionLoading = actionLoadingId === branchId;

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
                          <Link
                            to={`/staff/branches/${branchId}`}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            View
                          </Link>

                          <Link
                            to={`/staff/branches/${branchId}/edit`}
                            className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                          >
                            Edit
                          </Link>

                          <button
                            type="button"
                            disabled={isActionLoading}
                            onClick={() => handleToggleStatus(branch)}
                            className={`rounded-xl px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                              active
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            {isActionLoading
                              ? "Updating..."
                              : active
                                ? "Deactivate"
                                : "Activate"}
                          </button>
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