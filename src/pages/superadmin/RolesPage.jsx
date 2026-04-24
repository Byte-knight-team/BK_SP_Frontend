// src/pages/superadmin/RolesPage.jsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
    RiRefreshLine,
    RiSaveLine,
    RiShieldCheckLine,
    RiLockLine,
    RiSearchLine,
    RiErrorWarningLine,
    RiCheckboxCircleLine,
    RiUserSettingsLine,
} from "@remixicon/react";

import {
    getRolesAPI,
    getRolePermissionsAPI,
    getPrivilegesAPI,
    updateRolePermissionsAPI,
    normalizePermissionNames,
    normalizePrivileges,
} from "../../apis/staff/roles";

/**
 * Reads the logged-in user from localStorage.
 * This is used as a backup if MainLayout does not pass user data through Outlet context.
 */
function getStoredAuthUser() {
    try {
        const rawUser = localStorage.getItem("authUser");
        return rawUser ? JSON.parse(rawUser) : null;
    } catch {
        return null;
    }
}

/**
 * Extracts role name safely from different possible auth user shapes.
 * Examples:
 * - { role: "SUPER_ADMIN" }
 * - { roleName: "SUPER_ADMIN" }
 * - { role: { name: "SUPER_ADMIN" } }
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
 * Groups privileges into simple frontend modules.
 * Your backend currently does not send module/category,
 * so this derives a display group from the privilege name.
 */
function getPrivilegeModule(name) {
    const value = name.toUpperCase();

    if (value.includes("STAFF") || value.includes("PRIVILEGE")) return "Staff & RBAC";
    if (value.includes("BRANCH")) return "Branch";
    if (value.includes("CONFIG") || value.includes("SYSTEM")) return "System Config";
    if (value.includes("AUDIT")) return "Audit";
    if (value.includes("ORDER")) return "Orders";
    if (value.includes("CUSTOMER")) return "Customers";
    if (value.includes("DELIVERY")) return "Delivery";
    if (value.includes("REPORT")) return "Reports";
    if (value.includes("MENU")) return "Menu";
    if (value.includes("QR") || value.includes("TABLE")) return "QR & Tables";
    if (value.includes("BACKUP") || value.includes("EXPORT")) return "Backup & Export";
    if (value.includes("RESERVATION")) return "Reservations";

    return "Other";
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
 * These roles must be visible but not editable.
 *
 * SUPER_ADMIN is the highest internal system role.
 * CUSTOMER is outside the staff governance area.
 */
const LOCKED_ROLE_NAMES = ["SUPER_ADMIN", "CUSTOMER"];

/**
 * Checks whether a role should be read-only.
 */
function isLockedRoleName(roleName) {
    return LOCKED_ROLE_NAMES.includes(roleName);
}

/**
 * Gives a clear reason for locking the selected role.
 */
function getLockedRoleMessage(roleName) {
    if (roleName === "SUPER_ADMIN") {
        return "SUPER_ADMIN is a protected core role. Its permissions are shown for review only and cannot be edited from this page.";
    }

    if (roleName === "CUSTOMER") {
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

    // Read user from layout first, then fallback to localStorage.
    const layoutUser = outletContext?.user || outletContext?.authUser;
    const [storedUser] = useState(getStoredAuthUser);

    const currentUser = layoutUser || storedUser;
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

    const [searchText, setSearchText] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

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

    /**
   * Locked roles are visible but read-only.
   * SUPER_ADMIN and CUSTOMER permissions cannot be changed from the frontend.
   */
    const selectedRoleIsLocked = selectedRole
        ? isLockedRoleName(selectedRole.name)
        : false;

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

    /**
     * Adds simple module grouping to each privilege.
     */
    const privilegesWithModules = useMemo(() => {
        return privileges.map((privilege) => {
            // If backend does not send a real module, derive one from the privilege name.
            // This prevents every permission from being grouped under "GENERAL".
            const derivedModule =
                !privilege.module || privilege.module === "GENERAL"
                    ? getPrivilegeModule(privilege.name)
                    : privilege.module;

            return {
                ...privilege,
                module: derivedModule,
            };
        });
    }, [privileges]);

    /**
     * Filters privileges by search text.
     */
    const filteredPrivileges = useMemo(() => {
        const query = searchText.trim().toLowerCase();

        if (!query) {
            return privilegesWithModules;
        }

        return privilegesWithModules.filter((privilege) => {
            return (
                privilege.name.toLowerCase().includes(query) ||
                formatPermissionName(privilege.name).toLowerCase().includes(query) ||
                privilege.module.toLowerCase().includes(query)
            );
        });
    }, [privilegesWithModules, searchText]);

    /**
     * Groups filtered privileges by module for cleaner display.
     */
    const groupedPrivileges = useMemo(() => {
        return filteredPrivileges.reduce((groups, privilege) => {
            const moduleName = privilege.module || "Other";

            if (!groups[moduleName]) {
                groups[moduleName] = [];
            }

            groups[moduleName].push(privilege);
            return groups;
        }, {});
    }, [filteredPrivileges]);

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
                // CUSTOMER and SUPER_ADMIN remain visible, but they are read-only.
                const firstEditableRole = normalizedRoles.find(
                    (role) => !isLockedRoleName(role.name)
                );

                return firstEditableRole?.id ?? normalizedRoles[0]?.id ?? null;
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
     * Selects all currently visible permissions.
     * This respects the search filter.
     */
    function handleSelectVisiblePermissions() {
        // Bulk select is disabled for locked read-only roles.
        if (selectedRoleIsLocked) {
            return;
        }

        const visiblePermissionNames = filteredPrivileges.map(
            (privilege) => privilege.name
        );

        setSelectedPermissionNames((currentPermissions) => {
            const merged = new Set([...currentPermissions, ...visiblePermissionNames]);
            return Array.from(merged);
        });
    }

    /**
     * Clears all currently visible permissions.
     * This respects the search filter.
     */
    function handleClearVisiblePermissions() {
        // Bulk clear is disabled for locked read-only roles.
        if (selectedRoleIsLocked) {
            return;
        }

        const visiblePermissionNames = new Set(
            filteredPrivileges.map((privilege) => privilege.name)
        );

        setSelectedPermissionNames((currentPermissions) =>
            currentPermissions.filter(
                (permissionName) => !visiblePermissionNames.has(permissionName)
            )
        );
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

                    <button
                        type="button"
                        onClick={handleReload}
                        disabled={initialLoading || permissionsLoading || saving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RiRefreshLine size={18} />
                        Reload
                    </button>
                </div>
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
                            {roles.length} role{roles.length === 1 ? "" : "s"} available
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
                                            {roles.map((role) => {
                                                // Check whether this role is currently selected in the left-side role list.
                                                const isSelected = String(role.id) === String(selectedRoleId);

                                                // SUPER_ADMIN and CUSTOMER are shown but locked.
                                                // They are visible for review, but their permissions cannot be edited.
                                                const roleIsLocked = isLockedRoleName(role.name);

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

                                                        {roleIsLocked && (
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                                                <RiLockLine size={12} />
                                                                Locked
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

                                            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                                                <span>Permissions: {role.permissionCount}</span>
                                                <span>Active users: {role.activeUserCount}</span>
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
                    <div className="border-b border-slate-100 p-5">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <h3 className="font-semibold text-slate-800">
                                    {selectedRole
                                        ? `${selectedRole.name} Permissions`
                                        : "Role Permissions"}
                                </h3>

                                {selectedRoleIsLocked && (
                                    <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                                        {getLockedRoleMessage(selectedRole.name)}
                                    </p>
                                )}
                            </div>

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
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                                <RiSaveLine size={18} />
                                {saving ? "Saving..." : "Save Permissions"}
                            </button>
                        </div>
                    </div>

                    {!selectedRole ? (
                        <div className="p-6 text-sm text-slate-500">
                            Please select a role from the left side.
                        </div>
                    ) : (
                        <div className="p-5">
                            {/* Search and bulk actions */}
                            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                                <div className="relative w-full lg:max-w-md">
                                    <RiSearchLine
                                        size={18}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                    />

                                    <input
                                        type="text"
                                        value={searchText}
                                        onChange={(event) => setSearchText(event.target.value)}
                                        placeholder="Search permissions..."
                                        className="w-full rounded-xl border border-slate-200 py-2 pl-10 pr-3 text-sm outline-none transition focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100"
                                    />
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <button
                                        type="button"
                                        onClick={handleSelectVisiblePermissions}
                                        disabled={
                                            selectedRoleIsLocked ||
                                            permissionsLoading ||
                                            filteredPrivileges.length === 0
                                          }
                                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Select Visible
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleClearVisiblePermissions}
                                        disabled={
                                            selectedRoleIsLocked ||
                                            permissionsLoading ||
                                            filteredPrivileges.length === 0
                                          }
                                        className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        Clear Visible
                                    </button>
                                </div>
                            </div>

                            {permissionsLoading ? (
                                <div className="rounded-xl border border-slate-100 p-5 text-sm text-slate-500">
                                    Loading permissions...
                                </div>
                            ) : privileges.length === 0 ? (
                                <div className="rounded-xl border border-slate-100 p-5 text-sm text-slate-500">
                                    No privileges found.
                                </div>
                            ) : filteredPrivileges.length === 0 ? (
                                <div className="rounded-xl border border-slate-100 p-5 text-sm text-slate-500">
                                    No permissions matched your search.
                                </div>
                            ) : (
                                <div className="space-y-5">
                                    {Object.entries(groupedPrivileges).map(
                                        ([moduleName, modulePrivileges]) => (
                                            <div
                                                key={moduleName}
                                                className="rounded-xl border border-slate-100"
                                            >
                                                <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                                                    <h4 className="text-sm font-semibold text-slate-700">
                                                        {moduleName}
                                                    </h4>
                                                </div>

                                                <div className="grid grid-cols-1 gap-2 p-4 md:grid-cols-2">
                                                    {modulePrivileges.map((privilege) => {
                                                        const checked = selectedPermissionSet.has(
                                                            privilege.name
                                                        );

                                                        return (
                                                            <label
                                                                key={privilege.id}
                                                                className={`flex items-start gap-3 rounded-xl border p-3 transition ${
                                                                    selectedRoleIsLocked ? "cursor-not-allowed opacity-75" : "cursor-pointer"
                                                                  } ${checked
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
                                                                        className={`text-sm font-medium ${checked
                                                                            ? "text-indigo-700"
                                                                            : "text-slate-700"
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
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}