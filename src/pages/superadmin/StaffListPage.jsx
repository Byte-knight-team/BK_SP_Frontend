import { useEffect, useState } from "react";
import { Link, useLocation, useOutletContext } from "react-router-dom";
import {
    RiTeamLine,
    RiAddLine,
    RiRefreshLine,
    RiMailSendLine,
} from "@remixicon/react";

import {
    getAllStaffAPI,
    activateStaffAPI,
    deactivateStaffAPI,
    resendStaffInviteAPI,
} from "../../apis/staff/staff";

export default function StaffListPage() {
    /*
        Used to read success messages sent from CreateStaffPage after redirect.
    */
    const location = useLocation();

    /*
        setHeaderInfo comes from MainLayout through Outlet context.
        It updates the shared page header.
    */
    const { setHeaderInfo } = useOutletContext();

    /*
        Main staff data and UI states.
    */
    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    /*
        Search and filter states.
        These filters are frontend-side only, so no backend change is needed.
    */
    const [searchText, setSearchText] = useState("");
    const [roleFilter, setRoleFilter] = useState("ALL");
    const [branchFilter, setBranchFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");

    /*
        Logged-in user details.
        Used to control which staff status actions are allowed.
    */
    const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
    const loggedInRole = authUser.roleName || authUser.role || "";

    const isSuperAdmin = loggedInRole === "SUPER_ADMIN";
    const isAdmin = loggedInRole === "ADMIN";

    /*
        ADMIN can manage only lower branch-level roles.
        SUPER_ADMIN can manage all staff statuses.
    */
    const LOWER_ROLES_FOR_ADMIN = ["MANAGER", "CHEF", "RECEPTIONIST", "DELIVERY"];

    const canManageStaffStatus = (staff) => {
        const targetRole = staff.roleName || staff.role;

        if (isSuperAdmin) {
            return true;
        }

        if (isAdmin) {
            return LOWER_ROLES_FOR_ADMIN.includes(targetRole);
        }

        return false;
    };

    /*
        Show success message if another page redirected here with a message.
        CreateStaffPage redirects here after staff creation.

        If CreateStaffPage sends createdStaffSearch, automatically search for
        the newly-created staff row. This is very useful when email fails and
        the temporary password is shown.
    */
    useEffect(() => {
        if (location.state?.successMessage) {
            setSuccessMessage(location.state.successMessage);
        }

        if (location.state?.createdStaffSearch) {
            setSearchText(location.state.createdStaffSearch);
        }
    }, [location.state]);

    /*
        Set the shared page header.
    */
    useEffect(() => {
        setHeaderInfo({
            title: "Staff Management",
            description: "View, activate, deactivate, and manage internal staff accounts.",
            Icon: RiTeamLine,
        });

        return () => setHeaderInfo(null);
    }, [setHeaderInfo]);

    /*
        Load all staff from backend.
    */
    const loadStaff = async () => {
        setLoading(true);
        setError("");

        /*
            Do not clear successMessage here.
            Otherwise messages from create/activate/deactivate/resend can disappear too quickly.
        */
        const { data, error } = await getAllStaffAPI();

        if (error) {
            setError(error);
            setStaffList([]);
        } else {
            setStaffList(Array.isArray(data) ? data : []);
        }

        setLoading(false);
    };

    useEffect(() => {
        loadStaff();
    }, []);

    /*
        Backend responses may use id, userId, or staffId.
        This helper keeps the table safe.
    */
    const getStaffId = (staff) => {
        return staff.id || staff.userId || staff.staffId;
    };

    /*
        Backend responses may use active or isActive.
    */
    const getActiveStatus = (staff) => {
        if (typeof staff.active === "boolean") return staff.active;
        if (typeof staff.isActive === "boolean") return staff.isActive;
        return false;
    };

    /*
        Role name helper.
    */
    const getRoleName = (staff) => {
        return staff.roleName || staff.role || "N/A";
    };

    /*
        Branch name helper.
        SUPER_ADMIN or global staff will show as Global.
    */
    const getBranchName = (staff) => {
        return staff.branchName || staff.branch?.name || "Global";
    };

    /*
        Build unique role options from loaded staff data.
        This means custom roles like LINE_CHEF can appear automatically.
    */
    const roleOptions = Array.from(
        new Set(staffList.map((staff) => getRoleName(staff)).filter(Boolean))
    ).sort();

    /*
        Build unique branch options from loaded staff data.
    */
    const branchOptions = Array.from(
        new Set(staffList.map((staff) => getBranchName(staff)).filter(Boolean))
    ).sort();

    /*
        Main frontend-side search and filtering logic.
    */
    const filteredStaffList = staffList.filter((staff) => {
        const normalizedSearch = searchText.trim().toLowerCase();

        const fullName = staff.fullName || staff.name || "";
        const username = staff.username || "";
        const email = staff.email || "";
        const phone = staff.phone || "";
        const roleName = getRoleName(staff);
        const branchName = getBranchName(staff);
        const isActive = getActiveStatus(staff);

        /*
            Search checks name, username, email, phone, role, and branch.
        */
        const matchesSearch =
            normalizedSearch === "" ||
            fullName.toLowerCase().includes(normalizedSearch) ||
            username.toLowerCase().includes(normalizedSearch) ||
            email.toLowerCase().includes(normalizedSearch) ||
            phone.toLowerCase().includes(normalizedSearch) ||
            roleName.toLowerCase().includes(normalizedSearch) ||
            branchName.toLowerCase().includes(normalizedSearch);

        /*
            Role dropdown filter.
        */
        const matchesRole =
            roleFilter === "ALL" || roleName === roleFilter;

        /*
            Branch dropdown filter.
        */
        const matchesBranch =
            branchFilter === "ALL" || branchName === branchFilter;

        /*
            Status dropdown filter.
        */
        const matchesStatus =
            statusFilter === "ALL" ||
            (statusFilter === "ACTIVE" && isActive) ||
            (statusFilter === "INACTIVE" && !isActive);

        return matchesSearch && matchesRole && matchesBranch && matchesStatus;
    });

    /*
        Checks whether at least one filter is active.
    */
    const hasActiveFilters =
        searchText.trim() !== "" ||
        roleFilter !== "ALL" ||
        branchFilter !== "ALL" ||
        statusFilter !== "ALL";

    /*
        Reset all search/filter inputs.
    */
    const clearFilters = () => {
        setSearchText("");
        setRoleFilter("ALL");
        setBranchFilter("ALL");
        setStatusFilter("ALL");
    };

    /*
        Activate/deactivate staff.
    */
    const handleToggleStatus = async (staff) => {
        const staffId = getStaffId(staff);
        const isActive = getActiveStatus(staff);

        if (!staffId) {
            setError("Staff ID not found in response.");
            return;
        }

        setActionLoadingId(staffId);
        setError("");
        setSuccessMessage("");

        const result = isActive
            ? await deactivateStaffAPI(staffId)
            : await activateStaffAPI(staffId);

        if (result.error) {
            setError(result.error);
        } else {
            setSuccessMessage(
                isActive ? "Staff deactivated successfully." : "Staff activated successfully."
            );
            await loadStaff();
        }

        setActionLoadingId(null);
    };

    /*
        Resend staff invite.

        Important:
        Backend can generate a new temporary password even when SMTP fails.
        So frontend must check data.emailSent before showing the message.
    */
    const handleResendInvite = async (staff) => {
        const staffId = getStaffId(staff);

        if (!staffId) {
            setError("Staff ID not found in response.");
            return;
        }

        setActionLoadingId(staffId);
        setError("");
        setSuccessMessage("");

        const { data, error } = await resendStaffInviteAPI(staffId);

        if (error) {
            setError(error);
            setActionLoadingId(null);
            return;
        }

        const staffName = staff.fullName || staff.name || "Selected staff";
        const staffUsername = staff.username || "no-username";
        const staffEmail = staff.email || "No email";
        const staffRole = getRoleName(staff);
        const staffBranch = getBranchName(staff);

        if (data?.emailSent === true) {
            setSuccessMessage(
                `Invite email resent successfully to ${staffEmail}. Staff: ${staffName} (@${staffUsername}), Role: ${staffRole}, Branch: ${staffBranch}.`
            );
        } else {
            setSuccessMessage(
                `Invite email failed. Staff: ${staffName} (@${staffUsername}), Email: ${staffEmail}, Role: ${staffRole}, Branch: ${staffBranch}. Give this temporary password manually: ${data?.temporaryPassword || "Not returned"}`
            );
        }

        /*
            Automatically search the staff row after resend action too.
        */
        setSearchText(staffUsername || staffEmail || staffName);

        setActionLoadingId(null);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Staff Accounts</h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Manage staff users created for branches and internal operations.
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={loadStaff}
                            className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            <RiRefreshLine size={18} />
                            Refresh
                        </button>

                        <Link
                            to="/staff/staff/create"
                            className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600"
                        >
                            <RiAddLine size={18} />
                            Create Staff
                        </Link>
                    </div>
                </div>

                {/* Search and filter section */}
                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                    <div className="xl:col-span-2">
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                            Search
                        </label>
                        <input
                            type="text"
                            value={searchText}
                            onChange={(event) => setSearchText(event.target.value)}
                            placeholder="Search name, username, email, phone..."
                            className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                            Role
                        </label>
                        <select
                            value={roleFilter}
                            onChange={(event) => setRoleFilter(event.target.value)}
                            className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        >
                            <option value="ALL">All roles</option>
                            {roleOptions.map((roleName) => (
                                <option key={roleName} value={roleName}>
                                    {roleName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                            Branch
                        </label>
                        <select
                            value={branchFilter}
                            onChange={(event) => setBranchFilter(event.target.value)}
                            className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        >
                            <option value="ALL">All branches</option>
                            {branchOptions.map((branchName) => (
                                <option key={branchName} value={branchName}>
                                    {branchName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-gray-500">
                            Status
                        </label>
                        <select
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                            className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                        >
                            <option value="ALL">All statuses</option>
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                        </select>
                    </div>
                </div>

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-gray-500">
                        Showing{" "}
                        <span className="font-semibold text-gray-800">
                            {filteredStaffList.length}
                        </span>{" "}
                        of{" "}
                        <span className="font-semibold text-gray-800">
                            {staffList.length}
                        </span>{" "}
                        staff members
                    </p>

                    {hasActiveFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="w-fit rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Clear filters
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mt-5 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600">
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="mt-5 rounded-2xl bg-green-50 border border-green-100 px-4 py-3 text-sm font-medium text-green-700">
                        {successMessage}
                    </div>
                )}
            </div>

            <div className="bg-white border border-gray-100 rounded-[1.5rem] shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-8 text-sm text-gray-500">Loading staff...</div>
                ) : staffList.length === 0 ? (
                    <div className="p-8 text-sm text-gray-500">No staff members found.</div>
                ) : filteredStaffList.length === 0 ? (
                    <div className="p-8 text-sm text-gray-500">
                        No staff members match the selected search or filters.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Staff
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Contact
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Branch
                                    </th>
                                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Status
                                    </th>
                                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100">
                                {filteredStaffList.map((staff) => {
                                    const staffId = getStaffId(staff);
                                    const isActive = getActiveStatus(staff);
                                    const isActionLoading = actionLoadingId === staffId;

                                    return (
                                        <tr key={staffId || staff.email} className="hover:bg-gray-50/70">
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">
                                                    {staff.fullName || staff.name || "No name"}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    @{staff.username || "no-username"}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-800">
                                                    {staff.email}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {staff.phone || "No phone"}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                                                    {getRoleName(staff)}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {getBranchName(staff)}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                                                        isActive
                                                            ? "bg-green-50 text-green-700"
                                                            : "bg-gray-100 text-gray-500"
                                                    }`}
                                                >
                                                    {isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        to={`/staff/staff/${staffId}`}
                                                        className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                                    >
                                                        View
                                                    </Link>

                                                    <Link
                                                        to={`/staff/staff/${staffId}/edit`}
                                                        className="rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                                                    >
                                                        Edit
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        disabled={isActionLoading}
                                                        onClick={() => handleResendInvite(staff)}
                                                        className="inline-flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                                                    >
                                                        <RiMailSendLine size={15} />
                                                        {isActionLoading ? "Sending..." : "Invite"}
                                                    </button>

                                                    {canManageStaffStatus(staff) ? (
                                                        <button
                                                            type="button"
                                                            disabled={isActionLoading}
                                                            onClick={() => handleToggleStatus(staff)}
                                                            className={`rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-50 ${
                                                                isActive
                                                                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                                                                    : "bg-green-50 text-green-700 hover:bg-green-100"
                                                            }`}
                                                        >
                                                            {isActive ? "Deactivate" : "Activate"}
                                                        </button>
                                                    ) : (
                                                        <span className="rounded-xl bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-400">
                                                            No access
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}