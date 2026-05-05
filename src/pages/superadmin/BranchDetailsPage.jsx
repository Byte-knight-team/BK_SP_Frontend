import { useEffect, useState } from "react";
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

export default function BranchDetailsPage() {
    /*
        Reads branch ID from route.
    */
    const { id } = useParams();

    /*
        Allows this page to update the shared layout header.
    */
    const { setHeaderInfo } = useOutletContext();

    /*
        Branch details states.
    */
    const [branch, setBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    /*
        Current logged-in user from AuthContext.
    */
    const { user } = useAuth();

    const loggedInRole = user?.roleName || user?.role || "";
    const isSuperAdmin = loggedInRole === "SUPER_ADMIN";

    /*
        Set page header.
    */
    useEffect(() => {
        setHeaderInfo({
            title: "Branch Details",
            description: "View branch information and status.",
            Icon: RiBuilding2Line,
        });

        return () => setHeaderInfo(null);
    }, [setHeaderInfo]);

    /*
        Load selected branch details.
        Calls: GET /api/admin/branches/{id}
    */
    const loadBranch = async () => {
        setLoading(true);
        setError("");

        const { data, error } = await getBranchByIdAPI(id);

        if (error) {
            setError(error);
            setBranch(null);
        } else {
            setBranch(data);
        }

        setLoading(false);
    };

    /*
        Load branch only when SUPER_ADMIN opens the page.
    */
    useEffect(() => {
        if (isSuperAdmin) {
            loadBranch();
        } else {
            setLoading(false);
        }
    }, [id, isSuperAdmin]);

    /*
        Safely read branch status.
        status: "ACTIVE" / "INACTIVE"
        Fallbacks:
        active: true / false
        isActive: true / false
    */
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

    /*
        Converts branch status into boolean for button/badge rendering.
    */
    const isBranchActive = (branchData) => {
        return getBranchStatus(branchData) === "ACTIVE";
    };

    /*
        Format created date safely.
    */
    const formatDate = (dateValue) => {
        if (!dateValue) return "N/A";

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return "N/A";
        }

        return date.toLocaleDateString();
    };

    /*
        Activate or deactivate the current branch.
    */
    const handleToggleStatus = async () => {
        if (!branch) return;

        const active = isBranchActive(branch);

        setActionLoading(true);
        setError("");
        setSuccessMessage("");

        const result = active
            ? await deactivateBranchAPI(id)
            : await activateBranchAPI(id);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccessMessage(
                active
                    ? "Branch deactivated successfully."
                    : "Branch activated successfully."
            );

            /*
                Reload branch after status update.
            */
            await loadBranch();
        }

        setActionLoading(false);
    };

    /*
        Frontend access protection.
        Backend also protects these endpoints.
    */
    if (!isSuperAdmin) {
        return (
            <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">No Access</h3>
                <p className="text-sm text-gray-500 mt-2">
                    Branch details are only available for SUPER_ADMIN users.
                </p>
            </div>
        );
    }

    /*
        Loading state.
    */
    if (loading) {
        return (
            <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm">
                <p className="text-sm text-gray-500">Loading branch details...</p>
            </div>
        );
    }

    /*
        Error / not found state.
    */
    if (error && !branch) {
        return (
            <div className="space-y-6">
                <Link
                    to="/staff/branches"
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                    <RiArrowLeftLine size={18} />
                    Back to Branches
                </Link>

                <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm">
                    <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600">
                        {error || "Branch not found."}
                    </div>
                </div>
            </div>
        );
    }

    const active = isBranchActive(branch);

    return (
        <div className="space-y-6">
            {/* Top action buttons */}
            <div className="flex items-center justify-between gap-4">
                <Link
                    to="/staff/branches"
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                    <RiArrowLeftLine size={18} />
                    Back to Branches
                </Link>

                <div className="flex items-center gap-3">
                    <Link
                        to={`/staff/branches/${id}/edit`}
                        className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        <RiEditLine size={18} />
                        Edit Branch
                    </Link>

                    <button
                        type="button"
                        disabled={actionLoading}
                        onClick={handleToggleStatus}
                        className={`rounded-2xl px-4 py-2 text-sm font-semibold disabled:opacity-50 ${
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

            {/* Success message */}
            {successMessage && (
                <div className="rounded-2xl bg-green-50 border border-green-100 px-4 py-3 text-sm font-medium text-green-700">
                    {successMessage}
                </div>
            )}

            {/* Error message */}
            {error && (
                <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600">
                    {error}
                </div>
            )}

            {/* Branch details card */}
            <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-5">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">
                            {branch?.name || "No branch name"}
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                            Branch ID: {branch?.id || branch?.branchId || id}
                        </p>
                    </div>

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Branch Name
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-2">
                            {branch?.name || "N/A"}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Email
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-2">
                            {branch?.email || "N/A"}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Contact Number
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-2">
                            {branch?.contactNumber || branch?.phone || "N/A"}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Created Date
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-2">
                            {formatDate(branch?.createdAt || branch?.createdDate)}
                        </p>
                    </div>

                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 md:col-span-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Address
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-2">
                            {branch?.address || "N/A"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}