import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext, useLocation } from "react-router-dom";
import { RiUserAddLine, RiArrowLeftLine } from "@remixicon/react";

import { createStaffAPI } from "../../apis/staff/staff";
import { getAllBranchesAPI } from "../../apis/staff/branches";
import { getRolesAPI } from "../../apis/staff/roles";

import { useAuth } from "../../context/AuthContext";

export default function CreateStaffPage() {
    /*
        Roles are loaded from the database.

        SUPER_ADMIN can assign all staff-side roles except CUSTOMER.
        ADMIN can assign only branch-level roles, so ADMIN cannot assign:
        - CUSTOMER
        - SUPER_ADMIN
        - ADMIN
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
        useNavigate is used to redirect after successful staff creation.
    */
    const navigate = useNavigate();

    const location = useLocation();

    /*
        This page is shared by SUPER_ADMIN and ADMIN routes.
    
        SUPER_ADMIN route:
        /staff/staff
    
        ADMIN route:
        /admin-panel/staff
    */
    const staffListPath = location.pathname.startsWith("/admin-panel")
        ? "/admin-panel/staff"
        : "/staff/staff";

    /*
        useOutletContext comes from MainLayout.
        It lets this page update the shared header section.
    */
    const { setHeaderInfo } = useOutletContext();

    /*
    Read logged-in user details from AuthContext.

    AuthContext now gets user data from the decoded JWT token.
    We no longer read authUser from localStorage.
*/
    const { user: authUser } = useAuth();

    const loggedInRole = authUser?.roleName || authUser?.role || "";
    const loggedInBranchId = authUser?.branchId || "";
    const loggedInBranchName = authUser?.branchName || "Your branch";

    /*
        Check logged-in user's role.

        SUPER_ADMIN can select branches manually.
        ADMIN uses their own branch automatically.
    */
    const isSuperAdmin = loggedInRole === "SUPER_ADMIN";
    const isAdmin = loggedInRole === "ADMIN";

    /*
        formData stores all form input values.

        branchId:
        - SUPER_ADMIN starts empty and must select a branch for non-SUPER_ADMIN staff.
        - ADMIN automatically uses their own branch.
    */
    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        email: "",
        phone: "",
        roleName: isSuperAdmin ? "RECEPTIONIST" : "MANAGER",
        branchId: isSuperAdmin ? "" : loggedInBranchId,

        // Actual salary saved for this staff member.
        // This will be auto-filled from selected role baseSalary.
        salary: "",
    });

    /*
        loading controls the Create Staff button.
        error stores validation or backend errors.
        branches stores branch list loaded from backend.
        roles stores role list loaded from backend.
    */
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [branches, setBranches] = useState([]);
    const [roles, setRoles] = useState([]);
    const [rolesLoading, setRolesLoading] = useState(true);
    const [branchLoading, setBranchLoading] = useState(true);

    /*
        Role dropdown values come from backend roles table.
        This allows newly-created roles like LINE_CHEF to appear automatically.
    */
    const allowedRoles = roles.filter((role) =>
        canAssignRole(role.name, isSuperAdmin, isAdmin)
    );

    /*
        Check whether a branch is active.

        Main backend response:
        status: "ACTIVE" or "INACTIVE"

        Fallback support:
        active: true / false
        isActive: true / false
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

        Branch Management page can show all branches,
        but staff creation should not allow inactive branches.
    */
    const activeBranches = branches.filter(isActiveBranch);

    /*
        Load branches for SUPER_ADMIN only.

        ADMIN does not need to load all branches because ADMIN is locked
        to their own branch.
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
                /*
                    Always keep branches as an array so map/filter will not crash.
                */
                setBranches(Array.isArray(data) ? data : []);
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

                const defaultRole = roleList.find((role) => role.name === defaultRoleName);

                setFormData((previous) => ({
                    ...previous,
                    roleName: defaultRoleName,
                    salary:
                        defaultRole?.baseSalary === null || defaultRole?.baseSalary === undefined
                            ? ""
                            : String(defaultRole.baseSalary),
                }));
            } catch (error) {
                console.error("Failed to load role data:", error);
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
        Gets the branch name for the success/failure message.

        This is important because if email fails, the admin must clearly know
        which staff account the temporary password belongs to.
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
        Update formData when user types or selects something.

        Example:
        If input has name="email",
        this function updates formData.email.
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

                So if role is changed to SUPER_ADMIN,
                clear branchId.
            */
            if (name === "roleName" && value === "SUPER_ADMIN") {
                updatedData.branchId = "";
            }

            /*
                When role changes, auto-fill salary from that role's base salary.
                User can still manually change the salary after this.
            */
            if (name === "roleName") {
                updatedData.salary = value === "SUPER_ADMIN" ? "" : getDefaultSalaryForRole(value);
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
        setError("");

        /*
            Create backend request payload.

            For SUPER_ADMIN role:
            branchId should be null.

            For other roles:
            - SUPER_ADMIN selects branch from dropdown.
            - ADMIN automatically uses loggedInBranchId.
        */
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

            // Salary is optional.
            // If empty, backend can use role base salary.
            salary:
                formData.roleName === "SUPER_ADMIN" || formData.salary === ""
                    ? null
                    : Number(formData.salary),
        };

        /*
            Validate required personal fields.
        */
        if (!payload.fullName || !payload.username || !payload.email || !payload.phone) {
            setError("Please fill all required fields.");
            setLoading(false);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\d{10}$/;

        if (!emailRegex.test(payload.email)) {
            setError("Invalid email format.");
            setLoading(false);
            return;
        }

        if (!phoneRegex.test(payload.phone)) {
            setError("Phone number must be exactly 10 digits.");
            setLoading(false);
            return;
        }

        /*
            Validate branch selection.

            SUPER_ADMIN account does not need a branch.
            All other staff accounts must have a branch.
        */
        if (payload.roleName !== "SUPER_ADMIN" && !payload.branchId) {
            setError("Please select a branch.");
            setLoading(false);
            return;
        }

        /*
            Salary cannot be negative.
        */
        if (payload.salary !== null && payload.salary < 0) {
            setError("Salary cannot be negative.");
            setLoading(false);
            return;
        }

        /*
            Extra frontend safety check.

            If SUPER_ADMIN is creating a branch-level staff user,
            check whether the selected branch is active.

            This prevents staff creation for inactive branches from the frontend.
            Backend should also reject inactive branch IDs.
        */
        if (isSuperAdmin && payload.roleName !== "SUPER_ADMIN") {
            const selectedBranch = branches.find((branch) => {
                const branchId = branch.id || branch.branchId;
                return Number(branchId) === Number(payload.branchId);
            });

            if (!selectedBranch) {
                setError("Selected branch was not found.");
                setLoading(false);
                return;
            }

            if (!isActiveBranch(selectedBranch)) {
                setError("Cannot create staff for an inactive branch.");
                setLoading(false);
                return;
            }
        }

        /*
            Call backend API to create staff.
        */
        const { data, error } = await createStaffAPI(payload);

        if (error) {
            setError(error);
            setLoading(false);
            return;
        }

        /*
            Staff creation can succeed in two ways:

            1. Staff created + invite email sent successfully.
            2. Staff created + invite email failed.

            In both cases, we show the created staff member details so the admin
            knows exactly which account was created.

            Temporary password is shown ONLY when email failed,
            because when email succeeds, the staff member receives it by email.
        */
        const createdStaffName = data?.fullName || payload.fullName;
        const createdStaffUsername = data?.username || payload.username;
        const createdStaffEmail = data?.email || payload.email;
        const createdStaffRole = data?.roleName || payload.roleName;
        const createdStaffBranch = getCreatedStaffBranchName(payload, data);

        const successMessage =
            data?.emailSent === true
                ? `Staff member created successfully. Invite email has been sent to ${createdStaffEmail}. Staff: ${createdStaffName} (@${createdStaffUsername}), Role: ${createdStaffRole}, Branch: ${createdStaffBranch}.`
                : `Staff member created successfully, but invite email failed. Staff: ${createdStaffName} (@${createdStaffUsername}), Email: ${createdStaffEmail}, Role: ${createdStaffRole}, Branch: ${createdStaffBranch}. Temporary password: ${data?.temporaryPassword || "Not returned"}`;

        setLoading(false);

        navigate(staffListPath, {
            state: {
                successMessage,

                /*
                    StaffListPage uses this to automatically search and show
                    the newly-created staff row after redirect.
                */
                createdStaffSearch: createdStaffEmail || createdStaffUsername || createdStaffName,
            },
        });
    };

    return (
        <div className="max-w-4xl">
            <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm">
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

                {/* Error message */}
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
                                placeholder="Branch 01 Receptionist"
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone
                            </label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="0771234567"
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                            />
                        </div>

                        {/* Role dropdown */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Role
                            </label>
                            <select
                                name="roleName"
                                value={formData.roleName}
                                onChange={handleChange}
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                            >
                                {/* Show only roles allowed for the logged-in user */}
                                {allowedRoles.map((role) => (
                                    <option key={role.id || role.name} value={role.name}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
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
                                disabled={formData.roleName === "SUPER_ADMIN" || rolesLoading}
                                placeholder={
                                    rolesLoading
                                        ? "Loading role salary..."
                                        : "Enter staff salary"
                                }
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-50 disabled:text-gray-400"
                            />

                            <p className="mt-1 text-xs text-gray-400">
                                Auto-filled from the selected role. You can adjust it before creating the staff member.
                            </p>
                        </div>

                        {/* Branch section */}
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

                                        {/* Show only ACTIVE branches in staff creation */}
                                        {activeBranches.map((branch) => (
                                            <option
                                                key={branch.id || branch.branchId}
                                                value={branch.id || branch.branchId}
                                            >
                                                {branch.name}
                                            </option>
                                        ))}

                                        {/* Show helpful message if there are no active branches */}
                                        {!branchLoading && activeBranches.length === 0 && (
                                            <option value="" disabled>
                                                No active branches available
                                            </option>
                                        )}
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

                    {/* Info message */}
                    <div className="rounded-2xl bg-orange-50 border border-orange-100 px-4 py-3 text-sm text-orange-700">
                        After staff creation, the backend will generate a temporary password and send the invite email.
                        If email sending fails, the temporary password will be shown once on the staff list page.
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
                            disabled={loading}
                            className="rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600 disabled:opacity-60"
                        >
                            {loading ? "Creating..." : "Create Staff"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}