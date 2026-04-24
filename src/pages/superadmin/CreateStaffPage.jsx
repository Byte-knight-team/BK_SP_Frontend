import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { RiUserAddLine, RiArrowLeftLine } from "@remixicon/react";


import { createStaffAPI } from "../../apis/staff/staff";
import { getAllBranchesAPI } from "../../apis/staff/branches";

const SUPER_ADMIN_ROLES = [
    "SUPER_ADMIN",
    "ADMIN",
    "MANAGER",
    "CHEF",
    "RECEPTIONIST",
    "DELIVERY",
];

const ADMIN_ROLES = [
    "MANAGER",
    "CHEF",
    "RECEPTIONIST",
    "DELIVERY",
];

export default function CreateStaffPage() {
    const navigate = useNavigate();
    const { setHeaderInfo } = useOutletContext();
    const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
    const loggedInRole = authUser.roleName || authUser.role || "";
    const loggedInBranchId = authUser.branchId || "";
    const loggedInBranchName = authUser.branchName || "Your branch";

    const isSuperAdmin = loggedInRole === "SUPER_ADMIN";
    const isAdmin = loggedInRole === "ADMIN";

    const allowedRoles = isSuperAdmin ? SUPER_ADMIN_ROLES : ADMIN_ROLES;

    const [formData, setFormData] = useState({
        fullName: "",
        username: "",
        email: "",
        phone: "",
        roleName: isSuperAdmin ? "RECEPTIONIST" : "MANAGER",
        branchId: isSuperAdmin ? "" : loggedInBranchId,
    });

    // loading states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [branches, setBranches] = useState([]);
    const [branchLoading, setBranchLoading] = useState(true);

    // load branches which 
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
            }

            setBranchLoading(false);
        };

        loadBranches();
    }, [isSuperAdmin]);

    // header info
    useEffect(() => {
        setHeaderInfo({
            title: "Create Staff",
            description: "Create a new staff account and send an invite email.",
            Icon: RiUserAddLine,
        });

        return () => setHeaderInfo(null);
    }, [setHeaderInfo]);

    // handle form change
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => {
            const updatedData = {
                ...previous,
                [name]: value,
            };

            if (name === "roleName" && value === "SUPER_ADMIN") {
                updatedData.branchId = "";
            }

            return updatedData;
        });
    };

    // handle form submit
    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError("");

        // create payload
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

        // validate payload
        if (!payload.fullName || !payload.username || !payload.email || !payload.phone) {
            setError("Please fill all required fields.");
            setLoading(false);
            return;
        }

        // validate branch id ,this is for super admin
        if (payload.roleName !== "SUPER_ADMIN" && !payload.branchId) {
            setError("Please select a branch.");
            setLoading(false);
            return;
        }

        const { error } = await createStaffAPI(payload);

        if (error) {
            setError(error);
            setLoading(false);
            return;
        }

        // Staff created successfully.
        // Redirect back to staff list and send a success message with navigation state.
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
                <div className="mb-6">
                    <Link
                        to="/staff/staff"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-orange-600"
                    >
                        <RiArrowLeftLine size={18} />
                        Back to staff list
                    </Link>
                </div>

                {error && (
                    <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                {/* mapping the allowed roles */}
                                {allowedRoles.map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                        </div>
                                
                        {/* render branch dropdown based on the role */ }
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
                                            <option key={branch.id} value={branch.id}>
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

                    <div className="rounded-2xl bg-orange-50 border border-orange-100 px-4 py-3 text-sm text-orange-700">
                        After staff creation, the backend will generate a temporary password and send the invite email.
                    </div>

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
};