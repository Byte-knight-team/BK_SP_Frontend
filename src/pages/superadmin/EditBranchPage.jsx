import { useCallback, useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import {
    RiBuilding2Line,
    RiArrowLeftLine,
    RiSaveLine,
    RiErrorWarningLine,
    RiShieldUserLine,
} from "@remixicon/react";

import {
    getBranchByIdAPI,
    updateBranchAPI,
} from "../../apis/staff/branches";

import {
    getBranchConfigAPI,
    updateBranchConfigAPI,
} from "../../apis/staff/systemConfig";

import { useAuth } from "../../context/AuthContext";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

const DEFAULT_BRANCH_CONFIG = {
    deliveryFee: 0,
    deliveryEnabled: false,
    pickupEnabled: false,
    dineInEnabled: false,
    branchActiveForOrders: false,
};

export default function EditBranchPage() {
    const { id } = useParams();
    const { setHeaderInfo } = useOutletContext();

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        contactNumber: "",
        email: "",
    });

    const [branchConfig, setBranchConfig] = useState(DEFAULT_BRANCH_CONFIG);

    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");

    const [saving, setSaving] = useState(false);
    const [configLoading, setConfigLoading] = useState(true);
    const [configSaving, setConfigSaving] = useState(false);
    const [configError, setConfigError] = useState("");

    const { user } = useAuth();

    const loggedInRole = user?.roleName || user?.role || "";
    const isSuperAdmin = loggedInRole === "SUPER_ADMIN";

    useEffect(() => {
        setHeaderInfo({
            title: "Edit Branch",
            description: "Update branch information and branch order configuration.",
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
            showErrorToast(error);
        } else {
            setFormData({
                name: data?.name || "",
                address: data?.address || "",
                contactNumber: data?.contactNumber || data?.phone || "",
                email: data?.email || "",
            });
        }

        setLoading(false);
    }, [id]);

    const loadBranchConfig = useCallback(async () => {
        setConfigLoading(true);
        setConfigError("");

        try {
            const data = await getBranchConfigAPI(id);
            setBranchConfig(normalizeBranchConfig(data));
        } catch (error) {
            const message =
                error.message || "Failed to load branch order configuration.";

            setConfigError(message);
            showErrorToast(message);
            setBranchConfig(DEFAULT_BRANCH_CONFIG);
        } finally {
            setConfigLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (isSuperAdmin) {
            loadBranch();
            loadBranchConfig();
        } else {
            setLoading(false);
            setConfigLoading(false);
        }
    }, [id, isSuperAdmin, loadBranch, loadBranchConfig]);

    const cleanContactNumber = (value) => {
        const cleaned = value.replace(/[^\d+]/g, "");

        if (!cleaned.includes("+")) {
            return cleaned;
        }

        return `+${cleaned.replace(/\+/g, "")}`;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        const cleanedValue =
            name === "contactNumber" ? cleanContactNumber(value) : value;

        setFormData((previousData) => ({
            ...previousData,
            [name]: cleanedValue,
        }));
    };

    const handleConfigInputChange = (event) => {
        const { name, value } = event.target;

        setBranchConfig((previousConfig) => ({
            ...previousConfig,
            [name]: value,
        }));
    };

    const handleConfigCheckboxChange = (event) => {
        const { name, checked } = event.target;

        setBranchConfig((previousConfig) => ({
            ...previousConfig,
            [name]: checked,
        }));
    };

    const toNumber = (value) => {
        const numberValue = Number(value);
        return Number.isNaN(numberValue) ? 0 : numberValue;
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
            return "Branch name is required.";
        }

        if (!formData.address.trim()) {
            return "Branch address is required.";
        }

        if (!formData.contactNumber.trim()) {
            return "Contact number is required.";
        }

        if (!formData.email.trim()) {
            return "Branch email is required.";
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email.trim())) {
            return "Please enter a valid branch email address.";
        }

        const phoneRegex = /^\+?\d{10,15}$/;

        if (!phoneRegex.test(formData.contactNumber.trim())) {
            return "Contact number is invalid.";
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

        const payload = {
            name: formData.name.trim(),
            address: formData.address.trim(),
            contactNumber: formData.contactNumber.trim(),
            email: formData.email.trim(),
        };

        const { error } = await updateBranchAPI(id, payload);

        setSaving(false);

        if (error) {
            showErrorToast(error);
            return;
        }

        showSuccessToast("Branch details updated successfully.");
    };

    const validateBranchConfig = () => {
        const deliveryFee = toNumber(branchConfig.deliveryFee);

        if (deliveryFee < 0) {
            return "Delivery fee cannot be negative.";
        }

        return "";
    };

    const handleSaveBranchConfig = async (event) => {
        event.preventDefault();

        const validationError = validateBranchConfig();

        if (validationError) {
            showErrorToast(validationError);
            return;
        }

        setConfigSaving(true);
        setConfigError("");

        try {
            const payload = {
                deliveryFee: toNumber(branchConfig.deliveryFee),
                deliveryEnabled: Boolean(branchConfig.deliveryEnabled),
                pickupEnabled: Boolean(branchConfig.pickupEnabled),
                dineInEnabled: Boolean(branchConfig.dineInEnabled),
                branchActiveForOrders: Boolean(branchConfig.branchActiveForOrders),
            };

            await updateBranchConfigAPI(id, payload);

            showSuccessToast("Branch order configuration updated successfully.");
            await loadBranchConfig();
        } catch (error) {
            const message =
                error.message || "Failed to update branch order configuration.";

            setConfigError(message);
            showErrorToast(message);
        } finally {
            setConfigSaving(false);
        }
    };

    if (!isSuperAdmin) {
        return (
            <div className="max-w-5xl">
                <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
                    <EditBranchState
                        Icon={RiShieldUserLine}
                        title="No Access"
                        description="Only SUPER_ADMIN users can edit branches."
                        iconClassName="bg-red-50 text-red-600"
                    />
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="max-w-5xl">
                <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
                    <EditBranchState
                        Icon={RiBuilding2Line}
                        title="Loading branch edit form"
                        description="Please wait while branch details and order configuration are loaded."
                        iconClassName="bg-gray-100 text-gray-600"
                        loading
                    />
                </div>
            </div>
        );
    }

    if (pageError) {
        return (
            <div className="max-w-5xl">
                <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
                    <BackToBranchesLink />

                    <EditBranchState
                        Icon={RiErrorWarningLine}
                        title="Unable to load branch details"
                        description={pageError}
                        iconClassName="bg-red-50 text-red-600"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl space-y-6">
            <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
                <BackToBranchDetailsLink id={id} />

                <div className="mb-5 border-b border-gray-100 pb-5">
                    <h3 className="text-xl font-bold text-gray-900">Branch Details</h3>

                    <p className="mt-1 text-sm text-gray-500">
                        Update branch name, address, contact number, and email.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Branch Name
                        </label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Example: Maharagama Branch"
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-semibold text-gray-700">
                            Address
                        </label>

                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Example: 123 High Level Road, Maharagama"
                            rows="3"
                            className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Contact Number
                            </label>

                            <input
                                type="text"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                placeholder="Example: +94771234567"
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-gray-700">
                                Email
                            </label>

                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Example: maharagama@cravehouse.com"
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-3">
                        <Link
                            to={`/staff/branches/${id}`}
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
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-200 border-t-white" />
                            ) : (
                                <RiSaveLine size={18} />
                            )}

                            {saving ? "Saving..." : "Save Branch Details"}
                        </button>
                    </div>
                </form>
            </div>

            <form
                onSubmit={handleSaveBranchConfig}
                className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm"
            >
                <div className="border-b border-gray-100 pb-5">
                    <h3 className="text-xl font-bold text-gray-900">
                        Branch Order Configuration
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                        Configure delivery fee and available order methods for this branch.
                    </p>
                </div>

                {configError && (
                    <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm font-medium text-red-600">{configError}</p>

                            <button
                                type="button"
                                onClick={loadBranchConfig}
                                disabled={configLoading}
                                className="inline-flex w-fit items-center justify-center rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {configLoading ? (
                    <div className="mt-6">
                        <EditBranchState
                            Icon={RiBuilding2Line}
                            title="Loading branch order configuration"
                            description="Please wait while delivery and order method settings are loaded."
                            iconClassName="bg-gray-100 text-gray-600"
                            loading
                        />
                    </div>
                ) : (
                    <>
                        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
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
                                    disabled={!branchConfig.deliveryEnabled || configSaving}
                                    className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100 disabled:text-gray-400"
                                />

                                <p className="mt-2 text-xs text-gray-400">
                                    Delivery fee is used only when delivery is enabled.
                                </p>
                            </div>

                            <ConfigToggleCard
                                name="branchActiveForOrders"
                                label="Active For Orders"
                                description="Allow this branch to receive customer orders."
                                checked={branchConfig.branchActiveForOrders}
                                disabled={configSaving}
                                onChange={handleConfigCheckboxChange}
                            />

                            <ConfigToggleCard
                                name="deliveryEnabled"
                                label="Delivery"
                                description="Enable delivery orders for this branch."
                                checked={branchConfig.deliveryEnabled}
                                disabled={configSaving}
                                onChange={handleConfigCheckboxChange}
                            />

                            <ConfigToggleCard
                                name="pickupEnabled"
                                label="Pickup"
                                description="Enable pickup orders for this branch."
                                checked={branchConfig.pickupEnabled}
                                disabled={configSaving}
                                onChange={handleConfigCheckboxChange}
                            />

                            <div className="md:col-span-2">
                                <ConfigToggleCard
                                    name="dineInEnabled"
                                    label="Dine-In"
                                    description="Enable dine-in orders for this branch."
                                    checked={branchConfig.dineInEnabled}
                                    disabled={configSaving}
                                    onChange={handleConfigCheckboxChange}
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="submit"
                                disabled={configSaving}
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {configSaving ? (
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-orange-200 border-t-white" />
                                ) : (
                                    <RiSaveLine size={18} />
                                )}

                                {configSaving ? "Saving..." : "Save Branch Configuration"}
                            </button>
                        </div>
                    </>
                )}
            </form>
        </div>
    );
}

function BackToBranchesLink() {
    return (
        <div className="mb-6">
            <Link
                to="/staff/branches"
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-orange-600"
            >
                <RiArrowLeftLine size={18} />
                Back to branches
            </Link>
        </div>
    );
}

function BackToBranchDetailsLink({ id }) {
    return (
        <div className="mb-6">
            <Link
                to={`/staff/branches/${id}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-orange-600"
            >
                <RiArrowLeftLine size={18} />
                Back to branch details
            </Link>
        </div>
    );
}

function EditBranchState({
    Icon,
    title,
    description,
    iconClassName,
    loading = false,
}) {
    return (
        <div className="text-center">
            <div
                className={`mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full ${iconClassName}`}
            >
                {loading ? (
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-orange-500" />
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

function ConfigToggleCard({
    name,
    label,
    description,
    checked,
    disabled,
    onChange,
}) {
    return (
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-orange-100 hover:bg-orange-50/40">
            <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {label}
                </p>

                <p className="mt-2 text-sm font-semibold text-gray-900">
                    {description}
                </p>
            </div>

            <div className="relative shrink-0">
                <input
                    type="checkbox"
                    name={name}
                    checked={Boolean(checked)}
                    onChange={onChange}
                    disabled={disabled}
                    className="peer sr-only"
                />

                <div className="h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-orange-500 peer-disabled:cursor-not-allowed peer-disabled:opacity-60" />

                <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
            </div>
        </label>
    );
}
function normalizeBranchConfig(response) {
    const config = response?.data || response || {};

    return {
        ...DEFAULT_BRANCH_CONFIG,
        ...config,
        deliveryFee:
            config.deliveryFee === null || config.deliveryFee === undefined
                ? 0
                : config.deliveryFee,
        deliveryEnabled: Boolean(config.deliveryEnabled),
        pickupEnabled: Boolean(config.pickupEnabled),
        dineInEnabled: Boolean(config.dineInEnabled),
        branchActiveForOrders: Boolean(config.branchActiveForOrders),
    };
}