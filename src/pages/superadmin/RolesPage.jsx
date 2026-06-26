// src/pages/superadmin/RolesPage.jsx

import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  RiSaveLine,
  RiShieldCheckLine,
  RiLockLine,
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
import { showSuccessToast, showErrorToast } from "../../utils/toast";

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
    baseSalary: role.baseSalary ?? "",
  }));
}

function formatPermissionName(name) {
  if (!name) return "";

  return name
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function areSamePermissions(firstList, secondList) {
  const first = [...firstList].sort();
  const second = [...secondList].sort();

  if (first.length !== second.length) {
    return false;
  }

  return first.every((item, index) => item === second[index]);
}

const CORE_ROLE_NAMES = [
  "SUPER_ADMIN",
  "ADMIN",
  "MANAGER",
  "CHEF",
  "RECEPTIONIST",
  "DELIVERY",
  "CUSTOMER",
];

const PERMISSION_LOCKED_ROLE_NAMES = ["SUPER_ADMIN", "CUSTOMER"];

function normalizeRoleNameForCheck(roleName) {
  return String(roleName || "").trim().toUpperCase();
}

function isCoreRoleName(roleName) {
  return CORE_ROLE_NAMES.includes(normalizeRoleNameForCheck(roleName));
}

function isPermissionLockedRoleName(roleName) {
  return PERMISSION_LOCKED_ROLE_NAMES.includes(
    normalizeRoleNameForCheck(roleName)
  );
}

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

export default function RolesPage() {
  const outletContext = useOutletContext();
  const setHeaderInfo = outletContext?.setHeaderInfo;

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

  const [salarySaving, setSalarySaving] = useState(false);
  const [baseSalaryInput, setBaseSalaryInput] = useState("");

  const [newRoleName, setNewRoleName] = useState("");
  const [newRoleDescription, setNewRoleDescription] = useState("");
  const [newRoleBaseSalary, setNewRoleBaseSalary] = useState("");
  const [creatingRole, setCreatingRole] = useState(false);

  const [deletingRole, setDeletingRole] = useState(false);

  useEffect(() => {
    if (setHeaderInfo) {
      setHeaderInfo({
        title: "Roles & Permissions",
        description: "Manage role-based access control permissions.",
        Icon: RiShieldCheckLine,
      });
    }

    return () => {
      if (setHeaderInfo) {
        setHeaderInfo(null);
      }
    };
  }, [setHeaderInfo]);

  const selectedRole = useMemo(() => {
    return roles.find((role) => String(role.id) === String(selectedRoleId));
  }, [roles, selectedRoleId]);

  const visibleRoles = useMemo(() => {
    return roles.filter(
      (role) =>
        normalizeRoleNameForCheck(role.name) !== "SUPER_ADMIN" &&
        normalizeRoleNameForCheck(role.name) !== "CUSTOMER"
    );
  }, [roles]);

  useEffect(() => {
    if (selectedRole) {
      setBaseSalaryInput(
        selectedRole.baseSalary === null || selectedRole.baseSalary === undefined
          ? ""
          : String(selectedRole.baseSalary)
      );
    }
  }, [selectedRole]);

  const selectedRoleIsLocked = selectedRole
    ? isPermissionLockedRoleName(selectedRole.name)
    : false;

  const selectedRoleIsCore = selectedRole
    ? isCoreRoleName(selectedRole.name)
    : false;

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

  const selectedPermissionSet = useMemo(() => {
    return new Set(selectedPermissionNames);
  }, [selectedPermissionNames]);

  const hasUnsavedChanges = useMemo(() => {
    return !areSamePermissions(
      selectedPermissionNames,
      originalPermissionNames
    );
  }, [selectedPermissionNames, originalPermissionNames]);

  const visiblePrivileges = privileges;

  const loadRolesAndPrivileges = useCallback(async () => {
    if (!isSuperAdmin) return;

    setInitialLoading(true);

    try {
      const [rolesResponse, privilegesResponse] = await Promise.all([
        getRolesAPI(),
        getPrivilegesAPI(),
      ]);

      const normalizedRoles = normalizeRoles(rolesResponse);
      const normalizedPrivileges = normalizePrivileges(privilegesResponse);

      setRoles(normalizedRoles);
      setPrivileges(normalizedPrivileges);

      setSelectedRoleId((currentRoleId) => {
        const currentRoleStillExists = normalizedRoles.some(
          (role) => String(role.id) === String(currentRoleId)
        );

        if (currentRoleStillExists) {
          return currentRoleId;
        }

        const firstVisibleRole = normalizedRoles.find(
          (role) =>
            normalizeRoleNameForCheck(role.name) !== "SUPER_ADMIN" &&
            normalizeRoleNameForCheck(role.name) !== "CUSTOMER"
        );

        return firstVisibleRole?.id ?? null;
      });
    } catch (error) {
      showErrorToast(error.message || "Failed to load roles and privileges.");
    } finally {
      setInitialLoading(false);
    }
  }, [isSuperAdmin]);

  const loadPermissionsForRole = useCallback(async (roleId) => {
    if (!roleId) return;

    setPermissionsLoading(true);

    try {
      const permissionResponse = await getRolePermissionsAPI(roleId);
      const normalizedPermissionNames =
        normalizePermissionNames(permissionResponse);

      setSelectedPermissionNames(normalizedPermissionNames);
      setOriginalPermissionNames(normalizedPermissionNames);
    } catch (error) {
      showErrorToast(error.message || "Failed to load role permissions.");
      setSelectedPermissionNames([]);
      setOriginalPermissionNames([]);
    } finally {
      setPermissionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSuperAdmin) {
      loadRolesAndPrivileges();
    }
  }, [isSuperAdmin, loadRolesAndPrivileges]);

  useEffect(() => {
    if (isSuperAdmin && selectedRoleId) {
      loadPermissionsForRole(selectedRoleId);
    }
  }, [isSuperAdmin, selectedRoleId, loadPermissionsForRole]);

  function handleSelectRole(roleId) {
    setSelectedRoleId(roleId);
  }

  function handleTogglePermission(permissionName) {
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

  function parseSalaryValue(value) {
    const numberValue = Number(value);

    if (Number.isNaN(numberValue)) {
      return null;
    }

    return numberValue;
  }

  async function handleSaveBaseSalary() {
    if (!selectedRole || selectedRoleIsLocked) {
      return;
    }

    const salaryValue = parseSalaryValue(baseSalaryInput);

    if (salaryValue === null || salaryValue < 0) {
      showErrorToast("Base salary must be a valid non-negative number.");
      return;
    }

    setSalarySaving(true);

    try {
      await updateRoleAPI(selectedRole.id, {
        baseSalary: salaryValue,
      });

      setRoles((currentRoles) =>
        currentRoles.map((role) =>
          String(role.id) === String(selectedRole.id)
            ? { ...role, baseSalary: salaryValue }
            : role
        )
      );

      showSuccessToast("Role base salary updated successfully.");
    } catch (error) {
      showErrorToast(error.message || "Failed to update role base salary.");
    } finally {
      setSalarySaving(false);
    }
  }

  async function handleCreateRole(event) {
    event.preventDefault();

    const normalizedName = normalizeRoleNameForCheck(newRoleName);
    const salaryValue = parseSalaryValue(newRoleBaseSalary || "0");

    if (!normalizedName) {
      showErrorToast("Role name is required.");
      return;
    }

    if (salaryValue === null || salaryValue < 0) {
      showErrorToast("Base salary must be a valid non-negative number.");
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

      showSuccessToast(
        "Role created successfully. You can now assign permissions."
      );
    } catch (error) {
      showErrorToast(error.message || "Failed to create role.");
    } finally {
      setCreatingRole(false);
    }
  }

  async function handleDeleteSelectedRole() {
    if (!selectedRole) {
      return;
    }

    if (selectedRoleDeleteBlockedReason) {
      showErrorToast(selectedRoleDeleteBlockedReason);
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

      const nextRole =
        normalizedRoles.find((role) => !isPermissionLockedRoleName(role.name)) ||
        normalizedRoles[0] ||
        null;

      setSelectedRoleId(nextRole?.id ?? null);
      setSelectedPermissionNames([]);
      setOriginalPermissionNames([]);

      showSuccessToast("Role deleted successfully.");
    } catch (error) {
      showErrorToast(error.message || "Failed to delete role.");
    } finally {
      setDeletingRole(false);
    }
  }

  async function handleSavePermissions() {
    if (!selectedRoleId || selectedRoleIsLocked) return;

    setSaving(true);

    try {
      const sortedPermissionNames = [...selectedPermissionNames].sort();

      await updateRolePermissionsAPI(selectedRoleId, sortedPermissionNames);

      setOriginalPermissionNames(sortedPermissionNames);
      setSelectedPermissionNames(sortedPermissionNames);

      setRoles((currentRoles) =>
        currentRoles.map((role) =>
          String(role.id) === String(selectedRoleId)
            ? { ...role, permissionCount: sortedPermissionNames.length }
            : role
        )
      );

      showSuccessToast("Role permissions updated successfully.");
    } catch (error) {
      showErrorToast(error.message || "Failed to update role permissions.");
    } finally {
      setSaving(false);
    }
  }

  if (!isSuperAdmin) {
    return <NoAccessView currentRoleName={currentRoleName} />;
  }

  return (
    <div className="space-y-6">
      {/* Add Role form */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <form onSubmit={handleCreateRole} className="space-y-3">
          <div>
            <div className="flex items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-gray-900">
                Add New Role
              </h4>

              <span className="rounded-full bg-orange-50 px-2 py-1 text-[10px] font-semibold text-orange-600">
                SUPER_ADMIN
              </span>
            </div>

            <p className="mt-1 text-xs text-gray-500">
              Create the role first. Assign permissions after selecting it.
            </p>
          </div>

          <input
            type="text"
            value={newRoleName}
            onChange={(event) => setNewRoleName(event.target.value)}
            placeholder="Example: WAITER"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
          />

          <textarea
            value={newRoleDescription}
            onChange={(event) => setNewRoleDescription(event.target.value)}
            placeholder="Role description"
            rows={2}
            className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
          />

          <input
            type="number"
            min="0"
            step="0.01"
            value={newRoleBaseSalary}
            onChange={(event) => setNewRoleBaseSalary(event.target.value)}
            placeholder="Base salary, example: 45000"
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
          />

          <button
            type="submit"
            disabled={creatingRole}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            <RiAddLine size={18} />
            {creatingRole ? "Creating..." : "Create Role"}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Roles list */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm xl:col-span-1">
          <div className="border-b border-gray-100 p-5">
            <div className="flex items-center gap-2">
              <RiUserSettingsLine size={20} className="text-gray-500" />

              <h3 className="font-semibold text-gray-900">Roles</h3>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              {visibleRoles.length} role
              {visibleRoles.length === 1 ? "" : "s"} available
            </p>
          </div>

          <div className="p-3">
            {initialLoading ? (
              <div className="p-4 text-sm text-gray-500">
                Loading roles...
              </div>
            ) : roles.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No roles found.</div>
            ) : (
              <div className="space-y-2">
                {visibleRoles.map((role) => {
                  const isSelected =
                    String(role.id) === String(selectedRoleId);

                  const roleIsCore = isCoreRoleName(role.name);
                  const roleIsPermissionLocked =
                    isPermissionLockedRoleName(role.name);

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleSelectRole(role.id)}
                      className={`w-full rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? "border-orange-200 bg-orange-50"
                          : "border-gray-100 bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p
                              className={`text-sm font-semibold ${
                                isSelected
                                  ? "text-orange-700"
                                  : "text-gray-900"
                              }`}
                            >
                              {role.name}
                            </p>

                            {roleIsCore && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-500">
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

                          <p className="mt-1 text-xs text-gray-500">
                            {role.description || "No description"}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${
                            isSelected
                              ? "bg-orange-100 text-orange-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {role.permissionCount}
                        </span>
                      </div>

                      <div className="mt-3 space-y-1 text-xs text-gray-500">
                        <div className="flex items-center justify-between">
                          <span>Permissions: {role.permissionCount}</span>
                          <span>Active users: {role.activeUserCount}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span>Base salary</span>

                          <span className="font-semibold text-gray-700">
                            {role.baseSalary
                              ? Number(role.baseSalary).toLocaleString()
                              : "Not set"}
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
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm xl:col-span-2">
          {!selectedRole ? (
            <div className="p-6 text-sm text-gray-500">
              Please select a role from the left side.
            </div>
          ) : (
            <div className="p-5">
              {/* Role base salary editor */}
              <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-gray-700">
                      Role Base Salary
                    </label>

                    <p className="mt-1 text-xs text-gray-500">
                      This is the default salary used when creating a new staff
                      member with this role. Existing staff salaries will not
                      change automatically.
                    </p>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={baseSalaryInput}
                      disabled={selectedRoleIsLocked}
                      onChange={(event) =>
                        setBaseSalaryInput(event.target.value)
                      }
                      placeholder="Example: 60000"
                      className="mt-3 w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100 disabled:text-gray-400"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveBaseSalary}
                    disabled={!selectedRole || selectedRoleIsLocked || salarySaving}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-300"
                  >
                    <RiSaveLine size={18} />
                    {salarySaving ? "Saving..." : "Save Salary"}
                  </button>
                </div>
              </div>

              {/* Role permission action bar */}
              <div className="mb-5 rounded-xl border border-gray-100 bg-white p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedRole
                        ? `${selectedRole.name} Permissions`
                        : "Role Permissions"}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Select or remove permissions for this role, then save your
                      changes.
                    </p>

                    {hasUnsavedChanges && !selectedRoleIsLocked && (
                      <p className="mt-2 text-xs font-medium text-amber-600">
                        You have unsaved permission changes.
                      </p>
                    )}

                    {selectedRoleIsLocked && (
                      <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                        {getLockedRoleMessage(selectedRole.name)}
                      </p>
                    )}

                    {selectedRoleDeleteBlockedReason && (
                      <p className="mt-2 rounded-lg bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600">
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
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
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
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500"
                    >
                      <RiSaveLine size={18} />
                      {saving ? "Saving..." : "Save Permissions"}
                    </button>
                  </div>
                </div>
              </div>

              {selectedRoleIsLocked ? (
                <div className="rounded-xl border border-amber-100 bg-amber-50 p-5 text-sm text-amber-700">
                  <p className="font-semibold">This role is read-only.</p>

                  <p className="mt-1">
                    {getLockedRoleMessage(selectedRole.name)}
                  </p>

                  <p className="mt-3 text-xs">
                    Permissions are protected for this role, so they are not
                    shown as editable checkboxes.
                  </p>
                </div>
              ) : permissionsLoading ? (
                <div className="rounded-xl border border-gray-100 p-5 text-sm text-gray-500">
                  Loading permissions...
                </div>
              ) : privileges.length === 0 ? (
                <div className="rounded-xl border border-gray-100 p-5 text-sm text-gray-500">
                  No privileges found.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {visiblePrivileges.map((privilege) => {
                    const checked = selectedPermissionSet.has(privilege.name);

                    return (
                      <label
                        key={privilege.id}
                        className={`flex items-start gap-3 rounded-xl border p-3 transition ${
                          checked
                            ? "border-orange-200 bg-orange-50"
                            : "border-gray-100 hover:bg-gray-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={selectedRoleIsLocked}
                          onChange={() =>
                            handleTogglePermission(privilege.name)
                          }
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <div>
                          <p
                            className={`text-sm font-medium ${
                              checked ? "text-orange-700" : "text-gray-700"
                            }`}
                          >
                            {formatPermissionName(privilege.name)}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {privilege.name}
                          </p>

                          {privilege.description && (
                            <p className="mt-1 text-xs text-gray-500">
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
    </div>
  );
}