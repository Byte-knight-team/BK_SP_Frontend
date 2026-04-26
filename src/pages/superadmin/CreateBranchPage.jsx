import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import {
    RiBuilding2Line,
    RiArrowLeftLine,
    RiAddLine,
} from "@remixicon/react";

import { useAuth } from "../../context/AuthContext";

import { createBranchAPI } from "../../apis/staff/branches";

export default function CreateBranchPage() {
    /*
        useNavigate is used to redirect the user after successful branch creation.
        After creating a branch, we will send the user back to /staff/branches.
    */
    const navigate = useNavigate();

    /*
        useOutletContext comes from MainLayout.
        It lets this page update the shared page header.
    */
    const { setHeaderInfo } = useOutletContext();

    /*
        formData stores the values typed into the form.
        These field names must match the backend request body:
        {
            name,
            address,
            contactNumber,
            email
        }
    */
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        contactNumber: "",
        email: "",
    });

    /*
        loading controls the submit button state.
        error stores backend or validation errors.
    */
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    /*
    Read logged-in user from AuthContext.

    AuthContext now gets user data from the decoded JWT token.
    We no longer read authUser from localStorage.
    */
    const { user } = useAuth();

    const loggedInRole = user?.roleName || user?.role || "";
    const isSuperAdmin = loggedInRole === "SUPER_ADMIN";

    /*
        Set the header details for this page.
        This appears in the shared top header area.
    */
    useEffect(() => {
        setHeaderInfo({
            title: "Create Branch",
            description: "Add a new restaurant branch to the system.",
            Icon: RiBuilding2Line,
        });

        return () => setHeaderInfo(null);
    }, [setHeaderInfo]);

    /*
        This function updates formData when the user types in an input.

        Example:
        If user types inside the name field,
        this updates formData.name.
    */
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    /*
        Basic frontend validation before calling backend.

        Backend should also validate,
        but frontend validation gives faster feedback to the user.
    */
    const validateForm = () => {
        if (!formData.name.trim()) {
            return "Branch name is required.";
        }

        if (!formData.address.trim()) {
            return "Branch address is required.";
        }

        if (!formData.contactNumber.trim()) {
            return "Contact number is required.";
        }

        if (!formData.email.trim()) {
            return "Branch email is required.";
        }

        return "";
    };

    /*
        Submit the create branch form.

        This calls:
        POST /api/admin/branches
    */
    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);

        /*
            Trim text values before sending to backend.
            This avoids accidentally saving spaces.
        */
        const payload = {
            name: formData.name.trim(),
            address: formData.address.trim(),
            contactNumber: formData.contactNumber.trim(),
            email: formData.email.trim(),
        };

        const { error } = await createBranchAPI(payload);

        setLoading(false);

        if (error) {
            setError(error);
            return;
        }

        /*
            After successful creation, go back to the branch list page.
            The success message will be shown in BranchListPage.
        */
        navigate("/staff/branches", {
            state: {
                successMessage: "Branch created successfully.",
            },
        });
    };

    /*
        Frontend protection.
        Backend also protects this endpoint,
        but this gives a cleaner no-access message.
    */
    if (!isSuperAdmin) {
        return (
            <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">No Access</h3>
                <p className="text-sm text-gray-500 mt-2">
                    Only SUPER_ADMIN users can create branches.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Top action row */}
            <div className="flex items-center justify-between">
                <Link
                    to="/staff/branches"
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                    <RiArrowLeftLine size={18} />
                    Back to Branches
                </Link>
            </div>

            {/* Create branch form card */}
            <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Branch Details</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Enter the basic details for the new restaurant branch.
                    </p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-5 rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-sm font-medium text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Branch name */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Branch Name
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Example: Maharagama Branch"
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                        />
                    </div>

                    {/* Branch address */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Address
                        </label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            placeholder="Example: 123 High Level Road, Maharagama"
                            rows="3"
                            className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none resize-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                        />
                    </div>

                    {/* Contact number and email in one row on larger screens */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Contact number */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Contact Number
                            </label>
                            <input
                                type="text"
                                name="contactNumber"
                                value={formData.contactNumber}
                                onChange={handleChange}
                                placeholder="Example: +94771234567"
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                            />
                        </div>

                        {/* Branch email */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Example: maharagama@cravehouse.com"
                                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
                            />
                        </div>
                    </div>

                    {/* Submit buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3">
                        <Link
                            to="/staff/branches"
                            className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600 disabled:opacity-60"
                        >
                            <RiAddLine size={18} />
                            {loading ? "Creating..." : "Create Branch"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}