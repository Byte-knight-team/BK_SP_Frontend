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
  RiRefreshLine,
  RiCloseLine,
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

const PERMISSION_GROUP_LABELS = {
  STAFF: "Staff Management",
  BRANCH: "Branch Management",
  ROLE: "Roles & Permissions",
  PRIVILEGE: "Privileges",
  CONFIG: "System Configuration",
  AUDIT: "Audit Logs",
  CUSTOMER: "Customer Management",
  MENU: "Menu Management",
  CATEGORY: "Menu Categories",
  ITEM: "Menu Items",
  ORDER: "Orders",
  RESERVATION: "Reservations",
  INVENTORY: "Inventory",
  DELIVERY: "Delivery",
  PAYMENT: "Payments",
  KITCHEN: "Kitchen Operations",
  TABLE: "Table Management",
  QR: "QR Sessions",
  PROMOTION: "Promotions",
  COUPON: "Coupons",
  REVIEW: "Reviews",
  REPORT: "Reports",
  AUTH: "Authentication",
  USER: "Users",
  SYSTEM: "System",
  OTHER: "Other Permissions",
};

const PERMISSION_GROUP_ORDER = [
  "STAFF",
  "BRANCH",
  "ROLE",
  "PRIVILEGE",
  "CONFIG",
  "AUDIT",
  "CUSTOMER",
  "MENU",
  "CATEGORY",
  "ITEM",
  "ORDER",
  "RESERVATION",
  "INVENTORY",
  "DELIVERY",
  "PAYMENT",
  "KITCHEN",
  "TABLE",
  "QR",
  "PROMOTION",
  "COUPON",
  "REVIEW",
  "REPORT",
  "AUTH",
  "USER",
  "SYSTEM",
  "OTHER",
];

function normalizeRoleNameForCheck(roleName) {
  const normalizedRole = String(roleName || "").trim().toUpperCase();

  if (normalizedRole.startsWith("ROLE_")) {
    return normalizedRole.replace("ROLE_", "");
  }

  return normalizedRole;
}

function getPermissionGroupKey(permissionName) {
  const normalizedName = String(permissionName || "").trim().toUpperCase();

  if (!normalizedName) {
    return "OTHER";
  }

  const nameParts = normalizedName.split("_").filter(Boolean);

  const matchedKnownGroup = PERMISSION_GROUP_ORDER.find((groupKey) => {
    return groupKey !== "OTHER" && nameParts.includes(groupKey);
  });

  if (matchedKnownGroup) {
    return matchedKnownGroup;
  }

  return nameParts[0] || "OTHER";
}

function getPermissionGroupLabel(groupKey) {
  return PERMISSION_GROUP_LABELS[groupKey] || formatPermissionName(groupKey);
}

function groupPrivilegesByModule(privileges) {
  const groups = new Map();

  privileges.forEach((privilege) => {
    const groupKey = getPermissionGroupKey(privilege.name);
    const groupLabel = getPermissionGroupLabel(groupKey);

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        key: groupKey,
        label: groupLabel,
        items: [],
      });
    }

    groups.get(groupKey).items.push(privilege);
  });

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      items: [...group.items].sort((firstPrivilege, secondPrivilege) =>
        String(firstPrivilege.name || "").localeCompare(
          String(secondPrivilege.name || ""),
          undefined,
          { sensitivity: "base" }
        )
      ),
    }))
    .sort((firstGroup, secondGroup) => {
      const firstIndex = PERMISSION_GROUP_ORDER.indexOf(firstGroup.key);
      const secondIndex = PERMISSION_GROUP_ORDER.indexOf(secondGroup.key);

      const safeFirstIndex =
        firstIndex === -1 ? PERMISSION_GROUP_ORDER.length : firstIndex;

      const safeSecondIndex =
        secondIndex === -1 ? PERMISSION_GROUP_ORDER.length : secondIndex;

      if (safeFirstIndex !== safeSecondIndex) {
        return safeFirstIndex - safeSecondIndex;
      }

      return firstGroup.label.localeCompare(secondGroup.label, undefined, {
        sensitivity: "base",
      });
    });
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
    <div className="max-w-5xl">
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
            <RiLockLine size={24} />
          </div>

          <h3 className="font-semibold text-gray-900">No Access</h3>

          <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-gray-500">
            Roles & Permissions management is only available for SUPER_ADMIN.
          </p>

          <p className="mt-3 text-xs font-medium text-red-500">
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
  const isSuperAdmin =
    normalizeRoleNameForCheck(currentRoleName) === "SUPER_ADMIN";

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
  const [createRoleModalOpen, setCreateRoleModalOpen] = useState(false);

  const [deletingRole, setDeletingRole] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);

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
        selectedRole.baseSalary === null ||
          selectedRole.baseSalary === undefined
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

  const refreshDisabled =
    initialLoading ||
    permissionsLoading ||
    saving ||
    salarySaving ||
    creatingRole ||
    deletingRole;

  const visiblePrivileges = privileges;

  const groupedPrivileges = useMemo(() => {
    return groupPrivilegesByModule(visiblePrivileges);
  }, [visiblePrivileges]);

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
      setRoles([]);
      setPrivileges([]);
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
    if (saving || permissionsLoading || salarySaving || deletingRole) {
      return;
    }

    setSelectedRoleId(roleId);
  }

  function handleTogglePermission(permissionName) {
    if (selectedRoleIsLocked || permissionsLoading || saving) {
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
      setCreateRoleModalOpen(false);

      showSuccessToast(
        "Role created successfully. You can now assign permissions."
      );
    } catch (error) {
      showErrorToast(error.message || "Failed to create role.");
    } finally {
      setCreatingRole(false);
    }
  }

  function handleOpenDeleteRoleModal() {
    if (!selectedRole) {
      showErrorToast("Select a role first.");
      return;
    }

    if (selectedRoleDeleteBlockedReason) {
      showErrorToast(selectedRoleDeleteBlockedReason);
      return;
    }

    setRoleToDelete(selectedRole);
  }

  function handleCloseDeleteRoleModal() {
    if (deletingRole) return;
    setRoleToDelete(null);
  }

  async function handleConfirmDeleteRole() {
    if (!roleToDelete) {
      return;
    }

    setDeletingRole(true);

    try {
      await deleteRoleAPI(roleToDelete.id);

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
      setRoleToDelete(null);

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

  async function handleRefreshPage() {
    if (refreshDisabled) {
      return;
    }

    await loadRolesAndPrivileges();

    if (selectedRoleId) {
      await loadPermissionsForRole(selectedRoleId);
    }

    showSuccessToast("Roles and permissions refreshed.");
  }

  function handleOpenCreateRoleModal() {
    setCreateRoleModalOpen(true);
  }

  function handleCloseCreateRoleModal() {
    if (creatingRole) return;
    setCreateRoleModalOpen(false);
  }

  if (!isSuperAdmin) {
    return <NoAccessView currentRoleName={currentRoleName} />;
  }

  return (
    <div className="space-y-6">
      {/* Page toolbar */}
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Role Management Workspace
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Create roles, refresh RBAC data, update salary rules, and manage
              grouped permissions from one place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleRefreshPage}
              disabled={refreshDisabled}
              className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {initialLoading || permissionsLoading ? (
                <Spinner className="h-4 w-4 border-gray-300 border-t-orange-500" />
              ) : (
                <RiRefreshLine size={18} />
              )}

              {initialLoading || permissionsLoading ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              onClick={handleOpenCreateRoleModal}
              disabled={refreshDisabled}
              className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RiAddLine size={18} />
              Create Role
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Roles list */}
        <div
          className={`rounded-[1.5rem] border border-gray-100 bg-white shadow-sm xl:col-span-1 ${
            initialLoading
              ? "flex min-h-[clamp(24rem,calc(100vh-22rem),40rem)] flex-col"
              : ""
          }`}
        >
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

          <div
            className={`p-3 ${
              initialLoading ? "flex flex-1 items-center justify-center" : ""
            }`}
          >
            {initialLoading ? (
              <PanelState
                title="Loading roles"
                description="Please wait while roles and privileges are loaded."
                loading
              />
            ) : roles.length === 0 ? (
              <PanelState
                title="No roles found"
                description="No role records were returned from the backend."
              />
            ) : visibleRoles.length === 0 ? (
              <PanelState
                title="No editable roles"
                description="Only protected roles are available right now."
              />
            ) : (
              <div className="space-y-2">
                {visibleRoles.map((role) => {
                  const isSelected = String(role.id) === String(selectedRoleId);

                  const roleIsCore = isCoreRoleName(role.name);
                  const roleIsPermissionLocked =
                    isPermissionLockedRoleName(role.name);

                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => handleSelectRole(role.id)}
                      disabled={
                        saving ||
                        permissionsLoading ||
                        salarySaving ||
                        deletingRole
                      }
                      className={`w-full rounded-xl border p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-70 ${isSelected
                        ? "border-orange-200 bg-orange-50"
                        : "border-gray-100 bg-white hover:bg-gray-50"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p
                              className={`text-sm font-semibold ${isSelected
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
                          className={`rounded-full px-2 py-1 text-xs font-medium ${isSelected
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
        <div
          className={`rounded-[1.5rem] border border-gray-100 bg-white shadow-sm xl:col-span-2 ${
            initialLoading
              ? "flex min-h-[clamp(24rem,calc(100vh-22rem),40rem)] items-center justify-center"
              : ""
          }`}
        >
          {!selectedRole ? (
            <PanelState
              title="Select a role"
              description="Please select a role from the left side to view salary and permissions."
            />
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
                      disabled={selectedRoleIsLocked || salarySaving}
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
                    disabled={
                      !selectedRole || selectedRoleIsLocked || salarySaving
                    }
                    className="inline-flex h-11 min-w-[150px] items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {salarySaving ? (
                      <Spinner className="h-4 w-4 border-orange-200 border-t-white" />
                    ) : (
                      <RiSaveLine size={18} />
                    )}

                    {salarySaving ? "Saving..." : "Save Salary"}
                  </button>
                </div>
              </div>

              {/* Role permission action bar */}
              <div className="mb-5 rounded-xl border border-gray-100 bg-white p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {selectedRole
                        ? `${selectedRole.name} Permissions`
                        : "Role Permissions"}
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Permissions are grouped by system area. Select or remove
                      permissions for this role, then save your changes.
                    </p>

                    {permissionsLoading && (
                      <p className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-orange-600">
                        <Spinner className="h-3.5 w-3.5 border-orange-200 border-t-orange-600" />
                        Loading permissions...
                      </p>
                    )}

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

                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                    <button
                      type="button"
                      onClick={handleOpenDeleteRoleModal}
                      disabled={
                        !selectedRole ||
                        deletingRole ||
                        Boolean(selectedRoleDeleteBlockedReason)
                      }
                      title={selectedRoleDeleteBlockedReason || "Delete role"}
                      className="inline-flex h-12 min-w-[185px] items-center justify-center gap-2 whitespace-nowrap rounded-2xl border border-red-200 bg-white px-5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400"
                    >
                      {deletingRole ? (
                        <Spinner className="h-4 w-4 border-red-200 border-t-red-600" />
                      ) : (
                        <RiDeleteBinLine size={18} />
                      )}

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
                      className="inline-flex h-12 min-w-[185px] items-center justify-center gap-2 whitespace-nowrap rounded-2xl bg-orange-500 px-5 text-sm font-semibold text-white shadow-sm shadow-orange-100 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-500 disabled:shadow-none"
                    >
                      {saving ? (
                        <Spinner className="h-4 w-4 border-orange-200 border-t-white" />
                      ) : (
                        <RiSaveLine size={18} />
                      )}

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
                <PanelState
                  title="Loading permissions"
                  description="Please wait while permissions for the selected role are loaded."
                  loading
                />
              ) : privileges.length === 0 ? (
                <PanelState
                  title="No privileges found"
                  description="No privilege records were returned from the backend."
                />
              ) : (
                <div className="space-y-5">
                  {groupedPrivileges.map((group) => {
                    const selectedCount = group.items.filter((privilege) =>
                      selectedPermissionSet.has(privilege.name)
                    ).length;

                    return (
                      <div
                        key={group.key}
                        className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4"
                      >
                        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">
                              {group.label}
                            </h4>

                            <p className="mt-1 text-xs text-gray-500">
                              {selectedCount} of {group.items.length}{" "}
                              permissions selected
                            </p>
                          </div>

                          <span className="inline-flex w-fit rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-500 ring-1 ring-gray-100">
                            {group.key}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                          {group.items.map((privilege) => {
                            const checked = selectedPermissionSet.has(
                              privilege.name
                            );

                            return (
                              <label
                                key={privilege.id || privilege.name}
                                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${checked
                                  ? "border-orange-200 bg-orange-50"
                                  : "border-gray-100 bg-white hover:bg-gray-50"
                                  }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={selectedRoleIsLocked || saving}
                                  onChange={() =>
                                    handleTogglePermission(privilege.name)
                                  }
                                  className="peer sr-only"
                                />

                                <span
                                  className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${checked
                                    ? "border-orange-500 bg-orange-500 text-white"
                                    : "border-gray-300 bg-white text-transparent"
                                    }`}
                                >
                                  ✓
                                </span>

                                <div>
                                  <p
                                    className={`text-sm font-medium ${checked
                                      ? "text-orange-700"
                                      : "text-gray-700"
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {createRoleModalOpen && (
        <CreateRoleModal
          newRoleName={newRoleName}
          newRoleDescription={newRoleDescription}
          newRoleBaseSalary={newRoleBaseSalary}
          creatingRole={creatingRole}
          onRoleNameChange={setNewRoleName}
          onRoleDescriptionChange={setNewRoleDescription}
          onRoleBaseSalaryChange={setNewRoleBaseSalary}
          onClose={handleCloseCreateRoleModal}
          onSubmit={handleCreateRole}
        />
      )}

      {roleToDelete && (
        <DeleteRoleConfirmModal
          role={roleToDelete}
          deletingRole={deletingRole}
          onClose={handleCloseDeleteRoleModal}
          onConfirm={handleConfirmDeleteRole}
        />
      )}
    </div>
  );
}

function CreateRoleModal({
  newRoleName,
  newRoleDescription,
  newRoleBaseSalary,
  creatingRole,
  onRoleNameChange,
  onRoleDescriptionChange,
  onRoleBaseSalaryChange,
  onClose,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-900/40 px-4">
      <div className="w-full max-w-xl rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              Create New Role
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Create the role first. After creating it, select the role and
              assign permissions.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={creatingRole}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Role Name
            </label>

            <input
              type="text"
              value={newRoleName}
              onChange={(event) => onRoleNameChange(event.target.value)}
              disabled={creatingRole}
              placeholder="Example: WAITER"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-400"
            />

            <p className="mt-1 text-xs text-gray-400">
              Role name will be saved in uppercase format.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Description
            </label>

            <textarea
              value={newRoleDescription}
              onChange={(event) => onRoleDescriptionChange(event.target.value)}
              disabled={creatingRole}
              placeholder="Role description"
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-700">
              Base Salary
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              value={newRoleBaseSalary}
              onChange={(event) => onRoleBaseSalaryChange(event.target.value)}
              disabled={creatingRole}
              placeholder="Example: 45000"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-400"
            />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onClose}
              disabled={creatingRole}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={creatingRole}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 text-sm font-bold text-white shadow-sm shadow-orange-100 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingRole ? (
                <Spinner className="h-4 w-4 border-orange-200 border-t-white" />
              ) : (
                <RiAddLine size={18} />
              )}

              {creatingRole ? "Creating..." : "Create Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteRoleConfirmModal({ role, deletingRole, onClose, onConfirm }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-900/40 px-4">
      <div className="w-full max-w-lg rounded-[1.5rem] border border-gray-100 bg-white p-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
              <RiDeleteBinLine size={22} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900">Delete Role?</h3>

              <p className="mt-1 text-sm leading-6 text-gray-500">
                Please confirm before deleting this role. This action cannot be
                undone.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={deletingRole}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <div className="text-sm font-bold text-gray-900">{role.name}</div>

          <div className="mt-1 text-xs text-gray-500">
            {role.description || "No description"}
          </div>

          <div className="mt-3 grid gap-2 text-xs text-gray-600 sm:grid-cols-2">
            <div>
              <span className="font-semibold text-gray-800">Permissions:</span>{" "}
              {role.permissionCount ?? 0}
            </div>

            <div>
              <span className="font-semibold text-gray-800">Active users:</span>{" "}
              {role.activeUserCount ?? 0}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          Only non-core roles with no active users should be deleted. Make sure
          this role is no longer needed before continuing.
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            disabled={deletingRole}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-gray-200 bg-white px-4 text-sm font-bold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deletingRole}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-500 px-4 text-sm font-bold text-white shadow-sm shadow-red-100 hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deletingRole && (
              <Spinner className="h-4 w-4 border-red-200 border-t-white" />
            )}

            {deletingRole ? "Deleting..." : "Yes, Delete Role"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PanelState({ title, description, loading = false }) {
  return (
    <div className="p-6 text-center">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-500">
        {loading ? (
          <Spinner className="h-5 w-5 border-gray-300 border-t-orange-500" />
        ) : (
          <RiShieldCheckLine size={22} />
        )}
      </div>

      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>

      <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}

function Spinner({ className }) {
  return (
    <span
      className={`inline-flex animate-spin rounded-full border-2 ${className}`}
    />
  );
}
