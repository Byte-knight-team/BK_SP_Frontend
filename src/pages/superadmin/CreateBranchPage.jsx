import { useEffect, useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import {
  RiBuilding2Line,
  RiArrowLeftLine,
  RiAddLine,
} from "@remixicon/react";

import { useAuth } from "../../context/AuthContext";
import { createBranchAPI } from "../../apis/staff/branches";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

export default function CreateBranchPage() {
  const navigate = useNavigate();
  const { setHeaderInfo } = useOutletContext();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactNumber: "",
    email: "",
  });

  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  const loggedInRole = user?.roleName || user?.role || "";
  const isSuperAdmin = loggedInRole === "SUPER_ADMIN";

  useEffect(() => {
    setHeaderInfo({
      title: "Create Branch",
      description: "Add a new restaurant branch to the system.",
      Icon: RiBuilding2Line,
    });

    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    const cleanedValue =
      name === "contactNumber" ? value.replace(/[^\d+]/g, "") : value;

    setFormData((previous) => ({
      ...previous,
      [name]: cleanedValue,
    }));
  };

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

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email.trim())) {
      return "Please enter a valid branch email address.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      showErrorToast(validationError);
      return;
    }

    setLoading(true);

    const payload = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      contactNumber: formData.contactNumber.trim(),
      email: formData.email.trim(),
    };

    const { error } = await createBranchAPI(payload);

    setLoading(false);

    if (error) {
      showErrorToast(error);
      return;
    }

    showSuccessToast("Branch created successfully.");
    navigate("/staff/branches");
  };

  if (!isSuperAdmin) {
    return (
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900">No Access</h3>

        <p className="mt-2 text-sm text-gray-500">
          Only SUPER_ADMIN users can create branches.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
        {/* Back link inside the card, same style as Edit Staff */}
        <div className="mb-6">
          <Link
            to="/staff/branches"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-orange-600"
          >
            <RiArrowLeftLine size={18} />
            Back to branches
          </Link>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">Branch Details</h3>

          <p className="mt-1 text-sm text-gray-500">
            Enter the basic details for the new restaurant branch.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
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

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Address
            </label>

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Example: 123 High Level Road, Maharagama"
              rows="3"
              className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-50"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
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

            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700">
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
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
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