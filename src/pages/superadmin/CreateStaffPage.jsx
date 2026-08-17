import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useOutletContext,
  useLocation,
} from "react-router-dom";
import { RiUserAddLine, RiArrowLeftLine } from "@remixicon/react";

import { createStaffAPI } from "../../apis/staff/staff";
import { getAllBranchesAPI } from "../../apis/staff/branches";
import { getRolesAPI } from "../../apis/staff/roles";

import {
  showSuccessToast,
  showErrorToast,
  showWarningToast,
} from "../../utils/toast";

import { useAuth } from "../../context/AuthContext";
import StaffCreatedSuccessModal from "../../components/common/StaffCreatedSuccessModal";

export default function CreateStaffPage() {
  /*
    Roles are loaded from the database.
  */
  const SUPER_ADMIN_BLOCKED_ROLES = ["CUSTOMER"];
  const ADMIN_BLOCKED_ROLES = ["CUSTOMER", "SUPER_ADMIN", "ADMIN"];

  /*
    Checks whether the logged-in user is allowed to assign a role.
  */
  function canAssignRole(roleName, isSuperAdmin, isAdmin) {
    if (isSuperAdmin) {
      return !SUPER_ADMIN_BLOCKED_ROLES.includes(roleName);
    }

    if (isAdmin) {
      return !ADMIN_BLOCKED_ROLES.includes(roleName);
    }

    return false;
  }

  /*
    stopWithError will show an error toast and stop the create button loading state.
  */
  const stopWithError = (message) => {
    showErrorToast(message);
    setLoading(false);
  };

  /*
    useNavigate is used for modal action buttons.
  */
  const navigate = useNavigate();
  const location = useLocation();

  /*
    This page is shared by SUPER_ADMIN and ADMIN routes.
  */
  const staffListPath = location.pathname.startsWith("/admin")
    ? "/admin/staff"
    : "/staff/staff";

  /*
    useOutletContext comes from MainLayout.
  */
  const { setHeaderInfo } = useOutletContext();

  /*
    Read logged in user details from AuthContext.
  */
  const { user: authUser } = useAuth();

  const loggedInRole = authUser?.roleName || authUser?.role || "";
  const loggedInBranchId = authUser?.branchId || "";
  const loggedInBranchName = authUser?.branchName || "Your branch";

  /*
    Check logged-in user's role.
  */
  const isSuperAdmin = loggedInRole === "SUPER_ADMIN";
  const isAdmin = loggedInRole === "ADMIN";

  /*
    formData stores all form input values.
  */
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    phone: "",
    roleName: isSuperAdmin ? "RECEPTIONIST" : "MANAGER",
    branchId: isSuperAdmin ? "" : loggedInBranchId,
    salary: "",
  });

  /*
    Page/action loading states.
  */
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [branchLoading, setBranchLoading] = useState(true);

  /*
    Stores the successfully created staff account for the success modal.
  */
  const [createdStaff, setCreatedStaff] = useState(null);

  /*
    Role dropdown values come from backend roles table.
    This allows newly-created roles like LINE_CHEF to appear automatically.
  */
  const allowedRoles = roles.filter((role) =>
    canAssignRole(role.name, isSuperAdmin, isAdmin)
  );

  /*
    Check whether a branch is active.
  */
  const isActiveBranch = (branch) => {
    if (branch.status) {
      return branch.status === "ACTIVE";
    }

    if (typeof branch.active === "boolean") {
      return branch.active;
    }

    if (typeof branch.isActive === "boolean") {
      return branch.isActive;
    }

    return false;
  };

  /*
    Only ACTIVE branches should appear in the Create Staff dropdown.
  */
  const activeBranches = branches.filter(isActiveBranch);

  /*
    Load branches for SUPER_ADMIN only.
  */
  useEffect(() => {
    const loadBranches = async () => {
      if (!isSuperAdmin) {
        setBranchLoading(false);
        return;
      }

      setBranchLoading(true);

      const { data, error } = await getAllBranchesAPI();

      if (!error) {
        setBranches(Array.isArray(data) ? data : []);
      } else {
        showErrorToast(error);
        setBranches([]);
      }

      setBranchLoading(false);
    };

    loadBranches();
  }, [isSuperAdmin]);

  /*
    Load roles from backend so staff role dropdown is database-driven.
  */
  useEffect(() => {
    const loadRoles = async () => {
      setRolesLoading(true);

      try {
        const data = await getRolesAPI();

        const roleList = Array.isArray(data) ? data : [];

        setRoles(roleList);

        const filteredRoles = roleList.filter((role) =>
          canAssignRole(role.name, isSuperAdmin, isAdmin)
        );

        const defaultRoleName =
          filteredRoles.find((role) => role.name === "RECEPTIONIST")?.name ||
          filteredRoles[0]?.name ||
          "";

        const defaultRole = roleList.find(
          (role) => role.name === defaultRoleName
        );

        setFormData((previous) => ({
          ...previous,
          roleName: defaultRoleName,
          salary:
            defaultRole?.baseSalary === null ||
              defaultRole?.baseSalary === undefined
              ? ""
              : String(defaultRole.baseSalary),
        }));
      } catch (error) {
        console.error("Failed to load role data:", error);
        showErrorToast("Failed to load role data.");
        setRoles([]);
      } finally {
        setRolesLoading(false);
      }
    };

    loadRoles();
  }, [isSuperAdmin, isAdmin]);

  /*
    Set the shared page header for this page.
  */
  useEffect(() => {
    setHeaderInfo({
      title: "Create Staff",
      description: "Create a new staff account and send an invite email.",
      Icon: RiUserAddLine,
    });

    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  /*
    Finds the selected role from the roles loaded from backend.
  */
  const findRoleByName = (roleName) => {
    return roles.find((role) => role.name === roleName);
  };

  /*
    Returns default salary for selected role.
    Old roles may have null baseSalary, so we return empty string in that case.
  */
  const getDefaultSalaryForRole = (roleName) => {
    const role = findRoleByName(roleName);

    if (!role || role.baseSalary === null || role.baseSalary === undefined) {
      return "";
    }

    return String(role.baseSalary);
  };

  /*
    Gets the branch name for the success modal.
  */
  const getCreatedStaffBranchName = (payload, data) => {
    if (payload.roleName === "SUPER_ADMIN") {
      return "Global";
    }

    if (data?.branchName) {
      return data.branchName;
    }

    if (!isSuperAdmin && loggedInBranchName) {
      return loggedInBranchName;
    }

    const selectedBranch = branches.find((branch) => {
      const branchId = branch.id || branch.branchId;
      return Number(branchId) === Number(payload.branchId);
    });

    return selectedBranch?.name || "Selected branch";
  };

  /*
    Reset the form after admin chooses Create Another.
  */
  const resetFormForAnotherStaff = () => {
    const defaultRoleName =
      allowedRoles.find((role) => role.name === "RECEPTIONIST")?.name ||
      allowedRoles[0]?.name ||
      "";

    const defaultRole = roles.find((role) => role.name === defaultRoleName);

    setFormData({
      fullName: "",
      username: "",
      email: "",
      phone: "",
      roleName: defaultRoleName,
      branchId: isSuperAdmin ? "" : loggedInBranchId,
      salary:
        defaultRole?.baseSalary === null ||
          defaultRole?.baseSalary === undefined
          ? ""
          : String(defaultRole.baseSalary),
    });
  };

  /*
    Update formData when user types or selects something.
  */
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => {
      const updatedData = {
        ...previous,
        [name]: value,
      };

      /*
        SUPER_ADMIN does not belong to a branch.
      */
      if (name === "roleName" && value === "SUPER_ADMIN") {
        updatedData.branchId = "";
      }

      /*
        When role changes, auto fill salary from that role's base salary.
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
    Submit the create staff form.

    This calls:
    POST /api/admin/staff
  */
  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);

    const payload = {
      fullName: formData.fullName.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      roleName: formData.roleName,
      branchId:
        formData.roleName === "SUPER_ADMIN"
          ? null
          : isSuperAdmin
            ? Number(formData.branchId)
            : Number(loggedInBranchId),

      salary:
        formData.roleName === "SUPER_ADMIN" || formData.salary === ""
          ? null
          : Number(formData.salary),
    };

    if (!payload.fullName || !payload.username || !payload.email || !payload.phone) {
      stopWithError("Please fill all required fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!emailRegex.test(payload.email)) {
      stopWithError("Invalid email format.");
      return;
    }

    if (!phoneRegex.test(payload.phone)) {
      stopWithError("Phone number must be exactly 10 digits.");
      return;
    }

    if (payload.roleName !== "SUPER_ADMIN" && !payload.branchId) {
      stopWithError("Please select a branch.");
      return;
    }

    if (payload.salary !== null && payload.salary < 0) {
      stopWithError("Salary cannot be negative.");
      return;
    }

    if (isSuperAdmin && payload.roleName !== "SUPER_ADMIN") {
      const selectedBranch = branches.find((branch) => {
        const branchId = branch.id || branch.branchId;
        return Number(branchId) === Number(payload.branchId);
      });

      if (!selectedBranch) {
        stopWithError("Selected branch was not found.");
        return;
      }

      if (!isActiveBranch(selectedBranch)) {
        stopWithError("Cannot create staff for an inactive branch.");
        return;
      }
    }

    const { data, error } = await createStaffAPI(payload);

    if (error) {
      stopWithError(error);
      return;
    }

    const createdStaffName = data?.fullName || payload.fullName;
    const createdStaffUsername = data?.username || payload.username;
    const createdStaffEmail = data?.email || payload.email;
    const createdStaffRole = data?.roleName || payload.roleName;
    const createdStaffBranch = getCreatedStaffBranchName(payload, data);

    const createdStaffDetails = {
      ...data,
      id: data?.id,
      fullName: createdStaffName,
      username: createdStaffUsername,
      email: createdStaffEmail,
      phone: data?.phone || payload.phone,
      roleName: createdStaffRole,
      branchId: data?.branchId ?? payload.branchId,
      branchName: createdStaffBranch,
      emailSent: Boolean(data?.emailSent),
      inviteStatus: data?.inviteStatus || "UNKNOWN",
      temporaryPassword: data?.temporaryPassword,
      message: data?.message,
    };

    setCreatedStaff(createdStaffDetails);
    setLoading(false);

    if (data?.emailSent === true) {
      showSuccessToast("Staff account created and invite email sent successfully.");
    } else {
      showWarningToast(
        "Staff account created, but invite email failed. Temporary password is shown in the success modal."
      );
    }
  };

  const handleViewCreatedStaff = () => {
    if (createdStaff?.id) {
      navigate(`${staffListPath}/${createdStaff.id}`);
      return;
    }

    navigate(staffListPath, {
      state: {
        createdStaffSearch:
          createdStaff?.email || createdStaff?.username || createdStaff?.fullName,
      },
    });
  };

  const handleCreateAnother = () => {
    setCreatedStaff(null);
    resetFormForAnotherStaff();
  };

  const handleBackToStaffList = () => {
    navigate(staffListPath, {
      state: {
        createdStaffSearch:
          createdStaff?.email || createdStaff?.username || createdStaff?.fullName,
      },
    });
  };

  const submitDisabled =
    loading ||
    rolesLoading ||
    (isSuperAdmin && formData.roleName !== "SUPER_ADMIN" && branchLoading);

  return (
    <>
      <div className="max-w-4xl">
        <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
          {/* Back link */}
          <div className="mb-6">
            <Link
              to={staffListPath}
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600"
            >
              <RiArrowLeftLine size={18} />
              Back to staff list
            </Link>
          </div>

          {(rolesLoading || branchLoading) && (
            <div className="mb-5 rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
                  <Spinner className="h-5 w-5 border-gray-300 border-t-orange-500" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-orange-900">
                    Preparing staff form
                  </h4>

                  <p className="mt-0.5 text-sm text-orange-700">
                    Please wait while roles and branch options are loaded.
                  </p>
                </div>
              </div>
            </div>
          )}

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
                  placeholder="Branch 01 Receptionist"
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Username */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Username
                </label>

                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="recep01"
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
                  placeholder="recep01@test.com"
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
                  placeholder="0771234567"
                  inputMode="numeric"
                  maxLength={10}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Phone number must be exactly 10 digits.
                </p>
              </div>

              {/* Role dropdown */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  Role
                  {rolesLoading && <InlineSpinner />}
                </label>

                <select
                  name="roleName"
                  value={formData.roleName}
                  onChange={handleChange}
                  disabled={rolesLoading || loading}
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-400"
                >
                  {rolesLoading ? (
                    <option value={formData.roleName}>Loading roles...</option>
                  ) : allowedRoles.length === 0 ? (
                    <option value="">No assignable roles available</option>
                  ) : (
                    allowedRoles.map((role) => (
                      <option key={role.id || role.name} value={role.name}>
                        {formatRoleName(role.name)}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Monthly salary */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  Monthly Salary (LKR)
                  {rolesLoading && <InlineSpinner />}
                </label>

                <input
                  type="number"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  disabled={formData.roleName === "SUPER_ADMIN" || rolesLoading}
                  placeholder={
                    rolesLoading ? "Loading role salary..." : "Enter staff salary"
                  }
                  className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-400"
                />

                <p className="mt-1 text-xs text-gray-400">
                  Auto-filled from the selected role. You can adjust it before
                  creating the staff member.
                </p>
              </div>

              {/* Branch section */}
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
                      disabled={branchLoading || loading}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-400"
                    >
                      <option value="">
                        {branchLoading ? "Loading branches..." : "Select branch"}
                      </option>

                      {activeBranches.map((branch) => (
                        <option
                          key={branch.id || branch.branchId}
                          value={branch.id || branch.branchId}
                        >
                          {branch.name}
                        </option>
                      ))}

                      {!branchLoading && activeBranches.length === 0 && (
                        <option value="" disabled>
                          No active branches available
                        </option>
                      )}
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

            {/* Info message */}
            <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm text-orange-700">
              After staff creation, the system will generate a temporary password
              and send the invite email. If email sending fails, the temporary
              password will be shown once in the success modal.
            </div>

            {/* Form buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                to={staffListPath}
                className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitDisabled}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && (
                  <Spinner className="h-4 w-4 border-orange-200 border-t-white" />
                )}

                {loading ? "Creating..." : "Create Staff"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {createdStaff && (
        <StaffCreatedSuccessModal
          staff={createdStaff}
          onViewStaff={handleViewCreatedStaff}
          onCreateAnother={handleCreateAnother}
          onBackToList={handleBackToStaffList}
          onClose={handleBackToStaffList}
        />
      )}
    </>
  );
}

function InlineSpinner() {
  return (
    <span className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-orange-500" />
  );
}

function Spinner({ className }) {
  return (
    <span
      className={`inline-flex animate-spin rounded-full border-2 ${className}`}
    />
  );
}

function formatRoleName(roleName) {
  return String(roleName || "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}