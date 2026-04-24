import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import {
    RiBuilding2Line,
    RiArrowLeftLine,
    RiEditLine,
    RiSaveLine,
    RiRefreshLine,
} from "@remixicon/react";

import {
    getBranchByIdAPI,
    activateBranchAPI,
    deactivateBranchAPI,
} from "../../apis/staff/branches";

import {
    getBranchConfigAPI,
    updateBranchConfigAPI,
} from "../../apis/staff/systemConfig";

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
        useOutletContext comes from MainLayout.
        It lets this page update the shared page header.
    */
    const { setHeaderInfo } = useOutletContext();

    /*
        branch stores the selected branch details.
        loading controls the loading message for branch details.
        actionLoading controls activate/deactivate button state.
        error stores branch details / status action errors.
        successMessage stores branch details / status action success messages.
    */
    const [branch, setBranch] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    /*
        Branch order configuration state.

        This is branch-level configuration, so it belongs here in Branch Details.
        We are NOT adding operating hours frontend now because it is too much for code review.
    */
    const [branchConfig, setBranchConfig] = useState({
        deliveryFee: 0,
        deliveryEnabled: false,
        pickupEnabled: false,
        dineInEnabled: false,
        branchActiveForOrders: false,
    });

    /*
        Loading and message states only for branch configuration section.
        This keeps branch details messages separate from branch config messages.
    */
    const [configLoading, setConfigLoading] = useState(true);
    const [configSaving, setConfigSaving] = useState(false);
    const [configError, setConfigError] = useState("");
    const [configSuccessMessage, setConfigSuccessMessage] = useState("");

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
            description: "View branch information, status, and order configuration.",
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
        Load branch-level order configuration from backend.

        This calls:
        GET /api/admin/config/branches/{branchId}

        Example response:
        {
            deliveryFee,
            deliveryEnabled,
            pickupEnabled,
            dineInEnabled,
            branchActiveForOrders
        }
    */
    const loadBranchConfig = async () => {
        try {
            setConfigLoading(true);
            setConfigError("");
            setConfigSuccessMessage("");

            const data = await getBranchConfigAPI(id);

            setBranchConfig({
                deliveryFee: data?.deliveryFee ?? 0,
                deliveryEnabled: Boolean(data?.deliveryEnabled),
                pickupEnabled: Boolean(data?.pickupEnabled),
                dineInEnabled: Boolean(data?.dineInEnabled),
                branchActiveForOrders: Boolean(data?.branchActiveForOrders),
            });
        } catch (error) {
            setConfigError(
                error.message || "Failed to load branch order configuration."
            );
        } finally {
            setConfigLoading(false);
        }
    };

    /*
        When page opens, load branch details and branch configuration.

        Only SUPER_ADMIN should call these APIs.
    */
    useEffect(() => {
        if (isSuperAdmin) {
            loadBranch();
            loadBranchConfig();
        } else {
            setLoading(false);
            setConfigLoading(false);
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
        Convert input value to number safely before sending to backend.
    */
    const toNumber = (value) => {
        const numberValue = Number(value);

        if (Number.isNaN(numberValue)) {
            return 0;
        }

        return numberValue;
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
        Handle branch config number input changes.

        Currently this is mainly used for deliveryFee.
    */
    const handleConfigInputChange = (event) => {
        const { name, value } = event.target;

        setBranchConfig((previousConfig) => ({
            ...previousConfig,
            [name]: value,
        }));
    };

    /*
        Handle branch config checkbox changes.

        Used for:
        - deliveryEnabled
        - pickupEnabled
        - dineInEnabled
        - branchActiveForOrders
    */
    const handleConfigCheckboxChange = (event) => {
        const { name, checked } = event.target;

        setBranchConfig((previousConfig) => ({
            ...previousConfig,
            [name]: checked,
        }));
    };

    /*
        Save branch-level order configuration.

        This calls:
        PUT /api/admin/config/branches/{branchId}
    */
    const handleSaveBranchConfig = async (event) => {
        event.preventDefault();

        try {
            setConfigSaving(true);
            setConfigError("");
            setConfigSuccessMessage("");

            const payload = {
                deliveryFee: toNumber(branchConfig.deliveryFee),
                deliveryEnabled: Boolean(branchConfig.deliveryEnabled),
                pickupEnabled: Boolean(branchConfig.pickupEnabled),
                dineInEnabled: Boolean(branchConfig.dineInEnabled),
                branchActiveForOrders: Boolean(branchConfig.branchActiveForOrders),
            };

            await updateBranchConfigAPI(id, payload);

            setConfigSuccessMessage("Branch order configuration updated successfully.");

            /*
                Reload config after saving to keep frontend synced with backend.
            */
            await loadBranchConfig();
        } catch (error) {
            setConfigError(
                error.message || "Failed to update branch order configuration."
            );
        } finally {
            setConfigSaving(false);
        }
    };

    /*
        Reload branch configuration manually.
    */
    const handleReloadBranchConfig = async () => {
        await loadBranchConfig();
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

            {/* Branch order configuration card */}
            <form
                onSubmit={handleSaveBranchConfig}
                className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm"
            >
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-5">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">
                            Branch Order Configuration
                        </h3>

                        <p className="text-sm text-gray-500 mt-1">
                            Configure delivery fee and available order methods for this branch.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleReloadBranchConfig}
                        disabled={configLoading}
                        className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        <RiRefreshLine size={18} />
                        Reload
                    </button>
                </div>

                {/* Branch config success message */}
                {configSuccessMessage && (
                    <div className="mt-5 rounded-2xl bg-green-50 border border-green-100 px-4 py-3 text-sm font-medium text-green-700">
                        {configSuccessMessage}
                    </div>
                )}

                {/* Branch config error message */}
                {configError && (
                    <div className="mt-5 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600">
                        {configError}
                    </div>
                )}

                {configLoading ? (
                    <p className="text-sm text-gray-500 mt-6">
                        Loading branch order configuration...
                    </p>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                            {/* Delivery fee */}
                            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Delivery Fee
                                </label>

                                <input
                                    type="number"
                                    name="deliveryFee"
                                    value={branchConfig.deliveryFee}
                                    onChange={handleConfigInputChange}
                                    min="0"
                                    step="0.01"
                                    disabled={!branchConfig.deliveryEnabled}
                                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100 disabled:text-gray-400"
                                />

                                <p className="text-xs text-gray-400 mt-2">
                                    Delivery fee is used only when delivery is enabled.
                                </p>
                            </div>

                            {/* Branch active for orders */}
                            <label className="rounded-2xl bg-gray-50 border border-gray-100 p-4 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Active For Orders
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 mt-2">
                                        Allow this branch to receive customer orders.
                                    </p>
                                </div>

                                <input
                                    type="checkbox"
                                    name="branchActiveForOrders"
                                    checked={branchConfig.branchActiveForOrders}
                                    onChange={handleConfigCheckboxChange}
                                    className="h-5 w-5 rounded border-gray-300"
                                />
                            </label>

                            {/* Delivery enabled */}
                            <label className="rounded-2xl bg-gray-50 border border-gray-100 p-4 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Delivery
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 mt-2">
                                        Enable delivery orders for this branch.
                                    </p>
                                </div>

                                <input
                                    type="checkbox"
                                    name="deliveryEnabled"
                                    checked={branchConfig.deliveryEnabled}
                                    onChange={handleConfigCheckboxChange}
                                    className="h-5 w-5 rounded border-gray-300"
                                />
                            </label>

                            {/* Pickup enabled */}
                            <label className="rounded-2xl bg-gray-50 border border-gray-100 p-4 flex items-center justify-between gap-4">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Pickup
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 mt-2">
                                        Enable pickup orders for this branch.
                                    </p>
                                </div>

                                <input
                                    type="checkbox"
                                    name="pickupEnabled"
                                    checked={branchConfig.pickupEnabled}
                                    onChange={handleConfigCheckboxChange}
                                    className="h-5 w-5 rounded border-gray-300"
                                />
                            </label>

                            {/* Dine-in enabled */}
                            <label className="rounded-2xl bg-gray-50 border border-gray-100 p-4 flex items-center justify-between gap-4 md:col-span-2">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Dine-In
                                    </p>
                                    <p className="text-sm font-semibold text-gray-900 mt-2">
                                        Enable dine-in orders for this branch.
                                    </p>
                                </div>

                                <input
                                    type="checkbox"
                                    name="dineInEnabled"
                                    checked={branchConfig.dineInEnabled}
                                    onChange={handleConfigCheckboxChange}
                                    className="h-5 w-5 rounded border-gray-300"
                                />
                            </label>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={configSaving}
                                className="inline-flex items-center gap-2 rounded-2xl bg-orange-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-700 disabled:opacity-50"
                            >
                                <RiSaveLine size={18} />
                                {configSaving ? "Saving..." : "Save Branch Configuration"}
                            </button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
}