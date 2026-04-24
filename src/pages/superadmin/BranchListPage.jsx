import { useEffect, useState } from "react";
import { Link, useLocation, useOutletContext } from "react-router-dom";
import {
    RiBuilding2Line,
    RiAddLine,
    RiRefreshLine,
} from "@remixicon/react";

import {
    getAllBranchesAPI,
    activateBranchAPI,
    deactivateBranchAPI,
} from "../../apis/staff/branches";

export default function BranchListPage() {
    /*
        useLocation is used to read messages sent from another page.

        Example:
        After creating a branch, CreateBranchPage can redirect back to this page
        and send a success message like:
        navigate("/staff/branches", {
            state: { successMessage: "Branch created successfully." }
        });
    */
    const location = useLocation();

    /*
        useOutletContext is coming from MainLayout.

        In your layout system, child pages can update the top header by calling:
        setHeaderInfo({
            title,
            description,
            Icon
        });
    */
    const { setHeaderInfo } = useOutletContext();

    /*
        branchList stores the branches loaded from the backend.
        loading controls the "Loading branches..." message.
        actionLoadingId stores the branch ID currently being activated/deactivated.
        error stores error messages.
        successMessage stores success messages.
    */
    const [branchList, setBranchList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    /*
        Read the logged-in user from localStorage.

        Your login system stores authUser in localStorage.
        Some parts may use roleName, some may use role.
        So this supports both.
    */
    const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
    const loggedInRole = authUser.roleName || authUser.role || "";

    /*
        Branch Management should only be available to SUPER_ADMIN.

        Backend already protects this,
        but this frontend check helps show a clean "No Access" message
        instead of letting ADMIN users see a broken page.
    */
    const isSuperAdmin = loggedInRole === "SUPER_ADMIN";

    /*
        If another page redirects here with a success message,
        show that message at the top of the page.
    */
    useEffect(() => {
        if (location.state?.successMessage) {
            setSuccessMessage(location.state.successMessage);
        }
    }, [location.state]);

    /*
        Set the header information for this page.

        This appears in the shared layout header area.
        When this page unmounts, we clear the header info.
    */
    useEffect(() => {
        setHeaderInfo({
            title: "Branch Management",
            description: "Create, view, activate, deactivate, and manage restaurant branches.",
            Icon: RiBuilding2Line,
        });

        return () => setHeaderInfo(null);
    }, [setHeaderInfo]);

    /*
        Load all branches from the backend.

        This calls:
        GET /api/admin/branches
    */
    const loadBranches = async () => {
        setLoading(true);
        setError("");

        const { data, error } = await getAllBranchesAPI();

        if (error) {
            setError(error);
            setBranchList([]);
        } else {
            /*
                Make sure the branch list is always an array.

                If backend returns something unexpected,
                the page will not crash.
            */
            setBranchList(Array.isArray(data) ? data : []);
        }

        setLoading(false);
    };

    /*
        Load branches when the page opens.

        Only SUPER_ADMIN should call the branch API.
        If ADMIN opens this page, we stop loading and show No Access.
    */
    useEffect(() => {
        if (isSuperAdmin) {
            loadBranches();
        } else {
            setLoading(false);
        }
    }, [isSuperAdmin]);

    /*
        Get branch ID safely.

        Backend may return id or branchId depending on response DTO.
        This supports both names.
    */
    const getBranchId = (branch) => {
        return branch.id || branch.branchId;
    };

    /*
        Get branch status safely.

        Main expected backend value:
        status: "ACTIVE" or "INACTIVE"

        Fallback values:
        active: true / false
        isActive: true / false
    */
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

    /*
        Convert branch status into a true/false value.

        This makes button and badge rendering easier.
    */
    const isBranchActive = (branch) => {
        return getBranchStatus(branch) === "ACTIVE";
    };

    /*
        Format date for display.

        If createdAt is missing or invalid,
        show N/A instead of crashing.
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
        Activate or deactivate a branch.

        If branch is active:
        PATCH /api/admin/branches/{id}/deactivate

        If branch is inactive:
        PATCH /api/admin/branches/{id}/activate
    */
    const handleToggleStatus = async (branch) => {
        const branchId = getBranchId(branch);
        const active = isBranchActive(branch);

        if (!branchId) {
            setError("Branch ID not found in response.");
            return;
        }

        setActionLoadingId(branchId);
        setError("");
        setSuccessMessage("");

        const result = active
            ? await deactivateBranchAPI(branchId)
            : await activateBranchAPI(branchId);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccessMessage(
                active ? "Branch deactivated successfully." : "Branch activated successfully."
            );

            /*
                Reload branch list after status change,
                so the table shows the latest status from backend.
            */
            await loadBranches();
        }

        setActionLoadingId(null);
    };

    /*
        Frontend access protection.

        ADMIN users should not manage branches.
        Backend protects it too, but this gives a cleaner UI.
    */
    if (!isSuperAdmin) {
        return (
            <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">No Access</h3>
                <p className="text-sm text-gray-500 mt-2">
                    Branch Management is only available for SUPER_ADMIN users.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Top card with title, description, refresh button, and create button */}
            <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Restaurant Branches</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage restaurant branches used by staff and branch-level operations.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Reload branch list manually */}
                        <button
                            type="button"
                            onClick={loadBranches}
                            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            <RiRefreshLine size={18} />
                            Refresh
                        </button>

                        {/* Go to create branch page */}
                        <Link
                            to="/staff/branches/create"
                            className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600"
                        >
                            <RiAddLine size={18} />
                            Create Branch
                        </Link>
                    </div>
                </div>

                {/* Error message box */}
                {error && (
                    <div className="mt-5 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600">
                        {error}
                    </div>
                )}

                {/* Success message box */}
                {successMessage && (
                    <div className="mt-5 rounded-2xl bg-green-50 border border-green-100 px-4 py-3 text-sm font-medium text-green-700">
                        {successMessage}
                    </div>
                )}
            </div>

            {/* Branch table card */}
            <div className="bg-white border border-gray-100 rounded-[1.5rem] shadow-sm overflow-hidden">
                {loading ? (
                    /*
                        Show this while waiting for backend response.
                    */
                    <div className="p-8 text-sm text-gray-500">Loading branches...</div>
                ) : branchList.length === 0 ? (
                    /*
                        Show this if backend returns an empty list.
                    */
                    <div className="p-8 text-sm text-gray-500">No branches found.</div>
                ) : (
                    /*
                        Branch list table.
                    */
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Branch
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Contact
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Address
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Created
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
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
                                            {/* Branch name and ID */}
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">
                                                    {branch.name || "No branch name"}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    ID: {branchId || "N/A"}
                                                </div>
                                            </td>

                                            {/* Branch email and contact number */}
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-800">
                                                    {branch.email || "No email"}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {branch.contactNumber || branch.phone || "No contact number"}
                                                </div>
                                            </td>

                                            {/* Branch address */}
                                            <td className="px-6 py-4 text-sm text-gray-700 max-w-xs">
                                                {branch.address || "No address"}
                                            </td>

                                            {/* Created date */}
                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {formatDate(branch.createdAt || branch.createdDate)}
                                            </td>

                                            {/* Active / inactive badge */}
                                            <td className="px-6 py-4">
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

                                            {/* Row action buttons */}
                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    {/* Open branch details page */}
                                                    <Link
                                                        to={`/staff/branches/${branchId}`}
                                                        className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                                    >
                                                        View
                                                    </Link>

                                                    {/* Open branch edit page */}
                                                    <Link
                                                        to={`/staff/branches/${branchId}/edit`}
                                                        className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Edit
                                                    </Link>

                                                    {/* Activate or deactivate branch */}
                                                    <button
                                                        type="button"
                                                        disabled={isActionLoading}
                                                        onClick={() => handleToggleStatus(branch)}
                                                        className={`rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
                                                            active
                                                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                                : "bg-green-50 text-green-700 hover:bg-green-100"
                                                        }`}
                                                    >
                                                        {active ? "Deactivate" : "Activate"}
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