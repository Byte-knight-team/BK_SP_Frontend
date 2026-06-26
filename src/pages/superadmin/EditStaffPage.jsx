// src/pages/superadmin/EditStaffPage.jsx

import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import {
  RiArrowLeftLine,
  RiEditLine,
  RiErrorWarningLine,
} from "@remixicon/react";

import { getStaffByIdAPI, updateStaffAPI } from "../../apis/staff/staff";
import { getAllBranchesAPI } from "../../apis/staff/branches";
import { getRolesAPI } from "../../apis/staff/roles";

import { useAuth } from "../../context/AuthContext";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

/*
  - Dynamic role rules -
      SUPER_ADMIN can assign all staffside roles except CUSTOMER.
      ADMIN can assign only branch-level staff roles.
      This means new roles like LINE_CHEF will appear automatically
      after they are created in the database.
*/
const SUPER_ADMIN_BLOCKED_ROLES = ["CUSTOMER"];
const ADMIN_BLOCKED_ROLES = ["CUSTOMER", "SUPER_ADMIN", "ADMIN"];

/*
  ADMIN must not edit ADMIN/SUPER_ADMIN/CUSTOMER role or salary.
*/
const ADMIN_PROTECTED_ROLES = ["CUSTOMER", "SUPER_ADMIN", "ADMIN"];

/*
  Checks whether the logged-in user can assign this role.
*/
function canAssignRole(roleName, isSuperAdmin, isAdmin) {
  if (!roleName) {
    return false;
  }

  if (isSuperAdmin) {
    return !SUPER_ADMIN_BLOCKED_ROLES.includes(roleName);
  }

  if (isAdmin) {
    return !ADMIN_BLOCKED_ROLES.includes(roleName);
  }

  return false;
}

/*
  Normalizes role API response into an array.
*/
function normalizeRoleList(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.roles)) {
    return response.roles;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  return [];
}

/*
  Normalizes branch API response into an array.
*/
function normalizeBranchList(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.branches)) {
    return response.branches;
  }

  if (Array.isArray(response?.content)) {
    return response.content;
  }

  return [];
}

/*
  Reads base salary from a selected role.
*/
function getRoleBaseSalary(role) {
  if (!role || role.baseSalary === null || role.baseSalary === undefined) {
    return "";
  }

  return String(role.baseSalary);
}

export default function EditStaffPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setHeaderInfo } = useOutletContext();

  /*
    This page is shared by SUPER_ADMIN and ADMIN.

    SUPER_ADMIN route:
    /staff/staff/:id/edit

    ADMIN route:
    /admin/staff/:id/edit
  */
  const isAdminPanelRoute = location.pathname.startsWith("/admin");

  const staffListPath = isAdminPanelRoute ? "/admin/staff" : "/staff/staff";

  const staffDetailsPath = isAdminPanelRoute
    ? `/admin/staff/${id}`
    : `/staff/staff/${id}`;

  /*
    Read logged-in user details from AuthContext.
  */
  const { user: authUser } = useAuth();

  const loggedInRole = authUser?.roleName || authUser?.role || "";
  const loggedInBranchId = authUser?.branchId || "";
  const loggedInBranchName = authUser?.branchName || "Your branch";

  const isSuperAdmin = loggedInRole === "SUPER_ADMIN";
  const isAdmin = loggedInRole === "ADMIN";

  /*
    Main editable form state.
  */
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    roleName: "",
    branchId: "",
    salary: "",
  });

  /*
    Data loaded from backend.
  */
  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);

  /*
    Page states.
  */
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [branchLoading, setBranchLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /*
    Role dropdown values come from backend roles table.
  */
  const allowedRoles = roles.filter((role) =>
    canAssignRole(role.name, isSuperAdmin, isAdmin)
  );

  /*
    ADMIN cannot edit protected roles.
    SUPER_ADMIN can edit any staff-side role.
  */
  const canEditSelectedRole =
    isSuperAdmin ||
    (isAdmin && !ADMIN_PROTECTED_ROLES.includes(formData.roleName));

  /*
    ADMIN cannot edit ADMIN/SUPER_ADMIN salary.
    SUPER_ADMIN can edit salary.
  */
  const canEditSalary =
    isSuperAdmin ||
    (isAdmin && !ADMIN_PROTECTED_ROLES.includes(formData.roleName));

  /*
    If the current staff role is not inside allowedRoles,
    still show it as a fallback option so the dropdown never appears blank.
  */
  const roleOptions = (() => {
    if (!formData.roleName) {
      return allowedRoles;
    }

    const currentRoleExists = allowedRoles.some(
      (role) => role.name === formData.roleName
    );

    if (currentRoleExists) {
      return allowedRoles;
    }

    return [
      {
        id: `current-${formData.roleName}`,
        name: formData.roleName,
        description: "Current role",
        baseSalary: null,
      },
      ...allowedRoles,
    ];
  })();

  /*
    Finds role object by role name.
  */
  const findRoleByName = (roleName) => {
    return roles.find((role) => role.name === roleName);
  };

  /*
    Gets default salary for a role.
    Used when role is changed in the edit form.
  */
  const getDefaultSalaryForRole = (roleName) => {
    const role = findRoleByName(roleName);
    return getRoleBaseSalary(role);
  };

  const stopWithError = (message) => {
    showErrorToast(message);
    setSaving(false);
  };

  useEffect(() => {
    setHeaderInfo({
      title: "Edit Staff",
      description: "Update staff account details, role, branch, and salary.",
      Icon: RiEditLine,
    });

    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  useEffect(() => {
    const loadPageData = async () => {
      setPageLoading(true);
      setPageError("");

      /*
        1. Load staff details.
      */
      const staffResult = await getStaffByIdAPI(id);

      if (staffResult.error) {
        setPageError(staffResult.error);
        showErrorToast(staffResult.error);
        setPageLoading(false);
        return;
      }

      const staff = staffResult.data;
      const staffRoleName = staff.roleName || staff.role || "";

      /*
        2. Load roles from database.
        This keeps the role dropdown dynamic.
      */
      let loadedRoles = [];

      try {
        setRolesLoading(true);

        const roleResponse = await getRolesAPI();
        loadedRoles = normalizeRoleList(roleResponse);

        setRoles(loadedRoles);
      } catch (error) {
        console.error("Failed to load role data:", error);
        showErrorToast("Failed to load role data.");
        loadedRoles = [];
      } finally {
        setRolesLoading(false);
      }

      /*
        3. If old staff salary is null, show role base salary as helper/default.
        This does not save automatically until user clicks Save.
      */
      const currentRole = loadedRoles.find(
        (role) => role.name === staffRoleName
      );

      const resolvedSalary =
        staff.salary === null || staff.salary === undefined
          ? getRoleBaseSalary(currentRole)
          : String(staff.salary);

      setFormData({
        fullName: staff.fullName || staff.name || "",
        email: staff.email || "",
        phone: staff.phone || "",
        roleName: staffRoleName,
        branchId: staff.branchId || staff.branch?.id || "",
        salary: resolvedSalary,
      });

      /*
        4. SUPER_ADMIN can choose any branch.
        ADMIN is locked to own branch, so no branch list is needed.
      */
      if (isSuperAdmin) {
        setBranchLoading(true);

        const branchResult = await getAllBranchesAPI();

        if (!branchResult.error) {
          setBranches(normalizeBranchList(branchResult.data));
        } else {
          showErrorToast(branchResult.error);
        }

        setBranchLoading(false);
      }

      setPageLoading(false);
    };

    loadPageData();
  }, [id, isSuperAdmin]);

  /*
    Handles text, number, select changes.
  */
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => {
      const updatedData = {
        ...previous,
        [name]: value,
      };

      /*
        SUPER_ADMIN is global and does not need branch.
      */
      if (name === "roleName" && value === "SUPER_ADMIN") {
        updatedData.branchId = "";
      }

      /*
        When role changes, auto-fill salary from new role base salary.
        User can still manually change the salary after this.
      */
      if (name === "roleName") {
        updatedData.salary =
          value === "SUPER_ADMIN" ? "" : getDefaultSalaryForRole(value);
      }

      return updatedData;
    });
  };

  /*
    Submit staff update.
  */
  const handleSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);

    /*
      Build payload carefully.

      ADMIN cannot edit protected role/salary.
      So roleName, branchId, and salary are included only when allowed.
    */
    const payload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),

      ...(canEditSelectedRole && {
        roleName: formData.roleName,
      }),

      ...(canEditSelectedRole && {
        branchId:
          formData.roleName === "SUPER_ADMIN"
            ? null
            : isSuperAdmin
              ? Number(formData.branchId)
              : Number(loggedInBranchId),
      }),

      ...(canEditSalary && {
        salary:
          formData.roleName === "SUPER_ADMIN" || formData.salary === ""
            ? null
            : Number(formData.salary),
      }),
    };

    /*
      Basic validation.
    */
    if (!payload.fullName || !payload.email || !payload.phone) {
      stopWithError("Please fill all required fields.");
      return;
    }

    /*
      Branch is required only when role editing is allowed
      and selected role is not SUPER_ADMIN.
    */
    if (
      canEditSelectedRole &&
      formData.roleName !== "SUPER_ADMIN" &&
      !payload.branchId
    ) {
      stopWithError("Please select a branch.");
      return;
    }

    /*
      Salary cannot be negative.
    */
    if (
      canEditSalary &&
      payload.salary !== null &&
      payload.salary !== undefined &&
      payload.salary < 0
    ) {
      stopWithError("Salary cannot be negative.");
      return;
    }

    const result = await updateStaffAPI(id, payload);

    if (result.error) {
      stopWithError(result.error);
      return;
    }

    setSaving(false);

    showSuccessToast("Staff member updated successfully.");

    navigate(staffListPath);
  };

  if (pageLoading) {
    return (
      <div className="max-w-4xl">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
          <EditStaffState
            Icon={RiEditLine}
            title="Loading staff edit form"
            description="Please wait while staff details, roles, and branch information are loaded."
            iconClassName="bg-gray-100 text-gray-600"
            loading
          />
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="max-w-4xl">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
          <BackToStaffListLink staffListPath={staffListPath} />

          <EditStaffState
            Icon={RiErrorWarningLine}
            title="Unable to load staff details"
            description={pageError}
            iconClassName="bg-red-50 text-red-600"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
        <BackToStaffListLink staffListPath={staffListPath} />

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {/* Full name */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Full Name
              </label>

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Phone
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {/* Role */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                Role
                {rolesLoading && <InlineSpinner />}
              </label>

              <select
                name="roleName"
                value={formData.roleName}
                onChange={handleChange}
                disabled={!canEditSelectedRole || rolesLoading}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-500"
              >
                {rolesLoading ? (
                  <option value={formData.roleName}>Loading roles...</option>
                ) : (
                  roleOptions.map((role) => (
                    <option key={role.id || role.name} value={role.name}>
                      {role.name}
                    </option>
                  ))
                )}
              </select>

              {!canEditSelectedRole && (
                <p className="mt-1 text-xs text-gray-400">
                  ADMIN users cannot change ADMIN or higher-level roles.
                </p>
              )}
            </div>

            {/* Monthly salary */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
                Monthly Salary (LKR)
              </label>

              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                min="0"
                step="0.01"
                disabled={!canEditSalary}
                placeholder={
                  canEditSalary
                    ? "Enter staff salary"
                    : "Salary editing is not allowed for this role"
                }
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-500"
              />

              <p className="mt-1 text-xs text-gray-400">
                {canEditSalary
                  ? "This is the individual salary for this staff member. It can be different from the role default salary."
                  : "ADMIN users cannot edit ADMIN or higher-level staff salaries."}
              </p>
            </div>

            {/* Branch */}
            {isSuperAdmin ? (
              formData.roleName !== "SUPER_ADMIN" ? (
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    Branch
                    {branchLoading && <InlineSpinner />}
                  </label>

                  <select
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleChange}
                    disabled={branchLoading}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50"
                  >
                    <option value="">
                      {branchLoading ? "Loading branches..." : "Select branch"}
                    </option>

                    {branches.map((branch) => (
                      <option
                        key={branch.id || branch.branchId}
                        value={branch.id || branch.branchId}
                      >
                        {branch.name}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Branch
                  </label>

                  <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                    Global access — no branch required
                  </div>
                </div>
              )
            ) : (
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Branch
                </label>

                <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                  {loggedInBranchName}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              to={staffDetailsPath}
              className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-orange-200 border-t-white" />
              )}

              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BackToStaffListLink({ staffListPath }) {
  return (
    <div className="mb-6">
      <Link
        to={staffListPath}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-700"
      >
        <RiArrowLeftLine size={18} />
        Back to staff list
      </Link>
    </div>
  );
}

function EditStaffState({
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

function InlineSpinner() {
  return (
    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-orange-500" />
  );
}