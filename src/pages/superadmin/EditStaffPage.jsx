// src/pages/superadmin/EditStaffPage.jsx

import { useEffect, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";
import { RiArrowLeftLine, RiEditLine } from "@remixicon/react";

import { getStaffByIdAPI, updateStaffAPI } from "../../apis/staff/staff";
import { getAllBranchesAPI } from "../../apis/staff/branches";
import { getRolesAPI } from "../../apis/staff/roles";

import { useAuth } from "../../context/AuthContext";

/*
  Dynamic role rules:

  SUPER_ADMIN can assign all staff-side roles except CUSTOMER.
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

  This supports both:
  - direct array response
  - wrapped response like { data: [...] }
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
  const { setHeaderInfo } = useOutletContext();

  const location = useLocation();

  /*
    This page is shared by SUPER_ADMIN and ADMIN.
  
    SUPER_ADMIN route:
    /staff/staff/:id/edit
  
    ADMIN route:
    /admin-panel/staff/:id/edit
  */
  const isAdminPanelRoute = location.pathname.startsWith("/admin-panel");

  const staffListPath = isAdminPanelRoute
    ? "/admin-panel/staff"
    : "/staff/staff";

  const staffDetailsPath = isAdminPanelRoute
    ? `/admin-panel/staff/${id}`
    : `/staff/staff/${id}`;

  /*
  Read logged-in user details from AuthContext.

  AuthContext now gets user data from the decoded JWT token.
  We no longer read authUser from localStorage.
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
  const [branchLoading, setBranchLoading] = useState(false);
  const [rolesLoading, setRolesLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    we still show it as a fallback option so the dropdown never appears blank.

    Example:
    ADMIN viewing/editing an ADMIN account:
    - role should show ADMIN
    - dropdown is disabled
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
      setError("");

      /*
        1. Load staff details.
      */
      const staffResult = await getStaffByIdAPI(id);

      if (staffResult.error) {
        setError(staffResult.error);
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
        loadedRoles = [];
      } finally {
        setRolesLoading(false);
      }

      /*
        3. If old staff salary is null, show role base salary as helper/default.
        This does not save automatically until user clicks Save.
      */
      const currentRole = loadedRoles.find((role) => role.name === staffRoleName);

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
    setError("");

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
      setError("Please fill all required fields.");
      setSaving(false);
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
      setError("Please select a branch.");
      setSaving(false);
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
      setError("Salary cannot be negative.");
      setSaving(false);
      return;
    }

    const result = await updateStaffAPI(id, payload);

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    setSaving(false);

    navigate(staffListPath, {
      state: {
        successMessage: "Staff member updated successfully.",
      },
    });
  };

  if (pageLoading) {
    return (
      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm text-sm text-gray-500">
        Loading staff details...
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm">
        <div className="mb-6">
          <Link
            to={staffDetailsPath}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600"
          >
            <RiArrowLeftLine size={18} />
            Back to staff details
          </Link>
        </div>

        {error && (
          <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch
                  </label>

                  <div className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
                    Global access — no branch required
                  </div>
                </div>
              )
            ) : (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
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
              to={staffListPath}
              className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}