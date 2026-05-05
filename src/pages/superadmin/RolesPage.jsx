// src/pages/superadmin/RolesPage.jsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
    RiRefreshLine,
    RiSaveLine,
    RiShieldCheckLine,
    RiLockLine,
    RiErrorWarningLine,
    RiCheckboxCircleLine,
    RiUserSettingsLine,
    RiAddLine,
    RiDeleteBinLine,
} from "@remixicon/react";

import {
    getRolesAPI,
    getRolePermissionsAPI,
    getPrivilegesAPI,
    createRoleAPI,
    updateRoleAPI,
    deleteRoleAPI,
    updateRolePermissionsAPI,
    normalizePermissionNames,
    normalizePrivileges,
} from "../../apis/staff/roles";

import { useAuth } from "../../context/AuthContext";

/**
 * Extracts role name safely from different possible auth user shapes.
 */
function getCurrentRoleName(user) {
    if (!user) return "";

    if (typeof user.role === "string") {
        return user.role;
    }

    if (typeof user.roleName === "string") {
        return user.roleName;
    }

    if (user.role?.name) {
        return user.role.name;
    }

    return "";
}

/**
 * Converts backend role response into a clean frontend shape.
 *
 * baseSalary is used as the default salary for newly created staff.
 */
function normalizeRoles(roleResponse) {
    const rolesArray = Array.isArray(roleResponse)
        ? roleResponse
        : roleResponse?.roles || roleResponse?.data || [];

    return rolesArray.map((role) => ({
        id: role.id,
        name: role.name || role.roleName || "UNKNOWN_ROLE",
        description: role.description || "",
        permissionCount: role.permissionCount ?? 0,
        activeUserCount: role.activeUserCount ?? 0,

        // Role default salary. Old database rows may return null.
        baseSalary: role.baseSalary ?? "",
    }));
}

/**
 * Makes backend permission names easier to read in the UI.
 * Example: CREATE_STAFF -> Create Staff
 */
function formatPermissionName(name) {
    if (!name) return "";

    return name
        .replace(/_/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .toLowerCase()
        .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Checks whether two permission arrays contain the same permission names.
 * This helps us detect unsaved changes.
 */
function areSamePermissions(firstList, secondList) {
    const first = [...firstList].sort();
    const second = [...secondList].sort();

    if (first.length !== second.length) {
        return false;
    }

    return first.every((item, index) => item === second[index]);
}

/**
 * Core roles are permanent system roles.
 *
 * They are created by the backend DataSeeder and used by different system modules.
 * These roles must not be deleted from the frontend or backend.
 */
const CORE_ROLE_NAMES = [
    "SUPER_ADMIN",
    "ADMIN",
    "MANAGER",
    "CHEF",
    "RECEPTIONIST",
    "DELIVERY",
    "CUSTOMER",
];

/**
 * Permission-locked roles are visible for review,
 */
const PERMISSION_LOCKED_ROLE_NAMES = ["SUPER_ADMIN", "CUSTOMER"];

/**
 * Normalizes role names before frontend comparisons.
 */
function normalizeRoleNameForCheck(roleName) {
    return String(roleName || "").trim().toUpperCase();
}

/**
 * Checks whether a role is a permanent core role.
 */
function isCoreRoleName(roleName) {
    return CORE_ROLE_NAMES.includes(normalizeRoleNameForCheck(roleName));
}

/**
 * Checks whether permission editing should be blocked.
 */
function isPermissionLockedRoleName(roleName) {
    return PERMISSION_LOCKED_ROLE_NAMES.includes(normalizeRoleNameForCheck(roleName));
}

/**
 * Gives a clear reason for locking the selected role.
 */
function getLockedRoleMessage(roleName) {
    const normalizedRoleName = normalizeRoleNameForCheck(roleName);

    if (normalizedRoleName === "SUPER_ADMIN") {
        return "SUPER_ADMIN is a protected system owner role. Its permissions are shown for review only and cannot be edited from this page.";
    }

    if (normalizedRoleName === "CUSTOMER") {
        return "CUSTOMER is outside the staff governance area. Its permissions are shown for review only and cannot be edited from this page.";
    }

    return "";
}

/**
 * Simple no-access screen.
 * Used because this page is SUPER_ADMIN only for current scope.
 */
function NoAccessView({ currentRoleName }) {
    return (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
            <div className="flex items-start gap-4">
                <div className="rounded-full bg-red-100 p-3 text-red-600">
                    <RiLockLine size={24} />
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-red-700">No Access</h2>
                    <p className="mt-1 text-sm text-red-600">
                        Roles & Permissions management is only available for SUPER_ADMIN.
                    </p>

                    <p className="mt-3 text-xs text-red-500">
                        Current role: {currentRoleName || "Unknown"}
                    </p>
                </div>
            </div>
        </div>
    );
}

/**
 * Small reusable alert component for success/error messages.
 */
function StatusMessage({ type, message }) {
    if (!message) return null;

    const isError = type === "error";

    return (
        <div
            className={`mb-4 rounded-xl border px-4 py-3 text-sm ${isError
                ? "border-red-100 bg-red-50 text-red-700"
                : "border-green-100 bg-green-50 text-green-700"
                }`}
        >
            <div className="flex items-center gap-2">
                {isError ? (
                    <RiErrorWarningLine size={18} />
                ) : (
                    <RiCheckboxCircleLine size={18} />
                )}
                <span>{message}</span>
            </div>
        </div>
    );
}

export default function RolesPage() {
    const outletContext = useOutletContext();

    // MainLayout should provide setHeaderInfo through Outlet context.
    const setHeaderInfo = outletContext?.setHeaderInfo;

    /*
        Read logged-in user from AuthContext.

        AuthContext now gets user data from the decoded JWT token.
        We no longer read authUser from localStorage.
    */
    const { user: currentUser } = useAuth();

    const currentRoleName = getCurrentRoleName(currentUser);
    const isSuperAdmin = currentRoleName === "SUPER_ADMIN";

    const [roles, setRoles] = useState([]);
    const [privileges, setPrivileges] = useState([]);

    const [selectedRoleId, setSelectedRoleId] = useState(null);
    const [selectedPermissionNames, setSelectedPermissionNames] = useState([]);
    const [originalPermissionNames, setOriginalPermissionNames] = useState([]);

    const [initialLoading, setInitialLoading] = useState(false);
    const [permissionsLoading, setPermissionsLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    // Separate loading state for saving role default salary.
    const [salarySaving, setSalarySaving] = useState(false);
    // This stores the editable base salary value for the selected role.
    const [baseSalaryInput, setBaseSalaryInput] = useState("");

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Add Role form state.
    const [newRoleName, setNewRoleName] = useState("");
    const [newRoleDescription, setNewRoleDescription] = useState("");
    const [newRoleBaseSalary, setNewRoleBaseSalary] = useState("");
    const [creatingRole, setCreatingRole] = useState(false);

    // Delete Role loading state.
    const [deletingRole, setDeletingRole] = useState(false);

    /**
     * Set the page header inside the shared staff layout.
     */
    useEffect(() => {
        if (setHeaderInfo) {
            setHeaderInfo({
                title: "Roles & Permissions",
                subtitle: "Manage role-based access control permissions.",
            });
        }
    }, [setHeaderInfo]);

    /**
     * Currently selected role object.
     */
    const selectedRole = useMemo(() => {
        return roles.find((role) => String(role.id) === String(selectedRoleId));
    }, [roles, selectedRoleId]);

    /*
    Roles shown in the left-side editable role list.

    SUPER_ADMIN and CUSTOMER are hidden from this page because:
    - SUPER_ADMIN is protected system owner role
    - CUSTOMER is not a staff governance role
    - both should not be edited from the staff RBAC screen

    Backend still keeps these roles.
    We only hide them from frontend list to keep the UI clean.
*/
    const visibleRoles = useMemo(() => {
        return roles.filter(
            (role) =>
                normalizeRoleNameForCheck(role.name) !== "SUPER_ADMIN" &&
                normalizeRoleNameForCheck(role.name) !== "CUSTOMER"
        );
    }, [roles]);

    /**
    * When selected role changes, put its baseSalary into the salary input.
    */
    useEffect(() => {
        if (selectedRole) {
            setBaseSalaryInput(
                selectedRole.baseSalary === null || selectedRole.baseSalary === undefined
                    ? ""
                    : String(selectedRole.baseSalary)
            );
        }
    }, [selectedRole]);

    /**
     * This controls permission editing and salary editing.
     * Only SUPER_ADMIN and CUSTOMER are permission-locked.
     */
    const selectedRoleIsLocked = selectedRole
        ? isPermissionLockedRoleName(selectedRole.name)
        : false;

    /**
     * This controls delete blocking.
     * All seven default system roles are core and cannot be deleted.
     */
    const selectedRoleIsCore = selectedRole
        ? isCoreRoleName(selectedRole.name)
        : false;

    /**
     * Delete button should be blocked if the selected role is core
     * or currently has active users.
     */
    const selectedRoleDeleteBlockedReason = useMemo(() => {
        if (!selectedRole) {
            return "Select a role first.";
        }

        if (selectedRoleIsCore) {
            return "Core roles cannot be deleted.";
        }

        if (Number(selectedRole.activeUserCount || 0) > 0) {
            return "This role cannot be deleted because active users are using it.";
        }

        return "";
    }, [selectedRole, selectedRoleIsCore]);

    /**
     * Set version of selected permissions.
     * This makes checkbox checking fast and clean.
     */
    const selectedPermissionSet = useMemo(() => {
        return new Set(selectedPermissionNames);
    }, [selectedPermissionNames]);

    /**
     * Detects whether user changed permissions but has not saved yet.
     */
    const hasUnsavedChanges = useMemo(() => {
        return !areSamePermissions(selectedPermissionNames, originalPermissionNames);
    }, [selectedPermissionNames, originalPermissionNames]);

    const visiblePrivileges = privileges;

    /**
     * Loads all roles and all privileges.
     */
    const loadRolesAndPrivileges = useCallback(async () => {
        if (!isSuperAdmin) return;

        setInitialLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const [rolesResponse, privilegesResponse] = await Promise.all([
                getRolesAPI(),
                getPrivilegesAPI(),
            ]);

            const normalizedRoles = normalizeRoles(rolesResponse);
            const normalizedPrivileges = normalizePrivileges(privilegesResponse);

            setRoles(normalizedRoles);
            setPrivileges(normalizedPrivileges);

            // Select first role automatically if nothing is selected yet.
            setSelectedRoleId((currentRoleId) => {
                const currentRoleStillExists = normalizedRoles.some(
                    (role) => String(role.id) === String(currentRoleId)
                );

                if (currentRoleStillExists) {
                    return currentRoleId;
                }

                // Select the first editable role by default.
                // CUSTOMER and SUPER_ADMIN not visible.
                const firstVisibleRole = normalizedRoles.find(
                    (role) =>
                        normalizeRoleNameForCheck(role.name) !== "SUPER_ADMIN" &&
                        normalizeRoleNameForCheck(role.name) !== "CUSTOMER"
                );

                return firstVisibleRole?.id ?? null;
            });

        } catch (error) {
            setErrorMessage(error.message || "Failed to load roles and privileges.");
        } finally {
            setInitialLoading(false);
        }
    }, [isSuperAdmin]);

    /**
     * Loads permissions assigned to the selected role.
     */
    const loadPermissionsForRole = useCallback(async (roleId) => {
        if (!roleId) return;

        setPermissionsLoading(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const permissionResponse = await getRolePermissionsAPI(roleId);
            const normalizedPermissionNames =
                normalizePermissionNames(permissionResponse);

            setSelectedPermissionNames(normalizedPermissionNames);
            setOriginalPermissionNames(normalizedPermissionNames);
        } catch (error) {
            setErrorMessage(error.message || "Failed to load role permissions.");
            setSelectedPermissionNames([]);
            setOriginalPermissionNames([]);
        } finally {
            setPermissionsLoading(false);
        }
    }, []);

    /**
     * Initial page load.
     */
    useEffect(() => {
        if (isSuperAdmin) {
            loadRolesAndPrivileges();
        }
    }, [isSuperAdmin, loadRolesAndPrivileges]);

    /**
     * Whenever selected role changes, load that role's permissions.
     */
    useEffect(() => {
        if (isSuperAdmin && selectedRoleId) {
            loadPermissionsForRole(selectedRoleId);
        }
    }, [isSuperAdmin, selectedRoleId, loadPermissionsForRole]);

    /**
     * Reload button action.
     * Reloads roles, privileges, and selected role permissions.
     */
    async function handleReload() {
        await loadRolesAndPrivileges();

        if (selectedRoleId) {
            await loadPermissionsForRole(selectedRoleId);
        }
    }

    /**
     * Role click action.
     */
    function handleSelectRole(roleId) {
        setSelectedRoleId(roleId);
    }

    /**
     * Checkbox toggle action.
     * Keeps exact backend privilege name when saving.
     */
    function handleTogglePermission(permissionName) {
        // Do not allow permission changes for locked read-only roles.
        if (selectedRoleIsLocked) {
            return;
        }

        setSelectedPermissionNames((currentPermissions) => {
            const alreadySelected = currentPermissions.includes(permissionName);

            if (alreadySelected) {
                return currentPermissions.filter((item) => item !== permissionName);
            }

            return [...currentPermissions, permissionName];
        });
    }

    /**
 * Converts salary input into a safe number.
 */
    function parseSalaryValue(value) {
        const numberValue = Number(value);

        if (Number.isNaN(numberValue)) {
            return null;
        }

        return numberValue;
    }

    /**
     * Saves role default salary.
     *
     * This only changes Role.baseSalary.
     * Existing staff salaries are not automatically changed.
     */
    async function handleSaveBaseSalary() {
        if (!selectedRole || selectedRoleIsLocked) {
            return;
        }

        const salaryValue = parseSalaryValue(baseSalaryInput);

        if (salaryValue === null || salaryValue < 0) {
            setErrorMessage("Base salary must be a valid non-negative number.");
            return;
        }

        setSalarySaving(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            await updateRoleAPI(selectedRole.id, {
                baseSalary: salaryValue,
            });

            // Update selected role salary locally so UI stays in sync.
            setRoles((currentRoles) =>
                currentRoles.map((role) =>
                    String(role.id) === String(selectedRole.id)
                        ? { ...role, baseSalary: salaryValue }
                        : role
                )
            );

            setSuccessMessage("Role base salary updated successfully.");
        } catch (error) {
            setErrorMessage(error.message || "Failed to update role base salary.");
        } finally {
            setSalarySaving(false);
        }
    }

 /*
 * Creates a new custom role.
 * This does not assign permissions.
 * After create, the page reloads the role list and selects the new role.
 */
    async function handleCreateRole(event) {
        event.preventDefault();

        const normalizedName = normalizeRoleNameForCheck(newRoleName);
        const salaryValue = parseSalaryValue(newRoleBaseSalary || "0");

        setErrorMessage("");
        setSuccessMessage("");

        if (!normalizedName) {
            setErrorMessage("Role name is required.");
            return;
        }

        if (salaryValue === null || salaryValue < 0) {
            setErrorMessage("Base salary must be a valid non-negative number.");
            return;
        }

        setCreatingRole(true);

        try {
            const createdRole = await createRoleAPI({
                name: normalizedName,
                description: newRoleDescription.trim(),
                baseSalary: salaryValue,
            });

            const rolesResponse = await getRolesAPI();
            const normalizedRoles = normalizeRoles(rolesResponse);

            setRoles(normalizedRoles);

            // Select newly created role using id first, then fallback to role name.
            const createdRoleFromList = normalizedRoles.find((role) => {
                return (
                    String(role.id) === String(createdRole?.id) ||
                    normalizeRoleNameForCheck(role.name) === normalizedName
                );
            });

            if (createdRoleFromList) {
                setSelectedRoleId(createdRoleFromList.id);
            }

            setNewRoleName("");
            setNewRoleDescription("");
            setNewRoleBaseSalary("");

            setSuccessMessage("Role created successfully. You can now assign permissions.");
        } catch (error) {
            setErrorMessage(error.message || "Failed to create role.");
        } finally {
            setCreatingRole(false);
        }
    }

    /**
     * Deletes the selected custom role.
     *
     * Frontend blocks:
     * - core roles
     * - roles with active users
     *
     * Backend still gives the final protection.
     */
    async function handleDeleteSelectedRole() {
        if (!selectedRole) {
            return;
        }

        setErrorMessage("");
        setSuccessMessage("");

        if (selectedRoleDeleteBlockedReason) {
            setErrorMessage(selectedRoleDeleteBlockedReason);
            return;
        }

        const confirmed = window.confirm(
            `Are you sure you want to delete the role "${selectedRole.name}"?`
        );

        if (!confirmed) {
            return;
        }

        setDeletingRole(true);

        try {
            await deleteRoleAPI(selectedRole.id);

            const rolesResponse = await getRolesAPI();
            const normalizedRoles = normalizeRoles(rolesResponse);

            setRoles(normalizedRoles);

            // After delete, select the first permission-editable role if possible.
            const nextRole =
                normalizedRoles.find((role) => !isPermissionLockedRoleName(role.name)) ||
                normalizedRoles[0] ||
                null;

            setSelectedRoleId(nextRole?.id ?? null);
            setSelectedPermissionNames([]);
            setOriginalPermissionNames([]);

            setSuccessMessage("Role deleted successfully.");
        } catch (error) {
            setErrorMessage(error.message || "Failed to delete role.");
        } finally {
            setDeletingRole(false);
        }
    }


    /**
     * Saves selected permissions to backend.
     */
    async function handleSavePermissions() {
        // Do not save permission changes for locked read-only roles.
        if (!selectedRoleId || selectedRoleIsLocked) return;

        setSaving(true);
        setErrorMessage("");
        setSuccessMessage("");

        try {
            const sortedPermissionNames = [...selectedPermissionNames].sort();

            await updateRolePermissionsAPI(selectedRoleId, sortedPermissionNames);

            // After successful save, mark current permissions as original.
            setOriginalPermissionNames(sortedPermissionNames);
            setSelectedPermissionNames(sortedPermissionNames);

            // Update permission count in the role list without needing another request.
            setRoles((currentRoles) =>
                currentRoles.map((role) =>
                    String(role.id) === String(selectedRoleId)
                        ? { ...role, permissionCount: sortedPermissionNames.length }
                        : role
                )
            );

            setSuccessMessage("Role permissions updated successfully.");
        } catch (error) {
            setErrorMessage(error.message || "Failed to update role permissions.");
        } finally {
            setSaving(false);
        }
    }

    if (!isSuperAdmin) {
        return <NoAccessView currentRoleName={currentRoleName} />;
    }

    return (
        <div className="space-y-6">
            <StatusMessage type="error" message={errorMessage} />
            <StatusMessage type="success" message={successMessage} />

            {/* Top summary and reload section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                            <RiShieldCheckLine size={24} />
                        </div>

                        <div>
                            <h2 className="text-lg font-semibold text-slate-800">
                                RBAC Permission Control
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Select a role, review assigned permissions, then save changes.
                            </p>

                            {hasUnsavedChanges && !selectedRoleIsLocked && (
                                <p className="mt-2 text-xs font-medium text-amber-600">
                                    You have unsaved permission changes.
                                </p>
                            )}
                        </div>
                    </div>

                    {/* <button
                        type="button"
                        onClick={handleReload}
                        disabled={initialLoading || permissionsLoading || saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RiRefreshLine size={18} />
                        Reload
                    </button> */}

                </div>
            </div>

            {/* Add Role form */}
            <div className="border-b border-slate-100 p-5">
                <form onSubmit={handleCreateRole} className="space-y-3">
                    <div>
                        <div className="flex items-center justify-between gap-3">
                            <h4 className="text-sm font-semibold text-slate-800">
                                Add New Role
                            </h4>

                            <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-semibold text-indigo-600">
                                SUPER_ADMIN
                            </span>
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                            Create the role first. Assign permissions after selecting it.
                        </p>
                    </div>

                    <input
                        type="text"
                        value={newRoleName}
                        onChange={(event) => setNewRoleName(event.target.value)}
                        placeholder="Example: WAITER"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    />

                    <textarea
                        value={newRoleDescription}
                        onChange={(event) => setNewRoleDescription(event.target.value)}
                        placeholder="Role description"
                        rows={2}
                        className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    />

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={newRoleBaseSalary}
                        onChange={(event) => setNewRoleBaseSalary(event.target.value)}
                        placeholder="Base salary, example: 45000"
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                    />

                    <button
                        type="submit"
                        disabled={creatingRole}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                    >
                        <RiAddLine size={18} />
                        {creatingRole ? "Creating..." : "Create Role"}
                    </button>
                </form>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                {/* Roles list */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-1">
                    <div className="border-b border-slate-100 p-5">
                        <div className="flex items-center gap-2">
                            <RiUserSettingsLine size={20} className="text-slate-500" />
                            <h3 className="font-semibold text-slate-800">Roles</h3>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                            {visibleRoles.length} role{visibleRoles.length === 1 ? "" : "s"} available
                        </p>
                    </div>

                    <div className="p-3">
                        {initialLoading ? (
                            <div className="p-4 text-sm text-slate-500">Loading roles...</div>
                        ) : roles.length === 0 ? (
                            <div className="p-4 text-sm text-slate-500">
                                No roles found.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {visibleRoles.map((role) => {
                                    // Check whether this role is currently selected in the left-side role list.
                                    const isSelected = String(role.id) === String(selectedRoleId);

                                    // SUPER_ADMIN and CUSTOMER are locked.
                                    // Their permissions cannot be edited.
                                    const roleIsCore = isCoreRoleName(role.name);
                                    const roleIsPermissionLocked = isPermissionLockedRoleName(role.name);

                                    return (
                                        <button
                                            key={role.id}
                                            type="button"
                                            onClick={() => handleSelectRole(role.id)}
                                            className={`w-full rounded-xl border p-4 text-left transition ${isSelected
                                                ? "border-indigo-200 bg-indigo-50"
                                                : "border-slate-100 bg-white hover:bg-slate-50"
                                                }`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p
                                                            className={`text-sm font-semibold ${isSelected ? "text-indigo-700" : "text-slate-800"
                                                                }`}
                                                        >
                                                            {role.name}
                                                        </p>

                                                        {roleIsCore && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                                                <RiLockLine size={12} />
                                                                Core
                                                            </span>
                                                        )}

                                                        {roleIsPermissionLocked && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                                                                Read-only
                                                            </span>
                                                        )}
                                                    </div>

                                                    <p className="mt-1 text-xs text-slate-500">
                                                        {role.description || "No description"}
                                                    </p>
                                                </div>

                                                <span
                                                    className={`rounded-full px-2 py-1 text-xs font-medium ${isSelected
                                                        ? "bg-indigo-100 text-indigo-700"
                                                        : "bg-slate-100 text-slate-600"
                                                        }`}
                                                >
                                                    {role.permissionCount}
                                                </span>
                                            </div>

                                            <div className="mt-3 space-y-1 text-xs text-slate-500">
                                                <div className="flex items-center justify-between">
                                                    <span>Permissions: {role.permissionCount}</span>
                                                    <span>Active users: {role.activeUserCount}</span>
                                                </div>

                                                <div className="flex items-center justify-between">
                                                    <span>Base salary</span>
                                                    <span className="font-semibold text-slate-700">
                                                        {role.baseSalary ? Number(role.baseSalary).toLocaleString() : "Not set"}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Permissions panel */}
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm xl:col-span-2">

                    {!selectedRole ? (
                        <div className="p-6 text-sm text-slate-500">
                            Please select a role from the left side.
                        </div>
                    ) : (
                        <div className="p-5">

                            {/* Role base salary editor */}
                            <div className="mb-5 rounded-xl border border-slate-100 bg-slate-50 p-4">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                                    <div className="flex-1">
                                        <label className="block text-sm font-semibold text-slate-700">
                                            Role Base Salary
                                        </label>

                                        <p className="mt-1 text-xs text-slate-500">
                                            This is the default salary used when creating a new staff member with this role.
                                            Existing staff salaries will not change automatically.
                                        </p>

                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={baseSalaryInput}
                                            disabled={selectedRoleIsLocked}
                                            onChange={(event) => setBaseSalaryInput(event.target.value)}
                                            placeholder="Example: 60000"
                                            className="mt-3 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100 disabled:text-slate-400"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={handleSaveBaseSalary}
                                        disabled={!selectedRole || selectedRoleIsLocked || salarySaving}
                                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                                    >
                                        <RiSaveLine size={18} />
                                        {salarySaving ? "Saving..." : "Save Salary"}
                                    </button>
                                </div>
                            </div>

                            {/* Role permission action bar */}
                            <div className="mb-5 rounded-xl border border-slate-100 bg-white p-4">
                                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                        <h3 className="font-semibold text-slate-800">
                                            {selectedRole
                                                ? `${selectedRole.name} Permissions`
                                                : "Role Permissions"}
                                        </h3>

                                        <p className="mt-1 text-xs text-slate-500">
                                            Select or remove permissions for this role, then save your changes.
                                        </p>

                                        {selectedRoleIsLocked && (
                                            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                                                {getLockedRoleMessage(selectedRole.name)}
                                            </p>
                                        )}

                                        {selectedRoleDeleteBlockedReason && (
                                            <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600">
                                                {selectedRoleDeleteBlockedReason}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            onClick={handleDeleteSelectedRole}
                                            disabled={
                                                !selectedRole ||
                                                deletingRole ||
                                                Boolean(selectedRoleDeleteBlockedReason)
                                            }
                                            title={selectedRoleDeleteBlockedReason || "Delete role"}
                                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-400"
                                        >
                                            <RiDeleteBinLine size={18} />
                                            {deletingRole ? "Deleting..." : "Delete Role"}
                                        </button>

                                        <button
                                            type="button"
                                            onClick={handleSavePermissions}
                                            disabled={
                                                !selectedRole ||
                                                selectedRoleIsLocked ||
                                                saving ||
                                                permissionsLoading ||
                                                !hasUnsavedChanges
                                            }
                                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                                        >
                                            <RiSaveLine size={18} />
                                            {saving ? "Saving..." : "Save Permissions"}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {selectedRoleIsLocked ? (
                                <div className="rounded-xl border border-amber-100 bg-amber-50 p-5 text-sm text-amber-700">
                                    <p className="font-semibold">
                                        This role is read-only.
                                    </p>

                                    <p className="mt-1">
                                        {getLockedRoleMessage(selectedRole.name)}
                                    </p>

                                    <p className="mt-3 text-xs">
                                        Permissions are protected for this role, so they are not shown as editable checkboxes.
                                    </p>
                                </div>
                            ) : permissionsLoading ? (
                                <div className="rounded-xl border border-slate-100 p-5 text-sm text-slate-500">
                                    Loading permissions...
                                </div>
                            ) : privileges.length === 0 ? (
                                <div className="rounded-xl border border-slate-100 p-5 text-sm text-slate-500">
                                    No privileges found.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                    {visiblePrivileges.map((privilege) => {
                                        const checked = selectedPermissionSet.has(privilege.name);

                                        return (
                                            <label
                                                key={privilege.id}
                                                className={`flex items-start gap-3 rounded-xl border p-3 transition ${checked
                                                        ? "border-indigo-200 bg-indigo-50"
                                                        : "border-slate-100 hover:bg-slate-50"
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    disabled={selectedRoleIsLocked}
                                                    onChange={() => handleTogglePermission(privilege.name)}
                                                    className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                                                />

                                                <div>
                                                    <p
                                                        className={`text-sm font-medium ${checked ? "text-indigo-700" : "text-slate-700"
                                                            }`}
                                                    >
                                                        {formatPermissionName(privilege.name)}
                                                    </p>

                                                    <p className="mt-1 text-xs text-slate-400">
                                                        {privilege.name}
                                                    </p>

                                                    {privilege.description && (
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {privilege.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}