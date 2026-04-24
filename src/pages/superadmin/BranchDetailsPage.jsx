import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
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

export default function BranchDetailsPage() {
    /*
        useParams reads route parameters.

        For this route:
        /staff/branches/:id

        useParams gives us:
        { id: "1" }
    */
    const { id } = useParams();

    /*
        useNavigate lets us redirect if needed.
        We may use it later if branch is not found or after an action.
    */
    const navigate = useNavigate();

    /*
        useOutletContext comes from MainLayout.
        It lets this page update the shared page header.
    */
    const { setHeaderInfo } = useOutletContext();

    /*
        branch stores the selected branch details.
        loading controls the loading message.
        actionLoading controls activate/deactivate button state.
        error stores error messages.
        successMessage stores success messages.
    */
    const [branch, setBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    /*
        Read logged-in user role from localStorage.

        Branch Management is SUPER_ADMIN only.
    */
    const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
    const loggedInRole = authUser.roleName || authUser.role || "";
    const isSuperAdmin = loggedInRole === "SUPER_ADMIN";

    /*
        Set page header information for the shared layout.
    */
    useEffect(() => {
        setHeaderInfo({
            title: "Branch Details",
            description: "View restaurant branch information and current status.",
            Icon: RiBuilding2Line,
        });

        return () => setHeaderInfo(null);
    }, [setHeaderInfo]);

    /*
        Load one branch from backend.

        This calls:
        GET /api/admin/branches/{id}
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
        When page opens, load branch details.

        Only SUPER_ADMIN should call this API.
    */
    useEffect(() => {
        if (isSuperAdmin) {
            loadBranch();
        } else {
            setLoading(false);
        }
    }, [id, isSuperAdmin]);

    /*
        Safely get branch status.

        Main expected backend response:
        status: "ACTIVE" or "INACTIVE"

        Fallback:
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
        Convert branch status into true or false.
        This is easier for button and badge rendering.
    */
    const isBranchActive = (branchData) => {
        return getBranchStatus(branchData) === "ACTIVE";
    };

    /*
        Format date safely.

        If date is missing or invalid, show N/A.
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

        If branch is active:
        PATCH /api/admin/branches/{id}/deactivate

        If branch is inactive:
        PATCH /api/admin/branches/{id}/activate
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
                active ? "Branch deactivated successfully." : "Branch activated successfully."
            );

            /*
                Reload branch details after status update,
                so the page shows latest backend data.
            */
            await loadBranch();
        }

        setActionLoading(false);
    };

    /*
        Frontend access protection.

        Backend already protects the endpoint,
        but this gives a cleaner message.
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
        Loading state while branch details are being fetched.
    */
    if (loading) {
        return (
            <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm">
                <p className="text-sm text-gray-500">Loading branch details...</p>
            </div>
        );
    }

    /*
        Error or branch not found state.
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
                    {/* Go to edit branch page */}
                    <Link
                        to={`/staff/branches/${id}/edit`}
                        className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                    >
                        <RiEditLine size={18} />
                        Edit Branch
                    </Link>

                    {/* Activate or deactivate branch */}
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

            {/* Main branch details card */}
            <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm">
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-5">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">
                            {branch.name || "No branch name"}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Branch ID: {branch.id || branch.branchId || id}
                        </p>
                    </div>

                    {/* Status badge */}
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

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                    {/* Branch name */}
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Branch Name
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-2">
                            {branch.name || "N/A"}
                        </p>
                    </div>

                    {/* Email */}
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Email
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-2">
                            {branch.email || "N/A"}
                        </p>
                    </div>

                    {/* Contact number */}
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Contact Number
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-2">
                            {branch.contactNumber || branch.phone || "N/A"}
                        </p>
                    </div>

                    {/* Created date */}
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Created Date
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-2">
                            {formatDate(branch.createdAt || branch.createdDate)}
                        </p>
                    </div>

                    {/* Address */}
                    <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 md:col-span-2">
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                            Address
                        </p>
                        <p className="text-sm font-semibold text-gray-900 mt-2">
                            {branch.address || "N/A"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}