import { useEffect, useState } from "react";
import { Link, useOutletContext, useParams } from "react-router-dom";
import {
  RiBuilding2Line,
  RiArrowLeftLine,
  RiSaveLine,
} from "@remixicon/react";

import {
  getBranchByIdAPI,
  updateBranchAPI,
} from "../../apis/staff/branches";

import {
  getBranchConfigAPI,
  updateBranchConfigAPI,
} from "../../apis/staff/systemConfig";

import { useAuth } from "../../context/AuthContext";
import { showSuccessToast, showErrorToast } from "../../utils/toast";

export default function EditBranchPage() {
  const { id } = useParams();
  const { setHeaderInfo } = useOutletContext();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    contactNumber: "",
    email: "",
  });

  const [branchConfig, setBranchConfig] = useState({
    deliveryFee: 0,
    deliveryEnabled: false,
    pickupEnabled: false,
    dineInEnabled: false,
    branchActiveForOrders: false,
  });

  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");

  const [saving, setSaving] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);

  const { user } = useAuth();

  const loggedInRole = user?.roleName || user?.role || "";
  const isSuperAdmin = loggedInRole === "SUPER_ADMIN";

  useEffect(() => {
    setHeaderInfo({
      title: "Edit Branch",
      description: "Update branch information and branch order configuration.",
      Icon: RiBuilding2Line,
    });

    return () => setHeaderInfo(null);
  }, [setHeaderInfo]);

  const loadBranch = async () => {
    setLoading(true);
    setPageError("");

    const { data, error } = await getBranchByIdAPI(id);

    if (error) {
      setPageError(error);
      showErrorToast(error);
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

  const loadBranchConfig = async () => {
    try {
      setConfigLoading(true);

      const data = await getBranchConfigAPI(id);

      setBranchConfig({
        deliveryFee: data?.deliveryFee ?? 0,
        deliveryEnabled: Boolean(data?.deliveryEnabled),
        pickupEnabled: Boolean(data?.pickupEnabled),
        dineInEnabled: Boolean(data?.dineInEnabled),
        branchActiveForOrders: Boolean(data?.branchActiveForOrders),
      });
    } catch (error) {
      showErrorToast(
        error.message || "Failed to load branch order configuration."
      );
    } finally {
      setConfigLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin) {
      loadBranch();
      loadBranchConfig();
    } else {
      setLoading(false);
      setConfigLoading(false);
    }
  }, [id, isSuperAdmin]);

  const cleanContactNumber = (value) => {
    const cleaned = value.replace(/[^\d+]/g, "");

    if (!cleaned.includes("+")) {
      return cleaned;
    }

    return `+${cleaned.replace(/\+/g, "")}`;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    const cleanedValue =
      name === "contactNumber" ? cleanContactNumber(value) : value;

    setFormData((previousData) => ({
      ...previousData,
      [name]: cleanedValue,
    }));
  };

  const handleConfigInputChange = (event) => {
    const { name, value } = event.target;

    setBranchConfig((previousConfig) => ({
      ...previousConfig,
      [name]: value,
    }));
  };

  const handleConfigCheckboxChange = (event) => {
    const { name, checked } = event.target;

    setBranchConfig((previousConfig) => ({
      ...previousConfig,
      [name]: checked,
    }));
  };

  const toNumber = (value) => {
    const numberValue = Number(value);
    return Number.isNaN(numberValue) ? 0 : numberValue;
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

    const phoneRegex = /^\+?\d{10,15}$/;

    if (!phoneRegex.test(formData.contactNumber.trim())) {
      return "Contact number is invalid.";
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

    setSaving(true);

    const payload = {
      name: formData.name.trim(),
      address: formData.address.trim(),
      contactNumber: formData.contactNumber.trim(),
      email: formData.email.trim(),
    };

    const { error } = await updateBranchAPI(id, payload);

    setSaving(false);

    if (error) {
      showErrorToast(error);
      return;
    }

    showSuccessToast("Branch details updated successfully.");
  };

  const validateBranchConfig = () => {
    const deliveryFee = toNumber(branchConfig.deliveryFee);

    if (deliveryFee < 0) {
      return "Delivery fee cannot be negative.";
    }

    return "";
  };

  const handleSaveBranchConfig = async (event) => {
    event.preventDefault();

    const validationError = validateBranchConfig();

    if (validationError) {
      showErrorToast(validationError);
      return;
    }

    try {
      setConfigSaving(true);

      const payload = {
        deliveryFee: toNumber(branchConfig.deliveryFee),
        deliveryEnabled: Boolean(branchConfig.deliveryEnabled),
        pickupEnabled: Boolean(branchConfig.pickupEnabled),
        dineInEnabled: Boolean(branchConfig.dineInEnabled),
        branchActiveForOrders: Boolean(branchConfig.branchActiveForOrders),
      };

      await updateBranchConfigAPI(id, payload);

      showSuccessToast("Branch order configuration updated successfully.");
      await loadBranchConfig();
    } catch (error) {
      showErrorToast(
        error.message || "Failed to update branch order configuration."
      );
    } finally {
      setConfigSaving(false);
    }
  };

  if (!isSuperAdmin) {
    return (
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900">No Access</h3>

        <p className="mt-2 text-sm text-gray-500">
          Only SUPER_ADMIN users can edit branches.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-8 shadow-sm">
        <p className="text-sm text-gray-500">Loading branch details...</p>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="rounded-[1.5rem] border border-red-100 bg-red-50 p-8 shadow-sm">
        <h3 className="text-lg font-bold text-red-700">
          Unable to load branch details
        </h3>

        <p className="mt-2 text-sm text-red-600">{pageError}</p>

        <Link
          to="/staff/branches"
          className="mt-5 inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100"
        >
          <RiArrowLeftLine size={18} />
          Back to branches
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <Link
            to={`/staff/branches/${id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition-colors hover:text-orange-600"
          >
            <RiArrowLeftLine size={18} />
            Back to branch details
          </Link>
        </div>

        <div className="mb-5 border-b border-gray-100 pb-5">
          <h3 className="text-xl font-bold text-gray-900">Branch Details</h3>

          <p className="mt-1 text-sm text-gray-500">
            Update branch name, address, contact number, and email.
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
              to={`/staff/branches/${id}`}
              className="rounded-2xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RiSaveLine size={18} />
              {saving ? "Saving..." : "Save Branch Details"}
            </button>
          </div>
        </form>
      </div>

      <form
        onSubmit={handleSaveBranchConfig}
        className="rounded-[1.5rem] border border-gray-100 bg-white p-6 shadow-sm"
      >
        <div className="border-b border-gray-100 pb-5">
          <h3 className="text-xl font-bold text-gray-900">
            Branch Order Configuration
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Configure delivery fee and available order methods for this branch.
          </p>
        </div>

        {configLoading ? (
          <p className="mt-6 text-sm text-gray-500">
            Loading branch order configuration...
          </p>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Delivery Fee
                </label>

                <input
                  type="number"
                  name="deliveryFee"
                  value={branchConfig.deliveryFee}
                  onChange={handleConfigInputChange}
                  min="0"
                  step="0.01"
                  disabled={!branchConfig.deliveryEnabled}
                  className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 disabled:bg-gray-100 disabled:text-gray-400"
                />

                <p className="mt-2 text-xs text-gray-400">
                  Delivery fee is used only when delivery is enabled.
                </p>
              </div>

              <label className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Active For Orders
                  </p>

                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    Allow this branch to receive customer orders.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="branchActiveForOrders"
                  checked={branchConfig.branchActiveForOrders}
                  onChange={handleConfigCheckboxChange}
                  className="h-5 w-5 rounded border-gray-300"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Delivery
                  </p>

                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    Enable delivery orders for this branch.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="deliveryEnabled"
                  checked={branchConfig.deliveryEnabled}
                  onChange={handleConfigCheckboxChange}
                  className="h-5 w-5 rounded border-gray-300"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Pickup
                  </p>

                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    Enable pickup orders for this branch.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="pickupEnabled"
                  checked={branchConfig.pickupEnabled}
                  onChange={handleConfigCheckboxChange}
                  className="h-5 w-5 rounded border-gray-300"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-4 md:col-span-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Dine-In
                  </p>

                  <p className="mt-2 text-sm font-semibold text-gray-900">
                    Enable dine-in orders for this branch.
                  </p>
                </div>

                <input
                  type="checkbox"
                  name="dineInEnabled"
                  checked={branchConfig.dineInEnabled}
                  onChange={handleConfigCheckboxChange}
                  className="h-5 w-5 rounded border-gray-300"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={configSaving}
                className="inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-200 hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RiSaveLine size={18} />
                {configSaving ? "Saving..." : "Save Branch Configuration"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}