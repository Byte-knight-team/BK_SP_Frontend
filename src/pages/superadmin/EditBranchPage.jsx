import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext, useParams } from "react-router-dom";
import {
    RiBuilding2Line,
    RiArrowLeftLine,
    RiSaveLine,
} from "@remixicon/react";

import {
    getBranchByIdAPI,
    updateBranchAPI,
} from "../../apis/staff/branches";

export default function EditBranchPage() {
    /*
        useParams reads the branch ID from the URL.

        Route example:
        /staff/branches/1/edit

        Then id will be:
        "1"
    */
    const { id } = useParams();

    /*
        useNavigate is used to redirect after successful update.
        After editing, we will send user back to branch list page.
    */
    const navigate = useNavigate();

    /*
        useOutletContext comes from MainLayout.
        It lets this page update the shared page header.
    */
    const { setHeaderInfo } = useOutletContext();

    /*
        formData stores the editable branch details.
        These fields match the backend update request body.
    */
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        contactNumber: "",
        email: "",
    });

    /*
        loading is used while loading existing branch details.
        saving is used while submitting the update request.
        error stores validation or backend error messages.
    */
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    /*
        Read logged-in user from localStorage.

        Branch Management is only for SUPER_ADMIN.
        Backend already protects this, but frontend should also show a clean message.
    */
    const authUser = JSON.parse(localStorage.getItem("authUser") || "{}");
    const loggedInRole = authUser.roleName || authUser.role || "";
    const isSuperAdmin = loggedInRole === "SUPER_ADMIN";

    /*
        Set the page header in the shared layout.
    */
    useEffect(() => {
        setHeaderInfo({
            title: "Edit Branch",
            description: "Update restaurant branch information.",
            Icon: RiBuilding2Line,
        });

        return () => setHeaderInfo(null);
    }, [setHeaderInfo]);

    /*
        Load existing branch details before showing the edit form.

        This calls:
        GET /api/admin/branches/{id}

        The returned data is used to pre-fill the form.
    */
    const loadBranch = async () => {
        setLoading(true);
        setError("");

        const { data, error } = await getBranchByIdAPI(id);

        if (error) {
            setError(error);
        } else {
            setFormData({
                name: data?.name || "",
                address: data?.address || "",
                contactNumber: data?.contactNumber || data?.phone || "",
                email: data?.email || "",
            });
        }

        setLoading(false);
    };

    /*
        Load branch details when the page opens.
        Only SUPER_ADMIN should call this API.
    */
    useEffect(() => {
        if (isSuperAdmin) {
            loadBranch();
        } else {
            setLoading(false);
        }
    }, [id, isSuperAdmin]);

    /*
        Update formData when user types in an input.

        Example:
        name="email" updates formData.email.
    */
    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value,
        }));
    };

    /*
        Basic frontend validation.

        Backend should still validate properly,
        but this prevents sending empty required fields.
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
        Submit updated branch details.

        This calls:
        PUT /api/admin/branches/{id}
    */
    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        setSaving(true);

        /*
            Trim values before sending to backend.
            This avoids saving accidental spaces.
        */
        const payload = {
            name: formData.name.trim(),
            address: formData.address.trim(),
            contactNumber: formData.contactNumber.trim(),
            email: formData.email.trim(),
        };

        const { error } = await updateBranchAPI(id, payload);

        setSaving(false);

        if (error) {
            setError(error);
            return;
        }

        /*
            After successful update, go back to the branch list.
            BranchListPage will show this success message.
        */
        navigate("/staff/branches", {
            state: {
                successMessage: "Branch updated successfully.",
            },
        });
    };

    /*
        Frontend access protection.
    */
    if (!isSuperAdmin) {
        return (
            <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900">No Access</h3>
                <p className="text-sm text-gray-500 mt-2">
                    Only SUPER_ADMIN users can edit branches.
                </p>
            </div>
        );
    }

    /*
        Loading state while fetching branch data.
    */
    if (loading) {
        return (
            <div className="bg-white border border-gray-100 rounded-[1.5rem] p-8 shadow-sm">
                <p className="text-sm text-gray-500">Loading branch details...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Back button */}
            <div className="flex items-center justify-between">
                <Link
                    to="/staff/branches"
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                    <RiArrowLeftLine size={18} />
                    Back to Branches
                </Link>
            </div>

            {/* Edit form card */}
            <div className="bg-white border border-gray-100 rounded-[1.5rem] p-6 shadow-sm">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Edit Branch Details</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Update the selected branch information.
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

                    {/* Contact number and email */}
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

                    {/* Form buttons */}
                    <div className="flex items-center justify-end gap-3 pt-3">
                        <Link
                            to="/staff/branches"
                            className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </Link>

                        <button
                            type="submit"
                            disabled={saving}
                            className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600 disabled:opacity-60"
                        >
                            <RiSaveLine size={18} />
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}