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

    // Used to read success messages sent from CreateStaffPage after redirect.
    const location = useLocation();


    const { setHeaderInfo } = useOutletContext();

    const [staffList, setStaffList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
    const loggedInRole = authUser.roleName || authUser.role || "";

    //check if the role is lower than ADMIN or not

    const isSuperAdmin = loggedInRole === "SUPER_ADMIN";
    const isAdmin = loggedInRole === "ADMIN";

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




    // Show success message if another page redirected here with a message.
    // CreateStaffPage redirects here after staff creation.
    useEffect(() => {
        if (location.state?.successMessage) {
            setSuccessMessage(location.state.successMessage);
        }
    }, [location.state]);

    useEffect(() => {
        setHeaderInfo({
            title: "Staff Management",
            description: "View, activate, deactivate, and manage internal staff accounts.",
            Icon: RiTeamLine,
        });

        return () => setHeaderInfo(null);
    }, [setHeaderInfo]);

    const loadStaff = async () => {
        setLoading(true);
        setError("");

        // Do not clear successMessage here.
        // Otherwise, success messages from create/activate/deactivate can disappear too quickly.

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

    const getStaffId = (staff) => {
        return staff.id || staff.userId || staff.staffId;
    };

    const getActiveStatus = (staff) => {
        if (typeof staff.active === "boolean") return staff.active;
        if (typeof staff.isActive === "boolean") return staff.isActive;
        return false;
    };

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

    const handleResendInvite = async (staff) => {
        const staffId = getStaffId(staff);

        if (!staffId) {
            setError("Staff ID not found in response.");
            return;
        }

        setActionLoadingId(staffId);
        setError("");
        setSuccessMessage("");

        const { error } = await resendStaffInviteAPI(staffId);

        if (error) {
            setError(error);
        } else {
            setSuccessMessage("Invite email resent successfully.");
        }

        setActionLoadingId(null);
    };

    return (
        <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm">
                <div className="flex items-center justify-between gap-4">
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
                                {staffList.map((staff) => {
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
                                                <div className="text-sm text-gray-800">{staff.email}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {staff.phone || "No phone"}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className="inline-flex rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                                                    {staff.roleName || staff.role || "N/A"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-700">
                                                {staff.branchName || staff.branch?.name || "Global"}
                                            </td>

                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${isActive
                                                        ? "bg-green-50 text-green-700"
                                                        : "bg-gray-100 text-gray-500"
                                                        }`}
                                                >
                                                    {isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    {/* Open staff details page */}
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
                                                        Invite
                                                    </button>

                                                    {canManageStaffStatus(staff) ? (
                                                        <button
                                                            type="button"
                                                            disabled={isActionLoading}
                                                            onClick={() => handleToggleStatus(staff)}
                                                            className={`rounded-xl px-3 py-2 text-xs font-semibold disabled:opacity-50 ${isActive
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