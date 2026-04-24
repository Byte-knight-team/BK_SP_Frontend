import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { RiUserAddLine, RiArrowLeftLine } from "@remixicon/react";

import { createStaffAPI } from "../../apis/staff/staff";
import { getAllBranchesAPI } from "../../apis/staff/branches";

/*
    These are the roles SUPER_ADMIN can create.

    SUPER_ADMIN can create:
    - SUPER_ADMIN
    - ADMIN
    - MANAGER
    - CHEF
    - RECEPTIONIST
    - DELIVERY
*/
const SUPER_ADMIN_ROLES = [
    "SUPER_ADMIN",
    "ADMIN",
    "MANAGER",
    "CHEF",
    "RECEPTIONIST",
    "DELIVERY",
];

/*
    These are the roles ADMIN can create.

    ADMIN should only create lower branch-level staff.
    ADMIN should not create another ADMIN or SUPER_ADMIN.
*/
const ADMIN_ROLES = [
    "MANAGER",
    "CHEF",
    "RECEPTIONIST",
    "DELIVERY",
];

export default function CreateStaffPage() {
    /*
        useNavigate is used to redirect after successful staff creation.
    */
    const navigate = useNavigate();

    /*
        useOutletContext comes from MainLayout.
        It lets this page update the shared header section.
    */
    const { setHeaderInfo } = useOutletContext();

    /*
        Read logged-in user details from localStorage.

        authUser was saved during login.
        Some responses may use roleName and some may use role,
        so we support both.
    */
    const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
    const loggedInRole = authUser.roleName || authUser.role || "";
    const loggedInBranchId = authUser.branchId || "";
    const loggedInBranchName = authUser.branchName || "Your branch";

    /*
        Check logged-in user's role.

        SUPER_ADMIN can select branches manually.
        ADMIN uses their own branch automatically.
    */
    const isSuperAdmin = loggedInRole === "SUPER_ADMIN";
    const isAdmin = loggedInRole === "ADMIN";

    /*
        Decide which roles should be shown in the role dropdown.
    */
    const allowedRoles = isSuperAdmin ? SUPER_ADMIN_ROLES : ADMIN_ROLES;

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
    });

    /*
        loading controls the Create Staff button.
        error stores validation or backend errors.
        branches stores branch list loaded from backend.
        branchLoading controls the branch dropdown loading state.
    */
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [branches, setBranches] = useState([]);
    const [branchLoading, setBranchLoading] = useState(true);

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
        };

        /*
            Validate required personal fields.
        */
        if (!payload.fullName || !payload.username || !payload.email || !payload.phone) {
            setError("Please fill all required fields.");
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
        const { error } = await createStaffAPI(payload);

        if (error) {
            setError(error);
            setLoading(false);
            return;
        }

        /*
            Staff created successfully.

            Redirect back to staff list and send a success message.
            StaffListPage reads this message using useLocation().
        */
        setLoading(false);

        navigate("/staff/staff", {
            state: {
                successMessage:
                    "Staff member created successfully. Invite email has been sent.",
            },
        });
    };

    return (
        <div className="max-w-4xl">
            <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm">
                {/* Back link */}
                <div className="mb-6">
                    <Link
                        to="/staff/staff"
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
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Branch section */}
                        {isSuperAdmin ? (
                            /*
                                SUPER_ADMIN can select branch manually,
                                but only for branch-level staff.

                                If SUPER_ADMIN is creating another SUPER_ADMIN,
                                branch is not required.
                            */
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
                                /*
                                    SUPER_ADMIN role does not belong to a branch.
                                */
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
                            /*
                                ADMIN cannot choose branch manually.
                                ADMIN can only create staff in their own branch.
                            */
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
                    </div>

                    {/* Form buttons */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Link
                            to="/staff/staff"
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